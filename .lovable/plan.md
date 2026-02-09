

# Pipeline de Geracao de Musica Personalizada

## Resumo

Implementar o pipeline completo de geracao de conteudo usando 3 edge functions + atualizacao do frontend. O pipeline gera letra com IA, converte em voz cantada com ElevenLabs TTS, e gera musica instrumental com ElevenLabs Music API.

## Arquitetura do Pipeline

O fluxo sera sequencial, orquestrado pelo frontend:

```text
Formulario (/criar)
      |
      v
[1] generate-lyrics (Lovable AI)
      |  retorna: texto da letra
      v
[2] generate-tts (ElevenLabs TTS)
      |  retorna: audio MP3 da voz cantando
      v
[3] generate-music (ElevenLabs Music)
      |  retorna: audio MP3 instrumental
      v
Preview (/preview) - exibe letra + players de audio
```

## Etapas de Implementacao

### 1. Edge Function: generate-lyrics

- Usa Lovable AI (LOVABLE_API_KEY, ja configurada)
- Recebe: childName, ageGroup, theme, specialMessage
- Prompt do sistema instruindo a IA a criar uma letra infantil em portugues, personalizada com o nome da crianca, tema escolhido e faixa etaria
- Retorna: JSON com a letra completa
- Sem streaming (resposta curta)

### 2. Edge Function: generate-tts

- Usa ElevenLabs TTS API (ELEVENLABS_API_KEY, ja configurada)
- Recebe: texto da letra gerada
- Converte a letra em audio falado/cantado usando voz adequada (ex: voz feminina suave)
- Retorna: audio MP3 binario
- Modelo: eleven_multilingual_v2 (suporta portugues)

### 3. Edge Function: generate-music

- Usa ElevenLabs Music API (ELEVENLABS_API_KEY, mesma chave)
- Recebe: prompt descrevendo o estilo musical baseado no tema (ex: "musica infantil alegre com tema de animais, ritmo suave para criancas de 3-4 anos")
- Retorna: audio MP3 binario da musica instrumental
- Duracao: ~30 segundos

### 4. Atualizar CreateMusic.tsx

- Substituir o setTimeout simulado por chamadas reais as 3 edge functions em sequencia
- Mostrar progresso real em cada etapa (gerando letra... gerando voz... gerando musica...)
- Armazenar resultados (letra como texto, audios como blob URLs) para passar ao Preview
- Tratamento de erros com toasts informativos para o usuario

### 5. Atualizar Preview.tsx

- Exibir a letra real gerada pela IA (nao mais a simulada)
- Player de audio funcional para o TTS (voz)
- Player de audio funcional para a musica instrumental
- Manter o botao de compra e a estrutura visual existente
- Remover a funcao generateLyrics local simulada

### 6. Configurar config.toml

- Adicionar as 3 edge functions com verify_jwt = false (validacao no codigo)

## Detalhes Tecnicos

### Armazenamento Temporario

Os resultados serao armazenados em memoria (state + context ou localStorage com blob URLs) para a sessao do usuario. Nao ha necessidade de banco de dados neste MVP.

### Tratamento de Erros

- Erros 429 (rate limit) e 402 (creditos) serao capturados e exibidos ao usuario
- Falha em qualquer etapa interrompe o pipeline e mostra mensagem clara
- Botao de "tentar novamente" em caso de erro

### Chaves de API Necessarias

- LOVABLE_API_KEY: ja configurada (automatica)
- ELEVENLABS_API_KEY: ja configurada (via connector)
- Nenhuma chave adicional necessaria

### Sobre Video

O video nao sera implementado nesta fase. A entrega sera: letra em texto + audio da voz + musica instrumental. O video pode ser adicionado futuramente com um servico como Neural Frames.

