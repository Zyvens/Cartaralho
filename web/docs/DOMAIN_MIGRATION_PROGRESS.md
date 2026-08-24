# Progresso da consolidação por domínio

> Branch de trabalho: `refactor/domain-owners`  
> Baseline funcional reconciliado: **P77 / v1.4.77**  
> Regra de segurança: **não mergear nem marcar a PR #96 como pronta sem autorização expressa**.

## Como a porcentagem é calculada

A porcentagem é ponderada por risco e volume funcional. Mede responsabilidade realmente consolidada, não quantidade de arquivos.

**Implementação atual: 100%**

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
| 9 | Salas / Lobby | 6% | 6% | 64 combinações de regras cobertas; prontidão concorrente protegida por retry otimista e revisão monotônica |
| 10 | Gameplay | 9% | 9% | lifecycle, grace period e pipeline verdes; multi-client simulado + E2E real de 3 clientes contra backend/Pusher confirmados |
| 11 | BUFFs | 6% | 6% | matriz 21/21 fechada |
| 12 | Áudio / narrador | 3% | 3% | owner ativo + recuperação Safari/iPhone/PWA coberta |
| 13 | Recompensas / loot | 5% | 5% | Saqueador/Espólio/recompensas e handoff pós-partida protegidos |
| 14 | Consolidação backend de runtime PXX | 5% | 5% | 8/8 helpers em owners canônicos |
| 15 | Remoção de JS/wrappers históricos do runtime | 4% | 4% | monólitos aposentados; bridges restantes têm resultado observável único |
| 16 | Consolidação/remoção de CSS PXX | 4% | 4% | shims neutros P14–P23 retirados do runtime; owners diretos mantêm a mesma ordem; contratos e browser acceptance permaneceram verdes |
| 17 | Release/versionamento consolidado | 2% | 2% | P77 corrente com linhagem histórica preservada |
| 18 | CI final + preview + smoke automatizado de release candidate | 5% | 5% | contratos, browser acceptance, multi-client simulado e E2E backend/realtime reais verdes; preview HEAD READY com 8 Functions |
| | **TOTAL** | **100%** | **100%** | |

## Gates fechados mais recentemente

### E2E real backend/realtime — gate final

O 1% final foi fechado somente após execução concreta contra o deployment protegido do HEAD, sem converter transporte simulado em evidência real.

A execução auditada **Web tests #1066** (`run 32779596005`) ficou integralmente verde:

- suíte contratual: **verde**;
- browser acceptance desktop/iPhone: **verde**;
- lifecycle multi-client simulado: **verde**;
- acesso ao preview protegido via **Automation Bypass**: **verde** (`HTTP 200`, `<title>CARTARALHO</title>`);
- E2E real `tests/realMultiplayerPreview.js`: **verde**;
- artifact `visual-smoke-evidence` (`9539275428`) preserva relatório JSON e screenshots dos três clientes.

O relatório `real-multiplayer-report.json` registra `realBackend: true` e comprova, em **três clientes reais e autenticados**:

1. registro independente dos três usuários;
2. criação persistida da sala;
3. entrada dos dois participantes adicionais e convergência da lista via Pusher;
4. preservação da autoridade do criador;
5. prontidão concorrente dos três usuários, com revisões persistidas monotônicas e convergência final em todos os clientes;
6. respeito ao mínimo canônico de **3 jogadores**;
7. início aceito pelo backend e `new_round` recebido pelos três clientes;
8. exatamente um Mestre;
9. mão privada própria para cada usuário autenticado;
10. Mestre mantendo sua mão para a rotação futura, mas com `requiredSubmissions = 0` e `canSubmitMore = false`;
11. não-Mestres com submissão habilitada;
12. mãos dos três clientes isoladas entre si.

A prova real encontrou problemas que o transporte simulado não conseguiria detectar; eles foram corrigidos antes do gate ser contabilizado:

- **concorrência de prontidão:** requisições simultâneas podiam colidir em `ROOM_CONFLICT`; o owner de prontidão agora recarrega snapshot fresco e faz retry otimista bounded, sem sobrescrever revisão stale;
- **ordenação realtime:** snapshots completos de `cardsReady` podiam chegar fora de ordem pelo Pusher; o backend agora publica `roomRevision` e `roomSocketLifecycle` rejeita eventos stale;
- **contrato legado do Mestre:** `/api/game/hand` já bloqueava submissão do Mestre, mas reportava `requiredSubmissions = 1` no engine legado; o contrato foi normalizado para `0`, equivalente ao engine avançado, sem retirar a mão necessária à rotação futura.

Essas correções têm contratos próprios para impedir regressão e preservam a trajetória histórica em vez de alterar regras do produto para satisfazer o teste.

### Vercel Hobby: consolidação das Functions

- o deployment do HEAD chegou a falhar com `exceeded_serverless_functions_per_deployment` porque o file-based routing gerava **62 Functions Node**;
- as APIs públicas não foram removidas nem reimplementadas: os handlers de `web/api/**` permanecem módulos autoritativos;
- o deploy passa agora por **8 gateways de domínio**: Auth, Cards, Game, Profile, Rooms, Social, Admin e Root;
- `web/vercel.json` declara explicitamente as 8 Functions Node + assets estáticos, abaixo do limite Hobby de 12;
- `tests/vercelApiGateway.contract.test.js` compara todos os handlers físicos de `api/` contra os gateways e falha se um endpoint ficar sem roteamento ou for registrado duas vezes;
- rotas dinâmicas Admin preservam `type/index` em `req.query`;
- deployment do HEAD `6bd865bf980d35f5ba4644d0c3fae2578b9c91cc` (`dpl_CKM1ZcKvpTqpzo7PUErkHPT1pH6W`) está `READY` com `lambdaRuntimeStats: {"nodejs":8}`.

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
- smoke simulado de dois contextos Playwright percorre `lobby → new_round → card_played → all_cards_played → round_result → game_over → settlement` com isolamento de mão/papel;
- esse smoke permanece corretamente classificado como **transporte simulado** e é complementar ao E2E real de backend/Pusher;
- o RC real usa três clientes porque `MIN_PLAYERS = 3` é regra canônica; o teste não enfraquece essa regra para artificialmente passar;
- `web-tests.yml`, `visual-smoke.yml` e `tests/realMultiplayerPreview.js` aceitam duas vias de acesso a preview protegido sem expor credenciais: **Trusted GitHub OIDC** e **`VERCEL_AUTOMATION_BYPASS_SECRET`**;
- Automation Bypass está operacional no GitHub Actions; o valor do secret nunca é persistido no repositório nem nos artifacts.

## Resultado vs trajetória PXX — fechamento

A consolidação em 100% significa que os resultados observáveis acumulados até P77 possuem owner atual, contrato/evidência compatível ou classificação histórica explícita. Não significa apagar arquivos PXX apenas por terem nome histórico.

- comportamento substituído permanece `SUPERSEDED`, sem owner artificial;
- bridges/foundations que ainda produzem resultado observável único permanecem intencionais;
- CSS histórico só saiu do runtime depois de equivalência visual comprovada;
- regras canônicas de gameplay foram preservadas durante o E2E real: mínimo de 3 jogadores, rotação do Mestre e mãos privadas;
- correções descobertas no RC foram feitas nos owners responsáveis (prontidão, estado/realtime e contrato de mão), não em patches paralelos.

## Regras de encerramento

1. Conta-se responsabilidade eliminada do legado, não arquivo criado.
2. Regra histórica substituída é `SUPERSEDED` e não ganha owner artificial.
3. CSS só sai após prova visual de equivalência.
4. Simulação de múltiplos clientes nunca é contabilizada como smoke multiplayer real.
5. **100% representa fechamento técnico/auditado da consolidação, não autorização de release.**
6. **A PR #96 permanece Draft e não deve ser mergeada nem marcada como pronta até autorização explícita.**
