import type { Metadata } from "next";
import NotFoundHero from "@/components/NotFoundHero";

export const metadata: Metadata = {
  title: "Page not found",
};

/** Any address that isn't a page — including a stay id that doesn't exist. */
export default function NotFound() {
  return (
    <main>
      <NotFoundHero />
    </main>
  );
}
