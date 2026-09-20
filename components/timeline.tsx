import * as React from "react";
import type { OriginStage } from "@/content/origin";

export function Timeline({ stages }: { stages: OriginStage[] }) {
  return (
    <ol className="relative">
      <span
        aria-hidden
        className="absolute top-3 bottom-3 left-[11px] w-px bg-gradient-to-b from-brand/70 via-border to-border/30 sm:left-[15px]"
      />
      {stages.map((stage, i) => (
        <li
          key={stage.id}
          id={stage.id}
          className="relative scroll-mt-28 grid gap-x-8 gap-y-3 pb-14 pl-10 last:pb-0 sm:pl-14 lg:grid-cols-[10rem_1fr]"
        >
          <span
            aria-hidden
            className="absolute top-1.5 left-0 flex size-6 items-center justify-center rounded-full border border-brand/60 bg-background font-mono text-[10px] text-brand tabular-nums sm:size-8 sm:text-xs"
          >
            {i + 1}
          </span>
          <div className="pt-0.5">
            <p className="font-mono text-xs tracking-[0.2em] text-brand uppercase">{stage.era}</p>
          </div>
          <div>
            <h3 className="font-display text-3xl leading-tight font-semibold text-balance">
              {stage.title}
            </h3>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-foreground/90">{stage.text}</p>
            {stage.aside ? (
              <p className="mt-4 border-l-2 border-brand/50 pl-4 text-sm leading-relaxed text-muted-foreground">
                {stage.aside}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
