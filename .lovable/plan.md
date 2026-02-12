

## Gerar Video para Redes Sociais (Imagem + Audio = MP4)

### Resumo

Adicionar um botao "Baixar Video" no componente `SongDownloads`, ao lado dos botoes de download existentes. O usuario escolhe o formato (quadrado ou stories) e o sistema gera um MP4 no navegador usando FFmpeg WASM.

### O que o usuario ve

1. Clica em "Baixar Video para Redes Sociais"
2. Escolhe o formato:
   - **Quadrado (1080x1080)** - Instagram Feed, Facebook
   - **Stories (1080x1920)** - Instagram Stories, TikTok, WhatsApp Status
3. Barra de progresso aparece (~10-30s)
4. Download automatico do MP4

### Detalhes tecnicos

**Nova dependencia:** `@ffmpeg/ffmpeg` + `@ffmpeg/util`

**Novo arquivo: `src/components/VideoGenerator.tsx`**
- Recebe `childName`, `audioUrl`, `theme`, `format` (square | stories)
- Gera imagem de capa via Canvas API offscreen:
  - Gradiente de fundo nas cores do tema
  - Nome da crianca centralizado
  - Emojis decorativos do tema
  - Logo "Musica Magica" discreto
- FFmpeg WASM combina imagem + audio em MP4 (H.264 + AAC)
- Mostra progresso e dispara download

**Temas visuais:**

```text
animais      -> amarelo/verde     + patas, coracoes
princesas    -> rosa/roxo         + coroas, estrelas
espaco       -> azul escuro/roxo  + estrelas, planetas
dinossauros  -> verde/marrom      + pegadas, folhas
futebol      -> verde/branco      + bolas, estrelas
fadas        -> lilas/rosa        + varinhas, borboletas
natureza     -> verde/azul        + flores, folhas
super-herois -> azul/vermelho     + raios, estrelas
```

**Modificacao: `src/components/SongDownloads.tsx`**
- Adicionar prop `theme?: string`
- Adicionar botao "Baixar Video para Redes Sociais" abaixo do botao de WhatsApp
- Ao clicar, abre um pequeno seletor de formato (quadrado/stories) e inicia a geracao

**Modificacao: `src/pages/MyMusic.tsx`**
- Passar `theme={song.theme}` para o componente `SongDownloads`

### Compatibilidade
- Chrome, Firefox, Edge: funciona
- Safari 16.4+: funciona
- Se o navegador nao suportar SharedArrayBuffer, o botao fica oculto

