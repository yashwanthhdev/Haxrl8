import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  AlertTriangle,
  FileText,
  Sparkles,
  Trophy,
  Coffee,
  Zap,
  Volume2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  playCrewmatePopSound,
  playEmergencyMeetingSound,
  playTaskCompleteSound,
  playVentSound,
} from '../amongus/AmongUsSound';
import AmongUsVent from '../amongus/AmongUsVent';

/**
 * ═════════════════════════════════════════════════════════════════════════
 * CUTE AMONG US CHARACTER ILLUSTRATIONS (Warm, Playful, Animated Vector SVGs)
 * ═════════════════════════════════════════════════════════════════════════
 */

// 1. Cyan Crewmate with Pilot Cap, Waving & Holographic Ticket
const CyanAirlockCrewmate = ({ isHovered, onClick }) => (
  <div
    style={{
      position: 'relative',
      width: '110px',
      height: '130px',
      margin: '0 auto',
      cursor: 'pointer',
    }}
    onClick={onClick}
    title="Click Cyan to inspect!"
  >
    <motion.svg
      viewBox="0 0 100 125"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
      animate={isHovered ? { y: [-3, -9, -3], rotate: [-2, 3, -2] } : { y: [0, -4, 0] }}
      transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
    >
      {/* Pilot Cap with Gold Star */}
      <g transform="translate(42, 4)">
        <path d="M 0 16 C 0 7, 34 7, 34 16 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
        <path d="M -4 16 L 38 16 C 38 20, -4 20, -4 16 Z" fill="#0f172a" />
        <circle cx="17" cy="11" r="4" fill="#facc15" />
      </g>

      {/* Oxygen Tank Backpack */}
      <rect x="14" y="42" width="22" height="42" rx="9" fill="#1b8599" stroke="#0f172a" strokeWidth="5.5" />
      <rect x="14" y="42" width="22" height="28" rx="9" fill="#24a8be" />

      {/* Main Body with Thick Cartoon Outline */}
      <path
        d="M 32 26 C 32 10, 72 10, 72 26 L 72 90 C 72 102, 58 102, 58 92 L 58 84 L 46 84 L 46 92 C 46 102, 32 102, 32 90 Z"
        fill="#24a8be"
        stroke="#0f172a"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* Body Light Curve */}
      <path d="M 32 26 C 32 10, 72 10, 72 26 L 72 66 C 64 62, 42 64, 32 70 Z" fill="#38fedc" />

      {/* Visor with Glass Glow */}
      <rect x="50" y="28" width="34" height="23" rx="11.5" fill="#1c3040" stroke="#0f172a" strokeWidth="5.5" />
      <rect x="52" y="30" width="30" height="19" rx="9.5" fill="#71e1ff" />
      <path d="M 52 39 C 58 45, 74 45, 80 39 C 80 45, 72 49, 66 49 C 59 49, 52 45, 52 39 Z" fill="#3290b2" />
      <ellipse cx="63" cy="35" rx="7.5" ry="3.2" transform="rotate(-15 63 35)" fill="#ffffff" opacity="0.95" />

      {/* Waving Hand */}
      <motion.g
        animate={{ rotate: [-10, 22, -10] }}
        transition={{ repeat: Infinity, duration: 1.3, ease: 'easeInOut' }}
        style={{ transformOrigin: '82px 58px' }}
      >
        <path d="M 76 56 C 88 52, 95 62, 85 68 Z" fill="#38fedc" stroke="#0f172a" strokeWidth="4" />
        <circle cx="87" cy="58" r="5" fill="#38fedc" stroke="#0f172a" strokeWidth="3.5" />
      </motion.g>

      {/* Holographic Boarding Pass */}
      <g transform="translate(18, 56)">
        <rect x="0" y="0" width="24" height="30" rx="5" fill="#0284c7" stroke="#0f172a" strokeWidth="3" />
        <rect x="2" y="3" width="20" height="24" rx="3" fill="#38fedc" opacity="0.9" />
        <line x1="5" y1="9" x2="19" y2="9" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
        <line x1="5" y1="14" x2="15" y2="14" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="5" y1="19" x2="17" y2="19" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="23" r="1.8" fill="#22c55e" />
      </g>

      {/* Cute Floating Stars */}
      <circle cx="94" cy="28" r="3" fill="#facc15" />
      <circle cx="6" cy="24" r="2.5" fill="#38fedc" />
    </motion.svg>
  </div>
);

// 2. Red Crewmate Slamming Emergency Button with Baby Crewmate on Head
const RedEmergencyCrewmate = ({ isHovered, onClick }) => (
  <div
    style={{
      position: 'relative',
      width: '115px',
      height: '130px',
      margin: '0 auto',
      cursor: 'pointer',
    }}
    onClick={onClick}
    title="Click Red to trigger emergency meeting!"
  >
    <motion.svg
      viewBox="0 0 110 125"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
      animate={isHovered ? { scale: [1, 1.06, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1.6 }}
    >
      {/* Baby Mini-Crewmate perched happily on head */}
      <motion.g
        animate={{ y: [-1, 3, -1], rotate: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        transform="translate(42, -4)"
      >
        <rect x="0" y="10" width="6" height="12" rx="3" fill="#ca8a04" stroke="#0f172a" strokeWidth="2" />
        <path d="M 6 4 C 6 -1, 20 -1, 20 4 L 20 22 C 20 25, 16 25, 16 22 L 16 20 L 10 20 L 10 22 C 10 25, 6 25, 6 22 Z" fill="#facc15" stroke="#0f172a" strokeWidth="2.5" />
        <rect x="12" y="5" width="10" height="7" rx="3.5" fill="#71e1ff" stroke="#0f172a" strokeWidth="2" />
      </motion.g>

      {/* Oxygen Backpack */}
      <rect x="14" y="44" width="22" height="42" rx="9" fill="#7a0838" stroke="#0f172a" strokeWidth="5.5" />
      <rect x="14" y="44" width="22" height="28" rx="9" fill="#c51111" />

      {/* Main Body */}
      <path
        d="M 32 28 C 32 12, 72 12, 72 28 L 72 92 C 72 104, 58 104, 58 94 L 58 86 L 46 86 L 46 94 C 46 104, 32 104, 32 92 Z"
        fill="#7a0838"
        stroke="#0f172a"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path d="M 32 28 C 32 12, 72 12, 72 28 L 72 68 C 64 64, 42 66, 32 72 Z" fill="#ef233c" />

      {/* Visor */}
      <rect x="50" y="30" width="34" height="23" rx="11.5" fill="#1c3040" stroke="#0f172a" strokeWidth="5.5" />
      <rect x="52" y="32" width="30" height="19" rx="9.5" fill="#71e1ff" />
      <path d="M 52 41 C 58 47, 74 47, 80 41 C 80 47, 72 50, 66 50 C 59 50, 52 47, 52 41 Z" fill="#3290b2" />
      <ellipse cx="63" cy="37" rx="7.5" ry="3.2" transform="rotate(-15 63 37)" fill="#ffffff" opacity="0.95" />

      {/* Emergency Button Table & Red Buzzer */}
      <g transform="translate(68, 62)">
        <path d="M 4 28 L 32 28 L 28 40 L 8 40 Z" fill="#334155" stroke="#0f172a" strokeWidth="3" />
        <ellipse cx="18" cy="28" rx="18" ry="6" fill="#64748b" stroke="#0f172a" strokeWidth="3" />
        <path d="M 4 27 C 4 12, 32 12, 32 27 Z" fill="rgba(113, 225, 255, 0.35)" stroke="#38bdf8" strokeWidth="2" />

        {/* Big Red Button with Squash/Stretch */}
        <motion.g
          animate={{ scaleY: [1, 0.7, 1], y: [0, 3.5, 0] }}
          transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
          style={{ transformOrigin: '18px 24px' }}
        >
          <ellipse cx="18" cy="24" rx="10.5" ry="5" fill="#ef4444" stroke="#991b1b" strokeWidth="2.5" />
          <ellipse cx="18" cy="22" rx="9.5" ry="4" fill="#f87171" />
        </motion.g>

        {/* Expanding Alert Shockwaves */}
        <motion.circle
          cx="18"
          cy="22"
          r="14"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2.5"
          animate={{ r: [10, 24], opacity: [0.9, 0] }}
          transition={{ repeat: Infinity, duration: 1.1 }}
        />
      </g>

      {/* Slamming Hand */}
      <motion.path
        d="M 68 56 C 78 54, 88 64, 82 72 C 76 72, 70 66, 68 56 Z"
        fill="#ef233c"
        stroke="#0f172a"
        strokeWidth="4"
        animate={{ y: [0, 4, 0] }}
        transition={{ repeat: Infinity, duration: 1.1 }}
      />
    </motion.svg>
  </div>
);

// 3. Yellow Crewmate in Goggles Connecting Wires & Blueprint in Electrical
const YellowWiringCrewmate = ({ isHovered, onClick }) => (
  <div
    style={{
      position: 'relative',
      width: '110px',
      height: '130px',
      margin: '0 auto',
      cursor: 'pointer',
    }}
    onClick={onClick}
    title="Click Yellow to fix wires!"
  >
    <motion.svg
      viewBox="0 0 105 125"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
      animate={isHovered ? { rotate: [-2, 2, -2] } : {}}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      {/* Safety Goggles on Forehead */}
      <g transform="translate(44, 13)">
        <rect x="0" y="0" width="30" height="10" rx="5" fill="#334155" stroke="#0f172a" strokeWidth="2.5" />
        <circle cx="7.5" cy="5" r="3.5" fill="#38bdf8" />
        <circle cx="22.5" cy="5" r="3.5" fill="#38bdf8" />
        <line x1="-8" y1="5" x2="36" y2="5" stroke="#0f172a" strokeWidth="2" />
      </g>

      {/* Oxygen Backpack */}
      <rect x="14" y="44" width="22" height="42" rx="9" fill="#c38823" stroke="#0f172a" strokeWidth="5.5" />
      <rect x="14" y="44" width="22" height="28" rx="9" fill="#f6f657" />

      {/* Main Body */}
      <path
        d="M 32 28 C 32 12, 72 12, 72 28 L 72 92 C 72 104, 58 104, 58 94 L 58 86 L 46 86 L 46 94 C 46 104, 32 104, 32 92 Z"
        fill="#c38823"
        stroke="#0f172a"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path d="M 32 28 C 32 12, 72 12, 72 28 L 72 68 C 64 64, 42 66, 32 72 Z" fill="#facc15" />

      {/* Visor */}
      <rect x="50" y="30" width="34" height="23" rx="11.5" fill="#1c3040" stroke="#0f172a" strokeWidth="5.5" />
      <rect x="52" y="32" width="30" height="19" rx="9.5" fill="#71e1ff" />
      <path d="M 52 41 C 58 47, 74 47, 80 41 C 80 47, 72 50, 66 50 C 59 50, 52 47, 52 41 Z" fill="#3290b2" />
      <ellipse cx="63" cy="37" rx="7.5" ry="3.2" transform="rotate(-15 63 37)" fill="#ffffff" opacity="0.95" />

      {/* Electrical Wires & Sparking Junction Box */}
      <g transform="translate(70, 52)">
        <rect x="4" y="8" width="28" height="36" rx="5" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
        <circle cx="11" cy="15" r="2.5" fill="#22c55e" />
        <circle cx="18" cy="15" r="2.5" fill="#ef4444" />
        <circle cx="25" cy="15" r="2.5" fill="#facc15" />

        {/* Colorful Cables */}
        <path d="M 2 22 C -6 20, -10 28, -14 26" stroke="#ef4444" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 2 28 C -4 32, -8 24, -14 30" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 2 34 C -6 38, -10 32, -14 36" stroke="#facc15" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Animated Electric Spark ⚡ */}
        <motion.g
          animate={{ scale: [0.5, 1.5, 0.5], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 0.55, ease: 'easeInOut' }}
          transform="translate(-13, 28)"
        >
          <path d="M 0 -7 L 3 -1 L 9 0 L 3 3 L 0 9 L -3 3 L -9 0 L -3 -1 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
        </motion.g>
      </g>

      {/* Blueprint Roll in Left Hand */}
      <g transform="translate(16, 62)">
        <rect x="0" y="0" width="18" height="26" rx="4" fill="#0284c7" stroke="#0f172a" strokeWidth="2.5" />
        <path d="M 3 6 L 15 6 M 3 11 L 12 11 M 3 16 L 15 16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <circle cx="9" cy="21" r="1.8" fill="#facc15" />
      </g>
    </motion.svg>
  </div>
);

// 4. Purple Crewmate All-Night Coding with Gamer Headset & Steaming Coffee
const PurpleCodingCrewmate = ({ isHovered, onClick }) => (
  <div
    style={{
      position: 'relative',
      width: '115px',
      height: '130px',
      margin: '0 auto',
      cursor: 'pointer',
    }}
    onClick={onClick}
    title="Click Purple to fuel up caffeine!"
  >
    <motion.svg
      viewBox="0 0 110 125"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
      animate={isHovered ? { y: [-2, 2, -2] } : {}}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      {/* Gamer Headset with Glowing Mic */}
      <g transform="translate(36, 12)">
        <path d="M 6 18 C 6 1, 42 1, 42 18" stroke="#1e1b4b" strokeWidth="5.5" fill="none" strokeLinecap="round" />
        <rect x="1" y="14" width="9" height="16" rx="4.5" fill="#a855f7" stroke="#0f172a" strokeWidth="2.5" />
        <rect x="38" y="14" width="9" height="16" rx="4.5" fill="#a855f7" stroke="#0f172a" strokeWidth="2.5" />
        <path d="M 40 24 C 44 32, 40 38, 32 38" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="32" cy="38" r="3" fill="#22c55e" />
      </g>

      {/* Oxygen Backpack */}
      <rect x="14" y="44" width="22" height="42" rx="9" fill="#3b177c" stroke="#0f172a" strokeWidth="5.5" />
      <rect x="14" y="44" width="22" height="28" rx="9" fill="#6b2fbc" />

      {/* Main Body */}
      <path
        d="M 32 28 C 32 12, 72 12, 72 28 L 72 92 C 72 104, 58 104, 58 94 L 58 86 L 46 86 L 46 94 C 46 104, 32 104, 32 92 Z"
        fill="#3b177c"
        stroke="#0f172a"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path d="M 32 28 C 32 12, 72 12, 72 28 L 72 68 C 64 64, 42 66, 32 72 Z" fill="#9333ea" />

      {/* Visor reflecting green code >101# */}
      <rect x="50" y="30" width="34" height="23" rx="11.5" fill="#0f172a" stroke="#0f172a" strokeWidth="5.5" />
      <rect x="52" y="32" width="30" height="19" rx="9.5" fill="#1e1b4b" />
      <text x="56" y="44" fill="#4ade80" fontSize="7.5" fontFamily="monospace" fontWeight="900">
        &gt;101#
      </text>

      {/* Glowing Laptop in Front */}
      <g transform="translate(62, 60)">
        <rect x="4" y="2" width="30" height="21" rx="3" fill="#0f172a" stroke="#0f172a" strokeWidth="2.5" />
        <rect x="6" y="4" width="26" height="17" rx="2" fill="#38bdf8" opacity="0.9" />
        <line x1="9" y1="8" x2="24" y2="8" stroke="#ffffff" strokeWidth="1.8" />
        <line x1="9" y1="13" x2="20" y2="13" stroke="#facc15" strokeWidth="1.8" />
        <line x1="9" y1="17" x2="26" y2="17" stroke="#ffffff" strokeWidth="1.8" />
        <polygon points="0,23 38,23 34,28 4,28" fill="#334155" stroke="#0f172a" strokeWidth="2" />
      </g>

      {/* Steaming Coffee Mug */}
      <g transform="translate(16, 70)">
        <rect x="0" y="8" width="16" height="18" rx="3.5" fill="#ea580c" stroke="#0f172a" strokeWidth="2" />
        <path d="M 16 11 C 20 11, 20 20, 16 20" stroke="#0f172a" strokeWidth="2" fill="none" />
        <motion.path
          d="M 5 5 C 5 1, 9 2, 8 -3 M 11 6 C 11 2, 15 3, 14 -2"
          stroke="#fed7aa"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          animate={{ y: [-1, -7, -1], opacity: [0.9, 0.2, 0.9] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      </g>
    </motion.svg>
  </div>
);

// 5. Lime Crewmate Victory Royale with Shiny Golden Crown & Trophy
const LimeVictoryCrewmate = ({ isHovered, onClick }) => (
  <div
    style={{
      position: 'relative',
      width: '115px',
      height: '130px',
      margin: '0 auto',
      cursor: 'pointer',
    }}
    onClick={onClick}
    title="Click Lime to celebrate victory!"
  >
    <motion.svg
      viewBox="0 0 110 125"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
      animate={{ rotate: [-4, 4, -4], y: [-3, 3, -3] }}
      transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
    >
      {/* Shiny Golden Crown 👑 */}
      <motion.g
        animate={{ y: [-1, 2.5, -1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        transform="translate(42, 3)"
      >
        <path
          d="M 2 16 L 6 3 L 14 11 L 22 3 L 26 16 Z"
          fill="#facc15"
          stroke="#ca8a04"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="6" cy="3" r="2.2" fill="#ef4444" />
        <circle cx="14" cy="11" r="2.2" fill="#38bdf8" />
        <circle cx="22" cy="3" r="2.2" fill="#ef4444" />
        <line x1="3" y1="14" x2="25" y2="14" stroke="#ca8a04" strokeWidth="2" />
      </motion.g>

      {/* Oxygen Backpack */}
      <rect x="14" y="44" width="22" height="42" rx="9" fill="#1e9e22" stroke="#0f172a" strokeWidth="5.5" />
      <rect x="14" y="44" width="22" height="28" rx="9" fill="#50ef39" />

      {/* Main Body */}
      <path
        d="M 32 28 C 32 12, 72 12, 72 28 L 72 92 C 72 104, 58 104, 58 94 L 58 86 L 46 86 L 46 94 C 46 104, 32 104, 32 92 Z"
        fill="#1e9e22"
        stroke="#0f172a"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path d="M 32 28 C 32 12, 72 12, 72 28 L 72 68 C 64 64, 42 66, 32 72 Z" fill="#4ade80" />

      {/* Visor */}
      <rect x="50" y="30" width="34" height="23" rx="11.5" fill="#1c3040" stroke="#0f172a" strokeWidth="5.5" />
      <rect x="52" y="32" width="30" height="19" rx="9.5" fill="#71e1ff" />
      <path d="M 52 41 C 58 47, 74 47, 80 41 C 80 47, 72 50, 66 50 C 59 50, 52 47, 52 41 Z" fill="#3290b2" />
      <ellipse cx="63" cy="37" rx="7.5" ry="3.2" transform="rotate(-15 63 37)" fill="#ffffff" opacity="0.95" />

      {/* Golden Championship Trophy Held High 🏆 */}
      <motion.g
        animate={{ y: [-2, 3, -2], rotate: [-4, 6, -4] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        transform="translate(68, 46)"
      >
        <path d="M 4 4 L 26 4 C 26 18, 19 22, 15 22 C 11 22, 4 18, 4 4 Z" fill="#facc15" stroke="#0f172a" strokeWidth="2.5" />
        <ellipse cx="15" cy="4" rx="11" ry="3" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
        <path d="M 4 8 C -3 8, -3 16, 4 16" stroke="#0f172a" strokeWidth="2.5" fill="none" />
        <path d="M 26 8 C 33 8, 33 16, 26 16" stroke="#0f172a" strokeWidth="2.5" fill="none" />
        <rect x="13" y="22" width="4" height="7" fill="#ca8a04" stroke="#0f172a" strokeWidth="2" />
        <polygon points="9,29 21,29 23,34 7,34" fill="#a16207" stroke="#0f172a" strokeWidth="2" />
        <text x="12.5" y="16" fill="#0f172a" fontSize="9" fontWeight="900" textAnchor="middle">
          ₹
        </text>
      </motion.g>

      {/* Floating Confetti */}
      <motion.circle
        cx="14"
        cy="22"
        r="3"
        fill="#f43f5e"
        animate={{ y: [0, -7, 0], opacity: [1, 0.4, 1] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
      />
      <motion.circle
        cx="96"
        cy="32"
        r="3"
        fill="#38bdf8"
        animate={{ y: [0, -9, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.4 }}
      />
      <motion.rect
        x="92"
        y="16"
        width="4.5"
        height="4.5"
        fill="#facc15"
        transform="rotate(25 94 18)"
        animate={{ rotate: [0, 180, 360] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
    </motion.svg>
  </div>
);

// 5 Milestone Stations with Rich Cartoon Aesthetic
const TIMELINE_STEPS = [
  {
    num: '01',
    sector: 'SECTOR 01: AIRLOCK BAY',
    date: 'Oct 9, 2026',
    title: 'Registration Starts',
    desc: 'The ship airlock opens! Assemble your 3–4 member crew and register your squad (₹1,200 per team).',
    badgeBg: '#e0f2fe',
    badgeText: '#0369a1',
    badgeBorder: '#7dd3fc',
    cardBg: 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%)',
    borderColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.25)',
    quote: 'Airlock open! Get your squad ID and register before spots fill up! 🚀',
    Component: CyanAirlockCrewmate,
    sound: 'pop',
  },
  {
    num: '02',
    sector: 'SECTOR 02: CAFETERIA',
    date: 'Nov 02, 2026',
    title: 'Registration Closes',
    desc: 'Emergency meeting called! Final call to lock in your squad roster and payment verification before doors close.',
    badgeBg: '#ffe4e6',
    badgeText: '#e11d48',
    badgeBorder: '#fda4af',
    cardBg: 'linear-gradient(180deg, #ffffff 0%, #fff1f2 100%)',
    borderColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    quote: 'EMERGENCY MEETING! Roster locked, do not get ejected! 🚨',
    Component: RedEmergencyCrewmate,
    sound: 'emergency',
  },
  {
    num: '03',
    sector: 'SECTOR 03: ELECTRICAL LAB',
    date: 'Nov 2, 2026',
    title: 'Problem Statements & Passes',
    desc: 'Official Problem Statements revealed and Flight Passes issued to all registered squads with venue logistics briefing.',
    badgeBg: '#fef9c3',
    badgeText: '#a16207',
    badgeBorder: '#fde047',
    cardBg: 'linear-gradient(180deg, #ffffff 0%, #fefce8 100%)',
    borderColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.25)',
    quote: 'Fixing wires in Electrical! Problem statements and Flight Passes verified with zero glitches! ⚡',
    Component: YellowWiringCrewmate,
    sound: 'complete',
  },
  {
    num: '04',
    sector: 'SECTOR 04: REACTOR ROOM',
    date: 'Nov 6–7, 2026',
    title: 'Hackathon Days (24H)',
    desc: '24 hours of non-stop offline prototyping, mentor checkpoints, and midnight coffee sprints at MIT Mysore.',
    badgeBg: '#f3e8ff',
    badgeText: '#7e22ce',
    badgeBorder: '#d8b4fe',
    cardBg: 'linear-gradient(180deg, #ffffff 0%, #faf5ff 100%)',
    borderColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.25)',
    quote: '3:00 AM coding marathon! Reactor fueled with 100% caffeine! ☕',
    Component: PurpleCodingCrewmate,
    sound: 'pop',
  },
  {
    num: '05',
    sector: 'SECTOR 05: VICTORY BRIDGE',
    date: 'Nov 7, 2026',
    title: 'Results & Awards',
    desc: 'Jury evaluation, grand stage pitching, and ₹40,000 bounty celebration ceremony.',
    badgeBg: '#dcfce7',
    badgeText: '#15803d',
    badgeBorder: '#86efac',
    cardBg: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
    borderColor: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.25)',
    quote: 'VICTORY ROYALE! Imposters defeated, ₹40,000 bounty claimed! 🏆',
    Component: LimeVictoryCrewmate,
    sound: 'complete',
  },
];

export default function PlayfulTimelineSection() {
  const [activeSpeechIdx, setActiveSpeechIdx] = useState(null);

  const handleCrewmateClick = (idx, soundType) => {
    setActiveSpeechIdx(idx);
    if (soundType === 'emergency') {
      playEmergencyMeetingSound();
    } else if (soundType === 'complete') {
      playTaskCompleteSound();
    } else {
      playCrewmatePopSound();
    }
    setTimeout(() => {
      setActiveSpeechIdx((cur) => (cur === idx ? null : cur));
    }, 3200);
  };

  return (
    <section
      id="timeline"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#fffaf3', // Warm cream matching the rest of the site!
        color: '#0f172a',
        padding: '100px 24px 120px',
        overflow: 'hidden',
        fontFamily: "'Fredoka', 'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* ── 1. Soft Warm Cream & Pastel Sky Gradient Atmosphere ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 18% 25%, rgba(254, 205, 211, 0.45) 0%, transparent 50%), radial-gradient(circle at 82% 70%, rgba(224, 242, 254, 0.5) 0%, transparent 50%), radial-gradient(circle at 50% 90%, rgba(254, 240, 138, 0.35) 0%, transparent 55%)',
          pointerEvents: 'none',
        }}
      />

      {/* Floating Star Doodles & Sparkles in Sky */}
      <div style={{ position: 'absolute', top: '40px', left: '6%', opacity: 0.85, pointerEvents: 'none' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#f59e0b">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>
      <div style={{ position: 'absolute', top: '70px', right: '10%', opacity: 0.85, pointerEvents: 'none' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#ff3b69">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>
      <div style={{ position: 'absolute', bottom: '60px', left: '12%', opacity: 0.75, pointerEvents: 'none' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#0284c7">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>

      <div style={{ maxWidth: '1360px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* ── 2. SECTION HEADER: Playful Among Us Flight Manual ── */}
        <div style={{ textAlign: 'center', marginBottom: '55px' }}>
          {/* Top Pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 22px',
              borderRadius: '100px',
              background: '#ffffff',
              border: '2px solid #e2e8f0',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
              color: '#ff3b69',
              fontSize: '13px',
              fontWeight: 900,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            <span>🚀 5 MISSION CHECKPOINTS</span>
          </motion.div>

          {/* Huge Playful Headline */}
          <h2
            style={{
              fontSize: 'clamp(2.4rem, 4.8vw, 4.2rem)',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              margin: '0 0 14px 0',
              textTransform: 'uppercase',
            }}
          >
            FLIGHT <span style={{ color: '#ff3b69' }}>TIMELINE</span>
          </h2>

          <p
            style={{
              fontSize: '16.5px',
              color: '#475569',
              maxWidth: '680px',
              margin: '0 auto 24px',
              fontWeight: 500,
              lineHeight: 1.6,
            }}
          >
            Follow the crew’s journey across 5 spaceship sectors from onboarding to the 24-hour hackathon finale at Maharaja Institute of Technology Mysore. Click any crewmate to see what they’re up to!
          </p>

          {/* Interactive Crew Task Progress Indicator */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '16px',
              background: '#ffffff',
              border: '2px solid #e2e8f0',
              borderRadius: '100px',
              padding: '8px 24px',
              boxShadow: '0 6px 18px rgba(0,0,0,0.03)',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#0f172a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              SPACESHIP STATUS: 5 OF 5 STATIONS READY
            </span>

            {/* Crew Avatars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {['#38fedc', '#ef4444', '#facc15', '#a855f7', '#22c55e'].map((col, i) => (
                <div
                  key={i}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: col,
                    border: '2px solid #0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                  title={`Sector 0${i + 1}`}
                >
                  <div style={{ width: '8px', height: '4px', borderRadius: '3px', background: '#ffffff', opacity: 0.9 }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. PLAYFUL CONNECTING CONDUIT TRACK (Desktop) ── */}
        <div
          className="timeline-conduit-cable"
          style={{
            position: 'relative',
            width: '100%',
            height: '6px',
            background: 'linear-gradient(90deg, #38bdf8 0%, #f43f5e 25%, #eab308 50%, #a855f7 75%, #22c55e 100%)',
            borderRadius: '6px',
            marginBottom: '-3px',
            zIndex: 5,
            opacity: 0.85,
            boxShadow: '0 3px 12px rgba(255, 59, 105, 0.25)',
          }}
        />

        {/* ── 4. FIVE UNIQUE AMONG US MILESTONE STATION CARDS ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '18px',
            position: 'relative',
            zIndex: 10,
          }}
          className="playful-timeline-grid"
        >
          {TIMELINE_STEPS.map((step, idx) => {
            const CharacterComponent = step.Component;
            const isSpeechActive = activeSpeechIdx === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                style={{
                  background: step.cardBg,
                  border: `3px solid ${step.borderColor}`,
                  borderRadius: '30px',
                  padding: '24px 16px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  boxShadow: `0 14px 0 rgba(15, 23, 42, 0.05), 0 20px 30px ${step.glowColor}`,
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  overflow: 'visible',
                }}
              >
                {/* Sector Header Tag */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginBottom: '12px',
                    padding: '0 4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 900,
                      color: step.badgeText,
                      background: step.badgeBg,
                      padding: '4px 9px',
                      borderRadius: '100px',
                      border: `1.5px solid ${step.badgeBorder}`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {step.sector}
                  </span>

                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 900,
                      color: '#94a3b8',
                      fontFamily: "'Fredoka', sans-serif",
                    }}
                  >
                    #{step.num}
                  </span>
                </div>

                {/* ── CUTE AMONG US CHARACTER WITH SPEECH BUBBLE ── */}
                <div
                  style={{ position: 'relative', width: '100%', marginBottom: '6px' }}
                  onMouseEnter={() => setActiveSpeechIdx(idx)}
                  onMouseLeave={() => setActiveSpeechIdx(null)}
                >
                  {/* Speech Bubble on Hover / Click */}
                  <AnimatePresence>
                    {isSpeechActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.85 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                        style={{
                          position: 'absolute',
                          bottom: '102%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#ffffff',
                          border: '2.5px solid #0f172a',
                          borderRadius: '16px',
                          padding: '8px 12px',
                          fontSize: '11px',
                          fontWeight: 900,
                          color: '#0f172a',
                          whiteSpace: 'normal',
                          width: '180px',
                          textAlign: 'center',
                          zIndex: 999,
                          boxShadow: '0 10px 25px rgba(0,0,0,0.18)',
                          lineHeight: 1.35,
                          pointerEvents: 'none',
                        }}
                      >
                        {step.quote}
                        {/* Downward triangle arrow */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '7px solid #0f172a',
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Cute Vector Character */}
                  <CharacterComponent
                    isHovered={isSpeechActive}
                    onClick={() => handleCrewmateClick(idx, step.sound)}
                  />
                </div>

                {/* Date Badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: step.badgeBg,
                    border: `1.5px solid ${step.badgeBorder}`,
                    padding: '5px 14px',
                    borderRadius: '100px',
                    fontSize: '13px',
                    fontWeight: 900,
                    color: step.badgeText,
                    marginBottom: '10px',
                    fontFamily: "'Fredoka', sans-serif",
                  }}
                >
                  <Calendar size={13} strokeWidth={2.6} />
                  <span>{step.date}</span>
                </div>

                {/* Milestone Title */}
                <h3
                  style={{
                    fontSize: '17px',
                    fontWeight: 900,
                    color: '#0f172a',
                    margin: '0 0 8px 0',
                    lineHeight: 1.25,
                  }}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: '12.5px',
                    color: '#475569',
                    lineHeight: 1.55,
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  {step.desc}
                </p>

                {/* Interactive Click Prompt Button */}
                <button
                  onClick={() => handleCrewmateClick(idx, step.sound)}
                  style={{
                    marginTop: '14px',
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '100px',
                    padding: '4px 12px',
                    color: '#64748b',
                    fontSize: '11px',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = step.badgeText;
                    e.currentTarget.style.borderColor = step.badgeBorder;
                    e.currentTarget.style.transform = 'scale(1.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#64748b';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Volume2 size={12} />
                  <span>Click character</span>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* ── 5. INTERACTIVE AMONG US FLOOR VENT ── */}
        <div
          style={{
            marginTop: '55px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              background: '#ffffff',
              border: '2px dashed #ff3b69',
              borderRadius: '24px',
              padding: '16px 32px',
              boxShadow: '0 6px 20px rgba(255, 59, 105, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} color="#ff3b69" />
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#ff3b69', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                SPACESHIP FLOOR VENT · CLICK TO VENT!
              </span>
            </div>
            <AmongUsVent crewColor="red" />
          </div>
        </div>
      </div>

      {/* ── Responsive CSS Rules ── */}
      <style>{`
        @media (max-width: 1160px) {
          .playful-timeline-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 20px !important;
          }
          .timeline-conduit-cable {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .playful-timeline-grid {
            grid-template-columns: 1fr !important;
            max-width: 400px;
            margin: 0 auto;
          }
          .timeline-conduit-cable {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
