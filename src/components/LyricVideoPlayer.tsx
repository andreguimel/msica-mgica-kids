import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Music, ChevronLeft, ChevronRight } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  images: string[];
  childName: string;
}

export default function AudioImagePlayer({ audioUrl, images, childName }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const imageInterval = duration > 0 && images.length > 0 ? duration / images.length : 15;

  // Auto-advance image based on audio time
  useEffect(() => {
    if (duration <= 0 || images.length === 0) return;
    const idx = Math.min(Math.floor(currentTime / imageInterval), images.length - 1);
    setCurrentImageIndex(idx);
  }, [currentTime, imageInterval, images.length, duration]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
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

  const goToImage = (direction: -1 | 1) => {
    setCurrentImageIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-[var(--shadow-soft)] aspect-video bg-foreground/90">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Background images with fade */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          {images.length > 0 ? (
            <motion.img
              key={currentImageIndex}
              src={images[currentImageIndex]}
              alt={`Ilustração ${currentImageIndex + 1} para ${childName}`}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
              <Music className="w-16 h-16 text-primary-foreground/50" />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.25)_100%)]" />

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

      {/* Image navigation arrows */}
      {images.length > 1 && !isPlaying && (
        <>
          <button
            onClick={() => goToImage(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => goToImage(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Child name badge */}
      <div className="absolute top-4 left-4">
        <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-1.5 text-white text-sm font-bold">
          🎵 {childName}
        </div>
      </div>

      {/* Image dots */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImageIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentImageIndex ? "bg-white scale-125" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

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
