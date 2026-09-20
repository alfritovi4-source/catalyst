import type { Metadata } from "next";
import Link from "next/link";
import { JourneyPlayer } from "@/components/journey-player";
import { PageIntro } from "@/components/page-intro";
import { Container } from "@/components/section";
import { scenes } from "@/content/journey";

export const metadata: Metadata = {
  title: "Путешествие",
  description:
    "Первый год в Песочнице: текстовое путешествие с выбором. Лёгкость, Тишина, Мастерские, личный мир, миры выживания, Стена, Разгон, старый мир, Фронтир — и итоги года.",
};

export default function JourneyPage() {
  return (
    <>
      <PageIntro
        eyebrow="Интерактив"
        title="Первый год в Песочнице"
        lead={
          <>
            Ты только что проснулся в мире, где не нужно бороться за кусок хлеба. Дальше — год выборов, у
            каждого из которых есть последствия: для интереса, для топлива, для контура. Шлюз покажет
            траектории и исполнит слово «хватит». Остальное — твоё.
          </>
        }
      >
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
          <span>{scenes.length} сцен</span>
          <span>9 зон</span>
          <span>две концовки и итоги года</span>
          <span>без модели за кулисами</span>
        </div>
      </PageIntro>

      <section className="py-10 sm:py-14">
        <Container>
          <JourneyPlayer />
        </Container>
      </section>

      <section className="border-t border-border/60 py-12 sm:py-16">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="font-mono text-[11px] tracking-widest text-brand uppercase">Интерес</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Дикий компас. Ползунка у него нет: компас, который показывает туда, куда его повернули,
                ничего не показывает. Он двигается от того, что ты встречаешь, — и Шлюз к нему не
                прикасается.
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-widest text-brand uppercase">Топливо</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Энергия на интерес. Тратится в зонах, возвращается в Тишине и в Восстановлении. Когда оно
                на нуле, Шлюз предлагает восполнить — без вины и без условий. Можно отказаться; это твоё
                право.
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-widest text-brand uppercase">Контур и флаги</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Контур: цел или задет — тело чинится за сутки, если попросишь. Контракт с собой и режим
                спасения выбираются заранее и решают, что случится на пятидесятом разе и на рассвете в
                саванне. Правила — в{" "}
                <Link href="/kodeks#mekhaniki" className="text-brand underline underline-offset-4">
                  Кодексе
                </Link>
                .
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
