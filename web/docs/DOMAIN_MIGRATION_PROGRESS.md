# Progresso da consolidação por domínio

> Branch de trabalho: `refactor/domain-owners`  
> Baseline funcional reconciliado: **P75 / v1.4.75**  
> Regra de segurança: **não mergear nem marcar a PR #96 como pronta sem autorização expressa**.

## Como a porcentagem é calculada

A porcentagem abaixo é ponderada por risco e volume funcional. Ela mede **implementação consolidada**, não quantidade de arquivos alterados. Uma etapa só recebe 100% do seu peso quando o comportamento está absorvido pelo owner canônico, o legado correspondente deixou de ser necessário em runtime e os contratos relevantes estão coerentes com a cabeça atual.

**Implementação atual: 64%**

| # | Gate | Peso | Concluído | Situação |
|---|---|---:|---:|---|
| 1 | Sincronização P75 + baseline de CI | 3% | 2% | P75 reconciliada; preview Vercel verde; GitHub Actions ainda sem execução associada ao head |
| 2 | Matriz de linhagem PXX / auditoria histórica | 7% | 6% | Trajetória recente P49–P75 e wrappers críticos auditados; pacotes iniciais ainda precisam fechamento integral |
| 3 | Core de ownership / lifecycle | 7% | 6% | Registry e writers finais ativos; `app.js` ainda concentra bootstrap/estado/socket lifecycle |
| 4 | Design system / fundação CSS | 5% | 0% | CSS histórico continua ativo |
| 5 | Auth / conta / Home / perfil / créditos | 6% | 5% | Owners ativos; P73/P74/P75 reconciliados; falta fechamento CSS/browser |
| 6 | Social / notificações / missões / Rank / Stats / histórico | 6% | 5% | Owners principais ativos e contratos recentes migrados; revisão histórica/visual final pendente |
| 7 | Cartas / criação / progressão | 10% | 9% | Renderer, autoria, criação, raridade e progressão canônicos; falta consolidação visual/legado final |
| 8 | Economia / mercado / cosméticos | 7% | 6% | Wallet P75, realtime, reciclagem, catálogo e cosméticos em owners; falta consolidação CSS/backend final |
| 9 | Salas / Lobby | 6% | 5% | Owner absorveu sincronização principal; matriz completa de combinações ainda pendente |
| 10 | Gameplay | 9% | 5% | Owner complementar ativo; lifecycle integral e telas-base ainda precisam consolidação |
| 11 | BUFFs | 6% | 4% | Owner de UI ativo e engine preservado; divergências e matriz funcional ainda precisam fechamento |
| 12 | Áudio / narrador | 3% | 2% | Owner canônico e contratos migrados; falta validação real de browser/iPhone |
| 13 | Recompensas / loot | 5% | 3% | Owner e engine preservados; cenários de elegibilidade/Saqueador ainda pendentes |
| 14 | Consolidação backend de runtime PXX | 5% | 0% | Próxima frente: classificar/absorver helpers de runtime com sufixo de pacote sem quebrar APIs |
| 15 | Remoção de JS/wrappers históricos do runtime | 4% | 3% | P33–P74 e wrappers absorvidos estão não executáveis; módulos-base restantes ainda precisam classificação |
| 16 | Consolidação/remoção de CSS PXX | 4% | 0% | Não iniciada |
| 17 | Release/versionamento consolidado | 2% | 2% | P75 formalizada em `releaseP75`, `/api/version` e Central de Notificações |
| 18 | CI final + preview + aceite interno | 5% | 0% | Preview Vercel verde não substitui CI integral e aceite desktop/mobile |
| | **TOTAL** | **100%** | **64%** | |

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
- workflow atualizado para incluir branches `refactor/**`; preview Vercel da branch permanece verde.

## Próxima sequência

- classificar e consolidar helpers/backend com sufixos PXX;
- fechar matriz funcional de BUFFs e rewards/loot antes de qualquer mudança de regra;
- decompor `app.js` somente com prova de lifecycle/estado/socket preservada;
- consolidar CSS por domínio com comparação visual;
- obter CI integral + preview desktop/mobile + aceite interno;
- somente após aprovação explícita considerar merge na `main`.
