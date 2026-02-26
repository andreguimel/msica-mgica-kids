import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const FLOATING_NOTES = ["🎵", "🪄", "⭐", "🎶", "✨", "🎵"];

export function StepGenerating() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => Math.min(p + 3.5, 100));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Spinning emojis */}
      <div className="relative w-20 h-20">
        {FLOATING_NOTES.map((note, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl"
            style={{
              left: "50%",
              top: "50%",
            }}
            animate={{
              x: [0, Math.cos((i / FLOATING_NOTES.length) * Math.PI * 2) * 30],
              y: [0, Math.sin((i / FLOATING_NOTES.length) * Math.PI * 2) * 30],
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          >
            {note}
          </motion.span>
        ))}
      </div>

      <motion.p
        className="text-sm font-bold text-primary"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Criando sua música mágica... 🪄✨
      </motion.p>

      {/* Rainbow progress bar */}
      <div className="w-full max-w-[220px] h-4 rounded-full bg-muted overflow-hidden relative">
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #9b59b6, #ff6b9d)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: ["0% 0%", "100% 0%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        {/* Floating notes coming out */}
        {progress > 30 && (
          <motion.span
            className="absolute -top-5 text-sm"
            style={{ left: `${Math.min(progress, 90)}%` }}
            animate={{ y: [0, -8, 0], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            🎵
          </motion.span>
        )}
      </div>
    </div>
  );
}
