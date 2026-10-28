import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Search, Plus, Minus, MessageSquare, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import AmongUsCrewmate from '../components/amongus/AmongUsCrewmate';
import { playCrewmatePopSound } from '../components/amongus/AmongUsSound';

const FAQS = [
  {
    id: 1,
    category: 'registration',
    question: "How do I register for HAXLR8 3.0?",
    answer: "Only the Team Leader should register! Head to the registration portal to create your team account. Once registered, the Team Leader can add their 3 to 4 team members directly from their dashboard. Team members do not need separate accounts.",
  },
  {
    id: 2,
    category: 'registration',
    question: "Who can participate in HAXLR8 3.0?",
    answer: "HAXLR8 3.0 is open to all undergraduate students currently enrolled in recognized colleges or universities across India. Beginners and experienced builders alike are warmly welcome.",
  },
  {
    id: 3,
    category: 'registration',
    question: "How many team members do I need?",
    answer: "Each team must have 3 to 4 members. Solo participation or 2-member teams are strictly not permitted for HAXLR8 3.0.",
  },
  {
    id: 4,
    category: 'registration',
    question: "Can team members be from different colleges?",
    answer: "Yes! Inter-college teams are officially allowed. You can form a squad with friends from different institutions, colleges, branches, and years.",
  },
  {
    id: 5,
    category: 'domains',
    question: "What are the focus domains for HAXLR8 3.0?",
    answer: "The hackathon challenges participants to build innovative solutions across 3 key domains: Agriculture, Healthcare, and Smart City.",
  },
  {
    id: 6,
    category: 'logistics',
    question: "What is the prize pool?",
    answer: "HAXLR8 3.0 features a confirmed cash prize pool of ₹40,000 (1st Prize: ₹20,000, 2nd Prize: ₹12,000, 3rd Prize: ₹8,000), along with official trophies, certificates, and mentorship opportunities.",
  },
  {
    id: 7,
    category: 'logistics',
    question: "Where and when will the Grand Hackathon take place?",
    answer: "The 24-hour offline hackathon finale takes place on November 6–7, 2026, hosted at Maharaja Institute of Technology Mysore, Belawadi, Mandya/Mysuru.",
  },
  {
    id: 8,
    category: 'registration',
    question: "What is the registration fee?",
    answer: "The registration fee was ₹1,200 per team (for 3 to 4 members). Registrations are now officially closed as all squad slots are filled. It covers complete 24-hour hackathon entry, Wi-Fi, mentorship, catering, meals, and official certificates.",
  },
  {
    id: 9,
    category: 'domains',
    question: "Can we choose any of the three domains?",
    answer: "Yes! Squads can select from Agriculture, Healthcare, or Smart City during team registration in their dashboard. Problem statement details will unlock on November 2nd.",
  },
  {
    id: 10,
    category: 'logistics',
    question: "Will the hackathon be in-person or online?",
    answer: "HAXLR8 3.0 is a 100% in-person 24-hour Grand Hackathon hosted at Maharaja Institute of Technology Mysore on November 6–7, 2026. There are no screening or elimination rounds—all registered and verified teams participate directly on campus!",
  },
  {
    id: 11,
    category: 'logistics',
    question: "What amenities are provided during the 24-hour event?",
    answer: "Participants receive continuous high-speed Wi-Fi, power supply, meals, snacks, midnight refreshments, workspace, and rest areas at the MIT Mysore campus.",
  },
  {
    id: 12,
    category: 'domains',
    question: "Is hardware compulsory for our project?",
    answer: "No, hardware is completely optional! Hardware is never compulsory for any domain. You have 100% freedom to identify the right real-world problem and engineer the most effective solution—whether at the core engineering level (embedded firmware, protocols, system architecture, simulation) or at the software level (full-stack web/mobile apps, AI/ML models, computer vision, data pipelines, or cloud services). What matters is bringing an authentic, unique, and well-executed solution to the problem.",
  },
  {
    id: 13,
    category: 'logistics',
    question: "What should participants bring to MIT Mysore?",
    answer: "Please bring your laptop, charger, original college student ID card, and any optional hardware/components only if your chosen solution requires them. High-speed Wi-Fi, power extensions, workstations, meals, and snacks are fully provided on campus.",
  },
];

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState(1);

  const filtered = FAQS.filter(faq => {
    const matchesCat = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleAccordion = (id) => {
    playCrewmatePopSound();
    setOpenId(openId === id ? null : id);
  };

  return (
    <div
      style={{
        backgroundColor: '#fffaf3',
        color: '#0f172a',
        minHeight: '100vh',
        fontFamily: "'Fredoka', 'Plus Jakarta Sans', sans-serif",
        paddingTop: '150px',
        paddingBottom: '100px',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        {/* Header Block */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
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
            <HelpCircle size={16} />
            <span>Hackathon Help Center</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: 'clamp(2.5rem, 5.2vw, 4.2rem)',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              margin: '0 0 16px',
            }}
          >
            Got Questions? <span style={{ color: '#ff3b69' }}>We've Got Answers!</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
              color: '#64748b',
              maxWidth: '640px',
              margin: '0 auto',
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            Everything you need to know about team formation, eligibility, domains, AI tools, and logistics.
          </motion.p>

          {/* Hand-drawn doodle */}
          <div
            style={{
              marginTop: '16px',
              display: 'inline-block',
              fontFamily: "'Patrick Hand', cursive",
              fontSize: '19px',
              color: '#ff3b69',
              background: '#fff',
              padding: '6px 20px',
              borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
              border: '2px dashed #ff3b69',
              transform: 'rotate(1deg)',
            }}
          >
            ★ NO SILLY QUESTIONS ON THIS SHIP • ASK AWAY! ★
          </div>

          {/* Search Bar */}
          <div style={{ maxWidth: '580px', margin: '32px auto 24px', position: 'relative' }}>
            <Search
              size={20}
              color="#94a3b8"
              style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by keywords (e.g., 'teams', 'prizes', 'hardware', 'AI')..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px 16px 54px',
                borderRadius: '9999px',
                border: '2px solid #e2e8f0',
                backgroundColor: '#ffffff',
                fontSize: '15px',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: 'border-color 0.2s ease',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#ff3b69'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
            />
          </div>

          {/* Category Filter Chips */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All Queries (${FAQS.length})` },
              { id: 'registration', label: 'Squad & Registration' },
              { id: 'domains', label: 'Domains & Guidelines' },
              { id: 'logistics', label: 'Venue & Prizes' },
            ].map(cat => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    playCrewmatePopSound();
                    setActiveCategory(cat.id);
                  }}
                  style={{
                    backgroundColor: active ? '#0284c7' : '#fff',
                    color: active ? '#fff' : '#0f172a',
                    border: `2px solid ${active ? '#0284c7' : '#e2e8f0'}`,
                    padding: '8px 20px',
                    borderRadius: '9999px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: active ? '0 6px 18px rgba(2, 132, 199, 0.25)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AnimatePresence>
            {filtered.map((faq, idx) => {
              const isOpen = openId === faq.id;
              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    border: `2px solid ${isOpen ? '#ff3b69' : '#f1f5f9'}`,
                    boxShadow: isOpen ? '0 12px 30px rgba(255, 59, 105, 0.1)' : '0 4px 16px rgba(0,0,0,0.03)',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    style={{
                      width: '100%',
                      padding: '22px 28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '17px',
                        fontWeight: 800,
                        color: isOpen ? '#ff3b69' : '#0f172a',
                        lineHeight: 1.4,
                      }}
                    >
                      {faq.question}
                    </span>

                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: isOpen ? '#ffe4e6' : '#f8fafc',
                        color: isOpen ? '#ff3b69' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div
                          style={{
                            padding: '0 28px 24px',
                            fontSize: '15px',
                            color: '#475569',
                            lineHeight: 1.6,
                            fontWeight: 500,
                            borderTop: '1px solid #f8fafc',
                            paddingTop: '16px',
                          }}
                        >
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 24px',
                backgroundColor: '#fff',
                borderRadius: '24px',
                border: '2px dashed #cbd5e1',
              }}
            >
              <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                No matching questions found!
              </p>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px' }}>
                Try searching with different terms or check with our team directly.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                style={{
                  backgroundColor: '#ff3b69',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

        {/* Still Need Help CTA Card */}
        <div
          style={{
            marginTop: '60px',
            backgroundColor: '#ffffff',
            borderRadius: '28px',
            border: '2px solid #fed7aa',
            padding: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            flexWrap: 'wrap',
            boxShadow: '0 12px 30px rgba(251, 146, 60, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '60px', height: '70px', flexShrink: 0 }}>
              <AmongUsCrewmate color="#f59e0b" hat="lightbulb" size={60} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
                Still have unanswered questions?
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, fontWeight: 500 }}>
                Our student coordinators and faculty team are happy to assist you 24/7.
              </p>
            </div>
          </div>

          <a
            href="/contact"
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              padding: '14px 28px',
              borderRadius: '9999px',
              fontSize: '15px',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(2, 132, 199, 0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(2, 132, 199, 0.3)';
            }}
          >
            <span>Contact Flight Deck</span>
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </div>
  );
}
