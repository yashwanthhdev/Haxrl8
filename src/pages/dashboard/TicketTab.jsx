import React, { useRef, useState, useEffect } from 'react';
import { 
  Printer, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Phone,
  Ticket as TicketIcon,
  Target,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import AmongUsCrewmate from '../../components/amongus/AmongUsCrewmate';
import emitersSeal from '../../assets/logo/emiters-seal.png';
import mitLogo from '../../assets/logo/mit-mysore-logo.png';
import heroCharacter from '../../assets/playful/hero_character.png';
import { resolveDomain } from '../../lib/domainUtils';
import { getProblemById } from '../../data/problemStatementsCatalog';
import { getTeamSelection, fetchAllProblemSelections } from '../../lib/problemStatementsService';

export default function TicketTab({ 
  hasTeam, 
  teamData, 
  teamMembers, 
  submissions,
  user, 
  setActiveTab 
}) {
  const ticketRef = useRef(null);

  // Retrieve payment state
  let paymentRecord = null;
  try {
    if (user?.id) {
      const cached = localStorage.getItem(`haxlr8_payment_${user.id}`);
      if (cached) paymentRecord = JSON.parse(cached);
    }
  } catch (e) {}

  if (!paymentRecord && (teamData?.payment_status === 'submitted' || teamData?.payment_utr)) {
    paymentRecord = {
      transaction_id: teamData.payment_utr,
      amount: teamData.payment_amount || 1200,
      status: 'submitted',
      submitted_at: teamData.payment_date || new Date().toISOString()
    };
  }

  if (!paymentRecord && submissions && submissions.length > 0) {
    const paidSub = submissions.find(s => s.pdf_url || (s.project_description && s.project_description.includes('Registration fee')) || s.status === 'Shortlisted');
    if (paidSub) {
      const utrMatch = paidSub.project_description?.match(/UTR:\s*([A-Za-z0-9_-]+)/i);
      paymentRecord = {
        transaction_id: utrMatch ? utrMatch[1] : (paidSub.pdf_url ? 'VERIFIED' : 'VERIFIED'),
        amount: 1200,
        status: 'submitted',
        submitted_at: paidSub.updated_at || paidSub.created_at || new Date().toISOString()
      };
      try {
        if (user?.id) {
          localStorage.setItem(`haxlr8_payment_${user.id}`, JSON.stringify(paymentRecord));
        }
      } catch (e) {}
    }
  }

  const isVerified = Boolean(paymentRecord?.transaction_id || teamData?.payment_status === 'submitted' || teamData?.payment_utr);

  // Authoritative Leader & Crew Resolution
  const leader = teamMembers?.find(m => m.is_leader) || 
                 teamMembers?.find(m => m.id === teamData?.leader_id) || 
                 teamMembers?.[0] || 
                 { full_name: user?.user_metadata?.full_name || 'Team Leader', email: user?.email };

  const crew = teamMembers?.filter(m => !m.is_leader && m.id !== leader?.id && m.email !== leader?.email) || [];
  const domain = resolveDomain(teamData, submissions?.[0], user, 'Healthcare');

  // ─── RESOLVE LOCKED PROBLEM STATEMENT ──────────────────────────────────────
  const [lockedProblem, setLockedProblem] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(true);

  useEffect(() => {
    let active = true;

    const resolveLock = async () => {
      setLoadingProblem(true);
      try {
        // 1. Try local cache
        const local = getTeamSelection(teamData?.id, user?.email);
        if (local && (local.problem_statement_id || local.id)) {
          const pid = local.problem_statement_id || local.id;
          const full = getProblemById(pid);
          if (active) {
            setLockedProblem({
              id: pid,
              problem_statement_id: pid,
              num: local.num || full?.num || 1,
              title: local.title || local.problem_statement_title || full?.title || 'Selected Challenge',
              domain: local.domain || full?.domain || domain,
              description: full?.description || ''
            });
            setLoadingProblem(false);
            return;
          }
        }

        // 2. Try parsing submissions
        const sub = submissions?.[0];
        if (sub?.evaluation_notes) {
          try {
            const parsed = typeof sub.evaluation_notes === 'string' ? JSON.parse(sub.evaluation_notes) : sub.evaluation_notes;
            const p = parsed?.problem_statement || parsed;
            if (p?.id || p?.problem_statement_id) {
              const pid = p.id || p.problem_statement_id;
              const full = getProblemById(pid);
              if (active) {
                setLockedProblem({
                  id: pid,
                  problem_statement_id: pid,
                  num: p.num || full?.num || 1,
                  title: p.title || p.problem_statement_title || full?.title || 'Selected Challenge',
                  domain: p.domain || full?.domain || domain,
                  description: full?.description || ''
                });
                setLoadingProblem(false);
                return;
              }
            }
          } catch(e) {}
        }

        // 3. Fallback cloud fetch
        const allSelections = await fetchAllProblemSelections();
        const found = allSelections.find(s => 
          (teamData?.id && s.team_id === teamData.id) ||
          (user?.email && s.leader_email?.toLowerCase() === user.email.toLowerCase())
        );
        if (found && (found.problem_statement_id || found.id) && active) {
          const pid = found.problem_statement_id || found.id;
          const full = getProblemById(pid);
          setLockedProblem({
            id: pid,
            problem_statement_id: pid,
            num: found.problem_statement_num || full?.num || 1,
            title: found.problem_statement_title || full?.title || 'Selected Challenge',
            domain: found.domain || full?.domain || domain,
            description: full?.description || ''
          });
        }
      } catch (err) {
        console.warn('Error fetching locked problem in ticket:', err);
      } finally {
        if (active) setLoadingProblem(false);
      }
    };

    resolveLock();
    return () => { active = false; };
  }, [teamData, submissions, user, domain]);

  const handlePrint = () => {
    window.print();
  };

  const domainBadge = domain === 'Agriculture'
    ? { icon: '🌾', label: 'Agriculture', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' }
    : domain === 'Smart City'
    ? { icon: '🏙️', label: 'Smart City', color: '#0284c7', bg: '#e0f2fe', border: '#7dd3fc' }
    : { icon: '🩺', label: 'Healthcare', color: '#e11d48', bg: '#fff1f2', border: '#fecdd3' };

  const barcodeId = `TKT-${(lockedProblem?.problem_statement_id || 'HX3').replace(/[^a-zA-Z0-9]/g, '')}-${(teamData?.team_name || 'SQUAD').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}-2026`;

  return (
    <div className="ticket-page-container" style={{ maxWidth: 960, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 24, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* If No Team */}
      {!hasTeam && (
        <div style={{
          background: '#ffffff',
          borderRadius: 22,
          padding: '40px 24px',
          border: '2px solid #fed7aa',
          textAlign: 'center',
          boxShadow: '0 6px 20px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <AmongUsCrewmate color="orange" size={60} speechText="Squad not found!" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
            No Squad Manifest Registered
          </h2>
          <p style={{ fontSize: 13.5, color: '#64748b', maxWidth: 440, margin: '0 auto 24px', lineHeight: 1.5 }}>
            You need to assemble your crew and select your challenge domain before generating your official Flight Ticket &amp; Boarding Pass.
          </p>
          <button
            onClick={() => { if (setActiveTab) setActiveTab('team'); }}
            style={{
              padding: '12px 28px',
              borderRadius: 12,
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            Create Squad in "My Team" →
          </button>
        </div>
      )}

      {/* If Team Exists but Payment Not Yet Submitted */}
      {hasTeam && !isVerified && (
        <div style={{
          background: '#ffffff',
          borderRadius: 22,
          padding: '36px 24px',
          border: '2px solid #fed7aa',
          textAlign: 'center',
          boxShadow: '0 6px 20px rgba(0,0,0,0.04)'
        }}>
          <div style={{ width: 60, height: 60, borderRadius: 20, background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 16px', border: '1.5px solid #fde68a' }}>
            🔒
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
            Flight Ticket Locked (Payment Verification Required)
          </h2>
          <p style={{ fontSize: 13.5, color: '#64748b', maxWidth: 500, margin: '0 auto 20px', lineHeight: 1.5 }}>
            Your squad <strong>"{teamData?.team_name}"</strong> is registered! To unlock your verified Official Flight Ticket &amp; Mission Boarding Pass, please complete the ₹1,200 team fee in the Payment tab.
          </p>

          <div style={{ display: 'inline-flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => { if (setActiveTab) setActiveTab('payment'); }}
              style={{
                padding: '13px 26px',
                borderRadius: 12,
                background: '#ea580c',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)'
              }}
            >
              Go to Payment &amp; Verification (₹1,200) →
            </button>
          </div>
        </div>
      )}

      {/* When Verified: Official Hackathon Flight Ticket & Boarding Pass */}
      {hasTeam && isVerified && (
        <>
          {/* Action Bar (Print Only) - Hidden when printing */}
          <div className="ticket-action-bar" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            background: '#ffffff',
            padding: '16px 24px',
            borderRadius: 18,
            border: '2px solid #bbf7d0',
            boxShadow: '0 4px 14px rgba(22, 163, 74, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#14532d', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>Official Flight Ticket &amp; Boarding Pass (Cleared for Launch)</span>
                  <span style={{ fontSize: 11, fontWeight: 800, background: '#16a34a', color: '#ffffff', padding: '2px 8px', borderRadius: 8 }}>
                    VERIFIED
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: '#166534', fontWeight: 600, marginTop: 2 }}>
                  Print this official Flight Ticket or save the PDF. All squad members must present this pass along with original college IDs at the MIT Mysore check-in desk.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={handlePrint}
                style={{
                  padding: '11px 24px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontSize: 13.5,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <Printer size={17} />
                <span>Print / Download Flight Ticket (PDF)</span>
              </button>
            </div>
          </div>

          {/* ════ THE OFFICIAL FLIGHT TICKET / BOARDING PASS ════ */}
          <div ref={ticketRef} className="official-ticket-card" style={{
            background: '#ffffff',
            borderRadius: 24,
            border: '2.5px solid #0f172a',
            boxShadow: '0 16px 50px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            
            {/* ══ HEADER RIBBON WITH 3 OFFICIAL LOGOS ══ */}
            <div style={{
              background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 60%, #0f172a 100%)',
              color: '#ffffff',
              padding: '24px 30px',
              borderBottom: '4px solid #ea580c'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                
                {/* College Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: '#ffffff', padding: '6px 10px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={mitLogo} alt="MIT Mysore" style={{ height: 46, width: 'auto', objectFit: 'contain' }} />
                  </div>
                </div>

                {/* Center Among Us Mascot & Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'center' }}>
                  <img src={heroCharacter} alt="Among Us Pilot" style={{ height: 56, width: 'auto', objectFit: 'contain' }} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 10, fontWeight: 900, background: '#ea580c', color: '#ffffff', padding: '2px 8px', borderRadius: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        MISSION BOARDING PASS
                      </span>
                      <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 800 }}>
                        HAXLR8 3.0 &bull; GRAND FINALE
                      </span>
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                      HAXLR8 3.0 &bull; OFFICIAL FLIGHT TICKET
                    </h1>
                    <div style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600, marginTop: 2 }}>
                      National Level 24-Hour Hackathon &bull; Maharaja Institute of Technology Mysore
                    </div>
                  </div>
                </div>

                {/* Department / EMITERS Seal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ background: '#ffffff', padding: 4, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={emitersSeal} alt="EMITERS ECE" style={{ height: 46, width: 46, borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                </div>
              </div>

              {/* Department Subtitle Banner */}
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.15)', textAlign: 'center', fontSize: 11.5, color: '#e2e8f0', fontWeight: 600 }}>
                Department of Electronics &amp; Communication Engineering &bull; Maharaja Institute of Technology Mysore
              </div>
            </div>

            {/* ══ AVIATION TELEMETRY STRIP ══ */}
            <div style={{
              background: '#f8fafc',
              borderBottom: '2px dashed #cbd5e1',
              padding: '14px 28px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 12
            }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>FLIGHT NO</span>
                <strong style={{ fontSize: 16, fontWeight: 900, color: '#ea580c', fontFamily: 'monospace' }}>HX-3026</strong>
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>GATE</span>
                <strong style={{ fontSize: 13.5, fontWeight: 900, color: '#0f172a' }}>GATE 01 &bull; CIVIL HALL</strong>
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>DATE</span>
                <strong style={{ fontSize: 13.5, fontWeight: 900, color: '#0f172a' }}>NOV 06, 2026</strong>
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>BOARDING TIME</span>
                <strong style={{ fontSize: 13.5, fontWeight: 900, color: '#16a34a' }}>08:30 AM IST</strong>
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>MISSION PASS</span>
                <strong style={{ fontSize: 13, fontWeight: 900, color: '#0284c7' }}>24H OFFLINE SPRINT</strong>
              </div>
            </div>

            {/* ══ TICKET BODY ══ */}
            <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
              
              {/* Squad Name & Domain Banner */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                padding: '18px 22px',
                background: '#fff7ed',
                borderRadius: 16,
                border: '1.5px solid #fed7aa'
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    SQUAD / TEAM NAME
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginTop: 2 }}>
                    {teamData?.team_name || 'Innovators'}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: 600 }}>
                    Flight Captain: <strong style="color: #0f172a;">{leader?.full_name}</strong>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    INNOVATION DOMAIN
                  </div>
                  <span style={{
                    display: 'inline-block',
                    marginTop: 4,
                    fontSize: 13.5,
                    fontWeight: 800,
                    color: domainBadge.color,
                    background: domainBadge.bg,
                    padding: '5px 14px',
                    borderRadius: 100,
                    border: `1.5px solid ${domainBadge.border}`
                  }}>
                    {domainBadge.icon} {domainBadge.label}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    FEE PAID STATUS
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#15803d', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={16} /> ₹1,200 (Verified / Paid)
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    UTR: {paymentRecord?.transaction_id || 'VERIFIED'}
                  </div>
                </div>
              </div>

              {/* ══ LOCKED PROBLEM STATEMENT (CRITICAL REQUIREMENT) ══ */}
              <div style={{
                background: lockedProblem ? '#f0fdf4' : '#fffbeb',
                border: `2px solid ${lockedProblem ? '#86efac' : '#fde68a'}`,
                borderRadius: 18,
                padding: '20px 22px',
                boxShadow: lockedProblem ? '0 4px 14px rgba(22, 163, 74, 0.08)' : 'none'
              }}>
                {loadingProblem ? (
                  <div style={{ fontSize: 13, color: '#64748b', fontWeight: 700 }}>
                    Loading locked problem statement challenge...
                  </div>
                ) : lockedProblem ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          background: '#15803d',
                          color: '#ffffff',
                          fontSize: 12,
                          fontWeight: 900,
                          padding: '3px 10px',
                          borderRadius: 6,
                          letterSpacing: '0.04em'
                        }}>
                          {lockedProblem.problem_statement_id || lockedProblem.id}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 900, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          OFFICIALLY LOCKED CHALLENGE &bull; #{lockedProblem.num || 1} ({lockedProblem.domain})
                        </span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 8 }}>
                        ✓ Quota Locked (1/3 Max Squads)
                      </span>
                    </div>

                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', lineHeight: 1.4, marginTop: 6 }}>
                      {lockedProblem.title}
                    </div>

                    {lockedProblem.description && (
                      <div style={{ fontSize: 12.5, color: '#475569', marginTop: 6, lineHeight: 1.5 }}>
                        {lockedProblem.description.slice(0, 240)}...
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#b45309', fontWeight: 800, fontSize: 13 }}>
                        <AlertCircle size={16} />
                        <span>Problem Statement Selection Pending</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#78350f', marginTop: 2 }}>
                        Your Flight Captain has not officially confirmed your squad's problem statement yet.
                      </div>
                    </div>
                    <button
                      onClick={() => { if (setActiveTab) setActiveTab('problem-statements'); }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 10,
                        background: '#ea580c',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: 12.5,
                        cursor: 'pointer'
                      }}
                    >
                      Lock Challenge in Problem Statements →
                    </button>
                  </div>
                )}
              </div>

              {/* ══ VENUE & REPORTING LOCATION (PROMINENT REQUIREMENT) ══ */}
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: 18,
                padding: '18px 22px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: '#fee2e2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    flexShrink: 0
                  }}>
                    📍
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      OFFICIAL REPORTING VENUE &amp; LOCATION
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', marginTop: 2 }}>
                      Maharaja Institute of Technology Mysore (MIT Mysore)
                    </div>
                    <div style={{ fontSize: 13, color: '#334155', marginTop: 3, fontWeight: 600 }}>
                      Belawadi, PB No. 28, Srirangapatna Taluk, Mandya / Mysuru, Karnataka - 571477
                    </div>
                    <div style={{ fontSize: 12.5, color: '#0284c7', marginTop: 4, fontWeight: 700 }}>
                      🏛️ Check-in Desk: Civil Seminar Hall (Ground Floor) &bull; Department of Electronics &amp; Communication Engineering
                    </div>
                  </div>
                </div>
              </div>

              {/* ══ AUTHORIZED CREW ROSTER & TEAMMATES ══ */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', marginBottom: 12 }}>
                  <Users size={16} color="#ea580c" />
                  <span>Authorized Crew Manifest ({teamMembers?.length || 1} Registered Passengers)</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                  {/* Captain */}
                  <div style={{
                    padding: '14px 16px',
                    background: '#eff6ff',
                    borderRadius: 14,
                    border: '1.5px solid #bfdbfe',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#dbeafe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>
                          {leader?.full_name ? leader.full_name[0].toUpperCase() : '👑'}
                        </div>
                        <strong style={{ color: '#0f172a', fontSize: 14.5 }}>{leader?.full_name}</strong>
                      </div>
                      <span style={{ fontSize: 10.5, fontWeight: 900, color: '#0284c7', background: '#dbeafe', padding: '2px 8px', borderRadius: 6 }}>
                        FLIGHT CAPTAIN
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Phone size={13} color="#0284c7" />
                      <span>{leader?.phone_number || leader?.phone || 'Contact provided on manifest'}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>
                      {leader?.college_name || 'Undergraduate'} &bull; {leader?.dept || 'Engineering'}{leader?.reg_no ? ` &bull; USN: ${leader.reg_no}` : ''}
                    </div>
                  </div>

                  {/* Crewmates */}
                  {crew.map((cm, idx) => (
                    <div key={cm.id || idx} style={{
                      padding: '14px 16px',
                      background: '#f8fafc',
                      borderRadius: 14,
                      border: '1.5px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>
                            {cm?.full_name ? cm.full_name[0].toUpperCase() : (idx + 1)}
                          </div>
                          <strong style={{ color: '#0f172a', fontSize: 14 }}>{cm.full_name}</strong>
                        </div>
                        <span style={{ fontSize: 10.5, fontWeight: 800, color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: 6 }}>
                          CREWMATE {idx + 1}
                        </span>
                      </div>
                      <div style={{ fontSize: 12.5, color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={13} color="#64748b" />
                        <span>{cm.phone_number || cm.phone || 'Contact provided on manifest'}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748b' }}>
                        {cm.college_name || 'Undergraduate'} &bull; {cm.dept || 'Engineering'}{cm.reg_no ? ` &bull; USN: ${cm.reg_no}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ══ MANDATORY PROTOCOL ══ */}
              <div style={{
                background: '#f1f5f9',
                borderLeft: '4px solid #ea580c',
                borderRadius: 12,
                padding: '14px 18px',
                fontSize: 12.5,
                lineHeight: 1.6,
                color: '#334155'
              }}>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: 4, fontSize: 13 }}>
                  ⚠️ Mandatory Check-in Protocol:
                </strong>
                <div>&bull; <strong>Print this Flight Ticket:</strong> Bring a physical printout or saved PDF to the registration desk.</div>
                <div>&bull; <strong>Original College Student ID Card:</strong> All members must present valid physical college ID cards for campus entry.</div>
                <div>&bull; <strong>Hardware / Tech:</strong> Bring your laptops, power cords, and multi-plugs. (Hardware prototypes are completely optional; software and AI projects are fully eligible).</div>
                <div>&bull; <strong>Direct Entry Pass:</strong> No screening elimination; your 24-hour hackathon starts immediately on November 6th.</div>
              </div>

              {/* ══ STUDENT COORDINATORS SUPPORT ══ */}
              <div style={{
                padding: '16px 20px',
                background: '#f0f9ff',
                borderRadius: 16,
                border: '1.5px solid #bae6fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    STUDENT COORDINATORS SUPPORT
                  </div>
                  <div style={{ fontSize: 12.5, color: '#334155', fontWeight: 600, marginTop: 2 }}>
                    For campus arrival queries or registration desk directions:
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                      <Phone size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Yashwanth H B</div>
                      <a href="tel:8050614849" style={{ fontSize: 12, fontWeight: 700, color: '#0284c7', textDecoration: 'none' }}>
                        8050614849
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                      <Phone size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Chethan Kumar B</div>
                      <a href="tel:9945507099" style={{ fontSize: 12, fontWeight: 700, color: '#0284c7', textDecoration: 'none' }}>
                        99455 07099
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* ══ AIRLINE BARCODE STUB ══ */}
              <div style={{
                marginTop: 6,
                paddingTop: 16,
                borderTop: '2px dashed #cbd5e1',
                textAlign: 'center'
              }}>
                <div style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: 26,
                  letterSpacing: 5,
                  color: '#0f172a',
                  fontWeight: 900,
                  lineHeight: 1
                }}>
                  ||||| ||| |||||| ||||| ||||||| |||| ||||| |||||| |||
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 800, color: '#64748b', marginTop: 6, letterSpacing: '0.08em' }}>
                  {barcodeId} &bull; UTR: {paymentRecord?.transaction_id || 'VERIFIED'}
                </div>
              </div>

            </div>

            {/* Ticket Footer Strip */}
            <div style={{
              background: '#0f172a',
              padding: '14px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 11.5,
              color: '#94a3b8',
              fontWeight: 600,
              flexWrap: 'wrap',
              gap: 8
            }}>
              <div style={{ color: '#cbd5e1' }}>
                🚀 HAXLR8 3.0 Space Flight Command &bull; Direct Entry Pass
              </div>
              <div style={{ color: '#fb923c', fontWeight: 800 }}>
                Bring printed pass or PDF to MIT Mysore Check-in Desk
              </div>
            </div>

          </div>
        </>
      )}

      {/* Print-specific style: Fits on a single clean page without sidebars */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .official-ticket-card, .official-ticket-card * {
            visibility: visible;
          }
          .official-ticket-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            box-shadow: none !important;
            border: 2px solid #000 !important;
          }
          .ticket-action-bar, .dash-sidebar, .dash-header, .dash-bottom-nav {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
}
