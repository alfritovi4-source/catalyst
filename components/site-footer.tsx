import Link from "next/link";
import { allNav, site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr] lg:px-8">
        <div className="max-w-md">
          <p className="font-display text-2xl font-semibold">{site.name}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {site.floorNote} · {site.footerLine}
          </p>
          <p className="mt-6 text-xs text-muted-foreground/80">
            Все имена, даты и цифры условны. Мир описан так, как он был
            проговорен, а не так, как он обязан случиться.
          </p>
        </div>
        <nav aria-label="Карта сайта" className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {allNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                item.highlight
                  ? "text-brand hover:underline hover:underline-offset-4"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
