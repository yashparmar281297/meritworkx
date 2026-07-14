import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Process from "@/components/landing/Process";
import WhySection from "@/components/landing/WhySection";
import TokenSystem from "@/components/landing/TokenSystem";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Process />
      <WhySection />
      <TokenSystem />
      <Pricing />
      <Footer />
    </main>
  );
}