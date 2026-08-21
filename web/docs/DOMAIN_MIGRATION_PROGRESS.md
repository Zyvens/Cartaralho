# Progresso da consolidação por domínio

> Branch de trabalho: `refactor/domain-owners`  
> Baseline funcional reconciliado: **P75 / v1.4.75**  
> Regra de segurança: **não mergear nem marcar a PR #96 como pronta sem autorização expressa**.

## Como a porcentagem é calculada

A porcentagem abaixo é ponderada por risco e volume funcional. Ela mede **implementação consolidada**, não quantidade de arquivos alterados. Uma etapa só recebe 100% do seu peso quando o comportamento está absorvido pelo owner canônico, o legado correspondente deixou de ser necessário em runtime e os contratos relevantes estão coerentes com a cabeça atual.

**Implementação atual: 73%**

| # | Gate | Peso | Concluído | Situação |
|---|---|---:|---:|---|
| 1 | Sincronização P75 + baseline de CI | 3% | 2% | P75 reconciliada; preview Vercel já validado em heads anteriores; GitHub Actions ainda sem execução associada ao head |
| 2 | Matriz de linhagem PXX / auditoria histórica | 7% | 6% | Trajetória recente P49–P75 e wrappers críticos auditados; pacotes iniciais ainda precisam fechamento integral |
| 3 | Core de ownership / lifecycle | 7% | 6% | Registry e writers finais ativos; `app.js` ainda concentra bootstrap/estado/socket lifecycle |
| 4 | Design system / fundação CSS | 5% | 0% | CSS histórico continua ativo |
| 5 | Auth / conta / Home / perfil / créditos | 6% | 5% | Owners ativos; P73/P74/P75 reconciliados; falta fechamento CSS/browser |
| 6 | Social / notificações / missões / Rank / Stats / histórico | 6% | 5% | Owners principais ativos e contratos recentes migrados; revisão histórica/visual final pendente |
| 7 | Cartas / criação / progressão | 10% | 9% | Renderer, autoria, criação, raridade e progressão canônicos; falta consolidação visual/legado final |
| 8 | Economia / mercado / cosméticos | 7% | 6% | Wallet P75, realtime, reciclagem, catálogo e cosméticos em owners; falta consolidação CSS e validação final |
| 9 | Salas / Lobby | 6% | 5% | Owner absorveu sincronização principal; matriz completa de combinações ainda pendente |
| 10 | Gameplay | 9% | 5% | Owner complementar ativo; lifecycle integral e telas-base ainda precisam consolidação |
| 11 | BUFFs | 6% | 6% | Matriz funcional 21/21 fechada por papel, alvo, fase e owner; engines e exceção canônica do Amigo de Merda estão protegidos por contrato |
| 12 | Áudio / narrador | 3% | 2% | Owner canônico e contratos migrados; falta validação real de browser/iPhone |
| 13 | Recompensas / loot | 5% | 5% | Matriz server-side fechada: colocação, sobrevivência, consolação, Espólio, contribuição, Saqueador e idempotência estão protegidos por cenário |
| 14 | Consolidação backend de runtime PXX | 5% | 5% | 8/8 helpers de runtime PXX possuem owner canônico sem sufixo; arquivos PXX restantes são aliases de compatibilidade sem regra duplicada |
| 15 | Remoção de JS/wrappers históricos do runtime | 4% | 3% | P33–P74 e wrappers absorvidos estão não executáveis; módulos-base restantes ainda precisam classificação |
| 16 | Consolidação/remoção de CSS PXX | 4% | 0% | Não iniciada |
| 17 | Release/versionamento consolidado | 2% | 2% | P75 formalizada em `releaseP75`, `/api/version` e Central de Notificações |
| 18 | CI final + preview + aceite interno | 5% | 0% | Preview Vercel verde não substitui CI integral e aceite desktop/mobile |
| | **TOTAL** | **100%** | **73%** | |

## Regras para subir a porcentagem

1. Não se contabiliza arquivo criado; contabiliza-se **responsabilidade eliminada do legado**.
2. Um owner pode estar ativo e ainda não estar completo se uma implementação histórica executável continuar concorrendo com ele.
3. CSS só conta quando a regra visual foi classificada, migrada e validada antes da remoção do PXX correspondente.
4. Backend só conta quando helpers de runtime com sufixo de pacote forem absorvidos/renomeados sem quebrar contratos das APIs.
5. Os últimos 5% são reservados a CI integral, preview desktop/mobile e matriz de aceite; portanto **100% nunca significa “parece pronto”**.
6. Ao atingir 100%, a PR continua Draft até a verificação conjunta e autorização explícita para avaliar merge.

## Trabalho fechado desde o checkpoint anterior

- P75 reconciliado nos owners `accountUI` + `marketplaceUI` sem reativar patch histórico.
- primeiro paint de Moedas Sujas usa `dirty_balance` autenticado/cache e não dispara fetch concorrente no render da Home.
- confirmação autoritativa usa `/api/profile/wallet` e coalescing por Promise em voo.
- contratos P49–P58, P61–P68 e P71–P75 auditados/migrados para owners ou tornados future-proof; P59/P60 já aceitavam releases posteriores.
- release P75 registrada em API de versão e Central de Notificações.
- workflow atualizado para incluir branches `refactor/**`; preview Vercel da branch já passou em heads desta consolidação.
- backend PXX fechado em 8/8: `achievementBackfill`, `amigoDeMerda`, `balanceRealtime`, `cardCollectionProgress`, `creatorAdmin`, `matchStart`, `matchSubmit` e `roomConfig` são os owners canônicos; os nomes P6/P7/P19/P32/P37/P63/P64 são somente aliases de compatibilidade.
- `Amigo de Merda` foi revalidado pela trajetória P32: devolve a mão inteira ao baralho, embaralha e compra nova mão do mesmo tamanho, com persistência transacional e idempotente.
- `BUFF_FUNCTIONAL_MATRIX.md` + `buffFunctionalMatrix.contract.test.js` congelam os 21 BUFFs por papel, alvo, fases e engine/owner; o ramo antigo de shuffle do Amigo nos engines genéricos não é a rota oficial.
- `REWARD_LOOT_MATRIX.md` + `rewardLootMatrix.contract.test.js` congelam colocação, sobrevivência, consolação, Espólio, elegibilidade por contribuição, janela de 15s do Saqueador e idempotência.

## Próxima sequência

- decompor `app.js` somente com prova de lifecycle/estado/socket preservada;
- concluir auditoria dos pacotes históricos iniciais;
- construir matriz visual e consolidar CSS por domínio com comparação desktop/mobile;
- fechar lifecycle integral de gameplay/salas sem alterar eventos de rede;
- obter CI integral + preview desktop/mobile + aceite interno;
- somente após aprovação explícita considerar merge na `main`.
