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
  Video,
  Check,
  Mic,
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
  ttsUrl: string;
  musicUrl: string;
}

export default function Preview() {
  const navigate = useNavigate();
  const [result, setResult] = useState<MusicResult | null>(null);

  // TTS audio
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [ttsTime, setTtsTime] = useState(0);
  const [ttsDuration, setTtsDuration] = useState(0);

  // Music audio
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicTime, setMusicTime] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("musicResult");
    if (stored) {
      const data = JSON.parse(stored) as MusicResult;
      setResult(data);

      // Create audio elements
      const ttsAudio = new Audio(data.ttsUrl);
      ttsAudioRef.current = ttsAudio;
      ttsAudio.addEventListener("loadedmetadata", () => setTtsDuration(ttsAudio.duration));
      ttsAudio.addEventListener("timeupdate", () => setTtsTime(ttsAudio.currentTime));
      ttsAudio.addEventListener("ended", () => setTtsPlaying(false));

      const musicAudio = new Audio(data.musicUrl);
      musicAudioRef.current = musicAudio;
      musicAudio.addEventListener("loadedmetadata", () => setMusicDuration(musicAudio.duration));
      musicAudio.addEventListener("timeupdate", () => setMusicTime(musicAudio.currentTime));
      musicAudio.addEventListener("ended", () => setMusicPlaying(false));

      return () => {
        ttsAudio.pause();
        musicAudio.pause();
      };
    } else {
      navigate("/criar");
    }
  }, [navigate]);

  const toggleTts = () => {
    if (!ttsAudioRef.current) return;
    if (ttsPlaying) {
      ttsAudioRef.current.pause();
    } else {
      musicAudioRef.current?.pause();
      setMusicPlaying(false);
      ttsAudioRef.current.play();
    }
    setTtsPlaying(!ttsPlaying);
  };

  const toggleMusic = () => {
    if (!musicAudioRef.current) return;
    if (musicPlaying) {
      musicAudioRef.current.pause();
    } else {
      ttsAudioRef.current?.pause();
      setTtsPlaying(false);
      musicAudioRef.current.play();
    }
    setMusicPlaying(!musicPlaying);
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
          {/* Audio Players */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* TTS Player */}
            <div className="card-float">
              <h3 className="font-baloo font-bold text-lg mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5 text-primary" />
                Voz Cantada
              </h3>
              <div className="bg-muted/50 rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={toggleTts}
                    className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-pink shrink-0"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {ttsPlaying ? (
                      <Pause className="w-5 h-5 text-primary-foreground" fill="currentColor" />
                    ) : (
                      <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
                    )}
                  </motion.button>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: ttsDuration ? `${(ttsTime / ttsDuration) * 100}%` : "0%" }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{formatTime(ttsTime)}</span>
                      <span>{formatTime(ttsDuration)}</span>
                    </div>
                  </div>
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Music Player */}
            <div className="card-float">
              <h3 className="font-baloo font-bold text-lg mb-4 flex items-center gap-2">
                <Music className="w-5 h-5 text-secondary" />
                Música Instrumental
              </h3>
              <div className="bg-muted/50 rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={toggleMusic}
                    className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shrink-0"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {musicPlaying ? (
                      <Pause className="w-5 h-5 text-secondary-foreground" fill="currentColor" />
                    ) : (
                      <Play className="w-5 h-5 text-secondary-foreground ml-0.5" fill="currentColor" />
                    )}
                  </motion.button>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary transition-all"
                        style={{ width: musicDuration ? `${(musicTime / musicDuration) * 100}%` : "0%" }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{formatTime(musicTime)}</span>
                      <span>{formatTime(musicDuration)}</span>
                    </div>
                  </div>
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Preview image */}
            <div className="relative rounded-4xl overflow-hidden shadow-magic">
              <img
                src={heroImage}
                alt="Preview do vídeo"
                className="w-full h-auto"
              />
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
              <h3 className="font-baloo font-bold text-lg mb-4">
                Ao comprar você recebe:
              </h3>
              <ul className="space-y-3">
                {[
                  { icon: Music, text: "MP3 completo da voz cantada" },
                  { icon: Music, text: "MP3 da música instrumental" },
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
                <p className="text-sm text-muted-foreground">
                  Preço especial por tempo limitado
                </p>
                <p className="text-4xl font-baloo font-extrabold text-gradient">
                  R$ 29,90
                </p>
                <p className="text-xs text-muted-foreground">
                  Pagamento único via Pix
                </p>
              </div>

              <MagicButton
                size="lg"
                className="w-full"
                onClick={() => navigate("/pagamento")}
              >
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
