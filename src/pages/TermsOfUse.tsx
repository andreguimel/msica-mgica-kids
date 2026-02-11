import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const TermsOfUse = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="container-rounded max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-baloo font-bold mb-8">
            Termos de <span className="text-gradient">Uso</span>
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
            <p className="text-sm">Última atualização: 11 de fevereiro de 2026</p>

            <h2 className="text-xl font-bold text-foreground">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar o serviço Música Mágica, você concorda com estes Termos de Uso. 
              Se não concordar, por favor, não utilize nossos serviços.
            </p>

            <h2 className="text-xl font-bold text-foreground">2. Descrição do Serviço</h2>
            <p>
              O Música Mágica é um serviço de criação de músicas personalizadas para crianças utilizando 
              inteligência artificial. O serviço inclui:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Geração de letra personalizada com o nome da criança.</li>
              <li>Criação de música original em formato MP3.</li>
              <li>Disponibilização do arquivo para download por 30 dias após a confirmação do pagamento.</li>
            </ul>

            <h2 className="text-xl font-bold text-foreground">3. Uso do Conteúdo</h2>
            <p>
              Ao adquirir uma música, você recebe uma licença pessoal e intransferível para uso privado. 
              Você pode:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ouvir e compartilhar a música com familiares e amigos.</li>
              <li>Reproduzir em festas e eventos privados.</li>
            </ul>
            <p>Você <strong>não</strong> pode:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Revender ou redistribuir comercialmente o conteúdo.</li>
              <li>Utilizar a música para fins publicitários sem autorização.</li>
              <li>Reivindicar autoria sobre o conteúdo gerado.</li>
            </ul>

            <h2 className="text-xl font-bold text-foreground">4. Pagamento e Reembolso</h2>
            <p>
              O pagamento é realizado via Pix antes da geração da música completa. Após a confirmação 
              do pagamento e entrega do produto digital:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Não oferecemos reembolso, pois o produto é digital e personalizado.</li>
              <li>Em caso de problemas técnicos que impeçam o acesso à música, entraremos em contato para solução.</li>
              <li>Se a música gerada apresentar defeitos técnicos, uma nova versão será criada sem custo adicional.</li>
            </ul>

            <h2 className="text-xl font-bold text-foreground">5. Pré-visualização</h2>
            <p>
              Antes do pagamento, você pode pré-visualizar e editar a letra da música. A aprovação da letra 
              antes do pagamento é de responsabilidade do usuário.
            </p>

            <h2 className="text-xl font-bold text-foreground">6. Disponibilidade do Serviço</h2>
            <p>
              Nos esforçamos para manter o serviço disponível 24 horas por dia, mas não garantimos 
              disponibilidade ininterrupta. Manutenções programadas ou problemas técnicos podem causar 
              interrupções temporárias.
            </p>

            <h2 className="text-xl font-bold text-foreground">7. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo do site (design, textos, logotipos) é de propriedade do Música Mágica. 
              As músicas geradas são criadas por IA e licenciadas ao comprador conforme descrito na seção 3.
            </p>

            <h2 className="text-xl font-bold text-foreground">8. Proteção de Menores</h2>
            <p>
              O serviço é destinado a ser utilizado por adultos (pais, responsáveis ou familiares) 
              para criar músicas para crianças. Menores de 18 anos não devem realizar compras sem 
              supervisão de um responsável.
            </p>

            <h2 className="text-xl font-bold text-foreground">9. Limitação de Responsabilidade</h2>
            <p>
              O Música Mágica não se responsabiliza por danos indiretos decorrentes do uso do serviço. 
              Nossa responsabilidade máxima é limitada ao valor pago pelo serviço.
            </p>

            <h2 className="text-xl font-bold text-foreground">10. Alterações nos Termos</h2>
            <p>
              Reservamo-nos o direito de alterar estes termos a qualquer momento. Alterações significativas 
              serão comunicadas por e-mail ou aviso no site.
            </p>

            <h2 className="text-xl font-bold text-foreground">11. Contato</h2>
            <p>
              Para dúvidas sobre estes termos, entre em contato pelo e-mail: 
              <a href="mailto:contato@musicamagica.com" className="text-primary hover:underline"> contato@musicamagica.com</a>.
            </p>

            <h2 className="text-xl font-bold text-foreground">12. Foro</h2>
            <p>
              Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer questões decorrentes 
              destes Termos de Uso.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default TermsOfUse;
