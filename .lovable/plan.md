

# Reorganizar Fluxo: Pagamento Antes da Geracao Musical

## Problema Atual

O fluxo atual gera a musica no Kie.ai (que consome creditos pagos) **antes** do usuario pagar. Isso significa que voce gasta creditos mesmo que o usuario nunca finalize a compra.

## Novo Fluxo Proposto

```text
Fluxo atual (problematico):
  Formulario -> Gera musica (gasta credito) -> Preview -> Pagamento

Novo fluxo (correto):
  Formulario -> Gera apenas LETRA (gratis) -> Preview da letra -> Pagamento -> Gera musica (gasta credito)
```

## Como Funciona

1. **Formulario (/criar)**: Usuario preenche os dados normalmente
2. **Gerar letra**: Chama apenas o Lovable AI para gerar a letra (custo zero no Kie.ai)
3. **Preview (/preview)**: Mostra a letra gerada, sem audio. Usuario ve o que vai receber
4. **Pagamento (/pagamento)**: Usuario paga via Pix
5. **Gerar musica**: Somente APOS pagamento confirmado, chama o Kie.ai para gerar o audio
6. **Download**: Usuario recebe o audio completo

## Etapas de Implementacao

### 1. Nova Edge Function: generate-lyrics-only

Uma funcao simples que gera apenas a letra usando o Lovable AI (Gemini), sem chamar o Kie.ai. Reutiliza a logica de geracao de letras que ja existe em `generate-song`, mas sem o passo 2 (envio ao Kie.ai). Salva a letra no banco com status "awaiting_payment".

### 2. Atualizar tabela music_tasks

Adicionar o status "awaiting_payment" ao fluxo. O ciclo de vida passa a ser:
- `awaiting_payment` - letra gerada, aguardando pagamento
- `processing` - pagamento confirmado, musica sendo gerada no Kie.ai
- `completed` - musica pronta
- `failed` - erro na geracao

### 3. Nova Edge Function: start-music-after-payment

Funcao chamada apos confirmacao de pagamento que:
- Recebe o ID da task
- Verifica se o status e "awaiting_payment"
- Envia a letra ao Kie.ai
- Atualiza o status para "processing"

### 4. Atualizar Frontend

**CreateMusic.tsx:**
- Chama `generate-lyrics-only` (rapido, ~5 segundos)
- Redireciona para `/preview` com a letra

**Preview.tsx:**
- Mostra a letra sem player de audio
- Botao "Comprar musica" leva para `/pagamento`

**Payment.tsx:**
- Apos pagamento confirmado, chama `start-music-after-payment`
- Inicia polling e mostra progresso
- Quando pronto, mostra botao de download/player

**musicPipeline.ts:**
- Nova funcao `generateLyricsOnly`
- Nova funcao `startMusicAfterPayment`
- Manter `pollTaskStatus` e `checkTaskStatus`

### 5. Manter generate-song como backup

A funcao `generate-song` atual pode ser mantida para uso administrativo ou testes, mas o fluxo do usuario passa a usar as funcoes separadas.

## Beneficios

- **Zero desperdicio**: creditos do Kie.ai so sao usados apos pagamento confirmado
- **Preview rapido**: gerar so a letra leva ~5 segundos vs ~2 minutos da musica completa
- **Melhor conversao**: usuario ve a letra personalizada antes de pagar, criando desejo de compra
- **Experiencia de espera pos-pagamento**: usuario ja pagou, entao a espera de 2 minutos e mais aceitavel

## Detalhes Tecnicos

### Mudanca no banco de dados

Adicionar migracao para suportar o novo status. A coluna `status` ja e do tipo `text`, entao nao precisa de alteracao de schema -- basta usar o novo valor "awaiting_payment" no codigo.

### Seguranca

A funcao `start-music-after-payment` deve validar que:
- A task existe
- O status e "awaiting_payment" (evita reprocessamento)
- Idealmente, verificar se o pagamento foi confirmado (quando integracao Pix estiver pronta)

