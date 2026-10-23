import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ErrorCard, LoadingCard } from "@/components/ApiState";
import { api, timeAgo, type ActivityItem, type DashboardView } from "@/lib/api";
import { qk, useApiQuery } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import {
  TrendingUp,
  FileText,
  Sparkles,
  Target,
  Map,
  CheckCircle2,
  ArrowUpRight,
  ArrowRight,
  Calendar,
  Award,
  Briefcase,
  Bell,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CareerForge AI" }] }),
  component: Dashboard,
});

function buildKpis(d: DashboardView) {
  const gapTotal = d.skill_counts.matched + d.skill_counts.missing;
  return [
    {
      label: "Profile Completion",
      value: `${Math.round(d.profile_completion)}%`,
      delta: d.workflow.steps.profile ? "Saved" : "Not started",
      icon: CheckCircle2,
      progress: d.profile_completion,
      tint: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Resume Score",
      value: `${Math.round(d.ats_score)}`,
      delta: d.workflow.steps.resume ? "Parsed" : "No resume",
      icon: FileText,
      progress: d.ats_score,
      tint: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "Career Match",
      value: d.career_confidence != null ? `${Math.round(d.career_confidence)}%` : "—",
      delta: d.selected_career ?? "Not generated",
      icon: Sparkles,
      progress: d.career_confidence ?? 0,
      tint: "text-accent",
      bg: "bg-accent/15",
    },
    {
      label: "Readiness Score",
      value: `${Math.round(d.overall_readiness)}`,
      delta: `${d.points_away} to go`,
      icon: Target,
      progress: d.overall_readiness,
      tint: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Missing Skills",
      value: `${d.skill_counts.missing}`,
      delta: d.workflow.steps.skill_gap ? `${d.skill_counts.matched} matched` : "Not analyzed",
      icon: Award,
      progress: gapTotal ? (d.skill_counts.missing / gapTotal) * 100 : 0,
      tint: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Roadmap Progress",
      value: `${Math.round(d.roadmap_progress)}%`,
      delta: d.roadmap ? `${d.roadmap.duration_months} months` : "Not generated",
      icon: Map,
      progress: d.roadmap_progress,
      tint: "text-primary-glow",
      bg: "bg-primary/10",
    },
  ];
}

const ACTIVITY_STYLE: Record<ActivityItem["type"], { i: typeof Sparkles; c: string }> = {
  career: { i: Sparkles, c: "text-secondary bg-secondary/10" },
  resume: { i: FileText, c: "text-primary bg-primary/10" },
  skill_gap: { i: Target, c: "text-accent bg-accent/15" },
  roadmap: { i: Award, c: "text-success bg-success/10" },
};

function Dashboard() {
  const { user } = useAuth();
  const q = useApiQuery(qk.dashboard, api.dashboard);
  const first = (user?.name ?? "").split(" ")[0];

  return (
    <AppShell
      title={first ? `Welcome back, ${first}` : "Dashboard"}
      subtitle="Here's a snapshot of your career readiness journey"
    >
      {q.isPending ? (
        <LoadingCard />
      ) : q.isError ? (
        <ErrorCard error={q.error} onRetry={() => q.refetch()} />
      ) : (
        <DashboardBody d={q.data} />
      )}
    </AppShell>
  );
}

function DashboardBody({ d }: { d: DashboardView }) {
  const KPIS = buildKpis(d);
  const readiness = Math.round(d.overall_readiness);
  return (
    <div className="space-y-6 max-w-7xl">
      {/* Hero card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-hero text-primary-foreground p-6 md:p-8 shadow-elevated">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-card/15 backdrop-blur-sm border border-card/20 px-3 py-1 text-xs">
              <Sparkles className="h-3.5 w-3.5" /> AI Insight · Updated today
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight">
              You're {d.points_away} points away from being interview-ready for{" "}
              <span className="underline decoration-accent decoration-4 underline-offset-4">
                {d.selected_career ?? "your target role"}
              </span>
            </h2>
            <p className="mt-2 text-sm opacity-90">
              {d.workflow.next_step
                ? `Next step: ${{ profile: "complete your profile", resume: "upload your resume", career: "generate a career recommendation", skill_gap: "run the skill gap analysis", roadmap: "generate your roadmap" }[d.workflow.next_step]}.`
                : `Focus on the ${d.skill_counts.missing} missing high-impact skills this month to unlock a 90+ readiness score.`}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/skills"
                className="inline-flex items-center gap-1.5 rounded-lg bg-card text-foreground px-4 py-2 text-sm font-semibold hover:opacity-95 transition"
              >
                View skill gaps <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/roadmap"
                className="inline-flex items-center gap-1.5 rounded-lg border border-card/30 px-4 py-2 text-sm font-semibold hover:bg-card/10 transition"
              >
                Open roadmap
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-card/10 backdrop-blur-md border border-card/20 p-5">
            <div className="text-xs uppercase tracking-widest opacity-80">Readiness</div>
            <div className="mt-1 flex items-end gap-2">
              <div className="font-display text-6xl font-extrabold">{readiness}</div>
              <div className="pb-2 text-sm opacity-80">/ 100</div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-card/20 overflow-hidden">
              <div className="h-full rounded-full bg-card" style={{ width: `${readiness}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="font-bold text-base">{d.skill_counts.matched}</div>
                <div className="opacity-80">Matched</div>
              </div>
              <div>
                <div className="font-bold text-base">{d.skill_counts.missing}</div>
                <div className="opacity-80">Missing</div>
              </div>
              <div>
                <div className="font-bold text-base">{d.skill_counts.extra}</div>
                <div className="opacity-80">Extra</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {KPIS.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-card transition"
            >
              <div className="flex items-start justify-between">
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${k.bg} ${k.tint}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-success truncate max-w-[60%]">
                  {k.delta}
                </span>
              </div>
              <div className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
                {k.label}
              </div>
              <div className="mt-1 font-display text-3xl font-bold">{k.value}</div>
              <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-primary`}
                  style={{ width: `${Math.min(100, Math.max(0, k.progress))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-col: roadmap + activity */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-lg">
                Your {d.roadmap ? `${d.roadmap.duration_months}-month` : ""} roadmap
              </h3>
              <p className="text-sm text-muted-foreground">
                {d.roadmap ? `${d.roadmap.career_role} track` : "Not generated yet"}
              </p>
            </div>
            <Link
              to="/roadmap"
              className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {d.milestones.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted-foreground">
                Finish the steps up to the skill gap analysis, then generate your roadmap.
                <div className="mt-3">
                  <Link
                    to="/roadmap"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Open roadmap
                  </Link>
                </div>
              </div>
            )}
            {d.milestones
              .map((ms, idx) => ({
                m: idx + 1,
                t: ms.title,
                s: idx === 0 ? `${ms.label} · Current focus` : `${ms.label} · Upcoming`,
                done: false,
                current: idx === 0,
              }))
              .map((r) => (
                <div
                  key={r.m}
                  className={`flex items-center gap-4 rounded-xl border p-4 transition ${r.current ? "border-primary bg-primary/5" : "border-border bg-surface"}`}
                >
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg font-bold text-sm ${r.done ? "bg-success text-success-foreground" : r.current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    M{r.m}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{r.t}</div>
                    <div className="text-xs text-muted-foreground">{r.s}</div>
                  </div>
                  {r.done && <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />}
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display font-bold text-lg mb-1">Activity</h3>
          <p className="text-sm text-muted-foreground mb-5">Recent updates</p>
          <ol className="space-y-4">
            {d.activity.length === 0 && (
              <li className="text-sm text-muted-foreground">
                No activity yet — start with your profile.
              </li>
            )}
            {d.activity
              .map((x) => ({
                i: ACTIVITY_STYLE[x.type].i,
                t: x.title,
                d: x.description,
                time: timeAgo(x.timestamp),
                c: ACTIVITY_STYLE[x.type].c,
              }))
              .map((a, i) => {
                const Icon = a.i;
                return (
                  <li key={i} className="flex gap-3">
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${a.c}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{a.t}</div>
                      <div className="text-xs text-muted-foreground truncate">{a.d}</div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">{a.time}</div>
                  </li>
                );
              })}
          </ol>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { i: Briefcase, t: "Career Analysis", l: "/career" },
          { i: Target, t: "Skill Gap", l: "/skills" },
          { i: Calendar, t: "Roadmap", l: "/roadmap" },
          { i: TrendingUp, t: "Analytics", l: "/analytics" },
        ].map((q) => {
          const Icon = q.i;
          return (
            <Link
              key={q.t}
              to={q.l}
              className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 hover:border-primary hover:shadow-card transition"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-primary" />
                <span className="font-semibold">{q.t}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
