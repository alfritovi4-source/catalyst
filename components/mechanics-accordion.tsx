"use client";

import * as React from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Mechanic } from "@/content/mechanics";
import { glossary } from "@/content/glossary";

const termLabel = Object.fromEntries(glossary.map((g) => [g.slug, g.term]));

export function MechanicsAccordion({ mechanics }: { mechanics: Mechanic[] }) {
  const [value, setValue] = React.useState<string[]>([]);

  React.useEffect(() => {
    const openFromHash = () => {
      const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (hash && mechanics.some((m) => m.id === hash)) {
        setValue((prev) => (prev.includes(hash) ? prev : [...prev, hash]));
        requestAnimationFrame(() => {
          document.getElementById(hash)?.scrollIntoView({ block: "start" });
        });
      }
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [mechanics]);

  return (
    <Accordion
      multiple
      hiddenUntilFound
      value={value}
      onValueChange={(v) => setValue(v as string[])}
    >
      {mechanics.map((m, i) => (
        <AccordionItem key={m.id} value={m.id} id={m.id} className="scroll-mt-28 py-1">
          <AccordionTrigger className="items-baseline gap-4 py-4 hover:no-underline">
            <span className="font-mono text-xs text-brand tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1 pr-2">
              <span className="font-display text-2xl leading-tight font-semibold">{m.title}</span>
              <span className="text-sm font-normal text-muted-foreground">{m.summary}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pl-8 sm:pl-10">
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                  Как работает
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">{m.how}</p>
              </div>
              <div className="rounded-lg border border-brand/30 bg-brand/5 p-4">
                <p className="font-mono text-[11px] tracking-widest text-brand uppercase">
                  Почему именно так
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">{m.why}</p>
              </div>
              <div>
                <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                  Пример
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground italic">
                  {m.example}
                </p>
              </div>
            </div>
            {m.terms && m.terms.length > 0 ? (
              <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>Словарь:</span>
                {m.terms.map((slug) => (
                  <Link
                    key={slug}
                    href={`/slovar#${slug}`}
                    className="underline decoration-brand/60 decoration-dotted underline-offset-3 hover:text-brand"
                  >
                    {termLabel[slug] ?? slug}
                  </Link>
                ))}
              </p>
            ) : null}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
