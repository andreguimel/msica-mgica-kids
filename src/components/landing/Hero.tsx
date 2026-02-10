import { motion } from "framer-motion";
import { Sparkles, Music, Play, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingElements } from "@/components/ui/FloatingElements";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { MagicButton } from "@/components/ui/MagicButton";
import heroImage from "@/assets/hero-animals-music.jpg";

export function Hero() {
  const navigate = useNavigate();
  
  // Número inicial aleatório para o contador
  const initialCount = 1234 + Math.floor(Math.random() * 500);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background stars-bg">
      <FloatingElements />
      
      <div className="container-rounded relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Conteúdo textual */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 badge-fun mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>Feito com IA + Muito Amor</span>
            </motion.div>

            {/* Título */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-baloo font-extrabold leading-tight mb-6"
            >
              <span className="text-gradient">Música Mágica</span>
              <br />
              <span className="text-foreground">para Crianças</span>
            </motion.h1>

            {/* Descrição */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Crie uma música única e personalizada com o nome do seu filho! 
              Letra educativa, melodia alegre e muita diversão. 
              <span className="text-primary font-semibold"> Em apenas 1 minuto!</span>
            </motion.p>

            {/* CTA e Preço */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-4 mb-8"
            >
              <MagicButton 
                size="lg" 
                onClick={() => navigate("/criar")}
                className="w-full sm:w-auto"
              >
                <Music className="w-5 h-5" />
                Criar minha música agora!
              </MagicButton>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Por apenas</p>
                <p className="text-3xl font-baloo font-extrabold text-primary">
                  R$ 19,90
                </p>
              </div>
            </motion.div>

            {/* Contador */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center lg:justify-start gap-2 text-muted-foreground"
            >
              <span className="text-2xl">🎵</span>
              <span className="text-lg">
                Mais de{" "}
                <span className="font-bold text-primary text-xl">
                  <AnimatedCounter end={initialCount} duration={2.5} />
                </span>
                {" "}músicas já criadas!
              </span>
            </motion.div>
          </motion.div>

          {/* Mockup Player de Música */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative rounded-4xl overflow-hidden shadow-magic animate-float bg-card border border-border p-6">
              {/* Imagem de capa */}
              <div className="relative rounded-3xl overflow-hidden mb-5">
                <img
                  src={heroImage}
                  alt="Animais tocando música"
                  className="w-full h-auto"
                />
                {/* Notas musicais animadas */}
                <motion.span
                  className="absolute top-4 right-4 text-3xl"
                  animate={{ y: [0, -12, 0], rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  🎵
                </motion.span>
                <motion.span
                  className="absolute bottom-6 left-4 text-2xl"
                  animate={{ y: [0, -8, 0], rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  🎶
                </motion.span>
              </div>

              {/* Info da música */}
              <div className="text-center mb-4">
                <h3 className="font-baloo font-bold text-lg text-foreground">
                  ✨ Música da Sofia ✨
                </h3>
                <p className="text-sm text-muted-foreground">Tema: Animais da Floresta</p>
              </div>

              {/* Barra de progresso animada */}
              <div className="mb-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 3, delay: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0:58</span>
                  <span>1:32</span>
                </div>
              </div>

              {/* Controles */}
              <div className="flex items-center justify-center gap-6">
                <motion.div
                  className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg cursor-pointer"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Pause className="w-5 h-5" />
                </motion.div>
              </div>

              {/* Ondas sonoras animadas */}
              <div className="flex items-end justify-center gap-1 mt-4 h-6">
                {[0.6, 1, 0.4, 0.8, 0.5, 1, 0.7, 0.3, 0.9, 0.5, 0.8, 0.6].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 bg-primary/60 rounded-full"
                    animate={{ height: [`${h * 24}px`, `${h * 8}px`, `${h * 24}px`] }}
                    transition={{
                      duration: 0.8 + Math.random() * 0.4,
                      repeat: Infinity,
                      delay: i * 0.08,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Decoração flutuante */}
            <motion.div
              className="absolute -top-6 -right-6 text-5xl"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              🎈
            </motion.div>
            <motion.div
              className="absolute -bottom-4 -left-4 text-4xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🌈
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
