import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import crewHuddleImg from '../../assets/crew_huddle.png';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../lib/useAuth';

export default function AssembleCrewSection() {
  const user = useAuth();

  return (
    <section
      id="assemble"
      style={{
        position: 'relative',
        width: '100%',
        padding: '100px 24px 140px',
        backgroundColor: '#070a13',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '30%',
          width: '600px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
        className="assemble-crew-grid"
      >
        {/* Left: Heading & Call to action */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          {/* Main Title: ASSEMBLE YOUR CREW */}
          <h2
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              margin: '0 0 16px 0',
              textTransform: 'uppercase',
            }}
          >
            ASSEMBLE YOUR <span style={{ color: '#ef4444' }}>CREW</span>
          </h2>

          {/* Subtext: 3 – 4 members. One mission. One chance. */}
          <p
            style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
              fontWeight: 700,
              color: '#cbd5e1',
              margin: '0 0 32px 0',
              letterSpacing: '0.02em',
            }}
          >
            3 – 4 members. One mission. One chance.
          </p>

          {/* Large Red Button: CAPTAIN & CREW LOGIN → */}
          <Link
            to={user ? '/dashboard' : '/login'}
            style={{ textDecoration: 'none' }}
          >
            <button className="assemble-register-btn">
              <span>{user ? 'ACCESS DASHBOARD' : 'CAPTAIN & CREW LOGIN'}</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </Link>
        </motion.div>

        {/* Right: Crewmates Huddle Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(239, 68, 68, 0.18)',
            background: 'rgba(15, 23, 42, 0.8)',
          }}
        >
          <img
            src={crewHuddleImg}
            alt="Crewmates Assembled"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'cover',
            }}
          />

          {/* Neon Sign in ship bay: BETTER IDEAS BRIGHTER TOMORROWS */}
          <div
            style={{
              position: 'absolute',
              top: '18px',
              right: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.6))',
            }}
          >
            <svg width="22" height="15" viewBox="0 0 24 16" fill="none" stroke="#f87171" strokeWidth="1.8">
              <path d="M2 14L5 4L12 10L19 4L22 14H2Z" />
            </svg>
            <span
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '10.5px',
                fontWeight: 900,
                color: '#fca5a5',
                textAlign: 'center',
                letterSpacing: '0.1em',
                lineHeight: 1.25,
              }}
            >
              BETTER<br />IDEAS<br />BRIGHTER<br />TOMORROWS
            </span>
          </div>
        </motion.div>
      </div>

      <style>{`
        .assemble-register-btn {
          background: #dc2626;
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          padding: 16px 42px;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.06em;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          box-shadow: 0 0 30px rgba(220, 38, 38, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.2);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .assemble-register-btn:hover {
          background: #ef4444;
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 0 45px rgba(239, 68, 68, 0.85), inset 0 0 15px rgba(255, 255, 255, 0.3);
        }

        .assemble-register-btn:active {
          transform: translateY(0) scale(0.98);
        }

        @media (max-width: 900px) {
          .assemble-crew-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
        }
      `}</style>
    </section>
  );
}
