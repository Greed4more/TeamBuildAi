export type Severity = "high" | "medium" | "low";
export type TaskStatus = "todo" | "in-progress" | "done";
export type BoardStatus = "backlog" | "todo" | "in-progress" | "review" | "done";
export type Priority = "high" | "medium" | "low";
export type ProjectStatus = "planning" | "team-formation" | "in-progress" | "at-risk" | "shipped";
export type RolePreference = "lead" | "contributor" | "either";

export interface Candidate {
  id: string;
  name: string;
  role: string;
  skills: string[];
  experienceYears: number;
  strengths: string[];
  weaknesses?: string[];
  bio: string;
  availability: number; // 0-100
  /** Hours the candidate can commit each week. */
  weeklyHours?: number;
  /** Whether they want to lead or contribute. */
  rolePreference?: RolePreference;
  githubUrl?: string;
  linkedinUrl?: string;
  collaborationScore: number; // 0-100
  leadershipScore: number; // 0-100
  pastProjects: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  teamSize: number;
  requiredSkills: string[];
  durationWeeks: number;
  createdAt: string;
  deadline: string;
  status: ProjectStatus;
}

export interface TeamMember {
  candidateId: string;
  name: string;
  role: string;
  matchScore: number;
  skills: string[];
  reason: string;
}

export interface CompatibilityBreakdown {
  skillCoverage: number;
  roleBalance: number;
  experienceMix: number;
  projectAlignment: number;
  collaborationPotential: number;
}

export interface SkillGap {
  skill: string;
  severity: Severity;
  explanation: string;
  recommendation: string;
}

export interface LearningStep {
  title: string;
  description: string;
  hours: number;
}

export interface LearningPath {
  skill: string;
  assignedTo: string;
  totalHours: number;
  steps: LearningStep[];
}

export interface RoadmapTask {
  id: string;
  title: string;
  assignee: string;
  role: string;
  duration: string;
  dependencies: string[];
  status: TaskStatus;
}

export interface RoadmapPhase {
  phase: number;
  title: string;
  summary: string;
  tasks: RoadmapTask[];
}

export interface TeamResult {
  projectId: string;
  teamScore: number;
  breakdown: CompatibilityBreakdown;
  members: TeamMember[];
  strengths: string[];
  risks: string[];
  recommendations: string[];
  skillGaps: SkillGap[];
  learningPaths: LearningPath[];
  roadmap: RoadmapPhase[];
  source: "live-ai" | "demo";
  createdAt: string;
}

/** A candidate-level explanation of why they were picked or passed over. */
export interface CandidateFit {
  candidateId: string;
  name: string;
  role: string;
  score: number;
  selected: boolean;
  pros: string[];
  cons: string[];
  notes: string[];
  summary: string;
}

/** Pairwise working compatibility between two selected members. */
export interface PairCompatibility {
  a: string;
  b: string;
  score: number;
  reason: string;
}

export interface TeamVariant {
  id: "balanced" | "fastest" | "lean";
  label: string;
  tagline: string;
  memberIds: string[];
  memberNames: string[];
  score: number;
  tradeoff: string;
}

export interface ProjectRisk {
  id: string;
  title: string;
  severity: Severity;
  probability: number; // 0-100
  impact: string;
  description: string;
  mitigation: string;
  owner: string;
  resolved: boolean;
}

export interface BoardTask {
  id: string;
  title: string;
  assignee: string;
  role: string;
  priority: Priority;
  status: BoardStatus;
  phase: number;
  dueInWeeks: number;
}

export interface GapWeek {
  week: number;
  focus: string;
  hours: number;
}

export interface SkillGapDetail extends SkillGap {
  currentCoverage: number;
  requiredCoverage: number;
  impact: string;
  assignee: string;
  weeks: GapWeek[];
  resources: string[];
}

/** Everything the workspace needs on top of the base team result. */
export interface TeamAnalysis {
  variantId: TeamVariant["id"];
  variants: TeamVariant[];
  fits: CandidateFit[];
  pairs: PairCompatibility[];
  projectRisks: ProjectRisk[];
  tasks: BoardTask[];
  gapDetails: SkillGapDetail[];
  explanation: string;
}

export type FullTeamResult = TeamResult & TeamAnalysis;