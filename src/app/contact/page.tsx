import type { Metadata } from "next";
import { breadcrumbs, pageMeta } from "@/lib/meta";
import JsonLd from "@/components/JsonLd";
import { site } from "@/lib/site";
import Contact from "@/components/Contact";
import Testimonials from "@/components/Testimonials";
import Reveal from "@/components/ui/Reveal";
import ContactHero from "@/components/contact/ContactHero";
import ContactWays from "@/components/contact/ContactWays";
import ContactFind from "@/components/contact/ContactFind";
import ContactFaq from "@/components/contact/ContactFaq";

export const metadata: Metadata = pageMeta({
  path: "/contact",
  title: "Book Penguin Beach Camp, Mousuni – Call or WhatsApp",
  description:
    "Book a tent or cottage on Mousuni Island with one WhatsApp message to Bijoy Jana, or call +91 98325 15735. No online payment, no forms. From ₹900.",
});

/**
 * Booking, told in order: the horizon, three ways in, the sentence that
 * becomes the message, where we are, what guests say, and the questions
 * people ask first.
 */
export default function ContactPage() {
  return (
    <main>
      <JsonLd data={breadcrumbs([{ name: "Contact", path: "/contact" }])} />
      <ContactHero />
      <ContactWays />

      <div id="compose" className="scroll-mt-24 border-t border-bone/10 bg-abyss pt-28 md:pt-36">
        <div className="mx-auto mb-14 grid max-w-[100rem] gap-6 px-6 md:mb-16 md:px-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal as="p" mode="fade" className="t-eyebrow text-ember-500">
              Write the message
            </Reveal>
            <Reveal as="h2" className="font-display t-huge mt-5 text-bone">
              Come for <span className="italic text-neel-300">a few days</span>
            </Reveal>
          </div>
          <Reveal
            as="p"
            mode="fade"
            delay={0.1}
            className="max-w-[44ch] text-sm leading-relaxed text-sand lg:col-span-4 lg:col-start-9"
          >
            Fill in the sentence. It becomes a WhatsApp message to{" "}
            {site.owner.name} with everything he needs, ready for you to send.
          </Reveal>
        </div>
      </div>
      <Contact standalone />

      <ContactFind />
      <Testimonials />
      <ContactFaq />
    </main>
  );
}
