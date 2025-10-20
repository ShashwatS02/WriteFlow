import { cn } from "../../lib/utils";
import React from "react";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      dot,
      removable,
      onRemove,
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default:
        "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700",
      primary:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
      success:
        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800",
      warning:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
      danger:
        "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800",
      info: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800",
      outline:
        "bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200",
    };

    const sizeClasses = {
      sm: "text-xs px-2 py-0.5 gap-1",
      md: "text-sm px-2.5 py-1 gap-1.5",
      lg: "text-base px-3 py-1.5 gap-2",
    };

    const dotColors = {
      default: "bg-gray-500",
      primary: "bg-blue-500",
      success: "bg-green-500",
      warning: "bg-amber-500",
      danger: "bg-red-500",
      info: "bg-cyan-500",
      outline: "bg-gray-500",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-medium rounded-full transition-colors",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              dotColors[variant]
            )}
          />
        )}
        {children}
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = "Badge";
