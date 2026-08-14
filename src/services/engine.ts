import type {
  Candidate,
  CompatibilityBreakdown,
  LearningPath,
  Project,
  RoadmapPhase,
  RolePreference,
  SkillGap,
  TeamMember,
  TeamResult,
} from "@/types";

const norm = (s: string) => s.trim().toLowerCase();
const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));

/** Weekly commitment in hours, derived from availability when not explicitly set. */
export function weeklyHoursOf(c: Candidate): number {
  return c.weeklyHours ?? Math.max(4, Math.round((c.availability / 100) * 40));
}

/** Whether the candidate wants to lead or contribute. */
export function rolePreferenceOf(c: Candidate): RolePreference {
  return c.rolePreference ?? (c.leadershipScore >= 80 ? "lead" : "either");
}

/** Extract skills + a suggested role from free-form resume / profile text. */
export function extractCandidateSkills(text: string): { skills: string[]; role: string } {
  const dictionary = [
    "React","TypeScript","JavaScript","Node.js","Express","Python","Django","Machine Learning",
    "PyTorch","TensorFlow","Computer Vision","NLP","SQL","PostgreSQL","MongoDB","Redis","GraphQL",
    "REST APIs","Docker","Kubernetes","CI/CD","Cloud","AWS","Terraform","Monitoring","UI/UX",
    "Figma","Prototyping","User Research","Design Systems","Tailwind CSS","Next.js","Agile",
    "Roadmapping","Automated Testing","Cypress","Playwright","Airflow","Spark","Data Modeling",
    "Accessibility","Data Visualization",
  ];
  const lower = norm(text);
  const skills = dictionary.filter((s) => lower.includes(norm(s)));
  return { skills, role: recommendRoles(skills)[0] ?? "Generalist Engineer" };
}

/** Rank likely roles for a skill set. */
export function recommendRoles(skills: string[]): string[] {
  const set = new Set(skills.map(norm));
  const has = (...k: string[]) => k.filter((x) => set.has(norm(x))).length;
  const scores: Array<[string, number]> = [
    ["Frontend Engineer", has("React", "TypeScript", "Tailwind CSS", "Next.js", "Accessibility")],
    ["Backend Engineer", has("Node.js", "Express", "REST APIs", "PostgreSQL", "MongoDB", "Redis")],
    ["ML Engineer", has("Python", "Machine Learning", "PyTorch", "TensorFlow", "Computer Vision")],
    ["UI/UX Designer", has("UI/UX", "Figma", "Prototyping", "User Research", "Design Systems")],
    ["DevOps Engineer", has("Docker", "Kubernetes", "CI/CD", "Cloud", "Terraform", "Monitoring")],
    ["Data Engineer", has("SQL", "Airflow", "Spark", "Data Modeling")],
    ["QA Engineer", has("Automated Testing", "Cypress", "Playwright")],
    ["Project Manager", has("Agile", "Roadmapping", "Stakeholder Management", "Risk Planning")],
  ];
  return scores
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([r]) => r);
}

function overlap(a: string[], b: string[]) {
  const set = new Set(b.map(norm));
  return a.filter((s) => set.has(norm(s)));
}

function matchScore(candidate: Candidate, project: Project, covered: Set<string>) {
  const relevant = overlap(candidate.skills, project.requiredSkills);
  const fresh = relevant.filter((s) => !covered.has(norm(s)));
  const coverage = (relevant.length / Math.max(1, project.requiredSkills.length)) * 100;
  const uniqueness = (fresh.length / Math.max(1, project.requiredSkills.length)) * 100;
  const experience = Math.min(candidate.experienceYears, 8) * 6;
  const commitment = Math.min(100, (weeklyHoursOf(candidate) / 40) * 100);
  return clamp(
    coverage * 0.38 +
      uniqueness * 0.28 +
      experience * 0.18 +
      candidate.availability * 0.08 +
      commitment * 0.08,
  );
}

function reasonFor(c: Candidate, project: Project, fresh: string[], teamRoles: string[]) {
  const skillText = fresh.length
    ? `Brings ${fresh.slice(0, 3).join(", ")} which no one else on the team covers`
    : `Reinforces core delivery capacity in ${c.skills.slice(0, 2).join(" and ")}`;
  const roleText = teamRoles.length
    ? ` and complements the team's ${teamRoles.slice(-1)[0]?.toLowerCase()} strength`
    : ` and anchors the earliest phase of ${project.name}`;
  return `${skillText}${roleText}. ${c.experienceYears} years of hands-on experience with ${c.strengths[0]?.toLowerCase()}.`;
}

/** Greedy team builder maximising required-skill coverage and role diversity. */
export function buildOptimalTeam(project: Project, candidates: Candidate[]): TeamMember[] {
  const covered = new Set<string>();
  const chosen: TeamMember[] = [];
  const pool = [...candidates];
  const size = Math.min(project.teamSize, pool.length);

  for (let i = 0; i < size; i++) {
    let best: { c: Candidate; score: number; fresh: string[] } | null = null;
    const hasLead = chosen.some((m) => {
      const cand = candidates.find((x) => x.id === m.candidateId);
      return cand ? rolePreferenceOf(cand) === "lead" : false;
    });
    for (const c of pool) {
      const relevant = overlap(c.skills, project.requiredSkills);
      const fresh = relevant.filter((s) => !covered.has(norm(s)));
      let score = matchScore(c, project, covered);
      if (chosen.some((m) => m.role === c.role)) score -= 12; // encourage role diversity
      const pref = rolePreferenceOf(c);
      if (pref === "lead") score += hasLead ? -6 : 8; // exactly one natural lead
      if (weeklyHoursOf(c) < 10) score -= 6; // very low weekly commitment
      if (!best || score > best.score) best = { c, score, fresh };
    }
    if (!best) break;
    const roles = chosen.map((m) => m.role);
    chosen.push({
      candidateId: best.c.id,
      name: best.c.name,
      role: best.c.role,
      matchScore: clamp(best.score, 40, 99),
      skills: (overlap(best.c.skills, project.requiredSkills).length
        ? overlap(best.c.skills, project.requiredSkills)
        : best.c.skills
      ).slice(0, 5),
      reason: reasonFor(best.c, project, best.fresh, roles),
    });
    best.c.skills.forEach((s) => covered.add(norm(s)));
    pool.splice(pool.indexOf(best.c), 1);
  }
  return chosen.sort((a, b) => b.matchScore - a.matchScore);
}

export function calculateTeamCompatibility(
  project: Project,
  team: TeamMember[],
  candidates: Candidate[],
): { teamScore: number; breakdown: CompatibilityBreakdown } {
  const members = team
    .map((m) => candidates.find((c) => c.id === m.candidateId))
    .filter(Boolean) as Candidate[];
  const allSkills = new Set(members.flatMap((m) => m.skills.map(norm)));
  const skillCoverage = clamp(
    (project.requiredSkills.filter((s) => allSkills.has(norm(s))).length /
      Math.max(1, project.requiredSkills.length)) *
      100,
  );
  const uniqueRoles = new Set(members.map((m) => m.role)).size;
  const roleBalance = clamp((uniqueRoles / Math.max(1, members.length)) * 100);
  const years = members.map((m) => m.experienceYears);
  const spread = years.length ? Math.max(...years) - Math.min(...years) : 0;
  const experienceMix = clamp(60 + spread * 8);
  const projectAlignment = clamp(
    team.reduce((sum, m) => sum + m.matchScore, 0) / Math.max(1, team.length),
  );
  const collaborationPotential = clamp(
    members.reduce((s, m) => s + m.availability, 0) / Math.max(1, members.length) * 0.7 +
      roleBalance * 0.3,
  );
  const teamScore = clamp(
    skillCoverage * 0.3 +
      roleBalance * 0.2 +
      experienceMix * 0.15 +
      projectAlignment * 0.2 +
      collaborationPotential * 0.15,
  );
  return {
    teamScore,
    breakdown: {
      skillCoverage,
      roleBalance,
      experienceMix,
      projectAlignment,
      collaborationPotential,
    },
  };
}

const gapCopy: Record<string, { explanation: string; recommendation: string }> = {
  DevOps: {
    explanation: "No team member owns containerisation, environments or release automation.",
    recommendation: "Learn Docker fundamentals and set up a CI/CD pipeline in week one.",
  },
  Cloud: {
    explanation: "Cloud hosting and infrastructure knowledge is thin across the team.",
    recommendation: "Complete a cloud deployment primer and pick one managed platform.",
  },
  "Automated Testing": {
    explanation: "Quality is currently manual, which is risky for a fast delivery cadence.",
    recommendation: "Add a Playwright smoke suite and wire it into pull requests.",
  },
};

export function detectSkillGaps(project: Project, team: TeamMember[], candidates: Candidate[]): SkillGap[] {
  const members = team
    .map((m) => candidates.find((c) => c.id === m.candidateId))
    .filter(Boolean) as Candidate[];
  const owned = new Map<string, number>();
  members.forEach((m) => m.skills.forEach((s) => owned.set(norm(s), (owned.get(norm(s)) ?? 0) + 1)));

  const gaps: SkillGap[] = [];
  for (const skill of project.requiredSkills) {
    const count = owned.get(norm(skill)) ?? 0;
    if (count === 0) {
      gaps.push({
        skill,
        severity: "high",
        explanation:
          gapCopy[skill]?.explanation ?? `${skill} is required by the project but no member covers it.`,
        recommendation:
          gapCopy[skill]?.recommendation ?? `Upskill one member in ${skill} before the build phase.`,
      });
    } else if (count === 1) {
      gaps.push({
        skill,
        severity: "medium",
        explanation: `${skill} depends on a single person, creating a delivery bottleneck.`,
        recommendation: `Pair a second member on ${skill} to remove the single point of failure.`,
      });
    }
  }
  // Always surface delivery hygiene gaps that hackathon teams miss.
  for (const extra of ["DevOps", "Automated Testing"]) {
    const hasIt = members.some((m) =>
      m.skills.some((s) => norm(s).includes(norm(extra === "DevOps" ? "Docker" : "Testing"))),
    );
    if (!hasIt && !gaps.some((g) => g.skill === extra)) {
      gaps.push({
        skill: extra,
        severity: extra === "DevOps" ? "high" : "medium",
        explanation: gapCopy[extra]!.explanation,
        recommendation: gapCopy[extra]!.recommendation,
      });
    }
  }
  const order = { high: 0, medium: 1, low: 2 } as const;
  return gaps.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 6);
}

const pathTemplates: Record<string, Array<[string, string, number]>> = {
  DevOps: [
    ["Docker Fundamentals", "Images, containers, compose and local parity with production.", 6],
    ["CI/CD Basics", "Automate build, test and preview deploys on every pull request.", 8],
    ["Cloud Deployment", "Ship the app to a managed platform with environment secrets.", 6],
    ["Monitoring & Alerts", "Logs, uptime checks and error alerting for the live service.", 4],
  ],
  "Automated Testing": [
    ["Testing Mindset", "What to test, what to skip, and how to keep suites fast.", 3],
    ["Unit & Component Tests", "Vitest and Testing Library on the highest-risk modules.", 6],
    ["End-to-End Flows", "Playwright coverage of the critical user journey.", 6],
    ["Tests in CI", "Block merges on red builds and track flaky specs.", 3],
  ],
};

export function generateLearningPath(gap: SkillGap, assignedTo: string): LearningPath {
  const template =
    pathTemplates[gap.skill] ??
    ([
      [`${gap.skill} Foundations`, `Core concepts and vocabulary of ${gap.skill}.`, 5],
      [`Hands-on ${gap.skill}`, `Build one small project applying ${gap.skill}.`, 8],
      [`${gap.skill} in Production`, `Apply ${gap.skill} to the real project codebase.`, 6],
      [`Review & Share`, `Document learnings and run a team knowledge session.`, 2],
    ] as Array<[string, string, number]>);
  const steps = template.map(([title, description, hours]) => ({ title, description, hours }));
  return {
    skill: gap.skill,
    assignedTo,
    totalHours: steps.reduce((s, x) => s + x.hours, 0),
    steps,
  };
}

export function generateProjectRoadmap(project: Project, team: TeamMember[]): RoadmapPhase[] {
  const pick = (keywords: string[]) =>
    team.find((m) => keywords.some((k) => norm(m.role).includes(norm(k)))) ?? team[0];
  const pm = pick(["Project", "Manager", "Full Stack"]);
  const design = pick(["Design", "UI"]);
  const fe = pick(["Frontend", "Full Stack"]);
  const be = pick(["Backend", "Data", "Full Stack"]);
  const ml = pick(["ML", "Data"]);
  const ops = pick(["DevOps", "Backend"]);
  const qa = pick(["QA", "Full Stack"]);
  const w = Math.max(1, Math.round(project.durationWeeks / 6));
  const dur = (n: number) => `${n * w} week${n * w > 1 ? "s" : ""}`;

  const phase = (
    n: number,
    title: string,
    summary: string,
    tasks: Array<[string, TeamMember | undefined, number, string[]]>,
  ): RoadmapPhase => ({
    phase: n,
    title,
    summary,
    tasks: tasks.map(([t, member, len, deps], i) => ({
      id: `p${n}-t${i + 1}`,
      title: t,
      assignee: member?.name ?? "Unassigned",
      role: member?.role ?? "Team",
      duration: dur(len),
      dependencies: deps,
      status: n === 1 ? (i === 0 ? "done" : "in-progress") : "todo",
    })),
  });

  return [
    phase(1, "Planning & Architecture", "Align scope, risks and the technical blueprint.", [
      ["Scope definition & success metrics", pm, 1, []],
      ["System architecture & data model", be, 1, ["p1-t1"]],
      ["Product flows & wireframes", design, 1, ["p1-t1"]],
    ]),
    phase(2, "Frontend Development", "Build the interface shell and core screens.", [
      ["Design system & component library", design, 1, ["p1-t3"]],
      ["Core screens & navigation", fe, 2, ["p2-t1"]],
      ["Responsive & accessibility pass", fe, 1, ["p2-t2"]],
    ]),
    phase(3, "Backend Development", "Stand up services, storage and integrations.", [
      ["API contracts & auth", be, 1, ["p1-t2"]],
      ["Database schema & migrations", be, 1, ["p3-t1"]],
      ["Service integration with frontend", fe, 1, ["p3-t1", "p2-t2"]],
    ]),
    phase(4, "AI Integration", "Add the intelligence layer and evaluate quality.", [
      ["Model / provider selection", ml, 1, ["p3-t1"]],
      ["Inference pipeline & prompts", ml, 2, ["p4-t1"]],
      ["Result evaluation & guardrails", ml, 1, ["p4-t2"]],
    ]),
    phase(5, "Testing", "Prove the critical journeys hold under pressure.", [
      ["Test plan & coverage targets", qa, 1, ["p4-t3"]],
      ["Automated end-to-end suite", qa, 1, ["p5-t1"]],
      ["Bug bash & fixes", pm, 1, ["p5-t2"]],
    ]),
    phase(6, "Deployment", "Ship, observe and hand over.", [
      ["CI/CD pipeline & environments", ops, 1, ["p5-t2"]],
      ["Production launch", ops, 1, ["p6-t1"]],
      ["Monitoring, docs & handover", pm, 1, ["p6-t2"]],
    ]),
  ];
}

export function buildTeamResult(
  project: Project,
  candidates: Candidate[],
  source: "live-ai" | "demo" = "demo",
  presetMembers?: TeamMember[],
): TeamResult {
  const members = presetMembers?.length ? presetMembers : buildOptimalTeam(project, candidates);
  const { teamScore, breakdown } = calculateTeamCompatibility(project, members, candidates);
  const skillGaps = detectSkillGaps(project, members, candidates);
  const learningPaths = skillGaps
    .slice(0, 3)
    .map((gap, i) => generateLearningPath(gap, members[i % Math.max(1, members.length)]?.name ?? "Unassigned"));
  const roadmap = generateProjectRoadmap(project, members);

  const strengths = [
    `${breakdown.skillCoverage}% of required skills are covered by the selected team`,
    `${new Set(members.map((m) => m.role)).size} distinct roles reduce overlap and idle time`,
    `Blended seniority: ${Math.min(...members.map((m) => m.matchScore))}–${Math.max(
      ...members.map((m) => m.matchScore),
    )} match range keeps mentoring possible`,
  ];
  const risks = [
    skillGaps[0]
      ? `${skillGaps[0].skill} is a ${skillGaps[0].severity}-severity gap that can block delivery`
      : "No critical skill gaps detected",
    `Team of ${members.length} for a ${project.durationWeeks}-week scope leaves limited slack`,
    "Single-owner skills create bus-factor risk in the middle phases",
  ];
  const recommendations = [
    skillGaps[0]
      ? `Start the ${skillGaps[0].skill} learning path in week one, before the build phase`
      : "Lock scope early and protect the testing phase",
    "Run a 30-minute architecture kickoff so backend and frontend contracts match",
    "Pair members on any skill owned by one person to spread knowledge",
  ];

  return {
    projectId: project.id,
    teamScore,
    breakdown,
    members,
    strengths,
    risks,
    recommendations,
    skillGaps,
    learningPaths,
    roadmap,
    source,
    createdAt: new Date().toISOString(),
  };
}