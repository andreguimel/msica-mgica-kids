

## Atualizar Precos

Atualizar os precos em toda a landing page:

- **Musica avulsa**: R$ 14,90 -> R$ 9,90
- **Pacote 3 musicas**: R$ 49,90 -> R$ 24,90 (preco original riscado de R$ 29,70)
- **Economia**: R$ 4,80

### Arquivos a editar

1. **`src/components/landing/Hero.tsx`** (linha 162): Alterar "R$ 14,90" para "R$ 9,90"

2. **`src/components/landing/Pricing.tsx`**:
   - Plano avulso: `price` de "14,90" para "9,90"
   - Plano pacote: `price` de "49,90" para "24,90"
   - Plano pacote: `originalPrice` de "59,70" para "29,70"
   - Plano pacote: feature "Economia de R$9,80" para "Economia de R$4,80"
   - Descricao do plano avulso: manter "1-2 minutos" (ja correto)

