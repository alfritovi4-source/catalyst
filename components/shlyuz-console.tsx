"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRightIcon, CornerDownLeftIcon, RotateCcwIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  requestCategories,
  type RequestCategory,
  type ShlyuzRequest,
} from "@/content/requests";
import {
  evaluateRequest,
  matchRequest,
  type Verdict,
  type VerdictTone,
} from "@/lib/shlyuz";

const STEP_DELAY = 650;

const toneClass: Record<VerdictTone, string> = {
  ok: "text-emerald-300",
  warn: "text-brand",
  bad: "text-rose-300",
  neutral: "text-foreground",
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function Typewriter({ text, active, speed = 14 }: { text: string; active: boolean; speed?: number }) {
  const [shown, setShown] = React.useState(active ? 0 : text.length);
  React.useEffect(() => {
    if (!active) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 2;
      setShown(Math.min(i, text.length));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, active, speed]);
  return <>{active ? text.slice(0, shown) : text}</>;
}

type Phase =
  | { kind: "idle" }
  | { kind: "clarify"; question: string; categories?: RequestCategory[] }
  | { kind: "evaluating"; request: ShlyuzRequest; verdicts: Verdict[]; revealed: number };

export function ShlyuzConsole({ requests }: { requests: ShlyuzRequest[] }) {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = React.useState<Phase>({ kind: "idle" });
  const [text, setText] = React.useState("");
  const [visibleCategories, setVisibleCategories] = React.useState<RequestCategory[] | null>(null);
  const outputRef = React.useRef<HTMLDivElement>(null);

  const start = React.useCallback(
    (request: ShlyuzRequest) => {
      const verdicts = evaluateRequest(request);
      setPhase({
        kind: "evaluating",
        request,
        verdicts,
        revealed: reduced ? verdicts.length : 0,
      });
      setVisibleCategories(null);
      requestAnimationFrame(() => {
        outputRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
      });
    },
    [reduced],
  );

  // Staggered reveal of verdict steps.
  React.useEffect(() => {
    if (phase.kind !== "evaluating") return;
    if (phase.revealed >= phase.verdicts.length) return;
    const id = window.setTimeout(() => {
      setPhase((p) =>
        p.kind === "evaluating" ? { ...p, revealed: Math.min(p.revealed + 1, p.verdicts.length) } : p,
      );
    }, STEP_DELAY);
    return () => window.clearTimeout(id);
  }, [phase]);

  const submitText = (e: React.FormEvent) => {
    e.preventDefault();
    const result = matchRequest(text, requests);
    if (result.kind === "match") {
      start(result.request);
    } else {
      setPhase({ kind: "clarify", question: result.question });
    }
  };

  const reset = () => {
    setPhase({ kind: "idle" });
    setText("");
    setVisibleCategories(null);
  };

  const categories = visibleCategories ?? [...requestCategories];
  const grouped = categories.map((c) => ({
    category: c,
    items: requests.filter((r) => r.category === c),
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10">
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-field opacity-60" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              Запрос
            </p>
            <p className="font-mono text-[11px] text-brand">{requests.length} готовых формулировок</p>
          </div>

          <form onSubmit={submitText} className="mt-4 flex gap-2">
            <label htmlFor="shlyuz-input" className="sr-only">
              Свободный запрос
            </label>
            <Input
              id="shlyuz-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Или напиши своими словами: «убери тревогу», «хочу Эверест себе»…"
              className="h-10 font-mono text-sm"
              autoComplete="off"
            />
            <Button type="submit" className="h-10 shrink-0" variant="secondary" aria-label="Отправить запрос">
              <CornerDownLeftIcon />
            </Button>
          </form>

          {phase.kind === "clarify" ? (
            <div className="mt-4 rounded-lg border border-brand/40 bg-brand/5 p-4" role="status">
              <p className="font-mono text-sm text-brand">{phase.question}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { label: "Про меня", categories: ["Тело", "Сознание", "Опасность"] as RequestCategory[] },
                  { label: "Про других", categories: ["Другие", "Миры"] as RequestCategory[] },
                  { label: "Про систему", categories: ["Ресурсы", "Система"] as RequestCategory[] },
                ].map((opt) => (
                  <Button
                    key={opt.label}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setVisibleCategories(opt.categories);
                      setPhase({ kind: "idle" });
                    }}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}

          {visibleCategories ? (
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Показаны категории: {visibleCategories.join(", ")}</span>
              <button
                type="button"
                className="underline underline-offset-3 hover:text-foreground"
                onClick={() => setVisibleCategories(null)}
              >
                все
              </button>
            </div>
          ) : null}

          <div className="mt-6 space-y-5">
            {grouped.map((group) => (
              <div key={group.category}>
                <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                  {group.category}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {group.items.map((r) => {
                    const active = phase.kind === "evaluating" && phase.request.id === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => start(r)}
                        aria-pressed={active}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-left text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                          active
                            ? "border-brand bg-brand/15 text-brand"
                            : "border-border/80 text-foreground/85 hover:border-brand/60 hover:text-foreground",
                        )}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={outputRef}
        className="scroll-mt-24 rounded-2xl border border-border/70 bg-[oklch(0.12_0.008_60)] p-5 font-mono text-sm sm:p-6"
        aria-live="polite"
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">Шлюз · оценка</p>
          {phase.kind === "evaluating" ? (
            <Button size="xs" variant="ghost" onClick={reset}>
              <RotateCcwIcon data-icon="inline-start" />
              Новый запрос
            </Button>
          ) : null}
        </div>

        {phase.kind !== "evaluating" ? (
          <div className="mt-6 space-y-3 text-muted-foreground">
            <p>
              <span className="text-brand">&gt;</span> Шлюз слушает.
            </p>
            <p>
              <span className="text-brand">&gt;</span> Выбери формулировку слева или напиши свою. Оценка
              пройдёт по одной и той же цепочке: контур, обратимость, воля, траектория, решение,
              правило.
            </p>
            <p>
              <span className="text-brand">&gt;</span> Никаких лекций. Только данные и решение.
              <span className="ml-1 inline-block w-2 animate-blink bg-brand motion-reduce:animate-none">
                &nbsp;
              </span>
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-muted-foreground">
              <span className="text-brand">&gt;</span> {phase.request.prompt}
            </p>
            <ol className="mt-5 space-y-4">
              {phase.verdicts.slice(0, phase.revealed).map((v, i) => {
                const isLast = i === phase.revealed - 1;
                const isDecision = v.step === "decision";
                return (
                  <li
                    key={v.step}
                    className={cn(
                      "grid gap-1 border-l-2 pl-4 sm:grid-cols-[8.5rem_1fr] sm:gap-4",
                      reduced ? "" : "animate-in fade-in-0 slide-in-from-left-2 duration-300",
                      isDecision ? "border-brand" : "border-border",
                    )}
                  >
                    <span className="text-[11px] tracking-widest text-muted-foreground uppercase sm:pt-1">
                      {v.label}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "leading-relaxed",
                          toneClass[v.tone],
                          isDecision && "text-base font-semibold",
                          v.step === "trajectory" && "text-foreground/90",
                        )}
                      >
                        {v.href ? (
                          <Link href={v.href} className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-brand">
                            {v.value}
                            <ArrowRightIcon className="size-3.5" />
                          </Link>
                        ) : (
                          <Typewriter text={v.value} active={isLast && !reduced} />
                        )}
                      </p>
                      {v.note ? (
                        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                          <Typewriter text={v.note} active={isLast && !reduced} speed={8} />
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
            {phase.revealed < phase.verdicts.length ? (
              <p className="mt-5 text-muted-foreground">
                <span className="text-brand">&gt;</span>
                <span className="ml-2 inline-block w-2 animate-blink bg-brand motion-reduce:animate-none">
                  &nbsp;
                </span>
              </p>
            ) : (
              <p className="mt-6 text-xs text-muted-foreground">
                Оценка детерминирована: одна и та же формулировка всегда даёт один и тот же ответ.
                Правило ведёт в Кодекс, где объяснено, почему именно так.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
