import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Rocket, X } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SkillBadge } from "@/components/SkillBadge";
import { useAppStore } from "@/hooks/useAppStore";

export const Route = createFileRoute("/projects/new")({
  head: () => ({
    meta: [
      { title: "New project — TeamForge AI" },
      {
        name: "description",
        content: "Define project scope, duration, team size and required skills so the AI can forge the optimal team.",
      },
      { property: "og:title", content: "New project — TeamForge AI" },
      { property: "og:description", content: "Create a project and build its optimal team with AI." },
    ],
  }),
  component: NewProjectPage,
});

function NewProjectPage() {
  const { addProject } = useAppStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [teamSize, setTeamSize] = useState("4");
  const [durationWeeks, setDurationWeeks] = useState("12");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (!skills.includes(value)) setSkills((s) => [...s, value]);
    setSkillInput("");
  };

  return (
    <AppLayout title="Create project" description="Tell TeamForge what you're building and who you need.">
      <Card className="glass mx-auto max-w-2xl gap-6 p-6 sm:p-8">
        <div className="space-y-2">
          <Label htmlFor="p-name">Project name</Label>
          <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="AI Waste Management Platform" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="p-desc">Description</Label>
          <Textarea
            id="p-desc"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is being built, for whom, and what does success look like?"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="p-size">Team size</Label>
            <Input id="p-size" type="number" min={2} max={12} value={teamSize} onChange={(e) => setTeamSize(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-weeks">Duration (weeks)</Label>
            <Input id="p-weeks" type="number" min={1} max={104} value={durationWeeks} onChange={(e) => setDurationWeeks(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="p-skill">Required skills</Label>
          <div className="flex gap-2">
            <Input
              id="p-skill"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Type a skill and press Enter"
            />
            <Button type="button" variant="secondary" onClick={addSkill}>
              Add
            </Button>
          </div>
          {skills.length ? (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {skills.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSkills((list) => list.filter((x) => x !== s))}
                  aria-label={`Remove ${s}`}
                  className="group"
                >
                  <SkillBadge skill={s} active />
                  <X className="ml-1 inline h-3 w-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <Button
          size="lg"
          onClick={() => {
            if (!name.trim() || !skills.length) {
              toast.error("A project name and at least one required skill are needed.");
              return;
            }
            const project = addProject({
              name: name.trim(),
              description: description.trim() || "No description provided.",
              teamSize: Number(teamSize) || 4,
              durationWeeks: Number(durationWeeks) || 12,
              requiredSkills: skills,
              deadline: new Date(
                Date.now() + (Number(durationWeeks) || 12) * 7 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              status: "team-formation",
            });
            toast.success("Project created — forging your team");
            navigate({ to: "/team/$projectId", params: { projectId: project.id } });
          }}
        >
          <Rocket className="h-4 w-4" /> Create project & build team
        </Button>
      </Card>
    </AppLayout>
  );
}