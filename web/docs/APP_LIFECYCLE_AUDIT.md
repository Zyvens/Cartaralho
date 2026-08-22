# Auditoria de lifecycle — `app.js`

> Branch: `refactor/domain-owners`  
> Baseline: **P75 / v1.4.75**  
> Objetivo: decompor o controller sem alterar ordem de inicialização, estado, navegação ou semântica de eventos.

## Estado atual da extração

O lifecycle runtime foi decomposto em owners carregados após `app.js` e **antes de `DOMContentLoaded`**:

1. **App State** — `public/js/core/appState.js`: estado inicial + reset;
2. **Base Screen Router** — `public/js/core/screenRouter.js`: transição/cleanup das telas;
3. **Local Turn Flow** — `public/js/core/localTurnFlow.js`: fila local/blind screen/passagem ao Czar;
4. **Room Socket Lifecycle** — `public/js/core/roomSocketLifecycle.js`: sala, presença, preparação e erro;
5. **Gameplay Socket Lifecycle** — `public/js/core/gameplaySocketLifecycle.js`: rodada, resultado e game over;
6. **Socket Lifecycle Composer** — `public/js/core/socketLifecycle.js`: registro único dos dois grupos;
7. **App Bootstrap** — `public/js/core/appBootstrap.js`: `SocketClient.init → registerSocketEvents → guest detection → primeira tela`.

`navigationUI` continua sendo o writer final de `App.showScreen` e captura o roteador-base já substituído.

Os equivalentes físicos presentes em `app.js` são agora **fallbacks de compatibilidade** durante a migração. Os owners core são avaliados antes do `DOMContentLoaded`; portanto estado, reset, roteamento, turno local, bootstrap e registro de sockets são substituídos antes do primeiro uso observável do controller.

## Responsabilidade runtime de `app.js`

No caminho normal, `app.js` mantém apenas:

- a declaração física de `window.App` com fallbacks;
- o listener `DOMContentLoaded`, que chama o `App.init()` já substituído pelo owner `appBootstrap`.

Não há mais ownership runtime efetivo de estado, router, fluxo local, bootstrap ou socket lifecycle no monólito.

A remoção física dos fallbacks deve ser feita em etapa posterior, quando a classificação dos módulos-base JS estiver concluída. Isso evita combinar mudança arquitetural e limpeza mecânica no mesmo gate.

## Ordem de bootstrap preservada

1. scripts de tela/componentes são avaliados;
2. `app.js` declara `window.App` e agenda `DOMContentLoaded`;
3. `core/appState.js` instala estado/reset;
4. `core/screenRouter.js` instala o roteador-base;
5. `core/localTurnFlow.js` instala o fluxo local;
6. `core/roomSocketLifecycle.js` e `core/gameplaySocketLifecycle.js` declaram seus registradores;
7. `core/socketLifecycle.js` substitui `App.registerSocketEvents` por um compositor idempotente;
8. `core/appBootstrap.js` substitui `App.init()`;
9. demais módulos/owners são avaliados;
10. `DOMContentLoaded` chama `App.init()`;
11. `SocketClient.init()` executa;
12. o compositor registra Room + Gameplay exatamente uma vez;
13. o modo guest/localtunnel é detectado;
14. a primeira tela é escolhida;
15. `navigationUI` já possui o roteador-base como delegate e permanece writer final.

## App State

`core/appState.js` preserva:

- `playMode:'online'`, `isGuest:false`, `guestCode:''` no primeiro estado;
- `nickname` no reset;
- limpeza de código da sala, criador, jogadores, mão, Carta Preta, host, placar e rodada;
- `useStandardDeck:true` no reset;
- `Scoreboard.hide()`;
- rascunhos `CardCreationScreen.blackCards/whiteCards` **não são limpos**, preservando recuperação após queda do host.

## Base Screen Router

`core/screenRouter.js` preserva Home, Waiting Host, Guest, Criar Sala, Lobby, Server Dashboard, Criação de Cartas, Rodada, Host/Mestre, Resultado, Game Over e Admin.

- `ResultScreen.cleanup()` ao sair de Resultado;
- `WaitingHostScreen.cleanup()` ao sair de Waiting Host;
- `screen-exit` / `screen-enter`;
- timings **300 ms / 400 ms**.

`navigationUI` continua o único writer final de `App.showScreen` entre owners.

## Local Turn Flow

`core/localTurnFlow.js` preserva:

- descoberta do Czar por `localPlayersData`;
- fila dos não-hosts;
- `SocketClient.setActiveLocalPlayer()` antes de cada turno;
- blind screen `Vez de:` → `round`;
- blind screen `Vez do Czar:` → `host`;
- nenhuma inscrição de socket própria.

## Room Socket Lifecycle

Owner: `core/roomSocketLifecycle.js`.

Eventos registrados uma única vez pelo compositor:

- `room_created`
- `room_joined`
- `room_closed`
- `player_list_update`
- `cards_submitted`
- `all_cards_ready`
- `game_started`
- `error`
- `player_disconnected`
- `player_left`
- `room_cancelled`
- `player_abandoned`
- `player_reconnected`
- `server_status_update`

Invariantes preservados:

- criação/join atualizam config e jogadores antes do Lobby;
- localhost ainda emite `set_host_mode` quando aplicável;
- fechamento/cancelamento mantêm caminhos distintos para localtunnel/emulador, guest remoto e cliente normal;
- fechamento normal executa `resetState()`, cancelamento preserva a semântica histórica de retorno sem reset completo;
- `cards_submitted` mantém fluxo local, limpeza pós-confirmação e retorno ao Lobby;
- erro de sala não encontrada mantém fallback para `onlineEmulator` e reabilitação dos botões;
- abandono AFK mantém modal de 15s + retorno automático;
- `server_status_update` ainda devolve guest para Waiting Host quando o servidor volta a `waiting`.

## Gameplay Socket Lifecycle

Owner: `core/gameplaySocketLifecycle.js`.

Eventos:

- `new_round`
- `card_played`
- `all_cards_played`
- `round_result`
- `game_over`
- `round_skipped`

Invariantes preservados:

- `new_round` atualiza número, Carta Preta, placar, `localPlayersData`, mão e papel de Host antes de navegar;
- modo local espera 300 ms e delega para `handleLocalNextTurn()`;
- `card_played` atualiza contagem nas telas Round/Host;
- `all_cards_played` preserva `submissions` no estado para modo local;
- `round_result` limpa `localTurnQueue` antes de abrir Resultado;
- `game_over` esconde o placar antes de abrir Game Over;
- `round_skipped` mantém feedback via toast.

## Idempotência / duplicação

`core/socketLifecycle.js`, `roomSocketLifecycle.js` e `gameplaySocketLifecycle.js` possuem guards de registro. O compositor chama cada grupo uma única vez. `appBootstrap` chama apenas `app.registerSocketEvents()`; como esse método já foi substituído antes do `DOMContentLoaded`, os listeners físicos antigos de `app.js` não são registrados no runtime normal.

`tests/appLifecycle.contract.test.js` exige que os **20 eventos core** apareçam exatamente uma vez no conjunto dos owners runtime de socket.

## Gate Core/lifecycle — FECHADO EM RUNTIME

O contrato final do split de sockets (`55e72ec9e9a0cb02385b391332f7189e338c334a`) e o checkpoint documental subsequente chegaram a preview Vercel **READY**. Portanto, para fins de ownership runtime, o Gate Core/lifecycle está fechado.

Isso **não** autoriza ainda a exclusão física dos fallbacks de `app.js`. Eles permanecem até a classificação dos módulos-base JS e o gate de limpeza mecânica, evitando regressão por acoplamentos não identificados.

## Próxima etapa

1. classificar módulos-base JS restantes por `CURRENT`, `DELEGATE/WRAPPER`, `SUPERSEDED` e `HISTORICAL`;
2. consolidar gameplay/telas-base além do lifecycle;
3. remover fisicamente fallbacks de `app.js` e wrappers históricos somente depois da classificação completa;
4. comparar visualmente desktop/mobile antes de retirar shims CSS;
5. executar CI integral + aceite desktop/mobile/iPhone/PWA/multiplayer antes de merge.

## Evidência

- `tests/appLifecycle.contract.test.js`
- `public/js/core/appState.js`
- `public/js/core/screenRouter.js`
- `public/js/core/localTurnFlow.js`
- `public/js/core/roomSocketLifecycle.js`
- `public/js/core/gameplaySocketLifecycle.js`
- `public/js/core/socketLifecycle.js`
- `public/js/core/appBootstrap.js`

Todos os owners/ativação e o contrato final desta onda chegaram a preview Vercel **READY**.
