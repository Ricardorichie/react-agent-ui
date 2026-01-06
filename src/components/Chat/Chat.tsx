import * as React from "react";
import { MessageList } from "../../components/MessageList/MessageList";
import { ChatInput } from "../../components/ChatInput/ChatInput";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport, type FileUIPart } from "ai"; // Required import!

type LegacyMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

function isUIMessageArray(
  messages: ChatProps["initialMessages"]
): messages is UIMessage[] {
  const first = Array.isArray(messages) ? (messages[0] as any) : undefined;
  return !!first && Array.isArray(first.parts);
}

function extractText(message: UIMessage): string {
  return (
    message.parts
      ?.filter(
        (part): part is { type: "text"; text: string } => part.type === "text"
      )
      .map((part) => part.text)
      .join("") ?? ""
  );
}

function fileToFileUIPart(file: File): Promise<FileUIPart> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () =>
      reject(reader.error ?? new Error("Failed to read file"));
    reader.onload = () => {
      const url = typeof reader.result === "string" ? reader.result : "";
      resolve({
        type: "file",
        mediaType: file.type || "application/octet-stream",
        filename: file.name,
        url,
      });
    };

    reader.readAsDataURL(file);
  });
}

export interface ChatProps {
  /**
   * API endpoint for chat completions
   * @default "/api/chat"
   */
  apiEndpoint?: string;

  /**
   * Initial messages to display
   *
   * Supports either:
   * - UIMessage[] (AI SDK v5/v6 format), or
   * - LegacyMessage[] ({ id, role, content })
   */
  initialMessages?: UIMessage[] | LegacyMessage[];

  /**
   * Custom headers for API requests
   */
  headers?: Record<string, string>;

  /**
   * Custom empty state component
   */
  emptyState?: React.ReactNode;

  /**
   * Callback when a message is sent
   */
  onMessageSent?: (message: string) => void;

  /**
   * Callback when a response is received
   */
  onResponseReceived?: (response: string) => void;

  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void;

  /**
   * Enable file upload support
   */
  enableFileUpload?: boolean;

  /**
   * Custom placeholder for input
   */
  placeholder?: string;

  /**
   * Maximum input length
   */
  maxInputLength?: number;

  /**
   * Custom className for the container
   */
  className?: string;
}

export function Chat({
  apiEndpoint = "/api/chat",
  initialMessages,
  headers,
  emptyState,
  onMessageSent,
  onResponseReceived,
  onError,
  enableFileUpload = false,
  placeholder = "Type your message...",
  maxInputLength,
  className,
}: ChatProps) {
  const [input, setInput] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const normalizedInitialMessages = React.useMemo<
    UIMessage[] | undefined
  >(() => {
    if (!initialMessages) return undefined;
    if (initialMessages.length === 0) return [];

    if (isUIMessageArray(initialMessages)) {
      return initialMessages;
    }

    // legacy { content } messages into UIMessage { parts }. :contentReference[oaicite:4]{index=4}
    return (initialMessages as LegacyMessage[]).map((m) => ({
      id: m.id,
      role: m.role,
      parts: [{ type: "text", text: m.content, state: "done" }],
    }));
  }, [initialMessages]);

  const {
    messages,
    sendMessage,
    status,
    stop,
    error: chatError,
  } = useChat({
    transport: new DefaultChatTransport({
      api: apiEndpoint,
      headers,
    }),
    ...(normalizedInitialMessages !== undefined
      ? { messages: normalizedInitialMessages }
      : {}),
    onFinish: ({ message }) => {
      onResponseReceived?.(extractText(message));
    },
    onError: (err) => {
      setError(err.message);
      onError?.(err);
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      setError(null);
      onMessageSent?.(input);

      sendMessage({ text: input });

      setInput("");
    },
    [input, isLoading, sendMessage, onMessageSent]
  );

  const handleFileUpload = React.useCallback(
    async (files: FileList) => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileMessage = `Uploaded file: ${file.name} (${(
          file.size / 1024
        ).toFixed(2)} KB)`;

        setError(null);
        onMessageSent?.(fileMessage);

        const filePart = await fileToFileUIPart(file);

        // sendMessage supports FileList or FileUIPart[] :contentReference[oaicite:6]{index=6}
        await sendMessage({
          text: fileMessage,
          files: [filePart],
        });
      }
    },
    [sendMessage, onMessageSent]
  );

  return (
    <div
      className={`flex flex-col h-screen max-w-3xl mx-auto ${className || ""}`}
    >
      {(error || chatError) && (
        <div
          className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 px-4 py-3 m-4 rounded-lg"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                Something went wrong
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                {error || chatError?.message}
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              aria-label="Dismiss error"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          isStreaming={isLoading}
          emptyState={emptyState}
        />
      </div>

      <div className="p-4 border-t bg-background">
        <ChatInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
          placeholder={placeholder}
          maxLength={maxInputLength}
          onFileUpload={enableFileUpload ? handleFileUpload : undefined}
          disabled={!!error}
        />
      </div>
    </div>
  );
}

Chat.displayName = "Chat";
