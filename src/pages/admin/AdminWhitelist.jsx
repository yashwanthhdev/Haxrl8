import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ShieldCheck, ShieldAlert, Plus, Trash2, Search, 
  Copy, Check, RefreshCw, Mail, Users, CheckCircle2, 
  Clock, AlertTriangle, ArrowRight, Download
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { isOrganizerAuthorized } from './adminAuth';
import { 
  fetchWhitelistConfig, 
  saveWhitelistConfig, 
  normalizeEmail 
} from '../../lib/whitelistService';
import AmongUsCrewmate from '../../components/amongus/AmongUsCrewmate';
import * as XLSX from 'xlsx';

const S = {
  card: '#FFFFFF',
  border: '#FED7AA',
  primary: '#0284C7',
  t1: '#0F172A',
  t2: '#475569',
  t3: '#94A3B8',
  radius: '16px',
};

export default function AdminWhitelist() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [registeredTeamsMap, setRegisteredTeamsMap] = useState({});
  const [newEmail, setNewEmail] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Whitelist Config
      const config = await fetchWhitelistConfig();
      setEnabled(config.enabled);
      setAllowedEmails(config.allowedEmails || []);

      // 2. Fetch existing registered teams & members to cross-reference status
      try {
        const { data: teams } = await supabase.from('teams').select('id, team_name');
        const teamNameMap = {};
        (teams || []).forEach(t => { teamNameMap[t.id] = t.team_name; });

        const { data: members } = await supabase.from('team_members').select('id, team_id, email, is_leader, full_name');
        const map = {};
        (members || []).forEach(m => {
          if (m.email) {
            map[normalizeEmail(m.email)] = {
              team_name: teamNameMap[m.team_id] || 'Registered Squad',
              is_leader: m.is_leader,
              full_name: m.full_name
            };
          }
        });
        setRegisteredTeamsMap(map);
      } catch (tErr) {
        console.warn('Teams check notice:', tErr);
      }
    } catch (err) {
      console.warn('Error loading whitelist data:', err);
    } finally {
      setLoading(false);
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

  // Toggle whitelist enforcement mode
  const handleToggleMode = async () => {
    const nextState = !enabled;
    setEnabled(nextState);
    setSaving(true);
    try {
      await saveWhitelistConfig({
        enabled: nextState,
        allowedEmails,
      });
      showToast(nextState ? 'Access restricted: Only whitelisted emails can register' : 'Public mode active: Anyone can register');
    } catch (err) {
      showToast('Error updating access mode');
    } finally {
      setSaving(false);
    }
  };

  // Add single email
  const handleAddEmail = async (e) => {
    e?.preventDefault();
    const clean = normalizeEmail(newEmail);
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      showToast('Please enter a valid email address');
      return;
    }

    if (allowedEmails.includes(clean)) {
      showToast('This email is already in the whitelist');
      return;
    }

    const updated = [clean, ...allowedEmails];
    setAllowedEmails(updated);
    setNewEmail('');
    setSaving(true);

    try {
      await saveWhitelistConfig({
        enabled,
        allowedEmails: updated,
      });
      showToast(`Added ${clean} to approved whitelist`);
    } catch (err) {
      showToast('Failed to save to database');
    } finally {
      setSaving(false);
    }
  };

  // Bulk add emails
  const handleBulkAdd = async () => {
    if (!bulkInput.trim()) return;
    const candidates = bulkInput
      .split(/[\n,;\s]+/)
      .map(normalizeEmail)
      .filter(e => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (candidates.length === 0) {
      showToast('No valid emails found in bulk input');
      return;
    }

    const combined = Array.from(new Set([...candidates, ...allowedEmails]));
    const newlyAddedCount = combined.length - allowedEmails.length;

    setAllowedEmails(combined);
    setBulkInput('');
    setShowBulkModal(false);
    setSaving(true);

    try {
      await saveWhitelistConfig({
        enabled,
        allowedEmails: combined,
      });
      showToast(`Added ${newlyAddedCount} new approved email(s)`);
    } catch (err) {
      showToast('Failed to save bulk emails');
    } finally {
      setSaving(false);
    }
  };

  // Remove email
  const handleRemoveEmail = async (emailToRemove) => {
    if (!window.confirm(`Remove ${emailToRemove} from the approved registration whitelist?`)) {
      return;
    }

    const updated = allowedEmails.filter(e => e !== emailToRemove);
    setAllowedEmails(updated);
    setSaving(true);

    try {
      await saveWhitelistConfig({
        enabled,
        allowedEmails: updated,
      });
      showToast(`Removed ${emailToRemove}`);
    } catch (err) {
      showToast('Failed to update whitelist');
    } finally {
      setSaving(false);
    }
  };

  // Copy email
  const handleCopy = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Export to Excel
  const handleExport = () => {
    const rows = allowedEmails.map((em, idx) => {
      const regTeam = registeredTeamsMap[em];
      return {
        '#': idx + 1,
        'Approved Email': em,
        'Registration Status': regTeam ? 'REGISTERED' : 'PENDING',
        'Registered Team Name': regTeam?.team_name || '-',
        'Domain Track': regTeam?.domain || '-',
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registration Whitelist');
    XLSX.writeFile(wb, `HAXLR8_Registration_Whitelist_${Date.now()}.xlsx`);
  };

  // Filtered emails
  const filteredEmails = useMemo(() => {
    if (!searchTerm.trim()) return allowedEmails;
    const term = searchTerm.toLowerCase();
    return allowedEmails.filter(em => em.includes(term));
  }, [allowedEmails, searchTerm]);

  if (!isAdmin) return null;

  return (
    <div style={{ padding: '28px 24px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          zIndex: 99999,
          fontSize: '13.5px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          border: '1px solid #334155'
        }}>
          <SparklesIcon />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        borderRadius: S.radius,
        padding: '30px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)'
      }}>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', padding: '5px 12px', borderRadius: 100, fontSize: 11, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
              <ShieldCheck size={14} color="#38bdf8" />
              <span>REGISTRATION ACCESS CONTROL</span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              Registration Whitelist Studio
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', maxWidth: '640px', lineHeight: 1.5 }}>
              Only admin-approved emails can access registration while whitelist enforcement is active. Existing registered teams remain completely unaffected.
            </p>
          </div>

          {/* Quick Mascot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <AmongUsCrewmate 
              color={enabled ? 'cyan' : 'yellow'} 
              size={64} 
              hat="visor" 
              speechText={enabled ? 'Airlocks Locked to Whitelist! 🛡️' : 'Public Registration Open! 🚀'} 
              interactive={true} 
            />
          </div>
        </div>
      </div>

      {/* Access Mode Toggle & Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Toggle Mode Card */}
        <div style={{
          background: S.card,
          border: '2px solid ' + (enabled ? '#fed7aa' : '#cbd5e1'),
          borderRadius: S.radius,
          padding: '20px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              {enabled ? <ShieldCheck size={20} color="#ea580c" /> : <ShieldAlert size={20} color="#64748b" />}
              <span style={{ fontSize: 15, fontWeight: 900, color: enabled ? '#c2410c' : '#334155' }}>
                {enabled ? 'WHITELIST ONLY (RESTRICTED)' : 'PUBLIC REGISTRATION (OPEN)'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: S.t2, lineHeight: 1.4 }}>
              {enabled
                ? 'Only emails added by admin can create new accounts.'
                : 'Anyone can register on the website without prior approval.'}
            </p>
          </div>

          <button
            onClick={handleToggleMode}
            disabled={saving}
            style={{
              background: enabled ? '#ea580c' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              borderRadius: 100,
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 800,
              cursor: saving ? 'wait' : 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: enabled ? '0 4px 14px rgba(234, 88, 12, 0.3)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {saving ? 'Updating...' : (enabled ? 'Switch to Public' : 'Enforce Whitelist')}
          </button>
        </div>

        {/* Stats Card */}
        <div style={{
          background: S.card,
          border: '1.5px solid ' + S.border,
          borderRadius: S.radius,
          padding: '20px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a' }}>{allowedEmails.length}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Whitelisted
            </div>
          </div>
          <div style={{ height: 40, width: 1, background: '#e2e8f0' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#16a34a' }}>
              {allowedEmails.filter(e => Boolean(registeredTeamsMap[e])).length}
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Registered
            </div>
          </div>
          <div style={{ height: 40, width: 1, background: '#e2e8f0' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#d97706' }}>
              {allowedEmails.filter(e => !registeredTeamsMap[e]).length}
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pending
            </div>
          </div>
        </div>
      </div>

      {/* Add Email Controls */}
      <div style={{
        background: S.card,
        border: '1.5px solid ' + S.border,
        borderRadius: S.radius,
        padding: '20px 24px',
        marginBottom: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 900, color: S.t1, margin: 0 }}>
            Authorize New Email for Registration
          </h2>
          <button
            onClick={() => setShowBulkModal(true)}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '7px 14px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>+ Bulk Paste Emails</span>
          </button>
        </div>

        <form onSubmit={handleAddEmail} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. squadleader@gmail.com"
              style={{
                width: '100%',
                padding: '12px 14px 12px 38px',
                borderRadius: 12,
                border: '1.5px solid #cbd5e1',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={saving || !newEmail.trim()}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 24px',
              fontSize: 13.5,
              fontWeight: 800,
              cursor: saving || !newEmail.trim() ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              opacity: !newEmail.trim() ? 0.6 : 1,
            }}
          >
            <Plus size={16} />
            <span>Add to Whitelist</span>
          </button>
        </form>
      </div>

      {/* Whitelist Table Header / Controls */}
      <div style={{
        background: S.card,
        border: '1.5px solid ' + S.border,
        borderRadius: S.radius,
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: S.t1, margin: 0 }}>
              Authorized Emails ({filteredEmails.length})
            </h3>
            <button
              onClick={loadData}
              disabled={loading}
              title="Refresh"
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Search */}
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search email..."
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 30px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 12.5,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={allowedEmails.length === 0}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '7px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* List */}
        {filteredEmails.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
            <ShieldAlert size={36} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>No approved emails in whitelist</div>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>
              Add an email above so the team leader can register their account.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '10px 12px' }}>#</th>
                  <th style={{ padding: '10px 12px' }}>Approved Email</th>
                  <th style={{ padding: '10px 12px' }}>Registration Status</th>
                  <th style={{ padding: '10px 12px' }}>Registered Team</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails.map((email, idx) => {
                  const regTeam = registeredTeamsMap[email];
                  const isRegistered = Boolean(regTeam);
                  return (
                    <tr key={email} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', color: '#94a3b8', fontWeight: 700 }}>{idx + 1}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{email}</span>
                          <button
                            onClick={() => handleCopy(email)}
                            title="Copy email"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#94a3b8' }}
                          >
                            {copiedEmail === email ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {isRegistered ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: 100, fontSize: 11, fontWeight: 800 }}>
                            <CheckCircle2 size={12} /> Registered
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: 100, fontSize: 11, fontWeight: 800 }}>
                            <Clock size={12} /> Pending Access
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px', color: '#475569' }}>
                        {isRegistered ? (
                          <div>
                            <div style={{ fontWeight: 800, color: '#0284c7' }}>{regTeam.team_name}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>{regTeam.domain || 'Registered'}</div>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 12 }}>Not created yet</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleRemoveEmail(email)}
                          title="Remove from whitelist"
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            padding: '6px 10px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Trash2 size={12} />
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            maxWidth: 520,
            width: '100%',
            padding: 24,
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            border: '2px solid #fed7aa'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
              Bulk Paste Approved Emails
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>
              Paste multiple email addresses separated by commas, spaces, or new lines. Invalid or duplicate emails will be filtered automatically.
            </p>

            <textarea
              rows={6}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="lead1@gmail.com&#10;lead2@college.edu&#10;captain@yahoo.com"
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 12,
                border: '1.5px solid #cbd5e1',
                fontSize: 13,
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: 16
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => { setShowBulkModal(false); setBulkInput(''); }}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '9px 16px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkAdd}
                disabled={!bulkInput.trim()}
                style={{
                  background: '#0284c7',
                  border: 'none',
                  color: '#ffffff',
                  padding: '9px 20px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: !bulkInput.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                Authorize Emails
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}
