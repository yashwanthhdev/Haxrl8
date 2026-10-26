import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import OverviewTab    from './OverviewTab';
import TeamTab        from './TeamTab';
import PaymentTab     from './PaymentTab';
import TicketTab      from './TicketTab';
import ResourcesTab   from './ResourcesTab';
import AnnouncementsTab from './AnnouncementsTab';
import AmongUsCrewmate from '../../components/amongus/AmongUsCrewmate';
import haxlr8LogoDark from '../../assets/logo/haxlr8-logo-dark.png';
import { filterRealAnnouncements } from '../../lib/announcementsService';
import { resolveDomain } from '../../lib/domainUtils';
import { recordUserActivity } from '../../lib/userTrackingService';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'overview');
  
  // Data States
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [hasTeam, setHasTeam] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Concurrency and Loop Protection Refs
  const fetchingRef = useRef(false);
  const userRef = useRef(null);

  const withTimeout = (promise, ms = 4000) =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), ms))
    ]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        console.warn('Google sign-in error:', error);
        setGoogleLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.warn('Google sign in exception:', e);
      setGoogleLoading(false);
    }
  };

  const fetchDashboardData = async (overrideUser = null) => {
    if (fetchingRef.current && !overrideUser) return;
    fetchingRef.current = true;

    try {
      let activeUser = overrideUser || null;

      // 1. Instant Cache Hydration: Render instantly if cached session exists
      if (!activeUser) {
        const local = localStorage.getItem('haxlr8_leader_session');
        if (local) {
          try {
            const parsed = JSON.parse(local);
            activeUser = parsed?.user || (parsed?.email ? parsed : null);
            if (activeUser) {
              setUser(activeUser);
              userRef.current = activeUser;
              // Pre-hydrate team data so UI loads with 0ms delay
              const cachedTeam = localStorage.getItem(`haxlr8_team_${activeUser.id}`);
              if (cachedTeam) {
                const pt = JSON.parse(cachedTeam);
                setHasTeam(true);
                setTeamData(pt);
                const cm = localStorage.getItem(`haxlr8_members_${activeUser.id}`);
                if (cm) setTeamMembers(JSON.parse(cm));
                const cs = localStorage.getItem(`haxlr8_subs_${activeUser.id}`);
                if (cs) setSubmissions(JSON.parse(cs));
              }
              setLoading(false);
            }
          } catch (e) {}
        }
      }

      // 2. Check current Supabase session (handles OAuth redirect token parsing)
      const isOAuth = typeof window !== 'undefined' && 
        (window.location.hash.includes('access_token=') || window.location.search.includes('code='));

      if (!activeUser || isOAuth) {
        setLoading(true);
        const maxAttempts = isOAuth ? 6 : 1;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          try {
            const sessionRes = await withTimeout(supabase.auth.getSession(), 4500);
            if (sessionRes?.data?.session?.user) {
              activeUser = sessionRes.data.session.user;
              break;
            }
          } catch (e) {
            console.warn('Supabase getSession notice:', e);
          }
          if (isOAuth && attempt < maxAttempts - 1) {
            await new Promise(r => setTimeout(r, 350));
          }
        }

        if (!activeUser) {
          try {
            const res = await withTimeout(supabase.auth.getUser(), 3500);
            if (res?.data?.user) activeUser = res.data.user;
          } catch (e) {
            console.warn('Supabase getUser notice:', e);
          }
        }
      }

      if (!activeUser) {
        setLoading(false);
        setUser(null);
        userRef.current = null;
        return;
      }

      setUser(activeUser);
      userRef.current = activeUser;
      try {
        localStorage.setItem('haxlr8_leader_session', JSON.stringify({
          user: activeUser,
          email: activeUser.email,
          role: 'team_leader'
        }));
      } catch (e) {}

      // Record user activity for central admin accounts tracking
      try {
        const detectedProvider = isOAuth ? 'google' : (activeUser.app_metadata?.provider || 'email');
        recordUserActivity(activeUser, detectedProvider).catch(e => console.warn('Record user session notice:', e));
      } catch (trackErr) {}

      // Clean up OAuth tokens from URL if present
      if (typeof window !== 'undefined') {
        try {
          if (window.location.hash.includes('access_token=') || window.location.search.includes('code=')) {
            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete('code');
            cleanUrl.searchParams.delete('state');
            cleanUrl.hash = '';
            window.history.replaceState(null, '', cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : ''));
          }
        } catch (e) {}
      }

      // Fetch announcements with safe default fallback
      try {
        const { data: annData } = await withTimeout(supabase.from('announcements').select('*').order('created_at', { ascending: false }), 1500);
        const filteredAnn = annData ? filterRealAnnouncements(annData) : [];
        if (filteredAnn && filteredAnn.length > 0) {
          setAnnouncements(filteredAnn);
        } else {
          setAnnouncements([
            {
              id: 'ann_default',
              title: 'Welcome to HAXLR8 3.0 Space Flight Command!',
              content: 'All systems are active. Ensure your squad roster (3–4 members) and idea presentation paper are locked in before the deadline.',
              created_at: new Date().toISOString(),
              tag: 'MISSION BRIEFING'
            }
          ]);
        }
      } catch (annErr) {
        setAnnouncements([
          {
            id: 'ann_default',
            title: 'Welcome to HAXLR8 3.0 Space Flight Command!',
            content: 'All systems are active. Ensure your squad roster (3–4 members) and idea presentation paper are locked in before the deadline.',
            created_at: new Date().toISOString(),
            tag: 'MISSION BRIEFING'
          }
        ]);
      }

      // 1. Purge legacy unsanitized global keys so they never leak between users
      try {
        localStorage.removeItem('haxlr8_teams_db');
        localStorage.removeItem('haxlr8_members_db');
        localStorage.removeItem('haxlr8_submissions_db');
      } catch (e) {}

      // 2. Fetch team strictly associated with activeUser
      let resolvedTeam = null;
      let resolvedMembers = [];
      let resolvedSubs = [];

      try {
        // A. Check if activeUser is the leader of a registered team in Supabase
        let leadTeam = null;
        try {
          const { data: leadTeams } = await withTimeout(
            supabase
              .from('teams')
              .select('*')
              .eq('leader_id', activeUser.id)
              .order('created_at', { ascending: false })
              .limit(1),
            5000
          );
          if (leadTeams && leadTeams.length > 0) {
            leadTeam = leadTeams[0];
          }
        } catch (tErr) {
          console.warn('Leader team fetch notice:', tErr);
        }

        // A2. Also check if activeUser email is listed as is_leader in team_members
        if (!leadTeam && activeUser.email) {
          try {
            const { data: leadMems } = await withTimeout(
              supabase
                .from('team_members')
                .select('team_id')
                .ilike('email', activeUser.email.trim())
                .eq('is_leader', true)
                .order('created_at', { ascending: false })
                .limit(1),
              5000
            );
            if (leadMems?.[0]?.team_id) {
              const { data: matchingTeams } = await withTimeout(
                supabase.from('teams').select('*').eq('id', leadMems[0].team_id).limit(1),
                5000
              );
              if (matchingTeams?.[0]) leadTeam = matchingTeams[0];
            }
          } catch (lmErr) {}
        }

        if (leadTeam) {
          resolvedTeam = leadTeam;
        } else if (activeUser.email) {
          // B. Check if activeUser is registered as a crewmate in another team
          try {
            const { data: memberRecords } = await withTimeout(
              supabase
                .from('team_members')
                .select('team_id')
                .ilike('email', activeUser.email.trim())
                .order('created_at', { ascending: false })
                .limit(1),
              5000
            );

            if (memberRecords?.[0]?.team_id) {
              const { data: joinedTeams } = await withTimeout(
                supabase
                  .from('teams')
                  .select('*')
                  .eq('id', memberRecords[0].team_id)
                  .limit(1),
                5000
              );
              if (joinedTeams?.[0]) resolvedTeam = joinedTeams[0];
            }
          } catch (memErr) {}
        }

        if (resolvedTeam) {
          try {
            const { data: members } = await withTimeout(
              supabase
                .from('team_members')
                .select('*')
                .eq('team_id', resolvedTeam.id)
                .order('is_leader', { ascending: false }),
              5000
            );
            if (members && members.length > 0) {
              resolvedMembers = members;
              setTeamMembers(members);
            } else {
              // Network fallback: load cached members if available
              const cachedMemsRaw = localStorage.getItem(`haxlr8_members_${activeUser.id}`);
              if (cachedMemsRaw) {
                try {
                  const parsedMems = JSON.parse(cachedMemsRaw);
                  if (parsedMems && parsedMems.length > 0) {
                    resolvedMembers = parsedMems;
                    setTeamMembers(parsedMems);
                  }
                } catch (e) {}
              }
            }
          } catch (mErr) {
            console.warn('Team members fetch notice:', mErr);
            const cachedMemsRaw = localStorage.getItem(`haxlr8_members_${activeUser.id}`);
            if (cachedMemsRaw) {
              try {
                const parsedMems = JSON.parse(cachedMemsRaw);
                if (parsedMems && parsedMems.length > 0) {
                  resolvedMembers = parsedMems;
                  setTeamMembers(parsedMems);
                }
              } catch (e) {}
            }
          }

          try {
            const { data: subs } = await withTimeout(
              supabase
                .from('submissions')
                .select('*')
                .eq('team_id', resolvedTeam.id)
                .order('created_at', { ascending: false }),
              5000
            );
            if (subs && subs.length > 0) {
              resolvedSubs = subs;
              setSubmissions(subs);
            }
          } catch (sErr) {}

          // Determine canonical domain
          const finalDomain = resolveDomain(resolvedTeam, resolvedSubs?.[0], activeUser);
          resolvedTeam.domain = finalDomain;

          // Determine payment status from submissions or cache
          const paidSub = (resolvedSubs || []).find(s => s.pdf_url || (s.project_description && s.project_description.includes('Registration fee')) || s.status === 'Shortlisted');
          let paymentStatus = resolvedTeam.payment_status;
          let paymentUtr = resolvedTeam.payment_utr;
          if (paidSub) {
            const utrMatch = paidSub.project_description?.match(/UTR:\s*([A-Za-z0-9_-]+)/i);
            paymentUtr = utrMatch ? utrMatch[1] : (paidSub.pdf_url ? 'VERIFIED' : 'VERIFIED');
            paymentStatus = 'submitted';
            resolvedTeam.payment_status = 'submitted';
            resolvedTeam.payment_utr = paymentUtr;

            // Also ensure active user has the payment record cached locally on this device/browser
            try {
              const nameMatch = paidSub.project_description?.match(/Payer:\s*([^(]+)/i);
              const phoneMatch = paidSub.project_description?.match(/\(([0-9]+)\)/);
              const autoPaymentRecord = {
                transaction_id: paymentUtr,
                payer_name: nameMatch ? nameMatch[1].trim() : (resolvedMembers.find(m => m.is_leader)?.full_name || activeUser.user_metadata?.full_name || 'Leader'),
                payer_phone: phoneMatch ? phoneMatch[1].trim() : '',
                amount: 1200,
                screenshot_url: paidSub.pdf_url || '',
                status: 'submitted',
                submitted_at: paidSub.updated_at || paidSub.created_at || new Date().toISOString()
              };
              localStorage.setItem(`haxlr8_payment_${activeUser.id}`, JSON.stringify(autoPaymentRecord));
            } catch (e) {}
          }

          setHasTeam(true);
          setTeamData({ ...resolvedTeam, domain: finalDomain, payment_status: paymentStatus, payment_utr: paymentUtr });

          // Cache strictly scoped to this user (never overwrite with empty members)
          try {
            localStorage.setItem(`haxlr8_team_${activeUser.id}`, JSON.stringify({ ...resolvedTeam, domain: finalDomain, payment_status: paymentStatus, payment_utr: paymentUtr }));
            if (resolvedMembers && resolvedMembers.length > 0) {
              localStorage.setItem(`haxlr8_members_${activeUser.id}`, JSON.stringify(resolvedMembers));
            }
            if (resolvedSubs && resolvedSubs.length > 0) {
              localStorage.setItem(`haxlr8_subs_${activeUser.id}`, JSON.stringify(resolvedSubs));
            }
          } catch (e) {}
        } else {
          // C. User has NO team in Supabase!
          // Only check user-scoped cache if it strictly belongs to THIS activeUser.id
          let userScopedTeam = null;
          try {
            const scopedRaw = localStorage.getItem(`haxlr8_team_${activeUser.id}`);
            if (scopedRaw) {
              const parsed = JSON.parse(scopedRaw);
              if (parsed && (parsed.leader_id === activeUser.id || parsed.leader_email === activeUser.email)) {
                userScopedTeam = parsed;
              }
            }
          } catch (e) {}

          if (userScopedTeam) {
            const finalDomain = resolveDomain(userScopedTeam, null, activeUser);
            userScopedTeam.domain = finalDomain;
            setHasTeam(true);
            setTeamData({ ...userScopedTeam, domain: finalDomain });
            try {
              const scopedMems = localStorage.getItem(`haxlr8_members_${activeUser.id}`);
              if (scopedMems) setTeamMembers(JSON.parse(scopedMems));
              const scopedSubs = localStorage.getItem(`haxlr8_subs_${activeUser.id}`);
              if (scopedSubs) setSubmissions(JSON.parse(scopedSubs));
            } catch (e) {}
          } else {
            // Truly a new user without a squad
            setHasTeam(false);
            setTeamData(null);
            setTeamMembers([]);
            setSubmissions([]);
          }
        }
      } catch (teamErr) {
        console.warn('Teams fetch network notice:', teamErr);
        // Only load if strictly scoped to activeUser
        let userScopedTeam = null;
        try {
          const scopedRaw = localStorage.getItem(`haxlr8_team_${activeUser.id}`);
          if (scopedRaw) {
            const parsed = JSON.parse(scopedRaw);
            if (parsed && (parsed.leader_id === activeUser.id || parsed.leader_email === activeUser.email)) {
              userScopedTeam = parsed;
            }
          }
        } catch (e) {}

        if (userScopedTeam) {
          setHasTeam(true);
          setTeamData(userScopedTeam);
          try {
            const scopedMems = localStorage.getItem(`haxlr8_members_${activeUser.id}`);
            if (scopedMems) setTeamMembers(JSON.parse(scopedMems));
            const scopedSubs = localStorage.getItem(`haxlr8_subs_${activeUser.id}`);
            if (scopedSubs) setSubmissions(JSON.parse(scopedSubs));
          } catch (e) {}
        } else {
          setHasTeam(false);
          setTeamData(null);
          setTeamMembers([]);
          setSubmissions([]);
        }
      }
    } catch (error) {
      console.warn('Dashboard telemetry notice:', error);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen for cross-component announcement updates (e.g. deletion)
    const handleAnnouncementsUpdate = (e) => {
      const deletedId = e?.detail?.deletedId;
      if (deletedId) {
        setAnnouncements(prev => filterRealAnnouncements(prev.filter(a => String(a.id) !== String(deletedId))));
      }
    };
    window.addEventListener('haxlr8_announcements_updated', handleAnnouncementsUpdate);

    // Listen for auth state changes (strictly re-fetch if user identity changed or on SIGNED_IN event)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const isNewUser = session.user.id !== userRef.current?.id;
        setUser(session.user);
        userRef.current = session.user;
        try {
          localStorage.setItem('haxlr8_leader_confirmed', 'true');
        } catch (e) {}
        if (isNewUser || event === 'SIGNED_IN') {
          fetchingRef.current = false;
          fetchDashboardData(session.user);
        }
      }
    });

    return () => {
      window.removeEventListener('haxlr8_announcements_updated', handleAnnouncementsUpdate);
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  if (loading) {
    const isOAuthRedirect = typeof window !== 'undefined' && 
      (window.location.hash.includes('access_token=') || window.location.search.includes('code='));

    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100dvh', width: '100%', background:'#fffaf3', fontFamily:"'Plus Jakarta Sans', sans-serif", padding: '20px 16px', boxSizing: 'border-box' }}>
        <div style={{ textAlign:'center', maxWidth: 420, width: '100%', background: '#ffffff', borderRadius: 24, padding: '36px 24px', border: '2px solid #fed7aa', boxShadow: '0 12px 36px rgba(0,0,0,0.06)', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <AmongUsCrewmate color="cyan" size={64} hat="visor" speechText={isOAuthRedirect ? "Authorizing Google credentials..." : "Preparing flight controls..."} />
          </div>
          <div style={{ width:44, height:44, border:'4px solid #fed7aa', borderTop:'4px solid #0284c7', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }} />
          <div style={{ color:'#0284c7', fontSize:'14px', fontWeight:900, letterSpacing:'0.04em', textTransform:'uppercase' }}>
            {isOAuthRedirect ? 'VERIFYING GOOGLE SSO...' : 'CONNECTING TO FLIGHT DECK...'}
          </div>
          <p style={{ color:'#64748b', fontSize:'12.5px', marginTop:'8px', fontWeight:600, lineHeight: 1.5 }}>
            {isOAuthRedirect ? 'Hydrating Commander session and establishing secure telemetry...' : 'Syncing mission telemetry & squad credentials'}
          </p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // If no user is logged in, show helpful Commander Authentication gate instead of a blank screen
  if (!user && !loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100dvh', 
        width: '100%',
        background: '#fffaf3', 
        fontFamily: "'Plus Jakarta Sans', sans-serif", 
        padding: '24px 16px',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          maxWidth: 440, 
          width: '100%', 
          background: '#ffffff', 
          borderRadius: 24, 
          padding: '32px 22px', 
          textAlign: 'center', 
          border: '2px solid #fed7aa', 
          boxShadow: '0 14px 40px rgba(0,0,0,0.06)',
          boxSizing: 'border-box'
        }}>
          {/* Logo Header */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <img src={haxlr8LogoDark} alt="HAXLR8 3.0" style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
          </div>

          {/* Commander Mascot */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <AmongUsCrewmate color="red" size={66} hat="cap" speechText="Captain ID Required! 🚀" />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 20, padding: '4px 12px', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ● Authorization Required
            </span>
          </div>

          <h2 style={{ fontSize: 21, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>Commander Login Required</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
            To access your squad manifest, challenge domain, payment verification, and verified registration receipt, please verify your credentials.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* 1-Tap Google SSO Button */}
            <button
              type="button"
              disabled={googleLoading}
              onClick={handleGoogleSignIn}
              style={{
                height: '46px',
                width: '100%',
                backgroundColor: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontSize: '13.5px',
                fontWeight: 800,
                color: '#1e293b',
                cursor: googleLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>{googleLoading ? 'Connecting to Google SSO...' : 'Continue with Google SSO'}</span>
            </button>

            {/* Standard Email Login */}
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '12px 18px',
                borderRadius: 13,
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '13.5px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              Sign In with Email & Password →
            </button>

            {/* Register */}
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                background: '#fff7ed',
                border: '1.5px solid #fed7aa',
                color: '#ea580c',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              New Squad? Register Leader Account
            </button>

            {/* Return home */}
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '8px',
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ← Back to Main Base Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} hasTeam={hasTeam} announcements={announcements} user={user} teamData={teamData} teamMembers={teamMembers}>
      {activeTab === 'overview'   && <OverviewTab hasTeam={hasTeam} teamData={teamData} teamMembers={teamMembers} submissions={submissions} user={user} setActiveTab={setActiveTab} announcements={announcements} />}
      {activeTab === 'team'       && <TeamTab hasTeam={hasTeam} teamData={teamData} teamMembers={teamMembers} submissions={submissions} user={user} setTeamMembers={setTeamMembers} setTeamData={setTeamData} setHasTeam={setHasTeam} setActiveTab={setActiveTab} />}
      {activeTab === 'payment'    && <PaymentTab hasTeam={hasTeam} teamData={teamData} teamMembers={teamMembers} submissions={submissions} user={user} setActiveTab={setActiveTab} onPaymentUpdated={(p) => { if (teamData) setTeamData({ ...teamData, payment_status: 'submitted', payment_utr: p.transaction_id }); }} />}
      {activeTab === 'ticket'     && <TicketTab hasTeam={hasTeam} teamData={teamData} teamMembers={teamMembers} submissions={submissions} user={user} setActiveTab={setActiveTab} />}
      {activeTab === 'resources'  && <ResourcesTab hasTeam={hasTeam} submissions={submissions} setActiveTab={setActiveTab} />}
      {activeTab === 'announcements' && <AnnouncementsTab announcements={announcements} />}
    </DashboardLayout>
  );
}
