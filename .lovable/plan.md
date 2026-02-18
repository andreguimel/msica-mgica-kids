
## Notificações por E-mail para o Administrador

### Visão Geral

Você receberá e-mails automáticos em cada etapa importante do funil de vendas, com dados completos do cliente e da criança. Para o abandono de carrinho, o sistema enviará um e-mail de recuperação com cupom de 50% de desconto diretamente para o cliente.

---

### Os 3 Eventos que disparam e-mails

**1. Cliente Iniciou** — quando o cliente chega na tela de pagamento (QR Code gerado)
- Disparo: na função `create-billing`, logo após criar o Pix com sucesso
- E-mail para você (admin): nome da criança, tema, plano, nome/e-mail do cliente, valor cobrado

**2. Cliente Comprou** — quando o pagamento Pix é confirmado
- Disparo: na função `abacatepay-webhook`, quando `status === "PAID"`
- E-mail para você (admin): confirmação de venda, dados do pedido, valor recebido

**3. Cliente Abandonou** — Pix expirado sem pagamento
- Disparo: na função `abacatepay-webhook`, quando `status === "EXPIRED"` ou `"CANCELLED"`
- E-mail para você (admin): alerta de abandono com dados do cliente
- E-mail para o cliente: oferta de recuperação com **50% de desconto** e link direto para `/criar`

---

### Arquivos a modificar

**`supabase/functions/create-billing/index.ts`**
Após criar o Pix com sucesso, chama o Brevo para enviar e-mail ao admin com:
- Nome e tema da criança
- Nome, e-mail e CPF do cliente
- Plano escolhido (avulso ou pacote)
- Valor cobrado

**`supabase/functions/abacatepay-webhook/index.ts`**
Adiciona dois novos blocos de notificação:
- `isPaid` → envia e-mail de "Venda confirmada!" ao admin
- `isExpired` (status `EXPIRED` ou `CANCELLED`) → envia dois e-mails:
  - Admin: alerta de abandono
  - Cliente: e-mail de recuperação com cupom de 50% (`RESGATE50`)

---

### E-mail de recuperação para o cliente (abandono)

```
Assunto: "Oi! Esqueceu a música de [Nome]? 🎵"

Corpo:
  Olá! Você quase criou a música personalizada de [Nome da Criança].

  Por isso, estamos oferecendo 50% de desconto exclusivo por 24h.

  Use o cupom: RESGATE50

  [Botão: Resgatar meu desconto →] → abre /criar com cupom salvo
```

---

### Detalhes Técnicos

**Como o cupom de 50% funciona:**
- O link de recuperação enviado no e-mail será: `https://musicamagica.com.br/criar?coupon=RESGATE50`
- O `Payment.tsx` já lê cupons do `localStorage`; será atualizado para também ler o parâmetro `?coupon=` da URL
- O cupom `RESGATE50` = 50% de desconto será validado no backend `create-billing` (já aceita `discountPercent` até 50%)

**Remetente:** `andreguimel@gmail.com` (já configurado no Brevo)

**Destinatário admin:** `andreguimel@gmail.com` (hardcoded, mas pode ser tornado configurável)

**Segurança:** O cupom é validado no backend — o usuário não pode manipular o valor do desconto pelo frontend.

**Fluxo completo:**

```text
[Cliente preenche dados e gera QR]
         ↓
  create-billing → e-mail: "Cliente Iniciou" para admin
         ↓
[Cliente paga o Pix]
         ↓
  abacatepay-webhook (PAID) → e-mail: "Venda Confirmada!" para admin
         ↓
[Pix expira sem pagamento]
         ↓
  abacatepay-webhook (EXPIRED) → e-mail para admin: "Abandono de Carrinho"
                               → e-mail para cliente: "Oferta 50% OFF"
```
