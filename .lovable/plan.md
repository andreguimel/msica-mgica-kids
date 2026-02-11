

# Permitir o usuario escolher o estilo musical

Atualmente, o estilo musical (pop, rock, sertanejo, etc.) e determinado automaticamente pelo tema escolhido (animais, princesas, etc.). Com essa mudanca, o usuario podera escolher o estilo que preferir.

## O que muda para o usuario

Um novo campo aparecera no formulario de criacao, logo apos o tema, perguntando "Qual estilo musical?". O usuario vera opcoes como:

- Pop Infantil (alegre e dancante)
- MPB / Acustico (violao e voz suave)
- Sertanejo (divertido e animado)
- Rock Infantil (guitarras e energia)
- Bossa Nova (suave e melodico)
- Reggae (relaxante e tropical)

Se o usuario nao escolher, o estilo padrao sera determinado pelo tema (comportamento atual).

## Detalhes tecnicos

### 1. Formulario (CreateMusic.tsx)
- Adicionar campo `musicStyle` ao `FormData`
- Criar array de opcoes de estilo musical com emojis e descricoes
- Renderizar grade de botoes similar ao seletor de tema
- Validacao opcional (se nao escolher, usa o padrao do tema)

### 2. Banco de dados
- Adicionar coluna `music_style` (text, nullable) na tabela `music_tasks` via migracao SQL

### 3. Edge Functions
- **save-custom-lyrics**: Receber e salvar o campo `music_style`
- **generate-lyrics-only**: Receber e salvar o campo `music_style`
- **start-music-after-payment**: Usar o `music_style` salvo no banco ao inves do mapeamento automatico por tema. Se `music_style` estiver vazio, manter o comportamento atual (fallback por tema)

### 4. Pipeline (musicPipeline.ts)
- Incluir `musicStyle` nos parametros enviados as edge functions

### 5. Mapeamento de estilos para o Kie.ai
Os estilos serao traduzidos em tags que o Kie.ai entende:

| Estilo | Tags para Kie.ai |
|--------|------------------|
| Pop Infantil | children's music, pop, cheerful, catchy, upbeat, fun |
| MPB / Acustico | children's music, MPB, acoustic guitar, gentle, warm, Brazilian |
| Sertanejo | children's music, sertanejo, acoustic guitar, fun, Brazilian country |
| Rock Infantil | children's music, rock, electric guitar, energetic, fun, drums |
| Bossa Nova | children's music, bossa nova, gentle, jazzy, acoustic, Brazilian |
| Reggae | children's music, reggae, tropical, relaxed, happy, fun |

