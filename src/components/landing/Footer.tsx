import { motion } from "framer-motion";
import { MessageCircle, Mail, Instagram, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 bg-foreground text-primary-foreground">
      <div className="container-rounded">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo e descrição */}
          <div>
            <h3 className="text-2xl font-baloo font-bold mb-4 text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              𝄞 Música Mágica
            </h3>
            <p className="text-primary-foreground/70 text-sm">
              Criamos músicas personalizadas com IA para fazer crianças felizes. 
              Cada canção é única, educativa e cheia de amor.
            </p>
          </div>

          {/* Links rápidos */}
          <div>
            <h4 className="font-bold mb-4">Links Úteis</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <a href="#preco" className="hover:text-primary transition-colors">
                  Preços
                </a>
              </li>
              <li>
                <a href="/criar" className="hover:text-primary transition-colors">
                  Criar Música
                </a>
              </li>
              <li>
                <a href="/termos" className="hover:text-primary transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="/privacidade" className="hover:text-primary transition-colors">
                  Política de Privacidade
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-bold mb-4">Fale Conosco</h4>
            <div className="space-y-3">
              <motion.a

                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-mint transition-colors"
                whileHover={{ x: 5 }} href="https://wa.me/5581996919895?text=Ol\xE1! Tenho uma d\xFAvida sobre a M\xFAsica M\xE1gica">

                <div className="w-10 h-10 bg-mint/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-mint" />
                </div>
                WhatsApp - Suporte
              </motion.a>
              
              <motion.a

                className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                whileHover={{ x: 5 }} href="mailto:contato@musicamagica.com.br">

                <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-secondary" />
                </div>
                contato@musicamagica.com
              </motion.a>
              
              <motion.a

                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                whileHover={{ x: 5 }} href="https://instagram.com/musica.magica">

                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-primary" />
                </div>
                @musicamagica
              </motion.a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-foreground/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-foreground/50">
              © {currentYear} Música Mágica para Crianças. Todos os direitos reservados.
            </p>
            <p className="text-sm text-primary-foreground/50 flex items-center gap-1">
              Feito com <Heart className="w-4 h-4 text-primary fill-primary" /> para famílias felizes
            </p>
          </div>
        </div>
      </div>
    </footer>);

}