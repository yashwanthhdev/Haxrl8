import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Download, ExternalLink, Lock, Sparkles, BookOpen, 
  Calendar, CheckCircle, AlertTriangle, ShieldCheck, Clock, 
  Info, FileDown, Layers, ChevronRight, Eye, FileCheck
} from 'lucide-react';
import { fetchDocuments, getLocalDocuments, getOfficialRulebook, subscribeToDocuments } from '../../lib/documentsService';
import { AmongUsKingCharacter } from '../../components/amongus/AmongUsCrewmate';

const QUICK_LINKS = [
  { 
    icon: '💳', 
    label: 'Payment Google Form', 
    desc: 'Official Google Form link for ₹1,200 fee & UTR submission', 
    tag: 'G-FORM', 
    href: 'https://forms.gle/pw945ievXT9bH1wV7', 
    target: '_blank', 
    color: '#ff3b69', 
    bg: '#fef2f2', 
    border: '#fecaca' 
  },
  { 
    icon: '👑', 
    label: 'Leader vs. Impostor Protocol', 
    desc: 'Official team manifest rules & registration role guide', 
    tag: 'GUIDE', 
    href: '#leader-protocol', 
    color: '#9333ea', 
    bg: '#fdf4ff', 
    border: '#f5d0fe' 
  },
  { 
    icon: '🏆', 
    label: 'Prize Bounty Breakdown', 
    desc: 'Learn about the ₹40,000 cash prizes & track awards', 
    tag: 'AWARDS', 
    href: '/prizes', 
    color: '#16a34a', 
    bg: '#f0fdf4', 
    border: '#bbf7d0' 
  },
];

const FAQS = [
  {
    q: "Are registrations still open?",
    a: (
      <>
        Public registrations for HAXLR8 3.0 are officially closed as all squad slots have been filled. Team leaders and crew members can view their squad roster in the My Team tab and check flight passes in the Passes tab.
      </>
    ),
  },
  {
    q: "Who can participate in HAXLR8 3.0?",
    a: "The hackathon is open to undergraduate students from any recognized college or university across India. Inter-college teams are officially permitted.",
  },
  {
    q: "How many team members do I need?",
    a: "Each team must consist of 3 to 4 members. Solo participation or 2-member teams are strictly not permitted.",
  },
  {
    q: "Can team members be from different colleges?",
    a: "Yes! Inter-college teams are permitted. Undergraduate students from any college or university are allowed to collaborate and form teams for HAXLR8 3.0.",
  },
  {
    q: "Is there a registration fee?",
    a: "Yes, the registration fee is ₹1,200 per team (for 3 to 4 members). It covers complete 24-hour hackathon entry, Wi-Fi, mentorship, catering, meals, and official certificates.",
  },
  {
    q: "What should I bring to HAXLR8 3.0 at MIT Mysore?",
    a: "Please bring your laptop, charger, student ID card, and enthusiasm! Hardware is completely optional—bring physical components only if your chosen solution requires them. Refreshments, high-speed Wi-Fi, power extensions, and workspace are fully provided at Maharaja Institute of Technology Mysore.",
  },
  {
    q: "Is hardware compulsory for our project?",
    a: "No, hardware is completely optional! Hardware is never compulsory for any domain. You have 100% freedom to identify the right real-world problem and engineer the most effective solution—whether at the core level (embedded firmware, protocols, system architecture, simulation) or at the software level (full-stack web/mobile apps, AI/ML models, computer vision, data pipelines, or cloud services). What matters is bringing an authentic, unique, and well-executed solution.",
  },
  {
    q: "Will the hackathon be in person or online?",
    a: "HAXLR8 3.0 is a 100% in-person 24-hour Grand Hackathon hosted at Maharaja Institute of Technology Mysore on November 6–7, 2026. There are no screening or elimination rounds—all registered teams advance directly!",
  },
];

const STATUS_STYLE = {
  done:     { dot: '#16a34a', line: '#16a34a', label: 'Completed',   labelColor: '#16a34a', labelBg: '#dcfce7' },
  active:   { dot: '#ff3b69', line: '#fed7aa', label: 'In Progress', labelColor: '#ff3b69', labelBg: '#ffe4e6' },
  upcoming: { dot: '#cbd5e1', line: '#e2e8f0', label: 'Upcoming',   labelColor: '#64748b', labelBg: '#f1f5f9' },
};

export default function ResourcesTab({ hasTeam, submissions }) {
  const [documents, setDocuments] = useState(getLocalDocuments());
  const rulebookDoc = getOfficialRulebook(documents);
  const [openFaq, setOpenFaq] = useState(null);
  const [showRulebook, setShowRulebook] = useState(false);
  const [showProtocol, setShowProtocol] = useState(false);
  const [lockedModalDoc, setLockedModalDoc] = useState(null);

  // Sync documents from cloud and react to admin uploads in real-time
  useEffect(() => {
    let isMounted = true;
    const loadDocs = async () => {
      try {
        const cloudDocs = await fetchDocuments();
        if (isMounted && cloudDocs && cloudDocs.length > 0) {
          setDocuments(cloudDocs);
        }
      } catch (e) {
        console.warn('Doc fetch notice:', e);
      }
    };
    loadDocs();

    const handleUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setDocuments(e.detail);
      }
    };
    window.addEventListener('haxlr8_documents_updated', handleUpdate);

    // Supabase real-time cloud subscription
    const unsubscribe = subscribeToDocuments((newDocs) => {
      if (isMounted && newDocs && Array.isArray(newDocs)) {
        setDocuments(newDocs);
      }
    });

    return () => {
      isMounted = false;
      window.removeEventListener('haxlr8_documents_updated', handleUpdate);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (showRulebook || showProtocol || lockedModalDoc) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showRulebook, showProtocol, lockedModalDoc]);

  const EVENTS = [
    { date: 'Oct 09', event: 'Registration Opens', status: 'done', desc: 'Team registration opens for undergraduate students across India.', time: 'All day' },
    { date: 'Closed', event: 'Registration Closed', status: 'done', desc: 'Squad registrations are officially closed as capacity is reached.', time: 'Complete' },
    { date: 'Nov 03', event: 'Problem Statements & Pass Clearance', status: hasTeam ? 'active' : 'upcoming', desc: 'Official problem statements reveal & hackathon flight pass clearance.', time: '12:00 PM IST' },
    { date: 'Nov 06–07', event: 'Grand Finale at MIT Mysore', status: 'upcoming', desc: '24-hour offline hackathon sprint and prize ceremony at Maharaja Institute of Technology Mysore.', time: '08:30 AM IST' },
  ];

  const handleDocumentClick = (doc) => {
    if (doc.isLocked || doc.category === 'Problem Statements') {
      setLockedModalDoc(doc);
      return;
    }

    if (doc.fileUrl === '#rulebook-guide' || doc.category === 'Rulebook' && doc.fileUrl?.startsWith('#')) {
      setShowRulebook(true);
      return;
    }

    // Direct download or open URL
    if (doc.fileUrl && doc.fileUrl !== '#') {
      window.open(doc.fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── PARTICIPANTS DESK: OFFICIAL DOCUMENTS & DOWNLOADS ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0284c7' }} />
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                Participants Desk — Official Documents &amp; Downloads
              </h2>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#0369a1', background: '#e0f2fe', padding: '4px 12px', borderRadius: 20, border: '1px solid #bae6fd' }}>
            {documents.filter(d => d.id !== 'doc_pptx_template' && d.category !== 'Template' && d.fileType !== 'pptx').length} OFFICIAL ARTIFACTS AVAILABLE
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 18
        }}>
          {documents.filter(doc => doc.id !== 'doc_pptx_template' && doc.category !== 'Template' && doc.fileType !== 'pptx').map((doc) => {
            const isLock = doc.isLocked || doc.category === 'Problem Statements';
            const hasValidUrl = doc.fileUrl && doc.fileUrl !== '#' && !doc.fileUrl.startsWith('#') && doc.fileUrl.startsWith('http');
            const isRulebookWithoutPdf = doc.category === 'Rulebook' && !hasValidUrl;

            return (
              <div
                key={doc.id}
                style={{
                  background: '#ffffff',
                  borderRadius: 22,
                  padding: '22px',
                  border: `2px solid ${doc.border || '#fed7aa'}`,
                  boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.03)';
                }}
              >
                {/* Header tags */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: doc.color || '#ea580c',
                    background: doc.bg || '#fff7ed',
                    border: `1.5px solid ${doc.border || '#fed7aa'}`,
                    padding: '3px 10px',
                    borderRadius: 20,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase'
                  }}>
                    {doc.badge || doc.category}
                  </span>

                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: isLock ? '#b45309' : '#0284c7',
                    background: isLock ? '#fef3c7' : '#f0f9ff',
                    border: `1px solid ${isLock ? '#fde68a' : '#bae6fd'}`,
                    padding: '2px 8px',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    {isLock ? <Lock size={11} /> : <FileText size={11} />}
                    {doc.fileType?.toUpperCase() || 'PDF'}
                  </span>
                </div>

                {/* Title & Desc */}
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: 15.5,
                    fontWeight: 900,
                    color: '#0f172a',
                    margin: '0 0 6px',
                    lineHeight: 1.35
                  }}>
                    {doc.title}
                  </h3>
                  <p style={{
                    fontSize: 12.5,
                    color: '#64748b',
                    margin: 0,
                    lineHeight: 1.55
                  }}>
                    {doc.description}
                  </p>
                </div>

                {/* Metadata row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 10,
                  borderTop: '1px dashed #f1e7db',
                  fontSize: 11.5,
                  color: '#94a3b8',
                  fontWeight: 600
                }}>
                  <span>Size: <strong style={{ color: '#475569' }}>{doc.fileSize || 'Standard PDF'}</strong></span>
                  <span>{isLock ? 'Release: Nov 2' : hasValidUrl ? 'Verified CDN' : 'Pending Upload'}</span>
                </div>

                {/* Primary Action Button */}
                {isLock ? (
                  <button
                    onClick={() => setLockedModalDoc(doc)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 12,
                      background: '#fffbeb',
                      border: '1.5px solid #fde68a',
                      color: '#b45309',
                      fontWeight: 800,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef3c7'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fffbeb'}
                  >
                    <Lock size={14} /> Locked Until Nov 2nd (12:00 PM)
                  </button>
                ) : isRulebookWithoutPdf ? (
                  <button
                    onClick={() => setShowRulebook(true)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
                    }}
                  >
                    <Eye size={14} /> View Official Rulebook
                  </button>
                ) : hasValidUrl ? (
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(doc.fileUrl);
                        const blob = await response.blob();
                        const blobUrl = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = doc.fileName || `${doc.title}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(blobUrl);
                      } catch (err) {
                        // Fallback: open in new tab
                        window.open(doc.fileUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                      boxSizing: 'border-box'
                    }}
                  >
                    <Download size={14} /> Download {doc.category} (PDF)
                  </button>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 12,
                      background: '#f8fafc',
                      border: '1.5px solid #e2e8f0',
                      color: '#64748b',
                      fontWeight: 700,
                      fontSize: 12.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      boxSizing: 'border-box'
                    }}
                  >
                    ⏳ Official PDF will be uploaded by the organizing committee shortly.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MISSION QUICK GUIDES ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff3b69' }} />
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>
            Essential Mission Artifacts &amp; Protocols
          </h2>
        </div>

        <div className="dash-grid-resources" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
          {QUICK_LINKS.map((r, i) => (
            <a
              key={i}
              href={r.href}
              target={r.target || (r.href?.startsWith('http') ? '_blank' : undefined)}
              rel={r.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              onClick={(e) => {
                if (r.label === 'Leader vs. Impostor Protocol') {
                  e.preventDefault();
                  setShowProtocol(true);
                }
              }}
              style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <div 
                style={{ 
                  background: '#ffffff', 
                  borderRadius: 20, 
                  padding: '22px', 
                  border: `2px solid ${r.border}`, 
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 12, 
                  flex: 1,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 24px rgba(0,0,0,0.08)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.03)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 32 }}>{r.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: r.color, background: r.bg, border: `1px solid ${r.border}`, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {r.tag}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>{r.label}</div>
                  <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.5 }}>{r.desc}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── TIMELINE ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ea580c' }} />
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>
            Full Event Schedule &amp; Milestones
          </h2>
        </div>

        <div className="dash-card" style={{ background: '#ffffff', borderRadius: 22, padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '2px solid #fed7aa' }}>
          {EVENTS.map((ev, i) => {
            const s = STATUS_STYLE[ev.status];
            return (
              <div key={i} style={{ display: 'flex', gap: 18, paddingBottom: i < EVENTS.length - 1 ? 24 : 0, position: 'relative' }}>
                {i < EVENTS.length - 1 && (
                  <div style={{ position: 'absolute', left: 11, top: 24, width: 2, bottom: 0, background: '#f1e7db' }}>
                    <div style={{ width: '100%', height: EVENTS[i].status === 'done' ? '100%' : '0%', background: '#16a34a', transition: 'height 0.4s ease' }} />
                  </div>
                )}
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: s.dot, flexShrink: 0, zIndex: 1, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: ev.status === 'active' ? '0 0 10px rgba(255, 59, 105, 0.4)' : 'none' }}>
                  {ev.status === 'done' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{ev.event}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: s.labelColor, background: s.labelBg, padding: '2px 10px', borderRadius: 20, textTransform: 'uppercase' }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#ff3b69', fontWeight: 700, marginBottom: 4 }}>{ev.date} · {ev.time}</div>
                  <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{ev.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FAQ ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0284c7' }} />
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((f, i) => (
            <div key={i} style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #fed7aa', overflow: 'hidden' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
              >
                <span style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a' }}>{f.q}</span>
                <span style={{ fontSize: 18, color: '#ff3b69', flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontWeight: 900 }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 20px 18px', fontSize: 13.5, color: '#475569', lineHeight: 1.6, borderTop: '1px solid #f1e7db', paddingTop: 14 }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── LOCKED PROBLEM STATEMENTS MODAL ── */}
      <AnimatePresence>
        {lockedModalDoc && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: '#ffffff', border: '2px solid #fed7aa', borderRadius: 24, width: '100%', maxWidth: 540, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1.5px solid #f1e7db', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fffbeb' }}>
                <div style={{ fontSize: 17, fontWeight: 900, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🔒</span> Problem Statements Lock Protocol
                </div>
                <button onClick={() => setLockedModalDoc(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                <div style={{ background: '#fef3c7', border: '1.5px solid #fde68a', borderRadius: 16, padding: '16px' }}>
                  <div style={{ fontWeight: 800, color: '#92400e', marginBottom: 4 }}>
                    Official Reveal Date: November 2nd, 2026 (12:00 PM IST)
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#b45309' }}>
                    To ensure 100% fair play and prevent pre-built codebases, problem statements for all domains (Agriculture, Healthcare, and Smart City) are locked until November 2nd.
                  </p>
                </div>
                <p style={{ margin: 0 }}>
                  Once the problem statements unlock, your team will select and finalize its mission statement right here from the Participant Desk.
                </p>
                <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🎫</span>
                  <div style={{ fontSize: 12.5, color: '#166534', fontWeight: 700 }}>
                    Official Hackathon Flight Passes will be issued to confirmed squads along with problem assignment on November 2nd.
                  </div>
                </div>
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1.5px solid #f1e7db', display: 'flex', justifyContent: 'flex-end', background: '#fafafa' }}>
                <button onClick={() => setLockedModalDoc(null)} style={{ padding: '10px 22px', borderRadius: 12, background: '#ea580c', color: '#fff', border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── RULEBOOK MODAL ── */}
      <AnimatePresence>
        {showRulebook && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: '#ffffff', border: '2px solid #fed7aa', borderRadius: 24, width: '100%', maxWidth: 640, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1.5px solid #f1e7db', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fffaf3' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>📜 HAXLR8 3.0 Official Rulebook</div>
                <button onClick={() => setShowRulebook(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '70vh', overflowY: 'auto', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                <h4 style={{ color: '#0f172a', fontWeight: 900, margin: '0 0 6px' }}>1. Team Composition &amp; Eligibility</h4>
                <p>Squads must consist of 3 to 4 undergraduate students. Inter-college and inter-branch teams are 100% permitted. All participants must carry official college identity cards to Maharaja Institute of Technology Mysore.</p>

                <h4 style={{ color: '#0f172a', fontWeight: 900, margin: '0 0 6px' }}>2. 24-Hour Offline Hackathon</h4>
                <p>The finale will be conducted live on campus at Maharaja Institute of Technology Mysore on November 06–07, 2026. High-speed Wi-Fi, power workstations, meals, and midnight refreshments are provided.</p>

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
              <div style={{ padding: '16px 24px', borderTop: '1.5px solid #f1e7db', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', flexWrap: 'wrap', gap: 12 }}>
                {rulebookDoc?.fileUrl && rulebookDoc.fileUrl !== '#' && !rulebookDoc.fileUrl.startsWith('#') && rulebookDoc.fileUrl.startsWith('http') ? (
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(rulebookDoc.fileUrl);
                        const blob = await response.blob();
                        const blobUrl = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = rulebookDoc.fileName || 'HAXLR8-3.0-Official-Rulebook.pdf';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(blobUrl);
                      } catch (err) {
                        window.open(rulebookDoc.fileUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
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
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                    }}
                  >
                    <span>📥 Download Official PDF {rulebookDoc.fileSize && rulebookDoc.fileSize !== 'Official PDF' ? `(${rulebookDoc.fileSize})` : ''}</span>
                  </button>
                ) : (
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>
                    Official PDF will be published shortly by organizers.
                  </div>
                )}
                <button onClick={() => setShowRulebook(false)} style={{ padding: '10px 20px', borderRadius: 12, background: '#ff3b69', color: '#fff', border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                  Close Window
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── LEADER VS IMPOSTOR PROTOCOL MODAL ── */}
      <AnimatePresence>
        {showProtocol && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: '#ffffff', border: '2px solid #fed7aa', borderRadius: 24, width: '100%', maxWidth: 640, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1.5px solid #f1e7db', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fffaf3' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 900, color: '#0f172a' }}>
                  <AmongUsKingCharacter size={24} color="#9333ea" />
                  <span>Leader vs. Impostor Protocol</span>
                </div>
                <button onClick={() => setShowProtocol(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '70vh', overflowY: 'auto', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 16, padding: '16px' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#166534', fontWeight: 900, margin: '0 0 6px' }}>
                    <AmongUsKingCharacter size={18} color="#16a34a" />
                    <span>Team Leader (Squad Commander)</span>
                  </h4>
                  <p style={{ margin: 0, color: '#15803d' }}>Only the designated Team Leader creates an account. The leader selects the domain, registers 3–4 squad members, completes the ₹1,200 team payment, and receives official passes &amp; announcements.</p>
                </div>

                <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 16, padding: '16px' }}>
                  <h4 style={{ color: '#991b1b', fontWeight: 900, margin: '0 0 6px' }}>🚨 Squad Member / "The Impostor"</h4>
                  <p style={{ margin: 0, color: '#b91c1c' }}>Squad members do NOT need separate accounts! Your team leader enrolls your college ID and email directly into the squad manifest. Anyone attempting to register separately without being a team captain is flagged as an Impostor!</p>
                </div>
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1.5px solid #f1e7db', display: 'flex', justifyContent: 'flex-end', background: '#fafafa' }}>
                <button onClick={() => setShowProtocol(false)} style={{ padding: '10px 20px', borderRadius: 12, background: '#ff3b69', color: '#fff', border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                  Understood
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
