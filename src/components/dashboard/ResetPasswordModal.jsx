import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import AmongUsCrewmate from '../amongus/AmongUsCrewmate';

export default function ResetPasswordModal({ isOpen, onClose, user, isLeader, teamData }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter carefully.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMsg(error.message || 'Failed to update password. Please try again.');
        setLoading(false);
        return;
      }

      // Also ensure leader session is kept in sync locally
      try {
        const localSession = localStorage.getItem('haxlr8_leader_session');
        if (localSession) {
          const parsed = JSON.parse(localSession);
          if (parsed?.user) {
            parsed.user.password_updated_at = new Date().toISOString();
            localStorage.setItem('haxlr8_leader_session', JSON.stringify(parsed));
          }
        }
      } catch (err) {}

      setSuccessMsg('Your password has been successfully reset! Use this new password for future logins.');
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false);
    } catch (err) {
      console.error('Password reset exception:', err);
      setErrorMsg('An unexpected error occurred while resetting password.');
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    if (loading) return;
    setErrorMsg('');
    setSuccessMsg('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleModalClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        style={{
          background: '#ffffff',
          border: '2px solid #fed7aa',
          borderRadius: 24,
          width: '100%',
          maxWidth: 480,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1.5px solid #f1e7db',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fffaf3',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: '#ffedd5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ea580c',
                border: '1.5px solid #fed7aa',
              }}
            >
              <KeyRound size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a' }}>
                Reset Pass / Password
              </div>
              <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
                {isLeader ? '👑 Squad Leader Security Clearance' : 'Participant Account Security'}
              </div>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            disabled={loading}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#64748b',
              transition: 'all 0.15s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {successMsg ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <AmongUsCrewmate color="green" size={60} hat="crown" speechText="Passcode Updated! 🚀" />
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  color: '#15803d',
                  borderRadius: 14,
                  padding: '10px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 16,
                  textAlign: 'left',
                }}
              >
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>

              <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
                Your new launch passcode is securely registered. You can use it across any device when logging into your squad flight desk.
              </p>

              <button
                type="button"
                onClick={handleModalClose}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: 14,
                  border: 'none',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                }}
              >
                Done / Back to Dashboard ✓
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Account Email Info */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 14,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Authenticated Email
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                    {user?.email || 'Leader Account'}
                  </div>
                </div>
                {teamData?.team_name && (
                  <span
                    style={{
                      background: '#e0f2fe',
                      color: '#0369a1',
                      border: '1px solid #bae6fd',
                      padding: '3px 8px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {teamData.team_name}
                  </span>
                )}
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1.5px solid #fecaca',
                    color: '#b91c1c',
                    borderRadius: 12,
                    padding: '10px 14px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* New Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  New Password *
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: 12,
                    padding: '0 12px',
                    background: '#ffffff',
                    position: 'relative',
                  }}
                >
                  <Lock size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 chars)"
                    required
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      padding: '11px 0',
                      fontSize: 13.5,
                      color: '#0f172a',
                      background: 'transparent',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                  Must be at least 6 characters. Use letters &amp; numbers for best security.
                </span>
              </div>

              {/* Confirm Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Confirm New Password *
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: 12,
                    padding: '0 12px',
                    background: '#ffffff',
                    position: 'relative',
                  }}
                >
                  <ShieldCheck size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      padding: '11px 0',
                      fontSize: 13.5,
                      color: '#0f172a',
                      background: 'transparent',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: 10,
                  borderTop: '1.5px solid #f1e7db',
                  paddingTop: 16,
                  marginTop: 6,
                }}
              >
                <button
                  type="button"
                  onClick={handleModalClose}
                  disabled={loading}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 12,
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 12,
                    border: 'none',
                    background: loading ? '#94a3b8' : '#0284c7',
                    color: '#ffffff',
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {loading ? 'Updating Passcode...' : 'Save New Password 🔒'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
