import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Mariana S.",
    child: "Mãe da Sofia, 5 anos",
    avatar: "👩‍🦰",
    rating: 5,
    text: "Minha filha não para de cantar a música dela! Chorei de emoção quando ouvi. Presente perfeito de aniversário!",
  },
  {
    name: "Pedro L.",
    child: "Pai do Lucas, 4 anos",
    avatar: "👨",
    rating: 5,
    text: "Incrível como a IA conseguiu criar algo tão especial. O Lucas ouve todo dia antes de dormir. Super recomendo!",
  },
  {
    name: "Ana Paula R.",
    child: "Avó da Helena, 6 anos",
    avatar: "👵",
    rating: 5,
    text: "Dei de presente para minha neta e ela amou! A qualidade da música me surpreendeu muito.",
  },
  {
    name: "Carlos M.",
    child: "Pai do Miguel, 3 anos",
    avatar: "👨‍🦱",
    rating: 5,
    text: "Meu filho aprendeu a soletrar o nome dele com a música! Educativo e divertido ao mesmo tempo.",
  },
];

export function Testimonials() {
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
          <span className="badge-fun mb-4 inline-block">💖 Famílias Felizes</span>
          <h2 className="text-3xl md:text-4xl font-baloo font-bold mb-4">
            O que os <span className="text-gradient">papais e mamães</span> dizem
          </h2>
        </motion.div>

        {/* Grid de depoimentos */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-float"
            >
              {/* Header do card */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">{testimonial.avatar}</span>
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.child}</p>
                </div>
              </div>

              {/* Estrelas */}
              <div className="flex gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>

              {/* Texto */}
              <p className="text-muted-foreground italic">"{testimonial.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
