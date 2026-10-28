import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import closedPosterImg from '../../assets/haxlr8-registration-closed.jpg';

export default function RegistrationExtendedModal() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show modal inside admin portal or dashboard
  const isAdminOrDashboard = location.pathname.startsWith('/admin') || 
                            location.pathname.startsWith('/udview') || 
                            location.pathname.startsWith('/dashboard');

  useEffect(() => {
    if (isAdminOrDashboard) return;

    // Check if user dismissed it in this browser session
    const hasDismissedSession = sessionStorage.getItem('haxlr8_reg_closed_popup_dismissed_session');
    if (!hasDismissedSession) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isAdminOrDashboard]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('haxlr8_reg_closed_popup_dismissed_session', 'true');
    } catch (e) {}
  };

  const handleLoginClick = () => {
    handleClose();
    navigate('/login');
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Backdrop with modern glassmorphism blur */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(3, 7, 18, 0.82)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              cursor: 'pointer',
            }}
          />

          {/* Modal Container */}
          <div
            style={{
              position: 'relative',
              zIndex: 100000,
              width: '92%',
              maxWidth: '440px',
              maxHeight: '94vh',
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: 'none',
              padding: '8px',
            }}
          >
            <motion.div
              key="modal-card"
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                pointerEvents: 'auto',
                background: '#ffffff',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                position: 'relative',
              }}
            >
              {/* Close Button Top-Right */}
              <button
                onClick={handleClose}
                aria-label="Close registration closed notice"
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  zIndex: 20,
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1.5px solid rgba(255, 255, 255, 0.35)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(6px)',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                  e.currentTarget.style.transform = 'scale(1.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <X size={17} strokeWidth={2.5} />
              </button>

              {/* Poster Image Area */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxHeight: '66vh',
                  overflow: 'hidden',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1.5px solid #f1f5f9',
                }}
              >
                <img
                  src={closedPosterImg}
                  alt="HAXLR8 3.0 Registration Closed"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '66vh',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/haxlr8-registration-closed.jpg';
                  }}
                />

                {/* Floating Notification Pill */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    zIndex: 15,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(15, 23, 42, 0.88)',
                    color: '#ffffff',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Lock size={12} color="#f87171" />
                  <span>Registrations Closed</span>
                </div>
              </div>

              {/* Content & Action Bar */}
              <div
                style={{
                  padding: '16px 20px 20px',
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <h3
                      style={{
                        margin: '0 0 4px',
                        fontSize: '16px',
                        fontWeight: 900,
                        color: '#0f172a',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      🚀 Squad Capacity Full!
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '12.5px',
                        color: '#64748b',
                        lineHeight: 1.45,
                        fontWeight: 500,
                      }}
                    >
                      All 52 national squads are locked in. Registered team leaders and crewmates can log in to view manifests, verified status, and flight passes.
                    </p>
                  </div>
                </div>

                {/* Quick Info Box */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11.5px',
                    color: '#0f172a',
                    fontWeight: 700,
                  }}
                >
                  <ShieldCheck size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                  <span>Grand Finale: <strong>November 06–07, 2026</strong> @ MIT Mysore</span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                  <button
                    onClick={handleLoginClick}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      fontSize: '13.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#1e293b';
                      e.currentTarget.style.transform = 'translateY(-1.5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#0f172a';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span>Captain &amp; Crew Login</span>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    onClick={handleClose}
                    style={{
                      padding: '12px 16px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      color: '#475569',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e2e8f0';
                      e.currentTarget.style.color = '#0f172a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.color = '#475569';
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
