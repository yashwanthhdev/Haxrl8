import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Read Supabase configuration from .env
const envPath = path.resolve(__dirname, '../.env');
let supabaseUrl = process.env.VITE_SUPABASE_URL || '';
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
let hostEmail = process.env.HOST_EMAIL || 'haxlr8ecemitm@gmail.com';
let hostPass = process.env.HOST_EMAIL_PASSWORD || 'qqucyshfxeckzqxl';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
  const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
  const emailMatch = envContent.match(/HOST_EMAIL=([^\r\n]+)/);
  const passMatch = envContent.match(/HOST_EMAIL_PASSWORD=([^\r\n]+)/);

  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (keyMatch) supabaseKey = keyMatch[1].trim();
  if (emailMatch) hostEmail = emailMatch[1].trim();
  if (passMatch) hostPass = passMatch[1].trim().replace(/\s+/g, '');
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const PORTAL_URL = 'https://haxlr8.vercel.app';
const BANNER_URL = 'https://raw.githubusercontent.com/yashuhb18/Haxrl8/main/public/haxlr8-email-banner.png';

const isDryRun = process.argv.includes('--dry-run');
const singleTarget = process.argv.find(arg => arg.startsWith('--to='))?.split('=')[1];

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: hostEmail,
    pass: hostPass
  }
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateHtml({ recipientName, teamName, domain }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Problem Statements are Officially LIVE - HAXLR8 3.0</title>
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
        🚀 MISSION DISPATCH • PROBLEM STATEMENTS ARE LIVE
      </span>
    </div>

    <div style="padding: 32px 28px; line-height: 1.6;">
      <div style="display: inline-block; background-color: #fef3c7; border: 1.5px solid #fde68a; border-radius: 20px; padding: 5px 14px; margin-bottom: 16px;">
        <span style="color: #b45309; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">
          ⚡ CHALLENGES OFFICIALLY RELEASED
        </span>
      </div>

      <h2 style="font-size: 23px; color: #0f172a; margin: 0 0 12px; font-weight: 900; letter-spacing: -0.02em;">
        Problem Statements are Officially LIVE! 🚀
      </h2>

      <p style="margin: 0 0 16px; color: #1e293b; font-size: 15px; font-weight: 600;">
        Hello ${recipientName || 'Haxlr8 Innovator'}${teamName ? ` (Squad: <strong>${teamName}</strong>)` : ''},
      </p>

      <p style="margin: 0 0 16px; color: #334155; font-size: 14.5px; line-height: 1.65;">
        The wait is over! Mission Control has officially unlocked the <strong>HAXLR8 3.0 Problem Statements</strong>. 45 high-impact engineering challenges (15 in Smart City, 15 in Agriculture, 15 in Healthcare) are now live on your participant dashboard.
      </p>

      <!-- Highlights Box -->
      <div style="background-color: #fff7ed; border: 2px solid #fed7aa; border-radius: 16px; padding: 20px; margin: 22px 0;">
        <div style="font-weight: 900; font-size: 13px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px;">
          ⚡ CRITICAL PARTICIPATION DIRECTIVES
        </div>
        <div style="font-size: 13.5px; color: #7c2d12; line-height: 1.7;">
          <div>• <strong>Strict Quota Limit:</strong> Each problem statement has a <strong>maximum cap of 3 squads</strong>. Once 3 squads claim a challenge, it locks automatically.</div>
          <div>• <strong>First-Come, First-Served:</strong> Slots are secured in real time upon confirmation.</div>
          <div>• <strong>Flight Captain Clearance:</strong> Only your Flight Captain (Team Leader) can submit and permanently lock in your squad's choice.</div>
          <div>• <strong>Crewmate Access:</strong> All crewmates can log in, view the full challenge list for their domain, and download the official PDF dossier.</div>
          ${domain ? `<div>• <strong>Your Registered Domain:</strong> <strong>${domain}</strong></div>` : ''}
        </div>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 28px 0 20px;">
        <a href="${PORTAL_URL}/login" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #ff3b69 100%); color: #ffffff !important; padding: 15px 36px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 15px; box-shadow: 0 6px 20px rgba(2, 132, 199, 0.4); letter-spacing: 0.02em;">
          🚀 Log In &amp; Lock Your Challenge Now →
        </a>
      </div>

      <p style="margin: 20px 0 12px; font-size: 14px; color: #0f172a; font-weight: 700; text-align: center;">
        Coordinate with your squad immediately to review the 15 challenges and finalize your choice!
      </p>

      <p style="margin: 0; font-size: 12.5px; color: #64748b; text-align: center; font-weight: 600;">
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
        Official Mailbox: <a href="mailto:${hostEmail}" style="color: #ff3b69; text-decoration: none; font-weight: 700;">${hostEmail}</a> &bull; Portal: <a href="${PORTAL_URL}" style="color: #38bdf8; text-decoration: none; font-weight: 700;">${PORTAL_URL}</a>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function main() {
  console.log('====================================================');
  console.log('  HAXLR8 3.0: PROBLEM STATEMENTS LIVE BROADCAST     ');
  console.log('====================================================');
  console.log(`Sender: ${hostEmail}`);
  console.log(`Dry Run Mode: ${isDryRun ? 'YES (No emails will be sent)' : 'NO (Live sending active)'}`);
  if (singleTarget) console.log(`Target: Single recipient [${singleTarget}]`);

  // 1. Verify SMTP Connection
  console.log('\n[1/3] Verifying Gmail SMTP Authentication...');
  await new Promise((resolve, reject) => {
    transporter.verify((err, success) => {
      if (err) reject(err);
      else {
        console.log('✓ Google SMTP authentication verified successfully!');
        resolve(success);
      }
    });
  });

  // 2. Fetch all teams to build team_id -> team mapping
  console.log('\n[2/3] Fetching teams and squad rosters from Supabase...');
  const { data: teams, error: tErr } = await supabase.from('teams').select('*');
  if (tErr) console.warn('Teams query note:', tErr.message);

  const teamMap = new Map();
  (teams || []).forEach(t => {
    teamMap.set(t.id, {
      id: t.id,
      team_name: t.team_name || t.name || 'Squad',
      domain: t.domain || 'Smart City'
    });
  });

  // Fetch submissions to resolve domains where teams table might lack it
  const { data: subs } = await supabase.from('submissions').select('team_id, category, sdg_goal');
  (subs || []).forEach(s => {
    if (s.team_id && teamMap.has(s.team_id)) {
      const current = teamMap.get(s.team_id);
      if (!current.domain || current.domain === 'Registration Verified') {
        current.domain = s.category || s.sdg_goal || 'Smart City';
      }
    }
  });

  // Fetch all team members
  const { data: members, error: mErr } = await supabase.from('team_members').select('*');
  if (mErr) {
    console.error('Error fetching team_members:', mErr);
    process.exit(1);
  }

  // Build distinct recipient list
  const recipientsMap = new Map();

  (members || []).forEach(m => {
    const email = (m.email || '').trim().toLowerCase();
    if (email && email.includes('@')) {
      const team = teamMap.get(m.team_id);
      recipientsMap.set(email, {
        email,
        name: (m.full_name || 'Haxlr8 Innovator').trim(),
        teamName: team?.team_name || 'Squad',
        domain: team?.domain || 'Smart City',
        role: m.is_leader ? 'Leader' : 'Crewmate'
      });
    }
  });

  let recipients = Array.from(recipientsMap.values());

  if (singleTarget) {
    const found = recipients.find(r => r.email === singleTarget.toLowerCase().trim());
    recipients = found ? [found] : [{
      email: singleTarget.toLowerCase().trim(),
      name: 'Innovator',
      teamName: 'Squad',
      domain: 'Smart City',
      role: 'Participant'
    }];
  }

  console.log(`\n✓ Identified ${recipients.length} registered recipients across all squads.`);
  console.log(`Sample recipient: ${recipients[0]?.name} <${recipients[0]?.email}> (${recipients[0]?.teamName} • ${recipients[0]?.domain})`);

  if (isDryRun) {
    console.log('\n[DRY RUN COMPLETE] Roster validated. Run without --dry-run to broadcast.');
    process.exit(0);
  }

  // 3. Broadcast Emails
  console.log(`\n[3/3] Broadcasting emails to ${recipients.length} recipients...`);
  const results = {
    total: recipients.length,
    sent: 0,
    failed: 0,
    timestamp: new Date().toISOString(),
    logs: []
  };

  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    const subject = '🚀 Problem Statements are LIVE on HAXLR8 3.0! Select Your Domain Challenge Now';
    const html = generateHtml({
      recipientName: r.name,
      teamName: r.teamName,
      domain: r.domain
    });

    try {
      const info = await transporter.sendMail({
        from: `"HAXLR8 3.0 Space Command" <${hostEmail}>`,
        to: r.email,
        subject,
        html
      });

      results.sent++;
      console.log(`[${i + 1}/${recipients.length}] ✓ Sent to ${r.email} (${r.name} - ${r.teamName}) [${info.messageId}]`);
      results.logs.push({ email: r.email, status: 'SUCCESS', messageId: info.messageId });
    } catch (sendErr) {
      results.failed++;
      console.error(`[${i + 1}/${recipients.length}] ✗ Failed for ${r.email}:`, sendErr.message);
      results.logs.push({ email: r.email, status: 'FAILED', error: sendErr.message });
    }

    // Polite 250ms sleep between dispatches
    await sleep(250);
  }

  // Save results report
  const reportPath = path.resolve(__dirname, 'broadcast-live-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log('\n====================================================');
  console.log(`  BROADCAST COMPLETED: ${results.sent} Sent, ${results.failed} Failed out of ${results.total}`);
  console.log(`  Report saved to: ${reportPath}`);
  console.log('====================================================');
}

main().catch(err => {
  console.error('Fatal error during broadcast:', err);
  process.exit(1);
});
