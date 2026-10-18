import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { isOrganizerAuthorized } from './adminAuth';
import { syncLocalDataToSupabase } from '../../lib/syncService';
import { 
  Users, Flag, BookOpen, Shield, Search, ChevronDown, Download, ChevronRight, 
  Plus, ChevronLeft, Eye, CheckCircle, X, Clock, Trash2, Mail, AlertCircle, 
  RefreshCw, Copy, Check, ExternalLink, Activity, Crown, Sparkles, Filter, UserX,
  ArrowUpRight, CheckCircle2
} from 'lucide-react';
import { fetchRegisteredAccountsData, exportRegisteredUsersCSV } from '../../lib/userTrackingService';

const S = {
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E5E7EB', primary: '#6C4EFF',
  t1: '#111827', t2: '#6B7280', t3: '#9CA3AF', green: '#16A34A',
  activeBg: '#EEE8FF', radius: '14px', pad: '24px', gap: '20px',
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  
  // Primary View Switcher: 'registered_accounts' (Mails & Logins) or 'team_roster' (Participants & ID Cards)
  const [activeView, setActiveView] = useState('registered_accounts');

  // Registered Accounts & Logins Tracking State
  const [accounts, setAccounts] = useState([]);
  const [accountsStats, setAccountsStats] = useState({
    totalRegistered: 0,
    withTeamCount: 0,
    withoutTeamCount: 0,
    totalLogins: 0,
    squadsCount: 0,
  });
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsSearch, setAccountsSearch] = useState('');
  const [accountsFilter, setAccountsFilter] = useState('all'); // 'all' | 'no_team' | 'has_team' | 'google' | 'email'
  const [accountsPage, setAccountsPage] = useState(1);
  const [copiedEmail, setCopiedEmail] = useState(null);
  const accountsPerPage = 10;

  // Filters and Pagination for Team Members Roster
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [teamFilter, setTeamFilter] = useState('All Teams');
  const [yearFilter, setYearFilter] = useState('All Years');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [totalUsersDB, setTotalUsersDB] = useState(0);
  const [totalFilteredCount, setTotalFilteredCount] = useState(0);

  // ID Card Verification Modal
  const [idModal, setIdModal] = useState(null);
  const [verifyConfirmed, setVerifyConfirmed] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  // Fetch Team Members Table Data
  const fetchData = useCallback(async () => {
    try {
      const { count: total } = await supabase.from('team_members').select('*', { count: 'exact', head: true });
      setTotalUsersDB(total || 0);
    } catch (e) {
      console.warn('Fetch users notice:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch All Registered Accounts & Login Activity
  const loadAccounts = useCallback(async () => {
    setAccountsLoading(true);
    try {
      const res = await fetchRegisteredAccountsData();
      if (res?.accountsList) {
        setAccounts(res.accountsList);
        setAccountsStats(res.stats);
      }
    } catch (err) {
      console.warn('Load accounts notice:', err);
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const authorized = await isOrganizerAuthorized();
      if (authorized) {
        setIsAdmin(true);
        fetchData();
        loadAccounts();
      } else {
        window.dispatchEvent(new Event('haxlr8_organizer_logout'));
      }
    };
    checkAuth();
  }, [fetchData, loadAccounts]);

  // Real-time synchronization event listener
  useEffect(() => {
    const handleRegistryUpdate = () => {
      loadAccounts();
    };
    window.addEventListener('haxlr8_accounts_registry_updated', handleRegistryUpdate);
    return () => window.removeEventListener('haxlr8_accounts_registry_updated', handleRegistryUpdate);
  }, [loadAccounts]);

  const handleCopyEmail = (email) => {
    if (!email) return;
    try {
      navigator.clipboard?.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2200);
    } catch (e) {}
  };

  // Filtered & Paginated Accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter(u => {
      if (accountsFilter === 'no_team' && u.hasTeam) return false;
      if (accountsFilter === 'has_team' && !u.hasTeam) return false;
      if (accountsFilter === 'google' && !u.provider?.toLowerCase().includes('google')) return false;
      if (accountsFilter === 'email' && u.provider?.toLowerCase().includes('google')) return false;

      if (accountsSearch) {
        const s = accountsSearch.toLowerCase().trim();
        const email = (u.email || '').toLowerCase();
        const name = (u.fullName || '').toLowerCase();
        const team = (u.teamName || '').toLowerCase();
        return email.includes(s) || name.includes(s) || team.includes(s);
      }
      return true;
    });
  }, [accounts, accountsFilter, accountsSearch]);

  const totalAccountsPages = Math.ceil(filteredAccounts.length / accountsPerPage) || 1;
  const paginatedAccounts = useMemo(() => {
    const from = (accountsPage - 1) * accountsPerPage;
    return filteredAccounts.slice(from, from + accountsPerPage);
  }, [filteredAccounts, accountsPage, accountsPerPage]);

  const getIsLeader = (member) => {
    return member.is_leader === true;
  };

  const handleVerify = async () => {
    if (!idModal || !verifyConfirmed) return;
    setVerifying(true);
    const { error } = await supabase.from('team_members').update({
      id_card_verified: true,
      id_card_verified_by: adminEmail || 'Admin'
    }).eq('id', idModal.id);
    if (error) {
      alert('Failed to verify: ' + error.message + '. Please check RLS policies on team_members table.');
    } else {
      setMembers(prev => prev.map(m => m.id === idModal.id ? { ...m, id_card_verified: true, id_card_verified_by: adminEmail || 'Admin' } : m));
    }
    setVerifying(false);
    setIdModal(null);
    setVerifyConfirmed(false);
  };

  // Permanently delete participant from DB
  const handleDeleteUser = async (memberId, memberName) => {
    if (!window.confirm(`⚠️ DANGER: Permanently delete participant "${memberName}" from the database?\n\nThis action cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', memberId);
      if (error) throw error;
      setMembers(prev => prev.filter(m => m.id !== memberId));
      setTotalFilteredCount(prev => Math.max(0, prev - 1));
      setTotalUsersDB(prev => Math.max(0, prev - 1));
      alert(`Participant "${memberName}" deleted from database.`);
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Failed to delete participant: ' + (err.message || err));
    }
  };

  // Delete ID card photo from DB
  const handleDeleteIdPhotos = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to delete the ID card photos for "${memberName}" from the database?`)) return;
    try {
      const { error } = await supabase.from('team_members').update({
        id_card_front_url: null,
        id_card_back_url: null,
        id_card_verified: false,
        id_card_verified_by: null
      }).eq('id', memberId);
      if (error) throw error;

      setMembers(prev => prev.map(m => m.id === memberId ? {
        ...m,
        id_card_front_url: null,
        id_card_back_url: null,
        id_card_verified: false,
        id_card_verified_by: null
      } : m));
      setIdModal(null);
      alert(`ID card photos for "${memberName}" were removed from the database.`);
    } catch (err) {
      alert('Failed to delete photos: ' + (err.message || err));
    }
  };


  const buildQuery = async (isExport = false) => {
    let query = supabase.from('team_members').select('*', { count: 'exact' });
    
    if (searchTerm) {
      const safeTerm = searchTerm.replace(/[%_\*()]/g, '');
      query = query.or(`full_name.ilike.%${safeTerm}%,email.ilike.%${safeTerm}%`);
    }
    if (roleFilter === 'Team Lead') {
      query = query.eq('is_leader', true);
    } else if (roleFilter === 'Member') {
      query = query.not('is_leader', 'is', true);
    }
    if (teamFilter && teamFilter !== 'All Teams') {
      const safeTeamTerm = teamFilter.replace(/[%_\*()]/g, '');
      const { data: matchTeams } = await supabase.from('teams').select('id').ilike('team_name', `%${safeTeamTerm}%`);
      const matchingTeamIds = matchTeams ? matchTeams.map(t => t.id) : [];
      if (matchingTeamIds.length > 0) {
        query = query.in('team_id', matchingTeamIds);
      } else {
        query = query.eq('team_id', '00000000-0000-0000-0000-000000000000'); // Force empty
      }
    }
    if (yearFilter !== 'All Years') {
      query = query.eq('year', yearFilter);
    }
    if (collegeFilter) {
      query = query.ilike('college_name', `%${collegeFilter}%`);
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
      const query = await buildQuery(false);
      const { data, count } = await query;
      if (data && data.length > 0) {
        const teamIds = data.map(m => m.team_id);
        const { data: teamsData } = await supabase.from('teams').select('id, team_name').in('id', teamIds);
        setTeams(teamsData || []);
        setMembers(data);
      } else {
        setMembers([]);
        setTeams([]);
      }
      if (count !== null) setTotalFilteredCount(count);
    };
    fetchPage();
  }, [loading, isAdmin, currentPage, searchTerm, roleFilter, teamFilter, yearFilter, collegeFilter]);

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
  const currentMembers = members;

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

  const stats = [
    { 
      title: 'Total Registered Mails', 
      value: accountsStats.totalRegistered || totalUsersDB, 
      subtitle: 'From starting to now',
      trend: `${accountsStats.totalRegistered || totalUsersDB} emails`, 
      c: '#6C4EFF', 
      bg: '#EEE8FF', 
      icon: Mail,
      action: () => { setActiveView('registered_accounts'); setAccountsFilter('all'); }
    },
    { 
      title: 'Squads Formed', 
      value: accountsStats.withTeamCount, 
      subtitle: `${accountsStats.squadsCount} Active squads`,
      trend: `${accountsStats.withTeamCount} in squads`, 
      c: '#059669', 
      bg: '#D1FAE5', 
      icon: Users,
      action: () => { setActiveView('registered_accounts'); setAccountsFilter('has_team'); }
    },
    { 
      title: 'No Team Details Yet', 
      value: accountsStats.withoutTeamCount, 
      subtitle: accountsStats.withoutTeamCount > 0 ? '⚠️ Action needed: squad pending' : 'All accounts linked to teams',
      trend: accountsStats.withoutTeamCount > 0 ? 'Pending' : '0 Pending', 
      c: accountsStats.withoutTeamCount > 0 ? '#DC2626' : '#D97706', 
      bg: accountsStats.withoutTeamCount > 0 ? '#FEE2E2' : '#FEF3C7', 
      icon: accountsStats.withoutTeamCount > 0 ? AlertCircle : UserX,
      isAlert: accountsStats.withoutTeamCount > 0,
      action: () => { setActiveView('registered_accounts'); setAccountsFilter('no_team'); }
    },
    { 
      title: 'Total Logins Recorded', 
      value: accountsStats.totalLogins, 
      subtitle: 'Telemetry from launch',
      trend: 'Active', 
      c: '#0284C7', 
      bg: '#E0F2FE', 
      icon: Activity,
      action: () => { setActiveView('registered_accounts'); setAccountsFilter('all'); }
    },
  ];

  const exportCSV = async () => {
    if (activeView === 'registered_accounts') {
      exportRegisteredUsersCSV(filteredAccounts);
      return;
    }

    const query = await buildQuery(true);
    const { data } = await query;
    if (!data) return;
    
    const teamIds = [...new Set(data.map(m => m.team_id))];
    const { data: exportTeams } = await supabase.from('teams').select('id, team_name').in('id', teamIds);
    
    let csv = "data:text/csv;charset=utf-8,User,Role,Team,Email,College,Location,Year,Registered On\n";
    data.forEach(m => {
      const t = exportTeams?.find(team => team.id === m.team_id);
      const isLeader = getIsLeader(m);
      const role = isLeader ? 'Team Lead' : 'Member';
      csv += `"${m.full_name || ''}","${role}","${t ? t.team_name : ''}","${m.email || ''}","${m.college_name || ''}","${m.location || m.city || ''}","${m.year || ''}","${new Date(m.created_at).toLocaleString()}"\n`;
    });
    const a = document.createElement("a");
    a.href = encodeURI(csv);
    a.download = "participants_roster_export.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <>
      <header style={{ height:64, background:S.card, borderBottom:'1px solid '+S.border, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div>
              <h1 style={{ fontSize:18, fontWeight:700, margin:0, color:S.t1 }}>Dashboard</h1>
              <div style={{ fontSize:11, fontWeight:500, color:S.t2, display:'flex', alignItems:'center', gap:4 }}>Home <ChevronRight size={12}/> <span style={{color:S.t1}}>Users & Telemetry</span></div>
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

        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:S.pad }}>
          <div style={{ display:'flex', flexDirection:'column', gap:S.gap, minWidth:0 }}>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:14 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:700, margin:0, color:S.t1 }}>Users & Registered Accounts</h2>
                <p style={{ fontSize:13, color:S.t2, margin:'4px 0 0' }}>
                  Track all registered emails, login frequency, squad formations, and pending registrations.
                </p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <button 
                  onClick={() => {
                    loadAccounts();
                    fetchData();
                  }}
                  disabled={accountsLoading}
                  style={{ display:'flex', alignItems:'center', gap:6, background:S.card, color:S.t1, border:'1px solid '+S.border, padding:'9px 14px', borderRadius:10, fontSize:12.5, fontWeight:600, cursor: accountsLoading ? 'not-allowed' : 'pointer', boxShadow:'0 1px 2px rgba(0,0,0,.04)' }}
                  title="Synchronize live database"
                >
                  <RefreshCw size={14} style={{ animation: accountsLoading ? 'spin 1s linear infinite' : 'none', color:'#0284c7' }}/>
                  <span>{accountsLoading ? 'Syncing...' : 'Sync Data'}</span>
                </button>
                <button 
                  onClick={exportCSV} 
                  style={{ display:'flex', alignItems:'center', gap:6, background:'#6C4EFF', color:'#FFFFFF', border:'none', padding:'9px 16px', borderRadius:10, fontSize:12.5, fontWeight:700, cursor:'pointer', boxShadow:'0 2px 4px rgba(108,78,255,.2)' }}
                >
                  <Download size={15}/> Export {activeView === 'registered_accounts' ? 'Emails Activity CSV' : 'Roster CSV'}
                </button>
              </div>
            </div>

            {/* STATS CARDS */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:S.gap, minWidth:0 }}>
              {stats.map((c, i) => (
                <div 
                  key={i} 
                  onClick={c.action}
                  style={{ 
                    background:S.card, 
                    border: c.isAlert ? '1.5px solid #FCA5A5' : '1px solid '+S.border, 
                    borderRadius:S.radius, 
                    padding:'18px 20px', 
                    boxShadow:'0 1px 3px rgba(0,0,0,.04)', 
                    display:'flex', 
                    gap:14, 
                    alignItems:'flex-start',
                    cursor:'pointer',
                    transition:'all 0.2s',
                  }}
                  title="Click to view corresponding list"
                >
                  <div style={{ width:42, height:42, borderRadius:12, background:c.bg, color:c.c, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <c.icon size={21}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:S.t2, marginBottom:3, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span>{c.title}</span>
                      {c.isAlert && (
                        <span style={{ background:'#DC2626', color:'#fff', padding:'1px 6px', borderRadius:10, fontSize:10, fontWeight:800 }}>ALERT</span>
                      )}
                    </div>
                    <div style={{ fontSize:26, fontWeight:800, color: c.isAlert ? '#DC2626' : S.t1, marginBottom:3, letterSpacing:'-0.02em' }}>
                      {c.value}
                    </div>
                    <div style={{ fontSize:11, color:S.t3, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {c.subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* TAB SELECTOR */}
            <div style={{ display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid '+S.border, paddingBottom:4, overflowX:'auto' }}>
              <button
                onClick={() => setActiveView('registered_accounts')}
                style={{
                  padding:'10px 18px',
                  borderRadius:10,
                  border: activeView === 'registered_accounts' ? '2px solid #6C4EFF' : '1px solid transparent',
                  background: activeView === 'registered_accounts' ? '#EEE8FF' : 'transparent',
                  color: activeView === 'registered_accounts' ? '#6C4EFF' : S.t2,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s'
                }}
              >
                <Mail size={16}/>
                <span>All Registered Accounts & Activity</span>
                <span style={{
                  background: activeView === 'registered_accounts' ? '#6C4EFF' : '#F1F5F9',
                  color: activeView === 'registered_accounts' ? '#fff' : S.t1,
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 800
                }}>
                  {accountsStats.totalRegistered}
                </span>
                {accountsStats.withoutTeamCount > 0 && (
                  <span style={{
                    background: '#DC2626',
                    color: '#fff',
                    padding: '2px 7px',
                    borderRadius: 10,
                    fontSize: 10.5,
                    fontWeight: 800,
                  }} title={`${accountsStats.withoutTeamCount} accounts have registered without team details!`}>
                    {accountsStats.withoutTeamCount} Pending
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveView('team_roster')}
                style={{
                  padding:'10px 18px',
                  borderRadius:10,
                  border: activeView === 'team_roster' ? '2px solid #6C4EFF' : '1px solid transparent',
                  background: activeView === 'team_roster' ? '#EEE8FF' : 'transparent',
                  color: activeView === 'team_roster' ? '#6C4EFF' : S.t2,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s'
                }}
              >
                <Users size={16}/>
                <span>Squad Participants Roster & ID Cards</span>
                <span style={{
                  background: activeView === 'team_roster' ? '#6C4EFF' : '#F1F5F9',
                  color: activeView === 'team_roster' ? '#fff' : S.t1,
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 800
                }}>
                  {totalUsersDB}
                </span>
              </button>
            </div>

            {/* CONDITIONAL TAB 1: REGISTERED ACCOUNTS & LOGIN ACTIVITY */}
            {activeView === 'registered_accounts' && (
              <div style={{ background:S.card, border:'1px solid '+S.border, borderRadius:S.radius, boxShadow:'0 1px 3px rgba(0,0,0,.04)', display:'flex', flexDirection:'column', minWidth: 0 }}>
                
                {/* FILTER & SEARCH BAR */}
                <div style={{ padding:'16px 20px', borderBottom:'1px solid '+S.border, display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:260, flexWrap:'wrap' }}>
                    <div style={{ position:'relative', minWidth:220, flex:1 }}>
                      <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:S.t3 }}/>
                      <input 
                        placeholder="Search email, name, or squad..." 
                        value={accountsSearch} 
                        onChange={(e) => { setAccountsSearch(e.target.value); setAccountsPage(1); }}
                        style={{ paddingLeft:36, paddingRight:16, paddingTop:9, paddingBottom:9, background:S.card, border:'1px solid '+S.border, borderRadius:8, fontSize:13, width:'100%', outline:'none', color:S.t1 }}
                      />
                    </div>

                    {/* Filter Pills */}
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {[
                        { id: 'all', label: `All Mails (${accounts.length})` },
                        { id: 'no_team', label: `⚠️ No Team Details (${accountsStats.withoutTeamCount})`, highlight: accountsStats.withoutTeamCount > 0 },
                        { id: 'has_team', label: `✅ Squad Formed (${accountsStats.withTeamCount})` },
                        { id: 'google', label: `Google SSO (${accounts.filter(u => u.provider?.toLowerCase().includes('google')).length})` },
                        { id: 'email', label: `Email / Pass (${accounts.filter(u => !u.provider?.toLowerCase().includes('google')).length})` },
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => { setAccountsFilter(f.id); setAccountsPage(1); }}
                          style={{
                            padding:'6px 12px',
                            borderRadius:8,
                            fontSize:12,
                            fontWeight:700,
                            cursor:'pointer',
                            border: accountsFilter === f.id ? '1.5px solid #6C4EFF' : '1px solid ' + (f.highlight ? '#FCA5A5' : S.border),
                            background: accountsFilter === f.id ? '#EEE8FF' : (f.highlight ? '#FEF2F2' : '#F8FAFC'),
                            color: accountsFilter === f.id ? '#6C4EFF' : (f.highlight ? '#DC2626' : S.t2),
                            display:'flex',
                            alignItems:'center',
                            gap:4
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    {(accountsSearch || accountsFilter !== 'all') && (
                      <span 
                        onClick={() => { setAccountsSearch(''); setAccountsFilter('all'); setAccountsPage(1); }} 
                        style={{ fontSize:12.5, fontWeight:600, color:S.t2, cursor:'pointer', textDecoration:'underline' }}
                      >
                        Clear Filters
                      </span>
                    )}
                  </div>
                </div>

                {/* TABLE */}
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, tableLayout:'auto' }}>
                    <thead>
                      <tr style={{ background:'#FAFAFA', borderBottom:'1px solid '+S.border }}>
                        {['#', 'Registered User & Email', 'Auth Provider', 'Squad / Team Status', 'Login Frequency', 'Last Login Activity', 'Registered On', 'Actions'].map(h => (
                          <th key={h} style={{ padding:'14px 16px', fontWeight:600, color:S.t2, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {accountsLoading ? (
                        <tr>
                          <td colSpan="8" style={{ padding:40, textAlign:'center', color:S.t2 }}>
                            <div style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
                              <div style={{ width:18, height:18, border:'2px solid '+S.primary, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
                              <span>Loading registered accounts & activity telemetry...</span>
                            </div>
                          </td>
                        </tr>
                      ) : paginatedAccounts.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ padding:40, textAlign:'center', color:S.t3 }}>
                            No registered accounts match the selected filter.
                          </td>
                        </tr>
                      ) : (
                        paginatedAccounts.map((u, index) => {
                          const sNo = (accountsPage - 1) * accountsPerPage + index + 1;
                          const isGoogle = u.provider?.toLowerCase().includes('google');
                          const isCopied = copiedEmail === u.email;

                          return (
                            <tr 
                              key={u.email} 
                              style={{ 
                                borderBottom:'1px solid #F8FAFC',
                                background: !u.hasTeam ? '#FFFDF5' : 'transparent',
                                transition:'background 0.15s'
                              }}
                            >
                              {/* S.No */}
                              <td style={{ padding:'14px 16px', color:S.t2, fontSize:12, fontWeight:600 }}>
                                {sNo}
                              </td>

                              {/* User & Email */}
                              <td style={{ padding:'14px 16px' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                  <div style={{ 
                                    width:36, height:36, borderRadius:'50%', 
                                    background: !u.hasTeam ? '#FEF3C7' : '#EEE8FF', 
                                    color: !u.hasTeam ? '#D97706' : '#6C4EFF', 
                                    display:'flex', alignItems:'center', justifyContent:'center', 
                                    fontWeight:700, fontSize:13, flexShrink:0 
                                  }}>
                                    {u.fullName?.charAt(0)?.toUpperCase() || u.email.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight:700, color:S.t1, display:'flex', alignItems:'center', gap:6 }}>
                                      <span>{u.fullName || 'Registered User'}</span>
                                      {u.isLeader && (
                                        <span style={{ background:'#FEF3C7', color:'#D97706', padding:'2px 6px', borderRadius:6, fontSize:10, fontWeight:800, display:'inline-flex', alignItems:'center', gap:3 }}>
                                          <Crown size={10}/> Leader
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
                                      <span style={{ fontSize:12, color:'#475569', fontFamily:'monospace' }}>{u.email}</span>
                                      <button
                                        onClick={() => handleCopyEmail(u.email)}
                                        style={{ background:'none', border:'none', cursor:'pointer', padding:2, color: isCopied ? '#16A34A' : S.t3, display:'inline-flex', alignItems:'center' }}
                                        title="Copy email address"
                                      >
                                        {isCopied ? <Check size={12}/> : <Copy size={12}/>}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Auth Provider */}
                              <td style={{ padding:'14px 16px', whiteSpace:'nowrap' }}>
                                <span style={{
                                  display:'inline-flex', alignItems:'center', gap:5,
                                  padding:'4px 9px', borderRadius:6, fontSize:11, fontWeight:700,
                                  background: isGoogle ? '#F0FDF4' : '#F1F5F9',
                                  color: isGoogle ? '#15803D' : '#475569',
                                  border: '1px solid ' + (isGoogle ? '#BBF7D0' : '#E2E8F0')
                                }}>
                                  <span style={{ width:6, height:6, borderRadius:'50%', background: isGoogle ? '#22C55E' : '#64748B' }}/>
                                  {isGoogle ? 'Google SSO' : 'Email / Password'}
                                </span>
                              </td>

                              {/* Squad / Team Details */}
                              <td style={{ padding:'14px 16px' }}>
                                {u.hasTeam ? (
                                  <div>
                                    <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#DCFCE7', color:'#166534', padding:'4px 10px', borderRadius:6, fontSize:11.5, fontWeight:700 }}>
                                      <Flag size={11} color="#166534"/>
                                      <span>{u.teamName}</span>
                                    </div>
                                    {u.collegeName && u.collegeName !== '-' && (
                                      <div style={{ fontSize:11, color:S.t2, marginTop:3 }}>
                                        {u.collegeName}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div>
                                    <span style={{
                                      display:'inline-flex', alignItems:'center', gap:5,
                                      background:'#FEF2F2', color:'#DC2626',
                                      border:'1px solid #FECACA',
                                      padding:'4px 10px', borderRadius:6, fontSize:11.5, fontWeight:800
                                    }}>
                                      <AlertCircle size={12} color="#DC2626"/>
                                      <span>No Team Details Yet</span>
                                    </span>
                                    <div style={{ fontSize:11, color:'#DC2626', fontWeight:600, marginTop:3 }}>
                                      Pending Squad Setup
                                    </div>
                                  </div>
                                )}
                              </td>

                              {/* Login Frequency */}
                              <td style={{ padding:'14px 16px', whiteSpace:'nowrap' }}>
                                <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#EEE8FF', color:'#6C4EFF', padding:'4px 10px', borderRadius:8, fontSize:12, fontWeight:800 }}>
                                  <Activity size={12}/>
                                  <span>{u.loginCount || 1} {(u.loginCount || 1) === 1 ? 'Login' : 'Logins'}</span>
                                </div>
                              </td>

                              {/* Last Login Activity */}
                              <td style={{ padding:'14px 16px', color:S.t2, fontSize:12, whiteSpace:'nowrap' }}>
                                {u.lastLoginAt ? (
                                  <div>
                                    <div style={{ fontWeight:600, color:S.t1 }}>
                                      {new Date(u.lastLoginAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                                    </div>
                                    <div style={{ fontSize:11, color:S.t3 }}>
                                      {new Date(u.lastLoginAt).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
                                    </div>
                                  </div>
                                ) : (
                                  <span style={{ color:S.t3 }}>—</span>
                                )}
                              </td>

                              {/* Registered On */}
                              <td style={{ padding:'14px 16px', color:S.t2, fontSize:12, whiteSpace:'nowrap' }}>
                                {u.registeredAt ? (
                                  <div>
                                    <div>{new Date(u.registeredAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</div>
                                    <span style={{ fontSize:11, color:S.t3 }}>{new Date(u.registeredAt).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}</span>
                                  </div>
                                ) : (
                                  <span style={{ color:S.t3 }}>—</span>
                                )}
                              </td>

                              {/* Actions */}
                              <td style={{ padding:'14px 16px', whiteSpace:'nowrap' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                  <button
                                    onClick={() => handleCopyEmail(u.email)}
                                    style={{
                                      padding:'6px 10px', borderRadius:8,
                                      background:'#F8FAFC', border:'1px solid '+S.border,
                                      fontSize:12, fontWeight:600, color: isCopied ? '#16A34A' : S.t1,
                                      cursor:'pointer', display:'inline-flex', alignItems:'center', gap:4
                                    }}
                                    title="Copy Email"
                                  >
                                    {isCopied ? <Check size={12}/> : <Copy size={12}/>}
                                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                                  </button>

                                  {!u.hasTeam && (
                                    <a
                                      href={`mailto:${u.email}?subject=HAXLR8%203.0%20-%20Complete%20Your%20Squad%20Registration&body=Hello%20${encodeURIComponent(u.fullName || 'Captain')},%0A%0AWe%20noticed%20that%20you%20registered%20your%20account%20on%20the%20HAXLR8%203.0%20Space%20Flight%20platform,%20but%20haven't%20added%20your%20team%20details%20yet.%0A%0APlease%20log%20in%20to%20complete%20your%20squad%20roster:%0Ahttps://haxlr8.live/dashboard%0A%0ABest%20regards,%0AHAXLR8%20Organizing%20Committee`}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        padding:'6px 10px', borderRadius:8,
                                        background:'#FEF2F2', border:'1px solid #FECACA',
                                        fontSize:12, fontWeight:700, color:'#DC2626',
                                        textDecoration:'none', display:'inline-flex', alignItems:'center', gap:4
                                      }}
                                      title="Send reminder to complete team setup"
                                    >
                                      <Mail size={12}/> Remind
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                <div style={{ padding:'16px 20px', borderTop:'1px solid '+S.border, display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13, flexWrap:'wrap', gap:10 }}>
                  <div style={{ color:S.t2, fontWeight:500 }}>
                    Showing {filteredAccounts.length === 0 ? 0 : (accountsPage - 1) * accountsPerPage + 1} to {Math.min(accountsPage * accountsPerPage, filteredAccounts.length)} of {filteredAccounts.length} registered accounts
                  </div>
                  {totalAccountsPages > 1 && (
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <button 
                        onClick={() => setAccountsPage(p => Math.max(1, p - 1))} 
                        disabled={accountsPage === 1} 
                        style={{ background:S.card, border:'1px solid '+S.border, borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color: accountsPage === 1 ? S.border : S.t3, cursor: accountsPage === 1 ? 'default' : 'pointer' }}
                      >
                        <ChevronLeft size={14}/>
                      </button>
                      
                      {Array.from({ length: totalAccountsPages }, (_, i) => i + 1).map(p => (
                        <button 
                          key={p} 
                          onClick={() => setAccountsPage(p)} 
                          style={{ background: accountsPage === p ? '#EEE8FF' : S.card, border: accountsPage === p ? 'none' : '1px solid '+S.border, borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color: accountsPage === p ? S.primary : S.t2, fontWeight: accountsPage === p ? 700 : 600, cursor:'pointer' }}
                        >
                          {p}
                        </button>
                      ))}
                      
                      <button 
                        onClick={() => setAccountsPage(p => Math.min(totalAccountsPages, p + 1))} 
                        disabled={accountsPage === totalAccountsPages} 
                        style={{ background:S.card, border:'1px solid '+S.border, borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color: accountsPage === totalAccountsPages ? S.border : S.t3, cursor: accountsPage === totalAccountsPages ? 'default' : 'pointer' }}
                      >
                        <ChevronRight size={14}/>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* CONDITIONAL TAB 2: SQUAD PARTICIPANTS ROSTER (UNCHANGED) */}
            {activeView === 'team_roster' && (
            <div style={{ background:S.card, border:'1px solid '+S.border, borderRadius:S.radius, boxShadow:'0 1px 3px rgba(0,0,0,.04)', display:'flex', flexDirection:'column', minWidth: 0 }}>
              
              <div style={{ padding:'16px 20px', borderBottom:'1px solid '+S.border, display:'flex', justifyContent:'space-between', alignItems:'center', gap:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, overflowX:'auto', paddingBottom:4, flexWrap:'nowrap' }}>
                  <div style={{ position:'relative', minWidth:220 }}>
                    <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:S.t3 }}/>
                    <input 
                      placeholder="Search name or email..." 
                      value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ paddingLeft:36, paddingRight:16, paddingTop:10, paddingBottom:10, background:S.card, border:'1px solid '+S.border, borderRadius:8, fontSize:13, width:'100%', outline:'none', color:S.t1 }}
                    />
                  </div>
                  <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }} style={{ padding:'10px 14px', border:'1px solid '+S.border, borderRadius:8, fontSize:13, fontWeight:500, color:S.t1, outline:'none', cursor:'pointer', appearance:'none', background:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 10px center`, paddingRight:32, flexShrink:0 }}>
                    <option>All Roles</option>
                    <option>Team Lead</option>
                    <option>Member</option>
                  </select>
                  <input placeholder="Filter by team..." value={teamFilter === 'All Teams' ? '' : teamFilter} onChange={e => { setTeamFilter(e.target.value); setCurrentPage(1); }} style={{ padding:'10px 14px', border:'1px solid '+S.border, borderRadius:8, fontSize:13, outline:'none', minWidth:160, flexShrink:0 }}/>
                  <select value={yearFilter} onChange={e => { setYearFilter(e.target.value); setCurrentPage(1); }} style={{ padding:'10px 14px', border:'1px solid '+S.border, borderRadius:8, fontSize:13, fontWeight:500, color:S.t1, outline:'none', cursor:'pointer', appearance:'none', background:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 10px center`, paddingRight:32, flexShrink:0 }}>
                    <option>All Years</option>
                    <option>1</option><option>2</option><option>3</option><option>4</option>
                  </select>
                  <input placeholder="Filter by college..." value={collegeFilter} onChange={e => { setCollegeFilter(e.target.value); setCurrentPage(1); }} style={{ padding:'10px 14px', border:'1px solid '+S.border, borderRadius:8, fontSize:13, outline:'none', minWidth:160, flexShrink:0 }}/>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
                  <span onClick={() => { setSearchTerm(''); setRoleFilter('All Roles'); setTeamFilter('All Teams'); setYearFilter('All Years'); setCollegeFilter(''); setCurrentPage(1); }} style={{ fontSize:13, fontWeight:600, color:S.t2, cursor:'pointer' }}>Clear Filters</span>
                </div>
              </div>

              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, tableLayout:'auto' }}>
                  <thead>
                    <tr style={{ background:'#FAFAFA', borderBottom:'1px solid '+S.border }}>
                      {['S.No', 'User', 'Role', 'Team', 'Email', 'College', 'Location', 'Year', 'ID Card', 'Verified By', 'Registered On', 'Actions'].map(h => (
                        <th key={h} style={{ padding:'14px 16px', fontWeight:600, color:S.t2, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentMembers.map((m, index) => {
                      const t = teams.find(team => team.id === m.team_id);
                      const isLeader = getIsLeader(m);
                      const avatarColors = [
                        {bg: '#DCFCE7', text: '#16A34A'}, {bg: '#EEE8FF', text: '#6C4EFF'},
                        {bg: '#FEF3C7', text: '#D97706'}, {bg: '#DBEAFE', text: '#2563EB'},
                        {bg: '#F3E8FF', text: '#9333EA'}
                      ];
                      const ac = avatarColors[m.id % avatarColors.length] || avatarColors[0];
                      
                      return (
                        <tr key={m.id} style={{ borderBottom:'1px solid #F8FAFC' }}>
                          <td style={{ padding:'14px 16px', color:S.t2, fontSize:12, fontWeight:600 }}>
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td style={{ padding:'14px 16px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <div style={{ width:34, height:34, borderRadius:'50%', background:ac.bg, color:ac.text, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, flexShrink:0 }}>
                                {m.full_name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <div style={{ fontWeight:700, color:S.t1 }}>{m.full_name || 'N/A'}</div>
                                <div style={{ fontSize:11, color:S.t3, marginTop:1 }}>@{m.full_name?.toLowerCase().replace(/\s+/g,'') || 'user'}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:'14px 16px' }}>
                            <span style={{ 
                              background: isLeader ? '#EEE8FF' : '#DBEAFE', 
                              color: isLeader ? '#6C4EFF' : '#2563EB', 
                              padding:'4px 10px', borderRadius:6, fontSize:11, fontWeight:600, whiteSpace:'nowrap', display:'inline-block'
                            }}>
                              {isLeader ? 'Team Lead' : 'Member'}
                            </span>
                          </td>
                          <td style={{ padding:'14px 16px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6, fontWeight:600, color:S.t1, fontSize:12 }}>
                              <div style={{ width:18, height:18, borderRadius:4, background:ac.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <Flag size={10} color={ac.text}/>
                              </div>
                              {t ? t.team_name : '-'}
                            </div>
                          </td>
                          <td style={{ padding:'14px 16px', color:S.t2, fontSize:12 }}>{m.email || 'N/A'}</td>
                          <td style={{ padding:'14px 16px', color:S.t2, fontSize:12 }}>{m.college_name || '-'}</td>
                          <td style={{ padding:'14px 16px', color:S.t2, fontSize:12 }}>{m.location || '-'}</td>
                          <td style={{ padding:'14px 16px', color:S.t2 }}>{m.year || '-'}</td>
                          
                          {/* ID Card Column */}
                          <td style={{ padding:'14px 16px' }}>
                            {m.id_card_front_url && m.id_card_back_url ? (
                              <button onClick={() => { setIdModal(m); setVerifyConfirmed(false); }} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'1px solid '+S.border, background:m.id_card_verified ? '#f0fdf4' : S.card, color:m.id_card_verified ? '#16a34a' : S.primary, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                                <Eye size={14}/> View
                              </button>
                            ) : (
                              <span style={{ fontSize:11, color:'#d97706', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                                <Clock size={12}/> Missing
                              </span>
                            )}
                          </td>
                          
                          {/* Verified By Column */}
                          <td style={{ padding:'14px 16px', fontSize:12 }}>
                            {m.id_card_verified ? (
                              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                <CheckCircle size={14} color="#16a34a"/>
                                <span style={{ color:S.t1, fontWeight:600 }}>{m.id_card_verified_by || 'Admin'}</span>
                              </div>
                            ) : (
                              <span style={{ color:S.t3 }}>—</span>
                            )}
                          </td>

                          <td style={{ padding:'14px 16px', color:S.t2, whiteSpace: 'nowrap', fontSize:12 }}>
                            {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} <br/>
                            <span style={{ fontSize: 11, color: S.t3 }}>{new Date(m.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>

                          {/* Actions Column */}
                          <td style={{ padding:'14px 16px' }}>
                            <button 
                              onClick={() => handleDeleteUser(m.id, m.full_name)}
                              style={{ padding:'6px 10px', borderRadius:8, background:'#FEF2F2', border:'1px solid #FECACA', color:'#DC2626', fontWeight:700, fontSize:12, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:4 }}
                              title="Permanently delete user from database"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {currentMembers.length === 0 && (
                      <tr>
                        <td colSpan="12" style={{ padding:40, textAlign:'center', color:S.t3 }}>No participants found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ padding:'16px 20px', borderTop:'1px solid '+S.border, display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13 }}>
                <div style={{ color:S.t2, fontWeight:500 }}>Showing {totalFilteredCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalFilteredCount)} of {totalFilteredCount} users</div>
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
            )}
          </div>
        </div>

      {/* ID Card Verification Modal */}
      {idModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:24, backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:800, overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,0.2)', display:'flex', flexDirection:'column', maxHeight:'90vh' }}>
            
            {/* Modal Header */}
            <div style={{ padding:'20px 28px', borderBottom:'1px solid #e5e7eb', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <h2 style={{ fontSize:18, fontWeight:800, color:'#111', margin:'0 0 4px 0' }}>ID Card — {idModal.full_name}</h2>
                <p style={{ fontSize:13, color:'#6b7280', margin:0 }}>{idModal.email} · {idModal.college_name || 'N/A'}</p>
              </div>
              <button onClick={() => { setIdModal(null); setVerifyConfirmed(false); }} style={{ background:'#f3f4f6', border:'none', width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#4b5563' }}>
                <X size={18}/>
              </button>
            </div>

            {/* Modal Images */}
            <div style={{ padding:28, overflowY:'auto', flex:1, display:'flex', gap:24, flexWrap:'wrap', justifyContent:'center', background:'#f8fafc' }}>
              <div style={{ flex:'1 1 300px', maxWidth:380 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#374151', marginBottom:10, textAlign:'center' }}>Front Side</div>
                <div style={{ background:'#fff', padding:10, borderRadius:14, boxShadow:'0 4px 12px rgba(0,0,0,0.05)' }}>
                  <img src={idModal.id_card_front_url} alt="Front" style={{ width:'100%', height:'auto', borderRadius:8, objectFit:'contain' }}/>
                </div>
              </div>
              <div style={{ flex:'1 1 300px', maxWidth:380 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#374151', marginBottom:10, textAlign:'center' }}>Back Side</div>
                <div style={{ background:'#fff', padding:10, borderRadius:14, boxShadow:'0 4px 12px rgba(0,0,0,0.05)' }}>
                  <img src={idModal.id_card_back_url} alt="Back" style={{ width:'100%', height:'auto', borderRadius:8, objectFit:'contain' }}/>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding:'20px 28px', borderTop:'1px solid #e5e7eb', background:'#fff' }}>
              {idModal.id_card_verified ? (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, background:'#f0fdf4', padding:'12px 16px', borderRadius:12, border:'1.5px solid #bbf7d0' }}>
                    <CheckCircle size={20} color="#16a34a"/>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#166534' }}>Already Verified</div>
                      <div style={{ fontSize:12, color:'#15803d' }}>Verified by: {idModal.id_card_verified_by || 'Admin'}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteIdPhotos(idModal.id, idModal.full_name)}
                    style={{ padding:'10px 16px', borderRadius:10, background:'#FEF2F2', border:'1.5px solid #FECACA', fontSize:13, fontWeight:700, color:'#DC2626', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6 }}
                  >
                    <Trash2 size={15}/> Delete ID Photos from DB
                  </button>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <label style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer', background:'#f0fdf4', padding:'14px 18px', borderRadius:12, border:'1.5px solid #bbf7d0' }}>
                    <input type="checkbox" checked={verifyConfirmed} onChange={e => setVerifyConfirmed(e.target.checked)} style={{ width:18, height:18, accentColor:'#16a34a', cursor:'pointer' }}/>
                    <span style={{ fontSize:14, fontWeight:700, color:'#166534' }}>I verify this is a correct and valid student ID card.</span>
                  </label>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                    <button 
                      onClick={() => handleDeleteIdPhotos(idModal.id, idModal.full_name)}
                      style={{ padding:'10px 16px', borderRadius:10, background:'#FEF2F2', border:'1.5px solid #FECACA', fontSize:13, fontWeight:700, color:'#DC2626', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6 }}
                    >
                      <Trash2 size={15}/> Delete ID Photos from DB
                    </button>
                    <div style={{ display:'flex', gap:10 }}>
                      <button onClick={() => { setIdModal(null); setVerifyConfirmed(false); }} style={{ padding:'10px 20px', borderRadius:10, background:'#fff', border:'1.5px solid #e5e7eb', fontSize:14, fontWeight:600, color:'#374151', cursor:'pointer' }}>Cancel</button>
                      <button onClick={handleVerify} disabled={!verifyConfirmed || verifying} style={{ padding:'10px 24px', borderRadius:10, background:(!verifyConfirmed || verifying) ? '#9ca3af' : '#16a34a', border:'none', fontSize:14, fontWeight:700, color:'#fff', cursor:(!verifyConfirmed || verifying) ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:8 }}>
                        <CheckCircle size={16}/> {verifying ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
      
    </>
  );
}
