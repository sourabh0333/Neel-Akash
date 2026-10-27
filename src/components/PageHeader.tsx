import type { ReactNode } from "react";
import Reveal from "./ui/Reveal";

/**
 * The opening of every stand-alone page: a way back, an eyebrow, the title
 * and a short standfirst. The top padding clears the fixed nav.
 */
export default function PageHeader({
  eyebrow,
  title,
  accent,
  children,
  back = { href: "/", label: "Home" },
}: {
  eyebrow: string;
  title: string;
  /** Second half of the title, set italic in the accent colour. */
  accent?: string;
  children?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="relative bg-abyss pb-14 pt-36 md:pb-20 md:pt-44">
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <a
          href={back.href}
          className="link-draw inline-flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.24em] text-sand-dim hover:text-bone"
        >
          <span aria-hidden="true">&larr;</span> {back.label}
        </a>

        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Reveal as="p" mode="fade" className="t-eyebrow text-ember-500">
              {eyebrow}
            </Reveal>
            <Reveal as="h1" className="font-display t-huge mt-5 text-bone">
              {title}
              {accent && <span className="italic text-neel-300"> {accent}</span>}
            </Reveal>
          </div>
          {children && (
            <Reveal
              as="div"
              mode="fade"
              delay={0.1}
              className="max-w-[44ch] text-sm leading-relaxed text-sand lg:col-span-4"
            >
              {children}
            </Reveal>
          )}
        </div>
      </div>
    </header>
  );
}
