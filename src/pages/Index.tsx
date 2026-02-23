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
import { PurchaseNotification } from "@/components/ui/PurchaseNotification";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { StickyMobileCTA } from "@/components/ui/StickyMobileCTA";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MagicButton } from "@/components/ui/MagicButton";
import { Sparkles } from "lucide-react";

function IntermediateCTA() {
  const navigate = useNavigate();
  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-lavender/5 to-secondary/5">
      <div className="container-rounded">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="text-5xl block mb-4">💛</span>
          <h2 className="text-3xl md:text-4xl font-baloo font-bold mb-4">
            Sua criança merece esse{" "}
            <span className="text-gradient">momento mágico</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Imagine o sorriso ao ouvir o próprio nome cantado em uma música feita só pra ela!
          </p>
          <MagicButton size="lg" onClick={() => navigate("/criar")}>
            <Sparkles className="w-5 h-5" />
            Criar música personalizada — R$ 9,90
          </MagicButton>
          <p className="text-xs text-muted-foreground mt-3">
            🛡️ Garantia de 7 dias • Reembolso total via Pix
          </p>
        </motion.div>
      </div>
    </section>
  );
}

const Index = () => {
  return (
    <main className="min-h-screen">
      <UrgencyBanner />
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <IntermediateCTA />
      <Pricing />
      <Guarantee />
      <FAQ />
      <Footer />
      <ExitIntentPopup />
      <PurchaseNotification />
      <WhatsAppButton />
      <StickyMobileCTA />
    </main>
  );
};

export default Index;
