import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { isOrganizerAuthorized } from './adminAuth';
import { Users, Flag, FileText, CheckSquare, Shield, Search, ChevronDown, Megaphone, ChevronRight, Mail, Send, CheckCircle2, RefreshCw, Sliders } from 'lucide-react';
import { getEmailDispatchLogs, HAXLR8_HOST_EMAIL } from '../../lib/emailService';
import { syncLocalDataToSupabase } from '../../lib/syncService';
import { resolveDomain } from '../../lib/domainUtils';
import CrewSquadronsModal from '../../components/admin/CrewSquadronsModal';

// Style constants
const S = {
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E5E7EB', primary: '#6C4EFF',
  t1: '#111827', t2: '#6B7280', t3: '#9CA3AF', green: '#059669',
  activeBg: '#EEE8FF', radius: '14px', pad: '24px', gap: '20px',
};

const DASHBOARD_CACHE_KEY = 'haxlr8_admin_dashboard_cache';

const withTimeout = (promise, ms = 7500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Telemetry request timed out')), ms))
  ]);
};

const getCachedDashboard = () => {
  try {
    const raw = localStorage.getItem(DASHBOARD_CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
};

const setCachedDashboard = (data) => {
  try {
    localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(data));
  } catch (e) {}
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '/udview';
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Initialize from cache so mobile users immediately see data on open without lag
  const initialCache = getCachedDashboard();
  const safeInitialCounts = {
    teams: Math.max(initialCache?.exactCounts?.teams || 0, initialCache?.teams?.length || 0),
    members: Math.max(initialCache?.exactCounts?.members || 0, initialCache?.members?.length || 0),
    subs: Math.max(initialCache?.exactCounts?.subs || 0, initialCache?.submissions?.length || 0),
    evals: Math.max(initialCache?.exactCounts?.evals || 0, initialCache?.teams?.length || 0)
  };
  const [teams, setTeams] = useState(initialCache?.teams || []);
  const [members, setMembers] = useState(initialCache?.members || []);
  const [submissions, setSubmissions] = useState(initialCache?.submissions || []);
  const [exactCounts, setExactCounts] = useState(safeInitialCounts);
  const [adminEmail, setAdminEmail] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [emailLogs, setEmailLogs] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataError, setDataError] = useState('');
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('haxlr8_admin_email') || 'haxlr8ecemitm@gmail.com';
      setAdminEmail(savedEmail);
    } catch (e) {}
  }, []);

  const fetchData = useCallback(async () => {
    setDataError('');
    try {
      // Fetch data & exact counts in a single fast, timeout-guarded parallel request (3 queries instead of 6)
      // Exclude heavy base64 strings from submissions to ensure lightning-fast mobile loading
      const [tRes, mRes, sRes] = await withTimeout(
        Promise.all([
          supabase
            .from('teams')
            .select('id, leader_id, team_name, score, created_at, updated_at', { count: 'exact' })
            .order('created_at', { ascending: false }),
          supabase
            .from('team_members')
            .select('id, team_id, full_name, email, phone_number, college_name, dept, year, created_at, is_leader', { count: 'exact' })
            .order('created_at', { ascending: false }),
          supabase
            .from('submissions')
            .select('id, team_id, project_title, sdg_goal, category, status, created_at', { count: 'exact' })
            .order('created_at', { ascending: false }),
        ]),
        7500
      );

      const t = tRes?.data || [];
      const m = mRes?.data || [];
      const s = sRes?.data || [];

      const countTeams = (typeof tRes?.count === 'number' && tRes.count > 0) ? tRes.count : t.length;
      const countMembers = (typeof mRes?.count === 'number' && mRes.count > 0) ? mRes.count : m.length;
      const countSubs = (typeof sRes?.count === 'number' && sRes.count > 0) ? sRes.count : s.length;

      if (t.length > 0) setTeams(t);
      if (m.length > 0) setMembers(m);
      if (s.length > 0) setSubmissions(s);

      // Only update exactCounts if we received valid counts
      if (countTeams > 0 || countMembers > 0 || countSubs > 0) {
        const newCounts = {
          teams: countTeams,
          members: countMembers,
          subs: countSubs,
          evals: countTeams,
        };
        setExactCounts(newCounts);

        // Save lightweight payload (safe for mobile localStorage quota)
        setCachedDashboard({
          teams: t.length > 0 ? t : (initialCache?.teams || []),
          members: m.length > 0 ? m : (initialCache?.members || []),
          submissions: s.length > 0 ? s : (initialCache?.submissions || []),
          exactCounts: newCounts,
          savedAt: Date.now()
        });
      }
      setEmailLogs(getEmailDispatchLogs());
    } catch (err) {
      console.warn('Dashboard fetch notice (using cache):', err);
      setDataError('Mobile network sync delayed. Showing saved roster.');
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
      setLoadingAuth(false);
    };
    checkAuth();
  }, [fetchData]);

  // eslint-disable-next-line no-unused-vars
  const exportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,Team,Status,Score,Name,Email,Phone,College,Dept,Year\n";
    teams.forEach(t => {
      members.filter(m => m.team_id === t.id).forEach(m => {
        csv += ['"'+t.team_name+'"',t.status||'Pending',t.score||0,'"'+m.full_name+'"',m.email,m.phone_number,'"'+m.college_name+'"','"'+m.dept+'"',m.year].join(",") + "\n";
      });
    });
    const a = document.createElement("a");
    a.href = encodeURI(csv);
    a.download = "hackathon_export.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const getTrend = useCallback((arr, dateField = 'created_at') => {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const currentWeekCount = arr.filter(item => item[dateField] && new Date(item[dateField]) >= last7Days).length;
    const previousWeekCount = arr.filter(item => {
      if (!item[dateField]) return false;
      const d = new Date(item[dateField]);
      return d >= last14Days && d < last7Days;
    }).length;
    
    if (previousWeekCount === 0) return currentWeekCount > 0 ? 100 : 0;
    return Math.round(((currentWeekCount - previousWeekCount) / previousWeekCount) * 100);
  }, []);

  const statCards = [
    { title: 'Registered Squads', value: exactCounts.teams, trend: getTrend(teams), color: '#6C4EFF', bg: '#EEE8FF' },
    { title: 'Total Participants', value: exactCounts.members, trend: getTrend(members), color: '#059669', bg: '#D1FAE5' },
    { title: 'Squad Fee Est. (₹1,200/squad)', value: `₹${(exactCounts.teams * 1200).toLocaleString('en-IN')}`, trend: getTrend(teams), color: '#EA580C', bg: '#FFEDD5' },
    { title: 'Direct Finale Passes', value: `${exactCounts.teams} Squads`, trend: 100, color: '#0284C7', bg: '#E0F2FE' },
  ];

  const chartsData = useMemo(() => {
    const days = 7;
    const regCounts = Array(days).fill(0);
    const subCounts = Array(days).fill(0);
    const labels = Array(days).fill('');
    
    const now = new Date();
    for(let i = 0; i < days; i++) {
      const d = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
      labels[i] = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      regCounts[i] = members.filter(s => {
        if(!s.created_at) return false;
        const sd = new Date(s.created_at);
        return sd.getDate() === d.getDate() && sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
      }).length;
      
      subCounts[i] = submissions.filter(s => {
        if(!s.created_at) return false;
        const sd = new Date(s.created_at);
        return sd.getDate() === d.getDate() && sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
      }).length;
    }
    
    const getPathData = (counts) => {
      const maxVal = Math.max(...counts, 4);
      const points = counts.map((count, i) => {
        const x = (i / (days - 1)) * 800;
        const y = 200 - (count / maxVal) * 180;
        return [Math.round(x), Math.round(y)];
      });
      const pathString = "M" + points.map(p => p.join(',')).join(' L');
      const fillString = pathString + " L800,200 L0,200Z";
      const yLabels = [maxVal, Math.round(maxVal*0.75), Math.round(maxVal*0.5), Math.round(maxVal*0.25), 0];
      return { counts, points, pathString, fillString, yLabels };
    };
    
    return { 
      labels, 
      registration: getPathData(regCounts), 
      submission: getPathData(subCounts) 
    };
  }, [members, submissions]);

  if (loadingAuth) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg}}><div style={{width:40,height:40,border:'3px solid '+S.primary,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/></div>;
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

  const statusStyle = (s) => {
    if (s === 'Shortlisted') return { color: '#6C4EFF', background: '#EEE8FF' };
    if (s === 'Rejected') return { color: '#DC2626', background: '#FEF2F2' };
    return { color: '#D97706', background: '#FEF3C7' };
  };

  return (
    <>
        {/* TOP NAV */}
        <header style={{ minHeight:60, background:S.card, borderBottom:'1px solid '+S.border, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px clamp(14px, 3vw, 28px)', flexShrink:0, flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div>
              <h1 style={{ fontSize:18, fontWeight:700, margin:0, color:S.t1 }}>Dashboard</h1>
              <div style={{ fontSize:11, fontWeight:500, color:S.t2, display:'flex', alignItems:'center', gap:4 }}>Home <ChevronRight size={12}/> <span style={{color:S.t1}}>Dashboard</span></div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
            <button
              onClick={async () => {
                setIsRefreshing(true);
                try { 
                  await fetchData(); 
                } catch (e) {
                  console.warn('Refresh error:', e);
                } finally { 
                  setIsRefreshing(false); 
                }
              }}
              disabled={isRefreshing}
              style={{
                display:'flex', alignItems:'center', gap:8,
                background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:10,
                padding:'8px 14px', fontSize:12.5, fontWeight:700, color:'#334155',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                transition:'all 0.2s'
              }}
              title="Synchronize database telemetry & local registrations"
            >
              <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none', color: '#0284c7' }} />
              {isRefreshing ? 'Syncing...' : 'Sync & Refresh'}
            </button>
            <button
              onClick={() => setShowTelemetryModal(true)}
              style={{
                display:'flex', alignItems:'center', gap:6,
                background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:10,
                padding:'8px 12px', fontSize:12.5, fontWeight:700, color:'#475569',
                cursor: 'pointer',
                transition:'all 0.2s'
              }}
              title="Calibrate Public Counter"
            >
              <Sliders size={13} style={{ color: '#6366f1' }} />
              <span>Counter Settings</span>
            </button>
            <div 
              onClick={() => setShowEmail(!showEmail)}
              style={{ display:'flex', alignItems:'center', gap:10, borderLeft:'1px solid '+S.border, paddingLeft:14, cursor:'pointer' }}
            >
              <div style={{ width:34, height:34, borderRadius:'50%', background:'#059669', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:14 }}>
                {adminEmail ? adminEmail.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:S.t1 }}>Admin User</div>
                <div style={{ fontSize:11, fontWeight:500, color:S.t2 }}>{showEmail ? adminEmail : 'Super Admin'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'clamp(14px, 3vw, 24px)' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:S.gap }}>

            {/* STAT CARDS */}
            <div className="admin-stat-cards-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:S.gap }}>
              {statCards.map((c, i) => (
                <div 
                  key={i} 
                  onClick={i === 0 ? () => setShowTelemetryModal(true) : undefined}
                  style={{ 
                    background:S.card, 
                    border:'1px solid '+S.border, 
                    borderRadius:S.radius, 
                    padding:'20px 22px', 
                    boxShadow:'0 1px 3px rgba(0,0,0,.04)',
                    cursor: i === 0 ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  title={i === 0 ? 'Click to calibrate public counter' : undefined}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {[<Users size={20}/>, <Users size={20}/>, <FileText size={20}/>, <Shield size={20}/>][i]}
                    </div>
                    {i === 0 && (
                      <span 
                        style={{ fontSize: 11, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: 6, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        title="Calibrate Public Counter"
                      >
                        <Sliders size={11} color="#6366f1" />
                        <span>Settings</span>
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize:12, fontWeight:600, color:S.t2, marginBottom:4 }}>{c.title}</div>
                  <div style={{ fontSize:28, fontWeight:800, color:S.t1, marginBottom:6 }}>{c.value}</div>
                  <div style={{ fontSize:11, fontWeight:600, color: c.trend >= 0 ? S.green : '#DC2626' }}>{c.trend >= 0 ? '↑' : '↓'} {Math.abs(c.trend)}% <span style={{ color:S.t3, fontWeight:400, marginLeft:4 }}>vs last 7 days</span></div>
                </div>
              ))}
            </div>

            {/* CHARTS ROW */}
            <div className="admin-charts-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:S.gap, minHeight:380 }}>
              {/* Registration Chart */}
              <div style={{ background:S.card, border:'1px solid '+S.border, borderRadius:S.radius, padding:S.pad, boxShadow:'0 1px 3px rgba(0,0,0,.04)', display:'flex', flexDirection:'column' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                  <h3 style={{ fontSize:15, fontWeight:700, margin:0 }}>Registration Graph</h3>
                  <div style={{ fontSize:12, fontWeight:500, color:S.t2, background:'#F1F5F9', padding:'5px 10px', borderRadius:8, border:'1px solid '+S.border, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>This Week</div>
                </div>
                <div style={{ flex:1, position:'relative', minHeight:180 }}>
                  <div style={{ position:'absolute', left:0, top:0, bottom:32, display:'flex', flexDirection:'column', justifyContent:'space-between', fontSize:10, fontWeight:500, color:S.t3, width:24 }}>
                    {chartsData.registration.yLabels.map((yl, i) => <span key={i}>{yl}</span>)}
                  </div>
                  <svg viewBox="0 0 800 200" style={{ width:'calc(100% - 30px)', height:'calc(100% - 32px)', marginLeft:30, overflow:'visible' }} preserveAspectRatio="none">
                    <defs><linearGradient id="cgReg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15"/><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/></linearGradient></defs>
                    <path d={chartsData.registration.fillString} fill="url(#cgReg)"/>
                    <path d={chartsData.registration.pathString} fill="none" stroke="#8b5cf6" strokeWidth="2.5"/>
                    {chartsData.registration.points.map(([x,y],i) => (
                      <circle key={i} cx={x} cy={y} r="6" fill="#8b5cf6" style={{cursor: 'pointer'}}><title>{chartsData.registration.counts[i]} Registrations on this day</title></circle>
                    ))}
                  </svg>
                  <div style={{ position:'absolute', bottom:0, left:30, right:0, display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:500, color:S.t3 }}>
                    {chartsData.labels.map((d, i) => <span key={i}>{d}</span>)}
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(110px, 1fr))', gap:10, marginTop:16 }}>
                  {[
                    { dot:'#6C4EFF', label:'Total Users', val: exactCounts.members },
                    { dot:'#D97706', label:'Total Teams', val: exactCounts.teams },
                    { dot:'#059669', label:'Avg Team Size', val: exactCounts.teams ? (exactCounts.members / exactCounts.teams).toFixed(1) : 0 },
                    { dot:'#2563EB', label:'Submissions', val: exactCounts.subs },
                  ].map((s,i) => (
                    <div key={i} style={{ background:'#FAFAFA', border:'1px solid #F1F5F9', borderRadius:10, padding:'10px 12px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:s.dot }}/>
                        <span style={{ fontSize:11, fontWeight:600, color:S.t2 }}>{s.label}</span>
                      </div>
                      <div style={{ fontSize:20, fontWeight:800, color:S.t1 }}>{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Track Distribution & Registration Overview */}
              <div style={{ background:S.card, border:'1px solid '+S.border, borderRadius:S.radius, padding:S.pad, boxShadow:'0 1px 3px rgba(0,0,0,.04)', display:'flex', flexDirection:'column' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                  <h3 style={{ fontSize:15, fontWeight:700, margin:0 }}>Squad Registrations &amp; Domains</h3>
                  <div style={{ fontSize:12, fontWeight:500, color:S.t2, background:'#F1F5F9', padding:'5px 10px', borderRadius:8, border:'1px solid '+S.border, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>Live Activity</div>
                </div>
                <div style={{ flex:1, position:'relative', minHeight:180 }}>
                  <div style={{ position:'absolute', left:0, top:0, bottom:32, display:'flex', flexDirection:'column', justifyContent:'space-between', fontSize:10, fontWeight:500, color:S.t3, width:24 }}>
                    {chartsData.submission.yLabels.map((yl, i) => <span key={i}>{yl}</span>)}
                  </div>
                  <svg viewBox="0 0 800 200" style={{ width:'calc(100% - 30px)', height:'calc(100% - 32px)', marginLeft:30, overflow:'visible' }} preserveAspectRatio="none">
                    <defs><linearGradient id="cgSub" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#059669" stopOpacity="0.15"/><stop offset="100%" stopColor="#059669" stopOpacity="0"/></linearGradient></defs>
                    <path d={chartsData.submission.fillString} fill="url(#cgSub)"/>
                    <path d={chartsData.submission.pathString} fill="none" stroke="#059669" strokeWidth="2.5"/>
                    {chartsData.submission.points.map(([x,y],i) => (
                      <circle key={i} cx={x} cy={y} r="6" fill="#059669" style={{cursor: 'pointer'}}><title>{chartsData.submission.counts[i]} Squads Registered</title></circle>
                    ))}
                  </svg>
                  <div style={{ position:'absolute', bottom:0, left:30, right:0, display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:500, color:S.t3 }}>
                    {chartsData.labels.map((d, i) => <span key={i}>{d}</span>)}
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(110px, 1fr))', gap:10, marginTop:16 }}>
                  {[
                    { dot:'#059669', label:'Registered', val: exactCounts.teams },
                    { dot:'#2563EB', label:'Direct Finale', val: exactCounts.teams },
                    { dot:'#d97706', label:'Fee / Squad', val: '₹1,200' },
                    { dot:'#7c3aed', label:'Squad Size', val: '3–4' },
                  ].map((s,i) => (
                    <div key={i} style={{ background:'#FAFAFA', border:'1px solid #F1F5F9', borderRadius:10, padding:'10px 12px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:s.dot }}/>
                        <span style={{ fontSize:11, fontWeight:600, color:S.t2, whiteSpace:'nowrap' }}>{s.label}</span>
                      </div>
                      <div style={{ fontSize:18, fontWeight:800, color:S.t1 }}>{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BOTTOM ROW */}
            <div className="admin-bottom-grid" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:S.gap }}>
              {/* Recent Squads */}
              <div style={{ background:S.card, border:'1px solid '+S.border, borderRadius:S.radius, boxShadow:'0 1px 3px rgba(0,0,0,.04)', overflow:'hidden' }}>
                <div style={{ padding:'18px 22px', borderBottom:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <h3 style={{ fontSize:15, fontWeight:700, margin:0 }}>Recent Squad Registrations</h3>
                </div>
                <div style={{ width:'100%', overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
                  <table style={{ width:'100%', minWidth:540, borderCollapse:'collapse', fontSize:12 }}>
                    <thead>
                      <tr style={{ background:'#FAFAFA', borderBottom:'1px solid #F1F5F9' }}>
                        {['Squad Name','Domain','Crew Size','Registered On','Status'].map(h => (
                          <th key={h} style={{ padding:'12px 18px', fontWeight:600, color:S.t2, textAlign: 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {teams.slice(0,6).map(team => {
                        const sub = submissions.find(s => s.team_id === team.id);
                        const teamMems = members.filter(m => m.team_id === team.id);
                        return (
                          <tr key={team.id} style={{ borderBottom:'1px solid #F8FAFC' }}>
                            <td style={{ padding:'14px 18px' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <div style={{ width:28, height:28, borderRadius:6, background:'#D1FAE5', color:'#059669', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:11 }}>{team.team_name.charAt(0)}</div>
                                <span style={{ fontWeight:700, color:S.t1 }}>{team.team_name}</span>
                              </div>
                            </td>
                            <td style={{ padding:'14px 18px', color:S.t2 }}>{resolveDomain(team, sub, null, 'General Innovation')}</td>
                            <td style={{ padding:'14px 18px', color:S.t2, fontWeight:700 }}>{teamMems.length ? `${teamMems.length} Members` : '1 Member'}</td>
                            <td style={{ padding:'14px 18px', color:S.t3 }}>{team.created_at ? new Date(team.created_at).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) : '-'}</td>
                            <td style={{ padding:'14px 18px' }}>
                              <span style={{ padding:'4px 10px', borderRadius:6, fontSize:10, fontWeight:700, display:'inline-block', color:'#059669', background:'#D1FAE5' }}>
                                Finale Ready
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding:'14px 22px', borderTop:'1px solid #F1F5F9', textAlign:'center' }}>
                  <button onClick={() => navigate(`${basePath}/teams`)} style={{ background:'none', border:'none', fontSize:12, fontWeight:700, color:S.primary, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:4 }}>
                    View all squads &amp; teams <ChevronRight size={14}/>
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 style={{ fontSize:15, fontWeight:700, margin:'0 0 16px' }}>Quick Actions</h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {[
                    { Icon: Flag, label:'Squads', color:'#059669', bg:'#D1FAE5', onClick: () => navigate(`${basePath}/teams`) },
                    { Icon: Users, label:'Participants', color:'#2563EB', bg:'#DBEAFE', onClick: () => navigate(`${basePath}/users`) },
                    { Icon: FileText, label:'Payments', color:'#D97706', bg:'#FEF3C7', onClick: () => navigate(`${basePath}/submissions`) },
                    { Icon: Megaphone, label:'Announcements', color:'#6C4EFF', bg:'#EEE8FF', onClick: () => navigate(`${basePath}/announcements`) }
                  ].map((a, i) => (
                    <button key={i} onClick={a.onClick} style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, padding:'18px 12px', borderRadius:12, border:'1px solid #F1F5F9', background:S.card, cursor:'pointer', boxShadow:'0 1px 2px rgba(0,0,0,.04)', transition:'box-shadow .15s' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,.08)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 2px rgba(0,0,0,.04)'}>
                      <div style={{ padding:8, borderRadius:10, background:a.bg, color:a.color }}><a.Icon size={20}/></div>
                      <span style={{ fontSize:11, fontWeight:700, color:a.color }}>{a.label}</span>
                    </button>
                  ))}
                </div>

                {/* Host Email Automation Card */}
                <div style={{ marginTop: 20, background: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: 14, padding: '18px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ padding: 6, borderRadius: 8, background: '#FFEDD5', color: '#EA580C' }}>
                        <Mail size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: '#0F172A' }}>Host Email Automation</div>
                        <div style={{ fontSize: 11, color: '#EA580C', fontWeight: 700 }}>{HAXLR8_HOST_EMAIL}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, background: '#DCFCE7', color: '#15803D', padding: '3px 8px', borderRadius: 6, border: '1px solid #86EFAC' }}>
                      Active
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5, marginBottom: 12 }}>
                    Automated flight manifests &amp; notifications are dispatched directly to every registering commander and crewmate upon signup.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #FED7AA', paddingTop: 10, fontSize: 11 }}>
                    <span style={{ color: '#64748B', fontWeight: 600 }}>Total Logs Recorded:</span>
                    <span style={{ fontWeight: 800, color: '#0F172A' }}>{emailLogs.length} transmissions</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .admin-charts-grid {
              grid-template-columns: 1fr !important;
              min-height: auto !important;
            }
            .admin-bottom-grid {
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 520px) {
            .admin-stat-cards-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

        {/* Public Telemetry Calibration Modal (Secret & Discreet) */}
        <CrewSquadronsModal
          isOpen={showTelemetryModal}
          onClose={() => setShowTelemetryModal(false)}
          currentDbCount={exactCounts.teams}
          onConfigChange={fetchData}
        />
    </>
  );
}
