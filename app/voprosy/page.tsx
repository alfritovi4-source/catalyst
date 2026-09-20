import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { Container } from "@/components/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { openQuestions } from "@/content/questions";

export const metadata: Metadata = {
  title: "Открытые вопросы",
  description:
    "Семь вопросов, на которые у Песочницы нет закрытого ответа: одна воля или много, сознания в личных мирах, последний дефицит, момент против контракта и другие.",
};

export default function QuestionsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Открытые вопросы"
        title="Где мы остановились"
        lead="Честный кодекс обязан показывать свои швы. Здесь собраны вопросы, по которым в разговоре были две позиции и не нашлось третьей, которая снимала бы обе. Для каждого — позиция А, позиция Б и точка, где мы остановились. Не закрыто — значит не закрыто."
      />
      <section className="py-12 sm:py-16">
        <Container>
          <Accordion multiple hiddenUntilFound defaultValue={[openQuestions[0].id]}>
            {openQuestions.map((q, i) => (
              <AccordionItem key={q.id} value={q.id} id={q.id} className="scroll-mt-28 py-1">
                <AccordionTrigger className="items-baseline gap-4 py-5 hover:no-underline">
                  <span className="font-mono text-xs text-brand tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1 pr-2">
                    <span className="font-display text-2xl leading-tight font-semibold sm:text-3xl">
                      {q.title}
                    </span>
                    <span className="text-sm font-normal text-muted-foreground">{q.question}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-8 pl-8 sm:pl-10">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="rounded-lg border border-border/70 p-5">
                      <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                        Позиция А
                      </p>
                      <p className="mt-2 text-[0.98rem] leading-relaxed text-foreground/90">{q.positionA}</p>
                    </div>
                    <div className="rounded-lg border border-border/70 p-5">
                      <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                        Позиция Б
                      </p>
                      <p className="mt-2 text-[0.98rem] leading-relaxed text-foreground/90">{q.positionB}</p>
                    </div>
                  </div>
                  <div className="mt-5 rounded-lg border border-brand/30 bg-brand/5 p-5">
                    <p className="font-mono text-[11px] tracking-widest text-brand uppercase">
                      Где мы остановились
                    </p>
                    <p className="mt-2 text-[0.98rem] leading-relaxed text-foreground/90">{q.status}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Container>
      </section>
    </>
  );
}
