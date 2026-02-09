

# Migrar Pipeline para Kie.ai (Suno API)

## Resumo

Substituir o pipeline atual (Lovable AI para letra + ElevenLabs para voz + ElevenLabs para musica) por uma unica integracao com o Kie.ai, que usa a Suno AI para gerar musicas completas com letra cantada em uma unica chamada.

## Vantagem Principal

A Suno AI gera uma **musica completa** (instrumental + voz cantando a letra) de uma so vez. Isso elimina a necessidade de 3 APIs separadas e resolve o problema da musica instrumental que nao funcionava com o plano gratuito do ElevenLabs.

## Como o Kie.ai Funciona

O Kie.ai usa um modelo **assincrono com callbacks**:

```text
1. Frontend envia pedido ao backend
2. Backend envia request ao Kie.ai com uma callbackUrl
3. Kie.ai retorna um taskId imediatamente
4. Backend salva o taskId no banco de dados (status: "processing")
5. Kie.ai processa a musica (pode levar 30-120 segundos)
6. Kie.ai envia o resultado para a callbackUrl (outra edge function)
7. Callback edge function atualiza o banco com o audio_url
8. Frontend faz polling ate o status mudar para "completed"
```

## Etapas de Implementacao

### 1. Configurar a API Key do Kie.ai

- O usuario precisa criar uma conta em kie.ai e obter uma API key
- A chave sera armazenada como secret no projeto (KIE_API_KEY)

### 2. Criar tabela no banco de dados

Uma tabela `music_tasks` para rastrear o status das geracoes:

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid (PK) | ID interno |
| task_id | text | ID retornado pelo Kie.ai |
| child_name | text | Nome da crianca |
| theme | text | Tema escolhido |
| age_group | text | Faixa etaria |
| status | text | "processing", "completed", "failed" |
| lyrics | text | Letra gerada (se usar generate-lyrics separado) |
| audio_url | text | URL do audio quando pronto |
| created_at | timestamptz | Data de criacao |

### 3. Edge Function: generate-song (substituir generate-lyrics + generate-tts + generate-music)

Uma unica edge function que:
- Primeiro gera a letra usando o Lovable AI (manter o que ja funciona)
- Envia a letra ao Kie.ai como prompt com `customMode: true` para que a Suno cante exatamente aquela letra
- Salva o taskId na tabela `music_tasks`
- Retorna o taskId e a letra para o frontend

Parametros enviados ao Kie.ai:
- `prompt`: a letra gerada
- `customMode`: true
- `instrumental`: false (queremos voz cantando)
- `model`: "V4" ou "V5"
- `callBackUrl`: URL da edge function de callback
- `style`: estilo baseado no tema (ex: "children's music, cheerful, playful")
- `title`: nome da musica personalizada

### 4. Edge Function: kie-callback (receber resultado)

Edge function publica que:
- Recebe o POST do Kie.ai quando a musica fica pronta
- Extrai o `audio_url` do payload
- Atualiza a tabela `music_tasks` com o audio_url e status "completed"
- Em caso de erro, atualiza status para "failed"

### 5. Edge Function: check-task (polling do frontend)

Edge function simples que:
- Recebe um taskId
- Consulta a tabela `music_tasks`
- Retorna o status atual e audio_url se disponivel

### 6. Atualizar o Frontend

**CreateMusic.tsx:**
- Chama `generate-song` e recebe taskId + letra
- Mostra a letra imediatamente
- Inicia polling a cada 5 segundos no `check-task`
- Mostra progresso animado enquanto espera ("Gerando sua musica... isso pode levar ate 2 minutos")
- Quando status = "completed", redireciona para Preview com audio_url

**Preview.tsx:**
- Exibe a letra
- Player de audio unico (a musica ja vem com voz cantando)
- Remover separacao entre "voz" e "musica instrumental" - agora e uma musica so

**musicPipeline.ts:**
- Reescrever com 3 funcoes: `startSongGeneration`, `checkTaskStatus`, `generateLyrics` (manter)
- Remover `generateTTS` e `generateMusic` separados

### 7. Limpar edge functions antigas

- Remover `generate-tts` (ElevenLabs TTS nao sera mais necessario)
- Remover `generate-music` (ElevenLabs SFX nao sera mais necessario)
- Manter `generate-lyrics` ou integrar na nova `generate-song`
- Atualizar config.toml

## Detalhes Tecnicos

### Callback URL

A callbackUrl sera a URL publica da edge function de callback:
`https://hdoaljpejropkjhazqxp.supabase.co/functions/v1/kie-callback`

### Polling vs Realtime

Duas opcoes para o frontend saber quando a musica ficou pronta:
- **Polling** (mais simples): frontend consulta `check-task` a cada 5 segundos
- **Realtime** (mais elegante): usar Supabase Realtime na tabela `music_tasks` para receber update instantaneo

A recomendacao e comecar com polling por simplicidade.

### Tratamento de Erros

- Timeout: se apos 3 minutos o status nao mudar, mostrar erro
- Falha do Kie.ai: callback com erro atualiza status para "failed"
- Creditos insuficientes: capturar erro 402 do Kie.ai

### Chaves de API

- **KIE_API_KEY**: necessaria (nova) - usuario precisa criar conta no kie.ai
- **LOVABLE_API_KEY**: manter para geracao de letra
- **ELEVENLABS_API_KEY**: pode ser removida (nao sera mais usada)

### Custo Estimado

O Kie.ai cobra por geracao de musica. O preco varia conforme o modelo (V4, V5). O usuario deve consultar kie.ai/pricing para valores atualizados.

