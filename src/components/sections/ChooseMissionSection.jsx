import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import agricultureImg from '../../assets/domain_agriculture.jpg';
import smartCityImg from '../../assets/domain_smart_city_clean.jpg';
import healthcareImg from '../../assets/domain_healthcare.png';
import { ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';

const DOMAIN_CARDS = [
  {
    id: 'agriculture',
    missionNum: 'MISSION 01',
    title: 'AGRICULTURE',
    tagline: 'Technology for smarter, sustainable and efficient farming.',
    color: '#22c55e',
    borderColor: 'rgba(34, 197, 94, 0.45)',
    glowColor: 'rgba(34, 197, 94, 0.25)',
    img: agricultureImg,
    badgeBg: 'rgba(34, 197, 94, 0.15)',
    details: {
      overview: 'Focuses on deploying cutting-edge algorithms, computer vision, AI, and smart systems to revolutionize modern agrarian systems and food supply chains.',
      idealOutput: 'Core-level algorithms, AI vision models, intelligent web/mobile platforms, or smart telemetry systems solving real-world agrarian challenges.',
    },
  },
  {
    id: 'smart-city',
    missionNum: 'MISSION 02',
    title: 'SMART CITY',
    tagline: 'Innovative solutions for safer, smarter and more connected cities.',
    color: '#0284c7',
    borderColor: 'rgba(2, 132, 199, 0.45)',
    glowColor: 'rgba(2, 132, 199, 0.25)',
    img: smartCityImg,
    badgeBg: 'rgba(2, 132, 199, 0.15)',
    details: {
      overview: 'Tackle pressing urban challenges by engineering resilient, connected, and energy-efficient municipal and transit systems for the next decade.',
      idealOutput: 'Core system architectures, spatial data intelligence dashboards, urban mobility algorithms, or scalable cloud platforms optimizing municipal infrastructure.',
    },
  },
  {
    id: 'healthcare',
    missionNum: 'MISSION 03',
    title: 'HEALTHCARE',
    tagline: 'Ideas that care. Innovation for healthier and more inclusive tomorrows.',
    color: '#ef4444',
    borderColor: 'rgba(239, 68, 68, 0.45)',
    glowColor: 'rgba(239, 68, 68, 0.25)',
    img: healthcareImg,
    badgeBg: 'rgba(239, 68, 68, 0.15)',
    details: {
      overview: 'Develop life-saving healthcare tools that expand accessibility, enhance diagnostic precision, and democratize clinical support for all communities.',
      idealOutput: 'Clinically grounded software tools, predictive health AI models, triage decision-support engines, or intelligent diagnostic platforms.',
    },
  },
];

export default function ChooseMissionSection() {
  const [selectedDomain, setSelectedDomain] = useState(null);

  return (
    <section
      id="domains"
      style={{
        position: 'relative',
        width: '100%',
        padding: '100px 24px 120px',
        backgroundColor: '#070a13',
        overflow: 'hidden',
      }}
    >
      {/* Background Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(to right, rgba(56, 254, 220, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 254, 220, 0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              margin: '0 0 12px 0',
              textTransform: 'uppercase',
            }}
          >
            CHOOSE YOUR <span style={{ color: '#ef4444' }}>MISSION</span>
          </h2>
          <p
            style={{
              fontSize: 'clamp(0.85rem, 1.6vw, 1.15rem)',
              fontWeight: 800,
              color: '#94a3b8',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            THREE DOMAINS. ENDLESS POSSIBILITIES.
          </p>
        </div>

        {/* 3 Domain Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
          }}
          className="domains-cards-grid"
        >
          {DOMAIN_CARDS.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              whileHover={{ y: -8 }}
              style={{
                borderRadius: '24px',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1.5px solid ${card.borderColor}`,
                boxShadow: `0 20px 45px rgba(0, 0, 0, 0.7), 0 0 25px ${card.glowColor}`,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Card Image Banner */}
              <div
                style={{
                  width: '100%',
                  height: '240px',
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#0a0f1d',
                }}
              >
                <img
                  src={card.img}
                  alt={card.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                  }}
                  className="domain-card-img"
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, transparent 60%)',
                  }}
                />
              </div>

              {/* Card Body */}
              <div
                style={{
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Mission Badge */}
                  <div
                    style={{
                      display: 'inline-block',
                      fontSize: '11px',
                      fontWeight: 900,
                      letterSpacing: '0.12em',
                      color: card.color,
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    {card.missionNum}
                  </div>

                  {/* Domain Title */}
                  <h3
                    style={{
                      fontSize: '24px',
                      fontWeight: 900,
                      color: '#ffffff',
                      letterSpacing: '0.02em',
                      margin: '0 0 12px 0',
                    }}
                  >
                    {card.title}
                  </h3>

                  {/* Tagline */}
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#94a3b8',
                      lineHeight: 1.6,
                      margin: '0 0 24px 0',
                    }}
                  >
                    {card.tagline}
                  </p>
                </div>

                {/* Explore Domain Button */}
                <button
                  onClick={() => setSelectedDomain(card)}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: '100px',
                    background: 'rgba(7, 10, 19, 0.85)',
                    border: `1.5px solid ${card.color}`,
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: `0 4px 15px ${card.glowColor}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = card.color;
                    e.currentTarget.style.color = '#070a13';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(7, 10, 19, 0.85)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                >
                  <span>EXPLORE DOMAIN</span>
                  <ArrowRight size={15} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Domain Details Modal */}
      <AnimatePresence>
        {selectedDomain && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDomain(null)}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
              }}
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'relative',
                background: 'rgba(15, 23, 42, 0.96)',
                backdropFilter: 'blur(24px)',
                border: `2px solid ${selectedDomain.borderColor}`,
                borderRadius: '24px',
                padding: '36px',
                maxWidth: '620px',
                width: '100%',
                boxShadow: `0 25px 60px rgba(0,0,0,0.8), 0 0 35px ${selectedDomain.glowColor}`,
                color: '#f8fafc',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDomain(null)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 900, color: selectedDomain.color, letterSpacing: '0.12em' }}>
                  {selectedDomain.missionNum}
                </span>
              </div>

              <h3 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 16px 0', color: '#ffffff' }}>
                {selectedDomain.title}
              </h3>

              <p style={{ fontSize: '14.5px', color: '#cbd5e1', lineHeight: 1.7, marginBottom: '24px' }}>
                {selectedDomain.details.overview}
              </p>

              <div style={{
                background: 'rgba(234, 88, 12, 0.12)',
                border: '1.5px solid rgba(234, 88, 12, 0.35)',
                borderRadius: '14px',
                padding: '16px 20px',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  📢 Problem Statements Reveal on November 2nd
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
                  There are no sub-tracks for students—only the core domain is selected. The official problem statements for <strong>{selectedDomain.title}</strong> will be revealed on <strong>November 2, 2026</strong>.
                </div>
              </div>

              <div style={{
                background: 'rgba(2, 132, 199, 0.12)',
                border: '1.5px solid rgba(56, 189, 248, 0.35)',
                borderRadius: '14px',
                padding: '16px 20px',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  💡 Core or Software Solution Freedom (Hardware is Optional)
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
                  Hardware is <strong>never compulsory</strong>. Choose the right real-world problem and deliver the right solution—whether engineered at the <strong>core engineering level</strong> (embedded logic, system protocols, algorithmic models, simulations) or <strong>software level</strong> (full-stack web/mobile apps, AI/ML models, computer vision, cloud pipelines). Originality and technical impact are what matter most!
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#38fedc', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                  Expected Prototype Output:
                </span>
                <span style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.5 }}>
                  {selectedDomain.details.idealOutput}
                </span>
              </div>

              <a
                href="/login"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '14px',
                  textDecoration: 'none',
                  boxShadow: '0 0 20px rgba(15, 23, 42, 0.3)',
                }}
              >
                <span>CAPTAIN &amp; CREW LOGIN (REGISTRATIONS CLOSED) →</span>
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 960px) {
          .domains-cards-grid {
            grid-template-columns: 1fr !important;
            max-width: 440px !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </section>
  );
}
