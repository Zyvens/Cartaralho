# Progresso da consolidação por domínio

> Branch de trabalho: `refactor/domain-owners`  
> Baseline funcional reconciliado: **P75 / v1.4.75**  
> Regra de segurança: **não mergear nem marcar a PR #96 como pronta sem autorização expressa**.

## Como a porcentagem é calculada

A porcentagem abaixo é ponderada por risco e volume funcional. Ela mede **implementação consolidada**, não quantidade de arquivos alterados. Uma etapa só recebe 100% do seu peso quando o comportamento está absorvido pelo owner canônico, o legado correspondente deixou de ser necessário em runtime e os contratos relevantes estão coerentes com a cabeça atual.

**Implementação atual: 76%**

| # | Gate | Peso | Concluído | Situação |
|---|---|---:|---:|---|
| 1 | Sincronização P75 + baseline de CI | 3% | 2% | P75 reconciliada; preview Vercel validado em heads funcionais; GitHub Actions ainda sem execução associada ao head |
| 2 | Matriz de linhagem PXX / auditoria histórica | 7% | 7% | Cadeia P01–P75 fechada: P01–P12 por migrations/revisões, P13–P32 por contratos históricos e P33–P75 por owners/matrizes de trajetória |
| 3 | Core de ownership / lifecycle | 7% | 6% | Registry e writers finais ativos; lifecycle de `app.js` possui contrato, mas bootstrap/estado/socket ainda estão no monólito |
| 4 | Design system / fundação CSS | 5% | 0% | Fundação geral ainda depende da cascata histórica; migrações específicas começaram pelo Gate 16 |
| 5 | Auth / conta / Home / perfil / créditos | 6% | 5% | Owners ativos; P73/P74/P75 reconciliados e account strip já possui owner visual; falta fechamento visual/browser integral |
| 6 | Social / notificações / missões / Rank / Stats / histórico | 6% | 5% | Owners principais ativos e contratos recentes migrados; revisão visual final pendente |
| 7 | Cartas / criação / progressão | 10% | 9% | Renderer, autoria, criação, raridade e progressão canônicos; raridade/cards compactos já iniciaram migração visual; legado visual restante pendente |
| 8 | Economia / mercado / cosméticos | 7% | 6% | Wallet P75, realtime, reciclagem, catálogo e cosméticos em owners; falta consolidação visual e validação final |
| 9 | Salas / Lobby | 6% | 6% | Matriz completa fechada: 64 combinações de flags, limites, autoridade, snapshot, capacidade e sincronização possuem contrato |
| 10 | Gameplay | 9% | 5% | Owner complementar ativo; lifecycle integral e telas-base ainda precisam consolidação |
| 11 | BUFFs | 6% | 6% | Matriz funcional 21/21 fechada por papel, alvo, fase e owner; engines e exceção canônica do Amigo de Merda estão protegidos por contrato |
| 12 | Áudio / narrador | 3% | 2% | Owner canônico e contratos migrados; falta validação real de browser/iPhone |
| 13 | Recompensas / loot | 5% | 5% | Matriz server-side fechada: colocação, sobrevivência, consolação, Espólio, contribuição, Saqueador e idempotência estão protegidos por cenário |
| 14 | Consolidação backend de runtime PXX | 5% | 5% | 8/8 helpers de runtime PXX possuem owner canônico sem sufixo; arquivos PXX restantes são aliases de compatibilidade sem regra duplicada |
| 15 | Remoção de JS/wrappers históricos do runtime | 4% | 3% | P33–P74 e wrappers absorvidos estão não executáveis; módulos-base restantes ainda precisam classificação |
| 16 | Consolidação/remoção de CSS PXX | 4% | 1% | Cinco resultados já possuem owner visual canônico: P59, P60, P66, P68 e P73/P74; PXX correspondentes viraram shims/marcadores mantendo a posição da cascata |
| 17 | Release/versionamento consolidado | 2% | 2% | P75 formalizada em `releaseP75`, `/api/version` e Central de Notificações |
| 18 | CI final + preview + aceite interno | 5% | 0% | Builds Vercel verdes não substituem CI integral e aceite desktop/mobile |
| | **TOTAL** | **100%** | **76%** | |

## Regras para subir a porcentagem

1. Não se contabiliza arquivo criado; contabiliza-se **responsabilidade eliminada do legado** ou gate de auditoria/validação efetivamente fechado.
2. Um owner pode estar ativo e ainda não estar completo se uma implementação histórica executável continuar concorrendo com ele.
3. CSS só conta quando a regra visual foi classificada, migrada e validada antes da remoção do PXX correspondente.
4. Backend só conta quando helpers de runtime com sufixo de pacote forem absorvidos/renomeados sem quebrar contratos das APIs.
5. Os últimos 5% são reservados a CI integral, preview desktop/mobile e matriz de aceite; portanto **100% nunca significa “parece pronto”**.
6. Ao atingir 100%, a PR continua Draft até a verificação conjunta e autorização explícita para avaliar merge.

## Trabalho fechado desde o checkpoint anterior

- P75 reconciliado nos owners `accountUI` + `marketplaceUI` sem reativar patch histórico.
- primeiro paint de Moedas Sujas usa `dirty_balance` autenticado/cache e não dispara fetch concorrente no render da Home.
- confirmação autoritativa usa `/api/profile/wallet` e coalescing por Promise em voo.
- release P75 registrada em API de versão e Central de Notificações.
- backend PXX fechado em 8/8: `achievementBackfill`, `amigoDeMerda`, `balanceRealtime`, `cardCollectionProgress`, `creatorAdmin`, `matchStart`, `matchSubmit` e `roomConfig` são os owners canônicos; os nomes P6/P7/P19/P32/P37/P63/P64 são somente aliases de compatibilidade.
- `BUFF_FUNCTIONAL_MATRIX.md` + `buffFunctionalMatrix.contract.test.js` congelam os 21 BUFFs por papel, alvo, fases e engine/owner.
- `REWARD_LOOT_MATRIX.md` + `rewardLootMatrix.contract.test.js` congelam colocação, sobrevivência, consolação, Espólio, elegibilidade por contribuição, janela de 15s do Saqueador e idempotência.
- `EARLY_PACKAGE_LINEAGE.md` + `earlyPackageLineage.contract.test.js` fecham a ponte histórica P01–P32; com a matriz P33–P75, a auditoria causal cobre P01→P75.
- `ROOM_RULE_MATRIX.md` + `roomRuleMatrix.contract.test.js` cobrem as 64 combinações de regras da sala, limites, freeze por snapshot e independência criação/reuso.
- `APP_LIFECYCLE_AUDIT.md` + `appLifecycle.contract.test.js` congelam bootstrap, estado/reset, roteador-base e eventos de socket antes da decomposição; este trabalho não recebeu ponto próprio enquanto código ainda permanecer no `app.js`.
- `CSS_VISUAL_OWNERSHIP_MATRIX.md` formaliza a migração por resultado e preservação de posição da cascata via shims.
- `accountCurrent.css` absorveu P73/P74; P73 virou marcador histórico e P74 somente importa o owner na posição final original.
- `mobileFormsCurrent.css` absorveu P66 (iOS/touch/Admin); `cardRarityCurrent.css` absorveu P68; `cardCompactCurrent.css` e `cardTypographyMissionsCurrent.css` preservam separadamente a trajetória P59→P60.
- commits funcionais dessas ondas CSS chegaram a deploy Vercel `READY`; o aceite visual final continua reservado ao Gate 18.

## Próxima sequência

- continuar a consolidação CSS por resultados de baixo risco, mantendo precedência por shim até o gate visual final;
- extrair responsabilidade executável do `app.js` em etapas, começando por estado/reset quando houver segurança suficiente para edição do controller;
- classificar/remover módulos-base JS restantes somente após ownership provado;
- fechar lifecycle integral de gameplay sem alterar eventos de rede;
- obter CI integral + preview desktop/mobile + aceite interno;
- somente após aprovação explícita considerar merge na `main`.
