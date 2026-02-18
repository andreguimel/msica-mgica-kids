import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const SESSION_KEY = "urgencyBannerExpiry";
const DURATION_MS = 15 * 60 * 1000; // 15 minutes

function getOrInitExpiry(): number {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) {
    const val = parseInt(stored, 10);
    if (val > Date.now()) return val;
  }
  const expiry = Date.now() + DURATION_MS;
  sessionStorage.setItem(SESSION_KEY, String(expiry));
  return expiry;
}

export function UrgencyBanner() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const expiry = getOrInitExpiry();
    const tick = () => {
      const remaining = Math.max(0, expiry - Date.now());
      setTimeLeft(remaining);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const handleCouponClick = async () => {
    try {
      await navigator.clipboard.writeText("MAGICA10");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-[60] bg-primary text-primary-foreground"
    >
      <div className="container mx-auto px-4 h-9 flex items-center justify-center gap-3 text-sm font-medium">
        <span className="hidden sm:inline">⏰ Oferta especial:</span>
        <button
          onClick={handleCouponClick}
          className="font-bold underline underline-offset-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          {copied ? "Copiado! ✓" : "10% OFF com MAGICA10"}
        </button>
        <span className="text-primary-foreground/70">—</span>
        <span>
          Expira em{" "}
          <span className="font-bold tabular-nums">{timeLeft > 0 ? formatted : "00:00"}</span>
        </span>
        <button
          onClick={() => {
            localStorage.setItem("exitCoupon", "MAGICA10");
            navigate("/criar");
          }}
          className="hidden sm:inline-flex ml-2 px-3 py-0.5 bg-primary-foreground text-primary rounded-full text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
        >
          Usar agora →
        </button>
      </div>
    </motion.div>
  );
}
