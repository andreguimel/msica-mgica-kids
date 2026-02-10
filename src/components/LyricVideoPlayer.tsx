import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Music } from "lucide-react";

interface LyricVideoPlayerProps {
  audioUrl: string;
  lyrics: string;
  images: string[];
  childName: string;
}

export default function LyricVideoPlayer({ audioUrl, lyrics, images, childName }: LyricVideoPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);

  const lines = lyrics
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Offset: skip intro (~12%) and outro (~8%) of the song for better vocal sync
  const introRatio = 0.12;
  const outroRatio = 0.08;
  const lyricsStart = duration * introRatio;
  const lyricsEnd = duration * (1 - outroRatio);
  const lyricsDuration = lyricsEnd - lyricsStart;

  const imageInterval = duration > 0 && images.length > 0 ? duration / images.length : 15;

  // Update current image based on time
  useEffect(() => {
    if (duration <= 0 || images.length === 0) return;
    const idx = Math.min(Math.floor(currentTime / imageInterval), images.length - 1);
    setCurrentImageIndex(idx);
  }, [currentTime, imageInterval, images.length, duration]);

  // Update current lyric line based on time (with intro/outro offset)
  useEffect(() => {
    if (duration <= 0 || lines.length === 0 || lyricsDuration <= 0) return;
    const elapsed = currentTime - lyricsStart;
    if (elapsed < 0) {
      setCurrentLineIndex(-1);
      return;
    }
    const lineInterval = lyricsDuration / lines.length;
    const idx = Math.floor(elapsed / lineInterval);
    setCurrentLineIndex(Math.min(idx, lines.length - 1));
  }, [currentTime, duration, lines.length, lyricsStart, lyricsDuration]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentLineIndex(-1);
    setCurrentImageIndex(0);
  }, []);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      await audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Visible lines: show current and 2 previous for context
  const visibleLineStart = Math.max(0, currentLineIndex - 2);
  const visibleLineEnd = Math.min(lines.length - 1, currentLineIndex + 2);
  const visibleLines = lines.slice(visibleLineStart, visibleLineEnd + 1);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-[var(--shadow-soft)] aspect-video bg-foreground/90">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Background images with fade transition */}
      <div className="absolute inset-0">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Ilustração ${i + 1} para ${childName}`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: i === currentImageIndex ? 1 : 0 }}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
        {/* Fallback if no images loaded yet */}
        {images.length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
            <Music className="w-16 h-16 text-primary-foreground/50" />
          </div>
        )}
      </div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      {/* Lyrics overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 px-4 md:px-8">
        <AnimatePresence mode="popLayout">
          {visibleLines.map((line, i) => {
            const globalIndex = visibleLineStart + i;
            const isCurrent = globalIndex === currentLineIndex;
            return (
              <motion.p
                key={`${globalIndex}-${line}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isCurrent ? 1 : 0.4,
                  y: 0,
                  scale: isCurrent ? 1 : 0.9,
                }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className={`text-center font-baloo font-bold text-white drop-shadow-lg ${
                  isCurrent ? "text-lg md:text-2xl" : "text-sm md:text-base"
                }`}
              >
                {line}
              </motion.p>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 transition-all duration-300"
      >
        {isPlaying ? (
          <Pause className="w-7 h-7 md:w-9 md:h-9" />
        ) : (
          <Play className="w-7 h-7 md:w-9 md:h-9 ml-1" />
        )}
      </button>

      {/* Child name badge */}
      <div className="absolute top-4 left-4">
        <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-1.5 text-white text-sm font-bold">
          🎵 {childName}
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
