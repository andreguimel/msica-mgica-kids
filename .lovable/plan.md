

# Video com Ilustracoes IA (sem letra)

## O que muda

Hoje o sistema ja gera 4 ilustracoes por IA e monta um "lyric video" com a letra aparecendo por cima. A mudanca e simplificar: o video sera um slideshow das ilustracoes com a musica tocando, sem texto nenhum por cima.

## Alteracoes

### 1. Simplificar o exportador de video (`src/utils/videoExport.ts`)

Remover toda a logica de renderizacao de letra (linhas de texto, prev/next line, badge com nome). O video ficara apenas:
- Imagens de fundo trocando com transicao suave (fade) a cada X segundos
- Audio da musica tocando
- Sem overlay de texto, sem badge, sem letra

A funcao `drawFrame` sera simplificada para desenhar apenas a imagem de fundo cobrindo o canvas inteiro, sem gradientes escuros pesados (apenas um leve vinheta para dar profissionalismo).

### 2. Simplificar o componente de downloads (`src/components/SongDownloads.tsx`)

- Botao unico "Baixar Video" que inicia a geracao e faz download automatico ao terminar
- Manter a barra de progresso durante a geracao
- Adicionar toast de sucesso/erro

### 3. Remover o LyricVideoPlayer como player principal

O componente `LyricVideoPlayer.tsx` atualmente exibe o video com letra sincronizada. Como a letra nao sera mais exibida no video, esse componente sera simplificado ou substituido por um player de audio + galeria de imagens na tela de conclusao.

### 4. Ajustar a pagina de pagamento (`src/pages/Payment.tsx`)

Na tela de conclusao (musica pronta), mostrar:
- Player de audio (ja existe)
- Galeria das ilustracoes geradas
- Botoes de download: MP3, Letra (.txt), Ilustracoes, Video (slideshow)

---

## Detalhes Tecnicos

### videoExport.ts - Nova versao simplificada

A funcao `exportVideo` mantera a mesma estrutura (Canvas + MediaRecorder + Audio), mas `drawFrame` fara apenas:
1. Desenhar a imagem de fundo com "cover fit"
2. Aplicar um leve gradiente nas bordas (vinheta suave)
3. Sem texto algum

A transicao entre imagens sera feita com um fade: nos ultimos 30 frames antes da troca, a opacidade da proxima imagem aumenta gradualmente.

Props simplificadas - o parametro `lyrics` sera removido da interface `VideoExportOptions`.

### SongDownloads.tsx - Interface simplificada

- Remover `VIDEO_SIZES` e a tela de selecao de tamanho
- Botao "Baixar Video" que gera direto em 1080x1920 (9:16)
- Durante a geracao: barra de progresso + texto "Gerando video... X%"
- Ao terminar: download automatico + toast de sucesso
- Se falhar: toast de erro

### LyricVideoPlayer.tsx

Sera simplificado para um player de audio com visualizacao das ilustracoes em carrossel/slideshow. Sem sincronizacao de letra.

### Arquivos afetados

1. `src/utils/videoExport.ts` - Simplificar drawFrame, remover logica de letra
2. `src/components/SongDownloads.tsx` - Simplificar interface, botao direto de video
3. `src/components/LyricVideoPlayer.tsx` - Simplificar para player de audio + galeria
4. `src/pages/Payment.tsx` - Ajustar integracao com novo player simplificado

