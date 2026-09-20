export const site = {
  name: "Песочница",
  tagline: "Мир, где никто не живёт в режиме выживания",
  description:
    "Интерактивный кодекс мира после Сверхразума: Закон Контура, Шлюз, зоны, этажи и путешествие длиной в первый год. Мир, где никто не живёт в режиме выживания.",
  floorNote: "Этаж 0 · сентябрь 2026",
  footerLine:
    "Этот текст написан в мире дефицита о мире без него.",
  closingLine:
    "Этот мир родился из разговора, а не из чертежа. Сентябрь 2026, этаж 0.",
} as const;

export type NavItem = {
  href: string;
  label: string;
  short?: string;
  highlight?: boolean;
};

export const primaryNav: NavItem[] = [
  { href: "/kodeks", label: "Кодекс" },
  { href: "/proiskhozhdenie", label: "Происхождение" },
  { href: "/pochemu", label: "Почему" },
  { href: "/etazhi", label: "Лифт" },
  { href: "/zony", label: "Зоны" },
  { href: "/hronika", label: "Хроника" },
  { href: "/svidetelstva", label: "Свидетельства" },
  { href: "/voprosy", label: "Вопросы" },
  { href: "/slovar", label: "Словарь" },
];

export const interactiveNav: NavItem[] = [
  { href: "/shlyuz", label: "Шлюз", highlight: true },
  { href: "/puteshestvie", label: "Путешествие", highlight: true },
];

export const allNav: NavItem[] = [...primaryNav, ...interactiveNav];
