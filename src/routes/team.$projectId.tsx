import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Lightbulb, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/layouts/AppLayout";
import { AIProcessing } from "@/components/AIProcessing";
import { TeamMemberCard } from "@/components/TeamMemberCard";
import { SkillGapCard } from "@/components/SkillGapCard";
import { CompatibilityScore } from "@/components/CompatibilityScore";
import { CompatibilityRadar } from "@/components/charts/CompatibilityRadar";
import { RoadmapTimeline } from "@/components/RoadmapTimeline";
import { RoadmapKanban } from "@/components/RoadmapKanban";
import { TeamVariants } from "@/components/TeamVariants";
import { CompatibilityNetwork } from "@/components/CompatibilityNetwork";
import { RiskPanel } from "@/components/RiskPanel";
import { TaskBoard } from "@/components/TaskBoard";
import { ExportMenu } from "@/components/ExportMenu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/hooks/useAppStore";
import { buildTeamFn } from "@/services/ai.functions";
import type { TeamVariant } from "@/types";

export const Route = createFileRoute("/team/$projectId")({
  head: () => ({
    meta: [
      { title: "AI Team Builder — TeamForge AI" },
      {
        name: "description",
        content:
          "Forge the optimal team, review the compatibility breakdown, close skill gaps and follow the generated project roadmap.",
      },
      { property: "og:title", content: "AI Team Builder — TeamForge AI" },
      {
        property: "og:description",
        content: "Team composition, compatibility analysis, learning paths and a six-phase roadmap.",
      },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { projectId } = useParams({ from: "/team/$projectId" });
  const {
    projects,
    candidates,
    results,
    saveResult,
    setTaskStatus,
    setBoardTaskStatus,
    toggleRiskResolved,
    mode,
    hydrated,
  } = useAppStore();
  const project = projects.find((p) => p.id === projectId);
  const result = results[projectId];
  const [building, setBuilding] = useState(false);

  if (!hydrated) return <AppLayout title="Loading team…">{null}</AppLayout>;

  if (!project) {
    return (
      <AppLayout title="Project not found" description="This project no longer exists.">
        <Button asChild>
          <Link to="/projects">Back to projects</Link>
        </Button>
      </AppLayout>
    );
  }

  const run = async (variantId: TeamVariant["id"] = "balanced") => {
    setBuilding(true);
    try {
      const built = await buildTeamFn({ data: { project, candidates, mode, variantId } });
      saveResult(built);
      toast.success(
        built.source === "live-ai" ? "Team forged with live AI" : "Team forged with demo intelligence",
      );
    } catch {
      toast.error("Team build failed. Please try again.");
    } finally {
      setBuilding(false);
    }
  };

  return (
    <AppLayout
      title={project.name}
      description={project.description}
      actions={
        <>
          {result ? <ExportMenu project={project} result={result} /> : null}
          <Button
            onClick={() => run(result?.variantId ?? "balanced")}
            disabled={building}
            variant={result ? "secondary" : "default"}
          >
            {result ? <RefreshCw className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
            {result ? "Rebuild team" : "Build optimal team"}
          </Button>
        </>
      }
    >
      {building ? (
        <AIProcessing onComplete={() => undefined} />
      ) : !result ? (
        <Card className="glass items-center gap-3 p-12 text-center">
          <p className="font-medium">No team forged yet</p>
          <p className="max-w-md text-sm text-muted-foreground">
            TeamForge will match {candidates.length} candidates against {project.requiredSkills.length}{" "}
            required skills and produce a {project.teamSize}-person team.
          </p>
          <Button onClick={() => run()}>
            <Zap className="h-4 w-4" /> Build optimal team
          </Button>
        </Card>
      ) : (
        <Tabs defaultValue="team">
          <TabsList className="flex w-full flex-wrap justify-start gap-1 sm:w-auto">
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.members.map((m, i) => (
              <TeamMemberCard key={m.candidateId} member={m} index={i} />
            ))}
          </TabsContent>

          <TabsContent value="options" className="mt-6 space-y-4">
            <Card className="glass gap-2 p-6">
              <h2 className="font-semibold">How this team was chosen</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{result.explanation}</p>
            </Card>
            <TeamVariants
              variants={result.variants}
              activeId={result.variantId}
              onSelect={(id) => run(id)}
            />
          </TabsContent>

          <TabsContent value="analysis" className="mt-6 space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="glass items-center justify-center gap-3 p-6">
                <CompatibilityScore score={result.teamScore} size={150} />
                <p className="text-sm text-muted-foreground">Overall compatibility</p>
              </Card>
              <Card className="glass gap-2 p-6 lg:col-span-2">
                <h2 className="font-semibold">Compatibility breakdown</h2>
                <CompatibilityRadar breakdown={result.breakdown} />
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <InsightList title="Strengths" icon={CheckCircle2} items={result.strengths} />
              <InsightList title="Risks" icon={AlertTriangle} items={result.risks} />
              <InsightList title="Recommendations" icon={Lightbulb} items={result.recommendations} />
            </div>

            <div>
              <h2 className="mb-3 font-semibold">Skill gaps</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.skillGaps.map((g, i) => (
                  <SkillGapCard key={g.skill} gap={g} index={i} />
                ))}
              </div>
            </div>

            <CompatibilityNetwork members={result.members} pairs={result.pairs} />
          </TabsContent>

          <TabsContent value="learning" className="mt-6 grid gap-4 lg:grid-cols-2">
            {result.learningPaths.map((path) => (
              <Card key={path.skill} className="glass gap-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{path.skill}</h3>
                    <p className="text-sm text-muted-foreground">Owner: {path.assignedTo}</p>
                  </div>
                  <span className="rounded-xl border border-border bg-secondary/50 px-3 py-1 text-xs">
                    {path.totalHours}h
                  </span>
                </div>
                <Progress value={0} className="h-1.5" />
                <ol className="space-y-3">
                  {path.steps.map((s, i) => (
                    <li key={s.title} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">
                          {s.title} <span className="text-muted-foreground">· {s.hours}h</span>
                        </p>
                        <p className="text-sm text-muted-foreground">{s.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="roadmap" className="mt-6">
            <Tabs defaultValue="timeline">
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline" className="mt-6">
                <RoadmapTimeline
                  phases={result.roadmap}
                  onAdvance={(taskId, status) => setTaskStatus(projectId, taskId, status)}
                />
              </TabsContent>
              <TabsContent value="kanban" className="mt-6">
                <RoadmapKanban
                  phases={result.roadmap}
                  onMove={(taskId, status) => setTaskStatus(projectId, taskId, status)}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <TaskBoard
              tasks={result.tasks}
              onMove={(taskId, status) => setBoardTaskStatus(projectId, taskId, status)}
            />
          </TabsContent>

          <TabsContent value="risks" className="mt-6">
            <RiskPanel risks={result.projectRisks} onToggle={(id) => toggleRiskResolved(projectId, id)} />
          </TabsContent>
        </Tabs>
      )}
    </AppLayout>
  );
}

function InsightList({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: typeof CheckCircle2;
  items: string[];
}) {
  return (
    <Card className="glass gap-3 p-6">
      <h3 className="flex items-center gap-2 font-semibold">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((t) => (
          <li key={t} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {t}
          </li>
        ))}
      </ul>
    </Card>
  );
}