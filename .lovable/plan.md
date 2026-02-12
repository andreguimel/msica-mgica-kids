

## Bypass Admin para Pacote

### Problema atual

O bypass admin (`?admin=SENHA`) so funciona para a musica avulsa. Musicas do pacote sao bloqueadas pela condicao `isPackageSong` no useEffect.

### Solucao

Remover a restricao `isPackageSong` do useEffect de bypass admin, permitindo que o parametro `?admin=` funcione tanto para musica avulsa quanto para o pacote.

### Detalhes tecnicos

**Modificacao: `src/pages/Payment.tsx`**
- Linha 152: remover `|| isPackageSong` da condicao do useEffect de bypass admin
- Isso permite que o bypass funcione para qualquer tipo de musica (avulsa ou pacote)

A logica do backend ja suporta isso, pois o `start-music-after-payment` com `adminSecret` apenas valida o secret e marca como pago, independente do tipo de compra.

