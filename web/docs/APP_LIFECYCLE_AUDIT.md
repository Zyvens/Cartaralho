# Auditoria de lifecycle — `app.js`

> Branch: `refactor/domain-owners`  
> Baseline: **P75 / v1.4.75**  
> Objetivo: decompor o controller sem alterar ordem de inicialização, estado, navegação ou semântica de eventos.

## Estado atual da extração

Duas responsabilidades já possuem owners executáveis carregados após `app.js` e **antes de `DOMContentLoaded`**:

1. **App State** — `public/js/core/appState.js` é o owner runtime de estado inicial + reset;
2. **Base Screen Router** — `public/js/core/screenRouter.js` é o owner runtime da transição/cleanup das telas e é capturado depois por `navigationUI`.

Os equivalentes físicos ainda presentes em `app.js` permanecem apenas como fallback de compatibilidade durante a migração. Como os owners core são avaliados antes de `App.init()`, eles são substituídos antes do primeiro uso observável do bootstrap. A remoção física desses blocos do monólito deve ocorrer quando as demais responsabilidades forem separadas, evitando um rewrite grande e arriscado no mesmo passo.

## Responsabilidades ainda executáveis no controller

`public/js/app.js` continua concentrando:

1. **bootstrap** em `init()` + `DOMContentLoaded`;
2. **lifecycle de rede** em `registerSocketEvents()`;
3. **fluxo local** em `handleLocalNextTurn()`.

`App.state/resetState` e o roteador-base já têm owners runtime externos. `navigationUI` continua sendo o writer final da navegação.

## Ordem de bootstrap que deve sobreviver

1. scripts de tela/componentes são avaliados;
2. `app.js` declara `window.App` e agenda o `DOMContentLoaded`;
3. `core/appState.js` instala estado/reset canônicos;
4. `core/screenRouter.js` instala o roteador-base canônico;
5. demais módulos/owners são avaliados;
6. `DOMContentLoaded` chama `App.init()`;
7. `SocketClient.init()` executa antes do registro dos listeners;
8. `registerSocketEvents()` registra o lifecycle da sala/partida;
9. o modo guest/localtunnel é detectado;
10. a primeira tela é escolhida;
11. `navigationUI`, já avaliado antes do evento, captura o roteador-base e permanece writer final de `App.showScreen`.

Trocar essa ordem pode perder eventos iniciais, quebrar guest mode ou fazer owners capturarem uma função incompleta.

## Estado que não pode ser perdido

`core/appState.js` preserva o contrato histórico:

- estado inicial inclui `playMode:'online'`, `isGuest:false` e `guestCode:''`;
- reset preserva `nickname`;
- reset limpa código da sala, criador, jogadores, mão, Carta Preta, host, placar e rodada;
- reset restaura `useStandardDeck:true`;
- `Scoreboard.hide()` continua parte do reset observável;
- rascunhos de `CardCreationScreen.blackCards/whiteCards` **não são limpos**, deliberadamente, para recuperação após queda do host.

## Roteador-base

`core/screenRouter.js` preserva as telas:

- Home
- Waiting Host
- Guest
- Criar Sala
- Lobby
- Server Dashboard
- Criação de Cartas
- Rodada
- Host/Mestre
- Resultado
- Game Over
- Admin

Antes de sair de Resultado, `ResultScreen.cleanup()` executa. Antes de sair de Waiting Host, `WaitingHostScreen.cleanup()` executa. As classes `screen-exit`/`screen-enter` e timings **300 ms / 400 ms** foram preservados. `navigationUI` captura este roteador e continua sendo o único writer final de `App.showScreen` entre owners.

## Eventos de socket ainda registrados pelo controller

### Sala / presença

- `room_created`
- `room_joined`
- `room_closed`
- `player_list_update`
- `player_disconnected`
- `player_left`
- `player_reconnected`
- `room_cancelled`
- `player_abandoned`
- `server_status_update`

### Preparação da partida

- `cards_submitted`
- `all_cards_ready`
- `game_started`

### Rodada

- `new_round`
- `card_played`
- `all_cards_played`
- `round_result`
- `round_skipped`
- `game_over`

### Erro

- `error`

## Invariantes de gameplay/lifecycle

- `new_round` atualiza número, Carta Preta, placar, mão e papel de Host antes de navegar;
- `all_cards_played` preserva `submissions` no estado para modo local;
- `round_result` limpa a fila local antes de abrir Resultado;
- `game_over` esconde o placar antes de abrir Game Over;
- queda/cancelamento de sala segue caminhos diferentes para localtunnel/emulador, guest remoto e cliente normal;
- `player_abandoned` mantém modal + retorno automático ao início.

## Próxima decomposição segura

1. **Room Socket Lifecycle** — sala/presença/preparação, provando inscrição única por evento;
2. **Gameplay Socket Lifecycle** — rodada/resultado/game over, preservando ordem de mutação;
3. **Local Turn Flow** — `handleLocalNextTurn()` separado sem alterar blind screens;
4. **Bootstrap mínimo** — `App.init()` apenas compõe peças e escolhe a primeira tela;
5. somente então remover fisicamente os fallbacks de state/router do `app.js`.

Nenhuma etapa deve duplicar listeners. Migração de socket só é aceita quando o contrato prova uma única inscrição por evento e a ordem de mutação continua idêntica.

## Evidência

`tests/appLifecycle.contract.test.js` agora prova explicitamente os owners `core/appState.js` e `core/screenRouter.js`, sua ordem de carregamento e a permanência dos eventos de socket no controller até a próxima extração.
