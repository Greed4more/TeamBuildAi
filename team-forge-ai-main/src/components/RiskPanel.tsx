import { AlertTriangle, CheckCircle2, Info, ShieldAlert, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ProjectRisk } from "@/types";

const styles = {
  high: { chip: "bg-destructive/15 text-destructive border-destructive/30", Icon: ShieldAlert },
  medium: { chip: "bg-warning/15 text-warning border-warning/30", Icon: AlertTriangle },
  low: { chip: "bg-primary/15 text-primary border-primary/30", Icon: Info },
} as const;

export function RiskPanel({
  risks,
  onToggle,
}: {
  risks: ProjectRisk[];
  onToggle: (id: string) => void;
}) {
  const open = risks.filter((r) => !r.resolved);
  return (
    <div className="space-y-4">
      <Card className="glass gap-2 p-5">
        <p className="text-sm text-muted-foreground">Open risks</p>
        <p className="text-3xl font-semibold">
          {open.length}
          <span className="text-base text-muted-foreground"> / {risks.length}</span>
        </p>
        <Progress value={((risks.length - open.length) / Math.max(1, risks.length)) * 100} className="h-1.5" />
      </Card>
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        {risks.map((risk, i) => {
          const { chip, Icon } = styles[risk.severity];
          return (
            <Card
              key={risk.id}
              className={cn(
                "glass card-hover animate-rise h-full justify-between gap-3 p-5",
                risk.resolved && "opacity-60",
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className={cn(risk.resolved && "line-through")}>{risk.title}</span>
                  </h3>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${chip}`}
                  >
                    {risk.severity}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{risk.description}</p>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Probability</span>
                    <span>{risk.probability}%</span>
                  </div>
                  <Progress value={risk.probability} className="h-1.5" />
                </div>
                <p className="text-sm">
                  <span className="font-medium">Impact: </span>
                  <span className="text-muted-foreground">{risk.impact}</span>
                </p>
                <p className="rounded-xl border border-border bg-secondary/40 p-3 text-sm">
                  <span className="font-medium">Mitigation: </span>
                  {risk.mitigation}
                </p>
                <p className="text-xs text-muted-foreground">Owner: {risk.owner}</p>
              </div>
              <Button
                variant={risk.resolved ? "ghost" : "secondary"}
                size="sm"
                onClick={() => onToggle(risk.id)}
              >
                {risk.resolved ? (
                  <>
                    <Undo2 className="h-4 w-4" /> Reopen risk
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Mark resolved
                  </>
                )}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}