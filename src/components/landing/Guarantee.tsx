import { motion } from "framer-motion";
import { Shield, MessageCircle, Clock } from "lucide-react";

export function Guarantee() {
  return (
    <section className="py-16 bg-muted/20">
      <div className="container-rounded">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="rounded-4xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-8 md:p-12 text-center shadow-soft">
            <div className="text-6xl mb-6">🛡️</div>
            <h2 className="text-2xl md:text-3xl font-baloo font-bold mb-3">
              Sua compra é <span className="text-gradient">100% segura</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Criamos músicas para crianças e queremos que a experiência seja perfeita. Conte com nosso suporte para qualquer dúvida!
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-secondary-foreground" />
                </div>
                <p className="font-semibold text-sm">Suporte via WhatsApp</p>
                <p className="text-xs text-muted-foreground">Atendimento rápido e humanizado</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-accent-foreground" />
                </div>
                <p className="font-semibold text-sm">Download por 30 dias</p>
                <p className="text-xs text-muted-foreground">Link exclusivo disponível por 1 mês</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
