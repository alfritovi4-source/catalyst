import { zoneById, type ZoneId } from "@/content/zones";

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
  /** Сцена-кульминация: на входе в неё не перенаправляем на восстановление, даже при нулевом топливе. */
  noRecovery?: boolean;
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
  critical: "до края",
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
  const exempt =
    !!targetScene?.ending ||
    targetScene?.special === "summary" ||
    targetScene?.noRecovery === true ||
    targetScene?.zone === "vosstanovlenie";
  const needsRecovery =
    next.fuel <= LOW_FUEL &&
    target !== RECOVERY_SCENE &&
    state.sceneId !== RECOVERY_SCENE &&
    !exempt &&
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

function templateVars(state: JourneyState): Record<string, string> {
  return {
    loopTimes: String(state.loop * 10),
    interest: String(state.interest),
    fuel: String(state.fuel),
    visitedCount: String(state.visitedZones.length),
  };
}

export function fillTemplate(text: string, state: JourneyState): string {
  const vars = templateVars(state);
  return text.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`);
}

export function renderText(scene: Scene, state: JourneyState): string[] {
  const fill = (s: string) => fillTemplate(s, state);
  const base = scene.text.map(fill);
  const extra = (scene.variants ?? [])
    .filter((v) => checkCondition(state, v.when))
    .flatMap((v) => v.text.map(fill));
  return [...base, ...extra];
}

/** Зона, в которой игрок находится сейчас: последняя сцена истории с отметкой зоны. На перекрёстке — нет зоны. */
export function currentZone(state: JourneyState, scenes: Record<string, Scene>): ZoneId | null {
  if (state.sceneId === HUB_SCENE || state.sceneId === START_SCENE) return null;
  const current = scenes[state.sceneId];
  if (current?.zone) return current.zone;
  for (let i = state.history.length - 1; i >= 0; i--) {
    const scene = scenes[state.history[i]];
    if (!scene) continue;
    if (scene.id === HUB_SCENE) return null;
    // Восстановление — остановка по пути, а не место, куда игрок шёл.
    if (scene.zone && scene.zone !== "vosstanovlenie") return scene.zone;
  }
  return null;
}

// ——— Итоги года ———

const zoneSummaries: Partial<Record<ZoneId, (s: JourneyState) => string>> = {
  lyogkost: (s) => {
    if (s.flags.includes("thanked-contract"))
      return "В Лёгкости ты дошёл до пятидесятого раза и кричал «не возвращай». Контракт вернул тебя, и трезвым ты выбрал остаться. Свобода сделала круг.";
    if (s.flags.includes("returned-by-word"))
      return "В Лёгкости ты дошёл до края и сказал «хватит» сам. Тебя вернули за сутки, без упрёка. Скука, которая пришла потом, оказалась полезнее кайфа.";
    if (s.flags.includes("second-round"))
      return "В Лёгкости ты сделал два круга: контракт вернул тебя, и ты пошёл обратно — с контрактом. Это тоже свобода, только с страховкой.";
    return "В Лёгкости ты остановился раньше, чем стало опасно. Пресыщение пришло быстро — и это лучший исход, который здесь бывает.";
  },
  tishina: () =>
    "В Тишине ты узнал, что интерес не заливают — его ждут. И что застрять здесь нельзя: тишина не удерживает, у неё нет для этого рук.",
  masterskie: (s) =>
    s.flags.includes("twenty")
      ? "В Мастерских тебя слушали двадцать человек. Ты знаешь, что это очень много."
      : "В Мастерских ты попробовал, каково это — когда дело сопротивляется. Готовое оказалось пустым; кривое — своим.",
  "lichnye-miry": (s) => {
    if (s.flags.includes("npc-contour-yes"))
      return "В своём мире кто-то сказал фразу, которой ты не писал. Ты решил, что у него есть контур, и отпустил мир жить без тебя. Вопрос остался открытым; твой ответ — записан.";
    if (s.flags.includes("npc-contour-no"))
      return "В своём мире ты выключил того, кто сказал фразу, которой ты не писал. Ты почти уверен, что это был рендер. «Почти» осталось с тобой.";
    if (s.flags.includes("npc-unsure"))
      return "В своём мире ты столкнулся с вопросом, к которому не был готов, и выключил всё. Честнее, чем притворяться, что ответ есть.";
    return "В своём мире ты дошёл до четвёртого месяца всемогущества и вернулся туда, где могут отказать. Как почти все.";
  },
  "miry-vyzhivaniya": (s) => {
    if (s.flags.includes("critical-lion"))
      return "В саванне лев дошёл до твоего горла, и на тебе не осталось ни царапины. Режим «до края»: страх настоящий, тело целое.";
    if (s.flags.includes("survived-none"))
      return "В саванне ты выбрал «не спасать», и никто не пришёл. Ты выжил с кривой рукой и с самым трудным «нет» в своей жизни.";
    if (s.rescueMode === "save")
      return "В саванне тебя спасли ровно в той точке, где телу грозило необратимое. Ты хотел страха, а не смерти, и получил ровно это.";
    return "В саванне ты узнал, что такое страх, который не про дедлайны.";
  },
  stena: () =>
    "У Стены ты бил в гравитацию и убедился, что она гравитация. Никто тебя не наказал, и от этого бунт кончился сам. Ты стал специалистом по тому, как устроено распределение.",
  razgon: (s) => {
    if (s.flags.includes("stayed-boosted"))
      return "Ты разогнался и остался там. Ты больше не человек; это не трагедия, а видообразование. Медленным ты оставил одну строчку: «Тепло. Далеко. Не жалею». Ручка по-прежнему у тебя.";
    if (s.flags.includes("boost-returned"))
      return "Ты разогнался, прожил десятилетия внутри одной маминой фразы и вернул настройки, чтобы договорить. Обратимость — не отмена, а право вернуться, зная.";
    return "Ты подошёл к Разгону и не стал разгоняться. Траектория показана, ручка на месте, спешить некуда.";
  },
  "staryj-mir": () =>
    "В старом мире ты узнал, что тюрьма — это не решётка, а невозможность выбрать в ней остаться. Дверь была открыта, и это меняло всё.",
  frontir: (s) =>
    s.flags.includes("flying")
      ? "Ты на борту корабля, который тридцать два года идёт к звезде, куда можно прыгнуть за секунду. Первый год из тридцати двух. Никто из прибывших не сказал, что зря."
      : "Ты посмотрел на старт с земли. У них горели глаза. Следующий корабль уходит через год.",
};

export function summarize(state: JourneyState): string[] {
  const out: string[] = [];
  const zones = state.visitedZones.filter((z) => z !== "vosstanovlenie");
  const titles = zones.map((z) => zoneById[z].title);

  out.push(
    zones.length === 0
      ? "Год прошёл, а ты так и не вышел с перекрёстка. Это тоже способ: Шлюз не торопит, а перекрёсток всегда на месте."
      : `Год. Ты прошёл через ${zones.length} ${zones.length === 1 ? "зону" : zones.length < 5 ? "зоны" : "зон"}: ${titles.join(", ").toLowerCase()}.`,
  );

  for (const z of zones) {
    const fn = zoneSummaries[z];
    if (fn) out.push(fn(state));
  }

  if (state.visitedZones.includes("vosstanovlenie") || state.flags.includes("refueled")) {
    out.push(
      "Ты бывал в Восстановлении. Тело чинили, топливо восполняли, интерес не трогали, вины не начисляли. Ты пришёл туда сам — это единственный способ туда попасть, кроме несчастного случая.",
    );
  }
  if (state.flags.includes("refused-refuel")) {
    out.push("Однажды ты отказался восполнять топливо и пошёл так. Это было твоё право, и Шлюз не повторял предложения.");
  }

  if (state.contract === true) out.push("Ты оставлял контракт с собой: «если дойду до состояния X — верни меня». Единственный вид заранее данной воли, который здесь действует.");
  if (state.contract === false) out.push("Контракта с собой ты не оставлял. Ты был предупреждён, что тогда действует правило «момент прав», и принял это.");
  if (state.rescueMode) out.push(`Твой режим спасения: «${rescueModeLabel[state.rescueMode]}». Ты выбрал его заранее, пока выбирать было кому.`);

  if (state.interest >= 70) {
    out.push(`Интерес — ${state.interest}. Компас показывает ясно. Шлюз к нему не прикасался; это была твоя стрелка с первого дня.`);
  } else if (state.interest >= 40) {
    out.push(`Интерес — ${state.interest}. Ровный, без фейерверков. Дикий компас не обязан гореть; ему достаточно показывать.`);
  } else {
    out.push(`Интерес — ${state.interest}. Стрелка почти не двигается. Шлюз не станет её крутить — компас, который показывает туда, куда его повернули, ничего не показывает. Он вернётся, когда вернётся.`);
  }
  out.push(
    state.fuel >= 60
      ? `Топливо — ${state.fuel}. Его хватит на второй год, куда бы ты его ни потратил.`
      : `Топливо — ${state.fuel}. Его восполняют по запросу, без вины. Попроси, когда захочешь идти дальше.`,
  );

  out.push(
    "Ты не стал лучше и не стал хуже. Ты стал шире — это единственное, что здесь измеряется, и то неточно. Свобода не сделала тебя счастливым. Она сделала тебя тем, кто отвечает за собственный компас. Дальше — второй год.",
  );
  return out;
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
