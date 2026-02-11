import { useState } from "react";
import { Download, FileText, MessageCircle } from "lucide-react";
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
  const [sharing, setSharing] = useState(false);

  const handleWhatsAppShare = async () => {
    setSharing(true);
    try {
      // Try native share with file (mobile)
      const res = await fetch(audioUrl);
      const blob = await res.blob();
      const file = new File([blob], `${childName} - Música.mp3`, { type: "audio/mpeg" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `Música do(a) ${childName}`,
          text: `Olha a música que criei para ${childName}! 🎵✨`,
          files: [file],
        });
        setSharing(false);
        return;
      }
    } catch (e) {
      // User cancelled or share failed, fall through to WhatsApp Web
    }

    // Fallback: WhatsApp Web link
    const message = encodeURIComponent(
      `🎵✨ Olha a música que criei para ${childName}! Ouça aqui: ${audioUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
    setSharing(false);
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

      {/* WhatsApp share */}
      <button
        onClick={handleWhatsAppShare}
        disabled={sharing}
        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-[#25D366]/30 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-bold py-3 px-4 transition-colors disabled:opacity-50"
      >
        <MessageCircle className="w-5 h-5" />
        {sharing ? "Preparando..." : "Enviar pelo WhatsApp"}
      </button>
    </div>
  );
}
