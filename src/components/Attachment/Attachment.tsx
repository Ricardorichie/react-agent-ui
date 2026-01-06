import * as React from "react";
import { cn } from "../../lib/utils";

export interface AttachmentProps {
  id: string;
  type: "image" | "file" | "audio" | "video";
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
  onRemove?: (id: string) => void;
  className?: string;
}

export const Attachment = React.forwardRef<HTMLDivElement, AttachmentProps>(
  ({ id, type, url, name, size, mimeType, onRemove, className }, ref) => {
    const formatSize = (bytes?: number) => {
      if (!bytes) return "";
      const kb = bytes / 1024;
      if (kb < 1024) return `${kb.toFixed(1)} KB`;
      return `${(kb / 1024).toFixed(1)} MB`;
    };

    const getFileIcon = () => {
      switch (type) {
        case "image":
          return "🖼️";
        case "audio":
          return "🎵";
        case "video":
          return "🎬";
        default:
          return "📄";
      }
    };

    return (
      <div ref={ref} className={cn("relative group", className)}>
        {type === "image" ? (
          <div className="relative rounded-lg overflow-hidden border border-border bg-muted">
            <img
              src={url}
              alt={name}
              className="max-w-full max-h-64 object-contain"
              loading="lazy"
            />
            {onRemove && (
              <button
                onClick={() => onRemove(id)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove attachment"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        ) : type === "audio" ? (
          <div className="border border-border rounded-lg p-3 bg-muted">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{getFileIcon()}</span>
              <span className="text-sm font-medium truncate flex-1">
                {name}
              </span>
              {onRemove && (
                <button
                  onClick={() => onRemove(id)}
                  className="p-1 hover:bg-background rounded"
                  aria-label="Remove attachment"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <audio controls className="w-full" src={url}>
              Your browser does not support the audio element.
            </audio>
          </div>
        ) : type === "video" ? (
          <div className="relative rounded-lg overflow-hidden border border-border bg-muted">
            <video
              controls
              className="max-w-full max-h-64"
              src={url}
              preload="metadata"
            >
              Your browser does not support the video element.
            </video>
            {onRemove && (
              <button
                onClick={() => onRemove(id)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove attachment"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="border border-border rounded-lg p-3 bg-muted flex items-center gap-3">
            <span className="text-2xl">{getFileIcon()}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{name}</div>
              {size && (
                <div className="text-xs text-muted-foreground">
                  {formatSize(size)}
                  {mimeType && ` • ${mimeType}`}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <a
                href={url}
                download={name}
                className="p-1.5 hover:bg-background rounded"
                aria-label="Download attachment"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </a>
              {onRemove && (
                <button
                  onClick={() => onRemove(id)}
                  className="p-1.5 hover:bg-background rounded"
                  aria-label="Remove attachment"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Attachment.displayName = "Attachment";
