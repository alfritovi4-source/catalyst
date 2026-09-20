"use client";

import * as React from "react";
import Link from "next/link";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import type { Testimony } from "@/content/testimonies";
import { zoneById, type ZoneId } from "@/content/zones";

export function TestimoniesList({ testimonies }: { testimonies: Testimony[] }) {
  const [filter, setFilter] = React.useState<ZoneId | "all">("all");

  const zonesPresent = React.useMemo(() => {
    const ids = new Set(testimonies.map((t) => t.zone));
    return [...ids].map((id) => zoneById[id]);
  }, [testimonies]);

  const visible = filter === "all" ? testimonies : testimonies.filter((t) => t.zone === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Зона:</span>
        <ToggleGroup
          value={[filter]}
          onValueChange={(v) => {
            const next = v[0] as ZoneId | "all" | undefined;
            setFilter(next ?? "all");
          }}
          className="flex-wrap"
          aria-label="Фильтр по зоне"
        >
          <ToggleGroupItem value="all" variant="outline" size="sm" className="rounded-full px-3">
            Все
          </ToggleGroupItem>
          {zonesPresent.map((zone) => (
            <ToggleGroupItem
              key={zone.id}
              value={zone.id}
              variant="outline"
              size="sm"
              className="rounded-full px-3 data-pressed:border-brand/60 data-pressed:bg-brand/10 data-pressed:text-brand"
            >
              {zone.title}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">
        {visible.length} из {testimonies.length}
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {visible.map((t) => (
          <article
            key={t.id}
            id={t.id}
            className="flex scroll-mt-28 flex-col rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-7"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                render={<Link href={`/zony#${t.zone}`} />}
                className="hover:border-brand/60 hover:text-brand"
              >
                {zoneById[t.zone].title}
              </Badge>
              {t.toldBy ? (
                <span className="text-xs text-muted-foreground italic">{t.toldBy}</span>
              ) : null}
            </div>
            <h2 className="font-display mt-4 text-3xl leading-tight font-semibold">{t.name}</h2>
            <p className="text-sm text-muted-foreground">{t.role}</p>
            <p className="font-display mt-5 text-xl leading-snug text-foreground/90 italic">
              «{t.pull}»
            </p>
            <div className="mt-5 space-y-3 text-[0.98rem] leading-relaxed text-foreground/85">
              {t.text.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
