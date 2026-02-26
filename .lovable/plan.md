

## Dashboard Admin - Versao Completa

### O que vai mudar

**1. Edge Function `admin-dashboard`** -- Incluir mais campos na query:
- `lyrics` (letra da musica)
- `audio_url` (URL do audio gerado)
- `download_url` (URL de download assinada)
- `access_code` (codigo de acesso do usuario)
- `download_expires_at` (expiracao do download)

A query `select` sera expandida para trazer todos esses campos junto com os que ja existem.

**2. Frontend `AdminDashboard.tsx`** -- Melhorias significativas:

- **Modal de detalhes do pedido**: Ao clicar em uma linha da tabela, abre um Dialog com todas as informacoes:
  - Nome da crianca, tema, estilo musical, faixa etaria
  - Email do cliente
  - Status de pagamento e status da musica
  - Letra completa (se existir)
  - Player de audio inline (se a musica foi gerada)
  - Botao para abrir/baixar o MP3
  - Codigo de acesso e data de expiracao do download

- **Coluna de estilo musical** na tabela (visivel em desktop)
- **Indicador visual** na tabela quando a musica tem audio disponivel (icone de play)
- **Busca por nome/email** com campo de texto para filtrar pedidos
- **Contador de resultados** mostrando quantos pedidos estao sendo exibidos
- **Exportar CSV** dos pedidos filtrados

### Arquivos modificados

| Arquivo | Mudanca |
|---------|---------|
| `supabase/functions/admin-dashboard/index.ts` | Expandir select para incluir lyrics, audio_url, download_url, access_code, download_expires_at |
| `src/pages/AdminDashboard.tsx` | Modal de detalhes, busca, coluna estilo, player de audio, exportar CSV |

### Detalhes tecnicos

- O modal usara o componente `Dialog` do shadcn/ui ja disponivel
- O player de audio usara a tag `<audio>` nativa do HTML com `controls`
- A busca filtra localmente os dados ja carregados (sem nova requisicao)
- O export CSV gera o arquivo no navegador e faz download automatico
- Interface `Order` sera expandida com os novos campos (lyrics, audio_url, download_url, access_code, download_expires_at)

