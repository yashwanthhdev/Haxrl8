import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, FileText, Download, ExternalLink, Users, Search, 
  Filter, CheckCircle2, AlertTriangle, Lock, RefreshCw, Upload,
  Save, Eye, ArrowUpRight, Phone, Mail, Building, Clock, ChevronDown, ChevronUp, Trash2
} from 'lucide-react';
import AmongUsCrewmate from '../../components/amongus/AmongUsCrewmate';
import { isOrganizerAuthorized } from './adminAuth';
import { 
  PROBLEM_STATEMENTS, 
  DOMAIN_METADATA, 
  MAX_TEAMS_PER_PROBLEM 
} from '../../data/problemStatementsCatalog';
import { 
  fetchAllProblemSelections, 
  getSelectionCounts, 
  getDomainPdfUrl, 
  saveDomainPdfUrl,
  fetchDomainPdfUrls,
  subscribeToDomainPdfs,
  deleteProblemStatementSelection
} from '../../lib/problemStatementsService';
import { uploadDocumentFile } from '../../lib/documentsService';
import { supabase } from '../../lib/supabaseClient';
import { sendProblemStatementsLiveEmail } from '../../lib/emailService';

const S = {
  card: '#FFFFFF',
  border: '#FED7AA',
  primary: '#0284C7',
  t1: '#0F172A',
  t2: '#64748B',
  t3: '#94A3B8',
  bg: '#FFFAED',
  gap: 16
};

export default function AdminProblemStatements() {
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState([]);
  const [counts, setCounts] = useState({});
  const [teamsByProblem, setTeamsByProblem] = useState({});
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProblemId, setExpandedProblemId] = useState(null);

  // Active view: 'catalog' (all challenges) | 'locked' (locked squads directory)
  const [activeView, setActiveView] = useState('catalog');
  const [lockedDomainFilter, setLockedDomainFilter] = useState('All');
  const [lockedSearchQuery, setLockedSearchQuery] = useState('');

  // Squad Deletion / Release state
  const [deletingSquad, setDeletingSquad] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState(null);

  // PDF Management state
  const [pdfUrls, setPdfUrls] = useState({
    'Smart City': getDomainPdfUrl('Smart City'),
    'Agriculture': getDomainPdfUrl('Agriculture'),
    'Healthcare': getDomainPdfUrl('Healthcare')
  });
  const [uploadingDomain, setUploadingDomain] = useState(null);
  const [pdfSaveNotice, setPdfSaveNotice] = useState('');

  // Problem Statements Live Broadcast state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState({ total: 0, sent: 0, failed: 0 });
  const [broadcastDone, setBroadcastDone] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResultMsg, setTestResultMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const all = await fetchAllProblemSelections();
      setSelections(all);
      const { counts: c, teamsByProblem: t } = getSelectionCounts(all);
      setCounts(c);
      setTeamsByProblem(t);

      // Also sync latest domain PDF urls from Supabase cloud
      const cloudPdfs = await fetchDomainPdfUrls();
      if (cloudPdfs) {
        setPdfUrls(cloudPdfs);
      }
    } catch (e) {
      console.warn('Error loading problem statements admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleSync = () => loadData();
    window.addEventListener('haxlr8_ps_locked', handleSync);
    window.addEventListener('haxlr8_ps_deleted', handleSync);
    window.addEventListener('haxlr8_ps_pdfs_updated', (e) => {
      if (e.detail) setPdfUrls(e.detail);
    });

    const unsubscribePdfs = subscribeToDomainPdfs((urls) => {
      if (urls) setPdfUrls(urls);
    });

    return () => {
      window.removeEventListener('haxlr8_ps_locked', handleSync);
      window.removeEventListener('haxlr8_ps_deleted', handleSync);
      window.removeEventListener('haxlr8_ps_pdfs_updated', handleSync);
      if (typeof unsubscribePdfs === 'function') unsubscribePdfs();
    };
  }, []);

  // Admin delete/release squad lock
  const handleConfirmDelete = async () => {
    if (!deletingSquad) return;
    setIsDeleting(true);
    try {
      await deleteProblemStatementSelection({
        teamId: deletingSquad.team_id,
        leaderEmail: deletingSquad.leader_email
      });
      setDeleteFeedback({
        type: 'success',
        message: `Successfully released locked problem statement [${deletingSquad.problem_statement_id || 'Challenge'}] for squad "${deletingSquad.team_name}". The slot has been reopened!`
      });
      setDeletingSquad(null);
      await loadData();
    } catch (err) {
      setDeleteFeedback({
        type: 'error',
        message: `Failed to delete selection: ${err.message || 'Unknown error'}`
      });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setDeleteFeedback(null), 6000);
    }
  };

  // Handle PDF URL change
  const handlePdfUrlChange = (domain, url) => {
    setPdfUrls(prev => ({ ...prev, [domain]: url }));
  };

  // Save PDF URL to cloud & local storage
  const handleSavePdf = async (domain) => {
    const url = pdfUrls[domain];
    await saveDomainPdfUrl(domain, url);
    setPdfSaveNotice(`PDF link for ${domain} successfully saved and published!`);
    setTimeout(() => setPdfSaveNotice(''), 4000);
  };

  // Upload PDF file to Cloudinary and broadcast to all participants
  const handleFileUpload = async (domain, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDomain(domain);
    try {
      const res = await uploadDocumentFile(file, 'problem_statements');
      if (res?.url) {
        setPdfUrls(prev => ({ ...prev, [domain]: res.url }));
        await saveDomainPdfUrl(domain, res.url);
        setPdfSaveNotice(`Uploaded and published new PDF for ${domain}!`);
        setTimeout(() => setPdfSaveNotice(''), 4000);
      }
    } catch (err) {
      alert('Upload failed: ' + (err.message || 'Please check file type'));
    } finally {
      setUploadingDomain(null);
    }
  };

  // Filter Problem Statements
  const filteredProblems = PROBLEM_STATEMENTS.filter(p => {
    // Domain filter
    if (selectedDomainFilter !== 'All' && p.domain !== selectedDomainFilter) {
      return false;
    }

    // Status filter
    const count = counts[p.id] || 0;
    if (statusFilter === 'Claimed' && count === 0) return false;
    if (statusFilter === 'Full' && count < MAX_TEAMS_PER_PROBLEM) return false;
    if (statusFilter === 'Available' && count >= MAX_TEAMS_PER_PROBLEM) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = p.id.toLowerCase().includes(q);
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchTags = (p.tags || []).some(t => t.toLowerCase().includes(q));
      
      // Match claimed teams
      const claimedTeams = teamsByProblem[p.id] || [];
      const matchTeam = claimedTeams.some(t => 
        (t.team_name && t.team_name.toLowerCase().includes(q)) ||
        (t.leader_name && t.leader_name.toLowerCase().includes(q)) ||
        (t.leader_email && t.leader_email.toLowerCase().includes(q))
      );

      if (!matchId && !matchTitle && !matchTags && !matchTeam) return false;
    }

    return true;
  });

  // Calculate Metrics
  const totalLockedTeams = selections.length;
  const fullProblemsCount = Object.values(counts).filter(c => c >= MAX_TEAMS_PER_PROBLEM).length;
  const partialProblemsCount = Object.values(counts).filter(c => c > 0 && c < MAX_TEAMS_PER_PROBLEM).length;

  // Filtered Locked Squads for the interactive Locked Squads Directory
  const filteredLockedSquads = selections.filter(squad => {
    if (lockedDomainFilter !== 'All') {
      const d = (squad.domain || '').toLowerCase();
      const target = lockedDomainFilter.toLowerCase();
      if (!d.includes(target) && !target.includes(d)) return false;
    }

    if (lockedSearchQuery.trim()) {
      const q = lockedSearchQuery.toLowerCase().trim();
      const matchTeam = (squad.team_name || '').toLowerCase().includes(q);
      const matchLeader = (squad.leader_name || squad.locked_by || '').toLowerCase().includes(q);
      const matchEmail = (squad.leader_email || '').toLowerCase().includes(q);
      const matchPhone = (squad.leader_phone || '').toLowerCase().includes(q);
      const matchCollege = (squad.college || '').toLowerCase().includes(q);
      const matchProbId = (squad.problem_statement_id || '').toLowerCase().includes(q);
      const matchProbTitle = (squad.problem_statement_title || squad.problem_title || '').toLowerCase().includes(q);
      const matchDomain = (squad.domain || '').toLowerCase().includes(q);

      if (!matchTeam && !matchLeader && !matchEmail && !matchPhone && !matchCollege && !matchProbId && !matchProbTitle && !matchDomain) {
        return false;
      }
    }

    return true;
  });

  // Export specifically the locked squads roster to CSV
  const exportLockedSquadsCSV = () => {
    const headers = [
      '#',
      'Squad Name',
      'Innovation Domain',
      'Problem Statement ID',
      'Challenge #',
      'Problem Statement Title',
      'Flight Captain (Leader)',
      'Leader Email',
      'Leader Phone',
      'College Name',
      'Locked Timestamp'
    ];

    const rows = filteredLockedSquads.map((s, idx) => [
      idx + 1,
      `"${(s.team_name || '').replace(/"/g, '""')}"`,
      `"${(s.domain || '').replace(/"/g, '""')}"`,
      `"${(s.problem_statement_id || '').replace(/"/g, '""')}"`,
      s.problem_statement_num || '',
      `"${(s.problem_statement_title || s.problem_title || '').replace(/"/g, '""')}"`,
      `"${(s.leader_name || s.locked_by || '').replace(/"/g, '""')}"`,
      `"${(s.leader_email || '').replace(/"/g, '""')}"`,
      `"${(s.leader_phone || '').replace(/"/g, '""')}"`,
      `"${(s.college || '').replace(/"/g, '""')}"`,
      `"${s.locked_at || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HAXLR8_Locked_Squads_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Master CSV Export
  const exportClaimsCSV = () => {
    const headers = [
      'Problem ID',
      'Domain',
      'Challenge #',
      'Problem Statement Title',
      'Claimed Squads Count (Max 3)',
      'Remaining Slots',
      'Squad 1 Name',
      'Squad 1 Captain',
      'Squad 1 Email',
      'Squad 1 Phone',
      'Squad 1 College',
      'Squad 1 Locked At',
      'Squad 2 Name',
      'Squad 2 Captain',
      'Squad 2 Email',
      'Squad 2 Phone',
      'Squad 2 College',
      'Squad 2 Locked At',
      'Squad 3 Name',
      'Squad 3 Captain',
      'Squad 3 Email',
      'Squad 3 Phone',
      'Squad 3 College',
      'Squad 3 Locked At'
    ];

    const rows = PROBLEM_STATEMENTS.map(p => {
      const claimed = teamsByProblem[p.id] || [];
      const count = claimed.length;
      const remaining = Math.max(0, MAX_TEAMS_PER_PROBLEM - count);

      const row = [
        `"${p.id}"`,
        `"${p.domain}"`,
        p.num,
        `"${(p.title || '').replace(/"/g, '""')}"`,
        count,
        remaining
      ];

      for (let i = 0; i < 3; i++) {
        const team = claimed[i];
        if (team) {
          row.push(`"${(team.team_name || '').replace(/"/g, '""')}"`);
          row.push(`"${(team.leader_name || '').replace(/"/g, '""')}"`);
          row.push(`"${(team.leader_email || '').replace(/"/g, '""')}"`);
          row.push(`"${(team.leader_phone || '').replace(/"/g, '""')}"`);
          row.push(`"${(team.college || '').replace(/"/g, '""')}"`);
          row.push(`"${team.locked_at || ''}"`);
        } else {
          row.push('""', '""', '""', '""', '""', '""');
        }
      }

      return row.join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HAXLR8_Problem_Statements_Matrix_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendTestLiveEmail = async () => {
    const target = testEmailInput.trim();
    if (!target || !target.includes('@')) {
      setTestResultMsg('Please enter a valid test email address.');
      return;
    }
    setTestSending(true);
    setTestResultMsg('');
    try {
      const res = await sendProblemStatementsLiveEmail({
        recipientEmail: target,
        recipientName: 'Innovator (Test Preview)',
        teamName: 'Demo Squad',
        domain: 'Smart City'
      });
      if (res.success) {
        setTestResultMsg(`✓ Test broadcast preview successfully delivered to ${target}!`);
      } else {
        setTestResultMsg(`Failed: ${res.error || 'Server error'}`);
      }
    } catch (e) {
      setTestResultMsg(`Error: ${e.message}`);
    } finally {
      setTestSending(false);
    }
  };

  const handleBroadcastLiveEmails = async () => {
    setBroadcasting(true);
    setBroadcastDone(false);
    try {
      const { data: members, error: mErr } = await supabase.from('team_members').select('*');
      if (mErr) throw mErr;

      const { data: teams } = await supabase.from('teams').select('*');
      const teamMap = new Map();
      (teams || []).forEach(t => teamMap.set(t.id, t));

      const recipientsMap = new Map();
      (members || []).forEach(m => {
        const email = (m.email || '').trim().toLowerCase();
        if (email && email.includes('@')) {
          const t = teamMap.get(m.team_id);
          recipientsMap.set(email, {
            email,
            name: (m.full_name || 'Haxlr8 Innovator').trim(),
            teamName: t?.team_name || 'Squad',
            domain: t?.domain || 'Smart City'
          });
        }
      });

      const recipients = Array.from(recipientsMap.values());
      setBroadcastProgress({ total: recipients.length, sent: 0, failed: 0 });

      let sentCount = 0;
      let failedCount = 0;

      for (let i = 0; i < recipients.length; i++) {
        const r = recipients[i];
        try {
          const res = await sendProblemStatementsLiveEmail({
            recipientEmail: r.email,
            recipientName: r.name,
            teamName: r.teamName,
            domain: r.domain
          });
          if (res.success) sentCount++;
          else failedCount++;
        } catch (e) {
          failedCount++;
        }
        setBroadcastProgress({ total: recipients.length, sent: sentCount, failed: failedCount });
        await new Promise(res => setTimeout(res, 220));
      }

      setBroadcastDone(true);
    } catch (err) {
      console.error('Broadcast failed:', err);
      alert('Broadcast encountered an error: ' + err.message);
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* ─── HEADER ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E0F2FE', border: '1.5px solid #BAE6FD', padding: '4px 12px', borderRadius: 20, marginBottom: 8 }}>
            <Target size={14} color="#0284C7" />
            <span style={{ fontSize: 11, fontWeight: 900, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              HAXLR8 3.0 Mission Control
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: S.t1, margin: 0 }}>
            Problem Statements Hub
          </h1>
          <p style={{ fontSize: 13.5, color: S.t2, margin: '4px 0 0', fontWeight: 500 }}>
            45 Official Challenges · 3 Domains (15 each) · Quota of 3 Squads Max per Problem Statement
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={loadData}
            disabled={loading}
            style={{
              padding: '10px 18px',
              borderRadius: 12,
              background: '#FFFFFF',
              border: '1.5px solid ' + S.border,
              fontSize: 13,
              fontWeight: 800,
              color: S.t1,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Sync Live Claims</span>
          </button>

          <button
            onClick={exportClaimsCSV}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              background: '#0284C7',
              border: 'none',
              fontSize: 13,
              fontWeight: 800,
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.28)'
            }}
          >
            <Download size={15} />
            <span>Export Claims Matrix (CSV)</span>
          </button>

          <button
            onClick={() => setShowBroadcastModal(true)}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #FF3B69 0%, #EA580C 100%)',
              border: 'none',
              fontSize: 13,
              fontWeight: 900,
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(255, 59, 105, 0.35)'
            }}
          >
            <Mail size={15} />
            <span>Broadcast "PS Live" Email</span>
          </button>
        </div>
      </div>

      {/* ─── ACTION FEEDBACK BANNER ─── */}
      {deleteFeedback && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '14px 20px',
            borderRadius: 14,
            background: deleteFeedback.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            border: `1.5px solid ${deleteFeedback.type === 'success' ? '#86EFAC' : '#FCA5A5'}`,
            color: deleteFeedback.type === 'success' ? '#15803D' : '#DC2626',
            fontSize: 13.5,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {deleteFeedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{deleteFeedback.message}</span>
          </div>
          <button
            onClick={() => setDeleteFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 900, fontSize: 18 }}
          >
            ×
          </button>
        </motion.div>
      )}

      {/* ─── QUICK METRICS ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: S.gap }}>
        <div
          onClick={() => setActiveView('catalog')}
          style={{
            background: activeView === 'catalog' ? '#F0F9FF' : '#FFFFFF',
            borderRadius: 18,
            border: activeView === 'catalog' ? '2px solid #0284C7' : '2px solid #FED7AA',
            padding: '18px 20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          title="Click to view full 45 challenges catalog"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: S.t2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Challenges</div>
            <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 10, background: '#E0F2FE', color: '#0369A1' }}>All</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: S.t1, marginTop: 4 }}>45</div>
          <div style={{ fontSize: 12, color: '#0284C7', fontWeight: 700, marginTop: 4 }}>15 per Domain</div>
        </div>

        {/* CLICKABLE SQUADS LOCKED IN CARD */}
        <div
          onClick={() => setActiveView(activeView === 'locked' ? 'catalog' : 'locked')}
          style={{
            background: activeView === 'locked' ? '#F0FDF4' : '#FFFFFF',
            borderRadius: 18,
            border: activeView === 'locked' ? '2.5px solid #16A34A' : '2px solid #FED7AA',
            padding: '18px 20px',
            boxShadow: activeView === 'locked' ? '0 8px 24px rgba(22, 163, 74, 0.2)' : '0 4px 12px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s',
            position: 'relative'
          }}
          title="Click to view full filtered directory of locked squads, leaders, colleges, and problem statements"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: activeView === 'locked' ? '#15803D' : S.t2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Squads Locked In
            </div>
            <span style={{
              fontSize: 10.5,
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 12,
              background: activeView === 'locked' ? '#16A34A' : '#DCFCE7',
              color: activeView === 'locked' ? '#FFFFFF' : '#15803D'
            }}>
              {activeView === 'locked' ? 'Active Filter ✓' : 'Click to Filter'}
            </span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#16A34A', marginTop: 4 }}>
            {totalLockedTeams}
          </div>
          <div style={{ fontSize: 12, color: activeView === 'locked' ? '#15803D' : S.t2, fontWeight: 700, marginTop: 4 }}>
            {activeView === 'locked' ? '✓ Showing Locked Squads Table' : 'Across all 3 domains · Click to View'}
          </div>
        </div>

        <div
          onClick={() => { setActiveView('catalog'); setStatusFilter('Full'); }}
          style={{
            background: '#FFFFFF',
            borderRadius: 18,
            border: '2px solid #FED7AA',
            padding: '18px 20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          title="Filter to capacity reached challenges"
        >
          <div style={{ fontSize: 11.5, fontWeight: 800, color: S.t2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Full Challenges (3/3)</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#DC2626', marginTop: 4 }}>{fullProblemsCount}</div>
          <div style={{ fontSize: 12, color: S.t2, fontWeight: 600, marginTop: 4 }}>Quota capacity reached</div>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: 18, border: '2px solid #FED7AA', padding: '18px 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: S.t2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Quota Slots</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#0284C7', marginTop: 4 }}>135</div>
          <div style={{ fontSize: 12, color: S.t2, fontWeight: 600, marginTop: 4 }}>45 challenges × 3 squads max</div>
        </div>
      </div>

      {/* ─── LOCKED SQUADS DIRECTORY (ACTIVATED BY CLICKING 'SQUADS LOCKED IN') ─── */}
      {activeView === 'locked' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#FFFFFF',
            borderRadius: 22,
            border: '2.5px solid #86EFAC',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(22, 163, 74, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: '#16A34A',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)'
              }}>
                <Lock size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Live Claim Registry
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 10 }}>
                    {filteredLockedSquads.length} of {totalLockedTeams} Squads Filtered
                  </span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: '2px 0 0' }}>
                  Locked In Squads &amp; Problem Statements
                </h2>
                <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0' }}>
                  Showing team names, leaders, college, problem statements locked, and domain tracks.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={exportLockedSquadsCSV}
                style={{
                  padding: '9px 16px',
                  borderRadius: 12,
                  background: '#F0FDF4',
                  border: '1.5px solid #86EFAC',
                  color: '#15803D',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Download size={14} />
                <span>Export Locked Squads (CSV)</span>
              </button>

              <button
                onClick={() => setActiveView('catalog')}
                style={{
                  padding: '9px 16px',
                  borderRadius: 12,
                  background: '#F1F5F9',
                  border: '1.5px solid #CBD5E1',
                  color: '#475569',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                ← Return to All 45 Challenges
              </button>
            </div>
          </div>

          {/* Filter Bar for Locked Squads */}
          <div style={{
            background: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            borderRadius: 16,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}>
            {/* Domain Filter Buttons */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'All', label: `All Domains (${selections.length})` },
                { id: 'Smart City', label: `🏙️ Smart City (${selections.filter(s => (s.domain || '').toLowerCase().includes('smart')).length})` },
                { id: 'Agriculture', label: `🌾 Agriculture (${selections.filter(s => (s.domain || '').toLowerCase().includes('agri')).length})` },
                { id: 'Healthcare', label: `🩺 Healthcare (${selections.filter(s => (s.domain || '').toLowerCase().includes('health')).length})` }
              ].map(d => {
                const isActive = lockedDomainFilter === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setLockedDomainFilter(d.id)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: isActive ? 900 : 700,
                      background: isActive ? '#16A34A' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : '#334155',
                      border: isActive ? 'none' : '1px solid #CBD5E1',
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 2px 8px rgba(22, 163, 74, 0.25)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: 260, flex: 1, maxWidth: 420 }}>
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 11 }} />
              <input
                type="text"
                placeholder="Search team, leader, college, problem ID..."
                value={lockedSearchQuery}
                onChange={e => setLockedSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: 10,
                  border: '1.5px solid #CBD5E1',
                  background: '#FFFFFF',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#0F172A',
                  boxSizing: 'border-box'
                }}
              />
              {lockedSearchQuery && (
                <button
                  onClick={() => setLockedSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: 8,
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    fontWeight: 800
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Table / List View */}
          {filteredLockedSquads.length === 0 ? (
            <div style={{
              padding: '36px',
              textAlign: 'center',
              background: '#F8FAFC',
              borderRadius: 16,
              border: '1.5px dashed #CBD5E1'
            }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                No locked squads match your search criteria
              </div>
              <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 12px' }}>
                Try clearing your search query or selecting "All Domains".
              </p>
              <button
                onClick={() => { setLockedDomainFilter('All'); setLockedSearchQuery(''); }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  background: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Clear Search &amp; Filters
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: 14, border: '1.5px solid #E2E8F0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 920 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>#</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>Squad Name</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>Domain</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>Problem Statement Locked</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>Flight Captain (Leader)</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>College</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>Locked At</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 900, color: '#64748B', textTransform: 'uppercase', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLockedSquads.map((squad, idx) => {
                    const domainNorm = (squad.domain || '').toLowerCase();
                    const domainBadge = domainNorm.includes('smart')
                      ? { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD', icon: '🏙️', label: 'Smart City' }
                      : domainNorm.includes('agri')
                      ? { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', icon: '🌾', label: 'Agriculture' }
                      : { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3', icon: '🩺', label: 'Healthcare' };

                    return (
                      <tr
                        key={squad.team_id || idx}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                          transition: 'background 0.15s'
                        }}
                      >
                        {/* Index */}
                        <td style={{ padding: '14px', fontSize: 12, fontWeight: 800, color: '#94A3B8' }}>
                          {idx + 1}
                        </td>

                        {/* Squad Name */}
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontSize: 14.5, fontWeight: 900, color: '#0F172A' }}>
                            {squad.team_name}
                          </div>
                          {squad.team_id && (
                            <div style={{ fontSize: 10.5, color: '#94A3B8', fontFamily: 'monospace' }}>
                              ID: {squad.team_id.slice(0, 8)}...
                            </div>
                          )}
                        </td>

                        {/* Domain */}
                        <td style={{ padding: '14px' }}>
                          <span style={{
                            fontSize: 11.5,
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: 12,
                            background: domainBadge.bg,
                            color: domainBadge.text,
                            border: `1px solid ${domainBadge.border}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <span>{domainBadge.icon}</span>
                            <span>{domainBadge.label}</span>
                          </span>
                        </td>

                        {/* Problem Statement Locked */}
                        <td style={{ padding: '14px', maxWidth: 300 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span style={{
                              fontSize: 11,
                              fontWeight: 900,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: '#0284C7',
                              color: '#FFFFFF'
                            }}>
                              {squad.problem_statement_id || 'PS'}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>
                              Challenge #{squad.problem_statement_num || '—'}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#1E293B', lineHeight: 1.4 }}>
                            {squad.problem_statement_title || squad.problem_title || 'Selected Challenge'}
                          </div>
                        </td>

                        {/* Flight Captain */}
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontSize: 13.5, fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{squad.leader_name || squad.locked_by || 'Captain'}</span>
                            <span style={{ fontSize: 10, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '1px 6px', borderRadius: 8 }}>
                              Lead
                            </span>
                          </div>
                          {squad.leader_email && (
                            <div style={{ fontSize: 11.5, color: '#0284C7', marginTop: 3 }}>
                              <a href={`mailto:${squad.leader_email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                {squad.leader_email}
                              </a>
                            </div>
                          )}
                          {squad.leader_phone && (
                            <div style={{ fontSize: 11.5, color: '#475569', marginTop: 1 }}>
                              <a href={`tel:${squad.leader_phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                📞 {squad.leader_phone}
                              </a>
                            </div>
                          )}
                        </td>

                        {/* College */}
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Building size={14} color="#64748B" style={{ flexShrink: 0 }} />
                            <span>{squad.college || 'MIT Mysore'}</span>
                          </div>
                        </td>

                        {/* Locked Timestamp */}
                        <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={13} color="#64748B" />
                            <span>{squad.locked_at ? new Date(squad.locked_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Verified'}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setDeletingSquad({
                              team_id: squad.team_id,
                              team_name: squad.team_name,
                              leader_name: squad.leader_name || squad.locked_by,
                              leader_email: squad.leader_email,
                              problem_statement_id: squad.problem_statement_id,
                              problem_title: squad.problem_statement_title || squad.problem_title,
                              college: squad.college
                            })}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              background: '#FEF2F2',
                              border: '1px solid #FECACA',
                              color: '#DC2626',
                              fontSize: 11.5,
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5
                            }}
                            title="Release & Delete Locked Selection"
                          >
                            <Trash2 size={12} />
                            <span>Delete Lock</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* ─── OFFICIAL PDF UPLOAD & LINK MANAGEMENT ─── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 22,
        border: '2px solid #FED7AA',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: '#FFF7ED',
              border: '1.5px solid #FED7AA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EA580C',
              flexShrink: 0
            }}>
              <FileText size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: S.t1, margin: 0 }}>
                Domain Problem Statement PDFs &amp; Uploads
              </h2>
              <p style={{ fontSize: 12.5, color: S.t2, margin: '2px 0 0' }}>
                Upload new PDF files or customize the public URL distributed to squads in each track.
              </p>
            </div>
          </div>

          {pdfSaveNotice && (
            <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 10, padding: '6px 14px', fontSize: 12.5, fontWeight: 800, color: '#15803D' }}>
              ✓ {pdfSaveNotice}
            </div>
          )}
        </div>

        {/* 3 Domain PDF Config Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 14 }}>
          {['Smart City', 'Agriculture', 'Healthcare'].map(domain => {
            const meta = DOMAIN_METADATA[domain];
            const currentUrl = pdfUrls[domain];
            const isUploading = uploadingDomain === domain;

            return (
              <div
                key={domain}
                style={{
                  background: meta.bg,
                  border: `1.5px solid ${meta.border}`,
                  borderRadius: 18,
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{meta.icon}</span>
                    <span style={{ fontSize: 15, fontWeight: 900, color: S.t1 }}>{domain} Track</span>
                  </div>
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: meta.textCol,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>Preview Current</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* URL Input */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: S.t2, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                    PDF URL or Path
                  </label>
                  <input
                    type="text"
                    value={currentUrl}
                    onChange={(e) => handlePdfUrlChange(domain, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      border: '1.5px solid #CBD5E1',
                      background: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 600,
                      color: S.t1,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Upload File & Save Button */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    fontSize: 12,
                    fontWeight: 800,
                    color: S.t2,
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    textAlign: 'center',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}>
                    <Upload size={13} />
                    <span>{isUploading ? 'Uploading...' : 'Upload PDF'}</span>
                    <input
                      type="file"
                      accept=".pdf"
                      disabled={isUploading}
                      onChange={(e) => handleFileUpload(domain, e)}
                      style={{ display: 'none' }}
                    />
                  </label>

                  <button
                    onClick={() => handleSavePdf(domain)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 10,
                      background: meta.color,
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 800,
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: `0 2px 8px ${meta.color}35`
                    }}
                  >
                    <Save size={13} />
                    <span>Save Link</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── FILTERS & SEARCH BAR ─── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 20,
        border: '2px solid #FED7AA',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14
      }}>
        {/* Domain Tabs & Locked Squads Toggle */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveView(activeView === 'locked' ? 'catalog' : 'locked')}
            style={{
              padding: '8px 16px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 900,
              background: activeView === 'locked' ? '#16A34A' : '#F0FDF4',
              color: activeView === 'locked' ? '#FFFFFF' : '#15803D',
              border: activeView === 'locked' ? 'none' : '1.5px solid #86EFAC',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: activeView === 'locked' ? '0 3px 10px rgba(22, 163, 74, 0.3)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <Lock size={14} />
            <span>Locked Squads ({totalLockedTeams})</span>
          </button>

          {['All', 'Smart City', 'Agriculture', 'Healthcare'].map(tab => {
            const isTabActive = activeView === 'catalog' && selectedDomainFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveView('catalog');
                  setSelectedDomainFilter(tab);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: isTabActive ? 900 : 700,
                  background: isTabActive ? '#0284C7' : '#F8FAFC',
                  color: isTabActive ? '#FFFFFF' : '#475569',
                  border: isTabActive ? 'none' : '1.5px solid #CBD5E1',
                  cursor: 'pointer',
                  boxShadow: isTabActive ? '0 3px 10px rgba(2, 132, 199, 0.25)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                {tab === 'All' ? 'All 45 Challenges' : `${tab} (15)`}
              </button>
            );
          })}
        </div>

        {/* Status Filter & Search */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end', minWidth: 280 }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: 12,
              border: '1.5px solid #CBD5E1',
              background: '#FFFFFF',
              fontSize: 12.5,
              fontWeight: 700,
              color: S.t1,
              cursor: 'pointer'
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Claimed">Claimed (1-3 Squads)</option>
            <option value="Full">Capacity Reached (3/3)</option>
            <option value="Available">Available Slots (&lt; 3)</option>
          </select>

          <div style={{ position: 'relative', minWidth: 240 }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 11 }} />
            <input
              type="text"
              placeholder="Search code, title, squad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 34px',
                borderRadius: 12,
                border: '1.5px solid #CBD5E1',
                background: '#FFFFFF',
                fontSize: 12.5,
                fontWeight: 600,
                color: S.t1,
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      </div>

      {/* ─── PROBLEM STATEMENTS LIST (WITH COMPLETE DATA OF TEAMS) ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: S.t2 }}>
          Showing {filteredProblems.length} of {PROBLEM_STATEMENTS.length} Challenges
        </div>

        {filteredProblems.map((problem) => {
          const count = counts[problem.id] || 0;
          const claimedTeams = teamsByProblem[problem.id] || [];
          const isFull = count >= MAX_TEAMS_PER_PROBLEM;
          const isExpanded = expandedProblemId === problem.id;
          const meta = DOMAIN_METADATA[problem.domain];
          const slotsLeft = Math.max(0, MAX_TEAMS_PER_PROBLEM - count);

          return (
            <div
              key={problem.id}
              style={{
                background: '#FFFFFF',
                border: isFull ? '2px solid #FCA5A5' : count > 0 ? '2px solid #BAE6FD' : '2px solid #FED7AA',
                borderRadius: 20,
                padding: '20px 24px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                transition: 'all 0.15s ease'
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 900,
                    padding: '4px 12px',
                    borderRadius: 10,
                    background: meta?.color || '#0284C7',
                    color: '#FFFFFF',
                    letterSpacing: '0.04em'
                  }}>
                    {problem.id}
                  </span>

                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 8,
                    background: meta?.bg || '#F0F9FF',
                    color: meta?.textCol || '#0369A1',
                    border: `1px solid ${meta?.border || '#BAE6FD'}`
                  }}>
                    {problem.domain} · #{problem.num}
                  </span>

                  {/* Quota Badge */}
                  {isFull ? (
                    <span style={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 20,
                      background: '#FEE2E2',
                      color: '#B91C1C',
                      border: '1px solid #FCA5A5',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5
                    }}>
                      <Lock size={12} />
                      3 / 3 FULL · Capacity Reached
                    </span>
                  ) : count > 0 ? (
                    <span style={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 20,
                      background: '#FFF7ED',
                      color: '#C2410C',
                      border: '1px solid #FDBA74',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5
                    }}>
                      ● {count} / 3 Squads Claimed ({slotsLeft} Slot Left)
                    </span>
                  ) : (
                    <span style={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 20,
                      background: '#F0FDF4',
                      color: '#15803D',
                      border: '1px solid #BBF7D0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5
                    }}>
                      ○ Open (Available)
                    </span>
                  )}
                </div>

                {/* Expand / View Details Button */}
                <button
                  onClick={() => setExpandedProblemId(isExpanded ? null : problem.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 10,
                    background: isExpanded ? '#0284C7' : '#F8FAFC',
                    color: isExpanded ? '#FFFFFF' : '#334155',
                    border: isExpanded ? 'none' : '1.5px solid #CBD5E1',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s'
                  }}
                >
                  <Users size={14} />
                  <span>{claimedTeams.length} Squads Locked</span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {/* Problem Title & Scope */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <h3 style={{ fontSize: 16.5, fontWeight: 900, color: S.t1, margin: 0, lineHeight: 1.45 }}>
                  {problem.title}
                </h3>
                <p style={{ fontSize: 13, color: S.t2, lineHeight: 1.6, margin: 0 }}>
                  {problem.description}
                </p>
              </div>

              {/* ─── EXPANDED SQUADS COMPLETE DATA ─── */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{
                      borderTop: '1.5px solid #E2E8F0',
                      paddingTop: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                  >
                    <div style={{ fontSize: 12.5, fontWeight: 900, color: S.t1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Complete Squad Roster ({claimedTeams.length} / 3 Claimed):
                    </div>

                    {claimedTeams.length === 0 ? (
                      <div style={{
                        padding: '16px',
                        borderRadius: 12,
                        background: '#F8FAFC',
                        border: '1px dashed #CBD5E1',
                        fontSize: 13,
                        color: '#94A3B8',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}>
                        No squad has locked in this challenge yet. All 3 slots remain open.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                        {claimedTeams.map((team, tIdx) => (
                          <div
                            key={tIdx}
                            style={{
                              background: '#F8FAFC',
                              border: '1.5px solid #CBD5E1',
                              borderRadius: 14,
                              padding: '14px 16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 8
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 11, fontWeight: 900, color: '#0284C7', textTransform: 'uppercase' }}>
                                Slot #{tIdx + 1}
                              </span>
                              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                                {team.locked_at ? new Date(team.locked_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Verified'}
                              </span>
                            </div>

                            <div style={{ fontSize: 15, fontWeight: 900, color: S.t1 }}>
                              {team.team_name}
                            </div>

                            <div style={{ fontSize: 12.5, color: '#334155', display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Users size={13} color="#64748B" />
                                <span>Captain: <strong>{team.leader_name}</strong></span>
                              </div>

                              {team.leader_email && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <Mail size={13} color="#64748B" />
                                  <a href={`mailto:${team.leader_email}`} style={{ color: '#0284C7', textDecoration: 'none', fontWeight: 600 }}>
                                    {team.leader_email}
                                  </a>
                                </div>
                              )}

                              {team.leader_phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <Phone size={13} color="#64748B" />
                                  <a href={`tel:${team.leader_phone}`} style={{ color: '#334155', textDecoration: 'none', fontWeight: 600 }}>
                                    {team.leader_phone}
                                  </a>
                                </div>
                              )}

                              {team.college && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <Building size={13} color="#64748B" />
                                  <span>{team.college}</span>
                                </div>
                              )}
                            </div>

                            {/* DELETE / RELEASE LOCK BUTTON */}
                            <div style={{
                              marginTop: 6,
                              paddingTop: 10,
                              borderTop: '1px solid #E2E8F0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8
                            }}>
                              <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700 }}>
                                Squad Locked Slot
                              </span>
                              <button
                                type="button"
                                onClick={() => setDeletingSquad({
                                  ...team,
                                  problem_statement_id: problem.id,
                                  problem_title: problem.title
                                })}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  background: '#FEF2F2',
                                  border: '1.5px solid #FCA5A5',
                                  borderRadius: 8,
                                  padding: '5px 12px',
                                  fontSize: 11.5,
                                  fontWeight: 800,
                                  color: '#DC2626',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#FEF2F2'; }}
                                title="Delete squad's locked choice and release quota slot"
                              >
                                <Trash2 size={13} />
                                <span>Delete Squad Lock</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ─── DELETE / RELEASE SQUAD LOCK MODAL ─── */}
      <AnimatePresence>
        {deletingSquad && (
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
                background: '#FFFFFF',
                borderRadius: 22,
                maxWidth: 480,
                width: '100%',
                padding: '24px 26px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '2px solid #FCA5A5',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#991B1B', margin: 0 }}>
                    Delete Squad's Locked Statement?
                  </h3>
                  <p style={{ fontSize: 12.5, color: '#64748B', margin: '2px 0 0', fontWeight: 600 }}>
                    Organizer Management Override
                  </p>
                </div>
              </div>

              <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6, margin: 0 }}>
                Are you sure you want to release and delete the locked problem statement for squad <strong>"{deletingSquad.team_name}"</strong>?
              </p>

              <div style={{
                background: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                borderRadius: 14,
                padding: '14px 16px',
                fontSize: 13,
                color: '#1E293B',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div><strong>Challenge:</strong> [{deletingSquad.problem_statement_id}] {deletingSquad.problem_title}</div>
                <div><strong>Captain:</strong> {deletingSquad.leader_name} ({deletingSquad.leader_email || 'No email'})</div>
                {deletingSquad.college && <div><strong>College:</strong> {deletingSquad.college}</div>}
                <div style={{ color: '#0369A1', fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                  ℹ Effect: The claimed slot will immediately reopen for other squads, and this squad will be freed to choose another problem statement.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletingSquad(null)}
                  style={{
                    flex: 1,
                    padding: '11px 16px',
                    borderRadius: 12,
                    background: '#F1F5F9',
                    border: '1.5px solid #CBD5E1',
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#475569',
                    cursor: isDeleting ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  style={{
                    flex: 1.4,
                    padding: '11px 16px',
                    borderRadius: 12,
                    background: '#DC2626',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 900,
                    color: '#FFFFFF',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <Trash2 size={16} />
                  <span>{isDeleting ? 'Deleting Selection...' : 'Yes, Delete Selection'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ─── BROADCAST 'PROBLEM STATEMENTS LIVE' MODAL ─── */}
        {showBroadcastModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16
          }}>
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              style={{
                background: '#FFFFFF',
                borderRadius: 22,
                maxWidth: 540,
                width: '100%',
                padding: '28px 30px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                border: '2px solid #FED7AA'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #FF3B69 0%, #EA580C 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)'
                }}>
                  <Mail size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Broadcast "Problem Statements Live"
                  </h3>
                  <p style={{ fontSize: 12.5, color: '#64748B', margin: '2px 0 0', fontWeight: 600 }}>
                    Official announcement to all registered captains and crewmates
                  </p>
                </div>
              </div>

              <div style={{
                background: '#FFF7ED',
                border: '1.5px solid #FED7AA',
                borderRadius: 14,
                padding: '14px 16px',
                fontSize: 13,
                color: '#7C2D12',
                lineHeight: 1.55
              }}>
                <strong>Transmission Details:</strong> This will dispatch an official HAXLR8 3.0 notification email to all registered participants (captains &amp; teammates) announcing that problem statements are live, highlighting the 3-squad quota cap, and providing direct access to the dashboard.
              </div>

              {/* Test Dispatch Box */}
              <div style={{
                background: '#F8FAFC',
                border: '1.5px solid #CBD5E1',
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Send Test Preview First:
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="email"
                    placeholder="Enter preview email (e.g. your email)"
                    value={testEmailInput}
                    onChange={e => setTestEmailInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 12.5
                    }}
                  />
                  <button
                    type="button"
                    disabled={testSending || broadcasting}
                    onClick={handleSendTestLiveEmail}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      background: '#0284C7',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: testSending ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {testSending ? 'Sending...' : 'Send Test'}
                  </button>
                </div>
                {testResultMsg && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: testResultMsg.startsWith('✓') ? '#16A34A' : '#DC2626' }}>
                    {testResultMsg}
                  </div>
                )}
              </div>

              {/* Live Progress Bar */}
              {broadcasting && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: '#0F172A' }}>
                    <span>Broadcasting Transmission...</span>
                    <span>{broadcastProgress.sent + broadcastProgress.failed} / {broadcastProgress.total}</span>
                  </div>
                  <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${broadcastProgress.total ? ((broadcastProgress.sent + broadcastProgress.failed) / broadcastProgress.total) * 100 : 0}%`,
                        background: '#0284C7',
                        transition: 'width 0.2s'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>
                    Sent: {broadcastProgress.sent} &bull; Failed: {broadcastProgress.failed}
                  </div>
                </div>
              )}

              {broadcastDone && (
                <div style={{
                  background: '#F0FDF4',
                  border: '1.5px solid #86EFAC',
                  borderRadius: 12,
                  padding: '10px 14px',
                  color: '#15803D',
                  fontSize: 13,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <CheckCircle2 size={16} />
                  <span>Broadcast successfully completed! ({broadcastProgress.sent} sent)</span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  disabled={broadcasting}
                  onClick={() => setShowBroadcastModal(false)}
                  style={{
                    flex: 1,
                    padding: '11px 16px',
                    borderRadius: 12,
                    background: '#F1F5F9',
                    border: '1.5px solid #CBD5E1',
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#475569',
                    cursor: broadcasting ? 'not-allowed' : 'pointer'
                  }}
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={broadcasting || broadcastDone}
                  onClick={handleBroadcastLiveEmails}
                  style={{
                    flex: 1.5,
                    padding: '11px 16px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #FF3B69 0%, #EA580C 100%)',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 900,
                    color: '#FFFFFF',
                    cursor: (broadcasting || broadcastDone) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(255, 59, 105, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <Mail size={16} />
                  <span>{broadcasting ? 'Broadcasting Now...' : '🚀 Send Broadcast to All Participants'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
