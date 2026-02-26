import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";
import heroImage from "@/assets/hero-animals-music.jpg";

interface StepPlayerProps {
  song: { name: string; theme: string; emoji: string };
  songIndex: number;
  songsCount: number;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  togglePlay: () => void;
  changeSong: (dir: 1 | -1) => void;
  onDotClick: (i: number) => void;
}

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export function StepPlayer({
  song, songIndex, songsCount, isPlaying, progress,
  currentTime, duration, togglePlay, changeSong, onDotClick,
}: StepPlayerProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Celebration header */}
      <div className="flex items-center justify-center gap-2">
        <motion.span className="text-2xl" animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>🎉</motion.span>
        <p className="text-sm font-bold text-primary">A música ficou pronta! Aperte o play! 🎵</p>
        <motion.span className="text-2xl" animate={{ rotate: [0, -15, 15, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>🎉</motion.span>
      </div>

      {/* Cover image */}
      <div className="relative rounded-2xl overflow-hidden">
        <img src={heroImage} alt="Animais tocando música" className="w-full h-auto" />
        {isPlaying && (
          <>
            <motion.span className="absolute top-3 right-3 text-2xl" animate={{ y: [0, -10, 0], rotate: [0, 15, -15, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>🎵</motion.span>
            <motion.span className="absolute bottom-4 left-3 text-xl" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}>🎶</motion.span>
          </>
        )}
      </div>

      {/* Song info */}
      <div className="text-center">
        <AnimatePresence mode="wait">
          <motion.div key={songIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <h3 className="font-baloo font-bold text-base text-foreground">✨ Música da {song.name} ✨</h3>
            <p className="text-xs text-muted-foreground">{song.emoji} Tema: {song.theme}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{duration > 0 ? formatTime(duration) : "--:--"}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <motion.button onClick={() => changeSong(-1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <SkipBack className="w-3.5 h-3.5" />
        </motion.button>
        <motion.button onClick={togglePlay} className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg cursor-pointer" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} animate={isPlaying ? { scale: [1, 1.08, 1] } : {}} transition={isPlaying ? { duration: 1.5, repeat: Infinity } : {}}>
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </motion.button>
        <motion.button onClick={() => changeSong(1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <SkipForward className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* Song dots */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: songsCount }).map((_, i) => (
          <button key={i} onClick={() => onDotClick(i)} className={`w-2 h-2 rounded-full transition-all ${i === songIndex ? "bg-primary scale-125" : "bg-muted-foreground/30"}`} />
        ))}
      </div>

      {/* Sound waves */}
      <div className="flex items-end justify-center gap-1 h-5">
        {[0.6, 1, 0.4, 0.8, 0.5, 1, 0.7, 0.3, 0.9, 0.5, 0.8, 0.6].map((h, i) => (
          <motion.div key={i} className="w-1 bg-primary/60 rounded-full" animate={isPlaying ? { height: [`${h * 20}px`, `${h * 6}px`, `${h * 20}px`] } : { height: "3px" }} transition={{ duration: 0.8 + Math.random() * 0.4, repeat: isPlaying ? Infinity : 0, delay: i * 0.08 }} />
        ))}
      </div>
    </div>
  );
}
