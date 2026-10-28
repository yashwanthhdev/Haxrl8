import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, HeartPulse, Building2, ArrowRight, X, Calendar, Lock, Sparkles } from 'lucide-react';

const DOMAINS = [
  {
    id: 'agriculture',
    title: 'Agriculture',
    subtitle: 'Smart Farming & AgriTech',
    desc: 'Deploy AI vision, smart irrigation algorithms, and crop intelligence platforms to revolutionize modern sustainable farming.',
    bg: '#f0fdf4', // Pastel Emerald
    border: '#86efac',
    textCol: '#15803d',
    icon: Sprout,
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    subtitle: 'MedTech & AI Diagnostics',
    desc: 'Engineer transformative health tools, clinical predictive AI, assistive platforms, and patient triage decision engines.',
    bg: '#fff1f2', // Pastel Crimson / Rose
    border: '#fecdd3',
    textCol: '#e11d48',
    icon: HeartPulse,
    slotsFull: true,
  },
  {
    id: 'smart-city',
    title: 'Smart City',
    subtitle: 'Urban Mobility & IoT Infrastructure',
    desc: 'Architect resilient urban tech, intelligent mobility coordination, dynamic energy balancing, and civic software infrastructure.',
    bg: '#e0f2fe', // Pastel Tech Sky
    border: '#7dd3fc',
    textCol: '#0284c7',
    icon: Building2,
    slotsBadge: '1 Slot Left 🔥',
  },
];

export default function PlayfulDomainsSection() {
  const [selectedDomain, setSelectedDomain] = useState(null);

  return (
    <section
      id="domains"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#fffaf3',
        padding: '70px 24px 90px',
        fontFamily: "'Fredoka', 'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
        {/* Top Header + Doodle Annotation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '48px',
          }}
        >
          {/* Left: Titles */}
          <div>
            <h2
              style={{
                fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
                fontWeight: 900,
                color: '#0f172a',
                lineHeight: 1.05,
                margin: '0 0 10px 0',
                letterSpacing: '-0.02em',
              }}
            >
              HACKATHON DOMAINS
            </h2>
            <p
              style={{
                fontSize: 'clamp(0.95rem, 1.8vw, 1.25rem)',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              THREE DOMAINS. <span style={{ color: '#ea580c' }}>ENDLESS POSSIBILITIES.</span>
            </p>
          </div>

          {/* Right: Handwritten Doodle: EXPLORE BUILD SOLVE CREATE */}
          <div
            style={{
              fontFamily: "'Patrick Hand', cursive",
              color: '#0f172a',
              fontSize: '20px',
              fontWeight: 700,
              lineHeight: 1.15,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transform: 'rotate(-4deg)',
            }}
          >
            <div>
              EXPLORE<br />BUILD<br />SOLVE<br />CREATE
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#f59e0b">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </div>
        </div>

        {/* 3 Colorful Rounded Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}
          className="playful-domains-grid"
        >
          {DOMAINS.map((domain, idx) => {
            const IconComponent = domain.icon;
            return (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                whileHover={{ y: -8, scale: 1.03 }}
                onClick={() => setSelectedDomain(domain)}
                style={{
                  background: domain.bg,
                  border: `2px solid ${domain.border}`,
                  borderRadius: '26px',
                  padding: '30px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.25s ease',
                  minHeight: '260px',
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
              >
                {/* Slots Full Badge */}
                {domain.slotsFull && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      background: '#fee2e2',
                      color: '#b91c1c',
                      border: '1px solid #fecaca',
                      padding: '3px 8px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Slots Full
                  </div>
                )}

                {/* 1 Slot Left Badge */}
                {domain.slotsBadge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      background: '#fffbeb',
                      color: '#b45309',
                      border: '1px solid #fde68a',
                      padding: '3px 8px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {domain.slotsBadge}
                  </div>
                )}

                {/* Domain Icon */}
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: domain.textCol,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    marginBottom: '16px',
                  }}
                >
                  <IconComponent size={30} strokeWidth={2.4} />
                </div>

                {/* Title & Desc */}
                <div>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: '#0f172a',
                      marginBottom: '8px',
                    }}
                  >
                    {domain.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#475569',
                      lineHeight: 1.5,
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    {domain.desc}
                  </p>
                </div>

                {/* Explore Pill Link */}
                <div
                  style={{
                    marginTop: '16px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    color: domain.textCol,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Explore Domain</span>
                  <ArrowRight size={14} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Global Directive Notice: No tracks, Problem Statements unlock Nov 2nd */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          style={{
            marginTop: '36px',
            background: '#ffffff',
            border: '2px dashed #fed7aa',
            borderRadius: '20px',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            textAlign: 'center',
            flexWrap: 'wrap',
            boxShadow: '0 4px 14px rgba(234, 88, 12, 0.05)',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#fff7ed',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Calendar size={18} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>
            <strong style={{ color: '#0f172a' }}>Zero Sub-Tracks Policy:</strong> You only choose from the 3 core innovation domains. Official Problem Statements will be revealed on <span style={{ color: '#ea580c', fontWeight: 900 }}>November 2nd, 2026</span>.
          </span>
        </motion.div>
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
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(8px)',
              }}
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                position: 'relative',
                background: '#ffffff',
                border: `3px solid ${selectedDomain.border}`,
                borderRadius: '32px',
                padding: '36px',
                maxWidth: '560px',
                width: '100%',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
                color: '#0f172a',
                zIndex: 10,
              }}
            >
              <button
                onClick={() => setSelectedDomain(null)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(0, 0, 0, 0.05)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '18px',
                    background: selectedDomain.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: selectedDomain.textCol,
                  }}
                >
                  {React.createElement(selectedDomain.icon, { size: 28, strokeWidth: 2.4 })}
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 900, color: selectedDomain.textCol, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
                    HAXLR8 3.0 DOMAIN
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: '#0f172a' }}>
                    {selectedDomain.title}
                  </h3>
                </div>
              </div>

              <p style={{ margin: '0 0 24px 0', fontSize: '14.5px', color: '#475569', fontWeight: 500, lineHeight: 1.6 }}>
                {selectedDomain.desc}
              </p>

              {/* Slots Full Notice */}
              {selectedDomain.slotsFull && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1.5px solid #fecaca',
                    borderRadius: '16px',
                    padding: '14px 18px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>⚠️</span>
                  <div style={{ fontSize: '13px', color: '#991b1b', lineHeight: 1.5 }}>
                    <strong>Healthcare Domain Slots are Full:</strong> Registration capacity for the Healthcare track has been reached. Newly registering squads must select either <strong>Agriculture</strong> or <strong>Smart City</strong>.
                  </div>
                </div>
              )}

              {/* Limited Slot Notice */}
              {selectedDomain.slotsBadge && (
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1.5px solid #fde68a',
                    borderRadius: '16px',
                    padding: '14px 18px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>🔥</span>
                  <div style={{ fontSize: '13px', color: '#92400e', lineHeight: 1.5 }}>
                    <strong>Final Slot Open:</strong> Only <strong>1 team slot</strong> is currently open for the Smart City domain. Register your team right away before this final spot is claimed!
                  </div>
                </div>
              )}

              {/* Core or Software Freedom Highlight */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: '20px',
                  padding: '18px 20px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: '12.5px', fontWeight: 900, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  💡 Core or Software Freedom • Hardware is Optional
                </div>
                <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                  Hardware is <strong>never compulsory</strong>. Teams have complete freedom to choose an authentic problem and craft an impactful solution—whether at the <strong>core engineering level</strong> (system architectures, protocols, simulation) or <strong>software level</strong> (AI/ML models, cloud platforms, web/mobile apps). What matters is bringing an authentic, unique, and well-engineered solution.
                </p>
              </div>

              {/* Problem Statements Reveal Block */}
              <div
                style={{
                  background: '#fff7ed',
                  border: '2px dashed #fb923c',
                  borderRadius: '22px',
                  padding: '24px 20px',
                  marginBottom: '26px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    background: '#ffedd5',
                    color: '#ea580c',
                    padding: '5px 14px',
                    borderRadius: '100px',
                    fontSize: '11px',
                    fontWeight: 900,
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  <Calendar size={13} strokeWidth={2.5} />
                  <span>SCHEDULE DIRECTIVE</span>
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>
                  Problem Statements Reveal on November 2nd
                </h4>
                <p style={{ fontSize: '13.5px', color: '#475569', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                  There are no tracks for students in this hackathon—only the domain is selected. The official problem statements and challenges for <strong>{selectedDomain.title}</strong> will be revealed on <strong>November 2, 2026</strong>.
                </p>
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
                  borderRadius: '100px',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '15px',
                  textDecoration: 'none',
                  boxShadow: '0 6px 20px rgba(15, 23, 42, 0.25)',
                }}
              >
                <span>CAPTAIN &amp; CREW LOGIN (CLOSED) →</span>
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 960px) {
          .playful-domains-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
            gap: 18px !important;
          }
        }

        @media (max-width: 680px) {
          .playful-domains-grid {
            grid-template-columns: 1fr !important;
            max-width: 420px !important;
            margin: 0 auto !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </section>
  );
}
