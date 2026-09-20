import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { FramesSwitcher } from "@/components/frames-switcher";
import { PageIntro } from "@/components/page-intro";
import { QuoteBlock } from "@/components/quote-block";
import { Section } from "@/components/section";
import { SubNav } from "@/components/sub-nav";
import { Term } from "@/components/term";
import {
  cageOfInterest,
  cageSteps,
  flatLine,
  framesSection,
  pochemuIntro,
  pochemuSubNav,
  rejectedPictures,
  selfCritique,
  triptych,
} from "@/content/pochemu";

export const metadata: Metadata = {
  title: "Почему",
  description:
    "Ровная линия: две смерти и граница. Любая рамка: семь картин мира и одна структура выбора. Почему любая концепция строит новую клетку — и где решётка может вырасти у самой Песочницы.",
};

function TermRow({ items }: { items: { slug: string; label: string }[] }) {
  return (
    <p className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
      <span className="font-mono text-[11px] tracking-widest uppercase">Словарь</span>
      {items.map((t) => (
        <Term key={t.slug} slug={t.slug} className="text-foreground/85">
          {t.label}
        </Term>
      ))}
    </p>
  );
}

export default function PochemuPage() {
  return (
    <>
      <PageIntro eyebrow={pochemuIntro.eyebrow} title={pochemuIntro.title} lead={pochemuIntro.lead} />
      <SubNav items={pochemuSubNav} />

      {/* 1. Ровная линия */}
      <Section id={flatLine.id} number={1} title={flatLine.title} lead={flatLine.subtitle}>
        <QuoteBlock size="lg">{flatLine.image}</QuoteBlock>

        <div className="mt-14 grid gap-8 md:grid-cols-2 md:gap-10">
          <div className="rounded-2xl border border-border/70 p-6 sm:p-7">
            <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
              {flatLine.chaos.kicker}
            </p>
            <h3 className="font-display mt-2 text-3xl font-semibold">{flatLine.chaos.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{flatLine.chaos.lead}</p>
            <ol className="mt-6 space-y-5">
              {flatLine.chaos.items.map((item, i) => (
                <li key={item.title} className="grid grid-cols-[1.75rem_1fr] gap-3">
                  <span className="font-mono text-xs text-brand">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-[0.95rem] leading-relaxed text-foreground/85">{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl border border-rose-400/30 bg-rose-400/[0.04] p-6 sm:p-7">
            <p className="font-mono text-[11px] tracking-widest text-rose-300 uppercase">
              {flatLine.order.kicker}
            </p>
            <h3 className="font-display mt-2 text-3xl font-semibold">{flatLine.order.title}</h3>
            <div className="prose-sandbox mt-6 text-[0.98rem] text-foreground/85">
              {flatLine.order.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div aria-hidden className="mt-8 flex items-center gap-3 font-mono text-[11px] tracking-widest text-rose-300/80 uppercase">
              <span className="h-px flex-1 bg-rose-400/50" />
              ровная линия
              <span className="h-px flex-1 bg-rose-400/50" />
            </div>
          </div>
        </div>

        <div className="mt-12 border-y border-border/70 py-10">
          <p className="font-mono text-[11px] tracking-widest text-brand uppercase">{flatLine.border.title}</p>
          <div className="prose-sandbox mt-4 max-w-3xl text-lg text-foreground/90">
            {flatLine.border.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>

        <QuoteBlock size="md" className="mt-12">
          {flatLine.pullQuote}
        </QuoteBlock>

        {/* Триптих */}
        <div id={triptych.id} className="mt-20 scroll-mt-28">
          <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
            {triptych.subtitle}
          </p>
          <h3 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">{triptych.title}</h3>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {triptych.cards.map((card) => (
              <article key={card.name} className="flex flex-col rounded-2xl border border-border/70 bg-card/60 p-5">
                <p className="font-mono text-[11px] tracking-widest text-brand uppercase">{card.floor}</p>
                <h4 className="font-display mt-1 text-2xl font-semibold">{card.name}</h4>
                <dl className="mt-4 space-y-4 text-sm leading-relaxed">
                  <div>
                    <dt className="text-muted-foreground">{triptych.seesLabel}</dt>
                    <dd className="mt-1 text-foreground/90">{card.sees}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{triptych.blindLabel}</dt>
                    <dd className="mt-1 text-foreground/90">{card.blind}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center font-mono text-sm tracking-[0.2em] text-brand uppercase">{triptych.caption}</p>
          <p className="font-display mt-8 border-l-2 border-rose-400/60 pl-5 text-2xl leading-snug text-balance sm:text-3xl">
            {triptych.hardLine}
          </p>
        </div>

        {/* Отвергнутые картинки */}
        <div id={rejectedPictures.id} className="mt-20 scroll-mt-28">
          <h3 className="font-display text-3xl font-semibold sm:text-4xl">{rejectedPictures.title}</h3>
          <p className="mt-3 max-w-2xl text-muted-foreground">{rejectedPictures.lead}</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rejectedPictures.items.map((item) => (
              <li key={item.name} className="rounded-xl border border-border/70 p-4">
                <p className="font-medium leading-snug">{item.name}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">«{item.quote}»</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">{item.why}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed">{rejectedPictures.closing}</p>
        </div>

        <TermRow
          items={[
            { slug: "rovnaya-liniya", label: "Ровная линия" },
            { slug: "ferma", label: "Ферма" },
            { slug: "obshchij-pul", label: "Общий пул" },
            { slug: "kontur", label: "Контур" },
          ]}
        />
      </Section>

      {/* 2. Любая рамка */}
      <Section
        id={framesSection.id}
        number={2}
        title={framesSection.title}
        lead={
          <>
            <span className="block">{framesSection.subtitle}</span>
            <span className="mt-3 block">{framesSection.lead}</span>
          </>
        }
        className="border-t border-border/60"
      >
        <FramesSwitcher />
        <TermRow
          items={[
            { slug: "vtoraya-strela", label: "Вторая стрела" },
            { slug: "hvatit", label: "Хватит" },
            { slug: "dikij-kompas", label: "Дикий компас" },
            { slug: "shlyuz", label: "Шлюз" },
          ]}
        />
      </Section>

      {/* 3. Клетка */}
      <Section
        id={cageSteps.id}
        number={3}
        title={cageSteps.title}
        lead={cageSteps.lead}
        className="border-t border-border/60"
      >
        <ol className="grid gap-4 md:grid-cols-3">
          {cageSteps.steps.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-border/70 bg-card/60 p-5 sm:p-6">
              <p className="font-mono text-xs text-brand">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="font-display mt-2 text-2xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-foreground/85">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 border-l-2 border-border pl-5 text-[0.98rem] leading-relaxed text-muted-foreground">
          <span className="font-mono text-[11px] tracking-widest text-brand uppercase">Пример · </span>
          {cageSteps.example}
        </p>
        <TermRow
          items={[
            { slug: "ferma", label: "Ферма" },
            { slug: "kod-defitsita", label: "Код дефицита" },
          ]}
        />
      </Section>

      {/* 4. Это тоже концепция */}
      <Section
        id={selfCritique.id}
        number={4}
        title={selfCritique.title}
        lead="Честная самокритика. Без неё всё выше — просто реклама."
        className="border-t border-border/60"
      >
        <div className="relative overflow-hidden rounded-2xl border-2 border-brand/60 bg-brand/5 p-6 sm:p-8">
          <div aria-hidden className="pointer-events-none absolute inset-0 glow-brand" />
          <div className="relative">
            <div className="prose-sandbox text-[1.05rem] text-foreground">
              {selfCritique.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <p className="mt-8 font-mono text-[11px] tracking-widest text-brand uppercase">{selfCritique.whereLabel}</p>
            <p className="font-display mt-2 text-2xl leading-snug font-semibold text-balance sm:text-3xl">
              {selfCritique.where}
            </p>
            <Link
              href={selfCritique.link.href}
              className="mt-6 inline-flex items-center gap-1.5 text-sm text-brand underline underline-offset-4 hover:no-underline"
            >
              {selfCritique.link.label}
              <ArrowRightIcon className="size-3.5" />
            </Link>
            <p className="mt-8 border-t border-brand/40 pt-6 text-[1.02rem] leading-relaxed text-foreground/90">
              {selfCritique.closing}
            </p>
          </div>
        </div>

        {/* Клетка размером с твой интерес */}
        <div id={cageOfInterest.id} className="mt-20 scroll-mt-28">
          <h3 className="font-display text-3xl font-semibold text-balance sm:text-4xl">{cageOfInterest.title}</h3>
          <div className="prose-sandbox mt-6 max-w-3xl text-[1.02rem] text-foreground/90">
            {cageOfInterest.lead.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <p className="mt-6 max-w-3xl border-l-2 border-rose-400/60 pl-5 text-[0.98rem] leading-relaxed text-foreground/85">
            <span className="font-mono text-[11px] tracking-widest text-rose-300 uppercase">Цена · </span>
            {cageOfInterest.price}
          </p>

          <h4 className="font-display mt-12 text-2xl font-semibold">{cageOfInterest.listTitle}</h4>
          <ol className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {cageOfInterest.items.map((item, i) => (
              <li key={item.title} className="grid grid-cols-[1.75rem_1fr] gap-3 border-t border-border/60 pt-4">
                <span className="font-mono text-xs text-brand">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-semibold leading-snug">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.line}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 rounded-2xl border border-brand/40 bg-brand/5 p-6 sm:p-8">
            <ul className="grid gap-4 sm:grid-cols-3">
              {cageOfInterest.closing.cells.map((cell) => (
                <li key={cell.title} className="border-t border-brand/50 pt-3">
                  <p className="font-display text-2xl font-semibold text-balance">{cell.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{cell.line}</p>
                </li>
              ))}
            </ul>
            <Link
              href={cageOfInterest.closing.link.href}
              className="mt-6 inline-flex items-center gap-1.5 text-sm text-brand underline underline-offset-4 hover:no-underline"
            >
              {cageOfInterest.closing.link.label}
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>
        </div>

        <TermRow
          items={[
            { slug: "kletka-razmerom-s-interes", label: "Клетка размером с твой интерес" },
            { slug: "sverkhrazum", label: "Сверхразум" },
            { slug: "zakon-kontura", label: "Закон Контура" },
            { slug: "razgon", label: "Разгон" },
          ]}
        />
      </Section>
    </>
  );
}
