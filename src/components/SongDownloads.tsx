import { Download, FileText } from "lucide-react";
import { MagicButton } from "@/components/ui/MagicButton";

interface SongDownloadsProps {
  childName: string;
  audioUrl: string;
  lyrics?: string | null;
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

export default function SongDownloads({ childName, audioUrl, lyrics }: SongDownloadsProps) {
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
    </div>
  );
}
