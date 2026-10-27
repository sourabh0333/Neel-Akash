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
| Live domain (canonicals, sitemap, robots) | `NEXT_PUBLIC_SITE_URL` (see Deploying) |

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

`/sitemap.xml` lists them all (see SEO below). The menu itself is `navLinks` in
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
  exist) is its own page rather than a hero: a giant "404" with the bay
  inside the digits (dusk sky above, waves rolling below, the waterline
  rising and falling) that leans toward the pointer, the address that was
  not found, a "did you mean" for addresses one or two typos away from a
  real page, and every page in the menu as a card.

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
src/components/brand/penguin.ts       the drawing: SVG markup, one source for everything
src/components/brand/PenguinMark.tsx  the animated mark in the header and footer
src/components/brand/Logo.tsx         LogoSeal, the faint stamp behind the footer
scripts/gen-brand.ts                  regenerates the favicon and public/brand files
src/app/apple-icon.tsx                the iPhone icon (PNG, drawn from penguin.ts)
src/app/opengraph-image.tsx           the share card (PNG, drawn from penguin.ts)
public/brand/*.svg                    print and signage assets
```

**One drawing, everywhere.** `penguin.ts` returns the mark as SVG markup.
The header and footer logo, the favicon, the iPhone icon, the share card,
the footer stamp and the files in `public/brand` are all made from it, so
they cannot drift apart. After changing the drawing, regenerate the static
files:

```bash
node --experimental-strip-types scripts/gen-brand.ts
```

### Why it looks like this

**A King penguin, drawn true to the bird**: slate-grey back, the dark line
between back and belly, a white belly warming to gold at the breast, orange
ear patches running down the neck, and a long slender bill with an orange
stripe. It stands on the shore of a round sunset badge, the sun low over
the bay, with the sea and the sand at its feet.

**It lives.** On the site (`PenguinMark`), the penguin waddles on the spot,
flaps a flipper now and then, blinks and looks out to sea; the sun breathes
and the waves run. Pointing at the header logo makes it hop. It is all CSS
(the "Penguin mark" block in `globals.css`), so it costs nothing to run and
stops under reduced motion. Everywhere that CSS is absent (icons, print)
the same markup simply stands still. `still` draws it without motion on the
site; `title=""` hides it from screen readers where a link already names
the camp.

Wordmarks are always real HTML text, never SVG paths, so they stay
selectable and searchable.

> Two traps. Turbopack's SVG dimension parser rejects any file containing an
> XML comment (`Source code does not contain a <svg> root element`) — the
> generated files carry none. And Next silently ignores `apple-icon.svg`:
> only jpg/jpeg/png are accepted for that name, so the Apple icon is
> rasterised through `next/og`.

## Performance

Measured with Lighthouse 12 (mobile, throttled 4G and a 4× slower CPU) on a
production build. Field metrics Google ranks on are Core Web Vitals:

- **LCP** (largest paint): ~2.0–2.2 s with real throttling on every page —
  the hero's heading and photo are in the server HTML and paint at first
  paint. (Lighthouse's default *simulated* mode estimates 4–5 s for these
  pages; the observed trace puts LCP at first paint, ~1.3 s, so treat that
  estimate with caution.)
- **CLS** (layout shift): 0 on every page.
- **TBT / INP** (main-thread blocking): what is left is hydration and the
  scroll animations being set up during load.

What keeps it there, if you change things:

- `Reveal` splits and measures a heading only when it is about to scroll
  into view, never all at load.
- Hero headings are split into letters on the server (`HeroTitle`), so the
  intro animates letters that already exist rather than re-creating them.
- The WebGL sky (`HeroCanvas`) runs only on desktops with a real GPU,
  starts once the page is idle, and draws at 60% resolution and 30fps; on
  phones, Save-Data, low memory or software WebGL the CSS sky shows instead.
- The animated logo is its own compositing layer, so its motion doesn't
  repaint the blurred header glass.
- The Bengali font isn't preloaded (57 KB for a few small labels).

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

Static, no database. One environment variable:

```bash
NEXT_PUBLIC_SITE_URL=https://your-real-domain.in npx vercel
```

`NEXT_PUBLIC_SITE_URL` is the live address. Every canonical URL, the
sitemap and robots.txt are built from it, so set it in the hosting
dashboard before the first public deploy; without it they point at a
placeholder domain.

## SEO

```
src/lib/seo.ts          every page: its address, the files it is built from, its photos
src/app/sitemap.ts      /sitemap.xml
src/app/robots.ts       /robots.txt
```

- **`/sitemap.xml`** lists every page with its canonical, absolute URL and
  the photographs on it (an image sitemap). Its `lastmod` is the date of
  the last commit that changed the files the page is built from, taken
  from git at build time; if the build has no git history (a shallow
  clone) the date is left out rather than guessed. `priority` and
  `changefreq` are deliberately not used: Google and Bing ignore both, and
  Google only trusts `lastmod` while it stays accurate. A new page goes in
  `routes` in `src/lib/seo.ts`; a new stay is picked up automatically.
- **`/robots.txt`** opens the whole site to crawlers and gives the sitemap's
  address.
- **Canonicals:** every page declares its own (`alternates.canonical`), so
  addresses with tracking parameters or a trailing slash fold into one.
  The 404 is `noindex`.
- **Per-page titles and snippets** (`pageMeta` in `src/lib/meta.ts`): each
  page leads with what people actually search for ("Mousuni Island tent
  booking", "how to reach Mousuni Island from Kolkata", "things to do on
  Mousuni Island"…), titles 45–60 characters so Google shows them whole,
  descriptions 140–160 characters with the facts people compare camps on:
  price per head with food, distance, how to book. The same title and text
  go to Open Graph and Twitter, so a shared link previews its own page. Each
  stay's title and snippet are written from its data in `stays[]`, so a
  price change reaches search too.
- **Headings:** every page's single `<h1>` is keyword-led and reads as one
  phrase — a big display line plus a smaller line that finishes the
  sentence (`HeroTitle` in `src/components/ui/`), e.g. "How to reach ·
  Mousuni Island from Kolkata by train & ferry", "Tents & cottages · on
  Mousuni Island, from ₹900 a night with all meals".
- **Share cards:** every page names the 1200×630 card (`/opengraph-image`)
  for Open Graph and Twitter. It has to be explicit: a page that sets its
  own `openGraph` replaces the layout's, image and all.
- **Text without JavaScript:** fade-in text is only hidden for its entrance
  once an inline script has marked `html.js`, so crawlers and readers
  without JavaScript always see every word.
- **Structured data:** the layout carries the business as a `Resort` and
  `Campground` (address, coordinates, phone, price range, amenities, image,
  and each stay as an `Offer` with its real price); every inner page adds a
  `BreadcrumbList` (Home › Stays › Cottage).

After going live:

1. Add the domain to [Google Search Console](https://search.google.com/search-console)
   (a Domain property, verified by a DNS TXT record), then under
   **Sitemaps** submit `sitemap.xml`. Google no longer accepts sitemap
   "pings", so this and robots.txt are how it finds the sitemap.
2. Do the same in [Bing Webmaster Tools](https://www.bing.com/webmasters)
   (it can import the site straight from Search Console).
3. Create the camp's [Google Business Profile](https://business.google.com)
   with the same name, address and phone as the site. For "beach camp near
   Kolkata" style searches it matters as much as the site itself.
