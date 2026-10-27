/**
 * ─────────────────────────────────────────────────────────────
 *  PENGUIN BEACH CAMP — single source of truth.
 *  Everything the owner may want to change lives in this file.
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
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
  priceNote: string;
  capacity: string;
  features: string[];
  image: string;
};

export const stays: Stay[] = [
  {
    id: "sea-facing-tent",
    name: "Sea-Facing Tent",
    kicker: "01 — Closest to the water",
    blurb:
      "Canvas pitched on the sand, mouth open to the Bay. You will hear the tide turn at three in the morning and you will not mind.",
    price: 1400,
    priceNote: "per person / night, all meals included",
    capacity: "2 – 3 guests",
    features: ["Direct beach access", "Attached washroom", "Power & fan", "Mosquito nets"],
    image:
      "/images/stay-tent.jpg",
  },
  {
    id: "bamboo-cottage",
    name: "Bamboo Cottage",
    kicker: "02 — Raised above the sand",
    blurb:
      "Woven bamboo, a private porch, and a floor lifted clear of the high tide. The quiet upgrade for anyone who wants a door that latches.",
    price: 1800,
    priceNote: "per person / night, all meals included",
    capacity: "2 – 4 guests",
    features: ["Private porch", "Attached washroom", "Ceiling fan", "Sea view"],
    image:
      "/images/stay-bamboo.jpg",
  },
  {
    id: "family-cottage",
    name: "Family Cottage",
    kicker: "03 — Room for everyone",
    blurb:
      "Two rooms, one long verandah, and enough space for grandparents and grandchildren to disagree about the sunset in comfort.",
    price: 2200,
    priceNote: "per person / night, all meals included",
    capacity: "4 – 6 guests",
    features: ["Two bedrooms", "Air conditioning", "Verandah", "Family dining"],
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
      "/images/xp-bonfire.jpg",
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

/** The day's running order. Meals are served, not ordered. */
export const meals: Meal[] = [
  {
    time: "08:30",
    label: "Breakfast",
    bn: "জলখাবার",
    dishes: [
      {
        name: "Luchi & Cholar Dal",
        bn: "লুচি ও ছোলার ডাল",
        note: "Puffed white flour bread, split chickpea dal with coconut",
        image: "/images/dish-luchi.jpg",
      },
    ],
  },
  {
    time: "13:30",
    label: "Lunch",
    bn: "দুপুরের খাবার",
    dishes: [
      {
        name: "Aloo Posto",
        bn: "আলু পোস্ত",
        note: "Potato in a ground poppy-seed paste",
        image: "/images/dish-posto.jpg",
      },
      {
        name: "Fish Kalia",
        bn: "মাছের কালিয়া",
        note: "Whatever came off the boat, in a rich onion-ginger gravy",
        image: "/images/dish-kalia.jpg",
      },
      {
        name: "Bhetki Paturi",
        bn: "ভেটকি পাতুরি",
        note: "Barramundi steamed in banana leaf with mustard",
        image: "/images/dish-paturi.jpg",
      },
    ],
  },
  {
    time: "17:30",
    label: "Evening tea",
    bn: "বিকেলের চা",
    dishes: [
      {
        name: "Cha & Telebhaja",
        bn: "চা ও তেলেভাজা",
        note: "Sweet milk tea and hot fritters, taken facing the water",
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
        name: "Chingri Malaikari",
        bn: "চিংড়ি মালাইকারি",
        note: "Prawns in coconut milk, the Sunday dish of every Bengali house",
        image: "/images/dish-malaikari.jpg",
      },
      {
        name: "Daab Chingri",
        bn: "ডাব চিংড়ি",
        note: "Prawns steamed inside a green coconut",
        image: "/images/dish-daab.jpg",
      },
      {
        name: "Kosha Mangsho",
        bn: "কষা মাংস",
        note: "Slow-fried mutton, dark and unhurried",
        image: "/images/dish-mangsho.jpg",
      },
      {
        name: "Nolen Gurer Payesh",
        bn: "নলেন গুড়ের পায়েস",
        note: "Rice pudding with date-palm jaggery — winter only",
        image: "/images/dish-payesh.jpg",
      },
    ],
  },
];

/* ── Getting here ──────────────────────────────────────────── */

export const journey = [
  {
    step: "01",
    mode: "Rail",
    title: "Sealdah → Namkhana",
    detail:
      "The Namkhana Local runs from Sealdah South. Roughly three hours through the delta.",
    duration: "≈ 3 hrs",
  },
  {
    step: "02",
    mode: "Road",
    title: "Namkhana → Bagdanga Ghat",
    detail:
      "A Tata Magic or auto from outside the station. Driving instead? Amtala, Diamond Harbour, Kakdwip, then the ghat.",
    duration: "≈ 40 min",
  },
  {
    step: "03",
    mode: "River",
    title: "Cross the Chinai",
    detail:
      "A short ferry to the island. Boats run with the tide, so tell us your train and we will time it for you.",
    duration: "≈ 10 min",
  },
  {
    step: "04",
    mode: "Arrival",
    title: "Ghat → Penguin Beach Camp",
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
    src: "/images/g-6.jpg",
    alt: "Night sky above the camp",
    place: "The camp",
    ratio: 1.6,
  },
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
    stay: "Bamboo Cottage",
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
    stay: "Family Cottage",
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

export const navLinks = [
  { label: "The Island", href: "#island" },
  { label: "Stays", href: "#stays" },
  { label: "Days Here", href: "#experiences" },
  { label: "Getting Here", href: "#journey" },
  { label: "Contact", href: "#contact" },
];
