"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { ChevronDownIcon, ChevronUpIcon, MapPinIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Floor } from "@/content/floors";

const ROW_HEIGHT = 64;

export function FloorsNavigator({ floors }: { floors: Floor[] }) {
  // floors are ordered top (+2) to bottom (−2…)
  const hereIndex = Math.max(0, floors.findIndex((f) => f.here));
  const [index, setIndex] = React.useState(hereIndex);
  const floor = floors[index];

  const goUp = () => setIndex((i) => Math.max(0, i - 1));
  const goDown = () => setIndex((i) => Math.min(floors.length - 1, i + 1));

  const onValueChange = (value: unknown) => {
    const next = floors.findIndex((f) => String(f.level) === String(value));
    if (next >= 0) setIndex(next);
  };

  return (
    <TabsPrimitive.Root
      value={String(floor.level)}
      onValueChange={onValueChange}
      orientation="vertical"
      className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-14"
    >
      <div>
        <div className="rounded-2xl border border-border/70 bg-card/70 p-3">
          <div className="flex items-center justify-between px-2 pt-1 pb-3">
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              Панель лифта
            </p>
            <p className="font-mono text-xs text-brand tabular-nums">этаж {floor.label}</p>
          </div>

          <div className="relative flex gap-3">
            <div className="relative w-2 shrink-0 rounded-full bg-muted" aria-hidden>
              <span
                className="absolute left-1/2 w-3 -translate-x-1/2 rounded-full bg-brand shadow-[0_0_16px_color-mix(in_oklch,var(--brand)_60%,transparent)] transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none"
                style={{
                  height: ROW_HEIGHT - 16,
                  top: 8,
                  transform: `translate(-50%, ${index * ROW_HEIGHT}px)`,
                }}
              />
            </div>

            <TabsPrimitive.List
              aria-label="Этажи"
              className="flex flex-1 flex-col"
            >
              {floors.map((f, i) => (
                <TabsPrimitive.Tab
                  key={f.level}
                  value={String(f.level)}
                  style={{ height: ROW_HEIGHT }}
                  className={cn(
                    "group/floor flex items-center gap-4 rounded-xl px-3 text-left transition-colors outline-none hover:bg-muted/70 focus-visible:ring-3 focus-visible:ring-ring/50",
                    i === index && "bg-muted",
                    f.faded && i !== index && "opacity-50",
                  )}
                >
                  <span
                    className={cn(
                      "font-display w-12 shrink-0 text-3xl leading-none tabular-nums",
                      i === index ? "text-brand" : "text-muted-foreground",
                    )}
                  >
                    {f.label}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{f.title}</span>
                    <span className="truncate text-xs text-muted-foreground">{f.subtitle}</span>
                  </span>
                  {f.here ? (
                    <MapPinIcon className="ml-auto size-4 shrink-0 text-brand" aria-label="Ты здесь" />
                  ) : null}
                </TabsPrimitive.Tab>
              ))}
            </TabsPrimitive.List>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/70 pt-3">
            <Button variant="outline" onClick={goUp} disabled={index === 0}>
              <ChevronUpIcon data-icon="inline-start" />
              Подняться
            </Button>
            <Button variant="outline" onClick={goDown} disabled={index === floors.length - 1}>
              <ChevronDownIcon data-icon="inline-start" />
              Спуститься
            </Button>
          </div>
        </div>
        <p className="mt-3 px-1 text-xs text-muted-foreground">
          Стрелки вверх и вниз на клавиатуре тоже работают, когда панель в фокусе.
        </p>
      </div>

      <div className="min-w-0">
        {floors.map((f) => (
          <TabsPrimitive.Panel
            key={f.level}
            value={String(f.level)}
            className="outline-none data-[hidden]:hidden"
          >
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display text-5xl leading-none text-brand tabular-nums sm:text-6xl">
                  {f.label}
                </span>
                {f.here ? (
                  <Badge className="bg-brand/15 text-brand">
                    <MapPinIcon data-icon="inline-start" />
                    Где ты сейчас
                  </Badge>
                ) : null}
                {f.faded ? <Badge variant="outline">без нижней границы</Badge> : null}
              </div>
              <h2 className="font-display mt-4 text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
                {f.title}
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">{f.subtitle}</p>
              <p className="mt-6 text-[1.05rem] leading-relaxed text-foreground/90">{f.description}</p>

              <dl className="mt-8 grid gap-5 md:grid-cols-2">
                <div className="rounded-lg border border-border/70 p-5">
                  <dt className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                    Кто здесь живёт
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-foreground/90">{f.residents}</dd>
                </div>
                <div className="rounded-lg border border-brand/30 bg-brand/5 p-5">
                  <dt className="font-mono text-[11px] tracking-widest text-brand uppercase">
                    Что здесь значит Закон Контура
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-foreground/90">{f.lawHere}</dd>
                </div>
              </dl>
            </div>
          </TabsPrimitive.Panel>
        ))}
      </div>
    </TabsPrimitive.Root>
  );
}
