# Auditoria de linhagem inicial — P01 a P32

> Branch: `refactor/domain-owners`  
> Baseline atual: **P75 / v1.4.75**  
> Fontes primárias: `db/README_REVISIONS.md`, migrations aditivas P01–P12 e contratos históricos P13–P32.

## Regra de leitura

Esta auditoria não trata o pacote antigo como owner atual. Para cada pacote, a pergunta é: **qual responsabilidade ele introduziu e onde essa responsabilidade vive hoje?** Migrations e contratos permanecem como evidência `HISTORICAL`; implementação executável deve estar em módulos/owners sem dependência do número da revisão, salvo aliases `COMPAT` temporários.

## P01–P12 — metajogo estruturante

| Pacote | Responsabilidade histórica | Estado atual / owner canônico |
|---|---|---|
| P01 | identidade canônica, autoria e genealogia | `canonicalCards`, `cardOrigins`, APIs de cartas e owners `cardsLibrary`/`identityUI`; estruturas legadas permanecem compatíveis, não autoritativas |
| P02 | economia e Match Reward Engine | `balanceConfig`, `rewardEngineRules`, `advancedRewards`, wallet/ledger; schema consolidado em `professional_revision.sql` |
| P03 | Cartas Limpas: inventário, grant 20+20, compra 200, criação transacional | `cleanCards`, `canonicalSubmission`, serviços de criação/mercado e `cardCreationUI`/`marketplaceUI` |
| P04 | progressão dupla, eventos, estatísticas globais e Legado | `cardProgressionRules`, `cardProgressionService`, owner `cardProgression`; métricas antigas ficam apenas como compatibilidade |
| P05 | Mercado Paralelo base | módulos `marketplace*`, APIs do mercado e owners `marketplaceUI`/`marketplaceCatalogUI`/`cosmeticsUI` |
| P06 | Espólio e settlement | `matchLoot`, `matchLootRules`, `matchStart`, `matchSubmit`; antigos nomes P6 são aliases `COMPAT` |
| P07 | configuração/snapshot de partida | `roomConfig`, `roomStore`, APIs/owner `roomUI`; `roomConfigP7` é alias `COMPAT` |
| P08 | BUFFs simples | `buffDefinitions`, `buffEngine`, owner `buffsUI`; semântica protegida pela matriz funcional 21/21 |
| P09 | BUFFs avançados, Round Engine e Saqueador | `advancedBuffEngine`, `advancedRoundEngine`, `advancedRewards`; regras de Saqueador congeladas na matriz econômica |
| P10 | achievements, missões e royalties | `achievementService`, `achievementDefinitions`, `missionService`, owners `achievementsUI`/`missionsUI` e economia do mercado |
| P11 | cosméticos, prestígio e Celestial | `prestigeDefinitions`, `prestigeService`, marketplace cosmético, `profileUI`/`cosmeticsUI` |
| P12 | hardening, telemetria e índices operacionais | `telemetry`, revisão otimista/persistência de sala, `http` no-store e configuração econômica versionada |

### Invariantes P01–P12 preservados

- migrations são **aditivas/idempotentes** e não devem ser apagadas na limpeza de runtime;
- cartas e estatísticas existentes permanecem preservadas;
- P03 mantém estoque separado de Cartas Limpas e criação transacional;
- P04 mantém eventos persistidos mesmo quando renderer/visual muda;
- P12 mantém economia versionada e ajustes por configuração, sem exigir migration destrutiva.

## P13–P25 — integração e estabilização do produto

| Pacote | Trajetória preservada no estado atual |
|---|---|
| P13 | integração de áudio + refinamentos; hoje owned por `audioUI`, com recovery posterior preservado |
| P14 | sincronização/polimento de sala; hoje owned por `roomUI` + lifecycle base |
| P15 | layout/resumo visual; permanece como requisito visual a consolidar no Gate CSS |
| P16 | estado Pronto + reciclagem; regras de contribuição/reciclagem hoje em owners canônicos |
| P17 | raridade/molduras; semântica evoluiu para progressão e identidade atuais |
| P18 | contribuição + notificações; elegibilidade final hoje revalidada server-side e notificações têm owner próprio |
| P19 | integridade ampla: duas lacunas, round avançado, aparência, badges/backfill; funcionalidades atuais distribuídas entre gameplay, progressão, perfil e achievements |
| P20 | cosméticos públicos/showcase; hoje `cosmeticsUI` + `showcaseUI` |
| P21 | correções pequenas de UI; preservadas como requisitos, não como ownership de patch |
| P22 | recompensa + Gênese + mobile; recompensa hoje possui matriz server-side e Gênese segue owner próprio |
| P23 | save único de perfil/Gênese; aparência só persiste pelo salvamento global canônico |
| P24 | copy de achievements + ordem da Home; ordem hoje `navigationUI` |
| P25 | menu mobile + save único; comportamento atual preservado por owners de navegação/perfil |

## P26–P32 — trajetória da Gênese, áudio e Amigo de Merda

- **P26:** introduz a moldura Gênese.
- **P27:** estabiliza ordem/Home ao redor do efeito.
- **P28:** recovery de música e continuidade visual.
- **P29:** órbita atômica.
- **P30:** estrela/Platina.
- **P31:** composição final com seis estrelas.
- **P32:** polimento final, iPhone/PWA e regra autoritativa do Amigo de Merda.

Resultado atual:

- Gênese é `CURRENT` em `domains/genesisFrameUI.js`; patches P26–P31 são trajetória `HISTORICAL`/`SUPERSEDED` quanto à implementação intermediária.
- áudio/recovery é `CURRENT` em `audioUI` + soundtrack/SFX base; patches P28/P32 não voltam a executar como writers concorrentes.
- Amigo de Merda é `CURRENT` em `lib/amigoDeMerda.js`: devolve a mão inteira ao pool, embaralha e compra nova mão do mesmo tamanho, server-side, transacional e idempotente. `amigoDeMerdaP32.js` é somente `COMPAT`.

## Ponte para P33–P75

A partir de P33, a auditoria detalhada já está registrada em `LEGACY_LINEAGE_MATRIX.md`, nos contratos P33–P75 e no documento específico de P75. Assim, a cadeia P01→P75 fica coberta sem lacuna de pacote:

- **P01–P12:** migrations + esta matriz + contratos do metajogo;
- **P13–P32:** contratos históricos contínuos + esta matriz;
- **P33–P75:** owners de domínio + `LEGACY_LINEAGE_MATRIX.md` + contratos de release/resultado.

## Classificação final

- migrations SQL P01–P12: `HISTORICAL` permanente e executáveis apenas como migration, não como runtime de request/UI;
- aliases backend P6/P7/P19/P32 etc.: `COMPAT`, sem ownership de regra;
- patches JS históricos absorvidos: `HISTORICAL`/`SUPERSEDED`, não executáveis;
- módulos/owners canônicos atuais: `CURRENT`.

## Evidência

- `db/README_REVISIONS.md`
- migrations `metagame_v1_4_package1` a `package12`
- contratos históricos P13–P32 já existentes
- `tests/earlyPackageLineage.contract.test.js`
- `docs/LEGACY_LINEAGE_MATRIX.md`
- `docs/BUFF_FUNCTIONAL_MATRIX.md`
- `docs/REWARD_LOOT_MATRIX.md`

Com esta ponte, o **Gate 2 — Matriz de linhagem/auditoria histórica está fechado**. Isso não autoriza apagar migrations nem CSS histórico; remoção física continua condicionada aos gates específicos de runtime e visual.
