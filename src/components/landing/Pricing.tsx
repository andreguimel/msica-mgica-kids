import { motion } from "framer-motion";
import { Check, Sparkles, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MagicButton } from "@/components/ui/MagicButton";

const plans = [
  {
    name: "Música Mágica",
    price: "29,90",
    description: "1 música personalizada completa",
    popular: true,
    features: [
      "Música de 1-2 minutos",
      "Vídeo animado HD",
      "Letra personalizada com o nome",
      "Download MP3 + MP4 + PDF",
      "Link exclusivo por 24h",
      "Suporte via WhatsApp",
    ],
  },
  {
    name: "Pacote Encantado",
    price: "79,90",
    originalPrice: "89,70",
    description: "3 músicas para toda família!",
    popular: false,
    features: [
      "3 músicas personalizadas",
      "3 vídeos animados HD",
      "Temas diferentes para cada",
      "Economia de R$9,80",
      "Download completo de todos",
      "Suporte prioritário",
    ],
  },
];

export function Pricing() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-background" id="preco">
      <div className="container-rounded">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge-fun mb-4 inline-block">💰 Preço Especial</span>
          <h2 className="text-3xl md:text-4xl font-baloo font-bold mb-4">
            Escolha seu <span className="text-gradient">plano mágico</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Pagamento único via Pix • Download instantâneo
          </p>
        </motion.div>

        {/* Cards de preço */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`relative rounded-4xl p-8 ${
                plan.popular 
                  ? "bg-gradient-to-br from-primary/10 via-lavender/10 to-secondary/10 border-2 border-primary/30" 
                  : "bg-card border border-border"
              } shadow-soft`}
            >
              {/* Badge popular */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-bold shadow-pink">
                    <Sparkles className="w-4 h-4" />
                    Mais Vendido
                  </span>
                </div>
              )}

              {/* Ícone */}
              <div className="text-center mb-6 pt-4">
                <span className="text-5xl">
                  {plan.popular ? "🎵" : "🎁"}
                </span>
              </div>

              {/* Nome e descrição */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-baloo font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              {/* Preço */}
              <div className="text-center mb-8">
                {plan.originalPrice && (
                  <p className="text-muted-foreground line-through text-lg">
                    R$ {plan.originalPrice}
                  </p>
                )}
                <div className="flex items-center justify-center gap-2">
                  <span className="text-muted-foreground text-lg">R$</span>
                  <span className="text-5xl font-baloo font-extrabold text-gradient">
                    {plan.price}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-mint/30 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-mint-foreground" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <MagicButton
                variant={plan.popular ? "primary" : "secondary"}
                size="lg"
                className="w-full"
                onClick={() => navigate("/criar")}
              >
                {plan.popular ? (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Quero essa!
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5" />
                    Escolher pacote
                  </>
                )}
              </MagicButton>
            </motion.div>
          ))}
        </div>

        {/* Garantia */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-mint/20 rounded-full">
            <span className="text-2xl">🛡️</span>
            <span className="text-sm font-medium">
              Satisfação garantida ou seu dinheiro de volta em até 7 dias
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
