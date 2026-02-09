import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Features from "./components/Features";
import GameSection from "./components/GameSection";
import VisualBreak from "./components/VisualBreak";
import Stats from "./components/Stats";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="bg-canvas text-primary font-sans antialiased overflow-x-hidden transition-colors duration-300">
      <Navigation />
      <Hero />
      <Marquee />
      <Features />
      <GameSection />
      <VisualBreak />
      <Stats />
      <Footer />
    </div>
  );
}
