import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { isOrganizerAuthorized } from './adminAuth';
import { syncLocalDataToSupabase } from '../../lib/syncService';
import { resolveDomain } from '../../lib/domainUtils';
import { Users, Flag, CheckSquare, Search, ChevronDown, Download, ChevronRight, MoreVertical, ChevronLeft, Trophy, Trash2, Eye, Receipt, X, ExternalLink, Image, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const S = {
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E5E7EB', primary: '#6C4EFF',
  t1: '#111827', t2: '#6B7280', t3: '#9CA3AF', green: '#16A34A',
  activeBg: '#EEE8FF', radius: '14px', pad: '24px', gap: '20px',
};

const withTimeout = (promise, ms = 7500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), ms))
  ]);
};

export default function AdminTeams() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  
  // Modals & Actions
  const [selectedRosterTeam, setSelectedRosterTeam] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Filters and Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL'); // 'ALL' | 'DONE' | 'PENDING'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [totalTeamsDB, setTotalTeamsDB] = useState(0);
  const [totalFilteredCount, setTotalFilteredCount] = useState(0);
  const [paymentStats, setPaymentStats] = useState({ all: 0, done: 0, pending: 0 });

  const fetchData = useCallback(async () => {
    try {
      const [{ count: total, data: allTeams }, { data: allSubs }] = await withTimeout(
        Promise.all([
          supabase.from('teams').select('id', { count: 'exact' }),
          supabase.from('submissions').select('team_id, pdf_url')
        ]),
        7500
      );

      const teamsList = allTeams || [];
      const subsList = allSubs || [];

      // Find teams that have submitted a valid payment proof
      const teamsWithProof = new Set(
        subsList
          .filter(s => s.pdf_url && typeof s.pdf_url === 'string' && s.pdf_url.trim().length > 10)
          .map(s => s.team_id)
      );

      const totalCount = total || teamsList.length;
      let doneCount = 0;
      let pendingCount = 0;

      teamsList.forEach(t => {
        if (teamsWithProof.has(t.id)) {
          doneCount++;
        } else {
          pendingCount++;
        }
      });

      setTotalTeamsDB(totalCount);
      setPaymentStats({
        all: totalCount,
        done: doneCount,
        pending: pendingCount
      });
    } catch (e) {
      console.warn('Fetch teams notice:', e);
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

  const buildQuery = async (isExport = false, filterVal = paymentFilter) => {
    let query = supabase.from('teams').select('*', { count: 'exact' });
    if (searchTerm) {
      const safeTerm = searchTerm.replace(/[%_\*()]/g, '');
      query = query.ilike('team_name', `%${safeTerm}%`);
    }

    if (filterVal === 'DONE' || filterVal === 'PENDING') {
      const { data: allSubs } = await supabase
        .from('submissions')
        .select('team_id, pdf_url');

      const verifiedTeamIds = Array.from(new Set(
        (allSubs || [])
          .filter(s => s.pdf_url && typeof s.pdf_url === 'string' && s.pdf_url.trim().length > 10)
          .map(s => s.team_id)
      ));

      if (filterVal === 'DONE') {
        if (verifiedTeamIds.length > 0) {
          query = query.in('id', verifiedTeamIds);
        } else {
          query = query.eq('id', '00000000-0000-0000-0000-000000000000');
        }
      } else if (filterVal === 'PENDING') {
        if (verifiedTeamIds.length > 0) {
          query = query.not('id', 'in', `(${verifiedTeamIds.join(',')})`);
        }
      }
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
      const query = await buildQuery(false, paymentFilter);
      const { data: pageTeams, count } = await query;
      if (pageTeams) {
        setTeams(pageTeams);
        const teamIds = pageTeams.map(t => t.id);
        if (teamIds.length > 0) {
          const [{ data: m }, { data: s }] = await Promise.all([
            supabase.from('team_members').select('*').in('team_id', teamIds),
            supabase.from('submissions').select('*').in('team_id', teamIds)
          ]);
          if (m) setMembers(m);
          if (s) setSubmissions(s);
        } else {
          setMembers([]); setSubmissions([]);
        }
      }
      if (count !== null) setTotalFilteredCount(count);
    };
    fetchPage();
  }, [loading, isAdmin, currentPage, searchTerm, paymentFilter]);

  // Permanently delete a squad and all its related records from DB
  const handleDeleteTeam = async (teamId, teamName) => {
    if (!window.confirm(`⚠️ DANGER: Are you sure you want to PERMANENTLY delete squad "${teamName}" from the database?\n\nThis will remove all associated crew members, submissions, and payment receipts. This action CANNOT be undone.`)) {
      return;
    }
    try {
      setDeletingId(teamId);
      // 1. Delete submissions for this team
      await supabase.from('submissions').delete().eq('team_id', teamId);
      // 2. Delete team members for this team
      await supabase.from('team_members').delete().eq('team_id', teamId);
      // 3. Delete the team itself
      const { error } = await supabase.from('teams').delete().eq('id', teamId);
      if (error) throw error;

      // Update UI state
      setTeams(prev => prev.filter(t => t.id !== teamId));
      setMembers(prev => prev.filter(m => m.team_id !== teamId));
      setSubmissions(prev => prev.filter(s => s.team_id !== teamId));
      setTotalFilteredCount(prev => Math.max(0, prev - 1));
      setTotalTeamsDB(prev => Math.max(0, prev - 1));
      if (selectedRosterTeam?.id === teamId) setSelectedRosterTeam(null);
      if (selectedReceipt?.teamId === teamId) setSelectedReceipt(null);
      alert(`Squad "${teamName}" was completely deleted from the database.`);
    } catch (err) {
      console.error('Delete squad error:', err);
      alert('Failed to delete squad: ' + (err.message || err));
    } finally {
      setDeletingId(null);
    }
  };

  // Delete an individual crew member from DB
  const handleDeleteMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove member "${memberName}" from the database?`)) return;
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', memberId);
      if (error) throw error;

      setMembers(prev => prev.filter(m => m.id !== memberId));
      if (selectedRosterTeam) {
        setSelectedRosterTeam(prev => prev ? {
          ...prev,
          members: prev.members.filter(m => m.id !== memberId)
        } : null);
      }
      alert(`Member "${memberName}" removed.`);
    } catch (err) {
      alert('Failed to remove member: ' + (err.message || err));
    }
  };

  // Delete payment receipt photo directly from DB
  const handleDeleteReceiptPhoto = async (submissionId, teamName) => {
    if (!window.confirm(`Are you sure you want to delete the payment receipt photo for squad "${teamName}" from the database?`)) return;
    try {
      const { error } = await supabase.from('submissions').update({ pdf_url: null }).eq('id', submissionId);
      if (error) throw error;

      setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, pdf_url: null } : s));
      setSelectedReceipt(null);
      alert(`Payment receipt photo for squad "${teamName}" was removed from the database.`);
    } catch (err) {
      alert('Failed to delete receipt photo: ' + (err.message || err));
    }
  };

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

  const toggleShortlist = async (teamId, currentStatus) => {
    const newStatus = currentStatus === 'Shortlisted' ? 'Pending' : 'Shortlisted';
    const { error } = await supabase.from('teams').update({ status: newStatus }).eq('id', teamId);
    if (!error) {
      setTeams(teams.map(t => t.id === teamId ? { ...t, status: newStatus } : t));
    } else {
      alert("Error: " + error.message);
    }
  };

  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage);
  const currentTeams = teams;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const exportExcel = async () => {
    try {
      const query = await buildQuery(true, paymentFilter);
      const { data } = await query;
      if (!data || data.length === 0) {
        alert("No squad records found to export for the selected filter.");
        return;
      }

      const teamIds = data.map(t => t.id);
      const [{ data: m }, { data: s }] = await Promise.all([
        supabase.from('team_members').select('*').in('team_id', teamIds).order('created_at', { ascending: true }),
        supabase.from('submissions').select('*').in('team_id', teamIds)
      ]);

      const allMembers = m || [];
      const allSubs = s || [];

      // Sheet 1: Squads & Teams Roster
      const excelRows = data.map((t, i) => {
        const teamMems = allMembers.filter(mem => mem.team_id === t.id);
        const lead = teamMems.find(mem => mem.is_leader === true) || teamMems[0];
        const sub = allSubs.find(subItem => subItem.team_id === t.id);
        const hasReceipt = Boolean(sub?.pdf_url && typeof sub.pdf_url === 'string' && sub.pdf_url.trim().length > 10);

        // Team members formatted with (Team Lead) in bracket
        const memberNames = teamMems.map(mem => {
          const isLead = mem.is_leader === true || mem.id === lead?.id;
          return isLead ? `${mem.full_name || 'Leader'} (Team Lead)` : (mem.full_name || 'Member');
        }).filter(Boolean).join(', ');

        // USN of each member
        const usnsOfEachMember = teamMems.map(mem => {
          const isLead = mem.is_leader === true || mem.id === lead?.id;
          const roleTag = isLead ? ' (Lead)' : '';
          return `${mem.full_name || 'Member'}${roleTag}: ${mem.reg_no || 'N/A'}`;
        }).filter(Boolean).join(' | ');

        // College of each member
        const collegesOfEachMember = teamMems.map(mem => {
          const isLead = mem.is_leader === true || mem.id === lead?.id;
          const roleTag = isLead ? ' (Lead)' : '';
          return `${mem.full_name || 'Member'}${roleTag}: ${mem.college_name || 'N/A'}`;
        }).filter(Boolean).join(' | ');

        // Phone numbers of each member
        const phoneNumbersOfEachMember = teamMems.map(mem => {
          const isLead = mem.is_leader === true || mem.id === lead?.id;
          const roleTag = isLead ? ' (Lead)' : '';
          return `${mem.full_name || 'Member'}${roleTag}: ${mem.phone_number || mem.phone || 'N/A'}`;
        }).filter(Boolean).join(' | ');

        const leadCollege = lead?.college_name || teamMems.find(mem => mem.college_name)?.college_name || 'N/A';
        const leadPhone = lead?.phone_number || lead?.phone || 'N/A';
        const paymentStatus = hasReceipt ? 'Payment Done (Proof Submitted)' : 'Not Submitted (Pending)';
        const domain = resolveDomain(t, sub, null, 'General Innovation');

        return {
          "Sl No": i + 1,
          "Team Name": t.team_name || 'N/A',
          "Domain": domain,
          "Team Members": memberNames || (lead?.full_name ? `${lead.full_name} (Team Lead)` : 'N/A'),
          "USN / Seat No": usnsOfEachMember || (lead?.reg_no || 'N/A'),
          "College of Each Member": collegesOfEachMember || leadCollege,
          "Phone Numbers": phoneNumbersOfEachMember || leadPhone,
          "Payment Status": paymentStatus,
          "Signature": "" // Blank space for physical attendance signature
        };
      });

      // Sheet 2: Individual Participants Check-in Roster
      const individualRows = [];
      let indIndex = 1;
      data.forEach(t => {
        const teamMems = allMembers.filter(mem => mem.team_id === t.id);
        const lead = teamMems.find(mem => mem.is_leader === true) || teamMems[0];
        const sub = allSubs.find(subItem => subItem.team_id === t.id);
        const hasReceipt = Boolean(sub?.pdf_url && typeof sub.pdf_url === 'string' && sub.pdf_url.trim().length > 10);
        const domain = resolveDomain(t, sub, null, 'General Innovation');

        teamMems.forEach(mem => {
          const isLead = mem.is_leader === true || mem.id === lead?.id;
          individualRows.push({
            "Sl No": indIndex++,
            "Team Name": t.team_name || 'N/A',
            "Domain": domain,
            "Participant Name": mem.full_name || 'N/A',
            "Role": isLead ? "Team Lead" : "Crew Member",
            "USN / Seat No": mem.reg_no || 'N/A',
            "College Name": mem.college_name || 'N/A',
            "Phone Number": mem.phone_number || mem.phone || 'N/A',
            "Email Address": mem.email || 'N/A',
            "Payment Status": hasReceipt ? "Payment Done" : "Not Submitted",
            "Signature": "" // Blank space for physical attendance signature
          });
        });
      });

      const wb = XLSX.utils.book_new();

      // Append Sheet 1
      const wsTeams = XLSX.utils.json_to_sheet(excelRows);
      wsTeams['!cols'] = [
        { wch: 8 },   // Sl No
        { wch: 28 },  // Team Name
        { wch: 20 },  // Domain
        { wch: 55 },  // Team Members
        { wch: 50 },  // USN / Seat No
        { wch: 75 },  // College of Each Member
        { wch: 60 },  // Phone Numbers
        { wch: 32 },  // Payment Status
        { wch: 26 },  // Signature
      ];
      XLSX.utils.book_append_sheet(wb, wsTeams, "Squads Attendance & Roster");

      // Append Sheet 2
      if (individualRows.length > 0) {
        const wsIndividuals = XLSX.utils.json_to_sheet(individualRows);
        wsIndividuals['!cols'] = [
          { wch: 8 },   // Sl No
          { wch: 28 },  // Team Name
          { wch: 20 },  // Domain
          { wch: 26 },  // Participant Name
          { wch: 14 },  // Role
          { wch: 20 },  // USN / Seat No
          { wch: 42 },  // College Name
          { wch: 18 },  // Phone Number
          { wch: 32 },  // Email Address
          { wch: 18 },  // Payment Status
          { wch: 24 },  // Signature
        ];
        XLSX.utils.book_append_sheet(wb, wsIndividuals, "Individual Signatures");
      }

      const fileSuffix = paymentFilter === 'DONE' ? '_payment_done' : (paymentFilter === 'PENDING' ? '_payment_pending' : '');
      XLSX.writeFile(wb, `haxlr8_squads_attendance${fileSuffix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export Excel sheet: ' + err.message);
    }
  };

  return (
    <>
        {/* TOP NAV */}
        <header style={{ height:64, background:S.card, borderBottom:'1px solid '+S.border, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div>
              <h1 style={{ fontSize:18, fontWeight:700, margin:0, color:S.t1 }}>Squads &amp; Teams</h1>
              <div style={{ fontSize:11, fontWeight:500, color:S.t2, display:'flex', alignItems:'center', gap:4 }}>Home <ChevronRight size={12}/> <span style={{color:S.t1}}>Squads</span></div>
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

        {/* SCROLLABLE CONTENT */}
        <div style={{ flex:1, overflowY:'auto', padding:S.pad }}>
          <div style={{ display:'flex', flexDirection:'column', gap:S.gap }}>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>Squads &amp; Teams Roster</h2>
                <p style={{ fontSize:13, color:S.t2, margin:'4px 0 0' }}>All registered 3–4 member squads with direct entry to the 24H Grand Finale. Manage squads, inspect payment QR proofs, and edit rosters directly.</p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <button onClick={exportExcel} style={{ display:'flex', alignItems:'center', gap:6, background:S.card, color:S.t1, border:'1px solid '+S.border, padding:'10px 16px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', boxShadow:'0 1px 2px rgba(0,0,0,.04)' }}>
                  <Download size={16}/> Export Excel
                </button>
              </div>
            </div>

            {/* PAYMENT STATUS FILTER CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
              <div 
                onClick={() => { setPaymentFilter('ALL'); setCurrentPage(1); }}
                style={{
                  background: S.card,
                  border: `2px solid ${paymentFilter === 'ALL' ? S.primary : S.border}`,
                  borderRadius: S.radius,
                  padding: '16px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  boxShadow: paymentFilter === 'ALL' ? '0 4px 12px rgba(108, 78, 255, 0.12)' : '0 1px 3px rgba(0,0,0,.04)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Flag size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: S.t3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>All Squads</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: S.t1, marginTop: 2 }}>{paymentStats.all || totalTeamsDB}</div>
                </div>
              </div>

              <div 
                onClick={() => { setPaymentFilter('DONE'); setCurrentPage(1); }}
                style={{
                  background: S.card,
                  border: `2px solid ${paymentFilter === 'DONE' ? '#16A34A' : S.border}`,
                  borderRadius: S.radius,
                  padding: '16px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  boxShadow: paymentFilter === 'DONE' ? '0 4px 12px rgba(22, 163, 74, 0.12)' : '0 1px 3px rgba(0,0,0,.04)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: S.t3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Payment Done</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#16A34A', marginTop: 2 }}>{paymentStats.done}</div>
                </div>
              </div>

              <div 
                onClick={() => { setPaymentFilter('PENDING'); setCurrentPage(1); }}
                style={{
                  background: S.card,
                  border: `2px solid ${paymentFilter === 'PENDING' ? '#DC2626' : S.border}`,
                  borderRadius: S.radius,
                  padding: '16px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  boxShadow: paymentFilter === 'PENDING' ? '0 4px 12px rgba(220, 38, 38, 0.12)' : '0 1px 3px rgba(0,0,0,.04)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: S.t3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Not Submitted</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#DC2626', marginTop: 2 }}>{paymentStats.pending}</div>
                </div>
              </div>
            </div>

            <div style={{ background:S.card, border:'1px solid '+S.border, borderRadius:S.radius, boxShadow:'0 1px 3px rgba(0,0,0,.04)', display:'flex', flexDirection:'column' }}>
              
              <div style={{ padding:'16px 20px', borderBottom:'1px solid '+S.border, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, flexWrap:'wrap' }}>
                  <div style={{ position:'relative', minWidth:260, flex: '1 1 260px' }}>
                    <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:S.t3 }}/>
                    <input 
                      placeholder="Search squads by name..." 
                      value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      style={{ paddingLeft:36, paddingRight:16, paddingTop:9, paddingBottom:9, background:S.card, border:'1.5px solid '+S.border, borderRadius:8, fontSize:13, width:'100%', outline:'none', color:S.t1, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Filter size={15} style={{ color: S.t2 }} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: S.t2 }}>Payment Filter:</span>
                    <select
                      value={paymentFilter}
                      onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
                      style={{
                        padding: '8px 12px',
                        border: '1.5px solid ' + S.border,
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: S.t1,
                        background: '#FFFFFF',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="ALL">All Squads ({paymentStats.all || totalTeamsDB})</option>
                      <option value="DONE">Payment Done / Submitted ({paymentStats.done})</option>
                      <option value="PENDING">Payment Not Submitted ({paymentStats.pending})</option>
                    </select>
                  </div>
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  {(searchTerm || paymentFilter !== 'ALL') && (
                    <button 
                      onClick={() => { setSearchTerm(''); setPaymentFilter('ALL'); setCurrentPage(1); }} 
                      style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: S.t1, cursor: 'pointer' }}
                    >
                      Clear Filters ✕
                    </button>
                  )}
                </div>
              </div>

              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                  <thead>
                    <tr style={{ background:'#FAFAFA', borderBottom:'1px solid '+S.border }}>
                      {['S.No', 'Squad Name', 'Domain', 'Squad Commander', 'Crew Members', 'Payment / QR Proof', 'Registered On', 'Actions'].map(h => (
                        <th key={h} style={{ padding:'16px 20px', fontWeight:600, color:S.t2, textAlign:'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentTeams.map((t, index) => {
                      const sub = submissions.find(s => s.team_id === t.id);
                      const track = resolveDomain(t, sub, null, 'General Innovation');
                      const teamMembers = members.filter(m => m.team_id === t.id);
                      const lead = teamMembers.find(m => m.is_leader === true) || teamMembers[0];
                      const hasReceipt = Boolean(sub?.pdf_url);
                      
                      const avatarColors = [
                        {bg: '#EEE8FF', text: '#6C4EFF'}, {bg: '#DBEAFE', text: '#2563EB'},
                        {bg: '#FEF3C7', text: '#D97706'}, {bg: '#F3E8FF', text: '#9333EA'},
                        {bg: '#DCFCE7', text: '#16A34A'}
                      ];
                      const ac = avatarColors[index % avatarColors.length] || avatarColors[0];

                      return (
                        <tr key={t.id} style={{ borderBottom:'1px solid #F8FAFC' }}>
                          <td style={{ padding:'16px 20px', color:S.t2, fontSize:12, fontWeight:600 }}>
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td style={{ padding:'16px 20px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                              <div style={{ width:36, height:36, borderRadius:'8px', background:ac.bg, color:ac.text, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13 }}>
                                {t.team_name?.substring(0,2)?.toUpperCase() || 'TM'}
                              </div>
                              <div>
                                <div style={{ fontWeight:700, color:S.t1 }}>{t.team_name || 'Unnamed Squad'}</div>
                                <div style={{ fontSize:11, color:S.t3, marginTop:2 }}>ID: {t.id.substring(0,8)}...</div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding:'16px 20px' }}>
                            <span style={{ padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:800, background:'#E0F2FE', color:'#0369A1', border:'1px solid #BAE6FD' }}>
                              {track}
                            </span>
                          </td>

                          <td style={{ padding:'16px 20px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <div style={{ width:28, height:28, borderRadius:'50%', background:S.activeBg, color:S.primary, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:10 }}>
                                {lead?.full_name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <div style={{ fontWeight:600, color:S.t1, fontSize:12 }}>{lead?.full_name || 'N/A'}</div>
                                <div style={{ fontSize:11, color:S.t3 }}>{lead?.email || 'N/A'}</div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding:'16px 20px' }}>
                            <div style={{ display:'flex', alignItems:'center' }}>
                              {teamMembers.slice(0,4).map((m, idx) => (
                                <div key={m.id || idx} style={{ width:28, height:28, borderRadius:'50%', background:'#E2E8F0', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#475569', marginLeft: idx > 0 ? -8 : 0 }} title={`${m.full_name} (${m.email})`}>
                                  {m.full_name?.charAt(0)}
                                </div>
                              ))}
                              <span style={{ fontSize:12, fontWeight:700, color:'#64748B', marginLeft:8 }}>
                                {teamMembers.length} Crew
                              </span>
                            </div>
                          </td>

                          {/* Payment / QR Proof Column */}
                          <td style={{ padding:'16px 20px' }}>
                            {hasReceipt ? (
                              <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                                <span style={{ padding:'4px 9px', borderRadius:6, background:'#DCFCE7', border:'1px solid #86EFAC', color:'#15803D', fontWeight:700, fontSize:11, display:'inline-flex', alignItems:'center', gap:4 }}>
                                  <CheckCircle2 size={12} /> Payment Done
                                </span>
                                <button 
                                  onClick={() => setSelectedReceipt({ teamId: t.id, teamName: t.team_name, domain: track, sub })}
                                  style={{ padding:'4px 10px', borderRadius:6, background:'#F0FDF4', border:'1px solid #BBF7D0', color:'#16A34A', fontWeight:700, fontSize:11, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:4, transition:'all 0.15s' }}
                                  title="Inspect uploaded payment proof"
                                >
                                  <Receipt size={12} /> View Proof
                                </button>
                              </div>
                            ) : (
                              <span style={{ padding:'4px 9px', borderRadius:6, background:'#FEF2F2', border:'1px solid #FECACA', color:'#DC2626', fontWeight:700, fontSize:11, display:'inline-flex', alignItems:'center', gap:4 }}>
                                <AlertCircle size={12} /> Not Submitted
                              </span>
                            )}
                          </td>

                          <td style={{ padding:'16px 20px', color:S.t2, fontSize:12 }}>
                            {t.created_at ? new Date(t.created_at).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) : '-'}
                          </td>

                          {/* Actions Column */}
                          <td style={{ padding:'16px 20px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <button 
                                onClick={() => setSelectedRosterTeam({ ...t, domain: track, members: teamMembers, sub })}
                                style={{ padding:'6px 12px', borderRadius:8, background:'#F0F9FF', border:'1px solid #BAE6FD', color:'#0284C7', fontWeight:700, fontSize:12, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:5 }}
                                title="View team roster and members"
                              >
                                <Eye size={13} /> Roster
                              </button>
                              <button 
                                onClick={() => handleDeleteTeam(t.id, t.team_name)}
                                disabled={deletingId === t.id}
                                style={{ padding:'6px 10px', borderRadius:8, background:'#FEF2F2', border:'1px solid #FECACA', color:'#DC2626', fontWeight:700, fontSize:12, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:4, opacity: deletingId === t.id ? 0.5 : 1 }}
                                title="Delete squad permanently from database"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {currentTeams.length === 0 && (
                      <tr>
                        <td colSpan="8" style={{ padding:40, textAlign:'center', color:S.t3 }}>No teams found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ padding:'16px 20px', borderTop:'1px solid '+S.border, display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13 }}>
                <div style={{ color:S.t2, fontWeight:500 }}>Showing {totalFilteredCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalFilteredCount)} of {totalFilteredCount} teams</div>
                {totalPages > 1 && (
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ background:S.card, border:'1px solid '+S.border, borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color: currentPage === 1 ? S.border : S.t3, cursor: currentPage === 1 ? 'default' : 'pointer' }}><ChevronLeft size={14}/></button>
                    
                    {getPageNumbers().map((p, idx) => (
                      p === '...' ? (
                        <span key={`ellipsis-${idx}`} style={{ color:S.t3, padding:'0 4px', fontWeight:600 }}>...</span>
                      ) : (
                        <button key={p} onClick={() => setCurrentPage(p)} style={{ background: currentPage === p ? '#EEE8FF' : S.card, border: currentPage === p ? 'none' : '1px solid '+S.border, borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color: currentPage === p ? S.primary : S.t2, fontWeight: currentPage === p ? 700 : 600, cursor:'pointer' }}>{p}</button>
                      )
                    ))}
                    
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ background:S.card, border:'1px solid '+S.border, borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color: currentPage === totalPages ? S.border : S.t3, cursor: currentPage === totalPages ? 'default' : 'pointer' }}><ChevronRight size={14}/></button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* PAYMENT RECEIPT / QR PROOF MODAL */}
        {selectedReceipt && (
          <div style={{ position:'fixed', inset:0, background:'rgba(15, 23, 42, 0.55)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99999, padding:20 }}>
            <div style={{ background:'#fff', borderRadius:20, maxWidth:580, width:'100%', maxHeight:'90vh', overflowY:'auto', padding:'24px', boxShadow:'0 25px 50px rgba(0,0,0,0.25)', border:'2px solid #86EFAC' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, borderBottom:'1px solid #E2E8F0', paddingBottom:14 }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ padding:'3px 8px', borderRadius:6, background:'#DCFCE7', color:'#15803D', fontSize:11, fontWeight:800 }}>Verified Payment Proof</span>
                    <span style={{ fontSize:12, color:'#64748B', fontWeight:600 }}>{selectedReceipt.domain}</span>
                  </div>
                  <h3 style={{ margin:'6px 0 0', fontSize:19, fontWeight:800, color:'#0F172A' }}>{selectedReceipt.teamName}</h3>
                </div>
                <button onClick={() => setSelectedReceipt(null)} style={{ background:'none', border:'none', cursor:'pointer', padding:6, color:'#64748B', borderRadius:8 }}>
                  <X size={20} />
                </button>
              </div>

              {/* Transaction details box */}
              {selectedReceipt.sub?.project_description && (
                <div style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:12, padding:'12px 16px', marginBottom:16 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Transaction &amp; UTR Details:</div>
                  <div style={{ fontSize:13, color:'#1E293B', fontWeight:600, lineHeight:1.5 }}>
                    {selectedReceipt.sub.project_description}
                  </div>
                </div>
              )}

              {/* Payment Proof Image Display */}
              <div style={{ background:'#0F172A', borderRadius:12, padding:12, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:240, marginBottom:18, border:'1px solid #334155' }}>
                {selectedReceipt.sub?.pdf_url ? (
                  selectedReceipt.sub.pdf_url.startsWith('data:image/') || selectedReceipt.sub.pdf_url.startsWith('http') || selectedReceipt.sub.pdf_url.startsWith('blob:') ? (
                    <img 
                      src={selectedReceipt.sub.pdf_url} 
                      alt="Payment receipt proof" 
                      style={{ maxWidth:'100%', maxHeight:'420px', objectFit:'contain', borderRadius:8 }}
                    />
                  ) : (
                    <div style={{ textAlign:'center', padding:20, color:'#fff' }}>
                      <p style={{ margin:0, fontSize:14, fontWeight:600 }}>PDF Document Submitted</p>
                      <a href={selectedReceipt.sub.pdf_url} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:10, color:'#38BDF8', fontWeight:700, fontSize:13 }}>
                        <ExternalLink size={14} /> Open Document in New Tab
                      </a>
                    </div>
                  )
                ) : (
                  <div style={{ color:'#94A3B8', fontSize:13, fontWeight:600 }}>No payment proof file attached.</div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10, borderTop:'1px solid #E2E8F0', paddingTop:14 }}>
                <div style={{ display:'flex', gap:8 }}>
                  {selectedReceipt.sub?.pdf_url && (
                    <a 
                      href={selectedReceipt.sub.pdf_url} 
                      download={`Payment_Proof_${selectedReceipt.teamName.replace(/\s+/g,'_')}.png`}
                      style={{ padding:'8px 14px', borderRadius:8, background:'#F1F5F9', color:'#334155', fontWeight:700, fontSize:12, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:5, border:'1px solid #CBD5E1' }}
                    >
                      <Download size={13} /> Download Image
                    </a>
                  )}
                  {selectedReceipt.sub?.id && selectedReceipt.sub?.pdf_url && (
                    <button 
                      onClick={() => handleDeleteReceiptPhoto(selectedReceipt.sub.id, selectedReceipt.teamName)}
                      style={{ padding:'8px 12px', borderRadius:8, background:'#FEF2F2', color:'#DC2626', fontWeight:700, fontSize:12, border:'1px solid #FECACA', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:5 }}
                      title="Permanently remove photo from database"
                    >
                      <Trash2 size={13} /> Delete Photo from DB
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedReceipt(null)} 
                  style={{ padding:'8px 18px', borderRadius:8, background:'#0F172A', color:'#fff', border:'none', fontWeight:700, fontSize:12, cursor:'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SQUAD ROSTER MODAL */}
        {selectedRosterTeam && (
          <div style={{ position:'fixed', inset:0, background:'rgba(15, 23, 42, 0.45)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99999, padding:20 }}>
            <div style={{ background:'#fff', borderRadius:20, maxWidth:640, width:'100%', maxHeight:'85vh', overflowY:'auto', padding:'24px', boxShadow:'0 20px 40px rgba(0,0,0,0.15)', border:'2px solid #BAE6FD' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, borderBottom:'1px solid #E2E8F0', paddingBottom:14 }}>
                <div>
                  <h3 style={{ margin:0, fontSize:19, fontWeight:800, color:'#0F172A' }}>{selectedRosterTeam.team_name}</h3>
                  <div style={{ fontSize:12, color:'#0284C7', fontWeight:700, marginTop:3 }}>
                    Domain: {selectedRosterTeam.domain} · Fee: ₹1,200 (Finale Direct Pass)
                  </div>
                </div>
                <button onClick={() => setSelectedRosterTeam(null)} style={{ background:'none', border:'none', cursor:'pointer', padding:4, color:'#64748B' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div style={{ fontSize:13, fontWeight:800, color:'#0F172A' }}>
                  Crew Manifest ({selectedRosterTeam.members.length} Members):
                </div>
                {selectedRosterTeam.sub?.pdf_url && (
                  <button 
                    onClick={() => {
                      const item = selectedRosterTeam;
                      setSelectedReceipt({ teamId: item.id, teamName: item.team_name, domain: item.domain, sub: item.sub });
                    }}
                    style={{ padding:'4px 10px', borderRadius:6, background:'#ECFDF5', color:'#059669', border:'1px solid #A7F3D0', fontSize:11, fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:4 }}
                  >
                    <Receipt size={12} /> View Payment Proof
                  </button>
                )}
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
                {selectedRosterTeam.members.map((m, i) => (
                  <div key={m.id || i} style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:12, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                        <span style={{ fontWeight:800, color:'#0F172A', fontSize:14 }}>{m.full_name}</span>
                        {m.is_leader && (
                          <span style={{ background:'#FEF3C7', color:'#B45309', padding:'2px 8px', borderRadius:6, fontSize:10, fontWeight:800 }}>Squad Commander</span>
                        )}
                        <span style={{ fontSize:11, color:'#64748B' }}>{m.dept || 'Engineering'} · Year {m.year || '3'}</span>
                      </div>
                      <div style={{ fontSize:12, color:'#475569' }}>
                        📧 {m.email} {m.phone_number ? `· 📱 ${m.phone_number}` : ''}
                      </div>
                      <div style={{ fontSize:11, color:'#94A3B8', marginTop:2 }}>
                        🏛️ {m.college_name || 'College N/A'} {m.reg_no ? `· USN: ${m.reg_no}` : ''}
                      </div>
                    </div>
                    <div>
                      <button 
                        onClick={() => handleDeleteMember(m.id, m.full_name)}
                        style={{ padding:'5px 8px', borderRadius:6, background:'#FEF2F2', border:'1px solid #FECACA', color:'#DC2626', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:700 }}
                        title="Delete member from database"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
                {selectedRosterTeam.members.length === 0 && (
                  <div style={{ padding:20, textAlign:'center', color:'#94A3B8', fontSize:13 }}>No crew members found in database.</div>
                )}
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #E2E8F0', paddingTop:14 }}>
                <button 
                  onClick={() => handleDeleteTeam(selectedRosterTeam.id, selectedRosterTeam.team_name)}
                  style={{ padding:'8px 14px', borderRadius:8, background:'#FEF2F2', color:'#DC2626', border:'1px solid #FECACA', fontWeight:700, fontSize:12, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:5 }}
                >
                  <Trash2 size={13} /> Delete Entire Squad from DB
                </button>
                <button onClick={() => setSelectedRosterTeam(null)} style={{ padding:'8px 18px', borderRadius:8, background:'#0284C7', color:'#fff', border:'none', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                  Close Roster
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}

