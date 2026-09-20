import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { Container } from "@/components/section";
import { glossarySorted } from "@/content/glossary";

export const metadata: Metadata = {
  title: "Словарь",
  description:
    "Термины Песочницы по алфавиту: Контур, Закон Контура, Сверхразум, Шлюз, Общий пул, Стена, Дикий компас, Топливо, Хватит и другие.",
};

export default function GlossaryPage() {
  const letters = [...new Set(glossarySorted.map((t) => t.term[0].toUpperCase()))];

  return (
    <>
      <PageIntro
        eyebrow="Словарь"
        title="Термины"
        lead="Слова, которые в этом мире значат чуть больше, чем обычно. На них ссылаются Кодекс, Лифт и консоль Шлюза; каждая статья открывается по прямой ссылке."
      >
        <nav aria-label="Буквы" className="mt-8 flex flex-wrap gap-1.5">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#bukva-${letter}`}
              className="font-display inline-flex size-9 items-center justify-center rounded-md border border-border/70 text-lg text-muted-foreground transition-colors hover:border-brand/60 hover:text-foreground"
            >
              {letter}
            </a>
          ))}
        </nav>
      </PageIntro>

      <section className="py-12 sm:py-16">
        <Container>
          <dl className="mx-auto max-w-4xl">
            {glossarySorted.map((entry, i) => {
              const letter = entry.term[0].toUpperCase();
              const firstOfLetter = i === 0 || glossarySorted[i - 1].term[0].toUpperCase() !== letter;
              return (
                <div
                  key={entry.slug}
                  id={entry.slug}
                  className="scroll-mt-28 grid gap-2 border-t border-border/70 py-7 sm:grid-cols-[3rem_14rem_1fr] sm:gap-6"
                >
                  <span
                    id={firstOfLetter ? `bukva-${letter}` : undefined}
                    className="font-display scroll-mt-28 text-3xl leading-none text-brand/80"
                    aria-hidden={!firstOfLetter}
                  >
                    {firstOfLetter ? letter : ""}
                  </span>
                  <dt className="text-xl font-medium">
                    <a href={`#${entry.slug}`} className="hover:text-brand">
                      {entry.term}
                    </a>
                  </dt>
                  <dd className="text-[0.98rem] leading-relaxed text-foreground/85">
                    {entry.definition}
                    {entry.href ? (
                      <>
                        {" "}
                        <Link href={entry.href} className="text-brand underline underline-offset-4">
                          {entry.hrefLabel ?? "Подробнее"}
                        </Link>
                      </>
                    ) : null}
                  </dd>
                </div>
              );
            })}
          </dl>
        </Container>
      </section>
    </>
  );
}
