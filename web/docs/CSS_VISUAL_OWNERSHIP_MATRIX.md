# Matriz de ownership visual — CSS histórico → owners atuais

> Branch: `refactor/domain-owners`  
> Baseline funcional: **P77 / v1.4.77**  
> Regra de segurança: consolidação visual não pode alterar a posição efetiva da cascata antes do gate de comparação/aceite.

## Estratégia

1. regra vigente sai do PXX e vai para owner nomeado pelo resultado/domínio;
2. PXX pode permanecer temporariamente como shim `@import` na posição histórica quando essa posição ainda faz parte da equivalência observável;
3. regra comprovadamente substituída vira `SUPERSEDED` e **não** recebe owner novo;
4. shims neutros só saem do `index` depois de comparação desktop/mobile; essa prova já foi concluída para P14–P23, cujos owners agora são carregados diretamente.

## Fundação histórica P14–P44

| Trajetória | Resultado vigente | Owner(s) canônico(s) | Estado PXX |
|---|---|---|---|
| P14 | formulário-base de regras + molduras cosméticas-base ainda vigentes | `roomRulesCardBaseCurrent.css`, `cosmeticFramesBaseCurrent.css` | owner direto; shim fora do runtime |
| P15 | Resumo da partida + editor modal de regras + cards econômicos por colocação | `roomSummaryCurrent.css`, `roomRulesEditorCurrent.css`, `economyPlacementCurrent.css` | owner direto; shim fora do runtime |
| P16 | Pronto explícito + superfície-base da Reciclagem + apresentação de BUFFs | `lobbyReadinessCurrent.css`, `recyclingBaseCurrent.css`, `buffCardPresentationCurrent.css` | owner direto; shim fora do runtime |
| P17 | molduras de progressão + base animada dos cosméticos | `progressionFramesCurrent.css`, `animatedCosmeticFramesBaseCurrent.css` | owner direto; shim fora do runtime |
| P18 | contribuição/Mão de Vaca + grid-base de criação + raridade textual de BUFF + base da Central | `contributionCurrent.css`, `cardCreationLibraryBaseCurrent.css`, `buffRarityCurrent.css`, `notificationsBaseCurrent.css` | owner direto; shim fora do runtime |
| P19 | respostas duplas como uma unidade no gameplay | `doubleAnswerCurrent.css` | owner direto; shim fora do runtime |
| P20 | identidade pública + backdrop da Home + Player Showcase | `publicIdentityCurrent.css`, `homeBackdropCurrent.css`, `showcaseCurrent.css` | owner direto; shim fora do runtime |
| P21 | dashboard/configuração de sala + abas preto/branco + pilhas de Cartas Limpas | `roomSetupDashboardCurrent.css`, `cardTypeTabsCurrent.css`, `cleanCardStackCurrent.css` | owner direto; shim fora do runtime |
| P22 | contexto visual da estimativa + overrides semânticos da criação | `rewardEstimateCurrent.css`, `cardCreationSemanticOverridesCurrent.css` | owner direto; shim fora do runtime |
| P23 | único rodapé global de Salvar alterações do Perfil | `profileSaveFooterCurrent.css` | owner direto; shim fora do runtime |
| P26 | base/arco da Gênese | `genesisFrameBaseCurrent.css` | shim |
| P27 | nenhuma regra vigente | — | `HISTORICAL` |
| P28 | skeleton da Reciclagem; órbita Gênese intermediária substituída | `recyclingSkeletonCurrent.css` | shim |
| P29→P31 | resultado final da Gênese com seis estrelas | `genesisAtomicCurrent.css` | P29 shim; P30/P31 trajetória absorvida |
| P32 | layout de identidade pública em Lobby/placar | `publicPlayerIdentityLayoutCurrent.css` | shim |
| P33 | Cintilante final + Fita Isolante Premium + identidade do Rank | `cosmeticSpecialFramesCurrent.css`, `rankIdentityCurrent.css` | shim |
| P34 | nenhuma regra vigente | — | `HISTORICAL` |
| P35 | spoilers da Central | `notificationsSpoilerCurrent.css` | shim |
| P36 | scroll da Central + acordeões de sala + geometria final das Asas | `notificationsScrollCurrent.css`, `roomAccordionCurrent.css`, `cosmeticWingsCurrent.css` | shim |
| P37 | reutilização/favoritos + Megafone + Ferramentas do Criador | `cardCreationReuseCurrent.css`, `adminMegaphoneCurrent.css`, `creatorAdminCurrent.css` | shim |
| P38 | Admin apenas na Home real | owner JS `adminUI` | contrato atual; sem CSS funcional |
| P39 | envelope genérico de Voltar + proteção mobile de toast | `backButtonEnvelopeCurrent.css`, `toastViewportCurrent.css` | shim |
| P40 | identidade Home/Perfil/raridade já absorvida por owners de conta/perfil | owners `accountUI`/`profileUI` + CSS atuais | shim contratual |
| P41 | identidade/confirm da Reciclagem + detalhe atual de carta | `recyclingCardIdentityCurrent.css`, `recyclingConfirmCurrent.css`, `cardDetailCurrent.css` | shim |
| P42 | nenhuma regra vigente | — | `HISTORICAL` |
| P44 | nenhuma regra vigente | — | `HISTORICAL` |

## Ondas recentes migradas

| Trajetória | Resultado vigente | Owner(s) canônico(s) | Estado PXX |
|---|---|---|---|
| P45 | geometria-base dos controles superiores | `topControlsBaseCurrent.css` | shim |
| P46 | navegação superior 40px + painel de Missões | `topNavigationCurrent.css` | shim |
| P47 | alinhamento pixel-perfect/containing block | `topControlsPixelCurrent.css` | shim |
| P49 | identidade-base + slot da carteira | `accountIdentityBaseCurrent.css`, `walletLoadingCurrent.css` | shim |
| P50 | fluxo do hero + indicador Amigos | `homeHeroFlowCurrent.css`, `friendsIndicatorCurrent.css` | shim |
| P51 | alinhamento de identidade + resumo da Central | `accountIdentityAlignmentCurrent.css`, `notificationsSummaryCurrent.css` | shim |
| P52 | cabeçalho/hero + aparência-base da pill de Moedas | `homeHeaderLayoutCurrent.css`, `missionsCoinVisualCurrent.css` | shim |
| P53 | hero compacto, presença, grid de Missões, identidade da Reciclagem | `homeHeroCompactCurrent.css`, `friendsPresencePendingCurrent.css`, `missionsTwoColumnCurrent.css`, `recyclingCardIdentityCurrent.css` | shim |
| P54 | integridade avatar/moldura + base do botão Criar Carta | `profileAvatarFrameIntegrityCurrent.css`, `cardsCreateEntryCurrent.css` | shim |
| P55 | nenhuma regra vigente | — | `HISTORICAL` |
| P56 | ações Perfil/Sair + refinamento Criar Carta + ficha/modal | `accountActionsCurrent.css`, `cardsCreateEntryRefinementCurrent.css`, `cardDetailCurrent.css` | shim |
| P57 | apresentação da biblioteca real + grids live de molduras | `cardLibraryPresentationCurrent.css`, `profileFramesLiveCurrent.css` | shim |
| P58 | tipografia residual da lacuna, metadados da biblioteca, criador, Reciclagem, Gênese | `cardGapTypographySeedCurrent.css`, `cardLibraryMetadataCurrent.css`, `cardCreatorCurrent.css`, `recyclingMetadataCurrent.css`, `genesisPreviewCurrent.css` | shim |
| P59 | cards 1:1 + desenho contínuo da lacuna | `cardCompactCurrent.css` | shim |
| P60 | posição/espessura final da lacuna + pills de Missões | `cardTypographyMissionsCurrent.css` | shim |
| P62 | carteira → Extrato | `accountLedgerCurrent.css` | shim |
| P66 | inputs 16px iOS/touch + Admin/teclado | `mobileFormsCurrent.css` | shim |
| P68 | raridade composta/Super Trunfo | `cardRarityCurrent.css` | shim |
| P73/P74 | account strip, Perfil/Sair e carteira | `accountCurrent.css` | P73 histórico; P74 shim |

## Regras descartadas como `SUPERSEDED`

| Origem | Regra histórica | Substituição atual |
|---|---|---|
| P14 | layout de criação/recompensa/BUFF | P15/P16/P21/P22 + `roomUI` |
| P14 | Cintilante/Arco-íris/Asas iniciais | P17/P33/P36 |
| P15 | composição original dos quatro cards de criação | grid P21 + acordeões P36 |
| P16 | refinamentos posteriores de Reciclagem | P28/P41/P53/P58 |
| P17 | foto original do Cintilante sem hue-rotate | override final P33 |
| P18 | `config-value` | P21 |
| P18 | Gênese visual | P26→P31 |
| P19 | pilhas de Cartas Limpas | P21/P22 |
| P19 | savebar local de aparência | P23 + `profileUI` |
| P23 | regras locais redundantes de Gênese | P26→P31 |
| P27 | órbita Gênese intermediária | P29→P31 |
| P28 | órbita de uma partícula Gênese | P29→P31 |
| P32 | Asas/Cintilante antigos | P36/P33 |
| P34 | Voltar/Asas/Rank | P39→P47, P36 e `rankUI` |
| P36 | Voltar alinhado antigo | P39 e depois P45→P47 |
| P39 | sizing antigo de Perfil/Sair | P45→P47 + owners de conta |
| P50/P52/P53 | `.p48-create-card-entry` / `.p53-create-card-entry` | markup `p54-create-card-entry p56-create-card-entry p57-create-card-entry` de `cardsLibrary` |
| P51 | `.p51-mission-coin-pill` | `p52-mission-coin-pill` + owners P52/P53/P60 |
| P52 | `order` dos itens de `.profile-actions` | `navigationUI` é o único owner; Notificações antes de Histórico |
| P52 | layout antigo de `mission-row/rewards` | grid P53 + geometria P60 |
| P53/P54 | `.profile-modal-frame-grid` estático/congelado | `profileUI.stabilizeGenesis()` remove a classe e cria `p57-live-frame-grid p58-live-frame-grid` antes do estado final |
| P55 | modal/detalhe P55 | `cardsLibrary` usa P56/P57 |
| P55/P56/P57 | desenhos antigos da lacuna | trajetória final P58 tipografia → P59 desenho → P60 posição |
| P56 | `.p56-library-card/.p56-library-card-text` | renderer atual emite `p57-library-*` |
| P57 | grid/dimensões antigas da biblioteca e preview | P58/P59; dimensões finais são 1:1 em P59 |
| P58 | desenho colorido/5:7 da lacuna e cards | P59/P60 definem o resultado final |

## Trajetórias críticas preservadas

### P14 → P23 — fundação de sala, economia, perfil e criação

- P14 fornece apenas as bases ainda observáveis de regras e cosméticos.
- P15 separa Resumo/editor da visualização econômica por colocação.
- P16 separa prontidão, Reciclagem e apresentação de BUFFs.
- P17 mantém dois eixos semanticamente independentes: progressão de moldura **Bronze → Prata → Ouro → Platina** e raridade cosmética **Comum → Incomum → Raro → Épico → Lendário → Celestial**.
- P18 introduz a base da Central, contribuição e grid da criação; Gênese/config-value já não pertencem a ele.
- P19 permanece somente como geometria de resposta dupla.
- P20 divide identidade pública, Home e Showcase.
- P21/P22 definem a composição atual de sala/criação/estimativa.
- P23 deixa um único ponto de persistência visível no Perfil.
- No P77 reconciliado, `index.html` carrega diretamente os owners acima na mesma ordem efetiva; os arquivos P14–P23 deixaram de participar do runtime após browser acceptance desktop/mobile e contratos permanecerem verdes.

### P26 → P31 — Gênese

P26 mantém base/arco; P27 é histórico; P28 mantém somente skeleton da Reciclagem; P29→P31 definem o resultado final de seis estrelas. Efeitos orbitais intermediários não são mantidos como owners concorrentes.

### P32 → P44

- P32 preserva layout público; Cintilante/Asas já apontam para P33/P36.
- P33 é a decisão final para Cintilante e identidade do Rank.
- P34, P42 e P44 são históricos.
- P35/P36 compõem a Central por base de spoiler + scroll e concentram a geometria final das Asas.
- P37 divide criação/reutilização, Megafone e Criador.
- P38 prova Admin apenas na Home via `adminUI` sem hook concorrente de navegação.
- P39 mantém apenas envelope genérico de Voltar e toast seguro; P45→P47 refinam controles superiores depois.
- P40/P41 apontam para owners atuais de conta/perfil/reciclagem/detalhe de carta.

### P45 → P47

44px → 40px → remoção de `transform/translate` residual. Os três estágios permanecem separados na mesma ordem.

### P49 → P53

- P49 cria identidade-base/carteira; P51 alinha `@usuário` e título.
- P50 define o fluxo inicial do hero; P52 reposiciona o cabeçalho; P53 compacta a altura final.
- `navigationUI` é o único writer da ordem dos botões.
- presença usa a classe realmente emitida por `socialUI`.
- Missões usam `p52-mission-coin-pill`, grid P53 e refinamento P60.

### P54 → P60 — Cartas/Perfil

- P54 fornece integridade de avatar e base estrutural do botão Criar Carta.
- P56 refina esse botão e owns o modal/ficha; classes antigas de biblioteca P56 foram descartadas.
- P57 owns shell/favorito/origem da biblioteca real e o grid live de molduras.
- P58 conserva apenas propriedades ainda observáveis: tipografia residual da lacuna, metadados, creator, Reciclagem e órbita Gênese.
- P59 define dimensões finais 1:1 e desenho contínuo da lacuna.
- P60 ajusta altura/posição/espessura final da lacuna.
- P55 não participa mais do resultado funcional.

### Perfil/Gênese

`profileUI` converte o grid histórico para `p57-live-frame-grid p58-live-frame-grid` e adiciona `p58-genesis-preview`; `profileFramesLiveCurrent.css`, `genesisFrameBaseCurrent.css`, `genesisAtomicCurrent.css` e `genesisPreviewCurrent.css` compõem o estado visual final sem reviver versões intermediárias.

### P73/P74

`account.css` permanece base. P73 não tem regra funcional e P74 importa `accountCurrent.css` na posição final original; carteira continua `order:30`, ações `order:40`.

## Critério de conclusão de um PXX CSS

- toda regra vigente está em owner canônico;
- regra substituída é explicitamente `SUPERSEDED`;
- PXX contém no máximo comentário + `@import`, marcador histórico, ou sai completamente do runtime quando a equivalência já foi provada;
- contratos testam owners atuais e trajetória final;
- posição de cascata permanece equivalente enquanto houver shim;
- remoção de shim exige comparação visual; a faixa P14–P23 já cumpriu esse gate.

## Evidência principal

- `tests/p14RoomPolish.contract.test.js`
- `tests/p15LayoutSummary.contract.test.js`
- `tests/p16ReadyRecycling.contract.test.js`
- `tests/p17FrameRarity.contract.test.js`
- `tests/p18ContributionNotifications.contract.test.js`
- `tests/p19Integrity.contract.test.js`
- `tests/p20PublicCosmeticsShowcase.contract.test.js`
- `tests/p21SmallBugsUI.contract.test.js`
- `tests/p22RewardGenesisMobile.contract.test.js`
- `tests/p23ProfileGenesisSave.contract.test.js`
- `tests/p26GenesisFrame.contract.test.js`
- `tests/p27HomeOrderGenesis.contract.test.js`
- `tests/p28MusicGenesis.contract.test.js`
- `tests/p29GenesisAtomicOrbit.contract.test.js`
- `tests/p30GenesisPlatinumStar.contract.test.js`
- `tests/p31GenesisSixStars.contract.test.js`
- `tests/p32PolishAudioAmigo.contract.test.js`
- `tests/p33CosmeticsRankHotfix.contract.test.js`
- `tests/p34RoomWingsRankFix.contract.test.js`
- `tests/p35NotificationSpoilersWings.contract.test.js`
- `tests/p36NotificationScrollWingsBack.contract.test.js`
- `tests/p37AdminFavoritesMegaphone.contract.test.js`
- `tests/p38AdminHomeOnly.contract.test.js`
- `tests/p39NavigationAdminToast.contract.test.js`
- `tests/p40HomeIdentityRarity.contract.test.js`
- `tests/p41RecyclingCardDetail.contract.test.js`
- `tests/p42CurrentTrajectory.contract.test.js`
- `tests/p44CriticalRegressions.contract.test.js`
- `tests/p45TopControlsAlignment.contract.test.js`
- `tests/p46TopNavigation.contract.test.js`
- `tests/p47TopControlsPixelAlign.contract.test.js`
- `tests/p49AccountIdentityBalance.contract.test.js`
- `tests/p50HomeStability.contract.test.js`
- `tests/p51AccountNotifications.contract.test.js`
- `tests/p52RegressionStability.contract.test.js`
- `tests/p53MobilePolishMissionsProfile.contract.test.js`
- `tests/p54AvatarCardsModal.contract.test.js`
- `tests/p55CardVisualsModal.contract.test.js`
- `tests/p56DesktopActionsCardModal.contract.test.js`
- `tests/p57CanonicalCardsFrames.contract.test.js`
- `tests/p58CardUxGenesis.contract.test.js`
- `tests/p59SquareCardsContinuousGap.contract.test.js`
- `tests/p60CardIdentityGapMission.contract.test.js`
- `tests/p62SingleLedger.contract.test.js`
- `tests/p66CardProgressionMobileInput.contract.test.js`
- `tests/p68CardHistoryRarity.contract.test.js`
- `tests/cssAccountOwnership.contract.test.js`
- `tests/p73AccountStripRender.contract.test.js`
- `tests/p74WalletPlacement.contract.test.js`
- `tests/browserAcceptance.js`
- `tests/multiplayerBrowserAcceptance.js`

## Estado do Gate 16

O Gate 16 está em **4/4**. A faixa histórica e recente continua classificada por resultado; ownership vigente está nas folhas nomeadas e regras substituídas seguem `SUPERSEDED` em vez de ganhar owner artificial. A faixa neutra P14–P23 já foi retirada do runtime e substituída por imports diretos dos owners na mesma ordem efetiva da cascata, com contratos e browser acceptance desktop/mobile verdes. Shims posteriores permanecem somente onde ainda preservam uma etapa observável da trajetória ou uma posição de cascata intencional; sua existência não cria ownership concorrente.