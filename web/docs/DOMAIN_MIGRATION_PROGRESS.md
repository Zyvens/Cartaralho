# Progresso da consolidação por domínio

> Branch de trabalho: `refactor/domain-owners`  
> Baseline funcional reconciliado: **P77 / v1.4.77**  
> Regra de segurança: **não mergear nem marcar a PR #96 como pronta sem autorização expressa**.

## Como a porcentagem é calculada

A porcentagem é ponderada por risco e volume funcional. Mede responsabilidade realmente consolidada, não quantidade de arquivos.

**Implementação atual: 97%**

| # | Gate | Peso | Concluído | Situação |
|---|---|---:|---:|---|
| 1 | Sincronização P77 + baseline de CI | 3% | 3% | `main@P77` reconciliada; branch behind=0; previews verdes |
| 2 | Matriz de linhagem PXX / auditoria histórica | 7% | 7% | Cadeia P01–P77 fechada |
| 3 | Core de ownership / lifecycle | 7% | 7% | estado/router/turno/bootstrap + eventos core em owners próprios; `app.js` é shell lexical |
| 4 | Design system / fundação CSS | 5% | 4% | trajetória classificada; falta comparação visual real antes de retirar shims |
| 5 | Auth / conta / Home / perfil / créditos | 6% | 6% | owners finais e P77 da carteira preservados; Perfil modal e Perfil Público têm owners explícitos |
| 6 | Social / notificações / missões / Rank / Stats / histórico | 6% | 6% | renderers atuais separados; `meta.js` não executa; Central absorvida pelo domain |
| 7 | Cartas / criação / progressão | 10% | 10% | renderer/progressão canônicos e bridges de resultado único protegidos por contrato |
| 8 | Economia / mercado / cosméticos | 7% | 7% | wallet/realtime/reciclagem/catalog/cosméticos em owners e smoke RC verde |
| 9 | Salas / Lobby | 6% | 6% | 64 combinações de regras cobertas |
| 10 | Gameplay | 9% | 8% | lifecycle, grace period e pipeline crítico contratados; falta smoke real multi-cliente |
| 11 | BUFFs | 6% | 6% | matriz 21/21 fechada |
| 12 | Áudio / narrador | 3% | 3% | owner ativo + recuperação Safari/iPhone/PWA coberta no release-candidate automatizado |
| 13 | Recompensas / loot | 5% | 5% | Saqueador/Espólio/recompensas e handoff pós-partida protegidos por contratos |
| 14 | Consolidação backend de runtime PXX | 5% | 5% | 8/8 helpers em owners canônicos |
| 15 | Remoção de JS/wrappers históricos do runtime | 4% | 4% | monólitos aposentados; bridges restantes têm resultado observável único |
| 16 | Consolidação/remoção de CSS PXX | 4% | 3% | owners/shims classificados; retirada depende de comparação visual real |
| 17 | Release/versionamento consolidado | 2% | 2% | P77 corrente com linhagem histórica preservada |
| 18 | CI final + preview + smoke automatizado de release candidate | 5% | 5% | Actions #929 verde + preview Vercel READY + contrato RC mobile/wallet/multiplayer/rewards verde |
| | **TOTAL** | **100%** | **97%** | |

## Gates fechados mais recentemente

### CI integral e release candidate

- suíte integral do GitHub Actions voltou a verde e permanece protegida como gate obrigatório;
- run **#929** passou após inclusão do contrato de release candidate;
- preview Vercel do mesmo commit ficou **READY**;
- o contrato RC cruza mobile/iPhone, primeiro paint da conta/carteira, sala/ready/grace period, rodada/game over e Saqueador/Espólio;
- nenhum contrato foi removido para obter verde: os testes foram reconciliados com os owners atuais.

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

### iPhone / Safari

- formulários touch preservam fonte mínima de 16px para evitar auto-zoom;
- Mercado usa `100dvh`, safe-area e layout específico para viewport baixa/landscape;
- áudio tenta retomada em gestos permitidos, `pageshow` e retorno de visibilidade.

## O que falta para 100%

Os **3% finais são deliberadamente manuais/observacionais**:

1. **1% — comparação visual real desktop/mobile:** abrir a preview e comparar Home, Perfil, Notificações, Mercado, Minhas Cartas, Rank, Lobby e modais antes de remover qualquer shim CSS.
2. **1% — smoke multiplayer multi-cliente real:** dois ou mais clientes atravessando sala → ready → rodada → resultado → game over → Saqueador/Espólio.
3. **1% — retirada final de shims comprovadamente neutros + revalidação visual:** somente depois da comparação acima.

O ambiente automatizado atual confirmou build/CI/contratos, mas não conseguiu observar visualmente a preview protegida da branch. Portanto esses 3% não serão declarados concluídos por inferência.

## Regras para subir a porcentagem

1. Conta-se responsabilidade eliminada do legado, não arquivo criado.
2. Regra histórica substituída é `SUPERSEDED` e não ganha owner artificial.
3. CSS só sai após prova visual de equivalência.
4. Nenhum smoke automatizado substitui teste visual/multi-cliente real.
5. Mesmo em 100%, a PR permanece Draft até autorização explícita.
