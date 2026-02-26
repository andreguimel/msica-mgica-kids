import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepName } from "./StepName";
import { StepTheme } from "./StepTheme";
import { StepGenerating } from "./StepGenerating";
import { StepPlayer } from "./StepPlayer";

const DEMO_SONGS = [
  { name: "Pedro", theme: "Animais da Floresta", url: "/audio/demo-song.mp3", emoji: "🐾" },
  { name: "Amanda", theme: "Princesas Encantadas", url: "/audio/demo-amanda.mp3", emoji: "👑" },
  { name: "Isabela", theme: "Natureza Mágica", url: "/audio/demo-isabela.mp3", emoji: "🌿" },
];

const STEP_DURATIONS = [3500, 3500, 3500, 8000];
const STEP_COLORS = [
  "from-pink-100/40 to-purple-100/40",
  "from-amber-100/40 to-orange-100/40",
  "from-blue-100/40 to-indigo-100/40",
  "from-green-100/40 to-emerald-100/40",
];
const STEP_DOTS = ["🌸", "🌟", "🎵", "🎉"];

export function MagicMockup() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [mockupStep, setMockupStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [songIndex, setSongIndex] = useState(0);

  const song = DEMO_SONGS[songIndex];

  // Step cycling
  useEffect(() => {
    if (isPlaying) return;
    const timer = setTimeout(() => {
      setMockupStep((s) => (s + 1) % 4);
    }, STEP_DURATIONS[mockupStep]);
    return () => clearTimeout(timer);
  }, [mockupStep, isPlaying]);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setMockupStep(3); // Force to player step
      await audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const changeSong = useCallback((direction: 1 | -1) => {
    if (audioRef.current) audioRef.current.pause();
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

  const onDotClick = useCallback((i: number) => {
    if (i !== songIndex) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
      setSongIndex(i);
    }
  }, [songIndex]);

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => {
      setIsPlaying(false);
      // Resume cycle after 3s
      setTimeout(() => setMockupStep(0), 3000);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, [songIndex]);

  return (
    <div className="relative">
      <audio ref={audioRef} src={song.url} preload="metadata" />

      {/* Main magic board */}
      <div className={`relative rounded-[2rem] overflow-hidden shadow-magic animate-float border-[3px] border-dashed border-primary/30 p-5 bg-gradient-to-br ${STEP_COLORS[mockupStep]} backdrop-blur-sm transition-colors duration-700`}>
        
        {/* Corner decorations */}
        <span className="absolute top-2 left-3 text-xl pointer-events-none">⭐</span>
        <span className="absolute top-2 right-3 text-xl pointer-events-none">🎵</span>
        <span className="absolute bottom-2 left-3 text-lg pointer-events-none">🌈</span>
        <span className="absolute bottom-2 right-3 text-lg pointer-events-none">✨</span>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-3 mb-4">
          {STEP_DOTS.map((dot, i) => (
            <motion.div
              key={i}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                i === mockupStep
                  ? "bg-primary/20 ring-2 ring-primary/40"
                  : "bg-muted/40"
              }`}
              animate={i === mockupStep ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={i === mockupStep ? { duration: 1.5, repeat: Infinity } : {}}
            >
              {dot}
            </motion.div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[320px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={mockupStep}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              {mockupStep === 0 && <StepName />}
              {mockupStep === 1 && <StepTheme />}
              {mockupStep === 2 && <StepGenerating />}
              {mockupStep === 3 && (
                <StepPlayer
                  song={song}
                  songIndex={songIndex}
                  songsCount={DEMO_SONGS.length}
                  isPlaying={isPlaying}
                  progress={progress}
                  currentTime={currentTime}
                  duration={duration}
                  togglePlay={togglePlay}
                  changeSong={changeSong}
                  onDotClick={onDotClick}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating decorations outside */}
      <motion.div className="absolute -top-6 -right-6 text-5xl" animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 4, repeat: Infinity }}>
        🎈
      </motion.div>
      <motion.div className="absolute -bottom-4 -left-4 text-4xl" animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
        🌈
      </motion.div>
    </div>
  );
}
