export class ApiError extends Error {
  public status: number;
  public details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function readJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function hasDetail(x: unknown): x is { detail: unknown } {
  return typeof x === 'object' && x !== null && 'detail' in x
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const details = await readJsonSafe(res);
    const message =
      hasDetail(details)
        ? String(details.detail)
        : `HTTP ${res.status}`;
    throw new ApiError(message, res.status, details);
  }

  return (await readJsonSafe(res)) as T;
}

// ── Health ────────────────────────────────────────────────────────────────────

export type HealthResponse = { status: string };

export function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/health');
}

// ── Users ─────────────────────────────────────────────────────────────────────

export type UserOut = {
  id: string;
  email: string;
  display_name: string | null;
};

export function listUsers(): Promise<UserOut[]> {
  return apiFetch<UserOut[]>('/api/users');
}

export function createUser(input: {
  email: string;
  display_name?: string | null;
}): Promise<UserOut> {
  return apiFetch<UserOut>('/api/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getUser(userId: string): Promise<UserOut> {
  return apiFetch<UserOut>(`/api/users/${userId}`);
}

// ── Teams ─────────────────────────────────────────────────────────────────────

export type TeamOut = {
  id: string;
  name: string;
};

export function listTeams(): Promise<TeamOut[]> {
  return apiFetch<TeamOut[]>('/api/teams');
}

export function createTeam(input: { name: string }): Promise<TeamOut> {
  return apiFetch<TeamOut>('/api/teams', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getTeam(teamId: string): Promise<TeamOut> {
  return apiFetch<TeamOut>(`/api/teams/${teamId}`);
}

// ── Projects ──────────────────────────────────────────────────────────────────

export type ProjectOut = {
  id: string;
  title: string;
  owner_team_id: string | null;
  client_id: string | null;
  status: string;
  mentor_score: number | null;
  client_score: number | null;
  peer_score: number | null;
  artifact_score: number | null;
  success_rate: number | null;
};

export function listProjects(): Promise<ProjectOut[]> {
  return apiFetch<ProjectOut[]>('/api/projects');
}

export function createProject(input: {
  title: string;
  owner_team_id?: string | null;
  client_id?: string | null;
}): Promise<ProjectOut> {
  return apiFetch<ProjectOut>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getProject(projectId: string): Promise<ProjectOut> {
  return apiFetch<ProjectOut>(`/api/projects/${projectId}`);
}

// ── Artifacts ─────────────────────────────────────────────────────────────────

export type ArtifactOut = {
  id: string;
  project_id: string;
  owner_team_id: string;
  type_id: number;
  content_hash: string;
  reusability_index: number;
  mentorship_seal: boolean;
  metadata: Record<string, unknown>;
  git_url: string | null;
};

export function listArtifacts(params?: { project_id?: string }): Promise<ArtifactOut[]> {
  const qs = params?.project_id ? `?project_id=${params.project_id}` : '';
  return apiFetch<ArtifactOut[]>(`/api/artifacts${qs}`);
}

export function createArtifact(input: {
  project_id: string;
  owner_team_id: string;
  type_code: string;
  content_hash: string;
  reusability_index?: number;
  metadata?: Record<string, unknown>;
  git_url?: string | null;
}): Promise<ArtifactOut> {
  return apiFetch<ArtifactOut>('/api/artifacts', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getArtifact(artifactId: string): Promise<ArtifactOut> {
  return apiFetch<ArtifactOut>(`/api/artifacts/${artifactId}`);
}

export function updateArtifact(
  artifactId: string,
  input: {
    reusability_index?: number | null;
    git_url?: string | null;
    metadata?: Record<string, unknown> | null;
    mentorship_seal?: boolean | null;
  },
): Promise<ArtifactOut> {
  return apiFetch<ArtifactOut>(`/api/artifacts/${artifactId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

// ── Capability ────────────────────────────────────────────────────────────────

export type CapabilityOut = {
  id: string;
  entity_type: string;
  entity_id: string;
  skill_id: number;
  proficiency_level: number;
  evidence_artifact_id: string;
};

export function listCapabilities(params?: {
  entity_type?: string;
  entity_id?: string;
}): Promise<CapabilityOut[]> {
  const parts: string[] = [];
  if (params?.entity_type) parts.push(`entity_type=${encodeURIComponent(params.entity_type)}`);
  if (params?.entity_id) parts.push(`entity_id=${encodeURIComponent(params.entity_id)}`);
  const qs = parts.length ? `?${parts.join('&')}` : '';
  return apiFetch<CapabilityOut[]>(`/api/capability${qs}`);
}

export function upsertCapability(input: {
  entity_type: string;
  entity_id: string;
  skill_code: string;
  skill_name?: string | null;
  proficiency_level: number;
  evidence_artifact_id: string;
}): Promise<CapabilityOut> {
  return apiFetch<CapabilityOut>('/api/capability', {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

// ── Mentor Activity ───────────────────────────────────────────────────────────

export type MentorActivityOut = {
  id: string;
  mentor_id: string;
  team_id: string;
  project_id: string | null;
  action_type: string;
  duration_minutes: number;
  complexity_weight: number;
};

export function createMentorActivity(input: {
  mentor_id: string;
  team_id: string;
  project_id?: string | null;
  action_type: string;
  duration_minutes: number;
  complexity_weight?: number;
}): Promise<MentorActivityOut> {
  return apiFetch<MentorActivityOut>('/api/mentor-activity', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listMentorActivity(mentorId: string): Promise<MentorActivityOut[]> {
  return apiFetch<MentorActivityOut[]>(`/api/mentor-activity/mentor/${mentorId}`);
}

// ── Scoring ───────────────────────────────────────────────────────────────────

export function setProjectScores(input: {
  project_id: string;
  mentor_score?: number | null;
  client_score?: number | null;
  peer_score?: number | null;
  artifact_score?: number | null;
}): Promise<{ project_id: string; success_rate: number | null }> {
  return apiFetch<{ project_id: string; success_rate: number | null }>(
    '/api/scoring/projects',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

// ── Git Integration ───────────────────────────────────────────────────────────

export function ingestGitWebhook(input: {
  project_id: string;
  owner_team_id: string;
  repo_url: string;
  commit_sha: string;
  event_type?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ artifact_id: string; content_hash: string }> {
  return apiFetch<{ artifact_id: string; content_hash: string }>(
    '/api/integrations/git/webhook',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

// ── Plans ─────────────────────────────────────────────────────────────────────

export type ServicePlanOut = {
  code: string;
  name: string;
  monthly_price_rub: number;
  sla_minutes: number;
  features: Record<string, unknown>;
};

export function listPlans(): Promise<ServicePlanOut[]> {
  return apiFetch<ServicePlanOut[]>('/api/plans');
}

// ── Organizations ─────────────────────────────────────────────────────────────

export type OrganizationOut = {
  id: string;
  type: string;
  name: string;
  region: string | null;
  metadata: Record<string, unknown>;
};

export function listOrganizations(params?: { type?: string }): Promise<OrganizationOut[]> {
  const qs = params?.type ? `?type=${encodeURIComponent(params.type)}` : '';
  return apiFetch<OrganizationOut[]>(`/api/organizations${qs}`);
}

export function createOrganization(input: {
  type: string;
  name: string;
  region?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<OrganizationOut> {
  return apiFetch<OrganizationOut>('/api/organizations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export type TaskOut = {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  category: string;
  budget_amount_rub: number | null;
  status: string;
  required_skills: unknown[];
};

export function listTasks(params?: { status?: string }): Promise<TaskOut[]> {
  const qs = params?.status ? `?status=${encodeURIComponent(params.status)}` : '';
  return apiFetch<TaskOut[]>(`/api/tasks${qs}`);
}

export function createTask(input: {
  organization_id: string;
  title: string;
  description: string;
  category?: string;
  budget_amount_rub?: number | null;
  required_skills?: unknown[];
}): Promise<TaskOut> {
  return apiFetch<TaskOut>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getTask(taskId: string): Promise<TaskOut> {
  return apiFetch<TaskOut>(`/api/tasks/${taskId}`);
}

export type TaskApplicationOut = {
  id: string;
  task_id: string;
  applicant_id: string;
  proposed_amount_rub: number | null;
  message: string | null;
  status: string;
};

export function applyToTask(taskId: string, input: {
  applicant_id: string;
  proposed_amount_rub?: number | null;
  message?: string | null;
}): Promise<TaskApplicationOut> {
  return apiFetch<TaskApplicationOut>(`/api/tasks/${taskId}/apply`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listTaskApplications(taskId: string): Promise<TaskApplicationOut[]> {
  return apiFetch<TaskApplicationOut[]>(`/api/tasks/${taskId}/applications`);
}

export type TaskAssignmentOut = {
  id: string;
  task_id: string;
  executor_id: string;
  mentor_id: string | null;
  status: string;
};

export function assignTask(taskId: string, input: {
  executor_id: string;
  mentor_id?: string | null;
}): Promise<TaskAssignmentOut> {
  return apiFetch<TaskAssignmentOut>(`/api/tasks/${taskId}/assign`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getTaskAssignment(taskId: string): Promise<TaskAssignmentOut | null> {
  return apiFetch<TaskAssignmentOut | null>(`/api/tasks/${taskId}/assignment`);
}

export type DisputeOut = {
  id: string;
  task_id: string;
  opened_by_id: string;
  reason: string;
  status: string;
  sla_deadline: string;
};

export function openDispute(taskId: string, input: {
  opened_by_id: string;
  reason: string;
  sla_minutes?: number;
}): Promise<DisputeOut> {
  return apiFetch<DisputeOut>(`/api/tasks/${taskId}/disputes`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listDisputes(taskId: string): Promise<DisputeOut[]> {
  return apiFetch<DisputeOut[]>(`/api/tasks/${taskId}/disputes`);
}

// ── Compliance ────────────────────────────────────────────────────────────────

export type ComplianceProfileOut = {
  user_id: string;
  npd_status: string;
  npd_verified_at: string | null;
  pdn_consent: boolean;
  pdn_consent_at: string | null;
  metadata: Record<string, unknown>;
} | null;

export function getComplianceProfile(userId: string): Promise<ComplianceProfileOut> {
  return apiFetch<ComplianceProfileOut>(`/api/compliance/profiles/${userId}`);
}

export function upsertComplianceProfile(input: {
  user_id: string;
  npd_status: string;
  pdn_consent: boolean;
  metadata?: Record<string, unknown>;
}): Promise<Exclude<ComplianceProfileOut, null>> {
  return apiFetch<Exclude<ComplianceProfileOut, null>>('/api/compliance/profiles', {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}
