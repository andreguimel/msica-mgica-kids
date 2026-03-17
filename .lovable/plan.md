

# Migração de AbacatePay para Mercado Pago

## Resumo
Substituir toda a integração de pagamento Pix via AbacatePay pela API do Mercado Pago, mantendo o mesmo fluxo de QR Code Pix inline com polling automático.

## Arquivos afetados

### Edge Functions (backend)
1. **`supabase/functions/create-billing/index.ts`** -- Substituir chamada à API AbacatePay por Mercado Pago (endpoint `POST /v1/payments` com `payment_method_id: "pix"`). Retornar `qr_code` (brCode) e `qr_code_base64` do response.

2. **`supabase/functions/create-upsell-billing/index.ts`** -- Mesma substituição para o fluxo de upsell.

3. **`supabase/functions/abacatepay-webhook/index.ts`** -- Reescrever para processar notificações IPN do Mercado Pago. O Mercado Pago envia `{ action: "payment.updated", data: { id } }`. O webhook busca o pagamento via `GET /v1/payments/{id}` para confirmar status `"approved"`. Renomear para `mercadopago-webhook`.

### Frontend
4. **`src/pages/Payment.tsx`** -- Ajustes mínimos: o fluxo de QR Code Pix permanece idêntico (recebe `brCode` e exibe via `react-qr-code`). Apenas textos de referência ao AbacatePay (se houver) serão removidos.

5. **`src/services/musicPipeline.ts`** -- Sem alterações necessárias (já abstrai as chamadas).

### Secrets
6. **Nova secret**: `MERCADOPAGO_ACCESS_TOKEN` -- Token de acesso do Mercado Pago (Production).
7. A secret `ABACATEPAY_API_KEY` pode ser removida após a migração.

## Detalhes técnicos

### API do Mercado Pago - Criar Pix
```
POST https://api.mercadopago.com/v1/payments
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json

{
  "transaction_amount": 9.90,
  "payment_method_id": "pix",
  "payer": {
    "email": "cliente@email.com",
    "first_name": "Nome",
    "identification": { "type": "CPF", "number": "12345678901" }
  },
  "description": "Música Mágica para Ana",
  "external_reference": "{taskId}"
}
```
Response inclui `point_of_interaction.transaction_data.qr_code` (brCode) e `qr_code_base64`.

### Webhook do Mercado Pago
- URL: `https://hdoaljpejropkjhazqxp.supabase.co/functions/v1/mercadopago-webhook`
- Recebe `{ action, data: { id } }`, busca `GET /v1/payments/{id}` para validar status.
- Status `approved` = pago. Status `cancelled`/`expired` = abandono.
- Usa `external_reference` para localizar o `taskId` no banco.

### Mudanças no banco
- O campo `billing_id` passa a armazenar o `payment.id` do Mercado Pago.
- O campo `payment_url` armazena o `qr_code` (brCode).
- Sem necessidade de migração de schema.

## Passos de implementação
1. Solicitar ao usuário a secret `MERCADOPAGO_ACCESS_TOKEN`
2. Criar `supabase/functions/mercadopago-webhook/index.ts`
3. Reescrever `create-billing/index.ts` para usar API Mercado Pago
4. Reescrever `create-upsell-billing/index.ts` para usar API Mercado Pago
5. Deletar `supabase/functions/abacatepay-webhook/index.ts`
6. Configurar a URL do webhook no painel do Mercado Pago (instrução ao usuário)
7. Deploy de todas as edge functions

