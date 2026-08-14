import { useEffect, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const AI_STEPS = [
  "Analyzing candidates...",
  "Mapping skills...",
  "Balancing roles...",
  "Checking compatibility...",
  "Detecting skill gaps...",
  "Optimizing team composition...",
];

export function AIProcessing({
  onComplete,
  stepDuration = 700,
}: {
  onComplete: () => void;
  stepDuration?: number;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= AI_STEPS.length) {
      const done = window.setTimeout(onComplete, 350);
      return () => window.clearTimeout(done);
    }
    const timer = window.setTimeout(() => setStep((s) => s + 1), stepDuration);
    return () => window.clearTimeout(timer);
  }, [step, stepDuration, onComplete]);

  const progress = Math.round((step / AI_STEPS.length) * 100);

  return (
    <Card className="glass mx-auto w-full max-w-xl gap-6 p-8" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="animate-float rounded-2xl border border-primary/30 bg-primary/10 p-3 text-primary">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">Forging your team</h2>
          <p className="text-sm text-muted-foreground">
            Running skill, role and compatibility analysis
          </p>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <ul className="space-y-3">
        {AI_STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li
              key={label}
              className={`flex items-center gap-3 text-sm transition-opacity ${
                done || active ? "opacity-100" : "opacity-40"
              }`}
            >
              {done ? (
                <Check className="h-4 w-4 text-primary" />
              ) : active ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <span className="h-4 w-4 rounded-full border border-border" />
              )}
              <span className={done ? "text-muted-foreground line-through" : ""}>{label}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}