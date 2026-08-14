import { Sparkles, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/hooks/useAppStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ModeToggle() {
  const { mode, setMode } = useAppStore();

  const options = [
    { value: "live" as const, label: "Live AI", Icon: Sparkles },
    { value: "demo" as const, label: "Demo", Icon: FlaskConical },
  ];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          role="group"
          aria-label="AI mode"
          className="flex items-center rounded-full border border-border bg-secondary/40 p-1"
        >
          {options.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => {
                setMode(value);
                toast.success(
                  value === "live"
                    ? "Live AI enabled — falls back to demo data if unavailable"
                    : "Demo mode enabled — using realistic offline intelligence",
                );
              }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        Live AI routes requests through the secure server. Demo mode works offline.
      </TooltipContent>
    </Tooltip>
  );
}