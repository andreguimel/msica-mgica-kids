

# Armazenamento e Acesso aos Arquivos de Musica

## Problema Atual

- O audio gerado pelo Kie.ai retorna uma URL temporaria que pode expirar a qualquer momento
- Nao ha armazenamento proprio dos arquivos de audio
- Se o usuario fechar o navegador, perde o acesso a musica
- Nao existe nenhum mecanismo de re-acesso ou link de download

## Solucao Proposta

Armazenar os audios no storage do Lovable Cloud e gerar links de acesso com validade de 30 dias. O usuario recebe um "codigo de acesso" unico por email ou exibido na tela para recuperar suas musicas depois.

## Arquitetura

```text
Kie.ai gera audio --> Callback recebe URL --> Edge function baixa o arquivo
--> Salva no Storage (bucket "music-files") --> Gera signed URL (30 dias)
--> Salva signed URL + expiration no banco
```

## Etapas de Implementacao

### 1. Criar bucket de storage "music-files"

Criar um bucket privado para armazenar os arquivos de audio com politica RLS permitindo leitura via signed URLs.

### 2. Adicionar colunas na tabela music_tasks

- `download_url` (text) - URL assinada com validade de 30 dias
- `download_expires_at` (timestamptz) - data de expiracao do link
- `access_code` (text, unique) - codigo alfanumerico de 8 caracteres para o usuario recuperar suas musicas (ex: "MAGIC-A3K9")

### 3. Atualizar a edge function kie-callback

Quando o Kie.ai retornar o audio com sucesso:
1. Baixar o arquivo de audio da URL do Kie.ai
2. Salvar no bucket "music-files" com nome unico (ex: `{taskId}.mp3`)
3. Gerar uma signed URL com validade de 30 dias
4. Gerar um codigo de acesso unico
5. Salvar `download_url`, `download_expires_at` e `access_code` na task

### 4. Criar edge function "get-my-songs"

Recebe um `access_code` e retorna:
- Nome da crianca
- Player de audio (signed URL)
- Data de expiracao do link
- Se o link expirou, gera um novo signed URL (renovavel por ate 30 dias apos a criacao)

### 5. Criar pagina /minhas-musicas

Interface simples onde o usuario digita seu codigo de acesso e ve suas musicas:
- Campo para digitar o codigo (ex: "MAGIC-A3K9")
- Lista de musicas com player de audio e botao de download
- Indicacao de "expira em X dias"

### 6. Atualizar pagina de conclusao (Payment.tsx)

Apos a geracao completa, exibir:
- O codigo de acesso em destaque
- Instrucao: "Guarde este codigo! Use-o para acessar suas musicas em ate 30 dias"
- Link para a pagina /minhas-musicas

## Detalhes Tecnicos

### Bucket Storage (migracao SQL)

```text
- Bucket: music-files (privado)
- RLS: acesso somente via signed URLs
```

### Colunas novas em music_tasks

```text
- download_url: text (nullable)
- download_expires_at: timestamptz (nullable)
- access_code: text (nullable, unique)
```

### kie-callback (alteracoes)

- Usar fetch para baixar o audio da URL do Kie.ai
- Upload para o bucket via Supabase Storage SDK
- Gerar signed URL com `createSignedUrl("music-files", path, 2592000)` (30 dias em segundos)
- Gerar access_code aleatorio de 8 caracteres

### get-my-songs (nova edge function)

- Recebe `{ accessCode: string }`
- Busca tasks com esse access_code
- Se download_expires_at passou, gera novo signed URL (se ainda dentro de 30 dias da criacao)
- Retorna dados da musica

### Pagina /minhas-musicas

- Input estilizado para o codigo de acesso
- Busca via edge function get-my-songs
- Exibe player de audio + download + info de expiracao
- Design consistente com o resto do app

## Arquivos a Criar/Alterar

1. **Migracao SQL** - Bucket + colunas novas
2. **supabase/functions/kie-callback/index.ts** - Download + storage + signed URL + access code
3. **supabase/functions/get-my-songs/index.ts** - Nova funcao para recuperar musicas
4. **src/pages/MyMusic.tsx** - Nova pagina de acesso
5. **src/pages/Payment.tsx** - Exibir codigo de acesso apos conclusao
6. **src/App.tsx** - Rota /minhas-musicas
7. **supabase/config.toml** - Registrar nova funcao

