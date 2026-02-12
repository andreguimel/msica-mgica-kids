

## Adicionar mais repetições nas letras geradas

Atualizar o prompt de geração de letras para que a IA crie músicas com mais repetições, tornando-as mais fáceis de decorar para as crianças.

### O que muda

O prompt na função de geração de letras será ajustado para instruir a IA a:

- Repetir o refrão 2 vezes na estrutura da música (Estrofe 1 > Refrão > Estrofe 2 > Refrão)
- Usar frases-chave repetidas dentro das estrofes
- Criar um refrão mais curto e repetitivo (estilo "canta comigo")
- Manter a duração total entre 1:30 e 2:30 minutos

### Detalhes técnicos

**Arquivo:** `supabase/functions/generate-lyrics-only/index.ts`

Alterar o `systemPrompt` para enfatizar repetições:

- Estrutura: Estrofe 1 + Refrão + Estrofe 2 + Refrão (refrão aparece 2 vezes)
- O refrão deve ter frases que se repetem (ex: mesma frase cantada 2x seguidas)
- Usar repetições naturais dentro das estrofes (ex: "Vamos lá, vamos lá!")
- Manter linguagem simples e cativante

Nenhuma outra alteração necessária -- a mudança é apenas no texto do prompt.

