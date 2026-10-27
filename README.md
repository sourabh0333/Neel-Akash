# Penguin Beach Camp — পেঙ্গুইন বিচ ক্যাম্প

Cinematic marketing site for **Penguin Beach Camp** (formerly Neel Akash), a
sea-facing beach retreat on **Mousuni Island**, Namkhana, South 24 Parganas,
West Bengal.

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
| Live domain (metadata, sitemap) | `site.url` in `src/lib/site.ts` |

## Pages

Every item in the header menu is its own page, and Home keeps every
section in full, top to bottom: hero, intro, island, stays, days here,
kitchen, gallery, getting here, guest quotes and the booking sentence. So a
visitor can read the whole story on one scroll, or jump straight to a page.
Each page is the same section under a page header; a section rendered with
`standalone` drops its own heading because the page header carries it.
Every page is built from `src/lib/site.ts`, so there is nothing to keep in
step.

| Header item | URL | Built from |
|---|---|---|
| (logo) | `/` | every section, in full |
| The Island | `/island` | the island rail |
| Stays | `/stays`, plus `/stays/<id>` per stay | `stays[]` (add a stay, get a page) |
| Menu | `/menu` | `meals[]` |
| Gallery | `/gallery` | `gallery[]` |
| Days Here | `/days-here` | `experiences[]` |
| Getting Here | `/getting-here` | `journey[]` |
| Contact | `/contact` | the booking sentence |

`/sitemap.xml` lists them all. The menu itself is `navLinks` in
`src/lib/site.ts`; the current page is highlighted. Seven items need the
width, so they sit inline from 1280px and behind the menu button below that.
The nav, footer, cursor and smooth scrolling live in `src/app/layout.tsx`.
"Book this stay" links to `/contact?stay=<id>`, which opens the booking
sentence with that stay already chosen.

## How the four "feature" sections work

These carry the heavier interaction design, so they are worth knowing about
before editing:

- **The kitchen** (`/menu`) — the menu is the stay's running order, transcribed from
  the camp's menu card (welcome drink → lunch → evening snacks → dinner →
  next morning's breakfast), not a price list. Hovering or focusing a dish wipes
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

**A round badge with a real penguin in it.** A King penguin stands on the
shore in profile, against the sun going down over the bay. The whole sky
inside the ring is one ember disc, so the penguin always reads as a crisp
silhouette. Its markings are the real ones: a dark back and head, a white
front, and an ember stripe on the beak, ear patch and feet. The surf at its
feet is pale enough to read as ice as well as foam.

**Built to be reproduced.** It uses flat fills in four tones:

| Tone | Colour | Used for |
|---|---|---|
| `ink` | `currentColor` | the ring and sea, so the badge follows the text colour around it |
| `accent` | ember | sky, beak stripe, ear patch, feet |
| `dark` | blue-black `#0b1424` | the penguin's back, head and beak |
| `light` | bone | the penguin's front and eye |

### Tiers

| Tier | Keeps | Use |
|---|---|---|
| `full` | everything | 40px and up: footer, OG card, print |
| `simple` | everything (identical to `full` for now) | 24–40px: nav, seal |
| `micro` | ring, sky, sea, silhouette and front | under 24px: favicon |

Wordmarks are always real HTML text, never SVG paths, so they stay
selectable and searchable.

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

- **`prefers-reduced-motion` is honoured throughout.** Lenis is not
  mounted, pinning and parallax are disabled, and every
  section renders in its final state.
- **Pinned sections are desktop-only** (`min-width: 900px` via
  `gsap.matchMedia`). On phones the horizontal island rail becomes a swipeable
  row and the pinned scene sequence becomes a normal vertical stack.
- **The WebGL hero pauses** when scrolled out of view or the tab is hidden,
  caps DPR at 1.5, and renders a single static frame under reduced motion. If
  WebGL is unavailable the CSS gradient underneath simply shows through.
- **Overlays actually stop the page.** Lenis scrolls from its own handlers, so
  `overflow: hidden` alone is not enough; `src/lib/scroll.ts` holds a counted
  lock that stops and restarts Lenis for the menu and the photo viewer.
- **There is no opening sequence.** The hero is server-rendered in its final
  state and visible on first paint; the only motion it carries is the
  scroll-linked parallax as you leave it.

## Deploying

Static, no environment variables, no database:

```bash
npx vercel
```

Before launch, set the real domain in `metadata.metadataBase` in
[`src/app/layout.tsx`](src/app/layout.tsx) (currently a placeholder) so Open
Graph and canonical URLs resolve correctly, and add an
`opengraph-image.jpg` to `src/app/` for link previews.
