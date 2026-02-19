import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Music, Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingElements } from "@/components/ui/FloatingElements";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { MagicButton } from "@/components/ui/MagicButton";
import heroImage from "@/assets/hero-animals-music.jpg";

const DEMO_SONGS = [
{ name: "Pedro", theme: "Animais da Floresta", url: "/audio/demo-song.mp3", emoji: "🐾" },
{ name: "Amanda", theme: "Princesas Encantadas", url: "/audio/demo-amanda.mp3", emoji: "👑" },
{ name: "Isabela", theme: "Natureza Mágica", url: "/audio/demo-isabela.mp3", emoji: "🌿" }];


export function Hero() {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [songIndex, setSongIndex] = useState(0);

  const [initialCount] = useState(() => 1234 + Math.floor(Math.random() * 500));
  const [todayCount] = useState(() => Math.floor(37 + Math.random() * 10));

  const song = DEMO_SONGS[songIndex];

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      await audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const changeSong = useCallback((direction: 1 | -1) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setSongIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return DEMO_SONGS.length - 1;
      if (next >= DEMO_SONGS.length) return 0;
      return next;
    });
  }, []);

  // Auto-play after song change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onCanPlay = () => {












































      // Don't auto-play on first mount
    };audio.addEventListener("canplaythrough", onCanPlay);return () => audio.removeEventListener("canplaythrough", onCanPlay);}, [songIndex]);useEffect(() => {const audio = audioRef.current;if (!audio) return;const onTime = () => {setCurrentTime(audio.currentTime);setProgress(audio.duration ? audio.currentTime / audio.duration * 100 : 0);};const onMeta = () => setDuration(audio.duration);const onEnd = () => {// Auto-advance to next song
        changeSong(1);};audio.addEventListener("timeupdate", onTime);audio.addEventListener("loadedmetadata", onMeta);audio.addEventListener("ended", onEnd);return () => {audio.removeEventListener("timeupdate", onTime);audio.removeEventListener("loadedmetadata", onMeta);audio.removeEventListener("ended", onEnd);};}, [changeSong]);return <section className="relative min-h-screen flex items-center overflow-hidden bg-background stars-bg">
      <FloatingElements />
      <audio ref={audioRef} src={song.url} preload="metadata" />

      <div className="container-rounded relative z-10 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Conteúdo textual */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="text-center lg:text-left">

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 badge-fun mb-6">

              <Sparkles className="w-4 h-4" />
              <span>Feito com IA + Muito Amor</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl md:text-5xl lg:text-6xl font-baloo font-extrabold leading-tight mb-6">

              <span className="text-foreground text-5xl">Supreenda a criança
com 
            </span>
              <br className="text-7xl" />
              <span className="text-gradient">Música Mágica</span>
              <br />
              
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">

              Música personalizada com o nome da sua criança — letra educativa, melodia alegre, pronta em 1 minuto.
              <span className="text-primary font-semibold"> Uma surpresa que ela nunca vai esquecer!</span>
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-6">

              <MagicButton
              size="lg"
              onClick={() => navigate("/criar")}
              className="w-full sm:w-auto">

                <Music className="w-5 h-5" />
                Criar a música mágica agora!
              </MagicButton>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Por apenas</p>
                <p className="text-3xl font-baloo font-extrabold text-primary">
                  R$ 9,90
                </p>
              </div>
            </motion.div>

            {/* Mini depoimentos abaixo do CTA */}
            <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col gap-2 mb-6 text-sm">

              {[
            { initials: "MS", text: '"Chorei de emoção quando ouvi!" — Mariana S.' },
            { initials: "PL", text: '"Meu filho ouve todo dia antes de dormir!" — Pedro L.' },
            { initials: "AP", text: '"Presente mais especial que já dei!" — Ana P.' }].
            map((t, i) =>
            <div key={i} className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-primary/80 flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                    {t.initials}
                  </div>
                  <span className="flex items-center gap-1">
                    <span className="text-accent text-xs">⭐⭐⭐⭐⭐</span>
                    <span className="text-xs">{t.text}</span>
                  </span>
                </div>
            )}
            </motion.div>

            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-muted-foreground">

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

          {/* Mockup Player de Música */}
          <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative">

            <div className="relative rounded-4xl overflow-hidden shadow-magic animate-float bg-card border border-border p-6">
              {/* Imagem de capa */}
              <div className="relative rounded-3xl overflow-hidden mb-5">
                <img
                src={heroImage}
                alt="Animais tocando música"
                className="w-full h-auto" />

                {isPlaying &&
              <>
                    <motion.span
                  className="absolute top-4 right-4 text-3xl"
                  animate={{ y: [0, -12, 0], rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}>

                      🎵
                    </motion.span>
                    <motion.span
                  className="absolute bottom-6 left-4 text-2xl"
                  animate={{ y: [0, -8, 0], rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}>

                      🎶
                    </motion.span>
                  </>
              }
              </div>

              {/* Info da música com animação de troca */}
              <div className="text-center mb-4">
                <AnimatePresence mode="wait">
                  <motion.div
                  key={songIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}>

                    <h3 className="font-baloo font-bold text-lg text-foreground">
                      ✨ Música da {song.name} ✨
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {song.emoji} Tema: {song.theme}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Barra de progresso */}
              <div className="mb-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }} />

                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{duration > 0 ? formatTime(duration) : "--:--"}</span>
                </div>
              </div>

              {/* Controles */}
              <div className="flex items-center justify-center gap-4">
                <motion.button
                onClick={() => changeSong(-1)}
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}>

                  <SkipBack className="w-4 h-4" />
                </motion.button>

                <motion.button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={isPlaying ? { scale: [1, 1.08, 1] } : {}}
                transition={isPlaying ? { duration: 1.5, repeat: Infinity } : {}}>

                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </motion.button>

                <motion.button
                onClick={() => changeSong(1)}
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}>

                  <SkipForward className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Indicador de música atual */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {DEMO_SONGS.map((_, i) =>
              <button
                key={i}
                onClick={() => {
                  if (i !== songIndex) {
                    if (audioRef.current) audioRef.current.pause();
                    setIsPlaying(false);
                    setProgress(0);
                    setCurrentTime(0);
                    setDuration(0);
                    setSongIndex(i);
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                i === songIndex ? "bg-primary scale-125" : "bg-muted-foreground/30"}`
                } />

              )}
              </div>

              {/* Ondas sonoras animadas */}
              <div className="flex items-end justify-center gap-1 mt-3 h-6">
                {[0.6, 1, 0.4, 0.8, 0.5, 1, 0.7, 0.3, 0.9, 0.5, 0.8, 0.6].map((h, i) =>
              <motion.div
                key={i}
                className="w-1.5 bg-primary/60 rounded-full"
                animate={
                isPlaying ?
                { height: [`${h * 24}px`, `${h * 8}px`, `${h * 24}px`] } :
                { height: "4px" }
                }
                transition={{
                  duration: 0.8 + Math.random() * 0.4,
                  repeat: isPlaying ? Infinity : 0,
                  delay: i * 0.08
                }} />

              )}
              </div>
            </div>

            {/* Decoração flutuante */}
            <motion.div
            className="absolute -top-6 -right-6 text-5xl"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity }}>

              🎈
            </motion.div>
            <motion.div
            className="absolute -bottom-4 -left-4 text-4xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}>

              🌈
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>;

}