"use client";

import { useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { site, stays } from "@/lib/site";
import Reveal from "./ui/Reveal";
import Magnetic from "./ui/Magnetic";
import { TokenInput, TokenSelect, TokenDate, Word } from "./ui/Token";

/**
 * No booking engine, on purpose: at this size reservations happen on WhatsApp
 * or the phone. So the form *is* the message — a sentence the guest completes
 * in their own words, with the outgoing WhatsApp text assembling live beside
 * it. Nothing is sent until they press send in WhatsApp itself.
 */
export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const stamp = useRef<HTMLSpanElement>(null);

  const [form, setForm] = useState({
    name: "",
    guests: "2",
    checkIn: "",
    nights: "2",
    stay: stays[0].name,
    notes: "",
  });

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const prettyDate = useMemo(() => {
    if (!form.checkIn) return "";
    const d = new Date(form.checkIn + "T00:00:00");
    if (Number.isNaN(d.getTime())) return form.checkIn;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [form.checkIn]);

  const message = useMemo(() => {
    const lines = [
      `Namaskar! I would like to enquire about a stay at ${site.name}.`,
      "",
      `Name: ${form.name.trim() || "—"}`,
      `Stay: ${form.stay}`,
      `Guests: ${form.guests}`,
      `Check-in: ${prettyDate || "—"}`,
      `Nights: ${form.nights}`,
    ];
    if (form.notes.trim()) lines.push(`Notes: ${form.notes.trim()}`);
    return lines.join("\n");
  }, [form, prettyDate]);

  const waHref = `https://wa.me/${site.owner.whatsapp}?text=${encodeURIComponent(
    message
  )}`;

  const ready = form.name.trim().length > 1 && form.checkIn !== "";

  /* Entrance */
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".compose-line", {
        opacity: 0,
        y: 26,
        duration: 0.9,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: { trigger: ".composer", start: "top 80%" },
      });
      gsap.from(".preview-panel", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".composer", start: "top 74%" },
      });
    },
    { scope: root }
  );

  /* Mark the moment the docket becomes sendable.
     This deliberately does NOT touch `.preview-panel` itself: that element is
     owned by the scroll-triggered entrance above, and a second tween on it
     with `overwrite` would kill the entrance mid-flight and strand the whole
     docket at opacity 0. */
  useGSAP(
    () => {
      if (prefersReducedMotion() || !stamp.current || !ready) return;
      gsap.fromTo(
        stamp.current,
        { scale: 0.4, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(3)" }
      );
    },
    { dependencies: [ready] }
  );

  return (
    <section ref={root} id="contact" className="relative bg-abyss py-28 md:py-36">
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <div className="mb-14 grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal as="p" mode="fade" className="t-eyebrow text-ember-500">
              Reservations
            </Reveal>
            <Reveal as="h2" className="font-display t-huge mt-5 text-bone">
              Come for
              <span className="italic text-neel-300"> a few days</span>
            </Reveal>
          </div>
          <Reveal
            as="p"
            mode="fade"
            delay={0.1}
            className="text-sm leading-relaxed text-sand lg:col-span-5"
          >
            Fill in the sentence. It becomes a WhatsApp message to{" "}
            {site.owner.name} with everything he needs — no forms, no accounts,
            no card details.
          </Reveal>
        </div>

        <div className="composer grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* ── The sentence ── */}
          <div className="lg:col-span-7">
            <p className="font-display text-[clamp(1.45rem,2.9vw,2.4rem)] leading-[1.5] text-sand">
              <span className="compose-line">
                <Word>Namaskar Bijoy-da, my name is</Word>{" "}
                <TokenInput
                  label="Your name"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="your name"
                  minWidth={120}
                />
                <Word>.</Word>
              </span>{" "}
              <span className="compose-line">
                <Word>I would like the</Word>{" "}
                <TokenSelect
                  label="Which stay"
                  value={form.stay}
                  onChange={set("stay")}
                  options={stays.map((s) => s.name)}
                />{" "}
                <Word>for</Word>{" "}
                <TokenInput
                  label="Number of guests"
                  type="number"
                  min={1}
                  max={40}
                  value={form.guests}
                  onChange={set("guests")}
                  minWidth={28}
                />{" "}
                <Word>{Number(form.guests) === 1 ? "guest" : "guests"},</Word>
              </span>{" "}
              <span className="compose-line">
                <Word>arriving</Word>{" "}
                <TokenDate
                  label="Check-in date"
                  value={form.checkIn}
                  onChange={set("checkIn")}
                />{" "}
                <Word>for</Word>{" "}
                <TokenInput
                  label="Number of nights"
                  type="number"
                  min={1}
                  max={30}
                  value={form.nights}
                  onChange={set("nights")}
                  minWidth={28}
                />{" "}
                <Word>{Number(form.nights) === 1 ? "night" : "nights"}.</Word>
              </span>
            </p>

            <div className="compose-line mt-10">
              <label
                htmlFor="notes"
                className="block text-[0.62rem] uppercase tracking-[0.24em] text-sand-dim"
              >
                Anything we should know
              </label>
              <textarea
                id="notes"
                rows={2}
                value={form.notes}
                onChange={(e) => set("notes")(e.target.value)}
                placeholder="Vegetarian meals, arriving on the evening train, travelling with parents…"
                className="mt-3 w-full resize-none border-b border-bone/20 bg-transparent py-3 text-bone outline-none transition-colors duration-300 placeholder:text-sand-dim/55 focus:border-ember-400"
              />
            </div>

            <div className="compose-line mt-10 flex flex-col gap-3 sm:flex-row">
              <Magnetic strength={0.2} className="sm:flex-1">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="Send"
                  aria-describedby="send-note"
                  className="group/w relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-ember-500 px-8 py-4 text-abyss"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-bone transition-transform duration-600 ease-[cubic-bezier(.16,1,.3,1)] group-hover/w:scale-x-100" />
                  <span className="relative text-[0.76rem] font-semibold uppercase tracking-[0.18em]">
                    {ready ? "Send on WhatsApp" : "Open in WhatsApp"}
                  </span>
                </a>
              </Magnetic>

              <a
                href={`tel:${site.owner.phoneRaw}`}
                data-cursor="Call"
                className="flex items-center justify-center rounded-full border border-bone/25 px-8 py-4 text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-bone transition-colors duration-400 hover:border-ember-400 hover:text-ember-300"
              >
                Call instead
              </a>
            </div>

            <p id="send-note" className="mt-5 text-[0.7rem] leading-relaxed text-sand-dim">
              This opens WhatsApp with the message below already written.
              Nothing is sent until you press send there.
            </p>
          </div>

          {/* ── The docket ──
              A slip of paper rather than a fake chat window: hairline rows,
              a torn top edge, and the values filling in as the sentence is
              written. Sticky, so it never outgrows the column beside it. */}
          <div className="lg:col-span-4 lg:col-start-9">
            <div className="preview-panel lg:sticky lg:top-24">
              {/* torn edge */}
              <div
                aria-hidden="true"
                className="h-2 w-full bg-ink [mask-image:radial-gradient(circle_at_5px_0,transparent_5px,black_5.5px)] [mask-repeat:repeat-x] [mask-size:10px_10px]"
              />

              <div className="bg-ink px-6 pb-6 pt-4">
                <div className="flex items-baseline justify-between">
                  <p className="text-[0.56rem] uppercase tracking-[0.3em] text-ember-500">
                    Enquiry
                  </p>
                  <p className="font-display text-sm text-sand-dim">{site.name}</p>
                </div>

                <dl className="mt-5">
                  {(
                    [
                      ["Guest", form.name.trim()],
                      ["Stay", form.stay],
                      ["Guests", form.guests],
                      ["Arriving", prettyDate],
                      ["Nights", form.nights],
                      ["Notes", form.notes.trim()],
                    ] as const
                  ).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-baseline justify-between gap-4 border-b border-dashed border-bone/12 py-2.5 last:border-b-0"
                    >
                      <dt className="shrink-0 text-[0.58rem] uppercase tracking-[0.2em] text-sand-dim">
                        {k}
                      </dt>
                      <dd
                        className={`truncate text-right text-sm ${
                          v ? "text-bone" : "text-sand-dim/45"
                        }`}
                      >
                        {v || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 flex items-center gap-2 border-t border-bone/12 pt-4">
                  <span
                    ref={stamp}
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${
                      ready ? "bg-ember-400" : "bg-sand-dim/50"
                    }`}
                  />
                  <p className="text-[0.62rem] uppercase tracking-[0.16em] text-sand-dim">
                    {ready ? "Ready to send" : "Add name and date"}
                  </p>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="h-2 w-full rotate-180 bg-ink [mask-image:radial-gradient(circle_at_5px_0,transparent_5px,black_5.5px)] [mask-repeat:repeat-x] [mask-size:10px_10px]"
              />
            </div>
          </div>
        </div>

        {/* ── Direct details, full width so neither column carries them ── */}
        <div className="mt-16 grid gap-8 border-t border-bone/12 pt-9 sm:grid-cols-3">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-sand-dim">
              Call or WhatsApp
            </p>
            <a
              href={`tel:${site.owner.phoneRaw}`}
              data-cursor="Call"
              className="link-draw mt-2 inline-block font-display text-2xl text-bone md:text-3xl"
            >
              {site.owner.phone}
            </a>
          </div>
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-sand-dim">
              Find us
            </p>
            <p className="mt-2 text-sm leading-relaxed text-sand">
              {site.location.village}, {site.location.island}
              <br />
              {site.location.block}, {site.location.district} &mdash;{" "}
              {site.location.pin}
            </p>
          </div>
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-sand-dim">
              Proprietor
            </p>
            <p className="mt-2 font-display text-2xl text-bone">
              {site.owner.name}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${site.location.mapsQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-draw mt-2 inline-block text-sm text-ember-300"
            >
              Get directions &nearr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
