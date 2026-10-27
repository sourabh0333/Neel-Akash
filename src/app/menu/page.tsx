import type { Metadata } from "next";
import { kitchen, site } from "@/lib/site";
import PageHeader from "@/components/PageHeader";
import Kitchen from "@/components/Kitchen";

export const metadata: Metadata = {
  title: "Menu",
  description: `The full meal plan at ${site.name}: welcome drink, lunch, evening snacks, dinner and next morning's breakfast.`,
};

export default function MenuPage() {
  return (
    <main>
      <PageHeader eyebrow="All meals included · রান্নাঘর" title="The menu">
        {kitchen.copy}
      </PageHeader>
      <Kitchen />
    </main>
  );
}
