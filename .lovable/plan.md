

## Adicionar frase chamativa na coluna direita da Preview

### O que muda

**Arquivo:** `src/pages/Preview.tsx`

Adicionar um bloco chamativo no topo da coluna direita (antes de "Ao comprar voce recebe:") com uma frase que incentive o usuario a transformar a letra em musica com melodia e voz.

### Frase proposta

Um card com destaque visual contendo algo como:

> "Agora imagine essa letra ganhando vida com melodia, voz e ritmo! Transforme em uma musica de verdade para {nome da crianca}!"

### Detalhe tecnico

- Inserir um novo `div` com estilo chamativo (gradiente, icone de nota musical) logo antes do bloco "Ao comprar voce recebe:" dentro da `motion.div` da coluna direita (linha ~191)
- Usar o nome da crianca (`formData.childName`) para personalizar a frase
- Estilo: card com fundo gradiente suave, emoji ou icone de som/musica, texto em destaque com `font-baloo`

