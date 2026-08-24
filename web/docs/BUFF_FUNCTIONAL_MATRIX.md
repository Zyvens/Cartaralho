# Matriz funcional canônica — 21 BUFFs

> Branch: `refactor/domain-owners`  
> Baseline funcional: **P75 / v1.4.75**  
> Regra: esta matriz descreve o comportamento vigente e seus owners. Não autoriza mudança de regra durante a consolidação.

## Roteamento autoritativo

- `/api/buffs` valida sessão, sala, inventário e definição.
- Rodadas avançadas usam `advancedBuffEngine`; rodadas simples usam `buffEngine`.
- **Amigo de Merda é exceção explícita:** `/api/buffs` chama diretamente `amigoDeMerda.js` em qualquer tipo de rodada. Os ramos homônimos existentes nos engines genéricos são legado interno e não são a rota autoritativa.
- **Saqueador** participa da janela `FINAL_REWARD` e a liquidação financeira pertence a `advancedRewards.js`.
- A regra geral continua sendo uma ativação por jogador/rodada, com persistência server-side e consumo de inventário dentro da transação aplicável.

## Matriz

| BUFF | Família/owner | Fase(s) | Papel | Alvo | Contrato vigente |
|---|---|---|---|---|---|
| Dedo no Olho | engine simples/avançado | mão, submissões | qualquer | adversário | revela privadamente uma carta aleatória da mão alvo |
| Foi sem querer querendo | engine simples/avançado | submissões | qualquer | própria submissão | recolhe a resposta antes da revelação e exige nova resposta |
| Amigo de Merda | `amigoDeMerda.js` | mão, submissões | qualquer | adversário não submetido | devolve a mão inteira ao pool, embaralha e compra nova mão do mesmo tamanho |
| Vou fingir que ninguém viu | avançado | submissões, escolha do mestre | mestre | próprio estado | revela autoria das respostas somente ao Mestre |
| Meu jogo, minhas regras | avançado | mão, submissões | qualquer | próprio estado | permite duas respostas independentes na rodada |
| Xô vê aqui | engine simples/avançado | mão | qualquer | adversário | troca uma carta escolhida da própria mão por uma aleatória do alvo |
| Mão de Vaca | engine simples/avançado | mão | qualquer | próprio estado | compra duas extras e bloqueia continuidade até devolver duas |
| Testemunha Protegida | engine simples/avançado | submissões | qualquer | própria submissão | protege submissões contra manipulação naquela rodada |
| Surrupiada | avançado | submissões | qualquer | submissão alheia | retira resposta ativa e força substituição; usa lock global próprio |
| Toque de Midas | engine simples/avançado | mão | qualquer | próprio estado | devolve a própria mão ao pool e compra outra do mesmo tamanho |
| Censura Prévia | avançado | mão | mestre | Carta Preta | troca a Carta Preta antes de qualquer resposta; compartilha lock `black_swap` |
| Quem nunca? | avançado | mão | qualquer | Carta Preta | troca a Carta Preta antes de qualquer resposta; compartilha lock `black_swap` |
| Silêncio Geral | avançado | mão, submissões, escolha do mestre | mestre | partida | desabilita reações pelo restante da partida |
| Quero tudo que é seu | avançado | mão, submissões | qualquer | dois jogadores | troca integralmente as mãos e metadados temporários dos dois alvos |
| Intervenção Federal | avançado | mão, submissões, escolha do mestre | qualquer | último BUFF reversível | restaura snapshot do efeito anterior dentro da janela do engine e registra cancelamento |
| Apagão | avançado | mão, submissões, escolha do mestre | qualquer | próxima rodada | bloqueia novas ativações na rodada seguinte |
| O poder subiu à cabeça | avançado | mão, submissões, escolha do mestre | mestre | rotação | mantém o Mestre na próxima rodada uma vez e inverte a direção da mesa |
| CAOS TOTAL | avançado | mão, submissões | qualquer | adversários | oculta no servidor o conteúdo das mãos adversárias para os demais clientes |
| Se fode aí | avançado | mão, submissões | qualquer | adversários | substitui cartas especiais dos adversários por cartas normais do pool |
| Que Poder, Filho da Puta | avançado | escolha do mestre | mestre | submissão | toma o ponto e a carta escolhida apenas como posse temporária; não cria ownership/progressão |
| Saqueador | avançado + `advancedRewards.js` | recompensa final | qualquer | próprio ingresso | entra no rateio do **pote de colocação**; sobrevivência e consolação não entram no saque |

## Invariantes protegidos

1. `buffDefinitions.js` contém exatamente 21 definições; papel, alvo e fases são parte do contrato.
2. BUFFs avançados exigem round engine avançado e respeitam `roleValid`, fase, blackout e locks globais.
3. O consumo de inventário e a persistência da ativação permanecem server-side e idempotentes.
4. `Amigo de Merda` usa `amigoDeMerda.js` como owner canônico; qualquer implementação antiga de simples embaralhamento não pode voltar a ser rota oficial.
5. `Que Poder` usa posse temporária com `progressEligible:false`; não cria `canonical_card_ownerships`.
6. `Saqueador` abre janela de 15 segundos e redistribui somente `placement_pot`. `survival_reward` e `consolation_reward` são liquidados separadamente.
7. Testemunha Protegida, Apagão, Intervenção e os locks globais continuam sendo decisões autoritativas do servidor.

## Evidência automatizada

- `tests/buffCatalogP8.test.js`
- `tests/buffDefinitionsP8.test.js`
- `tests/buffEngineP8.contract.test.js`
- `tests/advancedBuffP9.contract.test.js`
- `tests/p32PolishAudioAmigo.contract.test.js`
- `tests/domainOwnershipArchitecture.contract.test.js`
- `tests/buffFunctionalMatrix.contract.test.js`

## Estado do gate

A **matriz funcional dos 21 BUFFs está fechada** para fins de consolidação arquitetural. Isso não substitui o gate final de browser/multiplayer real; ele continua reservado ao aceite final. Qualquer alteração futura de mecânica deve ser tratada como mudança de produto e não como refatoração histórica.
