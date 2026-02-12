import { useState, useCallback, useRef, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { Progress } from "@/components/ui/progress";
import { Video, Square, Smartphone, X } from "lucide-react";
import { MagicButton } from "@/components/ui/MagicButton";

type VideoFormat = "square" | "stories";

interface VideoGeneratorProps {
  childName: string;
  audioUrl: string;
  theme: string;
  onClose: () => void;
}

const THEME_CONFIG: Record<string, {
  gradient: [string, string];
  emojis: string[];
}> = {
  animais: { gradient: ["#F6E05E", "#48BB78"], emojis: ["🐾", "❤️", "🐶", "🐱", "🐻"] },
  princesas: { gradient: ["#F687B3", "#9F7AEA"], emojis: ["👑", "⭐", "💎", "🏰", "✨"] },
  "super-herois": { gradient: ["#4299E1", "#E53E3E"], emojis: ["⚡", "⭐", "💥", "🦸", "🔥"] },
  "super-heroinas": { gradient: ["#E53E3E", "#F6AD55"], emojis: ["⚡", "⭐", "💥", "🦸‍♀️", "🔥"] },
  espaco: { gradient: ["#2B6CB0", "#6B46C1"], emojis: ["🌟", "🪐", "🚀", "🌙", "⭐"] },
  natureza: { gradient: ["#48BB78", "#4299E1"], emojis: ["🌸", "🍃", "🌺", "🦋", "🌻"] },
  dinossauros: { gradient: ["#48BB78", "#8B6914"], emojis: ["🦕", "🌿", "🦖", "🌴", "🍃"] },
  futebol: { gradient: ["#48BB78", "#FFFFFF"], emojis: ["⚽", "⭐", "🏆", "🥅", "🎯"] },
  fadas: { gradient: ["#B794F4", "#F687B3"], emojis: ["🧚", "🦋", "✨", "🌸", "💫"] },
};

const DEFAULT_CONFIG = { gradient: ["#9F7AEA", "#F687B3"] as [string, string], emojis: ["🎵", "✨", "🎶", "⭐", "💫"] };

function generateCoverImage(
  childName: string,
  theme: string,
  format: VideoFormat
): string {
  const width = 1080;
  const height = format === "square" ? 1080 : 1920;
  const config = THEME_CONFIG[theme] || DEFAULT_CONFIG;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, config.gradient[0]);
  grad.addColorStop(1, config.gradient[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Overlay pattern - subtle circles
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = 30 + Math.random() * 120;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Scattered emojis
  ctx.font = "60px serif";
  ctx.textAlign = "center";
  ctx.globalAlpha = 0.35;
  const emojiPositions = format === "stories"
    ? [
        { x: 150, y: 200 }, { x: 900, y: 350 }, { x: 200, y: 600 },
        { x: 850, y: 800 }, { x: 150, y: 1100 }, { x: 900, y: 1300 },
        { x: 200, y: 1550 }, { x: 850, y: 1700 },
      ]
    : [
        { x: 150, y: 180 }, { x: 900, y: 200 }, { x: 120, y: 500 },
        { x: 950, y: 550 }, { x: 150, y: 850 }, { x: 900, y: 900 },
      ];

  emojiPositions.forEach((pos, i) => {
    ctx.fillText(config.emojis[i % config.emojis.length], pos.x, pos.y);
  });
  ctx.globalAlpha = 1;

  // Center content area - semi-transparent card
  const cardW = 800;
  const cardH = format === "stories" ? 500 : 400;
  const cardX = (width - cardW) / 2;
  const cardY = (height - cardH) / 2;

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  const radius = 40;
  ctx.moveTo(cardX + radius, cardY);
  ctx.lineTo(cardX + cardW - radius, cardY);
  ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + radius);
  ctx.lineTo(cardX + cardW, cardY + cardH - radius);
  ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - radius, cardY + cardH);
  ctx.lineTo(cardX + radius, cardY + cardH);
  ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - radius);
  ctx.lineTo(cardX, cardY + radius);
  ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
  ctx.closePath();
  ctx.fill();

  // Music note emoji top
  ctx.font = "80px serif";
  ctx.textAlign = "center";
  ctx.fillText("🎵", width / 2, cardY + 90);

  // Child name
  const nameSize = childName.length > 12 ? 60 : childName.length > 8 ? 72 : 84;
  ctx.font = `bold ${nameSize}px sans-serif`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 10;
  ctx.fillText(childName, width / 2, cardY + cardH / 2 + 20);
  ctx.shadowBlur = 0;

  // Subtitle
  ctx.font = "32px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("Uma música especial ✨", width / 2, cardY + cardH / 2 + 80);

  // Logo at bottom
  ctx.font = "24px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText("Música Mágica", width / 2, height - 60);

  return canvas.toDataURL("image/png");
}

function supportsFFmpegWasm(): boolean {
  try {
    return typeof SharedArrayBuffer !== "undefined";
  } catch {
    return false;
  }
}

export default function VideoGenerator({ childName, audioUrl, theme, onClose }: VideoGeneratorProps) {
  const [format, setFormat] = useState<VideoFormat | null>(null);
  const [progress, setProgress] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const handleGenerate = useCallback(async (selectedFormat: VideoFormat) => {
    setFormat(selectedFormat);
    setGenerating(true);
    setProgress(5);
    setError(null);

    try {
      // Generate cover image
      setProgress(10);
      const coverDataUrl = generateCoverImage(childName, theme, selectedFormat);
      const coverResponse = await fetch(coverDataUrl);
      const coverBlob = await coverResponse.blob();
      const coverData = new Uint8Array(await coverBlob.arrayBuffer());

      // Fetch audio
      setProgress(20);
      const audioResponse = await fetch(audioUrl);
      const audioData = new Uint8Array(await audioResponse.arrayBuffer());

      // Load FFmpeg
      setProgress(30);
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      ffmpeg.on("progress", ({ progress: p }) => {
        setProgress(30 + Math.round(p * 65));
      });

      await ffmpeg.load({
        coreURL: "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js",
        wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm",
      });

      // Write files to virtual FS
      setProgress(40);
      await ffmpeg.writeFile("cover.png", coverData);
      await ffmpeg.writeFile("audio.mp3", audioData);

      // Generate video
      await ffmpeg.exec([
        "-loop", "1",
        "-i", "cover.png",
        "-i", "audio.mp3",
        "-c:v", "libx264",
        "-tune", "stillimage",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-shortest",
        "-movflags", "+faststart",
        "output.mp4",
      ]);

      // Read output and trigger download
      setProgress(98);
      const data = await ffmpeg.readFile("output.mp4");
      const uint8 = data instanceof Uint8Array ? data : new TextEncoder().encode(data as string);
      const ab = new ArrayBuffer(uint8.byteLength);
      new Uint8Array(ab).set(uint8);
      const blob = new Blob([ab], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${childName} - Música Mágica (${selectedFormat === "square" ? "Feed" : "Stories"}).mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);

      // Cleanup
      ffmpeg.terminate();
      ffmpegRef.current = null;

      setTimeout(onClose, 1500);
    } catch (err) {
      console.error("Video generation error:", err);
      setError("Erro ao gerar vídeo. Tente novamente ou use outro navegador.");
      setGenerating(false);
    }
  }, [childName, audioUrl, theme, onClose]);

  useEffect(() => {
    return () => {
      if (ffmpegRef.current) {
        try { ffmpegRef.current.terminate(); } catch {}
      }
    };
  }, []);

  if (!supportsFFmpegWasm()) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          disabled={generating}
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-baloo font-bold text-xl mb-1 text-center">
          🎬 Gerar Vídeo
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-5">
          Escolha o formato para redes sociais
        </p>

        {!generating && !error && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleGenerate("square")}
              className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-primary/20 hover:border-primary/60 hover:bg-primary/5 transition-all"
            >
              <Square className="w-10 h-10 text-primary" />
              <span className="font-bold text-sm">Quadrado</span>
              <span className="text-xs text-muted-foreground">1080×1080</span>
              <span className="text-xs text-muted-foreground">Feed, Facebook</span>
            </button>
            <button
              onClick={() => handleGenerate("stories")}
              className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-primary/20 hover:border-primary/60 hover:bg-primary/5 transition-all"
            >
              <Smartphone className="w-10 h-10 text-primary" />
              <span className="font-bold text-sm">Stories</span>
              <span className="text-xs text-muted-foreground">1080×1920</span>
              <span className="text-xs text-muted-foreground">Stories, TikTok, Status</span>
            </button>
          </div>
        )}

        {generating && (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-3xl block mb-2">
                {progress < 30 ? "📦" : progress < 70 ? "🎬" : progress < 100 ? "⚡" : "✅"}
              </span>
              <p className="text-sm font-medium">
                {progress < 10
                  ? "Preparando imagem..."
                  : progress < 30
                  ? "Baixando áudio..."
                  : progress < 40
                  ? "Carregando FFmpeg..."
                  : progress < 95
                  ? "Gerando vídeo..."
                  : progress < 100
                  ? "Finalizando..."
                  : "Vídeo pronto! 🎉"}
              </p>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-muted-foreground text-center">
              {progress < 100
                ? "Isso pode levar 10-30 segundos..."
                : "Download iniciado!"}
            </p>
          </div>
        )}

        {error && (
          <div className="text-center space-y-3">
            <p className="text-sm text-destructive">{error}</p>
            <MagicButton onClick={() => { setError(null); setGenerating(false); setFormat(null); }}>
              Tentar novamente
            </MagicButton>
          </div>
        )}
      </div>
    </div>
  );
}
