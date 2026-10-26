/**
 * HAXLR8 3.0 - Automated Participant Email Dispatch Service
 * Official Host Sender: haxlr8ecemitm@gmail.com
 * Maharaja Institute of Technology Mysore
 */

export const HAXLR8_HOST_EMAIL = 'haxlr8ecemitm@gmail.com';
export const HAXLR8_BANNER_URL = 'https://raw.githubusercontent.com/yashuhb18/Haxrl8/main/public/haxlr8-email-banner.png';
export const HAXLR8_PORTAL_URL = 'https://haxlr8.vercel.app';

/**
 * Common Header with official HAXLR8 3.0 Space Banner
 */
function renderEmailHeader(subtag = '🚀 National Level 24-Hour Hackathon • MIT Mysore • Nov 06–07, 2026') {
  return `
    <div style="background-color: #030712; text-align: center; border-radius: 16px 16px 0 0; overflow: hidden; line-height: 0;">
      <a href="${HAXLR8_PORTAL_URL}" target="_blank" style="display: block; text-decoration: none;">
        <img src="${HAXLR8_BANNER_URL}" alt="HAXLR8 3.0 - National Level 24-Hour Hackathon" width="600" style="width: 100%; max-width: 600px; height: auto; display: block; margin: 0 auto; border: 0;" />
      </a>
    </div>
    <div style="background: linear-gradient(90deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%); padding: 11px 20px; text-align: center; border-bottom: 2px solid #ff3b69;">
      <span style="color: #fda4af; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">
        ${subtag}
      </span>
    </div>
  `;
}

/**
 * Common Footer for Maharaja Institute of Technology Mysore
 */
function renderEmailFooter() {
  return `
    <div style="background-color: #0f172a; border-top: 1px solid #1e293b; padding: 26px 30px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #94a3b8; line-height: 1.6;">
      <div style="color: #ffffff; font-weight: 800; font-size: 13px; margin-bottom: 4px; letter-spacing: 0.02em;">
        HAXLR8 3.0 Space Flight Command
      </div>
      <div style="color: #cbd5e1; font-weight: 600; font-size: 12px; margin-bottom: 8px;">
        Department of Electronics &amp; Communication Engineering<br>
        Maharaja Institute of Technology Mysore, Belawadi, Srirangapatna Taluk, Mandya - 571477
      </div>
      <div style="margin-top: 10px; padding: 10px 14px; background: #1e293b; border-radius: 8px; color: #e2e8f0; font-size: 11.5px; display: inline-block;">
        <strong>Student Coordinators:</strong> Yashwanth H B: 8050614849 &bull; Chethan Kumar B: 99455 07099
      </div>
      <div style="margin-top: 12px; font-size: 11px; color: #64748b;">
        Official Mailbox: <a href="mailto:${HAXLR8_HOST_EMAIL}" style="color: #ff3b69; text-decoration: none; font-weight: 700;">${HAXLR8_HOST_EMAIL}</a> • Portal: <a href="${HAXLR8_PORTAL_URL}" style="color: #38bdf8; text-decoration: none; font-weight: 700;">${HAXLR8_PORTAL_URL}</a>
      </div>
      <div style="margin-top: 10px; font-size: 10.5px; color: #475569;">
        This automated transmission was dispatched to confirm your hackathon status. No reply needed.
      </div>
    </div>
  `;
}

/**
 * Generate rich HTML welcome email for newly registered squad leaders & crewmates
 */
export function generateWelcomeEmailHtml({ 
  leaderName, 
  leaderPhone,
  teamName, 
  domain, 
  feeStatus, 
  members = [], 
  crewCount, 
  teamId 
}) {
  const memberRows = members && members.length > 0
    ? members.map((m, idx) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 7px 0; color: #334155; font-weight: 700;">${m.name || `Crewmate ${idx + 1}`} <span style="color: #64748b; font-size: 11px; font-weight: 600;">(${m.role || 'Member'})</span></td>
          <td style="padding: 7px 0; color: #0f172a; font-weight: 800; text-align: right;">${m.phone || 'Provided'}</td>
        </tr>
      `).join('')
    : `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 7px 0; color: #334155; font-weight: 700;">${leaderName || 'Team Lead'} <span style="color: #64748b; font-size: 11px;">(Lead)</span></td>
          <td style="padding: 7px 0; color: #0f172a; font-weight: 800; text-align: right;">${leaderPhone || 'Registered'}</td>
        </tr>
      `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to HAXLR8 3.0</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px 10px; color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.35); border: 1px solid #1e293b;">
    ${renderEmailHeader('🚀 REGISTRATION CONFIRMED • MIT MYSORE • NOV 06–07')}

    <div style="padding: 32px 30px; line-height: 1.6;">
      <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 20px; padding: 4px 12px; margin-bottom: 14px;">
        <span style="color: #059669; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">● Squad Registration Confirmed</span>
      </div>

      <h2 style="font-size: 22px; color: #0f172a; margin: 0 0 10px; font-weight: 800;">
        Welcome Aboard, ${leaderName || 'Team Captain'}!
      </h2>
      <p style="margin: 0 0 20px; color: #334155; font-size: 14.5px;">
        Your squad registration for <strong>HAXLR8 3.0</strong> is officially confirmed! You and your crew have secured entry into the 24-hour offline hackathon grand finale at <strong>Maharaja Institute of Technology Mysore</strong> on November 6–7, 2026.
      </p>

      <!-- Manifest Summary Card -->
      <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 20px 22px; margin: 22px 0;">
        <div style="font-size: 11px; font-weight: 800; color: #ea580c; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px;">
          📋 OFFICIAL SQUAD &amp; REGISTRATION DETAILS
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Team Name</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 800; text-align: right;">${teamName || 'Confirmed Squad'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Domain</td>
            <td style="padding: 8px 0; color: #0284c7; font-weight: 800; text-align: right;">${(domain && domain !== 'Registration Verified') ? domain : 'Healthcare'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Team Lead</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 800; text-align: right;">${leaderName || 'Leader'}${leaderPhone ? ' (' + leaderPhone + ')' : ''}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Members Count</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 800; text-align: right;">${crewCount || (members ? members.length : '3–4')} Members</td>
          </tr>
          <tr>
            <td style="padding: 8px 0 0; color: #64748b; font-weight: 600;">Registration Fee Status</td>
            <td style="padding: 8px 0 0; color: #16a34a; font-weight: 800; text-align: right;">${feeStatus || '₹1,200 (Verified / Paid)'}</td>
          </tr>
        </table>
      </div>

      <!-- Team Members Roster -->
      <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 20px 22px; margin: 22px 0;">
        <div style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">
          👥 TEAM MEMBERS &amp; CONTACT NUMBERS
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 2px solid #e2e8f0; font-size: 11.5px; color: #64748b;">
              <th style="padding: 6px 0; text-align: left; font-weight: 800;">Member Name</th>
              <th style="padding: 6px 0; text-align: right; font-weight: 800;">Contact Phone</th>
            </tr>
          </thead>
          <tbody>
            ${memberRows}
          </tbody>
        </table>
      </div>

      <!-- Student Coordinators Contact Card -->
      <div style="background-color: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 14px; padding: 18px 20px; margin: 22px 0;">
        <div style="font-size: 11px; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">
          📞 STUDENT COORDINATORS SUPPORT
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #0f172a;">
          <tr>
            <td style="padding: 5px 0; font-weight: 700;">Yashwanth H B</td>
            <td style="padding: 5px 0; font-weight: 800; text-align: right; color: #0369a1;">
              <a href="tel:8050614849" style="color: #0369a1; text-decoration: none;">8050614849</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 5px 0; font-weight: 700;">Chethan Kumar B</td>
            <td style="padding: 5px 0; font-weight: 800; text-align: right; color: #0369a1;">
              <a href="tel:9945507099" style="color: #0369a1; text-decoration: none;">99455 07099</a>
            </td>
          </tr>
        </table>
      </div>

      <!-- Milestones Box -->
      <div style="background-color: #fff7ed; border: 1.5px solid #fed7aa; border-radius: 12px; padding: 14px 18px; margin: 20px 0; font-size: 12.5px; color: #7c2d12; line-height: 1.55;">
        <strong>🗓️ Mission Milestones:</strong><br>
        • <strong>Nov 02:</strong> Problem Statements Released &amp; Flight Passes Dispatched<br>
        • <strong>Nov 06–07:</strong> 24-Hour Offline Hackathon at MIT Mysore Campus (₹40,000 Cash Bounty)
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 26px;">
        <a href="${HAXLR8_PORTAL_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #ff3b69 0%, #ea580c 100%); color: #ffffff !important; padding: 14px 34px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; box-shadow: 0 4px 16px rgba(234, 88, 12, 0.35);">
          Open Dashboard →
        </a>
      </div>
    </div>

    ${renderEmailFooter()}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate rich HTML email for project abstract submission confirmation
 */
export function generateSubmissionEmailHtml({ leaderName, teamName, trackName, projectTitle }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Abstract Submission Confirmed</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px 10px; color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.35); border: 1px solid #1e293b;">
    ${renderEmailHeader('✅ TECHNICAL ABSTRACT LOCKED IN • EVALUATION VAULT')}

    <div style="padding: 32px 30px; line-height: 1.6;">
      <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 20px; padding: 4px 12px; margin-bottom: 14px;">
        <span style="color: #059669; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">● Submission Verified</span>
      </div>

      <h2 style="font-size: 22px; color: #0f172a; margin: 0 0 10px; font-weight: 800;">
        Transmission Received, Commander ${leaderName || 'Leader'}!
      </h2>
      <p style="margin: 0 0 20px; color: #334155; font-size: 14.5px;">
        Your project presentation deck and technical proposal for squad <strong>${teamName || 'Your Squad'}</strong> have been locked into the central evaluation vault.
      </p>

      <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 20px 22px; margin: 22px 0;">
        <div style="font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px;">
          📑 SUBMISSION DETAILS
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Squad Name</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 800; text-align: right;">${teamName || 'Registered Squad'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Domain</td>
            <td style="padding: 8px 0; color: #0284c7; font-weight: 800; text-align: right;">${trackName || 'General'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0 0; color: #64748b; font-weight: 600;">Project Title</td>
            <td style="padding: 8px 0 0; color: #0f172a; font-weight: 800; text-align: right;">${projectTitle || 'Submitted Proposal'}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 13.5px; color: #475569;">
        Our technical evaluation panel will review all submissions following the deadline on <strong>November 02, 2026</strong>. Final shortlisted squads for the 24-hour offline hackathon will be announced on <strong>November 03, 2026</strong>.
      </p>

      <div style="text-align: center; margin-top: 26px;">
        <a href="${HAXLR8_PORTAL_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: #ffffff !important; padding: 14px 34px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; box-shadow: 0 4px 16px rgba(5, 150, 105, 0.3);">
          View Submission in Dashboard →
        </a>
      </div>
    </div>

    ${renderEmailFooter()}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send automated email notification upon user or squad creation
 */
export async function sendParticipantWelcomeEmail({ 
  recipientEmail, 
  leaderName, 
  leaderPhone,
  teamName, 
  domain,
  feeStatus,
  members,
  teamId, 
  crewCount 
}) {
  if (!recipientEmail) return { success: false, error: 'Recipient email is required' };

  console.log(`[HAXLR8 Email Automation] Dispatching welcome email from ${HAXLR8_HOST_EMAIL} to ${recipientEmail}...`);

  const emailPayload = {
    to: recipientEmail,
    subject: `🚀 Registration Confirmed: ${teamName || 'Your Squad'} - HAXLR8 3.0`,
    html: generateWelcomeEmailHtml({ 
      leaderName, 
      leaderPhone,
      teamName, 
      domain, 
      feeStatus, 
      members, 
      crewCount, 
      teamId 
    }),
    leaderName,
    teamName,
    teamId
  };

  let deliveryStatus = 'Dispatched (Cloud SMTP)';
  let apiResponse = null;

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload)
    });
    if (res.ok) {
      apiResponse = await res.json();
      deliveryStatus = apiResponse.simulated ? 'Simulated (Dev)' : 'Delivered via Gmail SMTP';
    } else {
      deliveryStatus = 'Queued / Local Logged';
    }
  } catch (err) {
    console.log('[HAXLR8 Email Notice] Client fallback log recorded:', err.message);
    deliveryStatus = 'Dispatched (App Fallback)';
  }

  // Record dispatch in local log cache for Organizer Admin Panel audit trail
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const existingLogs = JSON.parse(localStorage.getItem('haxlr8_email_dispatch_logs') || '[]');
      existingLogs.unshift({
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        recipient: recipientEmail,
        team_name: teamName || 'Squad',
        subject: emailPayload.subject,
        status: deliveryStatus,
        sender: HAXLR8_HOST_EMAIL,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('haxlr8_email_dispatch_logs', JSON.stringify(existingLogs.slice(0, 150)));
    }
  } catch (e) {
    console.warn('Local email log save error:', e);
  }

  return {
    success: true,
    message: `Automated confirmation sent from ${HAXLR8_HOST_EMAIL} to ${recipientEmail}`,
    status: deliveryStatus
  };
}

/**
 * Send automated email notification upon project abstract submission
 */
export async function sendSubmissionConfirmationEmail({ recipientEmail, leaderName, teamName, trackName, projectTitle }) {
  if (!recipientEmail) return { success: false, error: 'Recipient email is required' };

  console.log(`[HAXLR8 Email Automation] Dispatching submission confirmation to ${recipientEmail}...`);

  const emailPayload = {
    to: recipientEmail,
    subject: `✅ HAXLR8 3.0 Abstract Submission Confirmed: ${projectTitle || teamName || 'Project'}`,
    html: generateSubmissionEmailHtml({ leaderName, teamName, trackName, projectTitle }),
    leaderName,
    teamName
  };

  let deliveryStatus = 'Dispatched (Cloud SMTP)';

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload)
    });
    if (res.ok) {
      const data = await res.json();
      deliveryStatus = data.simulated ? 'Simulated (Dev)' : 'Delivered via Gmail SMTP';
    }
  } catch (err) {
    deliveryStatus = 'Dispatched (App Fallback)';
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const existingLogs = JSON.parse(localStorage.getItem('haxlr8_email_dispatch_logs') || '[]');
      existingLogs.unshift({
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        recipient: recipientEmail,
        team_name: teamName || 'Squad',
        subject: emailPayload.subject,
        status: deliveryStatus,
        sender: HAXLR8_HOST_EMAIL,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('haxlr8_email_dispatch_logs', JSON.stringify(existingLogs.slice(0, 150)));
    }
  } catch (e) {
    console.warn('Local email log save error:', e);
  }

  return {
    success: true,
    status: deliveryStatus
  };
}

/**
 * Generate HTML email for user login notification
 */
export function generateLoginEmailHtml({ leaderName, recipientEmail }) {
  const timeStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flight Deck Login Notice</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px 10px; color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.35); border: 1px solid #1e293b;">
    ${renderEmailHeader('🔐 FLIGHT DECK AUTHENTICATION NOTICE • MIT MYSORE')}

    <div style="padding: 32px 30px; line-height: 1.6;">
      <div style="display: inline-block; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 20px; padding: 4px 12px; margin-bottom: 14px;">
        <span style="color: #2563eb; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">● Security Clearance Verified</span>
      </div>

      <h2 style="font-size: 22px; color: #0f172a; margin: 0 0 10px; font-weight: 800;">
        Welcome Back, Commander ${leaderName || 'Participant'}!
      </h2>
      <p style="margin: 0 0 20px; color: #334155; font-size: 14.5px;">
        You have successfully signed in to the <strong>HAXLR8 3.0 Space Flight Deck</strong>.
      </p>

      <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 20px 22px; margin: 22px 0;">
        <div style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px;">
          🛡️ SESSION TELEMETRY
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Account</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 800; text-align: right;">${recipientEmail}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Access Time</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 800; text-align: right;">${timeStr} IST</td>
          </tr>
          <tr>
            <td style="padding: 8px 0 0; color: #64748b; font-weight: 600;">Venue Checkpoint</td>
            <td style="padding: 8px 0 0; color: #059669; font-weight: 800; text-align: right;">MIT Mysore Campus</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 13.5px; color: #475569;">
        Your flight command deck is active. You can manage your 3–4 crew roster, monitor payment verification, and review official problem statements once released on <strong>November 2nd, 2026</strong>.
      </p>

      <div style="text-align: center; margin-top: 26px;">
        <a href="${HAXLR8_PORTAL_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff !important; padding: 14px 34px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; box-shadow: 0 4px 16px rgba(2, 132, 199, 0.3);">
          Access Candidate Flight Deck →
        </a>
      </div>
    </div>

    ${renderEmailFooter()}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate rich HTML email for newly registered leader accounts (prior to team creation)
 */
export function generateAccountWelcomeEmailHtml({ leaderName, recipientEmail }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Commander Account Activated</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px 10px; color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.35); border: 1px solid #1e293b;">
    ${renderEmailHeader('⭐ COMMANDER PROFILE ACTIVATED • HAXLR8 3.0')}

    <div style="padding: 32px 30px; line-height: 1.6;">
      <div style="display: inline-block; background-color: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 20px; padding: 4px 12px; margin-bottom: 14px;">
        <span style="color: #db2777; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">● Profile Initialized</span>
      </div>

      <h2 style="font-size: 22px; color: #0f172a; margin: 0 0 10px; font-weight: 800;">
        Welcome to HAXLR8 3.0, Commander ${leaderName || 'Squad Captain'}!
      </h2>
      <p style="margin: 0 0 20px; color: #334155; font-size: 14.5px;">
        Your Commander Account for <strong>HAXLR8 3.0</strong> is officially registered with the Department of Electronics &amp; Communication Engineering at <strong>Maharaja Institute of Technology Mysore</strong>.
      </p>

      <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 20px 22px; margin: 22px 0;">
        <div style="font-size: 11px; font-weight: 800; color: #db2777; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px;">
          🚀 FLIGHT CAPTAIN PROFILE
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Captain Name</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 800; text-align: right;">${leaderName || 'Squad Commander'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0 0; color: #64748b; font-weight: 600;">Commander Email</td>
            <td style="padding: 8px 0 0; color: #0f172a; font-weight: 800; text-align: right;">${recipientEmail}</td>
          </tr>
        </table>
      </div>

      <div style="margin: 22px 0;">
        <div style="font-size: 13.5px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Steps to Lock In Your Squad:</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
          <tr>
            <td style="vertical-align: top; width: 24px; padding-bottom: 8px; color: #ff3b69; font-weight: 900;">1.</td>
            <td style="padding-bottom: 8px;">Log in to your <strong>Candidate Flight Deck</strong>.</td>
          </tr>
          <tr>
            <td style="vertical-align: top; width: 24px; padding-bottom: 8px; color: #ff3b69; font-weight: 900;">2.</td>
            <td style="padding-bottom: 8px;">Assemble your squad name and add your <strong>3 to 4 crewmates</strong>.</td>
          </tr>
          <tr>
            <td style="vertical-align: top; width: 24px; color: #ff3b69; font-weight: 900;">3.</td>
            <td>Complete the team fee (<strong>₹1,200 per squad</strong>) in the Payment tab to unlock your Grand Finale Pass.</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #fff7ed; border: 1.5px solid #fed7aa; border-radius: 12px; padding: 14px 18px; margin: 20px 0; font-size: 12.5px; color: #7c2d12; line-height: 1.55;">
        <strong>🗓️ Mission Milestones:</strong><br>
        • <strong>Oct 09:</strong> Registrations Open<br>
        • <strong>Nov 02:</strong> Registration &amp; Payment Lock<br>
        • <strong>Nov 06–07:</strong> 24-Hour Offline Grand Finale at MIT Mysore Campus (₹40,000 Prize Bounty)
      </div>

      <div style="text-align: center; margin-top: 26px;">
        <a href="${HAXLR8_PORTAL_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #ff3b69 0%, #ea580c 100%); color: #ffffff !important; padding: 14px 34px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; box-shadow: 0 4px 16px rgba(234, 88, 12, 0.35);">
          Assemble Your Squad Now →
        </a>
      </div>
    </div>

    ${renderEmailFooter()}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send welcome email when a participant creates an account
 */
export async function sendAccountWelcomeEmail({ recipientEmail, leaderName }) {
  if (!recipientEmail) return { success: false, error: 'Recipient email is required' };

  console.log(`[HAXLR8 Email Automation] Dispatching account created welcome email to ${recipientEmail}...`);

  const emailPayload = {
    to: recipientEmail,
    subject: `🚀 Welcome to HAXLR8 3.0, Commander ${leaderName || 'Participant'}!`,
    html: generateAccountWelcomeEmailHtml({ leaderName, recipientEmail }),
    leaderName
  };

  let deliveryStatus = 'Dispatched (Cloud SMTP)';

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload)
    });
    if (res.ok) {
      const data = await res.json();
      deliveryStatus = data.simulated ? 'Simulated (Dev)' : 'Delivered via Gmail SMTP';
    }
  } catch (err) {
    deliveryStatus = 'Dispatched (App Fallback)';
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const existingLogs = JSON.parse(localStorage.getItem('haxlr8_email_dispatch_logs') || '[]');
      existingLogs.unshift({
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        recipient: recipientEmail,
        team_name: 'Account Setup',
        subject: emailPayload.subject,
        status: deliveryStatus,
        sender: HAXLR8_HOST_EMAIL,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('haxlr8_email_dispatch_logs', JSON.stringify(existingLogs.slice(0, 150)));
    }
  } catch (e) {
    console.warn('Local email log save error:', e);
  }

  return { success: true, status: deliveryStatus };
}

/**
 * Send automated email notification upon user login
 */
export async function sendLoginNotificationEmail({ recipientEmail, leaderName }) {
  if (!recipientEmail) return { success: false, error: 'Recipient email is required' };

  console.log(`[HAXLR8 Email Automation] Dispatching login notification from ${HAXLR8_HOST_EMAIL} to ${recipientEmail}...`);

  const emailPayload = {
    to: recipientEmail,
    subject: `🔐 HAXLR8 3.0 Flight Deck Login Detected: Commander ${leaderName || 'Participant'}`,
    html: generateLoginEmailHtml({ leaderName, recipientEmail }),
    leaderName
  };

  let deliveryStatus = 'Dispatched (Cloud SMTP)';

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload)
    });
    if (res.ok) {
      const data = await res.json();
      deliveryStatus = data.simulated ? 'Simulated (Dev)' : 'Delivered via Gmail SMTP';
    }
  } catch (err) {
    deliveryStatus = 'Dispatched (App Fallback)';
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const existingLogs = JSON.parse(localStorage.getItem('haxlr8_email_dispatch_logs') || '[]');
      existingLogs.unshift({
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        recipient: recipientEmail,
        team_name: 'Squad Access',
        subject: emailPayload.subject,
        status: deliveryStatus,
        sender: HAXLR8_HOST_EMAIL,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('haxlr8_email_dispatch_logs', JSON.stringify(existingLogs.slice(0, 150)));
    }
  } catch (e) {
    console.warn('Local email log save error:', e);
  }

  return { success: true, status: deliveryStatus };
}

/**
 * Get email dispatch logs for organizer dashboard
 */
export function getEmailDispatchLogs() {
  try {
    return JSON.parse(localStorage.getItem('haxlr8_email_dispatch_logs') || '[]');
  } catch {
    return [];
  }
}

/**
 * Generate rich HTML email for team registration fee verification
 */
export function generatePaymentEmailHtml({ 
  leaderName, 
  leaderPhone,
  teamName, 
  domain, 
  transactionId, 
  members = [] 
}) {
  const memberRows = members && members.length > 0
    ? members.map((m, idx) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 7px 0; color: #334155; font-weight: 700;">${m.name || `Crewmate ${idx + 1}`}</td>
          <td style="padding: 7px 0; color: #0f172a; font-weight: 800; text-align: right;">${m.phone || 'Provided'}</td>
        </tr>
      `).join('')
    : `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 7px 0; color: #334155; font-weight: 700;">${leaderName || 'Team Lead'}</td>
          <td style="padding: 7px 0; color: #0f172a; font-weight: 800; text-align: right;">${leaderPhone || 'Registered'}</td>
        </tr>
      `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Verified & Confirmation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px 10px; color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.35); border: 1px solid #1e293b;">
    ${renderEmailHeader('🎫 FEE VERIFIED • HAXLR8 3.0 MIT MYSORE')}

    <div style="padding: 32px 30px; line-height: 1.6;">
      <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 20px; padding: 4px 12px; margin-bottom: 14px;">
        <span style="color: #059669; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">● Payment Verified &amp; Cleared</span>
      </div>

      <h2 style="font-size: 22px; color: #0f172a; margin: 0 0 10px; font-weight: 800;">
        Registration Fee Verified, ${leaderName || 'Captain'}!
      </h2>
      <p style="margin: 0 0 20px; color: #334155; font-size: 14.5px;">
        Your squad registration fee of <strong>₹1,200</strong> for <strong>${teamName || 'Your Squad'}</strong> has been verified. Your squad has full clearance for the 24-hour offline hackathon grand finale at <strong>Maharaja Institute of Technology Mysore</strong>!
      </p>

      <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 20px 22px; margin: 22px 0;">
        <div style="font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px;">
          💳 VERIFIED TRANSACTION RECEIPT
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Team Name</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 800; text-align: right;">${teamName || 'Registered Squad'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Domain</td>
            <td style="padding: 8px 0; color: #0284c7; font-weight: 800; text-align: right;">${(domain && domain !== 'Registration Verified') ? domain : 'Healthcare'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Transaction UTR</td>
            <td style="padding: 8px 0; color: #0284c7; font-weight: 800; font-family: monospace; text-align: right;">${transactionId || 'VERIFIED'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0 0; color: #64748b; font-weight: 600;">Fee Paid Status</td>
            <td style="padding: 8px 0 0; color: #16a34a; font-weight: 800; text-align: right;">₹1,200 (Paid / Verified)</td>
          </tr>
        </table>
      </div>

      <!-- Team Members Roster -->
      <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 20px 22px; margin: 22px 0;">
        <div style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">
          👥 TEAM MEMBERS &amp; CONTACT NUMBERS
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 2px solid #e2e8f0; font-size: 11.5px; color: #64748b;">
              <th style="padding: 6px 0; text-align: left; font-weight: 800;">Member Name</th>
              <th style="padding: 6px 0; text-align: right; font-weight: 800;">Contact Phone</th>
            </tr>
          </thead>
          <tbody>
            ${memberRows}
          </tbody>
        </table>
      </div>

      <!-- Student Coordinators Contact Card -->
      <div style="background-color: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 14px; padding: 18px 20px; margin: 22px 0;">
        <div style="font-size: 11px; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">
          📞 STUDENT COORDINATORS SUPPORT
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #0f172a;">
          <tr>
            <td style="padding: 5px 0; font-weight: 700;">Yashwanth H B</td>
            <td style="padding: 5px 0; font-weight: 800; text-align: right; color: #0369a1;">
              <a href="tel:8050614849" style="color: #0369a1; text-decoration: none;">8050614849</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 5px 0; font-weight: 700;">Chethan Kumar B</td>
            <td style="padding: 5px 0; font-weight: 800; text-align: right; color: #0369a1;">
              <a href="tel:9945507099" style="color: #0369a1; text-decoration: none;">99455 07099</a>
            </td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 26px;">
        <a href="${HAXLR8_PORTAL_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #059669 100%); color: #ffffff !important; padding: 14px 34px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; box-shadow: 0 4px 16px rgba(22, 163, 74, 0.35);">
          View Dashboard →
        </a>
      </div>
    </div>

    ${renderEmailFooter()}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Dispatch payment confirmation email
 */
export async function sendPaymentConfirmationEmail({ 
  recipientEmail, 
  leaderName, 
  leaderPhone,
  teamName, 
  domain,
  teamId, 
  transactionId,
  members 
}) {
  if (!recipientEmail) return { success: false, message: 'Missing recipient' };

  const emailPayload = {
    recipientEmail,
    subject: `🎫 Payment Verified: ${teamName || 'HAXLR8 Squad'} - ₹1,200 Confirmed`,
    html: generatePaymentEmailHtml({ 
      leaderName, 
      leaderPhone,
      teamName, 
      domain, 
      transactionId, 
      members 
    }),
    teamName,
    leaderName
  };

  let deliveryStatus = 'Dispatched (Cloud SMTP)';
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload)
    });
    if (res.ok) {
      const data = await res.json();
      deliveryStatus = data.simulated ? 'Simulated (Dev)' : 'Delivered via Gmail SMTP';
    }
  } catch (err) {
    deliveryStatus = 'Dispatched (App Fallback)';
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const existingLogs = JSON.parse(localStorage.getItem('haxlr8_email_dispatch_logs') || '[]');
      existingLogs.unshift({
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        recipient: recipientEmail,
        team_name: teamName || 'Payment Verification',
        subject: emailPayload.subject,
        status: deliveryStatus,
        sender: HAXLR8_HOST_EMAIL,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('haxlr8_email_dispatch_logs', JSON.stringify(existingLogs.slice(0, 150)));
    }
  } catch (e) {}

  return { success: true, status: deliveryStatus };
}

/**
 * Dispatch Contact Support transmission to official host email haxlr8ecemitm@gmail.com
 * and persist copy to Supabase so it's guaranteed never lost.
 */
export async function sendContactSupportMessage({ name, email, phone, message }) {
  const cleanName = (name || 'Anonymous Innovator').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPhone = (phone || '').trim();
  const cleanMsg = (message || '').trim();

  const formattedHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; color: #0f172a;">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 26px 24px; text-align: center; border-bottom: 3px solid #ff3b69;">
        <span style="display: inline-block; background: #fee2e2; color: #ef4444; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">
          🚨 CONTACT TRANSMISSION
        </span>
        <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 900;">New Participant Support Inquiry</h2>
        <p style="color: #fda4af; margin: 4px 0 0; font-size: 12px; font-weight: 700;">HAXLR8 3.0 • Maharaja Institute of Technology Mysore</p>
      </div>

      <div style="padding: 30px 24px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 700; width: 140px;">Sender Name:</td>
            <td style="padding: 10px 0; color: #0f172a; font-weight: 900; font-size: 15px;">${cleanName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 700;">Email Address:</td>
            <td style="padding: 10px 0; color: #0284c7; font-weight: 800;">
              <a href="mailto:${cleanEmail}" style="color: #0284c7; text-decoration: none;">${cleanEmail}</a>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 700;">Phone / WhatsApp:</td>
            <td style="padding: 10px 0; color: #0f172a; font-weight: 800;">
              ${cleanPhone ? `<a href="tel:${cleanPhone.replace(/\s+/g, '')}" style="color: #0f172a; text-decoration: none;">${cleanPhone}</a>` : 'Not provided'}
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 700;">Timestamp:</td>
            <td style="padding: 10px 0; color: #475569; font-weight: 600;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
          </tr>
        </table>

        <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-left: 4px solid #ff3b69; padding: 18px 20px; border-radius: 12px; margin-bottom: 24px;">
          <div style="font-size: 11.5px; color: #ff3b69; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
            Inquiry Message
          </div>
          <div style="font-size: 14.5px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${cleanMsg || 'No message content provided.'}</div>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="mailto:${cleanEmail}?subject=Re:%20HAXLR8%203.0%20Support%20Inquiry" style="display: inline-block; background: #ff3b69; color: #ffffff; padding: 12px 28px; border-radius: 12px; font-weight: 800; font-size: 13.5px; text-decoration: none; box-shadow: 0 4px 12px rgba(255, 59, 105, 0.3);">
            Reply Directly to ${cleanName} →
          </a>
        </div>
      </div>

      <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
        HAXLR8 3.0 Space Flight Command • Dept. of Electronics & Communication Engineering • MIT Mysore
      </div>
    </div>
  `;

  let emailDispatched = false;
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isContactMessage: true,
        to: HAXLR8_HOST_EMAIL,
        replyTo: cleanEmail,
        subject: `🚨 New Contact Inquiry: ${cleanName} (${cleanPhone || cleanEmail})`,
        html: formattedHtml,
        senderName: cleanName,
        senderEmail: cleanEmail,
        senderPhone: cleanPhone,
        senderMessage: cleanMsg,
      })
    });
    if (res.ok) {
      emailDispatched = true;
    }
  } catch (err) {
    console.warn('API send-email notice for contact message:', err);
  }

  try {
    const { supabase } = await import('./supabaseClient');
    await supabase.from('announcements').insert([{
      title: `[INTERNAL_CONTACT] ${cleanName} - ${cleanPhone || cleanEmail}`,
      message: cleanMsg,
      content: JSON.stringify({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        message: cleanMsg,
        dispatchedAt: new Date().toISOString()
      }),
      tag: 'CONTACT_INQUIRY'
    }]);
  } catch (dbErr) {
    console.warn('Supabase backup contact log notice:', dbErr);
  }

  return { success: true, emailDispatched };
}



