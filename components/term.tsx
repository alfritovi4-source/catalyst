import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Inline link to a glossary entry: <Term slug="kontur">контур</Term>.
 */
export function Term({
  slug,
  children,
  className,
}: {
  slug: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={`/slovar#${slug}`}
      className={cn(
        "underline decoration-brand/60 decoration-dotted underline-offset-3 hover:text-brand",
        className,
      )}
    >
      {children}
    </Link>
  );
}
