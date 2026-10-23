import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { ErrorCard, FormErrors, LoadingCard } from "@/components/ApiState";
import {
  Sparkles,
  Check,
  ChevronDown,
  Brain,
  Target,
  TrendingUp,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api, type CareerView } from "@/lib/api";
import { ALL_USER_KEYS, qk, useApiQuery } from "@/lib/queries";

export const Route = createFileRoute("/career")({
  head: () => ({ meta: [{ title: "Career Analysis — CareerForge AI" }] }),
  component: Career,
});

function Career() {
  const q = useApiQuery(qk.career, api.getCareer);
  return (
    <AppShell title="Career Analysis" subtitle="AI-recommended path with hybrid selection">
      {q.isPending ? (
        <LoadingCard />
      ) : q.isError ? (
        <ErrorCard error={q.error} onRetry={() => q.refetch()} />
      ) : (
        <CareerBody v={q.data} />
      )}
    </AppShell>
  );
}

function CareerBody({ v }: { v: CareerView }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const refreshAll = (data: CareerView) => {
    queryClient.setQueryData(qk.career, (prev: CareerView | undefined) => ({
      ...data,
      recommendations: data.recommendations ?? prev?.recommendations ?? null,
    }));
    ALL_USER_KEYS.filter((k) => k !== qk.career).forEach((k) =>
      queryClient.invalidateQueries({ queryKey: k }),
    );
  };
  const generate = useMutation({ mutationFn: api.recommendCareer, onSuccess: refreshAll });
  const confirm = useMutation({
    mutationFn: (body: { use_ai: boolean; career?: string }) => api.selectCareer(body),
    onSuccess: (data) => {
      refreshAll(data);
      navigate({ to: "/skills" });
    },
  });

  const RECOMMENDATIONS = (v.recommendations ?? []).map((r, i) => ({
    t: r.career,
    m: Math.round(r.confidence),
    badge: i === 0 ? "Top match" : r.match_label,
    reasons: i === 0 && v.reason ? [v.reason] : [`${r.match_label}`],
  }));
  if (RECOMMENDATIONS.length === 0 && v.predicted_role) {
    RECOMMENDATIONS.push({
      t: v.predicted_role,
      m: Math.round(v.prediction_confidence ?? 0),
      badge: "Top match",
      reasons: v.reason ? [v.reason] : [],
    });
  }
  const ALL_CAREERS = v.career_options;

  const [mode, setMode] = useState<"ai" | "manual">(
    v.selection_type === "User Selected" && v.selected_role && ALL_CAREERS.includes(v.selected_role)
      ? "manual"
      : "ai",
  );
  const [selected, setSelected] = useState(
    v.selected_role && RECOMMENDATIONS.some((r) => r.t === v.selected_role)
      ? v.selected_role
      : (RECOMMENDATIONS[0]?.t ?? ""),
  );
  const [custom, setCustom] = useState(
    v.selected_role && ALL_CAREERS.includes(v.selected_role) ? v.selected_role : ALL_CAREERS[0],
  );
  useEffect(() => {
    if (!selected && RECOMMENDATIONS[0]) setSelected(RECOMMENDATIONS[0].t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [RECOMMENDATIONS[0]?.t]);
  const final = mode === "ai" ? selected : custom;
  const confidence = Math.round(v.prediction_confidence ?? 0);

  const onConfirm = () => {
    if (mode === "ai" && final === v.predicted_role) confirm.mutate({ use_ai: true });
    else confirm.mutate({ use_ai: false, career: final });
  };

  if (!v.predicted_role) {
    return (
      <div className="max-w-7xl space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-hero text-primary-foreground p-8 shadow-elevated">
          <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-card/15 border border-card/20 backdrop-blur-sm px-3 py-1 text-xs">
              <Brain className="h-3.5 w-3.5" /> Powered by Scikit-Learn
            </div>
            <h2 className="mt-4 font-display text-4xl font-extrabold">
              Ready to discover your ideal career?
            </h2>
            <p className="mt-3 max-w-lg opacity-90">
              Our AI will analyze your profile and resume to recommend the best career paths.
            </p>
            <button
              onClick={() => generate.mutate()}
              disabled={generate.isPending}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-card text-foreground px-5 py-3 text-sm font-semibold hover:opacity-95 disabled:opacity-60"
            >
              {generate.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}{" "}
              Generate AI Recommendations
            </button>
          </div>
        </div>
        <FormErrors error={generate.error} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-6">
      {/* Top AI hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-hero text-primary-foreground p-8 shadow-elevated">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <div className="relative grid md:grid-cols-[1.5fr_1fr] gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-card/15 border border-card/20 backdrop-blur-sm px-3 py-1 text-xs">
              <Brain className="h-3.5 w-3.5" /> Powered by Scikit-Learn
            </div>
            <button
              onClick={() => generate.mutate()}
              disabled={generate.isPending}
              className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-card/15 border border-card/20 backdrop-blur-sm px-3 py-1 text-xs hover:bg-card/25 disabled:opacity-60"
            >
              {generate.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}{" "}
              Re-run
            </button>
            <div className="mt-4 text-xs uppercase tracking-widest opacity-80">
              AI Recommended Career
            </div>
            <h2 className="mt-1 font-display text-5xl font-extrabold">{v.predicted_role}</h2>
            <p className="mt-3 max-w-lg opacity-90">
              Based on your resume, academic profile and interest domains, this career path aligns
              most strongly with your existing strengths.
            </p>
          </div>
          <div className="rounded-2xl bg-card/10 backdrop-blur-md border border-card/20 p-6 text-center">
            <div className="text-xs uppercase tracking-widest opacity-80">Confidence</div>
            <div className="mt-2 font-display text-6xl font-extrabold">
              {confidence}
              <span className="text-3xl opacity-80">%</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-card text-foreground px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3 w-3" />{" "}
              {confidence >= 80
                ? "Excellent Match"
                : confidence >= 60
                  ? "Good Match"
                  : "Potential Match"}
            </div>
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            i: Target,
            t: "Why this match",
            d: v.reason ?? "Recommendation based on your profile and resume skills.",
          },
          {
            i: TrendingUp,
            t: "Career category",
            d: `${v.career_category ?? "—"} — category of your final selected career.`,
          },
          {
            i: Brain,
            t: "Current selection",
            d: `${v.final_selected_role ?? "—"} · ${v.selection_type ?? ""}`,
          },
        ].map((r) => {
          const Icon = r.i;
          return (
            <div key={r.t} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-semibold">{r.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{r.d}</p>
            </div>
          );
        })}
      </div>

      {/* Hybrid selection */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div>
          <h3 className="font-display text-xl font-bold">Choose your career path</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Trust the AI or override with your own choice.
          </p>
        </div>

        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          <button
            onClick={() => setMode("ai")}
            className={`text-left rounded-2xl border-2 p-5 transition ${mode === "ai" ? "border-primary bg-primary/5" : "border-border bg-surface hover:border-primary/40"}`}
          >
            <div className="flex items-center justify-between">
              <Sparkles className="h-5 w-5 text-primary" />
              {mode === "ai" && (
                <div className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
            <div className="mt-3 font-semibold">Use AI Recommendation</div>
            <div className="text-xs text-muted-foreground mt-1">Optimal data-driven match.</div>
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`text-left rounded-2xl border-2 p-5 transition ${mode === "manual" ? "border-secondary bg-secondary/5" : "border-border bg-surface hover:border-secondary/40"}`}
          >
            <div className="flex items-center justify-between">
              <Target className="h-5 w-5 text-secondary" />
              {mode === "manual" && (
                <div className="grid h-6 w-6 place-items-center rounded-full bg-secondary text-secondary-foreground">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
            <div className="mt-3 font-semibold">Choose My Own Career</div>
            <div className="text-xs text-muted-foreground mt-1">
              Override based on your interests.
            </div>
          </button>
        </div>

        {mode === "ai" ? (
          <div className="mt-6 space-y-3">
            {RECOMMENDATIONS.map((r) => (
              <button
                key={r.t}
                onClick={() => setSelected(r.t)}
                className={`w-full text-left flex items-center gap-4 rounded-xl border p-4 transition ${selected === r.t ? "border-primary bg-primary/5" : "border-border bg-surface hover:border-primary/40"}`}
              >
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${selected === r.t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {selected === r.t ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{r.t}</div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-secondary">
                      {r.badge}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {r.reasons.map((x) => (
                      <span key={x} className="text-xs text-muted-foreground">
                        · {x}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl font-bold">{r.m}%</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    match
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Select a career
            </label>
            <div className="relative mt-2">
              <select
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-surface px-4 py-3 pr-10 font-semibold focus:border-primary outline-none"
              >
                {ALL_CAREERS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-surface border border-border p-5">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Final selected career
            </div>
            <div className="mt-1 font-display text-2xl font-bold">{final}</div>
          </div>
          <button
            onClick={onConfirm}
            disabled={confirm.isPending || !final}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95 disabled:opacity-60"
          >
            {confirm.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Confirm &amp;
            continue to Skill Gap <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 space-y-2">
          <FormErrors error={confirm.error || generate.error} />
        </div>
      </div>
    </div>
  );
}
