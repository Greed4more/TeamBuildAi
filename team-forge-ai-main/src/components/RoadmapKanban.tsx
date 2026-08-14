import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RoadmapPhase, RoadmapTask, TaskStatus } from "@/types";

const columns: Array<{
  status: TaskStatus;
  label: string;
  column: string;
  chip: string;
  card: string;
  dot: string;
}> = [
  {
    status: "todo",
    label: "To do",
    column: "border-status-todo/35 bg-status-todo/8",
    chip: "bg-status-todo/20 text-status-todo",
    card: "border-l-4 border-l-status-todo",
    dot: "bg-status-todo",
  },
  {
    status: "in-progress",
    label: "In progress",
    column: "border-status-progress/35 bg-status-progress/8",
    chip: "bg-status-progress/20 text-status-progress",
    card: "border-l-4 border-l-status-progress",
    dot: "bg-status-progress",
  },
  {
    status: "done",
    label: "Done",
    column: "border-status-done/35 bg-status-done/8",
    chip: "bg-status-done/20 text-status-done",
    card: "border-l-4 border-l-status-done",
    dot: "bg-status-done",
  },
];

export function RoadmapKanban({
  phases,
  onMove,
}: {
  phases: RoadmapPhase[];
  onMove: (taskId: string, status: TaskStatus) => void;
}) {
  const all: Array<RoadmapTask & { phaseTitle: string }> = phases.flatMap((p) =>
    p.tasks.map((t) => ({ ...t, phaseTitle: p.title })),
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {columns.map((col) => {
        const tasks = all.filter((t) => t.status === col.status);
        return (
          <div key={col.status} className={`rounded-2xl border p-4 ${col.column}`}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                {col.label}
              </h3>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${col.chip}`}>
                {tasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">Nothing here yet</p>
              ) : null}
              {tasks.map((task) => (
                <Card key={task.id} className={`glass gap-2 p-4 ${col.card}`}>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {task.phaseTitle}
                  </p>
                  <h4 className="text-sm font-medium">{task.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {task.assignee} · {task.duration}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {columns
                      .filter((c) => c.status !== task.status)
                      .map((c) => (
                        <Button
                          key={c.status}
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => onMove(task.id, c.status)}
                        >
                          → {c.label}
                        </Button>
                      ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}