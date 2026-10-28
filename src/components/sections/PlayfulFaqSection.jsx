import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import AmongUsCrewmate from '../amongus/AmongUsCrewmate';

const FAQS = [
  {
    q: 'Who can participate?',
    a: 'HAXLR8 3.0 is open to all undergraduate students currently enrolled in recognized colleges or universities across India. Coders, designers, hardware tinkerers, and innovators from any engineering or science stream are welcome!',
  },
  {
    q: 'What is the team size?',
    a: 'Each team must consist of 3 to 4 members. Solo participants or 2-member teams are not allowed for this hackathon edition.',
  },
  {
    q: 'Is it open for students from other colleges?',
    a: 'Yes, absolutely! Inter-college and inter-branch teams are 100% permitted. You can team up with fellow creators from different institutions across India.',
  },
  {
    q: 'What is the registration fee?',
    a: 'The registration fee was ₹1,200 per team (for 3 to 4 members). Registrations are now officially closed as all squad slots are filled. All registered and verified teams advance directly to the 24-hour offline hackathon at Maharaja Institute of Technology Mysore!',
  },
  {
    q: 'Where and when is the hackathon held?',
    a: 'HAXLR8 3.0 is a 24-hour offline hackathon taking place on November 6–7, 2026, hosted at Maharaja Institute of Technology Mysore. Food, refreshments, Wi-Fi, and workspace are provided throughout the event.',
  },
  {
    q: 'What should we bring to MIT Mysore?',
    a: 'Please bring your laptops, chargers, and valid college student ID cards. Hardware is completely optional—teams are free to build pure software, core-level, or hybrid solutions.',
  },
  {
    q: 'Is hardware compulsory for our project?',
    a: 'No, hardware is NOT compulsory! You have complete freedom to choose the right real-world problem and craft the right solution—whether at the core engineering level (system architectures, protocols, edge computing, simulations) or software level (AI/ML, mobile/web platforms, vision models, intelligent cloud APIs). Focus on solving the problem uniquely and effectively.',
  },
];

export default function PlayfulFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section
      id="faq"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#fffaf3',
        padding: '90px 24px 110px',
        fontFamily: "'Fredoka', 'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 18px',
              borderRadius: '100px',
              background: '#e0f2fe',
              color: '#0369a1',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '14px',
            }}
          >
            <HelpCircle size={16} />
            <span>CREW QUESTIONS</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              margin: '0 0 10px 0',
            }}
          >
            FREQUENTLY ASKED QUESTIONS
          </h2>

          <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '520px', margin: '0 auto' }}>
            Got questions before boarding? Here are quick answers to get your squad ready for HAXLR8 3.0.
          </p>
        </div>

        {/* Content: Left Accordion + Right Playful Character */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 0.8fr',
            gap: '40px',
            alignItems: 'center',
          }}
          className="playful-faq-grid"
        >
          {/* Accordion Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: isOpen ? '2px solid #ff3b69' : '1.5px solid #e2e8f0',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: isOpen ? '0 10px 25px rgba(255, 59, 105, 0.1)' : '0 4px 12px rgba(0,0,0,0.03)',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: "'Fredoka', sans-serif",
                    }}
                  >
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: 800,
                        color: isOpen ? '#ff3b69' : '#0f172a',
                        paddingRight: '16px',
                      }}
                    >
                      {faq.q}
                    </span>

                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isOpen ? '#ff3b69' : '#f1f5f9',
                        color: isOpen ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isOpen ? <Minus size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div
                          style={{
                            padding: '0 24px 22px',
                            fontSize: '14.5px',
                            color: '#475569',
                            lineHeight: 1.65,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 400,
                          }}
                        >
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right: Character Illustration Asking Questions */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              background: '#fef08a',
              borderRadius: '32px',
              padding: '36px 24px',
              border: '2px solid #fde047',
              boxShadow: '0 12px 28px rgba(234, 179, 8, 0.15)',
            }}
            className="faq-character-box"
          >
            <div style={{ marginBottom: '16px' }}>
              <AmongUsCrewmate
                color="yellow"
                size={110}
                hat="mini"
                floating={true}
                interactive={true}
                speechText="Got questions? Ask!"
              />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#854d0e', margin: '0 0 6px 0' }}>
              Still Have Questions?
            </h3>

            <p style={{ fontSize: '13.5px', color: '#a16207', margin: '0 0 18px 0', lineHeight: 1.5, fontWeight: 500 }}>
              Reach out to our student & faculty coordinators at MIT Mysore anytime!
            </p>

            <a
              href="/contact"
              style={{
                background: '#0f172a',
                color: '#ffffff',
                padding: '10px 24px',
                borderRadius: '100px',
                fontSize: '13.5px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
              }}
            >
              Contact Coordinators →
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .playful-faq-grid {
            grid-template-columns: 1fr !important;
          }
          .faq-character-box {
            margin-top: 20px;
          }
        }
      `}</style>
    </section>
  );
}
