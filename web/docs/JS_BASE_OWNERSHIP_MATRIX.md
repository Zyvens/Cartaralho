# Matriz de ownership — módulos-base JS

> Branch: `refactor/domain-owners`  
> Baseline funcional: **P77 / v1.4.77**  
> Regra: um arquivo antigo só deixa de ser executável depois que cada resultado observável vigente possui owner explícito.

## Estados

- `CURRENT FOUNDATION` — implementação-base ainda consumida/decorada por owner canônico.
- `CURRENT BRIDGE` — comportamento vigente isolado em arquivo/posição histórica; candidato a rename/move.
- `RUNTIME FALLBACK` — existe fisicamente, mas é substituído antes do primeiro uso normal.
- `SUPERSEDED` — compatibilidade/rastreabilidade; não possui ownership final.
- `HISTORICAL` — não executável.

## Reconciliação P75 → P77

A branch contém `main@P77` em sua ancestralidade e preserva primeiro paint da carteira, endpoint leve/coalescing, account strip estrutural, realtime, saldo exato de recompensa individual e bindings lexicais reais sem reativar os scripts PXX históricos.

## Classificação auditada

| Módulo-base | Estado | Resultado vigente / owner final |
|---|---|---|
| `app.js` | `RUNTIME FALLBACK` | estado/router/local/bootstrap/socket → `core/*`; fallback físico ainda pendente de limpeza |
| `metaClient.js` | `CURRENT FOUNDATION` | API transversal de metajogo como **`const MetaClient` lexical** |
| `metaUIBase.js` | `CURRENT FOUNDATION` | namespace mínimo de compatibilidade; métodos finais são preenchidos por domains |
| `meta.js` | `HISTORICAL` | não executável; conteúdo distribuído por owners nomeados |
| `professionalUI.js` | `SUPERSEDED` | somente delegates compatíveis; nenhum writer runtime final |
| `canonicalCardBadge.js` | `CURRENT BRIDGE` | somente **🧬 CARTA ORIGINAL** |
| `cardProgressionUI.js` | `CURRENT BRIDGE` | **Meu Legado** + `DIRETO DA FONTE` |
| `creditsPolish.js` | `SUPERSEDED` | “Produzido por” → `uiPolishUI` |
| `missionLayoutSafe.js` | `SUPERSEDED` | Missões → `missionsUI/profileUI` |
| `uiRefinement2.js` | `SUPERSEDED` | Home/apelido → `uiPolishUI` |
| `prestigeUI.js` | `SUPERSEDED` | títulos/raridades → `identityUI/profileUI` |
| `minimumPlayersGrace.js` | `CURRENT FOUNDATION` | UI/timer; lifecycle → `gameplayUI` |
| `metaFixes.js` | `CURRENT FOUNDATION` | Perfil Público; listener duplicado removido |
| `rewardPreviewUI.js` | `CURRENT FOUNDATION` | estimativa econômica autoritativa |
| `roomRulesUI.js` | `CURRENT FOUNDATION` | regras/sumário/editor da sala |
| `achievementUI.js` | `CURRENT FOUNDATION` | base de Badges/Achievements; domain normaliza resultado |
| `notificationsUI.js` | `CURRENT FOUNDATION` | base da Central; domain owns spoilers/não-lidas |
| `marketplaceUI.js` | `CURRENT FOUNDATION` | shell do Mercado; `domains/marketplaceUI` owns wallet/realtime/transações |
| `marketplaceShop.js` | `CURRENT FOUNDATION` | catálogo/compra idempotente |
| `marketplaceInventory.js` | `CURRENT FOUNDATION` | inventário BUFFs/cartas de packs |
| `marketplaceLedger.js` | `CURRENT FOUNDATION` | Extrato/histórico de compras |
| `marketplaceRecycling.js` | `CURRENT FOUNDATION / DECORATED` | load/seleção/recycle; domain owns paint/confirm/saldo |
| `lootUI.js` | `CURRENT FOUNDATION` | Espólio pendente e claim |
| `finalRewardUI.js` | `CURRENT FOUNDATION` | janela final/Saqueador/settlement |
| `profileModal.js` | `CURRENT FOUNDATION` | shell Perfil/Títulos/Molduras/Progressão; `profileUI` owns comportamento final |

## Owners extraídos dos monólitos

### Do antigo `professionalUI.js`

- `domains/registrationUI.js`
- `domains/appPanelUI.js`
- `domains/socialFoundationUI.js`
- `domains/homePresentationUI.js`
- `domains/cardsLibrary.js`
- `domains/profileUI.js`
- `domains/navigationUI.js`
- `domains/accountUI.js`

### Do antigo `meta.js`

- `metaClient.js`
- `metaUIBase.js`
- `domains/historyUI.js`
- `domains/socialGroupsUI.js`
- `domains/reactionsUI.js`
- `domains/spectatorUI.js`
- `domains/roomShareUI.js`
- `domains/metaLifecycleUI.js`
- `domains/missionsUI.js`
- `domains/identityUI.js`
- `domains/rankUI.js`
- `domains/navigationUI.js`
- `domains/accountUI.js`

`meta.js` está no `index.html` somente como `application/x-cartaralho-legacy`. `professionalUI.js` executa apenas um shim pequeno para compatibilidade de `polishHome/renderCards`.

## Resultados de auditoria relevantes

- **P75→P77:** carteira preservada nos owners atuais; Reciclagem não pode mais achatar o markup com `textContent`.
- **Missões:** moedas + XP + BUFF preservados; superfície agora pertence integralmente a `missionsUI`.
- **Perfil:** rota Perfil → `ProfileModal` foi restaurada em `appPanelUI` após aposentadoria do monólito.
- **Rank:** `rankUI` é renderer completo e não depende mais de `MetaUI.renderRank.bind`.
- **Identidade:** catálogo-base + títulos posteriores pertencem a `identityUI`; observer de títulos saiu do monólito.
- **Reactions:** binding de canal pertence a `metaLifecycleUI`; apresentação/dock a `reactionsUI`.
- **Espectador:** lifecycle e entrada da Home pertencem a `spectatorUI`.
- **Histórico/Turmas:** renderers próprios em `historyUI` e `socialGroupsUI`.

## Próxima onda

1. varrer foundations atuais por listeners/writers duplicados e dependências transitivas;
2. reduzir/remover fisicamente bridges e fallbacks já cobertos por contratos — especialmente `app.js`;
3. manter foundations coesas (`RoomRulesUI`, `RewardPreviewUI`, Mercado, Loot, FinalReward, ProfileModal) até haver benefício arquitetural claro em movê-las;
4. comparação visual real desktop/mobile antes de remover shims CSS;
5. CI integral + aceite iPhone/PWA/multiplayer antes de qualquer merge.
