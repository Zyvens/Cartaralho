# P12 — Matriz de cenários de hardening

| Cenário | Invariante | Defesa/validação |
|---|---|---|
| Duas abas / double tap | uma ação de estado não consome a próxima ação por engano | `rooms.revision` + CAS transacional; `expectedCard` no play |
| Retry HTTP | repetir request não duplica moeda/item/progresso | chaves idempotentes existentes + estados/constraints + CAS |
| Rejoin | mão, score, buffs e rodada persistem | reidratação de `rooms.current_round`/`players` |
| Disconnect/abandono | não corrompe rodada nem recompensa partida inválida | grace period + CAS + telemetria agregada |
| Pusher duplicado | mesmo evento de rede é aplicado uma vez no cliente | `_eventId` server-side + cache bounded no `SocketClient` |
| Saqueador concorrente | uma adesão por usuário; rateio único | transação serializable + PK/unique existentes |
| Surrupiada concorrente | resposta não é roubada duas vezes; vítima reenvia | CAS do Buff Engine + `blockedCards` + `needsSubmission` |
| Espólio concorrente | claim não duplica carta | função/PK/idempotência do P6 |
| Autoria concorrente | identidade canônica e autor original não mudam | unique canônico + teste de corrida P1 |
| Pick winner duplicado | score/replay/progressão não duplica | persistir sala por CAS antes dos efeitos derivados |
| Próxima rodada duplicada | só uma transição do `expectedRoundNumber` | estado + rodada esperada + CAS |
| Replay | histórico fecha sem revelar dados privados pré-decisão | replay público redigido |
| Spectator | sem mão, inventário ou autoria privada | view allowlist server-side |
| Mobile | overlays/mercado/prestígio responsivos | regressões CSS existentes + contratos P12 |
| Migration reexecutada | não duplica estruturas nem perde dados | expand-only + `IF NOT EXISTS` + trigger determinístico |

## Stress econômico
1. Mesma compra/mesmo `purchase_id` em paralelo.
2. IDs diferentes contra saldo insuficiente.
3. Finalização concorrente da mesma partida.
4. Saqueador: adesão concorrente e congelamento.
5. Claim concorrente do mesmo Espólio.
6. Recalcular milestones/achievements sem repagamento.
7. Confirmar `wallet.balance = SUM(ledger.amount)`.

P12 não cria mecânicas novas; endurece, mede e documenta P1–P11.
