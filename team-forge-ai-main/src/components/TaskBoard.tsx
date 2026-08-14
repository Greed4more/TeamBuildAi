import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BoardStatus, BoardTask } from "@/types";

const COLUMNS: { id: BoardStatus; label: string; accent: string; dot: string }[] = [
  { id: "backlog", label: "Backlog", accent: "border-border", dot: "bg-muted-foreground" },
  { id: "todo", label: "To do", accent: "border-destructive/40", dot: "bg-destructive" },
  { id: "in-progress", label: "In progress", accent: "border-warning/40", dot: "bg-warning" },
  { id: "review", label: "Review", accent: "border-primary/40", dot: "bg-primary" },
  { id: "done", label: "Done", accent: "border-success/40", dot: "bg-success" },
];

const priorityChip = {
  high: "bg-destructive/15 text-destructive",
  medium: "bg-warning/15 text-warning",
  low: "bg-primary/15 text-primary",
} as const;

export function TaskBoard({
  tasks,
  onMove,
}: {
  tasks: BoardTask[];
  onMove: (taskId: string, status: BoardStatus) => void;
}) {
  const move = (task: BoardTask, dir: -1 | 1) => {
    const idx = COLUMNS.findIndex((c) => c.id === task.status);
    const next = COLUMNS[Math.min(COLUMNS.length - 1, Math.max(0, idx + dir))];
    if (next && next.id !== task.status) onMove(task.id, next.id);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
      {COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.status === col.id);
        return (
          <div key={col.id} className={cn("rounded-2xl border bg-card/40 p-3", col.accent)}>
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <span className={cn("h-2 w-2 rounded-full", col.dot)} />
                {col.label}
              </span>
              <span className="text-xs text-muted-foreground">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map((t) => (
                <Card key={t.id} className="gap-2 border-border/70 p-3">
                  <p className="text-sm font-medium leading-snug">{t.title}</p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className={cn("rounded-full px-2 py-0.5 font-semibold uppercase", priorityChip[t.priority])}>
                      {t.priority}
                    </span>
                    <span className="rounded-full bg-secondary/60 px-2 py-0.5 text-muted-foreground">
                      Phase {t.phase}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.assignee} · {t.role}
                  </p>
                  <div className="flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      disabled={col.id === "backlog"}
                      onClick={() => move(t, -1)}
                      aria-label={`Move ${t.title} back`}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      disabled={col.id === "done"}
                      onClick={() => move(t, 1)}
                      aria-label={`Move ${t.title} forward`}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
              {!items.length ? (
                <p className="px-1 py-6 text-center text-xs text-muted-foreground">Nothing here</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}