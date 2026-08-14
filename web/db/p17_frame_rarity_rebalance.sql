-- Cartaralho P17 — raridade, preço e ordem das molduras cosméticas.
-- Idempotente. Preserva ownerships e demais campos do catálogo.
WITH rebalance(product_key,name,rarity,price,sort_order) AS (
 VALUES
  ('cosmetic_frame_lisa','Moldura Lisa','common',4000,300),
  ('cosmetic_frame_dupla','Moldura Dupla','common',5000,310),
  ('cosmetic_frame_pontilhada','Moldura Pontilhada','common',6000,320),
  ('cosmetic_frame_fita_isolante','Fita Isolante Premium','rare',15000,330),
  ('cosmetic_frame_agiota','Moldura Agiota','rare',17500,340),
  ('cosmetic_frame_buraco_negro','Buraco Negro Fiscal','rare',20000,350),
  ('cosmetic_frame_ouro_de_pobre','Ouro de Pobre','superrare',30000,360),
  ('cosmetic_frame_glitch_radioativo','Glitch Radioativo','superrare',35000,370),
  ('cosmetic_frame_neon_roxa','Moldura Neon Roxa','superrare',40000,380),
  ('cosmetic_frame_neon_duvidoso','Neon de Procedência Duvidosa','superrare',45000,390),
  ('cosmetic_frame_ornamental','Ornamental','epic',65000,400),
  ('cosmetic_frame_folhas','Moldura de Folhas','epic',75000,410),
  ('cosmetic_frame_asas','Asas','epic',85000,420),
  ('cosmetic_frame_cintilante','Cintilante','legendary',110000,430),
  ('cosmetic_frame_arco_iris','Arco-íris','legendary',130000,440),
  ('cosmetic_frame_faisca','Faísca','legendary',150000,450),
  ('cosmetic_frame_lavagem_completa','Lavagem Completa','celestial',250000,460)
)
UPDATE market_catalog m
SET name=r.name,
    price=r.price,
    sort_order=r.sort_order,
    config=jsonb_set(COALESCE(m.config,'{}'::jsonb),'{rarity}',to_jsonb(r.rarity),true),
    catalog_version='p17-frame-rarity-v1',
    updated_at=now()
FROM rebalance r
WHERE m.product_key=r.product_key
  AND m.category='cosmetic'
  AND m.product_kind='cosmetic_frame';
