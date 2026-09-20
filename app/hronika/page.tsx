import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { Container } from "@/components/section";
import { WaveMotif } from "@/components/wave";
import { wavePhases, waveCorrection } from "@/content/wave";

export const metadata: Metadata = {
  title: "Стоячая волна",
  description:
    "Хроника Песочницы как стоячая волна: Большой сброс, Пресыщение и Дивергенция идут одновременно, а не по расписанию.",
};

export default function WavePage() {
  return (
    <>
      <PageIntro
        eyebrow="Хроника"
        title="Стоячая волна"
        lead="Первую версию хроники мы написали как расписание: сначала сброс, потом пресыщение, потом расхождение. Она была красивой и неправильной. Настоящая хроника Песочницы — не история от А к Б, а три фазы, которые идут всегда и везде одновременно."
      />

      <div className="border-b border-border/60">
        <WaveMotif className="mx-auto max-w-7xl" />
      </div>

      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            {wavePhases.map((phase, i) => (
              <article
                key={phase.id}
                id={phase.id}
                className="flex flex-col rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-8"
              >
                <p className="font-mono text-xs tracking-[0.2em] text-brand">
                  ФАЗА {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="font-display mt-3 text-4xl leading-tight font-semibold">{phase.title}</h2>
                {phase.nickname ? (
                  <p className="mt-1 text-sm text-muted-foreground italic">«{phase.nickname}»</p>
                ) : null}
                <p className="mt-4 leading-relaxed text-foreground/90">{phase.summary}</p>

                <div className="mt-8">
                  <h3 className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                    Что видно снаружи
                  </h3>
                  <ul className="mt-3 space-y-2.5 text-sm leading-relaxed">
                    {phase.outside.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 rounded-lg border border-brand/30 bg-brand/5 p-4">
                  <h3 className="font-mono text-[11px] tracking-widest text-brand uppercase">
                    Что происходит внутри
                  </h3>
                  <ul className="mt-3 space-y-2.5 text-sm leading-relaxed">
                    {phase.inside.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border/60 py-16 sm:py-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-14">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-brand uppercase">Ключевая поправка</p>
              <h2 className="font-display mt-3 text-4xl font-semibold tracking-tight">
                {waveCorrection.title}
              </h2>
            </div>
            <div>
              <p className="font-display text-2xl leading-snug text-foreground/90 sm:text-3xl">
                {waveCorrection.text}
              </p>
              <p className="mt-6 text-sm text-muted-foreground">{waveCorrection.author}</p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
