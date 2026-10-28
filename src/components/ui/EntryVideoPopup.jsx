import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../lib/useAuth';
import { MessagesSquare, ExternalLink, X } from 'lucide-react';

export default function EntryVideoPopup() {
  const [popupState, setPopupState] = useState('hidden'); // 'hidden', 'video', 'whatsapp'
  const user = useAuth();

  useEffect(() => {
    // Show only once
    const t = setTimeout(() => setPopupState('video'), 600);
    return () => clearTimeout(t);
  }, []);

  const closeVideo = () => {
    setPopupState('hidden');
  };

  const closeWhatsapp = () => {
    setPopupState('hidden');
  };

  // Close on Escape key
  useEffect(() => {
    if (popupState === 'hidden') return;
    const handler = (e) => { 
      if (e.key === 'Escape') {
        if (popupState === 'video') closeVideo();
        else if (popupState === 'whatsapp') closeWhatsapp();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [popupState]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = popupState !== 'hidden' ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [popupState]);

  return (
    <AnimatePresence mode="wait">
      {popupState !== 'hidden' && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => popupState === 'video' ? closeVideo() : closeWhatsapp()}
            style={{
              position: 'fixed', inset: 0, zIndex: 9998,
              background: 'rgba(0,0,0,0.82)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              cursor: 'pointer',
            }}
            aria-hidden="true"
          />

          {/* ── Modal Container ── */}
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'clamp(16px, 4vw, 40px)', pointerEvents: 'none',
          }}>
            <AnimatePresence mode="wait">
              {popupState === 'video' && (
                <motion.div
                  key="video-modal"
                  initial={{ opacity: 0, scale: 0.92, y: 32 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 20 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  onClick={e => e.stopPropagation()}
                  style={{
                    pointerEvents: 'auto', width: '100%', maxWidth: 860,
                    background: '#0a0a0a', borderRadius: 20, overflow: 'hidden',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
                    position: 'relative', display: 'flex', flexDirection: 'column'
                  }}
                >
                  {/* Top bar */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px', background: '#111', borderBottom: '1px solid rgba(255,255,255,0.07)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef4444', animation: 'pulse-dot 1.4s ease-in-out infinite' }} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>HAXLR8 3.0</span>
                    </div>
                    <button 
                      onClick={closeVideo} 
                      style={{ 
                        width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', 
                        border: '1px solid rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' 
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* YouTube Video */}
                  <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000' }}>
                    <iframe 
                      width="100%" height="100%" 
                      src="https://www.youtube.com/embed/xHmikF5qzXc?autoplay=1" 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen
                      style={{ display: 'block' }}
                    />
                  </div>
                  
                  {/* Bottom bar */}
                  <div style={{
                    padding: '16px 20px', background: '#111', borderTop: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Nov 06–07, 2026 · Maharaja Institute of Technology Mysore</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>National-level hackathon with ₹40,000 prize pool</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <a
                        href="/login"
                        onClick={closeVideo}
                        style={{
                          padding: '9px 22px', borderRadius: 100, background: '#fff', color: '#111',
                          fontSize: '0.8rem', fontWeight: 800, textDecoration: 'none', cursor: 'pointer',
                          fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.04em',
                          transition: 'background 0.2s, transform 0.15s', display: 'inline-flex', alignItems: 'center', gap: 6,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#e5e5e5'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        🚀 Crew Login (Closed)
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}

//popup whatsapp card 
              {popupState === 'whatsapp' && (
                <motion.div
                  key="whatsapp-modal"
                  initial={{ opacity: 0, scale: 0.92, y: 32 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 20 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  onClick={e => e.stopPropagation()}
                  style={{
                    pointerEvents: 'auto', width: '100%', maxWidth: 460,
                    background: '#fff', borderRadius: 24, overflow: 'hidden',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.05)',
                    position: 'relative', display: 'flex', flexDirection: 'column',
                    padding: '32px', fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}
                >
                  <button onClick={closeWhatsapp} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'} onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}>
                    <X size={16} />
                  </button>
                  
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
                    <div style={{ width: 64, height: 64, background: '#dcfce7', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                      <MessagesSquare size={32} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#111', margin: '0 0 8px' }}>Join the Community!</h2>
                      <p style={{ fontSize: '0.95rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>Connect with other participants, form teams, and get instant updates directly from the coordinators.</p>
                    </div>
                    
                    <a 
                      href="https://chat.whatsapp.com/BXFPp6PTWk4I6wG7UMCbAP"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeWhatsapp}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        width: '100%', marginTop: 8, padding: '14px 24px',
                        background: '#25D366', color: '#fff',
                        borderRadius: '12px', textDecoration: 'none',
                        fontSize: '1rem', fontWeight: 700,
                        boxShadow: '0 10px 25px rgba(37,211,102,0.2)',
                        transition: 'transform 0.2s, background 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#22c55e'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#25D366'; }}
                    >
                      Join WhatsApp Group <ExternalLink size={18} />
                    </a>
                    <button 
                      onClick={closeWhatsapp}
                      style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', marginTop: 4, transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#6b7280'}
                      onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                    >
                      Maybe later
                    </button>
                  </div> 
                </motion.div>
              )}
            </AnimatePresence> 
          </div>
          
          <style>{`
            @keyframes pulse-dot {
              0%, 100% { opacity: 1; transform: scale(1); }
              50%       { opacity: 0.5; transform: scale(0.85); }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
