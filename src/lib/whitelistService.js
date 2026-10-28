import { supabase } from './supabaseClient';

const ANNOUNCEMENT_TAG = 'REGISTRATION_WHITELIST_CONFIG';
const LOCAL_CACHE_KEY = 'haxlr8_reg_whitelist_cache';

const DEFAULT_CONFIG = {
  enabled: true, // Whitelist enforcement is ACTIVE: public registration is closed
  allowedEmails: [],
  updatedAt: new Date().toISOString(),
};

/**
 * Normalizes email: lowercases and trims
 */
export function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Reads local cached whitelist config
 */
export function getLocalWhitelistConfig() {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.enabled === 'boolean' && Array.isArray(parsed.allowedEmails)) {
        return {
          enabled: parsed.enabled,
          allowedEmails: parsed.allowedEmails.map(normalizeEmail).filter(Boolean),
          updatedAt: parsed.updatedAt || new Date().toISOString(),
        };
      }
    }
  } catch (e) {
    console.warn('Error reading local whitelist cache:', e);
  }
  return DEFAULT_CONFIG;
}

/**
 * Saves local cached whitelist config
 */
function setLocalWhitelistConfig(config) {
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(config));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('haxlr8_whitelist_updated', { detail: config }));
    }
  } catch (e) {
    console.warn('Error writing local whitelist cache:', e);
  }
}

/**
 * Fetches whitelist configuration from Supabase with fallback to local cache
 */
export async function fetchWhitelistConfig() {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('tag', ANNOUNCEMENT_TAG)
      .limit(1);

    if (!error && data && data.length > 0) {
      try {
        const parsed = JSON.parse(data[0].content);
        const config = {
          id: data[0].id,
          enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : true,
          allowedEmails: Array.isArray(parsed.allowedEmails)
            ? Array.from(new Set(parsed.allowedEmails.map(normalizeEmail).filter(Boolean)))
            : [],
          updatedAt: parsed.updatedAt || data[0].created_at || new Date().toISOString(),
        };
        setLocalWhitelistConfig(config);
        return config;
      } catch (pErr) {
        console.warn('Error parsing whitelist JSON from Supabase:', pErr);
      }
    }
  } catch (err) {
    console.warn('Network notice fetching whitelist from Supabase:', err);
  }

  return getLocalWhitelistConfig();
}

/**
 * Saves whitelist configuration to Supabase and local cache
 */
export async function saveWhitelistConfig(config) {
  const cleanEmails = Array.from(
    new Set((config.allowedEmails || []).map(normalizeEmail).filter(Boolean))
  );

  const payload = {
    enabled: typeof config.enabled === 'boolean' ? config.enabled : true,
    allowedEmails: cleanEmails,
    updatedAt: new Date().toISOString(),
  };

  setLocalWhitelistConfig(payload);

  try {
    const { data: existing } = await supabase
      .from('announcements')
      .select('id')
      .eq('tag', ANNOUNCEMENT_TAG)
      .limit(1);

    const contentStr = JSON.stringify(payload);

    if (existing && existing.length > 0) {
      await supabase
        .from('announcements')
        .update({
          title: 'HAXLR8 Registration Whitelist Config',
          message: 'Restricted registration access control list',
          content: contentStr,
        })
        .eq('id', existing[0].id);
    } else {
      await supabase
        .from('announcements')
        .insert([{
          title: 'HAXLR8 Registration Whitelist Config',
          tag: ANNOUNCEMENT_TAG,
          message: 'Restricted registration access control list',
          content: contentStr,
        }]);
    }
  } catch (err) {
    console.warn('Supabase whitelist save notice:', err);
  }

  return payload;
}

/**
 * Checks whether a given email is whitelisted
 */
export function isEmailWhitelisted(email, allowedEmails = []) {
  const clean = normalizeEmail(email);
  if (!clean) return false;
  return allowedEmails.map(normalizeEmail).includes(clean);
}

/**
 * Comprehensive eligibility check:
 * 1. If whitelist enforcement is disabled -> Allowed.
 * 2. If email is in whitelist -> Allowed.
 * 3. If email belongs to an existing registered team leader or teammate in Supabase -> Allowed (existing teams are never locked out).
 * 4. Otherwise -> Blocked.
 */
export async function checkRegistrationEligibility(rawEmail) {
  const email = normalizeEmail(rawEmail);
  if (!email) {
    return { allowed: false, reason: 'Please enter a valid email address.' };
  }

  // 1. Fetch live whitelist configuration
  const config = await fetchWhitelistConfig();

  // 2. If whitelist mode is disabled, anyone can register
  if (!config.enabled) {
    return { allowed: true, mode: 'public' };
  }

  // 3. Direct whitelist check
  if (isEmailWhitelisted(email, config.allowedEmails)) {
    return { allowed: true, mode: 'whitelisted', whitelisted: true };
  }

  // 4. Verify if this is an already registered team leader or member in Supabase
  try {
    const { data: teamLead } = await supabase
      .from('teams')
      .select('id')
      .ilike('leader_email', email)
      .limit(1);

    if (teamLead && teamLead.length > 0) {
      return { allowed: true, mode: 'existing_leader', existing: true };
    }

    const { data: member } = await supabase
      .from('team_members')
      .select('id')
      .ilike('email', email)
      .limit(1);

    if (member && member.length > 0) {
      return { allowed: true, mode: 'existing_member', existing: true };
    }
  } catch (dbErr) {
    console.warn('Check existing team notice:', dbErr);
  }

  // 5. Block registration
  return {
    allowed: false,
    reason: 'Registration is restricted: Public registrations are closed. Only admin-approved emails are authorized to register.',
    whitelisted: false,
  };
}
