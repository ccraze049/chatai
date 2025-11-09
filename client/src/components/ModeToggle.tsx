import { MessageSquare, Code2 } from "lucide-react";

type Mode = "chat" | "code";

interface ModeToggleProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1" data-testid="mode-toggle">
      <button
        onClick={() => onModeChange("chat")}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          mode === "chat"
            ? "bg-background shadow-sm"
            : "text-muted-foreground hover-elevate"
        }`}
        data-testid="button-mode-chat"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Chat</span>
      </button>
      <button
        onClick={() => onModeChange("code")}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          mode === "code"
            ? "bg-background shadow-sm"
            : "text-muted-foreground hover-elevate"
        }`}
        data-testid="button-mode-code"
      >
        <Code2 className="h-4 w-4" />
        <span>Code</span>
      </button>
    </div>
  );
}
