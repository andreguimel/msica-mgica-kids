

## Mudanca no CTA do Hero para gerar mais curiosidade

### O que muda

**Arquivo:** `src/components/landing/Hero.tsx`

1. **Texto do botao**: Trocar "Criar a musica magica agora!" por "Crie a letra da musica gratis agora!"
2. **Remover o preco ao lado**: Eliminar o bloco "Por apenas R$ 9,90" que fica ao lado do botao

### Logica

O usuario ve "gratis" e "criar a letra", sente curiosidade, clica, e so descobre o preco depois de ja estar envolvido no fluxo de criacao. Isso reduz a barreira inicial de clique.

### Detalhe tecnico

- No `Hero.tsx`, alterar o texto dentro do `<MagicButton>` 
- Remover o `<div>` com "Por apenas" e "R$ 9,90" que fica ao lado do botao
- Manter o layout `flex` mas sem o bloco de preco

