import React, { useState, useEffect } from 'react';
import copyflagImg from '../../assets/skewcards/copyflag.png';
import revoraImg from '../../assets/skewcards/revorahealth.png';
import SpoilSafeImg from '../../assets/skewcards/SpoilSafe.png';

const cards = [
  {
    title: 'Hydroponics (Agriculture)',
    desc: 'Power life support, smart farming, and food supply chains with AI and IoT. Build smart crop health monitoring, yield prediction, precision irrigation, and real-time sensor networks to prevent spoilage.',
    gradientFrom: '#4dff03',
    gradientTo: '#00d0ff',
    img: SpoilSafeImg,
  },
  {
    title: 'Navigation (Smart City)',
    desc: 'Engineer solutions for starship and urban grids. Tackle challenges in intelligent traffic routing, automated waste management, energy-efficient public infrastructure, and decentralized civic services.',
    gradientFrom: '#ffbc00',
    gradientTo: '#ff0058',
    img: copyflagImg,
  },
  {
    title: 'MedBay (Healthcare)',
    desc: 'Transform patient care with predictive analytics, computer vision, and IoT telemetry. Build low-cost diagnostic screening, rural clinical assistance tools, telemedicine networks, and rehabilitation support.',
    gradientFrom: '#03a9f4',
    gradientTo: '#ff0058',
    img: revoraImg,
  },
];

function SkewCard({ title, desc, gradientFrom, gradientTo, img, forceActive }) {
  const [hovered, setHovered] = useState(false);
  const active = hovered || forceActive;

  return (
    <div
      style={{ position: 'relative', width: '340px', height: '520px', transition: 'all 0.5s', display: 'flex', flexShrink: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Skewed gradient solid panel */}
      <span
        style={{
          position: 'absolute',
          top: 0,
          height: '100%',
          borderRadius: '12px',
          background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
          transform: active ? 'skewX(0deg)' : 'skewX(15deg)',
          left: active ? '20px' : '50px',
          width: active ? 'calc(100% - 40px)' : '55%',
          transition: 'all 0.5s ease',
        }}
      />
      {/* Blurred glow panel */}
      <span
        style={{
          position: 'absolute',
          top: 0,
          height: '100%',
          borderRadius: '12px',
          background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
          transform: active ? 'skewX(0deg)' : 'skewX(15deg)',
          left: active ? '20px' : '50px',
          width: active ? 'calc(100% - 40px)' : '55%',
          transition: 'all 0.5s ease',
          filter: 'blur(30px)',
          opacity: 0.8,
        }}
      />

      {/* Glass content card */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          left: active ? '-15px' : '0px',
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: active ? '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(56,254,220,0.2)' : '0 12px 36px rgba(0,0,0,0.5)',
          borderRadius: '16px',
          color: '#f8fafc',
          transition: 'all 0.5s ease',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: `1.5px solid ${active ? 'rgba(56, 254, 220, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
          overflow: 'hidden',
          width: '100%',
        }}
      >
        {/* Image — grayscale → color on hover */}
        <div style={{ width: '100%', height: '160px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
          <img
            src={img}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: active ? 'grayscale(0%)' : 'grayscale(100%)',
              transition: 'filter 0.5s ease',
            }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, transparent 60%)' }} />
        </div>

        {/* Text */}
        <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 13, animation: 'pulse 1.5s infinite' }}>🛸</span>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#38fedc', letterSpacing: '0.12em', textTransform: 'uppercase' }}>SECTOR ONLINE</span>
          </div>
          <h3 style={{ marginBottom: '12px', fontSize: '20px', fontWeight: 800, letterSpacing: '0.01em', color: '#f8fafc' }}>{title}</h3>
          <p style={{ fontSize: '13px', lineHeight: 1.75, fontWeight: 400, color: '#94a3b8' }}>{desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function SkewCards() {
  const [activeIdx, setActiveIdx] = useState(0);

  // Auto-advance every 4 seconds on mobile
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % cards.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div style={{ background: '#070a13', padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>

        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
          backgroundImage: 'linear-gradient(to right, #38fedc 1px, transparent 1px), linear-gradient(to bottom, #38fedc 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '740px', margin: '0 auto 64px auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(56,254,220,0.1)', border: '1px solid rgba(56,254,220,0.3)', padding: '5px 16px', borderRadius: 100, marginBottom: 16 }}>
            <span style={{ fontSize: 13 }}>🛰️</span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#38fedc', letterSpacing: '0.15em', textTransform: 'uppercase' }}>SECTOR DESIGNATION · SKELD SHIPBOARD MODULES</span>
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#f8fafc', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '20px' }}>
            Three Shipboard Innovation Sectors
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.75, fontWeight: 400 }}>
            Choose your sector across <span style={{ color: '#50ef39', fontWeight: 700 }}>Hydroponics</span>, <span style={{ color: '#facc15', fontWeight: 700 }}>Navigation</span>, or <span style={{ color: '#38fedc', fontWeight: 700 }}>MedBay</span>. Assemble your 3–4 member crew and compete for the ₹40,000 bounty at Maharaja Institute of Technology Mysore.
          </p>
        </div>

        {/* ── Desktop: all 3 side by side ── */}
        <div className="skewcards-desktop" style={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch', flexWrap: 'wrap', gap: '80px', position: 'relative', zIndex: 1 }}>
          {cards.map((card, idx) => (
            <SkewCard key={idx} {...card} />
          ))}
        </div>

        {/* ── Mobile: carousel one at a time ── */}
        <div className="skewcards-mobile" style={{ display: 'none', flexDirection: 'column', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 1 }}>
          {/* Single card display */}
          <div style={{ width: '100%', maxWidth: '340px', overflow: 'hidden' }}>
            <div
              style={{
                display: 'flex',
                width: `${cards.length * 340}px`,
                transform: `translateX(-${activeIdx * 340}px)`,
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {cards.map((card, idx) => (
                <SkewCard key={idx} {...card} forceActive={idx === activeIdx} />
              ))}
            </div>
          </div>

          {/* Dot indicators */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {cards.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                style={{
                  width: idx === activeIdx ? '28px' : '10px',
                  height: '10px',
                  borderRadius: '100px',
                  background: idx === activeIdx ? '#38fedc' : 'rgba(255,255,255,0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.3s ease',
                  boxShadow: idx === activeIdx ? '0 0 10px rgba(56,254,220,0.8)' : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: 'center', marginTop: '64px', position: 'relative', zIndex: 1 }}>
          <a
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #38fedc 0%, #2dd4bf 100%)',
              color: '#070a13',
              padding: '14px 36px',
              borderRadius: '100px',
              fontWeight: 800,
              fontSize: '0.9rem',
              letterSpacing: '0.04em',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 8px 25px rgba(56,254,220,0.35)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 35px rgba(56,254,220,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(56,254,220,0.35)'; }}
          >
            CAPTAIN &amp; CREW LOGIN (REGISTRATIONS CLOSED) →
          </a>
        </div>

      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translateY(10px); }
          50% { transform: translate(-10px); }
        }
        .animate-blob { animation: blob 2s ease-in-out infinite; }
        .animation-delay-1000 { animation-delay: -1s; }

        /* Mobile: show carousel, hide desktop grid */
        @media (max-width: 768px) {
          .skewcards-desktop { display: none !important; }
          .skewcards-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}
