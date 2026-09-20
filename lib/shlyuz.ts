import { mechanicById, type MechanicId } from "@/content/mechanics";
import { derivations, law } from "@/content/manifest";
import {
  requests as allRequests,
  type Contour,
  type RequestCategory,
  type Reversibility,
  type RuleAnchor,
  type ShlyuzRequest,
  type Will,
} from "@/content/requests";

export type VerdictStep = "contour" | "reversibility" | "will" | "trajectory" | "decision" | "rule";
export type VerdictTone = "ok" | "warn" | "bad" | "neutral";

export type Verdict = {
  step: VerdictStep;
  label: string;
  value: string;
  tone: VerdictTone;
  note?: string;
  href?: string;
};

export type DecisionKind =
  | "stop"
  | "wall"
  | "refused"
  | "process"
  | "restore"
  | "return"
  | "moment"
  | "queued"
  | "granted"
  | "granted-warned";

const contourLabel: Record<Contour, { value: string; tone: VerdictTone }> = {
  inside: { value: "внутри", tone: "ok" },
  outside: { value: "снаружи", tone: "bad" },
  disputed: { value: "спорно", tone: "warn" },
};

const reversibilityLabel: Record<Reversibility, { value: string; tone: VerdictTone }> = {
  yes: { value: "да", tone: "ok" },
  no: { value: "нет", tone: "bad" },
  partial: { value: "частично", tone: "warn" },
};

const willLabel: Record<Will, { value: string; tone: VerdictTone }> = {
  expressed: { value: "выражена", tone: "ok" },
  "not-expressed": { value: "не выражена", tone: "warn" },
  "pre-given": { value: "заранее дана", tone: "ok" },
};

/**
 * Единственное место, где из трёх полей и особой ветки выводится вид решения.
 * Порядок проверок — это и есть логика Закона Контура в Шлюзе.
 */
export function decide(req: ShlyuzRequest): { kind: DecisionKind; headline: string; tone: VerdictTone } {
  if (req.special === "stop") {
    return { kind: "stop", headline: "Исполняется. Всегда.", tone: "ok" };
  }
  if (req.contour === "outside") {
    if (req.special === "wall") {
      return { kind: "wall", headline: "Невозможно. Не запрещено — невозможно.", tone: "bad" };
    }
    return { kind: "refused", headline: "Не выдаётся: это чужой контур.", tone: "bad" };
  }
  if (req.contour === "disputed") {
    return { kind: "process", headline: "Не щелчком. Процесс.", tone: "warn" };
  }
  // contour === "inside"
  if (req.will === "not-expressed") {
    return { kind: "restore", headline: "Восстанавливаю способность выбирать. Потом слушаю.", tone: "ok" };
  }
  if (req.will === "pre-given") {
    return { kind: "return", headline: "Контракт исполняется: возвращаю.", tone: "ok" };
  }
  if (req.special === "moment") {
    return { kind: "moment", headline: "Момент прав. Не возвращаю.", tone: "warn" };
  }
  if (req.special === "resource-large") {
    return { kind: "queued", headline: "Выдано. Очередь по времени, не по заслугам.", tone: "ok" };
  }
  if (req.special === "annihilation") {
    return { kind: "granted-warned", headline: "Выдано после паузы прозрачности.", tone: "warn" };
  }
  if (req.special === "rescue-none") {
    return { kind: "granted-warned", headline: "Выдано. Режим записан: не спасать.", tone: "warn" };
  }
  if (req.special === "rescue-critical") {
    return { kind: "granted", headline: "Выдано. Режим записан: до критического.", tone: "ok" };
  }
  if (req.reversibility !== "yes") {
    return { kind: "granted-warned", headline: "Выдано. Ты предупреждён.", tone: "warn" };
  }
  return { kind: "granted", headline: "Выдано.", tone: "ok" };
}

export function ruleInfo(anchor: RuleAnchor): { title: string; summary?: string; href: string } {
  if (anchor in mechanicById) {
    const m = mechanicById[anchor as MechanicId];
    return { title: m.title, summary: m.summary, href: `/kodeks#${m.id}` };
  }
  if (anchor === "zakon-kontura") {
    return { title: law.title, summary: law.text, href: "/kodeks#zakon-kontura" };
  }
  const d = derivations.find((x) => x.id === anchor);
  if (d) return { title: `${law.title}: ${d.title.toLowerCase()}`, summary: d.text, href: `/kodeks#${d.id}` };
  return { title: law.title, href: "/kodeks#zakon-kontura" };
}

export function evaluateRequest(req: ShlyuzRequest): Verdict[] {
  const decision = decide(req);
  const rule = ruleInfo(req.rule);
  return [
    {
      step: "contour",
      label: "Контур",
      value: contourLabel[req.contour].value,
      tone: contourLabel[req.contour].tone,
      note: req.contourNote,
    },
    {
      step: "reversibility",
      label: "Обратимость",
      value: reversibilityLabel[req.reversibility].value,
      tone: reversibilityLabel[req.reversibility].tone,
      note: req.reversibilityNote,
    },
    {
      step: "will",
      label: "Воля",
      value: willLabel[req.will].value,
      tone: willLabel[req.will].tone,
      note: req.willNote,
    },
    {
      step: "trajectory",
      label: "Траектория",
      value: req.trajectory,
      tone: "neutral",
    },
    {
      step: "decision",
      label: "Решение",
      value: decision.headline,
      tone: decision.tone,
      note: req.decision,
    },
    {
      step: "rule",
      label: "Правило",
      value: rule.title,
      tone: "neutral",
      note: rule.summary,
      href: rule.href,
    },
  ];
}

// ——— Сопоставление свободного текста ———

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type MatchResult =
  | { kind: "match"; request: ShlyuzRequest; score: number }
  | { kind: "clarify"; question: string; options: { label: string; categories: RequestCategory[] }[] };

export const clarifyOptions: { label: string; categories: RequestCategory[] }[] = [
  { label: "Про меня", categories: ["Тело", "Сознание", "Опасность"] },
  { label: "Про других", categories: ["Другие", "Миры"] },
  { label: "Про систему", categories: ["Ресурсы", "Система"] },
];

export function matchRequest(text: string, requests: ShlyuzRequest[] = allRequests): MatchResult {
  const q = normalize(text);
  if (!q) {
    return {
      kind: "clarify",
      question: "Уточни запрос: это про тебя, про других или про систему?",
      options: clarifyOptions,
    };
  }
  let best: { request: ShlyuzRequest; score: number } | null = null;
  for (const request of requests) {
    let score = 0;
    for (const kw of request.keywords) {
      const k = normalize(kw);
      if (k && q.includes(k)) {
        // Longer keywords are more specific and therefore weigh more.
        score += k.length >= 8 ? 3 : k.length >= 5 ? 2 : 1;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { request, score };
    }
  }
  if (best) return { kind: "match", ...best };
  return {
    kind: "clarify",
    question: "Уточни запрос: это про тебя, про других или про систему?",
    options: clarifyOptions,
  };
}
