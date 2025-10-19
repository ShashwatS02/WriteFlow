"use client";
import React from "react";
import { cn } from "../lib/utils";

type CategoryBadgeProps = {
  category?: {
    id: number;
    name: string;
    slug: string;
    colorVariant: string | null | undefined;
  };
  size?: "sm" | "md" | "lg";
  onClick?: (e?: any) => void;
  selected?: boolean;
  className?: string;
  // legacy/alternate props
  label?: string;
  color?: string | null;
};

// Color mapping for category badges
const colorClasses = {
  gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  orange:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  yellow:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  lime: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200",
  green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  emerald:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  teal: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  cyan: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  sky: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  indigo:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  violet:
    "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
  purple:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  fuchsia:
    "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200",
  pink: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  rose: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
};

const sizeClasses = {
  sm: "text-xs px-2 py-1 text-xs",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-2",
};

export default function CategoryBadge({
  category,
  size = "md",
  onClick,
  selected,
  className,
  label,
  color,
}: CategoryBadgeProps) {
  const variant = category?.colorVariant ?? color ?? "gray";
  const colorClass =
    colorClasses[variant as keyof typeof colorClasses] || colorClasses.gray;
  const sizeClass = sizeClasses[size];

  const baseClasses = cn(
    "inline-flex items-center rounded-full font-medium transition-colors",
    sizeClass,
    selected
      ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-white"
      : colorClass,
    onClick && "cursor-pointer hover:opacity-75",
    className
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={baseClasses}
        aria-pressed={selected}
      >
        {label || category?.name}
      </button>
    );
  }

  return <span className={baseClasses}>{label || category?.name}</span>;
}
