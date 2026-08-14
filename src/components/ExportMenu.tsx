import { Check, ClipboardCopy, Download, FileDown, Printer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  downloadTextFile,
  markdownToPlainText,
  printReport,
  resultToMarkdown,
  slugify,
} from "@/lib/export";
import type { FullTeamResult, Project } from "@/types";

export function ExportMenu({ project, result }: { project: Project; result: FullTeamResult }) {
  const [copied, setCopied] = useState(false);
  const markdown = () => resultToMarkdown(project, result);
  const base = slugify(project.name) || "teamforge-report";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown());
      setCopied(true);
      toast.success("Report copied as Markdown");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Clipboard unavailable — download the file instead.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">
          <FileDown className="h-4 w-4" /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Roadmap &amp; skill-gap report</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void copy()}>
          {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
          Copy as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            downloadTextFile(`${base}-report.md`, markdown());
            toast.success("Markdown file downloaded");
          }}
        >
          <Download className="h-4 w-4" /> Download .md
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            downloadTextFile(`${base}-report.txt`, markdownToPlainText(markdown()), "text/plain");
            toast.success("Text file downloaded");
          }}
        >
          <Download className="h-4 w-4" /> Download .txt
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            if (!printReport(`${project.name} — TeamForge AI`, markdown())) {
              toast.error("Allow pop-ups to print or save as PDF.");
            }
          }}
        >
          <Printer className="h-4 w-4" /> Print / save as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}