import * as React from "react";
import { cn } from "@/lib/utils";

export function QuoteBlock({
  children,
  cite,
  size = "md",
  className,
}: {
  children: React.ReactNode;
  cite?: React.ReactNode;
  size?: "md" | "lg" | "xl";
  className?: string;
}) {
  return (
    <figure className={cn("relative border-l-2 border-brand/60 pl-6 sm:pl-8", className)}>
      <blockquote
        className={cn(
          "font-display leading-snug font-medium text-balance",
          size === "md" && "text-2xl",
          size === "lg" && "text-3xl sm:text-4xl",
          size === "xl" && "text-4xl sm:text-5xl lg:text-6xl",
        )}
      >
        {children}
      </blockquote>
      {cite ? (
        <figcaption className="mt-4 text-sm text-muted-foreground">{cite}</figcaption>
      ) : null}
    </figure>
  );
}
