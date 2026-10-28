import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlobeCanvas from '../ui/GlobeCanvas';
import { theme } from '../../theme';
import mitMysoreLogo from '../../assets/logo/mit-mysore-logo.png';

// ── Icons ───────────────────────────────────────────────────────────────────────
const StarIcon = ({ size = 20, color = "currentColor", fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);


const LINE1 = "What's the Next";
const LINE2 = "Big Idea!";
const CHAR_DELAY = 75;
const LINE_PAUSE = 160;
const REVEAL_DELAY = 300;

// ── Floating word that reacts to cursor ──────────────────────────────────────
function FloatingWord({ word, x, y, fontSize, color, delay }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      const dx = (e.clientX / window.innerWidth  - 0.5) * 18;
      const dy = (e.clientY / window.innerHeight - 0.5) * 18;
      setPos({ x: dx, y: dy });
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.07, x: pos.x, y: pos.y }}
      transition={{ opacity: { delay, duration: 0.8 }, x: { type: 'spring', stiffness: 30, damping: 15 }, y: { type: 'spring', stiffness: 30, damping: 15 } }}
      style={{
        position: 'absolute', left: x, top: y,
        fontSize, fontWeight: 900,
        color, pointerEvents: 'none',
        letterSpacing: '-0.04em', lineHeight: 1,
        userSelect: 'none', zIndex: 0,
        whiteSpace: 'nowrap',
      }}
    >
      {word}
    </motion.span>
  );
}

// Floating particle
function Particle({ x, y, size, duration, delay, color }) {
  return (
    <motion.div
      style={{
        position: 'absolute', left: x, top: y,
        width: size, height: size,
        borderRadius: '50%',
        background: color,
        pointerEvents: 'none',
      }}
      animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3], scale: [1, 1.4, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// Animated grid lines in background
function GridLines() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      opacity: 0.04,
      pointerEvents: 'none',
      backgroundImage: `
        linear-gradient(to right, #111 1px, transparent 1px),
        linear-gradient(to bottom, #111 1px, transparent 1px)
      `,
      backgroundSize: 'clamp(40px, 5vw, 80px) clamp(40px, 5vw, 80px)',
    }} />
  );
}



export default function HeroSection1() {
  const [typed1, setTyped1] = useState('');
  const [typed2, setTyped2] = useState('');
  const [line1Done, setLine1Done] = useState(false);
  const [typingDone, setTypingDone] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const sectionRef = useRef(null);

  // Type line 1
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTyped1(LINE1.slice(0, i));
      if (i >= LINE1.length) { clearInterval(t); setLine1Done(true); }
    }, CHAR_DELAY);
    return () => clearInterval(t);
  }, []);

  // Type line 2
  useEffect(() => {
    if (!line1Done) return;
    let j = 0;
    const start = setTimeout(() => {
      const t = setInterval(() => {
        j++;
        setTyped2(LINE2.slice(0, j));
        if (j >= LINE2.length) { clearInterval(t); setTypingDone(true); }
      }, CHAR_DELAY);
      return () => clearInterval(t);
    }, LINE_PAUSE);
    return () => clearTimeout(start);
  }, [line1Done]);

  // Cursor blink
  useEffect(() => {
    const t = setInterval(() => setShowCursor(v => !v), 530);
    return () => clearInterval(t);
  }, []);

  // Reveal
  useEffect(() => {
    if (!typingDone) return;
    const t = setTimeout(() => setRevealed(true), REVEAL_DELAY);
    return () => clearTimeout(t);
  }, [typingDone]);

  // Mouse parallax
  const onMouseMove = (e) => {
    const r = sectionRef.current?.getBoundingClientRect();
    if (!r) return;
    setMousePos({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
  };

  const reveal = (delay = 0) => ({
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  const PARTICLES = [
    { x: '8%',  y: '18%', size: 6,  duration: 4.5, delay: 0,    color: '#2563EB33' },
    { x: '88%', y: '12%', size: 4,  duration: 3.8, delay: 0.8,  color: '#2563EB55' },
    { x: '5%',  y: '72%', size: 8,  duration: 5.2, delay: 1.2,  color: '#11111122' },
    { x: '92%', y: '65%', size: 5,  duration: 4.0, delay: 0.4,  color: '#2563EB44' },
    { x: '50%', y: '8%',  size: 4,  duration: 6.0, delay: 2.0,  color: '#2563EB22' },
    { x: '75%', y: '80%', size: 6,  duration: 4.8, delay: 1.6,  color: '#11111133' },
    { x: '20%', y: '85%', size: 5,  duration: 5.5, delay: 0.6,  color: '#2563EB33' },
    { x: '60%', y: '22%', size: 3,  duration: 3.5, delay: 1.8,  color: '#2563EB66' },
  ];

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      id="hero"
      style={{
        position: 'relative', width: '100%', height: '100vh',
        background: '#ffffff', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        fontFamily: theme.fonts.body,
      }}
    >

      {/* Ghost words in background */}
      <FloatingWord word="HACKATHON" x="2%"   y="12%"  fontSize="clamp(3rem,7vw,6rem)"  color="#111" delay={0.3} />
      <FloatingWord word="HAXLR8"    x="68%"  y="8%"   fontSize="clamp(2rem,5vw,4.5rem)" color="#ff3b69" delay={0.5} />
      <FloatingWord word="2026"      x="5%"   y="68%"  fontSize="clamp(2rem,5vw,4rem)"  color="#111" delay={0.7} />
      <FloatingWord word="SDG"       x="72%"  y="75%"  fontSize="clamp(2rem,4vw,3.5rem)" color="#111" delay={0.4} />

      {/* Centre vignette so text is readable */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 55% 55% at 50% 48%, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.45) 60%, rgba(255,255,255,0.0) 100%)',
      }} />

      {/* Blue top stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4, zIndex: 10,
        background: 'linear-gradient(90deg,#1d4ed8,#2563EB,#3b82f6)',
      }} />

      {/* Header */}
      <header className="h1-header" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 40px",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10
      }}>
        {/* Center: Pills */}
        <div className="h1-pills-mobile-hide" style={{ display: "flex", alignItems: "center" }}>
          <div style={{
            backgroundColor: "#111",
            color: "#fff",
            padding: "8px 20px",
            borderRadius: "30px 0 0 30px",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <StarIcon size={12} fill="#fff" /> HAXLR8 3.0 HACKATHON
          </div>
          <div style={{
            backgroundColor: "#fff",
            color: "#6b7280",
            padding: "8px 20px",
            borderRadius: "0 30px 30px 0",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            border: "1px solid #e5e7eb",
            borderLeft: "none"
          }}>
            #BUILD THE FUTURE
          </div>
        </div>

        {/* Right: Logos */}
        <div className="h1-logos-mobile-hide" style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "1.2rem" }}>
            SDG
            <div style={{
              width: "24px", height: "24px", borderRadius: "50%",
              background: "conic-gradient(#e5243b 0 21deg, #dda63a 21deg 42deg, #4c9f38 42deg 64deg, #c5192d 64deg 85deg, #ff3a21 85deg 107deg, #26bde2 107deg 128deg, #fcc30b 128deg 150deg, #a21942 150deg 171deg, #fd6925 171deg 193deg, #dd1367 193deg 214deg, #fd9d24 214deg 236deg, #bf8b2e 236deg 257deg, #3f7e44 257deg 279deg, #0a97d9 279deg 300deg, #56c02b 300deg 321deg, #00689d 321deg 343deg, #19486a 343deg 360deg)"
            }} />
          </div>
          <div style={{ width: "1px", height: "30px", background: "#e5e7eb" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "0.9rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, display: "flex", flexDirection: "column" }}>
              Organized by
            </span>
            <img src={mitMysoreLogo} alt="MIT Mysore" style={{ height: "32px", objectFit: "contain" }} />
          </div>
          <div style={{ width: "1px", height: "30px", background: "#e5e7eb" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              fontSize: "0.75rem",
              background: "#fef3c7",
              color: "#b45309",
              border: "1px solid #fde68a",
              padding: "4px 12px",
              borderRadius: "100px",
              fontWeight: 800,
              letterSpacing: "0.04em",
              textTransform: "uppercase"
            }}>
              Sponsors Dropping Soon 🚀
            </span>
          </div>
        </div>
      </header>

      <GridLines />

      {/* Parallax ambient blobs */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #2563EB0a 0%, transparent 70%)',
          left: `${mousePos.x * 40}%`,
          top: `${mousePos.y * 30}%`,
          transform: 'translate(-50%,-50%)',
          transition: 'left 0.8s ease, top 0.8s ease',
        }} />
        <div style={{
          position: 'absolute',
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #11111106 0%, transparent 70%)',
          right: `${(1 - mousePos.x) * 40}%`,
          bottom: `${(1 - mousePos.y) * 30}%`,
          transform: 'translate(50%,50%)',
          transition: 'right 0.8s ease, bottom 0.8s ease',
        }} />
      </div>

      {/* Floating particles */}
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

      {/* Main content */}
      <div style={{
        position: 'relative', zIndex: 10,
        textAlign: 'center', display: 'flex',
        flexDirection: 'column', alignItems: 'center',
        paddingBottom: '5vh',
        transform: 'translateY(-40px)',
      }}>
        
        {/* Event badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px',
            border: '1.5px solid #e5e7eb', borderRadius: 100,
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
            marginBottom: '1.6rem',
            flexWrap: 'wrap', justifyContent: 'center',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7eeb25ff', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: '#25eb3fff', textTransform: 'uppercase' }}>
            Registration Open!
          </span>
          {/* <span style={{ width: 1, height: 10, background: '#e5e7eb', display: 'inline-block' }} />
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase' }}>
            HAXLR8 3.0
          </span> */}
        </motion.div>
        

        {/* Heading */}
        <h1 style={{
          fontFamily: theme.fonts.heading,
          fontSize: 'clamp(2.5rem, 7.5vw, 5.5rem)',
          fontWeight: 800, lineHeight: 1.15,
          color: theme.colors.textPrimary,
          marginBottom: '0.15rem',
          letterSpacing: '-0.02em',
          minHeight: '2.8em',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <span style={{ display: 'block' }}>
            {typed1}
            {!line1Done && (
              <span style={{
                display: 'inline-block', width: 3, height: '0.8em',
                background: '#111', marginLeft: 4, verticalAlign: 'middle',
                borderRadius: 1, opacity: showCursor ? 1 : 0, transition: 'opacity 0.08s',
              }} />
            )}
          </span>
          <AnimatePresence>
            {line1Done && (
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  fontFamily: theme.fonts.pixel,
                  color: theme.colors.microsoftBlue,
                  fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                  display: 'block', marginTop: '0.4rem', lineHeight: 1.2,
                }}
              >
                {typed2}
                {!typingDone && (
                  <span style={{
                    display: 'inline-block', width: 3, height: '0.8em',
                    background: theme.colors.microsoftBlue, marginLeft: 4,
                    verticalAlign: 'middle', borderRadius: 1,
                    opacity: showCursor ? 1 : 0, transition: 'opacity 0.08s',
                  }} />
                )}
              </motion.span>
            )}
          </AnimatePresence>
        </h1>

        {/* Subtext */}
        <div style={reveal(0)}>
          <p style={{
            fontSize: '1rem', color: '#6b7280',
            lineHeight: 1.7, maxWidth: '480px',
            marginBottom: '2rem', marginTop: '0.5rem',
          }}>
            India's premier national-level hackathon. Build tech-driven solutions
            for the 17 UN Sustainable Development Goals.
          </p>
        </div>

        {/* CTA */}
        <div style={{ ...reveal(120), display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <span className="hero-btn-learn-more">
              <span className="hero-btn-circle"><span className="hero-btn-icon hero-btn-arrow" /></span>
              <span className="hero-btn-text">Captain &amp; Crew Login →</span>
            </span>
          </Link>
        </div>


        {/* Row 2 */}
        {/* <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            padding: "20px 30px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginTop: "20px",
            width: "100%",
            maxWidth: "1200px"
          }}
          className="h1-row2"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", fontWeight: 700, color: "#111" }}>
            <TrophyIcon size={18} /> 4TH HACKATHON
          </div>
          <div style={{ width: "1px", height: "20px", background: "#e5e7eb" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", fontWeight: 700, color: "#111" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
              <div style={{width: 8, height: 8, background: "#f25022"}}></div>
              <div style={{width: 8, height: 8, background: "#7fba00"}}></div>
              <div style={{width: 8, height: 8, background: "#00a4ef"}}></div>
              <div style={{width: 8, height: 8, background: "#ffb900"}}></div>
            </div> MICROSOFT PARTNER
          </div>
          <div style={{ width: "1px", height: "20px", background: "#e5e7eb" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", fontWeight: 700, color: "#111" }}>
            <BrainIcon size={18} /> GENIUS AI
          </div>
          <div style={{ width: "1px", height: "20px", background: "#e5e7eb" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", fontWeight: 700, color: "#111" }}>
            <div style={{
              width: "18px", height: "18px", borderRadius: "50%",
              background: "conic-gradient(#e5243b 0 21deg, #dda63a 21deg 42deg, #4c9f38 42deg 64deg, #c5192d 64deg 85deg, #ff3a21 85deg 107deg, #26bde2 107deg 128deg, #fcc30b 128deg 150deg, #a21942 150deg 171deg, #fd6925 171deg 193deg, #dd1367 193deg 214deg, #fd9d24 214deg 236deg, #bf8b2e 236deg 257deg, #3f7e44 257deg 279deg, #0a97d9 279deg 300deg, #56c02b 300deg 321deg, #00689d 321deg 343deg, #19486a 343deg 360deg)"
            }} /> 17 UN SDGS
          </div>
          <div style={{ width: "1px", height: "20px", background: "#e5e7eb" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", fontWeight: 700, color: "#111" }}>
            <PinIcon size={18} /> NATIONAL LEVEL
          </div>
          <div style={{ width: "1px", height: "20px", background: "#e5e7eb" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", fontWeight: 700, color: "#111" }}>
            <BulbIcon size={18} /> OPEN INNOVATION
          </div>
          <div style={{ width: "1px", height: "20px", background: "#e5e7eb" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", fontWeight: 700, color: "#111" }}>
            <StarIcon size={18} /> HAXLR8 3.0
          </div>
          <div style={{ width: "1px", height: "20px", background: "#e5e7eb" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", fontWeight: 700, color: "#111" }}>
            <CalendarIcon size={18} /> NOV 6–7 2026
          </div>
        </motion.div> */}
      </div>

      {/* Globe */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        width: '100%', height: '58%',
        zIndex: 5, pointerEvents: 'none',
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 1s 0.2s, transform 1s 0.2s',
      }}>
        <GlobeCanvas />
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        width: '100%', height: '15vh',
        background: 'linear-gradient(to top,#fff 0%,transparent 100%)',
        zIndex: 6, pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes h1pulse {
          0%,100%{box-shadow:0 0 0 3px #dbeafe}
          50%{box-shadow:0 0 0 6px #bfdbfe}
        }
        @media(max-width:1200px){
          .h1-logos-mobile-hide{display:none!important}
        }
        @media(max-width:768px){
          .h1-partners{display:none!important}
          .h1-stats{gap:16px!important}
          .h1-pills-mobile-hide{display:none!important}
          .h1-magnetbg{display:none!important}
          .h1-row2{display:none!important}
          .h1-header{pointer-events:none!important}
        }
        .hero-btn-learn-more{position:relative;display:inline-block;cursor:pointer;outline:none;border:0;vertical-align:middle;text-decoration:none;background:transparent;padding:0;font-size:inherit;font-family:inherit;width:13rem;height:auto}
        .hero-btn-circle{transition:all .45s cubic-bezier(.65,0,.076,1);position:relative;display:block;margin:0;width:3rem;height:3rem;background:#111;border-radius:1.625rem}
        .hero-btn-icon{transition:all .45s cubic-bezier(.65,0,.076,1);position:absolute;top:0;bottom:0;margin:auto;background:#fff}
        .hero-btn-arrow{transition:all .45s cubic-bezier(.65,0,.076,1);left:.625rem;width:1.125rem;height:.125rem;background:none}
        .hero-btn-arrow::before{position:absolute;content:"";top:-.29rem;right:.0625rem;width:.625rem;height:.625rem;border-top:.125rem solid #fff;border-right:.125rem solid #fff;transform:rotate(45deg)}
        .hero-btn-text{transition:all .45s cubic-bezier(.65,0,.076,1);position:absolute;top:0;left:0;right:0;bottom:0;padding:.75rem 0;margin:0 0 0 1.85rem;color:#111;font-weight:700;font-size:.78rem;letter-spacing:.06em;line-height:1.6;text-align:center;text-transform:uppercase;font-family:inherit;white-space:nowrap}
        .hero-btn-learn-more:hover .hero-btn-circle{width:100%;background:#2563EB}
        .hero-btn-learn-more:hover .hero-btn-arrow{background:#fff;transform:translate(1rem,0)}
        .hero-btn-learn-more:hover .hero-btn-text{color:#fff}

         /* Custom Dashboard Button Styles */
        .dashboard-btn {
          border: 1.5px solid black;
          padding: 12px 30px;
          border-radius: 30px;
          background-color: #ffffff;
          font-weight: 800;
          font-size: 15px;
          color: #111;
          box-shadow: 0px 0px 1px;
          transition: all 0.3s ease;
          cursor: pointer;
          letter-spacing: 0.05em;
          height: 52px;
        }

        .dashboard-btn:hover {
          transform: translateY(-8px);
          box-shadow: 0px 8px 1px rgb(0, 0, 0);
        }

        .dashboard-btn:active {
          transform: translateY(4px);
          box-shadow: 0px 0px 1px;
        }
      `}</style>
    </section>
  );
}
