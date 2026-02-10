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
} from "lucide-react";
import { MagicButton } from "@/components/ui/MagicButton";
import { FloatingElements } from "@/components/ui/FloatingElements";
import { useToast } from "@/hooks/use-toast";
import { startMusicAfterPayment, pollTaskStatus } from "@/services/musicPipeline";

interface MusicData {
  childName: string;
  ageGroup: string;
  theme: string;
  specialMessage: string;
}

type PaymentState = "pending" | "generating" | "completed";

export default function Payment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [musicData, setMusicData] = useState<MusicData | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [paymentState, setPaymentState] = useState<PaymentState>("pending");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(900);
  const [stopPolling, setStopPolling] = useState<(() => void) | null>(null);

  const pixCode = "00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540529.905802BR5925MUSICA MAGICA PARA CRIA6009SAO PAULO62070503***6304ABCD";

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

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling?.();
    };
  }, [stopPolling]);

  // Countdown timer
  useEffect(() => {
    if (paymentState !== "pending") return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentState]);

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

  const handlePaymentConfirmed = useCallback(async () => {
    if (!taskId) return;

    setIsChecking(true);

    try {
      // Simulate payment verification (replace with real Pix check later)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Payment confirmed → start music generation
      setPaymentState("generating");
      setIsChecking(false);

      await startMusicAfterPayment(taskId);

      // Start polling for music completion
      const stop = pollTaskStatus(
        taskId,
        (status) => {
          if (status.status === "completed" && status.audio_url) {
            setAudioUrl(status.audio_url);
            setPaymentState("completed");
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
      setIsChecking(false);
      toast({
        title: "Erro 😔",
        description: error instanceof Error ? error.message : "Erro ao processar pagamento.",
        variant: "destructive",
      });
    }
  }, [taskId, toast]);

  if (!musicData) return null;

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
          {paymentState === "pending" && (
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
                  <span className="text-5xl block mb-4">🎵</span>
                  <h3 className="font-baloo font-bold text-xl mb-2">
                    Música Mágica para {musicData.childName}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    MP3 completo + PDF da letra
                  </p>
                  <p className="text-4xl font-baloo font-extrabold text-gradient">
                    R$ 29,90
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

          {paymentState === "generating" && (
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
                  Pagamento confirmado! Agora estamos gerando a música de {musicData.childName}.
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

                {audioUrl && (
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

                  <p className="text-sm text-muted-foreground">
                    ⏰ Link disponível por 24 horas
                  </p>
                </div>
              </div>

              {/* Upsell */}
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
                    +2 músicas por apenas R$ 49,90
                    <span className="block text-sm text-muted-foreground line-through">
                      De R$ 59,80
                    </span>
                  </p>
                  <MagicButton variant="accent" size="md">
                    Quero mais músicas!
                  </MagicButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
