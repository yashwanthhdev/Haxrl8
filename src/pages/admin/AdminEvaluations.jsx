import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { isOrganizerAuthorized } from './adminAuth';
import { resolveDomain } from '../../lib/domainUtils';
import { Search, ChevronRight, Download, Eye, X, CheckCircle, Clock, MapPin, Users, Building, Laptop } from 'lucide-react';

const S = {
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E5E7EB', primary: '#0284C7',
  t1: '#0F172A', t2: '#64748B', t3: '#94A3B8', green: '#16A34A',
  activeBg: '#E0F2FE', radius: '14px', pad: '24px', gap: '20px',
};

export default function AdminEvaluations() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [teamsList, setTeamsList] = useState([]);
  const [checkedInMap, setCheckedInMap] = useState({});
  
  // Filters and Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All Squads');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [tabCounts, setTabCounts] = useState({ all: 0, checkedIn: 0, pending: 0 });
  const [totalFilteredCount, setTotalFilteredCount] = useState(0);
  const [selectedSquad, setSelectedSquad] = useState(null);

  // Load check-in state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('haxlr8_finale_checkins');
      if (saved) setCheckedInMap(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const { count: total } = await supabase.from('teams').select('*', { count: 'exact', head: true });
      const saved = JSON.parse(localStorage.getItem('haxlr8_finale_checkins') || '{}');
      const checkedCount = Object.values(saved).filter(Boolean).length;
      setTabCounts({
        all: total || 0,
        checkedIn: checkedCount,
        pending: Math.max(0, (total || 0) - checkedCount)
      });
    } catch (e) {
      console.warn('Fetch count notice:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const authorized = await isOrganizerAuthorized();
      if (authorized) {
        setIsAdmin(true);
        fetchData();
      } else {
        window.dispatchEvent(new Event('haxlr8_organizer_logout'));
      }
    };
    checkAuth();
  }, [fetchData]);

  const toggleCheckIn = (teamId) => {
    setCheckedInMap(prev => {
      const updated = { ...prev, [teamId]: !prev[teamId] };
      localStorage.setItem('haxlr8_finale_checkins', JSON.stringify(updated));
      const checkedCount = Object.values(updated).filter(Boolean).length;
      setTabCounts(c => ({
        ...c,
        checkedIn: checkedCount,
        pending: Math.max(0, c.all - checkedCount)
      }));
      return updated;
    });
  };

  const buildQuery = (isExport = false) => {
    let query = supabase.from('teams').select('*', { count: 'exact' });
    
    if (searchTerm) {
      const safeTerm = searchTerm.replace(/[%_\*()]/g, '');
      query = query.ilike('team_name', `%${safeTerm}%`);
    }

    if (!isExport) {
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);
    }
    
    return query.order('created_at', { ascending: false });
  };

  useEffect(() => {
    if (loading || !isAdmin) return;
    const fetchPage = async () => {
      const query = buildQuery(false);
      const { data: pageTeams, count } = await query;
      if (pageTeams && pageTeams.length > 0) {
        const teamIds = pageTeams.map(t => t.id);
        const [{ data: m }, { data: s }] = await Promise.all([
          supabase.from('team_members').select('*').in('team_id', teamIds),
          supabase.from('submissions').select('*').in('team_id', teamIds)
        ]);

        const processed = pageTeams.map((team, index) => {
          const teamMems = (m || []).filter(mem => mem.team_id === team.id);
          const sub = (s || []).find(subItem => subItem.team_id === team.id);
          const lead = teamMems.find(mem => mem.is_leader === true) || teamMems[0] || null;

          return {
            id: team.id,
            teamName: team.team_name || 'Unnamed Squad',
            domain: resolveDomain(team, sub, null, 'General Innovation'),
            leaderName: lead?.full_name || 'N/A',
            leaderEmail: lead?.email || 'N/A',
            leaderPhone: lead?.phone_number || 'N/A',
            collegeName: lead?.college_name || 'N/A',
            members: teamMems,
            membersCount: teamMems.length || 1,
            tableNumber: `Station B-${((index + 1) * 3).toString().padStart(2, '0')}`,
            date: team.created_at || new Date().toISOString()
          };
        });
        setTeamsList(processed);
      } else {
        setTeamsList([]);
      }
      if (count !== null) setTotalFilteredCount(count);
    };
    fetchPage();
  }, [loading, isAdmin, currentPage, searchTerm, activeTab]);

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg}}><div style={{width:40,height:40,border:'3px solid '+S.primary,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/></div>;
  if (!isAdmin) {
    return (
      <div style={{minHeight:'60vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,padding:24}}>
        <div style={{fontSize:16,fontWeight:800,color:'#b91c1c'}}>Organizer Clearance Required</div>
        <button onClick={() => window.dispatchEvent(new Event('haxlr8_organizer_logout'))} style={{padding:'10px 18px',borderRadius:10,background:'#0284c7',color:'#fff',border:'none',fontWeight:800,cursor:'pointer'}}>
          Unlock Master Command Deck 🚀
        </button>
      </div>
    );
  }

  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage);

  const handleExport = async () => {
    const query = buildQuery(true);
    const { data } = await query;
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }
    const teamIds = data.map(t => t.id);
    const [{ data: m }, { data: s }] = await Promise.all([
      supabase.from('team_members').select('*').in('team_id', teamIds),
      supabase.from('submissions').select('*').in('team_id', teamIds)
    ]);

    const headers = ['S.No', 'Squad Name', 'Domain', 'Squad Commander', 'Email', 'Phone', 'College', 'Crew Count', 'Assigned Workstation', 'On-Site Attendance', 'Registered On'];
    const csvRows = [headers.join(',')];

    data.forEach((t, i) => {
      const teamMems = (m || []).filter(mem => mem.team_id === t.id);
      const sub = (s || []).find(subItem => subItem.team_id === t.id);
      const lead = teamMems.find(mem => mem.is_leader === true) || teamMems[0] || null;
      const isHere = !!checkedInMap[t.id];

      csvRows.push([
        i + 1,
        `"${t.team_name || ''}"`,
        `"${resolveDomain(t, sub, null, 'General Innovation')}"`,
        `"${lead?.full_name || ''}"`,
        `"${lead?.email || ''}"`,
        `"${lead?.phone_number || ''}"`,
        `"${lead?.college_name || ''}"`,
        teamMems.length || 1,
        `"Station B-${((i + 1) * 3).toString().padStart(2, '0')}"`,
        `"${isHere ? 'Checked-In (Present)' : 'Awaiting Check-in'}"`,
        `"${new Date(t.created_at || new Date()).toLocaleDateString()}"`
      ].join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "finale_checkin_manifest.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { label: 'All Squads', count: tabCounts.all, bg: '#F1F5F9', color: '#64748B' },
    { label: 'Checked In (On-Site)', count: tabCounts.checkedIn, bg: '#DCFCE7', color: '#16A34A' },
    { label: 'Awaiting Check-in', count: tabCounts.pending, bg: '#FEF3C7', color: '#D97706' },
  ];

  return (
    <>
      <header style={{ height:64, background:S.card, borderBottom:'1px solid '+S.border, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div>
            <h1 style={{ fontSize:18, fontWeight:700, margin:0, color:S.t1 }}>Grand Finale Desk &amp; Station Check-in</h1>
            <div style={{ fontSize:11, fontWeight:500, color:S.t2, display:'flex', alignItems:'center', gap:4 }}>Home <ChevronRight size={12}/> <span style={{color:S.t1}}>Check-in</span></div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, borderLeft:'1px solid '+S.border, paddingLeft:20, cursor:'pointer' }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'#059669', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:14 }}>A</div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:S.t1 }}>Admin User</div>
              <div style={{ fontSize:11, fontWeight:500, color:S.t2 }}>Super Admin</div>
            </div>
          </div>
        </div>
      </header>

      <div style={{ flex:1, overflowY:'auto', padding:S.pad }}>
        <div style={{ display:'flex', flexDirection:'column', gap:S.gap }}>
          
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
            <div>
              <h2 style={{ fontSize:22, fontWeight:800, color:S.t1, margin:'0 0 6px' }}>On-Site Venue Desk (MIT Mysore)</h2>
              <p style={{ fontSize:13, color:S.t2, margin:0 }}>November 6–7, 2026 Grand Finale. Verify physical college ID cards, assign workstations, and confirm attendance.</p>
            </div>
            <button onClick={handleExport} style={{ display:'flex', alignItems:'center', gap:8, background:S.card, color:S.t1, border:'1px solid '+S.border, padding:'10px 16px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', boxShadow:'0 1px 2px rgba(0,0,0,.05)' }}>
              <Download size={16}/> Export Attendance Sheet
            </button>
          </div>

          <div style={{ background:S.card, border:'1px solid '+S.border, borderRadius:S.radius, boxShadow:'0 1px 3px rgba(0,0,0,.04)', display:'flex', flexDirection:'column' }}>
            
            <div style={{ padding:'20px', borderBottom:'1px solid '+S.border, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, flexWrap:'wrap' }}>
                <div style={{ position:'relative', minWidth:260 }}>
                  <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:S.t3 }}/>
                  <input 
                    placeholder="Search by squad name..." 
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft:36, paddingRight:16, paddingTop:10, paddingBottom:10, background:S.card, border:'1px solid '+S.border, borderRadius:8, fontSize:13, width:'100%', outline:'none', color:S.t1 }}
                  />
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                <span onClick={() => setSearchTerm('')} style={{ fontSize:13, fontWeight:600, color:S.t2, cursor:'pointer' }}>Clear Filters</span>
              </div>
            </div>

            <div style={{ padding:'0 20px', borderBottom:'1px solid '+S.border, display:'flex', gap:24 }}>
              {tabs.map((t, i) => (
                <div 
                  key={i} 
                  onClick={() => { setActiveTab(t.label); setCurrentPage(1); }}
                  style={{ 
                    padding:'16px 0', 
                    fontSize:14, 
                    fontWeight: activeTab === t.label ? 700 : 500, 
                    color: activeTab === t.label ? S.primary : S.t2, 
                    borderBottom: activeTab === t.label ? '2px solid '+S.primary : '2px solid transparent',
                    cursor:'pointer',
                    display:'flex',
                    alignItems:'center',
                    gap:8
                  }}
                >
                  {t.label}
                  <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:t.bg, color:t.color, fontWeight:700 }}>{t.count}</span>
                </div>
              ))}
            </div>

            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ background:'#FAFAFA', borderBottom:'1px solid '+S.border }}>
                    {['S.No', 'Squad Name', 'Domain', 'Commander', 'Crew Size', 'Workstation', 'On-Site Status', 'Desk Action'].map(h => (
                      <th key={h} style={{ padding:'16px 20px', fontWeight:600, color:S.t2, textAlign:'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teamsList.map((sq, index) => {
                    const isChecked = !!checkedInMap[sq.id];
                    return (
                      <tr key={sq.id} style={{ borderBottom:'1px solid #F8FAFC' }}>
                        <td style={{ padding:'16px 20px', color:S.t2, fontSize:12, fontWeight:600 }}>
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td style={{ padding:'16px 20px' }}>
                          <div style={{ fontWeight:700, color:S.t1 }}>{sq.teamName}</div>
                          <div style={{ fontSize:11, color:S.t3 }}>ID: {sq.id.substring(0,8)}...</div>
                        </td>
                        <td style={{ padding:'16px 20px' }}>
                          <span style={{ padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:800, background:'#E0F2FE', color:'#0369A1', border:'1px solid #BAE6FD' }}>
                            {sq.domain}
                          </span>
                        </td>
                        <td style={{ padding:'16px 20px' }}>
                          <div style={{ fontWeight:600, color:S.t1, fontSize:12 }}>{sq.leaderName}</div>
                          <div style={{ fontSize:11, color:S.t3 }}>{sq.leaderEmail}</div>
                        </td>
                        <td style={{ padding:'16px 20px', fontWeight:700, color:'#334155' }}>
                          {sq.membersCount} Crew
                        </td>
                        <td style={{ padding:'16px 20px', fontWeight:800, color:'#0284C7' }}>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:'#F0F9FF', padding:'4px 10px', borderRadius:8, border:'1px solid #BAE6FD' }}>
                            <Laptop size={13} /> {sq.tableNumber}
                          </span>
                        </td>
                        <td style={{ padding:'16px 20px' }}>
                          {isChecked ? (
                            <span style={{ padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:800, background:'#DCFCE7', color:'#15803D', border:'1px solid #86EFAC', display:'inline-flex', alignItems:'center', gap:4 }}>
                              <CheckCircle size={13} /> Checked In
                            </span>
                          ) : (
                            <span style={{ padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:800, background:'#FEF3C7', color:'#D97706', border:'1px solid #FDE68A', display:'inline-flex', alignItems:'center', gap:4 }}>
                              <Clock size={13} /> Awaiting Arrival
                            </span>
                          )}
                        </td>
                        <td style={{ padding:'16px 20px' }}>
                          <div style={{ display:'flex', gap:8 }}>
                            <button 
                              onClick={() => toggleCheckIn(sq.id)}
                              style={{ 
                                padding:'6px 12px', 
                                borderRadius:8, 
                                background: isChecked ? '#FEF2F2' : '#DCFCE7', 
                                border: `1px solid ${isChecked ? '#FECACA' : '#86EFAC'}`, 
                                color: isChecked ? '#B91C1C' : '#15803D', 
                                fontWeight:800, 
                                fontSize:11, 
                                cursor:'pointer' 
                              }}
                            >
                              {isChecked ? 'Undo Check-in' : 'Mark Checked-In ✓'}
                            </button>
                            <button 
                              onClick={() => setSelectedSquad(sq)}
                              style={{ padding:'6px 10px', borderRadius:8, background:'#F8FAFC', border:'1px solid #E2E8F0', color:'#475569', fontWeight:700, fontSize:11, cursor:'pointer' }}
                            >
                              <Eye size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {teamsList.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ padding:'40px 20px', textAlign:'center', color:S.t3 }}>No squads found matching query.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ padding:'16px 20px', borderTop:'1px solid '+S.border, display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13 }}>
              <div style={{ color:S.t2, fontWeight:500 }}>Showing {totalFilteredCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalFilteredCount)} of {totalFilteredCount} squads</div>
              {totalPages > 1 && (
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ background:S.card, border:'1px solid '+S.border, borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color: currentPage === 1 ? S.border : S.t3, cursor: currentPage === 1 ? 'default' : 'pointer' }}>&lt;</button>
                  <span style={{ fontSize:12, fontWeight:700, color:S.t1, padding:'0 8px' }}>Page {currentPage} of {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ background:S.card, border:'1px solid '+S.border, borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color: currentPage === totalPages ? S.border : S.t3, cursor: currentPage === totalPages ? 'default' : 'pointer' }}>&gt;</button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* SQUAD DETAILS MODAL */}
      {selectedSquad && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15, 23, 42, 0.45)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99999, padding:20 }}>
          <div style={{ background:'#fff', borderRadius:20, maxWidth:580, width:'100%', maxHeight:'85vh', overflowY:'auto', padding:'24px', boxShadow:'0 20px 40px rgba(0,0,0,0.15)', border:'2px solid #BAE6FD' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, borderBottom:'1px solid #E2E8F0', paddingBottom:14 }}>
              <div>
                <h3 style={{ margin:0, fontSize:18, fontWeight:800, color:'#0F172A' }}>{selectedSquad.teamName}</h3>
                <div style={{ fontSize:12, color:'#0284C7', fontWeight:700, marginTop:3 }}>{selectedSquad.domain} · Assigned Station: {selectedSquad.tableNumber}</div>
              </div>
              <button onClick={() => setSelectedSquad(null)} style={{ background:'none', border:'none', cursor:'pointer', padding:4, color:'#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize:13, fontWeight:800, color:'#0F172A', marginBottom:10 }}>Crew Manifest ({selectedSquad.members.length} Members):</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
              {selectedSquad.members.map((m, i) => (
                <div key={m.id || i} style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:12, padding:'12px 14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                    <div style={{ fontWeight:800, color:'#0F172A', fontSize:13 }}>
                      {m.full_name} {m.is_leader && <span style={{ background:'#FEF3C7', color:'#B45309', padding:'1px 6px', borderRadius:6, fontSize:10, marginLeft:6 }}>Commander</span>}
                    </div>
                    <span style={{ fontSize:11, color:'#64748B' }}>{m.dept || 'Engineering'} · {m.year || '3rd Year'}</span>
                  </div>
                  <div style={{ fontSize:12, color:'#475569' }}>📧 {m.email} · 📱 {m.phone_number || 'N/A'}</div>
                  <div style={{ fontSize:11, color:'#94A3B8', marginTop:3 }}>🏛️ {m.college_name || 'N/A'} · USN: {m.reg_no || 'N/A'}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button 
                onClick={() => {
                  toggleCheckIn(selectedSquad.id);
                  setSelectedSquad(null);
                }} 
                style={{ padding:'9px 18px', borderRadius:10, background: checkedInMap[selectedSquad.id] ? '#FEF2F2' : '#059669', color: checkedInMap[selectedSquad.id] ? '#B91C1C' : '#fff', border:'none', fontWeight:800, fontSize:13, cursor:'pointer' }}
              >
                {checkedInMap[selectedSquad.id] ? 'Undo Check-in' : 'Mark Checked-In at Venue ✓'}
              </button>
              <button onClick={() => setSelectedSquad(null)} style={{ padding:'9px 16px', borderRadius:10, background:'#F1F5F9', color:'#334155', border:'none', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
