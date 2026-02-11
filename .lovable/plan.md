
## Compartilhar Música pelo WhatsApp

### O que muda
Adicionar um botao "Enviar pelo WhatsApp" nas telas onde o usuario tem acesso a musica gerada: a pagina **Minhas Musicas** e o componente **SongDownloads**.

### Como funciona

**No celular (Android/iOS):**
- Usa a **Web Share API** nativa do navegador
- Permite compartilhar o arquivo MP3 diretamente como anexo no WhatsApp
- O destinatario recebe o audio pronto para ouvir, sem precisar clicar em links

**No PC (desktop):**
- Abre o WhatsApp Web via `https://wa.me/?text=...`
- Envia uma mensagem com o link de download da musica
- Mensagem personalizada: "Olha a musica que criei para [nome]! Ouca aqui: [link]"

### Detalhes tecnicos

**Arquivo modificado: `src/components/SongDownloads.tsx`**
- Adicionar botao verde "Enviar pelo WhatsApp" com icone do WhatsApp (via lucide `MessageCircle` estilizado em verde)
- Detectar se o navegador suporta `navigator.share` com `navigator.canShare` para decidir a abordagem
- No celular: baixar o MP3 como blob, criar um `File` object e usar `navigator.share({ files: [file] })`
- No desktop (fallback): abrir `https://wa.me/?text=` com mensagem e link do audio codificados

**Fluxo do usuario:**
1. Usuario clica em "Enviar pelo WhatsApp"
2. **Se estiver no celular**: abre o seletor nativo do sistema -> escolhe WhatsApp -> envia o MP3 como audio
3. **Se estiver no PC**: abre uma nova aba do WhatsApp Web com a mensagem pre-preenchida contendo o link

### Layout do botao
O botao sera posicionado logo abaixo dos botoes de download existentes, com estilo verde (#25D366) para ser reconhecido como WhatsApp, usando bordas arredondadas consistentes com o design atual.
