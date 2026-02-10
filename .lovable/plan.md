

# Lyric Video + Imagens IA (Opcao Combinada)

## Visao Geral

Criar um player de video integrado que combina:
- **Fundo**: Imagens geradas por IA (Nano Banana / gemini-2.5-flash-image) baseadas no tema da crianca
- **Frente**: Letra da musica aparecendo de forma animada, sincronizada com o audio

Tudo processado no **frontend** usando Canvas/HTML, sem custo de video generativo. As imagens sao geradas via Lovable AI (custo minimo, ja incluso).

## Como Funciona

```text
Musica gerada (callback) --> Edge function gera 4-6 imagens do tema
--> Salva URLs no banco --> Frontend monta o "video player"
--> Canvas: imagens de fundo em transicao + letra animada por cima
--> Usuario pode assistir e compartilhar
```

## Custo Estimado

- **Imagens IA (Nano Banana)**: 4-6 imagens por musica, custo praticamente zero (ja incluso no Lovable AI)
- **Video**: Zero - renderizado no frontend com HTML/Canvas
- **Storage**: Apenas as imagens (~200KB cada) no bucket existente

## Etapas de Implementacao

### 1. Nova Edge Function: generate-video-images

Gera 4-6 ilustracoes infantis baseadas no tema e nome da crianca usando o modelo `google/gemini-2.5-flash-image`. Faz upload das imagens para o bucket `music-files` e salva os caminhos no banco.

### 2. Atualizar banco de dados

Adicionar coluna `video_images` (jsonb) na tabela `music_tasks` para armazenar os caminhos das imagens geradas.

### 3. Atualizar kie-callback

Apos a musica ser gerada com sucesso, chamar a funcao `generate-video-images` para gerar as ilustracoes automaticamente.

### 4. Componente LyricVideoPlayer

Componente React que:
- Reproduz o audio
- Exibe imagens de fundo com transicao suave (fade) a cada ~15 segundos
- Mostra a letra linha por linha com animacao de entrada
- Calcula a posicao da letra baseada no tempo do audio (divisao uniforme)
- Controles de play/pause integrados ao visual

### 5. Integrar na pagina de conclusao (Payment.tsx)

Apos a musica estar pronta, exibir o lyric video player alem do player de audio simples.

### 6. Integrar na pagina Minhas Musicas (MyMusic.tsx)

Exibir o lyric video player tambem quando o usuario recupera suas musicas.

## Detalhes Tecnicos

### Edge Function generate-video-images

- Recebe: `taskId`, `childName`, `theme`
- Usa Lovable AI (`google/gemini-2.5-flash-image`) para gerar 4-6 imagens com prompts tipo:
  - "Cute colorful children's illustration of [childName] playing with [theme elements], whimsical cartoon style, soft pastel colors, no text"
- Converte base64 para arquivo e faz upload para `music-files/images/{taskId}_1.png`, etc.
- Gera signed URLs para cada imagem (30 dias)
- Salva array de URLs no campo `video_images` da task

### Coluna nova em music_tasks

```text
video_images: jsonb (nullable, default null)
-- Armazena array de URLs das imagens: ["url1", "url2", ...]
```

### Componente LyricVideoPlayer

- Props: `audioUrl`, `lyrics`, `images`, `childName`
- Usa elemento `<audio>` oculto com `timeupdate` para sincronizar
- Divide a letra em linhas e distribui uniformemente pelo tempo total do audio
- Imagens de fundo trocam com fade transition CSS
- Letra aparece com animacao de opacidade + translateY
- Overlay semi-transparente escuro para garantir legibilidade da letra
- Botao play/pause centralizado com visual atraente
- Responsivo (funciona em mobile)

### Fluxo no kie-callback (atualizado)

Apos salvar o audio com sucesso:
1. Chama internamente a funcao `generate-video-images` passando taskId, childName, theme
2. Isso acontece em paralelo (nao bloqueia o retorno do callback)
3. O frontend faz polling e detecta quando `video_images` esta populado

### Atualizacao do check-task

Retornar tambem o campo `video_images` e `lyrics` para o frontend poder montar o player.

## Arquivos a Criar/Alterar

1. **Migracao SQL** - Adicionar coluna `video_images` (jsonb)
2. **supabase/functions/generate-video-images/index.ts** - Nova funcao para gerar imagens
3. **supabase/functions/kie-callback/index.ts** - Chamar geracao de imagens apos audio pronto
4. **supabase/functions/check-task/index.ts** - Retornar `video_images`
5. **src/components/LyricVideoPlayer.tsx** - Novo componente de lyric video
6. **src/pages/Payment.tsx** - Integrar o player na tela de conclusao
7. **src/pages/MyMusic.tsx** - Integrar o player na tela de recuperacao
8. **supabase/config.toml** - Registrar nova funcao

