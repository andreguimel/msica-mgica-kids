import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { Guarantee } from "@/components/landing/Guarantee";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { ExitIntentPopup } from "@/components/ui/ExitIntentPopup";
import { UrgencyBanner } from "@/components/ui/UrgencyBanner";

const Index = () => {
  return (
    <main className="min-h-screen">
      <UrgencyBanner />
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <Guarantee />
      <FAQ />
      <Footer />
      <ExitIntentPopup />
    </main>
  );
};

export default Index;

