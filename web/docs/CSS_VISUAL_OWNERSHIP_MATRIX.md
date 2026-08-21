# Matriz de ownership visual — CSS histórico → owners atuais

> Branch: `refactor/domain-owners`  
> Baseline funcional: **P75 / v1.4.75**  
> Regra de segurança: consolidação visual não pode alterar a posição efetiva da cascata antes do gate de comparação/aceite.

## Estratégia

1. regra vigente sai do PXX e vai para owner nomeado pelo resultado/domínio;
2. PXX pode permanecer temporariamente como shim `@import` na posição histórica;
3. regra comprovadamente substituída vira `SUPERSEDED` e **não** recebe owner novo;
4. só no fechamento visual os shims podem sair do `index`, após comparação desktop/mobile.

## Ondas migradas

| Trajetória | Resultado vigente | Owner(s) canônico(s) | Estado PXX |
|---|---|---|---|
| P45 | geometria-base dos controles superiores | `topControlsBaseCurrent.css` | shim |
| P46 | navegação superior 40px + painel de Missões | `topNavigationCurrent.css` | shim |
| P47 | alinhamento pixel-perfect/containing block | `topControlsPixelCurrent.css` | shim |
| P49 | identidade-base + slot da carteira | `accountIdentityBaseCurrent.css`, `walletLoadingCurrent.css` | shim |
| P50 | fluxo do hero + indicador Amigos | `homeHeroFlowCurrent.css`, `friendsIndicatorCurrent.css` | shim |
| P51 | alinhamento de identidade + resumo da Central | `accountIdentityAlignmentCurrent.css`, `notificationsSummaryCurrent.css` | shim |
| P52 | cabeçalho/hero + aparência-base da pill de Moedas | `homeHeaderLayoutCurrent.css`, `missionsCoinVisualCurrent.css` | shim |
| P53 | hero compacto, presença, grid de Missões, identidade da Reciclagem | `homeHeroCompactCurrent.css`, `friendsPresencePendingCurrent.css`, `missionsTwoColumnCurrent.css`, `recyclingCardIdentityCurrent.css` | shim |
| P54 | integridade avatar/moldura + base do botão Criar Carta | `profileAvatarFrameIntegrityCurrent.css`, `cardsCreateEntryCurrent.css` | shim |
| P55 | nenhuma regra vigente | — | `HISTORICAL` |
| P56 | ações Perfil/Sair + refinamento Criar Carta + ficha/modal | `accountActionsCurrent.css`, `cardsCreateEntryRefinementCurrent.css`, `cardDetailCurrent.css` | shim |
| P57 | apresentação da biblioteca real + grids live de molduras | `cardLibraryPresentationCurrent.css`, `profileFramesLiveCurrent.css` | shim |
| P58 | tipografia residual da lacuna, metadados da biblioteca, criador, Reciclagem, Gênese | `cardGapTypographySeedCurrent.css`, `cardLibraryMetadataCurrent.css`, `cardCreatorCurrent.css`, `recyclingMetadataCurrent.css`, `genesisPreviewCurrent.css` | shim |
| P59 | cards 1:1 + desenho contínuo da lacuna | `cardCompactCurrent.css` | shim |
| P60 | posição/espessura final da lacuna + pills de Missões | `cardTypographyMissionsCurrent.css` | shim |
| P62 | carteira → Extrato | `accountLedgerCurrent.css` | shim |
| P66 | inputs 16px iOS/touch + Admin/teclado | `mobileFormsCurrent.css` | shim |
| P68 | raridade composta/Super Trunfo | `cardRarityCurrent.css` | shim |
| P73/P74 | account strip, Perfil/Sair e carteira | `accountCurrent.css` | P73 histórico; P74 shim |

## Regras descartadas como `SUPERSEDED`

| Origem | Regra histórica | Substituição atual |
|---|---|---|
| P50/P52/P53 | `.p48-create-card-entry` / `.p53-create-card-entry` | markup `p54-create-card-entry p56-create-card-entry p57-create-card-entry` de `cardsLibrary` |
| P51 | `.p51-mission-coin-pill` | `p52-mission-coin-pill` + owners P52/P53/P60 |
| P52 | `order` dos itens de `.profile-actions` | `navigationUI` é o único owner; Notificações antes de Histórico |
| P52 | layout antigo de `mission-row/rewards` | grid P53 + geometria P60 |
| P53/P54 | `.profile-modal-frame-grid` estático/congelado | `profileUI.stabilizeGenesis()` remove a classe e cria `p57-live-frame-grid p58-live-frame-grid` antes do estado final |
| P55 | modal/detalhe P55 | `cardsLibrary` usa P56/P57 |
| P55/P56/P57 | desenhos antigos da lacuna | trajetória final P58 tipografia → P59 desenho → P60 posição |
| P56 | `.p56-library-card/.p56-library-card-text` | renderer atual emite `p57-library-*` |
| P57 | grid/dimensões antigas da biblioteca e preview | P58/P59; dimensões finais são 1:1 em P59 |
| P58 | desenho colorido/5:7 da lacuna e cards | P59/P60 definem o resultado final |

## Trajetórias críticas preservadas

### P45 → P47

44px → 40px → remoção de `transform/translate` residual. Os três estágios permanecem separados na mesma ordem.

### P49 → P53

- P49 cria identidade-base/carteira; P51 alinha `@usuário` e título.
- P50 define o fluxo inicial do hero; P52 reposiciona o cabeçalho; P53 compacta a altura final.
- `navigationUI` é o único writer da ordem dos botões.
- presença usa a classe realmente emitida por `socialUI`.
- Missões usam `p52-mission-coin-pill`, grid P53 e refinamento P60.

### P54 → P60 — Cartas/Perfil

- P54 fornece integridade de avatar e base estrutural do botão Criar Carta.
- P56 refina esse botão e owns o modal/ficha; classes antigas de biblioteca P56 foram descartadas.
- P57 owns shell/favorito/origem da biblioteca real e o grid live de molduras.
- P58 conserva apenas propriedades ainda observáveis: tipografia residual da lacuna, metadados, creator, Reciclagem e órbita Gênese.
- P59 define dimensões finais 1:1 e desenho contínuo da lacuna.
- P60 ajusta altura/posição/espessura final da lacuna.
- P55 não participa mais do resultado funcional.

### Perfil/Gênese

`profileUI` converte o grid histórico para `p57-live-frame-grid p58-live-frame-grid` e adiciona `p58-genesis-preview`; `profileFramesLiveCurrent.css` e `genesisPreviewCurrent.css` são os owners visuais desse estado.

### P73/P74

`account.css` permanece base. P73 não tem regra funcional e P74 importa `accountCurrent.css` na posição final original; carteira continua `order:30`, ações `order:40`.

## Critério de conclusão de um PXX CSS

- toda regra vigente está em owner canônico;
- regra substituída é explicitamente `SUPERSEDED`;
- PXX contém no máximo comentário + `@import`, ou marcador histórico;
- contratos testam owners atuais e trajetória final;
- posição de cascata permanece equivalente enquanto houver shim;
- remoção posterior dos shims exige comparação visual.

## Evidência principal

- `tests/p45TopControlsAlignment.contract.test.js`
- `tests/p46TopNavigation.contract.test.js`
- `tests/p47TopControlsPixelAlign.contract.test.js`
- `tests/p49AccountIdentityBalance.contract.test.js`
- `tests/p50HomeStability.contract.test.js`
- `tests/p51AccountNotifications.contract.test.js`
- `tests/p52RegressionStability.contract.test.js`
- `tests/p53MobilePolishMissionsProfile.contract.test.js`
- `tests/p54AvatarCardsModal.contract.test.js`
- `tests/p55CardVisualsModal.contract.test.js`
- `tests/p56DesktopActionsCardModal.contract.test.js`
- `tests/p57CanonicalCardsFrames.contract.test.js`
- `tests/p58CardUxGenesis.contract.test.js`
- `tests/p59SquareCardsContinuousGap.contract.test.js`
- `tests/p60CardIdentityGapMission.contract.test.js`
- `tests/p62SingleLedger.contract.test.js`
- `tests/p66CardProgressionMobileInput.contract.test.js`
- `tests/p68CardHistoryRarity.contract.test.js`
- `tests/cssAccountOwnership.contract.test.js`
- `tests/p73AccountStripRender.contract.test.js`
- `tests/p74WalletPlacement.contract.test.js`

## Estado do Gate 16

A camada recente **P45–P74** está majoritariamente classificada e retirada de ownership PXX, inclusive o bloco crítico P54–P60. O principal débito visual restante passou a ser a fundação/revisões **P14–P44** e o fechamento dos shims com comparação real desktop/mobile. O Gate 16 ainda não é 100% até essa etapa final.
