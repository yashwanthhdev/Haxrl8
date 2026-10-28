import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/useAuth';
import haxlr8Logo from '../../assets/logo/haxlr8-logo-transparent.png';
import { Menu, X, ArrowUpRight } from 'lucide-react';

const NAV_LINKS = [
  { id: 'home', label: 'Home', path: '/', hash: '#hero' },
  { id: 'about', label: 'About', path: '/', hash: '#mission' },
  { id: 'domains', label: 'Domains', path: '/', hash: '#domains' },
  { id: 'timeline', label: 'Timeline', path: '/', hash: '#timeline' },
  { id: 'prizes', label: 'Prizes', path: '/', hash: '#reward' },
  { id: 'faq', label: 'FAQ', path: '/faq', hash: '' },
];

export default function Navbar() {
  const user = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);

      if (location.pathname !== '/') return;

      const sections = ['hero', 'mission', 'domains', 'timeline', 'reward'];
      let current = 'home';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.45) {
          current = id === 'hero' ? 'home' : id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleLinkClick = (item) => {
    setMobileOpen(false);
    if (item.path !== location.pathname) {
      navigate(item.path);
      if (item.hash) {
        setTimeout(() => {
          const el = document.getElementById(item.hash.replace('#', ''));
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } else if (item.hash) {
      const el = document.getElementById(item.hash.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isCurrentActive = (item) => {
    if (location.pathname === '/faq' && item.id === 'faq') return true;
    if (location.pathname === '/' && activeSection === item.id) return true;
    return false;
  };

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: scrolled ? 'rgba(7, 10, 19, 0.92)' : 'rgba(7, 10, 19, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'all 0.3s ease',
          boxShadow: scrolled ? '0 10px 30px rgba(0, 0, 0, 0.6)' : 'none',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand Logo */}
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            <img
              src={haxlr8Logo}
              alt="HAXLR8 3.0"
              style={{
                height: '40px',
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.35))',
              }}
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="navbar-desktop-links"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '32px',
            }}
          >
            {NAV_LINKS.map((item) => {
              const active = isCurrentActive(item);
              return (
                <button
                  key={item.id}
                  onClick={() => handleLinkClick(item)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px 0',
                    fontSize: '14px',
                    fontWeight: active ? 700 : 500,
                    color: active ? '#ef4444' : '#cbd5e1',
                    letterSpacing: '0.02em',
                    position: 'relative',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.color = '#cbd5e1';
                  }}
                >
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="activeNavLine"
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: '#ef4444',
                        boxShadow: '0 0 8px #ef4444',
                        borderRadius: '2px',
                      }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Right CTA */}
          <div
            className="navbar-desktop-cta"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <Link
              to={user ? '/dashboard' : '/login'}
              style={{ textDecoration: 'none' }}
            >
              <button className="nav-primary-red-btn">
                <span>{user ? 'Dashboard' : 'Captain Login'}</span>
                <ArrowUpRight size={16} strokeWidth={2.4} />
              </button>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X size={22} color="#ef4444" /> : <Menu size={22} color="#ffffff" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                background: 'rgba(7, 10, 19, 0.98)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '16px 24px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {NAV_LINKS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleLinkClick(item)}
                  style={{
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    padding: '10px 0',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: isCurrentActive(item) ? '#ef4444' : '#e2e8f0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{item.label}</span>
                  {isCurrentActive(item) && (
                    <span style={{ fontSize: '12px', color: '#ef4444' }}>●</span>
                  )}
                </button>
              ))}

              <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Link
                  to={user ? '/dashboard' : '/login'}
                  onClick={() => setMobileOpen(false)}
                  style={{ textDecoration: 'none' }}
                >
                  <button
                    className="nav-primary-red-btn"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>{user ? 'Dashboard' : 'Captain Login'}</span>
                    <ArrowUpRight size={16} strokeWidth={2.4} />
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <style>{`
        .nav-primary-red-btn {
          background: #dc2626;
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          padding: 8px 20px;
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.02em;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          box-shadow: 0 0 16px rgba(220, 38, 38, 0.45);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nav-primary-red-btn:hover {
          background: #ef4444;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 0 24px rgba(239, 68, 68, 0.65);
        }

        .nav-primary-red-btn:active {
          transform: translateY(0) scale(0.98);
        }

        @media (max-width: 820px) {
          .navbar-desktop-links,
          .navbar-desktop-cta {
            display: none !important;
          }
          .navbar-mobile-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
