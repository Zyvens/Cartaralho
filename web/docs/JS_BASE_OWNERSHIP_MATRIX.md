# Matriz de ownership — módulos-base JS

> Branch: `refactor/domain-owners`  
> Baseline funcional: **P77 / v1.4.77**  
> Regra: um arquivo antigo só deixa de ser executável depois que cada resultado observável vigente possui owner explícito.

## Estados

- `CURRENT FOUNDATION` — implementação-base ainda consumida/decorada por owner canônico.
- `CURRENT BRIDGE` — comportamento vigente isolado em arquivo/posição histórica; candidato a rename/move.
- `MIXED / DECOMPOSE` — mistura resultados vigentes e writers supersedidos.
- `RUNTIME FALLBACK` — existe fisicamente, mas é substituído antes do primeiro uso normal.
- `SUPERSEDED` — não vence o runtime final; não deve ser recanonizado.
- `HISTORICAL` — rastreabilidade somente.

## Reconciliação P75 → P77

A `main` avançou durante a refatoração. A branch atual contém `main@P77` em sua ancestralidade (`behind=0`) e preserva as melhorias sem reativar os PXX históricos:

- primeiro paint da carteira por `dirty_balance`/cache;
- confirmação leve e coalescida por `/api/profile/wallet`;
- carteira estrutural dentro da account strip, independente de screen-state CSS;
- realtime `balance_updated` e Megafone;
- saldo exato em recompensa individual;
- owners lexicais reais da Home/Auth/Socket.

O contrato `p77CanonicalWalletOwnership.contract.test.js` prova o resultado na arquitetura canônica.

## Classificação auditada

| Módulo-base | Estado | Resultado vigente / owner final | Trajetória supersedida |
|---|---|---|---|
| `app.js` | `RUNTIME FALLBACK` | owners `core/*` de estado/router/local/bootstrap/socket | lifecycle físico não executa no caminho normal |
| `canonicalCardBadge.js` | `CURRENT BRIDGE` | somente **🧬 CARTA ORIGINAL** | wallet → `marketplaceUI/accountUI`; Stats wallet → `statsUI`; payout → `rewardsUI` |
| `cardProgressionUI.js` | `CURRENT BRIDGE` | **Meu Legado** + `DIRETO DA FONTE` | decoração antiga → `cardsLibrary + cardProgression` |
| `creditsPolish.js` | `SUPERSEDED` | “Produzido por” → `uiPolishUI` | listener histórico removido |
| `missionLayoutSafe.js` | `SUPERSEDED` | missão final → `missionsUI/profileUI` | writers históricos retirados |
| `uiRefinement2.js` | `SUPERSEDED` | copy Home + apelido → `uiPolishUI` | renderer antigo de Cartas → `cardsLibrary` |
| `prestigeUI.js` | `SUPERSEDED` | títulos/raridades → `identityUI`; Celestial → `profileUI` | patches antigos retirados |
| `minimumPlayersGrace.js` | `CURRENT FOUNDATION` | somente UI/timer | listeners → `gameplayUI` |
| `metaFixes.js` | `CURRENT FOUNDATION` | renderer-base de Perfil Público | listener duplicado de `player_list_update` removido; identidade/placar ficam nos owners atuais |
| `rewardPreviewUI.js` | `CURRENT FOUNDATION` | estimativa econômica autoritativa de sala/Lobby | setter protege renderer contra patches históricos |
| `roomRulesUI.js` | `CURRENT FOUNDATION` | normalize/render/read/editor das regras de sala | consumido por `roomUI`/telas; não há writer concorrente integral |
| `achievementUI.js` | `CURRENT FOUNDATION` | base Badges/Achievements | consumido por `achievementsUI` |
| `notificationsUI.js` | `CURRENT FOUNDATION` | base da Central | consumido por `notificationsUI` |
| `marketplaceUI.js` | `CURRENT FOUNDATION` | shell/tabs/render do Mercado | domain owns wallet/realtime/transações/ordem |
| `marketplaceShop.js` | `CURRENT FOUNDATION` | catálogo e compra idempotente | sem writer concorrente identificado |
| `marketplaceInventory.js` | `CURRENT FOUNDATION` | inventário de BUFFs/cartas de packs | shell do Mercado |
| `marketplaceLedger.js` | `CURRENT FOUNDATION` | Extrato + histórico de compras | carteira global no domain |
| `marketplaceRecycling.js` | `CURRENT FOUNDATION / DECORATED` | load/seleção/recycle; domain owns paint/confirm/sync | batches/textContent antigos supersedidos |
| `lootUI.js` | `CURRENT FOUNDATION` | Espólio pendente/claim idempotente | sem substituto integral; não desligar |
| `finalRewardUI.js` | `CURRENT FOUNDATION` | janela final/Saqueador/finalização/settlement | `rewardsUI` valida invariantes, mas depende desta base |
| `profileModal.js` | `CURRENT FOUNDATION` | base Perfil/Títulos/Molduras/Progressão | `profileUI` owns comportamento final |
| `professionalUI.js` | `MIXED / DECOMPOSE` | `AppPanelModal`, `RegistrationModal`, base `SocialUI`, `polishHome` vivos | renderer de Cartas e parte de navegação/menu substituídos |
| `meta.js` | `MIXED / DECOMPOSE` | `MetaClient`, perfil, reactions, espectador e room-share vivos | rank/stats/cards/App.showScreen antigos perdem para domains |

## Resultados vs trajetória recuperados

### Cartas/Progressão

`canonicalCardBadge.js` foi reduzido à autoria original. `cardProgressionUI.js` deixou de competir com a biblioteca e recuperou **Meu Legado** depois do renderer final de Stats, preservando também `DIRETO DA FONTE`.

### Missões

`missionLayoutSafe` não vencia mais a cascata. A comparação P10→resultado revelou perda do **BUFF de recompensa**; `missionsUI` agora preserva moedas + XP + BUFF quando `buffReward` existe.

### Gameplay / mínimo de jogadores

Overlay, 60s, tick de 250ms e retomada permanecem. Eventos start/cancel/sync e hides de término pertencem a `gameplayUI`, com guard único.

### UI/Prestígio

`uiRefinement2` e `prestigeUI` viraram markers `SUPERSEDED`. CTA/identidade de apelido foram para `uiPolishUI`; catálogo de Prestígio foi para `identityUI`, com Celestial em `profileUI`.

### Mercado/Reciclagem

`marketplaceShop`, Inventory e Ledger são foundations coesas. `marketplaceRecycling` ainda fornece load/seleção/requisição, mas o resultado final pertence ao domain.

A auditoria corrigiu uma regressão potencial: o `syncBalances` histórico podia substituir todo o conteúdo da carteira por `textContent`. O domain agora delega a `applyBalance()`, preservando ícone, valor, clique de Extrato, cache e eventos realtime — inclusive a trajetória P75→P77.

### Perfil Público

`metaFixes.js` permanece apenas como foundation do renderer público. Seu segundo listener de `player_list_update` foi removido; atualização de placar/identidade fica em `roomSocketLifecycle` + `identityUI`, evitando múltiplos escritores do mesmo estado.

### Espólio/Recompensa final

`lootUI` e `finalRewardUI` continuam foundations funcionais e **não devem ser desligados**. O primeiro owns claim de Espólio; o segundo janela/finalização do Saqueador. `rewardsUI` é a camada canônica de invariantes/apresentação.

## Monólitos restantes

A fronteira completa está em `FOUNDATION_MONOLITH_DECOMPOSITION.md` e congelada por `foundationMonolithBoundaries.contract.test.js`.

- `professionalUI.js`: extrair AppPanel, Registration, Social foundation e Home polish antes da retirada física.
- `meta.js`: extrair MetaClient, reactions, espectador, room-share e extensão de perfil antes de retirar `MetaUI.patch()`.

## Próxima onda

1. extrair `RegistrationModal` e depois `AppPanelModal` de `professionalUI.js`;
2. extrair/absorver Social foundation;
3. decompor `meta.js` por MetaClient/reactions/espectador/room-share;
4. somente depois remover wrappers/fallbacks físicos;
5. manter shims CSS até comparação visual real.
