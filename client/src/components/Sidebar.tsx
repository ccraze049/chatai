import { MessageSquare, Code2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type Mode = "chat" | "code";

interface ChatSession {
  id: string;
  title: string;
  mode: Mode;
  createdAt: Date;
}

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId?: string;
  onSessionClick: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onSessionClick,
  isOpen,
  onToggle,
}: SidebarProps) {
  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute left-4 top-20 z-40"
        data-testid="button-sidebar-open"
      >
        <ChevronLeft className="h-5 w-5 rotate-180" />
      </Button>
    );
  }

  return (
    <aside className="w-64 border-r bg-sidebar flex flex-col h-full" data-testid="sidebar">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
          History
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          data-testid="button-sidebar-close"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No chat history yet
            </p>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSessionClick(session.id)}
                className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors hover-elevate ${
                  activeSessionId === session.id
                    ? "bg-sidebar-accent"
                    : ""
                }`}
                data-testid={`session-${session.id}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {session.mode === "chat" ? (
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Code2 className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
