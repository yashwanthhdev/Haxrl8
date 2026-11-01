import { supabase } from './supabaseClient';
import { PROBLEM_STATEMENTS, DOMAIN_METADATA, MAX_TEAMS_PER_PROBLEM, getProblemById } from '../data/problemStatementsCatalog';

// Storage keys
const STORAGE_SELECTIONS_KEY = 'haxlr8_ps_selections';
const STORAGE_PDFS_KEY = 'haxlr8_ps_custom_pdfs';

// ─── 3 DEMO ACCOUNTS ──────────────────────────────────────────────────────────
export const DEMO_ACCOUNTS = {
  'demo.smartcity@haxlr8.mit.ac.in': {
    id: 'demo-user-smartcity-01',
    email: 'demo.smartcity@haxlr8.mit.ac.in',
    password: 'demo123',
    name: 'Captain Aaditya Rao',
    domain: 'Smart City',
    teamId: 'demo-team-smartcity-01',
    teamName: 'UrbanMatrix',
    leaderName: 'Aaditya Rao',
    leaderPhone: '+91 98765 43210',
    college: 'MIT Mysore',
    members: [
      { id: 'm-sc-1', full_name: 'Aaditya Rao', email: 'demo.smartcity@haxlr8.mit.ac.in', role: 'Flight Captain', is_leader: true, phone_number: '+91 98765 43210', dept: 'ECE', year: '3rd Year', college_name: 'MIT Mysore' },
      { id: 'm-sc-2', full_name: 'Bhavya Sharma', email: 'bhavya.sc@gmail.com', role: 'IoT & Telemetry Engineer', is_leader: false, phone_number: '+91 98765 43211', dept: 'ECE', year: '3rd Year', college_name: 'MIT Mysore' },
      { id: 'm-sc-3', full_name: 'Chirag Patel', email: 'chirag.sc@gmail.com', role: 'Fullstack Urban Systems', is_leader: false, phone_number: '+91 98765 43212', dept: 'CSE', year: '3rd Year', college_name: 'MIT Mysore' }
    ]
  },
  'demo.agritech@haxlr8.mit.ac.in': {
    id: 'demo-user-agritech-02',
    email: 'demo.agritech@haxlr8.mit.ac.in',
    password: 'demo123',
    name: 'Captain Sneha Kulkarni',
    domain: 'Agriculture',
    teamId: 'demo-team-agritech-02',
    teamName: 'AgroVision',
    leaderName: 'Sneha Kulkarni',
    leaderPhone: '+91 98450 12345',
    college: 'MIT Mysore',
    members: [
      { id: 'm-ag-1', full_name: 'Sneha Kulkarni', email: 'demo.agritech@haxlr8.mit.ac.in', role: 'Flight Captain', is_leader: true, phone_number: '+91 98450 12345', dept: 'AI & DS', year: '3rd Year', college_name: 'MIT Mysore' },
      { id: 'm-ag-2', full_name: 'Darshan Gowda', email: 'darshan.ag@gmail.com', role: 'Edge AI & Drone Vision', is_leader: false, phone_number: '+91 98450 12346', dept: 'AI & DS', year: '3rd Year', college_name: 'MIT Mysore' },
      { id: 'm-ag-3', full_name: 'Esha Reddy', email: 'esha.ag@gmail.com', role: 'Embedded Systems & Robotics', is_leader: false, phone_number: '+91 98450 12347', dept: 'ECE', year: '3rd Year', college_name: 'MIT Mysore' }
    ]
  },
  'demo.healthtech@haxlr8.mit.ac.in': {
    id: 'demo-user-healthtech-03',
    email: 'demo.healthtech@haxlr8.mit.ac.in',
    password: 'demo123',
    name: 'Captain Rohan Deshmukh',
    domain: 'Healthcare',
    teamId: 'demo-team-healthtech-03',
    teamName: 'MedPulse',
    leaderName: 'Rohan Deshmukh',
    leaderPhone: '+91 97412 67890',
    college: 'MIT Mysore',
    members: [
      { id: 'm-hc-1', full_name: 'Rohan Deshmukh', email: 'demo.healthtech@haxlr8.mit.ac.in', role: 'Flight Captain', is_leader: true, phone_number: '+91 97412 67890', dept: 'Biomedical / CSE', year: '4th Year', college_name: 'MIT Mysore' },
      { id: 'm-hc-2', full_name: 'Farhan Ali', email: 'farhan.hc@gmail.com', role: 'Biosignal DSP & Firmware', is_leader: false, phone_number: '+91 97412 67891', dept: 'ECE', year: '4th Year', college_name: 'MIT Mysore' },
      { id: 'm-hc-3', full_name: 'Geetha N', email: 'geetha.hc@gmail.com', role: 'Clinical Data & Backend Lead', is_leader: false, phone_number: '+91 97412 67892', dept: 'CSE', year: '4th Year', college_name: 'MIT Mysore' }
    ]
  }
};

export const isDemoEmail = (email) => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return Boolean(DEMO_ACCOUNTS[clean]);
};

export const getDemoAccount = (email) => {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  return DEMO_ACCOUNTS[clean] || null;
};

// ─── DOMAIN PDF URLs ──────────────────────────────────────────────────────────
export const getDomainPdfUrl = (domain) => {
  if (!domain) return '/assets/documents/HAXLR8_3.0_Smart_City_Problem_Statements.pdf';
  
  try {
    const raw = localStorage.getItem(STORAGE_PDFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed[domain]) return parsed[domain];
    }
  } catch (e) {}

  const meta = DOMAIN_METADATA[domain];
  return meta?.defaultPdfUrl || '/assets/documents/HAXLR8_3.0_Smart_City_Problem_Statements.pdf';
};

export const saveDomainPdfUrl = (domain, url) => {
  if (!domain || !url) return;
  try {
    const raw = localStorage.getItem(STORAGE_PDFS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[domain] = url.trim();
    localStorage.setItem(STORAGE_PDFS_KEY, JSON.stringify(parsed));
    window.dispatchEvent(new CustomEvent('haxlr8_ps_pdfs_updated', { detail: parsed }));
  } catch (e) {
    console.warn('saveDomainPdfUrl error:', e);
  }
};

// ─── SELECTIONS AND REGISTRY ──────────────────────────────────────────────────
export const getLocalSelections = () => {
  try {
    const raw = localStorage.getItem(STORAGE_SELECTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveLocalSelections = (selections) => {
  try {
    localStorage.setItem(STORAGE_SELECTIONS_KEY, JSON.stringify(selections));
  } catch (e) {}
};

/**
 * Fetch all locked problem statement selections across all teams
 * Merges Supabase submissions data with local persistence
 */
export const fetchAllProblemSelections = async () => {
  const localList = getLocalSelections();
  const selectionMap = new Map();

  // Seed with local items first
  localList.forEach(item => {
    if (item.team_id || item.team_name) {
      selectionMap.set(item.team_id || item.team_name, item);
    }
  });

  try {
    // Fetch submissions with evaluation_notes where problem statements are stored
    const { data: subs, error: subErr } = await supabase
      .from('submissions')
      .select('id, team_id, project_title, category, sdg_goal, evaluation_notes, evaluation_scores, created_at, updated_at');

    if (!subErr && Array.isArray(subs) && subs.length > 0) {
      // Fetch teams and leaders for rich context
      const teamIds = subs.map(s => s.team_id).filter(Boolean);
      let teamsMap = new Map();
      let leadersMap = new Map();

      if (teamIds.length > 0) {
        try {
          const { data: tms } = await supabase
            .from('teams')
            .select('id, team_name, created_at')
            .in('id', teamIds);
          if (tms) tms.forEach(t => teamsMap.set(t.id, t));

          const { data: mems } = await supabase
            .from('team_members')
            .select('team_id, full_name, email, phone_number, college_name, is_leader')
            .in('team_id', teamIds)
            .eq('is_leader', true);
          if (mems) mems.forEach(m => leadersMap.set(m.team_id, m));
        } catch (ctxErr) {}
      }

      subs.forEach(sub => {
        let psData = null;

        // 1. Try parsing evaluation_notes
        if (sub.evaluation_notes) {
          try {
            const parsed = typeof sub.evaluation_notes === 'string'
              ? JSON.parse(sub.evaluation_notes)
              : sub.evaluation_notes;
            if (parsed?.problem_statement) {
              psData = parsed.problem_statement;
            } else if (parsed?.problem_statement_id) {
              psData = parsed;
            }
          } catch (e) {}
        }

        // 2. Try evaluation_scores.problem_statement
        if (!psData && sub.evaluation_scores && sub.evaluation_scores.problem_statement) {
          psData = sub.evaluation_scores.problem_statement;
        }

        if (psData && (psData.id || psData.problem_statement_id)) {
          const problemId = psData.id || psData.problem_statement_id;
          const fullProblem = getProblemById(problemId);
          const teamInfo = teamsMap.get(sub.team_id);
          const leaderInfo = leadersMap.get(sub.team_id);

          const item = {
            team_id: sub.team_id,
            team_name: psData.team_name || teamInfo?.team_name || 'Squad',
            domain: psData.domain || fullProblem?.domain || sub.category || sub.sdg_goal || 'Smart City',
            problem_statement_id: problemId,
            problem_statement_num: psData.num || psData.problem_statement_num || fullProblem?.num || 1,
            problem_statement_title: psData.title || psData.problem_statement_title || fullProblem?.title || '',
            locked_at: psData.locked_at || sub.updated_at || sub.created_at,
            locked_by: psData.locked_by || leaderInfo?.full_name || 'Flight Captain',
            leader_name: leaderInfo?.full_name || psData.leader_name || 'Flight Captain',
            leader_email: leaderInfo?.email || psData.leader_email || '',
            leader_phone: leaderInfo?.phone_number || psData.leader_phone || '',
            college: leaderInfo?.college_name || psData.college || 'MIT Mysore'
          };

          selectionMap.set(sub.team_id, item);
        }
      });
    }
  } catch (err) {
    console.warn('fetchAllProblemSelections supabase error, using cached selections:', err);
  }

  const allSelections = Array.from(selectionMap.values());
  saveLocalSelections(allSelections);
  return allSelections;
};

/**
 * Get map of { [problemId]: count } and { [problemId]: [squads...] }
 */
export const getSelectionCounts = (selections = []) => {
  const counts = {};
  const teamsByProblem = {};

  // Initialize all 45 problem statements with 0
  PROBLEM_STATEMENTS.forEach(p => {
    counts[p.id] = 0;
    teamsByProblem[p.id] = [];
  });

  selections.forEach(sel => {
    const pid = sel.problem_statement_id;
    if (pid && counts[pid] !== undefined) {
      counts[pid] += 1;
      teamsByProblem[pid].push(sel);
    }
  });

  return { counts, teamsByProblem };
};

/**
 * Check if a specific team has already locked a statement
 */
export const getTeamSelection = (teamId, userEmail = '') => {
  if (!teamId && !userEmail) return null;

  // 1. Check scoped local storage
  if (teamId) {
    try {
      const raw = localStorage.getItem(`haxlr8_ps_team_${teamId}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
  }

  if (userEmail) {
    try {
      const raw = localStorage.getItem(`haxlr8_ps_team_${userEmail.trim().toLowerCase()}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
  }

  // 2. Check general registry
  const all = getLocalSelections();
  const match = all.find(s => 
    (teamId && s.team_id === teamId) || 
    (userEmail && s.leader_email?.toLowerCase() === userEmail.toLowerCase())
  );

  return match || null;
};

/**
 * Lock in a Problem Statement for a team.
 * STRICT ENFORCEMENTS:
 * 1. Only Flight Captain can lock.
 * 2. Problem Statement must not have reached MAX_TEAMS_PER_PROBLEM (3 teams).
 * 3. Cannot be modified or changed once locked.
 */
export const lockProblemStatement = async ({
  teamId,
  teamName,
  domain,
  problemId,
  leaderName,
  leaderEmail,
  leaderPhone,
  college = 'MIT Mysore',
  isLeader = true
}) => {
  if (!isLeader) {
    throw new Error('Clearance Denied: Only your squad Flight Captain can officially lock in the problem statement.');
  }

  if (!problemId) {
    throw new Error('Please select a valid problem statement challenge.');
  }

  const problem = getProblemById(problemId);
  if (!problem) {
    throw new Error('Problem statement challenge not found in the catalog.');
  }

  // Check if team already locked
  const existing = getTeamSelection(teamId, leaderEmail);
  if (existing && existing.problem_statement_id) {
    throw new Error(`Squad Selection Locked: Your squad has already locked in challenge [${existing.problem_statement_id}]. Changes are not permitted.`);
  }

  // Fetch current selections to enforce MAX_TEAMS_PER_PROBLEM = 3 quota
  const currentSelections = await fetchAllProblemSelections();
  const existingClaimsForProblem = currentSelections.filter(s => s.problem_statement_id === problemId);

  if (existingClaimsForProblem.length >= MAX_TEAMS_PER_PROBLEM) {
    throw new Error(`Quota Reached (3/3): Challenge [${problemId}] has already been locked by 3 squads. Please select another problem statement.`);
  }

  const lockedRecord = {
    team_id: teamId || ('team-' + Date.now()),
    team_name: teamName || 'Squad',
    domain: domain || problem.domain,
    problem_statement_id: problem.id,
    problem_statement_num: problem.num,
    problem_statement_title: problem.title,
    locked_at: new Date().toISOString(),
    locked_by: leaderName || 'Flight Captain',
    leader_name: leaderName || 'Flight Captain',
    leader_email: leaderEmail || '',
    leader_phone: leaderPhone || '',
    college: college || 'MIT Mysore'
  };

  // 1. Save in local registries
  try {
    const updated = currentSelections.filter(s => s.team_id !== lockedRecord.team_id);
    updated.push(lockedRecord);
    saveLocalSelections(updated);

    if (teamId) {
      localStorage.setItem(`haxlr8_ps_team_${teamId}`, JSON.stringify(lockedRecord));
    }
    if (leaderEmail) {
      localStorage.setItem(`haxlr8_ps_team_${leaderEmail.trim().toLowerCase()}`, JSON.stringify(lockedRecord));
    }
  } catch (e) {
    console.warn('Local storage error in lockProblemStatement:', e);
  }

  // 2. Cloud Persistence in Supabase `submissions`
  if (teamId && !teamId.startsWith('demo-')) {
    try {
      // Find existing submission or insert
      const { data: existingSubs } = await supabase
        .from('submissions')
        .select('*')
        .eq('team_id', teamId)
        .limit(1);

      const notesPayload = JSON.stringify({
        problem_statement: lockedRecord,
        locked_at: lockedRecord.locked_at
      });

      if (existingSubs && existingSubs.length > 0) {
        const sub = existingSubs[0];
        const scoresObj = sub.evaluation_scores || {};
        scoresObj.problem_statement = lockedRecord;

        await supabase
          .from('submissions')
          .update({
            evaluation_notes: notesPayload,
            evaluation_scores: scoresObj,
            updated_at: new Date().toISOString()
          })
          .eq('id', sub.id);
      } else {
        // Create new submission record
        await supabase
          .from('submissions')
          .insert({
            team_id: teamId,
            project_title: `[${problem.id}] ${problem.title.substring(0, 80)}`,
            category: domain || problem.domain,
            sdg_goal: domain || problem.domain,
            evaluation_notes: notesPayload,
            evaluation_scores: { problem_statement: lockedRecord },
            status: 'Submitted'
          });
      }
    } catch (cloudErr) {
      console.warn('Cloud submission persistence notice:', cloudErr);
    }
  }

  // 3. Dispatch global event so UI components immediately re-render
  window.dispatchEvent(new CustomEvent('haxlr8_ps_locked', { detail: lockedRecord }));

  return lockedRecord;
};
