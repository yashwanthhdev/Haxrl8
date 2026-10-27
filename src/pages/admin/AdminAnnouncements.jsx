import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { isOrganizerAuthorized } from './adminAuth';
import { Calendar, Bell, Search, ChevronDown, ChevronRight, ChevronLeft, Plus, Megaphone, Eye, Edit, Trash2, X, Mail } from 'lucide-react';
import { filterRealAnnouncements, deleteAnnouncement } from '../../lib/announcementsService';

const S = {
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E5E7EB', primary: '#6C4EFF',
  t1: '#111827', t2: '#6B7280', t3: '#9CA3AF', green: '#16A34A',
  activeBg: '#EEE8FF', radius: '14px', pad: '24px', gap: '20px',
};



export default function AdminAnnouncements() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ title: '', message: '', tag: 'General' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (data) {
      setAnnouncements(filterRealAnnouncements(data));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
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
  }, [fetchData]);



  const handleOpenModal = (announcement = null) => {
    if (announcement) {
      setIsEditing(true);
      setCurrentId(announcement.id);
      setFormData({ title: announcement.title, message: announcement.message, tag: announcement.tag || 'General' });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({ title: '', message: '', tag: 'General' });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.message) {
      alert("Title and message are required.");
      return;
    }
    setIsSaving(true);
    try {
      if (isEditing) {
        const { error } = await supabase.from('announcements').update({
          title: formData.title,
          message: formData.message,
          tag: formData.tag
        }).eq('id', currentId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('announcements').insert([{
          title: formData.title,
          message: formData.message,
          tag: formData.tag
        }]);
        if (error) throw error;
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert("Error saving announcement: " + error.message);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this announcement?')) {
      await deleteAnnouncement(id);
      fetchData();
    }
  };

  if (loading && announcements.length === 0) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg}}><div style={{width:40,height:40,border:'3px solid '+S.primary,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/></div>;
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

  const filteredAnnouncements = announcements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (a.message && a.message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const currentItems = filteredAnnouncements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const mostRecent = announcements.length > 0 ? new Date(announcements[0].created_at) : null;

  return (
    <>
        {/* TOP NAV */}
        <header style={{ height:64, background:S.card, borderBottom:'1px solid '+S.border, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div>
              <h1 style={{ fontSize:18, fontWeight:700, margin:0, color:S.t1 }}>Dashboard</h1>
              <div style={{ fontSize:11, fontWeight:500, color:S.t2, display:'flex', alignItems:'center', gap:4 }}>Home <ChevronRight size={12}/> <span style={{color:S.t1}}>Announcements</span></div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>

            <div style={{ position:'relative', cursor:'pointer' }}>
              <Bell size={20} color={S.t2}/>
              <div style={{ position:'absolute', top:-4, right:-4, width:16, height:16, background:'#EF4444', color:'#fff', borderRadius:'50%', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid '+S.card }}>3</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, borderLeft:'1px solid '+S.border, paddingLeft:20, cursor:'pointer' }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:'#059669', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:14 }}>A</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:S.t1 }}>Admin User</div>
                <div style={{ fontSize:11, fontWeight:500, color:S.t2 }}>Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div style={{ flex:1, overflowY:'auto', padding:S.pad, display:'flex', flexDirection:'column', gap:S.gap }}>
          
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:10 }}>
            <div>
              <h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>Announcements</h2>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <button 
                onClick={() => {
                  alert("🚨 Registration Extension Broadcast Status:\n\nOfficial extension emails with the event flyer are dispatched to all 129 registered participants, team leaders, and logins from haxlr8ecemitm@gmail.com.\n\nAll teams have also received the notification in their Announcements tab.");
                }} 
                style={{ display:'flex', alignItems:'center', gap:6, background:'#FEF2F2', color:'#DC2626', border:'1.5px solid #FECACA', padding:'10px 16px', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer' }}
              >
                <Mail size={15}/> 🚨 Extension Email Broadcast (129 Sent)
              </button>
              <button onClick={() => handleOpenModal()} style={{ display:'flex', alignItems:'center', gap:6, background:S.primary, color:'#fff', border:'none', padding:'10px 16px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', boxShadow:'0 1px 2px rgba(0,0,0,.04)' }}>
                <Plus size={16}/> New Announcement
              </button>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:S.gap }}>
            <div style={{ background:S.card, border:'1px solid '+S.border, borderRadius:S.radius, padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,.04)', display:'flex', gap:16, alignItems:'flex-start' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:'#F3E8FF', color:'#9333EA', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Megaphone size={20}/>
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:S.t2, marginBottom:4 }}>Total Announcements</div>
                <div style={{ fontSize:24, fontWeight:800, color:S.t1 }}>{announcements.length}</div>
              </div>
            </div>
            
            <div style={{ background:S.card, border:'1px solid '+S.border, borderRadius:S.radius, padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,.04)', display:'flex', gap:16, alignItems:'flex-start' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:'#DCFCE7', color:'#16A34A', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Calendar size={20}/>
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:S.t2, marginBottom:4 }}>Most Recent</div>
                <div style={{ fontSize:16, fontWeight:800, color:S.t1, marginTop:4 }}>{mostRecent ? mostRecent.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : '-'}</div>
                <div style={{ fontSize:12, fontWeight:600, color:S.t3, marginTop:2 }}>{mostRecent ? mostRecent.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}) : '-'}</div>
              </div>
            </div>

            <div style={{ background:S.card, border:'1px solid '+S.border, borderRadius:S.radius, padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,.04)', display:'flex', gap:16, alignItems:'flex-start' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:'#DBEAFE', color:'#2563EB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Eye size={20}/>
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:S.t2, marginBottom:4 }}>Visible to</div>
                <div style={{ fontSize:16, fontWeight:800, color:S.t1, marginTop:8 }}>All Participants</div>
              </div>
            </div>
          </div>

          <div style={{ background:S.card, border:'1px solid '+S.border, borderRadius:S.radius, boxShadow:'0 1px 3px rgba(0,0,0,.04)', display:'flex', flexDirection:'column', flex:1 }}>
            <div style={{ padding:'20px', borderBottom:'1px solid '+S.border, display:'flex', alignItems:'center' }}>
              <div style={{ position:'relative', minWidth:300 }}>
                <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:S.t3 }}/>
                <input 
                  placeholder="Search announcements..." 
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft:36, paddingRight:16, paddingTop:10, paddingBottom:10, background:S.card, border:'1px solid '+S.border, borderRadius:8, fontSize:13, width:'100%', outline:'none', color:S.t1 }}
                />
              </div>
            </div>

            <div style={{ overflowX:'auto', flex:1 }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ background:'#FAFAFA', borderBottom:'1px solid '+S.border }}>
                    <th style={{ padding:'16px 20px', fontWeight:600, color:S.t2, textAlign:'left' }}>Announcement</th>
                    <th style={{ padding:'16px 20px', fontWeight:600, color:S.t2, textAlign:'left' }}>Date & Time</th>
                    <th style={{ padding:'16px 20px', fontWeight:600, color:S.t2, textAlign:'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(a => {
                    const iconColors = [
                      { bg: '#F3E8FF', c: '#9333EA' },
                      { bg: '#DCFCE7', c: '#16A34A' },
                      { bg: '#DBEAFE', c: '#2563EB' },
                      { bg: '#FEF3C7', c: '#D97706' },
                      { bg: '#E0F2FE', c: '#0284C7' }
                    ];
                    const ac = iconColors[a.title.length % iconColors.length];

                    return (
                      <tr key={a.id} style={{ borderBottom:'1px solid #F8FAFC' }}>
                        <td style={{ padding:'16px 20px' }}>
                          <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
                            <div style={{ width:36, height:36, borderRadius:'8px', background:ac.bg, color:ac.c, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <Megaphone size={18}/>
                            </div>
                            <div>
                              <div style={{ fontWeight:700, color:S.t1, fontSize:14 }}>{a.title}</div>
                              <div style={{ fontSize:12, color:S.t3, marginTop:4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', lineHeight:1.5 }}>
                                {a.message}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:'16px 20px', verticalAlign:'top' }}>
                          <div style={{ fontSize:13, color:S.t1, fontWeight:600 }}>
                            {new Date(a.created_at).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'})}
                          </div>
                          <div style={{ fontSize:12, color:S.t3, marginTop:4 }}>
                            {new Date(a.created_at).toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit'})}
                          </div>
                        </td>
                        <td style={{ padding:'16px 20px', textAlign:'center', verticalAlign:'top' }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                            <button onClick={() => handleOpenModal(a)} style={{ background:S.card, border:'1px solid '+S.border, borderRadius:6, color:S.t2, cursor:'pointer', padding:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <Edit size={14}/>
                            </button>
                            <button onClick={() => handleDelete(a.id)} style={{ background:S.card, border:'1px solid '+S.border, borderRadius:6, color:'#EF4444', cursor:'pointer', padding:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <Trash2 size={14}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {currentItems.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ padding:40, textAlign:'center', color:S.t3 }}>No announcements found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ padding:'16px 20px', borderTop:'1px solid '+S.border, display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13 }}>
              <div style={{ color:S.t2, fontWeight:500 }}>Showing {filteredAnnouncements.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAnnouncements.length)} of {filteredAnnouncements.length} announcements</div>
              {totalPages > 1 && (
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ background:S.card, border:'1px solid '+S.border, borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color: currentPage === 1 ? S.border : S.t3, cursor: currentPage === 1 ? 'default' : 'pointer' }}><ChevronLeft size={14}/></button>
                  
                  {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setCurrentPage(p)} style={{ background: currentPage === p ? '#EEE8FF' : S.card, border: currentPage === p ? 'none' : '1px solid '+S.border, borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color: currentPage === p ? S.primary : S.t2, fontWeight: currentPage === p ? 700 : 600, cursor:'pointer' }}>{p}</button>
                  ))}
                  
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ background:S.card, border:'1px solid '+S.border, borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color: currentPage === totalPages ? S.border : S.t3, cursor: currentPage === totalPages ? 'default' : 'pointer' }}><ChevronRight size={14}/></button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* MODAL */}
        {showModal && (
          <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
            <div style={{ background:S.card, borderRadius:S.radius, width:400, padding:24, boxShadow:'0 10px 15px rgba(0,0,0,0.1)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <h3 style={{ margin:0, fontSize:18, fontWeight:700 }}>{isEditing ? 'Edit Announcement' : 'New Announcement'}</h3>
                <button onClick={() => setShowModal(false)} style={{ background:'transparent', border:'none', cursor:'pointer', color:S.t3 }}><X size={20}/></button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:S.t2, marginBottom:4 }}>Title</label>
                  <input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={{ width:'100%', padding:10, borderRadius:8, border:'1px solid '+S.border, fontSize:13 }} placeholder="Announcement title" />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:S.t2, marginBottom:4 }}>Message</label>
                  <textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} style={{ width:'100%', padding:10, borderRadius:8, border:'1px solid '+S.border, fontSize:13, minHeight:100, resize:'vertical' }} placeholder="Announcement details..." />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:S.t2, marginBottom:4 }}>Tag</label>
                  <select value={formData.tag} onChange={(e) => setFormData({...formData, tag: e.target.value})} style={{ width:'100%', padding:10, borderRadius:8, border:'1px solid '+S.border, fontSize:13 }}>
                    <option value="General">General</option>
                    <option value="Important">Important</option>
                    <option value="Update">Update</option>
                  </select>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:12, marginTop:24 }}>
                <button onClick={() => setShowModal(false)} style={{ background:'transparent', border:'1px solid '+S.border, padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
                <button onClick={handleSave} disabled={isSaving} style={{ background:S.primary, color:'#fff', border:'none', padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor: isSaving ? 'default' : 'pointer', opacity: isSaving ? 0.7 : 1 }}>{isSaving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        )}
      
    </>
  );
}

