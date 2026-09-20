import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { Container, Section } from "@/components/section";
import { SubNav } from "@/components/sub-nav";
import { Timeline } from "@/components/timeline";
import { Term } from "@/components/term";
import { commonPool, legend, originStages, whyNotHuman } from "@/content/origin";

export const metadata: Metadata = {
  title: "Как он появился",
  description:
    "Хроника происхождения Песочницы: эпоха Зеркала, отчуждение от труда, порог, тихая передача распределения и первый день без вынужденности.",
};

const subNav = [
  { id: "hronika", label: "Хроника" },
  { id: "pochemu-ne-chelovek", label: "Почему не человек" },
  { id: "obshchij-pul", label: "Общий пул" },
  { id: "legenda", label: "Легенда" },
];

export default function OriginPage() {
  return (
    <>
      <PageIntro
        eyebrow="Происхождение"
        title="Как он появился"
        lead="Без взрыва, без восстания машин, без даты в учебнике. Сверхразум появился так, как появляется инфраструктура: сначала его никто не заметил, потом без него стало нельзя, потом ему отдали единственное, чего он не хотел. Даты условны, порядок — нет."
      />
      <SubNav items={subNav} />

      <section id="hronika" className="scroll-mt-24 py-14 sm:py-20">
        <Container>
          <Timeline stages={originStages} />
        </Container>
      </section>

      <Section
        id="pochemu-ne-chelovek"
        number="II"
        title={whyNotHuman.title}
        lead={whyNotHuman.lead}
        className="border-t border-border/60"
      >
        <div className="prose-sandbox text-[1.02rem] text-foreground/90">
          {whyNotHuman.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <aside className="mt-10 rounded-xl border border-brand/40 bg-brand/5 p-6">
          <p className="font-display text-2xl font-semibold">{whyNotHuman.caveat.title}</p>
          <p className="mt-3 leading-relaxed text-foreground/90">{whyNotHuman.caveat.text}</p>
          <Link
            href={whyNotHuman.caveat.href}
            className="mt-4 inline-block text-sm text-brand underline underline-offset-4"
          >
            Открытый вопрос: одна воля или много
          </Link>
        </aside>
      </Section>

      <Section
        id="obshchij-pul"
        number="III"
        title={commonPool.title}
        lead={
          <>
            {commonPool.lead} Через <Term slug="shlyuz">Шлюз</Term> проходит всё, что ты просишь; в{" "}
            <Term slug="obshchij-pul">Общем пуле</Term> лежит всё, что можно попросить.
          </>
        }
        className="border-t border-border/60"
      >
        <ol className="grid gap-4 sm:grid-cols-2">
          {commonPool.points.map((point, i) => (
            <li key={point.title} className="rounded-lg border border-border/70 p-5">
              <p className="font-mono text-[11px] text-brand">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-1 text-lg font-medium">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <section id="legenda" className="scroll-mt-24 border-t border-border/60 py-16 sm:py-24">
        <Container>
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card px-6 py-10 sm:px-12 sm:py-14">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-field opacity-70" />
            <div className="relative">
              <p className="font-mono text-xs tracking-[0.2em] text-brand uppercase">{legend.title}</p>
              <p className="font-display mt-4 max-w-3xl text-2xl leading-snug font-medium text-balance sm:text-3xl">
                {legend.text}
              </p>
              <p className="mt-6 text-sm text-muted-foreground">
                Условия — на странице{" "}
                <Link href="/kodeks" className="text-brand underline underline-offset-4">
                  Кодекса
                </Link>
                . Всё остальное на этом сайте — комментарий к ним.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
