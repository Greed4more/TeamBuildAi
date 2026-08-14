import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { SkillBadge } from "@/components/SkillBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/hooks/useAppStore";
import type { Project, TeamResult } from "@/types";

export function ProjectCard({
  project,
  result,
  index = 0,
}: {
  project: Project;
  result?: TeamResult | undefined;
  index?: number | undefined;
}) {
  const { removeProject } = useAppStore();

  return (
    <Card
      className="glass card-hover animate-rise gap-4 p-5"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{project.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {result ? (
            <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-center">
              <p className="text-sm font-semibold text-primary">{result.teamScore}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">score</p>
            </div>
          ) : null}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove project ${project.name}`}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove “{project.name}”?</AlertDialogTitle>
                <AlertDialogDescription>
                  This deletes the project and any forged team, analysis and roadmap saved with it.
                  This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    removeProject(project.id);
                    toast.success(`Removed ${project.name}`);
                  }}
                >
                  Remove project
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {project.requiredSkills.slice(0, 5).map((s) => (
          <SkillBadge key={s} skill={s} />
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" /> {project.teamSize} members
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5" /> {project.durationWeeks} weeks
        </span>
      </div>

      <Button asChild variant={result ? "secondary" : "default"} className="w-full">
        <Link to="/team/$projectId" params={{ projectId: project.id }}>
          {result ? "View team" : "Build optimal team"} <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </Card>
  );
}