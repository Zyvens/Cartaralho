'use strict';

const { sql } = require('./db');
const { canonicalIdentity, creationKind } = require('./cardIdentity');

const ACQUISITION_SOURCES = new Set([
  'created_original',
  'created_independent',
  'match_loot',
  'pack_random',
  'pack_best_world',
  'legacy_import',
  'legacy_auto_share'
]);

function normalizeId(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function acquisitionForCreation(kind) {
  return kind === 'original' ? 'created_original' : 'created_independent';
}

function validateAcquisitionSource(source) {
  if (!ACQUISITION_SOURCES.has(source)) throw new Error('Fonte de aquisição inválida.');
  return source;
}

async function upsertCanonicalIdentity(type, text, { matchId = null, isCreation = false } = {}) {
  const identity = canonicalIdentity(type, text);
  const originMatchId = isCreation && matchId ? String(matchId) : null;
  const originUncertain = !(isCreation && matchId);
  const rows = await sql`
    INSERT INTO canonical_cards(card_type, normalized_text, display_text, origin_match_id, origin_uncertain)
    VALUES(${identity.cardType}, ${identity.normalizedText}, ${identity.displayText}, ${originMatchId}, ${originUncertain})
    ON CONFLICT(card_type, normalized_text) DO UPDATE
      SET normalized_text = canonical_cards.normalized_text
    RETURNING *
  `;
  return rows[0];
}

async function recordCreation(canonicalCard, { userId, creatorName = null, matchId = null } = {}) {
  const uid = normalizeId(userId);
  if (!uid) return { kind: null, isOriginal: false };
  const kind = creationKind(canonicalCard, matchId);

  await sql`
    INSERT INTO canonical_card_creation_events(canonical_card_id, user_id, match_id, creation_kind)
    VALUES(${canonicalCard.id}, ${uid}, ${matchId ? String(matchId) : null}, ${kind})
    ON CONFLICT DO NOTHING
  `;

  if (kind === 'original') {
    await sql`
      INSERT INTO canonical_card_authors(canonical_card_id, user_id, author_name_snapshot)
      VALUES(${canonicalCard.id}, ${uid}, ${creatorName || null})
      ON CONFLICT(canonical_card_id, user_id) DO NOTHING
    `;
  }

  return { kind, isOriginal: kind === 'original' };
}

async function ensureOwnership(canonicalCardId, {
  userId,
  acquisitionSource,
  sourceUserId = null,
  sourceMatchId = null,
  legacyUserCardId = null
} = {}) {
  const uid = normalizeId(userId);
  if (!uid) return null;
  const source = validateAcquisitionSource(acquisitionSource);
  const legacyId = normalizeId(legacyUserCardId);
  const sourceUid = normalizeId(sourceUserId);

  await sql`
    INSERT INTO canonical_card_ownerships(
      user_id, canonical_card_id, legacy_user_card_id,
      acquisition_source, source_user_id, source_match_id
    )
    VALUES(
      ${uid}, ${canonicalCardId}, ${legacyId},
      ${source}, ${sourceUid}, ${sourceMatchId ? String(sourceMatchId) : null}
    )
    ON CONFLICT(user_id, canonical_card_id) DO NOTHING
  `;

  if (legacyId) {
    await sql`
      UPDATE canonical_card_ownerships
      SET legacy_user_card_id = COALESCE(legacy_user_card_id, ${legacyId}), updated_at = now()
      WHERE user_id = ${uid} AND canonical_card_id = ${canonicalCardId}
    `;
  }

  const rows = await sql`
    SELECT * FROM canonical_card_ownerships
    WHERE user_id = ${uid} AND canonical_card_id = ${canonicalCardId}
    LIMIT 1
  `;
  return rows[0] || null;
}

async function listAuthors(canonicalCardId) {
  return sql`
    SELECT a.user_id,
           COALESCE(u.display_name, a.author_name_snapshot, u.username, 'Criador desconhecido') AS display_name,
           u.username,
           a.authored_at
    FROM canonical_card_authors a
    LEFT JOIN users u ON u.id = a.user_id
    WHERE a.canonical_card_id = ${canonicalCardId}
    ORDER BY a.authored_at, a.user_id
  `;
}

async function resolveCanonicalCard({
  type,
  text,
  userId = null,
  creatorName = null,
  matchId = null,
  isCreation = false,
  acquisitionSource = null,
  sourceUserId = null,
  sourceMatchId = null,
  legacyUserCardId = null
} = {}) {
  const canonicalCard = await upsertCanonicalIdentity(type, text, { matchId, isCreation });
  let creation = { kind: null, isOriginal: false };

  if (isCreation) {
    creation = await recordCreation(canonicalCard, { userId, creatorName, matchId });
  }

  let ownership = null;
  if (normalizeId(userId)) {
    const source = acquisitionSource || (isCreation ? acquisitionForCreation(creation.kind) : 'legacy_import');
    ownership = await ensureOwnership(canonicalCard.id, {
      userId,
      acquisitionSource: source,
      sourceUserId,
      sourceMatchId: sourceMatchId || matchId,
      legacyUserCardId
    });
  }

  const authors = await listAuthors(canonicalCard.id);
  return {
    canonicalCard,
    authors,
    ownership,
    creation,
    isOriginalOwner: Boolean(normalizeId(userId) && authors.some(a => String(a.user_id) === String(userId)))
  };
}

async function getCanonicalCard(type, text) {
  const identity = canonicalIdentity(type, text);
  const rows = await sql`
    SELECT * FROM canonical_cards
    WHERE card_type = ${identity.cardType} AND normalized_text = ${identity.normalizedText}
    LIMIT 1
  `;
  return rows[0] || null;
}

module.exports = {
  ACQUISITION_SOURCES,
  acquisitionForCreation,
  upsertCanonicalIdentity,
  recordCreation,
  ensureOwnership,
  listAuthors,
  resolveCanonicalCard,
  getCanonicalCard
};
