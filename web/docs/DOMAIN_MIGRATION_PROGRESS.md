# Progresso da consolidação por domínio

> Branch de trabalho: `refactor/domain-owners`  
> Baseline funcional reconciliado: **P77 / v1.4.77**  
> Regra de segurança: **não mergear nem marcar a PR #96 como pronta sem autorização expressa**.

## Como a porcentagem é calculada

A porcentagem é ponderada por risco e volume funcional. Mede responsabilidade realmente consolidada, não quantidade de arquivos.

**Implementação atual: 99%**

| # | Gate | Peso | Concluído | Situação |
|---|---|---:|---:|---|
| 1 | Sincronização P77 + baseline de CI | 3% | 3% | `main@P77` reconciliada; branch behind=0 |
| 2 | Matriz de linhagem PXX / auditoria histórica | 7% | 7% | Cadeia P01–P77 fechada |
| 3 | Core de ownership / lifecycle | 7% | 7% | estado/router/turno/bootstrap + eventos core em owners próprios; `app.js` é shell lexical |
| 4 | Design system / fundação CSS | 5% | 5% | trajetória classificada e comparação visual desktop/mobile executada |
| 5 | Auth / conta / Home / perfil / créditos | 6% | 6% | owners finais e P77 da carteira preservados |
| 6 | Social / notificações / missões / Rank / Stats / histórico | 6% | 6% | renderers atuais separados; `meta.js` não executa |
| 7 | Cartas / criação / progressão | 10% | 10% | renderer/progressão canônicos e bridges de resultado único protegidos |
| 8 | Economia / mercado / cosméticos | 7% | 7% | wallet/realtime/reciclagem/catalog/cosméticos em owners; P17 e slot único de moldura contratados |
| 9 | Salas / Lobby | 6% | 6% | 64 combinações de regras cobertas |
| 10 | Gameplay | 9% | 8% | lifecycle, grace period, pipeline e multi-client simulado verdes; falta E2E real contra backend/realtime |
| 11 | BUFFs | 6% | 6% | matriz 21/21 fechada |
| 12 | Áudio / narrador | 3% | 3% | owner ativo + recuperação Safari/iPhone/PWA coberta |
| 13 | Recompensas / loot | 5% | 5% | Saqueador/Espólio/recompensas e handoff pós-partida protegidos |
| 14 | Consolidação backend de runtime PXX | 5% | 5% | 8/8 helpers em owners canônicos |
| 15 | Remoção de JS/wrappers históricos do runtime | 4% | 4% | monólitos aposentados; bridges restantes têm resultado observável único |
| 16 | Consolidação/remoção de CSS PXX | 4% | 4% | shims neutros P14–P23 retirados do runtime; owners diretos mantêm a mesma ordem; contratos e browser acceptance permaneceram verdes |
| 17 | Release/versionamento consolidado | 2% | 2% | P77 corrente com linhagem histórica preservada |
| 18 | CI final + preview + smoke automatizado de release candidate | 5% | 5% | contratos, browser acceptance e multi-client simulado verdes; preview atual deploya com 8 Functions; gate protegido aceita OIDC ou Automation Bypass |
| | **TOTAL** | **100%** | **99%** | |

## Gates fechados mais recentemente

### Vercel Hobby: consolidação das Functions

- o deployment do HEAD chegou a falhar com `exceeded_serverless_functions_per_deployment` porque o file-based routing gerava **62 Functions Node**;
- as APIs públicas não foram removidas nem reimplementadas: os handlers de `web/api/**` permanecem módulos autoritativos;
- o deploy passa agora por **8 gateways de domínio**: Auth, Cards, Game, Profile, Rooms, Social, Admin e Root;
- `web/vercel.json` declara explicitamente as 8 Functions Node + assets estáticos, abaixo do limite Hobby de 12;
- `tests/vercelApiGateway.contract.test.js` compara todos os handlers físicos de `api/` contra os gateways e falha se um endpoint ficar sem roteamento ou for registrado duas vezes;
- rotas dinâmicas Admin preservam `type/index` em `req.query`;
- deployments recentes da branch permanecem `READY` com `lambdaRuntimeStats: {"nodejs":8}`.

### Consolidação CSS

- os shims P14–P23 eram apenas `@import` históricos;
- o `index.html` passou a carregar diretamente os owners canônicos na mesma posição e ordem da cascata;
- contratos P14/P15/P16/P17/P18/P21/P22/P23/P26 foram reconciliados para provar `owner direto + shim histórico fora do runtime`;
- após a retirada, browser acceptance continuou verde em desktop/mobile e o lifecycle multi-client simulado continuou verde.

### Auditoria canônica de cosméticos e molduras

- P17 é o rebalance corrente das **17 molduras compráveis**;
- ordem: **Comum → Incomum → Raro → Épico → Lendário → Celestial**;
- P33–P36 refinam apenas efeitos visuais específicos;
- Bronze/Prata/Ouro/Platina continuam molduras de progressão livremente selecionáveis depois do desbloqueio;
- progressão, cosméticos e molduras especiais compartilham o mesmo `equipped_frame_key`/`frameKey`;
- existe um único slot de moldura: uma moldura escolhida ou nenhuma; não há sobreposição progressão + cosmético.

### QA visual e multiplayer automatizado

- browser acceptance percorre Home, Perfil, Notificações, Mercado, Minhas Cartas, Rank, Stats e Lobby;
- desktop 1440×1000 e viewport 390×844/iPhone são verificados sem overflow estrutural;
- primeiro paint preserva carteira e ícones Perfil/Sair;
- smoke de dois contextos Playwright passa pelo lifecycle `lobby → new_round → card_played → all_cards_played → round_result → game_over → settlement` com isolamento de mão/papel;
- esse smoke continua classificado corretamente como **transporte simulado**, não como backend/realtime real;
- `web-tests.yml`, `visual-smoke.yml` e `tests/realMultiplayerPreview.js` aceitam agora duas vias de acesso a preview protegido sem expor credenciais: **Trusted GitHub OIDC** e **`VERCEL_AUTOMATION_BYPASS_SECRET`**;
- se o preview ficar público, o runner real também continua válido sem mecanismo de bypass.

## O que falta para 100%

Resta **1%**, deliberadamente fora da contagem até prova concreta:

**E2E multiplayer multi-cliente contra backend/realtime real do HEAD da branch.**

A deployabilidade não é mais bloqueio: o HEAD continua gerando **8 Functions Node**. O único gate restante é **Deployment Protection**.

A execução auditada do workflow **Web tests #1032** confirmou simultaneamente:

- suíte contratual: verde;
- browser acceptance: verde;
- lifecycle multi-client simulado: verde;
- GitHub OIDC: token emitido;
- `VERCEL_AUTOMATION_BYPASS_SECRET`: **não configurado no GitHub Actions**;
- preview com OIDC: HTTP 200, porém HTML de `<title>Login – Vercel</title>`;
- E2E real: corretamente não executado, pois o CI ainda não recebeu acesso trusted/bypass ao deployment.

Portanto, não existe comportamento funcional pendente identificado no código para esse 1%. Para liberar a prova final, basta uma das duas configurações externas:

1. habilitar **GitHub Actions como Trusted Source** no Deployment Protection do projeto Vercel; ou
2. gerar um **Automation Bypass** na Vercel e cadastrar o valor como secret do repositório com o nome exato `VERCEL_AUTOMATION_BYPASS_SECRET`.

Depois disso, o E2E existente `tests/realMultiplayerPreview.js` valida automaticamente em dois clientes reais: registro → criação da sala → entrada → broadcast de jogadores → ready → início → `new_round` → papel de Mestre → isolamento da mão privada.

## Regras para subir a porcentagem

1. Conta-se responsabilidade eliminada do legado, não arquivo criado.
2. Regra histórica substituída é `SUPERSEDED` e não ganha owner artificial.
3. CSS só sai após prova visual de equivalência.
4. Simulação de múltiplos clientes não será contabilizada como smoke multiplayer real.
5. Mesmo em 100%, a PR permanece Draft até autorização explícita.