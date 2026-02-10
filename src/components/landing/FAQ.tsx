import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Quanto tempo leva para criar a música?",
    answer: "A magia acontece em menos de 1 minuto! Nossa IA avançada gera a letra e a música personalizada rapidamente. Você pode pré-visualizar antes de comprar.",
  },
  {
    question: "Posso escolher o estilo da música?",
    answer: "Sim! Você escolhe o tema (Animais, Princesas, Super-heróis, Espaço ou Natureza) e a IA cria uma música alegre e educativa baseada na sua escolha.",
  },
  {
    question: "A música tem o nome da criança?",
    answer: "Com certeza! O nome da criança aparece na letra da música e é cantado várias vezes. Uma experiência totalmente personalizada!",
  },
  {
    question: "Como funciona o pagamento?",
    answer: "Aceitamos Pix para pagamento instantâneo. Assim que confirmado, você recebe o link de download por e-mail e na tela. O link fica disponível por 24 horas.",
  },
  {
    question: "Posso baixar quantas vezes quiser?",
    answer: "O link de download fica ativo por 24 horas, e você pode baixar quantas vezes precisar nesse período. Recomendamos salvar em local seguro!",
  },
  {
    question: "É seguro para crianças assistirem?",
    answer: "100% seguro! Todo conteúdo é gerado com temas positivos, educativos e apropriados para crianças de 3 a 8 anos. Sem anúncios ou conteúdo inadequado.",
  },
  {
    question: "Posso presentear alguém?",
    answer: "Claro! É o presente perfeito para aniversários, datas especiais ou só para fazer uma criança feliz. Você pode enviar o link de download diretamente para a pessoa.",
  },
];

export function FAQ() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container-rounded">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="badge-fun mb-4 inline-block">❓ Dúvidas</span>
          <h2 className="text-3xl md:text-4xl font-baloo font-bold mb-4">
            Perguntas <span className="text-gradient">frequentes</span>
          </h2>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-2xl px-6 border-none shadow-soft"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                  <span className="flex items-center gap-3">
                    <span className="text-xl">🎵</span>
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
