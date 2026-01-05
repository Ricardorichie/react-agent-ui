import * as React from "react";
import { cn } from "../../lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ToolCall, type ToolCallProps } from "../ToolCall/ToolCall";
import { Reasoning, type ReasoningStep } from "../Reasoning/Reasoning";
import { Attachment, type AttachmentProps } from "../Attachment/Attachment";

interface EnhancedMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  role: "user" | "assistant" | "tool" | "system";
  content: string;
  isStreaming?: boolean;
  timestamp?: string;
  avatar?: string;

  //agentic
  toolCalls?: Omit<ToolCallProps, "onApprove" | "onReject">[];
  reasoning?: ReasoningStep[];
  attachments?: Omit<AttachmentProps, "onRemove">[];
  isThinking?: boolean;

  //callbacks
  onToolApprove?: (toolId: string) => void;
  onToolReject?: (toolId: string) => void;
  onAttachmentRemove?: (attachmentId: string) => void;
}

export const EnhancedMessage = React.forwardRef<
  HTMLDivElement,
  EnhancedMessageProps
>(
  (
    {
      role,
      content,
      isStreaming = false,
      timestamp,
      avatar,
      toolCalls = [],
      reasoning = [],
      attachments = [],
      isThinking = false,
      onToolApprove,
      onToolReject,
      onAttachmentRemove,
      className,
      ...props
    },
    ref
  ) => {
    const isUser = role === "user";
    const hasContent = content.trim().length > 0;

    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-3 mb-6",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
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
          >
            {avatar || (isUser ? "You" : "AI")}
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col flex-1",
            isUser ? "items-end" : "items-start"
          )}
        >
          {isUser && attachments.length > 0 && (
            <div
              className={cn(
                "flex flex-wrap gap-2 mb-2",
                isUser ? "justify-end" : "justify-start"
              )}
            >
              {attachments.map((attachment) => (
                <Attachment
                  key={attachment.id}
                  {...attachment}
                  onRemove={onAttachmentRemove}
                />
              ))}
            </div>
          )}

          {/*text bubble */}
          {hasContent && (
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
                      const isBlock = !!nodeClassName;

                      if (isBlock) {
                        return (
                          <code
                            className={cn(
                              "block rounded bg-black/10 p-3 overflow-x-auto text-sm my-2",
                              nodeClassName
                            )}
                            {...rest}
                          >
                            {children}
                          </code>
                        );
                      }

                      return (
                        <code
                          className="rounded bg-black/10 px-1 py-0.5 text-sm"
                          {...rest}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>

                {isStreaming && (
                  <div className="inline-block h-4 w-1 animate-pulse bg-current rounded ml-1" />
                )}
              </div>
            </div>
          )}

          {/* reasoning steps */}
          {!isUser && (reasoning.length > 0 || isThinking) && (
            <div className="max-w-[80%] w-full">
              <Reasoning steps={reasoning} isThinking={isThinking} />
            </div>
          )}

          {!isUser && toolCalls.length > 0 && (
            <div className="max-w-[80%] w-full space-y-2">
              {toolCalls.map((toolCall) => (
                <ToolCall
                  key={toolCall.id}
                  {...toolCall}
                  onApprove={onToolApprove}
                  onReject={onToolReject}
                />
              ))}
            </div>
          )}

          {!isUser && attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 max-w-[80%]">
              {attachments.map((attachment) => (
                <Attachment key={attachment.id} {...attachment} />
              ))}
            </div>
          )}

          {timestamp && (
            <span className="text-xs text-muted-foreground mt-1 px-1">
              {timestamp}
            </span>
          )}
        </div>
      </div>
    );
  }
);

EnhancedMessage.displayName = "EnhancedMessage";
