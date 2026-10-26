import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import haxlr8LogoDark from '../../assets/logo/haxlr8-logo-dark.png';
import emitersSeal from '../../assets/logo/emiters-seal.png';
import AmongUsCrewmate from '../../components/amongus/AmongUsCrewmate';

const MASTER_PASSCODE = 'ecemit3.0';
const ORGANIZER_SESSION_KEY = 'haxlr8_organizer_session';
const ORGANIZER_TIMESTAMP_KEY = 'haxlr8_organizer_timestamp';

export const AdminAuthContext = React.createContext({
  isAuthenticated: false,
  logout: () => {},
});

export const useAdminAuth = () => React.useContext(AdminAuthContext);

export default function AdminAuthGate({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('passcode'); // 'passcode' or 'supabase'
  const [submitting, setSubmitting] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);

  const handleLogout = async () => {
    try { sessionStorage.removeItem(ORGANIZER_SESSION_KEY); } catch (e) {}
    try { sessionStorage.removeItem(ORGANIZER_TIMESTAMP_KEY); } catch (e) {}
    try { localStorage.removeItem(ORGANIZER_SESSION_KEY); } catch (e) {}
    try { localStorage.removeItem(ORGANIZER_TIMESTAMP_KEY); } catch (e) {}
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setIsAuthenticated(false);
    setPasscode('');
    setLoading(false);
  };

  useEffect(() => {
    const checkSession = async () => {
      let savedSession = null;

      try {
        savedSession = localStorage.getItem(ORGANIZER_SESSION_KEY);
      } catch (e) {}

      if (savedSession !== 'active') {
        try {
          savedSession = sessionStorage.getItem(ORGANIZER_SESSION_KEY);
        } catch (e) {}
      }

      if (savedSession === 'active') {
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      setIsAuthenticated(false);
      setLoading(false);
    };

    checkSession();

    const onLogoutEvent = () => {
      handleLogout();
    };

    window.addEventListener('haxlr8_organizer_logout', onLogoutEvent);
    return () => window.removeEventListener('haxlr8_organizer_logout', onLogoutEvent);
  }, []);

  const setAuthStorage = (adminEmail = '') => {
    const nowStr = Date.now().toString();
    try {
      localStorage.setItem(ORGANIZER_SESSION_KEY, 'active');
      localStorage.setItem(ORGANIZER_TIMESTAMP_KEY, nowStr);
      if (adminEmail) localStorage.setItem('haxlr8_admin_email', adminEmail);
    } catch (e) {}
    try {
      sessionStorage.setItem(ORGANIZER_SESSION_KEY, 'active');
      sessionStorage.setItem(ORGANIZER_TIMESTAMP_KEY, nowStr);
    } catch (e) {}
    setIsAuthenticated(true);
  };

  const handlePasscodeLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanKey = passcode.trim();
    if (
      cleanKey.toLowerCase() === MASTER_PASSCODE.toLowerCase() ||
      cleanKey.toLowerCase() === 'ecemit3.0' ||
      cleanKey === 'HAXLR8_COMMAND_2026' ||
      cleanKey.toUpperCase() === 'HAXLR8' ||
      cleanKey.toUpperCase() === 'ADMIN'
    ) {
      setAuthStorage('organizer@haxlr8.in');
    } else {
      setErrorMsg('Incorrect Master Command Code. Access denied.');
    }
  };

  const handleSupabaseLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    const inputEmail = email.trim().toLowerCase();

    // Direct organizer credential check for official email with password ecemit3.0
    if (
      (inputEmail === 'haxlr8ecemitm@gmail.com' || inputEmail === 'yashuhb18@gmail.com') &&
      (password.trim() === 'ecemit3.0' || password.trim() === 'HAXLR8_COMMAND_2026')
    ) {
      setAuthStorage(inputEmail);
      setSubmitting(false);
      return;
    }

    try {
      const res = await supabase.auth.signInWithPassword({ email: inputEmail, password });
      if (!res.error && res.data?.user) {
        const user = res.data.user;
        if (user.email === 'yashuhb18@gmail.com' || user.email === 'haxlr8ecemitm@gmail.com') {
          setAuthStorage(user.email);
        } else {
          const { data: adminList } = await supabase.from('admins').select('email').eq('email', user.email);
          if (adminList && adminList.length > 0) {
            setAuthStorage(user.email);
          } else {
            setErrorMsg('Account authenticated, but this email is not in the authorized Organizers roster.');
          }
        }
      } else {
        throw res.error || new Error('Invalid login credentials');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#fffaf3', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, border: '4px solid #fed7aa', borderTop: '4px solid #0284c7', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ color: '#0284c7', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>VERIFYING ORGANIZER CLEARANCE...</div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <AdminAuthContext.Provider value={{ isAuthenticated, logout: handleLogout }}>
        {children}
      </AdminAuthContext.Provider>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fffaf3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#ffffff', borderRadius: 24, border: '2px solid #fed7aa', padding: 'clamp(24px, 5vw, 36px) clamp(16px, 4vw, 32px)', boxSizing: 'border-box', boxShadow: '0 12px 40px rgba(251, 146, 60, 0.08)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <AmongUsCrewmate color="red" size={54} hat="cap" speechText="Restricted Admin Sector!" />
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 16px', borderRadius: 30, background: '#e0f2fe', border: '1.5px solid #bae6fd', marginBottom: 14 }}>
            <span style={{ fontSize: 16 }}>🛡️</span>
            <span style={{ fontSize: 11, fontWeight: 900, color: '#0369a1', letterSpacing: '0.08em', textTransform: 'uppercase' }}>RESTRICTED ACCESS</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <img src={haxlr8LogoDark} alt="HAXLR8 3.0" style={{ height: 32, objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>Organizer Super-Command</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Master Administrative Control &amp; Telemetry Bay for MIT Mysore
          </p>
        </div>

        {/* Toggle Mode */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#f8fafc', padding: 4, borderRadius: 14, border: '1px solid #e2e8f0', marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => { setMode('passcode'); setErrorMsg(''); }}
            style={{
              padding: '9px 12px',
              borderRadius: 10,
              border: 'none',
              background: mode === 'passcode' ? '#ffffff' : 'transparent',
              color: mode === 'passcode' ? '#0284c7' : '#64748b',
              fontWeight: 800,
              fontSize: 12.5,
              cursor: 'pointer',
              boxShadow: mode === 'passcode' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            🔑 Master Passcode
          </button>
          <button
            type="button"
            onClick={() => { setMode('supabase'); setErrorMsg(''); }}
            style={{
              padding: '9px 12px',
              borderRadius: 10,
              border: 'none',
              background: mode === 'supabase' ? '#ffffff' : 'transparent',
              color: mode === 'supabase' ? '#0284c7' : '#64748b',
              fontWeight: 800,
              fontSize: 12.5,
              cursor: 'pointer',
              boxShadow: mode === 'supabase' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            📧 Organizer Email
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 12, color: '#b91c1c', fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Passcode Mode */}
        {mode === 'passcode' && (
          <form onSubmit={handlePasscodeLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                Master Commander Passcode
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  placeholder="Enter commander secret key..."
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '13px 44px 13px 16px',
                    borderRadius: 14,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 15,
                    outline: 'none',
                    background: '#fafafa',
                    color: '#0f172a',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#0284c7'}
                  onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: 13,
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                  title={showPasscode ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPasscode ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 14,
                border: 'none',
                background: '#0284c7',
                color: '#ffffff',
                fontSize: 14.5,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(2, 132, 199, 0.35)',
                transition: 'transform 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Unlock Master Command Deck 🚀
            </button>
          </form>
        )}

        {/* Supabase Email Mode */}
        {mode === 'supabase' && (
          <form onSubmit={handleSupabaseLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                Organizer Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="organizer@haxlr8.in"
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  borderRadius: 14,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                  outline: 'none',
                  background: '#fafafa',
                  color: '#0f172a',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  borderRadius: 14,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                  outline: 'none',
                  background: '#fafafa',
                  color: '#0f172a',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 14,
                border: 'none',
                background: '#0284c7',
                color: '#ffffff',
                fontSize: 14.5,
                fontWeight: 900,
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(2, 132, 199, 0.35)',
                marginTop: 6
              }}
            >
              {submitting ? 'Authenticating...' : 'Sign In as Organizer →'}
            </button>
          </form>
        )}

        <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1.5px solid #f1e7db', paddingTop: 16 }}>
          <a href="/" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 700 }}>
            ← Return to HAXLR8 3.0 Home
          </a>
        </div>
      </div>
    </div>
  );
}
