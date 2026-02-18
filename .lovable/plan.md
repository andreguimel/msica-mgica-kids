
## Popup de Saída com Cupom de 10% de Desconto

Quando o usuário mover o mouse para fora da página (em direção à barra de fechar/voltar do navegador), abriremos um popup oferecendo um cupom de desconto para incentivar a compra.

### O que será criado

**1. Componente `ExitIntentPopup`** (`src/components/ui/ExitIntentPopup.tsx`)

- Detecta a intenção de saída via evento `mouseleave` no topo da janela (`clientY < 5`)
- Exibe apenas 1 vez por sessão (usando `sessionStorage`)
- Mostra o código do cupom `MAGICA10` com botão "Copiar"
- Botão "Quero meu desconto!" que redireciona para `/criar` já com o cupom aplicado
- Animação suave de entrada/saída com Framer Motion

**2. Integração no `Index.tsx`**

Adiciona o `<ExitIntentPopup />` na landing page.

**3. Aplicação do desconto no `Payment.tsx`**

- Lê o cupom salvo no `localStorage` (`exitCoupon`)
- Se válido (`MAGICA10`), exibe o preço com desconto:
  - Avulsa: R$ 9,90 → **R$ 8,91**
  - Pacote: R$ 24,90 → **R$ 22,41**
- Passa o preço com desconto para a função de cobrança

**4. Atualização do `musicPipeline.ts`**

Adiciona parâmetro `discountPercent` opcional na função `createBilling`.

**5. Atualização do `create-billing/index.ts`** (Edge Function)

Recebe `discountPercent` e aplica o desconto no `priceInCents` antes de criar o Pix.

### Detalhes técnicos

```text
Fluxo completo:

1. Usuário visita a landing page
2. Move o mouse para cima (tentando fechar)
3. Popup aparece com cupom MAGICA10
4. Usuário clica em "Quero meu desconto!"
5. localStorage.setItem("exitCoupon", "MAGICA10") + navigate("/criar")
6. Na tela de pagamento, cupom é lido e preço exibido com -10%
7. Na chamada create-billing, discountPercent=10 é enviado
8. Edge function calcula: price - (price * 10/100)
```

### Proteções

- O popup aparece apenas **1 vez por sessão** (sessionStorage)
- Só dispara se o usuário ainda não tiver clicado em "Criar minha música"
- Desconto validado no backend (não apenas no frontend)
- Cupom é limpo do localStorage após o pagamento ser iniciado
