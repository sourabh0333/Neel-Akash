import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Chapters from "@/components/Chapters";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import BookingBand from "@/components/BookingBand";

/**
 * Home is the overview: it sets the scene, then previews every page in the
 * header and sends people on. The full content lives on those pages.
 */
export default function Home() {
  return (
    <main>
      <Hero />
      <Intro />
      <Chapters />
      <Gallery />
      <Testimonials />
      <BookingBand />
    </main>
  );
}
