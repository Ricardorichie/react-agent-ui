import * as React from "react";
import { Message } from "../../components/Message/Message";
import type { UIMessage } from "@ai-sdk/react";

export interface MessageListProps {
  messages: UIMessage[];
  isStreaming?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
}

export const MessageList = React.forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, isStreaming = false, emptyState, className }, ref) => {
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = React.useState(true);

    React.useEffect(() => {
      if (autoScroll && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages, isStreaming, autoScroll]);

    const handleScroll = React.useCallback(() => {
      if (!scrollContainerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      setAutoScroll(isNearBottom);
    }, []);

    if (messages.length === 0) {
      return (
        <div
          ref={ref}
          className="flex items-center justify-center h-full w-full p-4"
        >
          {emptyState || (
            <div className="text-center space-y-3 max-w-md">
              <div className="text-4xl">💬</div>
              <h3 className="text-lg font-semibold text-foreground">
                Start a conversation
              </h3>
              <p className="text-sm text-muted-foreground">
                Send a message to begin chatting with the AI assistant.
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={`flex flex-col gap-4 w-full h-full overflow-y-auto px-4 py-6 ${
          className || ""
        }`}
        role="log"
        aria-label="Message list"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.map((msg, index) => {
          const textContent =
            msg.parts
              ?.filter(
                (part): part is { type: "text"; text: string } =>
                  part.type === "text"
              )
              .map((part) => part.text)
              .join("") ?? "";

          const isLastMessage = index === messages.length - 1;
          const isStreamingThisMessage =
            isStreaming && msg.role === "assistant" && isLastMessage;

          return (
            <Message
              key={msg.id}
              role={msg.role}
              content={textContent}
              isStreaming={isStreamingThisMessage}
            />
          );
        })}

        <div ref={messagesEndRef} aria-hidden="true" />

        {!autoScroll && (
          <button
            onClick={() => {
              setAutoScroll(true);
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            className="fixed bottom-24 right-8 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all z-10"
            aria-label="Scroll to bottom"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

MessageList.displayName = "MessageList";
