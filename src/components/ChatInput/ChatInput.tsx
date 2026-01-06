import * as React from "react";
import { cn } from "../../lib/utils";

export interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  stop?: () => void;
  placeholder?: string;
  maxLength?: number;
  onFileUpload?: (files: FileList) => void;
  disabled?: boolean;
  className?: string;
}

export const ChatInput = React.forwardRef<HTMLDivElement, ChatInputProps>(
  (
    {
      input,
      setInput,
      handleSubmit,
      isLoading,
      stop,
      placeholder = "Type your message...",
      maxLength,
      onFileUpload,
      disabled = false,
      className,
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(
          textareaRef.current.scrollHeight,
          200
        )}px`;
      }
    }, [input]);

    React.useEffect(() => {
      textareaRef.current?.focus();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0 && onFileUpload) {
        onFileUpload(files);
        e.target.value = "";
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }

      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit(e);
      }
    };

    const isInputEmpty = !input.trim();
    const canSubmit = !isInputEmpty && !isLoading && !disabled;

    return (
      <form onSubmit={handleSubmit} className={cn("relative", className)}>
        <div
          ref={ref}
          className="border rounded-lg bg-background shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-shadow"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={isLoading || disabled}
            className={cn(
              "w-full resize-none bg-transparent px-4 py-3 pr-24 outline-none",
              "min-h-12 max-h-48",
              "placeholder:text-muted-foreground",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            rows={1}
            aria-label="Message input"
            aria-describedby={maxLength ? "char-count" : undefined}
          />

          {/* Character count */}
          {maxLength && input.length > maxLength * 0.8 && (
            <div
              id="char-count"
              className="absolute bottom-14 right-4 text-xs text-muted-foreground"
            >
              {input.length}/{maxLength}
            </div>
          )}

          {/* Action buttons */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            {/* File upload button */}
            {onFileUpload && !isLoading && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx,.txt"
                  aria-label="Upload file"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="p-2 rounded hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Attach file"
                  title="Attach file"
                >
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
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </button>
              </>
            )}

            {isLoading && stop && (
              <button
                type="button"
                onClick={stop}
                className="p-2 rounded hover:bg-muted transition"
                aria-label="Stop generating"
                title="Stop generating"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <rect x="4" y="4" width="12" height="12" rx="1" />
                </svg>
              </button>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "p-2 rounded transition",
                canSubmit
                  ? "hover:bg-muted text-primary"
                  : "opacity-50 cursor-not-allowed text-muted-foreground"
              )}
              aria-label="Send message"
              title={
                isInputEmpty
                  ? "Type a message"
                  : isLoading
                  ? "Waiting for response"
                  : "Send message (Enter)"
              }
            >
              <svg
                className="w-5 h-5 rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h11M3 14h7m-7 4h13a4 4 0 004-4V6a4 4 0 00-4-4H6a4 4 0 00-4 4v12a4 4 0 004 4z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </span>
          {isLoading && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Generating...
            </span>
          )}
        </div>
      </form>
    );
  }
);

ChatInput.displayName = "ChatInput";
