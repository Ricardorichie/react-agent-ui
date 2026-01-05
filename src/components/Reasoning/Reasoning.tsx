import * as React from "react";
import { cn } from "../../lib/utils";

export interface ReasoningStep {
  id: string;
  title: string;
  content: string;
  timestamp?: string;
  type?: "thinking" | "planning" | "executing" | "reflection";
}

export interface ReasoningProps {
  steps: ReasoningStep[];
  isThinking?: boolean;
  className?: string;
}

export const Reasoning = React.forwardRef<HTMLDivElement, ReasoningProps>(
  ({ steps, isThinking = false, className }, ref) => {
    const [expandedSteps, setExpandedSteps] = React.useState<Set<string>>(
      new Set()
    );

    const toggleStep = (id: string) => {
      setExpandedSteps((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    };

    const typeIcons = {
      thinking: "💭",
      planning: "📋",
      executing: "⚙️",
      reflection: "🔍",
    };

    const typeColors = {
      thinking: "border-blue-300 bg-blue-50 dark:bg-blue-950/20",
      planning: "border-purple-300 bg-purple-50 dark:bg-purple-950/20",
      executing: "border-orange-300 bg-orange-50 dark:bg-orange-950/20",
      reflection: "border-green-300 bg-green-50 dark:bg-green-950/20",
    };

    if (steps.length === 0 && !isThinking) {
      return null;
    }

    return (
      <div ref={ref} className={cn("my-3", className)}>
        <div className="border border-dashed border-muted-foreground/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              {isThinking ? "🤔 Thinking..." : "🧠 Reasoning Steps"}
            </span>
          </div>

          {isThinking && steps.length === 0 && (
            <div className="flex items-center gap-2 py-2">
              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground">
                Processing...
              </span>
            </div>
          )}

          {steps.length > 0 && (
            <div className="space-y-2">
              {steps.map((step, index) => {
                const isExpanded = expandedSteps.has(step.id);
                const stepType = step.type || "thinking";

                return (
                  <div
                    key={step.id}
                    className={cn(
                      "border rounded p-2 transition-all",
                      typeColors[stepType]
                    )}
                  >
                    <button
                      onClick={() => toggleStep(step.id)}
                      className="w-full flex items-start justify-between text-left"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-base">{typeIcons[stepType]}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {step.title || `Step ${index + 1}`}
                          </div>
                          {step.timestamp && (
                            <div className="text-xs text-muted-foreground">
                              {step.timestamp}
                            </div>
                          )}
                        </div>
                      </div>
                      <svg
                        className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform flex-shrink-0",
                          isExpanded && "rotate-180"
                        )}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-current/10">
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {step.content}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Reasoning.displayName = "Reasoning";
