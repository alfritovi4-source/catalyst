"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  frameById,
  frameRows,
  frames,
  invariantCaption,
  invariants,
} from "@/content/frames";

export function FramesSwitcher() {
  const [activeId, setActiveId] = React.useState(frames[0].id);
  const frame = frameById[activeId] ?? frames[0];
  const index = frames.findIndex((f) => f.id === frame.id);

  return (
    <div>
      <ToggleGroup
        value={[activeId]}
        onValueChange={(v) => {
          const next = v[0] as string | undefined;
          if (next) setActiveId(next);
        }}
        className="flex-wrap gap-2"
        aria-label="Рамка"
      >
        {frames.map((f) => (
          <ToggleGroupItem
            key={f.id}
            value={f.id}
            variant="outline"
            size="sm"
            className="rounded-full px-3.5 data-pressed:border-brand data-pressed:bg-brand/15 data-pressed:text-brand"
          >
            {f.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div
        className="relative mt-6 overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-8"
        aria-live="polite"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-field opacity-40" />
        <div key={frame.id} className="relative animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{frame.title}</h3>
            <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
              {index + 1} / {frames.length}
            </span>
          </div>
          <dl className="mt-6 divide-y divide-border/60">
            {frameRows.map((row) => (
              <div key={row.key} className="grid gap-1.5 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
                <dt className="font-mono text-[11px] tracking-widest text-brand uppercase sm:pt-1">
                  {row.label}
                </dt>
                <dd className="text-[1.02rem] leading-relaxed text-foreground/90">{frame[row.key]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-brand/40 bg-brand/5 p-6 sm:p-8">
        <p className="font-mono text-[11px] tracking-[0.2em] text-brand uppercase">Не двигается</p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {invariants.map((inv) => (
            <li key={inv.title} className="border-t border-brand/50 pt-3">
              <p className="font-display text-2xl font-semibold">{inv.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{inv.line}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-foreground/85">{invariantCaption}</p>
      </div>
    </div>
  );
}
