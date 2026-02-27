

# Alterar estrutura das músicas para 3 estrofes com refrão

## Objetivo
Modificar o prompt de geração de letras para usar 3 estrofes intercaladas com refrão, resultando em músicas mais longas e completas.

## Estrutura atual
Estrofe 1 (4 linhas) → Refrão (4 linhas) → Estrofe 2 (4 linhas) → Refrão (repetido)

## Nova estrutura
Estrofe 1 (4 linhas) → Refrão (4 linhas) → Estrofe 2 (4 linhas) → Refrão → Estrofe 3 (4 linhas) → Refrão

## Alteracao

### 1. Atualizar prompt em `supabase/functions/generate-lyrics-only/index.ts`
- Alterar a estrutura obrigatoria no `systemPrompt` para incluir 3 estrofes intercaladas com refrao
- Ajustar a duracao alvo para 2:30 a 3:30 minutos (ja que tera mais conteudo)
- O refrao continua sendo repetido identico nas 3 aparicoes

