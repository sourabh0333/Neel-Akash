import type { Metadata } from "next";
import { site } from "@/lib/site";
import Contact from "@/components/Contact";
import Testimonials from "@/components/Testimonials";
import Reveal from "@/components/ui/Reveal";
import ContactHero from "@/components/contact/ContactHero";
import ContactWays from "@/components/contact/ContactWays";
import ContactFind from "@/components/contact/ContactFind";
import ContactFaq from "@/components/contact/ContactFaq";

export const metadata: Metadata = {
  title: "Contact & booking",
  description: `Book a stay at ${site.name}: a WhatsApp message to ${site.owner.name}, or call ${site.owner.phone}.`,
  alternates: { canonical: "/contact" },
};

/**
 * Booking, told in order: the horizon, three ways in, the sentence that
 * becomes the message, where we are, what guests say, and the questions
 * people ask first.
 */
export default function ContactPage() {
  return (
    <main>
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
