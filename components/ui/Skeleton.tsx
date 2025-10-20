import { cn } from "../../lib/utils";
import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  animation?: "pulse" | "wave" | "none";
  width?: string | number;
  height?: string | number;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = "rectangular",
      animation = "pulse",
      width,
      height,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      text: "h-4 w-full rounded",
      circular: "rounded-full",
      rectangular: "rounded-lg",
    };

    const animationClasses = {
      pulse: "animate-pulse",
      wave: "shimmer",
      none: "",
    };

    const style = {
      ...(width && { width: typeof width === "number" ? `${width}px` : width }),
      ...(height && {
        height: typeof height === "number" ? `${height}px` : height,
      }),
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-gray-200 dark:bg-gray-700",
          variantClasses[variant],
          animationClasses[animation],
          className
        )}
        style={style}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

// Pre-built skeleton layouts
export const SkeletonCard = () => (
  <div className="border dark:border-gray-700 rounded-lg p-6 space-y-4">
    <Skeleton variant="rectangular" height={200} />
    <div className="space-y-2">
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="40%" />
    </div>
  </div>
);

export const SkeletonPost = () => (
  <div className="space-y-4">
    <Skeleton variant="rectangular" height={300} className="w-full" />
    <div className="space-y-3">
      <Skeleton variant="text" width="80%" height={32} />
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="20%" />
        </div>
      </div>
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="90%" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
        <Skeleton variant="rectangular" width={80} height={32} />
      </div>
    ))}
  </div>
);

export const SkeletonDashboard = () => (
  <div className="space-y-6">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="border dark:border-gray-700 rounded-lg p-6 space-y-3"
        >
          <Skeleton variant="text" width="50%" />
          <Skeleton variant="text" width="70%" height={36} />
        </div>
      ))}
    </div>

    {/* Chart */}
    <Skeleton variant="rectangular" height={300} />

    {/* Table */}
    <SkeletonTable rows={8} />
  </div>
);
