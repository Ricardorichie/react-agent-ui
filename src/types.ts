import type { UIMessage } from "@ai-sdk/react";

export type { UIMessage };

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "executing"
    | "completed"
    | "error";
  result?: any;
  error?: string;
}

export interface ReasoningStep {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  type?: "thinking" | "planning" | "executing" | "reflection";
}

export interface MessageAttachment {
  id: string;
  type: "image" | "file" | "audio" | "video";
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export interface ExtendedMessage extends UIMessage {
  toolCalls?: ToolCall[];
  reasoning?: ReasoningStep[];
  attachments?: MessageAttachment[];
  metadata?: Record<string, any>;
}

export interface ChatTheme {
  primary?: string;
  background?: string;
  border?: string;
  userMessageBg?: string;
  assistantMessageBg?: string;
}

export interface ChatConfig {
  api?: string;
  headers?: Record<string, string>;
  maxTokens?: number;
  temperature?: number;
  requireToolApproval?: boolean;
  showReasoningSteps?: boolean;
  theme?: ChatTheme;
}

export type MessageRole = "user" | "assistant" | "tool" | "system";
