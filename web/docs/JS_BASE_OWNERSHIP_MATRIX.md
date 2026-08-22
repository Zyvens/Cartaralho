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
| `app.js` | `RUNTIME FALLBACK` | owners `core/*` de estado/router/local/bootstrap/socket | lifecycle físico do monólito não executa no caminho normal |
| `canonicalCardBadge.js` | `CURRENT BRIDGE` | somente **🧬 CARTA ORIGINAL** | wallet → `marketplaceUI/accountUI`; Stats wallet → `statsUI`; payout → `rewardsUI` |
| `cardProgressionUI.js` | `CURRENT BRIDGE` | **Meu Legado** + `DIRETO DA FONTE` | decoração antiga de cartas → `cardsLibrary + cardProgression` |
| `creditsPolish.js` | `SUPERSEDED` | “Produzido por” → `domains/uiPolishUI.js` | listener histórico removido |
| `missionLayoutSafe.js` | `SUPERSEDED` | missão final → `domains/missionsUI.js` / `profileUI` | writers `MetaUI.missionRow` e `ProfileModal.missionCard` retirados |
| `uiRefinement2.js` | `SUPERSEDED` | copy da Home + identidade de apelido → `domains/uiPolishUI.js` | renderer antigo de Cartas → `cardsLibrary` |
| `prestigeUI.js` | `SUPERSEDED` | catálogo de títulos/raridades → `domains/identityUI.js`; Celestial → `profileUI` | patches em `MetaUI`/`ProfileModal` retirados |
| `minimumPlayersGrace.js` | `CURRENT FOUNDATION` | somente UI/timer da pausa por mínimo de jogadores | listeners movidos para `domains/gameplayUI.js` |
| `achievementUI.js` | `CURRENT FOUNDATION` | base Badges/Achievements; `achievementsUI` normaliza ordem/SFX | ainda consumido pelo domain |
| `notificationsUI.js` | `CURRENT FOUNDATION` | base da Central; `notificationsUI` owns spoilers/não-lidas | ainda consumido pelo domain |
| `marketplaceUI.js` | `CURRENT FOUNDATION` | shell/tabs/render do Mercado; domain owns wallet/realtime/transações/Reciclagem | writers econômicos antigos são supersedidos |
| `profileModal.js` | `CURRENT FOUNDATION` | base Perfil/Títulos/Molduras/Progressão | `profileUI` owns comportamento final |
| `professionalUI.js` | `MIXED / DECOMPOSE` | `AppPanelModal`, `RegistrationModal`, base `SocialUI`, `polishHome` ainda são consumidos | renderers Home/Cards/Stats/Rank/Friends parcialmente substituídos por domains |
| `meta.js` | `MIXED / DECOMPOSE` | `MetaClient` + fluxos ainda consumidos | writers de rank/stats/cards/navigation perdem para domains finais |

## Resultados vs trajetória recuperados

### `canonicalCardBadge.js`

O arquivo misturava autoria original, wallet, ledger em Estatísticas e payout. Wallet/ledger são `SUPERSEDED`; payout passou a `rewardsUI`; somente autoria original permanece no bridge.

### `cardProgressionUI.js`

A decoração Fundo/Borda antiga foi corretamente substituída pela ficha canônica. A auditoria encontrou **Meu Legado** perdido porque `statsUI` sobrescrevia o renderer histórico; o bloco agora é anexado após o renderer final. A celebração `DIRETO DA FONTE` permanece com guard único.

### Missões

`missionLayoutSafe` não vencia mais a cascata JS. Ao comparar trajetória, foi detectado que o P10 exibia recompensa de **BUFF**, mas o owner atual exibia apenas moedas + XP. `missionsUI` agora preserva os três: 🪙 moedas, XP e 🎲 BUFF quando `buffReward` existe. O arquivo histórico virou marcador `SUPERSEDED`.

### Minimum Players Grace

A UI mantém overlay, cronômetro de 60s, tick de 250ms e retomada. Os eventos `insufficient_players_started`, `insufficient_players_cancelled`, `minimum_players_sync` e hides em `game_over/room_closed/room_cancelled` agora pertencem a `gameplayUI`, com guard de registro.

### `uiRefinement2.js`

Os resultados vigentes — CTA “Abra uma mesa…” e editor “APELIDO DA PARTIDA” — foram absorvidos por `uiPolishUI`. O renderer concorrente de Cartas não foi migrado porque `cardsLibrary` já é canônico.

### `prestigeUI.js`

Todos os títulos adicionais (`Cliente Preferencial`, `Lavador de Moedinhas`, `Patrocinador do Caos`, `Dinheiro Não Compra Talento`, `Herdeiro do Cartaralho`, `Patrimônio Inexplicável`, `O Criador`, `Betinha`) foram incorporados ao catálogo de `identityUI`. A legenda Celestial já é owner de `profileUI`.

## Próxima onda

1. decompor `professionalUI.js` em shells/foundations realmente vivos vs renderers supersedidos;
2. decompor `meta.js`, preservando `MetaClient` e fluxos consumidos;
3. auditar `marketplaceShop/Inventory/Ledger/Recycling`, `lootUI`, `finalRewardUI` e demais bases pequenas;
4. somente depois executar rename/move e remover wrappers/fallbacks físicos;
5. manter shims CSS até comparação visual real.
