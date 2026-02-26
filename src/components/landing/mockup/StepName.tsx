import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const NAME = "Pedro";
const CONFETTI = ["🎉", "🎊", "⭐", "💫", "✨", "🌟"];

export function StepName() {
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (typed >= NAME.length) return;
    const timer = setTimeout(() => setTyped((t) => t + 1), 180);
    return () => clearTimeout(timer);
  }, [typed]);

  const isComplete = typed >= NAME.length;

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.span
        className="text-5xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        👶
      </motion.span>

      <p className="text-sm font-semibold text-muted-foreground">
        Escrevendo o nome mágico... ✨
      </p>

      <div className="bg-background/60 rounded-2xl px-6 py-4 border-2 border-dashed border-primary/30 min-h-[56px] flex items-center justify-center gap-0.5">
        {NAME.split("").map((letter, i) => (
          i < typed ? (
            <motion.span
              key={i}
              className="text-3xl font-baloo font-extrabold text-primary"
              initial={{ opacity: 0, y: 20, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 12 }}
            >
              {letter}
            </motion.span>
          ) : (
            <span key={i} className="text-3xl font-baloo font-extrabold text-muted-foreground/20">
              _
            </span>
          )
        ))}
        {!isComplete && (
          <motion.span
            className="text-3xl font-baloo text-primary"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            |
          </motion.span>
        )}
      </div>

      {isComplete && (
        <div className="flex gap-2 flex-wrap justify-center">
          {CONFETTI.map((emoji, i) => (
            <motion.span
              key={i}
              className="text-2xl"
              initial={{ opacity: 0, y: 10, scale: 0 }}
              animate={{ opacity: 1, y: -10, scale: 1 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
}
