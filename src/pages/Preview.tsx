import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  FileText,
  Check,
  Music,
  Download,
  Pencil,
  Save,
} from "lucide-react";
import { MagicButton } from "@/components/ui/MagicButton";
import { FloatingElements } from "@/components/ui/FloatingElements";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface MusicResult {
  taskId: string;
  formData: {
    childName: string;
    ageGroup: string;
    theme: string;
    specialMessage: string;
  };
  lyrics: string;
}

export default function Preview() {
  const navigate = useNavigate();
  const [result, setResult] = useState<MusicResult | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLyrics, setEditedLyrics] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("musicResult");
    if (stored) {
      const parsed = JSON.parse(stored) as MusicResult;
      setResult(parsed);
      setEditedLyrics(parsed.lyrics);
    } else {
      navigate("/criar");
    }
  }, [navigate]);

  if (!result) return null;

  const { formData, taskId } = result;
  const lyrics = editedLyrics;

  const handleSaveLyrics = async () => {
    setIsSaving(true);
    try {
      await supabase
        .from("music_tasks")
        .update({ lyrics: editedLyrics })
        .eq("id", taskId);

      const updated = { ...result, lyrics: editedLyrics };
      setResult(updated);
      localStorage.setItem("musicResult", JSON.stringify(updated));
      setIsEditing(false);
    } catch (e) {
      console.error("Error saving lyrics:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const themeEmojis: Record<string, string> = {
    animais: "🐻",
    princesas: "👸",
    "super-herois": "🦸",
    espaco: "🚀",
    natureza: "🌿",
  };

  const selectedPlan = localStorage.getItem("selectedPlan") || "single";
  const isPacote = selectedPlan === "pacote";
  const packageSongsRemaining = parseInt(localStorage.getItem("packageSongsRemaining") || "0", 10);
  const isPackageFollowUp = isPacote && packageSongsRemaining > 0;

  const handleBuy = () => {
    localStorage.setItem("musicTaskId", taskId);
    localStorage.setItem("musicData", JSON.stringify(formData));
    navigate("/pagamento");
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
              Prévia da sua <span className="text-gradient">música!</span>
            </h1>
            <p className="text-muted-foreground">
              Para {formData.childName} {themeEmojis[formData.theme]}
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Letra da música */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="card-float">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-baloo font-bold text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Letra da Música
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                ) : (
                  <button
                    onClick={handleSaveLyrics}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 text-sm text-mint hover:text-mint/80 transition-colors font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Salvando..." : "Salvar"}
                  </button>
                )}
              </div>
              {isEditing ? (
                <Textarea
                  value={editedLyrics}
                  onChange={(e) => setEditedLyrics(e.target.value)}
                  className="min-h-[300px] rounded-2xl border-2 border-primary/30 focus:border-primary font-nunito text-sm leading-relaxed resize-none"
                />
              ) : (
                <div className="bg-muted/50 rounded-2xl p-6">
                  <pre className="whitespace-pre-wrap font-nunito text-sm leading-relaxed">
                    {lyrics}
                  </pre>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {isEditing
                  ? "✏️ Edite a letra como quiser antes de comprar"
                  : "🎵 Esta é a letra que será cantada na sua música personalizada"}
              </p>
            </div>
          </motion.div>

          {/* CTA lateral */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* O que você recebe */}
            <div className="card-float">
              <h3 className="font-baloo font-bold text-lg mb-4">Ao comprar você recebe:</h3>
              <ul className="space-y-3">
                {[
                  { icon: Music, text: "MP3 completo da música cantada com o nome" },
                  { icon: FileText, text: "PDF com letra para imprimir" },
                  { icon: Download, text: "Download instantâneo após geração" },
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
                {isPackageFollowUp ? (
                  <>
                    <p className="text-sm font-medium text-primary mb-1">🎁 Pacote Encantado</p>
                    <p className="text-lg font-baloo font-bold">Já incluso no seu pacote!</p>
                    <p className="text-xs text-muted-foreground">
                      {packageSongsRemaining} {packageSongsRemaining === 1 ? "música restante" : "músicas restantes"}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Preço especial por tempo limitado</p>
                    <p className="text-4xl font-baloo font-extrabold text-gradient">
                      R$ {isPacote ? "24,90" : "9,90"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isPacote ? "3 músicas personalizadas • Pix" : "Pagamento único via Pix"}
                    </p>
                  </>
                )}
              </div>

              <MagicButton size="lg" className="w-full" onClick={handleBuy}>
                <ShoppingCart className="w-5 h-5" />
                {isPackageFollowUp
                  ? "Gerar esta música!"
                  : isPacote
                  ? "Quero o pacote completo!"
                  : "Quero a música completa!"}
              </MagicButton>

              <p className="text-center text-xs text-muted-foreground mt-4">
                🛡️ Garantia de funcionamento — reembolso via Pix em caso de erro técnico
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
