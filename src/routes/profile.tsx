import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ErrorCard, FormErrors, LoadingCard } from "@/components/ApiState";
import {
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Briefcase,
  Mail,
  Edit3,
  Shield,
  Loader2,
  Save,
} from "lucide-react";
import { api, initials, type ProfileData, type ProfileView } from "@/lib/api";
import { ALL_USER_KEYS, qk, useApiQuery } from "@/lib/queries";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — CareerForge AI" }] }),
  component: Profile,
});

// Short descriptions for the interest domains offered by app.py's profile_page().
const DOMAIN_DESC: Record<string, string> = {
  "Data Science": "ML, statistics, analytics",
  "Artificial Intelligence": "Intelligent systems & models",
  "Machine Learning": "Models in production",
  "Software Development": "Apps, services, APIs",
  "Web Development": "Full-stack, React, APIs",
  "Cloud Computing": "AWS, containers, infra",
  "Cyber Security": "Security & defense",
  DevOps: "CI/CD, automation, SRE",
  "Business Analytics": "Metrics, BI & growth",
};

const EMPTY: ProfileData = {
  cgpa: 0,
  communication: 5,
  logical_reasoning: 5,
  projects_count: 0,
  certifications_count: 0,
  internship_count: 0,
  interest_domain: "",
};

function Profile() {
  const q = useApiQuery(qk.profile, api.getProfile);
  return (
    <AppShell title="Profile" subtitle="Manage your academic and professional identity">
      {q.isPending ? (
        <LoadingCard />
      ) : q.isError ? (
        <ErrorCard error={q.error} onRetry={() => q.refetch()} />
      ) : (
        <ProfileBody v={q.data} />
      )}
    </AppShell>
  );
}

function ProfileBody({ v }: { v: ProfileView }) {
  const queryClient = useQueryClient();
  const resume = useApiQuery(qk.resume, api.getResume);
  const [editing, setEditing] = useState(!v.exists);
  const [form, setForm] = useState<ProfileData>(v.profile ? pick(v.profile) : EMPTY);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    if (v.profile && !editing) setForm(pick(v.profile));
  }, [v.profile, editing]);

  const save = useMutation({
    mutationFn: () => api.saveProfile(form),
    onSuccess: (data) => {
      queryClient.setQueryData(qk.profile, data);
      ALL_USER_KEYS.filter((k) => k !== qk.profile).forEach((k) =>
        queryClient.invalidateQueries({ queryKey: k }),
      );
      setSaved(data.message ?? "Profile saved");
      setEditing(false);
    },
  });

  const set = <K extends keyof ProfileData>(k: K, val: ProfileData[K]) => {
    setSaved(null);
    setForm((f) => ({ ...f, [k]: val }));
  };
  const p = v.profile;
  const interestText =
    (editing ? form.interest_domain : p?.interest_domain) || "Select interest domain";
  const checklist: [string, boolean][] = [
    ["Personal info", v.checklist.personal_info],
    ["Academic details", v.checklist.academic_details],
    ["Career interest", v.checklist.career_interest],
    [`Projects (${Math.min(p?.projects_count ?? 0, 5)}/5)`, v.checklist.projects],
    ["Certifications", v.checklist.certifications],
  ];
  const edit = () => {
    setSaved(null);
    setEditing(true);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_2fr] gap-6 max-w-7xl">
      {/* Left: identity */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-hero text-2xl font-bold text-primary-foreground">
                {initials(v.user.name)}
              </div>
              <button
                onClick={edit}
                title="Edit profile"
                className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border border-border bg-card shadow-soft hover:bg-muted"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>
            <h2 className="mt-4 font-display text-xl font-bold">{v.user.name}</h2>
            <p className="text-sm text-muted-foreground">{interestText}</p>
            <div
              className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${v.exists ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}
            >
              <Sparkles className="h-3 w-3" /> {v.status}
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" /> {v.user.email}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4" /> {v.user.role === "admin" ? "Admin" : "User"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" /> {interestText}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold">Profile Strength</h3>
            <span
              className={`text-xs font-semibold ${v.completion >= 60 ? "text-success" : "text-warning"}`}
            >
              {v.strength.label}
            </span>
          </div>
          <div className="mt-4 text-center">
            <div className="font-display text-5xl font-extrabold text-primary">{v.completion}%</div>
            <div className="text-xs text-muted-foreground mt-1">Completion</div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-primary"
              style={{ width: `${v.completion}%` }}
            />
          </div>
          <ul className="mt-5 space-y-2 text-sm">
            {checklist.map(([t, done]) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${done ? "text-success" : "text-muted-foreground/40"}`}
                />
                <span className={done ? "" : "text-muted-foreground"}>{t}</span>
              </li>
            ))}
          </ul>
          {v.next_steps.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Recommended next steps
              </div>
              <ol className="space-y-1.5 text-sm">
                {v.next_steps.map((s, i) => (
                  <li key={s} className="flex gap-2">
                    <span className="font-semibold text-primary">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Right: forms */}
      <div className="space-y-6">
        {saved && !editing && (
          <div className="rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> {saved}
            </span>
            <Link to="/resume" className="font-semibold hover:underline">
              Next: upload resume →
            </Link>
          </div>
        )}

        <Section title="Academic Overview" icon={GraduationCap} onEdit={edit} editing={editing}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="CGPA"
              suffix="/ 10"
              editing={editing}
              value={form.cgpa}
              display={p ? Number(p.cgpa).toFixed(2) : "—"}
              min={0}
              max={10}
              step={0.1}
              onChange={(n) => set("cgpa", n)}
            />
            <Field
              label="Communication"
              suffix="/ 10"
              editing={editing}
              value={form.communication}
              display={p ? String(p.communication) : "—"}
              min={1}
              max={10}
              step={1}
              onChange={(n) => set("communication", n)}
            />
            <Field
              label="Logical Reasoning"
              suffix="/ 10"
              editing={editing}
              value={form.logical_reasoning}
              display={p ? String(p.logical_reasoning) : "—"}
              min={1}
              max={10}
              step={1}
              onChange={(n) => set("logical_reasoning", n)}
            />
          </div>
        </Section>

        <Section title="Experience" icon={Briefcase} onEdit={edit} editing={editing}>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field
              label="Projects"
              editing={editing}
              value={form.projects_count}
              display={p ? String(p.projects_count) : "—"}
              min={0}
              max={50}
              step={1}
              onChange={(n) => set("projects_count", n)}
            />
            <Field
              label="Certifications"
              editing={editing}
              value={form.certifications_count}
              display={p ? String(p.certifications_count) : "—"}
              min={0}
              max={50}
              step={1}
              onChange={(n) => set("certifications_count", n)}
            />
            <Field
              label="Internships"
              editing={editing}
              value={form.internship_count}
              display={p ? String(p.internship_count) : "—"}
              min={0}
              max={10}
              step={1}
              onChange={(n) => set("internship_count", n)}
            />
          </div>
        </Section>

        <Section title="Skill Overview" icon={Sparkles}>
          <div className="flex flex-wrap gap-2">
            {(resume.data?.skills ?? []).map((s) => (
              <span
                key={s}
                className="rounded-full bg-primary/10 text-primary px-3 py-1.5 text-sm font-medium"
              >
                {s}
              </span>
            ))}
            {resume.data && resume.data.skills.length === 0 && (
              <span className="text-sm text-muted-foreground">
                Skills are extracted from your resume.
              </span>
            )}
            <Link
              to="/resume"
              className="rounded-full border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
            >
              {resume.data?.uploaded ? "+ Update resume" : "+ Upload resume"}
            </Link>
          </div>
        </Section>

        <Section title="Interest Domains" icon={Briefcase} onEdit={edit} editing={editing}>
          <div className="grid sm:grid-cols-2 gap-3">
            {v.interest_options.filter(Boolean).map((t) => {
              const active = (editing ? form.interest_domain : p?.interest_domain) === t;
              return (
                <button
                  type="button"
                  key={t}
                  disabled={!editing}
                  onClick={() => set("interest_domain", active ? "" : t)}
                  className={`text-left rounded-xl border p-4 transition ${active ? "border-primary bg-primary/5" : "border-border bg-surface"} ${editing ? "hover:border-primary cursor-pointer" : "cursor-default"}`}
                >
                  <div className="font-semibold flex items-center gap-2">
                    {t}
                    {active && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{DOMAIN_DESC[t] ?? ""}</div>
                </button>
              );
            })}
          </div>
        </Section>

        {editing && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-4">
            <FormErrors error={save.error} />
            <div className="flex flex-wrap justify-end gap-3">
              {v.exists && (
                <button
                  onClick={() => {
                    setEditing(false);
                    save.reset();
                  }}
                  className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => save.mutate()}
                disabled={save.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95 disabled:opacity-60"
              >
                {save.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}{" "}
                Save Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function pick(p: ProfileData): ProfileData {
  return {
    cgpa: Number(p.cgpa) || 0,
    communication: Number(p.communication) || 5,
    logical_reasoning: Number(p.logical_reasoning) || 5,
    projects_count: Number(p.projects_count) || 0,
    certifications_count: Number(p.certifications_count) || 0,
    internship_count: Number(p.internship_count) || 0,
    interest_domain: p.interest_domain ?? "",
  };
}

function Section({
  title,
  icon: Icon,
  children,
  onEdit,
  editing,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onEdit?: () => void;
  editing?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="font-display font-bold">{title}</h3>
        </div>
        {onEdit && !editing && (
          <button onClick={onEdit} className="text-sm text-primary font-medium hover:underline">
            Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  display,
  editing,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  value: number;
  display: string;
  editing: boolean;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      {editing ? (
        <div className="mt-1 flex items-center gap-2">
          <input
            type="number"
            value={Number.isFinite(value) ? value : ""}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(e.target.value === "" ? NaN : Number(e.target.value))}
            className="w-full bg-transparent font-semibold outline-none border-b border-border focus:border-primary"
          />
          {suffix && <span className="text-sm text-muted-foreground shrink-0">{suffix}</span>}
        </div>
      ) : (
        <div className="mt-1 font-semibold">
          {display}
          {suffix && display !== "—" ? ` ${suffix}` : ""}
        </div>
      )}
    </div>
  );
}
