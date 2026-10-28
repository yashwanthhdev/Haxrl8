import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Home, Users, Flag, CheckSquare, Bell, LayoutDashboard, LogOut, FileText, TrendingUp, Shield, X, Camera, UserCheck, FileUp, Mail } from 'lucide-react';
import haxlr8LogoDark from '../../assets/logo/haxlr8-logo-dark.png';
import AmongUsCrewmate from '../../components/amongus/AmongUsCrewmate';
import { useAdminAuth } from './AdminAuthGate';
import { organizerLogout } from './adminAuth';
import { useAdminLayout } from './AdminLayout';

const S = {
  card: '#FFFFFF', border: '#FED7AA', primary: '#0284C7',
  t1: '#0F172A', t2: '#64748B', t3: '#94A3B8', activeBg: '#E0F2FE',
  activeBorder: '#7DD3FC',
};

const navItems = [
  { icon: Home, label: 'Command Deck', subPath: '' },
  { icon: Flag, label: 'Squads & Teams', subPath: '/teams' },
  { icon: Shield, label: 'Access Whitelist', subPath: '/whitelist' },
  { icon: Users, label: 'Participants', subPath: '/users' },
  { icon: Mail, label: 'Logged-in Accounts', subPath: '/logins' },
  { icon: FileText, label: 'Squad Payments', subPath: '/submissions' },
  { icon: CheckSquare, label: 'Finale Check-in', subPath: '/evaluations' },
  { icon: FileText, label: 'Master Export', subPath: '/jury' },
  { icon: FileUp, label: 'Docs & Desk Studio', subPath: '/documents' },
  { icon: Camera, label: 'Moments Studio', subPath: '/moments' },
  { icon: UserCheck, label: 'Coordinators Studio', subPath: '/coordinators' },
  { icon: TrendingUp, label: 'Analytics', subPath: '/analytics' },
  { icon: Bell, label: 'Announcements', subPath: '/announcements' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAdminAuth();
  const { sidebarOpen, setSidebarOpen } = useAdminLayout();
  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '/udview';

  const handleNavClick = () => {
    if (setSidebarOpen) setSidebarOpen(false);
  };

  return (
    <>
      <aside
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{
          width: 250,
          minWidth: 250,
          background: S.card,
          borderRight: '2px solid ' + S.border,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          height: '100%',
          zIndex: 9995,
        }}
      >
        <div style={{ height: 68, padding: '0 20px', borderBottom: '1.5px solid #F1E7DB', display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={haxlr8LogoDark} alt="HAXLR8 3.0" style={{ height: 26, objectFit: 'contain' }} />
          <div style={{ background: '#E0F2FE', border: '1.5px solid #BAE6FD', padding: '3px 8px', borderRadius: 8, fontSize: 10, fontWeight: 900, color: '#0369A1', letterSpacing: '0.04em' }}>
            ORGANIZER
          </div>
          {/* Mobile close button */}
          <button
            className="admin-sidebar-close-btn"
            onClick={() => setSidebarOpen && setSidebarOpen(false)}
            style={{
              marginLeft: 'auto',
              display: 'none',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              cursor: 'pointer',
              padding: 5,
              color: '#64748b',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close Sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const fullPath = `${basePath}${item.subPath}`;
            const isActive = item.subPath === ''
              ? (location.pathname === basePath || location.pathname === `${basePath}/`)
              : location.pathname.startsWith(fullPath);

            return (
              <Link
                key={i}
                to={fullPath}
                onClick={handleNavClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? S.primary : S.t2,
                  background: isActive ? S.activeBg : 'transparent',
                  border: isActive ? '1px solid ' + S.activeBorder : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'all .15s'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F0F9FF'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={17} color={isActive ? S.primary : '#94A3B8'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Among Us Crewmate Indicator */}
        <div style={{ padding: '10px 12px', margin: '0 12px 10px', background: '#F0F9FF', borderRadius: 14, border: '1.5px solid #BAE6FD', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AmongUsCrewmate color="red" size={38} hat="cap" speechText="Admin Terminal Active" />
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Admin Room</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#0284C7' }}>● Clearance Verified</div>
          </div>
        </div>

        <div style={{ padding: '16px 12px', borderTop: '1.5px solid #F1E7DB', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => {
              handleNavClick();
              navigate('/');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              color: S.t2,
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              cursor: 'pointer'
            }}
          >
            <LayoutDashboard size={16} /> Back to Site
          </button>

          <button
            onClick={async () => {
              handleNavClick();
              if (logout) {
                await logout();
              } else {
                await organizerLogout();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 800,
              color: '#B91C1C',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} /> Exit Organizer Deck
          </button>

          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, fontWeight: 700, color: '#166534', background: '#f0fdf4', padding: '5px 8px', borderRadius: 8, border: '1px solid #bbf7d0' }}>
            🔒 Persistent Organizer Session
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 900px) {
          .admin-sidebar {
            position: fixed !important;
            top: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            width: 280px !important;
            max-width: 85vw !important;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.22) !important;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
          .admin-sidebar.open {
            transform: translateX(0) !important;
          }
          .admin-sidebar-close-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
