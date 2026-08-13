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
10. `metagame_v1_4_package4.sql` — P04: progressão dupla, eventos, estatísticas globais e estado de Legado

Os scripts são aditivos/idempotentes e preservam cartas e estatísticas existentes.

## Metajogo v1.4

A atualização é sequencial, um pacote por branch/PR. Não execute migrations posteriores antes de validar o pacote anterior em produção.

O P01 mantém `user_cards`, `card_origins`, `deck_cards` e demais estruturas legadas como compatibilidade enquanto as relações canônicas passam a ser autoritativas.

O P03 substitui criação ilimitada por estoques separados de Cartas Limpas Brancas e Pretas. Cada conta recebe 20+20 uma vez; nova criação consome exatamente 1 crédito; reutilização de carta própria é gratuita; compra avulsa custa 200 Moedas Sujas.

O P04 mantém os contadores antigos apenas para compatibilidade. Material/corpo passa a usar desempenho pessoal da posse; borda usa presença externa deduplicada por partida; Legado é calculado globalmente a partir de alcance, adoções, coincidências criativas, presença e vitórias. O renderer novo pode ser desligado com `CARD_PROGRESSION_V2_ENABLED=false` sem apagar os eventos persistidos. Pagamentos de milestones, Espólio novo, buffs e Mercado Paralelo permanecem fora do P04.
