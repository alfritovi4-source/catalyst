import * as React from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  number?: string | number;
  title: React.ReactNode;
  lead?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headingLevel?: "h2" | "h3";
};

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

export function Section({
  id,
  number,
  title,
  lead,
  children,
  className,
  headingLevel = "h2",
}: SectionProps) {
  const Heading = headingLevel;
  return (
    <section id={id} className={cn("scroll-mt-24 py-14 sm:py-20", className)}>
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:gap-14">
          <div>
            {number !== undefined ? (
              <p className="font-mono text-xs tracking-[0.2em] text-brand">
                {typeof number === "number" ? String(number).padStart(2, "0") : number}
              </p>
            ) : null}
            <Heading className="font-display mt-2 text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
              {title}
            </Heading>
            {lead ? (
              <div className="mt-4 text-base leading-relaxed text-muted-foreground">
                {lead}
              </div>
            ) : null}
          </div>
          <div className="min-w-0">{children}</div>
        </div>
      </Container>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-xs tracking-[0.2em] text-brand uppercase", className)}>
      {children}
    </p>
  );
}

export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("prose-sandbox text-[1.02rem] text-foreground/90", className)}>{children}</div>;
}
