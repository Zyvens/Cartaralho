'use strict';

const TYPE_ALIASES = Object.freeze({
  white: 'white',
  whiteCards: 'white',
  black: 'black',
  blackCards: 'black'
});
const CANONICAL_TO_LEGACY = Object.freeze({ white: 'whiteCards', black: 'blackCards' });
const INVISIBLE_CODE_POINTS = new Set([0x200B, 0x200C, 0x200D, 0x2060, 0xFEFF]);

function canonicalCardType(type) {
  const canonical = TYPE_ALIASES[String(type || '')];
  if (!canonical) throw new Error('Tipo de carta inválido.');
  return canonical;
}

function legacyCardType(type) {
  return CANONICAL_TO_LEGACY[canonicalCardType(type)];
}

function cleanDisplayText(text) {
  let out = '';
  for (const char of String(text ?? '').normalize('NFKC')) {
    const code = char.codePointAt(0);
    if (code === 9 || code === 10 || code === 11 || code === 12 || code === 13) {
      out += ' ';
      continue;
    }
    if (code <= 31 || (code >= 127 && code <= 159) || INVISIBLE_CODE_POINTS.has(code)) continue;
    out += char;
  }
  return out.trim().replace(/\s+/gu, ' ');
}

function normalizeCardText(text) {
  return cleanDisplayText(text).toLowerCase();
}

function canonicalIdentity(type, text) {
  const cardType = canonicalCardType(type);
  const displayText = cleanDisplayText(text);
  const normalizedText = normalizeCardText(displayText);
  if (!normalizedText) throw new Error('O texto da carta não pode ficar vazio.');
  return { cardType, normalizedText, displayText };
}

function sameCanonicalCard(aType, aText, bType, bText) {
  const a = canonicalIdentity(aType, aText);
  const b = canonicalIdentity(bType, bText);
  return a.cardType === b.cardType && a.normalizedText === b.normalizedText;
}

function creationKind(canonicalCard, matchId) {
  if (!canonicalCard || !matchId || canonicalCard.origin_uncertain) return 'independent';
  return String(canonicalCard.origin_match_id || '') === String(matchId) ? 'original' : 'independent';
}

module.exports = {
  canonicalCardType,
  legacyCardType,
  cleanDisplayText,
  normalizeCardText,
  canonicalIdentity,
  sameCanonicalCard,
  creationKind
};
