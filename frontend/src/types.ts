export type RiskTier = 'NORMAL' | 'WATCH' | 'REVIEW' | 'ESCALATE';

export interface ProjectSummary {
  project_id: string;
  project_name: string;
  sector: string;
  latest_observation: string;
  latest_risk: number;
  latest_risk_tier: RiskTier;
  baseline_cost: number;
}

export interface ProjectsResponse {
  total: number;
  limit: number;
  offset: number;
  projects: ProjectSummary[];
}

export interface ExplanationItem {
  feature: string;
  value: number | string | null;
  contribution: number;
  explanation: string;
}

export interface PredictionPayload {
  raw_prob: number;
  pred_prob: number;
  risk_tier: RiskTier;
  alert: boolean;
}

export interface TrajectoryMetrics {
  C_base: number;
  expenditure: number;
  financial_progress: number;
  schedule_deviation_months: number | null;
  V_fin_1m: number | null;
  V_fin_3m: number | null;
  A_fin: number | null;
  EWMA_V_fin: number | null;
  Z_peer_V_fin: number | null;
  trajectory_risk_score: number | null;
}

export interface ProjectDetail {
  project_id: string;
  project_name: string;
  sector: string;
  ministry: string;
  state: string;
  approved_cost: number;
  total_observations: number;
  start_month: string;
  end_month: string;
  latest_observation: string;
  latest_prediction: PredictionPayload;
  current_trajectory_metrics: TrajectoryMetrics;
  current_risk_tier: RiskTier;
  top_explanations: ExplanationItem[];
}

export interface ReplayRecord {
  reporting_month: string;
  observation_number: number;
  C_base: number;
  expenditure: number;
  financial_progress: number;
  schedule_deviation_months: number | null;
  V_fin_1m: number | null;
  V_fin_3m: number | null;
  A_fin: number | null;
  EWMA_V_fin: number | null;
  Z_peer_V_fin: number | null;
  trajectory_risk_score: number | null;
  raw_prob: number;
  pred_prob: number;
  risk_tier: RiskTier;
  alert: boolean;
  top_explanations: ExplanationItem[];
  actual_event: boolean;
  lead_time_if_event: number | null;
}

export interface AlertPoint {
  reporting_month: string;
  observation_number: number;
  risk_tier: RiskTier;
  pred_prob: number;
  top_explanation: string | null;
}

export interface DeteriorationEvent {
  event_index: number;
  event_month: string;
  reasons: string[];
  prior_cbase: number | null;
  new_cbase: number | null;
  prior_sdev: number | null;
  new_sdev: number | null;
}

export interface FirstAlert {
  alert_month: string;
  risk_tier: RiskTier;
  pred_prob: number;
  lead_time_months: number;
  top_explanation: string | null;
}

export interface ProjectReplay {
  project_id: string;
  project_name: string;
  sector: string;
  ministry: string;
  state: string;
  approved_cost: number;
  total_observations: number;
  start_month: string;
  end_month: string;
  timeline: ReplayRecord[];
  alert_points: AlertPoint[];
  actual_deterioration_event: DeteriorationEvent | null;
  all_deterioration_events: DeteriorationEvent[];
  first_alert: FirstAlert | null;
  lead_time: number | null;
}

export interface SectorSummary {
  sector: string;
  total_projects: number;
  escalate_count: number;
  review_count: number;
  watch_count: number;
  total_exposure: number;
}

export interface DashboardSummary {
  total_projects: number;
  projects_currently_scored: number;
  active_project_count: number;
  archive_entity_count: number;
  latest_data_month?: string;
  active_baseline_exposure?: number;
  risk_weighted_exposure?: number;
  historical_median_warning_lead?: number;
  watch_count: number;
  review_count: number;
  escalate_count: number;
  total_baseline_exposure: number;
  exposure_in_escalate: number;
  median_warning_lead_time: number;
  sector_breakdown: SectorSummary[];
}

export interface InterventionItem {
  project_id: string;
  project_name: string;
  sector: string;
  state?: string;
  ministry?: string;
  reporting_month?: string;
  latest_observation: string;
  latest_risk: number;
  latest_risk_tier: RiskTier;
  risk_tier?: RiskTier;
  baseline_cost: number;
  baseline_exposure?: number;
  priority_score: number;
  risk_weighted_exposure?: number;
}

export interface InterventionsResponse {
  total_eligible: number;
  limit: number;
  methodology_note: string;
  projects: InterventionItem[];
}
