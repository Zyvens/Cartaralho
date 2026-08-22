# Matriz de ownership — módulos-base JS

> Branch: `refactor/domain-owners`  
> Baseline funcional: **P75 / v1.4.75**  
> Regra: um arquivo antigo só deixa de ser executável depois que cada resultado observável vigente possui owner explícito.

## Estados

- `CURRENT FOUNDATION` — implementação-base ainda consumida/decorada por owner canônico.
- `CURRENT BRIDGE` — comportamento vigente isolado em arquivo/posição histórica; candidato a rename/move.
- `MIXED / DECOMPOSE` — mistura resultados vigentes e writers supersedidos.
- `RUNTIME FALLBACK` — existe fisicamente, mas é substituído antes do primeiro uso normal.
- `SUPERSEDED` — não vence o runtime final; não deve ser recanonizado.
- `HISTORICAL` — rastreabilidade somente.

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
| `achievementUI.js` | `CURRENT FOUNDATION` | base Badges/Achievements | consumido por `achievementsUI` |
| `notificationsUI.js` | `CURRENT FOUNDATION` | base da Central | consumido por `notificationsUI` |
| `marketplaceUI.js` | `CURRENT FOUNDATION` | shell/tabs/render do Mercado | domain owns wallet/realtime/transações/ordem |
| `marketplaceShop.js` | `CURRENT FOUNDATION` | catálogo e compra idempotente do Mercado | sem writer concorrente identificado |
| `marketplaceInventory.js` | `CURRENT FOUNDATION` | inventário de BUFFs/cartas de packs | renderizado pelo shell do Mercado |
| `marketplaceLedger.js` | `CURRENT FOUNDATION` | Extrato + histórico de compras | carteira global permanece no domain |
| `marketplaceRecycling.js` | `CURRENT FOUNDATION / DECORATED` | load/seleção/recycle; `marketplaceUI` owns paint, confirmação e sync de saldo | política antiga em lotes + `textContent` da carteira são supersedidos |
| `lootUI.js` | `CURRENT FOUNDATION` | Espólio pendente, seleção, claim idempotente, entrada Home/Game Over | sem substituto canônico integral; não desligar |
| `finalRewardUI.js` | `CURRENT FOUNDATION` | janela final/Saqueador/finalização/settlement | `rewardsUI` valida contrato/copy, mas depende desta base |
| `profileModal.js` | `CURRENT FOUNDATION` | base Perfil/Títulos/Molduras/Progressão | `profileUI` owns comportamento final |
| `professionalUI.js` | `MIXED / DECOMPOSE` | `AppPanelModal`, `RegistrationModal`, base `SocialUI`, `polishHome` vivos | vários renderers substituídos por domains |
| `meta.js` | `MIXED / DECOMPOSE` | `MetaClient` + fluxos consumidos | rank/stats/cards/navigation antigos perdem para domains |

## Resultados vs trajetória recuperados

### Cartas/Progressão

`canonicalCardBadge.js` foi reduzido à autoria original. `cardProgressionUI.js` deixou de competir com a biblioteca e recuperou **Meu Legado** depois do renderer final de Stats, preservando também `DIRETO DA FONTE`.

### Missões

`missionLayoutSafe` não vencia mais a cascata. A comparação P10→resultado revelou perda do **BUFF de recompensa**; `missionsUI` agora preserva moedas + XP + BUFF quando `buffReward` existe.

### Minimum Players Grace

Overlay, 60s, tick de 250ms e retomada permanecem. Os eventos de start/cancel/sync e hides de término pertencem agora a `gameplayUI`, com guard único.

### UI/Prestígio

`uiRefinement2` e `prestigeUI` viraram marcadores `SUPERSEDED`. O CTA/identidade de apelido foram para `uiPolishUI`; o catálogo completo de títulos de Prestígio foi para `identityUI`, com Celestial tratado por `profileUI`.

### Mercado/Reciclagem

`marketplaceShop`, `Inventory` e `Ledger` são foundations coesas. `marketplaceRecycling` ainda fornece load/seleção/requisição, mas o resultado final de seleção/confirm/política pertence ao domain.

Foi encontrada e corrigida uma divergência importante: após reciclar, o `syncBalances` histórico fazia `home-account-balance.textContent = ...`, podendo destruir o markup canônico da carteira. `marketplaceUI.installRecycling()` agora substitui `syncBalances` e delega a `applyBalance()`, preservando `p65-balance-icon`, `p49-balance-value`, clique no Extrato, cache e eventos de saldo.

### Espólio/Recompensa final

`lootUI` e `finalRewardUI` continuam foundations funcionais e **não devem ser desligados**. O primeiro owns o claim de Espólio; o segundo owns janela/finalização do Saqueador. `rewardsUI` é a camada canônica de invariantes/apresentação sobre a recompensa final.

## Próxima onda

1. decompor `professionalUI.js` em shells/foundations vivos vs renderers supersedidos;
2. decompor `meta.js`, preservando `MetaClient` e fluxos consumidos;
3. auditar bases pequenas restantes (`metaFixes`, `rewardPreviewUI`, `roomRulesUI`, áudio e refinamentos);
4. somente depois executar rename/move e remover wrappers/fallbacks físicos;
5. manter shims CSS até comparação visual real.
