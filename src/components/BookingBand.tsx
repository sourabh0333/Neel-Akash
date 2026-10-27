import { site } from "@/lib/site";
import Reveal from "./ui/Reveal";
import Magnetic from "./ui/Magnetic";

/** The home page's last word: where to book, and the number to call. */
export default function BookingBand() {
  return (
    <section className="relative border-t border-bone/10 bg-abyss py-24 md:py-32">
      <div className="mx-auto flex max-w-[100rem] flex-col items-start gap-10 px-6 md:px-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Reveal as="p" mode="fade" className="t-eyebrow text-ember-500">
            Reservations
          </Reveal>
          <Reveal as="h2" className="font-display t-huge mt-5 text-bone">
            Come for
            <span className="italic text-neel-300"> a few days</span>
          </Reveal>
          <p className="mt-6 max-w-[44ch] text-sm leading-relaxed text-sand">
            Booking is a WhatsApp message to {site.owner.name}, or a call to{" "}
            <a href={`tel:${site.owner.phoneRaw}`} className="link-draw text-bone">
              {site.owner.phone}
            </a>
            .
          </p>
        </div>
        <Magnetic strength={0.28}>
          <a
            href="/contact"
            data-cursor="Book"
            className="inline-flex items-center gap-4 rounded-full bg-bone px-9 py-5 text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-abyss transition-colors duration-300 hover:bg-ember-300"
          >
            Plan your stay <span aria-hidden="true">&rarr;</span>
          </a>
        </Magnetic>
      </div>
    </section>
  );
}
