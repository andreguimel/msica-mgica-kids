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
} from "lucide-react";
import { MagicButton } from "@/components/ui/MagicButton";
import { FloatingElements } from "@/components/ui/FloatingElements";
import heroImage from "@/assets/hero-animals-music.jpg";

interface MusicData {
  childName: string;
  ageGroup: string;
  theme: string;
  specialMessage: string;
}

// Função para gerar letra de música simulada
function generateLyrics(data: MusicData): string {
  const themeLines: Record<string, string[]> = {
    animais: [
      `Os animais do bosque querem te encontrar,`,
      `O coelho, o urso e o passarinho a cantar,`,
      `Todos juntos numa festa sem igual,`,
      `Para ${data.childName}, criança especial!`,
    ],
    princesas: [
      `No castelo encantado de sonhos mil,`,
      `Vive ${data.childName}, a princesa mais gentil,`,
      `Com sua coroa brilhante de bondade,`,
      `Espalhando amor por toda a cidade!`,
    ],
    "super-herois": [
      `Lá no céu, uma estrela a brilhar,`,
      `É ${data.childName}, super-herói a voar,`,
      `Com poderes de amor e coragem,`,
      `Fazendo o bem em toda viagem!`,
    ],
    espaco: [
      `Num foguete colorido a voar,`,
      `${data.childName} vai as estrelas explorar,`,
      `Planetas, luas e meteoros a ver,`,
      `Aventuras incríveis a viver!`,
    ],
    natureza: [
      `Nas flores do jardim encantado,`,
      `${data.childName} brinca todo animado,`,
      `Borboletas, sol e arco-íris no ar,`,
      `A natureza é linda de amar!`,
    ],
  };

  const chorus = [
    ``,
    `🎵 ${data.childName}, ${data.childName}! 🎵`,
    `Você é especial, você é demais!`,
    `${data.childName}, ${data.childName}!`,
    `Trazendo alegria aonde vai!`,
    ``,
  ];

  const ending = data.specialMessage
    ? [``, `"${data.specialMessage}"`, ``, `Com carinho e amor... 💖`]
    : [``, `Com muito amor e carinho... 💖`];

  return [
    ...(themeLines[data.theme] || themeLines.animais),
    ...chorus,
    ...(themeLines[data.theme] || themeLines.animais).map(
      (line) => line + " (bis)"
    ),
    ...ending,
  ].join("\n");
}

export default function Preview() {
  const navigate = useNavigate();
  const [musicData, setMusicData] = useState<MusicData | null>(null);
  const [lyrics, setLyrics] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(90); // 1:30 de música simulada
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("musicData");
    if (stored) {
      const data = JSON.parse(stored) as MusicData;
      setMusicData(data);
      setLyrics(generateLyrics(data));
    } else {
      navigate("/criar");
    }
  }, [navigate]);

  // Simular progresso do áudio
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 15) {
            // Apenas 15s de preview
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!musicData) return null;

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
              Para {musicData.childName} {themeEmojis[musicData.theme]}
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Vídeo Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Player de vídeo */}
            <div className="relative rounded-4xl overflow-hidden shadow-magic">
              <img
                src={heroImage}
                alt="Preview do vídeo"
                className="w-full h-auto"
              />

              {/* Watermark */}
              <div className="watermark" />

              {/* Controles */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-6">
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-pink"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-primary-foreground" fill="currentColor" />
                    ) : (
                      <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
                    )}
                  </motion.button>

                  <div className="flex-1">
                    <div className="h-2 bg-primary-foreground/30 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        style={{ width: `${(currentTime / 15) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-primary-foreground/70 mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>0:15 / {formatTime(duration)} (preview)</span>
                    </div>
                  </div>

                  <Volume2 className="w-5 h-5 text-primary-foreground/70" />
                </div>
              </div>
            </div>

            {/* Info do preview */}
            <div className="card-float bg-accent/20">
              <p className="text-sm text-center">
                ⚠️ <strong>Versão demo:</strong> Você está ouvindo apenas 15 segundos
                e o vídeo tem marca d'água. Compre para ter acesso completo!
              </p>
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
                  { icon: Music, text: "MP3 completo (1-2 min)" },
                  { icon: Video, text: "Vídeo HD sem marca d'água" },
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
                Quero o vídeo completo!
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
