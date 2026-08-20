# Progresso da consolidação por domínio

> Branch de trabalho: `refactor/domain-owners`  
> Baseline funcional: **P74 / v1.4.74**  
> Regra de segurança: **não mergear nem marcar a PR #96 como pronta sem autorização expressa**.

## Como a porcentagem é calculada

A porcentagem abaixo é ponderada por risco e volume funcional. Ela mede **implementação consolidada**, não quantidade de arquivos alterados. Uma etapa só recebe 100% do seu peso quando o comportamento está absorvido pelo owner canônico, o legado correspondente deixou de ser necessário em runtime e os contratos relevantes estão passando.

**Implementação atual: 56%**

| # | Gate | Peso | Concluído | Situação |
|---|---|---:|---:|---|
| 1 | Sincronização P74 + baseline de CI | 3% | 2% | P74 sincronizada; falta fechar CI da cabeça atual |
| 2 | Matriz de linhagem PXX / auditoria histórica | 7% | 4% | Linhagens críticas recentes e wrappers nomeados auditados; pacotes iniciais ainda pendentes |
| 3 | Core de ownership / lifecycle | 7% | 6% | Registry e writers finais ativos; falta consolidar eventos/estado onde ainda há acoplamento |
| 4 | Design system / fundação CSS | 5% | 0% | CSS histórico continua ativo |
| 5 | Auth / conta / Home / perfil / créditos | 6% | 5% | Owners ativos e P73/P74 absorvidos; falta fechar compatibilidades e CSS |
| 6 | Social / notificações / missões / Rank / Stats / histórico | 6% | 5% | Owners principais ativos; revisão histórica/visual ainda necessária |
| 7 | Cartas / criação / progressão | 10% | 8% | Renderer, autoria, criação e progressão canônicos; fechamento visual e legado restante pendentes |
| 8 | Economia / mercado / cosméticos | 7% | 5% | Wallet/realtime/reciclagem e catálogo em owners; cosméticos ainda possuem wrapper histórico executável |
| 9 | Salas / Lobby | 6% | 5% | Owner absorveu sincronização principal; matriz completa de combinações ainda pendente |
| 10 | Gameplay | 9% | 5% | Owner complementar ativo; lifecycle integral e telas-base ainda precisam consolidação |
| 11 | BUFFs | 6% | 4% | Owner de UI ativo e engine preservado; falta fechar matriz dos 21 BUFFs |
| 12 | Áudio / narrador | 3% | 2% | Owner canônico e contratos migrados; falta validação real de browser/iPhone |
| 13 | Recompensas / loot | 5% | 3% | Owner e engine preservados; cenários de elegibilidade/Saqueador ainda pendentes |
| 14 | Consolidação backend de runtime PXX | 5% | 0% | Ainda não iniciada; APIs permanecem estáveis |
| 15 | Remoção de JS/wrappers históricos do runtime | 4% | 2% | P33–P74 e wrappers absorvidos já estão não executáveis; ainda existem módulos-base/wrappers a classificar |
| 16 | Consolidação/remoção de CSS PXX | 4% | 0% | Não iniciada |
| 17 | Release/versionamento consolidado | 2% | 0% | P74 continua como release formal durante a migração |
| 18 | CI final + preview + aceite interno | 5% | 0% | Só será contabilizado no fechamento |
| | **TOTAL** | **100%** | **56%** | |

## Regras para subir a porcentagem

1. Não se contabiliza arquivo criado; contabiliza-se **responsabilidade eliminada do legado**.
2. Um owner pode estar ativo e ainda não estar completo se uma implementação histórica executável continuar concorrendo com ele.
3. CSS só conta quando a regra visual foi classificada, migrada e validada antes da remoção do PXX correspondente.
4. Backend só conta quando helpers de runtime com sufixo de pacote forem absorvidos/renomeados sem quebrar contratos das APIs.
5. Os últimos 5% são reservados a CI integral, preview desktop/mobile e matriz de aceite; portanto **100% nunca significa “parece pronto”**.
6. Ao atingir 100%, a PR continua Draft até a verificação conjunta e autorização explícita para avaliar merge.

## Próxima sequência

- fechar CI da cabeça atual;
- concluir a matriz de linhagem dos pacotes iniciais usando leitura recente→antiga para rastreio e antiga→recente para validação causal;
- eliminar o wrapper executável de cosméticos, preservando permanent ownership, nível mínimo e molduras/títulos;
- avançar para core/lifecycle e, em seguida, CSS por domínio;
- só então consolidar backend runtime e remover referências históricas remanescentes.
