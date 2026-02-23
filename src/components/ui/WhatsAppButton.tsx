import { motion } from "framer-motion";

const WHATSAPP_NUMBER = "5581996919895";
const MESSAGE = encodeURIComponent("Olá! Tenho dúvidas sobre a música personalizada 🎵");

export function WhatsAppButton() {
  return (
    <motion.a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, type: "spring", stiffness: 260, damping: 20 }}
      aria-label="Falar no WhatsApp"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
      {/* WhatsApp SVG icon */}
      <svg viewBox="0 0 32 32" className="w-7 h-7 text-white fill-current relative z-10">
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.908 15.908 0 0016.004 32C24.826 32 32 24.826 32 16.004 32 7.176 24.826 0 16.004 0zm9.318 22.614c-.396 1.114-2.31 2.13-3.222 2.206-.912.076-1.77.41-5.952-1.24-5.036-1.986-8.222-7.164-8.47-7.496-.248-.332-2.022-2.688-2.022-5.128 0-2.44 1.28-3.64 1.734-4.138.454-.498 0.99-.622 1.32-.622.33 0 .66.004.948.018.304.014.712-.116 1.114.85.412 .99 1.396 3.414 1.52 3.662.124.248.206.538.04.868-.166.33-.248.538-.496.828-.248.29-.522.648-.746.87-.248.248-.506.516-.218.998.29.484 1.286 2.12 2.762 3.436 1.896 1.69 3.496 2.214 3.99 2.462.496.248.786.206 1.076-.124.29-.33 1.238-1.444 1.568-1.942.33-.498.66-.414 1.114-.248.454.166 2.884 1.362 3.38 1.61.496.248.826.372.948.578.124.206.124 1.196-.272 2.306z" />
      </svg>
    </motion.a>
  );
}
