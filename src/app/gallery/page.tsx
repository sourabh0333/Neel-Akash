import type { Metadata } from "next";
import { site } from "@/lib/site";
import PageHeader from "@/components/PageHeader";
import Gallery from "@/components/Gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: `Photographs of the beach, the tide and the camp at ${site.name}, ${site.location.island}.`,
};

export default function GalleryPage() {
  return (
    <main>
      <PageHeader eyebrow="Gallery" title="The island," accent="in pictures">
        The beach, the tide and the boats at {site.location.island}. Click any
        photograph to see it large; the arrow keys step through them.
      </PageHeader>
      <Gallery layout="grid" />
    </main>
  );
}
