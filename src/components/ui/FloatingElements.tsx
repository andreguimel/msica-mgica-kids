import { motion } from "framer-motion";

const floatingItems = [
  { emoji: "⭐", size: "text-2xl", delay: 0 },
  { emoji: "🎵", size: "text-3xl", delay: 0.2 },
  { emoji: "✨", size: "text-xl", delay: 0.4 },
  { emoji: "🎶", size: "text-2xl", delay: 0.6 },
  { emoji: "💫", size: "text-xl", delay: 0.8 },
  { emoji: "🌟", size: "text-3xl", delay: 1 },
  { emoji: "🎤", size: "text-2xl", delay: 1.2 },
  { emoji: "🦋", size: "text-xl", delay: 1.4 },
];

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingItems.map((item, index) => (
        <motion.div
          key={index}
          className={`absolute ${item.size}`}
          style={{
            left: `${10 + index * 12}%`,
            top: `${20 + (index % 3) * 25}%`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 4 + index * 0.5,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {item.emoji}
        </motion.div>
      ))}
    </div>
  );
}
