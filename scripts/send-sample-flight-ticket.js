import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateFlightTicketEmailHtml, HAXLR8_HOST_EMAIL } from '../src/lib/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Read host email credentials from .env
const envPath = path.resolve(__dirname, '../.env');
let hostEmail = process.env.HOST_EMAIL || HAXLR8_HOST_EMAIL || 'haxlr8ecemitm@gmail.com';
let hostPassword = process.env.HOST_EMAIL_PASSWORD || 'qqucyshfxeckzqxl';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const emailMatch = envContent.match(/HOST_EMAIL=([^\r\n]+)/);
  const passMatch = envContent.match(/HOST_EMAIL_PASSWORD=([^\r\n]+)/);
  if (emailMatch) hostEmail = emailMatch[1].trim();
  if (passMatch) hostPassword = passMatch[1].trim().replace(/\s+/g, '');
}

const targetTo = process.argv[2] || 'yashuhb18@gmail.com';

console.log('═════════════════════════════════════════════════════════════════════');
console.log('🚀 HAXLR8 3.0 — SAMPLE FLIGHT TICKET DISPATCH TEST');
console.log(`• Host Sender : ${hostEmail}`);
console.log(`• Target Test : ${targetTo}`);
console.log('═════════════════════════════════════════════════════════════════════');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: hostEmail,
    pass: hostPassword
  }
});

// Sample Flight Ticket Payload with all required items
const sampleTicketPayload = {
  recipientName: 'Yashwanth H B',
  recipientEmail: targetTo,
  teamName: 'Pulse',
  domain: 'Agriculture',
  problemStatementId: 'AG-01',
  problemStatementNum: 1,
  problemStatementTitle: 'Autonomous Robotic Fruit Harvesting System',
  problemStatementDesc: 'Design an autonomous robotic system capable of identifying ripe fruit in orchards, navigating uneven terrain, and harvesting fruit without bruising using vision and soft end-effectors.',
  leaderName: 'Syed Ovais Jalaluddin',
  leaderPhone: '7981154722',
  leaderEmail: 'ovaissyed872@gmail.com',
  college: 'S J C INSTITUTE OF TECHNOLOGY',
  transactionId: '618498877143',
  flightNo: 'HX-3026',
  gate: 'GATE 01 • CIVIL SEMINAR HALL',
  reportingTime: '08:30 AM IST (Friday, Nov 06, 2026)',
  venue: 'Maharaja Institute of Technology Mysore (MIT Mysore)',
  venueAddress: 'Belawadi, PB No. 28, Srirangapatna Taluk, Mandya / Mysuru, Karnataka - 571477',
  members: [
    {
      full_name: 'Syed Ovais Jalaluddin',
      role: 'Flight Captain',
      is_leader: true,
      college_name: 'S J C INSTITUTE OF TECHNOLOGY',
      dept: 'Data Science',
      reg_no: '1SJ24AD056',
      phone_number: '7981154722',
      email: 'ovaissyed872@gmail.com'
    },
    {
      full_name: 'Sarika M',
      role: 'Crewmate 1',
      is_leader: false,
      college_name: 'S J C INSTITUTE OF TECHNOLOGY',
      dept: 'Data Science',
      reg_no: '1SJ24AD050',
      phone_number: '8310942696',
      email: 'sarikam.aids@sjcit.ac.in'
    },
    {
      full_name: 'Srushti U',
      role: 'Crewmate 2',
      is_leader: false,
      college_name: 'S J C INSTITUTE OF TECHNOLOGY',
      dept: 'Information Science & Engineering',
      reg_no: '1SJ24IS101',
      phone_number: '9174116012',
      email: 'srushtiumesh23@gmail.com'
    },
    {
      full_name: 'Chandana L',
      role: 'Crewmate 3',
      is_leader: false,
      college_name: 'S J C INSTITUTE OF TECHNOLOGY',
      dept: 'Data Science',
      reg_no: '1SJ24AD003',
      phone_number: '6361673283',
      email: 'chandanal3006@gmail.com'
    }
  ]
};

async function sendSample() {
  try {
    console.log('1. Verifying SMTP connection to Google Mail server...');
    await transporter.verify();
    console.log('✓ Google SMTP authentication verified!');

    console.log(`2. Rendering Flight Ticket HTML for "${sampleTicketPayload.teamName}"...`);
    const htmlContent = generateFlightTicketEmailHtml(sampleTicketPayload);

    console.log(`3. Dispatching Sample Flight Ticket to ${targetTo}...`);
    const info = await transporter.sendMail({
      from: `"HAXLR8 3.0 Space Flight Command" <${hostEmail}>`,
      to: targetTo,
      subject: `✈️ [SAMPLE REVIEW] Official Flight Ticket & Boarding Pass: HAXLR8 3.0 • Squad ${sampleTicketPayload.teamName} [${sampleTicketPayload.problemStatementId}]`,
      html: htmlContent
    });

    console.log('═════════════════════════════════════════════════════════════════════');
    console.log('✅ SAMPLE FLIGHT TICKET EMAIL DISPATCHED SUCCESSFULLY!');
    console.log(`• Message ID : ${info.messageId}`);
    console.log(`• Delivered To : ${targetTo}`);
    console.log(`• Squad Name  : ${sampleTicketPayload.teamName}`);
    console.log(`• Challenge   : [${sampleTicketPayload.problemStatementId}] ${sampleTicketPayload.problemStatementTitle}`);
    console.log('═════════════════════════════════════════════════════════════════════');
    console.log('ℹ️ Waiting for organizer approval before bulk sending to all squads.');
  } catch (error) {
    console.error('❌ Failed to dispatch sample email:', error);
    process.exit(1);
  }
}

sendSample();
