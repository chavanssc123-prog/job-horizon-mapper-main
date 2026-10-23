import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ErrorCard, FormErrors, LoadingCard } from "@/components/ApiState";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  Briefcase,
  GraduationCap,
  Award,
  Code2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { api, ApiError, timeAgo, type ResumeView } from "@/lib/api";
import { ALL_USER_KEYS, qk, useApiQuery } from "@/lib/queries";

export const Route = createFileRoute("/resume")({
  head: () => ({ meta: [{ title: "Resume Center — CareerForge AI" }] }),
  component: Resume,
});

const MAX_BYTES = 5 * 1024 * 1024; // utils/resume_utils.MAX_RESUME_SIZE_BYTES

function Resume() {
  const q = useApiQuery(qk.resume, api.getResume);
  return (
    <AppShell title="Resume Center" subtitle="Upload and parse your resume with AI">
      {q.isPending ? (
        <LoadingCard />
      ) : q.isError ? (
        <ErrorCard error={q.error} onRetry={() => q.refetch()} />
      ) : (
        <ResumeBody v={q.data} />
      )}
    </AppShell>
  );
}

function suggestions(v: ResumeView): string[] {
  // Derived from the same four sections calculate_resume_completeness() scores.
  const out: string[] = [];
  if (v.advice) out.push(v.advice);
  if (v.skills.length < 5)
    out.push(
      `Only ${v.skills.length} recognised technical skill(s) — list tools like Python, SQL, AWS, React explicitly.`,
    );
  if (v.projects.length === 0)
    out.push("No projects detected — add a clearly titled “Projects” section.");
  if (v.certifications.length === 0)
    out.push(
      "No certifications detected — phrase them as “Certified in …” or “Certification in …”.",
    );
  if (v.education.length === 0)
    out.push("Degree not detected — mention it as BCA / BSc / BTech / MCA / MSc / MTech.");
  return out;
}

function ResumeBody({ v }: { v: ResumeView }) {
  const queryClient = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [picked, setPicked] = useState<File | null>(null);

  const upload = useMutation({
    mutationFn: (file: File) => api.uploadResume(file),
    onSuccess: (data) => {
      queryClient.setQueryData(qk.resume, data);
      ALL_USER_KEYS.filter((k) => k !== qk.resume).forEach((k) =>
        queryClient.invalidateQueries({ queryKey: k }),
      );
    },
  });

  const handle = (file: File | undefined | null) => {
    setLocalError(null);
    upload.reset();
    if (!file) return;
    // Same checks as app.py, done early for a quicker message; the API re-checks.
    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
      setLocalError("Only PDF files are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError(
        `The uploaded resume exceeds the maximum allowed size of 5 MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
      );
      return;
    }
    setPicked(file);
    upload.mutate(file);
  };

  const counts = [
    { l: "Skills", v: v.skills.length, i: Code2, c: "text-primary bg-primary/10" },
    { l: "Projects", v: v.projects.length, i: Briefcase, c: "text-secondary bg-secondary/10" },
    { l: "Education", v: v.education.length, i: GraduationCap, c: "text-accent bg-accent/15" },
    { l: "Certificates", v: v.certifications.length, i: Award, c: "text-success bg-success/10" },
  ];
  const score = v.completeness;

  return (
    <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6 max-w-7xl">
      <div className="space-y-6">
        {/* Drop zone */}
        <div
          onClick={() => !upload.isPending && input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handle(e.dataTransfer.files?.[0]);
          }}
          className={`rounded-2xl border-2 border-dashed bg-card p-10 text-center hover:border-primary hover:bg-primary/5 transition cursor-pointer ${dragging ? "border-primary bg-primary/5" : "border-border"}`}
        >
          <input
            ref={input}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              handle(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            {upload.isPending ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <UploadCloud className="h-7 w-7" />
            )}
          </div>
          <h3 className="mt-5 font-display text-xl font-bold">
            {upload.isPending ? `Parsing ${picked?.name ?? "resume"}…` : "Drop your resume here"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            PDF up to 5 MB. We'll extract skills, projects, education and certifications
            automatically.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              disabled={upload.isPending}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95 disabled:opacity-60"
            >
              {v.uploaded ? "Update resume" : "Choose file"}
            </button>
          </div>
        </div>

        {(localError || upload.error) && (
          <FormErrors error={localError ? new ApiError(400, localError) : upload.error} />
        )}
        {upload.data?.message && (
          <div className="rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> {upload.data.message}
            </span>
            <Link
              to="/career"
              className="font-semibold hover:underline inline-flex items-center gap-1"
            >
              Next: career analysis <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Uploaded file */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-destructive/10 text-destructive">
              <FileText className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate">
                {v.file_name ?? "No resume uploaded yet"}
              </div>
              <div className="text-xs text-muted-foreground">
                {v.upload_date
                  ? `Uploaded ${timeAgo(v.upload_date)}`
                  : "Drop a PDF to see extracted skills, education, projects and certifications."}
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${v.uploaded ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> {v.uploaded ? "Parsed" : "Waiting"}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {counts.map((s) => {
              const Icon = s.i;
              return (
                <div key={s.l} className="rounded-xl border border-border bg-surface p-3">
                  <div className={`grid h-8 w-8 place-items-center rounded-lg ${s.c}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="mt-2 font-display text-2xl font-bold">{s.v}</div>
                  <div className="text-xs text-muted-foreground">{s.l} extracted</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Extracted detail */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display font-bold mb-4">Extracted skills</h3>
          <div className="flex flex-wrap gap-2">
            {v.skills.length === 0 && (
              <span className="text-sm text-muted-foreground">No skills extracted yet.</span>
            )}
            {v.skills.map((s) => (
              <span
                key={s}
                className="rounded-full bg-primary/10 text-primary px-3 py-1.5 text-sm font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right: AI status */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-hero text-primary-foreground p-6 shadow-elevated">
          <Sparkles className="h-5 w-5" />
          <div className="mt-3 font-display text-2xl font-bold">Resume Score</div>
          <div className="mt-1 text-sm opacity-90">
            Completeness of skills, projects, certifications and education
            {v.status_badge ? ` · ${v.status_badge}` : ""}
          </div>
          <div className="mt-6 flex items-end gap-2">
            <div className="font-display text-6xl font-extrabold">{score}</div>
            <div className="pb-2 opacity-80">/ 100</div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-card/20 overflow-hidden">
            <div className="h-full rounded-full bg-card" style={{ width: `${score}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display font-bold mb-4">AI Suggestions</h3>
          <ul className="space-y-3 text-sm">
            {!v.uploaded && (
              <li className="text-muted-foreground">Upload a resume to get suggestions.</li>
            )}
            {v.uploaded &&
              suggestions(v).map((s) => (
                <li key={s} className="flex gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />
                  {s}
                </li>
              ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display font-bold mb-3">Extracted details</h3>
          {[
            { l: "Education", items: v.education },
            { l: "Projects", items: v.projects },
            { l: "Certifications", items: v.certifications },
          ].map((sec) => (
            <div key={sec.l} className="py-2.5 border-b border-border last:border-0">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{sec.l}</div>
                <span className="text-sm font-semibold">{sec.items.length}</span>
              </div>
              {sec.items.slice(0, 3).map((it) => (
                <div key={it} className="text-xs text-muted-foreground truncate mt-1">
                  • {it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
