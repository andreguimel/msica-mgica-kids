import { Download, FileText, Image, Film } from "lucide-react";
import { MagicButton } from "@/components/ui/MagicButton";

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

async function downloadImage(url: string, childName: string, index: number) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    downloadBlob(blob, `${childName} - Ilustração ${index + 1}.png`);
  } catch {
    window.open(url, "_blank");
  }
}

async function downloadAllImages(urls: string[], childName: string) {
  for (let i = 0; i < urls.length; i++) {
    await downloadImage(urls[i], childName, i);
    // Small delay between downloads to avoid browser blocking
    if (i < urls.length - 1) await new Promise((r) => setTimeout(r, 500));
  }
}

export default function SongDownloads({ childName, audioUrl, lyrics, images = [] }: SongDownloadsProps) {
  return (
    <div className="space-y-3">
      {/* Audio download */}
      <a href={audioUrl} download target="_blank" rel="noopener noreferrer">
        <MagicButton size="lg" className="w-full">
          <Download className="w-5 h-5" />
          Baixar música (MP3)
        </MagicButton>
      </a>

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

      {/* Video sizes info */}
      {images.length > 0 && lyrics && (
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Film className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-bold text-muted-foreground">Compartilhar</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Use as ilustrações + a letra para criar vídeos no Canva, CapCut ou InShot nos tamanhos:
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {["Stories (9:16)", "Reels (9:16)", "Feed (1:1)", "YouTube (16:9)"].map((size) => (
              <span
                key={size}
                className="text-xs bg-background rounded-full px-3 py-1 border border-border"
              >
                {size}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
