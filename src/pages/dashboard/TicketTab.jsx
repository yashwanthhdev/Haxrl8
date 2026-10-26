import React, { useRef } from 'react';
import { 
  Printer, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Phone,
  Ticket as TicketIcon
} from 'lucide-react';
import AmongUsCrewmate from '../../components/amongus/AmongUsCrewmate';
import emitersSeal from '../../assets/logo/emiters-seal.png';
import mitLogo from '../../assets/logo/mit-mysore-logo.png';
import { resolveDomain } from '../../lib/domainUtils';

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

  const handlePrint = () => {
    window.print();
  };

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
            You need to assemble your crew and select your challenge domain before generating your official Payment &amp; Registration Receipt.
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
            Payment Receipt Locked (Payment Verification Required)
          </h2>
          <p style={{ fontSize: 13.5, color: '#64748b', maxWidth: 500, margin: '0 auto 20px', lineHeight: 1.5 }}>
            Your squad <strong>"{teamData?.team_name}"</strong> is registered! To unlock your verified Payment &amp; Registration Receipt, please complete the ₹1,200 team fee in the Payment tab.
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

      {/* When Verified: Official Hackathon Pass */}
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
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#14532d' }}>
                  Official Payment &amp; Registration Receipt (Verified)
                </div>
                <div style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>
                  Present this verified payment receipt or printout at MIT Mysore registration desk. (Official Flight Passes will be issued on November 2nd).
                </div>
              </div>
            </div>

            <button
              onClick={handlePrint}
              style={{
                padding: '10px 22px',
                borderRadius: 10,
                border: 'none',
                background: '#0284c7',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 3px 10px rgba(2, 132, 199, 0.25)'
              }}
            >
              <Printer size={16} />
              <span>Print / Save Receipt (PDF)</span>
            </button>
          </div>

          {/* ════ THE OFFICIAL PAYMENT RECEIPT CARD (SINGLE PAGE, NO SCANNERS) ════ */}
          <div ref={ticketRef} className="official-ticket-card" style={{
            background: '#ffffff',
            borderRadius: 24,
            border: '2px solid #fed7aa',
            boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
            overflow: 'hidden'
          }}>
            
            {/* Ticket Header Ribbon */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              padding: '24px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              borderBottom: '4px solid #ea580c'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 900, background: '#ea580c', color: '#ffffff', padding: '3px 8px', borderRadius: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    PAYMENT &amp; REGISTRATION RECEIPT
                  </span>
                  <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>
                    NATIONAL LEVEL 24-HOUR HACKATHON
                  </span>
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                  HAXLR8 3.0 · VERIFIED REGISTRATION &amp; FEE RECEIPT
                </h1>
                <p style={{ fontSize: 12.5, color: '#cbd5e1', margin: '4px 0 0', fontWeight: 600 }}>
                  Department of Electronics &amp; Communication Engineering · Maharaja Institute of Technology Mysore
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img src={mitLogo} alt="MIT Mysore" style={{ height: 42, width: 'auto', objectFit: 'contain' }} />
                <div style={{ height: 32, width: 1, background: 'rgba(255,255,255,0.2)' }} />
                <img src={emitersSeal} alt="EMITERS" style={{ height: 38, width: 38, borderRadius: '50%' }} />
              </div>
            </div>

            {/* Ticket Body: Single Unified Clean Page */}
            <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
              
              {/* Squad & Payment Status Banner */}
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
                    TEAM NAME
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginTop: 2 }}>
                    {teamData?.team_name || 'Innovators'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    DOMAIN
                  </div>
                  <span style={{
                    display: 'inline-block',
                    marginTop: 4,
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#0369a1',
                    background: '#e0f2fe',
                    padding: '4px 12px',
                    borderRadius: 100,
                    border: '1px solid #7dd3fc'
                  }}>
                    {domain === 'Agriculture' && '🌾 Agriculture'}
                    {domain === 'Healthcare' && '🏥 Healthcare'}
                    {domain === 'Smart City' && '🏙️ Smart City'}
                    {!['Agriculture', 'Healthcare', 'Smart City'].includes(domain) && domain}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    FEE PAID STATUS
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#15803d', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={16} /> ₹1,200 (Verified / Paid)
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    TRANSACTION ID (UTR)
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', marginTop: 4, wordBreak: 'break-all' }}>
                    {paymentRecord?.transaction_id || 'VERIFIED'}
                  </div>
                </div>
              </div>

              {/* Event Schedule & Reporting Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    <Calendar size={14} color="#ea580c" />
                    <span>Hackathon Dates</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>
                    November 6–7, 2026
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>24-Hour Offline Sprint</div>
                </div>

                <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    <Clock size={14} color="#ea580c" />
                    <span>Reporting Time</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>
                    08:30 AM IST (Nov 6)
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>Badge Pick-up &amp; Check-in</div>
                </div>

                <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    <MapPin size={14} color="#ea580c" />
                    <span>Venue Location</span>
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                    Maharaja Institute of Technology Mysore
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    Belawadi, PB No. 28, Srirangapatna Taluk, Mandya / Mysuru, Karnataka - 571477
                  </div>
                </div>
              </div>

              {/* Authorized Crew Roster with Phone Numbers */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', marginBottom: 12 }}>
                  <Users size={16} />
                  <span>Authorized Crew Roster &amp; Contact Numbers ({teamMembers?.length || 1} Members)</span>
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
                        {leader?.id_card_front_url ? (
                          <img src={leader.id_card_front_url} alt={leader.full_name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (leader?.email?.toLowerCase() === user?.email?.toLowerCase() && (user?.user_metadata?.avatar_url || user?.user_metadata?.picture)) ? (
                          <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt={leader.full_name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#dbeafe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>
                            {leader?.full_name ? leader.full_name[0].toUpperCase() : '👑'}
                          </div>
                        )}
                        <strong style={{ color: '#0f172a', fontSize: 14.5 }}>{leader?.full_name}</strong>
                      </div>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: '#0284c7', background: '#dbeafe', padding: '2px 8px', borderRadius: 6 }}>
                        TEAM LEAD
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Phone size={13} color="#0284c7" />
                      <span>{leader?.phone_number || leader?.phone || 'Contact provided on manifest'}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>
                      {leader?.college_name || 'Undergraduate'} · {leader?.dept || 'Engineering'}{leader?.reg_no ? ` · USN: ${leader.reg_no}` : ''}
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
                          {cm?.id_card_front_url ? (
                            <img src={cm.id_card_front_url} alt={cm.full_name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (cm?.email?.toLowerCase() === user?.email?.toLowerCase() && (user?.user_metadata?.avatar_url || user?.user_metadata?.picture)) ? (
                            <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt={cm.full_name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>
                              {cm?.full_name ? cm.full_name[0].toUpperCase() : (idx + 1)}
                            </div>
                          )}
                          <strong style={{ color: '#0f172a', fontSize: 14 }}>{cm.full_name}</strong>
                        </div>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: 6 }}>
                          MEMBER {idx + 1}
                        </span>
                      </div>
                      <div style={{ fontSize: 12.5, color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={13} color="#64748b" />
                        <span>{cm.phone_number || cm.phone || 'Contact provided on manifest'}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748b' }}>
                        {cm.college_name || 'Undergraduate'} · {cm.dept || 'Engineering'}{cm.reg_no ? ` · USN: ${cm.reg_no}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Coordinators Support Card */}
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
                    For registration desk assistance or campus arrival queries:
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

            </div>

            {/* Ticket Footer Strip */}
            <div style={{
              background: '#f8fafc',
              borderTop: '1.5px solid #f1e7db',
              padding: '14px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 11.5,
              color: '#64748b',
              fontWeight: 600,
              flexWrap: 'wrap',
              gap: 8
            }}>
              <div>
                ⚠️ Mandatory: Carry Original College Student ID &amp; Laptop. (Hardware is completely optional; projects can be pure software, core systems, or hardware).
              </div>
              <div style={{ color: '#ea580c', fontWeight: 800 }}>
                Direct Entry — No Round 1 / Round 2 Screening Required
              </div>
            </div>

          </div>
        </>
      )}

      {/* Print-specific style: Fits on a single clean page */}
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
