import { motion } from "framer-motion";
import { Wand2, Music2, Video, Download, Heart, Shield } from "lucide-react";

const features = [
  {
    icon: Wand2,
    title: "Letra Personalizada",
    description: "IA cria uma letra única com o nome da criança, tema favorito e mensagem especial",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Music2,
    title: "Música Original",
    description: "Melodia alegre e educativa gerada por IA, perfeita para cantar junto",
    color: "bg-secondary/20 text-secondary-foreground",
  },
  {
    icon: Video,
    title: "Vídeo Animado",
    description: "Animações 2D coloridas com a letra na tela, ideal para assistir em família",
    color: "bg-mint/30 text-mint-foreground",
  },
  {
    icon: Download,
    title: "Download Completo",
    description: "Receba MP3 da música, MP4 do vídeo HD e PDF com a letra completa",
    color: "bg-lavender/30 text-lavender-foreground",
  },
  {
    icon: Heart,
    title: "Feito com Amor",
    description: "Cada música é uma obra única, criada especialmente para seu pequeno",
    color: "bg-peach/30 text-peach-foreground",
  },
  {
    icon: Shield,
    title: "100% Seguro",
    description: "Conteúdo educativo e positivo, sem anúncios ou conteúdo inadequado",
    color: "bg-accent/30 text-accent-foreground",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function Features() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container-rounded">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge-fun mb-4 inline-block">✨ Recursos Mágicos</span>
          <h2 className="text-3xl md:text-4xl font-baloo font-bold mb-4">
            Como funciona a <span className="text-gradient">magia</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Em poucos cliques, você cria uma experiência musical inesquecível para seu filho!
          </p>
        </motion.div>

        {/* Grid de features */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="card-float"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-baloo font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
