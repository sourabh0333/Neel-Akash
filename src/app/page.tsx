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

export default function Home() {
  return (
    <main>
      {/* Act I — arrival */}
      <Hero />
      <Intro />

      {/* Act II — the place */}
      <Island />
      <Stays />
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
