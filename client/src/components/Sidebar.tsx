import { MessageSquare, Code2, ChevronLeft, X, Key, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { useEffect, useRef } from "react";

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
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      // Focus the first focusable element in the sidebar
      const firstFocusableElement = sidebarRef.current.querySelector<HTMLElement>(
        'button, a, input, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusableElement?.focus();
      
      // Trap focus within sidebar on mobile
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onToggle();
        }
        
        if (e.key === 'Tab' && window.innerWidth < 768) {
          const focusableElements = sidebarRef.current?.querySelectorAll<HTMLElement>(
            'button, a, input, [tabindex]:not([tabindex="-1"])'
          );
          
          if (!focusableElements || focusableElements.length === 0) return;
          
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        // When sidebar closes, focus the trigger button that will be rendered
        // Use setTimeout to ensure the trigger button has been rendered
        setTimeout(() => {
          const triggerButton = document.querySelector<HTMLElement>('[data-testid="button-sidebar-open"]');
          if (triggerButton) {
            triggerButton.focus();
          }
        }, 0);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute left-4 top-20 z-40 md:left-4 md:top-20"
        data-testid="button-sidebar-open"
        aria-label="Open sidebar"
      >
        <ChevronLeft className="h-5 w-5 rotate-180" />
      </Button>
    );
  }

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-200"
        onClick={onToggle}
        data-testid="sidebar-backdrop"
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className="fixed md:relative w-64 border-r bg-sidebar flex flex-col h-full z-50 md:z-auto transform transition-transform duration-200 md:transform-none" 
        data-testid="sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation sidebar"
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
            History
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            data-testid="button-sidebar-close"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 md:hidden" />
            <ChevronLeft className="h-5 w-5 hidden md:block" />
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

        {/* Mobile-only navigation links */}
        <div className="sm:hidden border-t p-4 space-y-2">
          <Separator className="mb-2" />
          <Link href="/api-keys" data-testid="sidebar-link-api-keys">
            <button
              onClick={onToggle}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover-elevate text-sm"
            >
              <Key className="h-4 w-4 text-muted-foreground" />
              <span>API Keys</span>
            </button>
          </Link>
          <Link href="/docs" data-testid="sidebar-link-docs">
            <button
              onClick={onToggle}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover-elevate text-sm"
            >
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>Documentation</span>
            </button>
          </Link>
        </div>
      </aside>
    </>
  );
}
