import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ErrorCard, LoadingCard } from "@/components/ApiState";
import { api, type AnalyticsView } from "@/lib/api";
import { qk, useApiQuery } from "@/lib/queries";
import { TrendingUp, Users, BarChart3, FileText, Sparkles, Activity } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — CareerForge AI" }] }),
  component: Analytics,
});

function Analytics() {
  const q = useApiQuery(qk.analytics, api.analytics);
  return (
    <AppShell title="Analytics" subtitle="Insights across your career journey">
      {q.isPending ? (
        <LoadingCard />
      ) : q.isError ? (
        <ErrorCard error={q.error} onRetry={() => q.refetch()} />
      ) : (
        <AnalyticsBody a={q.data} />
      )}
    </AppShell>
  );
}

const PRIORITY_VALUE: Record<string, number> = { High: 100, Medium: 66, Low: 33 };

function AnalyticsBody({ a }: { a: AnalyticsView }) {
  const s = a.summary;
  const counts = a.skill_gap.counts;
  const total = counts.Matched + counts.Missing + counts.Extra;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const CAREER_DIST = [
    { l: "Matched", v: pct(counts.Matched) },
    { l: "Missing", v: pct(counts.Missing) },
    { l: "Extra", v: pct(counts.Extra) },
  ];
  const kpis = [
    {
      i: Users,
      l: "Profile completion",
      v: `${Math.round(s.profile_completion)}%`,
      d: a.profile.exists ? "Saved" : "Missing",
    },
    {
      i: FileText,
      l: "Resume ATS score",
      v: `${s.ats_score.toFixed(1)}%`,
      d: a.resume.uploaded ? "Parsed" : "No resume",
    },
    {
      i: Sparkles,
      l: "Skill match",
      v: `${s.skill_match_score.toFixed(1)}%`,
      d: a.skill_gap.skill_match_score != null ? "Analyzed" : "Not run",
    },
    { i: TrendingUp, l: "Overall readiness", v: `${s.overall_readiness.toFixed(1)}`, d: "/ 100" },
  ];

  return (
    <div className="max-w-7xl space-y-6">
      {/* KPI row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.i;
          return (
            <div key={k.l} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-start justify-between">
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold text-success">{k.d}</span>
              </div>
              <div className="mt-4 font-display text-3xl font-bold">{k.v}</div>
              <div className="text-xs text-muted-foreground mt-1">{k.l}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
        {/* Readiness breakdown (overall = average of the four scores) */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold">Readiness breakdown</h3>
              <p className="text-xs text-muted-foreground">
                Overall readiness is the average of these four scores
              </p>
            </div>
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <Bars
            tint="primary"
            data={[
              ["Profile", s.profile_completion],
              ["Resume ATS", s.ats_score],
              ["Skill match", s.skill_match_score],
              ["Roadmap", s.roadmap_progress],
              ["Overall", s.overall_readiness],
            ]}
          />
        </div>

        {/* Skill gap distribution */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display font-bold mb-4">Skill gap distribution</h3>
          {total === 0 && (
            <p className="text-sm text-muted-foreground">
              Run the skill gap analysis to see this chart.
            </p>
          )}
          <div className="space-y-3">
            {total > 0 &&
              CAREER_DIST.map((c) => (
                <div key={c.l}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{c.l}</span>
                    <span className="text-muted-foreground">{c.v}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-accent"
                      style={{ width: `${c.v}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Skill distribution bars */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Resume analytics · extracted sections">
          <Bars
            tint="primary"
            data={[
              [
                "Skills",
                Math.min(100, (a.resume.skills_count / 5) * 100),
                `${a.resume.skills_count}`,
              ],
              [
                "Projects",
                Math.min(100, (a.resume.projects_count / 3) * 100),
                `${a.resume.projects_count}`,
              ],
              [
                "Certifications",
                Math.min(100, (a.resume.certifications_count / 2) * 100),
                `${a.resume.certifications_count}`,
              ],
              [
                "Education",
                Math.min(100, a.resume.education_count * 100),
                `${a.resume.education_count}`,
              ],
            ]}
          />
        </Card>
        <Card title="Missing skills · learning priority">
          {(a.skill_gap.missing_skills ?? []).length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">No missing skills recorded.</p>
          )}
          <Bars
            tint="warning"
            data={(a.skill_gap.missing_skills ?? []).map((sk) => {
              const pr = (
                Object.entries(a.skill_gap.priority ?? {}).find(([, list]) =>
                  list.includes(sk),
                )?.[0] ?? "Medium Priority"
              ).replace(" Priority", "");
              return [sk, PRIORITY_VALUE[pr], pr] as [string, number, string];
            })}
          />
        </Card>
        <Card title="Career & roadmap">
          <div className="grid grid-cols-2 gap-3 mt-3">
            {[
              ["Final career", a.career?.final_selected_career ?? "—"],
              ["Category", a.career?.career_category ?? "—"],
              ["Confidence", a.career ? `${Number(a.career.confidence).toFixed(1)}%` : "—"],
              ["Selection", a.career?.selection_type ?? "—"],
              ["Roadmap", a.roadmap ? `${a.roadmap.duration_months} months` : "Not saved"],
              [
                "Roadmap readiness",
                a.roadmap ? `${Number(a.roadmap.readiness_score).toFixed(1)}%` : "—",
              ],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl border border-border bg-surface p-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {l}
                </div>
                <div className="font-semibold mt-1 truncate">{v}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Insights engine">
          <ul className="mt-4 space-y-3 text-sm">
            {a.insights.length === 0 && (
              <li className="text-muted-foreground">
                No insights yet — complete the missing steps.
              </li>
            )}
            {a.insights.map((t) => (
              <li key={t} className="flex gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {t}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Generated from your stored profile, resume,
            career, skill gap and roadmap
          </p>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h3 className="font-display font-bold">{title}</h3>
      {children}
    </div>
  );
}

function Bars({
  data,
  tint,
}: {
  data: ([string, number] | [string, number, string])[];
  tint: "primary" | "warning";
}) {
  const cls = tint === "primary" ? "bg-gradient-primary" : "bg-warning";
  return (
    <div className="mt-4 space-y-2.5">
      {data.map(([l, v, label]) => (
        <div key={l} className="grid grid-cols-[100px_1fr_56px] items-center gap-3 text-sm">
          <span className="font-medium truncate">{l}</span>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full ${cls}`}
              style={{ width: `${Math.max(0, Math.min(100, v))}%` }}
            />
          </div>
          <span className="text-right text-muted-foreground">{label ?? `${Math.round(v)}%`}</span>
        </div>
      ))}
    </div>
  );
}

function TrendChart({ data }: { data: number[] }) {
  const w = 600,
    h = 200,
    p = 20;
  const max = Math.max(...data),
    min = Math.min(...data);
  const xs = data.map((_, i) => p + (i * (w - p * 2)) / (data.length - 1));
  const ys = data.map((v) => h - p - ((v - min) / (max - min)) * (h - p * 2));
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
  const area = `M ${xs[0]},${h - p} L ${pts.split(" ").join(" L ")} L ${xs[xs.length - 1]},${h - p} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-56">
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.55 0.22 295)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.55 0.22 295)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#area)" />
      <polyline
        fill="none"
        stroke="oklch(0.42 0.18 265)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="4" fill="oklch(0.42 0.18 265)" />
      ))}
    </svg>
  );
}
