import { createServerFn } from "@tanstack/react-start";
import type { Candidate, FullTeamResult, Project, TeamResult, TeamVariant } from "@/types";
import { buildFullTeamResult } from "./analysis";

interface BuildInput {
  project: Project;
  candidates: Candidate[];
  mode: "live" | "demo";
  variantId?: TeamVariant["id"];
}

/**
 * Builds an optimal team. In "live" mode it asks the AI gateway to review the
 * deterministic shortlist and rewrite the qualitative fields. Any failure
 * (missing key, rate limit, malformed JSON) silently falls back to demo mode.
 */
export const buildTeamFn = createServerFn({ method: "POST" })
  .inputValidator((data: BuildInput) => data)
  .handler(async ({ data }): Promise<FullTeamResult> => {
    const base = buildFullTeamResult(
      data.project,
      data.candidates,
      data.variantId ?? "balanced",
      "demo",
    );
    if (data.mode !== "live") return base;

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return base;

    try {
      const prompt = `You are a technical team-formation analyst.
Project: ${data.project.name}
Description: ${data.project.description}
Required skills: ${data.project.requiredSkills.join(", ")}
Duration: ${data.project.durationWeeks} weeks

Proposed team (JSON): ${JSON.stringify(base.members)}
Detected skill gaps (JSON): ${JSON.stringify(base.skillGaps)}

Return ONLY JSON matching:
{"members":[{"candidateId":string,"reason":string}],"strengths":[string],"risks":[string],"recommendations":[string],"skillGaps":[{"skill":string,"severity":"high"|"medium"|"low","explanation":string,"recommendation":string}]}
Keep every reason under 240 characters and specific to this project.`;

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
        body: JSON.stringify({
          model: "google/gemini-3.6-flash",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) return base;
      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const content = json.choices?.[0]?.message?.content;
      if (!content) return base;
      const parsed = JSON.parse(content) as Partial<TeamResult>;

      return {
        ...base,
        source: "live-ai",
        members: base.members.map((m) => {
          const found = parsed.members?.find((p) => p.candidateId === m.candidateId);
          return found?.reason ? { ...m, reason: found.reason } : m;
        }),
        strengths: parsed.strengths?.length ? parsed.strengths : base.strengths,
        risks: parsed.risks?.length ? parsed.risks : base.risks,
        recommendations: parsed.recommendations?.length
          ? parsed.recommendations
          : base.recommendations,
        skillGaps: parsed.skillGaps?.length ? parsed.skillGaps : base.skillGaps,
      };
    } catch {
      return base;
    }
  });