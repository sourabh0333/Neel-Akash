/**
 * ─────────────────────────────────────────────────────────────
 *  PENGUIN BEACH CAMP — single source of truth.
 *  Everything the owner may want to change lives in this file.
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
  /**
   * The live address — every canonical URL, the sitemap and robots.txt are
   * built from it. Set NEXT_PUBLIC_SITE_URL to the real domain when the site
   * goes live (e.g. https://penguinbeachcamp.in); the fallback is only a
   * placeholder and must not be what search engines see.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://penguinbeachcamp.example",
  name: "Penguin Beach Camp",
  // The same name written in Bengali script (a transliteration, not a
  // translation) — shown beside the English in the nav, intro and footer.
  nameBn: "পেঙ্গুইন বিচ ক্যাম্প",
  tagline: "Where the blue sky ends and the sea begins",
  description:
    "A sea-facing beach retreat on Mousuni Island — tents, cottages and bonfire nights on the edge of the Bay of Bengal, three hours from Kolkata.",

  owner: {
    name: "Bijoy Jana",
    role: "Proprietor",
    phone: "+91 98325 15735",
    phoneRaw: "+919832515735",
    whatsapp: "919832515735",
  },

  location: {
    village: "Kusumtala",
    island: "Mousuni Island",
    block: "Namkhana",
    district: "South 24 Parganas",
    state: "West Bengal",
    pin: "743357",
    country: "India",
    // Approximate island centroid — refine once the exact plot is surveyed.
    lat: 21.6667,
    lng: 88.2,
    full: "Kusumtala, Mousuni Island, Namkhana, South 24 Parganas, West Bengal 743357",
    mapsQuery: "Mousuni+Island+Kusumtala+Namkhana+West+Bengal+743357",
  },

  stats: [
    { value: "120", unit: "km", label: "from Kolkata" },
    { value: "4.5", unit: "km", label: "of open beach" },
    { value: "12", unit: "", label: "tents & cottages" },
    { value: "24/7", unit: "", label: "power & water" },
  ],
} as const;

/* ── Accommodation ─────────────────────────────────────────── */

export type Stay = {
  id: string;
  name: string;
  kicker: string;
  blurb: string;
  price: number;
  /** Regular price, shown struck through when `price` is a discount. */
  originalPrice?: number;
  priceNote: string;
  /** Whether the price includes the full meal plan in `meals`. */
  mealsIncluded: boolean;
  capacity: string;
  features: string[];
  image: string;
  /** Where the photograph's subject sits (CSS object-position), for wide crops. */
  focus?: string;
};

export const stays: Stay[] = [
  {
    id: "sea-facing-tent",
    name: "Sea-Facing Tent",
    kicker: "01 — Closest to the water",
    blurb:
      "Canvas pitched on the sand, mouth open to the Bay. You will hear the tide turn at three in the morning and you will not mind.",
    price: 900,
    priceNote: "per person / night",
    mealsIncluded: true,
    capacity: "2 – 3 guests",
    features: ["Direct beach access", "Attached washroom", "Power & fan", "Mosquito nets"],
    image:
      "/images/camp-tent.jpg",
    focus: "50% 55%",
  },
  {
    id: "cottage",
    name: "Cottage",
    kicker: "02 — Raised above the sand",
    blurb:
      "Woven bamboo, a private porch, and a floor lifted clear of the high tide. The quiet upgrade for anyone who wants a door that latches.",
    price: 1200,
    priceNote: "per person / night",
    mealsIncluded: true,
    capacity: "2 – 4 guests",
    features: ["Private porch", "Attached washroom", "Ceiling fan", "Sea view"],
    image:
      "/images/camp-room.jpg",
    focus: "50% 75%",
  },
  {
    id: "group-special",
    name: "Group Special",
    kicker: "03 — Bring everyone",
    blurb:
      "Friends, family or the whole office: one flat price for the group, instead of counting heads at the gate.",
    price: 3000,
    originalPrice: 4000,
    priceNote: "per night",
    // Not yet confirmed with the owner — don't promise meals until it is.
    mealsIncluded: false,
    capacity: "Whole group",
    features: ["One price for the whole group", "Book directly by phone or WhatsApp"],
    image:
      "/images/stay-family.jpg",
  },
];

/* ── Experiences ───────────────────────────────────────────── */

export type Experience = {
  index: string;
  title: string;
  time: string;
  copy: string;
  image: string;
};

export const experiences: Experience[] = [
  {
    index: "I",
    title: "Sunrise over the Chinai",
    time: "05:20",
    copy:
      "The river side wakes first. Fishing boats push off in the half-light while the island is still the colour of ash and rose.",
    image:
      "/images/xp-sunrise.jpg",
  },
  {
    index: "II",
    title: "The long walk at low tide",
    time: "09:00",
    copy:
      "When the water pulls back it leaves kilometres of hard, mirrored sand. Red crabs scatter. The horizon does not.",
    image:
      "/images/xp-lowtide.jpg",
  },
  {
    index: "III",
    title: "Boats to Kakramarir Chor",
    time: "15:30",
    copy:
      "A country boat, an hour of brown water, and a sandbar full of migratory birds that have not learned to be afraid of people.",
    image:
      "/images/xp-boat.jpg",
  },
  {
    index: "IV",
    title: "Bonfire and barbecue",
    time: "19:45",
    copy:
      "Driftwood, a guitar if someone brought one, fish off the coals, and a sky doing what it cannot do over Kolkata.",
    image:
      "/images/camp-bonfire.jpg",
  },
];

/* ── Kitchen ───────────────────────────────────────────────── */

export const kitchen = {
  heading: "The kitchen",
  copy:
    "Everything is cooked to order by the family, on the day it is bought. The fish came off a boat this morning; nobody here is pretending otherwise.",
};

export type Dish = {
  name: string;
  bn: string;
  note: string;
  image: string;
};

export type Meal = {
  time: string;
  label: string;
  bn: string;
  dishes: Dish[];
};

/**
 * The stay's running order, transcribed from the camp's own menu card:
 * arrival, lunch, evening snacks, dinner, then breakfast the next morning.
 * Meals are served, not ordered. Each `bn` is the card's wording; items the
 * card lists without a photo of their own are folded into the nearest dish.
 */
export const meals: Meal[] = [
  {
    time: "Arrival",
    label: "Welcome",
    bn: "প্রথমে",
    dishes: [
      {
        name: "Welcome Drink",
        bn: "ওয়েলকাম ড্রিংক",
        note: "Something cold the moment you arrive",
        image: "/images/camp-welcome-daab.jpg",
      },
    ],
  },
  {
    time: "13:30",
    label: "Lunch",
    bn: "দুপুরের খাবার",
    dishes: [
      {
        name: "Bhaat, Dal & Sabji",
        bn: "ভাত, ডাল, সব্জী, আমের চাট, স্যালাড ও পাঁপড়",
        note: "Rice, dal and the day's vegetables, with aamer chaat (mango chutney), salad and papad",
        image: "/images/dish-posto.jpg",
      },
      {
        name: "Pomfret",
        bn: "পমপ্লেট",
        note: "Pomfret from the bay",
        image: "/images/dish-paturi.jpg",
      },
      {
        name: "Chingri",
        bn: "চিংড়ি",
        note: "Prawns from the bay",
        image: "/images/dish-malaikari.jpg",
      },
    ],
  },
  {
    time: "17:30",
    label: "Evening snacks",
    bn: "বিকেলের চা",
    dishes: [
      {
        name: "Cha, Muri & Veg Pakora",
        bn: "চা, মুড়ি ও ভেজ পকোড়া",
        note: "Tea, puffed rice and hot vegetable fritters, taken facing the water",
        image: "/images/dish-telebhaja.jpg",
      },
    ],
  },
  {
    time: "21:00",
    label: "Dinner",
    bn: "রাতের খাবার",
    dishes: [
      {
        name: "Bhaat or Roti, Dal & Sabji",
        bn: "ভাত/রুটি, ডাল ও সব্জী",
        note: "Rice or roti, dal and the day's vegetables",
        image: "/images/dish-mangsho.jpg",
      },
      {
        name: "Chicken",
        bn: "চিকেন",
        note: "Chicken, to go with the rice or roti",
        image: "/images/dish-kalia.jpg",
      },
    ],
  },
  {
    time: "08:30",
    label: "Next morning",
    bn: "পরের দিন সকালে",
    dishes: [
      {
        name: "Luchi & Aloor Torkari",
        bn: "চা, বিস্কুট, লুচি, আলুর তরকারী ও ডিম সেদ্ধ",
        note: "Puffed fried bread and potato curry, with a boiled egg — and tea and biscuits to start",
        image: "/images/dish-luchi.jpg",
      },
    ],
  },
];

/* ── Getting here ──────────────────────────────────────────── */

/** For guests coming by road instead of the train. */
export const drivingRoute = ["Diamond Harbour", "Kakdwip", "Namkhana Bridge", "7 Mile", "Hujjuti Ghat"];

/**
 * The ghat everyone crosses from, on the Bakkhali road side of the Chinai.
 * Locally it goes by several spellings — Hujjuti, Hujuter, Huzzaitar —
 * so the alternatives are named once on the page for anyone searching.
 */
export const ghat = {
  name: "Hujjuti Ghat",
  aka: "Hujuter Kheya Ghat",
  landmark: "7 Mile",
  facilities: [
    {
      id: "parking",
      title: "Parking at the ghat",
      text: "Cars and bikes stay on this side of the Chinai. Park at the ghat and walk down to the boat.",
    },
    {
      id: "booking",
      title: "Our booking counter",
      text: "Penguin Beach Camp has its own counter at the ghat. Turn up without a booking and we will sort out a tent or cottage there and then.",
    },
  ],
};

/**
 * The route, leg by leg. `from`/`to` name the stations on the route map and
 * the tickets; `minutes` drives the trip clock (approximate, like `duration`).
 */
export const journey = [
  {
    step: "01",
    mode: "Rail",
    title: "Sealdah → Namkhana",
    from: "Sealdah",
    to: "Namkhana",
    minutes: 180,
    detail:
      "The Namkhana Local runs from Sealdah South. Roughly three hours through the delta.",
    duration: "≈ 3 hrs",
  },
  {
    step: "02",
    mode: "Road",
    title: "Namkhana → Hujjuti Ghat",
    from: "Namkhana",
    to: "Hujjuti Ghat",
    minutes: 35,
    detail:
      "A toto or auto from the station over the Namkhana Bridge, down the Bakkhali road to 7 Mile, then right to Hujjuti (Hujuter) Kheya Ghat. Parking and our booking counter are at the ghat.",
    duration: "≈ 35 min",
  },
  {
    step: "03",
    mode: "River",
    title: "Cross the Chinai",
    from: "Hujjuti Ghat",
    to: "Bagdanga, Mousuni",
    minutes: 15,
    detail:
      "A country boat across the Chinai to Bagdanga on Mousuni. Boats run with the tide, so tell us your train and we will time it for you.",
    duration: "≈ 15 min",
  },
  {
    step: "04",
    mode: "Arrival",
    title: "Bagdanga → Penguin Beach Camp",
    from: "Bagdanga, Mousuni",
    to: "Penguin Beach Camp",
    minutes: 15,
    detail:
      "A toto through the paddy and the betel groves. We meet you at the ghat if you let us know you are coming.",
    duration: "≈ 15 min",
  },
];

/* ── Gallery ───────────────────────────────────────────────── */

/** `ratio` is width ÷ height — it sets each frame's width in the strip. */
export const gallery = [
  {
    src: "/images/g-1.jpg",
    alt: "Waves breaking at dusk on the open beach",
    place: "Baliara",
    ratio: 1.5,
  },
  {
    src: "/images/g-2.jpg",
    alt: "Empty shoreline at low tide",
    place: "Low tide",
    ratio: 0.75,
  },
  {
    src: "/images/g-3.jpg",
    alt: "Fishing boat drawn up on the sand",
    place: "Bagdanga",
    ratio: 1.0,
  },
  {
    src: "/images/g-4.jpg",
    alt: "Sunset over the Bay of Bengal",
    place: "Bay of Bengal",
    ratio: 1.42,
  },
  {
    src: "/images/g-5.jpg",
    alt: "Birds over the sandbar",
    place: "Kakramarir Chor",
    ratio: 0.78,
  },
  {
    src: "/images/camp-heart-bench.jpg",
    alt: "The lit bamboo heart bench in the camp garden at night",
    place: "The camp",
    ratio: 1.33,
  },
];

/**
 * Every photograph on the site in one list, for the /gallery page's wall:
 * the island roll, then each stay and each part of the day. Swap a picture in
 * `gallery`, `stays` or `experiences` and the wall follows.
 */
export type Photo = { src: string; alt: string; title: string; group: "Island" | "Camp" | "Stays" | "Days" };

/** The camp itself after dark, beyond the frames already used elsewhere. */
const camp: Photo[] = [
  {
    src: "/images/camp-night-path.jpg",
    alt: "A sandy path between lit bamboo fences, leading up the steps under the casuarinas",
    title: "The path in",
    group: "Camp",
  },
  {
    src: "/images/camp-heart-palms.jpg",
    alt: "The glowing heart bench behind the palms in the camp garden",
    title: "The garden",
    group: "Camp",
  },
  {
    src: "/images/camp-welcome-daab.jpg",
    alt: "A green coconut with a straw, held up in front of the lit heart bench",
    title: "Welcome drink",
    group: "Camp",
  },
];

export const photos: Photo[] = [
  ...gallery.map((g) => ({ src: g.src, alt: g.alt, title: g.place, group: "Island" as const })),
  ...camp,
  ...stays.map((s) => ({ src: s.image, alt: s.name, title: s.name, group: "Stays" as const })),
  ...experiences.map((e) => ({ src: e.image, alt: e.title, title: e.title, group: "Days" as const })),
];

/* ── Voices ────────────────────────────────────────────────── */

export type Testimonial = {
  quote: string;
  name: string;
  initials: string;
  from: string;
  stay: string;
  when: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "We went for the beach and stayed for the kitchen. Three days and we never once looked at a menu — Bijoy-da just kept bringing things.",
    name: "Anirban & Rituparna",
    initials: "AR",
    from: "Kolkata",
    stay: "Cottage",
    when: "December 2025",
  },
  {
    quote:
      "The tent is ten steps from the water. Ten. I have paid four times as much elsewhere to be four hundred metres away.",
    name: "Shreya M.",
    initials: "SM",
    from: "Bengaluru",
    stay: "Sea-Facing Tent",
    when: "November 2025",
  },
  {
    quote:
      "Took my parents, who do not camp. They now tell everyone about the boat ride to the bird island. Worth the ferry, worth the toto.",
    name: "Devjit Roy",
    initials: "DR",
    from: "Durgapur",
    stay: "Group Special",
    when: "February 2026",
  },
  {
    quote:
      "No television, no lift lobby, no buffet. Just the tide coming in and someone asking whether we wanted more tea. I slept eleven hours.",
    name: "Farhana Q.",
    initials: "FQ",
    from: "Kolkata",
    stay: "Sea-Facing Tent",
    when: "January 2026",
  },
];

/* ── Nav ───────────────────────────────────────────────────── */

/** The header menu. Every item is its own page. */
export const navLinks = [
  { label: "The Island", href: "/island" },
  { label: "Stays", href: "/stays" },
  { label: "Menu", href: "/menu" },
  { label: "Gallery", href: "/gallery" },
  { label: "Days Here", href: "/days-here" },
  { label: "Getting Here", href: "/getting-here" },
  { label: "Contact", href: "/contact" },
];

/** One page per stay, under /stays. */
export const stayLinks = stays.map((s) => ({ label: s.name, href: `/stays/${s.id}` }));

/** Every page except home, for the sitemap. */
export const pages = [...navLinks, ...stayLinks];
