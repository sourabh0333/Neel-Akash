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
| The Island | `/island` | its own sections (`src/components/island/`) plus the island rail |
| Stays | `/stays`, plus `/stays/<id>` per stay | `stays[]` (add a stay, get a page); `/stays` has its own sections in `src/components/stays/` |
| Menu | `/menu` | `meals[]`; the page's own sections are in `src/components/menu/` |
| Gallery | `/gallery` | `photos[]` (every picture in `gallery`, `stays` and `experiences`); sections in `src/components/gallery/` |
| Days Here | `/days-here` | `experiences[]` and `meals[]`; sections in `src/components/days/` |
| Getting Here | `/getting-here` | `journey[]`; sections in `src/components/getting/` |
| Contact | `/contact` | the booking sentence; sections in `src/components/contact/` |

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

- **Getting here** — a journey board, laid out the way transit planners
  present a trip: the headline numbers (total time counting up, legs, the
  ferry, the pickup); the whole trip as one bar split by leg in proportion
  to its time; the route map across the full width (21:9 on desktop, 16:10
  on tablets, 4:5 on phones); the steps, one column per leg; and practical
  cards for coming by road (`drivingRoute`), the tide, where to find us and
  arrival. One
  "active leg" ties it together: a marker loops along the map and that leg
  lights up in the map, the bar and the steps at once, with its step opening
  to show the detail. Pointing at a step or bar segment pauses the loop on
  that leg. Under reduced motion nothing loops and the route is drawn in
  full.

  The Island page tells the island in order: a horizon-split hero,
  "at a glance" (a statement that lights up word by word, numbers that
  count up), a pinned map that flies from the whole delta down to Mousuni
  and village by village out to the sandbar (same Natural Earth data as the
  route map; village positions in `IslandMap.tsx` are approximate), the
  village rail, a deck of stacking "a day here" cards, and a scroll-driven
  word band leading to Stays and Getting Here.

  The Stays page opens on the same horizon hero, then gives each stay a
  chapter of its own (the photograph opens out from a rounded window as it
  arrives), draws the day's meals along a line as you scroll, sets the
  three stays side by side with prices counting up, and closes on the
  proprietor's number. All of it reads from `stays[]` and `meals[]`.

  The Menu page opens on the same horizon hero, lights up a statement word
  by word, carries every plate along a pinned sideways rail (a swipeable row
  on phones), then the day course by course (the Home kitchen section) and a
  close that opens from a slot. Everything reads from `meals[]`.

  The Gallery page opens on the same horizon hero, then a field of frames
  you scroll into (each grows at its own rate until the middle one fills the
  screen), then every photograph on the site on one wall with All / Island /
  Stays / Days filters that re-flow it with GSAP Flip, and a full-screen
  viewer (arrow keys, swipe, Escape). Change a picture in `gallery`, `stays`
  or `experiences` and the wall follows.

  The Days Here page opens on the same horizon hero, then the day as the
  sun sees it: the section pins and scrolling carries the sun along its arc
  from 05:00 to 20:00, with the sky running from dawn to night, a clock,
  its light on the sea, stars at the end, and each moment in
  `experiences[]` lighting up as the sun reaches it. Then each moment up
  close (the Home cross-dissolve), and a suggested two days hour by hour,
  sorted from the times in `meals[]` and `experiences[]`.

  The Getting Here page opens on the same horizon hero, then the trip as
  a hand of tickets: the section pins and each leg's ticket slides up over
  the last, which sinks back into the deck, and is stamped as it lands.
  Then the journey board below, and a close with the proprietor's number.

  The Contact page opens on the same horizon hero, then three ways in
  (write, call, find) as cards with a glow that follows the pointer, the
  booking sentence, a map of the island that settles in from a wider view
  with the camp pulsing, the guest voices, and a few questions answered
  from what the site already says (prices from `stays[]`, the route from
  `journey[]`).

  Each stay's own page (`/stays/<id>`) opens on the same horizon hero over
  its photograph, with the price, who it sleeps and whether meals are in;
  then what you get as tiles beside a booking card that stays in view, the
  day's meals (only for stays that include them), the other stays opening
  out as you reach them, and the proprietor's number.

  The 404 (`src/app/not-found.tsx`, also shown for a stay id that does not
  exist) uses the same horizon hero, "Off the map", with every way back.

  The route map (`src/components/route/RouteMap.tsx`) plays the trip like a
  navigation app on the **real delta**: coastline, estuary, islands and the
  Hooghly from Natural Earth, with the railway drawn through its real
  stations (Baruipur, Lakshmikantapur, Kakdwip). A camera follows the
  traveller — wide on the train, close on the ferry — then pulls back to the
  whole route; the vehicle is drawn from above and turns with the route
  (carriages, a van, a boat trailing its wake, a toto), with an ETA counting
  down. Pointing at a step frames that leg and holds. It only animates while
  on screen; under reduced motion it shows the whole route, still.

  > Worth knowing if you edit this: the map data in
  > `src/components/route/geo.ts` is generated — edit
  > `scripts/gen-route-map.py` and run it against Natural Earth's 1:10m
  > `ne_10m_land` and `ne_10m_rivers_lake_centerlines` GeoJSON:
  >
  > ```bash
  > python3 scripts/gen-route-map.py path/to/natural-earth-geojson
  > ```
  >
  > At that scale Natural Earth joins Mousuni to the mainland, so the script
  > cuts the Chinai across the southern tip by hand. Station positions are
  > approximate (the map says so); once the camp's exact plot is known, set
  > it in the script's `stations` list. Leg times come from
  > `journey[].minutes`.

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
- **No loading screen, one short opening.** There is no intro screen in front
  of the site. The Home and Island heroes share one opening
  (`src/components/ui/Horizon.tsx`): the picture splits open from the
  horizon, the name rises letter by letter, and on the way out the frame
  draws in to a card. Scrolling back up always returns the hero fully open,
  and under reduced motion it is simply there, still.

## Deploying

Static, no environment variables, no database:

```bash
npx vercel
```

Before launch, set the real domain in `metadata.metadataBase` in
[`src/app/layout.tsx`](src/app/layout.tsx) (currently a placeholder) so Open
Graph and canonical URLs resolve correctly, and add an
`opengraph-image.jpg` to `src/app/` for link previews.
