import type {
  DashboardSummary,
  InterventionsResponse,
  ProjectDetail,
  ProjectReplay,
  ProjectsResponse
} from './types';

const BASE_URL = import.meta.env.VITE_API_URL || '';

async function fetchJson<T>(url: string): Promise<T> {
  const fullUrl = `${BASE_URL}${url}`;
  const response = await fetch(fullUrl);
  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export async function checkHealth(): Promise<{ status: string; total_projects_indexed: number }> {
  return fetchJson<{ status: string; total_projects_indexed: number }>('/health');
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return fetchJson<DashboardSummary>('/api/dashboard/summary');
}

export async function getInterventions(
  limit: number = 20,
  sector?: string,
  minRiskTier?: string
): Promise<InterventionsResponse> {
  const params = new URLSearchParams();
  params.set('limit', limit.toString());
  if (sector) params.set('sector', sector);
  if (minRiskTier) params.set('min_risk_tier', minRiskTier);
  return fetchJson<InterventionsResponse>(`/api/dashboard/interventions?${params.toString()}`);
}

export async function getProjects(
  search?: string,
  sector?: string,
  riskTier?: string,
  limit: number = 50,
  offset: number = 0
): Promise<ProjectsResponse> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (sector) params.set('sector', sector);
  if (riskTier) params.set('risk_tier', riskTier);
  params.set('limit', limit.toString());
  params.set('offset', offset.toString());
  return fetchJson<ProjectsResponse>(`/api/projects?${params.toString()}`);
}

export async function getProjectDetails(projectId: string): Promise<ProjectDetail> {
  return fetchJson<ProjectDetail>(`/api/projects/${encodeURIComponent(projectId)}`);
}

export async function getProjectReplay(projectId: string): Promise<ProjectReplay> {
  return fetchJson<ProjectReplay>(`/api/projects/${encodeURIComponent(projectId)}/replay`);
}
