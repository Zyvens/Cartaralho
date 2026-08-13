# Revisões aditivas do banco

Para uma instalação nova ou banco reconstruído, execute `schema.sql` e depois, nesta ordem:

1. `meta_social.sql`
2. `professional_revision.sql`
3. `native_deck_seed.sql`

Os scripts são aditivos/idempotentes e preservam cartas e estatísticas de jogadores já existentes.
