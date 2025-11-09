import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEffect, useState } from "react";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const isUser = role === "user";

  return (
    <div
      className={`flex gap-2 sm:gap-4 w-full ${isUser ? "justify-end" : "justify-start"}`}
      data-testid={`message-${role}`}
    >
      <div className={`flex gap-2 sm:gap-4 ${isUser ? "flex-row-reverse" : "flex-row"} w-full sm:max-w-3xl`}>
        <div className="flex-shrink-0 w-8 h-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}>
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </div>
        </div>
        
        <div
          className={`rounded-2xl p-3 sm:p-4 min-w-0 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
          style={{ flex: '1 1 auto', maxWidth: 'calc(100% - 2.5rem)' }}
        >
          <div className="prose prose-sm w-full max-w-none dark:prose-invert [&_*]:max-w-full">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <div className="overflow-x-auto w-full my-2 -mx-3 sm:-mx-4">
                      <SyntaxHighlighter
                        style={theme === "dark" ? oneDark : oneLight}
                        language={match[1]}
                        PreTag="div"
                        wrapLongLines={true}
                        className="!text-[11px] sm:!text-sm"
                        customStyle={{
                          margin: 0,
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          maxWidth: '100%',
                        }}
                        codeTagProps={{
                          style: {
                            fontSize: 'inherit',
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                          }
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className={`${className} ${isUser ? "text-primary-foreground" : ""} break-words text-xs sm:text-sm`} {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p className="mb-2 last:mb-0 break-words" style={{ overflowWrap: 'anywhere' }}>{children}</p>,
                ul: ({ children }) => <ul className="mb-2 last:mb-0 ml-4">{children}</ul>,
                ol: ({ children }) => <ol className="mb-2 last:mb-0 ml-4">{children}</ol>,
                li: ({ children }) => <li className="break-words" style={{ overflowWrap: 'anywhere' }}>{children}</li>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
