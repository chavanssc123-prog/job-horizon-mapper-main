import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { ErrorCard, FormErrors, LoadingCard } from "@/components/ApiState";
import {
  Check,
  Circle,
  Clock,
  BookOpen,
  Award,
  ArrowRight,
  Calendar,
  Loader2,
  Save,
  Briefcase,
} from "lucide-react";
import { api, timeAgo, type RoadmapView } from "@/lib/api";
import { ALL_USER_KEYS, qk, useApiQuery } from "@/lib/queries";

export const Route = createFileRoute("/roadmap")({
  head: () => ({ meta: [{ title: "Roadmap — CareerForge AI" }] }),
  component: Roadmap,
});

function Roadmap() {
  const q = useApiQuery(qk.roadmap, api.getRoadmap);
  const subtitle = q.data
    ? `${q.data.duration_months}-month plan · ${q.data.final_career_role} track`
    : "Personalized learning plan";
  return (
    <AppShell title="Personalized Roadmap" subtitle={subtitle}>
      {q.isPending ? (
        <LoadingCard />
      ) : q.isError ? (
        <ErrorCard error={q.error} onRetry={() => q.refetch()} />
      ) : (
        <RoadmapBody v={q.data} />
      )}
    </AppShell>
  );
}

function splitGoal(goal: string): { t: string; focus: string } {
  const i = goal.indexOf(":");
  return i > 0
    ? { t: goal.slice(0, i).trim(), focus: goal.slice(i + 1).trim() }
    : { t: goal, focus: "" };
}

function RoadmapBody({ v }: { v: RoadmapView }) {
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: api.generateRoadmap,
    onSuccess: (data) => {
      queryClient.setQueryData(qk.roadmap, data);
      ALL_USER_KEYS.filter((k) => k !== qk.roadmap).forEach((k) =>
        queryClient.invalidateQueries({ queryKey: k }),
      );
    },
  });
  // No per-month progress is stored in the database, so Month 1 is shown as the current focus.
  const MONTHS = v.timeline.map((mo, idx) => {
    const head = splitGoal(mo.goals[0] ?? mo.month);
    return {
      m: idx + 1,
      t: head.t,
      focus: head.focus,
      status: idx === 0 ? "current" : "upcoming",
      items: mo.goals,
    };
  });
  const readiness = Math.round(Number(v.readiness_score));
  const saved = v.latest_saved;

  return (
    <div className="max-w-7xl space-y-6">
      {/* Overview bar */}
      <div className="rounded-2xl bg-gradient-hero text-primary-foreground p-6 shadow-elevated relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <div className="relative grid sm:grid-cols-[1fr_auto] gap-4 items-center">
          <div>
            <div className="text-xs uppercase tracking-widest opacity-80">Track</div>
            <h2 className="font-display text-3xl font-bold mt-1">
              {v.final_career_role} · {v.duration_months} months
            </h2>
            <p className="text-sm opacity-90 mt-1">
              {v.missing_skills.length} missing skill(s) · {v.selection_type} ·{" "}
              {saved ? `Saved ${timeAgo(saved.created_at)}` : "Not saved yet"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-card/15 border border-card/20 backdrop-blur-sm px-4 py-2">
              <div className="text-[10px] uppercase tracking-widest opacity-80">Readiness</div>
              <div className="font-display text-2xl font-bold">{readiness}%</div>
            </div>
            <button
              onClick={() => save.mutate()}
              disabled={save.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-card text-foreground px-4 py-3 text-sm font-semibold hover:opacity-95 disabled:opacity-60"
            >
              {save.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}{" "}
              {saved ? "Regenerate & Save" : "Generate & Save"}
            </button>
          </div>
        </div>
        <div className="relative mt-4 h-2 rounded-full bg-card/20 overflow-hidden">
          <div className="h-full rounded-full bg-card" style={{ width: `${readiness}%` }} />
        </div>
      </div>

      <FormErrors error={save.error} />
      {save.data?.message && (
        <div className="rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
          {save.data.message}
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-2 bottom-2 w-px bg-border" />
        <ol className="space-y-4">
          {MONTHS.map((mo) => {
            const done = mo.status === "done";
            const current = mo.status === "current";
            return (
              <li key={mo.m} className="relative pl-16">
                <div
                  className={`absolute left-2 top-5 grid h-9 w-9 place-items-center rounded-full border-4 border-background ${done ? "bg-success text-success-foreground" : current ? "bg-primary text-primary-foreground shadow-glow" : "bg-card text-muted-foreground border-border"}`}
                >
                  {done ? (
                    <Check className="h-4 w-4" />
                  ) : current ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                </div>
                <div
                  className={`rounded-2xl border bg-card p-6 shadow-soft transition ${current ? "border-primary shadow-card" : "border-border"}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          Month {mo.m}
                        </span>
                        {done && (
                          <span className="rounded-full bg-success/10 text-success px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            Completed
                          </span>
                        )}
                        {current && (
                          <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            In progress
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 font-display text-xl font-bold">{mo.t}</h3>
                      {mo.focus && <p className="text-sm text-muted-foreground">{mo.focus}</p>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" /> {mo.items.length} goals
                    </div>
                  </div>
                  <div className="mt-4 grid sm:grid-cols-3 gap-2">
                    {mo.items.map((it) => (
                      <div
                        key={it}
                        className="flex items-center gap-2 rounded-lg bg-surface border border-border px-3 py-2 text-sm"
                      >
                        <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate" title={it}>
                          {it}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { title: "Recommended projects", icon: Briefcase, items: v.projects },
          { title: "Recommended certifications", icon: Award, items: v.certifications },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-4">
                <Icon className="h-4 w-4 text-primary" />
                <h3 className="font-display font-bold">{c.title}</h3>
              </div>
              <div className="space-y-2">
                {c.items.map((it) => (
                  <div
                    key={it}
                    className="flex items-center gap-2 rounded-lg bg-surface border border-border px-3 py-2 text-sm"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{it}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-between gap-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <Award className="h-5 w-5 text-secondary" />
          <div>
            <div className="font-semibold">Earn your Career Readiness Badge</div>
            <div className="text-xs text-muted-foreground">
              Complete all {v.duration_months} months to unlock
            </div>
          </div>
        </div>
        <Link
          to="/report"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95"
        >
          View Career Report <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
