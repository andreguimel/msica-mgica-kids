

## Remover selecao de plano da pagina Criar e manter apenas na Preview

### O que muda

**Arquivo: `src/pages/CreateMusic.tsx`**

1. Remover o bloco "Escolha seu plano" (linhas 527-575) da sidebar direita
2. Remover o estado `selectedPlanChoice` e sua logica associada (linha 90-92)
3. No `handleSubmit`, definir o plano padrao como "single" ao salvar no localStorage (em vez de usar `selectedPlanChoice`)
4. Remover a logica de limpeza de package state que depende de `selectedPlanChoice` (linhas 151-154) -- manter apenas a limpeza padrao

**Arquivo: `src/pages/Preview.tsx`**

Nenhuma mudanca necessaria -- a Preview ja tem a selecao de plano implementada (linhas 211-257). O usuario escolhera o plano la, depois de ver a letra gerada.

### Resultado

- A pagina `/criar` fica mais limpa e focada apenas na criacao (nome, idade, tema, letra)
- O usuario so ve opcoes de preco na pagina `/preview`, apos ja estar envolvido com a letra personalizada
- Isso segue a mesma estrategia do CTA do Hero: reduzir barreiras iniciais

### Detalhe tecnico

- O `selectedPlan` no localStorage sera setado como "single" por padrao ao submeter o formulario
- Na Preview, o usuario pode mudar para "pacote" antes de ir ao pagamento
- O fluxo de package follow-up (quando ja pagou pacote) continua funcionando normalmente
