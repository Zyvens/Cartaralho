# CARTARALHO — SALVAGUARDA FUNCIONAL E ARQUITETURAL

> **Documento de recuperação, manutenção e não-regressão.**  
> Snapshot funcional de referência: **P77 / v1.4.77**  
> Branch auditada: `refactor/domain-owners`  
> Âncora funcional estável antes desta documentação: `75232e8c0dbf99e3f75b44655cb8871b682d5acf`  
> CI da âncora: **Web tests #1068 / run 32779929078 — SUCCESS**  
> Infra auditada: **Vercel READY / 8 Node Functions**  
> Consolidação arquitetural: **100/100**  
> Regra de governança: **a PR #96 permanece Draft; não mergear nem marcar Ready sem autorização expressa.**

---

## 0. Finalidade desta salvaguarda

Este arquivo descreve o Cartaralho no estado em que o jogo está estável após a consolidação P01–P77. Ele não é um changelog e não substitui os testes: é um **mapa de recuperação**.

Use este documento quando uma regressão aparecer e for necessário responder rapidamente:

- qual é o comportamento correto;
- quem é o owner canônico desse comportamento;
- qual engine/service/API realmente decide a regra;
- quais arquivos de UI apenas apresentam o resultado;
- quais testes devem ser executados;
- qual trajetória PXX explica o comportamento atual;
- quais atalhos **não** devem ser usados para “consertar” o problema.

### Hierarquia de autoridade em caso de divergência

1. comportamento comprovado pelo HEAD estável + testes verdes;
2. engine/service/owner canônico vigente;
3. contrato automatizado que protege a regra;
4. esta salvaguarda;
5. matrizes especializadas em `web/docs/`;
6. arquivos PXX históricos, usados apenas para reconstruir trajetória.

Se o código vigente e esta salvaguarda divergirem após uma mudança **intencional e aprovada**, atualize a salvaguarda junto da mudança. Não “conserte” o código para voltar ao documento sem antes confirmar que a alteração não foi deliberada.

---

# 1. Regra-mãe da nova arquitetura

O Cartaralho não deve voltar ao modelo de “patch novo = novo owner”.

A partir desta arquitetura, qualquer correção ou funcionalidade deve seguir:

```text
pedido / bug / feature
        ↓
identificar o domínio responsável
        ↓
alterar owner canônico de UI
        ↓
alterar engine/service quando houver regra de negócio
        ↓
alterar handler/API somente como transporte/orquestração
        ↓
adicionar ou atualizar contrato
        ↓
browser/E2E quando aplicável
        ↓
PXX/release = proveniência, nunca segundo owner permanente
```

## 1.1 Taxonomia de legado

- `CURRENT FOUNDATION`: base coesa ainda usada pelos owners atuais.
- `CURRENT BRIDGE`: resultado vigente e único preservado temporariamente em posição/arquivo histórico.
- `LEXICAL SHELL`: arquivo mínimo de binding/bootstrap; não é owner funcional.
- `SUPERSEDED`: comportamento substituído; não deve voltar a decidir runtime.
- `HISTORICAL`: não executável; apenas proveniência.

## 1.2 Proibições arquiteturais

Não:

- reintroduzir estado/router/gameplay/socket dentro de `app.js`;
- reativar `meta.js` como JavaScript executável;
- transformar `professionalUI.js` novamente em writer global;
- criar `p78.js`, `p79.js`, etc. como novo owner permanente;
- duplicar listener/event writer quando já existe domain owner;
- remover CURRENT FOUNDATION/BRIDGE só para “limpar nomes antigos”;
- remover shim CSS apenas por se chamar PXX;
- alterar valores econômicos durante refactor estrutural sem decisão explícita de balanceamento;
- confundir teste multiplayer simulado com prova de backend/realtime real.

---

# 2. Topologia atual

```text
web/
├── public/
│   ├── index.html
│   ├── app.js                       # LEXICAL SHELL
│   ├── js/
│   │   ├── core/                    # lifecycle estrutural
│   │   ├── domains/                 # owners funcionais de UI
│   │   ├── metaClient.js            # CURRENT FOUNDATION
│   │   ├── metaUIBase.js            # CURRENT FOUNDATION
│   │   └── foundations/bridges históricos classificados
│   └── css/                         # design system + owners *Current.css
├── api/                              # handlers HTTP autoritativos
├── lib/                              # engines, stores e services de negócio
├── serverless/                       # 8 gateways Vercel
├── db/                               # schema + migrations/linhagem
├── tests/                            # contratos, browser, multiplayer
└── docs/                             # matrizes e esta salvaguarda
```

## 2.1 Core estrutural

`web/public/js/core/` contém:

- `appState.js` — estado de sessão/partida do frontend;
- `appBootstrap.js` — inicialização;
- `screenRouter.js` — troca de telas;
- `socketLifecycle.js` — transporte realtime base;
- `roomSocketLifecycle.js` — presença, Lobby, jogadores e prontidão;
- `gameplaySocketLifecycle.js` — eventos de partida;
- `localTurnFlow.js` — fluxo local/pass-and-play;
- `domainRegistry.js` — registro/claim de owners.

**Invariante:** `app.js` é apenas `LEXICAL SHELL`. Se uma regressão parecer exigir “colocar de volta no app.js”, provavelmente o reparo está sendo feito no lugar errado.

## 2.2 Principais owners de UI

| Sistema | Owner(s) canônico(s) |
|---|---|
| Conta / Home | `domains/accountUI.js`, `homePresentationUI.js`, `registrationUI.js`, `uiPolishUI.js` |
| Navegação / painéis | `navigationUI.js`, `appPanelUI.js` |
| Perfil / identidade | `profileUI.js`, `identityUI.js`, `genesisFrameUI.js`, foundation `profileModal.js` |
| Biblioteca de cartas | `cardsLibrary.js` |
| Criação de cartas | `cardCreationUI.js` |
| Progressão visual da carta | `cardProgression.js` + bridge `cardProgressionUI.js` |
| Sala / Lobby | `roomUI.js`, `roomShareUI.js` + foundation `roomRulesUI.js` |
| Gameplay | `gameplayUI.js` + core `gameplaySocketLifecycle.js` |
| BUFFs | `buffsUI.js` |
| Economia / Mercado | `marketplaceUI.js`, `marketplaceCatalogUI.js`, `cosmeticsUI.js` + foundations Marketplace |
| Recompensas | `rewardsUI.js`, `achievementsUI.js`, `lootUI.js`, `finalRewardUI.js` |
| Social | `socialUI.js`, `socialFoundationUI.js`, `socialGroupsUI.js` |
| Missões | `missionsUI.js` |
| Notificações | `notificationsUI.js` |
| Rank | `rankUI.js` |
| Stats | `statsUI.js` |
| Histórico | `historyUI.js` |
| Reações | `reactionsUI.js` + lifecycle `metaLifecycleUI.js` |
| Espectador | `spectatorUI.js` |
| Áudio / Narrador | `audioUI.js` + SpeechSynthesis no fluxo de narrador |
| Admin | `adminUI.js` |
| Showcase | `showcaseUI.js` |

## 2.3 Foundations/bridges que devem permanecer enquanto tiverem resultado único

- `metaClient.js` — API transversal do metajogo;
- `metaUIBase.js` — namespace mínimo de compatibilidade;
- `rewardPreviewUI.js` — preview econômico;
- `roomRulesUI.js` — regras/resumo/editor da sala;
- `marketplaceUI.js`, `marketplaceShop.js`, `marketplaceInventory.js`, `marketplaceLedger.js`, `marketplaceRecycling.js`;
- `lootUI.js`;
- `finalRewardUI.js`;
- `profileModal.js`;
- `canonicalCardBadge.js` — único resultado **🧬 CARTA ORIGINAL**;
- `cardProgressionUI.js` — resultados **Meu Legado** e **DIRETO DA FONTE**;
- `metaFixes.js` — bridge do Perfil Público.

`meta.js` é `HISTORICAL` e deve permanecer não executável. `professionalUI.js` é `SUPERSEDED`/delegate-only.

Referência: `web/docs/JS_BASE_OWNERSHIP_MATRIX.md`.

---

# 3. Invariantes globais do produto

Estas regras devem ser tratadas como alarmes de regressão:

1. **Mínimo de jogadores online: 3.** Não reduzir para satisfazer teste.
2. **Mestre mantém sua própria mão privada**, pois voltará a ser jogador em rotação futura.
3. Mestre da rodada tem `requiredSubmissions = 0` e `canSubmitMore = false`.
4. Cada cliente autenticado recebe **somente a própria mão**.
5. Pusher não distribui mãos privadas; após `new_round`, cada cliente busca `/api/game/hand` individualmente.
6. Estado persistido da sala usa revisão monotônica/concorrência otimista; não forçar `revision` stale.
7. Evento de prontidão com `roomRevision` menor que a revisão já aplicada deve ser ignorado no cliente.
8. Dinheiro, inventário, ownership, progressão e settlement são autoridade do servidor/DB; UI não inventa saldo.
9. Existe **um único slot de moldura**: `equipped_frame_key` / `frameKey`.
10. Moldura de progressão e moldura cosmética **não se sobrepõem**.
11. Carta canônica e autoria sobrevivem à reciclagem; reciclagem remove ownership do usuário.
12. BUFF temporário **Que Poder** nunca cria ownership/progressão permanente (`progressEligible:false`).
13. Saqueador só saqueia **placement reward**; survival/consolation nunca entram no pote.
14. Simulação multi-client é complementar; somente teste contra backend/Pusher conta como E2E real.
15. Primeiro paint autenticado deve preservar carteira e ícones Perfil/Sair.

---

# 4. Regras de sala e ciclo de partida

## 4.1 Estados de jogo

Fonte: `web/lib/constants.js`.

```text
aguardando_jogadores
cadastro_cartas
pronta_para_iniciar
em_andamento
votacao
resultado_rodada
finalizada
```

Constantes-base:

- `MIN_PLAYERS = 3`;
- `HAND_SIZE = 5` como default histórico/base;
- `WINNING_SCORE = 10` como default histórico/base;
- `MAX_BLACK_CARDS = 5`;
- `MAX_WHITE_CARDS = 20`;
- nickname máximo: 20 caracteres.

## 4.2 Configuração editável da sala

Owner de regra: `web/lib/roomConfig.js`.  
Owner visual/foundation: `web/public/js/roomRulesUI.js`.  
API: `/api/rooms/config`.

Valores configuráveis atuais:

| Campo | Regra atual |
|---|---|
| `maxPlayers` | 3–10; default 6; nunca abaixo dos participantes ativos |
| `pointsToWin` | 3–20; default 10 |
| `handSize` | 5–15; default 5 |
| `useStandardDeck` | default `true` |
| `cardCreationEnabled` | default `true` |
| `playerCardsEnabled` | default `true` |
| `afkEnabled` | default `true` |
| `buffsEnabled` | default `false` |
| `narratorEnabled` | default `false` |

A UI também expõe quantidades de Cartas Pretas/Brancas criadas por jogador (`blackCardsPerPlayer`, `whiteCardsPerPlayer`) na configuração da mesa.

Somente o criador pode alterar regras, e somente nos estados pré-start. Depois de existir `rewardConfigSnapshot`/início da partida, configuração fica congelada.

A mudança autoritativa deve vir da resposta do servidor e ser propagada aos demais participantes por evento de sala. Não atualizar somente DOM local.

## 4.3 Significado funcional dos toggles

- **Baralho padrão**: inclui cartas nativas/oficiais no deck.
- **Criar cartas nesta sala**: habilita a etapa de criação e ativa a regra de contribuição para elegibilidade de Espólio.
- **Cartas de Jogador**: permite usar cartas já possuídas pelos participantes.
- **AFK**: habilita lifecycle de inatividade/desconexão.
- **BUFFs**: permite engine de BUFFs na partida.
- **Narrador**: habilita narração pública no dispositivo do criador.

## 4.4 Presença e AFK online

Arquitetura cloud: Vercel + Neon Postgres + Pusher.

- cada aba mantém `playerId` estável no `localStorage`;
- heartbeat ~15 s;
- aproximadamente 35 s sem heartbeat: participante é considerado desconectado;
- aproximadamente 2 min: remoção, salvo quando AFK está desabilitado;
- ações são HTTP; Postgres persiste; Pusher notifica.

Fontes: `web/README.md`, `web/lib/presence.js`, `web/lib/roomEvents.js`, `web/public/js/core/roomSocketLifecycle.js`.

## 4.5 Prontidão concorrente

Owner de endpoint: `web/api/rooms/ready.js`.  
Store: `web/lib/roomStore.js`.  
Regra: `web/lib/roomReadiness.js`.

Problema descoberto no RC real: três clientes marcando Pronto simultaneamente podiam ler a mesma revisão e um deles receber `ROOM_CONFLICT`.

Regra atual:

```text
loadRoom(snapshot fresco)
 → aplica intenção daquele usuário
 → saveRoom(expected revision)
 → ROOM_CONFLICT?
      não: sucesso
      sim: recarrega snapshot e tenta de novo
```

Retry é **bounded em 3 tentativas** e só ocorre para `ROOM_CONFLICT`. Não incrementar/forçar `room.revision` manualmente.

### Ordenação realtime da prontidão

`cards_submitted` inclui `roomRevision`. `roomSocketLifecycle` mantém a maior revisão aplicada e rejeita snapshot stale. Isso impede sequência de chegada como 14 → 16 → 15 de regredir o estado para 15.

---

# 5. Decks, cartas, lacunas e mãos

## 5.1 Tipos de carta

Aliases canônicos:

- `white` / `whiteCards` → branca;
- `black` / `blackCards` → preta.

Fonte: `web/lib/cardIdentity.js`.

## 5.2 Regra de lacunas de Carta Preta

Para **nova criação**:

- Carta Preta precisa de pelo menos uma lacuna `_`;
- máximo de 2 lacunas;
- lacuna é normalizada para `______`;
- 1 lacuna exige 1 Carta Branca;
- 2 lacunas exigem 2 Cartas Brancas.

A identidade canônica histórica não é reescrita à força: normalização de lacuna é aplicada no fluxo de nova criação para não quebrar cartas antigas.

## 5.3 Construção do deck

Fonte: `web/lib/gameLogic.js`.

- contribuições ativas dos jogadores entram primeiro;
- duplicatas textuais são evitadas case-insensitivamente;
- quando uma contribuição duplica outra e há carta padrão disponível, pode haver fallback para carta padrão;
- se `useStandardDeck=true`, o restante do deck padrão é incorporado;
- decks preto e branco são embaralhados;
- mãos são distribuídas até `room.handSize` enquanto houver deck branco.

## 5.4 Mestre e rotação

`getNextHostIndex()` procura o próximo participante ativo e conectado; se não houver, procura ativo ainda que desconectado; preserva índice atual como último fallback.

**Nunca apagar a mão do Mestre.** A mão é privada e mantida para a rotação futura. O bloqueio correto é de submissão, não de ownership temporário da mão.

## 5.5 Privacidade de mão

Pusher transmite eventos comuns da sala, mas não consegue entregar payload privado diferente por participante no mesmo broadcast. Logo:

```text
new_round público via Pusher
        ↓
cliente autenticado
        ↓
GET /api/game/hand
        ↓
somente a própria mão
```

Se aparecer vazamento entre mãos, investigar imediatamente `/api/game/hand`, serialização do round e qualquer mudança que tente colocar `hand` no broadcast Pusher.

---

# 6. Identidade canônica, origem e ownership de cartas

## 6.1 Identidade

Fonte: `web/lib/cardIdentity.js`.

A identidade canônica usa:

- tipo canônico (`white`/`black`);
- texto de display limpo;
- texto normalizado (`NFKC`, whitespace normalizado, lowercase) para comparação.

Caracteres invisíveis/controle são removidos do display novo. Cartas canônicas históricas são preservadas.

## 6.2 Origem

Fonte: `web/lib/cardOrigins.js` e `web/lib/canonicalCards.js`.

O jogo rastreia:

- primeiro texto/origem;
- usuário criador quando conhecido;
- snapshot do nome;
- primeira sala;
- recriações independentes;
- presença em salas;
- holders.

A recriação por outro usuário incrementa `recreated_count`; autoria original não deve ser transferida.

## 6.3 Ownership

Ownership canônico pertence a `canonical_card_ownerships`. Aquisição pode vir de criação, Espólio, packs, etc.

Regra de salvaguarda: **ownership não é autoria**. Um usuário pode possuir uma carta que foi originalmente criada por outro.

---

# 7. Progressão de cartas

Há três conceitos que não devem ser misturados: **progressão pessoal visual da carta**, **Legado global da carta** e **moldura de progressão do perfil**.

## 7.1 Fundo/material da carta

Owner visual: `web/public/js/domains/cardProgression.js`.  
Regras: `web/lib/cardProgressionRules.js` e `cardProgressionService.js`.

O **FUNDO** mede rodadas pessoais vencidas usando aquela carta.

Thresholds:

| Tier | Vitórias pessoais |
|---|---:|
| Padrão | 0–9 |
| Bronze (`copper`) | 10 |
| Prata | 30 |
| Ouro | 60 |
| Platina | 100 |

## 7.2 Borda da carta

A **BORDA** representa popularidade por coleta/Espólio por outros jogadores (`lootCollectors` no modelo entregue à UI).

Usa a mesma escala:

| Tier | Coletas/coletores |
|---|---:|
| Padrão | 0–9 |
| Bronze | 10 |
| Prata | 30 |
| Ouro | 60 |
| Platina | 100 |

## 7.3 Raridade composta da carta

A raridade visual da carta usa o **menor rank** entre fundo e borda. Assim, não basta uma carta ser forte sem ser popular, nem popular sem vencer.

| Rank mínimo | Raridade exibida |
|---:|---|
| 0 | Comum |
| 1 | Incomum |
| 2 | Rara |
| 3 | Épica |
| 4 | Lendária |

### Super Trunfo

Uma carta só vira **Super Trunfo** quando:

- fundo e borda já alcançaram rank 4 / Platina; e
- coeficiente global `wins / losses >= 0.8`.

Se não houver derrotas, uma carta com vitória pode obter coeficiente 1; sem dados suficientes, o coeficiente pode ser nulo e não concede Super Trunfo.

## 7.4 Legado global

Fonte: `web/lib/cardProgressionRules.js` + `cardProgressionService.js`.

Métricas globais:

- `reach`: proprietários distintos;
- `adoption`: owners adquiridos por `match_loot`;
- `coincidence`: criações independentes coincidentes;
- `presence`: partidas em que apareceu;
- `uses`: revelada/usada;
- `wins`: vitórias globais da branca.

Score:

```text
legacyScore =
 ln(1+reach)       * 1.0
+ln(1+adoption)    * 1.4
+ln(1+coincidence) * 0.8
+ln(1+presence)    * 1.1
+ln(1+wins)        * 1.3
```

Níveis:

| Legado | Score mínimo |
|---|---:|
| Nascente | 0 |
| Espalhando | 4 |
| Viral | 12 |
| Clássico | 30 |
| Folclore | 60 |

Milestones de Legado geram eventos/recompensas para autores e alimentam achievements.

---

# 8. Progressão do jogador, XP, títulos e molduras

## 8.1 XP / nível

Fonte: `web/lib/missionService.js`, `prestigeDefinitions.js`, `/api/profile/metagame`.

```text
level = floor(xp / 1000) + 1
```

Cosméticos compráveis possuem gate de **nível mínimo 5** (`MIN_COSMETIC_XP = 4000`).

Frames especiais por progressão de conta:

- `mission-weekly` — **Missão Cumprida**: completar todas as missões semanais legadas da mesma semana;
- `xp-10000` — **Viciado(a) Oficial**: atingir 10.000 XP.

## 8.2 Molduras de progressão Bronze → Prata → Ouro → Platina

Essas molduras são de progressão e não fazem parte do catálogo pago.

Regra de unlock do perfil:

- Bronze: possuir pelo menos **5 cartas Bronze**;
- Prata: possuir pelo menos **5 cartas Prata**;
- Ouro: possuir pelo menos **5 cartas Ouro**;
- Platina: possuir pelo menos **5 cartas Platina**.

Após desbloqueada, pode ser equipada livremente.

Fontes: `web/lib/metaGame.js`, `/api/profile/metagame`.

## 8.3 Um único slot de moldura

Todos estes tipos convergem para `equipped_frame_key`:

- frame de progressão;
- frame cosmético comprado;
- frame de temporada;
- frame especial/entitlement.

**Não existe composição progressão + cosmético.** Uma única moldura ou nenhuma.

## 8.4 Raridades de prestígio/cosmético

Mapeamento canônico atual (`web/lib/prestigeDefinitions.js`):

| key interno | Label |
|---|---|
| `common` | Comum |
| `rare` | Incomum |
| `superrare` | Raro |
| `epic` | Épico |
| `legendary` | Lendário |
| `celestial` | Celestial |

**Atenção:** documentos históricos podem usar labels antigos para `rare/superrare`. O mapping acima é o atual.

## 8.5 Títulos legados do metajogo

Fonte canônica: `web/lib/metaGame.js`.

- **Tô Só Começando** — concluir 1 partida;
- **Rindo de Nervoso** — ganhar 1 rodada;
- **Mão Leve** — usar 25 cartas;
- **Fede, nem cheira** — em 15 partidas, terminar sem 1º nem último;
- **Filho da Mãe** — usar carta contendo “sua mãe” mais de 50 vezes (target 51);
- **Rei do Ctrl+C** — cartas recriadas 20 vezes por outros;
- **Sem Freio** — 50 reações;
- **Mestre da Piada** — 10 vitórias de partida seguidas;
- **Sem Amigos** — 10 derrotas de partida seguidas;
- **Inimigo da Família** — streak de 5 rodadas em 3 partidas;
- **Galanteador(a) Nato(a)** — escolhido 20 vezes pelo mesmo Mestre em partidas diferentes;
- **Safado(a) Mór** — partida invicta nas rodadas em que respondeu, mínimo 3 vitórias;
- **Meme Ambulante** — 150 reações;
- **Dono da Mesa** — 25 partidas vencidas;
- **Necromante da Piada** — 3 cartas Platina;
- **Colecionador Compulsivo** — 250 Cartas de Jogador;
- **Carreira Solo** — vencer usando pelo menos 5 apelidos diferentes;
- **Déjà Vu** — 20 rodadas vencidas com a mesma carta;
- **Imortal do Cartaralho** — 250 partidas e pelo menos 100 vitórias;
- **Lenda Urbana** — 10 cartas Platina;
- **A Piada É Minha** — uma criação visitar 100 mesas;
- **Contra Tudo e Todos** — 20 vitórias de partida seguidas;
- **O Escolhido** — escolhido pelo mesmo Mestre em 50 partidas diferentes.

## 8.6 Hall da Fama de temporadas

Temporadas são mensais. Ao finalizar, top 3 é gravado em `season_hall_of_fame` e pode ganhar frame permanente:

- 1º: `season-champion` / Campeão de Temporada;
- 2º: `season-runner-up` / Vice de Temporada;
- 3º: `season-third` / Pódio de Temporada.

Ranking desempata por pontos desc, vitórias desc e partidas asc.

---

# 9. Achievements V2, badges e títulos derivados

Fonte: `web/lib/achievementDefinitions.js`. Owner de UI: `domains/achievementsUI.js`; Stats exibe badges/títulos em `domains/statsUI.js`.

Achievements atuais:

| Achievement | Condição | Título quando aplicável |
|---|---|---|
| Primeira Dose | 1 BUFF efetivado | — |
| Canivete Suíço do Caos | 5 BUFFs diferentes efetivados | Caos com Método |
| Fiscalização Surpresa | Intervenção Federal cancela de fato outro BUFF | Fiscal Federal |
| Nada Faz Sentido | efetivar CAOS TOTAL | Agente do Caos |
| Crime Compensa às Vezes | receber parcela real de Saqueador | Saqueador Profissional |
| Achado Não É Roubado | 1 carta adotada por Espólio | — |
| Contrabando Seletivo | 10 cartas por Espólio | Contrabandista |
| Rede de Contatos Duvidosa | Espólios de 3 jogadores distintos | — |
| Assinou o Crime | originar Carta Canônica | — |
| O Original Funciona | vencer com criação originalmente sua | Direto da Fonte |
| Produto Testado em Campo | 10 vitórias pessoais com Cartas de Jogador | — |
| Tráfico de Ideias | 10 adoções de criações suas | Traficante de Ideias |
| Sua Desgraça se Espalha | criação atinge reach 10 | — |
| Pegou | criação atinge Legado Viral | Viralizador |
| Patrimônio Imaterial | criação atinge Legado Folclore | Folclore Vivo |
| Primeira Triagem | reciclar 10 cartas acumuladas | Catador de Ideias |
| Negócio Suspeito | primeira compra no Mercado | Cliente Suspeito |
| Freguês do Beco | 10 compras | Frequentador do Beco |
| Dois por Um | 10 vitórias com Carta Preta de duas lacunas | Malabarista de Lacunas |
| Economia Circular | reciclar 200 cartas acumuladas | Usina de Ideias |
| Mercado É Meu | 100 compras | Magnata do Mercado Paralelo |

### Milestones de Legado

- primeira adoção: 50 XP / 10 moedas;
- reach 10: 100 XP / 20 moedas;
- reach 25: 200 XP / 40 moedas;
- reach 100: 500 XP / 100 moedas;
- reach 250: 750 XP / 150 moedas;
- reach 1000: 1500 XP / 300 moedas;
- Viral: 300 XP / 60 moedas;
- Clássico: 750 XP / 150 moedas;
- Folclore: 2000 XP / 400 moedas.

Recompensa em moedas desses milestones é 20% do XP.

---

# 10. Missões

Owner de regra: `web/lib/missionService.js`.  
Definições: `web/lib/achievementDefinitions.js`.  
Owner visual: `domains/missionsUI.js`.

Timezone de período: **America/Sao_Paulo**.

## 10.1 Missões diárias legadas

- **Bater ponto** — jogar 1 partida — 100 XP / 20 moedas;
- **Arranca risada** — ganhar 3 rodadas — 150 XP / 30 moedas;
- **Plateia barulhenta** — enviar 5 reações — 75 XP / 15 moedas.

## 10.2 Missões semanais legadas

- **Sem vida social** — 5 partidas — 350 XP / 70 moedas;
- **Dono do rolê** — 2 partidas vencidas — 500 XP / 100 moedas;
- **Metralhadora de piada** — 10 rodadas vencidas — 450 XP / 90 moedas;
- **Piada dos Outros** — vencer uma rodada com carta originalmente de outro — 400 XP / 80 moedas;
- **Torcida organizada** — 20 reações — 250 XP / 50 moedas.

Completar todas as semanais legadas da mesma semana desbloqueia frame **Missão Cumprida**.

## 10.3 Missões P10 / eventos canônicos

Diárias:

- **Má Influência do Dia** — efetivar 1 BUFF — 100 XP / 20 moedas;
- **Leva Isso Pra Casa** — adotar 1 Espólio — 100 XP / 20 moedas;
- **Direto da Fonte** — apresentar criação original própria — 150 XP / 30 moedas.

Semanais:

- **Degustação de Péssimas Decisões** — 3 BUFFs diferentes — 300 XP / 60 moedas + BUFF aleatório elegível;
- **Contrabando Interestadual** — Espólio em 3 partidas distintas — 350 XP / 70 moedas;
- **A Piada Saiu de Casa** — criações próprias presentes em 3 partidas distintas — 400 XP / 80 moedas.

Pool de BUFF de missão aleatória: `buff_dedo_no_olho`, `buff_foi_sem_querer`, `buff_amigo_de_merda`, `buff_vou_fingir`; seleção é determinística por usuário/período/missão e só usa itens ativos/preço <= 400.

Recompensas são idempotentes por período + missão + usuário.

---

# 11. BUFFs — contrato funcional completo

Fontes principais:

- catálogo/contrato: `web/lib/buffDefinitions.js`;
- simples: `web/lib/buffEngine.js`;
- avançados: `web/lib/advancedBuffEngine.js`;
- exceção canônica Amigo de Merda: `web/lib/amigoDeMerda.js`;
- settlement Saqueador: `web/lib/advancedRewards.js`;
- UI: `web/public/js/domains/buffsUI.js`;
- matriz: `web/docs/BUFF_FUNCTIONAL_MATRIX.md`.

### Invariantes do engine

- máximo de uma ativação por jogador por rodada, salvo regra explícita do engine;
- inventário é consumido server-side e com proteção transacional/idempotente;
- engine valida fase, papel, alvo, blackout e locks globais;
- `Intervenção Federal` só cancela ação reversível dentro da janela conhecida do engine;
- `Amigo de Merda` usa rota dedicada; não recanonizar branch genérico antigo;
- `Que Poder` é ownership temporário e não gera progressão;
- `Saqueador` só atua na fase final de recompensa.

## 11.1 Catálogo atual dos 21 BUFFs

> Preços são do catálogo DB estável. Raridade usa mapping atual: `rare=Incomum`, `superrare=Raro`.

| # | BUFF / key | Raridade | Preço | Fase / papel | Regra funcional |
|---:|---|---|---:|---|---|
| 1 | Dedo no Olho `buff_dedo_no_olho` | Raro | 250 | Mão/Submissões · qualquer | vê privadamente 1 carta aleatória da mão de adversário |
| 2 | Foi sem querer querendo `buff_foi_sem_querer` | Raro | 300 | Submissões · qualquer | recolhe própria resposta antes do reveal e força nova resposta |
| 3 | Amigo de Merda `buff_amigo_de_merda` | Raro | 350 | Mão/Submissões · qualquer | antes de alvo submeter, devolve mão inteira ao pool e redesenha mesmo tamanho |
| 4 | Vou fingir que ninguém viu `buff_vou_fingir` | Incomum | 400 | Submissões/Master Choice · Mestre | autoria das respostas revelada apenas ao Mestre |
| 5 | Meu jogo, minhas regras `buff_meu_jogo` | Incomum | 450 | Mão/Submissões · qualquer | permite duas respostas independentes na rodada |
| 6 | Xô vê aqui `buff_xo_ve_aqui` | Raro | 450 | Mão · qualquer | troca uma carta própria escolhida por uma aleatória do alvo |
| 7 | Mão de Vaca `buff_mao_de_vaca` | Raro | 500 | Mão · qualquer | compra 2 extras e obriga devolver 2 |
| 8 | Testemunha Protegida `buff_testemunha_protegida` | Raro | 500 | Submissões · qualquer | protege próprias submissões contra apagar/trocar/manipular |
| 9 | Surrupiada `buff_surrupiada` | Raro | 600 | Submissões · qualquer | remove resposta ativa de outro e força substituição; lock global `surrupiada` |
| 10 | Toque de Midas `buff_toque_de_midas` | Raro | 600 | Mão · qualquer | devolve mão inteira e compra outra do mesmo tamanho |
| 11 | Censura Prévia `buff_censura_previa` | Épico | 650 | Mão · Mestre | troca Carta Preta antes de respostas; lock `black_swap` |
| 12 | Quem nunca? `buff_quem_nunca` | Épico | 700 | Mão · qualquer | solicita troca da Carta Preta antes de respostas; mesmo lock `black_swap` |
| 13 | Silêncio Geral `buff_silencio_geral` | Épico | 750 | Mão/Submissões/Master Choice · Mestre | desabilita reações pelo restante da partida |
| 14 | Quero tudo que é seu `buff_quero_tudo` | Épico | 850 | Mão/Submissões · qualquer | troca mãos atuais de dois jogadores |
| 15 | Intervenção Federal `buff_intervencao_federal` | Lendário | 900 | Mão/Submissões/Master Choice | restaura snapshot anterior reversível e registra cancelamento |
| 16 | Apagão `buff_apagao` | Lendário | 950 | Mão/Submissões/Master Choice | bloqueia novas ativações de BUFF na rodada seguinte |
| 17 | O poder subiu à cabeça `buff_poder_subiu` | Lendário | 1000 | Mão/Submissões/Master Choice · Mestre | Mestre permanece mais uma rodada e inverte a rotação |
| 18 | CAOS TOTAL `buff_caos_total` | Lendário | 1100 | Mão/Submissões | servidor oculta conteúdo das mãos adversárias nessa rodada |
| 19 | Se fode aí `buff_se_fode_ai` | Lendário | 1200 | Mão/Submissões | substitui cartas especiais dos adversários por normais do pool |
| 20 | Que Poder, Filho da Puta `buff_que_poder` | Lendário | 1400 | Master Choice · Mestre | toma ponto e carta escolhida apenas como mão temporária; sem progressão permanente |
| 21 | Saqueador `buff_saqueador` | Celestial | 2500 | Final Reward | entra no rateio coletivo do pote saqueável de colocação |

### Fases do engine

`preparation`, `hand_pre_submission`, `submissions`, `reveal`, `master_choice`, `result`, `transition`, `final_reward`.

### Testes de salvaguarda BUFF

- `tests/buffCatalogP8.test.js`
- `tests/buffDefinitionsP8.test.js`
- `tests/buffEngineP8.contract.test.js`
- `tests/advancedBuffP9.contract.test.js`
- `tests/p32PolishAudioAmigo.contract.test.js`
- `tests/buffFunctionalMatrix.contract.test.js`
- `tests/domainOwnershipArchitecture.contract.test.js`

---

# 12. Economia — Moedas Sujas / Dirty Coins

Fontes:

- `web/lib/balanceConfig.js`;
- `web/lib/rewardEngineRules.js`;
- `web/lib/advancedRewards.js`;
- `web/lib/playerStats.js`;
- realtime: `balanceRealtime.js` / owner atual correspondente;
- UI/owners Marketplace.

## 12.1 Configuração-base de reward

Versão default: `metagame-v1.4-p16`, engine `dirty-coins-v1`.

Parâmetros:

- pontos econômicos válidos: 3–20;
- jogadores econômicos válidos: 3–10;
- baseline: 10 pontos / 6 jogadores;
- expoente pontos: 1.35;
- expoente jogadores: 0.80;
- expoente do multiplicador: 1.35;
- survival coefficient: 50;
- participação mínima para survival: 70%;
- placement base: **150 / 75 / 40**;
- consolation: **1**.

Curva histórica/canônica:

```text
effort = (pointsToWin / 10)^1.35 * (players / 6)^0.80
multiplier = effort^1.35
placement = round([150,75,40] * multiplier)
survival = max(0, round(50 * (multiplier - 1)))
```

## 12.2 Regras de payout

- 1º/2º/3º recebem placement quando settlement é válido;
- survival é separado e depende de participação >=70%;
- consolation de 1 moeda só existe para último lugar quando há mais de 3 jogadores;
- partidas inválidas/sem rounds suficientes não devem gerar economia legítima;
- settlement congela resultado econômico e deve ser idempotente.

## 12.3 Classes de duração

- Relâmpago: índice >=0;
- Casual: >=0.5;
- Padrão: >=0.9;
- Longa: >=1.25;
- Maratona: >=2;
- Insana: >=3.

## 12.4 Carteira e realtime

Após transação própria:

```text
DB/ledger
 → wallet autoritativa
 → balance_updated realtime
 → accountUI / Mercado / Extrato
```

Se o saldo some no primeiro paint ou chega muito depois, investigar owners de conta/wallet e bootstrap. **Não restaurar DOM patch antigo.** P75→P77 foi especificamente auditado para preservar wallet, Perfil e Sair no primeiro paint.

---

# 13. Espólio e contribuição

Fontes: `web/lib/matchLoot.js`, `matchLootRules.js`, `playerContribution.js`, `web/docs/REWARD_LOOT_MATRIX.md`.

## 13.1 Base de Espólio

Quota-base por colocação:

- 1º: 10;
- 2º: 7;
- 3º: 5;
- demais: 3.

A quota solicitada pode escalar por esforço da partida e é limitada pela quantidade real de cartas elegíveis que o usuário ainda não possui.

Claim é idempotente; progressão só é atualizada quando há grant novo.

## 13.2 Contribuição / “Mão de Vaca” do Lobby

Não confundir este conceito de contribuição com o BUFF **Mão de Vaca**.

Regra econômica:

- se `cardCreationEnabled=true` e o jogador contribui zero cartas, fica inelegível ao Espólio;
- o primeiro Ready nessa situação pode exigir confirmação `NO_CONTRIBUTION_LOOT_WARNING`;
- se criação de cartas está desligada, não há penalidade de contribuição;
- settlement revalida autoridade econômica; o Lobby é feedback, não fonte final.

---

# 14. Saqueador — settlement final

BUFF `Saqueador` abre janela final de aproximadamente **15 s**.

Regras:

- somente `placement_reward` entra no pote;
- se ao menos um Saqueador válido participa, os placements originais não recebem aquele placement;
- survival e consolation continuam com seus destinatários originais;
- pote é dividido entre saqueadores;
- divisão inteira usa remainder determinístico pela ordem persistida de participantes;
- ledger/settlement usa idempotência e transação Serializable;
- sem placement pot: `empty_raid_pot`;
- fora da janela: `reward_window_closed`.

Nunca “simplificar” Saqueador somando survival/consolation ao pote.

---

# 15. Mercado Paralelo

Backend modular atual:

- `web/lib/marketplace.js`
- `marketplaceCommon.js`
- `marketplacePurchase.js`
- `marketplaceClean.js`
- `marketplaceRandom.js`
- `marketplaceBestWorld.js`
- `marketplaceBuff.js`
- `marketplaceCosmetic.js`
- `marketplaceState.js`

Frontend mantém foundations `marketplaceUI/shop/inventory/ledger/recycling`, enquanto domain owners controlam wallet/realtime/presentation final.

## 15.1 Cartas Limpas / packs fixos

| Produto | Conteúdo | Preço |
|---|---|---:|
| Branqueamento de Capital `white_10` | 10 brancas | 1.800 |
| Branco em Atacado `white_25` | 25 brancas | 4.000 |
| Carga Branca `white_50` | 50 brancas | 7.000 |
| Caixa Preta `black_10` | 10 pretas | 1.800 |
| Dinheiro Preto `black_25` | 25 pretas | 4.000 |
| Carga Pesada `black_50` | 50 pretas | 7.000 |
| Faça Você Mesmo `mixed_10` | 10 brancas + 10 pretas | 3.200 |
| Caixa de Ideias Questionáveis `mixed_25` | 25 + 25 | 7.000 |
| Atacado da Criatividade `mixed_50` | 50 + 50 | 12.000 |

## 15.2 Packs especiais

- **Pack Sem Criatividade** `pack_random_10` — até 10 cartas aleatórias prontas de jogadores — 5.000;
- **Melhores Cartas do Mundo** `pack_best_world_3` — 3 cartas canônicas distintas de alto desempenho — 15.000.

Fonte histórica/canônica de catálogo: `web/db/metagame_v1_4_package5.sql` + services Marketplace atuais.

---

# 16. Reciclagem

Owner de regra: `web/lib/cardRecycling.js`.  
API: `web/api/recycling.js`.  
UI: Marketplace Recycling foundation + owner atual.

## 16.1 Regra atual

**P41 supersede P16:** qualquer quantidade >=1 pode ser reciclada. Não reintroduzir exigência de múltiplo de 10.

- recompensa default: **25 moedas por carta**;
- IDs são deduplicados;
- carta precisa estar na coleção do usuário no momento da transação;
- remove `canonical_card_ownerships` daquele usuário;
- limpa `owned/favorite` legado quando correspondente;
- carta canônica, estatísticas e autoria permanecem;
- batch é idempotente por `(user_id, recycling_id)`;
- ledger usa tipo `card_recycling`;
- saldo é notificado em realtime.

Trajetória: `db/p16_recycling.sql` → **`db/p41_recycling_any_count.sql`**.

---

# 17. Cosméticos pagos — 17 molduras canônicas P17

**P17 é o rebalance vigente.** P33–P36 refinam efeitos visuais de molduras específicas, mas não redefinem preço/raridade/ordem do catálogo.

Fonte: `web/db/p17_frame_rarity_rebalance.sql`.

| Ordem | Moldura | Raridade atual | Preço |
|---:|---|---|---:|
| 1 | Moldura Lisa | Comum | 4.000 |
| 2 | Moldura Dupla | Comum | 5.000 |
| 3 | Moldura Pontilhada | Comum | 6.000 |
| 4 | Fita Isolante Premium | Incomum | 15.000 |
| 5 | Moldura Agiota | Incomum | 17.500 |
| 6 | Buraco Negro Fiscal | Incomum | 20.000 |
| 7 | Ouro de Pobre | Raro | 30.000 |
| 8 | Glitch Radioativo | Raro | 35.000 |
| 9 | Moldura Neon Roxa | Raro | 40.000 |
| 10 | Neon de Procedência Duvidosa | Raro | 45.000 |
| 11 | Ornamental | Épico | 65.000 |
| 12 | Moldura de Folhas | Épico | 75.000 |
| 13 | Asas | Épico | 85.000 |
| 14 | Cintilante | Lendário | 110.000 |
| 15 | Arco-íris | Lendário | 130.000 |
| 16 | Faísca | Lendário | 150.000 |
| 17 | Lavagem Completa | Celestial | 250.000 |

## 17.1 Títulos cosméticos pagos

Catálogo P11:

- Cliente Preferencial — 20.000 — Incomum;
- Lavador de Moedinhas — 30.000 — Raro;
- Patrocinador do Caos — 45.000 — Épico;
- Dinheiro Não Compra Talento — 65.000 — Épico;
- Herdeiro do Cartaralho — 100.000 — Lendário;
- Patrimônio Inexplicável — 200.000 — Celestial.

## 17.2 Entitlements especiais

Fonte: `web/lib/prestigeDefinitions.js` e `web/db/p18_creator_entitlements.sql`.

- `betinha` — título de snapshot beta, Épico;
- `o-criador` — título Celestial de entitlement;
- `genese-celestial` — frame Gênese Celestial de entitlement.

P18 concede `o-criador` e `genese-celestial` especificamente à conta identificada na migration. **Não generalizar entitlement exclusivo para todos os usuários.**

---

# 18. Gênese e trajetória visual de molduras

A Gênese atual é o resultado final da trajetória **P26→P31**, não soma de versões intermediárias.

- P26: base/arco;
- P27: histórico;
- P28: skeleton de Reciclagem; órbita intermediária da Gênese foi superada;
- P29→P31: estado final/atômico com seis estrelas;
- preview final: `genesisPreviewCurrent.css`.

Owners visuais relevantes:

- `genesisFrameBaseCurrent.css`;
- `genesisAtomicCurrent.css`;
- `genesisPreviewCurrent.css`;
- `profileFramesLiveCurrent.css`.

Molduras especiais:

- Cintilante: decisão visual final P33;
- Asas: geometria final P36;
- P33/P36 **não** alteram o catálogo P17.

---

# 19. Rank, Hall da Fama e Hall da Vergonha

Owner: `web/public/js/domains/rankUI.js`.

## 19.1 Ranking

Pode mostrar temporada atual, todos os tempos e temporadas específicas. Itens exibem pontos, vitórias e partidas. Perfil público é acessível pelo jogador do ranking.

## 19.2 Hall da Fama

Top 3 de temporadas mensais finalizadas, com medalhas e frames sazonais permanentes.

## 19.3 Hall da Vergonha

Endpoint: `/api/profile/hall-shame` → `web/api/profile/hall-shame.js`.

Categorias canônicas:

1. **Mais usada** 🔁 — cartas brancas mais jogadas;
2. **Mais vencedora** 🏆 — respostas que mais venceram rodadas;
3. **Mais recriada** 🧬 — piadas mais recriadas por outros;
4. **Mais vista** 👀 — cartas realmente vistas pelos jogadores;
5. **Piada que se recusa a morrer** 🧟 — cartas antigas presentes em pelo menos 3 salas e ainda aparecendo em novas mesas.

Não transformar Hall da Vergonha em ranking manual de strings; as consultas vêm de uso/rounds/origins/presença reais.

---

# 20. Estatísticas

Owner: `web/public/js/domains/statsUI.js`.  
Backend: `web/lib/playerStats.js` e APIs de perfil/stats.

Stats principais:

- partidas;
- vitórias;
- rodadas ganhas;
- pontos;
- taxa de vitória;
- Mestre que mais escolheu o usuário;
- jogador que mais perdeu para o usuário;
- maior streak de vitórias;
- maior streak de derrotas;
- carta que insiste e nunca ganhou;
- resposta mais vencedora;
- quantidade de Mestres diferentes que já escolheram o usuário;
- badges/títulos com progresso.

---

# 21. Social, grupos, reações e espectador

## 21.1 Social / amigos

Owners: `socialUI.js`, `socialFoundationUI.js`.  
Cliente: `MetaClient.friends()` → `/api/social/friends`.

Presença social deve usar o lifecycle/markup emitido pelo owner atual, não observer global antigo.

## 21.2 Turmas/grupos

Owner: `socialGroupsUI.js`.

MetaClient:

- `/api/social/groups` — listar/criar/entrar;
- `/api/social/group?groupId=...` — detalhe.

## 21.3 Reações

- UI/dock: `reactionsUI.js`;
- binding/lifecycle de canal: `metaLifecycleUI.js`;
- endpoint: `/api/game/react`.

`Silêncio Geral` pode desabilitar reações pelo restante da partida e deve ser respeitado server-side.

## 21.4 Espectador

Owner: `spectatorUI.js`; endpoint `/api/rooms/spectate`.

Espectador recebe estado público, nunca mão privada de jogador.

---

# 22. Central de Notificações

Owner: `web/public/js/domains/notificationsUI.js`.  
API: `/api/notifications`.

Comportamento atual:

- entrada própria na Home autenticada;
- badge de não lidas;
- atualizações e recompensas separadas;
- versão atual;
- seções em spoiler/acordeão;
- leitura é **confirmada ao fechar** a Central, não apenas ao abrir;
- IDs lidos ficam no `localStorage` por usuário, limitados aos 300 mais recentes;
- badge `99+` acima de 99;
- som de abrir/fechar modal quando SFX existe.

Se o badge zerar no ato de abrir antes do fechamento, é regressão.

---

# 23. Perfil e identidade pública

Foundation: `profileModal.js`.  
Owner final: `domains/profileUI.js`.  
Identidade: `identityUI.js`.  
Perfil Público: bridge `metaFixes.js` / owner `publicProfileUI`.

Invariantes:

- Perfil é modal/painel, não penduricalho lateral;
- título e moldura equipados são persistidos no backend;
- um único footer global de **Salvar alterações** em todas as abas relevantes;
- backdrop blur atual não deve voltar ao opaco antigo;
- título/moldura não devem duplicar no Perfil Público;
- avatar, título e frame devem ser propagados em Lobby, placar, Rank e perfil público pelos owners de identidade.

---

# 24. Áudio e Narrador

Owner de áudio: `domains/audioUI.js` e SFX foundations correspondentes.  
Narrador: configuração de sala `narratorEnabled`.

Regra do Narrador:

- usa `SpeechSynthesis`/Web Speech API;
- **somente o dispositivo do criador** vocaliza, evitando três dispositivos falando juntos;
- lê apenas informação pública: início, rodada, Carta Preta, reveal, vencedor/carta vencedora, fim;
- nunca lê mão privada, autoria oculta pré-reveal ou conteúdo privado de espectador;
- falha silenciosamente quando browser não oferece síntese;
- configuração pode ser alterada pelo criador somente antes do start.

Áudio/SFX possui recuperação coberta para Safari/iPhone/PWA; não remover unlock/recovery de AudioContext por parecer redundante em desktop.

Referência: `web/docs/P14_NARRADOR_LOJA_RECOMPENSAS_SALA.md`.

---

# 25. Administração / Criador

Frontend: `domains/adminUI.js`.  
Backend: `web/api/admin/**`, `web/lib/adminAuth.js`, `creatorAdmin.js`.  
Gateway: `web/serverless/admin.js`.

Admin deve aparecer somente na Home real para usuário autorizado. Não reintroduzir hook global de navegação. Rotas dinâmicas devem preservar parâmetros `type/index` em `req.query` através do gateway.

Ferramentas/entitlements exclusivos devem continuar server-authoritative.

---

# 26. CSS — protocolo de recuperação visual

Referência obrigatória: `web/docs/CSS_VISUAL_OWNERSHIP_MATRIX.md`.

Regra:

```text
resultado vigente
 → owner *Current.css
 → PXX pode ser shim de posição histórica
 → browser acceptance confirma equivalência
 → só então shim pode sair do runtime
```

## 26.1 P14–P23

Essa faixa já concluiu remoção dos shims do runtime. `index.html` carrega owners diretamente na mesma posição efetiva da cascata.

Owners importantes:

- `roomRulesCardBaseCurrent.css`
- `cosmeticFramesBaseCurrent.css`
- `roomSummaryCurrent.css`
- `roomRulesEditorCurrent.css`
- `economyPlacementCurrent.css`
- `lobbyReadinessCurrent.css`
- `recyclingBaseCurrent.css`
- `buffCardPresentationCurrent.css`
- `progressionFramesCurrent.css`
- `animatedCosmeticFramesBaseCurrent.css`
- `contributionCurrent.css`
- `cardCreationLibraryBaseCurrent.css`
- `buffRarityCurrent.css`
- `notificationsBaseCurrent.css`
- `doubleAnswerCurrent.css`
- `publicIdentityCurrent.css`
- `homeBackdropCurrent.css`
- `showcaseCurrent.css`
- `roomSetupDashboardCurrent.css`
- `cardTypeTabsCurrent.css`
- `cleanCardStackCurrent.css`
- `rewardEstimateCurrent.css`
- `cardCreationSemanticOverridesCurrent.css`
- `profileSaveFooterCurrent.css`

## 26.2 Shims posteriores ainda intencionais

P26+, quando ainda carregado como shim, não é automaticamente dívida não resolvida. Exemplos importantes:

- P26 → `genesisFrameBaseCurrent.css`;
- P29→31 → `genesisAtomicCurrent.css`;
- P33 → `cosmeticSpecialFramesCurrent.css`, `rankIdentityCurrent.css`;
- P35/P36 → Central + Asas;
- P37 → reuse/megafone/criador;
- P39 → back envelope/toast viewport;
- P41 → Reciclagem/detalhe de carta;
- P45→47 → controles superiores;
- P49→53 → account/hero/missões/presença;
- P54→60 → perfil/biblioteca/criador/lacuna;
- P62 → Extrato;
- P66 → formulários mobile/iOS;
- P68 → raridade de cartas / Super Trunfo;
- P74 → account strip final.

**Nunca remover shim sem comparar desktop + mobile.**

---

# 27. Backend, API e Vercel

## 27.1 Handlers permanecem autoritativos

`web/api/**` continua sendo a implementação HTTP do produto. Os gateways serverless não substituem esses módulos; apenas agrupam rotas para deployment.

Principais famílias:

```text
api/admin/
api/auth/
api/cards/
api/game/
api/profile/
api/rooms/
api/social/
api/buffs.js
api/loot.js
api/marketplace.js
api/notifications.js
api/recycling.js
api/version.js
```

## 27.2 8 gateways Vercel

`web/vercel.json` declara:

1. `serverless/auth.js`
2. `serverless/cards.js`
3. `serverless/game.js`
4. `serverless/profile.js`
5. `serverless/rooms.js`
6. `serverless/social.js`
7. `serverless/admin.js`
8. `serverless/root.js`

Mais `public/**` estático.

Trajetória: file-based routing chegou a gerar **62 Node Functions**, acima do limite Hobby. A arquitetura consolidada gera **8**.

Contrato: `tests/vercelApiGateway.contract.test.js` garante cobertura 1:1 e impede endpoint omitido/duplicado.

Se Vercel voltar a acusar limite de Functions, **não apagar APIs**: auditar `vercel.json`/gateways e o contrato.

## 27.3 Preview protegido

CI suporta:

- Trusted GitHub OIDC; ou
- `VERCEL_AUTOMATION_BYPASS_SECRET`.

Automation Bypass tem precedência na verificação. Curl usa `x-vercel-protection-bypass`; não voltar a adicionar `x-vercel-set-bypass-cookie: true` ao curl sem cookie jar, pois isso já causou loop HTTP 307. Playwright pode usar contexto/cookies adequadamente.

Nunca expor ou commitar o secret.

---

# 28. Banco de dados — mapa rápido por domínio

Não é inventário completo de colunas; é índice para incidente.

| Domínio | Tabelas/fontes-chave |
|---|---|
| Usuários/perfil | `users`, `user_unlocks`, `special_entitlements`, `cosmetic_ownerships` |
| Salas | `rooms`, `players`; `rooms.revision` com incremento monotônico |
| Partidas | `match_players`, `match_rounds`, reward settlements |
| Cartas canônicas | `canonical_cards`, `canonical_card_authors`, `canonical_card_ownerships` |
| Origem/presença | `card_origins`, `card_room_presence`, `canonical_card_match_presence` |
| Progressão pessoal | `user_card_progress`, `card_personal_progress_events`, `card_external_presence_events` |
| Legado global | `canonical_card_stats`, `canonical_card_round_events`, milestones |
| Economia | `dirty_coin_wallets`, `dirty_coin_ledger` |
| Mercado | `market_catalog`, `market_purchases` |
| BUFF | `buff_inventory`, `buff_inventory_ledger` + estado da rodada |
| Reciclagem | `card_recycling_batches` |
| Missões | `user_missions` |
| Achievements | events/progress/reward grants de achievements |
| Temporadas | `seasons`, `season_hall_of_fame` |

### Migrations/linhagem úteis

- `metagame_v1_4_package4.sql` — progressão canônica/Legado;
- package5 — Mercado;
- package6 — loot/claim/settlement;
- package7 — config de sala;
- package8 — BUFFs simples;
- package9 — engine/BUFFs avançados;
- package10 — achievements;
- package11 — cosméticos/prestígio;
- package12 — hardening/telemetria/revision;
- `p14_narrator_frames.sql` — Narrador + expansão inicial de frames;
- `p16_recycling.sql` — origem da Reciclagem;
- `p17_frame_rarity_rebalance.sql` — catálogo vigente das 17 molduras;
- `p18_creator_entitlements.sql` — entitlements especiais;
- `p32_amigo_de_merda_redraw.sql` — trajetória Amigo de Merda;
- `p41_recycling_any_count.sql` — regra vigente de 1+ carta na Reciclagem.

---

# 29. Testes e evidência de estabilidade

## 29.1 CI final estável

Âncora: `75232e8c0dbf99e3f75b44655cb8871b682d5acf`.

`Web tests #1068 / run 32779929078`:

- full contract suite: SUCCESS;
- browser acceptance: SUCCESS;
- multi-client simulado: SUCCESS;
- GitHub OIDC mint: SUCCESS;
- preview protegido: SUCCESS;
- real preview multiplayer lifecycle: SUCCESS;
- evidence upload: SUCCESS.

## 29.2 Browser Acceptance

Superfícies cobertas:

- Home;
- Perfil;
- Notificações;
- Mercado;
- Minhas Cartas;
- Rank;
- Stats;
- Lobby.

Viewports:

- desktop 1440×1000;
- mobile/iPhone-like 390×844.

Proteções específicas:

- sem overflow estrutural;
- carteira disponível no primeiro paint;
- ícones Perfil e Sair presentes;
- modais/superfícies principais renderizando.

## 29.3 Multiplayer simulado

Cobre:

```text
lobby
→ new_round
→ card_played
→ all_cards_played
→ round_result
→ game_over
→ settlement
```

Serve para regressão rápida, **não substitui E2E real**.

## 29.4 E2E real backend/Pusher

RC usa **3 clientes autenticados**, pois `MIN_PLAYERS=3`.

Comprovado:

- registros independentes;
- sala persistida;
- joins;
- convergência de lista via Pusher;
- autoridade do criador;
- Ready concorrente;
- revisão monotônica;
- start real;
- `new_round` nos três;
- exatamente um Mestre;
- mão privada individual;
- Mestre com mão mas sem submissão;
- não-Mestres com submissão;
- mãos diferentes/isoladas.

Artifact histórico do gate final: `visual-smoke-evidence` da execução de fechamento do gate real; `DOMAIN_MIGRATION_PROGRESS.md` contém IDs auditados.

---

# 30. Runbooks de reparo por sintoma

## 30.1 Carteira aparece tarde, some ou não atualiza

Verificar, nesta ordem:

1. `domains/accountUI.js` e owner de Marketplace wallet;
2. endpoint de saldo/ledger;
3. realtime `balance_updated`;
4. P75–P77 wallet trajectory (`web/docs/P75_WALLET_TRAJECTORY_AUDIT.md`);
5. browser acceptance first paint.

Não: adicionar timeout/MutationObserver global como patch.

## 30.2 Ícones Perfil/Sair viram “botão vazio”

Verificar:

- `accountUI.js`;
- `accountActionsCurrent.css` / `accountCurrent.css`;
- P73/P74 account strip;
- ordem carteira `30`, ações `40`;
- browser acceptance desktop/mobile.

Não: voltar a duplicar botão de Editar Perfil ou reintroduzir config redundante.

## 30.3 Ready de um jogador desaparece

Verificar:

- `api/rooms/ready.js` retry 3x;
- `roomStore.js` `RoomConflictError`/revision;
- payload `roomRevision` em `cards_submitted`;
- filtro stale em `core/roomSocketLifecycle.js`;
- contrato `roomReadinessConcurrency.contract.test.js` e contrato de ordering realtime.

Não: polling infinito, `sleep`, ou forçar revision.

## 30.4 Partida não inicia com 2 jogadores

Isso é **correto**. Mínimo canônico = 3.

## 30.5 Mestre aparece com 5 cartas

Isso é **correto**. A mão é futura. O que deve ser 0 é `requiredSubmissions`, e `canSubmitMore` deve ser false.

## 30.6 Mestre consegue responder

Regressão. Verificar `/api/game/hand`, submit guard, round engine e contrato Master hand.

## 30.7 Um jogador enxerga mão de outro

Incidente crítico de privacidade. Auditar `/api/game/hand`, broadcast `new_round` e qualquer serialização de `players[].hand`. Pusher deve carregar somente estado público.

## 30.8 BUFF funciona diferente do card/descrição

Começar por `buffDefinitions.js` + `BUFF_FUNCTIONAL_MATRIX.md`; depois engine simples/avançado. UI não é autoridade. Para Amigo de Merda, verificar rota dedicada. Para Saqueador, verificar `advancedRewards`.

## 30.9 BUFF é consumido duas vezes

Auditar inventory ledger/idempotency e transactional consumption. Não corrigir só o contador visual.

## 30.10 Reciclagem pede 10 cartas

Regressão para P16. Regra atual P41 = 1+ carta. Verificar constraint DB e `cardRecycling.js`.

## 30.11 Reciclagem apagou autoria/carta global

Regressão grave. Reciclagem remove somente ownership do usuário. Restaurar modelo canônico e revisar DELETE.

## 30.12 Moldura paga e progressão aparecem sobrepostas

Regressão. Existe um único `equipped_frame_key`. Verificar `profileUI`, `prestigeService`, identidade pública e CSS; não criar segundo slot.

## 30.13 Preço/raridade de moldura divergiu

Usar **P17** como catálogo vigente e `prestigeDefinitions.js` para mapping interno → label. Não usar preços do P14 como atuais.

## 30.14 Gênese ficou com órbita/estrelas antigas

Seguir P26→P31 na matriz CSS; resultado final é `genesisAtomicCurrent.css` + preview atual, não P27/P28 intermediário.

## 30.15 Cintilante/Asas mudaram preço após reparo visual

Erro de separação de domínio. P33/P36 são visuais; preços vêm de P17.

## 30.16 Notificação marca como lida só de abrir

Regressão. `notificationsUI` só consolida pending read no fechamento.

## 30.17 Narrador fala em todos os celulares

Regressão. Só dispositivo do criador vocaliza. Verificar ownership do narrator e identificação de creator.

## 30.18 Vercel volta para dezenas de Functions

Auditar `web/vercel.json`, `serverless/*` e `vercelApiGateway.contract.test.js`. Não deletar handlers `api/**`.

## 30.19 Preview CI cai em Login Vercel

Confirmar `VERCEL_AUTOMATION_BYPASS_SECRET` ou Trusted Source OIDC. Nunca imprimir secret. Curl deve preferir `x-vercel-protection-bypass` sem provocar loop de cookie 307.

## 30.20 CSS “quebra sem JS mudar”

Consultar `CSS_VISUAL_OWNERSHIP_MATRIX.md`, posição da cascata e shim PXX. Não remover/importar owner em posição arbitrária. Rodar browser acceptance desktop + mobile.

---

# 31. Documentos especializados de apoio

Use junto desta salvaguarda:

- `web/docs/DOMAIN_MIGRATION_PROGRESS.md` — fechamento 100/100 e evidências;
- `web/docs/JS_BASE_OWNERSHIP_MATRIX.md` — classificação JS;
- `web/docs/CSS_VISUAL_OWNERSHIP_MATRIX.md` — trajetória visual;
- `web/docs/BUFF_FUNCTIONAL_MATRIX.md` — BUFF por BUFF;
- `web/docs/REWARD_LOOT_MATRIX.md` — economia, loot e Saqueador;
- `web/docs/APP_LIFECYCLE_AUDIT.md` — lifecycle;
- `web/docs/FOUNDATION_MONOLITH_DECOMPOSITION.md` — decomposição dos monólitos;
- `web/docs/LEGACY_LINEAGE_MATRIX.md` — linhagem histórica;
- `web/docs/EARLY_PACKAGE_LINEAGE.md` — pacotes iniciais;
- `web/docs/P75_WALLET_TRAJECTORY_AUDIT.md` — carteira/first paint;
- `web/docs/P12_OPERATIONS.md` e `P12_SCENARIO_MATRIX.md` — hardening/operação;
- `web/docs/P14_NARRADOR_LOJA_RECOMPENSAS_SALA.md` — Narrador/loja/reward/lobby.

---

# 32. Checklist obrigatório para P78+

Antes de aceitar uma mudança futura:

- identificar explicitamente o owner atual;
- provar que nenhum owner paralelo foi criado;
- manter regra de negócio no server/engine quando aplicável;
- adicionar contrato para qualquer bug encontrado;
- preservar idempotência de economia/inventário/claim;
- preservar mão privada e mínimo 3;
- rodar full contracts;
- rodar browser acceptance se tocar UI/CSS;
- rodar multiplayer simulado se tocar lifecycle;
- rodar E2E real se tocar room/realtime/gameplay/private state;
- validar Vercel com 8 gateways/Functions;
- atualizar esta salvaguarda se a regra do produto mudou de propósito;
- manter PR/release sob governança explícita.

---

# 33. Definição de “estável” para este snapshot

Este documento chama de **estável** o estado em que:

- a cadeia P01–P77 foi reconciliada;
- todo resultado vigente possui owner, foundation, bridge ou classificação histórica explícita;
- 18 gates arquiteturais totalizam 100/100;
- BUFF matrix está 21/21;
- Lobby cobre 64 combinações contratadas;
- CSS P14–P23 saiu do runtime após equivalência visual;
- Vercel opera com 8 Functions;
- browser acceptance desktop/mobile passa;
- lifecycle simulado passa;
- E2E real de 3 clientes backend/Pusher passa;
- o próprio HEAD documental de fechamento `75232e8c…` passou no Web tests #1068.

**Estável não significa imutável.** Significa que qualquer mudança deve partir deste comportamento conhecido e alterar conscientemente um owner canônico, nunca reconstruir acidentalmente a arquitetura de patches paralelos.

---

# 34. Regra final de salvaguarda

Quando houver dúvida entre “corrigir rápido” e “corrigir no owner correto”, a prioridade é:

> **preservar o resultado estável + reparar no owner canônico + adicionar prova automatizada da causa encontrada.**

Foi exatamente esse método que fechou o último 1%: o RC real não foi relaxado para passar. Ele revelou concorrência de Ready, eventos Pusher fora de ordem e contrato inconsistente do Mestre; cada problema foi corrigido no responsável correto e protegido por teste.

Esse princípio é a maior salvaguarda do Cartaralho daqui em diante.
