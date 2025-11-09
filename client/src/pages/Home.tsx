import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import WelcomeScreen from "@/components/WelcomeScreen";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile, MOBILE_BREAKPOINT } from "@/hooks/use-mobile";

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
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= MOBILE_BREAKPOINT;
    }
    return false;
  });
  const [hasUserToggledSidebar, setHasUserToggledSidebar] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const { data: sessions = [] } = useQuery<ChatSession[]>({
    queryKey: ["/api/sessions"],
  });

  const { data: sessionMessages = [] } = useQuery<Message[]>({
    queryKey: ["/api/sessions", activeSessionId, "messages"],
    enabled: !!activeSessionId,
  });

  useEffect(() => {
    if (sessionMessages.length > 0) {
      setMessages(sessionMessages);
    }
  }, [sessionMessages]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (isMobile === undefined) return;
    if (!hasUserToggledSidebar) {
      setIsSidebarOpen(!isMobile);
    }
  }, [isMobile, hasUserToggledSidebar]);

  const createSessionMutation = useMutation({
    mutationFn: async (data: { title: string; mode: Mode }) => {
      const res = await apiRequest("POST", "/api/sessions", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
  });

  const createMessageMutation = useMutation({
    mutationFn: async (data: { sessionId: string; role: string; content: string }) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return await res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", variables.sessionId, "messages"] });
    },
  });

  const chatCompletionMutation = useMutation({
    mutationFn: async (data: { messages: Message[]; mode: Mode }) => {
      const res = await apiRequest("POST", "/api/chat/completions", data);
      return await res.json();
    },
  });

  const handleNewChat = () => {
    setMessages([]);
    setActiveSessionId(undefined);
    setIsSidebarOpen(false);
    setHasUserToggledSidebar(true);
  };

  const handleSessionClick = async (id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (session) {
      setActiveSessionId(id);
      setMode(session.mode);
      setIsSidebarOpen(false);
      setHasUserToggledSidebar(true);
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      let currentSessionId = activeSessionId;

      if (!currentSessionId) {
        const newSession = await createSessionMutation.mutateAsync({
          title: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
          mode,
        });
        currentSessionId = newSession.id;
        setActiveSessionId(currentSessionId);
      }

      await createMessageMutation.mutateAsync({
        sessionId: currentSessionId!,
        role: "user",
        content,
      });

      const response = await chatCompletionMutation.mutateAsync({
        messages: updatedMessages,
        mode,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      await createMessageMutation.mutateAsync({
        sessionId: currentSessionId!,
        role: "assistant",
        content: response.content,
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    }
  };

  const placeholder =
    mode === "chat" ? "Ask anything..." : "Write or debug code...";

  const isLoading = chatCompletionMutation.isPending;

  return (
    <div className="h-screen flex flex-col">
      <Navbar mode={mode} onModeChange={setMode} onNewChat={handleNewChat} />
      
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSessionClick={handleSessionClick}
          isOpen={isSidebarOpen}
          onToggle={() => {
            setIsSidebarOpen(!isSidebarOpen);
            setHasUserToggledSidebar(true);
          }}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          {messages.length === 0 ? (
            <WelcomeScreen mode={mode} />
          ) : (
            <ScrollArea className="flex-1" ref={scrollAreaRef}>
              <div className="px-4 sm:px-8 py-6 space-y-6 max-w-4xl mx-auto w-full">
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
