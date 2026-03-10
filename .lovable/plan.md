

## Painel do Afiliado com Senha — Plano

### Abordagem

Cada afiliado terá sua própria senha, definida por você no painel admin. O fluxo é:

1. Afiliado acessa `/parceiro`
2. Insere seu **código** e **senha**
3. Vê suas métricas de vendas

### Mudanças no Banco

Adicionar coluna `password_hash` na tabela `tracking_links` para armazenar a senha (hash SHA-256) de cada afiliado.

### Novas Edge Functions

**1. `affiliate-login`**
- Recebe `{ code, password }`
- Busca o tracking_link pelo `code`
- Verifica a senha (hash SHA-256)
- Retorna um token HMAC temporário (mesmo padrão do admin-login, mas com role `affiliate` e o `code` no payload)

**2. `affiliate-stats`**
- Valida o token do afiliado (Bearer)
- Extrai o `code` do payload do token
- Conta pedidos com `ref_code = code` na `music_tasks`
- Retorna métricas agregadas: total checkouts, pagos, conversão, receita, comissão devida/paga/saldo
- Nunca expõe dados pessoais de clientes

### Frontend

**1. Página `/parceiro` (AffiliateLogin)**
- Formulário simples: campo código + campo senha + botão entrar
- Design similar ao `/admin` (Card centralizado, ícone)
- Salva token no `sessionStorage`
- Redireciona para `/parceiro/dashboard`

**2. Página `/parceiro/dashboard` (AffiliateDashboard)**
- Cards com métricas: Checkouts, Vendas, Conversão, Receita, Comissão Devida, Paga, Saldo
- Botão de logout
- Redireciona para `/parceiro` se token inválido

**3. App.tsx**
- Duas novas rotas lazy: `/parceiro` e `/parceiro/dashboard`

### Painel Admin — Definir Senha do Afiliado

Atualizar o admin-dashboard (edge function + frontend) para permitir definir/alterar a senha de cada afiliado:
- Novo campo de senha ao criar tracking link
- Botão para redefinir senha em links existentes
- A edge function `admin-dashboard` recebe a senha em texto e grava o hash SHA-256

### Arquivos

| Arquivo | Ação |
|---|---|
| `tracking_links` (migração) | Adicionar coluna `password_hash text` |
| `supabase/functions/affiliate-login/index.ts` | Novo |
| `supabase/functions/affiliate-stats/index.ts` | Novo |
| `supabase/functions/admin-dashboard/index.ts` | Editar (suporte a senha) |
| `supabase/config.toml` | Adicionar 2 functions |
| `src/pages/AffiliateLogin.tsx` | Novo |
| `src/pages/AffiliateDashboard.tsx` | Novo |
| `src/pages/AdminDashboard.tsx` | Editar (campo senha no CRUD de links) |
| `src/App.tsx` | Adicionar rotas |

