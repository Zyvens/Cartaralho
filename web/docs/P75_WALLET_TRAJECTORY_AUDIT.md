# Auditoria de trajetória — P75 / carteira no primeiro paint

> Branch: `refactor/domain-owners`  
> Resultado de referência: `main` P75 / v1.4.75  
> Owners: `domains/accountUI.js` + `domains/marketplaceUI.js`

## Contrato atual

1. O saldo de Moedas Sujas deve nascer no primeiro paint da Home a partir de `AuthClient.user.dirty_balance` já autenticado; cache local é apenas fallback de apresentação.
2. O render inicial da faixa de conta não deve iniciar uma consulta remota concorrente apenas para obter o saldo.
3. Confirmações autoritativas devem usar o endpoint leve `/api/profile/wallet`, nunca carregar Mercado Paralelo ou Cartas Limpas para obter um único número.
4. Leituras autoritativas simultâneas devem ser coalescidas em uma única Promise em voo.
5. Eventos `balance_updated`, recompensas administrativas e respostas transacionais continuam aplicando saldo exato imediatamente e usam a leitura leve apenas como confirmação.
6. O mostrador permanece filho direto da faixa de conta, imediatamente antes das ações Perfil/Sair, conforme P74.

## Trajetória causal

- **P49 — PRESERVED:** introduz slot/cache do saldo na Home. O mecanismo histórico de hidratação por Cartas Limpas foi posteriormente `SUPERSEDED`.
- **P61 — PRESERVED/SUPERSEDED:** adiciona sincronização após prêmio administrativo; consulta pesada de marketplace/Cartas Limpas para um único saldo foi `SUPERSEDED`.
- **P63 — PRESERVED:** eventos transacionais/realtime permanecem gatilhos e saldo exato continua sendo aplicado imediatamente.
- **P64 — PRESERVED:** estabelece `dirty_balance` autenticado e `/api/profile/wallet`; P75 acrescenta coalescing de refresh.
- **P65 — PRESERVED:** um único mostrador canônico continua válido.
- **P73 — PRESERVED:** primeiro render da conta e integridade dos ícones Perfil/Sair continuam válidos.
- **P74 — PRESERVED/SUPERSEDED:** posição da carteira na faixa principal é preservada; fetch autoritativo iniciado durante `HomeScreen.renderAccount` foi `SUPERSEDED`.
- **P75 — CURRENT:** saldo conhecido no primeiro paint + endpoint leve + coalescing + ausência de fetch concorrente no render inicial.

## Implementação canônica

### `domains/marketplaceUI.js`

- `knownBalance()` prioriza `AuthClient.user.dirty_balance` e usa cache somente como fallback.
- `mountBalance()` monta o valor conhecido de forma síncrona.
- `refreshBalance()` consulta exclusivamente `/api/profile/wallet` e compartilha `walletRefreshPromise` enquanto a confirmação está em voo.
- `applyBalance()` continua sendo a entrada canônica para atualizar usuário, cache, slot, Mercado aberto e evento local.
- realtime e respostas de transação continuam chamando `applyBalance()` antes da confirmação remota.

### `domains/accountUI.js`

- `HomeScreen.renderAccount` monta/decorra a faixa e a carteira nos ciclos síncrono/microtask/animation-frame.
- não chama `refreshBalance('home_render')`; refreshes permanecem ligados a eventos/retomadas/necessidade transacional, não ao primeiro paint.

## Verificação inversa — resultado → passado

- P75 não remove o slot, layout ou atalho do extrato criado pela trajetória P49/P62/P74.
- P75 não remove cache nem atualização imediata após eventos.
- P75 não altera regras de ganho/gasto, reciclagem, compra ou recompensa; altera somente a hidratação/reconciliação do número exibido.
- P75 não reativa `p49.js`, `p61.js`, `p63.js`, `p64.js` ou `p74.js`; esses arquivos continuam evidência histórica não executável na branch.
- Perfil/Sair continuam owned por `accountUI` e não dependem do refresh da carteira.

## Evidência automatizada

- `tests/p74WalletPlacement.contract.test.js`: prova o resultado P74 preservado e marca os mecanismos superados pelo P75.
- `tests/p75WalletFirstPaint.contract.test.js`: prova first paint, endpoint leve, coalescing, realtime/transações e release P75.
- `tests/domainOwnershipArchitecture.contract.test.js`: continua exigindo `accountUI` e `marketplaceUI` como owners canônicos do resultado.

## Classificação final

- Resultado da carteira: `CURRENT` em P75.
- Layout P74: `PRESERVED`.
- Fetch no `home_render`: `SUPERSEDED`.
- Fallback remoto para `/api/marketplace` ou `AuthClient.cleanCards()` para descobrir saldo: `SUPERSEDED`.
- PXX cliente envolvidos: `HISTORICAL`, não executáveis.

Nenhuma regra econômica, premiação, gameplay ou progressão foi alterada nesta reconciliação.
