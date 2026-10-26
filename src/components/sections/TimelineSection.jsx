import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useAuth } from "../../lib/useAuth";

/* ─────────────────────────────────────────
   Icons (B&W inline SVG)
───────────────────────────────────────── */
const IconRegisterOpen = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconDeadline = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <path d="M12 14l1.5 1.5L16 13"/>
  </svg>
);
const IconAnnounce = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IconTrophy = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4a2 2 0 0 1-2-2V5h4"/>
    <path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/>
    <path d="M12 17v4"/>
    <path d="M8 21h8"/>
    <path d="M6 5h12v7a6 6 0 0 1-12 0V5z"/>
  </svg>
);

/* ─────────────────────────────────────────
   Data
───────────────────────────────────────── */
const EVENTS = [
  {
    index: 0, num: "01", day: "08", month: "OCT", year: "2026",
    title: "Shuttle Boarding (Registration Opens)",
    desc: "Portal goes live. Assemble your 3–4 member undergraduate crew (inter-college allowed) and secure your spot on the flight manifest.",
    tag: "Opens", tagColor: "#38fedc", tagBg: "rgba(56,254,220,0.1)", tagBorder: "rgba(56,254,220,0.3)",
    Icon: IconRegisterOpen,
  },
  {
    index: 1, num: "02", day: "02", month: "NOV", year: "2026",
    title: "Roster & Payment Lock",
    desc: "Final deadline to confirm your 3–4 crew members and complete payment verification.",
    tag: "Deadline", tagColor: "#ef4444", tagBg: "rgba(239,68,68,0.1)", tagBorder: "rgba(239,68,68,0.3)",
    Icon: IconDeadline,
  },
  {
    index: 2, num: "03", day: "03", month: "NOV", year: "2026",
    title: "Problem Statements & Flight Passes",
    desc: "Problem Statements revealed; official Flight Passes issued to all registered squads with venue logistics briefing.",
    tag: "Pass Clearance", tagColor: "#facc15", tagBg: "rgba(250,204,21,0.1)", tagBorder: "rgba(250,204,21,0.3)",
    Icon: IconAnnounce,
  },
  {
    index: 3, num: "04", day: "06", month: "NOV", year: "2026",
    title: "Docking at Base Station (Grand Finale)",
    desc: "24-hour intense prototyping at Maharaja Institute of Technology Mysore, jury evaluation, and ₹40,000 bounty ceremony.",
    tag: "Main Event (Nov 6–7)", tagColor: "#38fedc",
    tagBg: "rgba(56,254,220,0.15)", tagBorder: "rgba(56,254,220,0.4)",
    Icon: IconTrophy, isFinal: true,
  },
];

/* ─────────────────────────────────────────
   Shared scroll range per card
   Card 0: 8%–26%  Card 1: 29%–47%
   Card 2: 50%–68% Card 3: 71%–89%
───────────────────────────────────────── */
const BUFFER = 0.08;
const SEG    = (1 - BUFFER) / EVENTS.length;

function cardRange(index) {
  const start = BUFFER + index * SEG;
  const end   = start + SEG * 0.75;
  return [start, end];
}

const EASE = [0.22, 1, 0.36, 1];

/* ─────────────────────────────────────────
   Desktop sticky card — slides up
───────────────────────────────────────── */
function DesktopStickyCard({ event, scrollYProgress }) {
  const [hovered, setHovered] = useState(false);
  const isFinal = event.isFinal;
  const { Icon } = event;

  const [start, end] = cardRange(event.index);
  const rawY  = useTransform(scrollYProgress, [start, end], [80, 0]);
  const rawOp = useTransform(scrollYProgress, [start, end], [0, 1]);
  const y       = useSpring(rawY,  { stiffness: 85, damping: 26, restDelta: 0.001 });
  const opacity = useSpring(rawOp, { stiffness: 85, damping: 26, restDelta: 0.001 });

  return (
    <motion.div
      style={{ opacity, y, display: "flex", flexDirection: "column" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        display: "flex", flexDirection: "column",
        background: "rgba(15, 23, 42, 0.88)",
        backdropFilter: "blur(14px)",
        border: hovered
          ? "1.5px solid #38fedc"
          : isFinal
            ? "1.5px solid rgba(56, 254, 220, 0.4)"
            : "1.5px solid rgba(255, 255, 255, 0.12)",
        borderRadius: 22,
        padding: "24px 20px 20px",
        position: "relative", overflow: "hidden", cursor: "default",
        height: "100%",
        boxShadow: hovered
          ? "0 28px 70px rgba(0,0,0,0.7), 0 0 30px rgba(56,254,220,0.25)"
          : "0 12px 36px rgba(0,0,0,0.5)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        transition: "border-color 0.3s, box-shadow 0.35s, transform 0.35s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <span style={{
          position: "absolute", bottom: -16, right: -4,
          fontSize: "8rem", fontWeight: 900, letterSpacing: "-0.08em", lineHeight: 1,
          color: "rgba(56, 254, 220, 0.05)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          userSelect: "none", pointerEvents: "none",
        }}>{event.num}</span>

        <div style={{
          position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
          background: "linear-gradient(90deg, transparent, rgba(56,254,220,0.4), transparent)",
        }} />

        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: "rgba(56, 254, 220, 0.1)",
          border: "1px solid rgba(56, 254, 220, 0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 16, color: "#38fedc", flexShrink: 0,
          transition: "transform 0.3s",
          transform: hovered ? "scale(1.1)" : "scale(1)",
        }}>
          <Icon />
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 16 }}>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "3rem", fontWeight: 900, letterSpacing: "-0.06em",
            lineHeight: 0.9, color: "#f8fafc",
          }}>{event.day}</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{
              fontFamily: "monospace", fontSize: "0.7rem", fontWeight: 800,
              letterSpacing: "0.14em", color: "#38fedc", textTransform: "uppercase",
            }}>{event.month}</span>
            <span style={{
              fontFamily: "monospace", fontSize: "0.58rem", letterSpacing: "0.08em",
              color: "#64748b",
            }}>{event.year}</span>
          </div>
        </div>

        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "1.05rem", fontWeight: 800, letterSpacing: "-0.02em",
          lineHeight: 1.25, color: "#f8fafc",
          margin: "0 0 10px",
        }}>{event.title}</h3>

        <div style={{ height: 1, background: "rgba(255,255,255,0.1)", marginBottom: 10 }} />

        <p style={{
          fontSize: "0.82rem", lineHeight: 1.5,
          color: "#94a3b8",
          margin: 0, flex: 1,
        }}>{event.desc}</p>

        <div style={{
          marginTop: 14, alignSelf: "flex-start",
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "4px 11px", borderRadius: 999,
          background: event.tagBg, border: `1px solid ${event.tagBorder}`,
        }}>
          <span style={{
            fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.16em",
            color: event.tagColor, textTransform: "uppercase",
          }}>{event.tag}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Mobile card — slides from side on scroll
   Even index = from left, odd = from right
───────────────────────────────────────── */
function MobileStickyCard({ event }) {
  const isFinal = event.isFinal;
  const { Icon } = event;
  const isEven = event.index % 2 === 0;

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "0.9 1"]
  });

  const rawX  = useTransform(scrollYProgress, [0, 1], [isEven ? -72 : 72, 0]);
  const rawOp = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const x       = useSpring(rawX,  { stiffness: 85, damping: 26, restDelta: 0.001 });
  const opacity = useSpring(rawOp, { stiffness: 85, damping: 26, restDelta: 0.001 });

  return (
    <motion.div ref={ref} style={{ opacity, x }}>
      <div style={{
        background: "rgba(15, 23, 42, 0.92)",
        backdropFilter: "blur(14px)",
        border: isFinal ? "1.5px solid rgba(56, 254, 220, 0.4)" : "1.5px solid rgba(255, 255, 255, 0.12)",
        borderRadius: 18, padding: "18px 16px",
        position: "relative", overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
          background: "linear-gradient(90deg, transparent, rgba(56,254,220,0.4), transparent)",
        }} />

        {/* Watermark number */}
        <span style={{
          position: "absolute", bottom: -10, right: 2,
          fontSize: "5rem", fontWeight: 900, letterSpacing: "-0.08em", lineHeight: 1,
          color: "rgba(56, 254, 220, 0.05)",
          userSelect: "none", pointerEvents: "none",
        }}>{event.num}</span>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          {/* Icon */}
          <div style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: "rgba(56, 254, 220, 0.1)",
            border: "1px solid rgba(56, 254, 220, 0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#38fedc",
          }}><Icon /></div>

          {/* Date */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "2.2rem", fontWeight: 900, letterSpacing: "-0.05em",
              lineHeight: 0.9, color: "#f8fafc",
            }}>{event.day}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{
                fontFamily: "monospace", fontSize: "0.62rem", fontWeight: 800,
                letterSpacing: "0.12em", color: "#38fedc",
              }}>{event.month}</span>
              <span style={{
                fontFamily: "monospace", fontSize: "0.52rem",
                color: "#64748b",
              }}>{event.year}</span>
            </div>
          </div>

          {/* Tag pill — right side */}
          <div style={{
            marginLeft: "auto",
            display: "inline-flex", alignItems: "center",
            padding: "3px 9px", borderRadius: 999,
            background: event.tagBg, border: `1px solid ${event.tagBorder}`,
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: "0.52rem", fontWeight: 800, letterSpacing: "0.14em",
              color: event.tagColor, textTransform: "uppercase",
            }}>{event.tag}</span>
          </div>
        </div>

        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "0.92rem", fontWeight: 800, letterSpacing: "-0.02em",
          color: "#f8fafc", margin: "0 0 6px",
        }}>{event.title}</h3>

        <p style={{
          fontSize: "0.78rem", lineHeight: 1.6,
          color: "#94a3b8", margin: 0,
        }}>{event.desc}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Beam dot — pops in with its card
───────────────────────────────────────── */
function BeamDot({ event, scrollYProgress, vertical }) {
  const [start] = cardRange(event.index);
  const dotEnd = start + 0.05;
  const rawScale = useTransform(scrollYProgress, [start, dotEnd], [0, 1]);
  const scale = useSpring(rawScale, { stiffness: 110, damping: 24, restDelta: 0.001 });

  const isFinal = event.isFinal;
  const size = vertical
    ? (isFinal ? 40 : 34)
    : (isFinal ? 54 : 46);

  return (
    <motion.div style={{
      scale,
      width: size, height: size,
      borderRadius: "50%",
      background: "#070a13",
      border: isFinal ? "3px solid #38fedc" : "3px solid #38fedc",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#38fedc",
      boxShadow: "0 0 16px rgba(56, 254, 220, 0.7), inset 0 0 8px rgba(56, 254, 220, 0.3)",
      position: "relative", zIndex: 10, flexShrink: 0,
    }}>
      <event.Icon />
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   CTA Banner (shared)
───────────────────────────────────────── */
function CTABanner({ mobile }) {
  const user = useAuth();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.95, ease: EASE }}
      style={{
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(16px)",
        borderRadius: mobile ? 20 : 24,
        padding: mobile ? "28px 24px" : "40px 48px",
        display: "flex",
        flexDirection: mobile ? "column" : "row",
        alignItems: mobile ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: 20, flexWrap: "wrap",
        position: "relative", overflow: "hidden",
        border: "1.5px solid rgba(56, 254, 220, 0.25)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
      }}
    >
      <div aria-hidden style={{
        position: "absolute", top: 0, left: "8%", right: "8%", height: 1,
        background: "linear-gradient(90deg, transparent, rgba(56,254,220,0.5), transparent)",
      }} />
      <div aria-hidden style={{
        position: "absolute", left: -80, top: -80,
        width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(56,254,220,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 12px", borderRadius: 999,
          background: "rgba(56,254,220,0.15)",
          border: "1px solid rgba(56,254,220,0.3)", marginBottom: 12,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%", background: "#38fedc",
            animation: "pulse-dot 1.5s ease-in-out infinite",
            boxShadow: "0 0 8px #38fedc",
          }} />
          <span style={{
            fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.18em",
            color: "#38fedc", textTransform: "uppercase",
          }}>CREW REGISTRATION OPEN</span>
        </div>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: mobile ? "1rem" : "clamp(1.05rem,2vw,1.35rem)",
          fontWeight: 800, color: "#f8fafc", margin: 0,
          letterSpacing: "-0.02em", lineHeight: 1.3,
        }}>
          Don't wait — spots fill fast.<br />
          <span style={{ color: "#38fedc", fontWeight: 600, fontSize: "0.88em" }}>
            Registration closes November 02, 2026.
          </span>
        </p>
      </div>

      <a
        href="/register"
        style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: mobile ? "12px 22px" : "15px 30px",
          background: "linear-gradient(135deg, #38fedc 0%, #2dd4bf 100%)", color: "#070a13",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800, fontSize: mobile ? "0.82rem" : "0.88rem",
          letterSpacing: "-0.01em", borderRadius: 12,
          textDecoration: "none", flexShrink: 0,
          boxShadow: "0 8px 25px rgba(56,254,220,0.35)",
          transition: "transform 0.3s, box-shadow 0.3s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 12px 35px rgba(56,254,220,0.5)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 8px 25px rgba(56,254,220,0.35)";
        }}
      >
        Register Squad (₹1,200)
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#070a13" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Main Export
───────────────────────────────────────── */
export default function TimelineSection() {
  const desktopOuterRef = useRef(null);
  const mobileOuterRef  = useRef(null);

  /* Desktop scroll progress */
  const { scrollYProgress: deskProgress } = useScroll({
    target: desktopOuterRef,
    offset: ["start start", "end end"],
  });

  /* Mobile scroll progress */
  const { scrollYProgress: mobileProgress } = useScroll({
    target: mobileOuterRef,
    offset: ["start start", "end end"],
  });

  /* Desktop horizontal beam fill */
  const beamWidth = useSpring(
    useTransform(deskProgress, [BUFFER, 0.95], ["0%", "100%"]),
    { stiffness: 58, damping: 34, restDelta: 0.001 }
  );

  /* Mobile vertical beam fill */
  const beamHeight = useSpring(
    useTransform(mobileProgress, [BUFFER, 0.95], ["0%", "100%"]),
    { stiffness: 58, damping: 34, restDelta: 0.001 }
  );

  return (
    <>
      {/* ══════════════════════════════════════════
          DESKTOP sticky scroll section
      ══════════════════════════════════════════ */}
      <section
        className="tl-desktop-outer"
        ref={desktopOuterRef}
        id="timeline"
      >
        <div className="tl-sticky">

          {/* Fine grid */}
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

          {/* 2026 watermark */}
          <div aria-hidden style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            fontSize: "clamp(12rem,28vw,24rem)", fontWeight: 900,
            letterSpacing: "-0.08em", color: "rgba(56,254,220,0.03)",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            userSelect: "none", pointerEvents: "none",
            whiteSpace: "nowrap", lineHeight: 1,
          }}>2026</div>

          <div style={{
            maxWidth: 1200, margin: "0 auto",
            padding: "0 2.5rem",
            position: "relative", zIndex: 1,
            display: "flex", flexDirection: "column",
            justifyContent: "center", width: "100%",
          }}>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.95, ease: EASE }}
              style={{
                marginBottom: 32,
                display: "flex", alignItems: "flex-end",
                justifyContent: "space-between", gap: 24, flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 2, background: "#38fedc", boxShadow: "0 0 10px rgba(56,254,220,0.8)" }} />
                  <p style={{
                    fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.22em",
                    color: "#38fedc", textTransform: "uppercase", margin: 0,
                  }}>MISSION TRAJECTORY &amp; FLIGHT LOG</p>
                </div>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "clamp(2.6rem,5vw,4.4rem)", fontWeight: 900,
                  lineHeight: 1.0, letterSpacing: "-0.045em", color: "#f8fafc", margin: 0,
                }}>
                  Mark your{" "}
                  <span style={{ WebkitTextStroke: "2px #38fedc", color: "transparent" }}>
                    calendar.
                  </span>
                </h2>
              </div>

            </motion.div>

            {/* Horizontal beam row */}
            <div style={{ position: "relative", marginBottom: 20 }}>
              <div style={{
                position: "absolute", top: "50%", left: 0, width: "100%", height: 3,
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.12)", borderRadius: 999, zIndex: 0,
              }} />
              <motion.div style={{
                position: "absolute", top: "50%", left: 0, height: 3,
                transform: "translateY(-50%)",
                background: "linear-gradient(90deg, #38fedc 0%, #2dd4bf 100%)",
                boxShadow: "0 0 14px rgba(56,254,220,0.8)",
                borderRadius: 999, zIndex: 1,
                width: beamWidth,
              }} />
              <div style={{
                position: "relative", display: "flex",
                justifyContent: "space-between", zIndex: 10,
              }}>
                {EVENTS.map(ev => (
                  <BeamDot key={ev.num} event={ev} scrollYProgress={deskProgress} vertical={false} />
                ))}
              </div>
            </div>

            {/* Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {EVENTS.map(ev => (
                <DesktopStickyCard key={ev.num} event={ev} scrollYProgress={deskProgress} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Desktop CTA — outside sticky, normal flow */}
      <div className="tl-desktop-cta" style={{
        backgroundColor: "#fff", padding: "0 2.5rem 100px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <CTABanner mobile={false} />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE sticky scroll section
          Vertical standing line, cards from side
      ══════════════════════════════════════════ */}
      <section
        className="tl-mobile-outer"
        ref={mobileOuterRef}
        id="timeline-mobile"
      >
        {/* Sticky viewport */}
        <div className="tl-mobile-sticky">

          {/* Fine grid */}
          <svg aria-hidden style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            opacity: 0.03, pointerEvents: "none",
          }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`v${i}`} x1={`${(i+1)*14.28}%`} y1="0" x2={`${(i+1)*14.28}%`} y2="100%" stroke="#000" strokeWidth="1"/>
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={`${(i+1)*10}%`} x2="100%" y2={`${(i+1)*10}%`} stroke="#000" strokeWidth="1"/>
            ))}
          </svg>

          <div style={{
            padding: "0 1.25rem",
            position: "relative", zIndex: 1,
            display: "flex", flexDirection: "column",
            justifyContent: "center",
            width: "100%", height: "100%",
          }}>

            {/* Mobile Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.9, ease: EASE }}
              style={{ marginBottom: 28 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 22, height: 1, background: "#111" }} />
                <p style={{
                  fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.22em",
                  color: "#111", textTransform: "uppercase", margin: 0,
                }}>Event Timeline</p>
              </div>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "clamp(1.9rem,7vw,2.6rem)", fontWeight: 900,
                lineHeight: 1.05, letterSpacing: "-0.04em", color: "#111", margin: 0,
              }}>
                Mark your{" "}
                <span style={{ WebkitTextStroke: "2px #111", color: "transparent" }}>
                  calendar.
                </span>
              </h2>
            </motion.div>

            {/* Vertical line + cards */}
            <div style={{ position: "relative", paddingLeft: 56 }}>

              {/* Grey vertical track */}
              <div style={{
                position: "absolute",
                top: 0, bottom: 0, left: 17,
                width: 2,
                background: "#e8e8e8",
                borderRadius: 999,
                zIndex: 0,
                overflow: "hidden",
              }}>
                {/* Animated fill */}
                <motion.div style={{
                  width: "100%",
                  background: "linear-gradient(180deg, #0078D4 0%, #111 100%)",
                  borderRadius: 999,
                  height: beamHeight,
                }} />
              </div>

              {/* Cards with icon nodes */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {EVENTS.map(ev => (
                  <div key={ev.num} style={{ position: "relative" }}>

                    {/* Icon dot on vertical line */}
                    <div style={{
                      position: "absolute",
                      left: -56, top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 2,
                    }}>
                      <BeamDot event={ev} scrollYProgress={mobileProgress} vertical={true} />
                    </div>

                    <MobileStickyCard event={ev} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile CTA — outside sticky, normal flow */}
      <div className="tl-mobile-cta" style={{
        backgroundColor: "#070a13", padding: "0 1.25rem 72px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <CTABanner mobile={true} />
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.5); }
        }

        /* ── Desktop layout ── */
        .tl-desktop-outer {
          display: block;
          height: 300vh;
          position: relative;
          background: #070a13;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .tl-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          background: #070a13;
        }
        .tl-desktop-cta { display: block; }

        /* ── Mobile layout — hidden on desktop ── */
        .tl-mobile-outer  { display: none; }
        .tl-mobile-cta    { display: none; }

        /* ── Tablet: 2-col cards ── */
        @media (max-width: 1024px) and (min-width: 769px) {
          .tl-sticky > div > div:last-child {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        /* ── Mobile: hide desktop, show mobile ── */
        @media (max-width: 768px) {
          .tl-desktop-outer { display: none; }
          .tl-desktop-cta   { display: none; }

          .tl-mobile-outer {
            display: block;
            position: relative;
            background: #070a13;
            padding: 4rem 0 2rem;
            font-family: 'Plus Jakarta Sans', sans-serif;
          }
          .tl-mobile-sticky {
            position: relative;
            display: flex;
            align-items: center;
            background: #070a13;
          }
          .tl-mobile-cta { display: block; }
        }
      `}</style>
    </>
  );
}
