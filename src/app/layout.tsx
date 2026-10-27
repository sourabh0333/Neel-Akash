import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter, Noto_Serif_Bengali } from "next/font/google";
import { site, stays } from "@/lib/site";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

/* Display serif for the cinematic title treatment. */
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* For the Bengali wordmark — পেঙ্গুইন বিচ ক্যাম্প. Not preloaded: at 57 KB
   it was the heaviest font on every page, yet it only sets a few small
   labels, so it loads on use and the labels swap into it a moment later
   instead of holding back first paint. */
const bengali = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["400"],
  variable: "--font-bengali",
  display: "swap",
  preload: false,
});

const url = site.url;

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: `${site.name} — Beach Resort on ${site.location.island}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "Mousuni Island resort",
    "Mousuni Island camp booking",
    "Baliara beach tent",
    "Penguin Beach Camp Mousuni",
    "beach resort near Kolkata",
    "Namkhana Mousuni tent",
    "West Bengal beach camping",
  ],
  authors: [{ name: site.owner.name }],
  // No og:url here: a layout's would be inherited by every page and point
  // them all at the home page. Each page declares its own canonical instead.
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.location.island}`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  colorScheme: "dark",
};

/* Rich result for "resort near me" style searches. */
const jsonLd = {
  "@context": "https://schema.org",
  // A beach camp: Campground says what it is, Resort how people search for it.
  "@type": ["Resort", "Campground"],
  name: site.name,
  url,
  image: `${url}/opengraph-image`,
  description: site.description,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${site.location.village}, ${site.location.island}`,
    addressLocality: site.location.block,
    addressRegion: site.location.state,
    postalCode: site.location.pin,
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: site.location.lat,
    longitude: site.location.lng,
  },
  telephone: site.owner.phoneRaw,
  priceRange: "₹₹",
  // The stays and their real prices, each pointing at its own page.
  makesOffer: stays.map((s) => ({
    "@type": "Offer",
    name: s.name,
    description: s.blurb,
    url: `${url}/stays/${s.id}`,
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: s.price,
      priceCurrency: "INR",
      unitText: s.priceNote,
    },
  })),
  amenityFeature: [
    "Sea-facing tents",
    "Bonfire",
    "All meals included",
    "Boat rides",
  ].map((n) => ({ "@type": "LocationFeatureSpecification", name: n })),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-IN"
      className={`${instrument.variable} ${inter.variable} ${bengali.variable}`}
      // The inline script below adds "js" before React hydrates.
      suppressHydrationWarning
    >
      <head>
        {/* Mark that JavaScript runs, before first paint: fade-in text is
            only hidden for its entrance when it will actually animate. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="grain antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* The shell every page shares: scroll, cursor, nav and footer. */}
        <SmoothScroll />
        <Cursor />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
