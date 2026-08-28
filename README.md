# Neel Akash — নীল আকাশ

Cinematic marketing site for **Neel Akash**, a sea-facing beach retreat on
**Mousuni Island**, Namkhana, South 24 Parganas, West Bengal.

Proprietor: **Bijoy Jana** · +91 98325 15735

---

## Running it

```bash
npm run dev
```

Then open http://localhost:3000. Production build:

```bash
npm run build
```

## Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 | Static export of a single marketing page, good SEO defaults |
| Styling | Tailwind CSS v4 (`@theme` tokens) | Design tokens live in `globals.css`, no config file |
| Animation | GSAP 3 + ScrollTrigger + SplitText | Free for commercial use since GSAP 3.13 (Webflow) |
| Smooth scroll | Lenis, driven by GSAP's ticker | One rAF loop, so scroll-linked animation never desyncs |
| Hero background | Hand-written WebGL shader | ~4KB instead of ~600KB of Three.js — matters on rural 4G |

## Where to change things

**Almost everything the owner cares about is in one file: [`src/lib/site.ts`](src/lib/site.ts).**
Name, phone, WhatsApp number, address, room types, tariffs, menu, travel
directions, testimonials and gallery captions all live there.

| I want to change… | Edit |
|---|---|
| Phone / WhatsApp / owner name | `site.owner` in `src/lib/site.ts` |
| Address, PIN, map link | `site.location` in `src/lib/site.ts` |
| Room names, prices, features | `stays[]` in `src/lib/site.ts` |
| Meals, dish names, Bengali names | `meals[]` in `src/lib/site.ts` |
| Guest quotes | `testimonials[]` in `src/lib/site.ts` |
| How to reach steps | `journey[]` in `src/lib/site.ts` |
| Colours / type scale | `@theme` block in `src/app/globals.css` |
| Photographs | replace files in `public/images/` (keep the filenames) |

### ⚠️ Two things to confirm before going live

1. **Exact village.** A JustDial listing places "Mousuni Island Neel Akash
   Resort" in **Kusumtala**; most Mousuni camps are in **Baliara**. Set
   `site.location.village` to whichever is correct.
2. **Coordinates.** `site.location.lat/lng` are the island centroid, not the
   plot. Drop a pin on Google Maps and paste the real values — they feed the
   `Resort` structured data used for local search results.

### Photographs

`public/images/` currently holds **stock photography as placeholders** —
they are not pictures of this property. Replace each file with a real photo
of the same shape and nothing else needs to change:

| File | Used for | Shape |
|---|---|---|
| `hero.jpg` | Hero background | wide, 2400px |
| `stay-tent/bamboo/family.jpg` | Room list previews | 4:5 portrait |
| `xp-sunrise/lowtide/boat/bonfire.jpg` | Pinned "a day here" scenes | wide |
| `g-1.jpg` … `g-6.jpg` | Gallery contact sheet | mixed |
| `dish-*.jpg` | Menu dish previews (9) | square-ish |

## How the four "feature" sections work

These carry the heavier interaction design, so they are worth knowing about
before editing:

- **The kitchen** — the menu is the day's running order (breakfast → lunch →
  evening tea → dinner), not a price list. Hovering or focusing a dish wipes
  its photograph into the sticky plate panel and swaps the Bengali name and
  description. On touch there is no hover channel, so every dish carries its
  own inline thumbnail instead.
- **The gallery** — a row of tall shutters, all on screen at once. Whichever
  panel you point at opens and the rest give way; one is always open, so the
  row reads as a composition rather than a set of equal tiles. Nothing here
  scrolls or drifts — the section never moves under the reader and has no
  offscreen part to go hunting for. Below `md` there is no hover to drive it,
  so the same pictures become an editorial mosaic. Clicking a panel runs a
  measured FLIP: the picture grows out of the panel you clicked, arrow keys
  step through, Escape closes.
- **Guests** — one voice at a time at full size rather than a wall of cards.
  Words rise in sequence, a marker slides down the guest index, and the
  hairline timer *is* the clock — pausing on hover freezes it where it stands
  instead of restarting the countdown.
- **Reservations** — the form is the message. The guest completes a sentence
  with inline fields that resize to their own content, and a docket beside it
  fills in as they type: a slip of paper with hairline rows and torn edges,
  not a mock chat window. The docket is sticky and deliberately short, and the
  phone number and address sit in a full-width row underneath so neither
  column has to carry them.

- **Getting here** — the route line is built from per-step segments inside
  each row's own rail column, so it is anchored to the station nodes by
  construction. Each segment fills as you scroll past it and hands over to the
  next, and a station lights up the moment the line reaches it. Every mode
  carries a glyph: rails, a van, water, a tent.

  > Worth knowing if you edit this: the first version was a single stretched
  > SVG curve laid *beside* the list. With `preserveAspectRatio="none"` it was
  > squashed unevenly and wandered ±29px horizontally while the nodes stayed
  > fixed, so it never actually joined them up. Keep the line and the nodes in
  > the same box; do not position them independently.

## The brand mark

```
src/components/brand/geometry.ts   every number, plus an SVG-string builder
src/components/brand/Logo.tsx      the React mark and lockups
scripts/gen-brand.ts               regenerates the static files
public/brand/*.svg                 print and signage assets
```

Regenerate the static assets after changing the geometry:

```bash
node --experimental-strip-types scripts/gen-brand.ts
```

### Why it looks like this

A disc on a horizon inside a circle is the house style of every beach resort
on earth. Swap the name and it still works, which is the proof that it says
nothing. This mark is built from two things that belong to this island and
nowhere else.

**The matra (মাত্রা).** Bengali is written hanging from a horizontal
headstroke that runs along the top of every word and binds it together — the
single most recognisable feature of the script. This hotel is called নীল আকাশ,
*blue sky*. So the mark is a matra with everything hanging beneath it, and the
empty field above the stroke is the sky the place is named for: not a picture
of a sky, the typographic one that Bengali itself hangs from.

**Kantha (কাঁথা).** The running-stitch quilting of rural Bengal, sewn by women
from layered worn saris — the craft of this exact stretch of delta. Its
earliest form is a plain running stitch, and a running stitch is literally a
dashed line; it is prized for the rippled effect the stitches produce, which
is water. So the land and sea below the matra are stitched, not drawn.

**The taper.** Rows narrow as they descend. Mousuni is a deltaic island
tapering south into the Bay of Bengal and losing its south-western edge to
erosion; the rows read equally as the island and as the tide going out across
four kilometres of flat sand. One stitch in the last row is ember — kantha is
often worked with a contrasting thread pulled from a different sari.

Kantha is sewn from memory without pre-drawing, so stitch lengths carry a
small **deterministic** wobble (fixed seed, identical every build). The mark
is hand-sewn, not printed — and it is still reproducible.

### Tiers

| Tier | Rows | Use |
|---|---|---|
| `full` | 5 stitched rows | 40px and up — footer, hero |
| `simple` | 4 stitched rows | 24–40px — nav, seal |
| `micro` | 3 solid rows | under 24px — favicon |

Below about 24px a dash pattern silts up into mud, so `micro` drops the
stitching and keeps the silhouette. Wordmarks are always real HTML text,
never SVG paths, so they stay selectable and searchable.

> Two traps. Turbopack's SVG dimension parser rejects any file containing an
> XML comment (`Source code does not contain a <svg> root element`) — the
> generated files carry none. And Next silently ignores `apple-icon.svg`:
> only jpg/jpeg/png are accepted for that name, so the Apple icon is
> rasterised through `next/og`.

## Bookings

There is no booking engine, deliberately. The enquiry form in the contact
section composes a structured WhatsApp message (name, room, guests, dates,
notes) and hands it to the guest's own WhatsApp or dialler — nothing is sent
until they press send. That matches how reservations actually happen here and
means no server, no payment integration and no PII stored anywhere.

## Motion & accessibility notes

- **`prefers-reduced-motion` is honoured throughout.** The preloader is
  skipped, Lenis is not mounted, pinning and parallax are disabled, and every
  section renders in its final state.
- **Pinned sections are desktop-only** (`min-width: 900px` via
  `gsap.matchMedia`). On phones the horizontal island rail becomes a swipeable
  row and the pinned scene sequence becomes a normal vertical stack.
- **The WebGL hero pauses** when scrolled out of view or the tab is hidden,
  caps DPR at 1.5, and renders a single static frame under reduced motion. If
  WebGL is unavailable the CSS gradient underneath simply shows through.
- **Overlays actually stop the page.** Lenis scrolls from its own handlers, so
  `overflow: hidden` alone is not enough; `src/lib/scroll.ts` holds a counted
  lock that stops and restarts Lenis for the title card, the menu and the
  photo viewer.
- The intro → hero hand-off uses a **latched signal** (`src/lib/intro.ts`)
  with a 6s safety net, so hero content can never be stranded invisible if an
  animation fails.

## Deploying

Static, no environment variables, no database:

```bash
npx vercel
```

Before launch, set the real domain in `metadata.metadataBase` in
[`src/app/layout.tsx`](src/app/layout.tsx) (currently a placeholder) so Open
Graph and canonical URLs resolve correctly, and add an
`opengraph-image.jpg` to `src/app/` for link previews.
