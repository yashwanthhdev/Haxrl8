import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { playEmergencyMeetingSound, playTaskCompleteSound } from './AmongUsSound';
import AmongUsCrewmate from './AmongUsCrewmate';

export default function EmergencyMeetingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpen = () => {
    playEmergencyMeetingSound();
    setIsOpen(true);
  };

  const handleClose = () => {
    playTaskCompleteSound();
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Emergency Buzzer Trigger on bottom right or inside hero */}
      <motion.button
        whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
        whileTap={{ scale: 0.94 }}
        onClick={handleOpen}
        title="Trigger Emergency Meeting"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 890,
          background: 'radial-gradient(circle at 35% 35%, #ef4444 0%, #b91c1c 70%, #7f1d1d 100%)',
          color: '#ffffff',
          border: '3px solid #111111',
          borderRadius: '50px',
          padding: '12px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.45), inset 0 2px 4px rgba(255,255,255,0.4)',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '11px',
          letterSpacing: '0.04em',
        }}
      >
        <span style={{ fontSize: '18px', animation: 'pulse 1.2s infinite' }}>🚨</span>
        <span>EMERGENCY</span>
      </motion.button>

      {/* Emergency Meeting Fullscreen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(5, 7, 12, 0.92)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            {/* Screen flashing sirens */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 50%, rgba(220,38,38,0.25) 0%, transparent 70%)',
                animation: 'sirenFlash 1s infinite alternate',
                pointerEvents: 'none',
              }}
            />

            <motion.div
              initial={{ scale: 0.7, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: 'spring', damping: 20, stiffness: 280 }}
              style={{
                position: 'relative',
                background: '#0d131f',
                border: '4px solid #111',
                outline: '4px solid #ef4444',
                borderRadius: '24px',
                maxWidth: '680px',
                width: '100%',
                padding: '36px 32px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(239,68,68,0.35)',
                textAlign: 'center',
                color: '#ffffff',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              {/* Emergency Banner Header */}
              <div
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  padding: '8px 24px',
                  borderRadius: '100px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  marginBottom: '20px',
                  border: '2px solid #111',
                  boxShadow: '0 4px 14px rgba(239,68,68,0.5)',
                }}
              >
                <span>🚨</span> EMERGENCY MEETING CALLED <span>🚨</span>
              </div>

              <h2
                style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                  fontWeight: 900,
                  margin: '0 0 10px',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  color: '#f8fafc',
                }}
              >
                Assemble Your Crew for <span style={{ color: '#38fedc' }}>HAXLR8 3.0</span>
              </h2>

              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 28px' }}>
                There are <strong>3 Sectors Among Us</strong>. Your squad of <strong>3–4 crewmates</strong> must formulate and submit your idea paper before the oxygen clock expires!
              </p>

              {/* Crewmate Sector Representatives */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '14px',
                  marginBottom: '28px',
                }}
              >
                {/* Sector 1: Agriculture */}
                <div
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '2px solid #22c55e',
                    borderRadius: '16px',
                    padding: '16px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AmongUsCrewmate color="lime" size={60} hat="sprout" interactive={false} />
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#50ef39' }}>HYDROPONICS</span>
                  <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Agriculture</span>
                </div>

                {/* Sector 2: Smart City */}
                <div
                  style={{
                    background: 'rgba(2, 132, 199, 0.1)',
                    border: '2px solid #0284c7',
                    borderRadius: '16px',
                    padding: '16px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AmongUsCrewmate color="blue" size={60} hat="cap" interactive={false} />
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#38fedc' }}>NAVIGATION</span>
                  <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Smart City</span>
                </div>

                {/* Sector 3: Healthcare */}
                <div
                  style={{
                    background: 'rgba(225, 29, 72, 0.1)',
                    border: '2px solid #e11d48',
                    borderRadius: '16px',
                    padding: '16px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AmongUsCrewmate color="cyan" size={60} hat="med" interactive={false} />
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#f43f5e' }}>MEDBAY</span>
                  <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Healthcare</span>
                </div>
              </div>

              {/* Mission Intel Pill */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  padding: '14px 20px',
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  marginBottom: '28px',
                  fontSize: '12px',
                  color: '#e2e8f0',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Ship Bounty</span>
                  <strong style={{ color: '#facc15', fontSize: '16px' }}>₹40,000</strong>
                </div>
                <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />
                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Submissions Close</span>
                  <strong style={{ color: '#ef4444', fontSize: '14px' }}>NOV 02, 2026</strong>
                </div>
                <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />
                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Docking Station</span>
                  <strong style={{ color: '#38fedc', fontSize: '13px' }}>MIT Mysore</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    handleClose();
                    navigate('/register');
                  }}
                  style={{
                    background: '#22c55e',
                    color: '#111',
                    border: '2px solid #111',
                    borderRadius: '12px',
                    padding: '14px 28px',
                    fontSize: '13px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(34,197,94,0.4)',
                    letterSpacing: '0.04em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  🚀 JOIN THE CREW (REGISTER)
                </button>

                <button
                  onClick={handleClose}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: '#e2e8f0',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    padding: '14px 24px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Return to Ship
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes sirenFlash {
          0% { opacity: 0.3; }
          100% { opacity: 0.85; }
        }
      `}</style>
    </>
  );
}
