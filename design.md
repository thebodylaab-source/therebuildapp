# O Recomeço — Design System

## Conceito Visual
Estética "painel de carro desportivo / relógio de mergulho". Layout editorial minimalista com dark mode profundo.
Inspiração: tipografia display bold à esquerda, blocos de imagem monocromáticos grandes, muito espaço negativo.

## Paleta de Cores
```
--color-bg:        #0F0F10   /* fundo principal — quase preto */
--color-surface:   #1A1A1C   /* cards, superfícies */
--color-surface2:  #252528   /* superfícies elevadas */
--color-border:    #2E2E32   /* borders subtis */
--color-accent:    #C17F3E   /* âmbar/cobre — acento único */
--color-accent-dim:#8A5A2A   /* acento escurecido */
--color-text:      #F0EDE8   /* texto principal — creme quente */
--color-text-2:    #9A9A9A   /* texto secundário */
--color-text-3:    #5A5A5A   /* texto terciário */
--color-danger:    #E05252   /* dor/stop */
--color-success:   #4CAF82   /* conquista/ok */
```

## Tipografia
- **Display/Headlines:** Barlow Condensed — bold, condensed, impacto masculino maduro
- **Body/UI:** Inter — legibilidade, neutralidade
- **Escala:**
  - display: 56–72px, weight 700–800
  - h1: 36–48px, weight 700
  - h2: 24–32px, weight 600
  - h3: 18–20px, weight 600
  - body: 15–16px, weight 400
  - caption: 12–13px, weight 400

## Espaçamento
- Grid: 8px base
- Padding containers: 24px mobile, 48px desktop
- Gap cards: 16–24px
- Radius: 12px cards, 8px buttons, 4px badges

## Componentes Chave
- **CTA Principal:** fundo âmbar/cobre, texto preto, border-radius 8px, uppercase Barlow Condensed
- **Cards:** fundo surface #1A1A1C, border #2E2E32, radius 12px, sem sombra pesada
- **Nav:** bottom navigation com 4 tabs — ícone + label, acento ativo em âmbar
- **Progress bars:** âmbar sobre fundo escuro, sem percentagem excessiva
- **Check-in buttons:** pills grandes, estado inativo cinza, ativo âmbar

## UX Patterns
- Um ecrã = UMA ação principal óbvia e grande
- Botão principal sempre visível (fixed bottom ou muito proeminente)
- Zero clutter — remover tudo o que não seja necessário naquele momento
- Transições suaves mas rápidas (150–250ms)
- Sem medalhas infantis, sem rankings, sem streaks agressivas
- Linguagem: curta, direta, madura — "Melhor do que ontem."

## Animações
- Page load: staggered fade-up (opacity 0→1, y 16→0, 200ms stagger)
- Botão CTA: scale 1→0.97 no press
- Progress: fill animado com ease-out
- Sem animações desnecessárias
