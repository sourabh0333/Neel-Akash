import type { Metadata } from "next";
import NotFound from "@/components/NotFound";

export const metadata: Metadata = {
  title: "Page not found",
};

/** Any address that isn't a page — including a stay id that doesn't exist. */
export default function NotFoundPage() {
  return (
    <main>
      <NotFound />
    </main>
  );
}
