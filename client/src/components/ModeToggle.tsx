import { MessageSquare, Code2 } from "lucide-react";

type Mode = "chat" | "code";

interface ModeToggleProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-muted p-0.5 xs:p-1" data-testid="mode-toggle">
      <button
        onClick={() => onModeChange("chat")}
        className={`inline-flex items-center gap-1 sm:gap-2 px-1.5 xs:px-2 sm:px-4 py-1 xs:py-1.5 sm:py-2 rounded-full text-xs xs:text-sm font-medium transition-all ${
          mode === "chat"
            ? "bg-background shadow-sm"
            : "text-muted-foreground hover-elevate"
        }`}
        data-testid="button-mode-chat"
        aria-label="Chat mode"
      >
        <MessageSquare className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
        <span className="hidden sm:inline">Chat</span>
      </button>
      <button
        onClick={() => onModeChange("code")}
        className={`inline-flex items-center gap-1 sm:gap-2 px-1.5 xs:px-2 sm:px-4 py-1 xs:py-1.5 sm:py-2 rounded-full text-xs xs:text-sm font-medium transition-all ${
          mode === "code"
            ? "bg-background shadow-sm"
            : "text-muted-foreground hover-elevate"
        }`}
        data-testid="button-mode-code"
        aria-label="Code mode"
      >
        <Code2 className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
        <span className="hidden sm:inline">Code</span>
      </button>
    </div>
  );
}
