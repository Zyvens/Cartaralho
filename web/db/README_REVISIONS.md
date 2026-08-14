# Revisões aditivas do banco

Para instalação nova ou banco reconstruído, execute `schema.sql` e as revisões na ordem:

1. `meta_social.sql`
2. `professional_revision.sql`
3. `native_deck_seed.sql`
4. `metagame_v1_4_package1.sql` — P01: Identidade Canônica, Autoria e Genealogia
5. P02: Economia e Match Reward Engine — estruturas consolidadas em `professional_revision.sql`
6. `metagame_v1_4_package3.sql` — P03 1/4: inventário/ledger de Cartas Limpas
7. `metagame_v1_4_package3_grant.sql` — P03 2/4: grant idempotente 20 brancas + 20 pretas
8. `metagame_v1_4_package3_purchase.sql` — P03 3/4: compra avulsa por 200 Moedas Sujas
9. `metagame_v1_4_package3_creation.sql` — P03 4/4: criação transacional de Carta Suja
10. `metagame_v1_4_package4.sql` — P04: progressão dupla, eventos, estatísticas globais e Legado
11. `metagame_v1_4_package5.sql` — P05: Mercado Paralelo base
12. `metagame_v1_4_package6.sql`, `metagame_v1_4_package6_claim.sql`, `metagame_v1_4_package6_settle.sql` — P06: Espólio e settlement
13. `metagame_v1_4_package7.sql` — P07: configuração/snapshot de partida
14. `metagame_v1_4_package8.sql` — P08: Buffs simples
15. `metagame_v1_4_package9.sql` — P09: Buffs avançados e Round Engine
16. `metagame_v1_4_package10.sql` — P10: achievements, missões e royalties
17. `metagame_v1_4_package11.sql` — P11: cosméticos, prestígio e Celestial
18. `metagame_v1_4_package12.sql` — P12: hardening, telemetria e índices operacionais

Os scripts são aditivos/idempotentes e preservam cartas e estatísticas existentes.

## Metajogo v1.4

A atualização é sequencial, um pacote por branch/PR. Não execute migrations posteriores antes de validar o pacote anterior em produção.

O P01 mantém `user_cards`, `card_origins`, `deck_cards` e demais estruturas legadas como compatibilidade enquanto as relações canônicas passam a ser autoritativas.

O P03 substitui criação ilimitada por estoques separados de Cartas Limpas Brancas e Pretas. Cada conta recebe 20+20 uma vez; nova criação consome exatamente 1 crédito; reutilização de carta própria é gratuita; compra avulsa custa 200 Moedas Sujas.

O P04 mantém os contadores antigos apenas para compatibilidade. Material/corpo passa a usar desempenho pessoal da posse; borda usa presença externa deduplicada por partida; Legado é calculado globalmente a partir de alcance, adoções, coincidências criativas, presença e vitórias. O renderer novo pode ser desligado com `CARD_PROGRESSION_V2_ENABLED=false` sem apagar os eventos persistidos.

O P12 é expand-only: adiciona revisão otimista de sala, telemetria agregada e índices de consulta. Os valores econômicos v1.4 permanecem versionados; ajustes posteriores devem usar os knobs documentados e não exigem migration.
