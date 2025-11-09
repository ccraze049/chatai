import { Plus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import ModeToggle from "./ModeToggle";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";
import AuthDialog from "./AuthDialog";

type Mode = "chat" | "code";

interface NavbarProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onNewChat: () => void;
}

export default function Navbar({ mode, onModeChange, onNewChat }: NavbarProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  return (
    <>
      <nav className="h-16 border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="h-full px-6 flex items-center justify-between">
          <ModeToggle mode={mode} onModeChange={onModeChange} />
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="default"
              onClick={() => setShowAuthDialog(true)}
              className="gap-2"
              data-testid="button-login"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={onNewChat}
              className="gap-2"
              data-testid="button-new-chat"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Chat</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
