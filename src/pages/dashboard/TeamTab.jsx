import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { sanitizeInput } from '../../lib/security';
import { Rocket, Users, Flag, ClipboardList, MoreVertical, Info, Target, Calendar, Check, AlertCircle, Clock, CheckCircle2, X, Edit2 } from 'lucide-react';
import { sendParticipantWelcomeEmail } from '../../lib/emailService';
import { ensureUUID, isUUID } from '../../lib/syncService';
import { resolveDomain } from '../../lib/domainUtils';
import { checkRegistrationEligibility } from '../../lib/whitelistService';
import AmongUsCrewmate from '../../components/amongus/AmongUsCrewmate';
// import IdCardUpload from '../../components/IdCardUpload';

const INDIA_STATES_CITIES = {
  "Andaman and Nicobar Islands": ["Port Blair"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Rajahmundry", "Kakinada", "Anantapur", "Kadapa"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Pasighat", "Roing"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Ara", "Begusarai"],
  "Chandigarh": ["Chandigarh"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh"],
  "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Panchkula"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi", "Solan", "Manali", "Kullu"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi", "Kalaburagi", "Davangere", "Ballari", "Vijayapura", "Shivamogga"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Alappuzha", "Kottayam", "Palakkad"],
  "Ladakh": ["Leh", "Kargil"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Minicoy"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad", "Solapur", "Amravati", "Navi Mumbai", "Kolhapur", "Sangli", "Jalgaon"],
  "Manipur": ["Imphal", "Thoubal", "Kakching", "Churachandpur", "Bishnupur"],
  "Meghalaya": ["Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara"],
  "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur", "Puri", "Balasore", "Bhadrak"],
  "Puducherry": ["Puducherry", "Oulgaret", "Karaikal", "Yanam", "Mahe"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Moga", "Abohar"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Thoothukudi", "Dindigul", "Thanjavur"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam", "Mahbubnagar", "Nalgonda", "Adilabad"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Prayagraj", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Noida", "Greater Noida"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Nainital"],
  "West Bengal": ["Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur"]
};

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics and Communication",
  "Electrical and Electronics",
  "Mechanical Engineering",
  "Civil Engineering",
  "Artificial Intelligence",
  "Data Science",
  "Other"
];

export const isLikelyPhone = (val) => {
  if (!val || typeof val !== 'string') return false;
  const clean = val.replace(/[\s\-\+\(\)]/g, '');
  return /^\d{10}$/.test(clean) || /^91\d{10}$/.test(clean);
};

const defaultMember = {
  full_name: '', email: '', phone_number: '',
  state: '', city: '', city_other: '', dept: '', dept_other: '', year: '',
  college_name: '', reg_no: '', id_card_front_url: '', id_card_back_url: '', id_card_front_file: null, id_card_back_file: null
};

// Reusable inline styles for Starship Flight Roster
const styles = {
  card: { 
    background: '#ffffff', 
    borderRadius: 22, 
    padding: '26px', 
    boxShadow: '0 6px 20px rgba(0,0,0,0.04)', 
    border: '2px solid #fed7aa',
    color: '#0f172a'
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
  inputDisabled: { 
    width: '100%', 
    padding: '12px 14px', 
    borderRadius: 12, 
    border: '1.5px solid #e2e8f0', 
    fontSize: 14, 
    outline: 'none', 
    background: '#f1f5f9', 
    color: '#64748b', 
    cursor: 'not-allowed', 
    fontFamily: 'inherit' 
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
  buttonPrimary: { 
    padding: '12px 28px', 
    borderRadius: 12, 
    border: 'none', 
    background: '#0284c7', 
    color: '#ffffff', 
    fontSize: 14, 
    fontWeight: 800, 
    cursor: 'pointer', 
    transition: 'transform 0.1s, box-shadow 0.2s', 
    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)' 
  },
  buttonSecondary: { 
    padding: '12px 24px', 
    borderRadius: 12, 
    border: '1.5px solid #fed7aa', 
    background: '#fff7ed', 
    color: '#ea580c', 
    fontSize: 14, 
    fontWeight: 800, 
    cursor: 'pointer', 
    transition: 'all 0.2s' 
  },
  buttonDisabled: { 
    padding: '12px 24px', 
    borderRadius: 12, 
    border: '1.5px solid #e2e8f0', 
    background: '#f1f5f9', 
    color: '#94a3b8', 
    fontSize: 14, 
    fontWeight: 800, 
    cursor: 'not-allowed' 
  },
  buttonBack: { 
    padding: '12px 24px', 
    borderRadius: 12, 
    border: '1.5px solid #cbd5e1', 
    background: '#ffffff', 
    color: '#475569', 
    fontSize: 14, 
    fontWeight: 700, 
    cursor: 'pointer', 
    transition: 'background 0.2s' 
  }
};

export default function TeamTab({ hasTeam, teamData, teamMembers, submissions, user, setTeamMembers, setTeamData, setHasTeam, setActiveTab }) {
  // --- STATE MANAGEMENT ---
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    teamName: '',
    teamSize: 3,
    domain: (hasTeam && teamData) ? resolveDomain(teamData, null, user, 'Agriculture') : 'Agriculture',
    leader: {
      ...defaultMember,
      full_name: user?.user_metadata?.full_name || '',
      email: user?.email || ''
    },
    teammates: [{ ...defaultMember }, { ...defaultMember }] // Initialized for teamSize 3 (2 teammates)
  });

  const existingDomain = (hasTeam || Boolean(teamData)) ? resolveDomain(teamData, submissions?.[0], user, '') : '';
  const isExistingHealthcare = existingDomain === 'Healthcare';
  const isExistingSmartCity = existingDomain === 'Smart City' || existingDomain === 'SmartCity';

  // Smart City is open for exactly 1 new team (Max capacity = 19 teams)
  const [smartCityCount, setSmartCityCount] = useState(18);

  useEffect(() => {
    async function checkSmartCityCapacity() {
      try {
        const { count, error } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .or('category.eq.Smart City,sdg_goal.ilike.%Smart City%');
        if (!error && typeof count === 'number') {
          setSmartCityCount(count);
        }
      } catch (e) {}
    }
    checkSmartCityCapacity();
  }, []);

  const SMART_CITY_MAX_CAPACITY = 19;
  const isSmartCityCapped = smartCityCount >= SMART_CITY_MAX_CAPACITY;

  const isDomainFull = (domId) => {
    if (domId === 'Healthcare') return !isExistingHealthcare;
    if (domId === 'Smart City' || domId === 'SmartCity') {
      if (isExistingSmartCity) return false;
      return isSmartCityCapped;
    }
    return false;
  };

  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [showIdPopup, setShowIdPopup] = useState(false);
  const [deadlinePassed, setDeadlinePassed] = useState(false);

  // Dedicated USN / University Seat Number Editing State
  const [showUsnEditModal, setShowUsnEditModal] = useState(false);
  const [usnEditMap, setUsnEditMap] = useState({});
  const [savingUsn, setSavingUsn] = useState(false);
  const [usnModalError, setUsnModalError] = useState('');

  const openUsnModal = (focusMemberId = null) => {
    const map = {};
    (teamMembers || []).forEach(m => {
      map[m.id] = m.reg_no || '';
    });
    setUsnEditMap(map);
    setUsnModalError('');
    setShowUsnEditModal(true);
  };

  const handleSaveUsnUpdates = async () => {
    setUsnModalError('');
    const membersList = teamMembers || [];

    // Validation
    for (const m of membersList) {
      const val = (usnEditMap[m.id] ?? m.reg_no ?? '').trim();
      if (!val) {
        setUsnModalError(`Please enter a USN / University Seat Number for ${m.full_name}.`);
        return;
      }
      if (isLikelyPhone(val)) {
        setUsnModalError(`Please enter your college USN or university seat number for ${m.full_name} (e.g. 4PS24EC076).`);
        return;
      }
    }

    setSavingUsn(true);
    try {
      const updatePromises = [];
      const updatedMembersList = membersList.map(m => {
        const newUsn = (usnEditMap[m.id] ?? m.reg_no ?? '').trim();
        if (newUsn !== m.reg_no) {
          updatePromises.push(
            supabase.from('team_members').update({ reg_no: newUsn }).eq('id', m.id)
          );
        }
        return { ...m, reg_no: newUsn };
      });

      if (updatePromises.length > 0) {
        const results = await Promise.all(updatePromises);
        const errResult = results.find(r => r.error);
        if (errResult) throw errResult.error;
      }

      if (setTeamMembers) {
        setTeamMembers(updatedMembersList);
      }

      try {
        if (user?.id) {
          localStorage.setItem(`haxlr8_members_${user.id}`, JSON.stringify(updatedMembersList));
        }
      } catch (e) {}

      setShowUsnEditModal(false);
      setToastMsg('✓ USN / University Seat Numbers updated successfully!');
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err) {
      console.error('Save USN error:', err);
      setUsnModalError('Failed to save USN: ' + (err.message || err));
    } finally {
      setSavingUsn(false);
    }
  };

  useEffect(() => {
    // Official Registration Deadline: November 02, 2026 at 23:59:59 IST
    const deadline = new Date('2026-11-02T23:59:59+05:30');
    if (new Date() > deadline) {
      setDeadlinePassed(true);
    }
  }, []);

  const startEditTeam = (stepToOpen = 0) => {
    const leader = teamMembers?.find(m => m.is_leader) || teamMembers?.find(m => m.id === teamData?.leader_id) || teamMembers?.[0];
    const teammates = teamMembers?.filter(m => !m.is_leader && m.id !== leader?.id && m.email !== leader?.email) || [];

    const parseLocation = (loc) => {
      if (!loc) return { state: '', city: '' };
      const parts = loc.split(', ');
      if (parts.length >= 2) {
        return { city: parts[0], state: parts.slice(1).join(', ') };
      }
      return { state: '', city: loc };
    };

    setFormData({
      teamName: teamData?.team_name || '',
      teamSize: teamMembers?.length || 3,
      domain: resolveDomain(teamData, null, user, 'Healthcare'),
      leader: {
        ...defaultMember,
        ...leader,
        ...parseLocation(leader?.location),
        dept: DEPARTMENTS.includes(leader?.dept) ? leader.dept : 'Other',
        dept_other: DEPARTMENTS.includes(leader?.dept) ? '' : leader?.dept
      },
      teammates: teammates.map(m => ({
        ...defaultMember,
        ...m,
        ...parseLocation(m.location),
        dept: DEPARTMENTS.includes(m.dept) ? m.dept : 'Other',
        dept_other: DEPARTMENTS.includes(m.dept) ? '' : m.dept
      }))
    });
    setIsEditingTeam(true);
    setCurrentStep(stepToOpen);
  };

  // useEffect(() => {
  //   if (hasTeam && teamMembers && teamMembers.length > 0) {
  //     const missing = teamMembers.some(m => !m.id_card_front_url || !m.id_card_back_url);
  //     if (window.location.hash === '#upload-id') {
  //       window.location.hash = '';
  //       if (!isEditingTeam) {
  //         startEditTeam(1);
  //       }
  //     } else if (missing && !isEditingTeam) {
  //       setShowIdPopup(true);
  //     }
  //   }
  // }, [hasTeam, isEditingTeam, teamMembers]);



  // --- VALIDATION ---
  const validateCurrentStep = () => {
    setErrorMsg('');
    if (currentStep === 0) {
      if (!formData.domain) return "Please select a challenge domain.";
      if (formData.domain === 'Healthcare' && !isExistingHealthcare) {
        return "Healthcare domain slots are completely full. Please choose Agriculture or Smart City.";
      }
      if ((formData.domain === 'Smart City' || formData.domain === 'SmartCity') && !isExistingSmartCity && isSmartCityCapped) {
        return "Smart City capacity has just been reached. Please choose Agriculture.";
      }
      if (!formData.teamName.trim()) return "Team Name is required.";
      if (!/^[a-zA-Z0-9 ]+$/.test(formData.teamName)) return "Team Name can only contain letters, numbers, and spaces.";
      return true;
    }

    const validateMember = (member) => {
      if (!member.full_name.trim() || !member.email.trim() || !member.phone_number.trim() || !member.state || !member.city || !member.dept || !member.year || !member.college_name.trim() || !member.reg_no.trim()) {
        return "Please fill out all fields.";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
        return "Please enter a valid email address.";
      }
      if (!/^\d{10}$/.test(member.phone_number)) {
        return "Phone number must be exactly 10 digits.";
      }
      if (isLikelyPhone(member.reg_no)) {
        return `Please enter your college USN or university seat number for ${member.full_name || 'this member'} (e.g. 4PS24EC076).`;
      }
      if (member.dept === 'Other' && !member.dept_other?.trim()) {
        return "Please specify your department.";
      }
      if (member.city === 'Other' && !member.city_other?.trim()) {
        return "Please specify your city/district.";
      }
      return true;
    };

    if (currentStep === 1) {
      return validateMember(formData.leader);
    }

    if (currentStep > 1) {
      const teammateIndex = currentStep - 2;
      return validateMember(formData.teammates[teammateIndex]);
    }

    return true;
  };

  const handleNext = () => {
    const isValid = validateCurrentStep();
    if (isValid !== true) {
      setErrorMsg(isValid);
      return;
    }
    setErrorMsg('');
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setErrorMsg('');
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    const isValid = validateCurrentStep();
    if (isValid !== true) {
      setErrorMsg(isValid);
      return;
    }

    setCreating(true);
    setErrorMsg('');
    try {
      let currentTeamId = teamData?.id;
      let finalTeamData = teamData;

      const cleanTeamName = sanitizeInput(formData.teamName);
      const cleanDomain = formData.domain || 'Agriculture';
      const validLeaderId = ensureUUID(user?.id);

      // Check if user already has an existing team in Supabase to prevent duplicate inserts
      let existingTeam = null;
      try {
        const { data: foundTeams } = await supabase
          .from('teams')
          .select('*')
          .eq('leader_id', validLeaderId)
          .order('created_at', { ascending: false })
          .limit(1);
        if (foundTeams && foundTeams.length > 0) {
          existingTeam = foundTeams[0];
        }
      } catch (e) {}

      if (isEditingTeam || existingTeam) {
        currentTeamId = (existingTeam || teamData)?.id;
        try {
          await supabase.from('teams').update({
            team_name: cleanTeamName
          }).eq('id', currentTeamId);
        } catch (e) {
          console.warn('Teams update notice:', e);
        }

        // Persist domain track into submissions table
        try {
          const { data: existingSubs } = await supabase
            .from('submissions')
            .select('id')
            .eq('team_id', currentTeamId)
            .limit(1);
          const existingSub = existingSubs?.[0];
          if (existingSub?.id) {
            await supabase.from('submissions').update({
              project_title: `${cleanTeamName} - ${cleanDomain}`,
              category: cleanDomain,
              sdg_goal: cleanDomain,
              status: 'Registered'
            }).eq('id', existingSub.id);
          } else {
            await supabase.from('submissions').insert({
              team_id: currentTeamId,
              project_title: `${cleanTeamName} - ${cleanDomain}`,
              category: cleanDomain,
              sdg_goal: cleanDomain,
              status: 'Registered'
            });
          }
        } catch (subErr) {
          console.warn('Submissions domain track notice:', subErr);
        }

        finalTeamData = { ...(existingTeam || teamData), team_name: cleanTeamName, domain: cleanDomain };
        localStorage.setItem(`haxlr8_team_${validLeaderId}`, JSON.stringify(finalTeamData));
      } else {
        // Whitelist Access Control: Verify new team leader is authorized
        const leaderEmail = formData.leader.email || user?.email;
        const eligibility = await checkRegistrationEligibility(leaderEmail);
        if (!eligibility.allowed) {
          setErrorMsg('Registration Access Restricted: Public registrations are closed. Only admin-approved emails are authorized to assemble a squad. Please contact hackathon coordinators.');
          setCreating(false);
          return;
        }

        let team = null;
        currentTeamId = ensureUUID(currentTeamId || teamData?.id);
        
        try {
          const { data: createdTeam, error: teamErr } = await supabase.from('teams').insert({
            id: currentTeamId,
            leader_id: validLeaderId,
            team_name: cleanTeamName
          }).select().single();
          
          if (!teamErr && createdTeam) {
            team = { ...createdTeam, domain: cleanDomain };
          }
        } catch (tErr) {
          console.warn('Supabase teams insert notice:', tErr);
        }

        if (!team) {
          team = {
            id: currentTeamId,
            leader_id: validLeaderId,
            team_name: cleanTeamName,
            domain: cleanDomain,
            created_at: new Date().toISOString()
          };
        }

        // Persist domain track into submissions table
        try {
          await supabase.from('submissions').insert({
            team_id: currentTeamId,
            project_title: `${cleanTeamName} - ${cleanDomain}`,
            category: cleanDomain,
            sdg_goal: cleanDomain,
            status: 'Registered'
          });
        } catch (subErr) {
          console.warn('Submissions track insert notice:', subErr);
        }

        finalTeamData = { ...team, domain: cleanDomain };
        localStorage.setItem(`haxlr8_team_${validLeaderId}`, JSON.stringify(finalTeamData));
        localStorage.removeItem('haxlr8_teams_db');
        currentTeamId = team.id;
      }

      // --- Upload Files Helper ---
      const uploadFile = async (file, memberName, side) => {
        if (!file) return null;
        if (!file.type.startsWith('image/')) {
          throw new Error('Only image files are allowed for ID cards.');
        }
        if (file.size > 3 * 1024 * 1024) {
          throw new Error('ID card image size must be under 3MB.');
        }
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const safeName = memberName ? memberName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : 'member';
        const path = `uploads/${timestamp}_${randomStr}_${safeName}_${side}.${file.name.split('.').pop()}`;

        try {
          const { error } = await supabase.storage.from('id-cards').upload(path, file, { cacheControl: '3600', upsert: false });
          if (!error) {
            const { data } = supabase.storage.from('id-cards').getPublicUrl(path);
            if (data?.publicUrl) return data.publicUrl;
          }
        } catch (e) {
          console.warn('Storage upload fallback:', e);
        }
        return URL.createObjectURL(file);
      };

      // --- Upload Files for Leader ---
      if (formData.leader.id_card_front_file) {
        formData.leader.id_card_front_url = await uploadFile(formData.leader.id_card_front_file, formData.leader.full_name, 'front');
      }
      if (formData.leader.id_card_back_file) {
        formData.leader.id_card_back_url = await uploadFile(formData.leader.id_card_back_file, formData.leader.full_name, 'back');
      }

      // --- Upload Files for Teammates ---
      for (let i = 0; i < formData.teammates.length; i++) {
        if (formData.teammates[i].id_card_front_file) {
          formData.teammates[i].id_card_front_url = await uploadFile(formData.teammates[i].id_card_front_file, formData.teammates[i].full_name, 'front');
        }
        if (formData.teammates[i].id_card_back_file) {
          formData.teammates[i].id_card_back_url = await uploadFile(formData.teammates[i].id_card_back_file, formData.teammates[i].full_name, 'back');
        }
      }

      // 2. Format Members (Merge State/City into Location, resolve Dept)
      const formatMember = (m, memberIsLeader = false) => {
        const cleanCity = sanitizeInput(m.city === 'Other' ? m.city_other : m.city);
        const cleanState = sanitizeInput(m.state);
        const cleanDept = sanitizeInput(m.dept === 'Other' ? m.dept_other : m.dept);

        const payload = {
          team_id: currentTeamId,
          full_name: sanitizeInput(m.full_name),
          email: sanitizeInput(m.email).toLowerCase(),
          phone_number: sanitizeInput(m.phone_number),
          location: `${cleanCity}, ${cleanState}`,
          college_name: sanitizeInput(m.college_name),
          reg_no: sanitizeInput(m.reg_no),
          dept: cleanDept,
          year: sanitizeInput(m.year),
          id_card_front_url: m.id_card_front_url,
          id_card_back_url: m.id_card_back_url,
          is_leader: memberIsLeader
        };
        if (m.id && isUUID(m.id)) payload.id = m.id; // Only include ID if valid UUID
        return payload;
      };

      const allMembers = [
        formatMember(formData.leader, true),
        ...formData.teammates.map(t => formatMember(t, false))
      ];

      // 3. Clear old members for this team and insert fresh roster
      let savedMembers = allMembers;
      try {
        await supabase.from('team_members').delete().eq('team_id', currentTeamId);
        const membersPayload = allMembers.map(m => {
          const copy = { ...m, team_id: currentTeamId };
          delete copy.id; // Let DB generate fresh clean UUID
          return copy;
        });
        const { data: insertedMembers, error: memErr } = await supabase
          .from('team_members')
          .insert(membersPayload)
          .select();
        if (memErr) throw memErr;
        if (insertedMembers && insertedMembers.length > 0) {
          savedMembers = insertedMembers;
        }
      } catch (mErr) {
        console.warn('Supabase members insert fallback:', mErr);
        savedMembers = allMembers.map((m) => ({ ...m, team_id: currentTeamId, id: ensureUUID(m.id) }));
      }

      localStorage.setItem(`haxlr8_members_${validLeaderId}`, JSON.stringify(savedMembers));
      localStorage.removeItem('haxlr8_members_db');

      setTeamData(finalTeamData);
      setTeamMembers(savedMembers);
      setHasTeam(true);
      setIsEditingTeam(false);

      // Automated email dispatch from haxlr8ecemitm@gmail.com
      try {
        const emailMembersList = savedMembers.map(m => ({
          name: m.full_name,
          phone: m.phone_number,
          role: m.is_leader ? 'Team Lead' : 'Member'
        }));

        const commonPayload = {
          leaderName: formData?.leader?.full_name || 'Team Captain',
          leaderPhone: formData?.leader?.phone_number || '',
          teamName: finalTeamData.team_name,
          domain: finalTeamData.domain || formData.domain || 'Agriculture',
          feeStatus: finalTeamData.payment_status === 'submitted' ? '₹1,200 (Verified / Paid)' : '₹1,200 (Pending Verification)',
          members: emailMembersList,
          teamId: finalTeamData.id,
          crewCount: savedMembers.length
        };

        if (formData?.leader?.email) {
          sendParticipantWelcomeEmail({
            recipientEmail: formData.leader.email,
            ...commonPayload
          }).catch(e => console.warn('Leader email notification log:', e));
        }
        // Also dispatch confirmation to all teammates
        formData?.teammates?.forEach(tm => {
          if (tm?.email && tm.email.trim()) {
            sendParticipantWelcomeEmail({
              recipientEmail: tm.email.trim(),
              ...commonPayload
            }).catch(e => console.warn('Teammate email notification log:', e));
          }
        });
      } catch (emailErr) {
        console.warn('Squad email dispatch notice:', emailErr);
      }

      setToastMsg(isEditingTeam ? '🎉 Crew roster updated successfully!' : '🎉 Squad manifest locked in successfully! Confirmation email dispatched.');
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCreating(false);
    }
  };

  // --- RENDER HELPERS ---
  const totalSteps = 2 + formData.teammates.length; // Setup + Leader + Teammates

  const renderMemberFields = (member, isLeader, index) => {
    const updateMember = (fieldOrObj, value) => {
      const updates = typeof fieldOrObj === 'object' ? fieldOrObj : { [fieldOrObj]: value };
      if (isLeader) {
        setFormData(prev => ({ ...prev, leader: { ...prev.leader, ...updates } }));
      } else {
        setFormData(prev => {
          const newTeammates = [...prev.teammates];
          newTeammates[index] = { ...newTeammates[index], ...updates };
          if (updates.state !== undefined) newTeammates[index].city = '';
          return { ...prev, teammates: newTeammates };
        });
      }
    };

    return (
      <div>
        <div className="team-member-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {/* Personal Details */}
          <div>
            <label style={styles.label}>Full Name *</label>
            <input type="text" value={member.full_name} onChange={e => updateMember('full_name', e.target.value)} style={styles.input} placeholder="Full Name as per College ID" />
          </div>
          <div>
            <label style={styles.label}>Email Address *</label>
            <input type="email" value={member.email} onChange={e => updateMember('email', e.target.value)} style={styles.input} placeholder="Email Address" />
          </div>
          <div>
            <label style={styles.label}>Phone Number *</label>
            <div style={{ display: 'flex', borderRadius: 12, border: '1.5px solid #cbd5e1', overflow: 'hidden', background: '#fafafa' }}>
              <span style={{ padding: '12px 14px', background: '#f1f5f9', borderRight: '1.5px solid #cbd5e1', color: '#0284c7', fontSize: 14, fontWeight: 800 }}>+91</span>
              <input type="tel" value={member.phone_number} onChange={e => updateMember('phone_number', e.target.value.replace(/\D/g, '').slice(0, 10))} style={{ width: '100%', padding: '12px 14px', border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', background: 'transparent', color: '#0f172a' }} placeholder="10-digit mobile number" />
            </div>
          </div>

          {/* Location Details */}
          <div>
            <label style={styles.label}>State *</label>
            <select value={member.state} onChange={e => { updateMember('state', e.target.value); if (isLeader) setFormData(p => ({ ...p, leader: { ...p.leader, state: e.target.value, city: '' } })); }} style={{ ...styles.input, cursor: 'pointer' }}>
              <option value="" disabled>Select State</option>
              {Object.keys(INDIA_STATES_CITIES).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>City / District *</label>
            <select value={member.city} onChange={e => updateMember('city', e.target.value)} style={{ ...styles.input, cursor: 'pointer' }}>
              <option value="" disabled>Select City</option>
              {member.state && INDIA_STATES_CITIES[member.state]?.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="Other">Other (Please Specify)</option>
            </select>
          </div>
          {member.city === 'Other' && (
            <div>
              <label style={styles.label}>Specify City / District</label>
              <input type="text" value={member.city_other || ''} onChange={e => updateMember('city_other', e.target.value)} style={styles.input} placeholder="Your City" />
            </div>
          )}

          {/* Academic Details */}
          <div>
            <label style={styles.label}>College / Organization *</label>
            <input type="text" value={member.college_name} onChange={e => updateMember('college_name', e.target.value)} style={styles.input} placeholder="E.g., MIT Mysore" />
          </div>
          <div>
            <label style={styles.label}>USN / University Seat Number *</label>
            <input 
              type="text" 
              value={member.reg_no} 
              onChange={e => updateMember('reg_no', e.target.value.toUpperCase())} 
              style={styles.input} 
              placeholder="e.g. 4PS24EC076 or KUB24ECE147" 
            />
            <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4, fontWeight: 600 }}>
              🎓 Enter your college USN or university seat number.
            </div>
          </div>
          <div>
            <label style={styles.label}>Department</label>
            <select value={member.dept} onChange={e => updateMember('dept', e.target.value)} style={{ ...styles.input, cursor: 'pointer' }}>
              <option value="" disabled>Select Department</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {member.dept === 'Other' && (
            <div>
              <label style={styles.label}>Specify Department</label>
              <input type="text" value={member.dept_other} onChange={e => updateMember('dept_other', e.target.value)} style={styles.input} placeholder="Your Department" />
            </div>
          )}
          <div>
            <label style={styles.label}>Year of Study</label>
            <select value={member.year} onChange={e => updateMember('year', e.target.value)} style={{ ...styles.input, cursor: 'pointer' }}>
              <option value="" disabled>Select Year</option>
              {[1, 2, 3, 4].map(y => <option key={y} value={`${y} Year`}>{y} Year</option>)}
            </select>
          </div>
        </div>

        {/* ID Card Upload 
        <div style={{ marginTop: 24, borderTop: '1.5px solid #e5e7eb', paddingTop: 24 }}>
          {!member.id_card_front_url ? (
            <IdCardUpload 
              memberName={member.full_name} 
              onComplete={(data) => {
                updateMember({
                  id_card_front_url: data.frontPreview,
                  id_card_back_url: data.backPreview,
                  id_card_front_file: data.frontFile,
                  id_card_back_file: data.backFile
                });
              }} 
            />
          ) : (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', padding: 16, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#166534' }}>ID Card Confirmed</div>
                  <div style={{ fontSize: 13, color: '#15803d' }}>Front and back images uploaded successfully.</div>
                </div>
              </div>
              <button type="button" onClick={() => { 
                updateMember({
                  id_card_front_url: '', 
                  id_card_back_url: '',
                  id_card_front_file: null,
                  id_card_back_file: null
                }); 
              }} style={{ padding: '8px 16px', background: '#fff', border: '1.5px solid #bbf7d0', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#166534', cursor: 'pointer' }}>
                Replace Images
              </button>
            </div>
          )}
        </div>*/}
      </div>
    );
  };

  // --- MAIN RENDER ---
  // Registrations permanently closed for new squads
  if (!hasTeam && !teamData && !isEditingTeam) {
    return (
      <div style={{ maxWidth: 580, margin: '40px auto', width: '100%', textAlign: 'center', background: '#ffffff', borderRadius: 24, padding: '36px 24px', border: '2px solid #fed7aa', boxShadow: '0 12px 36px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <AmongUsCrewmate color="red" size={68} hat="cap" speechText="Registrations are closed!" />
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 20, padding: '4px 12px', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            ● REGISTRATIONS OFFICIALLY CLOSED
          </span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '0 0 10px' }}>
          Registration Has Closed
        </h2>
        <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.6, margin: '0 auto 24px', maxWidth: 460 }}>
          Registration capacity for HAXLR8 3.0 has been reached. No new squads or teams can be created. If your team was registered under a different email, please sign out and log in with your squad's registered email address.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={async () => {
              try {
                await supabase.auth.signOut();
                localStorage.clear();
                sessionStorage.clear();
              } catch (e) {}
              window.location.href = '/login';
            }}
            style={{
              padding: '11px 22px',
              borderRadius: 12,
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Sign Out & Switch Account
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '11px 20px',
              borderRadius: 12,
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              color: '#475569',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!hasTeam || isEditingTeam) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Wizard Header / Progress Bar */}
        <div className="team-wizard-card" style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', marginBottom: 20 }}>
            <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '100%', height: 4, background: '#f1e7db', borderRadius: 10, zIndex: 0 }}></div>
            <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', height: 4, background: 'linear-gradient(90deg, #0284c7, #06b6d4)', borderRadius: 10, zIndex: 0, transition: 'width 0.3s ease', width: `${(currentStep / (totalSteps - 1)) * 100}%` }}></div>

            {Array.from({ length: totalSteps }).map((_, idx) => {
              const isActive = idx === currentStep;
              const isPast = idx < currentStep;
              return (
                <div key={idx} className="team-step-circle" style={{
                  position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', fontWeight: 900, fontSize: 13, border: '2.5px solid', transition: 'all 0.3s ease',
                  background: isPast ? '#16a34a' : isActive ? '#0284c7' : '#ffffff',
                  borderColor: isPast ? '#16a34a' : isActive ? '#0284c7' : '#cbd5e1',
                  color: isPast || isActive ? '#ffffff' : '#64748b',
                  boxShadow: isActive ? '0 0 12px rgba(2, 132, 199, 0.4)' : 'none'
                }}>
                  {isPast ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg> : idx + 1}
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: 'center', fontWeight: 900, fontSize: 16, color: '#0f172a', letterSpacing: '-0.01em' }}>
            {currentStep === 0 && "Step 1: Squad Configuration"}
            {currentStep === 1 && "Step 2: Flight Captain (Leader) Credentials"}
            {currentStep > 1 && `Step ${currentStep + 1}: Crewmate ${currentStep - 1} Credentials`}
          </div>
        </div>

        {/* Wizard Content */}
        <div className="team-wizard-card" style={styles.card}>

          {/* Step 1: Team Setup */}
          {currentStep === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minHeight: 300 }}>
              <div style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ background: '#ffedd5', color: '#ea580c', padding: 8, borderRadius: 10, flexShrink: 0 }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg></div>
                <div>
                  <h3 style={{ color: '#0f172a', fontWeight: 900, margin: '0 0 6px 0', fontSize: 15 }}>Station Roster Directives</h3>
                  <p style={{ color: '#475569', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                    Select your domain, choose a squad name, and add <strong>3 to 4 members</strong> (including captain). Inter-college teams are welcome! Registration fee is ₹1,200 per team.
                  </p>
                </div>
              </div>

              {/* 1. DOMAIN SELECTION FIRST */}
              <div>
                <label style={styles.label}>1. Select Challenge Domain *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 8 }}>
                  {[
                    { id: 'Agriculture', icon: '🌾', title: 'Agriculture' },
                    { id: 'Healthcare', icon: '🏥', title: 'Healthcare' },
                    { id: 'Smart City', icon: '🏙️', title: 'Smart City' }
                  ].map(domOpt => {
                    const isSelected = formData.domain === domOpt.id;
                    const isFull = isDomainFull(domOpt.id);
                    return (
                      <div
                        key={domOpt.id}
                        onClick={() => {
                          if (isFull) {
                            setErrorMsg(`${domOpt.title} domain slots are completely full. Only Agriculture is currently open.`);
                            return;
                          }
                          setErrorMsg('');
                          setFormData({ ...formData, domain: domOpt.id });
                        }}
                        style={{
                          border: isFull
                            ? '1.5px dashed #fca5a5'
                            : (isSelected ? '2.5px solid #0284c7' : '1.5px solid #cbd5e1'),
                          background: isFull
                            ? '#fef2f2'
                            : (isSelected ? '#f0f9ff' : '#ffffff'),
                          borderRadius: 14,
                          padding: '16px 14px',
                          cursor: isFull ? 'not-allowed' : 'pointer',
                          opacity: isFull ? 0.72 : 1,
                          transition: 'all 0.2s',
                          boxShadow: isSelected && !isFull ? '0 4px 14px rgba(2, 132, 199, 0.18)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          position: 'relative',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 26, filter: isFull ? 'grayscale(0.4)' : 'none' }}>{domOpt.icon}</span>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 900, color: isFull ? '#991b1b' : (isSelected ? '#0369a1' : '#0f172a') }}>
                              {domOpt.title}
                            </div>
                            {isFull ? (
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', marginTop: 2 }}>
                                Slots are full (Closed)
                              </div>
                            ) : domOpt.id === 'Smart City' ? (
                              <div style={{ fontSize: 11, fontWeight: 800, color: '#b45309', marginTop: 2 }}>
                                1 slot left for final squad 🔥
                              </div>
                            ) : null}
                          </div>
                        </div>
                        {isFull ? (
                          <span style={{ fontSize: 10, fontWeight: 800, color: '#b91c1c', background: '#fee2e2', padding: '4px 8px', borderRadius: 10, border: '1px solid #fecaca', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            SLOTS FULL
                          </span>
                        ) : isSelected ? (
                          <span style={{ fontSize: 10.5, fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '3px 8px', borderRadius: 10, border: '1px solid #bae6fd' }}>
                            SELECTED ✓
                          </span>
                        ) : domOpt.id === 'Smart City' ? (
                          <span style={{ fontSize: 10, fontWeight: 900, color: '#b45309', background: '#fffbeb', padding: '4px 8px', borderRadius: 10, border: '1px solid #fde68a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            1 SLOT LEFT 🔥
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. TEAM NAME */}
              <div>
                <label style={styles.label}>2. Squad / Team Name *</label>
                <input type="text" value={formData.teamName} onChange={e => setFormData({ ...formData, teamName: e.target.value })} placeholder="e.g. Innovators, Crew Red, Skeld Hackers" style={styles.input} />
              </div>

              {/* 3. TOTAL CREW SIZE */}
              <div>
                <label style={styles.label}>3. Total Crew Size *</label>
                <select value={formData.teamSize} onChange={e => {
                  const newSize = parseInt(e.target.value);
                  const requiredTeammates = newSize - 1;
                  let newTeammates = [...formData.teammates];

                  if (newTeammates.length < requiredTeammates) {
                    for (let i = newTeammates.length; i < requiredTeammates; i++) {
                      newTeammates.push({ ...defaultMember });
                    }
                  } else if (newTeammates.length > requiredTeammates) {
                    newTeammates = newTeammates.slice(0, requiredTeammates);
                  }

                  setFormData(prev => ({ ...prev, teamSize: newSize, teammates: newTeammates }));
                }} style={{ ...styles.input, cursor: 'pointer' }}>
                  <option value={3}>3 Members (Flight Captain + 2 Crewmates)</option>
                  <option value={4}>4 Members (Flight Captain + 3 Crewmates)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Team Lead Details */}
          {currentStep === 1 && (
            <div style={{ minHeight: 300 }}>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>Your Credentials (Team Captain)</h3>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Provide your academic information and communication channels.</p>
              </div>
              {renderMemberFields(formData.leader, true, null)}
            </div>
          )}

          {/* Step 3+: Teammate Details */}
          {currentStep > 1 && (
            <div style={{ minHeight: 300 }}>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>Crewmate {currentStep - 1} Credentials</h3>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Provide credentials for crewmate {currentStep} of {formData.teamSize}.</p>
              </div>
              {renderMemberFields(formData.teammates[currentStep - 2], false, currentStep - 2)}
            </div>
          )}

          {errorMsg && (
            <div style={{ marginTop: 24, background: '#fef2f2', border: '1.5px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {errorMsg}
            </div>
          )}

          {/* Navigation Controls */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1.5px solid #f1e7db', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" onClick={handleBack} disabled={currentStep === 0 || creating} style={currentStep === 0 ? { ...styles.buttonBack, opacity: 0, cursor: 'default' } : styles.buttonBack}
              onMouseEnter={e => { if (currentStep !== 0 && !creating) e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={e => { if (currentStep !== 0 && !creating) e.currentTarget.style.background = '#ffffff'; }}>
              ← Back
            </button>

            {currentStep === totalSteps - 1 ? (
              <button type="button" onClick={handleSubmit} disabled={creating || deadlinePassed} style={(creating || deadlinePassed) ? styles.buttonDisabled : styles.buttonPrimary}
                onMouseEnter={e => { if (!creating && !deadlinePassed) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { if (!creating && !deadlinePassed) e.currentTarget.style.transform = 'translateY(0)'; }}>
                {deadlinePassed ? 'Deadline Passed' : (creating ? 'Locking In...' : (isEditingTeam ? 'Update Flight Squad 🚀' : 'Confirm Crew Manifest 🚀'))}
              </button>
            ) : (
              <button type="button" onClick={handleNext} style={styles.buttonSecondary}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                Next Crewmate →
              </button>
            )}
          </div>

        </div>
      </div>
    );
  }

  // --- SUMMARY VIEW (After Registration) ---
  const teamLeader = teamMembers?.find(m => m.is_leader === true) || 
                     teamMembers?.find(m => m.id === teamData?.leader_id) || 
                     teamMembers?.find(m => m.email?.toLowerCase() === user?.email?.toLowerCase());
  const leaderName = teamLeader?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Flight Captain';
  const registeredDate = teamData?.created_at ? new Date(teamData.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

  // --- Retrieve payment state ---
  let paymentRecord = null;
  try {
    if (user?.id) {
      const cached = localStorage.getItem(`haxlr8_payment_${user.id}`);
      if (cached) paymentRecord = JSON.parse(cached);
    }
  } catch (e) {}

  if (!paymentRecord && (teamData?.payment_status === 'submitted' || teamData?.payment_utr)) {
    paymentRecord = {
      transaction_id: teamData.payment_utr,
      amount: teamData.payment_amount || 1200,
      status: 'submitted',
      submitted_at: teamData.payment_date || new Date().toISOString()
    };
  }

  if (!paymentRecord && submissions && submissions.length > 0) {
    const paidSub = submissions.find(s => s.pdf_url || (s.project_description && s.project_description.includes('Registration fee')) || s.status === 'Shortlisted');
    if (paidSub) {
      const utrMatch = paidSub.project_description?.match(/UTR:\s*([A-Za-z0-9_-]+)/i);
      paymentRecord = {
        transaction_id: utrMatch ? utrMatch[1] : (paidSub.pdf_url ? 'VERIFIED' : 'VERIFIED'),
        amount: 1200,
        status: 'submitted',
        submitted_at: paidSub.updated_at || paidSub.created_at || new Date().toISOString()
      };
    }
  }

  const isPaid = Boolean(paymentRecord?.transaction_id || teamData?.payment_status === 'submitted' || teamData?.payment_utr);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Top Banner */}
      <div style={{ ...styles.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ width: 76, height: 76, borderRadius: 20, background: 'linear-gradient(135deg, #0284c7, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 24px rgba(2, 132, 199, 0.3)' }}>
            <Rocket size={34} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>{teamData.team_name}</h2>
              <span style={{ fontSize: 11, fontWeight: 800, background: isPaid ? '#dcfce7' : '#e0f2fe', color: isPaid ? '#15803d' : '#0369a1', border: isPaid ? '1px solid #bbf7d0' : '1px solid #bae6fd', padding: '4px 12px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isPaid ? 'Payment Verified ✓' : 'Flight Ready'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 36, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={18} color="#0284c7" />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{teamMembers.length} Crew</div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', marginTop: 2 }}>Members</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Flag size={18} color="#ea580c" />
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', lineHeight: 1, marginBottom: 2 }}>Registered on</div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>{registeredDate}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ClipboardList size={18} color="#16a34a" />
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', lineHeight: 1, marginBottom: 2 }}>Flight Captain</div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>{leaderName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AmongUsCrewmate color="lime" size={54} speechText="Squad ready for launch!" />
        </div>
      </div>

      {/* Action Banner to update USN */}
      {(teamMembers || []).some(m => isLikelyPhone(m.reg_no)) && (
        <div style={{
          background: '#fffbeb',
          border: '2px solid #fde68a',
          borderRadius: 18,
          padding: '16px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          boxShadow: '0 2px 10px rgba(245, 158, 11, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 26, lineHeight: 1 }}>🎓</div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: '#92400e' }}>
                Update College USN / University Seat Number
              </div>
              <div style={{ fontSize: 12.5, color: '#b45309', marginTop: 3, lineHeight: 1.4 }}>
                Please enter your college USN or university seat number (e.g. <strong>4PS24EC076</strong>).
              </div>
            </div>
          </div>
          <button
            onClick={() => openUsnModal()}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: 'none',
              background: '#d97706',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Edit2 size={14} /> Update USN Now →
          </button>
        </div>
      )}

      <div className="dash-grid-2 team-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'stretch' }}>

        {/* Left Column: Team Members */}
        <div style={{ ...styles.card, height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', margin: 0 }}>Crew Roster ({teamMembers.length})</h3>
              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>Official college USN & credentials</div>
            </div>
            <button
              onClick={() => openUsnModal()}
              style={{
                padding: '7px 14px',
                borderRadius: 10,
                background: '#e0f2fe',
                border: '1.5px solid #7dd3fc',
                color: '#0284c7',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease'
              }}
              title="Edit college USN / seat numbers for team members"
            >
              <Edit2 size={13} /> Edit USN / Seat No
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {teamMembers.map((m, idx) => {
              const isLeader = Boolean(m.is_leader);
              const hasPhoneWarning = isLikelyPhone(m.reg_no);

              return (
                <div key={m.id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 0', borderBottom: idx !== teamMembers.length - 1 ? '1px solid #f1e7db' : 'none' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', fontWeight: 900, fontSize: 16, flexShrink: 0, background: isLeader ? '#e0f2fe' : '#eff6ff', border: `2px solid ${isLeader ? '#7dd3fc' : '#bfdbfe'}`, boxShadow: isLeader ? '0 2px 10px rgba(2, 132, 199, 0.2)' : 'none', overflow: 'hidden' }}>
                    {m.id_card_front_url ? (
                      <img src={m.id_card_front_url} alt={m.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (m.email?.toLowerCase() === user?.email?.toLowerCase() && (user?.user_metadata?.avatar_url || user?.user_metadata?.picture)) ? (
                      <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt={m.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      m.full_name ? m.full_name[0].toUpperCase() : '?'
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ display: 'inline-block', fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 12, background: isLeader ? '#e0f2fe' : '#eff6ff', color: isLeader ? '#0284c7' : '#0284c7', border: `1px solid ${isLeader ? '#bae6fd' : '#bfdbfe'}`, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {isLeader ? 'Captain (Lead)' : 'Crewmate'}
                    </span>
                    <div style={{ fontSize: 15.5, fontWeight: 800, color: '#0f172a', marginBottom: 3 }}>
                      {m.full_name}
                    </div>
                    <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 3 }}>
                      {m.email}
                    </div>
                    <div style={{ fontSize: 12.5, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                      📞 +91 {m.phone_number}
                    </div>

                    {/* USN / University Seat Number Display Badge */}
                    <div style={{ 
                      marginTop: 8, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      flexWrap: 'wrap', 
                      gap: 8, 
                      background: '#f8fafc', 
                      padding: '6px 12px', 
                      borderRadius: 8, 
                      border: '1.5px solid #e2e8f0',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                          🎓 USN:
                        </span>
                        <span style={{ 
                          fontSize: 13, 
                          fontWeight: 900, 
                          color: '#0284c7', 
                          fontFamily: 'monospace' 
                        }}>
                          {m.reg_no || 'Not Set'}
                        </span>
                      </div>
                      <button
                        onClick={() => openUsnModal(m.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0284c7',
                          fontSize: 11.5,
                          fontWeight: 800,
                          cursor: 'pointer',
                          padding: 0,
                          textDecoration: 'underline'
                        }}
                      >
                        Edit USN
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Next Steps */}
        <div style={{ ...styles.card, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fed7aa' }}>
              <Target size={20} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>Mission Directives</h3>
          </div>
          <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 24 }}>Follow the flight stages below to secure your entry pass.</p>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 24, marginLeft: 10, paddingBottom: 10 }}>
            <div style={{ position: 'absolute', top: 16, bottom: 16, left: 15, width: 2, background: isPaid ? '#16a34a' : '#f1e7db', zIndex: 0 }}></div>

            {[
              { 
                num: 1, 
                title: 'Squad Manifest Locked In', 
                desc: `Crew of ${teamMembers.length} confirmed in ${resolveDomain(teamData, submissions?.[0], user, 'Healthcare')} domain.`,
                isDone: true 
              },
              { 
                num: 2, 
                title: isPaid ? 'Registration Fee Paid (₹1,200)' : 'Pay Registration Fee (₹1,200)', 
                desc: isPaid ? `Registration fee ₹1,200 verified (UTR: ${paymentRecord?.transaction_id || 'VERIFIED'}).` : 'Pay ₹1,200 team fee & submit verification details.',
                isDone: isPaid 
              },
              { 
                num: 3, 
                title: isPaid ? 'Payment Receipt Unlocked' : 'Unlock Payment Receipt', 
                desc: isPaid ? 'Verified registration pass and fee receipt is ready for download.' : 'Download your verified hackathon registration and fee receipt.',
                isDone: isPaid 
              }
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  background: step.isDone ? '#16a34a' : '#ffffff', 
                  border: `2px solid ${step.isDone ? '#16a34a' : '#0284c7'}`, 
                  color: step.isDone ? '#ffffff' : '#0284c7', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: 13, 
                  fontWeight: 900, 
                  flexShrink: 0, 
                  boxShadow: step.isDone ? '0 2px 8px rgba(22, 163, 74, 0.3)' : '0 2px 8px rgba(2, 132, 199, 0.2)' 
                }}>
                  {step.isDone ? '✓' : step.num}
                </div>
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 150 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 800, color: step.isDone ? '#15803d' : '#0f172a', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{step.title}</span>
                        {step.isDone && (
                          <span style={{ fontSize: 10, fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                            COMPLETED ✓
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.5 }}>{step.desc}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ color: '#ea580c' }}>
              <Calendar size={24} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#854d0e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2, fontWeight: 800 }}>Registration & Payment Lock</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#ea580c' }}>November 02, 2026 · 11:59 PM IST</div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Action Card */}
      <div style={{ ...styles.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: isPaid ? '#dcfce7' : '#e0f2fe', border: `1.5px solid ${isPaid ? '#86efac' : '#bae6fd'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isPaid ? <CheckCircle2 size={24} color="#16a34a" /> : <Rocket size={24} color="#0284c7" />}
          </div>
          <div>
            <div style={{ fontSize: 16.5, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>
              {isPaid ? 'Payment Verified & Receipt Unlocked! 🎉' : 'Ready to complete squad verification?'}
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              {isPaid 
                ? 'Your squad registration fee (₹1,200) is verified. Access and download your official entry pass and payment receipt.'
                : 'Proceed to Payment & Verification to pay the ₹1,200 team fee and generate your verified payment receipt.'}
            </div>
          </div>
        </div>
        <button
          onClick={() => { if (setActiveTab) setActiveTab(isPaid ? 'ticket' : 'payment'); }}
          style={{ 
            padding: '14px 28px', 
            borderRadius: 12, 
            border: 'none', 
            background: isPaid ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' : '#0284c7', 
            color: '#ffffff', 
            fontSize: 14, 
            fontWeight: 800, 
            cursor: 'pointer', 
            transition: 'all 0.2s', 
            boxShadow: isPaid ? '0 4px 16px rgba(22, 163, 74, 0.35)' : '0 4px 14px rgba(2, 132, 199, 0.3)' 
          }}
        >
          {isPaid ? 'View Payment Receipt →' : 'Proceed to Payment & Verification (₹1,200) →'}
        </button>
      </div>

      {/* EDIT USN / UNIVERSITY SEAT NUMBER MODAL */}
      {showUsnEditModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 22,
            maxWidth: 580,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px 24px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            border: '2px solid #7dd3fc',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, borderBottom: '1.5px solid #f1e7db', paddingBottom: 14 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                  🎓 College Registration Credentials
                </div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#0f172a' }}>
                  Update USN / University Seat Numbers
                </h3>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                  Enter your college USN or university seat number (e.g. <strong>4PS24EC076</strong> or <strong>KUB24ECE147</strong>).
                </p>
              </div>
              <button
                type="button"
                onClick={() => { if (!savingUsn) setShowUsnEditModal(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#64748b', borderRadius: 8 }}
              >
                <X size={20} />
              </button>
            </div>

            {usnModalError && (
              <div style={{ marginBottom: 16, background: '#fef2f2', border: '1.5px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={18} />
                <span>{usnModalError}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              {(teamMembers || []).map((m, idx) => {
                const isLeader = Boolean(m.is_leader);
                const currentVal = usnEditMap[m.id] ?? m.reg_no ?? '';

                return (
                  <div key={m.id || idx} style={{
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 14,
                    padding: '14px 16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontWeight: 800, fontSize: 14.5, color: '#0f172a' }}>
                        {m.full_name}
                      </div>
                      <span style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: isLeader ? '#0284c7' : '#64748b',
                        background: isLeader ? '#e0f2fe' : '#e2e8f0',
                        padding: '2px 8px',
                        borderRadius: 6
                      }}>
                        {isLeader ? 'FLIGHT CAPTAIN' : `CREWMATE ${idx}`}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginBottom: 10 }}>
                      🏛️ {m.college_name || 'College'} · {m.dept || 'Engineering'}
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
                        USN / University Seat Number *
                      </label>
                      <input
                        type="text"
                        value={currentVal}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setUsnEditMap(prev => ({ ...prev, [m.id]: val }));
                        }}
                        placeholder="e.g. 4PS24EC076 or KUB24ECE147"
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: `1.5px solid ${currentVal ? '#0284c7' : '#cbd5e1'}`,
                          background: '#ffffff',
                          fontSize: 14,
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: '#0f172a',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4, fontWeight: 600 }}>
                        🎓 Enter your college USN or university seat number.
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px solid #f1e7db', paddingTop: 16 }}>
              <button
                type="button"
                onClick={() => { if (!savingUsn) setShowUsnEditModal(false); }}
                disabled={savingUsn}
                style={{
                  padding: '11px 20px',
                  borderRadius: 10,
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: savingUsn ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveUsnUpdates}
                disabled={savingUsn}
                style={{
                  padding: '11px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: savingUsn ? '#94a3b8' : '#0284c7',
                  color: '#ffffff',
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: savingUsn ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                {savingUsn ? 'Saving to Database...' : 'Save & Update USN 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}

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

        {/* ID card popup - commented out
        {showIdPopup && !isEditingTeam && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIdPopup(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 9998,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                cursor: 'pointer'
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px', pointerEvents: 'none'
              }}
            >
              <div style={{
                pointerEvents: 'auto',
                width: '100%', maxWidth: 450,
                background: '#fff', borderRadius: 24,
                boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', sans-serif",
                textAlign: 'center', padding: '32px 24px'
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🆔</div>
                <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 800, color: '#111' }}>Action Required: Upload ID Cards</h2>
                <p style={{ margin: '0 0 24px', fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.6 }}>
                  Please upload Front & Back Student ID cards for all team members to complete verification before proceeding.
                </p>
                <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                  <button onClick={() => setShowIdPopup(false)} style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>Later</button>
                  <button 
                    onClick={() => {
                      setShowIdPopup(false);
                      startEditTeam(1);
                    }} 
                    style={{ flex: 1, padding: '12px', background: '#D97706', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Add ID Cards Now
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
        */}
      </AnimatePresence>

      <style>{`
        @media (max-width: 640px) {
          .team-wizard-card {
            padding: 18px 14px !important;
          }
          .team-member-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .team-summary-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .team-step-circle {
            width: 30px !important;
            height: 30px !important;
            font-size: 11px !important;
          }
        }
      `}</style>
    </div>
  );
}
