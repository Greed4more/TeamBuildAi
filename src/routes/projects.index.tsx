import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AppLayout } from "@/layouts/AppLayout";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/hooks/useAppStore";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — TeamForge AI" },
      {
        name: "description",
        content: "All your projects, their required skills and the compatibility of each forged team.",
      },
      { property: "og:title", content: "Projects — TeamForge AI" },
      {
        property: "og:description",
        content: "Review project scope, team size and build optimal teams with AI.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { projects, results } = useAppStore();

  return (
    <AppLayout
      title="Projects"
      description="Every project in your workspace and the state of its team."
      actions={
        <Button asChild>
          <Link to="/projects/new">
            <Plus className="h-4 w-4" /> New project
          </Link>
        </Button>
      }
    >
      {projects.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} result={results[p.id]} index={i} />
          ))}
        </div>
      ) : (
        <Card className="glass items-center gap-3 p-12 text-center">
          <p className="font-medium">No projects yet</p>
          <Button asChild size="sm">
            <Link to="/projects/new">Create your first project</Link>
          </Button>
        </Card>
      )}
    </AppLayout>
  );
}