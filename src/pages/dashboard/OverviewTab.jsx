import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import EventTimeline from '../../components/EventTimeline';
import { motion, AnimatePresence } from 'framer-motion';

import AmongUsCrewmate, { AmongUsKingCharacter } from '../../components/amongus/AmongUsCrewmate';
import { filterRealAnnouncements } from '../../lib/announcementsService';
import { fetchDocuments, getLocalDocuments, getOfficialRulebook, subscribeToDocuments } from '../../lib/documentsService';
import { 
  fetchSquadronsConfig, 
  getLocalSquadronsConfig, 
  resolveDisplaySquadrons, 
  subscribeToSquadronsConfig 
} from '../../lib/crewSquadronsService';
import { resolveDomain, formatDomainWithBadge } from '../../lib/domainUtils';

const TIMELINE_STEPS = [
  { title: 'Registration', date: 'Oct 09' },
  { title: 'Squad Lock', date: 'Nov 02' },
  { title: 'Fee Verify', date: 'Nov 02' },
  { title: 'Pass Issued', date: 'Nov 03' },
  { title: 'Grand Finale', date: 'Nov 06–07' },
];

const card = (extra = {}) => ({
  background: '#ffffff',
  borderRadius: 22,
  padding: '24px',
  boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
  border: '2px solid #fed7aa',
  color: '#0f172a',
  ...extra,
});

const CheckItem = ({ label, status }) => {
  let icon, style, color;
  if (status === 'done') {
    icon = <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>;
    style = { width: 20, height: 20, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)' };
    color = '#15803d';
  } else if (status === 'active') {
    icon = null;
    style = { width: 20, height: 20, borderRadius: '50%', border: '2px dashed #0284c7', flexShrink: 0, background: '#e0f2fe' };
    color = '#0284c7';
  } else {
    icon = null;
    style = { width: 20, height: 20, borderRadius: '50%', border: '2px solid #cbd5e1', flexShrink: 0, background: '#f8fafc' };
    color = '#94a3b8';
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={style}>{icon}</div>
      <span style={{ fontSize: 13.5, fontWeight: status === 'active' ? 800 : 700, color }}>{label}</span>
    </div>
  );
};

export default function OverviewTab({ hasTeam, teamData, teamMembers, submissions, user, setActiveTab, announcements = [] }) {
  const [totalTeams, setTotalTeams] = useState(0);
  const [squadronsConfig, setSquadronsConfig] = useState(() => getLocalSquadronsConfig());
  const [showRulebook, setShowRulebook] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [documents, setDocuments] = useState(() => getLocalDocuments());
  const rulebookDoc = getOfficialRulebook(documents);

  useEffect(() => {
    let isMounted = true;
    fetchSquadronsConfig().then(cfg => {
      if (isMounted && cfg) setSquadronsConfig(cfg);
    });

    const handleSquadronsUpdate = (e) => {
      if (e.detail) setSquadronsConfig(e.detail);
    };
    window.addEventListener('haxlr8_squadrons_config_updated', handleSquadronsUpdate);

    const unsubscribe = subscribeToSquadronsConfig((newCfg) => {
      if (isMounted && newCfg) setSquadronsConfig(newCfg);
    });

    return () => {
      isMounted = false;
      window.removeEventListener('haxlr8_squadrons_config_updated', handleSquadronsUpdate);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchDocuments().then(data => {
      if (isMounted && data && Array.isArray(data)) setDocuments(data);
    });

    const handleDocsUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) setDocuments(e.detail);
    };
    window.addEventListener('haxlr8_documents_updated', handleDocsUpdate);

    const unsubscribe = subscribeToDocuments((newDocs) => {
      if (isMounted && newDocs && Array.isArray(newDocs)) setDocuments(newDocs);
    });

    return () => {
      isMounted = false;
      window.removeEventListener('haxlr8_documents_updated', handleDocsUpdate);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchTeamCount = async () => {
      try {
        localStorage.removeItem('total_teams_count');
        localStorage.removeItem('total_teams_time');
        const { count, error } = await supabase.from('teams').select('id', { count: 'exact' });
        if (!error && typeof count === 'number') {
          setTotalTeams(count);
        } else {
          // If query returns data array
          const { data } = await supabase.from('teams').select('id');
          if (data && Array.isArray(data)) {
            setTotalTeams(data.length);
          }
        }
      } catch (e) {
        console.warn('Error fetching live teams count:', e);
      }
    };
    fetchTeamCount();
  }, []);

  useEffect(() => {
    if (showRulebook) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showRulebook]);

  const memberCount = teamMembers?.length || 1;
  const realAnnouncements = filterRealAnnouncements(announcements);
  let isPaid = false;
  try {
    if (user?.id) {
      const p = localStorage.getItem(`haxlr8_payment_${user.id}`);
      if (p) isPaid = true;
    }
  } catch (e) {}
  if (!isPaid && (teamData?.payment_status === 'submitted' || teamData?.payment_utr)) isPaid = true;
  if (!isPaid && submissions && submissions.length > 0) {
    const paidSub = submissions.find(s => s.pdf_url || (s.project_description && s.project_description.includes('Registration fee')) || s.status === 'Shortlisted');
    if (paidSub) isPaid = true;
  }

  // Authoritative Leader resolution
  const leader = teamMembers?.find(m => m.is_leader) || teamMembers?.find(m => m.id === teamData?.leader_id) || teamMembers?.[0];
  const isCurrentUserLeader = Boolean(
    (teamData?.leader_id && user?.id && teamData.leader_id === user.id) ||
    (leader?.email && user?.email && leader.email.toLowerCase().trim() === user.email.toLowerCase().trim()) ||
    (teamMembers?.find(m => m.email?.toLowerCase().trim() === user?.email?.toLowerCase().trim())?.is_leader)
  );
  const currentDomain = resolveDomain(teamData, submissions?.[0], user, 'Healthcare');

  const overallProgress = hasTeam ? (isPaid ? 100 : 60) : 25; 
  // Timeline indices: 0: Registration, 1: Squad Lock, 2: Fee Verify, 3: Pass Issued, 4: Grand Finale
  // Once squad is registered (hasTeam=true), Squad Lock is COMPLETED, and Fee Verify is ACTIVE.
  const currentStepIndex = isPaid ? 3 : (hasTeam ? 2 : 1);

  const now = new Date();
  const getDaysLeft = (targetDate) => {
    const diff = new Date(targetDate) - now;
    if (diff < 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  let nextMilestone = null;
  let upcomingMilestonesList = [];

  if (hasTeam && isPaid) {
    nextMilestone = { 
      title: 'Flight Passes & Venue Briefing', 
      dateStr: '2026-11-03T12:00:00', 
      icon: '🎫', 
      desc: 'Official checkpoint passes & campus briefing' 
    };
    upcomingMilestonesList = [
      { title: 'Squad Manifest Lock', desc: `${teamData?.team_name || 'Squad'} · ${memberCount} crew members locked`, icon: '🚀', statusText: 'Completed ✓', statusColor: '#16a34a', statusBg: '#dcfce7' },
      { title: 'Payment Verification', desc: '₹1,200 team fee clearance verified', icon: '💳', statusText: 'Verified ✓', statusColor: '#16a34a', statusBg: '#dcfce7' },
      { title: 'Flight Passes & Venue Briefing', desc: 'Official checkpoint passes & campus briefing', icon: '🎫', statusText: 'Releases Nov 03', statusColor: '#0284c7', statusBg: '#e0f2fe' },
      { title: 'Grand Finale (MIT Mysore)', desc: '24-hour hackathon & ₹40,000 bounty', icon: '🏆', statusText: 'Nov 06–07', statusColor: '#ea580c', statusBg: '#ffedd5' }
    ];
  } else if (hasTeam && !isPaid) {
    nextMilestone = { 
      title: 'Payment Verification (₹1,200)', 
      dateStr: '2026-11-02T23:59:59', 
      icon: '💳', 
      desc: 'Submit ₹1,200 UPI transaction for clearance' 
    };
    upcomingMilestonesList = [
      { title: 'Squad Manifest Lock', desc: `${teamData?.team_name || 'Squad'} · ${memberCount} crew members locked`, icon: '🚀', statusText: 'Completed ✓', statusColor: '#16a34a', statusBg: '#dcfce7' },
      { title: 'Payment Verification', desc: 'Submit ₹1,200 UPI payment & UTR in Payment tab', icon: '💳', statusText: 'In Progress · Due Nov 02', statusColor: '#ea580c', statusBg: '#ffedd5' },
      { title: 'Flight Passes & Venue Briefing', desc: 'Unlocks upon payment verification', icon: '🎫', statusText: 'Releases Nov 03', statusColor: '#64748b', statusBg: '#f1f5f9' },
      { title: 'Grand Finale (MIT Mysore)', desc: '24-hour hackathon & ₹40,000 bounty', icon: '🏆', statusText: 'Nov 06–07', statusColor: '#64748b', statusBg: '#f1f5f9' }
    ];
  } else {
    nextMilestone = { 
      title: 'Registration Closed & Final Briefing', 
      dateStr: '2026-11-03T12:00:00', 
      icon: '🔒', 
      desc: 'Hackathon registrations are officially closed' 
    };
    upcomingMilestonesList = [
      { title: 'New Squad Registration', desc: 'Squad capacity reached', icon: '🔒', statusText: 'Closed', statusColor: '#dc2626', statusBg: '#fee2e2' },
      { title: 'Payment Verification', desc: 'Registered squads fee clearance', icon: '💳', statusText: 'In Progress', statusColor: '#ea580c', statusBg: '#ffedd5' },
      { title: 'Flight Passes & Venue Briefing', desc: 'Official checkpoint passes & instructions', icon: '🎫', statusText: 'Nov 03', statusColor: '#64748b', statusBg: '#f1f5f9' },
      { title: 'Grand Finale (MIT Mysore)', desc: '24-hour hackathon & ₹40,000 bounty', icon: '🏆', statusText: 'Nov 06–07', statusColor: '#64748b', statusBg: '#f1f5f9' }
    ];
  }

  const daysToNext = getDaysLeft(nextMilestone.dateStr);
  const displaySquadrons = resolveDisplaySquadrons(totalTeams, squadronsConfig);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Unregistered Account Gate Banner */}
      {!hasTeam && !teamData && (
        <div style={{
          background: '#fff1f2',
          border: '2px solid #fecdd3',
          borderRadius: 20,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          boxShadow: '0 4px 14px rgba(225, 29, 72, 0.08)',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 28 }}>🔒</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#9f1239' }}>
                Registrations Officially Closed
              </div>
              <div style={{ fontSize: 13, color: '#881337', fontWeight: 600, marginTop: 2, lineHeight: 1.4 }}>
                HAXLR8 3.0 has reached maximum capacity and new registrations are permanently closed.
                {user?.email && ` Your account (${user.email}) is not associated with any registered squad. If you are a team member, please ask your squad leader to verify your email address.`}
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              try { await supabase.auth.signOut(); } catch (e) {}
              localStorage.clear();
              window.location.href = '/login';
            }}
            style={{
              padding: '10px 18px',
              borderRadius: 12,
              background: '#9f1239',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(159, 18, 57, 0.25)'
            }}
          >
            Sign Out &amp; Switch Account
          </button>
        </div>
      )}
      
      {/* Priority Mission Broadcast Banner */}
      {showNotification && (
        <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: 16, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, overflow: 'hidden', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08)' }}>
          <AmongUsCrewmate color={isPaid ? "green" : hasTeam ? "cyan" : "red"} size={32} speechText={isPaid ? "Payment Verified!" : hasTeam ? "Squad Locked!" : "Registration Closed"} />
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0369a1', flex: 1, letterSpacing: '0.01em', lineHeight: 1.5 }}>
            <strong>STARSHIP MISSION ADVISORY:</strong>{' '}
            {hasTeam && isPaid ? (
              <>Squad <strong>"{teamData?.team_name}"</strong> ({formatDomainWithBadge(currentDomain)}) is locked and payment is verified! Checkpoint flight passes &amp; venue arrival briefing will release on <strong>November 03, 2026</strong>.</>
            ) : hasTeam && !isPaid ? (
              <>Squad <strong>"{teamData?.team_name}"</strong> manifest ({memberCount} crew members) is locked in! Complete your squad's <strong>₹1,200 payment verification</strong> before <strong>November 02, 2026 at 11:59 PM IST</strong> to unlock flight passes &amp; verified receipt.</>
            ) : (
              <>Registrations for HAXLR8 3.0 are officially closed. Registered squads are finalizing preparations for the Grand Finale at MIT Mysore.</>
            )}
          </div>
          <button onClick={() => setShowNotification(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#0369a1', opacity: 0.7 }} onMouseEnter={e => e.currentTarget.style.opacity='1'} onMouseLeave={e => e.currentTarget.style.opacity='0.7'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {/* Cosmic Event Timeline */}
      <EventTimeline steps={TIMELINE_STEPS} currentStepIndex={currentStepIndex} />

      {/* Active Squad Quick Status Card (for registered squads & teammates) */}
      {hasTeam && teamData && (
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: 20,
          border: '2px solid #fed7aa',
          padding: '18px 22px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 22,
              fontWeight: 900,
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
              flexShrink: 0
            }}>
              🚀
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Squad: {teamData.team_name}
                </h2>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 100,
                  background: '#e0f2fe',
                  color: '#0284c7',
                  border: '1px solid #bae6fd'
                }}>
                  {formatDomainWithBadge(currentDomain)}
                </span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 100,
                  background: isCurrentUserLeader ? '#fef3c7' : '#eff6ff',
                  color: isCurrentUserLeader ? '#b45309' : '#0284c7',
                  border: isCurrentUserLeader ? '1px solid #fde68a' : '1px solid #bfdbfe',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {isCurrentUserLeader ? '👑 Flight Captain' : '🧑‍🚀 Crewmate'}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap', fontWeight: 600 }}>
                <span>Captain: <strong>{leader?.full_name || 'Team Lead'}</strong></span>
                <span>Manifest: <strong>{memberCount} Members</strong></span>
                <span>Payment: <strong style={{ color: isPaid ? '#16a34a' : '#ea580c' }}>{isPaid ? 'Verified ✓' : 'Verification Required'}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab && setActiveTab('team')}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                fontSize: 12.5,
                fontWeight: 800,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              View Crew Manifest →
            </button>
            <button
              onClick={() => setActiveTab && setActiveTab(isPaid ? 'ticket' : 'payment')}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                background: isPaid ? '#16a34a' : '#0284c7',
                border: 'none',
                fontSize: 12.5,
                fontWeight: 800,
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: isPaid ? '0 2px 8px rgba(22, 163, 74, 0.25)' : '0 2px 8px rgba(2, 132, 199, 0.25)'
              }}
            >
              {isPaid ? 'View Payment Receipt →' : 'Submit Fee Verification →'}
            </button>
          </div>
        </div>
      )}

      {/* Action Required: USN Correction Advisory */}
      {hasTeam && (teamMembers || []).some(m => m.reg_no && /^\d{10}$/.test(String(m.reg_no).replace(/[\s\-\+]/g, ''))) && (
        <div style={{
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
          border: '2px solid #f97316',
          borderRadius: 16,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          boxShadow: '0 8px 24px rgba(234, 88, 12, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 26, background: '#ffedd5', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fed7aa', flexShrink: 0 }}>
              🎓
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Action Required: Update College USN / Seat Number
              </div>
              <div style={{ fontSize: 13, color: '#c2410c', fontWeight: 600, marginTop: 2, lineHeight: 1.4 }}>
                Please enter your college USN or university seat number (e.g. <strong>4PS24EC076</strong>).
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab && setActiveTab('team')}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              background: '#ea580c',
              border: 'none',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            Update USN Now →
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="dash-overview-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        
        {/* Rulebook / Protocols Quick Card */}
        <div
          style={card({
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            cursor: 'pointer',
            border: '2px solid #bae6fd',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          })}
          onClick={() => {
            if (rulebookDoc?.fileUrl && rulebookDoc.fileUrl !== '#' && !rulebookDoc.fileUrl.startsWith('#')) {
              window.open(rulebookDoc.fileUrl, '_blank', 'noopener,noreferrer');
            } else {
              setShowRulebook(true);
            }
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(2, 132, 199, 0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.04)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)' }}>📄</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>Flight Rulebook</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mandatory Protocols</div>
            </div>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <span>{rulebookDoc?.fileUrl ? 'Open Official PDF →' : 'View flight protocols →'}</span>
            {rulebookDoc?.fileSize && rulebookDoc.fileSize !== 'Official PDF' && (
              <span style={{ fontSize: 10, background: '#e0f2fe', padding: '2px 8px', borderRadius: 6, fontWeight: 800 }}>
                {rulebookDoc.fileSize}
              </span>
            )}
          </div>
        </div>

        {/* Days to Next Milestone Card */}
        <div style={card({ display: 'flex', flexDirection: 'column', padding: '24px', background: 'linear-gradient(135deg, #fefce8 0%, #ffffff 100%)', border: '2px solid #fef08a' })}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fef08a', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 12px rgba(202, 138, 4, 0.15)' }}>⏳</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#a16207', lineHeight: 1 }}>{daysToNext} Days</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#854d0e', marginTop: 4 }}>Time to Milestone</div>
            </div>
          </div>
          <div style={{ marginTop: 'auto', fontSize: 12.5, fontWeight: 800, color: '#713f12' }}>{nextMilestone.title}</div>
        </div>

        {/* Teams Participating Card */}
        <div style={card({ display: 'flex', flexDirection: 'column', padding: '24px', background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', border: '2px solid #bbf7d0' })}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)' }}>⭐</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#15803d', lineHeight: 1 }}>{displaySquadrons}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginTop: 4 }}>Crew Squadrons</div>
            </div>
          </div>
          <div style={{ marginTop: 'auto', fontSize: 12.5, fontWeight: 800, color: '#14532d' }}>National Participants</div>
        </div>

      </div>

      {/* Main Grid: Comms, Readiness, Milestones */}
      <div className="dash-overview-main" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        
        {/* Starship Comms */}
        <div style={card({ display: 'flex', flexDirection: 'column' })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>📡</span>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: 0 }}>Starship Comms</h3>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            {realAnnouncements.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '24px 0', fontSize: 13.5, background: '#f8fafc', borderRadius: 14, border: '1px dashed #cbd5e1' }}>
                No active broadcasts. All telemetry nominal.
              </div>
            ) : realAnnouncements.slice(0, 3).map(a => (
              <div key={a.id} style={{ display: 'flex', gap: 12, background: '#f8fafc', padding: '14px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 18, color: '#0284c7', flexShrink: 0 }}>📢</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{a.title}</div>
                  <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 4, lineHeight: 1.4 }}>{a.message || a.content}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, fontWeight: 600 }}>{new Date(a.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})} • Starfleet Admin</div>
                </div>
              </div>
            ))}
          </div>
          <div onClick={() => setActiveTab('announcements')} style={{ marginTop: 20, textAlign: 'center', fontSize: 12.5, fontWeight: 800, color: '#0284c7', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            View all broadcasts →
          </div>
        </div>

        {/* Mission Readiness */}
        <div style={card({ display: 'flex', flexDirection: 'column' })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🎯</span>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: 0 }}>Mission Readiness</h3>
            </div>
          </div>
          <div className="readiness-container" style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1 }}>
            {/* Circular Gauge */}
            <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 36 36" style={{ position: 'absolute', width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1e7db" strokeWidth="4" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0284c7" strokeWidth="4" strokeDasharray={`${overallProgress}, 100`} />
              </svg>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#0284c7', lineHeight: 1 }}>{overallProgress}%</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Readiness</div>
              </div>
            </div>
            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              <CheckItem label="Registration" status="done" />
              <CheckItem label="Crew Manifest (3–4 Members)" status={hasTeam ? 'done' : 'active'} />
              <CheckItem label="Payment Verification (₹1,200)" status={isPaid ? 'done' : (hasTeam ? 'active' : 'pending')} />
              <CheckItem label="Payment Receipt" status={isPaid ? 'done' : 'pending'} />
              <CheckItem label="Grand Finale (Nov 6–7)" status="pending" />
            </div>
          </div>
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#64748b' }}>
            {isPaid ? 'All systems nominal! Your registration payment receipt is verified.' : (hasTeam ? 'Roster locked! Proceed to Payment & Verification (₹1,200).' : 'Assemble 3–4 crew members in "My Team" to advance.')}
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div style={card({ display: 'flex', flexDirection: 'column' })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🗓️</span>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: 0 }}>Upcoming Milestones</h3>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
            {upcomingMilestonesList.map((m, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>{m.title}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>{m.desc}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    fontSize: 11, 
                    fontWeight: 800, 
                    color: m.statusColor || '#0284c7', 
                    background: m.statusBg || '#e0f2fe', 
                    border: `1px solid ${m.statusColor ? m.statusColor + '40' : '#bae6fd'}`, 
                    padding: '3px 8px', 
                    borderRadius: 100 
                  }}>
                    {m.statusText}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── ARTIFACTS & MISSION RESOURCES QUICK PANEL ── */}
      <div style={card({ display: 'flex', flexDirection: 'column', gap: 16 })}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>
              📦 Official Mission Artifacts &amp; Resources
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0, fontWeight: 500 }}>
              Official guides, event rulebooks, and campus logistics for your squad.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {/* Flight Rulebook */}
          <div
            onClick={() => {
              if (rulebookDoc?.fileUrl && rulebookDoc.fileUrl !== '#' && !rulebookDoc.fileUrl.startsWith('#')) {
                window.open(rulebookDoc.fileUrl, '_blank', 'noopener,noreferrer');
              } else {
                setShowRulebook(true);
              }
            }}
            style={{
              cursor: 'pointer',
              background: '#f0f9ff',
              border: '1.5px solid #bae6fd',
              borderRadius: 16,
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <span style={{ fontSize: 28 }}>📄</span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0369a1' }}>Flight Rulebook</div>
              <div style={{ fontSize: 11, color: '#0284c7', fontWeight: 600 }}>Rules &amp; Evaluation</div>
            </div>
          </div>

          {/* Problem Statement Notice Card */}
          <div
            style={{
              background: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: 16,
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 28 }}>🔒</span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#92400e' }}>Problem Statements</div>
              <div style={{ fontSize: 11, color: '#b45309', fontWeight: 600 }}>Unlocks Nov 2nd · Pass via Email</div>
            </div>
          </div>

          {/* Leader vs Impostor Protocol */}
          <div
            onClick={() => setActiveTab('resources')}
            style={{
              cursor: 'pointer',
              background: '#fdf4ff',
              border: '1.5px solid #f5d0fe',
              borderRadius: 16,
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#fae8ff', border: '1.5px solid #f0abfc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AmongUsKingCharacter size={26} color="#9333ea" />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#86198f' }}>Leader vs Impostor</div>
              <div style={{ fontSize: 11, color: '#a21caf', fontWeight: 600 }}>Flight Security Briefing</div>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Rulebook Modal */}
      {showRulebook && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#ffffff', border: '2px solid #fed7aa', borderRadius: 24, width: '100%', maxWidth: 620, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.18)', position: 'relative' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1.5px solid #f1e7db', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fffaf3' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>📜 HAXLR8 3.0 Flight Rulebook &amp; Protocols</div>
              <button onClick={() => setShowRulebook(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '70vh', overflowY: 'auto', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
              {rulebookDoc?.fileName && rulebookDoc?.fileUrl && (
                <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>Official Uploaded PDF</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{rulebookDoc.fileName}</div>
                  </div>
                  {rulebookDoc.fileSize && (
                    <span style={{ fontSize: 11, background: '#bae6fd', color: '#0369a1', padding: '3px 8px', borderRadius: 8, fontWeight: 800 }}>
                      {rulebookDoc.fileSize}
                    </span>
                  )}
                </div>
              )}

              <h4 style={{ color: '#0f172a', fontWeight: 900, margin: '0 0 6px' }}>1. Team Composition &amp; Eligibility</h4>
              <p>Squads must consist of 3 to 4 undergraduate students. Inter-college and inter-branch teams are 100% permitted. All participants must carry official college identity cards.</p>

              <h4 style={{ color: '#0f172a', fontWeight: 900, margin: '0 0 6px' }}>2. 24-Hour Offline Hackathon</h4>
              <p>The finale will be conducted live on campus at Maharaja Institute of Technology Mysore on November 06–07, 2026. High-speed Wi-Fi, power workstations, meals, and midnight snacks are provided.</p>

              <h4 style={{ color: '#0f172a', fontWeight: 900, margin: '0 0 6px' }}>3. Evaluation &amp; Judging (100 Points)</h4>
              <ul style={{ paddingLeft: 20 }}>
                <li>Innovation &amp; Originality (25%)</li>
                <li>Technical Feasibility &amp; Depth (25%)</li>
                <li>Real-world Impact &amp; Scalability (25%)</li>
                <li>Live Pitch &amp; Working Demonstration (25%)</li>
              </ul>

              <h4 style={{ color: '#0f172a', fontWeight: 900, margin: '0 0 6px' }}>4. Solution Architecture (Hardware is Optional)</h4>
              <p>Hardware is completely optional and never compulsory. Teams have full freedom to target the right real-world problem and architect the right solution—whether engineered at the core level (algorithms, embedded logic, system protocols, simulation) or software level (AI/ML models, cloud platforms, web/mobile applications, computer vision). Depth of problem-solving, real-world utility, and innovation are the primary evaluation criteria.</p>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1.5px solid #f1e7db', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', gap: 12, flexWrap: 'wrap' }}>
              {rulebookDoc?.fileUrl && rulebookDoc.fileUrl !== '#' && !rulebookDoc.fileUrl.startsWith('#') ? (
                <a
                  href={rulebookDoc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={rulebookDoc.fileName || "HAXLR8-3.0-Official-Rulebook.pdf"}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    borderRadius: 12,
                    background: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 13,
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                  }}
                >
                  <span>📥 Download Official Rulebook PDF {rulebookDoc.fileSize && rulebookDoc.fileSize !== 'Official PDF' ? `(${rulebookDoc.fileSize})` : ''}</span>
                </a>
              ) : (
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b' }}>
                  ⏳ Official PDF will be uploaded by the organizing committee shortly.
                </div>
              )}
              <button onClick={() => setShowRulebook(false)} style={{ padding: '10px 20px', borderRadius: 12, background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                Close Protocol Window
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .dash-overview-stats {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .dash-overview-main {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .readiness-container {
            flex-direction: column !important;
            align-items: center !important;
            gap: 18px !important;
          }
        }
      `}</style>
    </div>
  );
}
