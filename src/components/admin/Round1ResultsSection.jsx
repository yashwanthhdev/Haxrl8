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
  FileText
} from 'lucide-react';
import { ROUND_1_RESULTS, getDomainTop3 } from '../../data/round1Results';

const DOMAIN_STYLES = {
  'Healthcare': {
    color: '#e11d48',
    bg: '#fff1f2',
    border: '#fecdd3',
    icon: '🩺',
    badgeBg: '#ffe4e6',
    borderStrong: '#fda4af'
  },
  'Smart City': {
    color: '#0284c7',
    bg: '#e0f2fe',
    border: '#7dd3fc',
    icon: '🏙️',
    badgeBg: '#bae6fd',
    borderStrong: '#38bdf8'
  },
  'Agriculture': {
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#86efac',
    icon: '🌾',
    badgeBg: '#bbf7d0',
    borderStrong: '#4ade80'
  }
};

export default function Round1ResultsSection() {
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [viewMode, setViewMode] = useState('top3'); // 'top3' or 'all'
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

  const domainTop3 = useMemo(() => getDomainTop3(), []);

  // Filter teams based on domain, viewMode and search query
  const filteredTeams = useMemo(() => {
    let list = ROUND_1_RESULTS;
    if (selectedDomain !== 'All') {
      list = list.filter(item => item.domain === selectedDomain);
    }
    if (viewMode === 'top3') {
      list = list.filter(item => item.rank <= 3);
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
      return a.rank - b.rank || b.average - a.average;
    });
  }, [selectedDomain, viewMode, searchQuery]);

  // Copy helper
  const handleCopy = (text, fieldId) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(''), 2000);
  };

  // Export to CSV with full team details
  const handleExportCSV = () => {
    const headers = [
      'Sl',
      'Rank',
      'Team Name',
      'Domain',
      'Average Score (/10)',
      'Judge 1 - Dr. Akshath (/10)',
      'Judge 2 - Vijay Kumar (/10)',
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
        r.rank,
        `"${r.teamName}"`,
        `"${r.domain}"`,
        r.average,
        r.judge1,
        r.judge2,
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
    link.setAttribute('download', `HAXLR8_Round_1_Results_With_Team_Details_${selectedDomain.replace(/\s+/g, '_')}.csv`);
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
      borderRadius: 18,
      border: '2px solid #fed7aa',
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* ── HEADER RIBBON ── */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 60%, #0f172a 100%)',
        padding: '22px 28px',
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
            width: 50,
            height: 50,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)'
          }}>
            <Trophy size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
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
                ADMIN EXCLUSIVE TELEMETRY
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 800 }}>
                HAXLR8 3.0 &bull; 24H FINALE
              </span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Round 1 Evaluation Results &bull; Domain-Wise Top 3 &amp; Team Details
            </h2>
            <div style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600, marginTop: 3 }}>
              Official Combined Marks &bull; Evaluated by Dr. Akshath M.J &amp; Vijay Kumar M S &bull; Full Squad &amp; Captain Details Included
            </div>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 12,
            background: '#ffffff',
            color: '#0f172a',
            fontSize: 12.5,
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'transform 0.15s ease'
          }}
          title="Export CSV containing all scores, ranks, and team contact details"
        >
          <Download size={15} color="#ea580c" />
          <span>Export All Scores &amp; Details (CSV)</span>
        </button>
      </div>

      {/* ── TOP 3 DOMAIN PODIUM DISPLAY CARDS WITH TEAM DETAILS ── */}
      <div style={{ padding: '24px 28px 16px', background: '#fafafa', borderBottom: '1.5px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={16} color="#ea580c" />
            <span>Top 3 Rank Holders By Domain (Ties Share Same Rank &bull; Click For Squad Details)</span>
          </div>
          <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 700 }}>
            52 Total Evaluated Squads
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 16
        }}>
          {/* Healthcare Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1.5px solid #fecdd3',
            padding: '18px 20px',
            boxShadow: '0 2px 10px rgba(225, 29, 72, 0.04)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>🩺</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#e11d48' }}>Healthcare</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, background: '#fff1f2', color: '#e11d48', padding: '3px 8px', borderRadius: 6, border: '1px solid #fecdd3' }}>
                19 Squads
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              {/* Rank 1 */}
              {ROUND_1_RESULTS.filter(t => t.domain === 'Healthcare' && t.rank === 1).map(team => (
                <div 
                  key={team.teamName} 
                  onClick={() => setSelectedSquad(team)}
                  style={{
                    padding: '12px 14px',
                    background: '#fefce8',
                    borderRadius: 12,
                    border: '1.5px solid #fef08a',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  title="Click to view full team roster & contact details"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>🥇</span>
                      <div>
                        <strong style={{ fontSize: 14, color: '#854d0e', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {team.teamName}
                          <Eye size={12} color="#a16207" />
                        </strong>
                        <span style={{ fontSize: 11, color: '#a16207' }}>J1: {team.judge1} | J2: {team.judge2}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: 16, color: '#854d0e', fontWeight: 900 }}>{team.average.toFixed(1)}</strong>
                      <span style={{ fontSize: 10, color: '#a16207', display: 'block', fontWeight: 800 }}>Rank 1</span>
                    </div>
                  </div>
                  {/* Team details snippet */}
                  <div style={{ background: '#ffffff', borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#475569', display: 'flex', flexDirection: 'column', gap: 3, border: '1px solid #fef08a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={11} color="#854d0e" />
                      <strong style={{ color: '#0f172a' }}>Capt: {team.leader?.name}</strong>
                      <span style={{ color: '#64748b' }}>&bull; {team.leader?.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b' }}>
                      <GraduationCap size={11} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{team.leader?.college}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Rank 2 */}
              {ROUND_1_RESULTS.filter(t => t.domain === 'Healthcare' && t.rank === 2).map(team => (
                <div 
                  key={team.teamName} 
                  onClick={() => setSelectedSquad(team)}
                  style={{
                    padding: '12px 14px',
                    background: '#f8fafc',
                    borderRadius: 12,
                    border: '1.5px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  title="Click to view full team roster & contact details"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>🥈</span>
                      <div>
                        <strong style={{ fontSize: 14, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {team.teamName}
                          <Eye size={12} color="#64748b" />
                        </strong>
                        <span style={{ fontSize: 11, color: '#64748b' }}>J1: {team.judge1} | J2: {team.judge2}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: 16, color: '#0f172a', fontWeight: 900 }}>{team.average.toFixed(1)}</strong>
                      <span style={{ fontSize: 10, color: '#64748b', display: 'block', fontWeight: 800 }}>Rank 2</span>
                    </div>
                  </div>
                  {/* Team details snippet */}
                  <div style={{ background: '#ffffff', borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#475569', display: 'flex', flexDirection: 'column', gap: 3, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={11} color="#334155" />
                      <strong style={{ color: '#0f172a' }}>Capt: {team.leader?.name}</strong>
                      <span style={{ color: '#64748b' }}>&bull; {team.leader?.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b' }}>
                      <GraduationCap size={11} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{team.leader?.college}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Rank 3 (3-Way Tie) */}
              <div style={{ padding: '12px 14px', background: '#fff7ed', borderRadius: 12, border: '1.5px solid #ffedd5' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>🥉</span>
                    <strong style={{ fontSize: 12, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Rank 3 (3-Way Tie &bull; Avg 9.0)
                    </strong>
                  </div>
                  <span style={{ fontSize: 10.5, color: '#c2410c', fontWeight: 700 }}>Click squad to inspect</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ROUND_1_RESULTS.filter(t => t.domain === 'Healthcare' && t.rank === 3).map(team => (
                    <div 
                      key={team.teamName}
                      onClick={() => setSelectedSquad(team)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: '#ffffff',
                        border: '1px solid #fed7aa',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      title="Click to view full team roster & contact details"
                    >
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: '#9a3412', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span>{team.teamName}</span>
                          <Eye size={11} color="#ea580c" />
                        </div>
                        <div style={{ fontSize: 10.5, color: '#64748b' }}>
                          Capt: {team.leader?.name} &bull; {team.leader?.college?.split(' ')[0]}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#9a3412', background: '#fff7ed', padding: '2px 6px', borderRadius: 6, border: '1px solid #fed7aa' }}>
                        9.0
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Smart City Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1.5px solid #7dd3fc',
            padding: '18px 20px',
            boxShadow: '0 2px 10px rgba(2, 132, 199, 0.04)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>🏙️</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#0284c7' }}>Smart City</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, background: '#e0f2fe', color: '#0284c7', padding: '3px 8px', borderRadius: 6, border: '1px solid #7dd3fc' }}>
                19 Squads
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              {/* Rank 1 Tie (2 squads) */}
              <div style={{ padding: '12px 14px', background: '#fefce8', borderRadius: 12, border: '1.5px solid #fef08a' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>🥇</span>
                    <strong style={{ fontSize: 12, color: '#854d0e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Rank 1 (2-Way Tie &bull; Avg 9.0)
                    </strong>
                  </div>
                  <span style={{ fontSize: 10.5, color: '#a16207', fontWeight: 700 }}>Click to inspect</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ROUND_1_RESULTS.filter(t => t.domain === 'Smart City' && t.rank === 1).map(team => (
                    <div 
                      key={team.teamName}
                      onClick={() => setSelectedSquad(team)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: '#ffffff',
                        border: '1px solid #fef08a',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      title="Click to view full team roster & contact details"
                    >
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: '#854d0e', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span>{team.teamName}</span>
                          <Eye size={11} color="#a16207" />
                        </div>
                        <div style={{ fontSize: 10.5, color: '#64748b' }}>
                          Capt: {team.leader?.name} &bull; {team.leader?.college?.slice(0, 24)}...
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#854d0e', background: '#fefce8', padding: '2px 6px', borderRadius: 6, border: '1px solid #fef08a' }}>
                        9.0
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rank 2 Tie (7 squads) */}
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 12, border: '1.5px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>🥈</span>
                    <strong style={{ fontSize: 12, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Rank 2 (7-Way Tie &bull; Avg 8.5)
                    </strong>
                  </div>
                  <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 700 }}>7 Squads Tied</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ROUND_1_RESULTS.filter(t => t.domain === 'Smart City' && t.rank === 2).map(team => (
                    <button
                      key={team.teamName}
                      onClick={() => setSelectedSquad(team)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        fontSize: 11.5,
                        fontWeight: 800,
                        color: '#0f172a',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      title={`Capt: ${team.leader?.name} (${team.leader?.college})`}
                    >
                      <span>{team.teamName}</span>
                      <Eye size={10} color="#64748b" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Rank 3 Tie (3 squads) */}
              <div style={{ padding: '12px 14px', background: '#fff7ed', borderRadius: 12, border: '1.5px solid #ffedd5' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>🥉</span>
                    <strong style={{ fontSize: 12, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Rank 3 (3-Way Tie &bull; Avg 8.0)
                    </strong>
                  </div>
                  <span style={{ fontSize: 10.5, color: '#c2410c', fontWeight: 700 }}>3 Squads Tied</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ROUND_1_RESULTS.filter(t => t.domain === 'Smart City' && t.rank === 3).map(team => (
                    <button
                      key={team.teamName}
                      onClick={() => setSelectedSquad(team)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: '#ffffff',
                        border: '1px solid #fed7aa',
                        fontSize: 11.5,
                        fontWeight: 800,
                        color: '#9a3412',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      title={`Capt: ${team.leader?.name} (${team.leader?.college})`}
                    >
                      <span>{team.teamName}</span>
                      <Eye size={10} color="#ea580c" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Agriculture Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1.5px solid #86efac',
            padding: '18px 20px',
            boxShadow: '0 2px 10px rgba(22, 163, 74, 0.04)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>🌾</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#16a34a' }}>Agriculture</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, background: '#f0fdf4', color: '#16a34a', padding: '3px 8px', borderRadius: 6, border: '1px solid #86efac' }}>
                14 Squads
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              {/* Rank 1 */}
              {ROUND_1_RESULTS.filter(t => t.domain === 'Agriculture' && t.rank === 1).map(team => (
                <div 
                  key={team.teamName} 
                  onClick={() => setSelectedSquad(team)}
                  style={{
                    padding: '12px 14px',
                    background: '#fefce8',
                    borderRadius: 12,
                    border: '1.5px solid #fef08a',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  title="Click to view full team roster & contact details"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>🥇</span>
                      <div>
                        <strong style={{ fontSize: 14, color: '#854d0e', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {team.teamName}
                          <Eye size={12} color="#a16207" />
                        </strong>
                        <span style={{ fontSize: 11, color: '#a16207' }}>J1: {team.judge1} | J2: {team.judge2}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: 16, color: '#854d0e', fontWeight: 900 }}>{team.average.toFixed(1)}</strong>
                      <span style={{ fontSize: 10, color: '#a16207', display: 'block', fontWeight: 800 }}>Rank 1</span>
                    </div>
                  </div>
                  {/* Team details snippet */}
                  <div style={{ background: '#ffffff', borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#475569', display: 'flex', flexDirection: 'column', gap: 3, border: '1px solid #fef08a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={11} color="#854d0e" />
                      <strong style={{ color: '#0f172a' }}>Capt: {team.leader?.name}</strong>
                      <span style={{ color: '#64748b' }}>&bull; {team.leader?.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b' }}>
                      <GraduationCap size={11} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{team.leader?.college}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Rank 2 */}
              {ROUND_1_RESULTS.filter(t => t.domain === 'Agriculture' && t.rank === 2).map(team => (
                <div 
                  key={team.teamName} 
                  onClick={() => setSelectedSquad(team)}
                  style={{
                    padding: '12px 14px',
                    background: '#f8fafc',
                    borderRadius: 12,
                    border: '1.5px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  title="Click to view full team roster & contact details"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>🥈</span>
                      <div>
                        <strong style={{ fontSize: 14, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {team.teamName}
                          <Eye size={12} color="#64748b" />
                        </strong>
                        <span style={{ fontSize: 11, color: '#64748b' }}>J1: {team.judge1} | J2: {team.judge2}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: 16, color: '#0f172a', fontWeight: 900 }}>{team.average.toFixed(1)}</strong>
                      <span style={{ fontSize: 10, color: '#64748b', display: 'block', fontWeight: 800 }}>Rank 2</span>
                    </div>
                  </div>
                  {/* Team details snippet */}
                  <div style={{ background: '#ffffff', borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#475569', display: 'flex', flexDirection: 'column', gap: 3, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={11} color="#334155" />
                      <strong style={{ color: '#0f172a' }}>Capt: {team.leader?.name}</strong>
                      <span style={{ color: '#64748b' }}>&bull; {team.leader?.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b' }}>
                      <GraduationCap size={11} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{team.leader?.college}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Rank 3 Tie (3 squads) */}
              <div style={{ padding: '12px 14px', background: '#fff7ed', borderRadius: 12, border: '1.5px solid #ffedd5' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>🥉</span>
                    <strong style={{ fontSize: 12, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Rank 3 (3-Way Tie &bull; Avg 7.0)
                    </strong>
                  </div>
                  <span style={{ fontSize: 10.5, color: '#c2410c', fontWeight: 700 }}>Click to inspect</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ROUND_1_RESULTS.filter(t => t.domain === 'Agriculture' && t.rank === 3).map(team => (
                    <div 
                      key={team.teamName}
                      onClick={() => setSelectedSquad(team)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: '#ffffff',
                        border: '1px solid #fed7aa',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      title="Click to view full team roster & contact details"
                    >
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: '#9a3412', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span>{team.teamName}</span>
                          <Eye size={11} color="#ea580c" />
                        </div>
                        <div style={{ fontSize: 10.5, color: '#64748b' }}>
                          Capt: {team.leader?.name} &bull; {team.leader?.college?.split(' ')[0]}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#9a3412', background: '#fff7ed', padding: '2px 6px', borderRadius: 6, border: '1px solid #fed7aa' }}>
                        7.0
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTROLS & FILTERS ── */}
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
                {dom !== 'All' && (
                  <span style={{
                    fontSize: 11,
                    background: isSelected ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                    color: isSelected ? '#ffffff' : '#64748b',
                    padding: '1px 6px',
                    borderRadius: 6
                  }}>
                    {ROUND_1_RESULTS.filter(t => t.domain === dom).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* View Mode & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Top 3 Qualifiers Only vs All View Toggle */}
          <div style={{
            display: 'inline-flex',
            background: '#f1f5f9',
            padding: 3,
            borderRadius: 10,
            border: '1px solid #e2e8f0'
          }}>
            <button
              onClick={() => setViewMode('top3')}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 800,
                border: 'none',
                background: viewMode === 'top3' ? '#ffffff' : 'transparent',
                color: viewMode === 'top3' ? '#ea580c' : '#64748b',
                boxShadow: viewMode === 'top3' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Trophy size={13} />
              <span>Top 3 Qualifiers ({ROUND_1_RESULTS.filter(t => t.rank <= 3).length})</span>
            </button>
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
              Full Roster (52)
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: 260 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search squad, leader, college..."
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

      {/* ── LEADERBOARD DATA TABLE WITH FULL TEAM DETAILS ── */}
      <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: 980, borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
              <th style={{ padding: '12px 18px', fontWeight: 800, width: 85 }}>Rank</th>
              <th style={{ padding: '12px 18px', fontWeight: 800 }}>Squad &amp; Domain</th>
              <th style={{ padding: '12px 18px', fontWeight: 800 }}>Captain / Leader</th>
              <th style={{ padding: '12px 18px', fontWeight: 800 }}>College / Institution</th>
              <th style={{ padding: '12px 18px', fontWeight: 800, textAlign: 'center', width: 90 }}>Crew</th>
              <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'center', width: 80 }}>J1 (/10)</th>
              <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'center', width: 80 }}>J2 (/10)</th>
              <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'center', width: 95 }}>Average</th>
              <th style={{ padding: '12px 18px', fontWeight: 800, textAlign: 'center', width: 110 }}>Roster</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((team, idx) => {
              const domStyle = DOMAIN_STYLES[team.domain] || DOMAIN_STYLES['Smart City'];
              const isTop3 = team.rank <= 3;
              return (
                <tr 
                  key={team.teamName + idx} 
                  style={{ 
                    borderBottom: '1px solid #f1f5f9',
                    background: isTop3 ? (team.rank === 1 ? '#fefce8' : team.rank === 2 ? '#fafafa' : '#fff7ed') : '#ffffff',
                    transition: 'background 0.15s ease'
                  }}
                >
                  {/* Rank */}
                  <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                    {getRankBadge(team.rank)}
                  </td>

                  {/* Squad Name & Domain */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34,
                        height: 34,
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

                  {/* Captain / Leader Details */}
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

                  {/* College / Institution */}
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
                  <td style={{ padding: '14px 18px', textAlign: 'center' }}>
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

                  {/* Judge 1 */}
                  <td style={{ padding: '14px 14px', textAlign: 'center', color: '#475569', fontWeight: 700 }}>
                    {team.judge1}
                  </td>

                  {/* Judge 2 */}
                  <td style={{ padding: '14px 14px', textAlign: 'center', color: '#475569', fontWeight: 700 }}>
                    {team.judge2}
                  </td>

                  {/* Average */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 900,
                      color: isTop3 ? '#ea580c' : '#0f172a'
                    }}>
                      {team.average.toFixed(1)}
                    </span>
                  </td>

                  {/* Action / View Squad Roster */}
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
                      title="Inspect complete crew members, emails, phones & college"
                    >
                      <Eye size={12} />
                      <span>Details</span>
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
        padding: '14px 28px',
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
          <span>Total Round 1 Participants: <strong>205 Crew Members</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#059669', fontWeight: 800 }}>✓ Official Evaluation Complete</span>
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
              maxWidth: 720,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '2px solid #fed7aa',
              position: 'relative',
              animation: 'fadeIn 0.2s ease-out'
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
                  {getRankBadge(selectedSquad.rank)}
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

            {/* Scorecard Strip */}
            <div style={{
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              padding: '14px 24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              textAlign: 'center'
            }}>
              <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Judge 1: Dr. Akshath</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{selectedSquad.judge1} <span style={{ fontSize: 11, color: '#94a3b8' }}>/ 10</span></div>
              </div>
              <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Judge 2: Vijay Kumar</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{selectedSquad.judge2} <span style={{ fontSize: 11, color: '#94a3b8' }}>/ 10</span></div>
              </div>
              <div style={{ background: '#fff7ed', padding: '10px 12px', borderRadius: 10, border: '1px solid #fed7aa' }}>
                <div style={{ fontSize: 11, color: '#c2410c', fontWeight: 700 }}>Official Average</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#ea580c' }}>{selectedSquad.average.toFixed(1)} <span style={{ fontSize: 11, color: '#c2410c' }}>/ 10</span></div>
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
