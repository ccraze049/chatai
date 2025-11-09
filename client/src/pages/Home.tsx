import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import WelcomeScreen from "@/components/WelcomeScreen";
import { ScrollArea } from "@/components/ui/scroll-area";

type Mode = "chat" | "code";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  mode: Mode;
  createdAt: Date;
  messages: Message[];
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleNewChat = () => {
    setMessages([]);
    setActiveSessionId(undefined);
    console.log("New chat started");
  };

  const handleSessionClick = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (session) {
      setActiveSessionId(id);
      setMessages(session.messages);
      setMode(session.mode);
      console.log("Switched to session:", id);
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: mode === "chat"
          ? "I'm a chat assistant powered by llama-3.3-70b-versatile. In the full application, I'll provide natural, factual, context-aware conversations. This is currently a design prototype."
          : "I'm a code assistant powered by llama-4-maverick. In the full application, I'll help you write, debug, and explain code. This is currently a design prototype.\n\n```javascript\nfunction example() {\n  console.log('Hello, World!');\n}\n```",
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);

      if (!activeSessionId) {
        const newSession: ChatSession = {
          id: Date.now().toString(),
          title: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
          mode,
          createdAt: new Date(),
          messages: [userMessage, assistantMessage],
        };
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
      } else {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...s.messages, userMessage, assistantMessage] }
              : s
          )
        );
      }
    }, 1000);
  };

  const placeholder =
    mode === "chat" ? "Ask anything..." : "Write or debug code...";

  return (
    <div className="h-screen flex flex-col">
      <Navbar mode={mode} onModeChange={setMode} onNewChat={handleNewChat} />
      
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSessionClick={handleSessionClick}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <div className="flex-1 flex flex-col">
          {messages.length === 0 ? (
            <WelcomeScreen mode={mode} />
          ) : (
            <ScrollArea className="flex-1" ref={scrollAreaRef}>
              <div className="px-8 py-6 space-y-6 max-w-4xl mx-auto w-full">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                  />
                ))}
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                    <div className="rounded-2xl p-4 bg-muted animate-pulse h-20 w-64" />
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          
          <ChatInput
            onSend={handleSendMessage}
            placeholder={placeholder}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
