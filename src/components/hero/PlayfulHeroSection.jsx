import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Sparkles, Trophy } from 'lucide-react';
import HeroCliffIllustration from './HeroCliffIllustration';
import DomainWheel from '../ui/DomainWheel';
import haxlr8LogoDark from '../../assets/logo/haxlr8-logo-dark.png';

export default function PlayfulHeroSection() {
  const handleScrollToAbout = () => {
    const el = document.getElementById('about');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo({ top: window.innerHeight * 0.9, behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#fffaf3',
        overflow: 'hidden',
        paddingTop: 'clamp(118px, 11vw, 148px)',
        paddingBottom: 'clamp(40px, 6vw, 70px)',
        fontFamily: "'Fredoka', 'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* ── 1. Soft Warm Cream Sky Background ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 65% 30%, rgba(254, 205, 211, 0.45) 0%, rgba(254, 240, 138, 0.25) 40%, #fffaf3 75%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Floating Sparkles & Star Doodles in Sky */}
      <div style={{ position: 'absolute', top: '15%', left: '8%', pointerEvents: 'none', zIndex: 1 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#f59e0b">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>
      <div style={{ position: 'absolute', top: '22%', right: '12%', pointerEvents: 'none', zIndex: 1 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff3b69">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>

      {/* Subtle Floating Domain Wheels in Backdrop */}
      <div style={{ position: 'absolute', top: '12%', left: '3%', opacity: 0.85, pointerEvents: 'none', zIndex: 1 }} className="hero-hide-mobile">
        <DomainWheel size={80} />
      </div>
      <div style={{ position: 'absolute', top: '8%', right: '3%', opacity: 0.85, pointerEvents: 'none', zIndex: 1 }} className="hero-hide-mobile">
        <DomainWheel size={110} blur={1} />
      </div>

      {/* ── 2. TWO-COLUMN HERO GRID (Spacious, Airy & Perfectly Balanced!) ── */}
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '0 clamp(16px, 3.5vw, 40px)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 'clamp(32px, 5vw, 64px)',
            alignItems: 'center',
          }}
          className="hero-main-grid"
        >
          {/* ═══ LEFT COLUMN: Editorial Content & Badges ═══ */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} className="hero-left-content">
            {/* Headline Area: Extracted HAXLR8 3.0 Official Logotype - Giant & Centerpiece */}
            <div
              className="hero-headline-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              {/* Official Extracted HAXLR8 3.0 Logotype */}
              <div style={{ display: 'flex', flexDirection: 'column' }} className="hero-logo-col">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 180 }}
                  whileHover={{ scale: 1.04 }}
                >
                  <img
                    src={haxlr8LogoDark}
                    alt="HAXLR8 3.0"
                    className="hero-logo-img"
                    style={{
                      height: 'clamp(120px, 18vw, 175px)',
                      width: 'auto',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 10px 30px rgba(255, 59, 105, 0.22))',
                      userSelect: 'none',
                    }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Slogan: IDEAS. IMPOSTERS. INNOVATION. */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="hero-slogan"
              style={{
                fontSize: 'clamp(1.2rem, 2.3vw, 1.6rem)',
                fontWeight: 900,
                color: '#1e293b',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                margin: '8px 0 4px',
              }}
            >
              IDEAS. IMPOSTERS. INNOVATION.
            </motion.div>

            {/* Subhead: A NATIONAL LEVEL 24-HOUR HACKATHON */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="hero-subhead"
              style={{
                fontSize: 'clamp(0.88rem, 1.35vw, 1.1rem)',
                fontWeight: 800,
                color: '#ff3b69',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '14px',
              }}
            >
              A NATIONAL LEVEL 24-HOUR HACKATHON
            </motion.div>

            {/* Organizer Pill: Department of Electronics & Communication Engineering (ECE) - Desktop only to save space on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.5 }}
              className="hero-organizer-badge hero-hide-mobile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(255, 59, 105, 0.08) 100%)',
                border: '1.5px solid rgba(2, 132, 199, 0.25)',
                borderRadius: '100px',
                padding: '6px 18px',
                marginBottom: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              }}
            >
              <span style={{ fontSize: '15px' }}>🎓</span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '0.01em',
                }}
              >
                Organized by{' '}
                <strong style={{ color: '#0284c7' }}>Department of Electronics &amp; Communication Engineering</strong>
              </span>
            </motion.div>

            {/* Event Info Badges (Clean, Compact & High-Impact) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="hero-info-badges"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                marginBottom: '20px',
              }}
            >
              {/* Prize Pool Badge */}
              <div
                className="hero-badge-pill"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '2px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '100px',
                  padding: '7px 16px',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#b45309',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.08)',
                }}
              >
                <Trophy size={15} color="#d97706" strokeWidth={2.5} />
                <span>₹40,000 PRIZE POOL</span>
              </div>

              {/* Date Badge */}
              <div
                className="hero-badge-pill"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid #e2e8f0',
                  borderRadius: '100px',
                  padding: '7px 16px',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#0f172a',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <Calendar size={15} color="#ff3b69" strokeWidth={2.5} />
                <span>FINALE: NOV 6 – 7</span>
              </div>

              {/* Registration Closed Badge */}
              <div
                className="hero-badge-pill"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '100px',
                  padding: '7px 16px',
                  fontSize: '13px',
                  fontWeight: 900,
                  color: '#dc2626',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)',
                }}
              >
                <span>🔒 REGISTRATIONS CLOSED</span>
              </div>
            </motion.div>

            {/* CTA Buttons Row */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="hero-cta-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                marginBottom: '24px',
              }}
            >
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button
                  className="hero-primary-cta"
                  style={{
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '100px',
                    padding: '16px 36px',
                    fontSize: '17px',
                    fontWeight: 900,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(15, 23, 42, 0.35)',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    fontFamily: "'Fredoka', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(15, 23, 42, 0.45)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(15, 23, 42, 0.35)';
                  }}
                >
                  <span>Captain &amp; Crew Login</span>
                  <ArrowRight size={20} strokeWidth={2.6} />
                </button>
              </Link>

              <button
                onClick={handleScrollToAbout}
                className="hero-secondary-cta"
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '2.5px solid #0f172a',
                  borderRadius: '100px',
                  padding: '14px 30px',
                  fontSize: '16px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  fontFamily: "'Fredoka', sans-serif",
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                View Details
              </button>
            </motion.div>

            {/* Scroll Indicator Prompt - Desktop only */}
            <div
              onClick={handleScrollToAbout}
              className="hero-scroll-prompt hero-hide-mobile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: '#64748b',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '28px',
                  border: '2px solid #64748b',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                  paddingTop: '4px',
                }}
              >
                <div
                  style={{
                    width: '3.5px',
                    height: '6px',
                    background: '#ff3b69',
                    borderRadius: '2px',
                    animation: 'mouseScroll 1.5s infinite',
                  }}
                />
              </div>
              <span>SCROLL TO EXPLORE</span>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN: Masterpiece Cliff Illustration ═══ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hero-cliff-col"
            style={{ width: '100%', position: 'relative' }}
          >
            <HeroCliffIllustration />
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes mouseScroll {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(7px); opacity: 0; }
        }

        @media (max-width: 960px) {
          .hero-main-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
            gap: 16px !important;
          }
          .hero-left-content {
            align-items: center !important;
          }
          .hero-hide-mobile {
            display: none !important;
          }
          .hero-cliff-col {
            max-width: 460px !important;
            margin: 0 auto !important;
          }
        }

        @media (max-width: 768px) {
          #hero {
            padding-top: 64px !important;
            padding-bottom: 20px !important;
          }
          .hero-main-grid {
            gap: 8px !important;
          }
          .hero-headline-row {
            align-items: center !important;
            justify-content: center !important;
            margin-bottom: 4px !important;
            width: 100% !important;
          }
          .hero-logo-col {
            align-items: center !important;
            width: 100% !important;
          }
          .hero-logo-img {
            height: clamp(68px, 16vw, 88px) !important;
            max-width: 78vw !important;
          }
          .hero-slogan {
            font-size: 1.05rem !important;
            text-align: center !important;
            margin: 3px 0 1px !important;
            letter-spacing: 0.03em !important;
          }
          .hero-subhead {
            font-size: 0.76rem !important;
            letter-spacing: 0.07em !important;
            text-align: center !important;
            margin-bottom: 8px !important;
          }
          .hero-info-badges {
            justify-content: center !important;
            gap: 6px !important;
            margin-bottom: 12px !important;
            width: 100% !important;
          }
          .hero-badge-pill {
            font-size: 11px !important;
            padding: 5px 12px !important;
            gap: 5px !important;
            border-radius: 20px !important;
          }
          .hero-cta-row {
            justify-content: center !important;
            gap: 10px !important;
            width: 100% !important;
            margin-bottom: 6px !important;
          }
          .hero-primary-cta {
            padding: 10px 22px !important;
            font-size: 14px !important;
          }
          .hero-secondary-cta {
            padding: 9px 20px !important;
            font-size: 13.5px !important;
          }
          .hero-cliff-col {
            max-width: 360px !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </section>
  );
}
