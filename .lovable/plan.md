
## Diagnóstico da Campanha

Com 283 cliques e 1 conversão, a taxa atual é **0,35%** (meta: 2–5%). O custo por clique (R$ 0,18) é ótimo — o gargalo é a página.

Principais problemas identificados no código:

1. **Hero sem urgência real** — o título "Música Mágica para Crianças" é genérico e não conecta emocionalmente com a dor do pai/mãe
2. **Sem prova social forte no topo** — os depoimentos ficam no final da página, mas o visitante decide em segundos
3. **Player de demo não autoplay** — o visitante precisa clicar para ouvir. Muitos não fazem isso
4. **Sem timer de urgência** — a oferta não tem prazo, não gera senso de urgência
5. **Falta de âncora emocional** — não há foto/vídeo de criança real reagindo à música
6. **Depoimentos sem foto real** — emojis como avatar reduzem credibilidade
7. **Sem banner de urgência fixo** — ao rolar a página, o visitante perde o botão de compra
8. **CTA do Hero fraco** — "Criar minha música agora!" é genérico, não gera FOMO

---

## Melhorias Propostas (em ordem de impacto)

### 1. Reformular o headline do Hero
**Antes:** "Música Mágica para Crianças"
**Depois:** "Seu filho vai ouvir o nome dele em uma música!" — conecta diretamente com a emoção do pai/mãe

### 2. Adicionar barra de urgência no topo da página (Sticky Top Banner)
Uma faixa fina acima da Navbar com contador regressivo de 15 minutos e o cupom `MAGICA10`:
```
⏰ Oferta especial: 10% OFF com MAGICA10 — Expira em 14:32
```
- Timer reiniciado a cada sessão com `sessionStorage`
- Visível em todas as seções enquanto rola a página

### 3. Adicionar depoimentos com mais credibilidade direto no Hero
Logo abaixo do CTA, adicionar 3 avatares + nome + frase curta:
```
⭐⭐⭐⭐⭐  "Minha filha chorou de emoção!" — Ana P.
```

### 4. Adicionar prova social com número de músicas criadas hoje
No Hero: "🔥 37 músicas criadas hoje" (número dinâmico simulado + hoje)

### 5. Reformular o CTA
**Antes:** "Criar minha música agora!"
**Depois:** "🎵 Ouvir demo e criar a música do meu filho"

### 6. Adicionar seção de "Garantia" destacada entre Pricing e FAQ
Um card largo com: ✅ Reembolso em 7 dias + Satisfação garantida + Suporte via WhatsApp

---

## Detalhes Técnicos

### Arquivos a modificar:

**`src/components/landing/Hero.tsx`**
- Mudar `<h1>` para headline emocional orientada ao benefício
- Adicionar mini-depoimentos abaixo do botão CTA (3 avatares circulares + texto)
- Mudar texto do botão CTA
- Adicionar indicador "🔥 X músicas criadas hoje"

**`src/components/landing/Navbar.tsx`**
- Adicionar `StickyTopBanner` acima da Navbar com countdown de 15 minutos
- O banner usa `sessionStorage` para manter o tempo entre navegações

**`src/components/landing/Testimonials.tsx`**
- Substituir avatares emoji por iniciais em círculos coloridos (mais credível)
- Adicionar "Compra verificada ✓" em cada depoimento

**`src/components/landing/Pricing.tsx`**
- Adicionar urgência: "⚡ Preço especial por tempo limitado"

**`src/pages/Index.tsx`**
- Reordenar seções: Testimonials sobe para antes do Pricing (prova social antes de pedir o dinheiro)
