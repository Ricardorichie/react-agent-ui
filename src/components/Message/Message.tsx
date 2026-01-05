import * as React from "react";
import { cn } from "../../lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  role: "user" | "assistant" | "tool" | "system";
  content: string;
  isStreaming?: boolean;
  timestamp?: string;
  avatar?: string;
}

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  (
    {
      role,
      content,
      isStreaming = false,
      timestamp,
      avatar,
      className,
      ...props
    },
    ref
  ) => {
    const isUser = role === "user";
    const [isCopied, setIsCopied] = React.useState(false);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text:", err);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-3 mb-6 group",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
        role="article"
        aria-label={`${role} message`}
        {...props}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium",
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted-foreground/20 text-foreground"
            )}
            aria-label={`${role} avatar`}
          >
            {avatar || (isUser ? "You" : "AI")}
          </div>
        </div>

        {/* Message bubble + actions */}
        <div
          className={cn("flex flex-col", isUser ? "items-end" : "items-start")}
        >
          <div className="relative group/message">
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-4 py-3 text-sm",
                isUser ? "bg-primary text-primary-foreground" : "bg-muted",
                className
              )}
            >
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className: nodeClassName, children, ...rest }) {
                      const match = /language-(\w+)/.exec(nodeClassName || "");
                      const isBlock = match;

                      if (isBlock) {
                        return (
                          <div className="relative">
                            <code
                              className={cn(
                                "block rounded bg-black/10 dark:bg-white/10 p-3 overflow-x-auto text-sm my-2",
                                nodeClassName
                              )}
                              {...rest}
                            >
                              {children}
                            </code>
                          </div>
                        );
                      }

                      return (
                        <code
                          className="rounded bg-black/10 dark:bg-white/10 px-1 py-0.5 text-sm"
                          {...rest}
                        >
                          {children}
                        </code>
                      );
                    },
                    // Better list styling
                    ul: ({ children }) => (
                      <ul className="list-disc pl-4 my-2 space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-4 my-2 space-y-1">
                        {children}
                      </ol>
                    ),
                    // Better link styling
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>

                {isStreaming && (
                  <span
                    className="inline-block h-4 w-1 animate-pulse bg-current rounded ml-1"
                    aria-label="Generating response"
                  />
                )}
              </div>
            </div>

            {/* Action buttons - only show for assistant messages */}
            {!isUser && !isStreaming && (
              <div
                className="absolute -bottom-8 left-0 flex items-center gap-1 opacity-0 group-hover/message:opacity-100 transition-opacity"
                role="toolbar"
                aria-label="Message actions"
              >
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition"
                  aria-label="Copy message"
                  title="Copy message"
                >
                  {isCopied ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Timestamp */}
          {timestamp && (
            <time
              className="text-xs text-muted-foreground mt-1 px-1"
              dateTime={timestamp}
            >
              {timestamp}
            </time>
          )}
        </div>
      </div>
    );
  }
);

Message.displayName = "Message";
