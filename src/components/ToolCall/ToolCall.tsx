import * as React from "react";
import { cn } from "../../lib/utils";

export interface ToolCallProps {
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
  requireApproval?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  className?: string;
}

export const ToolCall = React.forwardRef<HTMLDivElement, ToolCallProps>(
  (
    {
      id,
      name,
      arguments: args,
      status,
      result,
      error,
      requireApproval = false,
      onApprove,
      onReject,
      className,
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const statusColors = {
      pending: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
      approved: "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
      rejected: "border-red-500 bg-red-50 dark:bg-red-950/20",
      executing: "border-purple-500 bg-purple-50 dark:bg-purple-950/20",
      completed: "border-green-500 bg-green-50 dark:bg-green-950/20",
      error: "border-red-600 bg-red-100 dark:bg-red-950/30",
    };

    const statusIcons = {
      pending: "⏳",
      approved: "✓",
      rejected: "✗",
      executing: "⚙️",
      completed: "✓",
      error: "⚠️",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "border-2 rounded-lg p-4 my-2 transition-all",
          statusColors[status],
          className
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{statusIcons[status]}</span>
            <span className="font-semibold text-sm">
              Tool Call:{" "}
              <code className="text-xs bg-black/10 px-1 py-0.5 rounded">
                {name}
              </code>
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>

        <div className="text-xs text-muted-foreground mb-2">
          Status: <span className="font-medium capitalize">{status}</span>
        </div>

        {isExpanded && (
          <div className="mb-3">
            <div className="text-xs font-medium mb-1">Arguments:</div>
            <pre className="text-xs bg-black/5 dark:bg-white/5 p-2 rounded overflow-x-auto">
              {JSON.stringify(args, null, 2)}
            </pre>
          </div>
        )}

        {requireApproval && status === "pending" && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onApprove?.(id)}
              className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Approve
            </button>
            <button
              onClick={() => onReject?.(id)}
              className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Reject
            </button>
          </div>
        )}

        {status === "executing" && (
          <div className="flex items-center gap-2 mt-2">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-muted-foreground">Executing...</span>
          </div>
        )}

        {status === "completed" && result && isExpanded && (
          <div className="mt-3">
            <div className="text-xs font-medium mb-1">Result:</div>
            <pre className="text-xs bg-black/5 dark:bg-white/5 p-2 rounded overflow-x-auto max-h-48 overflow-y-auto">
              {typeof result === "string"
                ? result
                : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {status === "error" && error && (
          <div className="mt-2 text-xs text-red-600 dark:text-red-400">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}
      </div>
    );
  }
);

ToolCall.displayName = "ToolCall";
