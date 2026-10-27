const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

// 1. Read Supabase configuration from .env
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);

if (!urlMatch || !keyMatch) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

const HOST_EMAIL = 'haxlr8ecemitm@gmail.com';
const HOST_PASS = 'qqucyshfxeckzqxl';
const PORTAL_URL = 'https://haxlr8.vercel.app';
const BANNER_URL = 'https://raw.githubusercontent.com/yashuhb18/Haxrl8/main/public/haxlr8-email-banner.png';
const POSTER_IMAGE_PATH = path.resolve(__dirname, '../public/haxlr8-registration-extended.jpg');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: HOST_EMAIL,
    pass: HOST_PASS
  }
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateHtml(recipientName) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HAXLR8 3.0 Registration Extended</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px 10px; color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.35); border: 1px solid #1e293b;">
    <!-- Header Banner -->
    <div style="background-color: #030712; text-align: center; border-radius: 16px 16px 0 0; overflow: hidden; line-height: 0;">
      <a href="${PORTAL_URL}" target="_blank" style="display: block; text-decoration: none;">
        <img src="${BANNER_URL}" alt="HAXLR8 3.0 - National Level 24-Hour Hackathon" width="600" style="width: 100%; max-width: 600px; height: auto; display: block; margin: 0 auto; border: 0;" />
      </a>
    </div>
    <div style="background: linear-gradient(90deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%); padding: 11px 20px; text-align: center; border-bottom: 2px solid #ff3b69;">
      <span style="color: #fda4af; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">
        🚨 OFFICIAL STARFLEET ANNOUNCEMENT • REGISTRATION EXTENDED
      </span>
    </div>

    <div style="padding: 32px 28px; line-height: 1.6;">
      <div style="display: inline-block; background-color: #fef2f2; border: 1.5px solid #fecaca; border-radius: 20px; padding: 5px 14px; margin-bottom: 16px;">
        <span style="color: #dc2626; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">
          🚨 REGISTRATION EXTENDED TILL NOV 2ND
        </span>
      </div>

      <h2 style="font-size: 23px; color: #0f172a; margin: 0 0 14px; font-weight: 900; letter-spacing: -0.02em;">
        🚨 HAXLR8 3.0 REGISTRATION EXTENDED! 🚀
      </h2>

      <p style="margin: 0 0 16px; color: #1e293b; font-size: 15px; font-weight: 600;">
        Hello ${recipientName || 'Haxlr8 Innovator'},
      </p>

      <p style="margin: 0 0 16px; color: #334155; font-size: 15px; line-height: 1.65;">
        Missed registering? You still have time! Registrations are now open until <strong>November 2, 11:59 PM</strong>. Gather your team, complete your registration, and get ready for the challenge!
      </p>

      <!-- Attached Poster Graphic -->
      <div style="margin: 22px 0; text-align: center; background: #030712; border-radius: 16px; overflow: hidden; border: 2px solid #ff3b69; box-shadow: 0 12px 32px rgba(255, 59, 105, 0.25);">
        <a href="${PORTAL_URL}" target="_blank" style="display: block;">
          <img src="cid:haxlr8-poster" alt="HAXLR8 3.0 Registration Extended till November 2nd 11:59 PM" style="width: 100%; max-width: 480px; height: auto; display: block; margin: 0 auto;" />
        </a>
      </div>

      <p style="margin: 0 0 16px; color: #334155; font-size: 15px; line-height: 1.65;">
        📢 <strong>Problem statements drop on November 2 at 11:59 PM.</strong> Choose your problem statement wisely, plan with your team, and get ready to build on <strong>November 6–7</strong> at <strong>Maharaja Institute of Technology Mysore</strong>.
      </p>

      <!-- Mission Milestones Box -->
      <div style="background-color: #fff7ed; border: 1.5px solid #fed7aa; border-radius: 14px; padding: 18px 20px; margin: 24px 0; font-size: 13.5px; color: #7c2d12; line-height: 1.6;">
        <div style="font-weight: 800; font-size: 12px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">
          🗓️ OFFICIAL MISSION TIMELINE
        </div>
        <div>• <strong>Extended Registration Deadline:</strong> November 02, 2026 (11:59 PM IST)</div>
        <div>• <strong>Problem Statements Release:</strong> November 02, 2026 (11:59 PM IST)</div>
        <div>• <strong>24-Hour Offline Hackathon:</strong> November 06–07, 2026 @ MIT Mysore Campus</div>
        <div>• <strong>Grand Cash Bounty:</strong> ₹40,000 Prize Pool + Exclusive Certificates &amp; Goodies</div>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 28px 0 20px;">
        <a href="${PORTAL_URL}" style="display: inline-block; background: linear-gradient(135deg, #ff3b69 0%, #ea580c 100%); color: #ffffff !important; padding: 15px 36px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 15px; box-shadow: 0 6px 20px rgba(234, 88, 12, 0.4); letter-spacing: 0.02em;">
          🔗 Register Now: ${PORTAL_URL} →
        </a>
      </div>

      <p style="margin: 20px 0 12px; font-size: 14.5px; color: #0f172a; font-weight: 700; text-align: center;">
        Don’t wait till the last minute — see you at HAXLR8 3.0! 🔥
      </p>

      <p style="margin: 0; font-size: 13px; color: #64748b; text-align: center; font-weight: 600;">
        #HAXLR83 &nbsp;&bull;&nbsp; #Hackathon2026 &nbsp;&bull;&nbsp; #MITMysore &nbsp;&bull;&nbsp; #IdeasTakeFlight
      </p>
    </div>

    <!-- Official Footer -->
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
        Official Mailbox: <a href="mailto:${HOST_EMAIL}" style="color: #ff3b69; text-decoration: none; font-weight: 700;">${HOST_EMAIL}</a> &bull; Portal: <a href="${PORTAL_URL}" style="color: #38bdf8; text-decoration: none; font-weight: 700;">${PORTAL_URL}</a>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function main() {
  console.log('--- HAXLR8 3.0 REGISTRATION EXTENSION BROADCAST ---');
  console.log(`Connecting to Supabase and Gmail SMTP (${HOST_EMAIL})...`);

  // Verify SMTP
  await new Promise((resolve, reject) => {
    transporter.verify((err, success) => {
      if (err) reject(err);
      else {
        console.log('✓ Gmail SMTP connection established successfully.');
        resolve(success);
      }
    });
  });

  // Fetch recipients
  const { data: members, error: mErr } = await supabase.from('team_members').select('email, full_name, is_leader, team_id');
  if (mErr) {
    console.error('Error fetching team_members:', mErr);
    process.exit(1);
  }

  const { data: reg, error: rErr } = await supabase.from('announcements').select('content').eq('tag', 'ACCOUNTS_REGISTRY');

  const recipientsMap = new Map();

  (members || []).forEach(m => {
    const email = (m.email || '').trim().toLowerCase();
    if (email && email.includes('@')) {
      recipientsMap.set(email, {
        email,
        name: (m.full_name || 'Haxlr8 Innovator').trim(),
        role: m.is_leader ? 'Leader' : 'Crewmate'
      });
    }
  });

  if (reg && reg[0]?.content) {
    try {
      const parsed = JSON.parse(reg[0].content);
      Object.values(parsed.accounts || {}).forEach(a => {
        const email = (a.email || '').trim().toLowerCase();
        if (email && email.includes('@') && !recipientsMap.has(email)) {
          recipientsMap.set(email, {
            email,
            name: (a.fullName || 'Haxlr8 Innovator').trim(),
            role: 'Registered User'
          });
        }
      });
    } catch(e) {}
  }

  const recipients = Array.from(recipientsMap.values());
  console.log(`Found ${recipients.length} distinct recipients across teams, crewmates, and registered accounts.`);

  const results = {
    total: recipients.length,
    sent: 0,
    failed: 0,
    startedAt: new Date().toISOString(),
    logs: []
  };

  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    const indexStr = `[${i + 1}/${recipients.length}]`;
    const mailOptions = {
      from: `"HAXLR8 3.0 Space Flight Command" <${HOST_EMAIL}>`,
      to: r.email,
      subject: '🚨 HAXLR8 3.0 REGISTRATION EXTENDED! Deadline: November 2, 11:59 PM 🚀',
      html: generateHtml(r.name),
      attachments: [
        {
          filename: 'haxlr8-registration-extended.jpg',
          path: POSTER_IMAGE_PATH,
          cid: 'haxlr8-poster'
        }
      ]
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`${indexStr} Sent to ${r.email} (${r.name}) - Message ID: ${info.messageId}`);
      results.sent++;
      results.logs.push({
        email: r.email,
        name: r.name,
        role: r.role,
        status: 'Delivered',
        messageId: info.messageId,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error(`${indexStr} FAILED for ${r.email}:`, err.message);
      results.failed++;
      results.logs.push({
        email: r.email,
        name: r.name,
        role: r.role,
        status: 'Failed',
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }

    // Rate-limiting delay of 450ms between sends
    await sleep(450);
  }

  results.completedAt = new Date().toISOString();
  console.log('\n=============================================');
  console.log(`BROADCAST COMPLETE! Sent: ${results.sent} | Failed: ${results.failed} | Total: ${results.total}`);
  console.log('=============================================\n');

  // Save audit log file
  fs.writeFileSync(
    path.resolve(__dirname, '../email-extension-broadcast-log.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('Saved audit log to email-extension-broadcast-log.json');
}

main().catch(err => {
  console.error('Fatal broadcast error:', err);
  process.exit(1);
});
