-- Cartaralho metagame v1.4 — Pacote 1
-- Identidade Canônica, Autoria e Genealogia
-- Expand-and-contract: aditivo/idempotente; estruturas legadas permanecem disponíveis.

CREATE TABLE IF NOT EXISTS canonical_cards (
  id BIGSERIAL PRIMARY KEY,
  card_type TEXT NOT NULL CHECK(card_type IN ('white','black')),
  normalized_text TEXT NOT NULL,
  display_text TEXT NOT NULL,
  origin_match_id TEXT,
  origin_uncertain BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT canonical_cards_identity_unique UNIQUE(card_type, normalized_text),
  CONSTRAINT canonical_cards_nonempty_normalized CHECK(length(normalized_text) > 0)
);
CREATE INDEX IF NOT EXISTS idx_canonical_cards_origin_match ON canonical_cards(origin_match_id) WHERE origin_match_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS canonical_card_authors (
  canonical_card_id BIGINT NOT NULL REFERENCES canonical_cards(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_name_snapshot TEXT,
  authored_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(canonical_card_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_canonical_card_authors_user ON canonical_card_authors(user_id);

CREATE TABLE IF NOT EXISTS canonical_card_ownerships (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  canonical_card_id BIGINT NOT NULL REFERENCES canonical_cards(id) ON DELETE CASCADE,
  legacy_user_card_id BIGINT REFERENCES user_cards(id) ON DELETE SET NULL,
  acquisition_source TEXT NOT NULL CHECK(acquisition_source IN (
    'created_original','created_independent','match_loot','pack_random','pack_best_world','legacy_import','legacy_auto_share'
  )),
  source_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  source_match_id TEXT,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT canonical_card_ownership_unique UNIQUE(user_id, canonical_card_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_canonical_card_ownership_legacy ON canonical_card_ownerships(legacy_user_card_id) WHERE legacy_user_card_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_canonical_card_ownership_card ON canonical_card_ownerships(canonical_card_id);
CREATE INDEX IF NOT EXISTS idx_canonical_card_ownership_source_match ON canonical_card_ownerships(source_match_id) WHERE source_match_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS canonical_card_creation_events (
  id BIGSERIAL PRIMARY KEY,
  canonical_card_id BIGINT NOT NULL REFERENCES canonical_cards(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id TEXT,
  creation_kind TEXT NOT NULL CHECK(creation_kind IN ('original','independent','legacy_import')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_canonical_creation_event_unique ON canonical_card_creation_events(canonical_card_id,user_id,COALESCE(match_id,''),creation_kind);
CREATE INDEX IF NOT EXISTS idx_canonical_creation_events_card ON canonical_card_creation_events(canonical_card_id);

CREATE TABLE IF NOT EXISTS canonical_card_legacy_milestones (
  canonical_card_id BIGINT NOT NULL REFERENCES canonical_cards(id) ON DELETE CASCADE,
  creator_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  milestone_key TEXT NOT NULL,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(canonical_card_id, creator_user_id, milestone_key)
);

WITH normalized_origins AS (
  SELECT co.*,
         CASE co.type WHEN 'whiteCards' THEN 'white' ELSE 'black' END AS canonical_type,
         lower(regexp_replace(btrim(regexp_replace(translate(translate(normalize(COALESCE(co.text,''),NFKC),E'\t\n\r\f\v','     '),U&'\200B\200C\200D\2060\FEFF',''),'[[:cntrl:]]','','g')),'[[:space:]]+',' ','g')) AS normalized_text
  FROM card_origins co
  WHERE co.type IN ('whiteCards','blackCards')
), normalized_user_cards AS (
  SELECT uc.*,
         CASE uc.type WHEN 'whiteCards' THEN 'white' ELSE 'black' END AS canonical_type,
         lower(regexp_replace(btrim(regexp_replace(translate(translate(normalize(COALESCE(uc.text,''),NFKC),E'\t\n\r\f\v','     '),U&'\200B\200C\200D\2060\FEFF',''),'[[:cntrl:]]','','g')),'[[:space:]]+',' ','g')) AS normalized_text
  FROM user_cards uc
  WHERE uc.type IN ('whiteCards','blackCards')
), source_cards AS (
  SELECT canonical_type AS card_type,normalized_text,text AS display_text,first_room_code AS origin_match_id,(creator_user_id IS NULL OR first_room_code IS NULL) AS origin_uncertain,first_seen_at AS seen_at,0 AS source_rank
  FROM normalized_origins WHERE normalized_text<>''
  UNION ALL
  SELECT canonical_type,normalized_text,text,NULL::TEXT,true,created_at,1
  FROM normalized_user_cards WHERE is_player_card=true AND normalized_text<>''
), chosen AS (
  SELECT DISTINCT ON(card_type,normalized_text) card_type,normalized_text,display_text,origin_match_id,origin_uncertain,seen_at
  FROM source_cards
  ORDER BY card_type,normalized_text,source_rank,seen_at NULLS LAST,display_text
)
INSERT INTO canonical_cards(card_type,normalized_text,display_text,origin_match_id,origin_uncertain,created_at)
SELECT card_type,normalized_text,display_text,origin_match_id,origin_uncertain,COALESCE(seen_at,now()) FROM chosen
ON CONFLICT(card_type,normalized_text) DO NOTHING;

WITH normalized_origins AS (
  SELECT co.*,CASE co.type WHEN 'whiteCards' THEN 'white' ELSE 'black' END AS canonical_type,
         lower(regexp_replace(btrim(regexp_replace(translate(translate(normalize(COALESCE(co.text,''),NFKC),E'\t\n\r\f\v','     '),U&'\200B\200C\200D\2060\FEFF',''),'[[:cntrl:]]','','g')),'[[:space:]]+',' ','g')) AS normalized_text
  FROM card_origins co WHERE co.type IN ('whiteCards','blackCards')
)
INSERT INTO canonical_card_authors(canonical_card_id,user_id,author_name_snapshot,authored_at)
SELECT cc.id,no.creator_user_id,no.creator_name_snapshot,COALESCE(no.first_seen_at,now())
FROM normalized_origins no
JOIN canonical_cards cc ON cc.card_type=no.canonical_type AND cc.normalized_text=no.normalized_text
WHERE no.creator_user_id IS NOT NULL
ON CONFLICT(canonical_card_id,user_id) DO NOTHING;

WITH normalized_origins AS (
  SELECT co.*,CASE co.type WHEN 'whiteCards' THEN 'white' ELSE 'black' END AS canonical_type,
         lower(regexp_replace(btrim(regexp_replace(translate(translate(normalize(COALESCE(co.text,''),NFKC),E'\t\n\r\f\v','     '),U&'\200B\200C\200D\2060\FEFF',''),'[[:cntrl:]]','','g')),'[[:space:]]+',' ','g')) AS normalized_text
  FROM card_origins co WHERE co.type IN ('whiteCards','blackCards')
)
INSERT INTO canonical_card_creation_events(canonical_card_id,user_id,match_id,creation_kind,created_at)
SELECT cc.id,no.creator_user_id,no.first_room_code,'legacy_import',COALESCE(no.first_seen_at,now())
FROM normalized_origins no
JOIN canonical_cards cc ON cc.card_type=no.canonical_type AND cc.normalized_text=no.normalized_text
WHERE no.creator_user_id IS NOT NULL
ON CONFLICT DO NOTHING;

WITH normalized_user_cards AS (
  SELECT uc.*,CASE uc.type WHEN 'whiteCards' THEN 'white' ELSE 'black' END AS canonical_type,
         lower(regexp_replace(btrim(regexp_replace(translate(translate(normalize(COALESCE(uc.text,''),NFKC),E'\t\n\r\f\v','     '),U&'\200B\200C\200D\2060\FEFF',''),'[[:cntrl:]]','','g')),'[[:space:]]+',' ','g')) AS normalized_text
  FROM user_cards uc WHERE uc.type IN ('whiteCards','blackCards')
), owned_candidates AS (
  SELECT nuc.id AS legacy_user_card_id,nuc.user_id,cc.id AS canonical_card_id,nuc.created_at,
         row_number() OVER(PARTITION BY nuc.user_id,cc.id ORDER BY nuc.created_at,nuc.id) AS rn
  FROM normalized_user_cards nuc
  JOIN canonical_cards cc ON cc.card_type=nuc.canonical_type AND cc.normalized_text=nuc.normalized_text
  WHERE nuc.owned=true AND nuc.is_player_card=true
)
INSERT INTO canonical_card_ownerships(user_id,canonical_card_id,legacy_user_card_id,acquisition_source,acquired_at)
SELECT user_id,canonical_card_id,legacy_user_card_id,'legacy_import',created_at FROM owned_candidates WHERE rn=1
ON CONFLICT(user_id,canonical_card_id) DO NOTHING;
