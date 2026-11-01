/**
 * HAXLR8 3.0 — Official Problem Statements Catalog
 * 15 Challenges per Domain (Smart City, Agriculture, Healthcare) = 45 Challenges Total
 * Max 3 Teams per Problem Statement limit enforced across the system.
 */

export const MAX_TEAMS_PER_PROBLEM = 3;

export const DOMAIN_METADATA = {
  'Smart City': {
    id: 'smart-city',
    title: 'Smart City',
    subtitle: '15 Challenges | Pick one. Build it. Power the city.',
    summary: 'Smart city innovation beautifully intertwines technology and civic life, turning everyday urban failures in water, power, traffic, safety, and waste into opportunities to build solutions that make cities resilient, efficient, and livable.',
    color: '#0284c7',
    bg: '#e0f2fe',
    border: '#7dd3fc',
    textCol: '#0369a1',
    badgeColor: '#0284c7',
    icon: '🏙️',
    pdfFileName: 'HAXLR8_3.0_Smart_City_Problem_Statements.pdf',
    defaultPdfUrl: '/assets/documents/HAXLR8_3.0_Smart_City_Problem_Statements.pdf'
  },
  'Agriculture': {
    id: 'agriculture',
    title: 'Agriculture',
    subtitle: '15 Engineering & ML Challenges | Pick one. Build it. Grow the future.',
    summary: 'Agri-tech beautifully intertwines engineering and farming, using robotics, sensing, and machine learning to turn everyday field challenges in crops, soil, water, livestock, and waste into smarter, more sustainable harvests.',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#86efac',
    textCol: '#15803d',
    badgeColor: '#16a34a',
    icon: '🌾',
    pdfFileName: 'HAXLR8_3.0_Agriculture_Problem_Statements.pdf',
    defaultPdfUrl: '/assets/documents/HAXLR8_3.0_Agriculture_Problem_Statements.pdf'
  },
  'Healthcare': {
    id: 'healthcare',
    title: 'Healthcare',
    subtitle: '15 Challenges | Pick one. Build it. Save lives.',
    summary: 'Practical healthcare innovation through functional prototypes, technical problem-solving and multidisciplinary collaboration across clinics, hospitals, wearable sensors, and decentralized health logistics.',
    color: '#e11d48',
    bg: '#fff1f2',
    border: '#fecdd3',
    textCol: '#be123c',
    badgeColor: '#e11d48',
    icon: '🩺',
    pdfFileName: 'HAXLR8_3.0_Healthcare_Problem_Statements.pdf',
    defaultPdfUrl: '/assets/documents/HAXLR8_3.0_Healthcare_Problem_Statements.pdf',
    guidelines: [
      'Participants should develop a functional prototype that addresses the selected healthcare challenge.',
      'Hardware-oriented solutions should demonstrate meaningful physical hardware integration wherever applicable.',
      'Software-oriented solutions should demonstrate a working application, platform or AI-based implementation.',
      'Teams may use suitable development boards, sensors, open-source tools, APIs and publicly available datasets.',
      'Solutions will be expected to demonstrate innovation, technical feasibility, scalability and practical healthcare impact.',
      'Any AI-generated medical recommendation must be presented as decision support and not as a replacement for qualified medical professionals.'
    ]
  }
};

export const PROBLEM_STATEMENTS = [
  // ─── SMART CITY (1 to 15) ──────────────────────────────────────────────
  {
    id: 'SC-01',
    num: 1,
    domain: 'Smart City',
    title: 'Real-Time Urban Flooding Detection and Automated Drainage Intervention in Flood-Prone City Zones',
    description: 'Indian cities flood within minutes of monsoon bursts while drainage authorities learn about it only through citizen complaints, hours too late. Design a solution that detects waterlogging as it forms and triggers timely drainage response before traffic, property, and lives are affected.',
    tags: ['IoT Sensors', 'Flood Prediction', 'Civic Automation', 'Urban Drainage']
  },
  {
    id: 'SC-02',
    num: 2,
    domain: 'Smart City',
    title: 'Intelligent Streetlight Energy Optimization with Continuous Fault Detection Across Municipal Grids',
    description: 'Large shares of municipal streetlights stay dead for weeks because faults are discovered by accident, and functioning lights burn all night on empty roads. Design an intelligent solution that continuously detects failures and adapts streetlight operation to actual need, cutting both energy waste and dark streets.',
    tags: ['Energy Efficiency', 'Smart Lighting', 'Fault Telemetry', 'Municipal Grid']
  },
  {
    id: 'SC-03',
    num: 3,
    domain: 'Smart City',
    title: 'Continuous Water Pipeline Leak Detection and Proactive Pressure Regulation in Aging Distribution Networks',
    description: 'Indian cities lose nearly a third of treated drinking water to undetected leaks in aging pipes, while many wards simultaneously face low pressure supply. Design a continuous monitoring solution that pinpoints leaks early and regulates distribution pressure to save water and stabilize supply.',
    tags: ['Water Infrastructure', 'Acoustic / Pressure Sensors', 'Leak Detection', 'Resource Conservation']
  },
  {
    id: 'SC-04',
    num: 4,
    domain: 'Smart City',
    title: 'Automated Waste Fill-Level Monitoring and Intelligent Collection Dispatch for Municipal Waste Fleets',
    description: 'Municipal waste trucks follow fixed daily routes regardless of whether bins are full or empty, wasting fuel while overflowing bins rot in busy market areas. Design an automated solution that knows bin fill status across the city and dispatches collection intelligently where and when it is actually needed.',
    tags: ['Waste Management', 'Fill-Level Telemetry', 'Fleet Routing', 'Clean City']
  },
  {
    id: 'SC-05',
    num: 5,
    domain: 'Smart City',
    title: 'Real-Time Air Quality Monitoring and Public Exposure Alerting Near Schools, Markets, and Construction Zones',
    description: 'Dangerous air pollution spikes strike specific neighborhoods without warning while city-wide averages hide the risk children and street vendors actually face. Design a real-time solution that detects hyperlocal air quality deterioration and warns exposed populations and authorities before harm accumulates.',
    tags: ['Air Quality', 'Hyperlocal Telemetry', 'Public Health', 'Pollution Alerts']
  },
  {
    id: 'SC-06',
    num: 6,
    domain: 'Smart City',
    title: 'Intelligent Parking Space Detection and Guidance in Congested Commercial Districts',
    description: 'Drivers in busy Indian commercial districts circle for thirty minutes or more hunting parking, creating a large share of local traffic congestion and emissions. Design an intelligent solution that guides drivers directly to available parking and reduces unnecessary cruising in congestion hotspots.',
    tags: ['Smart Mobility', 'Computer Vision / Sensors', 'Traffic Reduction', 'Urban Navigation']
  },
  {
    id: 'SC-07',
    num: 7,
    domain: 'Smart City',
    title: 'Automated Manhole and Sewer Overflow Monitoring to Prevent Urban Flooding and Fatalities',
    description: 'Open manholes and sewer surges kill citizens and flood roads every monsoon, yet municipal corporations discover problems only after accidents are reported. Design an automated monitoring solution that detects dangerous manhole and sewer conditions in real time and alerts response teams before tragedy occurs.',
    tags: ['Civic Safety', 'Sewer Monitoring', 'Disaster Prevention', 'Toxic Gas / Overflow Alert']
  },
  {
    id: 'SC-08',
    num: 8,
    domain: 'Smart City',
    title: 'Real-Time Pedestrian and Cyclist Safety Detection at Unsignalized and High-Risk Intersections',
    description: 'Pedestrians and cyclists face the highest road risk at busy unsignalized crossings where no system today detects their presence or near-miss patterns. Design a real-time solution that identifies vulnerable-road-user conflicts as they happen and enables corrective intervention.',
    tags: ['Pedestrian Safety', 'Edge AI Vision', 'Road Safety', 'Vulnerable Road Users']
  },
  {
    id: 'SC-09',
    num: 9,
    domain: 'Smart City',
    title: 'Intelligent Flood Barrier Control and Proactive Underpass Closure for Low-Lying Roads During Extreme Rainfall',
    description: 'Vehicle owners drown in underpasses every monsoon because closures happen only after water visibly rises and vehicles are already trapped. Design an intelligent solution that predicts underpass flooding ahead of time and enforces closure before water becomes life-threatening.',
    tags: ['Flood Barrier Automation', 'Predictive Inundation', 'Emergency Response', 'Underpass Safety']
  },
  {
    id: 'SC-10',
    num: 10,
    domain: 'Smart City',
    title: 'Unified Municipal Complaint Triage and Automated Resolution Tracking Across City Departments',
    description: 'Citizen complaints about roads, waste, water, and streetlights scatter across departments with no accountability, and most residents never learn whether their complaint was even seen. Design a unified triage solution that routes every complaint to the right department automatically and tracks resolution to completion.',
    tags: ['Civic Grievance Triage', 'NLP / Classification', 'Workflow Automation', 'Citizen Transparency']
  },
  {
    id: 'SC-11',
    num: 11,
    domain: 'Smart City',
    title: 'Data-Driven Public Transport Reliability and Crowding Prediction for Urban Commuter Planning',
    description: 'Urban commuters abandon public transport because buses arrive unpredictably and peak-hour crowding makes travel unbearable, pushing more private vehicles onto already choked roads. Design a data-driven solution that predicts service reliability and crowding so commuters and transport authorities can plan around reality.',
    tags: ['Transit Analytics', 'Crowd Estimation', 'Commuter Intelligence', 'Public Mobility']
  },
  {
    id: 'SC-12',
    num: 12,
    domain: 'Smart City',
    title: 'End-to-End Emergency Response Coordination with Intelligent Traffic Signal Priority for Ambulances and Fire Services',
    description: 'Emergency vehicles lose critical minutes at every signal in Indian traffic, and control rooms have no unified picture of incident, vehicle, and route. Design an end-to-end coordination solution that clears the path intelligently for emergency vehicles from dispatch to arrival.',
    tags: ['Green Corridor', 'Emergency Dispatch', 'Traffic Preemption', 'Life-Saving Mobility']
  },
  {
    id: 'SC-13',
    num: 13,
    domain: 'Smart City',
    title: 'Predictive Urban Heat-Island Mapping and Cooling Resource Allocation During Extreme Heatwaves',
    description: 'Heatwaves now kill more Indians than most natural disasters, yet cities lack street-level heat maps showing which neighborhoods become lethal and when. Design a predictive solution that maps urban heat risk in advance and directs cooling resources and public warnings to the most exposed areas.',
    tags: ['Urban Heat Islands', 'Climate Resilience', 'Thermal Mapping', 'Vulnerability Mitigation']
  },
  {
    id: 'SC-14',
    num: 14,
    domain: 'Smart City',
    title: 'Continuous City-Wide Utility Consumption Anomaly Detection for Water and Energy Loss Identification',
    description: 'Unbilled consumption, theft, and silent infrastructure losses drain municipal revenues while officials discover them only through year-end audits. Design a continuous anomaly-detection solution that identifies abnormal consumption patterns across the city and pinpoints loss locations for immediate verification.',
    tags: ['Anomaly Detection', 'Smart Grid / Meters', 'Revenue Loss Prevention', 'Utility Analytics']
  },
  {
    id: 'SC-15',
    num: 15,
    domain: 'Smart City',
    title: 'Intelligent Disaster Evacuation Route Planning and Real-Time Shelter Allocation During Urban Emergencies',
    description: 'During floods, fires, and building collapses, panicked evacuation routes clog within minutes and families reach shelters that are already full. Design an intelligent solution that plans evacuation dynamically and allocates shelters in real time as disasters unfold.',
    tags: ['Disaster Evacuation', 'Real-Time Routing', 'Shelter Capacity Coordination', 'Emergency Resilience']
  },

  // ─── AGRICULTURE (1 to 15) ─────────────────────────────────────────────
  {
    id: 'AG-01',
    num: 1,
    domain: 'Agriculture',
    title: 'Autonomous Robotic Fruit Harvesting System',
    description: 'Develop a robotic system that identifies ripe fruits, calculates their position and orientation, and harvests them without damaging the fruit or plant. It should use computer vision, robotic movement, and precision gripping.',
    tags: ['Agricultural Robotics', 'Computer Vision', 'Ripeness Detection', 'Precision Gripper']
  },
  {
    id: 'AG-02',
    num: 2,
    domain: 'Agriculture',
    title: 'Underground Soil Intelligence and Root Monitoring System',
    description: 'Build a sensor-based system that monitors underground root-zone conditions, including moisture distribution, soil compaction, temperature, and root development, to identify problems that cannot be seen from the surface.',
    tags: ['Subsurface Sensors', 'Root Zone Monitoring', 'Soil Compaction', 'Precision Agri']
  },
  {
    id: 'AG-03',
    num: 3,
    domain: 'Agriculture',
    title: 'Smart Livestock Health Monitoring and Early Warning System',
    description: 'Develop a wearable device for cattle that monitors body temperature, movement, feeding behaviour, and activity patterns to identify abnormal behaviour and provide early health alerts.',
    tags: ['Livestock Wearable', 'Cattle Health Telemetry', 'Estrus / Illness Alert', 'Animal Welfare']
  },
  {
    id: 'AG-04',
    num: 4,
    domain: 'Agriculture',
    title: 'Autonomous Agricultural Weed Removal Robot',
    description: 'Design a small field robot that travels between crop rows, identifies unwanted plants, and physically removes them using a precision mechanical mechanism without damaging nearby crops.',
    tags: ['Field Robotics', 'Weed Classification', 'Chemical-Free Farming', 'Autonomous Navigation']
  },
  {
    id: 'AG-05',
    num: 5,
    domain: 'Agriculture',
    title: 'Intelligent Grain Storage and Self-Protection System',
    description: 'Develop a smart grain-storage unit that detects internal temperature variations, moisture accumulation, insect activity, and possible fungal growth, then automatically activates ventilation or other protective mechanisms.',
    tags: ['Post-Harvest Protection', 'Smart Silos', 'Moisture / Insect Sensing', 'Storage Optimization']
  },
  {
    id: 'AG-06',
    num: 6,
    domain: 'Agriculture',
    title: 'Portable AI-Based Fruit Quality Scanner',
    description: 'Build a portable scanning device that uses optical or near-infrared sensing to estimate internal fruit quality, such as ripeness, sweetness, and hidden defects, without cutting the fruit.',
    tags: ['Non-Destructive Testing', 'NIR Spectroscopy', 'Quality Grading', 'Market Fair Pricing']
  },
  {
    id: 'AG-07',
    num: 7,
    domain: 'Agriculture',
    title: 'Autonomous Agricultural Pipeline Leak Detection Robot',
    description: 'Develop a robotic inspection system that detects underground or hidden irrigation pipeline leaks using acoustic, pressure, or vibration sensors and identifies the approximate leak location.',
    tags: ['Irrigation Robotics', 'Acoustic Leak Detection', 'Underground Pipelines', 'Water Conservation']
  },
  {
    id: 'AG-08',
    num: 8,
    domain: 'Agriculture',
    title: 'Solar-Powered Atmospheric Water Harvesting System',
    description: 'Design a prototype that extracts water from atmospheric humidity using a solar-powered condensation or desiccant-based mechanism, with automatic water collection and efficiency monitoring.',
    tags: ['Renewable Energy', 'Atmospheric Water', 'Arid Farming', 'Desiccant Condensation']
  },
  {
    id: 'AG-09',
    num: 9,
    domain: 'Agriculture',
    title: 'Smart Agricultural Waste-to-Biochar Conversion System',
    description: 'Develop a controlled prototype that converts agricultural residue into biochar while monitoring temperature, oxygen, and processing conditions to improve output quality and reduce harmful emissions.',
    tags: ['Biochar Pyrolysis', 'Residue Recycling', 'Stubble Burning Solution', 'Carbon Sequestration']
  },
  {
    id: 'AG-10',
    num: 10,
    domain: 'Agriculture',
    title: 'AI-Based Seed Genetic Purity and Variety Identification',
    description: 'Develop and train a machine-learning model to identify crop seed varieties and detect possible genetic or physical admixture using seed images, spectral signatures, and laboratory reference data.',
    tags: ['Seed Certification', 'Computer Vision', 'Admixture Detection', 'Crop Genetics']
  },
  {
    id: 'AG-11',
    num: 11,
    domain: 'Agriculture',
    title: 'Real-Time Crop Pollination Efficiency Prediction',
    description: 'Build an AI model that analyses bee movement, flower density, environmental conditions, and pollinator activity from video streams to estimate pollination efficiency and predict potential fruit-set problems.',
    tags: ['Pollination Analytics', 'Bee Activity Tracking', 'Yield Forecasting', 'Ecological Agri']
  },
  {
    id: 'AG-12',
    num: 12,
    domain: 'Agriculture',
    title: 'AI-Based Agricultural Chemical Residue Estimation',
    description: 'Train an ML model using spectral measurements and laboratory-verified pesticide residue datasets to estimate residue levels in agricultural produce and identify samples requiring laboratory testing.',
    tags: ['Food Safety', 'Pesticide Residue', 'Spectral Analysis', 'Consumer Health']
  },
  {
    id: 'AG-13',
    num: 13,
    domain: 'Agriculture',
    title: 'Deep Learning-Based Plant Growth Stage and Development Prediction',
    description: 'Develop a model that learns from continuous plant images and environmental data to identify growth stages and predict future developmental milestones such as flowering, fruit formation, and maturity.',
    tags: ['Deep Learning', 'Phenotyping', 'Crop Lifecycle', 'Agronomic Guidance']
  },
  {
    id: 'AG-14',
    num: 14,
    domain: 'Agriculture',
    title: 'AI-Based Microplastic Detection in Agricultural Soil',
    description: 'Develop a computer-vision and ML model that identifies and classifies microplastic particles in soil microscopy images, distinguishing them from organic matter and other soil particles.',
    tags: ['Soil Health', 'Microplastic Pollution', 'Microscopy Vision', 'Environmental Protection']
  },
  {
    id: 'AG-15',
    num: 15,
    domain: 'Agriculture',
    title: 'Machine Learning-Based Agricultural Biogas Production Optimization',
    description: 'Train a predictive model using organic waste composition, moisture, temperature, pH, and bioreactor operating data to estimate biogas production and identify optimal digestion conditions.',
    tags: ['Biogas Energy', 'Anaerobic Digestion', 'Waste-to-Energy', 'Bioreactor Optimization']
  },

  // ─── HEALTHCARE (1 to 15) ──────────────────────────────────────────────
  {
    id: 'HC-01',
    num: 1,
    domain: 'Healthcare',
    title: 'Real-Time ICU Patient Monitoring and Intelligent Alert Prioritization',
    description: 'ICU patients require continuous monitoring of vital parameters, generating multiple alerts that may overwhelm healthcare professionals. Delayed identification of critical conditions can lead to serious patient complications. Design an intelligent patient monitoring system that continuously tracks vital parameters, identifies abnormal physiological patterns, prioritizes critical alerts, and ensures timely notifications to healthcare staff.',
    tags: ['Critical Care', 'Alarm Fatigue Mitigation', 'Vital Pattern AI', 'Clinical Decision Support']
  },
  {
    id: 'HC-02',
    num: 2,
    domain: 'Healthcare',
    title: 'Continuous Cold-Chain Assurance for Vaccines and Blood Supplies',
    description: 'Vaccines and blood products transported across hospitals, healthcare centres, and remote locations are frequently exposed to temperature fluctuations that can compromise their quality and safety. Design an intelligent cold-chain monitoring solution that continuously tracks environmental conditions, detects temperature violations, records transportation history, and generates immediate alerts whenever storage conditions exceed permissible limits.',
    tags: ['Cold-Chain Telemetry', 'Blood & Vaccine Logistics', 'Thermal Breach Alerts', 'Biological Safety']
  },
  {
    id: 'HC-03',
    num: 3,
    domain: 'Healthcare',
    title: 'Automated Hand-Hygiene Compliance Measurement for Hospital-Acquired Infection Prevention',
    description: 'Hospital-acquired infections remain a significant healthcare concern, while hand-hygiene compliance is often monitored through manual observations and periodic audits. Design an automated monitoring system that detects hand-hygiene activities, identifies compliance gaps, and generates actionable reports to help healthcare facilities improve infection prevention practices.',
    tags: ['Infection Control', 'Vision / RFID Sensing', 'Sanitization Compliance', 'Patient Safety']
  },
  {
    id: 'HC-04',
    num: 4,
    domain: 'Healthcare',
    title: 'Automated Asset Tracking and Utilization Optimization of Critical Medical Equipment',
    description: 'Hospitals frequently experience difficulties locating essential movable medical equipment such as wheelchairs, infusion pumps, patient monitors, and emergency devices. This results in equipment underutilization, operational delays, and unnecessary procurement. Design an intelligent asset tracking solution that provides real-time equipment visibility, monitors utilization, and supports efficient allocation across hospital departments.',
    tags: ['BLE / UWB Tracking', 'Medical Assets', 'Hospital Logistics', 'Resource Allocation']
  },
  {
    id: 'HC-05',
    num: 5,
    domain: 'Healthcare',
    title: 'Wearable-Based Post-Discharge Recovery Monitoring and Rehabilitation Tracking',
    description: 'Patients discharged after intensive care or major medical treatment often experience physical and functional difficulties during their recovery period. However, continuous monitoring and rehabilitation follow-up are limited once patients leave the hospital. Design a wearable-based monitoring solution that tracks relevant health indicators and physical activity, identifies potential recovery concerns, and supports continuous rehabilitation monitoring through timely alerts.',
    tags: ['Remote Patient Monitoring', 'Rehabilitation Analytics', 'Post-Op Care', 'Early Warning Alerts']
  },
  {
    id: 'HC-06',
    num: 6,
    domain: 'Healthcare',
    title: 'Smart Village-Level Health Screening and Real-Time Abnormality Detection',
    description: 'Rural communities frequently lack access to continuous healthcare screening and timely identification of abnormal health conditions. Existing screening activities often depend on manual measurements and delayed reporting. Design a portable smart healthcare screening solution that measures essential physiological parameters, identifies abnormal readings, stores screening records, and enables timely alerts and referrals to healthcare professionals.',
    tags: ['Rural Health Tech', 'Point-of-Care Diagnostics', 'Telemedicine Referral', 'Universal Access']
  },
  {
    id: 'HC-07',
    num: 7,
    domain: 'Healthcare',
    title: 'Intelligent Emergency Response and Ambulance Patient Monitoring System',
    description: 'Emergency patients often lose valuable treatment time due to traffic delays, inappropriate hospital selection, and insufficient communication between ambulances and receiving hospitals. Design an intelligent emergency response system that monitors patient conditions during transportation, supports location-based ambulance tracking, identifies suitable healthcare facilities, and enables real-time information sharing with hospitals before patient arrival.',
    tags: ['Emergency Triage', 'Ambulance-to-Hospital Telemetry', 'Golden Hour Care', 'Facility Matching']
  },
  {
    id: 'HC-08',
    num: 8,
    domain: 'Healthcare',
    title: 'Real-Time Critical Care Bed and Resource Availability Monitoring',
    description: 'During emergencies, disasters, and mass-casualty situations, hospitals face difficulties maintaining accurate information about available critical care beds, ventilators, and essential medical resources. This can delay patient admission and emergency treatment. Design an automated resource monitoring solution that tracks critical care resource availability, updates occupancy information in real time, and provides centralized visibility to support faster patient allocation.',
    tags: ['ICU Bed Visibility', 'Hospital Capacity Grid', 'Disaster Preparedness', 'Resource Allocation']
  },
  {
    id: 'HC-09',
    num: 9,
    domain: 'Healthcare',
    title: 'Smart IV Infusion Monitoring and Abnormal Flow Detection System',
    description: 'Intravenous fluid administration requires continuous supervision to ensure that the prescribed infusion is delivered safely and without interruptions. Empty fluid bags, abnormal flow rates, blockages, and unexpected interruptions can create risks for patients. Design an intelligent IV infusion monitoring system that tracks fluid levels and flow rates, identifies abnormal infusion conditions, and generates immediate alerts for healthcare staff.',
    tags: ['IV Flow Monitoring', 'Occlusion Detection', 'Nurse Alert System', 'Infusion Safety']
  },
  {
    id: 'HC-10',
    num: 10,
    domain: 'Healthcare',
    title: 'Portable Smart Respiratory Monitoring and Early Distress Detection System',
    description: 'Respiratory abnormalities can develop rapidly in patients suffering from respiratory illnesses, post-operative complications, or other critical conditions. Conventional monitoring may not always provide continuous visibility into breathing patterns outside intensive care environments. Design a portable respiratory monitoring solution that continuously measures breathing rate and respiratory patterns, identifies abnormal breathing conditions, and generates timely alerts to caregivers for early intervention.',
    tags: ['Respiratory Diagnostics', 'Breathing Pattern Telemetry', 'Non-Invasive Monitoring', 'Pulmonary Care']
  },
  {
    id: 'HC-11',
    num: 11,
    domain: 'Healthcare',
    title: 'Predictive Medication Safety Verification for Elderly Patients on Complex Multi-Drug Regimens',
    description: 'Elderly patients are frequently prescribed multiple medications for different health conditions, increasing the risk of harmful drug interactions, duplicate prescriptions, incorrect dosages, and medication-related complications. Design an intelligent medication verification platform that analyses prescriptions against patient medication histories, identifies potential medication risks, and provides timely recommendations to support safer prescribing decisions.',
    tags: ['Polypharmacy AI', 'Drug Interaction Checks', 'Geriatric Safety', 'Prescription Verification']
  },
  {
    id: 'HC-12',
    num: 12,
    domain: 'Healthcare',
    title: 'AI-Based Specialty Matching for Long-Term Undiagnosed Patients',
    description: 'Many patients experience prolonged diagnostic delays because their symptoms and medical histories are not effectively connected to the appropriate medical specialties. Repeated consultations and fragmented patient records can further delay appropriate treatment. Design an AI-powered patient assessment solution that analyses reported symptoms, medical history, and available clinical information to recommend relevant medical specialties and support timely clinical evaluation.',
    tags: ['Clinical Triage NLP', 'Specialty Referral', 'Diagnostic Odyssey', 'Symptom Trajectory']
  },
  {
    id: 'HC-13',
    num: 13,
    domain: 'Healthcare',
    title: 'Predictive Medicine Stock-Out and Intelligent Supply Replenishment',
    description: 'Rural healthcare centres and primary health facilities frequently experience shortages of essential medicines due to unpredictable consumption, delayed replenishment, and inefficient inventory management. These shortages can interrupt treatment and force patients to seek medicines elsewhere. Design a predictive inventory management solution that analyses medicine consumption patterns, forecasts potential stock-outs, identifies replenishment requirements, and supports timely medicine supply planning.',
    tags: ['Pharmacy Inventory', 'Supply Chain Forecasting', 'Primary Health Logistics', 'Drug Stock Continuity']
  },
  {
    id: 'HC-14',
    num: 14,
    domain: 'Healthcare',
    title: 'Intelligent Clinical Handoff and Guaranteed Information Continuity',
    description: 'Critical patient information can be missed or incorrectly communicated when responsibility is transferred between successive hospital care teams during shift changes. Incomplete handovers can lead to medication errors, delayed treatments, and gaps in patient care. Design an intelligent clinical handoff platform that organizes patient information, tracks ongoing treatments and pending tasks, identifies missing handover details, and ensures structured information continuity between healthcare teams.',
    tags: ['Shift Handoff Continuity', 'Clinical Workflow', 'Patient Safety Protocol', 'Communication Continuity']
  },
  {
    id: 'HC-15',
    num: 15,
    domain: 'Healthcare',
    title: 'Intelligent Phone-Based Medicine Ordering and Replenishment for Rural Households',
    description: 'Rural households without reliable internet connectivity or access to smartphones often face difficulties checking medicine availability and arranging prescription refills. Patients may need to travel long distances to healthcare facilities only to discover that the required medicines are unavailable. Design an intelligent phone-based medicine ordering solution that enables patients to check medicine availability, place verified medicine requests, track order status, and coordinate medicine delivery through voice-based or telephone services without requiring internet access.',
    tags: ['IVR / Voice Technology', 'Offline Access', 'Rural Prescription Refills', 'Inclusive Healthcare']
  }
];

export const getProblemsByDomain = (domain) => {
  if (!domain) return PROBLEM_STATEMENTS;
  const clean = domain.trim().toLowerCase();
  return PROBLEM_STATEMENTS.filter(p => p.domain.toLowerCase() === clean);
};

export const getProblemById = (id) => {
  return PROBLEM_STATEMENTS.find(p => p.id === id);
};
