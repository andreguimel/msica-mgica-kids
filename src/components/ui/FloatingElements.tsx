import { motion } from "framer-motion";

const floatingItems = [
  { emoji: "⭐", size: "text-2xl", delay: 0, left: "2%", top: "8%" },
  { emoji: "🎵", size: "text-3xl", delay: 0.2, left: "92%", top: "12%" },
  { emoji: "✨", size: "text-xl", delay: 0.4, left: "5%", top: "75%" },
  { emoji: "🎶", size: "text-2xl", delay: 0.6, left: "95%", top: "70%" },
  { emoji: "💫", size: "text-xl", delay: 0.8, left: "8%", top: "45%" },
  { emoji: "🌟", size: "text-3xl", delay: 1, left: "90%", top: "85%" },
  { emoji: "🎤", size: "text-2xl", delay: 1.2, left: "3%", top: "90%" },
  { emoji: "🦋", size: "text-xl", delay: 1.4, left: "88%", top: "40%" },
];

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingItems.map((item, index) => (
        <motion.div
          key={index}
          className={`absolute ${item.size}`}
          style={{
            left: item.left,
            top: item.top,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [0.2, 0.45, 0.2],
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
