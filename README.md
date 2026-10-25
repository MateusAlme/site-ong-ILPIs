# Movimento Longevo | Site institucional de ONG fictícia

Projeto da disciplina de Introdução à Computação (2026.2).

ONG fictícia que leva programas de exercício físico a idosos de Instituições de Longa Permanência (ILPIs). Página única feita só com HTML5 semântico e CSS3, sem JavaScript, responsiva com `@media` para celular, tablet e desktop, e com todas as mídias salvas localmente.

## Estrutura

```
site-ong/
├── index.html
├── css/style.css
├── fontes/          (Noto Serif Display e Lato)
└── imagens/         (logo, fotos dos projetos, da equipe e dos depoimentos)
```

## Interações feitas só com CSS

- Menu do celular e fotos ampliadas: seletor `:target`.
- Frase de impacto da doação: `:checked` e `:has()`.
- Depoimentos: rolagem lateral com `scroll-snap`.
- Erros do formulário: `:user-invalid`.
- Efeitos ao rolar a página: `animation-timeline`. Navegadores sem suporte mostram tudo parado e visível.

O formulário de contato abre o programa de e-mail (`mailto:`), porque o site não tem servidor.

## Como abrir

Abra o `index.html` no navegador. Não há dependências nem links externos.

## Créditos

- Fontes Noto Serif Display (Google) e Lato (Łukasz Dziedzic), ambas sob a SIL Open Font License 1.1.
- Logo e fotos geradas por IA para este trabalho.
