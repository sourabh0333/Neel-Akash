import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Island from "@/components/Island";
import Stays from "@/components/Stays";
import Experiences from "@/components/Experiences";
import Kitchen from "@/components/Kitchen";
import Gallery from "@/components/Gallery";
import Journey from "@/components/Journey";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import ArriveGhat from "@/components/ArriveGhat";

export const metadata: Metadata = pageMeta({
  path: "/",
  title: "Penguin Beach Camp – Mousuni Island Tents & Cottages",
  description:
    "Sea-facing tents and cottages on Mousuni Island, 120 km from Kolkata. From ₹900 per head a night with all meals, bonfire nights and a long, quiet beach.",
});

export default function Home() {
  return (
    <main>
      {/* Act I — arrival */}
      <Hero />
      <Intro />

      {/* Act II — the place */}
      <Island />
      <Stays />
      {/* Parking and the booking counter, where people are deciding to come */}
      <ArriveGhat />
      <Experiences />
      <Kitchen />

      {/* Act III — persuasion and logistics */}
      <Gallery />
      <Journey />
      <Testimonials />
      <Contact />
    </main>
  );
}
