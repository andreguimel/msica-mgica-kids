import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const PrivacyPolicy = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="container-rounded max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-baloo font-bold mb-8">
            Política de <span className="text-gradient">Privacidade</span>
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
            <p className="text-sm">Última atualização: 11 de fevereiro de 2026</p>

            <h2 className="text-xl font-bold text-foreground">1. Informações que Coletamos</h2>
            <p>
              Ao utilizar o serviço Música Mágica, podemos coletar as seguintes informações:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Nome da criança:</strong> utilizado exclusivamente para personalizar a letra da música.</li>
              <li><strong>E-mail do responsável:</strong> utilizado para enviar o link de download da música e comunicações relacionadas ao pedido.</li>
              <li><strong>Dados de pagamento:</strong> processados por nosso parceiro de pagamentos (AbacatePay). Não armazenamos dados de cartão de crédito.</li>
              <li><strong>Dados de navegação:</strong> cookies e informações técnicas para melhorar a experiência do usuário.</li>
            </ul>

            <h2 className="text-xl font-bold text-foreground">2. Como Usamos suas Informações</h2>
            <p>Suas informações são utilizadas para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Gerar a música personalizada com o nome da criança.</li>
              <li>Processar o pagamento e enviar o produto digital.</li>
              <li>Enviar e-mails com o link de download e informações sobre o pedido.</li>
              <li>Melhorar nossos serviços e experiência do usuário.</li>
            </ul>

            <h2 className="text-xl font-bold text-foreground">3. Compartilhamento de Dados</h2>
            <p>
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Processadores de pagamento para concluir transações.</li>
              <li>Serviços de IA para geração do conteúdo musical (apenas o nome da criança e tema escolhido).</li>
              <li>Quando exigido por lei ou ordem judicial.</li>
            </ul>

            <h2 className="text-xl font-bold text-foreground">4. Segurança dos Dados</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger suas informações pessoais contra acesso não autorizado, 
              perda ou destruição. Todos os dados são transmitidos por conexão criptografada (HTTPS).
            </p>

            <h2 className="text-xl font-bold text-foreground">5. Retenção de Dados</h2>
            <p>
              Os dados pessoais são mantidos pelo tempo necessário para cumprir as finalidades descritas nesta política. 
              Links de download expiram após 30 dias. Você pode solicitar a exclusão dos seus dados a qualquer momento 
              entrando em contato conosco.
            </p>

            <h2 className="text-xl font-bold text-foreground">6. Direitos do Usuário</h2>
            <p>De acordo com a LGPD (Lei Geral de Proteção de Dados), você tem direito a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acessar seus dados pessoais.</li>
              <li>Corrigir dados incompletos ou desatualizados.</li>
              <li>Solicitar a exclusão dos seus dados.</li>
              <li>Revogar o consentimento para o uso dos dados.</li>
            </ul>

            <h2 className="text-xl font-bold text-foreground">7. Cookies</h2>
            <p>
              Utilizamos cookies essenciais para o funcionamento do site. Não utilizamos cookies de rastreamento 
              de terceiros para fins publicitários.
            </p>

            <h2 className="text-xl font-bold text-foreground">8. Contato</h2>
            <p>
              Para dúvidas sobre esta política ou para exercer seus direitos, entre em contato pelo e-mail: 
              <a href="mailto:contato@musicamagica.com" className="text-primary hover:underline"> contato@musicamagica.com</a>.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default PrivacyPolicy;
