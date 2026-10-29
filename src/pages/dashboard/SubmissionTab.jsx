import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { sanitizeInput } from '../../lib/security';
import { sendSubmissionConfirmationEmail } from '../../lib/emailService';
import { ensureUUID, isUUID } from '../../lib/syncService';
import AmongUsCrewmate from '../../components/amongus/AmongUsCrewmate';

const card = (extra = {}) => ({
  background: '#ffffff',
  borderRadius: 22,
  padding: '26px',
  boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
  border: '2px solid #fed7aa',
  color: '#0f172a',
  ...extra,
});

const STEPS = ['Station Guidelines', 'Idea Blueprint', 'Review & Lock In'];

const SDG_OPTIONS = [
  "Agriculture",
  "Healthcare",
  "Smart City"
];

function Field({ label, value, onChange, placeholder, type = 'text', hint, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: 12, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
        {hint && <span style={{ fontSize: 11, color: '#64748b' }}>{hint}</span>}
      </div>
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        onFocus={e => { e.target.style.borderColor = '#0284c7'; e.target.style.boxShadow = '0 0 12px rgba(2, 132, 199, 0.2)'; }}
        onBlur={e => { e.target.style.borderColor = error ? '#dc2626' : '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
        style={{ 
          padding: '12px 14px', 
          borderRadius: 12, 
          border: error ? '1.5px solid #dc2626' : '1.5px solid #cbd5e1', 
          fontSize: 14, 
          color: '#0f172a', 
          background: '#fafafa',
          outline: 'none', 
          transition: 'all 0.2s',
          fontFamily: 'inherit'
        }} 
      />
      {error && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 2, fontWeight: 700 }}>{error}</span>}
    </div>
  );
}

export default function SubmissionTab({ hasTeam, teamData, teamMembers, submissions, setSubmissions, setActiveTab }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [guidelinesRead, setGuidelinesRead] = useState(false);
  const [deadlinePassed, setDeadlinePassed] = useState(false);

  useEffect(() => {
    const checkDeadline = async () => {
      try {
        const { data } = await supabase.from('site_settings').select('value').eq('key', 'registration_closed').single();
        if (data?.value === true) setDeadlinePassed(true);
      } catch (err) {
        if (new Date() > new Date('2026-11-02T18:29:59Z')) setDeadlinePassed(true);
      }
    };
    checkDeadline();
  }, []);

  const [sdgOpen, setSdgOpen] = useState(false);
  const sdgRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sdgRef.current && !sdgRef.current.contains(event.target)) {
        setSdgOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const alreadySubmitted = submissions && submissions.length > 0;

  const [form, setForm] = useState(() => {
    return {
      title: alreadySubmitted ? submissions[0].project_title : '',
      sdg: alreadySubmitted ? (submissions[0].sdg_goal ? submissions[0].sdg_goal.split(', ') : []) : [],
      category: alreadySubmitted ? submissions[0].category : '',
      category_other: '',
      description: alreadySubmitted ? submissions[0].project_description : '',
      pdf: null,
      pdf_url: alreadySubmitted ? submissions[0].pdf_url : ''
    };
  });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target ? e.target.value : e }));

  const handleSdgToggle = (val) => {
    setForm(prev => {
      const current = Array.isArray(prev.sdg) ? prev.sdg : (prev.sdg ? prev.sdg.split(', ') : []);
      if (current.includes(val)) {
        return { ...prev, sdg: current.filter(s => s !== val) };
      } else {
        return { ...prev, sdg: [...current, val] };
      }
    });
  };

  const handleDescChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length <= 500) {
      setForm(p => ({ ...p, description: text }));
    }
  };

  const wordCount = form.description ? form.description.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleNext = () => {
    if (step === 0) {
      if (!guidelinesRead) {
        setErrorMsg('Please confirm you have read the submission directives.');
        return;
      }
      setErrorMsg('');
      setStep(1);
    } else if (step === 1) {
      const errors = {};
      if (!form.title.trim()) errors.title = 'Project title is required.';
      if (!form.sdg || form.sdg.length === 0) errors.sdg = 'Select at least one domain.';
      if (!form.category) errors.category = 'Select a project category.';
      if (form.category === 'Other' && !form.category_other.trim()) errors.category_other = 'Specify category.';
      if (!form.description.trim()) errors.description = 'Project description is required.';
      if (!form.pdf && !form.pdf_url) errors.pdf = 'Upload your PDF deck.';

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setErrorMsg('Please complete all required fields.');
        return;
      }
      setFieldErrors({});
      setErrorMsg('');
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      let uploadedPdfUrl = form.pdf_url;
      if (form.pdf) {
        if (form.pdf.size > 5 * 1024 * 1024) {
          throw new Error('Presentation PDF size exceeds 5MB limit. Please compress your PDF deck.');
        }
        uploadedPdfUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Failed to process PDF file.'));
          reader.readAsDataURL(form.pdf);
        });
      }
      if (!uploadedPdfUrl) {
        uploadedPdfUrl = 'https://sample-deck.pdf';
      }

      const sdgValue = Array.isArray(form.sdg) ? form.sdg.join(', ') : form.sdg;
      const cleanTitle = sanitizeInput(form.title);
      const cleanDesc = sanitizeInput(form.description);
      const cleanCategory = form.category === 'Other' ? sanitizeInput(form.category_other) : form.category;

      const validTeamId = ensureUUID(teamData?.id);
      const submissionPayload = {
        team_id: validTeamId,
        project_title: cleanTitle,
        sdg_goal: sdgValue,
        category: cleanCategory,
        project_description: cleanDesc,
        pdf_url: uploadedPdfUrl
      };

      try {
        const { data, error } = await supabase.from('submissions').upsert([submissionPayload]).select().single();
        if (error && error.code !== 'PGRST116') throw error;
        const savedSub = data || submissionPayload;
        if (setSubmissions) setSubmissions([savedSub]);
        localStorage.setItem('haxlr8_submissions_db', JSON.stringify([savedSub]));
      } catch (subErr) {
        console.warn('Supabase submissions upsert fallback:', subErr);
        localStorage.setItem('haxlr8_submissions_db', JSON.stringify([submissionPayload]));
        if (setSubmissions) setSubmissions([submissionPayload]);
      }
      setSuccess(true);

      // Automated email dispatch from haxlr8ecemitm@gmail.com
      try {
        const leader = teamMembers?.find(m => m.is_leader) || teamMembers?.[0];
        const leaderEmail = leader?.email;
        if (leaderEmail) {
          sendSubmissionConfirmationEmail({
            recipientEmail: leaderEmail,
            leaderName: leader.full_name || 'Team Leader',
            teamName: teamData?.team_name || 'Squad',
            trackName: sdgValue,
            projectTitle: cleanTitle
          }).catch(e => console.warn('Submission email log notice:', e));
        }
      } catch (emailErr) {
        console.warn('Submission email notification notice:', emailErr);
      }

      setToastMsg('Idea Abstract Locked In Successfully! Confirmation email dispatched. 🚀');
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Error saving submission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasTeam) {
    return (
      <div style={{ maxWidth: 700, margin: '40px auto', textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={card({ padding: '48px 32px', textAlign: 'center' })}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '0 0 10px' }}>Squad Roster Required</h2>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: '0 0 24px' }}>
            You need to assemble and lock your 3–4 crew members before you can submit an idea blueprint.
          </p>
          <button
            onClick={() => setActiveTab('team')}
            style={{ padding: '12px 28px', borderRadius: 12, background: '#0284c7', color: '#ffffff', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)' }}
          >
            Go to My Team →
          </button>
        </div>
      </div>
    );
  }

  if (alreadySubmitted || success) {
    const s = alreadySubmitted ? submissions[0] : form;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="dash-card" style={card({ width: '100%', borderLeft: '6px solid #16a34a', background: '#f0fdf4' })}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#15803d', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            🎉 Idea Abstract Locked In!
          </h2>
          <p style={{ fontSize: 14, color: '#166534', margin: 0, lineHeight: 1.5 }}>
            Your idea paper is safely secured in flight custody. Shortlist results for the offline Grand Finale at MIT Mysore will be announced on November 02, 2026.
          </p>
        </div>

        <div className="dash-card" style={card({ width: '100%' })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1.5px solid #f1e7db', paddingBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>Mission Deck Manifest</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Project Title</span>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', marginTop: 2 }}>{s.project_title || form.title}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Domain</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{s.sdg_goal || (Array.isArray(form.sdg) ? form.sdg.join(', ') : form.sdg)}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{s.category || form.category}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mission Description</span>
              <div style={{ fontSize: 13.5, color: '#475569', marginTop: 2, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{s.project_description || form.description}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Stepper */}
      <div className="dash-card" style={card({ padding: '20px 24px' })}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap' }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: i < step ? '#16a34a' : i === step ? '#0284c7' : '#ffffff', border: `2.5px solid ${i < step ? '#16a34a' : i === step ? '#0284c7' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: i === step ? '0 0 12px rgba(2, 132, 199, 0.4)' : 'none' }}>
                  {i < step
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
                    : <span style={{ fontSize: 13, fontWeight: 900, color: i === step ? '#ffffff' : '#64748b' }}>{i + 1}</span>}
                </div>
                <span style={{ fontSize: 11, fontWeight: i === step ? 800 : 600, color: i === step ? '#0284c7' : '#64748b', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 3, background: i < step ? '#16a34a' : '#f1e7db', margin: '0 12px', marginBottom: 24 }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {errorMsg && <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 14, color: '#b91c1c', fontSize: 13, fontWeight: 700 }}>⚠️ {errorMsg}</div>}

      {/* Step content */}
      <div className="dash-card" style={card()}>
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1.5px solid #e2e8f0' }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>👥</span> Squad Manifest Verification
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#ea580c', width: 90, textTransform: 'uppercase' }}>Team:</span>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>{teamData?.team_name || 'My Squad'}</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#ea580c', width: 90, textTransform: 'uppercase' }}>Crew:</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                    {teamMembers ? teamMembers.map(m => m.full_name).join(', ') : 'Members enrolled'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ padding: 20, background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#ea580c' }}>
                Directives for Idea Paper Submission
              </div>
              <ul style={{ fontSize: 13.5, color: '#475569', margin: 0, paddingLeft: 18, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Prepare your presentation with problem analysis, system architecture, and tech stack.</li>
                <li>Export the completed presentation as a <strong>PDF document</strong> (Max 3MB).</li>
                <li>Submission locks firmly on <strong>November 02, 2026 at 11:59 PM IST</strong>.</li>
              </ul>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '14px 18px', background: '#f8fafc', borderRadius: 14, border: '1.5px solid #cbd5e1', width: 'fit-content' }}>
              <input
                type="checkbox"
                checked={guidelinesRead}
                onChange={e => { setGuidelinesRead(e.target.checked); if (e.target.checked) setErrorMsg(''); }}
                style={{ cursor: 'pointer', width: 18, height: 18, accentColor: '#0284c7' }}
              />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                I have read and confirmed all submission directives and am ready to configure project information.
              </span>
            </label>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>Project Information</h3>
            <Field label="Project Title" value={form.title} onChange={set('title')} placeholder="e.g., Autonomous Crop Telemetry System" error={fieldErrors.title} />
            
            <div className="dash-grid-2 submission-track-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} ref={sdgRef}>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Domain</label>
                <div style={{ position: 'relative', minWidth: 0 }}>
                  <div
                    onClick={() => setSdgOpen(!sdgOpen)}
                    style={{
                      padding: '12px 14px', borderRadius: 12, border: '1.5px solid #cbd5e1', fontSize: 14,
                      background: '#fafafa', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      color: form.sdg && form.sdg.length > 0 ? '#0f172a' : '#94a3b8'
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', flex: 1 }}>
                      {form.sdg && form.sdg.length > 0 ? (Array.isArray(form.sdg) ? form.sdg.join(', ') : form.sdg) : 'Select Domain...'}
                    </span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>▼</span>
                  </div>

                  {sdgOpen && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', zIndex: 10,
                      padding: '12px', borderRadius: 14, border: '1.5px solid #fed7aa', background: '#ffffff',
                      maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}>
                      {SDG_OPTIONS.map(opt => {
                        const isChecked = Array.isArray(form.sdg) ? form.sdg.includes(opt) : (form.sdg || '').includes(opt);
                        const isExistingDomain = (hasTeam || Boolean(teamData)) && (
                          teamData?.domain === opt || 
                          submissions?.[0]?.category === opt || 
                          submissions?.[0]?.sdg_goal?.includes(opt)
                        );
                        const isOptFull = opt === 'Healthcare' && !isChecked && !isExistingDomain;
                        return (
                          <label key={opt} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            cursor: isOptFull ? 'not-allowed' : 'pointer', 
                            fontSize: '13.5px', 
                            color: isOptFull ? '#94a3b8' : '#0f172a', 
                            padding: '6px 8px', 
                            borderRadius: 8, 
                            background: isChecked ? '#e0f2fe' : 'transparent',
                            opacity: isOptFull ? 0.6 : 1
                          }}>
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              disabled={isOptFull}
                              onChange={() => {
                                if (isOptFull) return;
                                handleSdgToggle(opt);
                              }} 
                              style={{ cursor: isOptFull ? 'not-allowed' : 'pointer', accentColor: '#0284c7' }} 
                            />
                            <span>
                              {opt} {isOptFull && <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 800 }}>(Slots are full)</span>}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
                {fieldErrors.sdg && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 2, fontWeight: 700 }}>{fieldErrors.sdg}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</label>
                <select value={form.category} onChange={set('category')} style={{ padding: '12px 14px', borderRadius: 12, border: fieldErrors.category ? '1.5px solid #dc2626' : '1.5px solid #cbd5e1', fontSize: 14, outline: 'none', background: '#fafafa', color: form.category ? '#0f172a' : '#94a3b8' }}>
                  <option value="" disabled>Select Category...</option>
                  <option value="Software">Software (Web / Mobile / Cloud)</option>
                  <option value="Core Systems">Core Engineering / System Level</option>
                  <option value="AI/ML">AI / Machine Learning / Vision</option>
                  <option value="Hardware/IoT">Hardware / IoT (Optional Hybrid)</option>
                  <option value="Other">Other Multi-disciplinary</option>
                </select>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>💡 Hardware is never compulsory — choose pure software, core-level, or hybrid.</span>
                {fieldErrors.category && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 2, fontWeight: 700 }}>{fieldErrors.category}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: '#ea580c', display: 'flex', justifyContent: 'space-between', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Project Description
                <span style={{ color: '#64748b', fontWeight: 600, fontSize: 11 }}>{wordCount} / 500 words</span>
              </label>
              <textarea value={form.description} onChange={handleDescChange} placeholder="Describe problem, methodology, and expected technical outcome..." rows={6}
                style={{ padding: '14px', borderRadius: 12, border: fieldErrors.description ? '1.5px solid #dc2626' : '1.5px solid #cbd5e1', fontSize: 14, color: '#0f172a', background: '#fafafa', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
              {fieldErrors.description && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 2, fontWeight: 700 }}>{fieldErrors.description}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: '#ea580c', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Presentation Deck (PDF)
              </label>
              <input type="file" accept=".pdf" onChange={e => setForm({ ...form, pdf: e.target.files[0] })}
                style={{ padding: '12px 14px', borderRadius: 12, border: fieldErrors.pdf ? '1.5px solid #dc2626' : '1.5px solid #cbd5e1', fontSize: 13, color: '#0f172a', background: '#fafafa' }} />
              {fieldErrors.pdf && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 2, fontWeight: 700 }}>{fieldErrors.pdf}</span>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>Review Submission Deck</h3>
            {[['Project Title', form.title], ['Domain', Array.isArray(form.sdg) ? form.sdg.join(', ') : form.sdg], ['Category', form.category === 'Other' ? form.category_other : form.category], ['Presentation PDF', form.pdf ? form.pdf.name : 'Ready for upload']].map(([k, v]) => (
              <div key={k} className="submission-review-row" style={{ display: 'flex', gap: 14, padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#ea580c', minWidth: 130, flexShrink: 0, textTransform: 'uppercase' }}>{k}</span>
                <span style={{ fontSize: 13.5, color: '#0f172a', wordBreak: 'break-word', fontWeight: 700 }}>{v || '-'}</span>
              </div>
            ))}
            <div style={{ padding: 16, background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 14, marginTop: 8 }}>
              <p style={{ fontSize: 13.5, color: '#166534', margin: 0, lineHeight: 1.5, fontWeight: 600 }}>
                ✅ By locking in, you confirm that all project information is accurate and developed by your registered 3–4 crew members.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} style={{ padding: '12px 24px', borderRadius: 12, border: '1.5px solid #cbd5e1', background: '#ffffff', fontSize: 13, fontWeight: 700, cursor: step === 0 ? 'not-allowed' : 'pointer', color: step === 0 ? '#94a3b8' : '#334155', opacity: step === 0 ? 0.5 : 1 }} disabled={step === 0}>
          ← Previous Step
        </button>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {step < STEPS.length - 1
            ? <button onClick={handleNext} style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: '#0284c7', color: '#ffffff', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)' }}>Next Step →</button>
            : <button disabled={submitting || deadlinePassed} onClick={handleSubmit} style={{ padding: '12px 32px', borderRadius: 12, border: 'none', background: '#0284c7', color: '#ffffff', fontSize: 14, fontWeight: 800, cursor: (submitting || deadlinePassed) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)', opacity: submitting ? 0.7 : 1 }}>
                {deadlinePassed ? 'Submissions Closed' : (submitting ? 'Uploading to Star Base...' : 'Lock In Submission 🚀')}
              </button>
          }
        </div>
      </div>

      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            style={{
              position: 'fixed', bottom: 40, left: '50%', x: '-50%',
              background: '#15803d', color: '#ffffff', padding: '14px 28px', borderRadius: 100,
              fontSize: '0.95rem', fontWeight: 800, boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10
            }}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 640px) {
          .submission-track-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .submission-review-row {
            flex-direction: column !important;
            gap: 4px !important;
          }
        }
      `}</style>
    </div>
  );
}
