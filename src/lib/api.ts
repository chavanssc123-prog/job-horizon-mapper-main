/**
 * Typed client for the Career Readiness FastAPI backend (api/main.py).
 *
 * Base URL comes from VITE_API_URL (see .env.example); defaults to the local
 * uvicorn server. The JWT is kept in localStorage and sent as a Bearer token.
 */

export const API_URL: string = (
  (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:8000"
).replace(/\/+$/, "");

const TOKEN_KEY = "careerforge.token";
const USER_KEY = "careerforge.user";

export type Role = "user" | "admin" | string;
export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

// --------------------------------------------------------------- token store
const isBrowser = typeof window !== "undefined";
const listeners = new Set<() => void>();

export const auth = {
  getToken(): string | null {
    if (!isBrowser) return null;
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  getUser(): User | null {
    if (!isBrowser) return null;
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },
  set(token: string, user: User) {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      /* storage blocked – session only lasts for this page view */
    }
    listeners.forEach((l) => l());
  },
  setUser(user: User) {
    try {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l());
  },
  clear() {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l());
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

// ---------------------------------------------------------------- errors
export type WorkflowStep = "profile" | "resume" | "career" | "skill_gap" | "roadmap";

export class ApiError extends Error {
  status: number;
  errors: string[];
  missingStep?: WorkflowStep | null;
  constructor(
    status: number,
    message: string,
    errors: string[] = [],
    missingStep?: WorkflowStep | null,
  ) {
    super(message);
    this.status = status;
    this.errors = errors.length ? errors : [message];
    this.missingStep = missingStep;
  }
}

function parseJsonBody(body: BodyInit | null | undefined): Record<string, unknown> | undefined {
  if (!body || typeof body !== "string") return undefined;
  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function getDemoUser(body?: BodyInit | null): User {
  const payload = parseJsonBody(body);
  return {
    id: 1,
    name: typeof payload?.name === "string" ? payload.name : "Rohan",
    email: typeof payload?.email === "string" ? payload.email : "rohan@example.com",
    role: "user",
  };
}

function getDemoResponse(path: string, init?: RequestInit): unknown {
  const demoUser = getDemoUser(init?.body);

  switch (path) {
    case "/api/auth/login":
    case "/api/auth/register":
      return {
        message: "Demo mode active. Backend not detected, using local sample data.",
        user: demoUser,
        access_token: "demo-token",
        token_type: "bearer",
      };
    case "/api/auth/me":
      return { user: auth.getUser() ?? demoUser };
    case "/api/workflow":
      return {
        steps: { profile: true, resume: true, career: true, skill_gap: true, roadmap: true },
        next_step: null,
        report_ready: true,
      };
    case "/api/profile":
      return {
        user: demoUser,
        profile: {
          id: 1,
          user_id: 1,
          cgpa: 8.9,
          communication: 86,
          logical_reasoning: 90,
          projects_count: 6,
          certifications_count: 4,
          internship_count: 2,
          interest_domain: "Data Science",
          created_at: new Date().toISOString(),
        },
        exists: true,
        completion: 88,
        strength: { label: "Strong foundation", key: "strong" },
        status: "On track",
        checklist: {
          personal_info: true,
          academic_details: true,
          career_interest: true,
          projects: true,
          certifications: true,
        },
        next_steps: ["Polish your resume summary", "Focus on SQL and ML projects"],
        interest_options: ["Data Science", "Product Management", "Software Engineering"],
        message: "Demo data loaded successfully.",
      };
    case "/api/resume":
      return {
        uploaded: true,
        file_name: "rohan_resume.pdf",
        upload_date: new Date().toISOString(),
        skills: ["Python", "SQL", "Machine Learning", "Data Analysis", "Power BI"],
        projects: ["Customer Churn Prediction", "Recommendation Engine"],
        certifications: ["Google Data Analytics", "AWS Cloud Practitioner"],
        education: ["B.Tech Computer Science", "CGPA 8.9"],
        completeness: 86,
        ats_score: 91,
        status_badge: "Strong fit",
        advice: "Highlight your ML and SQL experience more prominently.",
        max_size_bytes: 5 * 1024 * 1024,
        message: "Resume parsed in demo mode.",
      };
    case "/api/career":
      return {
        career_options: ["Data Scientist", "ML Engineer", "Business Analyst"],
        recommendations: [
          { rank: 1, career: "Data Scientist", confidence: 94, match_label: "High Match" },
          { rank: 2, career: "ML Engineer", confidence: 89, match_label: "Strong Fit" },
          { rank: 3, career: "Business Analyst", confidence: 81, match_label: "Good Fit" },
        ],
        predicted_role: "Data Scientist",
        prediction_confidence: 94,
        selected_role: "Data Scientist",
        final_selected_role: "Data Scientist",
        selection_type: "AI Recommended",
        reason: "Strong fit based on your project and analytics skills.",
        career_category: "Data & AI",
        latest_prediction: { role: "Data Scientist", confidence: 94 },
        message: "Career recommendation generated in demo mode.",
      };
    case "/api/skill-gap":
      return {
        current_recommendation: {
          recommended_role: "Data Scientist",
          confidence_score: 94,
          final_career_role: "Data Scientist",
          selection_type: "AI Recommended",
        },
        latest_analysis: {
          career_role: "Data Scientist",
          required_skills: ["Python", "SQL", "Statistics", "ML", "Visualization", "A/B Testing"],
          matched_skills: ["Python", "SQL", "Machine Learning", "Data Analysis"],
          missing_skills: ["Statistics", "A/B Testing", "Spark"],
          extra_skills: ["Power BI"],
          skill_match_score: 82,
          readiness_score: 78,
          priority: { "High Priority": ["Statistics", "A/B Testing"], "Medium Priority": ["Spark"], "Low Priority": ["Power BI"] },
          counts: { Matched: 4, Missing: 3, Extra: 1 },
        },
      };
    case "/api/roadmap":
      return {
        final_career_role: "Data Scientist",
        readiness_score: 78,
        missing_skills: ["Statistics", "A/B Testing", "Spark"],
        selection_type: "AI Recommended",
        timeline: [
          { month: "Month 1", goals: ["Complete statistics refresher", "Build SQL practice dashboard"] },
          { month: "Month 2", goals: ["Train time-series model", "Learn A/B testing basics"] },
          { month: "Month 3", goals: ["Deepen ML interview prep", "Build forecasting project"] },
        ],
        projects: ["Customer churn prediction", "Recommendation system"],
        certifications: ["Google Advanced Data Analytics", "Databricks Lakehouse Fundamentals"],
        duration_months: 3,
        roadmap_text: "Focus on statistics, experimentation, and cloud data workflows.",
        latest_saved: null,
        message: "Roadmap generated in demo mode.",
      };
    case "/api/dashboard":
      return {
        user: demoUser,
        profile_completion: 88,
        ats_score: 91,
        skill_match_score: 82,
        roadmap_progress: 62,
        overall_readiness: 78,
        points_away: 22,
        selected_career: "Data Scientist",
        career_confidence: 94,
        selection_type: "AI Recommended",
        skill_counts: { matched: 18, missing: 6, extra: 4 },
        missing_skills: ["Statistics", "A/B Testing", "Spark"],
        matched_skills: ["Python", "SQL", "ML", "Data Analysis"],
        roadmap: {
          career_role: "Data Scientist",
          duration_months: 3,
          readiness_score: 78,
          created_at: new Date().toISOString(),
        },
        milestones: [
          { month: "M1", label: "Foundation", title: "Statistics & SQL", goals: ["Practice SQL", "Review probability"] },
          { month: "M2", label: "Build", title: "ML project", goals: ["Train model", "Write case study"] },
          { month: "M3", label: "Interview", title: "Portfolio prep", goals: ["Mock interviews", "Resume update"] },
        ],
        activity: [
          { type: "career", title: "Career match updated", description: "Data Scientist matched with 94% confidence", timestamp: new Date().toISOString() },
          { type: "resume", title: "Resume parsed", description: "ATS score improved to 91", timestamp: new Date().toISOString() },
        ],
        workflow: {
          steps: { profile: true, resume: true, career: true, skill_gap: true, roadmap: true },
          next_step: null,
          report_ready: true,
        },
      };
    case "/api/analytics":
      return {
        summary: {
          profile_completion: 88,
          ats_score: 91,
          skill_match_score: 82,
          roadmap_progress: 62,
          overall_readiness: 78,
        },
        profile: {
          exists: true,
          cgpa: 8.9,
          projects_count: 6,
          internship_count: 2,
          certifications_count: 4,
          interest_domain: "Data Science",
        },
        resume: {
          uploaded: true,
          ats_score: 91,
          skills_count: 5,
          projects_count: 2,
          certifications_count: 2,
          education_count: 2,
          skills: ["Python", "SQL", "ML", "Data Analysis"],
        },
        career: {
          final_selected_career: "Data Scientist",
          confidence: 94,
          career_category: "Data & AI",
          prediction_date: new Date().toISOString(),
          selection_type: "AI Recommended",
        },
        skill_gap: {
          counts: { Matched: 4, Missing: 3, Extra: 1 },
          matched_skills: ["Python", "SQL", "ML", "Data Analysis"],
          missing_skills: ["Statistics", "A/B Testing", "Spark"],
          extra_skills: ["Power BI"],
          priority: { High: ["Statistics"], Medium: ["A/B Testing"], Low: ["Spark"] },
          skill_match_score: 82,
          readiness_score: 78,
        },
        roadmap: {
          career_role: "Data Scientist",
          duration_months: 3,
          readiness_score: 78,
          roadmap_text: "Focus on statistics, experimentation, and cloud workflows.",
          projects: ["Customer churn prediction"],
          certifications: ["Google Advanced Data Analytics"],
        },
        insights: ["Your strongest leverage is ML + SQL", "Add statistics and experimentation to boost readiness"],
      };
    case "/api/report/status":
      return { ready: true, missing: [] };
    case "/api/admin/overview":
      return {
        overview: {
          total_users: 128,
          total_profiles: 114,
          total_resumes: 98,
          total_career_predictions: 105,
          total_skill_gap_analyses: 87,
          total_roadmaps: 69,
        },
        career_summary: [
          { recommended_role: "Data Scientist", count: 42 },
          { recommended_role: "Software Engineer", count: 31 },
        ],
        career_domains: { "Data & AI": 42, "Software": 31 },
        career_selection_counts: { total_ai_recommendations: 87, total_user_overrides: 11 },
        most_selected_careers: [{ career_role: "Data Scientist", count: 42 }],
        top_selected_career: "Data Scientist",
        top_selected_count: 42,
        override_stats: [{ career_role: "Data Scientist", override_count: 7 }],
        skill_summary: {
          most_missing_skills: [{ skill: "Statistics", count: 44 }],
          most_common_skills: [{ skill: "Python", count: 118 }],
          average_skill_match_score: 82,
          average_readiness_score: 78,
        },
        resume_analytics: {
          average_ats_score: 89,
          total_resumes: 98,
          most_common_skills: [{ skill: "Python", count: 92 }],
        },
        roadmap_analytics: {
          most_generated_roadmaps: [{ career_role: "Data Scientist", count: 38 }],
          average_roadmap_duration: 3,
        },
        database_health: {
          connected: true,
          database: "demo",
          tables_found: ["users", "profiles", "resumes", "career_predictions"],
          total_records: { users: 128, profiles: 114, resumes: 98, career_predictions: 105 },
        },
        latest_users: [{ id: 1, name: "Rohan", email: "rohan@example.com", created_at: new Date().toISOString() }],
        user_activity: [{ id: 1, name: "Rohan", email: "rohan@example.com", has_profile: 1, has_resume: 1, has_prediction: 1, has_skill_gap: 1, has_roadmap: 1, activity_score: 98 }],
      };
    default:
      return { message: "Demo mode active. Backend API unavailable." };
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  opts: { raw?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  const token = auth.getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    if (opts.raw) {
      const demoBlob = new Blob(["Demo PDF report - backend not connected."], {
        type: "application/pdf",
      });
      return new Response(demoBlob, {
        headers: {
          "Content-Disposition": 'attachment; filename="career_report.pdf"',
        },
      }) as unknown as T;
    }
    return getDemoResponse(path, init) as T;
  }

  if (!res.ok) {
    let detail = res.statusText || "Request failed";
    let errors: string[] = [];
    let missing: WorkflowStep | null = null;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
      errors = body.errors ?? [];
      missing = body.missing_step ?? null;
    } catch {
      /* non-JSON error */
    }
    if (res.status === 401 && token) {
      auth.clear(); // expired / invalid token -> force re-login
    }
    throw new ApiError(res.status, String(detail), errors, missing);
  }

  if (opts.raw) return res as unknown as T;
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const get = <T>(p: string) => request<T>(p);
const send = <T>(method: string, p: string, body?: unknown) =>
  request<T>(p, { method, body: body === undefined ? undefined : JSON.stringify(body) });

// ---------------------------------------------------------------- types
export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  token_type: string;
}

export interface WorkflowStatus {
  steps: Record<WorkflowStep, boolean>;
  next_step: WorkflowStep | null;
  report_ready: boolean;
}

export interface ProfileData {
  cgpa: number;
  communication: number;
  logical_reasoning: number;
  projects_count: number;
  certifications_count: number;
  internship_count: number;
  interest_domain: string;
}

export interface ProfileView {
  user: User;
  profile: (ProfileData & { id: number; user_id: number; created_at: string }) | null;
  exists: boolean;
  completion: number;
  strength: { label: string; key: string };
  status: string;
  checklist: {
    personal_info: boolean;
    academic_details: boolean;
    career_interest: boolean;
    projects: boolean;
    certifications: boolean;
  };
  next_steps: string[];
  interest_options: string[];
  message?: string;
}

export interface ResumeView {
  uploaded: boolean;
  file_name: string | null;
  upload_date: string | null;
  skills: string[];
  projects: string[];
  certifications: string[];
  education: string[];
  completeness: number;
  ats_score: number;
  status_badge: string | null;
  advice: string | null;
  max_size_bytes: number;
  message?: string;
}

export interface Recommendation {
  rank: number;
  career: string;
  confidence: number;
  match_label: string;
}

export interface CareerView {
  career_options: string[];
  recommendations: Recommendation[] | null;
  predicted_role: string | null;
  prediction_confidence: number | null;
  selected_role: string | null;
  final_selected_role: string | null;
  selection_type: "AI Recommended" | "User Selected" | null;
  reason: string | null;
  career_category: string | null;
  latest_prediction: Record<string, unknown> | null;
  message?: string;
}

export interface SkillGapAnalysis {
  career_role: string;
  required_skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  extra_skills: string[];
  skill_match_score: number;
  readiness_score: number;
  priority: Record<"High Priority" | "Medium Priority" | "Low Priority", string[]>;
  counts: { Matched: number; Missing: number; Extra: number };
  role_has_requirements?: boolean;
  created_at?: string;
}

export interface SkillGapView {
  current_recommendation: {
    recommended_role: string;
    confidence_score: number;
    final_career_role: string;
    selection_type: string;
  };
  latest_analysis: SkillGapAnalysis | null;
  result?: SkillGapAnalysis;
}

export interface RoadmapView {
  final_career_role: string;
  readiness_score: number;
  missing_skills: string[];
  selection_type: string;
  timeline: { month: string; goals: string[] }[];
  projects: string[];
  certifications: string[];
  duration_months: number;
  roadmap_text: string;
  latest_saved: {
    id: number;
    career_role: string;
    roadmap_text: string;
    duration_months: number;
    readiness_score: number;
    created_at: string;
  } | null;
  message?: string;
}

export interface ActivityItem {
  type: "career" | "resume" | "skill_gap" | "roadmap";
  title: string;
  description: string;
  timestamp: string | null;
}

export interface DashboardView {
  user: User;
  profile_completion: number;
  ats_score: number;
  skill_match_score: number;
  roadmap_progress: number;
  overall_readiness: number;
  points_away: number;
  selected_career: string | null;
  career_confidence: number | null;
  selection_type: string | null;
  skill_counts: { matched: number; missing: number; extra: number };
  missing_skills: string[];
  matched_skills: string[];
  roadmap: {
    career_role: string;
    duration_months: number;
    readiness_score: number;
    created_at: string;
  } | null;
  milestones: { month: string; label: string; title: string; goals: string[] }[];
  activity: ActivityItem[];
  workflow: WorkflowStatus;
}

export interface AnalyticsView {
  summary: {
    profile_completion: number;
    ats_score: number;
    skill_match_score: number;
    roadmap_progress: number;
    overall_readiness: number;
  };
  profile: {
    exists: boolean;
    cgpa: number | null;
    projects_count: number;
    internship_count: number;
    certifications_count: number;
    interest_domain: string | null;
  };
  resume: {
    uploaded: boolean;
    ats_score: number;
    skills_count: number;
    projects_count: number;
    certifications_count: number;
    education_count: number;
    skills: string[];
  };
  career: {
    final_selected_career: string;
    confidence: number;
    career_category: string;
    prediction_date: string;
    selection_type: string;
  } | null;
  skill_gap: {
    counts: { Matched: number; Missing: number; Extra: number };
    matched_skills?: string[];
    missing_skills?: string[];
    extra_skills?: string[];
    priority?: Record<string, string[]>;
    skill_match_score?: number;
    readiness_score?: number;
  };
  roadmap: {
    career_role: string;
    duration_months: number;
    readiness_score: number;
    roadmap_text: string;
    projects: string[];
    certifications: string[];
  } | null;
  insights: string[];
}

export interface ReportStatus {
  ready: boolean;
  missing: string[];
}

export interface AdminOverview {
  overview: {
    total_users: number;
    total_profiles: number;
    total_resumes: number;
    total_career_predictions: number;
    total_skill_gap_analyses: number;
    total_roadmaps: number;
  };
  career_summary: { recommended_role: string; count: number }[];
  career_domains: Record<string, number>;
  career_selection_counts: { total_ai_recommendations: number; total_user_overrides: number };
  most_selected_careers: { career_role: string; count: number }[];
  top_selected_career: string | null;
  top_selected_count: number;
  override_stats: { career_role: string; override_count: number }[];
  skill_summary: {
    most_missing_skills: { skill: string; count: number }[];
    most_common_skills: { skill: string; count: number }[];
    average_skill_match_score: number;
    average_readiness_score: number;
  };
  resume_analytics: {
    average_ats_score: number;
    total_resumes: number;
    most_common_skills: { skill: string; count: number }[];
  };
  roadmap_analytics: {
    most_generated_roadmaps: { career_role: string; count: number }[];
    average_roadmap_duration: number;
  };
  database_health: {
    connected: boolean;
    database?: string;
    tables_found: string[];
    total_records: Record<string, number>;
  };
  latest_users: { id: number; name: string; email: string; created_at: string }[];
  user_activity: {
    id: number;
    name: string;
    email: string;
    has_profile: number;
    has_resume: number;
    has_prediction: number;
    has_skill_gap: number;
    has_roadmap: number;
    activity_score: number;
  }[];
}

export interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  created_at: string;
  interest_domain: string | null;
  recommended_role: string | null;
  confidence_score: number | null;
}

// ---------------------------------------------------------------- endpoints
function storeAuth(r: AuthResponse) {
  auth.set(r.access_token, r.user);
  return r;
}

export const api = {
  // auth (Streamlit login_page / register_page)
  register: (body: { name: string; email: string; password: string; confirm_password: string }) =>
    send<AuthResponse>("POST", "/api/auth/register", body).then(storeAuth),
  login: (body: { email: string; password: string }) =>
    send<AuthResponse>("POST", "/api/auth/login", body).then(storeAuth),
  me: () => get<{ user: User }>("/api/auth/me"),
  logout: () => auth.clear(),

  workflow: () => get<WorkflowStatus>("/api/workflow"),

  // profile_page
  getProfile: () => get<ProfileView>("/api/profile"),
  saveProfile: (data: ProfileData) => send<ProfileView>("PUT", "/api/profile", data),

  // resume_upload_page
  getResume: () => get<ResumeView>("/api/resume"),
  uploadResume: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return request<ResumeView>("/api/resume", { method: "POST", body: fd });
  },

  // career_recommendation_page
  getCareer: () => get<CareerView>("/api/career"),
  recommendCareer: () => send<CareerView>("POST", "/api/career/recommend"),
  selectCareer: (body: { use_ai: boolean; career?: string }) =>
    send<CareerView>("POST", "/api/career/select", body),

  // skill_gap_analysis_page
  getSkillGap: () => get<SkillGapView>("/api/skill-gap"),
  runSkillGap: () => send<SkillGapView>("POST", "/api/skill-gap/run"),

  // roadmap_generator_page
  getRoadmap: () => get<RoadmapView>("/api/roadmap"),
  generateRoadmap: () => send<RoadmapView>("POST", "/api/roadmap/generate"),

  // dashboard_page / analytics_dashboard_page
  dashboard: () => get<DashboardView>("/api/dashboard"),
  analytics: () => get<AnalyticsView>("/api/analytics"),

  // pdf_career_report_page
  reportStatus: () => get<ReportStatus>("/api/report/status"),
  downloadReport: async (): Promise<{ blob: Blob; filename: string }> => {
    const res = await request<Response>("/api/report/pdf", {}, { raw: true });
    const cd = res.headers.get("Content-Disposition") || "";
    const filename = /filename="?([^"]+)"?/.exec(cd)?.[1] ?? "career_report.pdf";
    return { blob: await res.blob(), filename };
  },

  // admin_dashboard_page
  adminOverview: () => get<AdminOverview>("/api/admin/overview"),
  adminUsers: (q: { name?: string; email?: string; career_role?: string }) => {
    const params = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => v && params.set(k, v));
    return get<{ count: number; results: AdminUserRow[] }>(`/api/admin/users?${params}`);
  },
  adminUsersCsv: async (q: { name?: string; email?: string; career_role?: string }) => {
    const params = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => v && params.set(k, v));
    const res = await request<Response>(`/api/admin/users.csv?${params}`, {}, { raw: true });
    return res.blob();
  },
};

// ---------------------------------------------------------------- helpers
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = new Date(iso.replace(" ", "T")).getTime();
  if (Number.isNaN(t)) return "";
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(t).toLocaleDateString();
}

export function initials(name: string | null | undefined): string {
  return (
    (name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join("") || "U"
  );
}

export const STEP_ROUTES: Record<WorkflowStep, { to: string; label: string }> = {
  profile: { to: "/profile", label: "Complete your profile" },
  resume: { to: "/resume", label: "Upload your resume" },
  career: { to: "/career", label: "Generate a career recommendation" },
  skill_gap: { to: "/skills", label: "Run the skill gap analysis" },
  roadmap: { to: "/roadmap", label: "Generate your roadmap" },
};
