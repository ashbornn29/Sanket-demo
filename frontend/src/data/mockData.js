// ============================================================
// VIGIL — Mock Data
// Realistic demonstration data for infrastructure monitoring
// ============================================================

// --- SECTORS ---
export const sectors = [
  'Transport & Logistics',
  'Energy',
  'Water & Sanitation',
  'Communication',
  'Social Infrastructure',
  'Coal, Steel & Mining',
  'Urban Development',
  'Rural Infrastructure',
  'Railways',
  'Petroleum & Gas',
];

// --- MINISTRIES ---
export const ministries = [
  'Ministry of Road Transport & Highways',
  'Ministry of Railways',
  'Ministry of Power',
  'Ministry of Jal Shakti',
  'Ministry of Housing & Urban Affairs',
  'Ministry of Coal',
  'Ministry of Petroleum & Natural Gas',
  'Ministry of Steel',
  'Ministry of Communications',
  'Ministry of Rural Development',
  'Ministry of New & Renewable Energy',
  'Ministry of Civil Aviation',
  'Ministry of Ports, Shipping & Waterways',
  'Ministry of Health & Family Welfare',
  'Ministry of Education',
  'Ministry of Defence',
  'Ministry of Electronics & IT',
];

// --- STATES ---
export const states = [
  'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh',
  'Rajasthan', 'Madhya Pradesh', 'Jharkhand', 'West Bengal', 'Odisha',
  'Andhra Pradesh', 'Telangana', 'Kerala', 'Bihar', 'Chhattisgarh',
];

// --- RISK LEVELS ---
export const riskLevels = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];

export function getRiskLevel(score) {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MODERATE';
  return 'LOW';
}

export function getRiskColor(level) {
  const colors = {
    LOW: '#22c55e',
    MODERATE: '#eab308',
    HIGH: '#f97316',
    CRITICAL: '#ef4444',
  };
  return colors[level] || '#6b7280';
}

export function getRiskBg(level) {
  const colors = {
    LOW: 'bg-green-50 text-green-700 border-green-200',
    MODERATE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
    CRITICAL: 'bg-red-50 text-red-700 border-red-200',
  };
  return colors[level] || 'bg-gray-50 text-gray-700 border-gray-200';
}

// --- GENERATE MONTHLY RISK HISTORY ---
function generateRiskHistory(currentRisk, months = 12) {
  const history = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const variance = Math.floor(Math.random() * 15) - 5;
    const progressFactor = ((months - i) / months) * (currentRisk * 0.4);
    const score = Math.max(10, Math.min(100, Math.round(currentRisk * 0.5 + progressFactor + variance)));
    history.push({ month: monthNames[date.getMonth()], year: date.getFullYear(), score });
  }
  history[history.length - 1].score = currentRisk;
  return history;
}

// --- GENERATE PROGRESS HISTORY ---
function generateProgressHistory(physicalProgress, financialProgress) {
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const planned = [], actualPhysical = [], actualFinancial = [];
  for (let i = 0; i < 12; i++) {
    const plannedVal = Math.round((i + 1) * (100 / 14) + 5);
    const physVal = Math.round(plannedVal * (physicalProgress / 100) * (0.7 + (i / 12) * 0.5));
    const finVal = Math.round(plannedVal * (financialProgress / 100) * (0.8 + (i / 12) * 0.5));
    planned.push({ month: months[i], value: Math.min(100, plannedVal) });
    actualPhysical.push({ month: months[i], value: Math.min(physicalProgress, physVal) });
    actualFinancial.push({ month: months[i], value: Math.min(financialProgress, finVal) });
  }
  return { planned, actualPhysical, actualFinancial };
}

// --- GENERATE MILESTONES ---
function generateMilestones(physicalProgress, overdueCount) {
  const milestoneNames = [
    'Land Acquisition', 'Environmental Clearance', 'Design Approval',
    'Foundation Work', 'Structural Phase I', 'Structural Phase II',
    'Mechanical Installation', 'Electrical Systems',
    'Testing & Commissioning', 'Final Handover',
  ];
  return milestoneNames.map((name, idx) => {
    const expectedComplete = (idx + 1) * 10;
    let status = 'upcoming';
    if (expectedComplete <= physicalProgress) status = 'completed';
    else if (idx < (physicalProgress / 10) + overdueCount && expectedComplete > physicalProgress) status = 'delayed';
    return { id: idx + 1, name, expectedCompletion: `${2024 + Math.floor(idx / 3)}-Q${(idx % 4) + 1}`, status };
  });
}

// --- PROJECTS DATA ---
export const projects = [
  { id: 'PRJ001', name: 'Mumbai–Ahmedabad High Speed Rail', ministry: 'Ministry of Railways', sector: 'Transport & Logistics', state: 'Gujarat', implementingAgency: 'National High Speed Rail Corporation Ltd', originalCost: 108000, revisedCost: 141000, expenditure: 107160, physicalProgress: 42, financialProgress: 76, expectedProgress: 63, riskScore: 94, costOverrunRisk: 79, timeOverrunRisk: 92, implementationRisk: 84, sixMonthRisk: 84, twelveMonthRisk: 93, delayProbability: 88, delayMonths: 24, milestonesOverdue: 4, trend: 'increasing', trendChange: 14, startDate: '2017-09-14', expectedCompletion: '2028-12-31', revisedCompletion: '2031-06-30' },
  { id: 'PRJ002', name: 'Raghunathpur Thermal Power Project', ministry: 'Ministry of Power', sector: 'Energy', state: 'Jharkhand', implementingAgency: 'Damodar Valley Corporation', originalCost: 10000, revisedCost: 12300, expenditure: 9840, physicalProgress: 68, financialProgress: 80, expectedProgress: 82, riskScore: 91, costOverrunRisk: 75, timeOverrunRisk: 89, implementationRisk: 81, sixMonthRisk: 80, twelveMonthRisk: 90, delayProbability: 84, delayMonths: 18, milestonesOverdue: 3, trend: 'increasing', trendChange: 8, startDate: '2019-03-15', expectedCompletion: '2025-12-31', revisedCompletion: '2027-06-30' },
  { id: 'PRJ003', name: 'Ken-Betwa River Link Project', ministry: 'Ministry of Jal Shakti', sector: 'Water & Sanitation', state: 'Madhya Pradesh', implementingAgency: 'Ken-Betwa Link Project Authority', originalCost: 44605, revisedCost: 49870, expenditure: 34401, physicalProgress: 35, financialProgress: 69, expectedProgress: 55, riskScore: 88, costOverrunRisk: 82, timeOverrunRisk: 86, implementationRisk: 78, sixMonthRisk: 79, twelveMonthRisk: 88, delayProbability: 81, delayMonths: 22, milestonesOverdue: 5, trend: 'increasing', trendChange: 11, startDate: '2021-12-25', expectedCompletion: '2029-03-31', revisedCompletion: '2031-03-31' },
  { id: 'PRJ004', name: 'Navi Mumbai International Airport', ministry: 'Ministry of Civil Aviation', sector: 'Transport & Logistics', state: 'Maharashtra', implementingAgency: 'CIDCO', originalCost: 16700, revisedCost: 19200, expenditure: 13440, physicalProgress: 52, financialProgress: 70, expectedProgress: 68, riskScore: 82, costOverrunRisk: 71, timeOverrunRisk: 78, implementationRisk: 72, sixMonthRisk: 74, twelveMonthRisk: 82, delayProbability: 76, delayMonths: 14, milestonesOverdue: 3, trend: 'increasing', trendChange: 6, startDate: '2018-02-18', expectedCompletion: '2025-03-31', revisedCompletion: '2026-12-31' },
  { id: 'PRJ005', name: 'Eastern Dedicated Freight Corridor', ministry: 'Ministry of Railways', sector: 'Railways', state: 'Uttar Pradesh', implementingAgency: 'DFCCIL', originalCost: 53882, revisedCost: 63000, expenditure: 52920, physicalProgress: 78, financialProgress: 84, expectedProgress: 90, riskScore: 72, costOverrunRisk: 65, timeOverrunRisk: 74, implementationRisk: 62, sixMonthRisk: 64, twelveMonthRisk: 72, delayProbability: 68, delayMonths: 12, milestonesOverdue: 2, trend: 'stable', trendChange: 2, startDate: '2015-07-01', expectedCompletion: '2024-06-30', revisedCompletion: '2026-03-31' },
  { id: 'PRJ006', name: 'Polavaram Irrigation Project', ministry: 'Ministry of Jal Shakti', sector: 'Water & Sanitation', state: 'Andhra Pradesh', implementingAgency: 'Polavaram Project Authority', originalCost: 55549, revisedCost: 62000, expenditure: 40920, physicalProgress: 45, financialProgress: 66, expectedProgress: 70, riskScore: 85, costOverrunRisk: 78, timeOverrunRisk: 83, implementationRisk: 76, sixMonthRisk: 77, twelveMonthRisk: 85, delayProbability: 79, delayMonths: 20, milestonesOverdue: 4, trend: 'increasing', trendChange: 9, startDate: '2004-01-01', expectedCompletion: '2025-12-31', revisedCompletion: '2028-06-30' },
  { id: 'PRJ007', name: 'Sagarmala Port Modernization — Phase II', ministry: 'Ministry of Ports, Shipping & Waterways', sector: 'Transport & Logistics', state: 'Tamil Nadu', implementingAgency: 'Sagarmala Development Company Ltd', originalCost: 8500, revisedCost: 9200, expenditure: 5520, physicalProgress: 48, financialProgress: 60, expectedProgress: 58, riskScore: 67, costOverrunRisk: 55, timeOverrunRisk: 68, implementationRisk: 58, sixMonthRisk: 60, twelveMonthRisk: 67, delayProbability: 62, delayMonths: 10, milestonesOverdue: 2, trend: 'stable', trendChange: 3, startDate: '2020-04-01', expectedCompletion: '2026-03-31', revisedCompletion: '2027-03-31' },
  { id: 'PRJ008', name: 'Visakhapatnam–Chennai Industrial Corridor', ministry: 'Ministry of Housing & Urban Affairs', sector: 'Urban Development', state: 'Andhra Pradesh', implementingAgency: 'NICDIT', originalCost: 14200, revisedCost: 15800, expenditure: 7110, physicalProgress: 33, financialProgress: 45, expectedProgress: 50, riskScore: 74, costOverrunRisk: 62, timeOverrunRisk: 72, implementationRisk: 66, sixMonthRisk: 68, twelveMonthRisk: 74, delayProbability: 70, delayMonths: 14, milestonesOverdue: 3, trend: 'increasing', trendChange: 5, startDate: '2019-08-01', expectedCompletion: '2027-03-31', revisedCompletion: '2028-06-30' },
  { id: 'PRJ009', name: 'BharatNet Phase III', ministry: 'Ministry of Communications', sector: 'Communication', state: 'Rajasthan', implementingAgency: 'BBNL', originalCost: 34000, revisedCost: 36000, expenditure: 14400, physicalProgress: 28, financialProgress: 40, expectedProgress: 45, riskScore: 71, costOverrunRisk: 58, timeOverrunRisk: 70, implementationRisk: 63, sixMonthRisk: 65, twelveMonthRisk: 71, delayProbability: 65, delayMonths: 12, milestonesOverdue: 2, trend: 'increasing', trendChange: 4, startDate: '2022-01-01', expectedCompletion: '2027-06-30', revisedCompletion: '2028-06-30' },
  { id: 'PRJ010', name: 'Talcher Fertilizer Plant Revival', ministry: 'Ministry of Coal', sector: 'Coal, Steel & Mining', state: 'Odisha', implementingAgency: 'Talcher Fertilizers Ltd', originalCost: 13277, revisedCost: 14500, expenditure: 10150, physicalProgress: 55, financialProgress: 70, expectedProgress: 72, riskScore: 69, costOverrunRisk: 60, timeOverrunRisk: 66, implementationRisk: 59, sixMonthRisk: 61, twelveMonthRisk: 69, delayProbability: 63, delayMonths: 10, milestonesOverdue: 2, trend: 'stable', trendChange: 1, startDate: '2020-10-15', expectedCompletion: '2026-09-30', revisedCompletion: '2027-06-30' },
  { id: 'PRJ011', name: 'Delhi-Meerut RRTS', ministry: 'Ministry of Housing & Urban Affairs', sector: 'Transport & Logistics', state: 'Uttar Pradesh', implementingAgency: 'NCRTC', originalCost: 30274, revisedCost: 32000, expenditure: 22400, physicalProgress: 62, financialProgress: 70, expectedProgress: 75, riskScore: 58, costOverrunRisk: 48, timeOverrunRisk: 56, implementationRisk: 50, sixMonthRisk: 52, twelveMonthRisk: 58, delayProbability: 52, delayMonths: 8, milestonesOverdue: 1, trend: 'decreasing', trendChange: -3, startDate: '2019-03-08', expectedCompletion: '2025-06-30', revisedCompletion: '2026-03-31' },
  { id: 'PRJ012', name: 'AIIMS Bilaspur', ministry: 'Ministry of Health & Family Welfare', sector: 'Social Infrastructure', state: 'Chhattisgarh', implementingAgency: 'CPWD', originalCost: 1500, revisedCost: 1750, expenditure: 1225, physicalProgress: 58, financialProgress: 70, expectedProgress: 65, riskScore: 52, costOverrunRisk: 44, timeOverrunRisk: 50, implementationRisk: 45, sixMonthRisk: 46, twelveMonthRisk: 52, delayProbability: 45, delayMonths: 6, milestonesOverdue: 1, trend: 'stable', trendChange: 0, startDate: '2020-01-15', expectedCompletion: '2025-12-31', revisedCompletion: '2026-06-30' },
  { id: 'PRJ013', name: 'Paradip Refinery Expansion', ministry: 'Ministry of Petroleum & Natural Gas', sector: 'Petroleum & Gas', state: 'Odisha', implementingAgency: 'Indian Oil Corporation', originalCost: 34555, revisedCost: 36000, expenditure: 25200, physicalProgress: 60, financialProgress: 70, expectedProgress: 68, riskScore: 48, costOverrunRisk: 40, timeOverrunRisk: 46, implementationRisk: 42, sixMonthRisk: 44, twelveMonthRisk: 48, delayProbability: 40, delayMonths: 5, milestonesOverdue: 1, trend: 'decreasing', trendChange: -5, startDate: '2018-06-01', expectedCompletion: '2025-06-30', revisedCompletion: '2025-12-31' },
  { id: 'PRJ014', name: 'Leh-Manali Highway Tunnel', ministry: 'Ministry of Road Transport & Highways', sector: 'Transport & Logistics', state: 'Rajasthan', implementingAgency: 'BRO', originalCost: 6800, revisedCost: 7900, expenditure: 5530, physicalProgress: 55, financialProgress: 70, expectedProgress: 62, riskScore: 62, costOverrunRisk: 54, timeOverrunRisk: 60, implementationRisk: 55, sixMonthRisk: 56, twelveMonthRisk: 62, delayProbability: 58, delayMonths: 10, milestonesOverdue: 2, trend: 'stable', trendChange: 1, startDate: '2020-07-01', expectedCompletion: '2026-12-31', revisedCompletion: '2027-12-31' },
  { id: 'PRJ015', name: 'Ganga Expressway', ministry: 'Ministry of Road Transport & Highways', sector: 'Transport & Logistics', state: 'Uttar Pradesh', implementingAgency: 'UPEIDA', originalCost: 36230, revisedCost: 38000, expenditure: 15200, physicalProgress: 32, financialProgress: 40, expectedProgress: 48, riskScore: 65, costOverrunRisk: 52, timeOverrunRisk: 63, implementationRisk: 56, sixMonthRisk: 58, twelveMonthRisk: 65, delayProbability: 60, delayMonths: 11, milestonesOverdue: 2, trend: 'increasing', trendChange: 4, startDate: '2022-01-01', expectedCompletion: '2027-03-31', revisedCompletion: '2028-03-31' },
  { id: 'PRJ016', name: 'Green Energy Corridor Phase II', ministry: 'Ministry of New & Renewable Energy', sector: 'Energy', state: 'Karnataka', implementingAgency: 'Power Grid Corporation', originalCost: 12031, revisedCost: 12500, expenditure: 6875, physicalProgress: 45, financialProgress: 55, expectedProgress: 52, riskScore: 45, costOverrunRisk: 38, timeOverrunRisk: 44, implementationRisk: 40, sixMonthRisk: 41, twelveMonthRisk: 45, delayProbability: 38, delayMonths: 4, milestonesOverdue: 1, trend: 'decreasing', trendChange: -4, startDate: '2022-06-01', expectedCompletion: '2026-12-31', revisedCompletion: '2027-03-31' },
  { id: 'PRJ017', name: 'Smart Cities Mission — Varanasi', ministry: 'Ministry of Housing & Urban Affairs', sector: 'Urban Development', state: 'Uttar Pradesh', implementingAgency: 'Varanasi Smart City Ltd', originalCost: 3241, revisedCost: 3500, expenditure: 2800, physicalProgress: 72, financialProgress: 80, expectedProgress: 78, riskScore: 35, costOverrunRisk: 28, timeOverrunRisk: 33, implementationRisk: 30, sixMonthRisk: 31, twelveMonthRisk: 35, delayProbability: 28, delayMonths: 3, milestonesOverdue: 0, trend: 'decreasing', trendChange: -6, startDate: '2019-01-01', expectedCompletion: '2025-12-31', revisedCompletion: '2026-03-31' },
  { id: 'PRJ018', name: 'Jal Jeevan Mission — Bihar Coverage', ministry: 'Ministry of Jal Shakti', sector: 'Water & Sanitation', state: 'Bihar', implementingAgency: 'Bihar State JJM Unit', originalCost: 22500, revisedCost: 24000, expenditure: 12000, physicalProgress: 38, financialProgress: 50, expectedProgress: 55, riskScore: 68, costOverrunRisk: 56, timeOverrunRisk: 66, implementationRisk: 60, sixMonthRisk: 62, twelveMonthRisk: 68, delayProbability: 62, delayMonths: 11, milestonesOverdue: 2, trend: 'increasing', trendChange: 3, startDate: '2021-04-01', expectedCompletion: '2026-12-31', revisedCompletion: '2027-12-31' },
  { id: 'PRJ019', name: 'Vande Bharat Train Manufacturing', ministry: 'Ministry of Railways', sector: 'Railways', state: 'Maharashtra', implementingAgency: 'ICF / BEML', originalCost: 18000, revisedCost: 18500, expenditure: 14800, physicalProgress: 75, financialProgress: 80, expectedProgress: 80, riskScore: 32, costOverrunRisk: 25, timeOverrunRisk: 30, implementationRisk: 28, sixMonthRisk: 28, twelveMonthRisk: 32, delayProbability: 25, delayMonths: 2, milestonesOverdue: 0, trend: 'decreasing', trendChange: -8, startDate: '2022-09-01', expectedCompletion: '2026-03-31', revisedCompletion: '2026-06-30' },
  { id: 'PRJ020', name: 'PMAY Urban — West Bengal Phase', ministry: 'Ministry of Housing & Urban Affairs', sector: 'Social Infrastructure', state: 'West Bengal', implementingAgency: 'West Bengal Housing Board', originalCost: 9500, revisedCost: 10200, expenditure: 6120, physicalProgress: 44, financialProgress: 60, expectedProgress: 58, riskScore: 61, costOverrunRisk: 50, timeOverrunRisk: 58, implementationRisk: 52, sixMonthRisk: 54, twelveMonthRisk: 61, delayProbability: 55, delayMonths: 9, milestonesOverdue: 2, trend: 'stable', trendChange: 1, startDate: '2020-06-01', expectedCompletion: '2026-03-31', revisedCompletion: '2027-03-31' },
];

// Enrich projects
export const enrichedProjects = projects.map((p) => ({
  ...p,
  riskLevel: getRiskLevel(p.riskScore),
  costExposure: p.revisedCost - p.originalCost,
  progressGap: p.financialProgress - p.physicalProgress,
  riskHistory: generateRiskHistory(p.riskScore),
  progressHistory: generateProgressHistory(p.physicalProgress, p.financialProgress),
  milestones: generateMilestones(p.physicalProgress, p.milestonesOverdue),
  peerBenchmark: {
    avgPhysicalProgress: Math.min(100, p.physicalProgress + Math.floor(Math.random() * 25) + 10),
    avgFinancialProgress: Math.min(100, p.financialProgress - Math.floor(Math.random() * 15)),
    avgMilestoneDelays: Math.max(1, p.milestonesOverdue - Math.floor(Math.random() * 3)),
    avgRiskScore: Math.max(20, p.riskScore - Math.floor(Math.random() * 30) - 10),
  },
  riskFactors: [
    { factor: 'Milestone Delays', description: `${p.milestonesOverdue} milestones overdue`, contribution: Math.min(100, p.milestonesOverdue * 18 + 10) },
    { factor: 'Progress Slowdown', description: `${Math.abs(p.expectedProgress - p.physicalProgress)}% below expected trajectory`, contribution: Math.min(100, Math.abs(p.expectedProgress - p.physicalProgress) * 3 + 5) },
    { factor: 'Expenditure Imbalance', description: `Financial progress exceeds physical progress by ${p.financialProgress - p.physicalProgress}pp`, contribution: Math.min(100, (p.financialProgress - p.physicalProgress) * 2 + 10) },
    { factor: 'Peer Deviation', description: `${Math.floor(Math.random() * 15) + 8}% below similar projects`, contribution: Math.min(100, Math.floor(Math.random() * 30) + 20) },
  ],
  monthlyChanges: {
    previousRisk: Math.max(20, p.riskScore - p.trendChange),
    changes: [
      p.milestonesOverdue > 1 ? `${Math.ceil(p.milestonesOverdue / 2)} new overdue milestones` : null,
      `Physical progress slowed by ${Math.floor(Math.random() * 15) + 5}%`,
      p.financialProgress > p.physicalProgress ? `Expenditure increased by ${Math.floor(Math.random() * 20) + 8}%` : null,
      p.delayProbability > 70 ? 'Completion estimate revised' : null,
    ].filter(Boolean),
  },
}));

// --- KPI DATA ---
export const kpiData = {
  totalProjects: 1981,
  totalMinistries: 17,
  criticalProjects: 127,
  criticalThreshold: 80,
  atRiskProjects: 348,
  atRiskRange: '60–80',
  onTrack: 1506,
  onTrackThreshold: 60,
  costExposure: 562000,
  costExposureLabel: '₹5.62 Lakh Cr',
  potentialDelay: 38,
  potentialDelayUnit: 'months',
};

// --- RISK DISTRIBUTION ---
export const riskDistribution = [
  { name: 'Critical', value: 127, color: '#ef4444' },
  { name: 'High', value: 221, color: '#f97316' },
  { name: 'Moderate', value: 482, color: '#eab308' },
  { name: 'Low', value: 1151, color: '#22c55e' },
];

// --- RISK TREND ---
export const riskTrendData = (() => {
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  return months.map((month, idx) => ({
    month,
    critical: 85 + Math.floor(idx * 3.5) + Math.floor(Math.random() * 8),
    high: 180 + Math.floor(idx * 3) + Math.floor(Math.random() * 10),
    moderate: 500 - Math.floor(idx * 2) + Math.floor(Math.random() * 15),
    low: 1200 - Math.floor(idx * 4) + Math.floor(Math.random() * 20),
  }));
})();

// --- SECTOR DATA ---
export const sectorData = [
  { sector: 'Transport & Logistics', projects: 420, avgRisk: 62, exposure: 185000 },
  { sector: 'Energy', projects: 310, avgRisk: 55, exposure: 120000 },
  { sector: 'Water & Sanitation', projects: 280, avgRisk: 58, exposure: 95000 },
  { sector: 'Communication', projects: 185, avgRisk: 48, exposure: 45000 },
  { sector: 'Social Infrastructure', projects: 250, avgRisk: 42, exposure: 35000 },
  { sector: 'Coal, Steel & Mining', projects: 156, avgRisk: 51, exposure: 42000 },
  { sector: 'Urban Development', projects: 145, avgRisk: 46, exposure: 28000 },
  { sector: 'Railways', projects: 110, avgRisk: 44, exposure: 55000 },
  { sector: 'Petroleum & Gas', projects: 75, avgRisk: 40, exposure: 38000 },
  { sector: 'Rural Infrastructure', projects: 50, avgRisk: 38, exposure: 19000 },
];

// --- ALERTS ---
export const alerts = [
  { id: 1, time: '10:12 AM', projectId: 'PRJ001', project: 'Mumbai–Ahmedabad HSR', level: 'CRITICAL', message: 'Risk score increased by 14 points', date: 'Today' },
  { id: 2, time: '09:45 AM', projectId: 'PRJ002', project: 'Raghunathpur Thermal PP', level: 'CRITICAL', message: '6-month delay probability > 80%', date: 'Today' },
  { id: 3, time: '08:30 AM', projectId: 'PRJ003', project: 'Ken-Betwa Link Project', level: 'HIGH', message: '2 new milestones overdue', date: 'Today' },
  { id: 4, time: '07:15 AM', projectId: 'PRJ004', project: 'Navi Mumbai Airport', level: 'HIGH', message: 'Expenditure-progress gap widened to 18pp', date: 'Today' },
  { id: 5, time: '06:50 AM', projectId: 'PRJ006', project: 'Polavaram Irrigation', level: 'CRITICAL', message: 'Revised cost estimate exceeds budget by 12%', date: 'Today' },
  { id: 6, time: 'Yesterday', projectId: 'PRJ008', project: 'VCIC Industrial Corridor', level: 'HIGH', message: 'Physical progress stalled for 2 months', date: 'Yesterday' },
  { id: 7, time: 'Yesterday', projectId: 'PRJ009', project: 'BharatNet Phase III', level: 'MODERATE', message: 'Contractor performance below threshold', date: 'Yesterday' },
  { id: 8, time: 'Yesterday', projectId: 'PRJ015', project: 'Ganga Expressway', level: 'HIGH', message: 'Land acquisition delays reported', date: 'Yesterday' },
];

// --- AI INSIGHTS ---
export const aiInsights = [
  'Transport sector projects show elevated delay risk compared with peer sectors. 14 projects in this sector have risk scores above 70.',
  'Projects with >20% expenditure-physical progress gap show significantly higher historical delay risk. 83 projects currently exceed this threshold.',
  'Early warning signals detected in 83 projects. Proactive intervention could reduce cumulative delay exposure by an estimated 15–20%.',
  'State-level analysis indicates Uttar Pradesh and Madhya Pradesh have the highest concentration of at-risk infrastructure projects.',
  'Cost overrun patterns in Energy sector correlate with delays in environmental clearance and land acquisition phases.',
];

// --- STATE GEO DATA ---
export const stateData = [
  { state: 'Maharashtra', lat: 19.7515, lng: 75.7139, projects: 186, critical: 18, avgRisk: 54, exposure: 42000 },
  { state: 'Gujarat', lat: 22.2587, lng: 71.1924, projects: 142, critical: 14, avgRisk: 58, exposure: 38000 },
  { state: 'Karnataka', lat: 15.3173, lng: 75.7139, projects: 128, critical: 10, avgRisk: 48, exposure: 28000 },
  { state: 'Tamil Nadu', lat: 11.1271, lng: 78.6569, projects: 135, critical: 12, avgRisk: 52, exposure: 32000 },
  { state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, projects: 210, critical: 22, avgRisk: 61, exposure: 55000 },
  { state: 'Rajasthan', lat: 27.0238, lng: 74.2179, projects: 98, critical: 8, avgRisk: 50, exposure: 22000 },
  { state: 'Madhya Pradesh', lat: 22.9734, lng: 78.6569, projects: 115, critical: 14, avgRisk: 58, exposure: 35000 },
  { state: 'Jharkhand', lat: 23.6102, lng: 85.2799, projects: 75, critical: 8, avgRisk: 55, exposure: 18000 },
  { state: 'West Bengal', lat: 22.9868, lng: 87.855, projects: 95, critical: 7, avgRisk: 49, exposure: 20000 },
  { state: 'Odisha', lat: 20.9517, lng: 85.0985, projects: 82, critical: 6, avgRisk: 47, exposure: 16000 },
  { state: 'Andhra Pradesh', lat: 15.9129, lng: 79.74, projects: 105, critical: 11, avgRisk: 56, exposure: 30000 },
  { state: 'Telangana', lat: 18.1124, lng: 79.0193, projects: 88, critical: 5, avgRisk: 44, exposure: 15000 },
  { state: 'Kerala', lat: 10.8505, lng: 76.2711, projects: 65, critical: 3, avgRisk: 38, exposure: 10000 },
  { state: 'Bihar', lat: 25.0961, lng: 85.3131, projects: 120, critical: 12, avgRisk: 57, exposure: 28000 },
  { state: 'Chhattisgarh', lat: 21.2787, lng: 81.8661, projects: 60, critical: 4, avgRisk: 42, exposure: 12000 },
];

// --- MINISTRY ANALYTICS ---
export const ministryAnalytics = [
  { ministry: 'Ministry of Railways', projects: 245, avgRisk: 52, exposure: 95000 },
  { ministry: 'Ministry of Road Transport & Highways', projects: 320, avgRisk: 56, exposure: 120000 },
  { ministry: 'Ministry of Power', projects: 180, avgRisk: 50, exposure: 65000 },
  { ministry: 'Ministry of Jal Shakti', projects: 210, avgRisk: 58, exposure: 85000 },
  { ministry: 'Ministry of Housing & Urban Affairs', projects: 185, avgRisk: 48, exposure: 45000 },
  { ministry: 'Ministry of Coal', projects: 95, avgRisk: 51, exposure: 35000 },
  { ministry: 'Ministry of Petroleum & Natural Gas', projects: 75, avgRisk: 42, exposure: 38000 },
  { ministry: 'Ministry of Communications', projects: 88, avgRisk: 46, exposure: 28000 },
  { ministry: 'Ministry of Civil Aviation', projects: 42, avgRisk: 55, exposure: 22000 },
  { ministry: 'Ministry of Steel', projects: 65, avgRisk: 44, exposure: 18000 },
];

// --- OVERRUN DISTRIBUTIONS ---
export const costOverrunDistribution = [
  { range: '0–10%', count: 820 }, { range: '10–20%', count: 450 },
  { range: '20–30%', count: 310 }, { range: '30–50%', count: 220 },
  { range: '50–100%', count: 120 }, { range: '>100%', count: 61 },
];

export const timeOverrunDistribution = [
  { range: '0–6 months', count: 680 }, { range: '6–12 months', count: 420 },
  { range: '1–2 years', count: 380 }, { range: '2–3 years', count: 260 },
  { range: '3–5 years', count: 150 }, { range: '>5 years', count: 91 },
];

// --- REPORTS ---
export const reports = [
  { id: 1, title: 'Monthly Infrastructure Risk Report', type: 'Monthly', date: 'September 2026', status: 'Available', description: 'Comprehensive monthly overview of risk across all monitored projects.' },
  { id: 2, title: 'Ministry Risk Summary', type: 'On Demand', date: 'September 2026', status: 'Available', description: 'Risk summary aggregated by ministry/department.' },
  { id: 3, title: 'Sector Risk Report', type: 'Quarterly', date: 'Q3 2026', status: 'Available', description: 'Sector-wise risk analysis and benchmarking report.' },
  { id: 4, title: 'High-Risk Project Report', type: 'Weekly', date: 'Week 36, 2026', status: 'Available', description: 'Detailed report on all projects with risk score ≥ 80.' },
  { id: 5, title: 'Cost Overrun Forecast', type: 'Monthly', date: 'September 2026', status: 'Available', description: 'Predictive analysis of cost overrun trends and projections.' },
  { id: 6, title: 'Time Overrun Forecast', type: 'Monthly', date: 'September 2026', status: 'Available', description: 'Projected delay estimates across monitored projects.' },
  { id: 7, title: 'State-wise Risk Dashboard Report', type: 'Monthly', date: 'September 2026', status: 'Generating', description: 'State-level infrastructure risk analysis.' },
  { id: 8, title: 'Intervention Impact Analysis', type: 'Quarterly', date: 'Q3 2026', status: 'Draft', description: 'Analysis of intervention effectiveness on project outcomes.' },
];

// --- ASSISTANT RESPONSES ---
export const assistantResponses = {
  'why is project a high risk': { projectId: 'PRJ001', projectName: 'Mumbai–Ahmedabad High Speed Rail', riskScore: 94, riskLevel: 'CRITICAL', response: 'The Mumbai–Ahmedabad High Speed Rail project is currently classified as high risk with a score of 94/100.', factors: [{ title: 'Milestone Delays', detail: '4 milestones are overdue, contributing to significant schedule deviation.' }, { title: 'Progress Slowdown', detail: 'Physical progress is 21% below the expected trajectory for this stage of the project.' }, { title: 'Expenditure Imbalance', detail: 'Financial progress (76%) is significantly ahead of physical progress (42%), indicating a 34pp gap.' }, { title: 'Peer Deviation', detail: 'The project is performing below comparable transport infrastructure projects.' }] },
  'show top 10 at-risk projects': { response: 'Here are the top 10 highest-risk infrastructure projects currently being monitored:', type: 'table' },
  'compare performance across sectors': { response: 'Sector-wise performance comparison based on current monitoring data:', type: 'sectors' },
  'default': { response: 'I can help you analyze infrastructure project data. Try asking about specific projects, risk trends, sector comparisons, or intervention priorities.', type: 'text' },
};

// --- DATA PIPELINE HEALTH ---
export const dataPipelineHealth = [
  { source: 'VIGIL Flash Reports', status: 'healthy', lastSync: '5 Sep 2026, 06:00 AM', records: '1,981' },
  { source: 'OCMS Archive', status: 'healthy', lastSync: '4 Sep 2026, 11:30 PM', records: '14,520' },
  { source: 'IPMP API', status: 'planned', lastSync: 'N/A', records: 'N/A' },
  { source: 'State MIS Data', status: 'healthy', lastSync: '5 Sep 2026, 02:00 AM', records: '8,340' },
];

export const dataQuality = { completeness: 94, validity: 97, duplicateRate: 1.2, lastChecked: '5 Sep 2026, 06:15 AM' };

export const modelHealth = {
  modelType: 'LightGBM',
  lastTrained: '01 Sep 2026',
  trainingData: '12,450 project records',
  delay: { f1: 0.81, recall: 0.84, precision: 0.79, rocAuc: 0.89 },
  cost: { f1: 0.78, recall: 0.80, precision: 0.76, rocAuc: 0.86 },
  implementation: { f1: 0.75, recall: 0.78, precision: 0.73, rocAuc: 0.84 },
};
