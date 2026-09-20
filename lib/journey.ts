import { zoneById, type ZoneId } from "@/content/zones";

export type RescueMode = "save" | "none" | "critical";
export type ContourState = "intact" | "touched";
export type Gender = "m" | "f" | "n";

export type JourneyState = {
  version: 1;
  sceneId: string;
  interest: number;
  fuel: number;
  contour: ContourState;
  contract: boolean | null;
  rescueMode: RescueMode | null;
  gender: Gender | null;
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
  gender?: Gender;
  loopAtLeast?: number;
  loopBelow?: number;
  loopIs?: number;
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
  gender?: Gender;
  /** "inc" +1, "reset" → 0, число — выставить счётчик. */
  loop?: "inc" | "reset" | number;
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

export type SceneVariant = {
  when: Condition;
  text: string[];
  /** Заменить базовый текст сцены, а не дописать. */
  replace?: boolean;
};

export type Scene = {
  id: string;
  title: string;
  kicker?: string;
  zone?: ZoneId;
  text: string[];
  variants?: SceneVariant[];
  choices: Choice[];
  ending?: SceneEnding;
  special?: "summary";
  /** Сцена-кульминация: на входе в неё не перенаправляем на восстановление, даже при нулевом топливе. */
  noRecovery?: boolean;
  /**
   * Свидетельство под концовкой: id из content/testimonies, или false — не показывать.
   * Если не задано, плеер берёт zone.testimony текущей зоны — и только его.
   */
  testimony?: string | false;
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
    gender: null,
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
  if (cond.gender !== undefined && (state.gender ?? "n") !== cond.gender) return false;
  if (cond.loopAtLeast !== undefined && state.loop < cond.loopAtLeast) return false;
  if (cond.loopBelow !== undefined && state.loop >= cond.loopBelow) return false;
  if (cond.loopIs !== undefined && state.loop !== cond.loopIs) return false;
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
    gender: effects.gender ?? state.gender,
    loop:
      typeof effects.loop === "number"
        ? effects.loop
        : effects.loop === "inc"
          ? state.loop + 1
          : effects.loop === "reset"
            ? 0
            : state.loop,
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
    loop: String(state.loop),
    loopTimes: String(state.loop),
    interest: String(state.interest),
    fuel: String(state.fuel),
    visitedCount: String(state.visitedZones.length),
  };
}

/** Формы по полу: он / она / без разницы (нейтраль — конструкции на «ты», без слешей). */
export function g(state: Pick<JourneyState, "gender">, m: string, f: string, n: string): string {
  if (state.gender === "f") return f;
  if (state.gender === "m") return m;
  return n;
}

export function fillTemplate(text: string, state: JourneyState): string {
  const vars = templateVars(state);
  const withGender = text.replace(/\{g:([^|{}]+)\|([^|{}]+)\|([^}]+)\}/g, (_, m: string, f: string, n: string) =>
    g(state, m, f, n),
  );
  return withGender.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`);
}

export function renderText(scene: Scene, state: JourneyState): string[] {
  const fill = (s: string) => fillTemplate(s, state);
  const matched = (scene.variants ?? []).filter((v) => checkCondition(state, v.when));
  const replacer = [...matched].reverse().find((v) => v.replace);
  const base = (replacer ? replacer.text : scene.text).map(fill);
  const extra = matched.filter((v) => !v.replace).flatMap((v) => v.text.map(fill));
  return [...base, ...extra];
}

/** Зона, в которой игрок находится сейчас: последняя сцена истории с отметкой зоны. На перекрёстке — нет зоны. */
export function currentZone(state: JourneyState, scenes: Record<string, Scene>): ZoneId | null {
  if (state.sceneId === HUB_SCENE || state.sceneId === START_SCENE || state.sceneId === "arrival-next") return null;
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
      return g(
        s,
        "В Лёгкости ты дошёл до пятидесятого раза и кричал «не возвращай». Контракт вернул тебя, и трезвым ты выбрал остаться. Свобода сделала круг.",
        "В Лёгкости ты дошла до пятидесятого раза и кричала «не возвращай». Контракт вернул тебя, и трезвой ты выбрала остаться. Свобода сделала круг.",
        "В Лёгкости на пятидесятом разе ты кричал «не возвращай». Контракт вернул тебя, и в трезвости ты остаёшься. Свобода сделала круг.",
      );
    if (s.flags.includes("returned-by-word"))
      return g(
        s,
        "В Лёгкости ты дошёл до края и сказал «хватит» сам. Тебя вернули за сутки, без упрёка. Скука, которая пришла потом, оказалась полезнее кайфа.",
        "В Лёгкости ты дошла до края и сказала «хватит» сама. Тебя вернули за сутки, без упрёка. Скука, которая пришла потом, оказалась полезнее кайфа.",
        "В Лёгкости ты доходишь до края и говоришь «хватит» сам. Тебя вернули за сутки, без упрёка. Скука после этого полезнее кайфа.",
      );
    if (s.flags.includes("second-round"))
      return g(
        s,
        "В Лёгкости ты сделал два круга: контракт вернул тебя, и ты пошёл обратно — с контрактом. Это тоже свобода, только с страховкой.",
        "В Лёгкости ты сделала два круга: контракт вернул тебя, и ты пошла обратно — с контрактом. Это тоже свобода, только с страховкой.",
        "В Лёгкости два круга: контракт вернул тебя, и ты идёшь обратно — с контрактом. Это тоже свобода, только с страховкой.",
      );
    if (s.flags.includes("sleep-world"))
      return "В Лёгкости сон без конца длился год. Снаружи жили без тебя. Дальше ты взял этаж −1: личные миры, которые за этот год дозрели.";
    if (s.flags.includes("sleep-year"))
      return "В Лёгкости ты проспал год. Тело целое, сны из уже имеющегося, снаружи жизнь ушла вперёд. Цена — не вред, а пропуск.";
    if (s.flags.includes("luxury-island"))
      return "В Лёгкости роскошь дошла до собственного острова, где некому смотреть. Самолёты стали автобусами. Ты собирал доказательства, не впечатления.";
    if (s.flags.includes("fame-refused"))
      return "В Лёгкости ты просил обожания. Шлюз ответил «нет»: чужое внимание — чужой контур. Оттуда дорога вела в Мастерские, не на этаж −1.";
    if (s.flags.includes("lightness-declined"))
      return "В Лёгкости ты посмотрел на крайности и не взял ни одну. Тишина и Мастерские никуда не делись.";
    return "В Лёгкости ты остановился раньше, чем стало опасно. Пресыщение пришло быстро — и это лучший исход, который здесь бывает.";
  },
  tishina: (s) =>
    g(
      s,
      "В Тишине ты узнал, что интерес не заливают — его ждут. И что застрять здесь нельзя: тишина не удерживает, у неё нет для этого рук.",
      "В Тишине ты узнала, что интерес не заливают — его ждут. И что застрять здесь нельзя: тишина не удерживает, у неё нет для этого рук.",
      "В Тишине ясно: интерес не заливают — его ждут. Застрять здесь нельзя: тишина не удерживает, у неё нет для этого рук.",
    ),
  masterskie: (s) =>
    s.flags.includes("twenty")
      ? "В Мастерских тебя слушали двадцать человек. Ты знаешь, что это очень много."
      : g(
          s,
          "В Мастерских ты попробовал, каково это — когда дело сопротивляется. Готовое оказалось пустым; кривое — своим.",
          "В Мастерских ты попробовала, каково это — когда дело сопротивляется. Готовое оказалось пустым; кривое — своим.",
          "В Мастерских ты пробуешь, каково это — когда дело сопротивляется. Готовое оказывается пустым; кривое — своим.",
        ),
  "lichnye-miry": (s) => {
    if (s.flags.includes("npc-contour-yes"))
      return g(
        s,
        "В своём мире кто-то сказал фразу, которой ты не писал. Ты решил, что у него есть контур, и отпустил мир жить без тебя. Вопрос остался открытым; твой ответ — записан.",
        "В своём мире кто-то сказал фразу, которой ты не писала. Ты решила, что у него есть контур, и отпустила мир жить без тебя. Вопрос остался открытым; твой ответ — записан.",
        "В своём мире кто-то сказал фразу, которой ты не писал. Ты решаешь, что у него есть контур, и отпускаешь мир жить без тебя. Вопрос открыт; ответ записан.",
      );
    if (s.flags.includes("npc-contour-no"))
      return g(
        s,
        "В своём мире ты выключил того, кто сказал фразу, которой ты не писал. Ты почти уверен, что это был рендер. «Почти» осталось с тобой.",
        "В своём мире ты выключила того, кто сказал фразу, которой ты не писала. Ты почти уверена, что это был рендер. «Почти» осталось с тобой.",
        "В своём мире ты выключаешь того, кто сказал фразу, которой ты не писал. Почти уверенность, что это рендер. «Почти» остаётся с тобой.",
      );
    if (s.flags.includes("npc-unsure"))
      return g(
        s,
        "В своём мире ты столкнулся с вопросом, к которому не был готов, и выключил всё. Честнее, чем притворяться, что ответ есть.",
        "В своём мире ты столкнулась с вопросом, к которому не была готова, и выключила всё. Честнее, чем притворяться, что ответ есть.",
        "В своём мире ты выходишь к вопросу, к которому нет готовности, и выключаешь всё. Честнее, чем притворяться, что ответ есть.",
      );
    return g(
      s,
      "В своём мире ты дошёл до четвёртого месяца всемогущества и вернулся туда, где могут отказать. Как почти все.",
      "В своём мире ты дошла до четвёртого месяца всемогущества и вернулась туда, где могут отказать. Как почти все.",
      "В своём мире ты доходишь до четвёртого месяца всемогущества и возвращаешься туда, где могут отказать. Как почти все.",
    );
  },
  "miry-vyzhivaniya": (s) => {
    if (s.flags.includes("critical-lion"))
      return "В саванне лев дошёл до твоего горла, и на тебе не осталось ни царапины. Режим «до края»: страх настоящий, тело целое.";
    if (s.flags.includes("survived-none"))
      return g(
        s,
        "В саванне ты выбрал «не спасать», и никто не пришёл. Ты выжил с кривой рукой и с самым трудным «нет» в своей жизни.",
        "В саванне ты выбрала «не спасать», и никто не пришёл. Ты выжила с кривой рукой и с самым трудным «нет» в своей жизни.",
        "В саванне режим «не спасать», и никто не пришёл. Ты выходишь с кривой рукой и с самым трудным «нет» в этой жизни.",
      );
    if (s.rescueMode === "save")
      return g(
        s,
        "В саванне тебя спасли ровно в той точке, где телу грозило необратимое. Ты хотел страха, а не смерти, и получил ровно это.",
        "В саванне тебя спасли ровно в той точке, где телу грозило необратимое. Ты хотела страха, а не смерти, и получила ровно это.",
        "В саванне тебя спасли ровно в той точке, где телу грозило необратимое. Ты просил страха, а не смерти, и получил ровно это.",
      );
    return g(
      s,
      "В саванне ты узнал, что такое страх, который не про дедлайны.",
      "В саванне ты узнала, что такое страх, который не про дедлайны.",
      "В саванне ты знаешь, что такое страх, который не про дедлайны.",
    );
  },
  stena: (s) =>
    g(
      s,
      "У Стены ты бил в гравитацию и убедился, что она гравитация. Никто тебя не наказал, и от этого бунт кончился сам. Ты стал специалистом по тому, как устроено распределение.",
      "У Стены ты била в гравитацию и убедилась, что она гравитация. Никто тебя не наказал, и от этого бунт кончился сам. Ты стала специалисткой по тому, как устроено распределение.",
      "У Стены ты бьёшь в гравитацию и убеждаешься, что она гравитация. Никто тебя не наказал, и от этого бунт кончается сам. Ты — специалист по тому, как устроено распределение.",
    ),
  razgon: (s) => {
    if (s.flags.includes("stayed-boosted"))
      return g(
        s,
        "Ты разогнался и остался там. Ты больше не человек; это не трагедия, а видообразование. Медленным ты оставил одну строчку: «Тепло. Далеко. Не жалею». Ручка по-прежнему у тебя.",
        "Ты разогналась и осталась там. Ты больше не человек; это не трагедия, а видообразование. Медленным ты оставила одну строчку: «Тепло. Далеко. Не жалею». Ручка по-прежнему у тебя.",
        "Ты разгоняешься и остаёшься там. Ты больше не человек; это не трагедия, а видообразование. Медленным остаётся одна строчка: «Тепло. Далеко. Не жалею». Ручка по-прежнему у тебя.",
      );
    if (s.flags.includes("boost-returned"))
      return g(
        s,
        "Ты разогнался, прожил десятилетия внутри одной маминой фразы и вернул настройки, чтобы договорить. Обратимость — не отмена, а право вернуться, зная.",
        "Ты разогналась, прожила десятилетия внутри одной маминой фразы и вернула настройки, чтобы договорить. Обратимость — не отмена, а право вернуться, зная.",
        "Ты разгоняешься, живёшь десятилетия внутри одной маминой фразы и возвращаешь настройки, чтобы договорить. Обратимость — не отмена, а право вернуться, зная.",
      );
    return g(
      s,
      "Ты подошёл к Разгону и не стал разгоняться. Траектория показана, ручка на месте, спешить некуда.",
      "Ты подошла к Разгону и не стала разгоняться. Траектория показана, ручка на месте, спешить некуда.",
      "Ты подходишь к Разгону и не разгоняешься. Траектория показана, ручка на месте, спешить некуда.",
    );
  },
  "staryj-mir": (s) =>
    g(
      s,
      "В старом мире ты узнал, что тюрьма — это не решётка, а невозможность выбрать в ней остаться. Дверь была открыта, и это меняло всё.",
      "В старом мире ты узнала, что тюрьма — это не решётка, а невозможность выбрать в ней остаться. Дверь была открыта, и это меняло всё.",
      "В старом мире ясно: тюрьма — это не решётка, а невозможность выбрать в ней остаться. Дверь была открыта, и это меняло всё.",
    ),
  frontir: (s) =>
    s.flags.includes("flying")
      ? "Ты на борту корабля, который тридцать два года идёт к звезде, куда можно прыгнуть за секунду. Первый год из тридцати двух. Никто из прибывших не сказал, что зря."
      : "Ты посмотрел на старт с земли. У них горели глаза. Следующий корабль уходит через год.".replace(
          "посмотрел",
          g(s, "посмотрел", "посмотрела", "смотришь"),
        ),
};

export function summarize(state: JourneyState): string[] {
  const out: string[] = [];
  const zones = state.visitedZones.filter((z) => z !== "vosstanovlenie");
  const titles = zones.map((z) => zoneById[z].title);

  out.push(
    zones.length === 0
      ? "Год прошёл, а ты так и не вышел с перекрёстка. Это тоже способ: Шлюз не торопит, а перекрёсток всегда на месте.".replace(
          "не вышел",
          g(state, "не вышел", "не вышла", "не уходишь"),
        )
      : `Год. Ты ${g(state, "прошёл", "прошла", "проходишь")} через ${zones.length} ${zones.length === 1 ? "зону" : zones.length < 5 ? "зоны" : "зон"}: ${titles.join(", ").toLowerCase()}.`,
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
    out.push(
      g(
        state,
        "Однажды ты отказался восполнять топливо и пошёл так. Это было твоё право, и Шлюз не повторял предложения.",
        "Однажды ты отказалась восполнять топливо и пошла так. Это было твоё право, и Шлюз не повторял предложения.",
        "Однажды ты отказываешься восполнять топливо и идёшь так. Это было твоё право, и Шлюз не повторял предложения.",
      ),
    );
  }

  if (state.contract === true)
    out.push(
      g(
        state,
        "Ты оставлял контракт с собой: «если дойду до состояния X — верни меня». Единственный вид заранее данной воли, который здесь действует.",
        "Ты оставляла контракт с собой: «если дойду до состояния X — верни меня». Единственный вид заранее данной воли, который здесь действует.",
        "Контракт с собой: «если дойду до состояния X — верни меня». Единственный вид заранее данной воли, который здесь действует.",
      ),
    );
  if (state.contract === false)
    out.push(
      g(
        state,
        "Контракта с собой ты не оставлял. Ты был предупреждён, что тогда действует правило «момент прав», и принял это.",
        "Контракта с собой ты не оставляла. Ты была предупреждена, что тогда действует правило «момент прав», и приняла это.",
        "Контракта с собой нет. Тебя предупредили, что тогда действует правило «момент прав», и ты это принимаешь.",
      ),
    );
  if (state.rescueMode)
    out.push(
      `Твой режим спасения: «${rescueModeLabel[state.rescueMode]}». ${g(
        state,
        "Ты выбрал его заранее, пока выбирать было кому.",
        "Ты выбрала его заранее, пока выбирать было кому.",
        "Ты берёшь его заранее, пока выбирать есть кому.",
      )}`,
    );

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
    g(
      state,
      "Ты не стал лучше и не стал хуже. Ты стал шире — это единственное, что здесь измеряется, и то неточно. Свобода не сделала тебя счастливым. Она сделала тебя тем, кто отвечает за собственный компас. Дальше — второй год.",
      "Ты не стала лучше и не стала хуже. Ты стала шире — это единственное, что здесь измеряется, и то неточно. Свобода не сделала тебя счастливой. Она сделала тебя тем, кто отвечает за собственный компас. Дальше — второй год.",
      "Ты не становишься лучше и не становишься хуже. Ты становишься шире — это единственное, что здесь измеряется, и то неточно. Свобода не делает тебя счастливым. Она делает тебя тем, кто отвечает за собственный компас. Дальше — второй год.",
    ),
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
    const gender = parsed.gender === "m" || parsed.gender === "f" || parsed.gender === "n" ? parsed.gender : null;
    return { ...initialState(), ...parsed, version: 1, gender };
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
