import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { ErrorCard, FormErrors, LoadingCard } from "@/components/ApiState";
import { Check, X, Plus, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { api, type SkillGapView } from "@/lib/api";
import { ALL_USER_KEYS, qk, useApiQuery } from "@/lib/queries";

export const Route = createFileRoute("/skills")({
  head: () => ({ meta: [{ title: "Skill Gap — CareerForge AI" }] }),
  component: Skills,
});

function Ring({ value, label }: { value: number; label: string }) {
  const r = 56;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} stroke="var(--color-muted)" strokeWidth="12" fill="none" />
          <circle
            cx="70"
            cy="70"
            r={r}
            stroke="url(#g)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${(value / 100) * c} ${c}`}
          />
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.42 0.18 265)" />
              <stop offset="100%" stopColor="oklch(0.55 0.22 295)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="font-display text-3xl font-extrabold">{value}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">/ 100</div>
          </div>
        </div>
      </div>
      <div className="mt-3 text-sm font-semibold">{label}</div>
    </div>
  );
}

function Skills() {
  const q = useApiQuery(qk.skillGap, api.getSkillGap);
  const subtitle = q.data
    ? `${q.data.current_recommendation.final_career_role} · ${q.data.current_recommendation.selection_type}`
    : "Matched, missing & extra skills";
  return (
    <AppShell title="Skill Gap Analysis" subtitle={subtitle}>
      {q.isPending ? (
        <LoadingCard />
      ) : q.isError ? (
        <ErrorCard error={q.error} onRetry={() => q.refetch()} />
      ) : (
        <SkillsBody v={q.data} />
      )}
    </AppShell>
  );
}

function SkillsBody({ v }: { v: SkillGapView }) {
  const queryClient = useQueryClient();
  const run = useMutation({
    mutationFn: api.runSkillGap,
    onSuccess: (data) => {
      queryClient.setQueryData(qk.skillGap, data);
      ALL_USER_KEYS.filter((k) => k !== qk.skillGap).forEach((k) =>
        queryClient.invalidateQueries({ queryKey: k }),
      );
    },
  });
  const a = v.latest_analysis;
  const stale = a && a.career_role !== v.current_recommendation.final_career_role;
  const runButton = (
    <button
      onClick={() => run.mutate()}
      disabled={run.isPending}
      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95 disabled:opacity-60"
    >
      {run.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}{" "}
      {a ? "Re-run Skill Gap Analysis" : "Run Skill Gap Analysis"}
    </button>
  );

  if (!a) {
    return (
      <div className="max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-soft space-y-4">
        <h3 className="font-display text-xl font-bold">
          Analyze your skills against {v.current_recommendation.final_career_role}
        </h3>
        <p className="text-sm text-muted-foreground">
          Top recommended career: {v.current_recommendation.recommended_role} ·{" "}
          {Number(v.current_recommendation.confidence_score).toFixed(1)}% confidence.
        </p>
        {runButton}
        <FormErrors error={run.error} />
      </div>
    );
  }

  const requiredSet = new Set(a.matched_skills);
  const MATCHED = a.required_skills.map((n) => ({ n, p: requiredSet.has(n) ? 100 : 0 }));
  const MISSING = a.missing_skills;
  const EXTRA = a.extra_skills;
  const priorityOf = (skill: string) =>
    (
      Object.entries(a.priority).find(([, list]) => list.includes(skill))?.[0] ?? "Medium Priority"
    ).replace(" Priority", " priority");

  return (
    <div className="max-w-7xl space-y-6">
      {(stale ||
        a.role_has_requirements === false ||
        a.required_skills.length === 0 ||
        run.error) && (
        <div className="space-y-2">
          {stale && (
            <div className="rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm">
              This analysis was run for <b>{a.career_role}</b>, but your selected career is now{" "}
              <b>{v.current_recommendation.final_career_role}</b>. Re-run it to update.
            </div>
          )}
          {a.required_skills.length === 0 && (
            <div className="rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm">
              No required-skill list is defined for <b>{a.career_role}</b> in the skill database, so
              the skill match is 0%.
            </div>
          )}
          <FormErrors error={run.error} />
        </div>
      )}
      {/* Readiness summary */}
      <div className="grid lg:grid-cols-[1fr_2fr] gap-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display font-bold">Career Readiness</h3>
          <p className="text-xs text-muted-foreground">How job-ready you are today</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Ring value={Math.round(Number(a.readiness_score))} label="Readiness" />
            <Ring value={Math.round(Number(a.skill_match_score))} label="Skill match" />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Stat
            color="success"
            value={MATCHED.length}
            label="Matched skills"
            desc="Aligned with target role"
            icon={<Check className="h-5 w-5" />}
          />
          <Stat
            color="warning"
            value={MISSING.length}
            label="Missing skills"
            desc="Critical gaps to close"
            icon={<X className="h-5 w-5" />}
          />
          <Stat
            color="accent"
            value={EXTRA.length}
            label="Extra skills"
            desc="Bonus differentiators"
            icon={<Plus className="h-5 w-5" />}
          />
        </div>
      </div>

      {/* Matched bars */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h3 className="font-display font-bold">Required skills · {a.career_role}</h3>
        <div className="mt-5 space-y-3">
          {MATCHED.map((s) => (
            <div key={s.n}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium">{s.n}</span>
                <span className="text-muted-foreground">{s.p === 100 ? "Matched" : "Missing"}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-primary"
                  style={{ width: `${s.p}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <SkillList title="Missing skills" tint="warning" items={MISSING} actionLabel={priorityOf} />
        <SkillList title="Extra skills" tint="accent" items={EXTRA} actionLabel={() => "Bonus"} />
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        {runButton}
        <Link
          to="/roadmap"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95"
        >
          Generate Roadmap <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function Stat({
  color,
  value,
  label,
  desc,
  icon,
}: {
  color: "success" | "warning" | "accent";
  value: number;
  label: string;
  desc: string;
  icon: React.ReactNode;
}) {
  const map = {
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    accent: "text-accent bg-accent/15",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className={`grid h-11 w-11 place-items-center rounded-xl ${map[color]}`}>{icon}</div>
      <div className="mt-4 font-display text-4xl font-extrabold">{value}</div>
      <div className="mt-1 font-semibold">{label}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </div>
  );
}

function SkillList({
  title,
  tint,
  items,
  actionLabel,
}: {
  title: string;
  tint: "warning" | "accent";
  items: string[];
  actionLabel: (s: string) => string;
}) {
  const tintMap = { warning: "bg-warning/10 text-warning", accent: "bg-accent/15 text-accent" };
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h3 className="font-display font-bold">{title}</h3>
      <ul className="mt-4 divide-y divide-border">
        {items.length === 0 && <li className="py-3 text-sm text-muted-foreground">None</li>}
        {items.map((s) => (
          <li key={s} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-bold ${tintMap[tint]}`}
              >
                {s.charAt(0)}
              </span>
              <span className="font-medium">{s}</span>
            </div>
            <span className="text-xs font-semibold text-primary">{actionLabel(s)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
