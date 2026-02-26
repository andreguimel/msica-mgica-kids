import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Music } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingElements } from "@/components/ui/FloatingElements";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { MagicButton } from "@/components/ui/MagicButton";
import { MagicMockup } from "@/components/landing/mockup/MagicMockup";

const HEADLINES = [
  "Uma Música Única para o Amor da Sua Vida",
  "Crie a Música do Seu Filho(a) e Eternize Esse Momento",
  "Transforme o Nome do Seu Filho(a) em Canção Mágica",
];

export function Hero() {
  const navigate = useNavigate();
  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % HEADLINES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const [initialCount] = useState(() => 1234 + Math.floor(Math.random() * 500));
  const [todayCount] = useState(() => Math.floor(37 + Math.random() * 10));

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background stars-bg">
      <FloatingElements />

      <div className="container-rounded relative z-10 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Conteúdo textual */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="text-center lg:text-left">

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 badge-fun mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Feito com IA + Muito Amor</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-3xl md:text-4xl lg:text-5xl font-baloo font-extrabold leading-tight mb-6 min-h-[4.5rem] md:min-h-[5.5rem] lg:min-h-[7rem] flex items-center">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={headlineIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-gradient">{HEADLINES[headlineIndex]} 🎶</span>
                </motion.h1>
              </AnimatePresence>
            </motion.div>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Música personalizada com o nome da sua criança — letra educativa, melodia alegre, pronta em 1 minuto.
              <span className="text-primary font-semibold"> Uma surpresa que ela nunca vai esquecer!</span>
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col sm:flex-row items-center gap-4 mb-6">
              <MagicButton size="lg" onClick={() => navigate("/criar")} className="w-full sm:w-auto">
                <Music className="w-5 h-5" />
                Crie a letra da música grátis agora!
              </MagicButton>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="text-xs text-muted-foreground text-center lg:text-left mb-4">
              ✅ Pagamento seguro via Pix • Download instantâneo
            </motion.p>

            {/* Mini depoimentos */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col gap-2 mb-6 text-sm">
              {[
                { initials: "MS", text: '"Chorei de emoção quando ouvi!" — Mariana S.' },
                { initials: "PL", text: '"Meu filho ouve todo dia antes de dormir!" — Pedro L.' },
                { initials: "AP", text: '"Presente mais especial que já dei!" — Ana P.' },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-primary/80 flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                    {t.initials}
                  </div>
                  <span className="flex items-center gap-1">
                    <span className="text-accent text-xs">⭐⭐⭐⭐⭐</span>
                    <span className="text-xs">{t.text}</span>
                  </span>
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="text-xl">🎵</span>
                <span className="text-sm">
                  Mais de{" "}
                  <span className="font-bold text-primary">
                    <AnimatedCounter end={initialCount} duration={2.5} />
                  </span>
                  {" "}músicas criadas!
                </span>
              </span>
              <span className="text-muted-foreground/40 hidden sm:inline">•</span>
              <span className="flex items-center gap-1 text-sm">
                🔥 <span className="font-semibold text-foreground">{todayCount}</span> criadas hoje
              </span>
            </motion.div>
          </motion.div>

          {/* Quadro Mágico Animado */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <MagicMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
