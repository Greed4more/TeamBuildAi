import { Trash2 } from "lucide-react";
import { InitialsAvatar } from "@/components/Avatar";
import { SkillBadge } from "@/components/SkillBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Candidate } from "@/types";

export function CandidateCard({
  candidate,
  highlightSkills = [],
  onRemove,
  selected,
  onToggle,
}: {
  candidate: Candidate;
  highlightSkills?: string[];
  onRemove?: (id: string) => void;
  selected?: boolean;
  onToggle?: (id: string) => void;
}) {
  const highlight = new Set(highlightSkills.map((s) => s.toLowerCase()));
  const fit = Math.min(
    99,
    Math.round(50 + candidate.experienceYears * 5 + candidate.availability * 0.2),
  );

  return (
    <Card
      className={`glass card-hover animate-rise gap-4 p-5 ${selected ? "border-primary/50" : ""}`}
      onClick={onToggle ? () => onToggle(candidate.id) : undefined}
      role={onToggle ? "button" : undefined}
      tabIndex={onToggle ? 0 : undefined}
      onKeyDown={
        onToggle
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle(candidate.id);
              }
            }
          : undefined
      }
    >
      <div className="flex items-start gap-4">
        <InitialsAvatar name={candidate.name} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">{candidate.name}</h3>
          <p className="text-sm text-primary">{candidate.role}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {candidate.experienceYears} yrs experience · {candidate.availability}% available
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="rounded-xl border border-border bg-secondary/40 px-2.5 py-1.5 text-center">
              <p className="text-sm font-semibold text-primary">{fit}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">fit</p>
            </div>
          </TooltipTrigger>
          <TooltipContent>General readiness from experience and availability</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {candidate.skills.slice(0, 6).map((s) => (
          <SkillBadge key={s} skill={s} active={highlight.has(s.toLowerCase())} />
        ))}
      </div>

      <div className="grid gap-2 text-xs text-muted-foreground">
        <p>
          <span className="font-medium text-success">Strengths: </span>
          {candidate.strengths.join(" · ")}
        </p>
        {candidate.weaknesses?.length ? (
          <p>
            <span className="font-medium text-warning">Development areas: </span>
            {candidate.weaknesses.join(" · ")}
          </p>
        ) : null}
      </div>

      {onRemove ? (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Remove ${candidate.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(candidate.id);
            }}
          >
            <Trash2 className="h-4 w-4" /> Remove
          </Button>
        </div>
      ) : null}
    </Card>
  );
}