

## Mockup Animado Infantil no Hero - Passo a Passo Magico

### Conceito

Em vez de simular um app/celular, o lado direito do Hero sera um **"quadro magico" ilustrado** com visual de livro infantil / cartao encantado. Cada etapa sera representada com emojis grandes, cores vibrantes, animacoes divertidas (bounce, wiggle, sparkle) e linguagem ludica. O player real continua integrado na ultima etapa.

### As 4 Etapas (ciclo automatico)

**Etapa 1 - "Qual o nome da crianca?" (~3.5s)**
- Fundo suave com estrelinhas
- Emoji grande de bebe/crianca no topo
- Um "balao magico" onde o nome "Pedro" aparece letra por letra com efeito bouncy (cada letra pula ao surgir)
- Confetes coloridos surgem ao completar o nome
- Texto fofo: "Escrevendo o nome magico... ✨"

**Etapa 2 - "Escolhendo o tema!" (~3.5s)**
- Tres opcoes com emojis gigantes pulando: 🐾 Animais, 👑 Princesas, 🚀 Espaco
- Um deles recebe um "brilho" dourado e aumenta de tamanho como se fosse escolhido
- Texto fofo: "Hmm... esse tema e perfeito! 🎯"

**Etapa 3 - "A magia esta acontecendo!" (~3.5s)**
- Emojis de notas musicais, varinhas, estrelas girando em circulo
- Uma barra de progresso colorida (gradiente arco-iris) preenchendo com animacao
- Texto pulsando: "Criando sua musica magica... 🪄✨"
- Pequenas notas musicais "saem" da barra ao preencher

**Etapa 4 - "Prontinho! Olha que lindo!" (~8s+)**
- Emojis de crianca dancando, confetes, coracao
- Transicao suave para o **player funcional real** com as demos
- O player mantem toda a logica atual (play/pause/skip, ondas sonoras, troca de musica)
- Texto: "A musica ficou pronta! Aperte o play! 🎵"

### Visual do "quadro"

- Nao e um mockup de celular - e um card grande arredondado com borda colorida pontilhada ou tracejada (estilo infantil)
- Fundo com gradiente suave pastel que muda levemente a cada etapa
- Indicador de etapas no topo: 4 bolinhas coloridas (tipo dots de carousel) com a ativa pulsando
- Cantos decorados com emojis fixos (estrela, arco-iris, nota musical)

### Comportamento

- Ciclo automatico: etapas 1-3 rodam em loop, etapa 4 fica mais tempo
- Se o usuario clicar play no player (etapa 4), o ciclo pausa e permanece na etapa 4
- Quando o audio para, o ciclo recomeça apos 3 segundos
- Transicoes entre etapas: fade + scale suave (nada brusco)

### Arquivo modificado

| Arquivo | Mudanca |
|---------|---------|
| `src/components/landing/Hero.tsx` | Substituir a area do mockup (lado direito) pelo quadro animado de 4 etapas com player integrado na etapa final. Toda a logica de audio (audioRef, togglePlay, changeSong, progress, etc) permanece. |

### Detalhes tecnicos

- Estado `mockupStep` (0-3) com `setInterval` controlando a troca
- Duracao por etapa: steps 0-2 = 3500ms, step 3 = 8000ms
- Efeito typewriter no step 0: `useState` com `setInterval` de 180ms por caractere, cada letra entra com `motion.span` e animacao bounce
- Step 1 (tema): `motion.div` com `whileInView` scale + glow no item selecionado
- Step 2 (gerando): `motion.div` width animando de 0% a 100% com gradiente arco-iris
- Step 3: reutiliza o player existente (imagem heroImage, controles play/pause/skip, ondas sonoras, dots de musica)
- `AnimatePresence mode="wait"` para transicoes entre etapas
- Quando `isPlaying === true`, limpa o interval e fixa no step 3
- A imagem `heroImage` permanece como capa do player na etapa final
- Decoracoes flutuantes (balao, arco-iris) permanecem ao redor do quadro

