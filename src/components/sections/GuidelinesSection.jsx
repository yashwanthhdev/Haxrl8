import React, { useState, useRef } from 'react';
import { useAuth } from '../../lib/useAuth';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import MagneticButton from '../ui/MagneticButton';
import {
  Clock, UserPlus, FileText, Unlock, Badge,
  Users, Coffee, Building, MapPin, ShieldCheck, Lock
} from 'lucide-react';


import DomainWheel from '../ui/DomainWheel';

const DOMAIN_CARDS = [
  { id: 1, num: '01', title: 'Agriculture', color: '#16a34a', sub: 'Smart Farming & Agritech' },
  { id: 2, num: '02', title: 'Smart City', color: '#0284c7', sub: 'Urban Tech & Connected Infra' },
  { id: 3, num: '03', title: 'Healthcare', color: '#e11d48', sub: 'MedTech & AI Diagnostics' },
  { id: 4, num: '01B', title: 'Agritech', color: '#15803d', sub: 'Precision AI & Drones' },
  { id: 5, num: '02B', title: 'Smart Mobility', color: '#0d9488', sub: 'Intelligent Transit Grids' },
  { id: 6, num: '03B', title: 'Digital Health', color: '#f43f5e', sub: 'Remote Diagnostics' },
];

const DomainArcCard = ({ num, title, color, sub, style }) => (
  <div style={{
    width: '136px',
    height: '136px',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.14)',
    background: color,
    color: '#ffffff',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    userSelect: 'none',
    boxSizing: 'border-box',
    ...style
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: '18px', fontWeight: 900 }}>{num}</span>
      <span style={{ fontSize: '9px', fontWeight: 800, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.06em' }}>DOMAIN</span>
    </div>
    <div>
      <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.2 }}>{title}</div>
      <div style={{ fontSize: '8.5px', opacity: 0.85, marginTop: '2px', fontWeight: 600 }}>{sub}</div>
    </div>
  </div>
);

const ArcGroup = ({ children, containerRef, originX, originY, startAngle = 0, endAngle = 60, yStart = 0, yEnd = -100, style }) => {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 10,
    damping: 0.9,
    mass: 0.3
  });

  const rotate = useTransform(smoothProgress, [0, 1], [startAngle, endAngle]);
  const y = useTransform(smoothProgress, [0, 1], [yStart, yEnd]);

  return (
    <motion.div style={{
      ...style,
      transformOrigin: `${originX} ${originY}`,
      rotate,
      y,
    }}>
      {children}
    </motion.div>
  );
};

const SpinElement = ({ children, containerRef, rotateRange = [0, 90], yRange = [0, -80], style }) => {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 18,
    mass: 0.3
  });

  const rotate = useTransform(smoothProgress, [0, 1], rotateRange);
  const y = useTransform(smoothProgress, [0, 1], yRange);

  return <motion.div style={{ ...style, rotate, y }}>{children}</motion.div>;
};

const guidelinesPart1 = [
  {
    id: '01', title: '24-Hour Hackathon',
    description: 'A thrilling 24-hour coding and prototyping marathon where teams collaborate, innovate, and build live prototypes.',
    icon: Clock
  },
  {
    id: '02', title: 'Registration Closed',
    description: 'Registrations are officially closed as capacity is reached. Registered teams can log in to view their flight manifest.',
    icon: Lock
  },
  {
    id: '03', title: 'Registration Fee & Verification',
    description: 'Registration fee is ₹1,200 per team (3–4 members). Complete payment verification to receive your verified payment receipt.',
    icon: FileText
  },
  {
    id: '04', title: 'UG Students Eligible',
    description: 'Open to all undergraduate students from any recognized college or university.',
    icon: Unlock
  },
  {
    id: '05', title: 'ID Card Mandatory',
    description: 'All participants must carry valid college ID cards for identity verification and registration checks.',
    icon: Badge
  }
];

const guidelinesPart2 = [
  {
    id: '06', title: 'Teams of 3–4 Members',
    description: 'Form a team of 3–4 members. Inter-college teams are completely allowed—team up across colleges!',
    icon: Users
  },
  {
    id: '07', title: 'Food & Hospitality',
    description: 'Food, refreshments, high-speed Wi-Fi, and workspace will be provided throughout the offline hackathon.',
    icon: Coffee
  },
  {
    id: '08', title: 'In-person Finale',
    description: 'HAXLR8 3.0 grand finale is an in-person hackathon held on November 6–7, 2026 at MIT Mysore.',
    icon: Building
  },
  {
    id: '09', title: 'Venue',
    description: 'Maharaja Institute of Technology Mysore awaits—bring your tech solutions to life on campus.',
    icon: MapPin
  },
  {
    id: '10', title: 'Safe and Secure',
    description: 'Hosted by Maharaja Institute of Technology Mysore, ensuring a vibrant, safe, and professional environment.',
    icon: ShieldCheck
  }
];

const GuidelineItem = ({ item, accentColor, glowColor, isLast }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        cursor: "default",
        paddingBottom: "36px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(!isHovered)}
    >
      {/* Timeline track for this item */}
      {!isLast && (
        <div style={{
          position: "absolute",
          top: 38,
          bottom: 0,
          left: 15,
          width: 2,
          background: "#e8e8e8",
          zIndex: 0,
        }} />
      )}

      {/* Timeline Dot */}
      <div style={{
        position: "relative",
        zIndex: 10,
        width: 32,
        flexShrink: 0,
        display: "flex",
        justifyContent: "center",
        paddingTop: 22,
      }}>
        <motion.div
          animate={{ scale: isHovered ? 1.3 : 1 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "white",
            border: `2px solid ${accentColor}`,
            position: "relative",
            boxShadow: isHovered ? `0 0 12px ${glowColor}` : "none",
          }}
        >
          <div style={{
            position: "absolute",
            inset: 2,
            borderRadius: "50%",
            backgroundColor: accentColor,
            opacity: isHovered ? 1 : 0.5,
            transition: "opacity 0.3s",
          }} />
        </motion.div>
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10, flex: 1, paddingLeft: 20 }}>
        <div style={{
          transition: "all 0.3s ease",
          borderRadius: 16,
          padding: "14px 20px",
          backgroundColor: isHovered ? "rgba(15, 23, 42, 0.85)" : "transparent",
          boxShadow: isHovered ? `0 10px 40px -10px rgba(0,0,0,0.5), 0 0 20px ${glowColor}` : "none",
          border: isHovered ? `1px solid ${accentColor}` : "1px solid transparent",
          transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              fontFamily: "monospace",
              fontSize: "0.85rem",
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: accentColor,
              flexShrink: 0,
            }}>
              {item.id}
            </span>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "1.25rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#f8fafc",
              margin: 0,
              flex: 1,
            }}>
              {item.title}
            </h3>
            <div style={{
              opacity: isHovered ? 1 : 0.4,
              transition: "opacity 0.3s",
              flexShrink: 0,
            }}>
              <Icon size={20} style={{ color: accentColor }} />
            </div>
          </div>

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: isHovered ? "auto" : 0, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <p style={{
              fontSize: "0.95rem",
              lineHeight: 1.65,
              color: "#94a3b8",
              margin: "10px 0 0 0",
            }}>
              {item.description}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default function GuidelinesSection() {
  const sectionRef = useRef(null);
  const user = useAuth();
  return (
    <section ref={sectionRef} id="finalists" style={{
      position: "relative",
      padding: "100px 0 100px",
      backgroundColor: "#070a13",
      overflow: "hidden",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Fine grid (matches TimelineSection) */}
      <svg aria-hidden style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        opacity: 0.04, pointerEvents: "none",
      }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={`v${i}`} x1={`${(i+1)*7.14}%`} y1="0" x2={`${(i+1)*7.14}%`} y2="100%" stroke="#38fedc" strokeWidth="1"/>
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${(i+1)*10}%`} x2="100%" y2={`${(i+1)*10}%`} stroke="#38fedc" strokeWidth="1"/>
        ))}
      </svg>

      {/* Floating Parallax SDG Cards — Half-circle arcs that rotate as a group */}
      <div className="hidden lg:block" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        
        {/* ── LEFT ARC: Entire group rotates ~quarter turn clockwise ── */}
        <ArcGroup
          containerRef={sectionRef}
          originX="-200px"
          originY="50%"
          startAngle={-15}
          endAngle={75}
          yStart={40}
          yEnd={-60}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '300px',
            height: '100%',
            opacity: 0.35,
          }}
        >
          {/* Cards positioned along the arc relative to the group */}
          {[
            { item: DOMAIN_CARDS[0], angle: -70 },
            { item: DOMAIN_CARDS[1], angle: -40 },
            { item: DOMAIN_CARDS[2], angle: -10 },
            { item: DOMAIN_CARDS[3], angle:  20 },
            { item: DOMAIN_CARDS[4], angle:  50 },
            { item: DOMAIN_CARDS[5], angle:  80 },
          ].map(({ item, angle }) => {
            const rad = (angle * Math.PI) / 180;
            const radius = 350;
            const cx = -160;
            const cy = 50;
            const x = cx + radius * Math.cos(rad);
            const yPct = cy + (radius * Math.sin(rad)) / 10;
            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${yPct}%`,
                  transform: `rotate(${angle + 90}deg)`,
                }}
              >
                <DomainArcCard num={item.num} title={item.title} color={item.color} sub={item.sub} />
              </div>
            );
          })}
        </ArcGroup>

        {/* ── RIGHT ARC: Entire group rotates ~quarter turn counter-clockwise ── */}
        <ArcGroup
          containerRef={sectionRef}
          originX="calc(100% + 200px)"
          originY="80%"
          startAngle={15}
          endAngle={-75}
          yStart={30}
          yEnd={-50}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '100%',
            opacity: 0.35,
          }}
        >
          {[
            { item: DOMAIN_CARDS[0], angle: 150 },
            { item: DOMAIN_CARDS[1], angle: 180 },
            { item: DOMAIN_CARDS[2], angle: 210 },
          ].map(({ item, angle }) => {
            const rad = (angle * Math.PI) / 180;
            const radius = 280;
            const cx = 350;
            const cy = 65;
            const x = cx + radius * Math.cos(rad);
            const yPct = cy + (radius * Math.sin(rad)) / 10;
            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${yPct}%`,
                  transform: `rotate(${angle + 90}deg)`,
                }}
              >
                <DomainArcCard num={item.num} title={item.title} color={item.color} sub={item.sub} />
              </div>
            );
          })}
        </ArcGroup>

        {/* Domain Wheel — Top Right */}
        <SpinElement
          containerRef={sectionRef}
          rotateRange={[0, -90]}
          yRange={[0, 40]}
          style={{
            position: 'absolute',
            top: '8%',
            right: '8%',
            opacity: 0.25,
          }}
        >
          <DomainWheel size={120} blur={2} />
        </SpinElement>

        {/* Domain Wheel — spins independently at bottom-right */}
        <SpinElement
          containerRef={sectionRef}
          rotateRange={[0, 120]}
          yRange={[0, -60]}
          style={{
            position: 'absolute',
            bottom: '-4%',
            right: '-3%',
            opacity: 0.35,
          }}
        >
          <DomainWheel size={220} blur={4} />
        </SpinElement>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2.5rem", position: "relative", zIndex: 1 }}>
        
        {/* Header Block */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 64, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 28, height: 2, background: "#38fedc", boxShadow: "0 0 10px rgba(56,254,220,0.8)" }} />
            <p style={{
              fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.22em",
              color: "#38fedc", textTransform: "uppercase", margin: 0,
            }}>STATION PROTOCOLS &amp; GUIDELINES</p>
            <div style={{ width: 28, height: 2, background: "#38fedc", boxShadow: "0 0 10px rgba(56,254,220,0.8)" }} />
          </div>
          
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 900,
            lineHeight: 1.05, letterSpacing: "-0.04em", color: "#f8fafc", margin: 0,
          }}>
            Before You Begin. <br className="hidden md:block" />
            <span style={{ color: "#94a3b8" }}>Flight rules and mission criteria.</span>
          </h2>

          {/* Solution Architecture Directive Banner */}
          <div style={{
            marginTop: "28px",
            padding: "16px 24px",
            background: "rgba(15, 23, 42, 0.8)",
            border: "1.5px solid rgba(56, 254, 220, 0.3)",
            borderRadius: "16px",
            textAlign: "center",
            maxWidth: "840px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
          }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#38fedc", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>
              💡 Core or Software Freedom • Hardware is Optional
            </div>
            <p style={{ fontSize: "0.92rem", color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
              Hardware is <strong style={{ color: "#ffffff" }}>never compulsory</strong>. You have complete freedom to choose an authentic real-world problem and engineer an impactful solution—whether at the <strong style={{ color: "#ffffff" }}>core engineering level</strong> (system architectures, protocols, simulation) or <strong style={{ color: "#ffffff" }}>software level</strong> (AI/ML models, cloud platforms, web/mobile apps). Focus on solving the problem uniquely!
            </p>
          </div>
        </motion.div>

        {/* Two Columns */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
          gap: "40px md:gap-[80px]", 
          marginTop: "60px" 
        }} className="md:grid-cols-2">
          
          {/* Column 1 - Part 1 */}
          <div>
            <div style={{ marginBottom: "24px", paddingLeft: "16px" }}>
              <span style={{
                fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.15em",
                color: "#38fedc", textTransform: "uppercase", fontFamily: "monospace"
              }}>
                ✦ Sector 1 // Flight Essentials
              </span>
            </div>
            
            <div className="flex flex-col">
              {guidelinesPart1.map((item, index) => (
                <GuidelineItem 
                  key={item.id} 
                  item={item} 
                  accentColor="#38fedc"
                  glowColor="rgba(56, 254, 220, 0.4)"
                  isLast={index === guidelinesPart1.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Column 2 - Part 2 */}
          <div className="mt-8 md:mt-0">
            <div style={{ marginBottom: "24px", paddingLeft: "16px" }}>
              <span style={{
                fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.15em",
                color: "#00d0ff", textTransform: "uppercase", fontFamily: "monospace"
              }}>
                ✦ Sector 2 // Docking &amp; Logistics
              </span>
            </div>
            
            <div className="flex flex-col">
              {guidelinesPart2.map((item, index) => (
                <GuidelineItem 
                  key={item.id} 
                  item={item} 
                  accentColor="#00d0ff"
                  glowColor="rgba(0, 208, 255, 0.4)"
                  isLast={index === guidelinesPart2.length - 1}
                />
              ))}
            </div>
          </div>

        </div>

        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          style={{
            marginTop: 60,
            padding: '32px 36px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1.5px solid rgba(56, 254, 220, 0.25)',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div aria-hidden style={{
            position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(56,254,220,0.5), transparent)',
          }} />
          <div>
            <p style={{
              fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.2em',
              color: '#ef4444', textTransform: 'uppercase', margin: '0 0 8px',
            }}>REGISTRATIONS OFFICIALLY CLOSED</p>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(1rem,2vw,1.2rem)', fontWeight: 800,
              color: '#f8fafc', margin: 0, lineHeight: 1.3,
            }}>
              All squad spots are filled. Registered teams can log into their dashboard.
            </p>
          </div>
          
          <a
            href="/login"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "14px 28px",
              background: "linear-gradient(135deg, #38fedc 0%, #2dd4bf 100%)", color: "#070a13",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: "0.88rem",
              letterSpacing: "-0.01em", borderRadius: 12,
              textDecoration: "none", flexShrink: 0,
              boxShadow: "0 8px 25px rgba(56,254,220,0.35)",
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 35px rgba(56,254,220,0.5)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(56,254,220,0.35)";
            }}
          >
            CAPTAIN &amp; CREW LOGIN →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
