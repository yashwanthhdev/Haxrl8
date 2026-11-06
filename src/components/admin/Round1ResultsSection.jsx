import React, { useState, useMemo } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { ROUND_1_RESULTS, getDomainTop3 } from '../../data/round1Results';

const DOMAIN_STYLES = {
  'Healthcare': {
    color: '#e11d48',
    bg: '#fff1f2',
    border: '#fecdd3',
    icon: '🩺',
    badge: 'background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3;'
  },
  'Smart City': {
    color: '#0284c7',
    bg: '#e0f2fe',
    border: '#7dd3fc',
    icon: '🏙️',
    badge: 'background: #e0f2fe; color: #0284c7; border: 1px solid #7dd3fc;'
  },
  'Agriculture': {
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#86efac',
    icon: '🌾',
    badge: 'background: #f0fdf4; color: #16a34a; border: 1px solid #86efac;'
  }
};

export default function Round1ResultsSection() {
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [viewMode, setViewMode] = useState('top3'); // 'top3' or 'all'
  const [searchQuery, setSearchQuery] = useState('');

  const domainTop3 = useMemo(() => getDomainTop3(), []);

  const filteredTeams = useMemo(() => {
    let list = ROUND_1_RESULTS;
    if (selectedDomain !== 'All') {
      list = list.filter(item => item.domain === selectedDomain);
    }
    if (viewMode === 'top3') {
      list = list.filter(item => item.rank <= 3);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => 
        item.teamName.toLowerCase().includes(q) || 
        item.domain.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => {
      if (a.domain !== b.domain) return a.domain.localeCompare(b.domain);
      return a.rank - b.rank || b.average - a.average;
    });
  }, [selectedDomain, viewMode, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Sl', 'Team Name', 'Domain', 'Judge 1 (/10)', 'Judge 2 (/10)', 'Average (/10)', 'Rank', 'Notes'];
    const rows = ROUND_1_RESULTS.map((r, idx) => [
      idx + 1,
      `"${r.teamName}"`,
      `"${r.domain}"`,
      r.judge1,
      r.judge2,
      r.average,
      r.rank,
      `"${r.note || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'HAXLR8_Round_1_Combined_Marks.csv');
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
            width: 48,
            height: 48,
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
              Round 1 Evaluation Results &bull; Domain-Wise Top 3
            </h2>
            <div style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600, marginTop: 3 }}>
              Official Combined Marks &bull; Judge 1 (Dr. Akshath M.J) &amp; Judge 2 (Vijay Kumar M S) &bull; Equal averages share rank
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
        >
          <Download size={15} color="#ea580c" />
          <span>Export All Marks (CSV)</span>
        </button>
      </div>

      {/* ── TOP 3 DOMAIN PODIUM DISPLAY CARDS ── */}
      <div style={{ padding: '24px 28px 16px', background: '#fafafa', borderBottom: '1.5px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={16} color="#ea580c" />
            <span>Top 3 Rank Holders By Domain (Equal Scores Share Same Rank)</span>
          </div>
          <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 700 }}>
            52 Total Evaluated Squads
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16
        }}>
          {/* Healthcare Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1.5px solid #fecdd3',
            padding: '18px 20px',
            boxShadow: '0 2px 10px rgba(225, 29, 72, 0.04)'
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Rank 1 */}
              <div style={{ padding: '10px 12px', background: '#fefce8', borderRadius: 10, border: '1px solid #fef08a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>🥇</span>
                  <div>
                    <strong style={{ fontSize: 13.5, color: '#854d0e', display: 'block' }}>ArogyaKavach</strong>
                    <span style={{ fontSize: 10.5, color: '#a16207' }}>J1: 10 | J2: 10</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: 15, color: '#854d0e', fontWeight: 900 }}>10.0</strong>
                  <span style={{ fontSize: 10, color: '#a16207', display: 'block' }}>Rank 1</span>
                </div>
              </div>

              {/* Rank 2 */}
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>🥈</span>
                  <div>
                    <strong style={{ fontSize: 13.5, color: '#0f172a', display: 'block' }}>Vitara</strong>
                    <span style={{ fontSize: 10.5, color: '#64748b' }}>J1: 10 | J2: 9</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: 15, color: '#0f172a', fontWeight: 900 }}>9.5</strong>
                  <span style={{ fontSize: 10, color: '#64748b', display: 'block' }}>Rank 2</span>
                </div>
              </div>

              {/* Rank 3 Tie */}
              <div style={{ padding: '10px 12px', background: '#fff7ed', borderRadius: 10, border: '1px solid #ffedd5' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>🥉</span>
                    <strong style={{ fontSize: 12, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rank 3 (3-Way Tie &bull; Avg 9.0)</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['PulseForge', 'CareX', 'Team Nova'].map(t => (
                    <span key={t} style={{ fontSize: 12, fontWeight: 800, background: '#ffffff', color: '#9a3412', padding: '3px 8px', borderRadius: 6, border: '1px solid #fed7aa' }}>
                      {t}
                    </span>
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
            boxShadow: '0 2px 10px rgba(2, 132, 199, 0.04)'
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Rank 1 Tie */}
              <div style={{ padding: '10px 12px', background: '#fefce8', borderRadius: 10, border: '1px solid #fef08a' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>🥇</span>
                    <strong style={{ fontSize: 12, color: '#854d0e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rank 1 (2-Way Tie &bull; Avg 9.0)</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['Innovative', 'Vincer'].map(t => (
                    <span key={t} style={{ fontSize: 12, fontWeight: 800, background: '#ffffff', color: '#854d0e', padding: '3px 8px', borderRadius: 6, border: '1px solid #fef08a' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rank 2 Tie */}
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>🥈</span>
                    <strong style={{ fontSize: 12, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rank 2 (7-Way Tie &bull; Avg 8.5)</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {['FusionForge', 'Nexora (N)', 'PRIMORAX', 'Praxion', 'Syntax Error', 'CivicSpark', 'Butane'].map(t => (
                    <span key={t} style={{ fontSize: 11, fontWeight: 800, background: '#ffffff', color: '#0f172a', padding: '2px 7px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rank 3 Tie */}
              <div style={{ padding: '10px 12px', background: '#fff7ed', borderRadius: 10, border: '1px solid #ffedd5' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>🥉</span>
                    <strong style={{ fontSize: 12, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rank 3 (3-Way Tie &bull; Avg 8.0)</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['Nexora (K)', 'CODE STORMS', 'NeonEdge'].map(t => (
                    <span key={t} style={{ fontSize: 11.5, fontWeight: 800, background: '#ffffff', color: '#9a3412', padding: '3px 8px', borderRadius: 6, border: '1px solid #fed7aa' }}>
                      {t}
                    </span>
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
            boxShadow: '0 2px 10px rgba(22, 163, 74, 0.04)'
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Rank 1 */}
              <div style={{ padding: '10px 12px', background: '#fefce8', borderRadius: 10, border: '1px solid #fef08a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>🥇</span>
                  <div>
                    <strong style={{ fontSize: 13.5, color: '#854d0e', display: 'block' }}>Hail Mary</strong>
                    <span style={{ fontSize: 10.5, color: '#a16207' }}>J1: 9 | J2: 9</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: 15, color: '#854d0e', fontWeight: 900 }}>9.0</strong>
                  <span style={{ fontSize: 10, color: '#a16207', display: 'block' }}>Rank 1</span>
                </div>
              </div>

              {/* Rank 2 */}
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>🥈</span>
                  <div>
                    <strong style={{ fontSize: 13.5, color: '#0f172a', display: 'block' }}>Impact makers</strong>
                    <span style={{ fontSize: 10.5, color: '#64748b' }}>J1: 8 | J2: 8</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: 15, color: '#0f172a', fontWeight: 900 }}>8.0</strong>
                  <span style={{ fontSize: 10, color: '#64748b', display: 'block' }}>Rank 2</span>
                </div>
              </div>

              {/* Rank 3 Tie */}
              <div style={{ padding: '10px 12px', background: '#fff7ed', borderRadius: 10, border: '1px solid #ffedd5' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>🥉</span>
                    <strong style={{ fontSize: 12, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rank 3 (3-Way Tie &bull; Avg 7.0)</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['Menace', '4BIT', 'AgriNex'].map(t => (
                    <span key={t} style={{ fontSize: 12, fontWeight: 800, background: '#ffffff', color: '#9a3412', padding: '3px 8px', borderRadius: 6, border: '1px solid #fed7aa' }}>
                      {t}
                    </span>
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
                  transition: 'all 0.15s ease'
                }}
              >
                {dom === 'All' ? '🌐 All Domains (52)' : dom}
              </button>
            );
          })}
        </div>

        {/* View Mode & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: 3, borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setViewMode('top3')}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 800,
                border: 'none',
                background: viewMode === 'top3' ? '#ffffff' : 'transparent',
                color: viewMode === 'top3' ? '#0f172a' : '#64748b',
                boxShadow: viewMode === 'top3' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer'
              }}
            >
              Top 3 Qualifiers
            </button>
            <button
              onClick={() => setViewMode('all')}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 800,
                border: 'none',
                background: viewMode === 'all' ? '#ffffff' : 'transparent',
                color: viewMode === 'all' ? '#0f172a' : '#64748b',
                boxShadow: viewMode === 'all' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer'
              }}
            >
              Full Roster (52)
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search squad name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '7px 12px 7px 32px',
                borderRadius: 10,
                border: '1.5px solid #cbd5e1',
                fontSize: 12,
                fontFamily: 'inherit',
                width: 190,
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* ── DETAILED MARKS TABLE ── */}
      <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', fontSize: 12.5, textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#64748b', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '12px 18px', width: 100 }}>Rank</th>
              <th style={{ padding: '12px 18px' }}>Squad / Team Name</th>
              <th style={{ padding: '12px 18px' }}>Domain</th>
              <th style={{ padding: '12px 18px', textAlign: 'center' }}>Judge 1 (/10)</th>
              <th style={{ padding: '12px 18px', textAlign: 'center' }}>Judge 2 (/10)</th>
              <th style={{ padding: '12px 18px', textAlign: 'center' }}>Average (/10)</th>
              <th style={{ padding: '12px 18px', textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((team, idx) => {
              const dStyle = DOMAIN_STYLES[team.domain] || { color: '#0f172a', bg: '#f8fafc', border: '#e2e8f0' };
              const isTopRank = team.rank === 1;
              const isTop3 = team.rank <= 3;

              return (
                <tr 
                  key={`${team.domain}-${team.teamName}-${idx}`}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: isTopRank ? '#fefce8' : (isTop3 ? (idx % 2 === 0 ? '#ffffff' : '#fafafa') : '#ffffff'),
                    transition: 'background 0.15s ease'
                  }}
                >
                  {/* Rank */}
                  <td style={{ padding: '12px 18px', whiteSpace: 'nowrap' }}>
                    {getRankBadge(team.rank)}
                  </td>

                  {/* Team Name */}
                  <td style={{ padding: '12px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <strong style={{ fontSize: 13.5, color: '#0f172a' }}>{team.teamName}</strong>
                      {team.note && (
                        <span style={{ fontSize: 10.5, color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>
                          {team.note}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Domain */}
                  <td style={{ padding: '12px 18px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: dStyle.color,
                      background: dStyle.bg,
                      padding: '3px 10px',
                      borderRadius: 100,
                      border: `1px solid ${dStyle.border}`
                    }}>
                      {dStyle.icon} {team.domain}
                    </span>
                  </td>

                  {/* Judge 1 */}
                  <td style={{ padding: '12px 18px', textAlign: 'center', fontWeight: 800, color: '#334155', fontFamily: 'monospace', fontSize: 13 }}>
                    {team.judge1}
                  </td>

                  {/* Judge 2 */}
                  <td style={{ padding: '12px 18px', textAlign: 'center', fontWeight: 800, color: '#334155', fontFamily: 'monospace', fontSize: 13 }}>
                    {team.judge2}
                  </td>

                  {/* Average */}
                  <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                    <strong style={{
                      fontSize: 14,
                      fontWeight: 900,
                      color: isTopRank ? '#854d0e' : (isTop3 ? '#0f172a' : '#64748b'),
                      fontFamily: 'monospace'
                    }}>
                      {team.average.toFixed(1)}
                    </strong>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                    {isTop3 ? (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 900,
                        background: '#dcfce7',
                        color: '#15803d',
                        padding: '3px 8px',
                        borderRadius: 6,
                        border: '1px solid #bbf7d0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3
                      }}>
                        <CheckCircle2 size={12} /> Top 3 Qualifier
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>
                        Round 1 Finished
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer info note */}
      <div style={{
        padding: '12px 28px',
        background: '#f8fafc',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 11.5,
        color: '#64748b',
        flexWrap: 'wrap',
        gap: 8
      }}>
        <div>
          Showing <strong>{filteredTeams.length}</strong> squads &bull; Ranking rule: Rank 1 = highest average; equal averages share a rank position.
        </div>
        <div style={{ color: '#0f172a', fontWeight: 700 }}>
          🔒 Restricted to Organizer Admin Dashboard
        </div>
      </div>
    </div>
  );
}
