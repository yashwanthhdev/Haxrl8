import { supabase } from './supabaseClient';
import { PROBLEM_STATEMENTS, DOMAIN_METADATA, MAX_TEAMS_PER_PROBLEM, getProblemById } from '../data/problemStatementsCatalog';
import { resolveDomain } from './domainUtils';

// Storage keys
const STORAGE_SELECTIONS_KEY = 'haxlr8_ps_selections';
const STORAGE_PDFS_KEY = 'haxlr8_ps_custom_pdfs';

// ─── 3 DEMO ACCOUNTS ──────────────────────────────────────────────────────────
export const DEMO_ACCOUNTS = {
  'demo.smartcity@haxlr8.mit.ac.in': {
    id: 'd0000001-0000-4000-8000-000000000001',
    email: 'demo.smartcity@haxlr8.mit.ac.in',
    password: 'demo123',
    name: 'Captain Aaditya Rao',
    domain: 'Smart City',
    teamId: 'd0000001-0000-4000-8000-000000000002',
    teamName: 'UrbanMatrix',
    leaderName: 'Aaditya Rao',
    leaderPhone: '+91 98765 43210',
    college: 'MIT Mysore',
    members: [
      { id: 'd0000001-0000-4000-8000-000000000003', full_name: 'Aaditya Rao', email: 'demo.smartcity@haxlr8.mit.ac.in', role: 'Flight Captain', is_leader: true, phone_number: '+91 98765 43210', dept: 'ECE', year: '3rd Year', college_name: 'MIT Mysore' },
      { id: 'd0000001-0000-4000-8000-000000000004', full_name: 'Bhavya Sharma', email: 'bhavya.sc@gmail.com', role: 'IoT & Telemetry Engineer', is_leader: false, phone_number: '+91 98765 43211', dept: 'ECE', year: '3rd Year', college_name: 'MIT Mysore' },
      { id: 'd0000001-0000-4000-8000-000000000005', full_name: 'Chirag Patel', email: 'chirag.sc@gmail.com', role: 'Fullstack Urban Systems', is_leader: false, phone_number: '+91 98765 43212', dept: 'CSE', year: '3rd Year', college_name: 'MIT Mysore' }
    ]
  },
  'demo.agritech@haxlr8.mit.ac.in': {
    id: 'd0000002-0000-4000-8000-000000000001',
    email: 'demo.agritech@haxlr8.mit.ac.in',
    password: 'demo123',
    name: 'Captain Sneha Kulkarni',
    domain: 'Agriculture',
    teamId: 'd0000002-0000-4000-8000-000000000002',
    teamName: 'AgroVision',
    leaderName: 'Sneha Kulkarni',
    leaderPhone: '+91 98450 12345',
    college: 'MIT Mysore',
    members: [
      { id: 'd0000002-0000-4000-8000-000000000003', full_name: 'Sneha Kulkarni', email: 'demo.agritech@haxlr8.mit.ac.in', role: 'Flight Captain', is_leader: true, phone_number: '+91 98450 12345', dept: 'AI & DS', year: '3rd Year', college_name: 'MIT Mysore' },
      { id: 'd0000002-0000-4000-8000-000000000004', full_name: 'Darshan Gowda', email: 'darshan.ag@gmail.com', role: 'Edge AI & Drone Vision', is_leader: false, phone_number: '+91 98450 12346', dept: 'AI & DS', year: '3rd Year', college_name: 'MIT Mysore' },
      { id: 'd0000002-0000-4000-8000-000000000005', full_name: 'Esha Reddy', email: 'esha.ag@gmail.com', role: 'Embedded Systems & Robotics', is_leader: false, phone_number: '+91 98450 12347', dept: 'ECE', year: '3rd Year', college_name: 'MIT Mysore' }
    ]
  },
  'demo.healthtech@haxlr8.mit.ac.in': {
    id: 'd0000003-0000-4000-8000-000000000001',
    email: 'demo.healthtech@haxlr8.mit.ac.in',
    password: 'demo123',
    name: 'Captain Rohan Deshmukh',
    domain: 'Healthcare',
    teamId: 'd0000003-0000-4000-8000-000000000002',
    teamName: 'MedPulse',
    leaderName: 'Rohan Deshmukh',
    leaderPhone: '+91 97412 67890',
    college: 'MIT Mysore',
    members: [
      { id: 'd0000003-0000-4000-8000-000000000003', full_name: 'Rohan Deshmukh', email: 'demo.healthtech@haxlr8.mit.ac.in', role: 'Flight Captain', is_leader: true, phone_number: '+91 97412 67890', dept: 'Biomedical / CSE', year: '4th Year', college_name: 'MIT Mysore' },
      { id: 'd0000003-0000-4000-8000-000000000004', full_name: 'Farhan Ali', email: 'farhan.hc@gmail.com', role: 'Biosignal DSP & Firmware', is_leader: false, phone_number: '+91 97412 67891', dept: 'ECE', year: '4th Year', college_name: 'MIT Mysore' },
      { id: 'd0000003-0000-4000-8000-000000000005', full_name: 'Geetha N', email: 'geetha.hc@gmail.com', role: 'Clinical Data & Backend Lead', is_leader: false, phone_number: '+91 97412 67892', dept: 'CSE', year: '4th Year', college_name: 'MIT Mysore' }
    ]
  }
};

export const isDemoEmail = (email) => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return Boolean(DEMO_ACCOUNTS[clean]) || clean.startsWith('demo.');
};

export const isDemoId = (id) => {
  if (!id) return false;
  return typeof id === 'string' && (id.startsWith('d000000') || id.startsWith('demo-'));
};

export const getDemoAccount = (email) => {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  return DEMO_ACCOUNTS[clean] || null;
};

// ─── DOMAIN PDF URLs ──────────────────────────────────────────────────────────
const PS_PDF_TAG = 'PS_PDF_REGISTRY';

export const getAllDomainPdfUrls = () => {
  const defaults = {
    'Smart City': DOMAIN_METADATA['Smart City']?.defaultPdfUrl || 'https://wpsdmprnwzyfqogpsfui.supabase.co/storage/v1/object/public/id-cards/documents/1793537487385_haxlr8_3.0_smart_city_problem_statements.pdf',
    'Agriculture': DOMAIN_METADATA['Agriculture']?.defaultPdfUrl || '/assets/documents/HAXLR8_3.0_Agriculture_Problem_Statements.pdf',
    'Healthcare': DOMAIN_METADATA['Healthcare']?.defaultPdfUrl || '/assets/documents/HAXLR8_3.0_Healthcare_Problem_Statements.pdf',
  };

  try {
    const raw = localStorage.getItem(STORAGE_PDFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...defaults, ...parsed };
      }
    }
  } catch (e) {}

  return defaults;
};

export const getDomainPdfUrl = (domain) => {
  const urls = getAllDomainPdfUrls();
  return (domain && urls[domain]) || urls['Smart City'];
};

export const fetchDomainPdfUrls = async () => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('id, content, created_at')
      .eq('tag', PS_PDF_TAG)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!error && data && data[0]?.content) {
      try {
        const parsed = JSON.parse(data[0].content);
        if (parsed && typeof parsed === 'object') {
          const currentLocal = getAllDomainPdfUrls();
          const merged = { ...currentLocal, ...parsed };
          localStorage.setItem(STORAGE_PDFS_KEY, JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent('haxlr8_ps_pdfs_updated', { detail: merged }));
          return merged;
        }
      } catch (parseErr) {
        console.warn('Error parsing cloud PS PDF registry:', parseErr);
      }
    }
  } catch (err) {
    console.warn('Supabase fetchDomainPdfUrls notice:', err);
  }

  return getAllDomainPdfUrls();
};

export const saveDomainPdfUrl = async (domain, url) => {
  if (!domain || !url) return;
  const current = getAllDomainPdfUrls();
  current[domain] = url.trim();

  // 1. Save locally for instant UI update
  try {
    localStorage.setItem(STORAGE_PDFS_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('haxlr8_ps_pdfs_updated', { detail: current }));
  } catch (e) {}

  // 2. Persist to Supabase cloud announcements
  try {
    const { data: existing } = await supabase
      .from('announcements')
      .select('id')
      .eq('tag', PS_PDF_TAG)
      .limit(1);

    const payloadStr = JSON.stringify(current);

    if (existing && existing.length > 0) {
      await supabase
        .from('announcements')
        .update({
          title: 'HAXLR8 Problem Statements Dossier PDFs',
          message: 'Official domain problem statement PDF links',
          content: payloadStr,
        })
        .eq('id', existing[0].id);
    } else {
      await supabase
        .from('announcements')
        .insert([{
          title: 'HAXLR8 Problem Statements Dossier PDFs',
          tag: PS_PDF_TAG,
          message: 'Official domain problem statement PDF links',
          content: payloadStr,
        }]);
    }
  } catch (cloudErr) {
    console.warn('Cloud saveDomainPdfUrl notice:', cloudErr);
  }

  return current;
};

export const subscribeToDomainPdfs = (onUpdate) => {
  try {
    const channel = supabase
      .channel('public:ps_pdfs_sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements',
          filter: `tag=eq.${PS_PDF_TAG}`
        },
        (payload) => {
          if (payload.new && payload.new.content) {
            try {
              const parsed = JSON.parse(payload.new.content);
              if (parsed && typeof parsed === 'object') {
                const currentLocal = getAllDomainPdfUrls();
                const merged = { ...currentLocal, ...parsed };
                localStorage.setItem(STORAGE_PDFS_KEY, JSON.stringify(merged));
                window.dispatchEvent(new CustomEvent('haxlr8_ps_pdfs_updated', { detail: merged }));
                if (typeof onUpdate === 'function') onUpdate(merged);
              }
            } catch (err) {
              console.warn('Error parsing realtime domain PDF payload:', err);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Failed to subscribe to domain PDFs realtime:', err);
    return () => {};
  }
};

// ─── SELECTIONS AND REGISTRY ──────────────────────────────────────────────────
export const getLocalSelections = () => {
  try {
    const raw = localStorage.getItem(STORAGE_SELECTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveLocalSelections = (selections) => {
  try {
    localStorage.setItem(STORAGE_SELECTIONS_KEY, JSON.stringify(selections));
  } catch (e) {}
};

/**
 * Fetch all locked problem statement selections across all teams
 * Merges Supabase submissions data with local persistence
 */
export const fetchAllProblemSelections = async () => {
  const localList = getLocalSelections();
  const selectionMap = new Map();

  // Seed with local items first
  localList.forEach(item => {
    if (item.team_id || item.team_name) {
      selectionMap.set(item.team_id || item.team_name, item);
    }
  });

  try {
    // Fetch submissions with evaluation_notes where problem statements are stored
    const { data: subs, error: subErr } = await supabase
      .from('submissions')
      .select('id, team_id, project_title, category, sdg_goal, evaluation_notes, evaluation_scores, created_at, updated_at');

    if (!subErr && Array.isArray(subs) && subs.length > 0) {
      // Fetch teams and leaders for rich context
      const teamIds = subs.map(s => s.team_id).filter(Boolean);
      let teamsMap = new Map();
      let leadersMap = new Map();

      if (teamIds.length > 0) {
        try {
          const { data: tms } = await supabase
            .from('teams')
            .select('id, team_name, created_at')
            .in('id', teamIds);
          if (tms) tms.forEach(t => teamsMap.set(t.id, t));

          const { data: mems } = await supabase
            .from('team_members')
            .select('team_id, full_name, email, phone_number, college_name, is_leader')
            .in('team_id', teamIds);
          if (mems) {
            // Priority: is_leader === true, then first member as fallback
            mems.forEach(m => {
              const isTrueLeader = m.is_leader === true || m.is_leader === 'true' || m.is_leader === 1;
              if (isTrueLeader || !leadersMap.has(m.team_id)) {
                leadersMap.set(m.team_id, m);
              }
            });
          }
        } catch (ctxErr) {}
      }

      subs.forEach(sub => {
        let psData = null;

        // 1. Try parsing evaluation_notes
        if (sub.evaluation_notes) {
          try {
            const parsed = typeof sub.evaluation_notes === 'string'
              ? JSON.parse(sub.evaluation_notes)
              : sub.evaluation_notes;
            if (parsed?.problem_statement) {
              psData = parsed.problem_statement;
            } else if (parsed?.problem_statement_id) {
              psData = parsed;
            }
          } catch (e) {}
        }

        // 2. Try evaluation_scores.problem_statement
        if (!psData && sub.evaluation_scores && sub.evaluation_scores.problem_statement) {
          psData = sub.evaluation_scores.problem_statement;
        }

        if (psData && (psData.id || psData.problem_statement_id)) {
          const problemId = psData.id || psData.problem_statement_id;
          const fullProblem = getProblemById(problemId);
          const teamInfo = teamsMap.get(sub.team_id);
          const leaderInfo = leadersMap.get(sub.team_id);

          const item = {
            team_id: sub.team_id,
            team_name: psData.team_name || teamInfo?.team_name || 'Squad',
            domain: resolveDomain(teamInfo, sub, null, psData.domain || fullProblem?.domain || sub.category || sub.sdg_goal || 'Smart City'),
            problem_statement_id: problemId,
            problem_statement_num: psData.num || psData.problem_statement_num || fullProblem?.num || 1,
            problem_statement_title: psData.title || psData.problem_statement_title || fullProblem?.title || '',
            locked_at: psData.locked_at || sub.updated_at || sub.created_at,
            locked_by: psData.locked_by || leaderInfo?.full_name || 'Flight Captain',
            leader_name: leaderInfo?.full_name || psData.leader_name || 'Flight Captain',
            leader_email: leaderInfo?.email || psData.leader_email || '',
            leader_phone: leaderInfo?.phone_number || psData.leader_phone || '',
            college: leaderInfo?.college_name || psData.college || 'MIT Mysore'
          };

          selectionMap.set(sub.team_id, item);
        }
      });
    }
  } catch (err) {
    console.warn('fetchAllProblemSelections supabase error, using cached selections:', err);
  }

  const allSelections = Array.from(selectionMap.values());
  saveLocalSelections(allSelections);
  return allSelections;
};

/**
 * Get map of { [problemId]: count } and { [problemId]: [squads...] }
 */
export const getSelectionCounts = (selections = []) => {
  const counts = {};
  const teamsByProblem = {};

  // Initialize all 45 problem statements with 0
  PROBLEM_STATEMENTS.forEach(p => {
    counts[p.id] = 0;
    teamsByProblem[p.id] = [];
  });

  selections.forEach(sel => {
    const pid = sel.problem_statement_id;
    if (pid && counts[pid] !== undefined) {
      counts[pid] += 1;
      teamsByProblem[pid].push(sel);
    }
  });

  return { counts, teamsByProblem };
};

/**
 * Check if a specific team has already locked a statement
 */
export const getTeamSelection = (teamId, userEmail = '') => {
  if (!teamId && !userEmail) return null;

  // 1. Check scoped local storage
  if (teamId) {
    try {
      const raw = localStorage.getItem(`haxlr8_ps_team_${teamId}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
  }

  if (userEmail) {
    try {
      const raw = localStorage.getItem(`haxlr8_ps_team_${userEmail.trim().toLowerCase()}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
  }

  // 2. Check general registry
  const all = getLocalSelections();
  const match = all.find(s => 
    (teamId && s.team_id === teamId) || 
    (userEmail && s.leader_email?.toLowerCase() === userEmail.toLowerCase())
  );

  return match || null;
};

/**
 * Lock in a Problem Statement for a team.
 * STRICT ENFORCEMENTS:
 * 1. Only Flight Captain can lock.
 * 2. Problem Statement must not have reached MAX_TEAMS_PER_PROBLEM (3 teams).
 * 3. Cannot be modified or changed once locked.
 */
export const lockProblemStatement = async ({
  teamId,
  teamName,
  domain,
  problemId,
  leaderName,
  leaderEmail,
  leaderPhone,
  college = 'MIT Mysore',
  isLeader = true
}) => {
  if (!isLeader) {
    throw new Error('Clearance Denied: Only your squad Flight Captain can officially lock in the problem statement.');
  }

  if (!problemId) {
    throw new Error('Please select a valid problem statement challenge.');
  }

  const problem = getProblemById(problemId);
  if (!problem) {
    throw new Error('Problem statement challenge not found in the catalog.');
  }

  // Check if team already locked
  const existing = getTeamSelection(teamId, leaderEmail);
  if (existing && existing.problem_statement_id) {
    throw new Error(`Squad Selection Locked: Your squad has already locked in challenge [${existing.problem_statement_id}]. Changes are not permitted.`);
  }

  // Fetch current selections to enforce MAX_TEAMS_PER_PROBLEM = 3 quota
  const currentSelections = await fetchAllProblemSelections();
  const existingClaimsForProblem = currentSelections.filter(s => s.problem_statement_id === problemId);

  if (existingClaimsForProblem.length >= MAX_TEAMS_PER_PROBLEM) {
    throw new Error(`Quota Reached (3/3): Challenge [${problemId}] has already been locked by 3 squads. Please select another problem statement.`);
  }

  const lockedRecord = {
    team_id: teamId || ('team-' + Date.now()),
    team_name: teamName || 'Squad',
    domain: domain || problem.domain,
    problem_statement_id: problem.id,
    problem_statement_num: problem.num,
    problem_statement_title: problem.title,
    locked_at: new Date().toISOString(),
    locked_by: leaderName || 'Flight Captain',
    leader_name: leaderName || 'Flight Captain',
    leader_email: leaderEmail || '',
    leader_phone: leaderPhone || '',
    college: college || 'MIT Mysore'
  };

  // 1. Save in local registries
  try {
    const updated = currentSelections.filter(s => s.team_id !== lockedRecord.team_id);
    updated.push(lockedRecord);
    saveLocalSelections(updated);

    if (teamId) {
      localStorage.setItem(`haxlr8_ps_team_${teamId}`, JSON.stringify(lockedRecord));
    }
    if (leaderEmail) {
      localStorage.setItem(`haxlr8_ps_team_${leaderEmail.trim().toLowerCase()}`, JSON.stringify(lockedRecord));
    }
  } catch (e) {
    console.warn('Local storage error in lockProblemStatement:', e);
  }

  // 2. Cloud Persistence in Supabase `submissions`
  if (teamId && !isDemoId(teamId) && !isDemoEmail(leaderEmail)) {
    try {
      // Find existing submission or insert
      const { data: existingSubs } = await supabase
        .from('submissions')
        .select('*')
        .eq('team_id', teamId)
        .limit(1);

      const notesPayload = JSON.stringify({
        problem_statement: lockedRecord,
        locked_at: lockedRecord.locked_at
      });

      if (existingSubs && existingSubs.length > 0) {
        const sub = existingSubs[0];
        const scoresObj = sub.evaluation_scores || {};
        scoresObj.problem_statement = lockedRecord;

        await supabase
          .from('submissions')
          .update({
            evaluation_notes: notesPayload,
            evaluation_scores: scoresObj,
            updated_at: new Date().toISOString()
          })
          .eq('id', sub.id);
      } else {
        // Create new submission record
        await supabase
          .from('submissions')
          .insert({
            team_id: teamId,
            project_title: `[${problem.id}] ${problem.title.substring(0, 80)}`,
            category: domain || problem.domain,
            sdg_goal: domain || problem.domain,
            evaluation_notes: notesPayload,
            evaluation_scores: { problem_statement: lockedRecord },
            status: 'Submitted'
          });
      }
    } catch (cloudErr) {
      console.warn('Cloud submission persistence notice:', cloudErr);
    }
  }

  // 3. Dispatch global event so UI components immediately re-render
  window.dispatchEvent(new CustomEvent('haxlr8_ps_locked', { detail: lockedRecord }));

  return lockedRecord;
};

/**
 * Delete / Release a squad's locked problem statement
 * Clears local storage registries and Supabase submission problem statement data
 */
export const deleteProblemStatementSelection = async ({ teamId, leaderEmail }) => {
  const cleanEmail = (leaderEmail || '').trim().toLowerCase();

  // 1. Remove from local selections registry
  try {
    const all = getLocalSelections();
    const updated = all.filter(s => {
      if (teamId && s.team_id === teamId) return false;
      if (cleanEmail && s.leader_email?.toLowerCase() === cleanEmail) return false;
      return true;
    });
    saveLocalSelections(updated);

    if (teamId) {
      localStorage.removeItem(`haxlr8_ps_team_${teamId}`);
    }
    if (cleanEmail) {
      localStorage.removeItem(`haxlr8_ps_team_${cleanEmail}`);
    }

    // Clean up cached team record if present
    const teamKey = teamId ? `haxlr8_team_${teamId}` : null;
    const emailKey = cleanEmail ? `haxlr8_team_${cleanEmail}` : null;
    [teamKey, emailKey].filter(Boolean).forEach(k => {
      try {
        const raw = localStorage.getItem(k);
        if (raw) {
          const pt = JSON.parse(raw);
          delete pt.problem_statement_id;
          delete pt.problem_statement_num;
          delete pt.problem_statement_title;
          pt.problem_statement_locked = false;
          delete pt.problem_statement_locked_at;
          delete pt.problem_statement_locked_by;
          localStorage.setItem(k, JSON.stringify(pt));
        }
      } catch (e) {}
    });
  } catch (e) {
    console.warn('Local storage error in deleteProblemStatementSelection:', e);
  }

  // 2. Cloud Supabase cleanup (for real registered squads)
  if (teamId && !isDemoId(teamId) && !isDemoEmail(cleanEmail)) {
    try {
      const { data: existingSubs } = await supabase
        .from('submissions')
        .select('*')
        .eq('team_id', teamId);

      if (existingSubs && existingSubs.length > 0) {
        for (const sub of existingSubs) {
          let updatedNotes = sub.evaluation_notes;
          if (updatedNotes) {
            try {
              const parsed = typeof updatedNotes === 'string' ? JSON.parse(updatedNotes) : updatedNotes;
              delete parsed.problem_statement;
              delete parsed.locked_at;
              delete parsed.problem_statement_id;
              updatedNotes = JSON.stringify(parsed);
            } catch (e) {
              updatedNotes = null;
            }
          }
          const updatedScores = sub.evaluation_scores || {};
          delete updatedScores.problem_statement;

          await supabase
            .from('submissions')
            .update({
              evaluation_notes: updatedNotes,
              evaluation_scores: updatedScores,
              updated_at: new Date().toISOString()
            })
            .eq('id', sub.id);
        }
      }
    } catch (err) {
      console.warn('Cloud submission cleanup notice:', err);
    }
  }

  // 3. Dispatch global events so participant & admin UIs re-render immediately
  window.dispatchEvent(new CustomEvent('haxlr8_ps_locked', { detail: null }));
  window.dispatchEvent(new CustomEvent('haxlr8_ps_deleted', { detail: { teamId, leaderEmail } }));

  return true;
};

