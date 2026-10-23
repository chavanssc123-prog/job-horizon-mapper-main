import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ErrorCard, FormErrors, LoadingCard } from "@/components/ApiState";
import {
  Download,
  FileText,
  Sparkles,
  Target,
  Map,
  Award,
  Share2,
  Printer,
  Loader2,
  Check,
} from "lucide-react";
import {
  api,
  saveBlob,
  type AnalyticsView,
  type DashboardView,
  type ReportStatus,
} from "@/lib/api";
import { qk, useApiQuery } from "@/lib/queries";

export const Route = createFileRoute("/report")({
  head: () => ({ meta: [{ title: "Career Report — CareerForge AI" }] }),
  component: Report,
});

function Report() {
  const status = useApiQuery(qk.report, api.reportStatus);
  const dash = useApiQuery(qk.dashboard, api.dashboard);
  const analytics = useApiQuery(qk.analytics, api.analytics);
  const pending = status.isPending || dash.isPending || analytics.isPending;
  const error = status.error || dash.error || analytics.error;
  return (
    <AppShell title="Career Report" subtitle="PDF of your readiness summary">
      {pending ? (
        <LoadingCard />
      ) : error ? (
        <ErrorCard
          error={error}
          onRetry={() => {
            status.refetch();
            dash.refetch();
            analytics.refetch();
          }}
        />
      ) : (
        <ReportBody status={status.data!} d={dash.data!} a={analytics.data!} />
      )}
    </AppShell>
  );
}

function ReportBody({
  status,
  d,
  a,
}: {
  status: ReportStatus;
  d: DashboardView;
  a: AnalyticsView;
}) {
  const [copied, setCopied] = useState(false);
  const download = useMutation({
    mutationFn: api.downloadReport,
    onSuccess: ({ blob, filename }) => saveBlob(blob, filename),
  });
  const today = new Date().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const summary = `Career Readiness Report — ${d.user.name}
Recommended career: ${d.selected_career ?? "—"}
Readiness: ${Math.round(d.overall_readiness)} / 100
Skills: ${d.skill_counts.matched} matched, ${d.skill_counts.missing} missing, ${d.skill_counts.extra} extra`;
  const share = async () => {
    try {
      if (navigator.share)
        await navigator.share({ title: "Career Readiness Report", text: summary });
      else {
        await navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 max-w-7xl">
      {/* Preview */}
      <div className="rounded-2xl border border-border bg-card p-2 shadow-elevated">
        <div className="rounded-xl bg-gradient-surface p-8 border border-border">
          <div className="flex items-center justify-between border-b border-border pb-5">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Career Readiness Report
              </div>
              <h2 className="font-display text-2xl font-bold mt-1">{d.user.name}</h2>
              <p className="text-xs text-muted-foreground">
                {d.user.email} · {today}
              </p>
            </div>
            <Award className="h-10 w-10 text-secondary" />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <ReportStat label="Recommended" value={d.selected_career ?? "—"} tint="primary" />
            <ReportStat
              label="Readiness"
              value={`${Math.round(d.overall_readiness)} / 100`}
              tint="success"
            />
            <ReportStat
              label="Match"
              value={d.career_confidence != null ? `${Math.round(d.career_confidence)}%` : "—"}
              tint="secondary"
            />
          </div>

          <Block title="Skill Gap Summary" icon={Target}>
            <div className="grid grid-cols-3 gap-3 text-center">
              <Mini value={`${d.skill_counts.matched}`} label="Matched" tint="text-success" />
              <Mini value={`${d.skill_counts.missing}`} label="Missing" tint="text-warning" />
              <Mini value={`${d.skill_counts.extra}`} label="Extra" tint="text-accent" />
            </div>
          </Block>

          <Block
            title={d.roadmap ? `${d.roadmap.duration_months}-Month Roadmap` : "Roadmap"}
            icon={Map}
          >
            {d.milestones.length === 0 && (
              <p className="text-sm text-muted-foreground">Not generated yet.</p>
            )}
            <ol className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              {d.milestones
                .map((m) => `${m.month} · ${m.title.split(":")[0]}`)
                .map((t) => (
                  <li key={t} className="rounded-lg border border-border bg-card px-3 py-2">
                    {t}
                  </li>
                ))}
            </ol>
          </Block>

          <Block title="AI Insights" icon={Sparkles}>
            <ul className="text-sm text-muted-foreground space-y-1">
              {a.insights.slice(0, 3).map((t) => (
                <li key={t}>• {t}</li>
              ))}
            </ul>
          </Block>

          <div className="mt-8 pt-5 border-t border-border text-[10px] uppercase tracking-widest text-muted-foreground flex justify-between">
            <span>CareerForge AI</span>
            <span>Preview</span>
          </div>
        </div>
      </div>

      {/* Side */}
      <div className="space-y-4">
        <div className="rounded-2xl bg-gradient-hero text-primary-foreground p-6 shadow-elevated">
          <FileText className="h-6 w-6" />
          <h3 className="font-display text-2xl font-bold mt-3">
            {status.ready ? "Your career report is ready" : "Almost there"}
          </h3>
          <p className="text-sm opacity-90 mt-1">
            {status.ready
              ? "PDF · built from your latest saved data"
              : "Cannot generate report until all sections are complete."}
          </p>
          {!status.ready && (
            <ul className="mt-3 space-y-1 text-sm">
              {status.missing.map((m) => (
                <li key={m}>• {m}</li>
              ))}
            </ul>
          )}
          <button
            onClick={() => download.mutate()}
            disabled={!status.ready || download.isPending}
            className="mt-5 w-full inline-flex justify-center items-center gap-2 rounded-xl bg-card text-foreground px-4 py-3 text-sm font-semibold hover:opacity-95 disabled:opacity-60"
          >
            {download.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}{" "}
            Download PDF
          </button>
          {!status.ready && d.workflow.next_step && (
            <Link
              to={
                {
                  profile: "/profile",
                  resume: "/resume",
                  career: "/career",
                  skill_gap: "/skills",
                  roadmap: "/roadmap",
                }[d.workflow.next_step]
              }
              className="mt-2 block text-center text-xs font-semibold underline opacity-90"
            >
              Go to the next step
            </Link>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={share}
              className="inline-flex justify-center items-center gap-2 rounded-xl bg-card/15 border border-card/20 px-3 py-2 text-xs font-semibold backdrop-blur-sm hover:bg-card/25"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}{" "}
              {copied ? "Copied" : "Share summary"}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex justify-center items-center gap-2 rounded-xl bg-card/15 border border-card/20 px-3 py-2 text-xs font-semibold backdrop-blur-sm hover:bg-card/25"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display font-bold">What's inside</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              "Profile summary",
              "Resume analysis",
              "Career recommendation & selection",
              "Skill gap analysis",
              "Personalized roadmap",
              "Recommended projects & certifications",
              "Analytics summary & conclusion",
            ].map((s) => (
              <li key={s} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" /> {s}
              </li>
            ))}
          </ul>
          <FormErrors error={download.error} />
        </div>
      </div>
    </div>
  );
}

function ReportStat({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint: "primary" | "success" | "secondary";
}) {
  const map = {
    primary: "border-primary/30 bg-primary/5",
    success: "border-success/30 bg-success/5",
    secondary: "border-secondary/30 bg-secondary/5",
  };
  return (
    <div className={`rounded-xl border ${map[tint]} p-4`}>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display font-bold mt-1">{value}</div>
    </div>
  );
}

function Block({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-display font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Mini({ value, label, tint }: { value: string; label: string; tint: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className={`font-display text-2xl font-extrabold ${tint}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
