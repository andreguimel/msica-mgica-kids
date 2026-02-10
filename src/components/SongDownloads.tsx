import { useState } from "react";
import { Download, FileText, Image, Film, Loader2 } from "lucide-react";
import { MagicButton } from "@/components/ui/MagicButton";
import { exportVideo } from "@/utils/videoExport";
import { toast } from "sonner";

interface SongDownloadsProps {
  childName: string;
  audioUrl: string;
  lyrics?: string | null;
  images?: string[];
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadLyrics(lyrics: string, childName: string) {
  const blob = new Blob([lyrics], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, `${childName} - Letra.txt`);
}

async function downloadAllImages(urls: string[], childName: string) {
  for (let i = 0; i < urls.length; i++) {
    try {
      const res = await fetch(urls[i]);
      const blob = await res.blob();
      downloadBlob(blob, `${childName} - Ilustração ${i + 1}.png`);
    } catch {
      window.open(urls[i], "_blank");
    }
    if (i < urls.length - 1) await new Promise((r) => setTimeout(r, 500));
  }
}

export default function SongDownloads({ childName, audioUrl, lyrics, images = [] }: SongDownloadsProps) {
  const [videoProgress, setVideoProgress] = useState<number | null>(null);

  const isGenerating = videoProgress !== null;

  const handleGenerateVideo = async () => {
    if (images.length === 0) return;
    setVideoProgress(0);

    try {
      const blob = await exportVideo({
        audioUrl,
        images,
        childName,
        onProgress: setVideoProgress,
      });

      downloadBlob(blob, `${childName} - Vídeo.webm`);
      toast.success("Vídeo gerado com sucesso! 🎬");
    } catch (err) {
      console.error("Video export failed:", err);
      toast.error("Erro ao gerar o vídeo. Tente novamente.");
    } finally {
      setVideoProgress(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Audio download */}
      <MagicButton
        size="lg"
        className="w-full"
        onClick={async () => {
          try {
            const res = await fetch(audioUrl);
            const blob = await res.blob();
            downloadBlob(blob, `${childName} - Música.mp3`);
          } catch {
            window.open(audioUrl, "_blank");
          }
        }}
      >
        <Download className="w-5 h-5" />
        Baixar música (MP3)
      </MagicButton>

      {/* Lyrics download */}
      {lyrics && (
        <button
          onClick={() => downloadLyrics(lyrics, childName)}
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-bold py-3 px-4 transition-colors"
        >
          <FileText className="w-5 h-5" />
          Baixar letra (.txt)
        </button>
      )}

      {/* Images download */}
      {images.length > 0 && (
        <button
          onClick={() => downloadAllImages(images, childName)}
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-secondary/30 bg-secondary/5 hover:bg-secondary/10 text-secondary-foreground font-bold py-3 px-4 transition-colors"
        >
          <Image className="w-5 h-5" />
          Baixar {images.length} ilustrações
        </button>
      )}

      {/* Video generation - single button */}
      {images.length > 0 && (
        isGenerating ? (
          <div className="rounded-xl border-2 border-accent/40 bg-accent/10 p-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Loader2 className="w-5 h-5 animate-spin text-accent-foreground" />
              <span className="font-bold text-accent-foreground text-sm">
                Gerando vídeo...
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${Math.round((videoProgress ?? 0) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              {Math.round((videoProgress ?? 0) * 100)}% — A música precisa tocar para gravar
            </p>
          </div>
        ) : (
          <button
            onClick={handleGenerateVideo}
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-accent/40 bg-accent/10 hover:bg-accent/20 text-accent-foreground font-bold py-3 px-4 transition-colors"
          >
            <Film className="w-5 h-5" />
            Baixar vídeo (Stories 9:16)
          </button>
        )
      )}
    </div>
  );
}
