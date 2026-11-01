import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Download, ExternalLink, CheckCircle2, Lock, AlertTriangle, 
  Sparkles, ShieldCheck, ArrowRight, Info, Users, Clock, HelpCircle, Trash2
} from 'lucide-react';
import AmongUsCrewmate from '../../components/amongus/AmongUsCrewmate';
import { 
  PROBLEM_STATEMENTS, 
  DOMAIN_METADATA, 
  MAX_TEAMS_PER_PROBLEM, 
  getProblemsByDomain, 
  getProblemById 
} from '../../data/problemStatementsCatalog';
import { 
  fetchAllProblemSelections, 
  getSelectionCounts, 
  getTeamSelection, 
  lockProblemStatement,
  deleteProblemStatementSelection,
  getDomainPdfUrl
} from '../../lib/problemStatementsService';
import { formatDomainWithBadge } from '../../lib/domainUtils';

const formatDateSafe = (dateVal) => {
  if (!dateVal) return 'Verified';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch (e) {
    return String(dateVal);
  }
};

export default function ProblemStatementsTab({ teamData, teamMembers, user, onStatementLocked }) {
  // Determine squad's domain
  const squadDomain = teamData?.domain || 'Smart City';
  const domainMeta = DOMAIN_METADATA[squadDomain] || DOMAIN_METADATA['Smart City'];
  const domainProblems = getProblemsByDomain(squadDomain);

  // Identify if current user is leader
  const userEmail = (user?.email || user?.user_metadata?.email || '').trim().toLowerCase();
  const isLeader = Boolean(
    (teamData?.leader_id && user?.id && teamData.leader_id === user.id) ||
    (teamMembers?.find(m => m.is_leader)?.email?.toLowerCase().trim() === userEmail) ||
    (userEmail && userEmail.startsWith('demo.'))
  );

  const leaderMember = teamMembers?.find(m => m.is_leader) || {
    full_name: user?.user_metadata?.full_name || 'Flight Captain',
    email: userEmail,
    phone_number: teamData?.phone || ''
  };

  // State
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState([]);
  const [counts, setCounts] = useState({});
  const [teamsByProblem, setTeamsByProblem] = useState({});
  const [lockedSelection, setLockedSelection] = useState(null);
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  
  // Confirmation Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // PDF URL (allows custom override or default)
  const pdfUrl = getDomainPdfUrl(squadDomain);

  // Initial Data Load & Sync
  const refreshData = async () => {
    try {
      const all = await fetchAllProblemSelections();
      setSelections(all);
      const { counts: c, teamsByProblem: t } = getSelectionCounts(all);
      setCounts(c);
      setTeamsByProblem(t);

      // Check if squad is already locked
      const myTeamId = teamData?.id;
      const myLock = getTeamSelection(myTeamId, userEmail);
      if (myLock) {
        setLockedSelection(myLock);
        setSelectedProblemId(myLock.problem_statement_id);
      } else {
        setLockedSelection(null);
        setSelectedProblemId(null);
      }
    } catch (e) {
      console.warn('Error fetching problem selections:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Listen for live updates
    const handleUpdate = () => refreshData();
    window.addEventListener('haxlr8_ps_locked', handleUpdate);
    window.addEventListener('haxlr8_ps_deleted', handleUpdate);
    window.addEventListener('haxlr8_ps_pdfs_updated', handleUpdate);

    return () => {
      window.removeEventListener('haxlr8_ps_locked', handleUpdate);
      window.removeEventListener('haxlr8_ps_deleted', handleUpdate);
      window.removeEventListener('haxlr8_ps_pdfs_updated', handleUpdate);
    };
  }, [teamData, userEmail]);

  // Squad Delete Selection Handler
  const handleDeleteLock = async () => {
    setDeleting(true);
    setErrorMsg('');
    try {
      await deleteProblemStatementSelection({
        teamId: teamData?.id,
        leaderEmail: userEmail
      });
      setLockedSelection(null);
      setSelectedProblemId(null);
      setShowDeleteModal(false);
      setSuccessMsg('Locked selection successfully deleted. Your squad can now select another problem statement.');
      if (onStatementLocked) {
        onStatementLocked({
          ...teamData,
          problem_statement_id: null,
          problem_statement_num: null,
          problem_statement_title: null,
          problem_statement_locked: false,
          problem_statement_locked_at: null,
          problem_statement_locked_by: null
        });
      }
      await refreshData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete problem statement.');
    } finally {
      setDeleting(false);
    }
  };

  // Open confirmation modal
  const handleInitiateLock = (problemId) => {
    if (lockedSelection) return;
    if (!isLeader) {
      setErrorMsg(`Clearance Denied: Only your Flight Captain (${leaderMember?.full_name || 'Captain'}) can officially lock in your squad's choice.`);
      return;
    }
    const currentCount = counts[problemId] || 0;
    if (currentCount >= MAX_TEAMS_PER_PROBLEM) {
      setErrorMsg(`Quota Reached: Challenge [${problemId}] has already reached the maximum capacity of 3 squads.`);
      return;
    }

    setSelectedProblemId(problemId);
    setErrorMsg('');
    setShowConfirmModal(true);
  };

  // Confirm and permanently lock
  const handleConfirmLock = async () => {
    if (!selectedProblemId) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      const result = await lockProblemStatement({
        teamId: teamData?.id || ('team-' + Date.now()),
        teamName: teamData?.team_name || 'Squad',
        domain: squadDomain,
        problemId: selectedProblemId,
        leaderName: leaderMember?.full_name || user?.user_metadata?.full_name || 'Flight Captain',
        leaderEmail: userEmail,
        leaderPhone: leaderMember?.phone_number || '',
        college: leaderMember?.college_name || teamData?.college || 'MIT Mysore',
        isLeader: true
      });

      setLockedSelection(result);
      setShowConfirmModal(false);
      setSuccessMsg(`Mission directive confirmed! Challenge [${result.problem_statement_id}] has been permanently locked for squad "${teamData?.team_name || 'Squad'}".`);

      if (onStatementLocked) {
        onStatementLocked({
          ...teamData,
          problem_statement_id: result.problem_statement_id,
          problem_statement_num: result.problem_statement_num,
          problem_statement_title: result.problem_statement_title,
          problem_statement_locked: true,
          problem_statement_locked_at: result.locked_at,
          problem_statement_locked_by: result.locked_by
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to lock problem statement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProblem = selectedProblemId ? getProblemById(selectedProblemId) : null;
  const lockedProblem = lockedSelection ? getProblemById(lockedSelection.problem_statement_id) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* ─── 1. DOMAIN BANNER & SUMMARY ─── */}
      <div style={{
        background: `linear-gradient(135deg, ${domainMeta.bg} 0%, #ffffff 100%)`,
        border: `2px solid ${domainMeta.border}`,
        borderRadius: 24,
        padding: '24px 28px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: domainMeta.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              boxShadow: `0 4px 14px ${domainMeta.color}40`,
              flexShrink: 0
            }}>
              {domainMeta.icon}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: domainMeta.color,
                  color: '#ffffff'
                }}>
                  Official Domain Track
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>
                  • 15 Official Engineering Challenges
                </span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '4px 0 0' }}>
                {domainMeta.title} Challenges
              </h1>
            </div>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: 14,
            padding: '8px 16px',
            fontSize: 12.5,
            fontWeight: 800,
            color: '#334155'
          }}>
            <Users size={16} color="#0284c7" />
            <span>Quota Rule: <strong>Max 3 Squads Per Problem</strong></span>
          </div>
        </div>

        {/* Domain Summary Text */}
        <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>
          {domainMeta.summary}
        </p>

        {/* Guidelines Box */}
        {domainMeta.guidelines && domainMeta.guidelines.length > 0 && (
          <div style={{
            background: '#ffffff',
            border: `1.5px dashed ${domainMeta.border}`,
            borderRadius: 16,
            padding: '16px 20px',
            marginTop: 4
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Sparkles size={16} color={domainMeta.color} />
              <span style={{ fontSize: 12.5, fontWeight: 800, color: domainMeta.textCol, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Participant Implementation Guidelines
              </span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
              {domainMeta.guidelines.map((g, idx) => (
                <li key={idx} style={{ marginBottom: 4 }}>{g}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ─── 2. OFFICIAL PDF DOWNLOAD CARD ─── */}
      <div style={{
        background: '#ffffff',
        border: '2px solid #fed7aa',
        borderRadius: 22,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: '#fff7ed',
            border: '1.5px solid #fed7aa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ea580c',
            flexShrink: 0
          }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Official Dossier
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>• Verified Release</span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
              HAXLR8 3.0 — {domainMeta.title} Problem Statements PDF
            </h3>
            <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0' }}>
              Read the complete background, scope, and technical benchmarks before locking in your squad's choice.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 18px',
              borderRadius: 12,
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              color: '#334155',
              fontSize: 13,
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s'
            }}
          >
            <ExternalLink size={15} />
            <span>Open PDF in Tab</span>
          </a>

          <a
            href={pdfUrl}
            download={domainMeta.pdfFileName}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              background: '#0284c7',
              border: 'none',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 3px 10px rgba(2, 132, 199, 0.28)',
              transition: 'all 0.15s'
            }}
          >
            <Download size={15} />
            <span>Download Official PDF</span>
          </a>
        </div>
      </div>

      {/* ─── 3. SQUAD LOCK STATUS BANNER ─── */}
      {lockedSelection ? (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '2px solid #86efac',
          borderRadius: 22,
          padding: '22px 26px',
          boxShadow: '0 8px 24px rgba(22, 163, 74, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: '#16a34a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.35)'
              }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Mission Locked In
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: '#14532d', margin: '2px 0 0' }}>
                  Squad Challenge Confirmed: [{lockedSelection.problem_statement_id}] {lockedSelection.problem_statement_title}
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#ffffff',
                border: '1.5px solid #86efac',
                borderRadius: 14,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 800,
                color: '#15803d'
              }}>
                <Lock size={14} />
                <span>Locked In · Finalized</span>
              </div>

              {isLeader && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#fee2e2',
                    border: '1.5px solid #fca5a5',
                    borderRadius: 14,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#dc2626',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#fecaca'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                  title="Delete locked problem statement and release slot"
                >
                  <Trash2 size={14} />
                  <span>Delete Selection</span>
                </button>
              )}
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            padding: '12px 18px',
            fontSize: 12.5,
            color: '#334155',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 20,
            fontWeight: 600
          }}>
            <span>Flight Captain: <strong>{lockedSelection.locked_by || leaderMember?.full_name}</strong></span>
            <span>Locked At: <strong>{formatDateSafe(lockedSelection.locked_at)}</strong></span>
            <span>Squad: <strong>{teamData?.team_name || lockedSelection.team_name}</strong></span>
          </div>

          <div style={{ fontSize: 12, color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Info size={14} />
            <span>Problem statement is locked for your squad. Flight Captain can delete selection to switch challenges if needed.</span>
          </div>
        </div>
      ) : (
        <div style={{
          background: '#fffbeb',
          border: '2px solid #fde68a',
          borderRadius: 20,
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <AmongUsCrewmate color="orange" size={42} hat="visor" speechText="Choose carefully!" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isLeader ? 'Flight Captain Action Required' : 'Crewmate View-Only Mode'}
              </div>
              <div style={{ fontSize: 13.5, color: '#92400e', fontWeight: 700, marginTop: 2, lineHeight: 1.4 }}>
                {isLeader ? (
                  <>You are the <strong>Flight Captain</strong>. Review the 15 challenges below and lock in your squad's problem statement. Remember, each problem statement has a <strong>strict maximum quota of 3 squads</strong>.</>
                ) : (
                  <>Only your Flight Captain (<strong>{leaderMember?.full_name || 'Captain'}</strong>) can submit and lock in your squad's choice. You can review all 15 challenges and discuss with your squad.</>
                )}
              </div>
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1.5px solid #fde68a',
            borderRadius: 14,
            padding: '8px 16px',
            fontSize: 12.5,
            fontWeight: 800,
            color: '#b45309',
            whiteSpace: 'nowrap'
          }}>
            ⚡ Quota: 3 Squads Max / Challenge
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 14, padding: '12px 18px', color: '#dc2626', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 14, padding: '12px 18px', color: '#15803d', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ─── 4. THE 15 PROBLEM STATEMENT CHALLENGES ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Available Challenges in {domainMeta.title}</span>
            <span style={{ fontSize: 12, fontWeight: 800, background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: 12 }}>
              15 Challenges Total
            </span>
          </h2>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
            Live Squad Claims Synced • Max 3 Teams Per Challenge
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {domainProblems.map((problem) => {
            const count = counts[problem.id] || 0;
            const isFull = count >= MAX_TEAMS_PER_PROBLEM;
            const isThisLocked = lockedSelection?.problem_statement_id === problem.id;
            const isSquadLockedToAnother = lockedSelection && !isThisLocked;
            const slotsLeft = Math.max(0, MAX_TEAMS_PER_PROBLEM - count);

            return (
              <div
                key={problem.id}
                style={{
                  background: isThisLocked 
                    ? '#f0fdf4' 
                    : isFull 
                    ? '#f8fafc' 
                    : '#ffffff',
                  border: isThisLocked
                    ? '2px solid #86efac'
                    : isFull
                    ? '1.5px solid #e2e8f0'
                    : '2px solid #fed7aa',
                  borderRadius: 20,
                  padding: '22px 24px',
                  boxShadow: isThisLocked ? '0 6px 20px rgba(22, 163, 74, 0.08)' : '0 4px 14px rgba(0,0,0,0.03)',
                  opacity: isFull && !isThisLocked ? 0.75 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 12.5,
                      fontWeight: 900,
                      padding: '4px 12px',
                      borderRadius: 10,
                      background: isThisLocked ? '#16a34a' : domainMeta.color,
                      color: '#ffffff',
                      letterSpacing: '0.04em'
                    }}>
                      {problem.id}
                    </span>

                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      Challenge #{problem.num}
                    </span>

                    {/* Quota Badge */}
                    {isThisLocked ? (
                      <span style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: 20,
                        background: '#dcfce7',
                        color: '#15803d',
                        border: '1px solid #86efac',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5
                      }}>
                        <CheckCircle2 size={13} />
                        Your Squad's Choice ✓
                      </span>
                    ) : isFull ? (
                      <span style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: 20,
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: '1px solid #fca5a5',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5
                      }}>
                        <Lock size={12} />
                        Capacity Reached (3/3)
                      </span>
                    ) : null}
                  </div>

                  {/* Action / Select Button */}
                  <div>
                    {isThisLocked ? (
                      <div style={{
                        padding: '8px 16px',
                        borderRadius: 12,
                        background: '#16a34a',
                        color: '#ffffff',
                        fontSize: 12.5,
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
                      }}>
                        <CheckCircle2 size={15} />
                        <span>Locked In ✓</span>
                      </div>
                    ) : isSquadLockedToAnother ? (
                      <button
                        disabled
                        style={{
                          padding: '8px 14px',
                          borderRadius: 12,
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          color: '#94a3b8',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'not-allowed'
                        }}
                      >
                        Squad Locked Another Challenge
                      </button>
                    ) : isFull ? (
                      <button
                        disabled
                        style={{
                          padding: '8px 14px',
                          borderRadius: 12,
                          background: '#fee2e2',
                          border: '1px solid #fecaca',
                          color: '#b91c1c',
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: 'not-allowed',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Lock size={13} />
                        <span>Closed (3/3 Full)</span>
                      </button>
                    ) : isLeader ? (
                      <button
                        onClick={() => handleInitiateLock(problem.id)}
                        style={{
                          padding: '9px 18px',
                          borderRadius: 12,
                          background: domainMeta.color,
                          border: 'none',
                          color: '#ffffff',
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          boxShadow: `0 3px 10px ${domainMeta.color}35`,
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <span>Lock In This Challenge</span>
                        <ArrowRight size={14} />
                      </button>
                    ) : (
                      <button
                        disabled
                        title="Only the Flight Captain can lock in this choice."
                        style={{
                          padding: '8px 14px',
                          borderRadius: 12,
                          background: '#f8fafc',
                          border: '1.5px solid #cbd5e1',
                          color: '#64748b',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'not-allowed'
                        }}
                      >
                        Flight Captain Clearance Required
                      </button>
                    )}
                  </div>
                </div>

                {/* Problem Title */}
                <h3 style={{
                  fontSize: 17,
                  fontWeight: 900,
                  color: isThisLocked ? '#14532d' : '#0f172a',
                  margin: 0,
                  lineHeight: 1.45
                }}>
                  {problem.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: 13.5,
                  color: '#475569',
                  lineHeight: 1.6,
                  margin: 0,
                  fontWeight: 500
                }}>
                  {problem.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 5. DOUBLE CONFIRMATION MODAL ─── */}
      <AnimatePresence>
        {showConfirmModal && selectedProblem && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                maxWidth: 500,
                width: '100%',
                background: '#ffffff',
                borderRadius: 24,
                padding: '30px 26px',
                border: '2.5px solid #fed7aa',
                boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}
            >
              {/* Mascot */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <AmongUsCrewmate color="orange" size={60} hat="visor" speechText="Are you 100% sure?" />
              </div>

              {/* Title & Warning */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 20,
                  padding: '4px 12px',
                  marginBottom: 8
                }}>
                  <AlertTriangle size={14} color="#dc2626" />
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase' }}>
                    Irreversible Final Decision
                  </span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
                  Are you sure that this problem statement is correct?
                </h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Once locked by you as the Flight Captain, this selection <strong>CANNOT be changed or cancelled</strong>. It will be officially reserved for squad <strong>"{teamData?.team_name || 'Squad'}"</strong>.
                </p>
              </div>

              {/* Problem Statement Preview Card */}
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: 16,
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 900,
                    padding: '3px 10px',
                    borderRadius: 8,
                    background: domainMeta.color,
                    color: '#ffffff'
                  }}>
                    {selectedProblem.id}
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>
                    {domainMeta.title} • Challenge #{selectedProblem.num}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', lineHeight: 1.4 }}>
                  {selectedProblem.title}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowConfirmModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 14,
                    background: '#f1f5f9',
                    border: '1.5px solid #cbd5e1',
                    fontSize: 13.5,
                    fontWeight: 800,
                    color: '#475569',
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel / Review More
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmLock}
                  style={{
                    flex: 1.3,
                    padding: '12px',
                    borderRadius: 14,
                    background: '#16a34a',
                    border: 'none',
                    fontSize: 13.5,
                    fontWeight: 900,
                    color: '#ffffff',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <Lock size={16} />
                  <span>{submitting ? 'Locking in...' : 'Yes, Lock In Choice'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete / Release Locked Statement Modal */}
        {showDeleteModal && lockedSelection && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: '#ffffff',
                borderRadius: 24,
                maxWidth: 480,
                width: '100%',
                padding: '28px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '2px solid #fca5a5',
                display: 'flex',
                flexDirection: 'column',
                gap: 18
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#991B1B', margin: 0 }}>
                    Delete Locked Selection?
                  </h3>
                  <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0', fontWeight: 600 }}>
                    Release Problem Statement
                  </p>
                </div>
              </div>

              {/* Message */}
              <div style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6 }}>
                Are you sure you want to delete and release <strong>[{lockedSelection.problem_statement_id}] {lockedSelection.problem_statement_title}</strong>?
              </div>

              {/* Details card */}
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: 14,
                padding: '14px 16px',
                fontSize: 13,
                color: '#1e293b',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div><strong>Squad:</strong> {teamData?.team_name || lockedSelection.team_name}</div>
                <div><strong>Locked by:</strong> {lockedSelection.locked_by || leaderMember?.full_name}</div>
                <div style={{ color: '#0369a1', fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                  ℹ Releasing this will open the slot for other squads and allow your squad to pick another problem statement.
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setShowDeleteModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 14,
                    background: '#f1f5f9',
                    border: '1.5px solid #cbd5e1',
                    fontSize: 13.5,
                    fontWeight: 800,
                    color: '#475569',
                    cursor: deleting ? 'not-allowed' : 'pointer'
                  }}
                >
                  Keep Selection
                </button>

                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteLock}
                  style={{
                    flex: 1.4,
                    padding: '12px',
                    borderRadius: 14,
                    background: '#dc2626',
                    border: 'none',
                    fontSize: 13.5,
                    fontWeight: 900,
                    color: '#ffffff',
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <Trash2 size={16} />
                  <span>{deleting ? 'Deleting...' : 'Yes, Delete Selection'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
