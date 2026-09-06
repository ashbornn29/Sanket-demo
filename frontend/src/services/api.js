/**
 * VIGIL Frontend Typed API Service Client
 * 
 * Strict Single Source of Truth:
 * - Direct connection to FastAPI backend (http://127.0.0.1:8000)
 * - Zero client-side risk calculations or metric fabrications
 * - Point-in-time integrity preserved
 * - RFC 8259 JSON compliance (strict null handling)
 */

const RAW_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// When running inside the browser against local dev server, use empty prefix so Vite proxy
// transparently forwards `/api` and `/health` without browser CORS restrictions.
// For production or custom remote backend targets, use the configured absolute URL.
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const isLocalhostTarget = RAW_API_URL.includes('127.0.0.1:8000') || RAW_API_URL.includes('localhost:8000');
    if (isLocalhostTarget && window.location.port !== '8000') {
      return '';
    }
  }
  return RAW_API_URL.replace(/\/$/, '');
};

async function apiRequest(endpoint, options = {}) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    'Accept': 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else if (errorData.detail) {
          errorMessage = JSON.stringify(errorData.detail);
        }
      } catch {
        // Fallback to generic status text
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const connError = new Error(`Cannot connect to VIGIL Engine at ${RAW_API_URL}. Ensure backend is running on port 8000.`);
      connError.status = 0;
      throw connError;
    }
    throw err;
  }
}

// ── System & Health ──

export async function getHealth() {
  return apiRequest('/health');
}

// ── Portfolio & Historical Intelligence ──

export async function getDashboardSummary() {
  return apiRequest('/api/dashboard/summary');
}

export async function getInterventions(params = {}) {
  const query = new URLSearchParams();
  if (params.limit) query.set('limit', params.limit);
  if (params.sector) query.set('sector', params.sector);
  if (params.min_risk_tier) query.set('min_risk_tier', params.min_risk_tier);
  const qs = query.toString();
  return apiRequest(`/api/dashboard/interventions${qs ? `?${qs}` : ''}`);
}

export async function getProjects(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.sector) query.set('sector', params.sector);
  if (params.risk_tier) query.set('risk_tier', params.risk_tier);
  if (params.limit !== undefined) query.set('limit', params.limit);
  if (params.offset !== undefined) query.set('offset', params.offset);
  const qs = query.toString();
  return apiRequest(`/api/projects${qs ? `?${qs}` : ''}`);
}

export async function getProjectDetail(projectId) {
  return apiRequest(`/api/projects/${encodeURIComponent(projectId)}`);
}

export async function getProjectReplay(projectId) {
  return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/replay`);
}

export async function getProjectTimeline(projectId) {
  return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/timeline`);
}

// ── Operational Monitoring Layer ──

export async function getMonitoredProjects(params = {}) {
  const query = new URLSearchParams();
  if (params.sector) query.set('sector', params.sector);
  if (params.status) query.set('status', params.status);
  if (params.limit !== undefined) query.set('limit', params.limit);
  if (params.offset !== undefined) query.set('offset', params.offset);
  const qs = query.toString();
  return apiRequest(`/api/monitor/projects${qs ? `?${qs}` : ''}`);
}

export async function getMonitoredProject(projectId) {
  return apiRequest(`/api/monitor/projects/${encodeURIComponent(projectId)}`);
}

export async function getMonitoredProjectStatus(projectId) {
  return apiRequest(`/api/monitor/projects/${encodeURIComponent(projectId)}/status`);
}

export async function getMonitoredProjectObservations(projectId) {
  return apiRequest(`/api/monitor/projects/${encodeURIComponent(projectId)}/observations`);
}

export async function getMonitoredProjectWarnings(projectId) {
  return apiRequest(`/api/monitor/projects/${encodeURIComponent(projectId)}/warnings`);
}

export async function getMonitoredProjectAudit(projectId) {
  return apiRequest(`/api/monitor/projects/${encodeURIComponent(projectId)}/audit`);
}

export async function getAuthorityEscalations(params = {}) {
  const query = new URLSearchParams();
  if (params.sector) query.set('sector', params.sector);
  const qs = query.toString();
  return apiRequest(`/api/monitor/escalations${qs ? `?${qs}` : ''}`);
}

export async function onboardProject(payload) {
  return apiRequest('/api/monitor/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitObservation(projectId, payload) {
  return apiRequest(`/api/monitor/projects/${encodeURIComponent(projectId)}/observations`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitContractorResponse(projectId, warningId, payload) {
  return apiRequest(`/api/monitor/projects/${encodeURIComponent(projectId)}/warnings/${encodeURIComponent(warningId)}/response`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function seedDemoScenarios(scenario = 'all') {
  return apiRequest(`/api/monitor/demo/seed?scenario=${encodeURIComponent(scenario)}`, {
    method: 'POST',
  });
}

// ── Value Formatters (Strict Missingness Preservation) ──

export function formatINR(val, prefix = '₹', suffix = ' Cr') {
  if (val === null || val === undefined || isNaN(Number(val))) {
    return 'Data unavailable';
  }
  const num = Number(val);
  return `${prefix}${num.toLocaleString('en-IN', { maximumFractionDigits: 1 })}${suffix}`;
}

export function formatPercent(val, decimals = 1) {
  if (val === null || val === undefined || isNaN(Number(val))) {
    return 'Data unavailable';
  }
  const num = Number(val);
  // If probability 0.0 - 1.0, format as percentage
  const pct = num <= 1.0 ? num * 100 : num;
  return `${pct.toFixed(decimals)}%`;
}

export function formatDelayMonths(val) {
  if (val === null || val === undefined || isNaN(Number(val))) {
    return 'Data unavailable';
  }
  const num = Number(val);
  if (num === 0) return '0.0m (On Schedule)';
  return num > 0 ? `+${num.toFixed(1)}m` : `${num.toFixed(1)}m`;
}

export function getRiskTierConfig(tier) {
  const normTier = (tier || '').toUpperCase();
  switch (normTier) {
    case 'ESCALATE':
    case 'HIGH RISK':
    case 'CRITICAL':
      return {
        label: 'HIGH RISK (ESCALATE)',
        shortLabel: 'ESCALATE',
        badgeBg: 'bg-red-50 text-red-700 border-red-200',
        dotColor: 'bg-red-500',
        textColor: 'text-red-700',
        borderColor: 'border-red-500',
        solidBg: 'bg-red-600 text-white',
        thresholdText: '≥ 50.0%',
      };
    case 'REVIEW':
      return {
        label: 'REVIEW',
        shortLabel: 'REVIEW',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        dotColor: 'bg-amber-500',
        textColor: 'text-amber-800',
        borderColor: 'border-amber-500',
        solidBg: 'bg-amber-600 text-white',
        thresholdText: '45.0% - 49.9%',
      };
    case 'WATCH':
      return {
        label: 'WATCH',
        shortLabel: 'WATCH',
        badgeBg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        dotColor: 'bg-yellow-500',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-500',
        solidBg: 'bg-yellow-500 text-white',
        thresholdText: '40.0% - 44.9%',
      };
    case 'NORMAL':
    default:
      return {
        label: 'NORMAL',
        shortLabel: 'NORMAL',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotColor: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-500',
        solidBg: 'bg-emerald-600 text-white',
        thresholdText: '< 40.0%',
      };
  }
}

export function getGovernanceConfig(status) {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'WARNING_ISSUED':
    case 'CONTRACTOR_WARNING':
    case 'ISSUED':
      return {
        label: 'CONTRACTOR WARNING',
        badgeBg: 'bg-orange-50 text-orange-800 border-orange-300',
        textColor: 'text-orange-800',
        dotColor: 'bg-orange-500',
        description: 'Contractor corrective-action window active. Corrective action plan requested.',
      };
    case 'CONTRACTOR_RESPONDED':
    case 'RESPONSE_SUBMITTED':
    case 'UNDER_RECOVERY':
      return {
        label: 'UNDER RECOVERY',
        badgeBg: 'bg-blue-50 text-blue-800 border-blue-300',
        textColor: 'text-blue-800',
        dotColor: 'bg-blue-500',
        description: 'Contractor plan logged. Monitoring empirical trajectory recovery.',
      };
    case 'RECOVERED':
    case 'PROJECT_RECOVERED':
      return {
        label: 'RECOVERED',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        textColor: 'text-emerald-800',
        dotColor: 'bg-emerald-500',
        description: 'Empirical progress and delay metrics verified below risk threshold.',
      };
    case 'ESCALATED':
    case 'AUTHORITY_ESCALATED':
    case 'AUTHORITY_ESCALATION':
      return {
        label: 'AUTHORITY ESCALATION',
        badgeBg: 'bg-red-50 text-red-900 border-red-300 font-semibold',
        textColor: 'text-red-900',
        dotColor: 'bg-red-600',
        description: 'Persistent deterioration without recovery escalated to oversight ministry.',
      };
    case 'ACTIVE':
    default:
      return {
        label: 'ACTIVE SURVEILLANCE',
        badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
        textColor: 'text-slate-800',
        dotColor: 'bg-slate-500',
        description: 'Routine monthly trajectory observation active.',
      };
  }
}

export function getTrajectoryConfig(status, direction) {
  const dir = (direction || '').toUpperCase();
  const st = (status || '').toUpperCase();

  if (st === 'INSUFFICIENT_HISTORY' || st === 'LOW_HISTORY') {
    return {
      label: 'INSUFFICIENT HISTORY',
      arrow: '•',
      color: 'text-slate-500',
      badgeBg: 'bg-slate-100 text-slate-600 border-slate-200',
    };
  }

  if (dir.includes('DETERIORAT') || dir.includes('DOWN') || dir.includes('FALLING') || dir.includes('HIGH')) {
    return {
      label: 'DETERIORATING',
      arrow: '↓',
      color: 'text-red-600',
      badgeBg: 'bg-red-50 text-red-700 border-red-200',
    };
  }

  if (dir.includes('IMPROV') || dir.includes('UP') || dir.includes('RISING') || dir.includes('RECOVERY')) {
    return {
      label: 'IMPROVING',
      arrow: '↑',
      color: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  return {
    label: 'STABLE',
    arrow: '→',
    color: 'text-blue-600',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
  };
}
