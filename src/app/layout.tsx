import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter, Noto_Serif_Bengali } from "next/font/google";
import { site } from "@/lib/site";
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

/* For the Bengali wordmark — পেঙ্গুইন বিচ ক্যাম্প */
const bengali = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["400"],
  variable: "--font-bengali",
  display: "swap",
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
  openGraph: {
    type: "website",
    locale: "en_IN",
    url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.location.island}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  colorScheme: "dark",
};

/* Rich result for "resort near me" style searches. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Resort",
  name: site.name,
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
    >
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
