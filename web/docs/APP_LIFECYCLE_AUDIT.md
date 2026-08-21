# Auditoria de lifecycle — `app.js`

> Branch: `refactor/domain-owners`  
> Baseline: **P75 / v1.4.75**  
> Objetivo: decompor o controller sem alterar ordem de inicialização, estado, navegação ou semântica de eventos.

## Responsabilidades atuais

`public/js/app.js` ainda acumula quatro papéis:

1. **estado de sessão/partida** em `App.state` e `resetState()`;
2. **bootstrap** em `init()` + `DOMContentLoaded`;
3. **roteador-base** em `showScreen()`;
4. **lifecycle de rede** em `registerSocketEvents()`, além do fluxo local em `handleLocalNextTurn()`.

O arquivo não é mais o writer final de navegação: `domains/navigationUI.js` captura o `App.showScreen` base e instala o interceptador canônico após o carregamento do `app.js`.

## Ordem de bootstrap que deve sobreviver

1. `DOMContentLoaded` chama `App.init()`.
2. `SocketClient.init()` executa antes do registro dos listeners.
3. `registerSocketEvents()` registra o lifecycle da sala/partida.
4. o modo guest/localtunnel é detectado.
5. a primeira tela é escolhida.
6. posteriormente `navigationUI` captura o roteador-base e se torna o único writer final de `App.showScreen` entre owners.

Trocar essa ordem pode perder eventos iniciais, quebrar guest mode ou fazer owners capturarem uma função incompleta.

## Estado que não pode ser perdido

O reset preserva `nickname` e limpa contexto de partida: código da sala, criador, jogadores, mão, Carta Preta, host, placar e rodada. `Scoreboard.hide()` também faz parte do reset observável.

Os rascunhos de `CardCreationScreen.blackCards/whiteCards` **não são limpos em `resetState()`** deliberadamente, para permitir recuperação após queda do host.

## Roteador-base

Telas atualmente suportadas:

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

Antes de sair de Resultado, `ResultScreen.cleanup()` precisa executar. Antes de sair de Waiting Host, `WaitingHostScreen.cleanup()` precisa executar. As classes `screen-exit`/`screen-enter` e seus timings são parte do comportamento visual atual até a futura consolidação CSS.

## Eventos de socket canônicos registrados pelo controller

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

- `new_round` atualiza número, Carta Preta, placar, mão e papel de Host antes de navegar.
- `all_cards_played` preserva `submissions` no estado para o modo local.
- `round_result` limpa a fila local antes de abrir Resultado.
- `game_over` esconde o placar antes de abrir Game Over.
- queda/cancelamento de sala segue caminhos diferentes para localtunnel/emulador, guest remoto e cliente normal.
- `player_abandoned` mantém modal + retorno automático ao início.

## Estratégia de decomposição segura

A extração deve ocorrer em etapas e manter a API pública `window.App`:

1. **App State** — factory de estado inicial + reset, sem tocar em socket.
2. **Base Screen Router** — roteador puro/cleanup, carregado antes de `navigationUI`.
3. **Room Socket Lifecycle** — sala/presença/preparação.
4. **Gameplay Socket Lifecycle** — rodada/resultado/game over.
5. **Bootstrap mínimo** — `App.init()` apenas compõe as peças e escolhe a primeira tela.

Nenhuma etapa deve duplicar listeners. A migração de socket só é aceita quando o contrato prova uma única inscrição por evento e a ordem de mutação de estado continua idêntica.

## Evidência

`tests/appLifecycle.contract.test.js` congela o contrato atual antes da primeira extração. Enquanto o `app.js` ainda contém as responsabilidades acima, esta auditoria **não aumenta sozinha o Gate 3**; o percentual só sobe quando responsabilidade executável sair efetivamente do monólito.
