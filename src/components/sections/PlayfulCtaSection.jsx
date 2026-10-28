import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../lib/useAuth';
import haxlr8LogoContrast from '../../assets/logo/haxlr8-logo-contrast.png';

export default function PlayfulCtaSection() {
  const user = useAuth();

  return (
    <section
      id="cta"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#fffaf3',
        padding: '20px 20px 90px',
        overflow: 'hidden',
        fontFamily: "'Fredoka', 'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Huge Pink / Orange Organic Gradient Container */}
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, #ff3b69 0%, #ea580c 60%, #f97316 100%)',
          borderRadius: '40px',
          padding: '80px 36px 90px',
          textAlign: 'center',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(234, 88, 12, 0.28)',
        }}
      >
        {/* Cloud Doodles / Organic SVG Bubbles */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.12)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            right: '-40px',
            width: '240px',
            height: '240px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        {/* Floating Rocket with Cloud Smoke Animation */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 2, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            marginBottom: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          }}
        >
          <span style={{ fontSize: '42px' }}>🚀</span>
        </motion.div>

        {/* Section Heading: READY TO LAUNCH HAXLR8 3.0? */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: '12px' }}
        >
          <img
            src={haxlr8LogoContrast}
            alt="HAXLR8 3.0"
            style={{
              height: 'clamp(56px, 7.5vw, 80px)',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.2))',
            }}
          />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            fontSize: 'clamp(2.4rem, 5.2vw, 4.2rem)',
            fontWeight: 900,
            margin: '0 0 16px 0',
            letterSpacing: '-0.02em',
            textShadow: '0 4px 15px rgba(0,0,0,0.15)',
          }}
        >
          READY TO LAUNCH?
        </motion.h2>

        {/* Subtitle: Form your crew. Build something crazy. Make your mark. */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.95)',
            maxWidth: '620px',
            margin: '0 auto 36px',
            letterSpacing: '0.01em',
            lineHeight: 1.5,
          }}
        >
          Form your crew. Build something crazy. Make your mark.
        </motion.p>

        {/* Large Button: REGISTER NOW → */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link
            to={user ? '/dashboard' : '/login'}
            style={{ textDecoration: 'none' }}
          >
            <button
              style={{
                background: '#ffffff',
                color: '#ff3b69',
                border: 'none',
                borderRadius: '100px',
                padding: '18px 46px',
                fontSize: '18px',
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                fontFamily: "'Fredoka', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 18px 45px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.2)';
              }}
            >
              <span>{user ? 'ACCESS DASHBOARD' : 'CAPTAIN & CREW LOGIN'}</span>
              <ArrowRight size={22} strokeWidth={2.8} />
            </button>
          </Link>
        </motion.div>

        {/* Mini Perks Line below button */}
        <div
          style={{
            marginTop: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            fontSize: '13px',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.85)',
          }}
        >
          <span>✦ 3–4 Members Per Team</span>
          <span>✦ Inter-College Allowed</span>
          <span>✦ ₹1,200 Per Team Fee</span>
        </div>

        {/* Host Institution & Department verification */}
        <div
          style={{
            marginTop: '36px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.16)',
            backdropFilter: 'blur(12px)',
            borderRadius: '100px',
            padding: '10px 24px',
            border: '1.5px solid rgba(255, 255, 255, 0.3)',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#ffffff' }}>
            Dept. of ECE · Maharaja Institute of Technology Mysore
          </span>
        </div>
      </div>
    </section>
  );
}
