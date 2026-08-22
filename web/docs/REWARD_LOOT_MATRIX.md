# Matriz econômica — Recompensas, Espólio e Saqueador

> Branch: `refactor/domain-owners`  
> Baseline: **P75 / v1.4.75**

Esta matriz congela as regras econômicas vigentes durante a consolidação. Refatoração de ownership não pode alterar valores, elegibilidade ou composição de potes.

## Recompensa em Moedas Sujas

- Engine: `rewardEngineRules.js` + `advancedRewards.js`.
- Bases de colocação: **1º 150 / 2º 75 / 3º 40** antes do multiplicador de esforço.
- Sobrevivência: componente separado, condicionado à participação mínima de **70%**.
- Consolação: **1 moeda**, somente para o último colocado quando há mais de 3 jogadores.
- Partida válida exige rodadas registradas e pelo menos 3 jogadores elegíveis.
- A curva usa pontos para vencer + jogadores efetivos; o resultado é congelado no settlement.

## Espólio

- Engine: `matchLoot.js` + `matchLootRules.js`.
- Quota base por posição: **10 / 7 / 5** para 1º/2º/3º e **3** para demais posições.
- A quota solicitada escala pelo índice de esforço.
- A quota final nunca pode exceder a quantidade de cartas realmente elegíveis e ainda não possuídas.
- Claim usa `claim_match_loot` e refresh de progressão só ocorre em concessão nova, nunca em replay idempotente.

### Regra de contribuição (“Mão de Vaca”)

A exigência de contribuir com Carta de Jogador para ter Espólio só se aplica quando `cardCreationEnabled !== false`.

- Criação ativa + contribuição zero → jogador fica sem Espólio.
- Criação desligada → não há penalidade de contribuição, mesmo que cartas antigas possam ser selecionadas.
- A liquidação revalida a seleção final; o estado de “Pronto” do Lobby é apenas feedback, não autoridade econômica.

## Saqueador

- Janela: **15 segundos**.
- O pote saqueável é composto **somente por `placement_reward`**.
- Havendo ao menos um Saqueador, o placement original deixa de ser pago aos colocados e é dividido entre os participantes do saque.
- `survival_reward` e `consolation_reward` continuam pertencendo aos seus destinatários e **não entram no rateio**.
- A divisão usa partes inteiras e distribui o resto deterministicamente pela ordem dos participantes persistidos.
- Liquidação usa ledger idempotente e transação `Serializable`.

## Matriz de cenários protegidos

| Cenário | Resultado obrigatório |
|---|---|
| 3 jogadores, partida válida | 1º/2º/3º recebem placement; não existe consolação de último |
| 5 jogadores, último com participação >=70% | último pode receber sobrevivência + 1 de consolação |
| 5 jogadores, último com participação <70% | último recebe apenas 1 de consolação |
| Saqueador sem placement pot | ativação recusada como `empty_raid_pot` |
| Saqueador fora da janela | ativação recusada como `reward_window_closed` |
| 1+ Saqueadores | apenas placement pot é zerado para ranking e repartido |
| Criação de cartas ativa e jogador contribuiu zero | entitlement de Espólio vira `empty`, quota 0 |
| Criação de cartas desligada | contribuição zero não elimina Espólio |
| Cartas elegíveis < quota calculada | quota final é limitada ao número elegível |
| claim repetido | não duplica ownership nem progressão |

## Evidência automatizada

- `tests/rewardLootMatrix.contract.test.js`
- `tests/buffFunctionalMatrix.contract.test.js`
- contratos históricos de reward/loot preservados na suíte existente

## Estado

A matriz server-side de **recompensas + Espólio + Saqueador** está fechada para a consolidação arquitetural. O aceite final multiplayer/browser continua separado no Gate 18.
