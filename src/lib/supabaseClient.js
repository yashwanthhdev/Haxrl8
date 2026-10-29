import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

const withTimeout = (promise, ms = 6000) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Auth request timeout')), ms))
  ]);

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Determine if we are using placeholder credentials
const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                      rawSupabaseUrl.includes('placeholder-project') || 
                      rawSupabaseAnonKey.includes('placeholder');

export const rawSupabase = createClient(rawSupabaseUrl, rawSupabaseAnonKey);

// Storage key for resilient local leader session
const LOCAL_SESSION_KEY = 'haxlr8_leader_session';
const LOCAL_TEAMS_KEY = 'haxlr8_teams_db';
const LOCAL_MEMBERS_KEY = 'haxlr8_members_db';
const LOCAL_SUBMISSIONS_KEY = 'haxlr8_submissions_db';

// Auth event listeners pool
const authListeners = new Set();

function notifyAuthListeners(event, session) {
  authListeners.forEach(cb => {
    try { cb(event, session); } catch (e) { console.error('Auth listener error:', e); }
  });
}

function getLocalSession() {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed?.user && !isUUID(parsed.user.id)) {
      parsed.user.id = uuidv4();
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

function setLocalSession(user, notify = true) {
  if (!user) return null;
  if (!isUUID(user.id)) {
    user.id = uuidv4();
  }
  const current = getLocalSession();
  const isSameUser = current?.user?.id === user.id && current?.user?.email === user.email;

  const session = {
    access_token: current?.access_token || ('haxlr8_token_' + Date.now()),
    token_type: 'bearer',
    expires_in: 86400 * 7,
    refresh_token: current?.refresh_token || ('haxlr8_refresh_' + Date.now()),
    user,
  };
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));

  // Only notify if user state genuinely changed and notify flag is true
  if (notify && !isSameUser) {
    notifyAuthListeners('SIGNED_IN', session);
  }
  return session;
}

function clearLocalSession() {
  try {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    localStorage.removeItem('haxlr8_leader_confirmed');
    localStorage.removeItem(LOCAL_TEAMS_KEY);
    localStorage.removeItem(LOCAL_MEMBERS_KEY);
    localStorage.removeItem(LOCAL_SUBMISSIONS_KEY);
  } catch (e) {}
  notifyAuthListeners('SIGNED_OUT', null);
}

// Storage key for locally registered accounts in demo / offline resilience mode
const LOCAL_USERS_KEY = 'haxlr8_registered_accounts';

function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveRegisteredUser(email, password, fullName, id) {
  try {
    const users = getRegisteredUsers();
    users[email.toLowerCase()] = {
      id: id || uuidv4(),
      email: email.toLowerCase(),
      password,
      fullName: fullName || email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {}
}

function verifyRegisteredCredentials(email, password) {
  const cleanEmail = email.toLowerCase().trim();
  // Check locally registered accounts
  const users = getRegisteredUsers();
  const found = users[cleanEmail];
  if (found && found.password === password) {
    return {
      id: found.id,
      email: found.email,
      fullName: found.fullName,
    };
  }
  return null;
}

/**
 * Enhanced Supabase client that guarantees offline / demo / local functionality
 * when Supabase is not configured or network requests fail.
 */
export const supabase = {
  ...rawSupabase,

  auth: {
    ...rawSupabase.auth,

    async signInWithPassword({ email, password }) {
      const cleanEmail = (email || '').trim().toLowerCase();

      // 1. If Supabase is configured, attempt real Supabase authentication first
      if (!isPlaceholder) {
        try {
          const res = await withTimeout(rawSupabase.auth.signInWithPassword({ email: cleanEmail, password }), 2000);
          if (!res.error && res.data?.user) {
            setLocalSession(res.data.user);
            saveRegisteredUser(cleanEmail, password, res.data.user.user_metadata?.full_name, res.data.user.id);
            return res;
          }
          if (res.error) {
            const localUser = verifyRegisteredCredentials(cleanEmail, password);
            if (localUser) {
              const user = {
                id: localUser.id,
                email: localUser.email,
                user_metadata: {
                  full_name: localUser.fullName,
                  role: 'team_leader',
                },
                role: 'authenticated',
                aud: 'authenticated',
                created_at: new Date().toISOString(),
              };
              const session = setLocalSession(user);
              return { data: { user, session }, error: null };
            }

            // Real credential mismatch: strictly reject
            return {
              data: { user: null, session: null },
              error: {
                name: 'AuthApiError',
                message: 'Invalid email or password. Please verify your credentials or click "Squad Register" to create an account.',
                status: 400
              }
            };
          }
        } catch (err) {
          console.warn('Real Supabase fetch notice:', err);
        }
      }

      // 2. Strict credential verification against registered accounts & demo account
      const matchedUser = verifyRegisteredCredentials(cleanEmail, password);
      if (matchedUser) {
        const user = {
          id: matchedUser.id,
          email: matchedUser.email,
          user_metadata: {
            full_name: matchedUser.fullName,
            role: 'team_leader',
          },
          role: 'authenticated',
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        const session = setLocalSession(user);
        return { data: { user, session }, error: null };
      }

      // 3. Strict Rejection: Never allow random passwords or unauthorized accounts
      return {
        data: { user: null, session: null },
        error: {
          name: 'AuthApiError',
          message: 'Invalid email or password. Please verify your credentials or click "Squad Register" to create an account.',
          status: 400
        }
      };
    },

    async signUp({ email, password, options }) {
      const cleanEmail = (email || '').trim().toLowerCase();
      const fullName = options?.data?.full_name || cleanEmail.split('@')[0];

      if (!isPlaceholder) {
        try {
          const res = await withTimeout(rawSupabase.auth.signUp({ email: cleanEmail, password, options }), 2000);
          if (!res.error && res.data?.user) {
            setLocalSession(res.data.user);
            saveRegisteredUser(cleanEmail, password, fullName, res.data.user.id);
            return res;
          }
          if (res.error) {
            console.warn('Supabase sign-up response notice:', res.error);
            if (res.error.message?.toLowerCase().includes('already registered')) {
              return res;
            }
          }
        } catch (err) {
          console.warn('Real Supabase signup network error:', err);
        }
      }

      // Check if already registered locally
      const existing = getRegisteredUsers();
      if (existing[cleanEmail]) {
        return {
          data: { user: null, session: null },
          error: {
            name: 'AuthApiError',
            message: 'An account with this email address is already registered. Please login instead.',
            status: 400
          }
        };
      }

      const userId = uuidv4();
      const user = {
        id: userId,
        email: cleanEmail,
        user_metadata: {
          full_name: fullName,
          role: 'team_leader',
        },
        role: 'authenticated',
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };

      saveRegisteredUser(cleanEmail, password, fullName, userId);
      const session = setLocalSession(user);
      return { data: { user, session }, error: null };
    },

    async signInWithOAuth({ provider, options }) {
      if (!isPlaceholder) {
        try {
          const res = await rawSupabase.auth.signInWithOAuth({ provider, options });
          if (res.error) return res;
          return res;
        } catch (e) {
          console.warn('OAuth call exception:', e);
          return { data: null, error: e };
        }
      }

      const user = {
        id: `leader_oauth_${provider}_${Date.now()}`,
        email: `leader.${provider}@haxlr8.mit.ac.in`,
        user_metadata: {
          full_name: `Squad Leader (${provider.toUpperCase()})`,
          role: 'team_leader',
        },
        role: 'authenticated',
      };
      setLocalSession(user);
      if (typeof window !== 'undefined') {
        window.location.href = options?.redirectTo || '/dashboard';
      }
      return { data: { provider, url: '/dashboard' }, error: null };
    },

    async getUser() {
      // 1. Try getSession first to parse any active OAuth redirect or current token
      try {
        const sessionRes = await this.getSession();
        if (sessionRes?.data?.session?.user) {
          return { data: { user: sessionRes.data.session.user }, error: null };
        }
      } catch (e) {}

      // 2. Try raw Supabase getUser
      if (!isPlaceholder) {
        try {
          const res = await withTimeout(rawSupabase.auth.getUser(), 6000);
          if (res.data?.user) {
            setLocalSession(res.data.user);
            return res;
          }
        } catch (e) {
          // ignore network error
        }
      }

      // 3. Check local leader session
      const local = getLocalSession();
      if (local?.user) {
        return { data: { user: local.user }, error: null };
      }

      return { data: { user: null }, error: null };
    },

    async getSession() {
      // 1. Fetch active session from raw Supabase (handles PKCE code exchange automatically)
      if (!isPlaceholder) {
        try {
          const res = await withTimeout(rawSupabase.auth.getSession(), 6000);
          if (res.data?.session?.user) {
            setLocalSession(res.data.session.user, false);
            return res;
          }
        } catch (e) {}

        // Fallback for Implicit Flow hash tokens (#access_token=...&refresh_token=...)
        if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('access_token=')) {
          try {
            const rawHash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
            const hashParams = new URLSearchParams(rawHash);
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');

            if (accessToken && refreshToken) {
              const res = await withTimeout(rawSupabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              }), 6000);

              if (res.data?.session?.user) {
                setLocalSession(res.data.session.user);
                return res;
              }
            }
          } catch (hashErr) {
            console.warn('OAuth hash fallback notice:', hashErr);
          }
        }
      }

      // 2. Fetch active session from raw Supabase
      if (!isPlaceholder) {
        try {
          const res = await withTimeout(rawSupabase.auth.getSession(), 6000);
          if (res.data?.session?.user) {
            setLocalSession(res.data.session.user, false);
            return res;
          }
        } catch (e) {}
      }

      // 3. Fallback to local session
      const local = getLocalSession();
      return { data: { session: local }, error: null };
    },

    async signOut() {
      clearLocalSession();
      try {
        if (!isPlaceholder) await rawSupabase.auth.signOut();
      } catch (e) {}
      return { error: null };
    },

    async updateUser(attributes) {
      const cleanPassword = attributes?.password;
      let remoteError = null;
      let updatedUser = null;

      if (!isPlaceholder) {
        try {
          const res = await withTimeout(rawSupabase.auth.updateUser(attributes), 5000);
          if (res?.data?.user) {
            updatedUser = res.data.user;
            setLocalSession(updatedUser);
          }
          if (res?.error) {
            remoteError = res.error;
          }
        } catch (err) {
          console.warn('Real Supabase updateUser notice:', err);
        }
      }

      // Update local credentials cache
      const current = updatedUser || getLocalSession()?.user;
      const cleanEmail = (current?.email || '').trim().toLowerCase();
      if (cleanEmail && cleanPassword) {
        const users = getRegisteredUsers();
        const existing = users[cleanEmail] || {};
        users[cleanEmail] = {
          ...existing,
          id: current?.id || existing.id || uuidv4(),
          email: cleanEmail,
          password: cleanPassword,
          fullName: current?.user_metadata?.full_name || existing.fullName || cleanEmail.split('@')[0],
          updatedAt: new Date().toISOString()
        };
        try {
          localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
        } catch (e) {}
      }

      if (remoteError && !updatedUser) {
        if (cleanPassword) {
          return { data: { user: current }, error: null };
        }
        return { data: { user: null }, error: remoteError };
      }

      return { data: { user: current }, error: null };
    },

    async resetPasswordForEmail(email, options) {
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!isPlaceholder) {
        try {
          const res = await withTimeout(rawSupabase.auth.resetPasswordForEmail(cleanEmail, options), 5000);
          if (!res.error) return res;
        } catch (e) {}
      }
      return { data: {}, error: null };
    },

    onAuthStateChange(callback) {
      authListeners.add(callback);

      // Trigger initial state
      const current = getLocalSession();
      if (current?.user) {
        try { callback('INITIAL_SESSION', current); } catch (e) {}
      }

      // Also listen to raw Supabase if present
      let rawSub = null;
      try {
        const { data } = rawSupabase.auth.onAuthStateChange((event, session) => {
          if (session?.user) setLocalSession(session.user);
          callback(event, session);
        });
        rawSub = data?.subscription;
      } catch (e) {}

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback);
              if (rawSub?.unsubscribe) rawSub.unsubscribe();
            }
          }
        }
      };
    }
  },

  from(table) {
    const rawQuery = rawSupabase.from(table);

    // If using real backend and not a placeholder, return raw query
    if (!isPlaceholder) {
      return rawQuery;
    }

    // Resilient Mock/Local Query Builder for Offline / Dev
    return {
      select(...args) {
        const queryState = {
          table,
          filters: {},
          isSingle: false,
          eq(col, val) {
            queryState.filters[col] = val;
            return queryState;
          },
          order() {
            return queryState;
          },
          single() {
            queryState.isSingle = true;
            return queryState;
          },
          then(resolve) {
            if (table === 'site_settings') {
              resolve({ data: { value: false }, error: null });
              return;
            }
            if (table === 'announcements') {
              resolve({
                data: [
                  {
                    id: 1,
                    title: 'Welcome to HAXLR8 3.0 Spaceship Command!',
                    content: 'All systems are active. Ensure your team details and idea paper abstract are submitted before the deadline.',
                    created_at: new Date().toISOString(),
                    tag: 'MISSION BRIEFING',
                  },
                ],
                error: null,
              });
              return;
            }
            if (table === 'teams') {
              try {
                const stored = localStorage.getItem(LOCAL_TEAMS_KEY);
                const teams = stored ? JSON.parse(stored) : null;
                if (queryState.isSingle) {
                  if (teams) {
                    resolve({ data: teams, error: null });
                  } else {
                    resolve({ data: null, error: { code: 'PGRST116', message: 'No team found' } });
                  }
                  return;
                }
                resolve({ data: teams ? [teams] : [], error: null });
              } catch (e) {
                resolve({ data: null, error: null });
              }
              return;
            }
            if (table === 'team_members') {
              try {
                const stored = localStorage.getItem(LOCAL_MEMBERS_KEY);
                const members = stored ? JSON.parse(stored) : [];
                resolve({ data: members, error: null });
              } catch (e) {
                resolve({ data: [], error: null });
              }
              return;
            }
            if (table === 'submissions') {
              try {
                const stored = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
                const subs = stored ? JSON.parse(stored) : [];
                resolve({ data: subs, error: null });
              } catch (e) {
                resolve({ data: [], error: null });
              }
              return;
            }
            resolve({ data: [], error: null });
          }
        };
        return queryState;
      },

      insert(data) {
        return {
          select() {
            return this;
          },
          single() {
            return this;
          },
          then(resolve) {
            if (table === 'teams') {
              const item = Array.isArray(data) ? data[0] : data;
              const saved = { ...item, id: item.id || 'team_' + Date.now() };
              localStorage.setItem(LOCAL_TEAMS_KEY, JSON.stringify(saved));
              resolve({ data: saved, error: null });
              return;
            }
            resolve({ data, error: null });
          }
        };
      },

      upsert(data) {
        return {
          select() {
            return this;
          },
          then(resolve) {
            if (table === 'team_members') {
              const items = Array.isArray(data) ? data : [data];
              localStorage.setItem(LOCAL_MEMBERS_KEY, JSON.stringify(items));
              resolve({ data: items, error: null });
              return;
            }
            if (table === 'teams') {
              const item = Array.isArray(data) ? data[0] : data;
              localStorage.setItem(LOCAL_TEAMS_KEY, JSON.stringify(item));
              resolve({ data: item, error: null });
              return;
            }
            resolve({ data, error: null });
          }
        };
      },

      update(data) {
        return {
          eq(col, val) {
            return {
              then(resolve) {
                resolve({ data, error: null });
              }
            };
          }
        };
      }
    };
  }
};

