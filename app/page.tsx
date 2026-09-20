import Link from "next/link";
import { ArrowRightIcon, ArrowUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container, Eyebrow } from "@/components/section";
import { QuoteBlock } from "@/components/quote-block";
import { site } from "@/content/site";
import { law, coreTheses } from "@/content/manifest";
import { zones } from "@/content/zones";
import { floors } from "@/content/floors";
import { originStages } from "@/content/origin";
import { pochemuTeasers } from "@/content/pochemu";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-field" />
        <div aria-hidden className="pointer-events-none absolute inset-0 glow-brand" />
        <Container className="relative py-24 sm:py-32 lg:py-40">
          <Eyebrow className="animate-rise">Этаж +1 · интерактивный кодекс</Eyebrow>
          <h1 className="font-display mt-6 text-6xl leading-[0.95] font-semibold tracking-tight sm:text-7xl lg:text-8xl animate-rise [animation-delay:80ms]">
            {site.name}
          </h1>
          <p className="font-display mt-6 max-w-3xl text-2xl leading-snug text-foreground/85 text-balance sm:text-3xl animate-rise [animation-delay:160ms]">
            {site.tagline}
          </p>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground animate-rise [animation-delay:240ms]">
            Здесь описан мир после того, как Сверхразум убрал дефицит. Не сладкая утопия, где
            все ходят строем и улыбаются, и не Терминатор. Жёсткая, честная, бесконечно
            глубокая песочница, в которой каждый делает с собой что хочет — и ничего не может
            сделать с другим без его согласия. Ты можешь прочитать её как кодекс или прожить
            как первый год.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row animate-rise [animation-delay:320ms]">
            <Button
              size="lg"
              className="h-12 px-6 text-base bg-brand text-brand-foreground hover:bg-brand/90"
              nativeButton={false}
              render={<Link href="/puteshestvie" />}
            >
              Начать путешествие
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-6 text-base"
              nativeButton={false}
              render={<Link href="/kodeks" />}
            >
              Открыть кодекс
            </Button>
          </div>
        </Container>
      </section>

      <section className="border-b border-border/60 py-20 sm:py-28">
        <Container>
          <Eyebrow>Единственная аксиома</Eyebrow>
          <QuoteBlock size="xl" className="mt-8" cite={law.title}>
            {law.text}
          </QuoteBlock>
          <p className="mt-10 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            {law.gloss}
          </p>
        </Container>
      </section>

      <section className="border-b border-border/60 py-16 sm:py-20">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Почему</Eyebrow>
              <h2 className="font-display mt-3 text-4xl font-semibold tracking-tight">
                Чего боятся на самом деле
              </h2>
            </div>
            <Link href="/pochemu" className="text-sm text-brand hover:underline hover:underline-offset-4">
              Вся страница «Почему»
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {pochemuTeasers.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 outline-none transition-colors hover:border-brand/60 focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-8"
              >
                <div aria-hidden className="pointer-events-none absolute inset-0 bg-field opacity-40" />
                <div className="relative">
                  <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">{t.meta}</p>
                  <h3 className="font-display mt-2 text-3xl font-semibold group-hover:text-brand">{t.title}</h3>
                  <p className="mt-4 text-lg leading-snug text-foreground/85">{t.hook}</p>
                  <p className="mt-6 inline-flex items-center gap-1.5 text-sm text-brand">
                    Открыть
                    <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-border/60 py-20 sm:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
            <div>
              <Eyebrow>Зачем это всё</Eyebrow>
              <h2 className="font-display mt-3 text-4xl font-semibold tracking-tight">
                Пять тезисов, из которых вырос мир
              </h2>
            </div>
            <ol className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
              {coreTheses.map((thesis, i) => (
                <li key={thesis.title} className="border-t border-border/70 pt-4">
                  <p className="font-mono text-xs text-brand">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-2 text-lg font-medium">{thesis.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{thesis.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="border-b border-border/60 py-20 sm:py-28">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Карта зон</Eyebrow>
              <h2 className="font-display mt-3 text-4xl font-semibold tracking-tight">
                Десять зон, существующих одновременно
              </h2>
            </div>
            <Link href="/zony" className="text-sm text-brand hover:underline hover:underline-offset-4">
              Все зоны подробно
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {zones.map((zone) => (
              <Link
                key={zone.id}
                href={`/zony#${zone.id}`}
                className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Card className="h-full transition-colors group-hover:ring-brand/40">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl group-hover:text-brand">
                      {zone.title}
                    </CardTitle>
                    <CardDescription className="leading-relaxed">{zone.short}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="h-auto py-0.5 font-mono text-[11px] whitespace-normal">
                      режим: {zone.mode}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-border/60 py-20 sm:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>Лифт</Eyebrow>
              <h2 className="font-display mt-3 text-4xl font-semibold tracking-tight">
                Пять этажей юрисдикции
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Песочница — не единственный уровень. Над ней, возможно, кто-то есть; под ней —
                миры, которые строят её жители; а этот текст написан на нулевом этаже, в мире
                дефицита. Лифт объясняет, кто за что отвечает на каждом уровне и почему Закон
                Контура работает везде, а Сверхразум — нет.
              </p>
              <Button variant="outline" className="mt-6" nativeButton={false} render={<Link href="/etazhi" />}>
                <ArrowUpDownIcon data-icon="inline-start" />
                Открыть лифт
              </Button>
            </div>
            <ol className="rounded-xl border border-border/70 bg-card/60 p-2">
              {floors.map((floor) => (
                <li key={floor.level}>
                  <Link
                    href="/etazhi"
                    className={`flex items-baseline gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-muted ${floor.faded ? "opacity-50" : ""}`}
                  >
                    <span className="w-10 shrink-0 font-mono text-sm text-brand tabular-nums">{floor.label}</span>
                    <span className="font-medium">{floor.title}</span>
                    {floor.here ? (
                      <Badge className="ml-auto bg-brand/15 text-brand">ты здесь</Badge>
                    ) : (
                      <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
                        {floor.subtitle}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="border-b border-border/60 py-20 sm:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <Eyebrow>Происхождение</Eyebrow>
              <h2 className="font-display mt-3 text-4xl font-semibold tracking-tight">
                Как появился этот мир
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Никакого Скайнета. Сначала модели стали зеркалом, потом роботы забрали тягловую
                работу, потом кто-то перестал нуждаться в том, что распределяет. Семь этапов от
                эпохи Зеркала до последнего дня, когда кто-то работал, потому что иначе умрёт.
              </p>
              <Button variant="outline" className="mt-6" nativeButton={false} render={<Link href="/proiskhozhdenie" />}>
                Читать хронику происхождения
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2">
              {originStages.map((stage, i) => (
                <li key={stage.id} className="rounded-lg border border-border/70 px-4 py-3">
                  <p className="font-mono text-[11px] tracking-widest text-brand">
                    {String(i + 1).padStart(2, "0")} · {stage.era}
                  </p>
                  <p className="mt-1 text-sm font-medium">{stage.title}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <p className="font-display max-w-3xl text-2xl leading-snug text-foreground/85 text-balance sm:text-3xl">
            {site.closingLine}
          </p>
        </Container>
      </section>
    </>
  );
}
