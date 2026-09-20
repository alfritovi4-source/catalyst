import type { ZoneId } from "@/content/zones";

export type RescueMode = "save" | "none" | "critical";
export type ContourState = "intact" | "touched";

export type JourneyState = {
  version: 1;
  sceneId: string;
  interest: number;
  fuel: number;
  contour: ContourState;
  contract: boolean | null;
  rescueMode: RescueMode | null;
  loop: number;
  flags: string[];
  visitedZones: ZoneId[];
  history: string[];
  returnTo: string | null;
  steps: number;
  lastRecoveryStep: number;
};

export type Condition = {
  flag?: string;
  notFlag?: string;
  visited?: ZoneId;
  notVisited?: ZoneId;
  visitedAtLeast?: number;
  contract?: boolean;
  rescueMode?: RescueMode;
  loopAtLeast?: number;
  loopBelow?: number;
  fuelBelow?: number;
  fuelAtLeast?: number;
  interestBelow?: number;
  interestAtLeast?: number;
  contour?: ContourState;
};

export type Effects = {
  interest?: number;
  fuel?: number;
  contour?: ContourState;
  contract?: boolean;
  rescueMode?: RescueMode;
  loop?: "inc" | "reset";
  setFlags?: string[];
  clearFlags?: string[];
};

export type Route = { when?: Condition; to: string };

export type Choice = {
  label: string;
  hint?: string;
  /** id сцены, массив условных маршрутов, "__return" или "__restart". */
  to: string | Route[];
  effects?: Effects;
  when?: Condition;
  /** Внешняя ссылка вместо перехода по сценам. */
  href?: string;
};

export type SceneEnding = "gone" | "death" | "year";

export type Scene = {
  id: string;
  title: string;
  kicker?: string;
  zone?: ZoneId;
  text: string[];
  variants?: { when: Condition; text: string[] }[];
  choices: Choice[];
  ending?: SceneEnding;
  special?: "summary";
};

export const STORAGE_KEY = "sandbox-journey";
export const START_SCENE = "arrival";
export const RECOVERY_SCENE = "recovery";
export const HUB_SCENE = "crossroads";
export const LOW_FUEL = 15;
const RECOVERY_COOLDOWN = 3;

export const rescueModeLabel: Record<RescueMode, string> = {
  save: "спасать",
  none: "не спасать",
  critical: "до критического",
};

export function initialState(): JourneyState {
  return {
    version: 1,
    sceneId: START_SCENE,
    interest: 60,
    fuel: 65,
    contour: "intact",
    contract: null,
    rescueMode: null,
    loop: 0,
    flags: [],
    visitedZones: [],
    history: [START_SCENE],
    returnTo: null,
    steps: 0,
    lastRecoveryStep: -100,
  };
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function checkCondition(state: JourneyState, cond?: Condition): boolean {
  if (!cond) return true;
  if (cond.flag !== undefined && !state.flags.includes(cond.flag)) return false;
  if (cond.notFlag !== undefined && state.flags.includes(cond.notFlag)) return false;
  if (cond.visited !== undefined && !state.visitedZones.includes(cond.visited)) return false;
  if (cond.notVisited !== undefined && state.visitedZones.includes(cond.notVisited)) return false;
  if (cond.visitedAtLeast !== undefined && state.visitedZones.length < cond.visitedAtLeast) return false;
  if (cond.contract !== undefined && state.contract !== cond.contract) return false;
  if (cond.rescueMode !== undefined && state.rescueMode !== cond.rescueMode) return false;
  if (cond.loopAtLeast !== undefined && state.loop < cond.loopAtLeast) return false;
  if (cond.loopBelow !== undefined && state.loop >= cond.loopBelow) return false;
  if (cond.fuelBelow !== undefined && state.fuel >= cond.fuelBelow) return false;
  if (cond.fuelAtLeast !== undefined && state.fuel < cond.fuelAtLeast) return false;
  if (cond.interestBelow !== undefined && state.interest >= cond.interestBelow) return false;
  if (cond.interestAtLeast !== undefined && state.interest < cond.interestAtLeast) return false;
  if (cond.contour !== undefined && state.contour !== cond.contour) return false;
  return true;
}

export function applyEffects(state: JourneyState, effects?: Effects): JourneyState {
  if (!effects) return state;
  const flags = new Set(state.flags);
  effects.setFlags?.forEach((f) => flags.add(f));
  effects.clearFlags?.forEach((f) => flags.delete(f));
  return {
    ...state,
    interest: clamp(state.interest + (effects.interest ?? 0)),
    fuel: clamp(state.fuel + (effects.fuel ?? 0)),
    contour: effects.contour ?? state.contour,
    contract: effects.contract ?? state.contract,
    rescueMode: effects.rescueMode ?? state.rescueMode,
    loop: effects.loop === "inc" ? state.loop + 1 : effects.loop === "reset" ? 0 : state.loop,
    flags: [...flags],
  };
}

export function resolveTarget(state: JourneyState, to: string | Route[]): string {
  if (typeof to === "string") return to;
  for (const route of to) {
    if (checkCondition(state, route.when)) return route.to;
  }
  return to[to.length - 1]?.to ?? HUB_SCENE;
}

export function visibleChoices(state: JourneyState, scene: Scene): Choice[] {
  return scene.choices.filter((c) => checkCondition(state, c.when));
}

/**
 * Применяет выбор: эффекты, маршрут, отметка зоны, перенаправление на восстановление при низком топливе.
 */
export function advance(
  state: JourneyState,
  scenes: Record<string, Scene>,
  choice: Choice,
): JourneyState {
  let next = applyEffects(state, choice.effects);
  let target = resolveTarget(next, choice.to);

  if (target === "__restart") return initialState();
  if (target === "__return") {
    target = next.returnTo ?? HUB_SCENE;
    next = { ...next, returnTo: null };
  }

  const targetScene = scenes[target];
  const isTerminal = !!targetScene?.ending || targetScene?.special === "summary";
  const needsRecovery =
    next.fuel <= LOW_FUEL &&
    target !== RECOVERY_SCENE &&
    state.sceneId !== RECOVERY_SCENE &&
    !isTerminal &&
    next.steps - next.lastRecoveryStep > RECOVERY_COOLDOWN;

  if (needsRecovery) {
    next = { ...next, returnTo: target, lastRecoveryStep: next.steps + 1 };
    target = RECOVERY_SCENE;
  }

  const zone = scenes[target]?.zone;
  const visitedZones =
    zone && !next.visitedZones.includes(zone) ? [...next.visitedZones, zone] : next.visitedZones;

  return {
    ...next,
    sceneId: target,
    visitedZones,
    history: [...next.history, target].slice(-200),
    steps: next.steps + 1,
  };
}

export function renderText(scene: Scene, state: JourneyState): string[] {
  const vars: Record<string, string> = {
    loopTimes: String(state.loop * 10),
    interest: String(state.interest),
    fuel: String(state.fuel),
    visitedCount: String(state.visitedZones.length),
  };
  const fill = (s: string) => s.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`);
  const base = scene.text.map(fill);
  const extra = (scene.variants ?? [])
    .filter((v) => checkCondition(state, v.when))
    .flatMap((v) => v.text.map(fill));
  return [...base, ...extra];
}

// ——— Персистентность ———

export function loadState(): JourneyState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<JourneyState>;
    if (parsed.version !== 1 || typeof parsed.sceneId !== "string") return null;
    return { ...initialState(), ...parsed, version: 1 };
  } catch {
    return null;
  }
}

export function saveState(state: JourneyState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Хранилище недоступно (приватный режим, квота) — путешествие просто не сохранится.
  }
}

export function clearState() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // см. saveState
  }
}
