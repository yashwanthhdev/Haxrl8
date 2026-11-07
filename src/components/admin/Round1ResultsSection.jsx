import React, { useState, useMemo, useEffect } from 'react';
import { 
  Trophy, 
  Medal, 
  Award, 
  Search, 
  Download, 
  Filter, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  ChevronDown,
  Users,
  Building,
  GraduationCap,
  Phone,
  Mail,
  User,
  Eye,
  X,
  Copy,
  Check,
  ExternalLink,
  Flame,
  Layers,
  ArrowRight,
  Star
} from 'lucide-react';
import { 
  COMBINED_RESULTS, 
  getDomainTop2Combined,
  getDomainTop2Round3,
  getDomainTop2GrandTotal,
  getDomainTop3Combined, 
  getDomainTop3Round1, 
  getDomainTop3Round2,
  getDomainTop3Round3,
  getDomainTop3GrandTotal,
  getEvaluationSummary 
} from '../../data/round1Results';

const DOMAIN_STYLES = {
  'Healthcare': {
    color: '#e11d48',
    bg: '#fff1f2',
    border: '#fecdd3',
    icon: '🩺',
    badgeBg: '#ffe4e6',
    borderStrong: '#fda4af',
    accent: '#be123c'
  },
  'Smart City': {
    color: '#0284c7',
    bg: '#e0f2fe',
    border: '#7dd3fc',
    icon: '🏙️',
    badgeBg: '#bae6fd',
    borderStrong: '#38bdf8',
    accent: '#0369a1'
  },
  'Agriculture': {
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#86efac',
    icon: '🌾',
    badgeBg: '#bbf7d0',
    borderStrong: '#4ade80',
    accent: '#15803d'
  }
};

export default function Round1ResultsSection() {
  const [selectedDomain, setSelectedDomain] = useState('All');
  // evaluationMode: 'r1_r2' (Round 1+2 Combined /30) | 'r3' (Round 3 /70) | 'grand' (Grand Total /100)
  const [evaluationMode, setEvaluationMode] = useState('r1_r2');
  // podiumLimit: 2 (Top 2 from each domain) or 3 (Top 3)
  const [podiumLimit, setPodiumLimit] = useState(2);
  // viewMode: 'all' (All 52 squads) or 'top' (Qualifiers only)
  const [viewMode, setViewMode] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSquad, setSelectedSquad] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedSquad(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const summary = useMemo(() => getEvaluationSummary(), []);

  // Get active rank number for a squad based on evaluationMode
  const getActiveRank = (team) => {
    if (evaluationMode === 'r1_r2') return team.r1_2_Rank;
    if (evaluationMode === 'r3') return team.round3Rank;
    return team.grandRank;
  };

  // Get active score for a squad based on evaluationMode
  const getActiveScore = (team) => {
    if (evaluationMode === 'r1_r2') return team.r1_2_Combined;
    if (evaluationMode === 'r3') return team.round3Average;
    return team.grandTotal;
  };

  const getActiveScoreMax = () => {
    if (evaluationMode === 'r1_r2') return 30;
    if (evaluationMode === 'r3') return 70;
    return 100;
  };

  // Top qualifiers for active evaluation mode by domain
  const domainQualifiers = useMemo(() => {
    const domains = ['Healthcare', 'Smart City', 'Agriculture'];
    const res = {};

    domains.forEach(domain => {
      const domTeams = COMBINED_RESULTS.filter(t => t.domain === domain);
      if (evaluationMode === 'r1_r2') {
        domTeams.sort((a, b) => a.r1_2_Rank - b.r1_2_Rank || b.r1_2_Combined - a.r1_2_Combined);
        res[domain] = domTeams.filter(t => t.r1_2_Rank <= podiumLimit);
      } else if (evaluationMode === 'r3') {
        domTeams.sort((a, b) => a.round3Rank - b.round3Rank || b.round3Average - a.round3Average);
        res[domain] = domTeams.filter(t => t.round3Rank <= podiumLimit);
      } else {
        domTeams.sort((a, b) => a.grandRank - b.grandRank || b.grandTotal - a.grandTotal);
        res[domain] = domTeams.filter(t => t.grandRank <= podiumLimit);
      }
    });

    return res;
  }, [evaluationMode, podiumLimit]);

  // Filtered & sorted squads for the full table
  const filteredTeams = useMemo(() => {
    let list = [...COMBINED_RESULTS];
    if (selectedDomain !== 'All') {
      list = list.filter(item => item.domain === selectedDomain);
    }

    if (viewMode === 'top') {
      list = list.filter(item => getActiveRank(item) <= podiumLimit);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item => 
        (item.teamName && item.teamName.toLowerCase().includes(q)) || 
        (item.domain && item.domain.toLowerCase().includes(q)) ||
        (item.leader?.name && item.leader.name.toLowerCase().includes(q)) ||
        (item.leader?.college && item.leader.college.toLowerCase().includes(q)) ||
        (item.leader?.phone && item.leader.phone.includes(q)) ||
        (item.leader?.email && item.leader.email.toLowerCase().includes(q)) ||
        (item.members && item.members.some(m => 
          (m.name && m.name.toLowerCase().includes(q)) || 
          (m.college && m.college.toLowerCase().includes(q))
        ))
      );
    }

    return list.sort((a, b) => {
      if (a.domain !== b.domain) return a.domain.localeCompare(b.domain);
      const rankA = getActiveRank(a);
      const rankB = getActiveRank(b);
      if (rankA !== rankB) return rankA - rankB;
      return getActiveScore(b) - getActiveScore(a);
    });
  }, [selectedDomain, viewMode, evaluationMode, podiumLimit, searchQuery]);

  // Copy helper
  const handleCopy = (text, fieldId) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(''), 2000);
  };

  // Export comprehensive CSV containing all 3 rounds and Grand Total
  const handleExportCSV = () => {
    const headers = [
      'Sl',
      'Team Name',
      'Domain',
      'R1+R2 Rank',
      'R1+R2 Combined (/30)',
      'Round 1 Avg (/10)',
      'Round 2 Total (/20)',
      'Round 3 Rank',
      'Round 3 Avg (/70)',
      'Round 3 Judge 1 (/70)',
      'Round 3 Judge 2 (/70)',
      'Grand Total (/100)',
      'Grand Rank (Domain)',
      'Captain Name',
      'Captain Phone',
      'Captain Email',
      'College Name',
      'Department',
      'Year',
      'Crew Size',
      'Crew Members Roster'
    ];

    const rows = filteredTeams.map((r, idx) => {
      const memberNames = (r.members || []).map(m => `${m.name} (${m.phone || 'No phone'})`).join('; ');
      return [
        idx + 1,
        `"${r.teamName}"`,
        `"${r.domain}"`,
        r.r1_2_Rank,
        r.r1_2_Combined,
        r.round1,
        r.round2,
        r.round3Rank,
        r.round3Average,
        r.round3Judge1,
        r.round3Judge2,
        r.grandTotal,
        r.grandRank,
        `"${r.leader?.name || ''}"`,
        `"${r.leader?.phone || ''}"`,
        `"${r.leader?.email || ''}"`,
        `"${r.leader?.college || ''}"`,
        `"${r.leader?.dept || ''}"`,
        `"${r.leader?.year || ''}"`,
        r.members?.length || 0,
        `"${memberNames}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HAXLR8_3.0_Evaluation_R1_R2_R3_GrandTotal_${selectedDomain.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: 'linear-gradient(135deg, #fef08a 0%, #fde047 100%)',
          color: '#854d0e',
          fontWeight: 900,
          padding: '4px 10px',
          borderRadius: 8,
          border: '1.5px solid #facc15',
          fontSize: 12
        }}>
          🥇 Rank 1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          color: '#334155',
          fontWeight: 900,
          padding: '4px 10px',
          borderRadius: 8,
          border: '1.5px solid #cbd5e1',
          fontSize: 12
        }}>
          🥈 Rank 2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
          color: '#9a3412',
          fontWeight: 900,
          padding: '4px 10px',
          borderRadius: 8,
          border: '1.5px solid #fdba74',
          fontSize: 12
        }}>
          🥉 Rank 3
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-block',
        background: '#f8fafc',
        color: '#64748b',
        fontWeight: 800,
        padding: '3px 8px',
        borderRadius: 6,
        border: '1px solid #e2e8f0',
        fontSize: 11
      }}>
        Rank {rank}
      </span>
    );
  };

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 20,
      border: '2px solid #fed7aa',
      boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* ── HEADER BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 55%, #0f172a 100%)',
        padding: '24px 28px',
        borderBottom: '4px solid #ea580c',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 16px rgba(234, 88, 12, 0.45)'
          }}>
            <Trophy size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{
                background: '#ea580c',
                color: '#ffffff',
                fontSize: 10,
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: 6,
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                OFFICIAL EVALUATION DECK
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 800 }}>
                HAXLR8 3.0 &bull; GRAND FINALE
              </span>
            </div>
            <h2 style={{ fontSize: 21, fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Final Evaluation Results &bull; Top 2 By Domain &bull; All 52 Squads
            </h2>
            <div style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600, marginTop: 4 }}>
              Round 1+2 Combined (/30) &bull; Round 3 (/70) &bull; Grand Total (/100) &bull; Full Squad &amp; Captain Contacts
            </div>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 20px',
            borderRadius: 12,
            background: '#ffffff',
            color: '#0f172a',
            fontSize: 13,
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
            transition: 'transform 0.15s ease'
          }}
          title="Download master marksheet including R1, R2, R3, Grand Total, and contact details"
        >
          <Download size={16} color="#ea580c" />
          <span>Export Master Roster (CSV)</span>
        </button>
      </div>

      {/* ── STAGE SELECTOR (R1+R2 /30 vs R3 /70 vs GRAND TOTAL /100) ── */}
      <div style={{
        padding: '14px 28px',
        background: '#fff7ed',
        borderBottom: '1.5px solid #fed7aa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 900, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Evaluation Stage:
          </span>
          <div style={{ display: 'inline-flex', background: '#ffffff', padding: 4, borderRadius: 12, border: '1.5px solid #fed7aa' }}>
            {/* R1 + R2 Combined */}
            <button
              onClick={() => setEvaluationMode('r1_r2')}
              style={{
                padding: '7px 16px',
                borderRadius: 9,
                fontSize: 12.5,
                fontWeight: 900,
                border: 'none',
                background: evaluationMode === 'r1_r2' ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' : 'transparent',
                color: evaluationMode === 'r1_r2' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: evaluationMode === 'r1_r2' ? '0 2px 6px rgba(234, 88, 12, 0.3)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <Flame size={14} />
              <span>R1 + R2 Combined (/ 30)</span>
            </button>

            {/* Round 3 Only */}
            <button
              onClick={() => setEvaluationMode('r3')}
              style={{
                padding: '7px 15px',
                borderRadius: 9,
                fontSize: 12.5,
                fontWeight: 900,
                border: 'none',
                background: evaluationMode === 'r3' ? '#0f172a' : 'transparent',
                color: evaluationMode === 'r3' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: evaluationMode === 'r3' ? '0 2px 6px rgba(15, 23, 42, 0.3)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <Award size={14} />
              <span>Round 3 Review (/ 70)</span>
            </button>

            {/* Grand Total All 3 Rounds */}
            <button
              onClick={() => setEvaluationMode('grand')}
              style={{
                padding: '7px 16px',
                borderRadius: 9,
                fontSize: 12.5,
                fontWeight: 900,
                border: 'none',
                background: evaluationMode === 'grand' ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' : 'transparent',
                color: evaluationMode === 'grand' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: evaluationMode === 'grand' ? '0 2px 6px rgba(22, 163, 74, 0.3)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <Star size={14} />
              <span>Grand Total: All 3 Rounds (/ 100)</span>
            </button>
          </div>
        </div>

        {/* Podium size toggle: Top 2 vs Top 3 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11.5, color: '#9a3412', fontWeight: 800 }}>Podium Cutoff:</span>
          <div style={{ display: 'inline-flex', background: '#ffffff', padding: 2, borderRadius: 8, border: '1px solid #fed7aa' }}>
            <button
              onClick={() => setPodiumLimit(2)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 900,
                border: 'none',
                background: podiumLimit === 2 ? '#ea580c' : 'transparent',
                color: podiumLimit === 2 ? '#ffffff' : '#64748b',
                cursor: 'pointer'
              }}
            >
              Top 2 Finalists
            </button>
            <button
              onClick={() => setPodiumLimit(3)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 900,
                border: 'none',
                background: podiumLimit === 3 ? '#ea580c' : 'transparent',
                color: podiumLimit === 3 ? '#ffffff' : '#64748b',
                cursor: 'pointer'
              }}
            >
              Top 3 Podium
            </button>
          </div>
        </div>
      </div>

      {/* ── DOMAIN PODIUM DISPLAY CARDS (TOP 2 FINALISTS BY DEFAULT) ── */}
      <div style={{ padding: '24px 28px 18px', background: '#fafafa', borderBottom: '1.5px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={16} color="#ea580c" />
            <span>
              {evaluationMode === 'r1_r2' && `Round 1 + Round 2 Combined Top ${podiumLimit} By Domain (/ 30)`}
              {evaluationMode === 'r3' && `Round 3 Evaluation Top ${podiumLimit} By Domain (/ 70)`}
              {evaluationMode === 'grand' && `Grand Finale Top ${podiumLimit} Championship By Domain (/ 100)`}
            </span>
          </div>
          <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 700 }}>
            Ties Share Exact Same Rank Position &bull; Click Card To Inspect Crew
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 16
        }}>
          {['Healthcare', 'Smart City', 'Agriculture'].map(domain => {
            const domStyle = DOMAIN_STYLES[domain];
            const domainTeams = domainQualifiers[domain] || [];
            const count = COMBINED_RESULTS.filter(t => t.domain === domain).length;

            return (
              <div 
                key={domain}
                style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  border: `1.5px solid ${domStyle.border}`,
                  padding: '18px 20px',
                  boxShadow: `0 2px 10px rgba(0, 0, 0, 0.03)`,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Domain Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{domStyle.icon}</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: domStyle.color }}>{domain}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, background: domStyle.bg, color: domStyle.color, padding: '3px 8px', borderRadius: 6, border: `1px solid ${domStyle.border}` }}>
                    {count} Squads
                  </span>
                </div>

                {/* Qualifiers Ranks Grouped */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {[1, 2, 3].slice(0, podiumLimit).map(rankNum => {
                    const teamsInRank = domainTeams.filter(t => getActiveRank(t) === rankNum);
                    if (teamsInRank.length === 0) return null;

                    const isRank1 = rankNum === 1;
                    const cardBg = isRank1 ? '#fefce8' : rankNum === 2 ? '#f8fafc' : '#fff7ed';
                    const cardBorder = isRank1 ? '#fef08a' : rankNum === 2 ? '#e2e8f0' : '#fed7aa';
                    const medalEmoji = isRank1 ? '🥇' : rankNum === 2 ? '🥈' : '🥉';
                    const rankColor = isRank1 ? '#854d0e' : rankNum === 2 ? '#334155' : '#9a3412';

                    return (
                      <div 
                        key={rankNum}
                        style={{
                          padding: '12px 14px',
                          background: cardBg,
                          borderRadius: 12,
                          border: `1.5px solid ${cardBorder}`
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 16 }}>{medalEmoji}</span>
                            <strong style={{ fontSize: 12, color: rankColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Rank {rankNum} {teamsInRank.length > 1 ? `(${teamsInRank.length}-Way Tie)` : ''}
                            </strong>
                          </div>
                          {teamsInRank.length === 1 && (
                            <span style={{ fontSize: 14, fontWeight: 900, color: rankColor }}>
                              {getActiveScore(teamsInRank[0])} / {getActiveScoreMax()}
                            </span>
                          )}
                        </div>

                        {/* List of squads in this rank (handles single squad or ties) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {teamsInRank.map(team => (
                            <div
                              key={team.teamName}
                              onClick={() => setSelectedSquad(team)}
                              style={{
                                padding: '8px 10px',
                                background: '#ffffff',
                                borderRadius: 8,
                                border: `1px solid ${cardBorder}`,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              title="Click to view complete squad dossier & crew details"
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <strong style={{ fontSize: 13, color: '#0f172a' }}>{team.teamName}</strong>
                                  <Eye size={12} color="#0284c7" />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {evaluationMode === 'r1_r2' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <span style={{ fontSize: 10, color: '#64748b' }}>R1:{team.round1} | R2:{team.round2}</span>
                                      <span style={{ fontSize: 12, fontWeight: 900, color: '#ea580c', background: '#fff7ed', padding: '1px 6px', borderRadius: 6, border: '1px solid #fed7aa' }}>
                                        {team.r1_2_Combined} / 30
                                      </span>
                                    </div>
                                  )}
                                  {evaluationMode === 'r3' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <span style={{ fontSize: 10, color: '#64748b' }}>J1:{team.round3Judge1} | J2:{team.round3Judge2}</span>
                                      <span style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', background: '#f1f5f9', padding: '1px 6px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                                        {team.round3Average} / 70
                                      </span>
                                    </div>
                                  )}
                                  {evaluationMode === 'grand' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <span style={{ fontSize: 10, color: '#64748b' }}>R1+2:{team.r1_2_Combined} | R3:{team.round3Average}</span>
                                      <span style={{ fontSize: 12, fontWeight: 900, color: '#16a34a', background: '#f0fdf4', padding: '1px 6px', borderRadius: 6, border: '1px solid #86efac' }}>
                                        {team.grandTotal} / 100
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>Capt: <strong>{team.leader?.name}</strong></span>
                                <span>&bull;</span>
                                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 160 }}>
                                  {team.leader?.college?.split(' ')[0]}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CONTROLS, SEARCH & FILTER BAR ── */}
      <div style={{
        padding: '16px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        background: '#ffffff',
        borderBottom: '1px solid #f1f5f9'
      }}>
        {/* Domain Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {['All', 'Healthcare', 'Smart City', 'Agriculture'].map(dom => {
            const isSelected = selectedDomain === dom;
            const count = dom === 'All' ? COMBINED_RESULTS.length : COMBINED_RESULTS.filter(t => t.domain === dom).length;
            return (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: 800,
                  border: isSelected ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                  background: isSelected ? '#0f172a' : '#f8fafc',
                  color: isSelected ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>{dom}</span>
                <span style={{
                  fontSize: 11,
                  background: isSelected ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                  color: isSelected ? '#ffffff' : '#64748b',
                  padding: '1px 6px',
                  borderRadius: 6
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode (All 52 vs Top Qualifiers) & Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Table View Mode Toggle */}
          <div style={{
            display: 'inline-flex',
            background: '#f1f5f9',
            padding: 3,
            borderRadius: 10,
            border: '1px solid #e2e8f0'
          }}>
            <button
              onClick={() => setViewMode('all')}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 800,
                border: 'none',
                background: viewMode === 'all' ? '#ffffff' : 'transparent',
                color: viewMode === 'all' ? '#0f172a' : '#64748b',
                boxShadow: viewMode === 'all' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer'
              }}
            >
              All 52 Squads
            </button>
            <button
              onClick={() => setViewMode('top')}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 800,
                border: 'none',
                background: viewMode === 'top' ? '#ffffff' : 'transparent',
                color: viewMode === 'top' ? '#ea580c' : '#64748b',
                boxShadow: viewMode === 'top' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Trophy size={13} />
              <span>Top {podiumLimit} Finalists Only</span>
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: 260 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search squad, captain, college..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 14px 8px 34px',
                borderRadius: 10,
                border: '1.5px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: 12,
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      </div>

      {/* ── COMPLETE RESULTS TABLE (ALL 52 SQUADS WITH R1, R2, R3 & GRAND TOTAL) ── */}
      <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: 1120, borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
              <th style={{ padding: '12px 18px', fontWeight: 800, width: 85 }}>Rank</th>
              <th style={{ padding: '12px 18px', fontWeight: 800 }}>Squad &amp; Domain</th>
              <th style={{ padding: '12px 18px', fontWeight: 800 }}>Commander / Captain</th>
              <th style={{ padding: '12px 18px', fontWeight: 800 }}>Institution / College</th>
              <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'center', width: 75 }}>Crew</th>
              <th style={{ padding: '12px 12px', fontWeight: 800, textAlign: 'center', width: 75 }}>R1 (/10)</th>
              <th style={{ padding: '12px 12px', fontWeight: 800, textAlign: 'center', width: 75 }}>R2 (/20)</th>
              <th style={{ padding: '12px 16px', fontWeight: 900, textAlign: 'center', width: 95, background: '#fff7ed', color: '#c2410c' }}>
                R1+R2 (/30)
              </th>
              <th style={{ padding: '12px 16px', fontWeight: 900, textAlign: 'center', width: 110, background: '#eff6ff', color: '#0369a1' }}>
                Round 3 (/70)
              </th>
              <th style={{ padding: '12px 18px', fontWeight: 900, textAlign: 'center', width: 120, background: '#f0fdf4', color: '#15803d' }}>
                Grand Total (/100)
              </th>
              <th style={{ padding: '12px 18px', fontWeight: 800, textAlign: 'center', width: 95 }}>Dossier</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((team, idx) => {
              const domStyle = DOMAIN_STYLES[team.domain] || DOMAIN_STYLES['Smart City'];
              const currentRank = getActiveRank(team);
              const isTopRank = currentRank <= podiumLimit;

              return (
                <tr 
                  key={team.teamName + idx} 
                  style={{ 
                    borderBottom: '1px solid #f1f5f9',
                    background: isTopRank 
                      ? (currentRank === 1 ? '#fefce8' : currentRank === 2 ? '#fafafa' : '#fff7ed') 
                      : '#ffffff',
                    transition: 'background 0.15s ease'
                  }}
                >
                  {/* Rank */}
                  <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                    {getRankBadge(currentRank)}
                  </td>

                  {/* Squad Name & Domain */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: domStyle.bg,
                        color: domStyle.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: 14,
                        border: `1px solid ${domStyle.border}`
                      }}>
                        {team.teamName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13.5, color: '#0f172a' }}>
                          {team.teamName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <span style={{
                            fontSize: 10.5,
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: 6,
                            background: domStyle.bg,
                            color: domStyle.color,
                            border: `1px solid ${domStyle.border}`
                          }}>
                            {team.domain}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Commander / Captain */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <strong style={{ fontSize: 12.5, color: '#0f172a' }}>
                        {team.leader?.name || 'N/A'}
                      </strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#64748b' }}>
                        {team.leader?.phone && (
                          <a 
                            href={`tel:${team.leader.phone}`}
                            style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 700 }}
                            title="Call Captain"
                          >
                            📞 {team.leader.phone}
                          </a>
                        )}
                        {team.leader?.email && (
                          <a 
                            href={`mailto:${team.leader.email}`}
                            style={{ color: '#64748b', textDecoration: 'none' }}
                            title="Email Captain"
                          >
                            ✉️ {team.leader.email}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Institution / College */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ color: '#334155', fontWeight: 600, fontSize: 12, lineHeight: 1.4 }}>
                      {team.leader?.college || 'N/A'}
                    </div>
                    {team.leader?.dept && (
                      <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 1 }}>
                        {team.leader.dept} {team.leader.year ? `• ${team.leader.year}` : ''}
                      </div>
                    )}
                  </td>

                  {/* Crew Size */}
                  <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 800,
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '3px 8px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0'
                    }}>
                      <Users size={12} />
                      <span>{team.members?.length || 1}</span>
                    </span>
                  </td>

                  {/* Round 1 (/10) */}
                  <td style={{ padding: '14px 12px', textAlign: 'center', color: '#64748b', fontWeight: 700 }}>
                    {team.round1}
                  </td>

                  {/* Round 2 (/20) */}
                  <td style={{ padding: '14px 12px', textAlign: 'center', color: '#64748b', fontWeight: 700 }}>
                    {team.round2}
                  </td>

                  {/* R1 + R2 Combined (/30) */}
                  <td style={{ padding: '14px 16px', textAlign: 'center', background: '#fffaf3' }}>
                    <span style={{
                      fontSize: 13.5,
                      fontWeight: 900,
                      color: '#ea580c'
                    }}>
                      {team.r1_2_Combined}
                    </span>
                    <span style={{ fontSize: 9.5, color: '#c2410c', display: 'block', fontWeight: 700 }}>
                      Rank {team.r1_2_Rank}
                    </span>
                  </td>

                  {/* Round 3 (/70) */}
                  <td style={{ padding: '14px 16px', textAlign: 'center', background: '#f8fafc' }}>
                    <span style={{
                      fontSize: 13.5,
                      fontWeight: 900,
                      color: '#0284c7'
                    }}>
                      {team.round3Average}
                    </span>
                    <span style={{ fontSize: 9.5, color: '#64748b', display: 'block' }}>
                      J1:{team.round3Judge1} | J2:{team.round3Judge2}
                    </span>
                  </td>

                  {/* Grand Total (/100) */}
                  <td style={{ padding: '14px 18px', textAlign: 'center', background: isTopRank ? '#f0fdf4' : '#fafafa' }}>
                    <span style={{
                      fontSize: 15,
                      fontWeight: 900,
                      color: '#15803d'
                    }}>
                      {team.grandTotal}
                    </span>
                    <span style={{ fontSize: 10, color: '#15803d', display: 'block', fontWeight: 700 }}>
                      / 100
                    </span>
                  </td>

                  {/* Action / Inspect Dossier */}
                  <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                    <button
                      onClick={() => setSelectedSquad(team)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        background: '#ffffff',
                        border: '1.5px solid #0284c7',
                        color: '#0284c7',
                        fontSize: 11.5,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all 0.15s ease'
                      }}
                      title="Inspect full 3-round scorecard & crew member contacts"
                    >
                      <Eye size={12} />
                      <span>Dossier</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── FOOTER STATS ── */}
      <div style={{
        padding: '16px 28px',
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        fontSize: 12,
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span>Showing <strong>{filteredTeams.length}</strong> of 52 squads</span>
          <span>&bull;</span>
          <span>Total Grand Finale Participants: <strong>205 Crew Members</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#059669', fontWeight: 800 }}>✓ Official Round 1, Round 2 &amp; Round 3 Evaluated</span>
        </div>
      </div>

      {/* ── SQUAD DETAILS MODAL ── */}
      {selectedSquad && (
        <div
          onClick={() => setSelectedSquad(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: 16
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: 20,
              maxWidth: 740,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: '2px solid #fed7aa',
              position: 'relative'
            }}
          >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
              color: '#ffffff',
              padding: '22px 24px',
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  {getRankBadge(getActiveRank(selectedSquad))}
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    background: DOMAIN_STYLES[selectedSquad.domain]?.bg || '#f1f5f9',
                    color: DOMAIN_STYLES[selectedSquad.domain]?.color || '#0284c7',
                    padding: '3px 8px',
                    borderRadius: 6,
                    border: `1px solid ${DOMAIN_STYLES[selectedSquad.domain]?.border || '#cbd5e1'}`
                  }}>
                    {selectedSquad.domain}
                  </span>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: '#ffffff' }}>
                  {selectedSquad.teamName}
                </h3>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  {selectedSquad.projectTitle || `${selectedSquad.teamName} - ${selectedSquad.domain}`}
                </div>
              </div>

              <button
                onClick={() => setSelectedSquad(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 10,
                  color: '#ffffff',
                  padding: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scorecard Strip (R1, R2, R1+R2, R3, Grand Total) */}
            <div style={{
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              padding: '14px 20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 10,
              textAlign: 'center'
            }}>
              {/* R1 */}
              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>Round 1</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>
                  {selectedSquad.round1} <span style={{ fontSize: 10, color: '#94a3b8' }}>/ 10</span>
                </div>
                <div style={{ fontSize: 9.5, color: '#64748b' }}>
                  J1:{selectedSquad.round1Judge1} J2:{selectedSquad.round1Judge2}
                </div>
              </div>

              {/* R2 */}
              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>Round 2</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>
                  {selectedSquad.round2} <span style={{ fontSize: 10, color: '#94a3b8' }}>/ 20</span>
                </div>
                <div style={{ fontSize: 9.5, color: '#ea580c', fontWeight: 700 }}>
                  R1+R2: {selectedSquad.r1_2_Combined} / 30
                </div>
              </div>

              {/* R3 */}
              <div style={{ background: '#eff6ff', padding: '8px 10px', borderRadius: 10, border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: 10.5, color: '#0369a1', fontWeight: 700 }}>Round 3</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#0284c7' }}>
                  {selectedSquad.round3Average} <span style={{ fontSize: 10, color: '#0369a1' }}>/ 70</span>
                </div>
                <div style={{ fontSize: 9.5, color: '#0369a1' }}>
                  J1:{selectedSquad.round3Judge1} J2:{selectedSquad.round3Judge2}
                </div>
              </div>

              {/* Grand Total */}
              <div style={{ background: '#f0fdf4', padding: '8px 10px', borderRadius: 10, border: '1px solid #86efac' }}>
                <div style={{ fontSize: 10.5, color: '#15803d', fontWeight: 800 }}>Grand Total</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#15803d' }}>
                  {selectedSquad.grandTotal} <span style={{ fontSize: 10, color: '#15803d' }}>/ 100</span>
                </div>
                <div style={{ fontSize: 9.5, color: '#15803d', fontWeight: 700 }}>
                  Rank {selectedSquad.grandRank} in {selectedSquad.domain}
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Leader Spotlight Card */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={14} color="#ea580c" />
                  <span>Squad Commander / Captain</span>
                </div>
                <div style={{
                  background: '#fffaf3',
                  borderRadius: 14,
                  border: '1.5px solid #fed7aa',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>
                      {selectedSquad.leader?.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                      {selectedSquad.leader?.college}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                      {selectedSquad.leader?.dept} {selectedSquad.leader?.year ? `• ${selectedSquad.leader?.year}` : ''}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {selectedSquad.leader?.phone && (
                      <a
                        href={`tel:${selectedSquad.leader.phone}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '7px 12px',
                          borderRadius: 8,
                          background: '#059669',
                          color: '#ffffff',
                          fontSize: 11.5,
                          fontWeight: 800,
                          textDecoration: 'none'
                        }}
                      >
                        <Phone size={12} />
                        <span>{selectedSquad.leader.phone}</span>
                      </a>
                    )}
                    {selectedSquad.leader?.email && (
                      <a
                        href={`mailto:${selectedSquad.leader.email}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '7px 12px',
                          borderRadius: 8,
                          background: '#0284c7',
                          color: '#ffffff',
                          fontSize: 11.5,
                          fontWeight: 800,
                          textDecoration: 'none'
                        }}
                      >
                        <Mail size={12} />
                        <span>Email Captain</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleCopy(`${selectedSquad.leader?.name} | ${selectedSquad.leader?.phone} | ${selectedSquad.leader?.email} | ${selectedSquad.leader?.college}`, 'capt')}
                      style={{
                        padding: '7px 10px',
                        borderRadius: 8,
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      title="Copy Captain contact info"
                    >
                      {copiedField === 'capt' ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                      <span>{copiedField === 'capt' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Complete Crew Roster */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={14} color="#0284c7" />
                    <span>Complete Crew Roster ({selectedSquad.members?.length || 0} Members)</span>
                  </div>
                  <button
                    onClick={() => {
                      const text = (selectedSquad.members || []).map(m => `${m.name} (${m.phone}) - ${m.email} [${m.college}]`).join('\n');
                      handleCopy(text, 'all-members');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0284c7',
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {copiedField === 'all-members' ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                    <span>{copiedField === 'all-members' ? 'Copied All Roster' : 'Copy All Crew Info'}</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                  {(selectedSquad.members || []).map((member, mIdx) => (
                    <div
                      key={member.id || mIdx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 12,
                        background: '#f8fafc',
                        border: member.isLeader ? '1.5px solid #fdba74' : '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <strong style={{ fontSize: 13, color: '#0f172a' }}>
                          {member.name}
                        </strong>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: 6,
                          background: member.isLeader ? '#ffedd5' : '#e2e8f0',
                          color: member.isLeader ? '#c2410c' : '#475569'
                        }}>
                          {member.isLeader ? 'Leader' : 'Crew Member'}
                        </span>
                      </div>

                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {member.college}
                      </div>

                      {member.dept && (
                        <div style={{ fontSize: 10.5, color: '#94a3b8' }}>
                          {member.dept} {member.year ? `• ${member.year}` : ''}
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, paddingTop: 6, borderTop: '1px solid #f1f5f9', fontSize: 11 }}>
                        {member.phone && (
                          <a href={`tel:${member.phone}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 700 }}>
                            📞 {member.phone}
                          </a>
                        )}
                        {member.email && (
                          <a href={`mailto:${member.email}`} style={{ color: '#64748b', textDecoration: 'none', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            ✉️ {member.email}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 24px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              borderBottomLeftRadius: 18,
              borderBottomRightRadius: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>
                Squad ID: <code style={{ fontSize: 10 }}>{selectedSquad.teamId || 'N/A'}</code>
              </span>
              <button
                onClick={() => setSelectedSquad(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
