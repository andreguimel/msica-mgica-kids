

## Bypass Admin via URL Secreta

### Abordagem mais simples

Em vez de criar uma nova edge function e UI de admin, basta usar uma **URL secreta** que pula direto para a geracao. Voce acessa a pagina de pagamento com um parametro especial na URL e o sistema inicia a musica sem cobrar.

### Como funciona

1. Voce acessa a pagina de pagamento normalmente (cria a letra, vai para preview, clica em "Gerar Musica")
2. Na URL da pagina de pagamento, adiciona `?admin=SUA_SENHA_SECRETA`
   - Exemplo: `https://seusite.com/pagamento?admin=MinhaSenha123`
3. O sistema detecta o parametro, envia a senha para o backend que valida
4. Se valida, marca como pago e inicia a geracao automaticamente
5. Nenhum formulario de pagamento aparece

### Detalhes tecnicos

**Novo secret: `ADMIN_SECRET`**
- Voce define uma senha (ex: "MagicaAdmin2025")
- Armazenada de forma segura no backend

**Modificacao: `supabase/functions/start-music-after-payment/index.ts`**
- Aceitar parametro opcional `adminSecret` no body da requisicao
- Se `adminSecret` for enviado e coincidir com o secret `ADMIN_SECRET`, pular a validacao de status (nao exigir `awaiting_payment`)
- Atualizar `payment_status` para "paid" automaticamente antes de enviar ao Kie.ai

**Modificacao: `src/pages/Payment.tsx`**
- No `useEffect` inicial, verificar se existe `?admin=XXXXX` na URL
- Se existir, chamar uma nova funcao `adminBypassPayment(taskId, secret)` que envia o secret ao backend
- Se o backend retornar sucesso, pular direto para o estado "confirmed" e seguir o fluxo normal de geracao
- Se falhar (senha errada), seguir o fluxo normal de pagamento

**Modificacao: `src/services/musicPipeline.ts`**
- Adicionar funcao `adminBypassPayment(taskId: string, adminSecret: string)` que chama `start-music-after-payment` passando o `adminSecret` no body

### Seguranca
- A senha nunca fica no codigo-fonte do frontend (so e passada pela URL no momento do uso)
- Validacao acontece 100% no servidor
- URL com o parametro admin nao e compartilhada com clientes
- Tentativas com senha errada retornam erro e seguem o fluxo normal

