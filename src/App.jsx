import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useLocation, BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PlayfulNavbar from './components/layout/PlayfulNavbar';
import PlayfulFooter from './components/layout/PlayfulFooter';
import EntryVideoPopup from './components/ui/EntryVideoPopup';
import RegistrationExtendedModal from './components/ui/RegistrationExtendedModal';

// Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const PrizesPage = lazy(() => import('./pages/PrizesPage'));
const HighlightsPage = lazy(() => import('./pages/HighlightsPage'));
const PartnersPage = lazy(() => import('./pages/PartnersPage'));
const HumansPage = lazy(() => import('./pages/HumansPage'));
const ContactSection = lazy(() => import('./pages/ContactSection'));
const FaqSection = lazy(() => import('./pages/FaqSection'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminWhitelist = lazy(() => import('./pages/admin/AdminWhitelist'));
const AdminLogins = lazy(() => import('./pages/admin/AdminLogins'));
const AdminTeams = lazy(() => import('./pages/admin/AdminTeams'));
const AdminEvaluations = lazy(() => import('./pages/admin/AdminEvaluations'));
const AdminEvaluateSubmission = lazy(() => import('./pages/admin/AdminEvaluateSubmission'));
const AdminSubmissions = lazy(() => import('./pages/admin/AdminSubmissions'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminJury = lazy(() => import('./pages/admin/AdminJury'));
const AdminMoments = lazy(() => import('./pages/admin/AdminMoments'));
const AdminCoordinators = lazy(() => import('./pages/admin/AdminCoordinators'));
const AdminDocuments = lazy(() => import('./pages/admin/AdminDocuments'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const ShortlistedPage = lazy(() => import('./pages/ShortlistedPage'));
const WinnersPage = lazy(() => import('./pages/WinnersPage'));

/**
 * ScrollToTop Component
 * Scrolls the window to (0,0) whenever the route pathname changes.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait a tick for the new page to render, then scroll to the element
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Always scroll to top when navigating to a new page without a hash
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

// Scroll-to-top FAB (Floating Action Button)
function ScrollToTopButton() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 420);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.7, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 16 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Back to Top"
          style={{
            position: 'fixed', bottom: 32, right: 32,
            width: 48, height: 48, borderRadius: '50%',
            background: '#ffffff', color: '#ff3b69', border: '2.5px solid #ff3b69',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(255, 59, 105, 0.25)', zIndex: 900,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(255, 59, 105, 0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 59, 105, 0.25)'; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      {/* <RegistrationExtendedModal /> */}
      <Suspense fallback={
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fffaf3', color: '#0f172a', gap: 16, fontFamily: "'Fredoka', sans-serif" }}>
          <div style={{ width: 44, height: 44, border: '4px solid #fecaca', borderTopColor: '#ff3b69', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.04em', color: '#ff3b69' }}>LAUNCHING HAXLR8 3.0...</span>
        </div>
      }>
        <Routes>
          {/* Auth page — standalone, no Navbar/Footer */}
          <Route path="/register" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />

          {/* Dashboard — standalone, no Navbar/Footer */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="whitelist" element={<AdminWhitelist />} />
            <Route path="logins" element={<AdminLogins />} />
            <Route path="teams" element={<AdminTeams />} />
            <Route path="evaluations" element={<AdminEvaluations />} />
            <Route path="evaluations/:id" element={<AdminEvaluateSubmission />} />
            <Route path="jury" element={<AdminJury />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="moments" element={<AdminMoments />} />
            <Route path="coordinators" element={<AdminCoordinators />} />
            <Route path="submissions" element={<AdminSubmissions />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
          </Route>

          <Route path="/udview" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="whitelist" element={<AdminWhitelist />} />
            <Route path="logins" element={<AdminLogins />} />
            <Route path="teams" element={<AdminTeams />} />
            <Route path="evaluations" element={<AdminEvaluations />} />
            <Route path="evaluations/:id" element={<AdminEvaluateSubmission />} />
            <Route path="jury" element={<AdminJury />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="moments" element={<AdminMoments />} />
            <Route path="coordinators" element={<AdminCoordinators />} />
            <Route path="submissions" element={<AdminSubmissions />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
          </Route>

          {/* Protected redirects to prevent unauthorized public uploads */}
          <Route path="/upload-moments" element={<Navigate to="/admin/moments" replace />} />
          <Route path="/moments-upload" element={<Navigate to="/admin/moments" replace />} />
          <Route path="/upload-coordinators" element={<Navigate to="/admin/coordinators" replace />} />

          {/* All other pages — with Navbar/Footer */}
          <Route path="/*" element={
            <div className="app" style={{ minHeight: '100vh' }}>
              {/* <EntryVideoPopup /> */}
              <ScrollToTopButton />
              <PlayfulNavbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/prizes" element={<PrizesPage />} />
                <Route path="/highlights" element={<HighlightsPage />} />
                <Route path="/partners" element={<PartnersPage />} />
                <Route path="/humans" element={<HumansPage />} />
                <Route path="/faq" element={<FaqSection />} />
                <Route path="/contact" element={<ContactSection />} />
                <Route path="/terms" element={<LegalPage />} />
                <Route path="/privacy" element={<LegalPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/shortlisted" element={<ShortlistedPage />} />
                <Route path="/winners" element={<WinnersPage />} />
              </Routes>
              <PlayfulFooter />
            </div>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
