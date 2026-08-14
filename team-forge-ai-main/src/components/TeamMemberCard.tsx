import { InitialsAvatar } from "@/components/Avatar";
import { SkillBadge } from "@/components/SkillBadge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TeamMember } from "@/types";

export function TeamMemberCard({ member, index = 0 }: { member: TeamMember; index?: number }) {
  return (
    <Card
      className="glass card-hover animate-rise gap-4 p-5"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start gap-4">
        <InitialsAvatar name={member.name} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">{member.name}</h3>
          <p className="text-sm text-primary">{member.role}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold">{member.matchScore}%</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">match</p>
        </div>
      </div>
      <Progress value={member.matchScore} className="h-1.5" />
      <div className="flex flex-wrap gap-1.5">
        {member.skills.map((s) => (
          <SkillBadge key={s} skill={s} active />
        ))}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Why selected: </span>
        {member.reason}
      </p>
    </Card>
  );
}