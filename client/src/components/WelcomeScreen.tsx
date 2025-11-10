import { MessageSquare, Code2, Lightbulb, Globe, BookOpen, Zap, Bug, Target } from "lucide-react";

type Mode = "chat" | "code";

interface WelcomeScreenProps {
  mode: Mode;
}

export default function WelcomeScreen({ mode }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="text-center max-w-2xl w-full">
        <div className="mb-4 sm:mb-6 inline-flex p-3 sm:p-4 rounded-2xl bg-muted">
          {mode === "chat" ? (
            <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
          ) : (
            <Code2 className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
          )}
        </div>
        
        <h1 className="text-xl sm:text-3xl font-semibold mb-3 sm:mb-4 px-4">
          {mode === "chat" ? "Welcome to Chat Mode" : "Welcome to Code Mode"}
        </h1>
        
        <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-4">
          {mode === "chat"
            ? "Ask me anything. I'm here to provide natural, factual, context-aware conversations."
            : "Let's write, debug, and explain code together. I'm optimized for programming tasks."}
        </p>

        <div className="grid gap-3 sm:gap-4 text-left max-w-md mx-auto px-4">
          <div className="p-3 sm:p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              {mode === "chat" ? (
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Zap className="h-4 w-4 text-muted-foreground" />
              )}
              <p className="text-sm font-medium">
                {mode === "chat" ? "Example question" : "Example task"}
              </p>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {mode === "chat"
                ? "Explain quantum computing in simple terms"
                : "Write a Python function to sort an array"}
            </p>
          </div>
          
          <div className="p-3 sm:p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              {mode === "chat" ? (
                <Globe className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Bug className="h-4 w-4 text-muted-foreground" />
              )}
              <p className="text-sm font-medium">
                {mode === "chat" ? "Get insights" : "Debug code"}
              </p>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {mode === "chat"
                ? "What are the latest developments in AI?"
                : "Why isn't my React component re-rendering?"}
            </p>
          </div>
          
          <div className="p-3 sm:p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              {mode === "chat" ? (
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Target className="h-4 w-4 text-muted-foreground" />
              )}
              <p className="text-sm font-medium">
                {mode === "chat" ? "Learn something new" : "Best practices"}
              </p>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {mode === "chat"
                ? "How does the human immune system work?"
                : "What are REST API design best practices?"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
