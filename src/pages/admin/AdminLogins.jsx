import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchRegisteredAccountsData, 
  exportRegisteredUsersCSV 
} from '../../lib/userTrackingService';
import { isOrganizerAuthorized } from './adminAuth';
import * as XLSX from 'xlsx';
import { 
  Users, Mail, LogIn, CheckCircle2, AlertCircle, Search, 
  Download, RefreshCw, Copy, Check, Filter, ShieldCheck, Sparkles, Clock
} from 'lucide-react';

const S = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  primary: '#0284C7',
  t1: '#0F172A',
  t2: '#475569',
  t3: '#94A3B8',
  green: '#16A34A',
  amber: '#D97706',
  radius: '14px',
};

export default function AdminLogins() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedItem, setCopiedItem] = useState(null);

  // Data state
  const [accounts, setAccounts] = useState([]);
  const [stats, setStats] = useState({
    totalRegistered: 0,
    withTeamCount: 0,
    withoutTeamCount: 0,
    totalLogins: 0,
    squadsCount: 0,
  });

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'HAS_TEAM' | 'NO_TEAM' | 'GOOGLE' | 'EMAIL'
  const [sortBy, setSortBy] = useState('LAST_LOGIN'); // 'LAST_LOGIN' | 'LOGIN_COUNT' | 'NAME'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetchRegisteredAccountsData();
      if (res && res.accountsList) {
        setAccounts(res.accountsList);
        setStats(res.stats);
      }
    } catch (err) {
      console.warn('Error fetching login accounts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const authorized = await isOrganizerAuthorized();
      if (authorized) {
        setIsAdmin(true);
        loadData();
      } else {
        window.dispatchEvent(new Event('haxlr8_organizer_logout'));
      }
    };
    checkAuth();
  }, [loadData]);

  // Copy single email to clipboard
  const handleCopyEmail = (email, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedItem(email);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  // Copy all filtered emails to clipboard
  const handleCopyAllEmails = () => {
    if (filteredAccounts.length === 0) return;
    const allEmails = filteredAccounts.map(a => a.email).filter(Boolean).join(', ');
    navigator.clipboard.writeText(allEmails);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    setExporting(true);
    try {
      const rows = filteredAccounts.map((a, idx) => ({
        "Sl No": idx + 1,
        "Full Name": a.fullName || '—',
        "Email Address": a.email,
        "Auth Provider": (a.provider || 'email').toUpperCase(),
        "Squad Status": a.hasTeam ? 'Team Formed' : 'Pending Team Setup',
        "Squad Name": a.teamName || '—',
        "Role in Squad": a.teamRole || '—',
        "Login Count": a.loginCount || 1,
        "Last Login": a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString('en-US') : '—',
        "First Registered": a.registeredAt ? new Date(a.registeredAt).toLocaleString('en-US') : '—',
        "College Name": a.collegeName || '—',
        "Phone Number": a.phone || '—',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [
        { wch: 8 },  // Sl No
        { wch: 24 }, // Full Name
        { wch: 32 }, // Email
        { wch: 14 }, // Auth Provider
        { wch: 20 }, // Squad Status
        { wch: 24 }, // Squad Name
        { wch: 18 }, // Role in Squad
        { wch: 14 }, // Login Count
        { wch: 24 }, // Last Login
        { wch: 24 }, // First Registered
        { wch: 30 }, // College Name
        { wch: 16 }, // Phone Number
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Logged-in Accounts");
      XLSX.writeFile(wb, `haxlr8_logged_in_accounts_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export Excel file.');
    } finally {
      setExporting(false);
    }
  };

  // Filtered & Sorted Accounts
  const filteredAccounts = useMemo(() => {
    let result = [...accounts];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(a => 
        (a.email && a.email.toLowerCase().includes(term)) ||
        (a.fullName && a.fullName.toLowerCase().includes(term)) ||
        (a.teamName && a.teamName.toLowerCase().includes(term)) ||
        (a.collegeName && a.collegeName.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (statusFilter === 'HAS_TEAM') {
      result = result.filter(a => a.hasTeam);
    } else if (statusFilter === 'NO_TEAM') {
      result = result.filter(a => !a.hasTeam);
    } else if (statusFilter === 'GOOGLE') {
      result = result.filter(a => a.provider === 'google');
    } else if (statusFilter === 'EMAIL') {
      result = result.filter(a => a.provider !== 'google');
    }

    // Sort order
    if (sortBy === 'LAST_LOGIN') {
      result.sort((a, b) => new Date(b.lastLoginAt || 0) - new Date(a.lastLoginAt || 0));
    } else if (sortBy === 'LOGIN_COUNT') {
      result.sort((a, b) => (Number(b.loginCount) || 1) - (Number(a.loginCount) || 1));
    } else if (sortBy === 'NAME') {
      result.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    }

    return result;
  }, [accounts, searchTerm, statusFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAccounts.length / pageSize) || 1;
  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAccounts.slice(start, start + pageSize);
  }, [filteredAccounts, currentPage, pageSize]);

  return (
    <div style={{ background: S.bg, minHeight: '100%', padding: '24px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E0F2FE', color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={20} />
            </div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: S.t1, letterSpacing: '-0.02em' }}>
              Logged-in Accounts Registry
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: S.t2 }}>
            Real-time audit log of authentic emails that logged into HAXLR8 3.0 from start to now, including login count and squad setup status.
          </p>
        </div>

        {/* Global Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/admin/whitelist')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', background: '#0284c7', border: 'none',
              borderRadius: 10, fontSize: 13, fontWeight: 800, color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
            }}
          >
            <ShieldCheck size={16} />
            <span>Manage Access Whitelist</span>
          </button>

          <button
            onClick={loadData}
            disabled={refreshing}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 16px', background: S.card, border: `1.5px solid ${S.border}`,
              borderRadius: 10, fontSize: 13, fontWeight: 700, color: S.t2,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>

          <button
            onClick={handleCopyAllEmails}
            disabled={filteredAccounts.length === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 16px', background: copiedAll ? '#DCFCE7' : '#F1F5F9',
              border: `1.5px solid ${copiedAll ? '#86EFAC' : '#CBD5E1'}`,
              borderRadius: 10, fontSize: 13, fontWeight: 700,
              color: copiedAll ? '#15803D' : S.t1,
              cursor: filteredAccounts.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {copiedAll ? <Check size={16} /> : <Copy size={16} />}
            <span>{copiedAll ? 'All Emails Copied!' : `Copy Emails (${filteredAccounts.length})`}</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={exporting || filteredAccounts.length === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 16px', background: '#0284C7', border: '1.5px solid #0284C7',
              borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#FFFFFF',
              cursor: (exporting || filteredAccounts.length === 0) ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
            }}
          >
            <Download size={16} />
            <span>{exporting ? 'Exporting...' : 'Export Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Card 1: Total Logged-in Emails */}
        <div style={{ background: S.card, border: `1.5px solid ${S.border}`, borderRadius: S.radius, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: S.t3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Logged-in Accounts</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: S.t1, lineHeight: 1.15, marginTop: 2 }}>{stats.totalRegistered}</div>
            <div style={{ fontSize: 11, color: S.t2, marginTop: 4 }}>Authentic users who signed in</div>
          </div>
        </div>

        {/* Card 2: Total Logins Recorded */}
        <div style={{ background: S.card, border: `1.5px solid ${S.border}`, borderRadius: S.radius, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F3E8FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <LogIn size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: S.t3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Logins</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: S.t1, lineHeight: 1.15, marginTop: 2 }}>{stats.totalLogins}</div>
            <div style={{ fontSize: 11, color: S.t2, marginTop: 4 }}>Cumulative login sessions</div>
          </div>
        </div>

        {/* Card 3: Squads Formed */}
        <div style={{ background: S.card, border: `1.5px solid ${S.border}`, borderRadius: S.radius, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: S.t3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Squads Formed</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#15803D', lineHeight: 1.15, marginTop: 2 }}>{stats.withTeamCount}</div>
            <div style={{ fontSize: 11, color: S.t2, marginTop: 4 }}>Completed team registration</div>
          </div>
        </div>

        {/* Card 4: Logged in but No Team Yet */}
        <div style={{ background: S.card, border: `1.5px solid ${S.border}`, borderRadius: S.radius, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: S.t3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>No Team Added Yet</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#B45309', lineHeight: 1.15, marginTop: 2 }}>{stats.withoutTeamCount}</div>
            <div style={{ fontSize: 11, color: S.t2, marginTop: 4 }}>Logged in, squad pending</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: S.card, border: `1.5px solid ${S.border}`, borderRadius: S.radius, padding: '16px 20px', marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 420 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: S.t3 }} />
          <input
            type="text"
            placeholder="Search email, name, squad, or college..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{
              width: '100%', padding: '10px 14px 10px 38px',
              border: `1.5px solid ${S.border}`, borderRadius: 10,
              fontSize: 13, color: S.t1, outline: 'none',
              background: '#F8FAFC', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Filter Badges & Sorters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: S.t2 }}>
            <Filter size={14} />
            <span style={{ fontWeight: 600 }}>Filter:</span>
          </div>

          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '8px 12px', border: `1.5px solid ${S.border}`,
              borderRadius: 8, fontSize: 12, fontWeight: 600,
              color: S.t1, background: '#FFFFFF', outline: 'none', cursor: 'pointer'
            }}
          >
            <option value="ALL">All Logged-in ({accounts.length})</option>
            <option value="HAS_TEAM">Has Squad ({stats.withTeamCount})</option>
            <option value="NO_TEAM">No Team Yet ({stats.withoutTeamCount})</option>
            <option value="GOOGLE">Google Auth</option>
            <option value="EMAIL">Email Auth</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: '8px 12px', border: `1.5px solid ${S.border}`,
              borderRadius: 8, fontSize: 12, fontWeight: 600,
              color: S.t1, background: '#FFFFFF', outline: 'none', cursor: 'pointer'
            }}
          >
            <option value="LAST_LOGIN">Sort: Latest Login</option>
            <option value="LOGIN_COUNT">Sort: Login Frequency</option>
            <option value="NAME">Sort: Full Name</option>
          </select>
        </div>
      </div>

      {/* Main Accounts Table */}
      <div style={{ background: S.card, border: `1.5px solid ${S.border}`, borderRadius: S.radius, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: `1.5px solid ${S.border}` }}>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: S.t2, width: 60 }}>#</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: S.t2 }}>User & Email</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: S.t2, width: 130 }}>Auth Provider</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: S.t2, width: 140 }}>Login Count</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: S.t2, width: 170 }}>Last Login Active</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: S.t2 }}>Squad Status</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: S.t2, width: 90, textAlign: 'center' }}>Copy</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', color: S.t3 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <RefreshCw size={24} className="animate-spin" style={{ color: S.primary }} />
                      <span style={{ fontWeight: 600 }}>Loading logged-in accounts registry...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', color: S.t2 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <Mail size={32} style={{ color: S.t3 }} />
                      <div style={{ fontWeight: 700, fontSize: 15, color: S.t1 }}>No logged-in accounts match your filter</div>
                      <div style={{ fontSize: 12, color: S.t3 }}>Try resetting the search bar or filter dropdown.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAccounts.map((account, index) => {
                  const slNo = (currentPage - 1) * pageSize + index + 1;
                  const isGoogle = account.provider === 'google';
                  const isLead = account.isLeader;
                  const hasTeam = account.hasTeam;
                  const isCopied = copiedItem === account.email;

                  return (
                    <tr
                      key={account.email || index}
                      style={{
                        borderBottom: `1px solid ${S.border}`,
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
                    >
                      {/* Sl No */}
                      <td style={{ padding: '14px 16px', color: S.t3, fontWeight: 700 }}>
                        {slNo}
                      </td>

                      {/* User & Email */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontWeight: 700, color: S.t1, fontSize: 13.5 }}>
                            {account.fullName || 'Registered User'}
                          </span>
                          <span style={{ color: S.primary, fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}>
                            {account.email}
                          </span>
                        </div>
                      </td>

                      {/* Auth Provider */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '3px 8px', borderRadius: 6,
                          fontSize: 11, fontWeight: 700,
                          background: isGoogle ? '#EFF6FF' : '#F1F5F9',
                          color: isGoogle ? '#1D4ED8' : '#475569',
                          border: `1px solid ${isGoogle ? '#BFDBFE' : '#CBD5E1'}`
                        }}>
                          {isGoogle ? 'Google' : 'Email'}
                        </span>
                      </td>

                      {/* Login Count */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#F8FAFC', borderRadius: 8, border: `1px solid ${S.border}` }}>
                          <LogIn size={13} style={{ color: '#0284C7' }} />
                          <span style={{ fontWeight: 800, color: S.t1 }}>{account.loginCount || 1}</span>
                          <span style={{ fontSize: 11, color: S.t3 }}>logins</span>
                        </div>
                      </td>

                      {/* Last Login Active */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: S.t2, fontSize: 12 }}>
                          <Clock size={13} style={{ color: S.t3 }} />
                          <span>
                            {account.lastLoginAt ? new Date(account.lastLoginAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            }) : '—'}
                          </span>
                        </div>
                      </td>

                      {/* Squad Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {hasTeam ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                                background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC'
                              }}>
                                <CheckCircle2 size={12} />
                                {account.teamName || 'Squad Registered'}
                              </span>
                              {isLead && (
                                <span style={{ fontSize: 10, fontWeight: 800, color: '#0369A1', background: '#E0F2FE', padding: '1px 6px', borderRadius: 4 }}>
                                  LEAD
                                </span>
                              )}
                            </div>
                            {account.collegeName && account.collegeName !== '-' && (
                              <span style={{ fontSize: 11, color: S.t3 }}>
                                {account.collegeName}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                            background: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D'
                          }}>
                            <AlertCircle size={12} />
                            No Team Details Yet
                          </span>
                        )}
                      </td>

                      {/* Copy Action */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          onClick={(e) => handleCopyEmail(account.email, e)}
                          title="Copy Email Address"
                          style={{
                            background: isCopied ? '#DCFCE7' : '#F1F5F9',
                            border: `1px solid ${isCopied ? '#86EFAC' : '#CBD5E1'}`,
                            color: isCopied ? '#15803D' : S.t2,
                            borderRadius: 6, padding: '5px 8px',
                            cursor: 'pointer', display: 'inline-flex',
                            alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isCopied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: `1.5px solid ${S.border}`, background: '#F8FAFC', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 12, color: S.t2, fontWeight: 600 }}>
            Showing {filteredAccounts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredAccounts.length)} of {filteredAccounts.length} authenticated accounts
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px', borderRadius: 6, border: `1px solid ${S.border}`,
                background: '#FFFFFF', fontSize: 12, fontWeight: 600, color: S.t1,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: 12, fontWeight: 700, color: S.t1 }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px', borderRadius: 6, border: `1px solid ${S.border}`,
                background: '#FFFFFF', fontSize: 12, fontWeight: 600, color: S.t1,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
