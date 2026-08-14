import { Check, Rocket, Scale, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TeamVariant } from "@/types";

const icons = { balanced: Scale, fastest: Rocket, lean: Users } as const;

export function TeamVariants({
  variants,
  activeId,
  onSelect,
}: {
  variants: TeamVariant[];
  activeId: TeamVariant["id"];
  onSelect: (id: TeamVariant["id"]) => void;
}) {
  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-3">
      {variants.map((v, i) => {
        const Icon = icons[v.id];
        const active = v.id === activeId;
        return (
          <Card
            key={v.id}
            className={cn(
              "glass card-hover animate-rise h-full justify-between gap-4 p-5",
              active && "border-primary/50 ring-1 ring-primary/30",
            )}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-semibold">
                  <Icon className="h-4 w-4 text-primary" /> {v.label}
                </span>
                <span className="text-lg font-semibold">{v.score}</span>
              </div>
              <p className="text-sm text-muted-foreground">{v.tagline}</p>
              <ul className="space-y-1 text-sm">
                {v.memberNames.map((n) => (
                  <li key={n} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {n}
                  </li>
                ))}
              </ul>
              <p className="rounded-xl border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
                {v.tradeoff}
              </p>
            </div>
            <Button
              variant={active ? "secondary" : "default"}
              disabled={active}
              onClick={() => onSelect(v.id)}
            >
              {active ? (
                <>
                  <Check className="h-4 w-4" /> Selected
                </>
              ) : (
                "Use this team"
              )}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}