# Progresso da consolidação por domínio

> Branch de trabalho: `refactor/domain-owners`  
> Baseline funcional reconciliado: **P77 / v1.4.77**  
> Regra de segurança: **não mergear nem marcar a PR #96 como pronta sem autorização expressa**.

## Como a porcentagem é calculada

A porcentagem é ponderada por risco e volume funcional. Mede responsabilidade realmente consolidada, não quantidade de arquivos.

**Implementação atual: 88%**

| # | Gate | Peso | Concluído | Situação |
|---|---|---:|---:|---|
| 1 | Sincronização P77 + baseline de CI | 3% | 3% | `main@P77` reconciliada; branch behind=0; previews verdes |
| 2 | Matriz de linhagem PXX / auditoria histórica | 7% | 7% | Cadeia P01–P77 fechada |
| 3 | Core de ownership / lifecycle | 7% | 7% | estado/router/turno/bootstrap + 20 eventos core em owners próprios; `app.js` é shell lexical |
| 4 | Design system / fundação CSS | 5% | 4% | trajetória classificada; falta comparação visual antes de retirar shims |
| 5 | Auth / conta / Home / perfil / créditos | 6% | 6% | owners finais e P77 da carteira preservados; Perfil modal e Perfil Público têm owners explícitos |
| 6 | Social / notificações / missões / Rank / Stats / histórico | 6% | 6% | renderers atuais separados; `meta.js` não executa; Central absorvida pelo domain |
| 7 | Cartas / criação / progressão | 10% | 9% | renderer/progressão canônicos; `CARTA ORIGINAL` e `Meu Legado/DIRETO DA FONTE` continuam bridges porque ainda têm resultado único |
| 8 | Economia / mercado / cosméticos | 7% | 6% | wallet/realtime/reciclagem/catalog/cosméticos em owners; fechamento visual pendente |
| 9 | Salas / Lobby | 6% | 6% | 64 combinações de regras cobertas |
| 10 | Gameplay | 9% | 7% | lifecycle consolidado e grace period integralmente no owner; telas-base e aceite multiplayer ainda pendentes |
| 11 | BUFFs | 6% | 6% | matriz 21/21 fechada |
| 12 | Áudio / narrador | 3% | 2% | owner ativo; falta validação real browser/iPhone |
| 13 | Recompensas / loot | 5% | 5% | regras/idempotência protegidas; foundations funcionais mantidas |
| 14 | Consolidação backend de runtime PXX | 5% | 5% | 8/8 helpers em owners canônicos |
| 15 | Remoção de JS/wrappers históricos do runtime | 4% | 4% | `professionalUI` superseded, `meta.js` histórico, `app.js` shell, grace/notifications bases aposentadas |
| 16 | Consolidação/remoção de CSS PXX | 4% | 3% | owners/shims classificados; retirada depende de comparação visual |
| 17 | Release/versionamento consolidado | 2% | 2% | P77 corrente com P75/P76 preservados no histórico |
| 18 | CI final + preview + aceite interno | 5% | 0% | Vercel READY não substitui CI integral nem aceite desktop/mobile/iPhone/PWA/multiplayer |
| | **TOTAL** | **100%** | **88%** | |

## Gates fechados nesta onda

### `app.js`

- reduzido a shell lexical: `const App`, `window.App` e `DOMContentLoaded`;
- estado/reset → `core/appState.js`;
- roteamento → `core/screenRouter.js`;
- fluxo local → `core/localTurnFlow.js`;
- socket lifecycle → owners `core/*`;
- bootstrap → `core/appBootstrap.js`;
- contrato impede retorno de listeners/writers ao shell.

### Perfil Público

- `metaFixes.js` virou bridge explícita `publicProfileUI`;
- removido listener global antigo de `.panel-close`;
- título usa classe canônica e não duplica com `identityUI`;
- X fecha o `AppPanelModal`; Voltar delega ao `rankUI`.

### Gameplay — mínimo de jogadores

- UI/timer e lifecycle agora pertencem integralmente a `domains/gameplayUI.js`;
- overlay, fallback de 60s, tick de 250ms, cancelamento e retomada preservados;
- `minimumPlayersGrace.js` virou marker `SUPERSEDED`;
- eventos start/cancel/sync e hides finais continuam com guard único.

### Central de Notificações

- `domains/notificationsUI.js` agora owns botão, badge, fetch, modal, spoilers e persistência de leitura;
- `notificationsUI.js` base virou marker `SUPERSEDED`;
- notificações novas permanecem pendentes durante leitura e só são marcadas como lidas ao fechar;
- contratos protegem `NOVA`, badge e ausência de wrapper no arquivo antigo.

Todos os commits funcionais e contratos acima chegaram a preview Vercel **READY**.

## Regras para subir a porcentagem

1. Conta-se responsabilidade eliminada do legado, não arquivo criado.
2. Regra histórica substituída é `SUPERSEDED` e não ganha owner artificial.
3. CSS só conta após classificação/migração ou prova de supersessão.
4. Os últimos 5% ficam reservados a CI integral e aceite real.
5. Mesmo em 100%, a PR permanece Draft até autorização explícita.

## Próxima sequência

1. continuar a varredura das foundations por dependências transitivas e wrappers duplicados;
2. consolidar gameplay/telas-base onde houver ownership realmente fragmentado;
3. manter `canonicalCardBadge` e `cardProgressionUI` enquanto `CARTA ORIGINAL`, `Meu Legado` e `DIRETO DA FONTE` não tiverem owner equivalente;
4. comparação visual real desktop/mobile antes de remover shims CSS;
5. CI integral + desktop/mobile + iPhone/PWA + multiplayer crítico;
6. somente após aprovação explícita considerar merge na `main`.
