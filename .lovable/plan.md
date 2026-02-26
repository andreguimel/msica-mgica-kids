
## Painel Administrativo com Funil de Vendas

### O que sera criado

Um painel administrativo completo, protegido por senha, acessivel em `/admin`, para visualizar todos os pedidos, checkouts abandonados e metricas de funil de vendas em tempo real.

### Como funciona a autenticacao

- Pagina de login simples com campo de senha
- A senha e validada no servidor contra o `ADMIN_SECRET` ja configurado
- O servidor retorna um token temporario (valido por 24h) que fica salvo no navegador
- Ao fechar o navegador, o acesso expira automaticamente

### O que o painel vai mostrar

**Cards de metricas no topo:**
- Total de pedidos criados
- Pagamentos confirmados (pagos)
- Checkouts abandonados (expirados/cancelados)
- Taxa de conversao (% de pagos vs total)
- Receita estimada

**Funil de vendas visual (grafico):**
```text
Checkout Iniciado  ████████████████████  100%
Pagamento Pendente ██████████████       70%
Pago               ████████             40%
Musica Gerada      ██████               30%
```

**Tabela de pedidos com filtros:**
- Filtrar por status: todos, pagos, pendentes, abandonados
- Filtrar por periodo: 7 dias, 30 dias, todos
- Colunas: crianca, tema, email, status pagamento, status musica, data
- Ordenacao por data (mais recente primeiro)

### Arquivos que serao criados/modificados

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `supabase/functions/admin-login/index.ts` | Criar | Valida senha e retorna token |
| `supabase/functions/admin-dashboard/index.ts` | Criar | Retorna dados dos pedidos (protegido por token) |
| `src/pages/AdminLogin.tsx` | Criar | Tela de login com campo de senha |
| `src/pages/AdminDashboard.tsx` | Criar | Painel com metricas, funil e tabela |
| `src/App.tsx` | Modificar | Adicionar rotas `/admin` e `/admin/dashboard` |

### Detalhes tecnicos

- Token gerado com HMAC-SHA256 usando o `ADMIN_SECRET` como chave
- Edge Function `admin-dashboard` consulta a tabela `music_tasks` e agrega os dados no servidor
- Frontend usa React Query para buscar dados com botao de refresh manual
- Graficos do funil usando `recharts` (ja instalado)
- Tabela usando componentes shadcn/ui (ja disponiveis)
- Nenhuma alteracao no banco de dados necessaria -- usa a tabela `music_tasks` existente
