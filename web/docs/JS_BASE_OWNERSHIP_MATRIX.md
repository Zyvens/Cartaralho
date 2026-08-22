# Matriz de ownership — módulos-base JS

> Branch: `refactor/domain-owners`  
> Baseline funcional: **P75 / v1.4.75**  
> Regra: um arquivo antigo só deixa de ser executável depois que cada resultado observável que ainda vence no runtime possui owner explícito.

## Estados

- `CURRENT FOUNDATION` — implementação-base ainda consumida/decorada por um domain owner.
- `CURRENT BRIDGE` — comportamento vigente isolado, mas ainda em arquivo/base com nome ou posição histórica; candidato a rename/move no gate mecânico.
- `MIXED / DECOMPOSE` — possui partes vigentes e writers já supersedidos; precisa ser separado antes de qualquer desligamento.
- `RUNTIME FALLBACK` — permanece fisicamente, mas o caminho normal é substituído antes do primeiro uso.
- `SUPERSEDED` — não vence o runtime final e não deve ser recanonizado artificialmente.
- `HISTORICAL` — rastreabilidade somente, não executável.

## Classificação auditada

| Módulo-base | Estado | Resultado vigente / owner final | Trajetória supersedida |
|---|---|---|---|
| `app.js` | `RUNTIME FALLBACK` | `core/appState`, `screenRouter`, `localTurnFlow`, `roomSocketLifecycle`, `gameplaySocketLifecycle`, `socketLifecycle`, `appBootstrap` | estado/router/bootstrap/listeners físicos do monólito não executam no caminho normal |
| `canonicalCardBadge.js` | `CURRENT BRIDGE` | somente badge **🧬 CARTA ORIGINAL** na biblioteca canônica | wallet/account → `marketplaceUI/accountUI`; ledger em Estatísticas → `statsUI`; payout de `game_over` → `rewardsUI` |
| `cardProgressionUI.js` | `CURRENT BRIDGE` | **Meu Legado** anexado após o renderer final de Estatísticas + celebração `DIRETO DA FONTE` em `round_result` | patch antigo de `HomeScreen.renderCards` → `cardsLibrary + cardProgression`; renderer-base antigo de Stats → `statsUI` |
| `creditsPolish.js` | `SUPERSEDED` | resultado “Produzido por” pertence agora a `domains/uiPolishUI.js` | listener histórico de clique retirado; arquivo permanece só como marcador até limpeza mecânica |
| `achievementUI.js` | `CURRENT FOUNDATION` | implementação de Badges/Achievements; `domains/achievementsUI.js` normaliza raridade/ordem e SFX | ainda não pode ser desligado: o domain chama `AchievementUI.renderBadges/notify` |
| `notificationsUI.js` | `CURRENT FOUNDATION` | Central, leitura/badge/modal; `domains/notificationsUI.js` adiciona spoilers e semântica de não-lidas | ainda não pode ser desligado: o domain decora `NotificationsUI.open/close` |
| `marketplaceUI.js` | `CURRENT FOUNDATION` | shell/tabs/render do Mercado; `domains/marketplaceUI.js` owns carteira realtime, transações, ordem de tabs e Reciclagem final | writers de wallet históricos fora do domain são supersedidos |
| `profileModal.js` | `CURRENT FOUNDATION` | modal-base Perfil/Títulos/Molduras/Progressão; `domains/profileUI.js` estabiliza comportamento final | seletores/layouts intermediários podem ser supersedidos, mas a API `ProfileModal` ainda é consumida |
| `professionalUI.js` | `MIXED / DECOMPOSE` | `AppPanelModal`, `RegistrationModal` e parte da base social ainda sustentam fluxos atuais | vários writers de Home/Cards/Rank/Stats/Friends são substituídos por `navigationUI`, `cardsLibrary`, `rankUI`, `statsUI`, `socialUI` |
| `meta.js` | `MIXED / DECOMPOSE` | `MetaClient` e utilitários/fluxos ainda consumidos por vários módulos | writers antigos de `HomeScreen.renderRank/renderStats/renderCards` e `App.showScreen` perdem para owners canônicos posteriores |
| `minimumPlayersGrace.js` | `CURRENT FOUNDATION` | pausa/overlay de insuficiência de jogadores + eventos de grace period | ainda sem owner canônico próprio; candidato ao gate gameplay/telas-base |

## Resultado vs trajetória — `canonicalCardBadge.js`

O arquivo histórico acumulava quatro responsabilidades:

1. badge `CARTA ORIGINAL`;
2. wallet na account strip;
3. ledger de Moedas Sujas dentro de Estatísticas;
4. toast de payout em `game_over`.

Após auditoria:

- (1) continua vigente e permanece temporariamente no arquivo reduzido;
- (2) é `SUPERSEDED` por `domains/marketplaceUI.js` + account owners;
- (3) é `SUPERSEDED` porque `domains/statsUI.js` é o renderer final e Estatísticas não deve conter wallet/extrato;
- (4) foi migrado para `domains/rewardsUI.js` com guard de registro.

Logo `canonicalCardBadge.js` deixou de ser um módulo econômico misto e virou bridge de autoria original.

## Resultado vs trajetória — `cardProgressionUI.js`

A trajetória antiga tinha três resultados:

1. decoração de Fundo/Borda nas cartas;
2. bloco **Meu Legado** em Estatísticas;
3. celebração `DIRETO DA FONTE` / criação original em `round_result`.

Resultado final antes desta auditoria:

- (1) foi corretamente substituído por `domains/cardProgression.js` + ficha canônica de `cardsLibrary`;
- (2) havia sido perdido porque `domains/statsUI.js` sobrescrevia o renderer após o patch histórico;
- (3) continuava vivo porque o listener de socket não era sobrescrito.

Correção aplicada:

- remover o patch antigo de Cartas;
- instalar a extensão **Meu Legado** somente depois do renderer final de Stats;
- manter a celebração original com guard de listener.

Isso restaura a característica de progressão sem reativar writers antigos.

## Resultado vs trajetória — `creditsPolish.js`

A trajetória tinha apenas um efeito observável: após abrir Créditos, acrescentar `Produzido por: Vitor Ivens` uma única vez.

Esse comportamento agora é owned por `domains/uiPolishUI.js`, com guard de instalação. O arquivo histórico não registra mais listeners e fica somente como marcador `SUPERSEDED` até o gate de remoção física.

## Próxima onda

1. decompor `professionalUI.js` em shells realmente vigentes vs writers supersedidos;
2. decompor `meta.js`, preservando `MetaClient` e fluxos realmente consumidos;
3. mover `minimumPlayersGrace` para ownership explícito de gameplay;
4. auditar `marketplaceShop/Inventory/Ledger/Recycling`, `lootUI`, `finalRewardUI`, `prestigeUI`, `missionLayoutSafe` e `uiRefinement2`;
5. só então executar rename/move e remover wrappers/fallbacks físicos.
