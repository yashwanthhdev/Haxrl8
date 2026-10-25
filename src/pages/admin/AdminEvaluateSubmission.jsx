import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { isOrganizerAuthorized } from './adminAuth';
import { resolveDomain } from '../../lib/domainUtils';
import { ChevronRight, ChevronLeft, CheckCircle, Mail, Phone, User, MapPin, Building2, Laptop, ShieldCheck } from 'lucide-react';

const S = {
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E5E7EB', primary: '#0284C7',
  t1: '#0F172A', t2: '#64748B', t3: '#94A3B8', green: '#16A34A',
  activeBg: '#E0F2FE', radius: '14px', pad: '24px', gap: '20px',
};

export default function AdminEvaluateSubmission() {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '/udview';
  const { id } = useParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [domainTrack, setDomainTrack] = useState('General Innovation');
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Find team by ID (or submission ID)
        let teamId = id;
        const { data: directTeam } = await supabase.from('teams').select('*').eq('id', id).maybeSingle();
        
        if (directTeam) {
          setTeam(directTeam);
          teamId = directTeam.id;
        } else {
          const { data: sub } = await supabase.from('submissions').select('*').eq('id', id).maybeSingle();
          if (sub?.team_id) {
            teamId = sub.team_id;
            const { data: t } = await supabase.from('teams').select('*').eq('id', sub.team_id).maybeSingle();
            if (t) setTeam(t);
            setDomainTrack(resolveDomain(t, sub, null, 'Healthcare'));
          }
        }

        if (teamId) {
          const [{ data: mbrs }, { data: subRec }] = await Promise.all([
            supabase.from('team_members').select('*').eq('team_id', teamId),
            supabase.from('submissions').select('*').eq('team_id', teamId).maybeSingle()
          ]);
          if (mbrs) setMembers(mbrs);
          if (subRec) setDomainTrack(resolveDomain(team, subRec, null, 'Healthcare'));

          // Check check-in status
          try {
            const saved = JSON.parse(localStorage.getItem('haxlr8_finale_checkins') || '{}');
            if (saved[teamId]) setIsCheckedIn(true);
          } catch (e) {}
        }
      } catch (err) {
        console.warn('Error fetching squad finale details:', err);
      } finally {
        setLoading(false);
      }
    }

    const checkAuth = async () => {
      const authorized = await isOrganizerAuthorized();
      if (authorized) {
        setIsAdmin(true);
        fetchData();
      } else {
        window.dispatchEvent(new Event('haxlr8_organizer_logout'));
      }
    };
    checkAuth();
  }, [id]);

  const toggleCheckIn = () => {
    if (!team?.id) return;
    try {
      const saved = JSON.parse(localStorage.getItem('haxlr8_finale_checkins') || '{}');
      const nextState = !isCheckedIn;
      saved[team.id] = nextState;
      localStorage.setItem('haxlr8_finale_checkins', JSON.stringify(saved));
      setIsCheckedIn(nextState);
    } catch (e) {}
  };

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg}}><div style={{width:40,height:40,border:'3px solid '+S.primary,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/></div>;
  if (!isAdmin) {
    return (
      <div style={{minHeight:'60vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,padding:24}}>
        <div style={{fontSize:16,fontWeight:800,color:'#b91c1c'}}>Organizer Clearance Required</div>
        <button onClick={() => window.dispatchEvent(new Event('haxlr8_organizer_logout'))} style={{padding:'10px 18px',borderRadius:10,background:'#0284c7',color:'#fff',border:'none',fontWeight:800,cursor:'pointer'}}>
          Unlock Master Command Deck 🚀
        </button>
      </div>
    );
  }

  const leader = members.find(m => m.is_leader) || members[0] || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: S.bg, overflowY: 'auto' }}>
      {/* Top Header */}
      <header style={{ height: 64, background: S.card, borderBottom: '1px solid ' + S.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate(`${basePath}/evaluations`)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: S.t2, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <ChevronLeft size={16} /> Back to Finale Desk
          </button>
          <div style={{ height: 20, width: 1, background: S.border }} />
          <h1 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: S.t1 }}>
            Squad Clearance: {team?.team_name || 'Squad Dossier'}
          </h1>
        </div>
      </header>

      {/* Main Body */}
      <div style={{ padding: '24px 28px', maxWidth: 960, margin: '0 auto', width: '100%' }}>
        <div style={{ background: S.card, border: '1.5px solid #BAE6FD', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(2, 132, 199, 0.08)', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD', textTransform: 'uppercase' }}>
                Domain: {domainTrack}
              </span>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: S.t1, margin: '8px 0 4px' }}>{team?.team_name || 'Squad'}</h2>
              <div style={{ fontSize: 13, color: S.t2 }}>Squad ID: {team?.id}</div>
            </div>

            <button 
              onClick={toggleCheckIn}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', borderRadius: 12, border: 'none',
                background: isCheckedIn ? '#DCFCE7' : '#0284C7',
                color: isCheckedIn ? '#15803D' : '#ffffff',
                fontWeight: 800, fontSize: 13, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.2)'
              }}
            >
              <CheckCircle size={16} />
              {isCheckedIn ? 'Checked-In at Venue ✓' : 'Mark Checked-In at Venue'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, background: '#F8FAFC', padding: 18, borderRadius: 14, border: '1px solid #E2E8F0' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.t3, textTransform: 'uppercase' }}>Assigned Station</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: S.primary, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Laptop size={16} /> Station B-12 (Lab 2)
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.t3, textTransform: 'uppercase' }}>Registration Fee</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#15803D', marginTop: 2 }}>
                ₹1,200 (Verified)
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.t3, textTransform: 'uppercase' }}>Squad Size</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: S.t1, marginTop: 2 }}>
                {members.length} Crew Members
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.t3, textTransform: 'uppercase' }}>Finale Access</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#059669', marginTop: 2 }}>
                100% Direct Pass
              </div>
            </div>
          </div>
        </div>

        {/* Crew Roster */}
        <h3 style={{ fontSize: 18, fontWeight: 800, color: S.t1, margin: '0 0 16px' }}>Crew Members ({members.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {members.map((m, idx) => (
            <div key={m.id || idx} style={{ background: S.card, border: '1px solid ' + S.border, borderRadius: 16, padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: m.is_leader ? '#FEF3C7' : '#E0F2FE', color: m.is_leader ? '#B45309' : '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                    {m.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: S.t1 }}>
                      {m.full_name} {m.is_leader && <span style={{ background: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 800, marginLeft: 6 }}>Commander</span>}
                    </div>
                    <div style={{ fontSize: 12, color: S.t2, marginTop: 2 }}>
                      {m.dept || 'Engineering'} · {m.year || '3rd Year'} · USN: {m.reg_no || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: 12, color: S.t2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={13} /> {m.email}
                </div>
                {m.phone_number && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <Phone size={13} /> {m.phone_number}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, color: S.t3 }}>
                  <Building2 size={13} /> {m.college_name || 'College N/A'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
