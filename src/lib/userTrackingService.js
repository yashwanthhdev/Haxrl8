import { supabase } from './supabaseClient';
import { resolveDomain } from './domainUtils';

const REGISTRY_STORAGE_KEY = 'haxlr8_registered_accounts_registry';
const REGISTRY_TAG = 'ACCOUNTS_REGISTRY';
const REGISTRY_TITLE = 'HAXLR8 Registered Accounts Registry';

/**
 * Get locally cached registry
 */
export function getLocalAccountsRegistry() {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return { accounts: {}, lastUpdated: null };
    }
    const raw = localStorage.getItem(REGISTRY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.accounts) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading local accounts registry:', e);
  }
  return { accounts: {}, lastUpdated: null };
}

/**
 * Save registry to localStorage and dispatch event
 */
export function setLocalAccountsRegistry(registryData) {
  try {
    const safeData = {
      accounts: registryData?.accounts || {},
      lastUpdated: new Date().toISOString(),
    };
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(safeData));
      window.dispatchEvent(new CustomEvent('haxlr8_accounts_registry_updated', { detail: safeData }));
    }
    return safeData;
  } catch (e) {
    console.warn('Error saving local accounts registry:', e);
    return registryData;
  }
}

/**
 * Record a user login, registration, or session activity.
 * Safe, idempotent, and debounces rapid refreshes.
 */
export async function recordUserActivity(user, provider = 'email') {
  if (!user || !user.email) return null;

  const cleanEmail = String(user.email).trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) return null;

  // Session debounce: Don't artificially bump loginCount on fast page reloads within 5 minutes
  const sessionDebounceKey = `haxlr8_session_recorded_${cleanEmail}`;
  let isNewSession = true;
  try {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      const lastSessionTime = sessionStorage.getItem(sessionDebounceKey);
      if (lastSessionTime) {
        const diffMs = Date.now() - Number(lastSessionTime);
        if (diffMs < 5 * 60 * 1000) {
          isNewSession = false;
        }
      }
      sessionStorage.setItem(sessionDebounceKey, String(Date.now()));
    }
  } catch (e) {
    // Ignore sessionStorage errors
  }

  const currentRegistry = getLocalAccountsRegistry();
  const accounts = { ...currentRegistry.accounts };
  const existing = accounts[cleanEmail];

  const now = new Date().toISOString();
  const resolvedName = (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.fullName ||
    existing?.fullName ||
    cleanEmail.split('@')[0]
  ).trim();

  const resolvedProvider = (
    provider ||
    user.app_metadata?.provider ||
    user.identities?.[0]?.provider ||
    existing?.provider ||
    'email'
  );

  const newLoginCount = isNewSession
    ? (Number(existing?.loginCount) || 0) + 1
    : (Number(existing?.loginCount) || 1);

  accounts[cleanEmail] = {
    id: user.id || existing?.id || null,
    email: cleanEmail,
    fullName: resolvedName,
    provider: resolvedProvider,
    registeredAt: existing?.registeredAt || user.created_at || now,
    lastLoginAt: now,
    loginCount: Math.max(1, newLoginCount),
  };

  const updatedRegistry = {
    accounts,
    lastUpdated: now,
  };

  // 1. Update local cache immediately
  setLocalAccountsRegistry(updatedRegistry);

  // 2. Persist asynchronously to Supabase cloud announcements store
  try {
    await persistRegistryToCloud(updatedRegistry);
  } catch (err) {
    console.warn('Async cloud accounts registry sync notice:', err);
  }

  return accounts[cleanEmail];
}

/**
 * Persist the registry JSON into Supabase cloud table (announcements)
 */
async function persistRegistryToCloud(registryData) {
  try {
    const { data: existingRows } = await supabase
      .from('announcements')
      .select('id')
      .eq('tag', REGISTRY_TAG)
      .limit(1);

    const payload = JSON.stringify(registryData);

    if (existingRows && existingRows.length > 0) {
      await supabase
        .from('announcements')
        .update({
          title: REGISTRY_TITLE,
          message: 'Registry of all registered user accounts and login activity',
          content: payload,
        })
        .eq('id', existingRows[0].id);
    } else {
      await supabase
        .from('announcements')
        .insert([{
          title: REGISTRY_TITLE,
          tag: REGISTRY_TAG,
          message: 'Registry of all registered user accounts and login activity',
          content: payload,
        }]);
    }
  } catch (err) {
    console.warn('Supabase persistRegistryToCloud error:', err);
  }
}

/**
 * Fetch registered users, merge with live database teams & team_members,
 * accurately tagging users who have added team details vs those who haven't.
 */
export async function fetchRegisteredAccountsData() {
  let cloudAccounts = {};
  let cloudRegistryRowId = null;

  // 1. Fetch Cloud Registry row
  try {
    const { data: rows, error: cloudErr } = await supabase
      .from('announcements')
      .select('id, content')
      .eq('tag', REGISTRY_TAG)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!cloudErr && rows && rows[0]?.content) {
      cloudRegistryRowId = rows[0].id;
      try {
        const parsed = JSON.parse(rows[0].content);
        if (parsed?.accounts && typeof parsed.accounts === 'object') {
          cloudAccounts = parsed.accounts;
        }
      } catch (parseErr) {
        console.warn('Error parsing cloud accounts registry payload:', parseErr);
      }
    }
  } catch (e) {
    console.warn('Supabase fetch cloud registry error:', e);
  }

  // Fallback to local cache if cloud registry was empty
  if (Object.keys(cloudAccounts).length === 0) {
    const local = getLocalAccountsRegistry();
    if (local?.accounts) {
      cloudAccounts = { ...local.accounts };
    }
  }

  // 2. Fetch live teams, team_members, and submissions from Supabase
  let teams = [];
  let teamMembers = [];
  let submissions = [];
  try {
    const [teamsRes, membersRes, subsRes] = await Promise.all([
      supabase.from('teams').select('id, leader_id, team_name, created_at'),
      supabase.from('team_members').select('*'),
      supabase.from('submissions').select('id, team_id, category, sdg_goal, project_title'),
    ]);
    teams = teamsRes.data || [];
    teamMembers = membersRes.data || [];
    submissions = subsRes.data || [];
  } catch (dbErr) {
    console.warn('Supabase database roster fetch notice:', dbErr);
  }

  const mergedAccounts = { ...cloudAccounts };
  let hasNewBackfill = false;

  // 3. Backfill team leaders who logged in to register squads from the start
  teamMembers.filter(m => m.is_leader === true).forEach(m => {
    if (!m.email) return;
    const cleanEmail = m.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) return;

    if (!mergedAccounts[cleanEmail]) {
      hasNewBackfill = true;
      mergedAccounts[cleanEmail] = {
        id: m.id || null,
        email: cleanEmail,
        fullName: m.full_name || cleanEmail.split('@')[0],
        provider: 'email',
        registeredAt: m.created_at || new Date().toISOString(),
        lastLoginAt: m.created_at || new Date().toISOString(),
        loginCount: 1,
      };
    } else {
      // Preserve ID and clean name if not present
      if (!mergedAccounts[cleanEmail].id && m.id) {
        mergedAccounts[cleanEmail].id = m.id;
      }
      if (!mergedAccounts[cleanEmail].fullName && m.full_name) {
        mergedAccounts[cleanEmail].fullName = m.full_name;
      }
    }
  });

  // 4. Transform accounts dictionary into an enriched list with team status
  const accountsList = Object.values(mergedAccounts).map(account => {
    const cleanEmail = account.email.trim().toLowerCase();

    // Check if account matches a team member record
    const memberRecord = teamMembers.find(tm => tm.email && tm.email.trim().toLowerCase() === cleanEmail);

    // Check if account matches a team leader in teams table
    const leaderTeam = teams.find(t => (
      t.leader_id === account.id ||
      (memberRecord && memberRecord.is_leader && memberRecord.team_id === t.id)
    ));

    const matchedTeam = leaderTeam || (memberRecord ? teams.find(t => t.id === memberRecord.team_id) : null);

    const hasTeam = Boolean(matchedTeam || memberRecord);
    const isLeader = Boolean(leaderTeam || memberRecord?.is_leader);

    const subRecord = matchedTeam ? submissions.find(s => s.team_id === matchedTeam.id) : null;
    const domain = matchedTeam ? resolveDomain(matchedTeam, subRecord, null, 'General Innovation') : '—';

    return {
      ...account,
      email: cleanEmail,
      hasTeam,
      teamId: matchedTeam?.id || memberRecord?.team_id || null,
      teamName: matchedTeam?.team_name || (hasTeam ? 'Squad Member' : null),
      domain,
      isLeader,
      teamRole: !hasTeam
        ? 'No Team Details Yet'
        : (isLeader ? 'Team Leader' : 'Team Member'),
      status: hasTeam ? 'Active Squad' : 'Pending Team Setup',
      collegeName: memberRecord?.college_name || '-',
      phone: memberRecord?.phone_number || '-',
      year: memberRecord?.year || '-',
      idCardVerified: Boolean(memberRecord?.id_card_verified),
      idCardVerifiedBy: memberRecord?.id_card_verified_by || null,
      idCardFrontUrl: memberRecord?.id_card_front_url || null,
      idCardBackUrl: memberRecord?.id_card_back_url || null,
    };
  });

  // Sort: most recent registration first
  accountsList.sort((a, b) => {
    const dateA = new Date(a.registeredAt || 0).getTime();
    const dateB = new Date(b.registeredAt || 0).getTime();
    return dateB - dateA;
  });

  // 5. Compute summary statistics
  const totalRegistered = accountsList.length;
  const withTeamCount = accountsList.filter(u => u.hasTeam).length;
  const withoutTeamCount = accountsList.filter(u => !u.hasTeam).length;
  const totalLogins = accountsList.reduce((sum, u) => sum + (Number(u.loginCount) || 1), 0);

  const result = {
    accountsList,
    stats: {
      totalRegistered,
      withTeamCount,
      withoutTeamCount,
      totalLogins,
      squadsCount: teams.length,
    },
    rawAccounts: mergedAccounts,
  };

  // Cache locally
  setLocalAccountsRegistry({ accounts: mergedAccounts });

  // If new participants were backfilled, persist to Supabase in the background
  if (hasNewBackfill) {
    persistRegistryToCloud({ accounts: mergedAccounts }).catch(() => {});
  }

  return result;
}

/**
 * Export registered users report to CSV
 */
export function exportRegisteredUsersCSV(users) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!Array.isArray(users) || users.length === 0) return;

  let csv = 'data:text/csv;charset=utf-8,S.No,Full Name,Email,Auth Provider,Team Status,Squad Name,Role,Login Count,Last Login,Registered On,College,Phone\n';

  users.forEach((u, i) => {
    const sNo = i + 1;
    const name = (u.fullName || '').replace(/"/g, '""');
    const email = (u.email || '').replace(/"/g, '""');
    const provider = (u.provider || 'email').toUpperCase();
    const teamStatus = u.hasTeam ? 'Team Formed' : 'No Team Details Yet';
    const teamName = (u.teamName || '—').replace(/"/g, '""');
    const role = u.teamRole || '—';
    const loginCount = u.loginCount || 1;
    const lastLogin = u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-US') : '—';
    const regDate = u.registeredAt ? new Date(u.registeredAt).toLocaleString('en-US') : '—';
    const college = (u.collegeName || '—').replace(/"/g, '""');
    const phone = (u.phone || '—').replace(/"/g, '""');

    csv += `"${sNo}","${name}","${email}","${provider}","${teamStatus}","${teamName}","${role}","${loginCount}","${lastLogin}","${regDate}","${college}","${phone}"\n`;
  });

  const encodedUri = encodeURI(csv);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `haxlr8_registered_emails_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
