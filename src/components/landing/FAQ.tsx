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
    answer: "A magia acontece em menos de 2 minutos! Nossa IA avançada gera a letra e a música personalizada rapidamente. Você pode pré-visualizar a letra antes de comprar. A música final tem até 2 minutos de duração.",
  },
  {
    question: "Posso escolher o estilo da música?",
    answer: "Sim! Você escolhe o tema (Animais, Princesas, Super-heróis, Espaço ou Natureza) e a IA cria uma música alegre e educativa baseada na sua escolha.",
  },
  {
    question: "A música tem o nome da criança?",
    answer: "Com certeza! O nome da criança aparece na letra e é cantado várias vezes ao longo da música. Uma experiência totalmente personalizada!",
  },
  {
    question: "O que eu recebo após o pagamento?",
    answer: "Você recebe o MP3 da música completa e a letra em arquivo de texto, prontos para download. Tudo disponível instantaneamente após a confirmação do pagamento.",
  },
  {
    question: "Por quanto tempo posso acessar minha música?",
    answer: "O link de download fica ativo por 30 dias, e você pode baixar quantas vezes precisar nesse período. Recomendamos salvar em local seguro!",
  },
  {
    question: "Como funciona o pagamento?",
    answer: "Aceitamos Pix para pagamento instantâneo. Assim que confirmado, você recebe um código de acesso exclusivo para baixar sua música a qualquer momento dentro de 30 dias.",
  },
  {
    question: "É seguro para crianças ouvirem?",
    answer: "100% seguro! Todo conteúdo é gerado com temas positivos, educativos e apropriados para crianças. Sem anúncios ou conteúdo inadequado.",
  },
  {
    question: "Posso presentear alguém?",
    answer: "Claro! É o presente perfeito para aniversários, datas especiais ou só para fazer uma criança feliz. Basta compartilhar o código de acesso com a pessoa.",
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
