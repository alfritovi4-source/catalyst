import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { Container } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { zones, zonesIntro } from "@/content/zones";
import { testimonyById } from "@/content/testimonies";

export const metadata: Metadata = {
  title: "Зоны",
  description:
    "Десять зон Песочницы, существующих одновременно: Лёгкость, Миры выживания, Тишина, Мастерские, Личные миры, Фронтир, Разгон, Старый мир, Стена, Восстановление.",
};

const fields: { key: "what" | "who" | "how" | "ending" | "rescue"; label: string }[] = [
  { key: "what", label: "Что это" },
  { key: "who", label: "Кто сюда приходит" },
  { key: "how", label: "Как это работает" },
  { key: "ending", label: "Чем заканчивается обычно" },
  { key: "rescue", label: "Режим спасения" },
];

export default function ZonesPage() {
  return (
    <>
      <PageIntro eyebrow="Зоны" title="Десять зон. Одновременно" lead={zonesIntro.lead}>
        <nav aria-label="Список зон" className="mt-10 flex flex-wrap gap-2">
          {zones.map((zone) => (
            <a
              key={zone.id}
              href={`#${zone.id}`}
              className="rounded-full border border-border/80 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-brand/60 hover:text-foreground"
            >
              {zone.title}
            </a>
          ))}
        </nav>
      </PageIntro>

      <div className="divide-y divide-border/60">
        {zones.map((zone, i) => {
          const testimony = zone.testimony ? testimonyById[zone.testimony] : undefined;
          return (
            <section key={zone.id} id={zone.id} className="scroll-mt-24 py-14 sm:py-20">
              <Container>
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:gap-14">
                  <div className="lg:sticky lg:top-28 lg:self-start">
                    <p className="font-mono text-xs tracking-[0.2em] text-brand">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h2 className="font-display mt-2 text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
                      {zone.title}
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-muted-foreground">{zone.short}</p>
                    <Badge
                      variant="outline"
                      className="mt-5 h-auto py-1 font-mono text-[11px] whitespace-normal"
                    >
                      режим: {zone.mode}
                    </Badge>
                  </div>
                  <div>
                    {zone.keyLine ? (
                      <p className="font-display mb-8 border-l-2 border-brand pl-5 text-2xl leading-snug text-balance text-foreground sm:text-[1.7rem]">
                        {zone.keyLine}
                      </p>
                    ) : null}
                    {zone.worlds ? (
                      <ul className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Миры">
                        {zone.worlds.map((w) => (
                          <li
                            key={w.title}
                            className="rounded-xl border border-border/70 bg-card/60 p-4 transition-colors hover:border-brand/50"
                          >
                            <p className="font-medium">{w.title}</p>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{w.line}</p>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <dl className="grid gap-6 sm:grid-cols-2">
                      {fields.map((f) => (
                        <div
                          key={f.key}
                          className={
                            f.key === "ending"
                              ? "rounded-lg border border-brand/30 bg-brand/5 p-4 sm:col-span-2"
                              : f.key === "what"
                                ? "sm:col-span-2"
                                : ""
                          }
                        >
                          <dt
                            className={`font-mono text-[11px] tracking-widest uppercase ${
                              f.key === "ending" ? "text-brand" : "text-muted-foreground"
                            }`}
                          >
                            {f.label}
                          </dt>
                          <dd className="mt-2 text-[0.98rem] leading-relaxed text-foreground/90">
                            {zone[f.key]}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    {testimony ? (
                      <figure className="mt-8 border-l-2 border-border pl-5">
                        <blockquote className="font-display text-xl leading-snug text-foreground/85 italic">
                          {testimony.pull}
                        </blockquote>
                        <figcaption className="mt-2 text-sm text-muted-foreground">
                          {testimony.name}, {testimony.role}
                          {" · "}
                          <Link
                            href={`/svidetelstva#${testimony.id}`}
                            className="text-brand underline underline-offset-4"
                          >
                            свидетельство целиком
                          </Link>
                        </figcaption>
                      </figure>
                    ) : null}
                  </div>
                </div>
              </Container>
            </section>
          );
        })}
      </div>
    </>
  );
}
