-- P32 — Amigo de Merda troca a mão inteira antes da submissão.
UPDATE market_catalog
SET description='Antes da submissão do alvo, devolva toda a mão dele ao bolo e force uma nova mão do mesmo tamanho.',
    updated_at=now()
WHERE product_key='buff_amigo_de_merda'
  AND category='buff';
