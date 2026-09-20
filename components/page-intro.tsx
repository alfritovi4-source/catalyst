import * as React from "react";
import { cn } from "@/lib/utils";

type PageIntroProps = {
  eyebrow?: string;
  title: string;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function PageIntro({ eyebrow, title, lead, children, className }: PageIntroProps) {
  return (
    <div className={cn("relative overflow-hidden border-b border-border/60", className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0 glow-brand" />
      <div className="relative mx-auto w-full max-w-7xl px-4 pt-14 pb-12 sm:px-6 sm:pt-20 sm:pb-16 lg:px-8">
        {eyebrow ? (
          <p className="mb-4 font-mono text-xs tracking-[0.2em] text-brand uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display max-w-4xl text-5xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        {lead ? (
          <div className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {lead}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
