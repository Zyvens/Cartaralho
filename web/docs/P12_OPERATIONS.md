# P12 — Operação, telemetria e balanceamento

## Rollout
1. Aplicar `db/metagame_v1_4_package12.sql` (expand-only).
2. Executar `db/telemetry_p12_queries.sql` e validar o ledger.
3. Publicar a aplicação.
4. Verificar runtime, rejoin, replay, spectator e compra controlada.
5. Acumular telemetria antes de alterar knobs econômicos.

## Feature flags
Todas assumem **true quando ausentes**: `MARKETPLACE_ENABLED`, `MATCH_LOOT_ENABLED`, `CARD_PROGRESSION_V2_ENABLED`, `BUFFS_FEATURE_ENABLED`, `ADVANCED_ROUND_ENGINE`, `ECONOMY_SETTLEMENTS_ENABLED`, `ACHIEVEMENTS_V2_ENABLED`, `COSMETICS_FEATURE_ENABLED` e `TELEMETRY_ENABLED`.

- Mercado: fecha novas compras; inventário permanece.
- Espólio: desliga novos claims/entitlements operacionais.
- Progressão v2: rollback da progressão pessoal.
- Buffs/Round Engine: rollback das mecânicas P8/P9.
- Economy settlements: interrompe novos payouts.
- Achievements v2: rollback P10.
- Cosméticos: fecha novas compras; ownership/equip permanece.
- Telemetria: interrompe apenas gravações P12.

## Knobs calibráveis
- Reward Engine, classes de duração, quotas de Espólio e pesos de “Melhores Cartas do Mundo”: `lib/balanceConfig.js`.
- Override emergencial sem migration: `BALANCE_OVERRIDES_JSON`.
- Corpo/borda/Legado: `lib/cardProgressionRules.js`.
- Milestones e requisitos quantitativos: `lib/achievementDefinitions.js`.
- Preços: `market_catalog`, versionados por `catalog_version`.

Exemplo reversível: `{"reward":{"survivalCoefficient":50,"minimumParticipation":0.7}}`. Remover a variável restaura defaults. **Não existe bônus por duração real na v1.**

## Revisão inicial P12
A produção ainda não possuía amostra suficiente de partidas válidas para inferência estatística no início do pacote. Portanto, a revisão inicial não altera preços, thresholds nem curva v1; instrumenta a coleta e exige amostra real antes de calibrar.

## Alertas sugeridos
- qualquer `delta` no fechamento do ledger;
- crescimento de `ROOM_CONFLICT` sem posterior sucesso;
- abandono elevado por configuração;
- inflação persistente sem gasto correspondente;
- buffs com rejeição muito acima do uso;
- p90 de duração incompatível com a classe estimada.

## Forward-fix
P12 prioriza forward-fix. A migration é expand-only e a telemetria pode permanecer com `TELEMETRY_ENABLED=false`. Balanceamento reverte por configuração, não por migration.
