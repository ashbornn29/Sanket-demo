/* ═══════════════════════════════════════════════════════════
   VIGIL // RISKSYS  —  Mock Dashboard Data
   ═══════════════════════════════════════════════════════════ */

window.VIGIL_DATA = {
  /* ── Portfolio-level metrics ─────────────────────────── */
  portfolio: {
    totalMonitored: '3,214',
    yoyChange: '+14.2%',
    addedThisQuarter: '128',
    activeTelemetryPct: '98.4%',
    highRiskExcursions: '42',
    riskPct: '1.3%',
    sec14Pending: '14',
    momChange: '+18',
    riskSegments: { normal: 2850, elevated: 322, divergent: 42 },
    valueAtRisk: '₹14,280 Cr',
    riskPortfolioPct: '8.4%',
    sectorBreakdown: [
      { name: 'Roads & Highways', value: 8500, color: '#3b82f6' },
      { name: 'Railways', value: 3200, color: '#06b6d4' },
      { name: 'Power', value: 1580, color: '#10b981' },
      { name: 'Urban Transport', value: 1000, color: '#f59e0b' }
    ],
    capexVelocity: 'High',
    capex30d: '+₹1,240 Cr',
    medianWarningLead: '4.2 Mo',
    modelCalibration: '92.4',
    calibrationStandard: 'MoRTH',
  },

  /* ── Sparkline data (mini trend) ────────────────────── */
  sparkline: [12, 14, 18, 15, 22, 28, 35, 32, 42],

  /* ── Selected project ────────────────────────── */
  selectedProject: {
    name: 'Mumbai Coastal Road Extension',
    score: 94,
    scoreMax: 100,
    severity: 'CRITICAL DIVERGENCE',
    discrepancy: 94,
    physicalProgress: 32.5,
    financialDrawdown: 68.2,
    spread: 35.7,
    stagnation: {
      days: 142,
      velocity: -1.2,
      acceleration: -0.8,
    },
    sensors: {},
    causalAttribution: {},
  },

  /* ── Trajectory divergence chart data ───────────────── */
  trajectoryChart: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    target: [10, 20, 30, 40, 50, 60],
    contractorReport: [12, 18, 32, 45, 68, 94],
    vigilTelemetry: [12, 18, 32, 45, 68, 94],
    anomalyPoint: null,
    discrepancyGap: null,
  },

  /* ── All projects list ──────────────────────────────── */
  projects: [
    { id: 'PRJ-8821', name: 'Mumbai Coastal Road Extension', location: 'Maharashtra • Urban Transport', severity: 'CRITICAL DIVERGENCE', severityClass: 'critical', score: 94, ministry: 'MoHUA', variance: 14.5, varianceLabel: 'Months Delay', value: 12500 },
    { id: 'PRJ-3199', name: 'Delhi-Dehradun Expressway Pkg 4', location: 'Uttarakhand • Highways', severity: 'HIGH STAGNATION', severityClass: 'high', score: 82, ministry: 'MoRTH', variance: 8.2, varianceLabel: 'Months Delay', value: 4200 },
    { id: 'PRJ-4450', name: 'Kochi Metro Phase II', location: 'Kerala • Urban Transport', severity: 'MODERATE WATCH', severityClass: 'moderate', score: 65, ministry: 'MoHUA', variance: 3.5, varianceLabel: 'Months Delay', value: 1950 },
    { id: 'PRJ-9921', name: 'Chenab Railway Bridge Aux', location: 'J&K • Railways', severity: 'NORMAL', severityClass: 'vendor', score: 28, ministry: 'MoR', variance: 0, varianceLabel: 'On Track', value: 1400 }
  ],

  /* ── Build context object for Gemini ────────────────── */
  getAssistantContext() {
    return {
      portfolioSnapshot: {
        totalMonitored: this.portfolio.totalMonitored,
        highRiskExcursions: this.portfolio.highRiskExcursions,
        riskPct: this.portfolio.riskPct,
        valueAtRisk_Cr: this.portfolio.valueAtRisk,
        medianWarningLead_Mo: this.portfolio.medianWarningLead,
        sec14Pending: this.portfolio.sec14Pending,
      },
      selectedProject: {
        name: this.selectedProject.name,
        score: `${this.selectedProject.score}/${this.selectedProject.scoreMax}`,
        severity: this.selectedProject.severity,
        discrepancy: `${this.selectedProject.discrepancy}%`,
        physicalProgress: `${this.selectedProject.physicalProgress}%`,
        financialDrawdown: `${this.selectedProject.financialDrawdown}%`,
        spread: `${this.selectedProject.spread}%`,
        stagnation: this.selectedProject.stagnation,
        sensors: this.selectedProject.sensors,
        causalAttribution: this.selectedProject.causalAttribution,
      },
      activeAlerts: [
        `${this.portfolio.sec14Pending} Sec. 14 Notices pending`,
        `${this.portfolio.highRiskExcursions} corridors in divergent status`,
      ],
    };
  },

  /* ── Hydrate from API data ──────────────────────────── */
  hydrateFromAPI(summary, interventions) {
    if (summary) {
      this.portfolio.totalMonitored = summary.active_project_count || this.portfolio.totalMonitored;
      this.portfolio.highRiskExcursions = (summary.watch_count || 0) + (summary.review_count || 0) + (summary.escalate_count || 0);
      if (this.portfolio.totalMonitored > 0) {
        this.portfolio.riskPct = ((this.portfolio.highRiskExcursions / this.portfolio.totalMonitored) * 100).toFixed(1);
      }
      this.portfolio.valueAtRisk = summary.risk_weighted_exposure ? Math.round(summary.risk_weighted_exposure) : this.portfolio.valueAtRisk;
      if (summary.active_baseline_exposure > 0) {
        this.portfolio.riskPortfolioPct = ((summary.risk_weighted_exposure / summary.active_baseline_exposure) * 100).toFixed(1);
      }
      this.portfolio.yoyChange = 14.2; // Simulated YoY increase in monitored projects
      this.portfolio.modelCalibration = 92.4; // Simulated predictive accuracy

      this.portfolio.medianWarningLead = summary.historical_median_warning_lead ? Number(summary.historical_median_warning_lead.toFixed(1)) : this.portfolio.medianWarningLead;
      this.portfolio.riskSegments.normal = summary.normal_count || 0;
      this.portfolio.riskSegments.elevated = summary.watch_count || 0;
      this.portfolio.riskSegments.divergent = (summary.review_count || 0) + (summary.escalate_count || 0);

      if (summary.sector_breakdown && Array.isArray(summary.sector_breakdown)) {
        this.portfolio.sectorBreakdown = summary.sector_breakdown.map((item, i) => ({
          name: item.sector, value: Math.round(item.total_exposure), color: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'][i % 5]
        }));
      }
    }

    if (interventions && interventions.projects && interventions.projects.length > 0) {
      this.projects = interventions.projects.map(p => ({
        id: p.project_id,
        name: p.project_name.length > 35 ? p.project_name.substring(0, 32) + '...' : p.project_name,
        location: `${p.state} • ${p.sector}`,
        severity: p.risk_tier === 'ESCALATE' ? 'CRITICAL DIVERGENCE' : (p.risk_tier === 'REVIEW' ? 'HIGH STAGNATION' : (p.risk_tier === 'WATCH' ? 'MODERATE WATCH' : 'NORMAL')),
        severityClass: p.risk_tier === 'ESCALATE' ? 'critical' : (p.risk_tier === 'REVIEW' ? 'high' : (p.risk_tier === 'WATCH' ? 'moderate' : 'vendor')),
        score: Math.round(p.latest_risk * 100),
        ministry: p.ministry || p.sector,
        variance: -Math.round(p.priority_score * 10) / 10,
        varianceLabel: 'Exposure',
        value: Math.round(p.baseline_exposure)
      }));
    }
  }
};
