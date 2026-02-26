import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const THEMES = [
  { emoji: "👑", label: "Princesas" },
  { emoji: "🦸", label: "Super-Herói" },
  { emoji: "🚀", label: "Espaço" },
];

export function StepTheme() {
  const [selected, setSelected] = useState(-1);

  useEffect(() => {
    const timer = setTimeout(() => setSelected(1), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm font-semibold text-muted-foreground">
        {selected >= 0 ? "Hmm... esse tema é perfeito! 🎯" : "Escolhendo o tema..."}
      </p>

      <div className="flex gap-4 justify-center">
        {THEMES.map((theme, i) => (
          <motion.div
            key={i}
            className={`flex flex-col items-center gap-1 rounded-2xl px-4 py-3 cursor-default transition-colors ${
              selected === i
                ? "bg-primary/15 border-2 border-primary/40"
                : "bg-background/40 border-2 border-transparent"
            }`}
            animate={
              selected === i
                ? { scale: [1, 1.15, 1.1], rotate: [0, 3, -3, 0] }
                : { scale: 1 }
            }
            transition={
              selected === i
                ? { duration: 0.8, repeat: Infinity, repeatDelay: 1 }
                : {}
            }
          >
            <span className="text-4xl">{theme.emoji}</span>
            <span className={`text-xs font-bold ${selected === i ? "text-primary" : "text-muted-foreground"}`}>
              {theme.label}
            </span>
            {selected === i && (
              <motion.span
                className="text-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                ✨
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
