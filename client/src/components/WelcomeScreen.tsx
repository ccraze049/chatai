import { MessageSquare, Code2 } from "lucide-react";

type Mode = "chat" | "code";

interface WelcomeScreenProps {
  mode: Mode;
}

export default function WelcomeScreen({ mode }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <div className="mb-6 inline-flex p-4 rounded-2xl bg-muted">
          {mode === "chat" ? (
            <MessageSquare className="h-12 w-12 text-primary" />
          ) : (
            <Code2 className="h-12 w-12 text-primary" />
          )}
        </div>
        
        <h1 className="text-3xl font-semibold mb-4">
          {mode === "chat" ? "Welcome to Chat Mode 💬" : "Welcome to Code Mode 💻"}
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          {mode === "chat"
            ? "Ask me anything. I'm here to provide natural, factual, context-aware conversations."
            : "Let's write, debug, and explain code together. I'm optimized for programming tasks."}
        </p>

        <div className="grid gap-4 text-left max-w-md mx-auto">
          <div className="p-4 rounded-lg bg-muted/50 hover-elevate cursor-pointer">
            <p className="text-sm font-medium mb-1">
              {mode === "chat" ? "💡 Example question" : "⚡ Example task"}
            </p>
            <p className="text-sm text-muted-foreground">
              {mode === "chat"
                ? "Explain quantum computing in simple terms"
                : "Write a Python function to sort an array"}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50 hover-elevate cursor-pointer">
            <p className="text-sm font-medium mb-1">
              {mode === "chat" ? "🌍 Get insights" : "🐛 Debug code"}
            </p>
            <p className="text-sm text-muted-foreground">
              {mode === "chat"
                ? "What are the latest developments in AI?"
                : "Why isn't my React component re-rendering?"}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50 hover-elevate cursor-pointer">
            <p className="text-sm font-medium mb-1">
              {mode === "chat" ? "📚 Learn something new" : "🎯 Best practices"}
            </p>
            <p className="text-sm text-muted-foreground">
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
