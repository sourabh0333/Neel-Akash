import type { Metadata } from "next";
import { site } from "@/lib/site";
import PageHeader from "@/components/PageHeader";
import Contact from "@/components/Contact";

export const metadata: Metadata = {
  title: "Contact & booking",
  description: `Book a stay at ${site.name}: a WhatsApp message to ${site.owner.name}, or call ${site.owner.phone}.`,
};

export default function ContactPage() {
  return (
    <main>
      <PageHeader eyebrow="Reservations" title="Come for" accent="a few days">
        Fill in the sentence. It becomes a WhatsApp message to{" "}
        {site.owner.name} with everything he needs — no forms, no accounts,
        no card details.
      </PageHeader>
      <Contact standalone />
    </main>
  );
}
