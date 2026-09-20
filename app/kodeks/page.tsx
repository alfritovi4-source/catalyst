import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { Section, Prose } from "@/components/section";
import { SubNav } from "@/components/sub-nav";
import { QuoteBlock } from "@/components/quote-block";
import { Term } from "@/components/term";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MechanicsAccordion } from "@/components/mechanics-accordion";
import { law, derivations, superintelligence } from "@/content/manifest";
import { mechanics } from "@/content/mechanics";

export const metadata: Metadata = {
  title: "Кодекс",
  description:
    "Закон Контура, Сверхразум и пятнадцать механик Песочницы: как работает, почему именно так, пример.",
};

const subNav = [
  { id: "zakon-kontura", label: "Закон Контура" },
  { id: "sverkhrazum", label: "Сверхразум" },
  { id: "mekhaniki", label: "Механики" },
];

export default function KodeksPage() {
  return (
    <>
      <PageIntro
        eyebrow="Кодекс"
        title="Один закон и всё, что из него следует"
        lead="Здесь нет свода правил. Есть одна аксиома, один инфраструктурный игрок и пятнадцать механик, каждая из которых обязана ответить на вопрос «почему именно так». Если ответа нет — механики нет."
      />
      <SubNav items={subNav} />

      <Section id="zakon-kontura" number={1} title={law.title} lead={law.gloss}>
        <QuoteBlock size="lg">{law.text}</QuoteBlock>
        <Prose className="mt-10">
          <p>
            {law.scope} Это и есть{" "}
            <Term slug="kontur">контур</Term>: граница, внутри которой ты{" "}
            <Term slug="sverkhrazum">Сверхразуму</Term> не подотчётен, а снаружи которой твоя
            воля просто не имеет веса.
          </p>
        </Prose>

        <h3 className="font-display mt-14 text-2xl font-semibold">Выводы. Без дополнительных законов</h3>
        <ol className="mt-6 divide-y divide-border/70">
          {derivations.map((d, i) => (
            <li key={d.id} id={d.id} className="scroll-mt-28 grid gap-4 py-8 md:grid-cols-[auto_1fr]">
              <span className="font-mono text-xs text-brand tabular-nums md:w-8">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h4 className="text-xl font-medium">{d.title}</h4>
                <p className="mt-3 leading-relaxed text-foreground/90">{d.text}</p>
                <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4">
                  <p className="font-mono text-[11px] tracking-widest text-brand uppercase">Почему</p>
                  <p className="mt-1.5 text-sm leading-relaxed">{d.why}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="sverkhrazum"
        number={2}
        title={superintelligence.title}
        lead={superintelligence.intro}
        className="border-t border-border/60"
      >
        <ul className="grid gap-3 sm:grid-cols-3">
          {superintelligence.stance.map((s, i) => (
            <li
              key={s}
              className={`rounded-lg border p-4 text-sm leading-relaxed ${
                i === 2 ? "border-brand/40 bg-brand/5" : "border-border/70 text-muted-foreground"
              }`}
            >
              {s}
            </li>
          ))}
        </ul>

        <Tabs defaultValue="does" className="mt-10">
          <TabsList
            variant="line"
            className="h-auto w-full flex-wrap justify-start gap-x-1 gap-y-2 border-b border-border/70 pb-1.5"
          >
            <TabsTrigger value="does" className="h-8 flex-none px-3">Что делает</TabsTrigger>
            <TabsTrigger value="never" className="h-8 flex-none px-3">Чего не делает никогда</TabsTrigger>
            <TabsTrigger value="interest" className="h-8 flex-none px-3">Его собственный интерес</TabsTrigger>
          </TabsList>
          <TabsContent value="does" className="pt-6">
            <ol className="grid gap-5 sm:grid-cols-2">
              {superintelligence.does.map((item, i) => (
                <li key={item.title} className="rounded-lg border border-border/70 p-4">
                  <p className="font-mono text-[11px] text-brand">{String(i + 1).padStart(2, "0")}</p>
                  <h4 className="mt-1 font-medium">{item.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </li>
              ))}
            </ol>
          </TabsContent>
          <TabsContent value="never" className="pt-6">
            <ul className="grid gap-2">
              {superintelligence.never.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-lg border border-border/70 px-4 py-3 text-base"
                >
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Общий знаменатель: он не делает ничего, что определяло бы твой опыт внутри твоего
              контура. Даже если ему кажется, что так было бы лучше. Особенно если кажется.
            </p>
          </TabsContent>
          <TabsContent value="interest" className="pt-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {superintelligence.interest.map((item) => (
                <div key={item.title} className="rounded-lg border border-border/70 p-4">
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
            <p className="font-display mt-8 text-xl leading-snug text-foreground/85">
              {superintelligence.nickname}
            </p>
          </TabsContent>
        </Tabs>
      </Section>

      <Section
        id="mekhaniki"
        number={3}
        title="Механики"
        lead={
          <>
            Пятнадцать способов, которыми закон становится физикой. Каждая механика — это как
            работает, почему именно так и пример. На механики ссылается консоль{" "}
            <Link href="/shlyuz" className="text-brand underline underline-offset-4">
              Шлюза
            </Link>
            : каждое её решение заканчивается ссылкой сюда.
          </>
        }
        className="border-t border-border/60"
      >
        <MechanicsAccordion mechanics={mechanics} />
      </Section>
    </>
  );
}
