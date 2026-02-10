

# Corrigir Timeout: Callback do Kie.ai Nao Atualiza as Tasks

## Problema Identificado

O banco de dados mostra **4 tasks travadas em "processing"** sem audio_url. O Kie.ai gera a musica com sucesso, mas o callback nao consegue atualizar a task correta no banco.

**Causa raiz:** A URL de callback enviada ao Kie.ai nao inclui o identificador da task. Quando o Kie.ai chama de volta, a funcao `kie-callback` nao sabe qual task atualizar. O codigo de fallback tenta encontrar uma unica task "processing", mas como ha varias, falha silenciosamente.

Alem disso, o polling no frontend tem um timeout de 5 minutos que pode ser insuficiente.

## Correcoes

### 1. Incluir taskId na URL de callback (start-music-after-payment)

Alterar a linha do `callBackUrl` para incluir o ID da task como query parameter:

```text
Antes:  ${SUPABASE_URL}/functions/v1/kie-callback
Depois: ${SUPABASE_URL}/functions/v1/kie-callback?taskId=${kieTaskId}
```

Porem, o `kieTaskId` so e conhecido apos a resposta do Kie.ai. Entao precisamos usar o **ID interno da task** (UUID do banco) na URL de callback, e ajustar o `kie-callback` para buscar por esse UUID.

A solucao correta:

```text
callBackUrl = ${SUPABASE_URL}/functions/v1/kie-callback?internalId=${taskId}
```

### 2. Atualizar kie-callback para usar internalId

Modificar a funcao `kie-callback` para:
- Ler o parametro `internalId` da query string
- Buscar a task pelo UUID interno (coluna `id`) ao inves do `task_id` do Kie.ai
- Isso garante matching correto mesmo com multiplas tasks em processamento

### 3. Aumentar timeout do polling

Alterar o timeout de 5 minutos (300000ms) para 10 minutos (600000ms) no `musicPipeline.ts`, ja que a geracao pode demorar mais.

### 4. Continuar polling no status awaiting_payment

O polling atual para quando o status nao e "processing". Adicionar "awaiting_payment" como status que tambem continua o polling, evitando condicao de corrida entre o inicio da geracao e a primeira checagem.

## Arquivos a Alterar

1. **supabase/functions/start-music-after-payment/index.ts** - Incluir `internalId` na callBackUrl
2. **supabase/functions/kie-callback/index.ts** - Priorizar busca por `internalId` (UUID) via query param
3. **src/services/musicPipeline.ts** - Aumentar timeout e continuar polling em "awaiting_payment"

## Detalhes Tecnicos

### start-music-after-payment

Alterar a construcao do callBackUrl para:
```
const callBackUrl = `${SUPABASE_URL}/functions/v1/kie-callback?internalId=${taskId}`;
```

O `taskId` aqui e o UUID interno da tabela `music_tasks` (coluna `id`), que ja e recebido no body da requisicao.

### kie-callback

Adicionar leitura do `internalId` da query string:
```
const internalId = url.searchParams.get("internalId");
```

Se `internalId` existir, usar `.eq("id", internalId)` para atualizar a task. Caso contrario, manter o fallback atual por `task_id`.

### musicPipeline.ts - pollTaskStatus

- Mudar timeoutMs default de 300000 para 600000 (10 min)
- Na condicao de re-polling, incluir `"awaiting_payment"` alem de `"processing"`

