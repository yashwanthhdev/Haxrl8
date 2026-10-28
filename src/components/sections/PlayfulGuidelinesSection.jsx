import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock, UserPlus, FileText, GraduationCap,
  Users, Utensils, Building2, MapPin, ShieldCheck,
  CheckCircle2, Sparkles, AlertCircle, Lock
} from 'lucide-react';
import AmongUsCrewmate from '../amongus/AmongUsCrewmate';

const guidelinesPart1 = [
  {
    num: '01',
    title: '24-Hour Marathon',
    description: 'A thrilling 24-hour non-stop prototyping sprint where teams collaborate, code, and deploy live functional prototypes.',
    icon: Clock,
    badge: 'NON-STOP',
    bg: '#fef2f2',
    border: '#fecaca',
    accent: '#ef4444',
  },
  {
    num: '02',
    title: 'Registration Closed',
    description: 'Registrations are officially closed as all squad slots are filled. Registered team leaders and crewmates can log into their dashboard.',
    icon: Lock,
    badge: 'CLOSED',
    bg: '#fff1f2',
    border: '#fecdd3',
    accent: '#e11d48',
  },
  {
    num: '03',
    title: 'Team Fee & Receipt',
    description: 'Registration fee is ₹1,200 per team (3–4 members). Complete payment details in the dashboard to unlock your verified registration receipt.',
    icon: FileText,
    badge: '₹1,200 / TEAM',
    bg: '#fdf4ff',
    border: '#f5d0fe',
    accent: '#d946ef',
  },
  {
    num: '04',
    title: 'UG Students Eligible',
    description: 'Open to all undergraduate students from any recognized college or university across India. All tech branches welcome.',
    icon: GraduationCap,
    badge: 'ALL MAJORS',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    accent: '#22c55e',
  },
  {
    num: '05',
    title: 'College ID Mandatory',
    description: 'All participants must carry their original college identity cards for verification at the campus security checkpoint.',
    icon: AlertCircle,
    badge: 'VERIFICATION',
    bg: '#fffbeb',
    border: '#fde68a',
    accent: '#f59e0b',
  },
];

const guidelinesPart2 = [
  {
    num: '06',
    title: 'Squad Size: 3–4 Members',
    description: 'Teams must have 3 to 4 members. Inter-college squads are fully allowed and celebrated—build your dream crew!',
    icon: Users,
    badge: 'INTER-COLLEGE OK',
    bg: '#f0fdfa',
    border: '#99f6e4',
    accent: '#14b8a6',
  },
  {
    num: '07',
    title: 'Food & Refreshments',
    description: 'Nutritious meals, midnight snacks, tea/coffee, high-speed Wi-Fi, and workstations are fully provided on campus.',
    icon: Utensils,
    badge: 'PROVIDED',
    bg: '#fdf2f8',
    border: '#fbcfe8',
    accent: '#ec4899',
  },
  {
    num: '08',
    title: 'Offline Grand Finale',
    description: 'The finale is hosted offline on November 6–7, 2026. Teams build live on campus and demo directly before industry jury.',
    icon: Building2,
    badge: 'NOV 6–7, 2026',
    bg: '#ede9fe',
    border: '#ddd6fe',
    accent: '#8b5cf6',
  },
  {
    num: '09',
    title: 'Campus Venue',
    description: 'Maharaja Institute of Technology Mysore, Belawadi, Mandya/Mysuru. Easily accessible via train and highway bus routes.',
    icon: MapPin,
    badge: 'MIT MYSORE',
    bg: '#f8fafc',
    border: '#e2e8f0',
    accent: '#64748b',
  },
  {
    num: '10',
    title: 'Fair Play & Safe Space',
    description: 'Zero tolerance for plagiarized code. Enjoy a supportive, high-energy environment guided by faculty and student mentors.',
    icon: ShieldCheck,
    badge: 'ZERO IMPOSTORS',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    accent: '#10b981',
  },
];

export default function PlayfulGuidelinesSection() {
  return (
    <section
      id="guidelines"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#fffaf3',
        padding: '80px 24px 100px',
        fontFamily: "'Fredoka', 'Plus Jakarta Sans', sans-serif",
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header Block */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#fed7aa',
              color: '#c2410c',
              padding: '8px 20px',
              borderRadius: '9999px',
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            <Sparkles size={16} />
            <span>Flight Manual & Protocols</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: 'clamp(2.4rem, 4.8vw, 3.8rem)',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              margin: '0 0 16px',
            }}
          >
            Rules of the <span style={{ color: '#ff3b69' }}>Voyage</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
              color: '#64748b',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            Everything you and your crew need to know before docking at MIT Mysore for the 24-hour sprint.
          </motion.p>

          {/* Hand-drawn doodle banner */}
          <div
            style={{
              marginTop: '16px',
              display: 'inline-block',
              fontFamily: "'Patrick Hand', cursive",
              fontSize: '18px',
              color: '#ff3b69',
              background: '#fff',
              padding: '6px 18px',
              borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
              border: '2px dashed #ff3b69',
              transform: 'rotate(-1.5deg)',
            }}
          >
            ✦ KEEP IT HONEST • BUILD WITH PASSION • ZERO BUGS ✦
          </div>

          {/* Architecture Freedom Banner */}
          <div
            style={{
              maxWidth: '840px',
              margin: '24px auto 0',
              background: '#f0fdf4',
              border: '2px solid #86efac',
              borderRadius: '20px',
              padding: '16px 24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 900, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              💡 Core or Software Solution Freedom • Hardware is Optional
            </div>
            <p style={{ fontSize: '13.5px', color: '#334155', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
              Hardware is <strong>never compulsory</strong>. You have complete freedom to choose an authentic problem and craft the right solution—whether at the <strong>core engineering level</strong> (system architectures, protocols, embedded logic, simulation) or <strong>software level</strong> (AI/ML models, cloud platforms, web/mobile apps). Focus on solving the real problem uniquely!
            </p>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
            gap: '32px',
          }}
        >
          {/* Column 1: Flight Essentials */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                paddingLeft: '6px',
              }}
            >
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#ff3b69',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '14px',
                }}
              >
                1
              </span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Squad Essentials & Registration
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {guidelinesPart1.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.num}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -3, scale: 1.01 }}
                    style={{
                      backgroundColor: item.bg,
                      border: `2px solid ${item.border}`,
                      borderRadius: '20px',
                      padding: '20px',
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'flex-start',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '14px',
                        backgroundColor: '#fff',
                        border: `2px solid ${item.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.accent,
                        flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      }}
                    >
                      <Icon size={22} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                        <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {item.title}
                        </h4>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            backgroundColor: '#fff',
                            color: item.accent,
                            border: `1.5px solid ${item.border}`,
                            textTransform: 'uppercase',
                          }}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Logistics & Finale */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                paddingLeft: '6px',
              }}
            >
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#0284c7',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '14px',
                }}
              >
                2
              </span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Logistics, Food & Campus
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {guidelinesPart2.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.num}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -3, scale: 1.01 }}
                    style={{
                      backgroundColor: item.bg,
                      border: `2px solid ${item.border}`,
                      borderRadius: '20px',
                      padding: '20px',
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'flex-start',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '14px',
                        backgroundColor: '#fff',
                        border: `2px solid ${item.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.accent,
                        flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      }}
                    >
                      <Icon size={22} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                        <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {item.title}
                        </h4>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            backgroundColor: '#fff',
                            color: item.accent,
                            border: `1.5px solid ${item.border}`,
                            textTransform: 'uppercase',
                          }}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Playful Banner at Bottom */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{
            marginTop: '50px',
            backgroundColor: '#fff',
            borderRadius: '24px',
            border: '2px dashed #ff3b69',
            padding: '30px 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            flexWrap: 'wrap',
            boxShadow: '0 8px 30px rgba(255, 59, 105, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '60px', height: '70px', flexShrink: 0 }}>
              <AmongUsCrewmate color="pink" hat="crown" size={60} speechText="Squad ready!" />
            </div>
            <div>
              <h4 style={{ fontSize: '19px', fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
                Registrations Officially Closed 🔒
              </h4>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, fontWeight: 500 }}>
                All squad slots are filled. Registered team leaders and crewmates can log in to view their dashboard.
              </p>
            </div>
          </div>

          <a
            href="/login"
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '14px 28px',
              borderRadius: '9999px',
              fontSize: '15px',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(15, 23, 42, 0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.25)';
            }}
          >
            Captain &amp; Crew Login →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
