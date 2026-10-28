import { useState } from 'react';
import { Calendar, Clock, UserCheck, Sparkles, Radio } from 'lucide-react';

const EVENTS = [
  { date: 'Oct 09',    event: 'Registration Opens',               status: 'active',   desc: 'Squad registration opens for undergraduate students across India.', time: '06:00 PM IST' },
  { date: 'Closed',    event: 'Squad Registration Closed', status: 'done', desc: 'Registrations are officially closed. All squad spots are filled.', time: 'Complete' },
  { date: 'Nov 03',    event: 'Flight Passes & Venue Briefing',   status: 'upcoming', desc: 'Official checkpoint passes & offline hackathon briefing released to all squads.', time: '12:00 PM IST' },
  { date: 'Nov 06–07', event: 'Grand Finale & 24H Hackathon',      status: 'upcoming', desc: '24-hour offline hackathon and live showcase at Maharaja Institute of Technology Mysore.', time: '09:00 AM IST' },
];

const MENTORS = [
  { name: 'Dr. Prathiba N.',  role: 'Azure AI Specialist',     slots: '3 slots left',  color: '#ea580c' },
  { name: 'Karan Mehta',      role: 'Product Strategy',        slots: '1 slot left',   color: '#0284c7' },
  { name: 'Ananya Krishnan',  role: 'UX & Interaction Design', slots: '5 slots left',  color: '#d97706' },
  { name: 'Vikram Iyer',      role: 'IoT & Embedded Hardware', slots: 'Fully booked',  color: '#e11d48' },
];

const STATUS_STYLE = {
  done:     { dot: '#16a34a', line: '#16a34a', label: 'Completed',   labelColor: '#166534', labelBg: '#dcfce7', labelBorder: '#bbf7d0' },
  active:   { dot: '#ff3b69', line: '#fed7aa', label: 'In Progress', labelColor: '#9f1239', labelBg: '#ffe4e6', labelBorder: '#fecaca' },
  upcoming: { dot: '#cbd5e1', line: '#f1e7db', label: 'Upcoming',   labelColor: '#475569', labelBg: '#f1f5f9', labelBorder: '#e2e8f0' },
};

export default function ScheduleTab() {
  const [booked, setBooked] = useState({});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="dash-grid-2" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
        
        {/* Timeline */}
        <div 
          className="dash-card" 
          style={{ 
            background: '#ffffff', 
            borderRadius: 22, 
            padding: '28px', 
            boxShadow: '0 6px 20px rgba(0,0,0,0.04)', 
            border: '2px solid #fed7aa',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff3b69', boxShadow: '0 0 10px rgba(255,59,105,0.4)' }} />
            <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em' }}>
              Full Mission Flight Schedule
            </div>
          </div>

          {EVENTS.map((ev, i) => {
            const s = STATUS_STYLE[ev.status];
            return (
              <div key={i} style={{ display: 'flex', gap: 18, paddingBottom: i < EVENTS.length - 1 ? 26 : 0, position: 'relative' }}>
                {i < EVENTS.length - 1 && (
                  <div style={{ position: 'absolute', left: 10, top: 24, width: 2, bottom: 0, background: '#f1e7db' }}>
                    <div style={{ width: '100%', height: EVENTS[i].status === 'done' ? '100%' : '0%', background: '#16a34a', transition: 'height 0.4s ease' }} />
                  </div>
                )}
                <div style={{ 
                  width: 22, height: 22, borderRadius: '50%', 
                  background: s.dot, flexShrink: 0, zIndex: 1, marginTop: 2, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  boxShadow: ev.status === 'active' ? '0 0 12px rgba(255, 59, 105, 0.4)' : 'none' 
                }}>
                  {ev.status === 'done' && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a' }}>{ev.event}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: s.labelColor, background: s.labelBg, padding: '2px 10px', borderRadius: 20, border: `1px solid ${s.labelBorder}`, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {s.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#ea580c', marginBottom: 4, fontWeight: 800 }}>
                    {ev.date} · {ev.time}
                  </div>
                  <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                    {ev.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mentors & Countdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div 
            className="dash-card" 
            style={{ 
              background: '#ffffff', 
              borderRadius: 22, 
              padding: '24px', 
              boxShadow: '0 6px 20px rgba(0,0,0,0.04)', 
              border: '2px solid #fed7aa',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ea580c' }} />
              <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a' }}>
                Star Base Mentorship Pods
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MENTORS.map((m, i) => {
                const full = m.slots === 'Fully booked';
                const bk   = booked[i];
                return (
                  <div 
                    key={i} 
                    style={{ 
                      padding: '14px 16px', 
                      background: '#f8fafc', 
                      borderRadius: 14, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 14,
                      border: '1.5px solid #e2e8f0',
                    }}
                  >
                    <div style={{ 
                      width: 38, height: 38, borderRadius: '50%', 
                      background: full ? '#f1f5f9' : '#fff7ed', 
                      border: `1.5px solid ${full ? '#cbd5e1' : '#fed7aa'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      color: full ? '#94a3b8' : '#ea580c', 
                      fontWeight: 900, fontSize: 14, flexShrink: 0 
                    }}>
                      {m.name[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{m.role}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: 10, 
                        color: full ? '#b91c1c' : bk ? '#15803d' : '#64748b', 
                        fontWeight: 800, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' 
                      }}>
                        {bk ? 'Locked In ✓' : m.slots}
                      </div>
                      <button 
                        onClick={() => !full && setBooked(p => ({ ...p, [i]: !p[i] }))}
                        style={{ 
                          fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 8, 
                          border: full ? '1px solid #e2e8f0' : bk ? '1px solid #16a34a' : '1px solid #fed7aa', 
                          background: full ? '#f1f5f9' : bk ? '#dcfce7' : '#fff7ed', 
                          color: full ? '#94a3b8' : bk ? '#15803d' : '#ea580c', 
                          cursor: full ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                        }}
                        disabled={full}
                      >
                        {full ? 'Filled' : bk ? 'Cancel' : 'Book Pod'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Countdown Card */}
          <div 
            className="dash-card" 
            style={{ 
              background: 'linear-gradient(135deg, #fff1f2 0%, #fff7ed 100%)', 
              borderRadius: 22, 
              padding: '24px', 
              boxShadow: '0 6px 20px rgba(0,0,0,0.04)', 
              color: '#0f172a',
              border: '2px solid #fecaca',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              COUNTDOWN TO LAUNCH
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em', color: '#ff3b69' }}>
              Nov 06–07
            </div>
            <div style={{ fontSize: 13, color: '#475569', marginTop: 4, fontWeight: 600 }}>
              Grand Offline Finale · 24-Hour Hackathon · MIT Mysore
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              {['09:00 AM Station Sync', 'Live Pitch Decks', '₹40,000 Bounty Ceremony'].map((t, i) => (
                <span key={i} style={{ fontSize: 11, fontWeight: 800, color: '#9f1239', background: '#ffe4e6', border: '1px solid #fecaca', padding: '5px 12px', borderRadius: 20 }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
