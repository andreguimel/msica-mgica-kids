import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Gift, Copy, Check, Sparkles } from "lucide-react";

const COUPON_CODE = "MAGICA10";
const SESSION_KEY = "exitPopupShown";
const STORAGE_KEY = "exitCoupon";

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger only when mouse moves toward the top of the page (closing/back intent)
      if (e.clientY < 5) {
        setIsVisible(true);
        sessionStorage.setItem(SESSION_KEY, "true");
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  const handleClose = () => setIsVisible(false);

  const handleCopyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(COUPON_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGetDiscount = () => {
    localStorage.setItem(STORAGE_KEY, COUPON_CODE);
    setIsVisible(false);
    navigate("/criar");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            key="popup"
            initial={{ opacity: 0, scale: 0.85, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -30 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-background shadow-2xl">
              {/* Decorative gradient top bar */}
              <div className="h-2 w-full bg-gradient-to-r from-primary via-secondary to-accent" />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-8 text-center">
                {/* Icon */}
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mb-4 flex justify-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Gift className="h-8 w-8 text-primary" />
                  </div>
                </motion.div>

                {/* Headline */}
                <h2 className="mb-2 font-baloo text-2xl font-bold text-foreground">
                  Espera! 🎵
                </h2>
                <p className="mb-1 text-muted-foreground">
                  Antes de ir, ganhe
                </p>
                <p className="mb-5 text-xl font-bold text-primary">
                  10% de desconto na sua música!
                </p>

                {/* Coupon box */}
                <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-3">
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Seu cupom:</p>
                    <p className="font-baloo text-2xl font-bold tracking-widest text-primary">
                      {COUPON_CODE}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyCoupon}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGetDiscount}
                  className="relative w-full overflow-hidden rounded-full bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lg transition-all hover:shadow-xl"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                    animate={{ translateX: ["100%", "-100%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Quero meu desconto!
                  </span>
                </motion.button>

                <button
                  onClick={handleClose}
                  className="mt-3 text-sm text-muted-foreground underline-offset-2 hover:underline"
                >
                  Não, obrigado
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
