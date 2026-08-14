import { ThemeToggle } from "@/components/ThemeToggle";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BrainCircuit,
  GitBranch,
  Gauge,
  Layers,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { CompatibilityScore } from "@/components/CompatibilityScore";
import { InitialsAvatar } from "@/components/Avatar";
import { SkillBadge } from "@/components/SkillBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useReveal } from "@/hooks/useReveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TeamForge AI — Build better teams before the project begins" },
      {
        name: "description",
        content:
          "TeamForge AI analyses candidate skills, builds balanced teams, detects skill gaps and generates a project roadmap in minutes.",
      },
      { property: "og:title", content: "TeamForge AI — Build better teams" },
      {
        property: "og:description",
        content:
          "AI-powered team formation, skill-gap intelligence and project roadmaps for hackathon and startup teams.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  { icon: Users, title: "Add candidates", text: "Paste a resume or add a profile. Skills and roles are extracted automatically." },
  { icon: Target, title: "Define the project", text: "Scope, duration, team size and the skills the project actually needs." },
  { icon: BrainCircuit, title: "Forge the team", text: "The engine balances coverage, roles, seniority and availability." },
  { icon: GitBranch, title: "Plan the delivery", text: "Get gaps, learning paths and a phase-by-phase roadmap with owners." },
];

const features = [
  { icon: Gauge, title: "Compatibility scoring", text: "A 5-factor score covering skills, roles, experience mix, alignment and collaboration." },
  { icon: Layers, title: "Skill-gap intelligence", text: "Severity-ranked gaps with the reason they matter for this exact project." },
  { icon: BrainCircuit, title: "Learning paths", text: "Step-by-step upskilling plans with hours and an assigned owner." },
  { icon: GitBranch, title: "AI roadmap", text: "Six phases, tasks, dependencies and owners in timeline or kanban view." },
  { icon: ShieldCheck, title: "Keys stay server-side", text: "Every AI request runs through a secure server function. Nothing leaks to the browser." },
  { icon: Sparkles, title: "Works offline", text: "Demo mode ships realistic intelligence so the product never shows an empty screen." },
];

function Landing() {
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <div ref={revealRef} className="min-h-screen overflow-x-hidden bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-primary/30 bg-primary/10 p-1.5 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight">TeamForge AI</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/projects/new">Build your team</Link>
            </Button>
          </div>
        </div>
      </header>

      <section
        className="relative overflow-hidden px-4 pb-20 pt-20 sm:px-6"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 grid-fade" />
        <div
          aria-hidden
          className="aurora-blob -left-24 top-[-6rem] h-[26rem] w-[26rem] bg-primary/50"
        />
        <div
          aria-hidden
          className="aurora-blob right-[-8rem] top-24 h-[22rem] w-[22rem] bg-accent/40"
          style={{ animationDelay: "-6s" }}
        />
        <div
          aria-hidden
          className="aurora-blob bottom-[-10rem] left-1/3 h-[24rem] w-[24rem] bg-chart-2/40"
          style={{ animationDelay: "-12s" }}
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-secondary/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                AI team formation for builders
              </span>
              <h1 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">
                {"TEAMFORGE".split("").map((c, i) => (
                  <span
                    key={`${c}-${i}`}
                    className="inline-block animate-rise"
                    style={{ animationDelay: `${80 + i * 45}ms` }}
                  >
                    {c}
                  </span>
                ))}{" "}
                <span
                  className="inline-block animate-rise text-shimmer"
                  style={{ animationDelay: "560ms" }}
                >
                  AI
                </span>
              </h1>
              <p
                className="mt-4 animate-rise text-xl text-foreground/90 sm:text-2xl"
                style={{ animationDelay: "640ms" }}
              >
                Build better teams. Before the project begins.
              </p>
              <p
                className="mt-4 max-w-lg animate-rise text-base text-muted-foreground"
                style={{ animationDelay: "720ms" }}
              >
                AI-powered team formation, skill-gap intelligence and project planning.
              </p>
              <div
                className="mt-8 flex animate-rise flex-wrap gap-3"
                style={{ animationDelay: "800ms" }}
              >
                <Button asChild size="lg">
                  <Link to="/projects/new">
                    Build Your Team
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to="/team/$projectId" params={{ projectId: "p1" }}>
                    Explore Demo
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div
                aria-hidden
                className="animate-orbit pointer-events-none absolute -inset-6 rounded-[3rem] border border-dashed border-primary/25"
              />
              <div className="animate-float">
                <HeroPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      <SkillMarquee />

      <Section title="How it works" subtitle="Four steps from a pile of resumes to a delivery plan.">
        <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Card
              key={s.title}
              className="glass tilt-hover reveal group relative h-full gap-3 overflow-hidden p-6"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 md:opacity-0"
              />
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/10 text-primary transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                  <s.icon className="h-4 w-4" />
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  Step {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.text}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Features" subtitle="Everything a team lead needs before day one.">
        <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Card
              key={f.title}
              className="glass tilt-hover reveal group h-full gap-3 p-6"
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                <f.icon className="h-4 w-4" />
              </span>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.text}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Why TeamForge" subtitle="Most teams form by who is available. That is why they stall.">
        <div className="grid items-stretch gap-4 md:grid-cols-3">
          {[
            ["68%", "of student projects stall on a skill nobody owns", "TeamForge surfaces that gap on day zero, not week six."],
            ["5 factors", "behind every compatibility score", "Coverage, role balance, experience mix, alignment, collaboration."],
            ["Minutes", "from candidate list to roadmap", "Team, gaps, learning plan and phased delivery in a single flow."],
          ].map(([stat, label, text], i) => (
            <Card
              key={stat}
              className="glass card-hover reveal h-full gap-2 p-6"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <p className="text-4xl font-semibold text-shimmer">{stat}</p>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-sm text-muted-foreground">{text}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Example workflow" subtitle="The exact path an AI Waste Management Platform team takes.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Create the project and list required skills",
            "Shortlist candidates from the talent pool",
            "Run the AI team builder",
            "Review the 93/100 compatibility breakdown",
            "Close the DevOps gap with a learning path",
            "Generate and track the six-phase roadmap",
          ].map((step, i) => (
            <div
              key={step}
              className="reveal group flex items-center gap-3 rounded-2xl border border-border bg-secondary/30 p-4 transition-colors hover:border-primary/40 hover:bg-secondary/60"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary transition-transform duration-300 group-hover:scale-110">
                {i + 1}
              </span>
              <p className="text-sm">{step}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="relative px-4 pb-24 sm:px-6">
        <div
          aria-hidden
          className="aurora-blob left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 bg-primary/30"
        />
        <Card className="glass reveal relative mx-auto max-w-5xl items-center gap-4 overflow-hidden p-10 text-center">
          <div aria-hidden className="pointer-events-none absolute inset-0 grid-fade opacity-60" />
          <h2 className="text-3xl font-semibold tracking-tight">Forge your first team tonight</h2>
          <p className="max-w-xl text-muted-foreground">
            Ten demo candidates and two projects are preloaded, so you can run the entire flow
            without uploading a single file.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/dashboard">
                Open dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/candidates">Browse candidates</Link>
            </Button>
          </div>
        </Card>
      </section>

      <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
        TeamForge AI — Build better teams. Before the project begins.
      </footer>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="reveal">
          <span className="inline-block h-1 w-12 rounded-full bg-[image:var(--gradient-brand)]" />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

const marqueeSkills = [
  "React",
  "TypeScript",
  "Machine Learning",
  "Product Design",
  "DevOps",
  "Data Engineering",
  "Cloud",
  "Rust",
  "Prompt Engineering",
  "UX Research",
  "Kubernetes",
  "Computer Vision",
];

function SkillMarquee() {
  return (
    <div className="relative overflow-hidden border-y border-border bg-secondary/25 py-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent"
      />
      <div className="marquee-track gap-3">
        {[...marqueeSkills, ...marqueeSkills].map((skill, i) => (
          <span
            key={`${skill}-${i}`}
            className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-sm text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function HeroPreview() {
  const members = [
    { name: "Rahul Menon", role: "Backend Engineer", score: 89 },
    { name: "Ananya Sharma", role: "Frontend Engineer", score: 92 },
    { name: "Diego Ramirez", role: "ML Engineer", score: 87 },
  ];
  const coverage = [
    ["React", 100],
    ["Machine Learning", 90],
    ["Cloud", 62],
    ["DevOps", 24],
  ] as const;

  return (
    <Card className="glass animate-rise gap-6 p-6 shadow-[var(--shadow-elevated)]">
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <CompatibilityScore score={93} size={132} />
        <div className="w-full space-y-3">
          {members.map((m) => (
            <div key={m.name} className="flex items-center gap-3">
              <InitialsAvatar name={m.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.role}</p>
              </div>
              <span className="text-sm font-semibold text-primary">{m.score}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Skill coverage</p>
        {coverage.map(([skill, value]) => (
          <div key={skill} className="flex items-center gap-3">
            <span className="w-32 shrink-0 text-xs text-muted-foreground">{skill}</span>
            <Progress value={value} className="h-1.5" />
            <span className="w-9 text-right text-xs">{value}%</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-secondary/40 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          AI recommendation
        </p>
        <p className="mt-2 text-sm">
          Close the DevOps gap in week one — Docker plus CI/CD unblocks phases 5 and 6.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <SkillBadge skill="DevOps · high" active />
          <SkillBadge skill="Cloud · medium" />
        </div>
      </div>
    </Card>
  );
}
