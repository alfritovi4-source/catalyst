import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { Container } from "@/components/section";
import { FloorsNavigator } from "@/components/floors-navigator";
import { floors, jurisdictionNote, realityNote } from "@/content/floors";

export const metadata: Metadata = {
  title: "Лифт",
  description:
    "Пять этажей юрисдикции: тот, кто выше; Песочница; здесь, 2026; личные миры; миры внутри миров. Кто за что отвечает и почему Закон Контура работает везде.",
};

export default function FloorsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Лифт"
        title="Этажи юрисдикции"
        lead="Песочница — этаж +1. Но закон, на котором она стоит, не привязан к этажу: он требует одного и того же от любого, кто держит чужой мир. Лифт показывает, где кончается власть Сверхразума и где не кончается принцип."
      />
      <section className="py-12 sm:py-16">
        <Container>
          <FloorsNavigator floors={floors} />
        </Container>
      </section>
      <section className="border-t border-border/60 py-14 sm:py-20">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border/70 p-6 sm:p-8">
              <h2 className="font-display text-3xl font-semibold">{jurisdictionNote.title}</h2>
              <p className="mt-4 leading-relaxed text-foreground/90">{jurisdictionNote.text}</p>
            </div>
            <div className="rounded-2xl border border-border/70 p-6 sm:p-8">
              <h2 className="font-display text-3xl font-semibold">{realityNote.title}</h2>
              <p className="mt-4 leading-relaxed text-foreground/90">{realityNote.text}</p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
