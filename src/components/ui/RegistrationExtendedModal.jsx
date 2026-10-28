import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Sparkles, ArrowRight, BellRing } from 'lucide-react';

export default function RegistrationExtendedModal() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show modal inside admin portal
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/udview');

  useEffect(() => {
    if (isAdminRoute) return;

    // Check if user dismissed it in this browser session
    const hasDismissedSession = sessionStorage.getItem('haxlr8_reg_ext_dismissed_session');
    if (!hasDismissedSession) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [isAdminRoute]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('haxlr8_reg_ext_dismissed_session', 'true');
    } catch (e) {
      // Ignore storage errors
    }
  };

  const handleRegisterClick = () => {
    handleClose();
    navigate('/register');
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

  // Disabled: Popup removed as per request
  return null;

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
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(3, 7, 18, 0.78)',
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
              maxWidth: '460px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: 'none',
              padding: '12px',
            }}
          >
            <motion.div
              key="modal-card"
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                pointerEvents: 'auto',
                background: '#ffffff',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                position: 'relative',
              }}
            >
              {/* Close Button Top-Right */}
              <button
                onClick={handleClose}
                aria-label="Close extended registration notice"
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  zIndex: 20,
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.transform = 'scale(1.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.65)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <X size={18} strokeWidth={2.5} />
              </button>

              {/* Poster Image Area */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxHeight: '62vh',
                  overflow: 'hidden',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <img
                  src="/haxlr8-registration-extended.jpg"
                  alt="HAXLR8 3.0 Registration Extended till November 2nd 11:59 PM"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '62vh',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                  onError={(e) => {
                    // Fallback to local import if public path has an issue
                    e.currentTarget.src = '/haxlr8-registration-extended.jpg';
                  }}
                />

                {/* Floating Notification Pill */}
                <div
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: '14px',
                    zIndex: 15,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(239, 68, 68, 0.95)',
                    color: '#ffffff',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <BellRing size={13} />
                  <span>Registration Extended</span>
                </div>
              </div>

              {/* Content & Action Bar */}
              <div
                style={{
                  padding: '18px 20px 20px',
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
                        fontSize: '17px',
                        fontWeight: 900,
                        color: '#0f172a',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      🚀 Registration Extended!
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '12.5px',
                        color: '#475569',
                        lineHeight: 1.5,
                      }}
                    >
                      Registrations are officially open until <strong>Nov 2, 11:59 PM</strong>. Gather your squad, lock in your entry, and compete for <strong>₹40,000 in prizes</strong> at MIT Mysore!
                    </p>
                  </div>
                </div>

                {/* Quick Timeline Badges */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    padding: '8px 10px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11.5px',
                    color: '#334155',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} color="#2563eb" />
                    <span><strong>Deadline:</strong> Nov 02 (11:59 PM)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={13} color="#ea580c" />
                    <span><strong>Grand Finale:</strong> Nov 06–07</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                  <button
                    onClick={handleRegisterClick}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #ff3b69 0%, #ea580c 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      fontSize: '13.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(234, 88, 12, 0.35)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1.5px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(234, 88, 12, 0.45)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(234, 88, 12, 0.35)';
                    }}
                  >
                    <span>Register / View Squad</span>
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
