# Matriz de ownership visual — CSS histórico → owners atuais

> Branch: `refactor/domain-owners`  
> Baseline funcional: **P75 / v1.4.75**  
> Regra de segurança: consolidação visual não pode alterar posição efetiva da cascata antes do gate de comparação/aceite.

## Estratégia de migração

O CSS histórico foi publicado em camadas PXX sucessivas. Remover ou antecipar uma regra pode mudar especificidade/ordem mesmo quando o texto da regra é idêntico. Por isso a migração ocorre em duas fases:

1. **ownership funcional:** regra vigente sai do arquivo PXX e passa para uma folha canônica nomeada pelo resultado/domínio;
2. **preservação de cascata:** o PXX fica temporariamente como shim `@import` na mesma posição histórica do `index.html`.

Uma regra comprovadamente substituída pela trajetória atual é marcada `SUPERSEDED` e **não** ganha owner novo. Somente no fechamento visual os shims podem ser removidos do `index` e os owners canônicos reordenados de forma explícita, com comparação desktop/mobile.

## Ondas já migradas

| Trajetória | Resultado visual vigente | Owner canônico | PXX após migração | Estado |
|---|---|---|---|---|
| P45 | geometria-base dos controles superiores | `public/css/topControlsBaseCurrent.css` | shim `@import` | `CURRENT` |
| P46 | navegação superior em 40px + posição do painel de Missões | `public/css/topNavigationCurrent.css` | shim `@import` | `CURRENT` |
| P47 | alinhamento pixel-perfect / containing block das transições | `public/css/topControlsPixelCurrent.css` | shim `@import` | `CURRENT` |
| P49 | composição-base da identidade + slot de saldo sem layout shift | `accountIdentityBaseCurrent.css` + `walletLoadingCurrent.css` | shim com 2 imports | `CURRENT` |
| P50 | fluxo/hero intermediário da Home + indicador de amigos | `homeHeroFlowCurrent.css` + `friendsIndicatorCurrent.css` | shim com 2 imports | `CURRENT` |
| P51 | alinhamento final da identidade + resumo compacto da Central | `accountIdentityAlignmentCurrent.css` + `notificationsSummaryCurrent.css` | shim com 2 imports | `CURRENT` |
| P52 | cabeçalho/hero final intermediário + aparência residual da pill de Moedas | `homeHeaderLayoutCurrent.css` + `missionsCoinVisualCurrent.css` | shim com 2 imports | `CURRENT` |
| P53 | hero compacto, presença pendente, grid de Missões, Reciclagem e estabilidade de thumbnails | `homeHeroCompactCurrent.css`, `friendsPresencePendingCurrent.css`, `missionsTwoColumnCurrent.css`, `recyclingCardIdentityCurrent.css`, `profileFrameGridStaticCurrent.css` | shim com 5 imports | `CURRENT` |
| P59 | cards compactos/quadrados + base visual da lacuna contínua | `public/css/cardCompactCurrent.css` | shim `@import` | `CURRENT` |
| P60 | refinamento tipográfico da lacuna + simetria das pills Moedas/XP | `public/css/cardTypographyMissionsCurrent.css` | shim `@import` | `CURRENT` |
| P62 | atalho interativo/acessível da carteira para o Extrato | `public/css/accountLedgerCurrent.css` | shim `@import` | `CURRENT` |
| P66 | inputs 16px em iOS/touch + painel Admin estável com teclado virtual | `public/css/mobileFormsCurrent.css` | shim `@import` | `CURRENT` |
| P68 | raridade composta, Super Trunfo, histórico/origem e reduced-motion | `public/css/cardRarityCurrent.css` | shim `@import` | `CURRENT` |
| P73 + P74 | faixa principal da conta, ícones Perfil/Sair, carteira e comportamento mobile | `public/css/accountCurrent.css` | P73 = `HISTORICAL`; P74 = shim | `CURRENT` |

## Regras históricas descartadas por trajetória

| Origem | Regra antiga | Motivo | Owner atual |
|---|---|---|---|
| P50 | `.p48-create-card-entry` | botão atual é emitido como P54/P56/P57 por `cardsLibrary` | `cardsLibrary` + CSS P54/P56/P57 ainda a consolidar |
| P51 | `.p51-mission-coin-pill` | markup atual usa `p52-mission-coin-pill` | `missionsUI` + owners P52/P53/P60 |
| P52 | `order` em `.profile-actions` | competia com a ordem canônica e colocava Histórico antes de Notificações | `navigationUI` é o único owner da ordem |
| P52 | `display:block`/container antigo de recompensas | supersedido pelo grid P53 e refinamentos P60 | `missionsTwoColumnCurrent.css` + `cardTypographyMissionsCurrent.css` |
| P52 | `.p48-create-card-entry` | markup atual não usa a classe | `cardsLibrary` |
| P53 | `.p53-create-card-entry,.p48-create-card-entry` | markup atual usa P54/P56/P57 | `cardsLibrary` |

## Invariantes importantes

### P45 → P47 — controles superiores

- P45 continua representando a geometria-base de 44px.
- P46 permanece posterior e altera o resultado para 40px, incluindo `button.back-button` e `mission-card`.
- P47 permanece por último e remove `transform/translate` residuais, inclusive nas transições de `#app`.
- a trajetória 44px → 40px → pixel-perfect não foi achatada artificialmente.

### P49 → P53 — Home/conta/social/missões

- P49 mantém identidade-base e slot da carteira; P51 alinha `@usuário`/título à esquerda.
- P50 é o estágio de hero de fluxo natural; P52 reposiciona o subtítulo no cabeçalho; P53 compacta apenas a altura final do logo.
- `navigationUI` é o único owner da ordem dos botões; CSS P52 não contém mais `order` concorrente.
- presença pendente continua ligada à classe realmente emitida por `socialUI`: `p48-friends-online-pill p53-presence-pending`.
- Missões usam `p52-mission-coin-pill` no markup, grid P53 e geometria final P60.
- Reciclagem preta/branca permanece ligada às classes realmente emitidas por `marketplaceUI`.
- regras de criação P48/P53 não foram recanonizadas porque o markup atual usa P54/P56/P57.

### Wallet/Extrato P62

- cursor, hover e `focus-visible` do saldo clicável vivem em `accountLedgerCurrent.css`.
- acessibilidade por teclado permanece no owner JS `marketplaceUI`.
- P63/P64/P65 não possuem stylesheet próprio.

### Cards P59/P60/P68

- P59 permanece a base do desenho contínuo da lacuna e cards 1:1.
- P60 refina depois altura/posição/espessura da lacuna e equaliza pills.
- P68 mantém custom properties de raridade e `prefers-reduced-motion`.

### Account strip P73/P74

- `account.css` permanece na camada-base original.
- P73 não possui regra funcional.
- P74 importa `accountCurrent.css` exatamente na posição da correção final.
- wallet continua `order:30` e ações `order:40`.

## Próximos agrupamentos

1. **P54/P56/P57/P58 — biblioteca, detalhe e criação de cartas:** maior bloco visual recente ainda executável; precisa separar regras vigentes de P55/P56/P57/P58 que se substituem.
2. **Gênese — P26/P29/P30/P31/P32/P54/P57/P58:** transforms/animações e reduced-motion; exige comparação visual.
3. **Marketplace/reciclagem — P41/P44/P55/P58:** P53 já está owned, mas detalhe/preview e metadados posteriores ainda não.
4. **P14–P44 — fundação/design system e revisões antigas:** somente após os resultados recentes, evitando criar uma nova folha monolítica.

## Critério de conclusão de um PXX CSS

Um pacote visual deixa de possuir ownership quando:

- cada regra funcional vigente foi movida para owner canônico;
- toda regra substituída foi classificada `SUPERSEDED`, em vez de copiada;
- o PXX contém no máximo comentário + `@import`, ou marcador histórico;
- contratos apontam para owners atuais;
- a posição da cascata permanece equivalente enquanto houver shim;
- mudança posterior de posição é validada visualmente.

## Evidência atual

- `tests/p45TopControlsAlignment.contract.test.js`
- `tests/p46TopNavigation.contract.test.js`
- `tests/p47TopControlsPixelAlign.contract.test.js`
- `tests/p49AccountIdentityBalance.contract.test.js`
- `tests/p50HomeStability.contract.test.js`
- `tests/p51AccountNotifications.contract.test.js`
- `tests/p52RegressionStability.contract.test.js`
- `tests/p53MobilePolishMissionsProfile.contract.test.js`
- `tests/p59SquareCardsContinuousGap.contract.test.js`
- `tests/p60CardIdentityGapMission.contract.test.js`
- `tests/p62SingleLedger.contract.test.js`
- `tests/p66CardProgressionMobileInput.contract.test.js`
- `tests/p68CardHistoryRarity.contract.test.js`
- `tests/cssAccountOwnership.contract.test.js`
- `tests/p73AccountStripRender.contract.test.js`
- `tests/p74WalletPlacement.contract.test.js`

## Estado do Gate 16

A consolidação CSS está **em andamento**. O bloco recente P45–P53 e as ondas P59/P60/P62/P66/P68/P73/P74 já perderam ownership funcional para folhas canônicas ou tiveram regras mortas explicitamente descartadas. O maior débito visual restante está em P54–P58 e na fundação P14–P44. O gate só será 100% quando todas as regras vigentes tiverem owner e o carregamento final for validado sem shims históricos.
