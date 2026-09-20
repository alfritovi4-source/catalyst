"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SubNavItem = { id: string; label: string };

/**
 * Sticky in-page anchor navigation with scroll-spy highlighting.
 */
export function SubNav({ items, className }: { items: SubNavItem[]; className?: string }) {
  const [active, setActive] = React.useState<string>(items[0]?.id ?? "");

  React.useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    // Активен последний раздел, чей верх поднялся выше линии в 35% высоты окна.
    // Колбэк срабатывает на пересечении этой же линии, поэтому подсветка не отстаёт.
    const update = () => {
      const line = window.innerHeight * 0.35;
      let current = elements[0].id;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
      }
      setActive(current);
    };
    const observer = new IntersectionObserver(update, {
      rootMargin: "-20% 0px -65% 0px",
      threshold: [0, 0.1],
    });
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  // Полноширинная обёртка: sticky работает, только если родитель выше самой панели,
  // поэтому компонент кладут прямо в <main>, а не внутрь Container.
  return (
    <nav
      aria-label="Разделы страницы"
      className={cn(
        "sticky top-16 z-30 border-b border-border/60 bg-background/85 backdrop-blur",
        className,
      )}
    >
      <ul className="mx-auto flex w-full max-w-7xl gap-1 overflow-x-auto px-4 py-2 text-sm [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={cn(
                "inline-block rounded-md px-3 py-1.5 whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                active === item.id && "bg-muted text-foreground",
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
