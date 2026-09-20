import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { Container } from "@/components/section";
import { TestimoniesList } from "@/components/testimonies-list";
import { testimonies } from "@/content/testimonies";

export const metadata: Metadata = {
  title: "Свидетельства",
  description:
    "Короткие истории жителей Песочницы от первого лица: тот, кто остановился на пятидесятом разе, сестра того, кто не остановился, взломщик у Стены, бог карманного мира и другие.",
};

export default function TestimoniesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Свидетельства"
        title="Голоса из Песочницы"
        lead="Кодекс объясняет правила. Свидетельства показывают, как они ощущаются изнутри — без назидания и без счастливого конца по умолчанию. Имена условные, истории — такие, какими они получаются, если правила действительно работают."
      />
      <section className="py-12 sm:py-16">
        <Container>
          <TestimoniesList testimonies={testimonies} />
        </Container>
      </section>
    </>
  );
}
