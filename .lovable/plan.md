

# Plano de Melhorias para Conversao da Landing Page

## Diagnostico

Analisei toda a LP e identifiquei os seguintes problemas principais:

1. **PurchaseNotification nao esta ativada** - O componente existe mas NAO esta importado no Index.tsx
2. **Sem botao flutuante de WhatsApp** - Quem tem duvida vai embora
3. **Sem CTA fixo no mobile** - O botao de compra desaparece ao rolar
4. **CTAs da Pricing sao fracos** - "Quero essa!" nao comunica valor nem preco
5. **Sem CTA entre Depoimentos e Pricing** - O usuario le depoimentos e nao tem acao imediata
6. **FAQ nao ataca objecoes de compra** - A primeira pergunta deveria ser "E se eu nao gostar?"
7. **Garantia longe dos botoes de compra** - Nao tem micro-garantia perto dos CTAs
8. **Sem eventos avancados do Pixel** - Sem InitiateCheckout/Purchase, impossivel otimizar anuncios

---

## Mudancas

### 1. Ativar PurchaseNotification (prova social em tempo real)
**Arquivo:** `src/pages/Index.tsx`
- Importar e renderizar `<PurchaseNotification />` - ja existe, so precisa ser adicionado

### 2. Botao flutuante de WhatsApp
**Novo arquivo:** `src/components/ui/WhatsAppButton.tsx`
- Icone de WhatsApp fixo no canto inferior direito (acima das notificacoes)
- Animacao de pulso para chamar atencao
- Mensagem pre-preenchida: "Ola! Tenho duvidas sobre a musica personalizada"
- Renderizar em `src/pages/Index.tsx`

### 3. CTA fixo no mobile (sticky bottom)
**Novo arquivo:** `src/components/ui/StickyMobileCTA.tsx`
- Barra fixa no rodape apenas em telas mobile
- Mostra "Criar agora - R$ 9,90" com botao
- Aparece apos rolar 400px, esconde quando secao de preco esta visivel
- Renderizar em `src/pages/Index.tsx`

### 4. CTAs mais fortes na Pricing
**Arquivo:** `src/components/landing/Pricing.tsx`
- Trocar "Quero essa!" por "Criar musica agora - R$ 9,90"
- Trocar "Escolher pacote" por "Quero 3 musicas - R$ 24,90"
- Adicionar texto de micro-garantia abaixo de cada botao: "7 dias de garantia | Reembolso total"

### 5. Secao CTA intermediaria entre Depoimentos e Pricing
**Arquivo:** `src/pages/Index.tsx`
- Adicionar uma secao simples entre `<Testimonials />` e `<Pricing />` com:
  - Frase emocional: "Sua crianca merece esse momento magico"
  - Botao CTA direto para /criar
  - Micro-garantia

### 6. Reordenar FAQ para atacar objecoes
**Arquivo:** `src/components/landing/FAQ.tsx`
- Nova primeira pergunta: "E se eu nao gostar da musica?" (resposta: garantia 7 dias, reembolso total)
- Nova segunda pergunta: "E seguro pagar por Pix?" (resposta: sim, pagamento seguro, dados protegidos)
- Mover as demais para baixo

### 7. Micro-garantia perto dos CTAs do Hero
**Arquivo:** `src/components/landing/Hero.tsx`
- Adicionar texto pequeno abaixo do botao principal: "Garantia de 7 dias | Reembolso total via Pix"

### 8. Eventos avancados do Facebook Pixel
**Arquivo:** `src/vite-env.d.ts` - Declarar tipo global `fbq`
**Arquivo:** `src/pages/Payment.tsx` - Disparar `InitiateCheckout` ao carregar e `Purchase` ao confirmar pagamento
**Arquivo:** `src/pages/CreateMusic.tsx` - Disparar `ViewContent` ao carregar
**Arquivo:** `src/pages/Preview.tsx` - Disparar `Lead` ao visualizar a letra

---

## Resumo de arquivos

| Arquivo | Acao |
|---|---|
| `src/components/ui/WhatsAppButton.tsx` | Criar |
| `src/components/ui/StickyMobileCTA.tsx` | Criar |
| `src/pages/Index.tsx` | Modificar (ativar notificacoes, WhatsApp, sticky CTA, CTA intermediario) |
| `src/components/landing/Pricing.tsx` | Modificar (CTAs + micro-garantia) |
| `src/components/landing/FAQ.tsx` | Modificar (reordenar perguntas) |
| `src/components/landing/Hero.tsx` | Modificar (micro-garantia) |
| `src/vite-env.d.ts` | Modificar (tipo fbq) |
| `src/pages/Payment.tsx` | Modificar (eventos Pixel) |
| `src/pages/CreateMusic.tsx` | Modificar (evento ViewContent) |
| `src/pages/Preview.tsx` | Modificar (evento Lead) |

