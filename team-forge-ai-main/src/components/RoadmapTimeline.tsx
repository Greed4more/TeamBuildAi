import { CircleDashed, CircleDot, CheckCircle2, Link2, Clock, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RoadmapPhase, TaskStatus } from "@/types";

const statusMeta: Record<TaskStatus, { label: string; Icon: typeof CircleDot; cls: string }> = {
  todo: { label: "To do", Icon: CircleDashed, cls: "text-muted-foreground" },
  "in-progress": { label: "In progress", Icon: CircleDot, cls: "text-warning" },
  done: { label: "Done", Icon: CheckCircle2, cls: "text-success" },
};

const nextStatus: Record<TaskStatus, TaskStatus> = {
  todo: "in-progress",
  "in-progress": "done",
  done: "todo",
};

export function RoadmapTimeline({
  phases,
  onAdvance,
}: {
  phases: RoadmapPhase[];
  onAdvance: (taskId: string, status: TaskStatus) => void;
}) {
  return (
    <div className="relative space-y-8 before:absolute before:left-4 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border md:before:left-6">
      {phases.map((phase, i) => (
        <div key={phase.phase} className="relative pl-12 md:pl-16 animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
          <span className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-xs font-semibold text-primary md:h-12 md:w-12 md:text-sm">
            {phase.phase}
          </span>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Phase {phase.phase}
          </p>
          <h3 className="text-lg font-semibold">{phase.title}</h3>
          <p className="mb-4 text-sm text-muted-foreground">{phase.summary}</p>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {phase.tasks.map((task) => {
              const { Icon, label, cls } = statusMeta[task.status];
              return (
                <Card key={task.id} className="glass card-hover gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium">{task.title}</h4>
                    <Icon className={`h-4 w-4 shrink-0 ${cls}`} />
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> {task.assignee} · {task.role}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> {task.duration}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Link2 className="h-3.5 w-3.5" />
                      {task.dependencies.length ? task.dependencies.join(", ") : "No dependencies"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onAdvance(task.id, nextStatus[task.status])}
                  >
                    {label} → {statusMeta[nextStatus[task.status]].label}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}