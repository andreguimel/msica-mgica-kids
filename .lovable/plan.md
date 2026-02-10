

# Atualizar Preco para R$ 19,90

## Resumo

Alterar o preco de R$ 29,90 para **R$ 19,90** (musica unica) e de R$ 79,90 para **R$ 49,90** (pacote de 3), atualizando todos os pontos do frontend onde os valores aparecem.

## Arquivos a Alterar

### 1. src/components/landing/Hero.tsx
- Linha com "R$ 29,90" no bloco de preco ao lado do CTA -> trocar para "R$ 19,90"

### 2. src/components/landing/Pricing.tsx
- Plano "Musica Magica": price de "29,90" para "19,90"
- Plano "Pacote Encantado": price de "79,90" para "49,90", originalPrice de "89,70" para "59,70"
- Atualizar texto de economia de "R$9,80" para "R$9,80" (continua igual: 3x19,90=59,70 - 49,90=9,80)

### 3. src/pages/Preview.tsx
- Bloco de preco "R$ 29,90" -> "R$ 19,90"

### 4. src/pages/Payment.tsx
- Valor exibido de "R$ 29,90" -> "R$ 19,90" (se presente)

## Detalhes Tecnicos

Sao apenas alteracoes de strings no frontend. Nenhuma mudanca de logica, banco de dados ou edge functions e necessaria. Quando a integracao real com Pix (Abacate Pay) for implementada, o valor cobrado sera configurado la tambem.

