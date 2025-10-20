import { cn } from "../../lib/utils";
import React from "react";

type CardVariant = "default" | "glass" | "bordered" | "gradient" | "elevated";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: boolean;
  shimmer?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      hover = false,
      shimmer = false,
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default:
        "bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-sm",
      glass: "glass border border-white/20 shadow-xl",
      bordered:
        "bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-gray-600",
      gradient:
        "bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border border-transparent bg-clip-padding shadow-lg",
      elevated:
        "bg-white dark:bg-slate-800 shadow-xl hover:shadow-2xl transition-shadow duration-300",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl overflow-hidden transition-all duration-200",
          variantClasses[variant],
          hover && "hover:shadow-lg hover:-translate-y-1",
          shimmer && "shimmer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));

CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight dark:text-white",
      className
    )}
    {...props}
  />
));

CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
    {...props}
  />
));

CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));

CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));

CardFooter.displayName = "CardFooter";
