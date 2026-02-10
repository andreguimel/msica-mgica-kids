import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Music, Download, Clock, AlertCircle } from "lucide-react";
import { MagicButton } from "@/components/ui/MagicButton";
import { FloatingElements } from "@/components/ui/FloatingElements";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import LyricVideoPlayer from "@/components/LyricVideoPlayer";

interface Song {
  id: string;
  childName: string;
  theme: string;
  audioUrl: string | null;
  expiresAt: string | null;
  isExpired: boolean;
  createdAt: string;
  lyrics: string | null;
  videoImages: string[];
}

export default function MyMusic() {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!accessCode.trim()) return;

    setLoading(true);
    setError(null);
    setSongs([]);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("get-my-songs", {
        body: { accessCode: accessCode.trim() },
      });

      if (fnError) throw fnError;
      if (data?.error) {
        setError(data.error);
      } else {
        setSongs(data.songs || []);
      }
    } catch (e) {
      setError("Erro ao buscar músicas. Tente novamente.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const themeEmojis: Record<string, string> = {
    animais: "🐾",
    princesas: "👑",
    "super-herois": "🦸",
    espaco: "🚀",
    natureza: "🌿",
  };

  return (
    <div className="min-h-screen bg-background stars-bg relative overflow-hidden">
      <FloatingElements />

      <div className="container-rounded py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-full bg-card shadow-soft flex items-center justify-center hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-baloo font-bold">
              <span className="text-gradient">Minhas Músicas</span>
            </h1>
            <p className="text-muted-foreground">
              Digite seu código de acesso para ouvir suas músicas
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto"
        >
          <div className="card-float mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-5 h-5 text-primary" />
              <h2 className="font-baloo font-bold text-lg">Código de Acesso</h2>
            </div>

            <div className="flex gap-3">
              <Input
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="Ex: MAGIC-A3K9"
                className="text-center font-mono text-lg tracking-widest uppercase"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <MagicButton onClick={handleSearch} loading={loading} className="shrink-0">
                <Search className="w-5 h-5" />
                Buscar
              </MagicButton>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card-float bg-destructive/10 border-2 border-destructive/30 text-center"
              >
                <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            {searched && !error && songs.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card-float text-center"
              >
                <span className="text-4xl block mb-3">🔍</span>
                <p className="text-muted-foreground">Nenhuma música encontrada com esse código.</p>
              </motion.div>
            )}

            {songs.length > 0 && (
              <motion.div
                key="songs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {songs.map((song, i) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="card-float"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{themeEmojis[song.theme] || "🎵"}</span>
                      <div>
                        <h3 className="font-baloo font-bold text-lg">{song.childName}</h3>
                        {song.expiresAt && !song.isExpired && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            Expira em {getDaysRemaining(song.expiresAt)} dias
                          </div>
                        )}
                      </div>
                    </div>

                    {song.isExpired ? (
                      <div className="bg-muted/50 rounded-xl p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          ⏰ Este link expirou. O prazo de 30 dias foi atingido.
                        </p>
                      </div>
                    ) : song.audioUrl ? (
                      <>
                        {song.lyrics && song.videoImages.length > 0 ? (
                          <div className="mb-3">
                            <LyricVideoPlayer
                              audioUrl={song.audioUrl}
                              lyrics={song.lyrics}
                              images={song.videoImages}
                              childName={song.childName}
                            />
                          </div>
                        ) : (
                          <div className="bg-muted/50 rounded-2xl p-3 mb-3">
                            <audio controls className="w-full" src={song.audioUrl}>
                              Seu navegador não suporta o player de áudio.
                            </audio>
                          </div>
                        )}
                        <a href={song.audioUrl} download target="_blank" rel="noopener noreferrer">
                          <MagicButton size="sm" className="w-full">
                            <Download className="w-4 h-4" />
                            Baixar MP3
                          </MagicButton>
                        </a>
                      </>
                    ) : null}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
