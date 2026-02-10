import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  User,
  Calendar,
  Heart,
  MessageSquare,
  ArrowLeft,
  Music,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MagicButton } from "@/components/ui/MagicButton";
import { FloatingElements } from "@/components/ui/FloatingElements";
import { useToast } from "@/hooks/use-toast";
import { generateLyricsOnly } from "@/services/musicPipeline";

const themes = [
  { value: "animais", label: "🐻 Animais", emoji: "🐻" },
  { value: "princesas", label: "👸 Princesas", emoji: "👸" },
  { value: "super-herois", label: "🦸 Super-heróis", emoji: "🦸" },
  { value: "espaco", label: "🚀 Espaço", emoji: "🚀" },
  { value: "natureza", label: "🌿 Natureza", emoji: "🌿" },
];

const ageGroups = [
  { value: "3-4", label: "3-4 anos" },
  { value: "5-6", label: "5-6 anos" },
  { value: "7-8", label: "7-8 anos" },
];

interface FormData {
  childName: string;
  ageGroup: string;
  theme: string;
  specialMessage: string;
}

export default function CreateMusic() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    childName: "",
    ageGroup: "",
    theme: "",
    specialMessage: "",
  });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.childName.trim()) {
      toast({ title: "Opa! 🎵", description: "Digite o nome da criança para continuar", variant: "destructive" });
      return;
    }
    if (!formData.ageGroup) {
      toast({ title: "Opa! 🎵", description: "Selecione a faixa etária", variant: "destructive" });
      return;
    }
    if (!formData.theme) {
      toast({ title: "Opa! 🎵", description: "Escolha um tema favorito", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const { taskId, lyrics } = await generateLyricsOnly(formData);

      // Save to localStorage and redirect to preview
      localStorage.setItem(
        "musicResult",
        JSON.stringify({
          taskId,
          formData,
          lyrics,
        })
      );
      navigate("/preview");
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Erro na geração 😔",
        description: error instanceof Error ? error.message : "Algo deu errado. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [formData, navigate, toast]);

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
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-full bg-card shadow-soft flex items-center justify-center hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl md:text-3xl font-baloo font-bold">
            Criar minha <span className="text-gradient">música mágica</span>
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Formulário */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card-float">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome da criança */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <User className="w-4 h-4 text-primary" />
                    Nome da criança *
                  </label>
                  <Input
                    placeholder="Ex: Joãozinho"
                    value={formData.childName}
                    onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                    className="h-12 rounded-xl border-2 border-border focus:border-primary transition-colors"
                    maxLength={30}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Este nome aparecerá na letra e no vídeo
                  </p>
                </div>

                {/* Idade */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <Calendar className="w-4 h-4 text-secondary" />
                    Faixa etária *
                  </label>
                  <Select
                    value={formData.ageGroup}
                    onValueChange={(value) => setFormData({ ...formData, ageGroup: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-2 border-border focus:border-primary">
                      <SelectValue placeholder="Selecione a idade" />
                    </SelectTrigger>
                    <SelectContent>
                      {ageGroups.map((age) => (
                        <SelectItem key={age.value} value={age.value}>
                          {age.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tema */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <Heart className="w-4 h-4 text-primary" />
                    Tema favorito *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {themes.map((theme) => (
                      <motion.button
                        key={theme.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, theme: theme.value })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.theme === theme.value
                            ? "border-primary bg-primary/10 shadow-pink"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-2xl block mb-1">{theme.emoji}</span>
                        <span className="text-sm font-medium">
                          {theme.label.split(" ")[1]}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Mensagem especial */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <MessageSquare className="w-4 h-4 text-mint" />
                    Mensagem especial (opcional)
                  </label>
                  <Textarea
                    placeholder="Ex: Feliz aniversário! Você é muito especial..."
                    value={formData.specialMessage}
                    onChange={(e) => setFormData({ ...formData, specialMessage: e.target.value })}
                    className="rounded-xl border-2 border-border focus:border-primary resize-none"
                    rows={3}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.specialMessage.length}/100 caracteres
                  </p>
                </div>

                {/* Botão de submit */}
                <MagicButton
                  size="lg"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {!isLoading && <Sparkles className="w-5 h-5" />}
                  Gerar música mágica!
                </MagicButton>
              </form>
            </div>
          </motion.div>

          {/* Preview/Info lateral */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Card de preview */}
            <div className="card-float text-center">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-xl font-baloo font-bold mb-2">Prévia ao vivo</h3>
              <AnimatePresence mode="wait">
                {formData.childName ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-muted/50 rounded-2xl p-4 mt-4"
                  >
                    <p className="text-sm text-muted-foreground mb-2">Sua música será sobre:</p>
                    <p className="font-baloo font-bold text-lg text-gradient">
                      "{formData.childName}"
                    </p>
                    {formData.theme && (
                      <p className="text-sm mt-2">
                        Tema: <span className="font-semibold">{themes.find((t) => t.value === formData.theme)?.label}</span>
                      </p>
                    )}
                    {formData.ageGroup && (
                      <p className="text-sm">
                        Idade: <span className="font-semibold">{ageGroups.find((a) => a.value === formData.ageGroup)?.label}</span>
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-muted-foreground"
                  >
                    Preencha o formulário para ver a prévia
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* O que você vai receber */}
            <div className="card-float">
              <h3 className="font-baloo font-bold mb-4 flex items-center gap-2">
                <Music className="w-5 h-5 text-primary" />
                O que você vai receber:
              </h3>
              <ul className="space-y-3">
                {[
                  "🎵 Música completa cantada com o nome da criança",
                  "🎬 Vídeo animado em HD com a letra",
                  "📄 PDF com a letra completa para imprimir",
                  "⬇️ Download instantâneo após pagamento",
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Preço */}
            <div className="card-float bg-gradient-to-br from-primary/10 to-lavender/10 text-center">
              <p className="text-sm text-muted-foreground mb-1">Apenas</p>
              <p className="text-4xl font-baloo font-extrabold text-gradient">R$ 29,90</p>
              <p className="text-sm text-muted-foreground mt-1">Pagamento único via Pix</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-card rounded-4xl p-12 text-center max-w-md mx-4 shadow-magic"
            >
              <motion.div
                className="text-7xl mb-6"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🪄
              </motion.div>
              <h2 className="text-2xl font-baloo font-bold mb-4">
                Gerando sua letra mágica...
              </h2>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ✨ Criando letra personalizada...
                </motion.span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Isso leva apenas alguns segundos
              </p>
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-rainbow"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 120, ease: "linear" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
