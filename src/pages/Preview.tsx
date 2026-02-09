import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Pause,
  Volume2,
  ArrowLeft,
  Download,
  ShoppingCart,
  Music,
  FileText,
  Check,
} from "lucide-react";
import { MagicButton } from "@/components/ui/MagicButton";
import { FloatingElements } from "@/components/ui/FloatingElements";
import heroImage from "@/assets/hero-animals-music.jpg";

interface MusicResult {
  formData: {
    childName: string;
    ageGroup: string;
    theme: string;
    specialMessage: string;
  };
  lyrics: string;
  audioUrl: string;
}

export default function Preview() {
  const navigate = useNavigate();
  const [result, setResult] = useState<MusicResult | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("musicResult");
    if (stored) {
      const data = JSON.parse(stored) as MusicResult;
      setResult(data);

      const audio = new Audio(data.audioUrl);
      audioRef.current = audio;
      audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
      audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
      audio.addEventListener("ended", () => setIsPlaying(false));

      return () => {
        audio.pause();
      };
    } else {
      navigate("/criar");
    }
  }, [navigate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!result) return null;

  const { formData, lyrics } = result;

  const themeEmojis: Record<string, string> = {
    animais: "🐻",
    princesas: "👸",
    "super-herois": "🦸",
    espaco: "🚀",
    natureza: "🌿",
  };

  return (
    <div className="min-h-screen bg-background stars-bg relative overflow-hidden">
      <FloatingElements />

      <div className="container-rounded py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate("/criar")}
            className="w-10 h-10 rounded-full bg-card shadow-soft flex items-center justify-center hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-baloo font-bold">
              Sua música está <span className="text-gradient">pronta!</span>
            </h1>
            <p className="text-muted-foreground">
              Para {formData.childName} {themeEmojis[formData.theme]}
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Audio Player */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="card-float">
              <h3 className="font-baloo font-bold text-lg mb-4 flex items-center gap-2">
                <Music className="w-5 h-5 text-primary" />
                Sua Música Personalizada
              </h3>
              <div className="bg-muted/50 rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={togglePlay}
                    className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-pink shrink-0"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-primary-foreground" fill="currentColor" />
                    ) : (
                      <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
                    )}
                  </motion.button>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Preview image */}
            <div className="relative rounded-4xl overflow-hidden shadow-magic">
              <img src={heroImage} alt="Preview do vídeo" className="w-full h-auto" />
              <div className="watermark" />
            </div>
          </motion.div>

          {/* Letra e CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Letra da música */}
            <div className="card-float">
              <h3 className="font-baloo font-bold text-xl mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Letra da Música
              </h3>
              <div className="bg-muted/50 rounded-2xl p-6 max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-nunito text-sm leading-relaxed">
                  {lyrics}
                </pre>
              </div>
            </div>

            {/* O que você recebe */}
            <div className="card-float">
              <h3 className="font-baloo font-bold text-lg mb-4">Ao comprar você recebe:</h3>
              <ul className="space-y-3">
                {[
                  { icon: Music, text: "MP3 completo da música cantada" },
                  { icon: FileText, text: "PDF com letra para imprimir" },
                  { icon: Download, text: "Download instantâneo" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-mint/20 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-mint-foreground" />
                    </div>
                    <span className="text-sm">{item.text}</span>
                    <Check className="w-4 h-4 text-mint ml-auto" />
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA de compra */}
            <div className="card-float bg-gradient-to-br from-primary/10 via-lavender/10 to-secondary/10 border-2 border-primary/30">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">Preço especial por tempo limitado</p>
                <p className="text-4xl font-baloo font-extrabold text-gradient">R$ 29,90</p>
                <p className="text-xs text-muted-foreground">Pagamento único via Pix</p>
              </div>

              <MagicButton size="lg" className="w-full" onClick={() => navigate("/pagamento")}>
                <ShoppingCart className="w-5 h-5" />
                Quero a música completa!
              </MagicButton>

              <p className="text-center text-xs text-muted-foreground mt-4">
                🛡️ Garantia de 7 dias ou seu dinheiro de volta
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
