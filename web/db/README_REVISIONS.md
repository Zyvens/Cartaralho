# Revisões aditivas do banco

Para uma instalação nova ou banco reconstruído, execute `schema.sql` e depois, nesta ordem:

1. `meta_social.sql`
2. `professional_revision.sql`
3. `native_deck_seed.sql`
4. `metagame_v1_4_package1.sql` — Pacote 1: Identidade Canônica, Autoria e Genealogia

Os scripts são aditivos/idempotentes e preservam cartas e estatísticas de jogadores já existentes.

## Metajogo v1.4

A atualização é executada sequencialmente, um pacote por branch/PR. Não execute migrations de pacotes posteriores antes que o pacote anterior esteja validado em produção.

O Pacote 1 usa estratégia expand-and-contract: `user_cards`, `card_origins`, `deck_cards` e demais estruturas legadas permanecem disponíveis como camada de compatibilidade enquanto `canonical_cards` e suas relações passam a ser a fonte autoritativa de identidade, autoria e posse de Cartas de Jogador.
