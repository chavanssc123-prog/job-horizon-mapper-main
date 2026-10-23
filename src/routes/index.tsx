import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  FileText,
  Target,
  Map,
  BarChart3,
  GraduationCap,
  CheckCircle2,
  Play,
  Upload,
  Brain,
  TrendingUp,
  Award,
  Users,
  Star,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerForge AI — Build Your Career Roadmap with AI" },
      {
        name: "description",
        content:
          "Analyze your resume, identify skill gaps, get AI career recommendations and a personalized 6-month learning roadmap.",
      },
      { property: "og:title", content: "CareerForge AI" },
      {
        property: "og:description",
        content: "AI-powered career readiness and skill gap analyzer.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              CareerForge<span className="text-primary">.</span>AI
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#how" className="hover:text-foreground transition">
              How it works
            </a>
            <a href="#benefits" className="hover:text-foreground transition">
              Benefits
            </a>
            <a href="#metrics" className="hover:text-foreground transition">
              Outcomes
            </a>
            <Link to="/dashboard" className="hover:text-foreground transition">
              Dashboard
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              search={{ mode: "register" }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-soft"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-mesh">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
                <Sparkles className="h-3.5 w-3.5 text-secondary" />
                Powered by AI · Scikit-Learn models trained on 50k+ careers
              </div>
              <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
                Build Your{" "}
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  Career Roadmap
                </span>{" "}
                with AI
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
                Analyze your resume. Identify skill gaps. Get personalized career recommendations
                and a month-by-month learning roadmap — built for the next generation of
                professionals.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/login"
                  search={{ mode: "register" }}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition"
                >
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/resume"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-muted transition"
                >
                  <Upload className="h-4 w-4" /> Upload Resume
                </Link>
                <button className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted transition">
                  <Play className="h-4 w-4 text-primary" /> Watch Demo
                </button>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" /> Free for students
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" /> No credit card
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" /> PDF report included
                </div>
              </div>
            </div>

            {/* Hero preview card */}
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-hero opacity-20 blur-3xl rounded-3xl" />
              <div className="relative rounded-3xl border border-border bg-card shadow-elevated overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-surface">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    Career Readiness · Live Preview
                  </span>
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">
                        AI Recommended Career
                      </div>
                      <div className="mt-1 font-display text-2xl font-bold">Data Scientist</div>
                    </div>
                    <div className="rounded-full bg-success/10 text-success px-3 py-1 text-xs font-semibold">
                      94% match
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Readiness score</span>
                      <span className="font-semibold">78 / 100</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[78%] bg-gradient-primary rounded-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { l: "Matched", v: 18, c: "text-success" },
                      { l: "Missing", v: 6, c: "text-warning" },
                      { l: "Extra", v: 4, c: "text-accent" },
                    ].map((s) => (
                      <div key={s.l} className="rounded-xl border border-border bg-surface p-3">
                        <div className={`text-2xl font-bold ${s.c}`}>{s.v}</div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          {s.l} skills
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-surface border border-border p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Map className="h-3.5 w-3.5" /> 6-month roadmap
                    </div>
                    <div className="mt-3 flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5, 6].map((m, i) => (
                        <div key={m} className="flex-1">
                          <div
                            className={`h-1.5 rounded-full ${i < 2 ? "bg-success" : i < 4 ? "bg-primary" : "bg-muted"}`}
                          />
                          <div className="mt-1 text-[10px] text-muted-foreground text-center">
                            M{m}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 bg-surface border-y border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">
              How it works
            </div>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">
              From resume to roadmap in minutes
            </h2>
            <p className="mt-3 text-muted-foreground">
              Seven AI-guided steps designed for students, freshers, and career switchers.
            </p>
          </div>

          <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: GraduationCap, t: "Profile", d: "Academic & interest profile." },
              { icon: Upload, t: "Resume Upload", d: "Drag-and-drop resume parsing." },
              { icon: Brain, t: "AI Analysis", d: "Extract skills, projects, education." },
              { icon: Sparkles, t: "Career Match", d: "AI-recommended career path." },
              { icon: Target, t: "Skill Gap", d: "Matched, missing & extra skills." },
              { icon: Map, t: "Roadmap", d: "6-month milestone plan." },
              { icon: BarChart3, t: "Analytics", d: "Track readiness trends." },
              { icon: FileText, t: "Career Report", d: "Premium PDF download." },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <li
                  key={s.t}
                  className="group relative rounded-2xl border border-border bg-card p-6 hover:shadow-card hover:-translate-y-0.5 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">0{i + 1}</span>
                  </div>
                  <div className="mt-4 font-display font-semibold">{s.t}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-24">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-secondary">
              Why CareerForge
            </div>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">
              Built for the next generation of professionals
            </h2>
            <p className="mt-4 text-muted-foreground">
              Replace guesswork with measurable career intelligence. Trained on real industry data
              and tailored to your goals.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: Brain,
                t: "AI Resume Parsing",
                d: "Extract skills, projects, and certificates with NLP.",
              },
              {
                icon: Target,
                t: "Hybrid Recommendation",
                d: "Pick AI's suggestion or set your own career.",
              },
              {
                icon: TrendingUp,
                t: "Readiness Score",
                d: "Quantify exactly how job-ready you are today.",
              },
              {
                icon: Award,
                t: "Premium PDF Report",
                d: "Share-ready career portfolio in one click.",
              },
            ].map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.t} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/15 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 font-semibold">{b.t}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{b.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section
        id="metrics"
        className="py-20 bg-gradient-hero text-primary-foreground relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { v: "50k+", l: "Resumes analyzed", icon: FileText },
              { v: "120+", l: "Career paths mapped", icon: Map },
              { v: "94%", l: "Avg. recommendation accuracy", icon: Sparkles },
              { v: "4.9/5", l: "Student rating", icon: Star },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.l}
                  className="rounded-2xl bg-card/10 border border-card/20 backdrop-blur-sm p-6"
                >
                  <Icon className="h-5 w-5 opacity-70" />
                  <div className="mt-4 font-display text-4xl font-extrabold">{m.v}</div>
                  <div className="mt-1 text-sm opacity-80">{m.l}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-primary" /> Trusted by students from 200+ campuses
          </div>
          <h2 className="mt-5 font-display text-5xl font-bold tracking-tight">
            Your career, planned by AI.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Start your free career readiness analysis today — your personalized roadmap is minutes
            away.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              search={{ mode: "register" }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-muted transition"
            >
              View Sample Dashboard
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-primary">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span>© 2026 CareerForge AI. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a className="hover:text-foreground transition" href="#">
              Privacy
            </a>
            <a className="hover:text-foreground transition" href="#">
              Terms
            </a>
            <a className="hover:text-foreground transition" href="#">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
