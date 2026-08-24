# Matriz de regras de Sala/Lobby

> Branch: `refactor/domain-owners`  
> Baseline: **P75 / v1.4.75**

## Configuração canônica

`lib/roomConfig.js` é o owner server-side das regras configuráveis antes da partida. `domains/roomUI.js` é o owner de sincronização/apresentação no cliente.

### Faixas numéricas

- jogadores máximos: **3–10**;
- pontos para vencer: **3–20**;
- tamanho da mão: **5–15**.

### Flags independentes

As seis flags abaixo são independentes e a matriz de **64 combinações** é coberta por contrato:

- `useStandardDeck` — usar baralho padrão/nativo;
- `cardCreationEnabled` — permitir criar novas Cartas de Jogador nesta mesa;
- `playerCardsEnabled` — permitir reutilizar Cartas de Jogador já possuídas;
- `afkEnabled` — permitir política de inatividade;
- `buffsEnabled` — habilitar BUFFs;
- `narratorEnabled` — habilitar Narrador.

Importante: `cardCreationEnabled` e `playerCardsEnabled` não são sinônimos. É válido desligar criação de novas cartas e ainda permitir cartas antigas, ou permitir criação nova e proibir reuso de cartas antigas.

## Autoridade e momento de edição

- somente o criador da sala pode alterar regras;
- alterações só são permitidas nos estados pré-partida;
- `maxPlayers` nunca pode cair abaixo da quantidade de participantes ativos;
- após `rewardConfigSnapshot` ou início efetivo da partida, a configuração fica congelada;
- `publicConfig()` é a projeção canônica enviada ao cliente.

## Relações com outras regras

### Espólio / contribuição

A penalidade de contribuição (“Mão de Vaca” para Espólio) depende de **criação de novas Cartas de Jogador**:

- `cardCreationEnabled=true` → contribuição zero pode eliminar Espólio;
- `cardCreationEnabled=false` → contribuição zero não elimina Espólio;
- `playerCardsEnabled` não substitui essa regra.

### BUFFs

`buffsEnabled` apenas habilita/desabilita o sistema para a sala; fases, papéis e efeitos continuam definidos server-side na matriz dos 21 BUFFs.

### Narrador

Quando uma atualização remota desliga `narratorEnabled`, `roomUI` cancela imediatamente a narração ativa.

## Sincronização no cliente

`roomUI`:

1. recebe `room_config_updated` uma única vez por lifecycle de domínio;
2. mescla a configuração completa em `App.state.config`;
3. atualiza campos de compatibilidade (`maxPlayers`, `useStandardDeck`);
4. re-renderiza Lobby quando necessário;
5. evita listener duplicado com `SocketClient.__domainRoomConfig`.

## Evidência

- `tests/roomConfigP7.test.js`
- `tests/roomRuleMatrix.contract.test.js`
- `lib/roomConfig.js`
- `domains/roomUI.js`
- `docs/REWARD_LOOT_MATRIX.md`

## Estado do gate

A matriz de configuração de **Sala/Lobby está fechada**: limites, autoridade, snapshot e as 64 combinações booleanas possuem contrato. Validação visual/multiplayer final permanece no Gate 18.
