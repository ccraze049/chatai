import { Plus, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ModeToggle from "./ModeToggle";
import ThemeToggle from "./ThemeToggle";
import { useState, useEffect } from "react";
import AuthDialog from "./AuthDialog";
import { useToast } from "@/hooks/use-toast";

type Mode = "chat" | "code";

interface NavbarProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onNewChat: () => void;
}

interface UserInfo {
  id: string;
  email: string;
  isVerified: boolean;
}

export default function Navbar({ mode, onModeChange, onNewChat }: NavbarProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        toast({
          title: "Logged out",
          description: "You have been logged out successfully",
        });
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <nav className="h-16 border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="h-full px-6 flex items-center justify-between">
          <ModeToggle mode={mode} onModeChange={onModeChange} />
          
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleLogout}
                  className="gap-2"
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
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
            )}
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
