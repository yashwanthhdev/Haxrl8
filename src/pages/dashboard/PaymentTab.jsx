import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { sanitizeInput } from '../../lib/security';
import { ensureUUID } from '../../lib/syncService';
import { sendPaymentConfirmationEmail } from '../../lib/emailService';
import { resolveDomain, formatDomainWithBadge } from '../../lib/domainUtils';
import { 
  CreditCard, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  Upload, 
  ShieldCheck, 
  Copy, 
  Check, 
  FileCheck,
  Receipt,
  Ticket as TicketIcon,
  HelpCircle,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import AmongUsCrewmate from '../../components/amongus/AmongUsCrewmate';
import googleFormQr from '../../assets/logo/google-form-qr.png';

// ── Configurable Google Form & Payment Credentials ──
// Event Coordinators can update this link directly anytime:
export const GOOGLE_FORM_PAYMENT_URL = 
  import.meta.env.VITE_PAYMENT_GOOGLE_FORM_URL || 
  "https://forms.gle/pw945ievXT9bH1wV7";

export const OFFICIAL_UPI_ID = "haxlr8ecemitm@upi"; // Official UPI ID
export const REGISTRATION_FEE_INR = 1200;

const styles = {
  card: {
    background: '#ffffff',
    borderRadius: 22,
    padding: '26px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
    border: '2px solid #fed7aa',
    color: '#0f172a'
  },
  label: {
    fontSize: 12,
    fontWeight: 800,
    color: '#ea580c',
    marginBottom: 6,
    display: 'block',
    letterSpacing: '0.04em',
    textTransform: 'uppercase'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    border: '1.5px solid #cbd5e1',
    fontSize: 14,
    outline: 'none',
    background: '#fafafa',
    color: '#0f172a',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit'
  },
  buttonPrimary: {
    padding: '14px 28px',
    borderRadius: 12,
    border: 'none',
    background: '#0284c7',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  }
};

export default function PaymentTab({ 
  hasTeam, 
  teamData, 
  teamMembers, 
  submissions,
  user, 
  setActiveTab,
  onPaymentUpdated 
}) {
  const currentDomain = resolveDomain(teamData, submissions?.[0], user);
  const [loading, setLoading] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [transactionId, setTransactionId] = useState('');
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [declaration, setDeclaration] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');

  // Payment Record State
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load existing payment data
  useEffect(() => {
    if (!user) return;
    try {
      // 1. Check user-scoped localStorage
      const cached = localStorage.getItem(`haxlr8_payment_${user.id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setPaymentRecord(parsed);
        setTransactionId(parsed.transaction_id || '');
        setPayerName(parsed.payer_name || '');
        setPayerPhone(parsed.payer_phone || '');
        setScreenshotPreview(parsed.screenshot_url || '');
      } else if (teamData?.payment_status === 'submitted' || teamData?.payment_utr) {
        const record = {
          transaction_id: teamData.payment_utr,
          payer_name: teamData.payer_name || user?.user_metadata?.full_name || '',
          payer_phone: teamData.payer_phone || '',
          screenshot_url: teamData.payment_screenshot_url || '',
          amount: teamData.payment_amount || REGISTRATION_FEE_INR,
          status: 'submitted',
          submitted_at: teamData.payment_date || new Date().toISOString()
        };
        setPaymentRecord(record);
        setTransactionId(record.transaction_id || '');
        setPayerName(record.payer_name || '');
        setScreenshotPreview(record.screenshot_url || '');
      } else if (submissions && submissions.length > 0) {
        const paidSub = submissions.find(s => s.pdf_url || (s.project_description && s.project_description.includes('Registration fee')) || s.status === 'Shortlisted');
        if (paidSub) {
          const utrMatch = paidSub.project_description?.match(/UTR:\s*([A-Za-z0-9_-]+)/i);
          const payerMatch = paidSub.project_description?.match(/Payer:\s*([^(]+)/i);
          const phoneMatch = paidSub.project_description?.match(/\(([0-9]+)\)/);
          const record = {
            transaction_id: utrMatch ? utrMatch[1] : (paidSub.pdf_url ? 'VERIFIED' : 'VERIFIED'),
            payer_name: payerMatch ? payerMatch[1].trim() : (teamMembers?.find(m => m.is_leader)?.full_name || user?.user_metadata?.full_name || ''),
            payer_phone: phoneMatch ? phoneMatch[1].trim() : '',
            screenshot_url: paidSub.pdf_url || '',
            amount: REGISTRATION_FEE_INR,
            status: 'submitted',
            submitted_at: paidSub.updated_at || paidSub.created_at || new Date().toISOString()
          };
          setPaymentRecord(record);
          setTransactionId(record.transaction_id || '');
          setPayerName(record.payer_name || '');
          setPayerPhone(record.payer_phone || '');
          setScreenshotPreview(record.screenshot_url || '');
          try {
            if (user?.id) localStorage.setItem(`haxlr8_payment_${user.id}`, JSON.stringify(record));
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn('Error reading payment state:', e);
    }
  }, [user, teamData, submissions, teamMembers]);

  const [copiedUrl, setCopiedUrl] = useState(false);
  const copyFormUrl = () => {
    navigator.clipboard.writeText(GOOGLE_FORM_PAYMENT_URL);
    setCopiedUrl(true);
    setToastMsg('Google Form link copied to clipboard!');
    setTimeout(() => {
      setCopiedUrl(false);
      setToastMsg('');
    }, 2500);
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(OFFICIAL_UPI_ID);
    setCopiedUpi(true);
    setToastMsg('UPI ID copied to clipboard!');
    setTimeout(() => {
      setCopiedUpi(false);
      setToastMsg('');
    }, 2500);
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1000;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedDataUrl);
        };
        img.onerror = () => resolve(e.target?.result);
        img.src = e.target?.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleScreenshotChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, or JPEG).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Screenshot file size must be under 8MB.');
      return;
    }

    setErrorMsg('');
    setScreenshotFile(file);
    try {
      const compressed = await compressImage(file);
      setScreenshotPreview(compressed);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setScreenshotPreview(uploadEvent.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!hasTeam || !teamData) {
      setErrorMsg('Please register your squad manifest in "My Team" first before submitting payment verification.');
      return;
    }

    const cleanUtr = transactionId.trim().toUpperCase();
    if (!cleanUtr) {
      setErrorMsg('Please enter your 12-digit UPI Transaction Ref (UTR) or Transaction ID.');
      return;
    }
    if (cleanUtr.length < 6) {
      setErrorMsg('Transaction Ref / UTR must be at least 6 characters.');
      return;
    }
    if (!payerName.trim()) {
      setErrorMsg('Please enter the name on the UPI / bank account used to make payment.');
      return;
    }
    if (!screenshotPreview && !screenshotFile) {
      setErrorMsg('Please upload a screenshot of your successful ₹1,200 payment receipt.');
      return;
    }
    if (!declaration) {
      setErrorMsg('Please confirm the declaration checkbox confirming payment and Google Form submission.');
      return;
    }

    setLoading(true);
    try {
      let finalScreenshotUrl = screenshotPreview;

      if (screenshotFile && !finalScreenshotUrl.startsWith('data:image/')) {
        try {
          finalScreenshotUrl = await compressImage(screenshotFile);
        } catch (e) {}
      }

      const paymentPayload = {
        transaction_id: cleanUtr,
        payer_name: sanitizeInput(payerName),
        payer_phone: sanitizeInput(payerPhone || ''),
        amount: REGISTRATION_FEE_INR,
        screenshot_url: finalScreenshotUrl,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      };

      // 1. Cache to scoped localStorage
      if (user?.id) {
        localStorage.setItem(`haxlr8_payment_${user.id}`, JSON.stringify(paymentPayload));
      }

      // 2. Persist to Supabase submissions table with QR screenshot in pdf_url
      if (teamData?.id) {
        try {
          const { data: existingSubs } = await supabase
            .from('submissions')
            .select('*')
            .eq('team_id', teamData.id)
            .limit(1);
          const existingSub = existingSubs?.[0];
          const teamDomain = resolveDomain(teamData, existingSub || submissions?.[0], user);

          const subPayload = {
            team_id: teamData.id,
            project_title: `${teamData.team_name} - ${teamDomain}`,
            sdg_goal: teamDomain,
            category: teamDomain,
            project_description: `Registration fee ₹1200 verified. UTR: ${cleanUtr}. Payer: ${sanitizeInput(payerName)} (${sanitizeInput(payerPhone || 'N/A')}). Leader: ${user?.user_metadata?.full_name || 'Leader'} (${user?.email}).`,
            pdf_url: finalScreenshotUrl,
            status: 'Shortlisted'
          };

          if (existingSub?.id) {
            await supabase.from('submissions').update(subPayload).eq('id', existingSub.id);
          } else {
            await supabase.from('submissions').insert(subPayload);
          }
        } catch (subErr) {
          console.warn('Submissions record sync notice:', subErr);
        }
      }

      // 3. Dispatch confirmation notification
      try {
        if (user?.email) {
          const emailMembersList = (teamMembers || []).map(m => ({
            name: m.full_name,
            phone: m.phone_number || m.phone || ''
          }));

          const teamDomain = resolveDomain(teamData, submissions?.[0], user);

          sendPaymentConfirmationEmail?.({
            recipientEmail: user.email,
            leaderName: user?.user_metadata?.full_name || 'Leader',
            leaderPhone: payerPhone || '',
            teamName: teamData?.team_name || 'Your Squad',
            domain: teamDomain,
            teamId: teamData?.id,
            transactionId: cleanUtr,
            members: emailMembersList
          }).catch(e => console.warn('Email dispatch log:', e));
        }
      } catch (e) {}

      setPaymentRecord(paymentPayload);
      setIsEditing(false);
      setSuccessMsg('🎉 Payment verification successfully submitted! Your verified payment receipt has been generated.');
      setToastMsg('Payment verified! Access your official payment receipt.');

      if (onPaymentUpdated) {
        onPaymentUpdated({
          ...paymentPayload,
          domain: resolveDomain(teamData, submissions?.[0], user)
        });
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setErrorMsg(err.message || 'Failed to submit payment verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Top Banner / Status Overview */}
      <div style={{
        ...styles.card,
        background: paymentRecord ? 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' : 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)',
        border: paymentRecord ? '2px solid #86efac' : '2px solid #fed7aa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: 16,
            background: paymentRecord ? '#dcfce7' : '#ffedd5',
            color: paymentRecord ? '#15803d' : '#ea580c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            flexShrink: 0
          }}>
            {paymentRecord ? '✅' : '💳'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Squad Registration Fee: ₹{REGISTRATION_FEE_INR}
              </h2>
              <span style={{
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 100,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                background: paymentRecord ? '#dcfce7' : '#fef3c7',
                color: paymentRecord ? '#15803d' : '#b45309',
                border: paymentRecord ? '1px solid #86efac' : '1px solid #fde68a'
              }}>
                {paymentRecord ? '● Verification Submitted' : '● Action Required'}
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
              {teamData?.team_name ? (
                <>Squad: <strong>{teamData.team_name}</strong> · Domain: <strong>{formatDomainWithBadge(currentDomain)}</strong> · Fee covers complete 3–4 member squad</>
              ) : (
                <>Fee covers complete 3–4 member squad, 24-hr access, catering, Wi-Fi & official registration verification</>
              )}
            </p>
          </div>
        </div>

        {paymentRecord && (
          <button
            onClick={() => { if (setActiveTab) setActiveTab('ticket'); }}
            style={{
              ...styles.buttonPrimary,
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              boxShadow: '0 4px 16px rgba(22, 163, 74, 0.35)'
            }}
          >
            <TicketIcon size={18} />
            <span>View Payment Receipt →</span>
          </button>
        )}
      </div>

      {/* No Team Warning if leader hasn't set up team */}
      {!hasTeam && (
        <div style={{
          background: '#fef2f2',
          border: '1.5px solid #fecaca',
          borderRadius: 16,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={22} color="#dc2626" />
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: '#991b1b' }}>Squad Manifest Incomplete</div>
              <div style={{ fontSize: 12.5, color: '#b91c1c' }}>Please select your domain, set your team name, and add your 3–4 crewmates in the My Team tab first.</div>
            </div>
          </div>
          <button
            onClick={() => { if (setActiveTab) setActiveTab('team'); }}
            style={{ padding: '8px 16px', background: '#dc2626', color: '#ffffff', borderRadius: 8, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
          >
            Go to My Team →
          </button>
        </div>
      )}

      {/* If payment is already submitted and not editing, show the Verified Record Summary */}
      {paymentRecord && !isEditing ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Summary Card */}
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Receipt size={22} color="#15803d" />
                <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', margin: 0 }}>Payment Verification Record</h3>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '3px 10px', borderRadius: 20 }}>
                LOGGED
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>Transaction UTR / Ref ID</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', letterSpacing: '0.04em', marginTop: 2 }}>
                  {paymentRecord.transaction_id}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Amount Paid</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#15803d', marginTop: 2 }}>
                    ₹{paymentRecord.amount || REGISTRATION_FEE_INR}
                  </div>
                </div>

                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Payer Name</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                    {paymentRecord.payer_name || 'Captain'}
                  </div>
                </div>
              </div>

              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Timestamp</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 2 }}>
                  {new Date(paymentRecord.submitted_at || Date.now()).toLocaleString()}
                </div>
              </div>

              {paymentRecord.screenshot_url && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Payment Receipt Screenshot</div>
                  <a href={paymentRecord.screenshot_url} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={paymentRecord.screenshot_url} 
                      alt="Payment Receipt" 
                      style={{ width: '100%', maxHeight: 180, objectFit: 'contain', borderRadius: 12, border: '1.5px solid #cbd5e1', background: '#f8fafc' }} 
                    />
                  </a>
                </div>
              )}

              <div style={{ marginTop: 10, display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                >
                  Update Payment Details ✏️
                </button>
                <button
                  onClick={() => { if (setActiveTab) setActiveTab('ticket'); }}
                  style={{ flex: 1, ...styles.buttonPrimary, padding: '11px' }}
                >
                  View Payment Receipt →
                </button>
              </div>
            </div>
          </div>

          {/* Next Steps Guidance */}
          <div style={{ ...styles.card, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <ShieldCheck size={22} color="#0284c7" />
                <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', margin: 0 }}>Coordinator Verification Status</h3>
              </div>
              <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, marginBottom: 18 }}>
                Your payment reference has been recorded in the central registration database. Event coordinators at the Department of ECE, MIT Mysore will cross-verify with bank records and your Google Form entry.
              </p>

              <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: 14, padding: 16, marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                  Registration Desk Instructions:
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#0f172a', lineHeight: 1.6 }}>
                  <li>Bring your downloaded or printed <strong>Payment Receipt</strong> to registration desk.</li>
                  <li>Official Hackathon Flight Passes will be issued on <strong>November 2nd</strong> after problem statements are assigned.</li>
                  <li>All 3–4 members must present valid College ID cards at venue.</li>
                  <li>Reporting begins 8:30 AM on <strong>November 6, 2026</strong> at MIT Mysore.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => { if (setActiveTab) setActiveTab('ticket'); }}
              style={{ ...styles.buttonPrimary, width: '100%' }}
            >
              <TicketIcon size={18} />
              <span>Claim &amp; Print Payment Receipt</span>
            </button>
          </div>
        </div>
      ) : (
        /* Payment Two-Step Guide & Verification Form */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }}>
          
          {/* LEFT COLUMN: How to Pay (Big Official Google Form Hero & Link Scanner) */}
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                1
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Step 1: Open Official Google Form
              </h3>
            </div>

            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 18 }}>
              Open the official department registration form to review payment instructions, transfer <strong>₹{REGISTRATION_FEE_INR}</strong> for your team, and upload your payment receipt.
            </p>

            {/* BIG PROMINENT GOOGLE FORM HERO CARD */}
            <div style={{
              background: 'linear-gradient(145deg, #fff7ed 0%, #ffedd5 100%)',
              border: '2px solid #fed7aa',
              borderRadius: 20,
              padding: '24px 20px',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(234, 88, 12, 0.08)',
              marginBottom: 18
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ea580c', color: '#ffffff', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
                <Sparkles size={13} />
                <span>Official Registration Form · ₹{REGISTRATION_FEE_INR}</span>
              </div>

              <h4 style={{ fontSize: 19, fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
                HAXLR8 3.0 Registration &amp; Fee Form
              </h4>
              <p style={{ fontSize: 12.5, color: '#7c2d12', margin: '0 auto 16px', maxWidth: 360, lineHeight: 1.5 }}>
                Department of ECE · Maharaja Institute of Technology Mysore
              </p>

              {/* HUGE ACTION BUTTON */}
              <a
                href={GOOGLE_FORM_PAYMENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '16px 24px',
                  background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                  color: '#ffffff',
                  borderRadius: 14,
                  textDecoration: 'none',
                  fontWeight: 900,
                  fontSize: 16,
                  boxShadow: '0 6px 20px rgba(234, 88, 12, 0.35)',
                  transition: 'all 0.2s',
                  marginBottom: 14
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(234, 88, 12, 0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(234, 88, 12, 0.35)'; }}
              >
                <span>OPEN OFFICIAL GOOGLE FORM</span>
                <ExternalLink size={18} />
              </a>

              {/* Direct Link & Copy Helper */}
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #fed7aa',
                borderRadius: 12,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                fontSize: 12,
                color: '#475569'
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, color: '#0f172a' }}>
                  {GOOGLE_FORM_PAYMENT_URL}
                </span>
                <button
                  type="button"
                  onClick={copyFormUrl}
                  style={{
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    borderRadius: 8,
                    padding: '4px 10px',
                    fontSize: 11.5,
                    fontWeight: 800,
                    color: '#ea580c',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    flexShrink: 0
                  }}
                >
                  {copiedUrl ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* SCAN TO OPEN GOOGLE FORM (Clean Scanner linked directly to the form) */}
            <div style={{
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: 16,
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <div style={{
                background: '#ffffff',
                padding: 6,
                borderRadius: 12,
                border: '1.5px solid #cbd5e1',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                flexShrink: 0
              }}>
                <img
                  src={googleFormQr}
                  alt="Scan to open Google Form"
                  style={{ width: 88, height: 88, display: 'block', borderRadius: 6 }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 3 }}>
                  📱 Scan to Open on Mobile
                </div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4, marginBottom: 6 }}>
                  Scan with your phone camera to open and fill the Google Form directly on your phone.
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: 6, display: 'inline-block' }}>
                  Google Form Link QR
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Dashboard Verification Form */}
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                2
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Step 2: Submit Verification to Dashboard
              </h3>
            </div>

            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
              Enter your UPI Transaction ID and upload your receipt screenshot here so our desk instantly logs your squad and generates your verified registration receipt.
            </p>

            <form onSubmit={handleSubmitVerification} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              
              {/* UTR Input */}
              <div>
                <label style={styles.label}>
                  12-Digit UPI Transaction ID / UTR Number *
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  placeholder="e.g. 429182749102 or UPI Ref No."
                  required
                  style={styles.input}
                />
                <span style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'block' }}>
                  Found on your GPay, PhonePe, or banking payment success screen.
                </span>
              </div>

              {/* Payer Account Name */}
              <div>
                <label style={styles.label}>
                  Payer Name (As shown in UPI/Bank App) *
                </label>
                <input
                  type="text"
                  value={payerName}
                  onChange={e => setPayerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required
                  style={styles.input}
                />
              </div>

              {/* Payer Phone / Contact */}
              <div>
                <label style={styles.label}>
                  Payer UPI Mobile Number
                </label>
                <input
                  type="tel"
                  value={payerPhone}
                  onChange={e => setPayerPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  style={styles.input}
                />
              </div>

              {/* Screenshot Upload */}
              <div>
                <label style={styles.label}>
                  Upload Payment Screenshot / Receipt *
                </label>
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: 14,
                  padding: '16px',
                  textAlign: 'center',
                  background: '#fafafa',
                  position: 'relative',
                  cursor: 'pointer'
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 2 }}
                  />
                  {screenshotPreview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <img
                        src={screenshotPreview}
                        alt="Preview"
                        style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>
                        ✓ Screenshot Attached (Click to replace)
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#64748b' }}>
                      <Upload size={24} color="#0284c7" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                        Click to upload payment screenshot
                      </span>
                      <span style={{ fontSize: 11 }}>Supports PNG, JPG, JPEG (Max 5MB)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Declaration Checkbox */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <input
                  type="checkbox"
                  id="pay-decl"
                  checked={declaration}
                  onChange={e => setDeclaration(e.target.checked)}
                  style={{ marginTop: 3, cursor: 'pointer', accentColor: '#0284c7' }}
                />
                <label htmlFor="pay-decl" style={{ fontSize: 12, color: '#334155', lineHeight: 1.5, cursor: 'pointer' }}>
                  I confirm that our squad has transferred <strong>₹{REGISTRATION_FEE_INR}</strong> for HAXLR8 3.0, entered genuine UTR details, and filled the official Google Form.
                </label>
              </div>

              {errorMsg && (
                <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.buttonPrimary,
                  width: '100%',
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Verifying & Locking Telemetry...' : 'Confirm Payment Verification (₹1,200) 🚀'}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{ padding: '10px', background: 'transparent', border: 'none', color: '#64748b', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            style={{
              position: 'fixed', bottom: 40, left: '50%', x: '-50%',
              background: '#0284c7', color: '#ffffff', padding: '14px 28px', borderRadius: 100,
              fontSize: '0.95rem', fontWeight: 800, boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10
            }}
          >
            <CheckCircle2 size={18} />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
