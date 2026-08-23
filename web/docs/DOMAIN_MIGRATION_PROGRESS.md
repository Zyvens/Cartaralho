# Progresso da consolidação por domínio

> Branch de trabalho: `refactor/domain-owners`  
> Baseline funcional reconciliado: **P77 / v1.4.77**  
> Regra de segurança: **não mergear nem marcar a PR #96 como pronta sem autorização expressa**.

## Como a porcentagem é calculada

A porcentagem é ponderada por risco e volume funcional. Mede responsabilidade realmente consolidada, não quantidade de arquivos.

**Implementação atual: 98%**

| # | Gate | Peso | Concluído | Situação |
|---|---|---:|---:|---|
| 1 | Sincronização P77 + baseline de CI | 3% | 3% | `main@P77` reconciliada; branch behind=0; previews verdes |
| 2 | Matriz de linhagem PXX / auditoria histórica | 7% | 7% | Cadeia P01–P77 fechada |
| 3 | Core de ownership / lifecycle | 7% | 7% | estado/router/turno/bootstrap + eventos core em owners próprios; `app.js` é shell lexical |
| 4 | Design system / fundação CSS | 5% | 5% | trajetória classificada e comparação visual do HEAD realizada em browser desktop/mobile |
| 5 | Auth / conta / Home / perfil / créditos | 6% | 6% | owners finais e P77 da carteira preservados; Perfil modal e Perfil Público têm owners explícitos |
| 6 | Social / notificações / missões / Rank / Stats / histórico | 6% | 6% | renderers atuais separados; `meta.js` não executa; Central absorvida pelo domain |
| 7 | Cartas / criação / progressão | 10% | 10% | renderer/progressão canônicos e bridges de resultado único protegidos por contrato |
| 8 | Economia / mercado / cosméticos | 7% | 7% | wallet/realtime/reciclagem/catalog/cosméticos em owners; P17 canônico e slot único de moldura contratados |
| 9 | Salas / Lobby | 6% | 6% | 64 combinações de regras cobertas |
| 10 | Gameplay | 9% | 8% | lifecycle, grace period e pipeline crítico contratados; falta smoke real multi-cliente |
| 11 | BUFFs | 6% | 6% | matriz 21/21 fechada |
| 12 | Áudio / narrador | 3% | 3% | owner ativo + recuperação Safari/iPhone/PWA coberta no release-candidate automatizado |
| 13 | Recompensas / loot | 5% | 5% | Saqueador/Espólio/recompensas e handoff pós-partida protegidos por contratos |
| 14 | Consolidação backend de runtime PXX | 5% | 5% | 8/8 helpers em owners canônicos |
| 15 | Remoção de JS/wrappers históricos do runtime | 4% | 4% | monólitos aposentados; bridges restantes têm resultado observável único |
| 16 | Consolidação/remoção de CSS PXX | 4% | 3% | owners/shims classificados; retirada física final ainda depende do smoke multi-cliente + revalidação visual |
| 17 | Release/versionamento consolidado | 2% | 2% | P77 corrente com linhagem histórica preservada |
| 18 | CI final + preview + smoke automatizado de release candidate | 5% | 5% | Actions #952: contratos + browser acceptance verdes no HEAD |
| | **TOTAL** | **100%** | **98%** | |

## Gates fechados mais recentemente

### Auditoria canônica de cosméticos e molduras

- P17 é o rebalance atual das **17 molduras compráveis**; P14/P11 são origem histórica e não representam mais preço/raridade/ordem corrente;
- ordem corrente: **Comum → Incomum → Raro → Épico → Lendário → Celestial**;
- P33–P36 refinam efeitos visuais específicos, sem redefinir o catálogo P17;
- Bronze/Prata/Ouro/Platina continuam molduras de progressão livremente selecionáveis após o desbloqueio;
- progressão, cosméticos e molduras especiais compartilham o mesmo `equipped_frame_key`/`frameKey`;
- o Perfil oferece um único seletor de Moldura e também a opção `Sem moldura`; classes `frame-*` anteriores são removidas antes de aplicar a escolhida;
- não existe sobreposição de moldura de progressão + moldura cosmética.

### QA visual desktop/mobile

- run **#952** passou com a suíte contratual e o job de browser acceptance;
- Chromium serviu os arquivos exatos do HEAD da branch e percorreu Home, Perfil, Notificações, Mercado, Minhas Cartas, Rank, Stats e Lobby;
- foram validados desktop 1440×1000 e viewport móvel 390×844 com user-agent de iPhone;
- evidências de screenshot foram inspecionadas: Home mobile sem overflow, Perfil com footer fixo e controles legíveis, Mercado contido no viewport, biblioteca de cartas renderizando Carta Nativa + Carta de Jogador, Rank/Stats/Lobby sem clipping estrutural;
- o smoke diferencia corretamente empty-state legítimo de erro de AppPanel.

### Primeiro paint da conta/carteira

- `accountUI` continua único writer final de `HomeScreen.renderAccount`;
- carteira nasce de `AuthClient.user.dirty_balance`/cache conhecido sem fetch concorrente no `home_render`;
- Perfil/Sair mantêm seus ícones no breakpoint mobile;
- atualização transacional/realtime continua canônica via `marketplaceUI`.

### Multiplayer crítico automatizado

- lifecycle de sala cobre criação, entrada, prontidão, cancelamento e reconexão;
- Mão de Vaca continua exigindo confirmação explícita quando aplicável;
- grace period preserva fallback de 60s e tick de 250ms;
- pipeline de rodada preserva `new_round → card_played → all_cards_played → round_result → game_over`;
- Saqueador permanece restrito ao pote de colocação e o handoff para Espólio continua após settlement.

## O que falta para 100%

Restam **2%**, mantidos deliberadamente fora da contagem até prova concreta:

1. **1% — smoke multiplayer multi-cliente real:** dois ou mais clientes compartilhando o mesmo backend/event stream através de sala → ready → rodada → resultado → game over → Saqueador/Espólio.
2. **1% — retirada final de shims CSS comprovadamente neutros + nova revalidação visual:** somente após o smoke multi-cliente e sem alterar a aparência observada no run #952.

## Regras para subir a porcentagem

1. Conta-se responsabilidade eliminada do legado, não arquivo criado.
2. Regra histórica substituída é `SUPERSEDED` e não ganha owner artificial.
3. CSS só sai após prova visual de equivalência.
4. Simulação de múltiplos clientes não será contabilizada como smoke multiplayer real.
5. Mesmo em 100%, a PR permanece Draft até autorização explícita.
