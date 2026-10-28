import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { isOrganizerAuthorized } from './adminAuth';
import { resolveDomain } from '../../lib/domainUtils';
import { Search, Download, FileText, LayoutDashboard, LogOut } from 'lucide-react';
import * as XLSX from 'xlsx';

const S = {
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E5E7EB', primary: '#6C4EFF',
  t1: '#111827', t2: '#6B7280', t3: '#9CA3AF', activeBg: '#EEE8FF',
  radius: '14px', pad: '24px', gap: '20px',
};

export default function AdminJury() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [loading, setLoading] = useState(true);
  
  const [submissions, setSubmissions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAll = async (table, orderCol) => {
    let allData = [];
    let from = 0;
    const step = 1000;
    while (true) {
      let query = supabase.from(table).select('*').range(from, from + step - 1);
      if (orderCol) query = query.order(orderCol, { ascending: false });
      const { data, error } = await query;
      if (error) break;
      if (data) allData = [...allData, ...data];
      if (!data || data.length < step) break;
      from += step;
    }
    return allData;
  };

  const fetchData = useCallback(async () => {
    // Fetch all submissions
    const subs = await fetchAll('submissions', 'created_at');
    
    // Fetch all teams
    const tms = await fetchAll('teams');
    
    // Fetch all team members
    const mbrs = await fetchAll('team_members');
    
    if (subs) setSubmissions(subs);
    if (tms) setTeams(tms);
    if (mbrs) setMembers(mbrs);
    
    setLoading(false);
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

  // Process data for all registered squads
  const processedData = teams.map((team, index) => {
    const sub = submissions.find(s => s.team_id === team.id);
    const teamMembers = members.filter(m => m.team_id === team.id);
    
    const tl = teamMembers.find(m => m.is_leader) || teamMembers[0] || null;
    const otherMembers = teamMembers.filter(m => m.id !== tl?.id);
    
    const tm1 = otherMembers[0] || null;
    const tm2 = otherMembers[1] || null;
    const tm3 = otherMembers[2] || null;
    const track = resolveDomain(team, sub, null, 'General');

    return {
      sNo: index + 1,
      teamName: team?.team_name || 'N/A',
      domain: track,
      tlName: tl?.full_name || 'N/A',
      tlEmail: tl?.email || 'N/A',
      tlPhone: tl?.phone_number || 'N/A',
      tm1Name: tm1?.full_name || '-',
      tm1Email: tm1?.email || '-',
      tm1Phone: tm1?.phone_number || '-',
      tm2Name: tm2?.full_name || '-',
      tm2Email: tm2?.email || '-',
      tm2Phone: tm2?.phone_number || '-',
      tm3Name: tm3?.full_name || '-',
      tm3Email: tm3?.email || '-',
      tm3Phone: tm3?.phone_number || '-',
      collegeName: tl?.college_name || 'N/A',
      location: tl?.location || 'N/A',
      crewCount: teamMembers.length || 1,
      regFee: '₹1,200',
      status: 'Finale Ready',
      submitDate: team.created_at ? new Date(team.created_at).toLocaleDateString() : '-'
    };
  });

  const filteredData = processedData.filter(d => 
    d.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.tlName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.tlEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportExcel = () => {
    const headers = [
      "Sl No", "Team Name", "Domain", "Team Lead", "Team Members", "Members Count",
      "Payment Transaction ID", "Phone", "Date and Time of Registration"
    ];

    const excelData = filteredData.map((row, i) => {
      const memberNames = [row.tlName, row.tm1Name, row.tm2Name, row.tm3Name]
        .filter(n => n && n !== 'N/A' && n !== '-')
        .join(', ');

      return [
        i + 1,
        row.teamName,
        row.domain || 'General',
        row.tlName,
        memberNames || row.tlName,
        row.crewCount,
        row.regFee || '₹1,200 Verified',
        row.tlPhone || 'N/A',
        row.submitDate || 'N/A'
      ];
    });

    excelData.unshift(headers);

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    worksheet['!cols'] = [
      { wch: 8 },  // Sl No
      { wch: 28 }, // Team Name
      { wch: 20 }, // Domain
      { wch: 24 }, // Team Lead
      { wch: 50 }, // Team Members
      { wch: 14 }, // Members Count
      { wch: 24 }, // Payment Transaction ID
      { wch: 16 }, // Phone
      { wch: 22 }, // Date and Time
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teams Roster");

    XLSX.writeFile(workbook, "haxlr8_teams_registered.xlsx");
  };

  return (
    <>
        {/* TOP NAV */}
        <header style={{ height:64, background:S.card, borderBottom:'1px solid '+S.border, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div>
              <h1 style={{ fontSize:18, fontWeight:700, margin:0, color:S.t1 }}>Jury (Excel Export)</h1>
              <div style={{ fontSize:11, fontWeight:500, color:S.t2 }}>Export comprehensive team details for jury evaluation</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, borderLeft:'1px solid '+S.border, paddingLeft:20, cursor:'pointer' }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:'#059669', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:14 }}>A</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:S.t1 }}>{adminName}</div>
                <div style={{ fontSize:11, fontWeight:500, color:S.t2 }}>Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div style={{ flex:1, overflowY:'auto', padding:S.pad, display:'flex', flexDirection:'column', gap:S.gap }}>
          
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
            <div>
              <h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>Submissions for Jury</h2>
              <p style={{ fontSize:13, color:S.t2, margin:'4px 0 0' }}>Total Submissions: <strong style={{color:S.primary}}>{filteredData.length}</strong></p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button onClick={exportExcel} style={{ display:'flex', alignItems:'center', gap:6, background:S.primary, color:'#fff', border:'none', padding:'10px 16px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', boxShadow:'0 4px 12px rgba(108,78,255,0.2)' }}>
                <Download size={16}/> Export Excel
              </button>
            </div>
          </div>

          <div style={{ background:S.card, border:'1px solid '+S.border, borderRadius:S.radius, boxShadow:'0 1px 3px rgba(0,0,0,.04)', display:'flex', flexDirection:'column' }}>
            
            <div style={{ padding:'20px', borderBottom:'1px solid '+S.border, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, flexWrap:'wrap' }}>
                <div style={{ position:'relative', minWidth:260 }}>
                  <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:S.t3 }}/>
                  <input 
                    placeholder="Search by squad name, domain, or commander..." 
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft:36, paddingRight:16, paddingTop:10, paddingBottom:10, background:S.card, border:'1px solid '+S.border, borderRadius:8, fontSize:13, width:'100%', outline:'none', color:S.t1 }}
                  />
                </div>
              </div>
            </div>

            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ background:'#FAFAFA', borderBottom:'1px solid '+S.border }}>
                    <th style={{ padding:'16px 20px', fontWeight:600, color:S.t2, textAlign:'left' }}>S.No</th>
                    <th style={{ padding:'16px 20px', fontWeight:600, color:S.t2, textAlign:'left' }}>Squad Name</th>
                    <th style={{ padding:'16px 20px', fontWeight:600, color:S.t2, textAlign:'left' }}>Domain</th>
                    <th style={{ padding:'16px 20px', fontWeight:600, color:S.t2, textAlign:'left' }}>Squad Commander</th>
                    <th style={{ padding:'16px 20px', fontWeight:600, color:S.t2, textAlign:'left' }}>Crew Count</th>
                    <th style={{ padding:'16px 20px', fontWeight:600, color:S.t2, textAlign:'left' }}>College &amp; Location</th>
                    <th style={{ padding:'16px 20px', fontWeight:600, color:S.t2, textAlign:'left' }}>Finale Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 50).map((row, i) => (
                    <tr key={i} style={{ borderBottom:'1px solid #F8FAFC' }}>
                      <td style={{ padding:'16px 20px', color:S.t2, fontSize:12, fontWeight:600 }}>{i + 1}</td>
                      <td style={{ padding:'16px 20px', fontWeight:700, color:S.t1 }}>{row.teamName}</td>
                      <td style={{ padding:'16px 20px' }}>
                        <span style={{ padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:800, background:'#E0F2FE', color:'#0369A1', border:'1px solid #BAE6FD' }}>
                          {row.domain}
                        </span>
                      </td>
                      <td style={{ padding:'16px 20px', color:S.t2 }}>
                        <div style={{ fontWeight: 600, color: S.t1 }}>{row.tlName}</div>
                        <div style={{ fontSize: 11, color: S.t3 }}>{row.tlEmail}</div>
                      </td>
                      <td style={{ padding:'16px 20px', fontWeight:700, color:'#64748B' }}>
                        {row.crewCount} Members
                      </td>
                      <td style={{ padding:'16px 20px', color:S.t2 }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>{row.collegeName}</div>
                        <div style={{ fontSize: 11, color: S.t3 }}>{row.location}</div>
                      </td>
                      <td style={{ padding:'16px 20px' }}>
                        <span style={{ padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:800, background:'#DCFCE7', color:'#15803D', border:'1px solid #86EFAC' }}>
                          ● Finale Confirmed
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding:'40px 20px', textAlign:'center', color:S.t3 }}>No squads found matching your search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {filteredData.length > 50 && (
              <div style={{ padding:'16px 20px', borderTop:'1px solid '+S.border, textAlign:'center', color:S.t3, fontSize:12 }}>
                Showing first 50 results in preview. Export Excel to view all {filteredData.length} records.
              </div>
            )}
          </div>
        </div>
    </>
  );
}
