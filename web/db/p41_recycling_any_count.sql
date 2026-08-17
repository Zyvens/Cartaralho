-- Cartaralho P41 — reciclagem por carta.
-- A regra antiga exigia múltiplos de 10. A partir do P41, qualquer quantidade >= 1 é válida.
ALTER TABLE card_recycling_batches
  DROP CONSTRAINT IF EXISTS card_recycling_batches_card_count_check;

ALTER TABLE card_recycling_batches
  ADD CONSTRAINT card_recycling_batches_card_count_check CHECK(card_count>=1);
