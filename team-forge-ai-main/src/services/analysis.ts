import {
  buildOptimalTeam,
  buildTeamResult,
} from "@/services/engine";
import type {
  BoardTask,
  Candidate,
  CandidateFit,
  FullTeamResult,
  PairCompatibility,
  Priority,
  Project,
  ProjectRisk,
  SkillGapDetail,
  TeamMember,
  TeamVariant,
} from "@/types";

const norm = (s: string) => s.trim().toLowerCase();
const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));
const overlap = (a: string[], b: string[]) => {
  const set = new Set(b.map(norm));
  return a.filter((s) => set.has(norm(s)));
};

type Weights = { coverage: number; unique: number; experience: number; availability: number };

const VARIANT_WEIGHTS: Record<TeamVariant["id"], Weights> = {
  balanced: { coverage: 0.4, unique: 0.3, experience: 0.2, availability: 0.1 },
  fastest: { coverage: 0.25, unique: 0.15, experience: 0.45, availability: 0.15 },
  lean: { coverage: 0.45, unique: 0.4, experience: 0.1, availability: 0.05 },
};

function score(c: Candidate, project: Project, covered: Set<string>, w: Weights) {
  const relevant = overlap(c.skills, project.requiredSkills);
  const fresh = relevant.filter((s) => !covered.has(norm(s)));
  const coverage = (relevant.length / Math.max(1, project.requiredSkills.length)) * 100;
  const unique = (fresh.length / Math.max(1, project.requiredSkills.length)) * 100;
  const experience = Math.min(c.experienceYears, 8) * 12.5;
  return clamp(
    coverage * w.coverage +
      unique * w.unique +
      experience * w.experience +
      c.availability * w.availability,
  );
}

function greedyTeam(
  project: Project,
  candidates: Candidate[],
  variant: TeamVariant["id"],
): TeamMember[] {
  if (variant === "balanced") return buildOptimalTeam(project, candidates);
  const w = VARIANT_WEIGHTS[variant];
  const size = Math.max(
    2,
    Math.min(variant === "lean" ? project.teamSize - 1 : project.teamSize, candidates.length),
  );
  const covered = new Set<string>();
  const pool = [...candidates];
  const chosen: TeamMember[] = [];

  for (let i = 0; i < size; i++) {
    let best: { c: Candidate; s: number; fresh: string[] } | null = null;
    for (const c of pool) {
      const relevant = overlap(c.skills, project.requiredSkills);
      const fresh = relevant.filter((s) => !covered.has(norm(s)));
      let s = score(c, project, covered, w);
      if (chosen.some((m) => m.role === c.role)) s -= variant === "lean" ? 6 : 12;
      if (!best || s > best.s) best = { c, s, fresh };
    }
    if (!best) break;
    const relevant = overlap(best.c.skills, project.requiredSkills);
    chosen.push({
      candidateId: best.c.id,
      name: best.c.name,
      role: best.c.role,
      matchScore: clamp(best.s, 40, 99),
      skills: (relevant.length ? relevant : best.c.skills).slice(0, 5),
      reason:
        variant === "fastest"
          ? `${best.c.experienceYears} years of senior delivery experience means ${best.c.strengths[0]?.toLowerCase() ?? "core work"} needs little ramp-up.`
          : `Covers ${(best.fresh.length ? best.fresh : relevant).slice(0, 3).join(", ") || best.c.skills[0]} without adding headcount.`,
    });
    best.c.skills.forEach((s) => covered.add(norm(s)));
    pool.splice(pool.indexOf(best.c), 1);
  }
  return chosen.sort((a, b) => b.matchScore - a.matchScore);
}

const VARIANT_META: Record<TeamVariant["id"], { label: string; tagline: string; tradeoff: string }> = {
  balanced: {
    label: "Balanced",
    tagline: "Best overall skill coverage and role diversity",
    tradeoff: "Slightly slower ramp-up than an all-senior team, but the safest all-round bet.",
  },
  fastest: {
    label: "Fastest delivery",
    tagline: "Senior-heavy team optimised for speed",
    tradeoff: "Higher cost and lower availability — great for tight deadlines, weaker on mentoring.",
  },
  lean: {
    label: "Lean team",
    tagline: "One fewer person, maximum skill overlap per head",
    tradeoff: "Cheaper and easier to coordinate, but very little slack if someone drops out.",
  },
};

export function generateTeamVariants(project: Project, candidates: Candidate[]): TeamVariant[] {
  return (Object.keys(VARIANT_META) as TeamVariant["id"][]).map((id) => {
    const members = greedyTeam(project, candidates, id);
    const result = buildTeamResult(project, candidates, "demo", members);
    return {
      id,
      ...VARIANT_META[id],
      memberIds: members.map((m) => m.candidateId),
      memberNames: members.map((m) => m.name),
      score: result.teamScore,
    };
  });
}

/** Explains why every candidate was selected or passed over. */
export function calculateCandidateFits(
  project: Project,
  candidates: Candidate[],
  team: TeamMember[],
): CandidateFit[] {
  const selectedIds = new Set(team.map((m) => m.candidateId));
  const teamRoles = team.map((m) => m.role);

  return candidates
    .map((c) => {
      const relevant = overlap(c.skills, project.requiredSkills);
      const missing = project.requiredSkills.filter(
        (s) => !c.skills.some((cs) => norm(cs) === norm(s)),
      );
      const fit = score(c, project, new Set(), VARIANT_WEIGHTS.balanced);
      const selected = selectedIds.has(c.id);
      const roleDupes = teamRoles.filter((r) => r === c.role).length;

      const pros = [
        relevant.length
          ? `Covers ${relevant.length} of ${project.requiredSkills.length} required skills (${relevant.slice(0, 3).join(", ")})`
          : `Brings adjacent strengths in ${c.skills.slice(0, 2).join(" and ")}`,
        `${c.experienceYears} years of experience with ${c.strengths[0]?.toLowerCase() ?? "delivery"}`,
        `Collaboration score of ${c.collaborationScore}/100 and ${c.availability}% availability`,
      ];
      const cons = [
        missing.length
          ? `Does not cover ${missing.slice(0, 3).join(", ")}`
          : "No required-skill gaps, but a narrow specialism",
        ...(c.weaknesses ?? []).slice(0, 2).map((w) => `Development area: ${w}`),
        c.availability < 60 ? `Only ${c.availability}% available for this window` : "",
      ].filter(Boolean);

      const notes: string[] = [];
      if (!selected && roleDupes > 0)
        notes.push(`Overlaps with the ${c.role} already on the team — added little new coverage.`);
      if (!selected && c.availability < 60)
        notes.push("Low availability reduced their score against similar candidates.");
      if (selected && roleDupes > 1)
        notes.push("Shares a role with another member — plan the split of ownership explicitly.");

      return {
        candidateId: c.id,
        name: c.name,
        role: c.role,
        score: fit,
        selected,
        pros,
        cons,
        notes,
        summary: selected
          ? `Selected because they add ${relevant.slice(0, 2).join(" and ") || c.skills[0]} at ${fit}/100 fit.`
          : `Passed over at ${fit}/100 fit — ${notes[0] ?? "another candidate covered more required skills."}`,
      };
    })
    .sort((a, b) => Number(b.selected) - Number(a.selected) || b.score - a.score);
}

/** Pairwise working compatibility between selected members. */
export function calculatePairCompatibility(
  team: TeamMember[],
  candidates: Candidate[],
): PairCompatibility[] {
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const pairs: PairCompatibility[] = [];

  for (let i = 0; i < team.length; i++) {
    for (let j = i + 1; j < team.length; j++) {
      const a = byId.get(team[i]!.candidateId);
      const b = byId.get(team[j]!.candidateId);
      if (!a || !b) continue;
      const shared = overlap(a.skills, b.skills);
      const complementary = a.role !== b.role;
      const collab = (a.collaborationScore + b.collaborationScore) / 2;
      const value = clamp(
        collab * 0.5 + (complementary ? 25 : 8) + Math.min(shared.length, 4) * 6,
        30,
        99,
      );
      const reason = complementary
        ? `${a.role} and ${b.role} hand work off cleanly${shared.length ? `, with ${shared.slice(0, 2).join(" and ")} as shared language` : ""}.`
        : `Both work as ${a.role.toLowerCase()}s — strong pairing potential, but split ownership to avoid duplication.`;
      pairs.push({ a: a.name, b: b.name, score: value, reason });
    }
  }
  return pairs.sort((x, y) => y.score - x.score);
}

export function generateRiskAssessment(
  project: Project,
  result: { members: TeamMember[]; skillGaps: { skill: string; severity: string }[]; teamScore: number },
  candidates: Candidate[],
): ProjectRisk[] {
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const members = result.members.map((m) => byId.get(m.candidateId)).filter(Boolean) as Candidate[];
  const avgAvailability = members.length
    ? Math.round(members.reduce((s, m) => s + m.availability, 0) / members.length)
    : 0;
  const lead =
    [...members].sort((a, b) => b.leadershipScore - a.leadershipScore)[0]?.name ?? "Team lead";
  const risks: ProjectRisk[] = [];

  const topGap = result.skillGaps[0];
  if (topGap) {
    risks.push({
      id: "risk-gap",
      title: `${topGap.skill} capability gap`,
      severity: topGap.severity === "high" ? "high" : "medium",
      probability: topGap.severity === "high" ? 75 : 50,
      impact: "Blocks the build or deployment phase until someone ramps up.",
      description: `No member owns ${topGap.skill} at a production level for a ${project.durationWeeks}-week scope.`,
      mitigation: `Start the ${topGap.skill} learning path in week one and assign a named owner.`,
      owner: lead,
      resolved: false,
    });
  }

  if (avgAvailability < 75) {
    risks.push({
      id: "risk-availability",
      title: "Limited team availability",
      severity: avgAvailability < 60 ? "high" : "medium",
      probability: 100 - avgAvailability,
      impact: "Deadline slips if any phase overruns by more than a few days.",
      description: `Average availability is ${avgAvailability}%, leaving little slack across ${project.durationWeeks} weeks.`,
      mitigation: "Cut one non-critical feature now and protect the testing phase.",
      owner: lead,
      resolved: false,
    });
  }

  const soloSkills = project.requiredSkills.filter(
    (s) => members.filter((m) => m.skills.some((ms) => norm(ms) === norm(s))).length === 1,
  );
  if (soloSkills.length) {
    risks.push({
      id: "risk-bus-factor",
      title: "Bus-factor on critical skills",
      severity: soloSkills.length > 2 ? "high" : "medium",
      probability: 45,
      impact: "Losing one person stalls an entire workstream.",
      description: `${soloSkills.slice(0, 3).join(", ")} ${soloSkills.length === 1 ? "is" : "are"} owned by exactly one person.`,
      mitigation: "Pair-program those areas weekly and keep decision notes in the repo.",
      owner: lead,
      resolved: false,
    });
  }

  const juniorHeavy = members.filter((m) => m.experienceYears <= 3).length > members.length / 2;
  risks.push({
    id: "risk-seniority",
    title: juniorHeavy ? "Junior-heavy team composition" : "Coordination overhead",
    severity: juniorHeavy ? "medium" : "low",
    probability: juniorHeavy ? 55 : 30,
    impact: juniorHeavy
      ? "Architecture decisions may need rework mid-project."
      : "Time lost to sync meetings and handoffs.",
    description: juniorHeavy
      ? "More than half the team has three years of experience or less."
      : `A team of ${members.length} needs clear ownership to avoid duplicated work.`,
    mitigation: juniorHeavy
      ? `Book a design review with ${lead} at the end of each phase.`
      : "Use one async standup per day and one weekly decision review.",
    owner: lead,
    resolved: false,
  });

  if (result.teamScore < 70) {
    risks.push({
      id: "risk-fit",
      title: "Low overall team-project fit",
      severity: "high",
      probability: 65,
      impact: "Scope may exceed what this team can deliver on time.",
      description: `Compatibility scored ${result.teamScore}/100 against the requirements of ${project.name}.`,
      mitigation: "Reduce scope, extend the timeline, or add one specialist for the weakest skill.",
      owner: lead,
      resolved: false,
    });
  }

  return risks;
}

export function generateTaskBoard(
  roadmap: { phase: number; title: string; tasks: { id: string; title: string; assignee: string; role: string }[] }[],
): BoardTask[] {
  return roadmap.flatMap((phase) =>
    phase.tasks.map((t, i) => {
      const priority: Priority = phase.phase <= 2 ? "high" : phase.phase <= 4 ? "medium" : "low";
      return {
        id: t.id,
        title: t.title,
        assignee: t.assignee,
        role: t.role,
        priority,
        status: phase.phase === 1 ? (i === 0 ? "in-progress" : "todo") : "backlog",
        phase: phase.phase,
        dueInWeeks: phase.phase * 2,
      } satisfies BoardTask;
    }),
  );
}

export function buildGapDetails(
  project: Project,
  gaps: { skill: string; severity: "high" | "medium" | "low"; explanation: string; recommendation: string }[],
  team: TeamMember[],
  candidates: Candidate[],
): SkillGapDetail[] {
  const byId = new Map(candidates.map((c) => [c.id, c]));
  return gaps.map((gap) => {
    const holders = team.filter((m) =>
      (byId.get(m.candidateId)?.skills ?? []).some((s) => norm(s) === norm(gap.skill)),
    );
    const currentCoverage = clamp((holders.length / Math.max(1, team.length)) * 100);
    const requiredCoverage = gap.severity === "high" ? 60 : gap.severity === "medium" ? 40 : 25;
    const assignee =
      [...team].sort(
        (a, b) =>
          (byId.get(b.candidateId)?.availability ?? 0) - (byId.get(a.candidateId)?.availability ?? 0),
      )[0]?.name ?? "Unassigned";
    return {
      ...gap,
      currentCoverage,
      requiredCoverage,
      impact:
        gap.severity === "high"
          ? `Delivery of ${project.name} stalls in the build phase without ${gap.skill}.`
          : `Quality and pace suffer in the later phases without stronger ${gap.skill}.`,
      assignee,
      weeks: [
        { week: 1, focus: `${gap.skill} fundamentals and a hands-on starter exercise`, hours: 6 },
        { week: 2, focus: `Apply ${gap.skill} to a slice of ${project.name}`, hours: 8 },
        { week: 3, focus: `Review with the team and document the ${gap.skill} approach`, hours: 4 },
      ],
      resources: [
        `Official ${gap.skill} documentation — core concepts`,
        `A short ${gap.skill} project walkthrough`,
        `Internal pairing session with the strongest ${gap.skill} adjacent member`,
      ],
    };
  });
}

export function explainTeam(project: Project, result: { members: TeamMember[]; teamScore: number; breakdown: { skillCoverage: number; roleBalance: number } }) {
  const roles = [...new Set(result.members.map((m) => m.role))];
  return `For ${project.name} I optimised for skill coverage first, then role diversity, then availability. The selected ${result.members.length}-person team covers ${result.breakdown.skillCoverage}% of the required skills across ${roles.length} roles (${roles.join(", ")}), scoring ${result.teamScore}/100 overall. Members were ranked by how much *new* required-skill coverage they added, so specialists who duplicated an existing role were deprioritised even when individually strong.`;
}

/** One call that produces the full workspace-ready result. */
export function buildFullTeamResult(
  project: Project,
  candidates: Candidate[],
  variantId: TeamVariant["id"] = "balanced",
  source: "live-ai" | "demo" = "demo",
): FullTeamResult {
  const members = greedyTeam(project, candidates, variantId);
  const base = buildTeamResult(project, candidates, source, members);
  return {
    ...base,
    variantId,
    variants: generateTeamVariants(project, candidates),
    fits: calculateCandidateFits(project, candidates, base.members),
    pairs: calculatePairCompatibility(base.members, candidates),
    projectRisks: generateRiskAssessment(project, base, candidates),
    tasks: generateTaskBoard(base.roadmap),
    gapDetails: buildGapDetails(project, base.skillGaps, base.members, candidates),
    explanation: explainTeam(project, base),
  };
}