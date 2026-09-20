import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { Container } from "@/components/section";
import { ShlyuzConsole } from "@/components/shlyuz-console";
import { requests } from "@/content/requests";

export const metadata: Metadata = {
  title: "Шлюз",
  description:
    "Интерактивная консоль Шлюза: выбери запрос или напиши свой — и посмотри, как Сверхразум оценивает его по цепочке контур, обратимость, воля, траектория, решение, правило.",
};

export default function ShlyuzPage() {
  return (
    <>
      <PageIntro
        eyebrow="Интерактив"
        title="Шлюз"
        lead={
          <>
            Так выглядит запрос к Общему пулу глазами того, кто его исполняет. Каждый запрос проходит
            одну и ту же цепочку: внутри ли он твоего контура, обратим ли, выражена ли воля, какая у
            него траектория. Потом решение и ссылка на правило в{" "}
            <Link href="/kodeks#mekhaniki" className="text-brand underline underline-offset-4">
              Кодексе
            </Link>
            . Здесь нет модели за кулисами — только правила, записанные явно.
          </>
        }
      />
      <section className="py-10 sm:py-14">
        <Container>
          <ShlyuzConsole requests={requests} />
        </Container>
      </section>
      <section className="border-t border-border/60 py-12 sm:py-16">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="font-mono text-[11px] tracking-widest text-brand uppercase">Контур</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Внутри — про тебя: тело, сознание, жизнь. Снаружи — про то, что увидят и потрогают другие.
                Спорно — когда контур ещё формируется или пересекается с чужим.
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-widest text-brand uppercase">Воля</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Выражена — ты в сознании и просишь сам. Не выражена — молчание, и оно не считается согласием
                на смерть. Заранее дана — контракт «верни», который расширяет твои варианты.
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-widest text-brand uppercase">Решение</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Выдано, выдано с предупреждением, возвращаю, восстанавливаю, момент прав, невозможно, не
                выдаётся, процесс. Восемь исходов, и ни одного «нельзя, потому что плохо».
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
