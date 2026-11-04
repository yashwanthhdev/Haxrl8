/**
 * HAXLR8 3.0 — Bulk Flight Ticket & Boarding Pass Broadcast Script
 * 
 * IMPORTANT: This script is prepared for execution ONLY AFTER organizer approval.
 * 
 * Usage:
 *   # Dry run (Simulation - no emails sent)
 *   node scripts/broadcast-flight-tickets.js --dry-run
 * 
 *   # Send to single test address
 *   node scripts/broadcast-flight-tickets.js --to=yashuhb18@gmail.com
 * 
 *   # Bulk dispatch to ALL verified squads (ONLY AFTER ORGANIZER APPROVAL)
 *   node scripts/broadcast-flight-tickets.js --confirm-send
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { generateFlightTicketEmailHtml, HAXLR8_HOST_EMAIL } from '../src/lib/emailService.js';
import { PROBLEM_STATEMENTS, getProblemById } from '../src/data/problemStatementsCatalog.js';
import { resolveDomain } from '../src/lib/domainUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');
let supabaseUrl = process.env.VITE_SUPABASE_URL || '';
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
let hostEmail = process.env.HOST_EMAIL || HAXLR8_HOST_EMAIL || 'haxlr8ecemitm@gmail.com';
let hostPassword = process.env.HOST_EMAIL_PASSWORD || 'qqucyshfxeckzqxl';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
  const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
  const emailMatch = envContent.match(/HOST_EMAIL=([^\r\n]+)/);
  const passMatch = envContent.match(/HOST_EMAIL_PASSWORD=([^\r\n]+)/);

  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (keyMatch) supabaseKey = keyMatch[1].trim();
  if (emailMatch) hostEmail = emailMatch[1].trim();
  if (passMatch) hostPassword = passMatch[1].trim().replace(/\s+/g, '');
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const isDryRun = process.argv.includes('--dry-run');
const isConfirmed = process.argv.includes('--confirm-send');
const singleTarget = process.argv.find(arg => arg.startsWith('--to='))?.split('=')[1];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('═════════════════════════════════════════════════════════════════════');
  console.log('✈️  HAXLR8 3.0 — FLIGHT TICKET / BOARDING PASS DISPATCHER');
  console.log('═════════════════════════════════════════════════════════════════════');
  console.log(`• Host Sender : ${hostEmail}`);
  console.log(`• Mode        : ${isDryRun ? '🔍 DRY RUN (Simulation Only)' : isConfirmed ? '🚀 LIVE BROADCAST (Confirmed)' : singleTarget ? `🎯 SINGLE TEST (${singleTarget})` : '⚠️ PREVIEW MODE (Specify --confirm-send to dispatch)'}`);
  console.log('═════════════════════════════════════════════════════════════════════\n');

  // 1. Fetch all teams, members, submissions
  console.log('1. Querying Supabase database for confirmed squads & locked problem statements...');
  const [{ data: teams }, { data: members }, { data: subs }] = await Promise.all([
    supabase.from('teams').select('*'),
    supabase.from('team_members').select('*'),
    supabase.from('submissions').select('*')
  ]);

  console.log(`• Teams in DB       : ${teams?.length || 0}`);
  console.log(`• Members in DB     : ${members?.length || 0}`);
  console.log(`• Submissions in DB : ${subs?.length || 0}`);

  // 2. Identify squads with locked problem statements
  const squadTickets = [];

  (subs || []).forEach(sub => {
    let psData = null;
    if (sub.evaluation_notes) {
      try {
        const parsed = typeof sub.evaluation_notes === 'string' ? JSON.parse(sub.evaluation_notes) : sub.evaluation_notes;
        psData = parsed?.problem_statement || parsed;
      } catch(e) {}
    }
    if (!psData && sub.evaluation_scores?.problem_statement) {
      psData = sub.evaluation_scores.problem_statement;
    }

    if (psData && (psData.id || psData.problem_statement_id)) {
      const pid = psData.id || psData.problem_statement_id;
      const fullProblem = getProblemById(pid);
      const team = teams?.find(t => t.id === sub.team_id);
      const teamMems = members?.filter(m => m.team_id === sub.team_id) || [];
      const leader = teamMems.find(m => m.is_leader) || teamMems[0] || { full_name: 'Flight Captain', email: '' };

      const teamDomain = resolveDomain(team, sub, null, psData.domain || fullProblem?.domain || sub.category || 'Healthcare');

      squadTickets.push({
        teamId: sub.team_id,
        teamName: team?.team_name || psData.team_name || 'Squad',
        domain: teamDomain,
        problemStatementId: pid,
        problemStatementNum: psData.num || fullProblem?.num || 1,
        problemStatementTitle: psData.title || fullProblem?.title || 'Selected Challenge',
        problemStatementDesc: fullProblem?.description || '',
        leaderName: leader.full_name || 'Flight Captain',
        leaderPhone: leader.phone_number || '',
        leaderEmail: leader.email || '',
        college: leader.college_name || 'Engineering Institute',
        transactionId: sub.project_description?.match(/UTR:\s*([A-Za-z0-9_-]+)/i)?.[1] || (sub.pdf_url ? 'VERIFIED' : 'VERIFIED'),
        members: teamMems
      });
    }
  });

  console.log(`\n• Total Squads with Locked Problem Statements: ${squadTickets.length}\n`);

  if (squadTickets.length === 0) {
    console.log('No squads with locked problem statements found.');
    return;
  }

  // Preview the first 5 squads
  console.log('─── PREVIEW ROSTER (First 5 Squads) ───');
  squadTickets.slice(0, 5).forEach((st, idx) => {
    console.log(`${idx + 1}. [${st.problemStatementId}] ${st.teamName} (${st.domain}) - Capt: ${st.leaderName} (${st.leaderEmail}) [${st.members.length} Crew]`);
  });

  if (!isConfirmed && !singleTarget) {
    console.log('\n═════════════════════════════════════════════════════════════════════');
    console.log('⚠️ SAFETY HOLD: Bulk broadcast has NOT been sent.');
    console.log('Per user instructions, waiting for organizer approval on sample email.');
    console.log('Once approved, run: node scripts/broadcast-flight-tickets.js --confirm-send');
    console.log('═════════════════════════════════════════════════════════════════════');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: hostEmail,
      pass: hostPassword
    }
  });

  await transporter.verify();
  console.log('\n✓ SMTP connection verified. Beginning dispatch sequence...\n');

  let successCount = 0;
  let failCount = 0;

  const targetList = singleTarget 
    ? [{ ...squadTickets[0], leaderEmail: singleTarget, recipientEmail: singleTarget }]
    : squadTickets;

  for (let i = 0; i < targetList.length; i++) {
    const ticket = targetList[i];
    const recipient = ticket.recipientEmail || ticket.leaderEmail;

    if (!recipient || !recipient.includes('@')) {
      console.warn(`[${i + 1}/${targetList.length}] Skipping ${ticket.teamName}: No valid leader email.`);
      continue;
    }

    try {
      const html = generateFlightTicketEmailHtml({
        recipientName: ticket.leaderName,
        recipientEmail: recipient,
        teamName: ticket.teamName,
        domain: ticket.domain,
        problemStatementId: ticket.problemStatementId,
        problemStatementNum: ticket.problemStatementNum,
        problemStatementTitle: ticket.problemStatementTitle,
        problemStatementDesc: ticket.problemStatementDesc,
        leaderName: ticket.leaderName,
        leaderPhone: ticket.leaderPhone,
        leaderEmail: ticket.leaderEmail,
        college: ticket.college,
        members: ticket.members,
        transactionId: ticket.transactionId
      });

      console.log(`[${i + 1}/${targetList.length}] Sending Flight Ticket to ${ticket.teamName} (${recipient})...`);

      if (!isDryRun) {
        await transporter.sendMail({
          from: `"HAXLR8 3.0 Space Flight Command" <${hostEmail}>`,
          to: recipient,
          subject: `✈️ Official Flight Ticket & Boarding Pass: HAXLR8 3.0 • Squad ${ticket.teamName} [${ticket.problemStatementId}]`,
          html
        });
      }

      successCount++;
      await sleep(400); // 400ms delay between emails
    } catch (err) {
      console.error(`✗ Error dispatching to ${recipient}:`, err.message);
      failCount++;
    }
  }

  console.log('\n═════════════════════════════════════════════════════════════════════');
  console.log('🎉 DISPATCH SEQUENCE COMPLETE');
  console.log(`• Successfully Dispatched : ${successCount}`);
  console.log(`• Failed Attempts         : ${failCount}`);
  console.log('═════════════════════════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
