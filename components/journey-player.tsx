"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRightIcon, RotateCcwIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { sceneById } from "@/content/journey";
import { testimonies, type Testimony } from "@/content/testimonies";
import { zoneById } from "@/content/zones";
import {
  advance,
  currentZone,
  fillTemplate,
  renderText,
  rescueModeLabel,
  summarize,
  visibleChoices,
  HUB_SCENE,
  LOW_FUEL,
  START_SCENE,
  type Choice,
  type JourneyState,
  type Scene,
} from "@/lib/journey";
import {
  getServerSnapshot,
  getSnapshot,
  resetJourneyState,
  setJourneyState,
  subscribe,
} from "@/lib/journey-store";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const ARRIVAL_SCENES = new Set([START_SCENE, "arrival-next", "rules", "rules-harm"]);

type Deltas = { id: number; interest: number; fuel: number };

/** Под концовкой — не больше одного свидетельства, и только своей зоны. */
function testimonyForEnding(scene: Scene, state: JourneyState): Testimony | null {
  if (scene.ending !== "gone" && scene.ending !== "death") return null;
  if (scene.testimony === false) return null;
  const zone = currentZone(state, sceneById);
  if (!zone) return null;
  const tagged = testimonies.filter((t) => t.zone === zone);
  if (tagged.length === 0) return null;
  const preferred = typeof scene.testimony === "string" ? scene.testimony : zoneById[zone].testimony;
  if (!preferred) return null;
  return tagged.find((t) => t.id === preferred) ?? null;
}

function formatDelta(n: number) {
  return n > 0 ? `+${n}` : `−${Math.abs(n)}`;
}

function StatBar({
  label,
  sub,
  value,
  delta,
  tone,
  low,
}: {
  label: string;
  sub: string;
  value: number;
  delta?: { id: number; value: number };
  tone: "brand" | "teal";
  low?: boolean;
}) {
  return (
    <Progress
      value={value}
      className={cn(
        "gap-y-2 [&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-track]]:bg-muted/80",
        tone === "brand"
          ? "[&_[data-slot=progress-indicator]]:bg-brand"
          : "[&_[data-slot=progress-indicator]]:bg-[oklch(0.72_0.08_200)]",
        low && "[&_[data-slot=progress-indicator]]:bg-rose-400",
      )}
    >
      <div className="flex w-full items-baseline gap-2">
        <ProgressLabel className="text-sm font-medium">{label}</ProgressLabel>
        <span className="text-xs text-muted-foreground">{sub}</span>
        <span className="ml-auto flex items-baseline gap-2 font-mono text-sm tabular-nums">
          {delta && delta.value !== 0 ? (
            <span
              key={delta.id}
              className={cn(
                "animate-flash text-xs motion-reduce:animate-none",
                delta.value > 0 ? "text-emerald-300" : "text-rose-300",
              )}
              aria-hidden
            >
              {formatDelta(delta.value)}
            </span>
          ) : null}
          <span className={cn(low && "text-rose-300")}>{value}</span>
        </span>
      </div>
    </Progress>
  );
}

function whereLabel(state: JourneyState): string {
  if (ARRIVAL_SCENES.has(state.sceneId)) return "Прибытие";
  if (state.sceneId === HUB_SCENE) return "Перекрёсток";
  const zone = currentZone(state, sceneById);
  return zone ? zoneById[zone].title : "Между зонами";
}

export function JourneyPlayer() {
  const state = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const reduced = usePrefersReducedMotion();
  const [deltas, setDeltas] = React.useState<Deltas | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const tick = React.useRef(0);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  const scene = sceneById[state.sceneId] ?? sceneById[START_SCENE];
  const choices = visibleChoices(state, scene);
  const paragraphs = scene.special === "summary" ? summarize(state) : renderText(scene, state);
  const kicker = scene.kicker ? fillTemplate(scene.kicker, state) : null;
  const title = fillTemplate(scene.title, state);
  const isEnding = scene.ending === "gone" || scene.ending === "death";
  const isSummary = scene.special === "summary";
  const lowFuel = state.fuel <= LOW_FUEL;
  const endingTestimony = testimonyForEnding(scene, state);
  const showDose = state.flags.includes("drugs") && state.loop > 0;

  const afterChange = React.useCallback(() => {
    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      headingRef.current?.focus({ preventScroll: true });
    });
  }, [reduced]);

  const choose = React.useCallback(
    (choice: Choice) => {
      if (choice.href) return;
      const next = advance(state, sceneById, choice);
      tick.current += 1;
      setDeltas(
        next.steps === 0
          ? null
          : { id: tick.current, interest: next.interest - state.interest, fuel: next.fuel - state.fuel },
      );
      setJourneyState(next);
      afterChange();
    },
    [state, afterChange],
  );

  const restart = () => {
    resetJourneyState();
    setDeltas(null);
    setConfirmOpen(false);
    afterChange();
  };

  // Цифры 1–9 выбирают вариант — как в старых текстовых играх.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (document.querySelector("[data-slot=dialog-content], [data-slot=sheet-content]")) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > 9) return;
      const choice = choices[n - 1];
      if (!choice || choice.href) return;
      e.preventDefault();
      choose(choice);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choices, choose]);

  const visited = state.visitedZones.filter((z) => z !== "vosstanovlenie");

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(17rem,1fr)] lg:items-start lg:gap-10">
      {/* Сцена */}
      <div
        ref={panelRef}
        className={cn(
          "relative scroll-mt-24 overflow-hidden rounded-2xl border bg-card/60 p-6 sm:p-8 lg:p-10",
          isEnding ? "border-rose-400/30" : isSummary ? "border-brand/40" : "border-border/70",
        )}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-field opacity-50" />
        <p
          className="relative mb-5 flex flex-wrap gap-x-4 gap-y-1 border-b border-border/60 pb-4 font-mono text-[11px] tracking-wider text-muted-foreground uppercase lg:hidden"
          aria-hidden
        >
          <span>
            Интерес <span className="text-brand">{state.interest}</span>
          </span>
          <span>
            Топливо <span className={lowFuel ? "text-rose-300" : "text-foreground"}>{state.fuel}</span>
          </span>
          <span>
            Контур{" "}
            <span className={state.contour === "intact" ? "text-emerald-300" : "text-rose-300"}>
              {state.contour === "intact" ? "цел" : "задет"}
            </span>
          </span>
        </p>
        <article
          key={`${state.sceneId}-${state.steps}`}
          className="relative animate-rise motion-reduce:animate-none"
          aria-live="polite"
        >
          {kicker ? (
            <p
              className={cn(
                "font-mono text-[11px] tracking-[0.2em] uppercase",
                isEnding ? "text-rose-300" : "text-brand",
              )}
            >
              {kicker}
            </p>
          ) : null}
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="font-display mt-3 text-4xl leading-[1.05] font-semibold tracking-tight text-balance outline-none sm:text-5xl"
          >
            {title}
          </h2>

          <div className="prose-sandbox mt-6 max-w-2xl text-[1.05rem] text-foreground/90 sm:text-lg">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {endingTestimony ? (
            <aside
              className="mt-6 max-w-2xl rounded-xl border border-border/70 bg-background/40 px-4 py-3"
              aria-label="Свидетельство этой зоны"
            >
              <p className="font-mono text-[11px] tracking-widest text-brand uppercase">Свидетельство</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">«{endingTestimony.pull}»</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {endingTestimony.name}, {endingTestimony.role}
              </p>
              <Link
                href={`/svidetelstva#${endingTestimony.id}`}
                className="mt-2 inline-block text-sm text-brand underline underline-offset-4"
              >
                Полный текст на странице свидетельств
              </Link>
            </aside>
          ) : null}

          {isSummary && visited.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {visited.map((z) => (
                <Badge key={z} variant="outline" render={<Link href={`/zony#${z}`} />}>
                  {zoneById[z].title}
                </Badge>
              ))}
            </div>
          ) : null}

          <ol className="mt-8 grid gap-2.5" aria-label="Варианты">
            {choices.map((c, i) => (
              <li key={`${c.label}-${i}`}>
                {c.href ? (
                  <Link
                    href={c.href}
                    className="group flex w-full items-start gap-3 rounded-xl border border-border/80 bg-background/40 px-4 py-3 text-left transition-colors outline-none hover:border-brand/60 hover:bg-card focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="pt-0.5 font-mono text-xs text-muted-foreground">{i + 1}</span>
                    <span className="flex-1 text-[0.95rem] leading-snug">{fillTemplate(c.label, state)}</span>
                    <ArrowUpRightIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-brand" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => choose(c)}
                    className="group flex w-full items-start gap-3 rounded-xl border border-border/80 bg-background/40 px-4 py-3 text-left transition-colors outline-none hover:border-brand/60 hover:bg-card focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="pt-0.5 font-mono text-xs text-muted-foreground">{i + 1}</span>
                    <span className="flex-1">
                      <span className="block text-[0.95rem] leading-snug">{fillTemplate(c.label, state)}</span>
                      {c.hint ? (
                        <span className="mt-0.5 block text-xs text-muted-foreground">{c.hint}</span>
                      ) : null}
                    </span>
                  </button>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">
            Клавиши 1–{Math.min(choices.length, 9)} выбирают вариант. Путешествие сохраняется в этом
            браузере.
          </p>
        </article>
      </div>

      {/* Панель состояния */}
      <aside
        className="rounded-2xl border border-border/70 bg-[oklch(0.12_0.008_60)] p-5 lg:sticky lg:top-24 sm:p-6"
        aria-label="Состояние путешествия"
      >
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            Первый год · шаг {state.steps}
          </p>
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogTrigger render={<Button size="xs" variant="ghost" />}>
              <RotateCcwIcon data-icon="inline-start" />
              Начать заново
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Начать заново?</DialogTitle>
                <DialogDescription>
                  Первый год будет стёрт: зоны, контракт, режим спасения, интерес и топливо. Никакого
                  приговора — просто другой первый день.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Остаться</DialogClose>
                <Button onClick={restart}>Начать заново</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-6 space-y-5">
          <StatBar
            label="Интерес"
            sub="дикий компас"
            value={state.interest}
            delta={deltas ? { id: deltas.id, value: deltas.interest } : undefined}
            tone="brand"
          />
          <StatBar
            label="Топливо"
            sub="восполняемо"
            value={state.fuel}
            delta={deltas ? { id: deltas.id, value: deltas.fuel } : undefined}
            tone="teal"
            low={lowFuel}
          />
        </div>

        <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm">
          <dt className="text-muted-foreground">Контур</dt>
          <dd className="flex items-center gap-2">
            <span
              aria-hidden
              className={cn(
                "inline-block size-2 rounded-full",
                state.contour === "intact" ? "bg-emerald-300" : "bg-rose-400",
              )}
            />
            {state.contour === "intact" ? "цел" : "задет"}
          </dd>
          <dt className="text-muted-foreground">Контракт с собой</dt>
          <dd>{state.contract === null ? "не решён" : state.contract ? "да" : "нет"}</dd>
          <dt className="text-muted-foreground">Режим спасения</dt>
          <dd>{state.rescueMode ? rescueModeLabel[state.rescueMode] : "не выбран"}</dd>
          <dt className="text-muted-foreground">Где ты</dt>
          <dd>{whereLabel(state)}</dd>
          {showDose ? (
            <>
              <dt className="text-muted-foreground">Доза</dt>
              <dd>Раз {state.loop}</dd>
            </>
          ) : null}
        </dl>

        <div className="mt-6 border-t border-border/60 pt-5">
          <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
            Зоны · {visited.length} из 9
          </p>
          {visited.length ? (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {visited.map((z) => (
                <Badge key={z} variant="secondary" className="font-normal">
                  {zoneById[z].title}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Пока ни одной. Почти все начинают с одной и той же.</p>
          )}
          {state.visitedZones.includes("vosstanovlenie") ? (
            <p className="mt-3 text-xs text-muted-foreground">Ты бывал в Восстановлении. Вина не начислена.</p>
          ) : null}
        </div>

        {lowFuel && scene.id !== "recovery" ? (
          <p className="mt-5 rounded-lg border border-rose-400/30 bg-rose-400/5 p-3 text-xs leading-relaxed text-rose-200/90">
            Топливо почти на нуле. Хотеть ты ещё хочешь; идти — скоро не сможешь. Шлюз предложит
            восполнить — и не тронет интерес.
          </p>
        ) : null}
      </aside>
    </div>
  );
}
