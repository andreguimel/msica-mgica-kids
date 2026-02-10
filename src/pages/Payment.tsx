import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Check,
  Clock,
  QrCode,
  CreditCard,
  Sparkles,
  Download,
  Music,
  Plus,
} from "lucide-react";
import { MagicButton } from "@/components/ui/MagicButton";
import { FloatingElements } from "@/components/ui/FloatingElements";
import { useToast } from "@/hooks/use-toast";
import { startMusicAfterPayment, pollTaskStatus } from "@/services/musicPipeline";
import LyricVideoPlayer from "@/components/LyricVideoPlayer";

interface MusicData {
  childName: string;
  ageGroup: string;
  theme: string;
  specialMessage: string;
}

interface TaskStatus {
  status: string;
  audio_url?: string;
  error_message?: string;
  access_code?: string;
  download_url?: string;
  lyrics?: string;
  video_images?: string[];
}

interface PackageSong {
  childName: string;
  audioUrl: string;
}

type PaymentState = "pending" | "generating" | "completed";

const planInfo = {
  single: { label: "Música Mágica", price: "19,90", priceNum: "19.90", description: "1 música personalizada" },
  pacote: { label: "Pacote Encantado", price: "49,90", priceNum: "49.90", description: "3 músicas personalizadas" },
};

function getPackageSongsRemaining(): number {
  return parseInt(localStorage.getItem("packageSongsRemaining") || "0", 10);
}

function getPackageSongs(): PackageSong[] {
  try {
    return JSON.parse(localStorage.getItem("packageSongs") || "[]");
  } catch {
    return [];
  }
}

function savePackageSong(song: PackageSong) {
  const songs = getPackageSongs();
  songs.push(song);
  localStorage.setItem("packageSongs", JSON.stringify(songs));
}

export default function Payment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [musicData, setMusicData] = useState<MusicData | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [paymentState, setPaymentState] = useState<PaymentState>("pending");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [videoImages, setVideoImages] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(900);
  const [stopPolling, setStopPolling] = useState<(() => void) | null>(null);

  const selectedPlan = localStorage.getItem("selectedPlan") || "single";
  const plan = planInfo[selectedPlan as keyof typeof planInfo];
  const isPacote = selectedPlan === "pacote";
  const [songsRemaining, setSongsRemaining] = useState(getPackageSongsRemaining());
  const [packageSongs, setPackageSongs] = useState<PackageSong[]>(getPackageSongs());
  const isPackageSong = isPacote && songsRemaining > 0; // This is a follow-up song (already paid)

  const pixCode = "00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540519.905802BR5925MUSICA MAGICA PARA CRIA6009SAO PAULO62070503***6304ABCD";

  const currentSongNumber = isPacote ? (3 - songsRemaining) + (paymentState === "completed" ? 0 : 0) : 1;
  const totalSongs = isPacote ? 3 : 1;

  useEffect(() => {
    const stored = localStorage.getItem("musicData");
    const storedTaskId = localStorage.getItem("musicTaskId");
    if (stored && storedTaskId) {
      setMusicData(JSON.parse(stored) as MusicData);
      setTaskId(storedTaskId);
    } else {
      navigate("/criar");
    }
  }, [navigate]);

  // Auto-start generation for package follow-up songs (already paid)
  useEffect(() => {
    if (isPackageSong && taskId && paymentState === "pending") {
      handleStartGeneration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPackageSong, taskId, paymentState]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling?.();
    };
  }, [stopPolling]);

  // Countdown timer
  useEffect(() => {
    if (paymentState !== "pending" || isPackageSong) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentState, isPackageSong]);

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const copyPixCode = async () => {
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast({
      title: "Código copiado! 📋",
      description: "Cole no app do seu banco para pagar",
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleStartGeneration = useCallback(async () => {
    if (!taskId) return;

    setPaymentState("generating");
    setIsChecking(false);

    try {
      await startMusicAfterPayment(taskId);

      const stop = pollTaskStatus(
        taskId,
        (status) => {
          if (status.status === "completed" && status.audio_url) {
            setAudioUrl(status.audio_url);
            setAccessCode((status as any).access_code || null);
            setLyrics((status as any).lyrics || null);
            setVideoImages((status as any).video_images || []);
            setPaymentState("completed");

            // Save to package songs and decrement remaining
            if (isPacote) {
              const remaining = getPackageSongsRemaining();
              if (remaining > 0) {
                localStorage.setItem("packageSongsRemaining", String(remaining - 1));
                setSongsRemaining(remaining - 1);
              }
              const currentData = JSON.parse(localStorage.getItem("musicData") || "{}");
              savePackageSong({ childName: currentData.childName, audioUrl: status.audio_url });
              setPackageSongs(getPackageSongs());
            }
          } else if (status.status === "failed") {
            toast({
              title: "Erro na geração 😔",
              description: status.error_message || "A geração da música falhou.",
              variant: "destructive",
            });
            setPaymentState("pending");
          }
        },
        (error) => {
          toast({
            title: "Erro 😔",
            description: error.message,
            variant: "destructive",
          });
          setPaymentState("pending");
        }
      );

      setStopPolling(() => stop);
    } catch (error) {
      toast({
        title: "Erro 😔",
        description: error instanceof Error ? error.message : "Erro ao iniciar geração.",
        variant: "destructive",
      });
      setPaymentState("pending");
    }
  }, [taskId, toast, isPacote]);

  const handlePaymentConfirmed = useCallback(async () => {
    if (!taskId) return;

    setIsChecking(true);

    try {
      // Simulate payment verification
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For pacote first payment, set remaining songs to 2
      if (isPacote) {
        localStorage.setItem("packageSongsRemaining", "2");
        localStorage.setItem("packageSongs", "[]");
        setSongsRemaining(2);
        setPackageSongs([]);
      }

      await handleStartGeneration();
    } catch (error) {
      setIsChecking(false);
      toast({
        title: "Erro 😔",
        description: error instanceof Error ? error.message : "Erro ao processar pagamento.",
        variant: "destructive",
      });
    }
  }, [taskId, toast, isPacote, handleStartGeneration]);

  const handleCreateNextSong = () => {
    // Clear current song data but keep package tracking
    localStorage.removeItem("musicResult");
    localStorage.removeItem("musicData");
    localStorage.removeItem("musicTaskId");
    navigate("/criar");
  };

  if (!musicData) return null;

  return (
    <div className="min-h-screen bg-background stars-bg relative overflow-hidden">
      <FloatingElements />

      <div className="container-rounded py-8 relative z-10">
        {/* Package progress indicator */}
        {isPacote && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((num) => {
                const songIndex = num - 1;
                const completedSongs = getPackageSongs();
                const isCompleted = songIndex < completedSongs.length;
                const isCurrent = songIndex === completedSongs.length;
                return (
                  <div key={num} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : isCurrent
                          ? "bg-primary/20 text-primary border-2 border-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : num}
                    </div>
                    {num < 3 && (
                      <div className={`w-8 h-0.5 ${isCompleted ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2">
              Música {Math.min(getPackageSongs().length + 1, 3)} de 3 do Pacote Encantado
            </p>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate("/preview")}
            className="w-10 h-10 rounded-full bg-card shadow-soft flex items-center justify-center hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-baloo font-bold">
              {paymentState === "completed" ? (
                <span className="text-gradient">Sua música está pronta!</span>
              ) : paymentState === "generating" ? (
                <span className="text-gradient">Gerando sua música...</span>
              ) : isPackageSong ? (
                <span className="text-gradient">Gerando sua música...</span>
              ) : (
                <>
                  Finalize o <span className="text-gradient">pagamento</span>
                </>
              )}
            </h1>
            <p className="text-muted-foreground">
              Música para {musicData.childName}
            </p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {paymentState === "pending" && !isPackageSong && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto"
            >
              {/* Timer */}
              <div className="card-float mb-6 text-center bg-accent/20">
                <div className="flex items-center justify-center gap-2 text-accent-foreground">
                  <Clock className="w-5 h-5" />
                  <span className="font-bold">
                    Oferta expira em: {formatTimeLeft(timeLeft)}
                  </span>
                </div>
              </div>

              {/* Card de pagamento */}
              <div className="card-float">
                <div className="text-center border-b border-border pb-6 mb-6">
                  <span className="text-5xl block mb-4">{isPacote ? "🎁" : "🎵"}</span>
                  <h3 className="font-baloo font-bold text-xl mb-2">
                    {plan.label} para {musicData.childName}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {plan.description}
                  </p>
                  <p className="text-4xl font-baloo font-extrabold text-gradient">
                    R$ {plan.price}
                  </p>
                </div>

                {/* QR Code */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-mint/20 text-mint-foreground px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <QrCode className="w-4 h-4" />
                    Pague via Pix
                  </div>

                  <div className="bg-card border-2 border-dashed border-border rounded-2xl p-8 mx-auto max-w-xs mb-4">
                    <div className="w-48 h-48 mx-auto bg-foreground/5 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <QrCode className="w-24 h-24 mx-auto text-muted-foreground/50" />
                        <p className="text-xs text-muted-foreground mt-2">QR Code Pix</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    Ou copie o código Pix abaixo:
                  </p>

                  <div className="relative">
                    <div className="bg-muted rounded-xl p-4 pr-12 font-mono text-xs break-all text-left">
                      {pixCode.substring(0, 50)}...
                    </div>
                    <button
                      onClick={copyPixCode}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground hover:scale-105 transition-transform"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <MagicButton
                  size="lg"
                  className="w-full"
                  onClick={handlePaymentConfirmed}
                  loading={isChecking}
                >
                  {!isChecking && <CreditCard className="w-5 h-5" />}
                  Já paguei! Verificar pagamento
                </MagicButton>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  O pagamento é processado de forma segura pela Abacate Pay
                </p>
              </div>
            </motion.div>
          )}

          {(paymentState === "generating" || (paymentState === "pending" && isPackageSong)) && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto"
            >
              <div className="card-float text-center">
                <motion.div
                  className="text-7xl mb-6"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🪄
                </motion.div>
                <h2 className="text-2xl font-baloo font-bold mb-4">
                  Criando sua música mágica...
                </h2>
                <p className="text-muted-foreground mb-4">
                  {isPackageSong
                    ? `Gerando a música de ${musicData.childName} (incluída no pacote)`
                    : `Pagamento confirmado! Agora estamos gerando a música de ${musicData.childName}.`}
                </p>
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-3">
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    🎵 Compondo sua música... isso pode levar até 2 minutos
                  </motion.span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-rainbow"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 120, ease: "linear" }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {paymentState === "completed" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto"
            >
              <div className="card-float text-center">
                <motion.div
                  className="text-8xl mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  🎉
                </motion.div>

                <h2 className="text-2xl font-baloo font-bold mb-4">
                  <span className="text-gradient">Parabéns!</span> Sua música está pronta!
                </h2>

                <p className="text-muted-foreground mb-6">
                  A música de {musicData.childName} foi gerada com sucesso!
                </p>

                {audioUrl && lyrics && videoImages.length > 0 && (
                  <div className="mb-6">
                    <LyricVideoPlayer
                      audioUrl={audioUrl}
                      lyrics={lyrics}
                      images={videoImages}
                      childName={musicData.childName}
                    />
                  </div>
                )}

                {audioUrl && (!lyrics || videoImages.length === 0) && (
                  <div className="bg-muted/50 rounded-2xl p-4 mb-6">
                    <audio controls className="w-full" src={audioUrl}>
                      Seu navegador não suporta o player de áudio.
                    </audio>
                  </div>
                )}

                <div className="space-y-4">
                  {audioUrl && (
                    <a href={audioUrl} download target="_blank" rel="noopener noreferrer">
                      <MagicButton size="lg" className="w-full">
                        <Download className="w-5 h-5" />
                        Baixar música (MP3)
                      </MagicButton>
                    </a>
                  )}

                  {accessCode && (
                    <div className="bg-accent/20 border-2 border-accent/40 rounded-2xl p-5 text-center">
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        📋 Seu código de acesso:
                      </p>
                      <p className="font-mono text-2xl font-extrabold tracking-widest text-foreground mb-2">
                        {accessCode}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Guarde este código! Use-o para acessar suas músicas por até 30 dias.
                      </p>
                      <button
                        onClick={() => navigate("/minhas-musicas")}
                        className="text-primary text-sm font-semibold hover:underline mt-3 inline-block"
                      >
                        Acessar minhas músicas →
                      </button>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">
                    🔗 Acesse suas músicas em <button onClick={() => navigate("/minhas-musicas")} className="text-primary font-semibold hover:underline">/minhas-musicas</button> com seu código
                  </p>
                </div>
              </div>

              {/* Package: Next song CTA */}
              {isPacote && songsRemaining > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="card-float mt-6 bg-gradient-to-br from-primary/10 to-lavender/10 border-2 border-primary/30"
                >
                  <div className="text-center">
                    <span className="badge-fun mb-4 inline-block">🎁 Pacote Encantado</span>
                    <h3 className="font-baloo font-bold text-xl mb-2">
                      Você ainda tem {songsRemaining} {songsRemaining === 1 ? "música" : "músicas"} para criar!
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Crie músicas para irmãos, primos ou amigos — já está incluso no seu pacote!
                    </p>
                    <MagicButton size="lg" className="w-full" onClick={handleCreateNextSong}>
                      <Plus className="w-5 h-5" />
                      Criar próxima música
                    </MagicButton>
                  </div>
                </motion.div>
              )}

              {/* Package: All songs completed */}
              {isPacote && songsRemaining === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="card-float mt-6 bg-gradient-to-br from-mint/10 to-lavender/10 border-2 border-mint/30"
                >
                  <div className="text-center">
                    <span className="text-4xl block mb-3">🎊</span>
                    <h3 className="font-baloo font-bold text-xl mb-2">
                      Pacote completo!
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Todas as 3 músicas do seu pacote foram criadas com sucesso!
                    </p>

                    {/* List all package songs */}
                    <div className="space-y-2 mb-4">
                      {getPackageSongs().map((song, i) => (
                        <div key={i} className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
                          <div className="flex items-center gap-2">
                            <Music className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">{song.childName}</span>
                          </div>
                          <a href={song.audioUrl} download target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-medium hover:underline">
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Upsell for single plan */}
              {!isPacote && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="card-float mt-6 bg-gradient-to-br from-accent/20 to-peach/20 border-2 border-accent/30"
                >
                  <div className="text-center">
                    <span className="badge-fun mb-4 inline-block">🎁 Oferta Especial</span>
                    <h3 className="font-baloo font-bold text-xl mb-2">
                      Que tal mais 2 músicas?
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Crie músicas para irmãos, primos ou amigos!
                    </p>
                    <p className="text-2xl font-baloo font-bold text-gradient mb-4">
                      +2 músicas por apenas R$ 39,90
                      <span className="block text-sm text-muted-foreground line-through">
                        De R$ 39,80
                      </span>
                    </p>
                    <MagicButton variant="accent" size="md">
                      Quero mais músicas!
                    </MagicButton>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
