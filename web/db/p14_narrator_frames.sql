-- Cartaralho — P14: Narrador de sala + expansão de molduras cosméticas.
-- Idempotente e expand-only.

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS narrator_enabled BOOLEAN NOT NULL DEFAULT false;

INSERT INTO market_catalog(product_key,name,description,category,product_kind,price,config,catalog_version,enabled,sort_order) VALUES
 ('cosmetic_frame_lisa','Moldura Lisa','Um acabamento limpo e discreto para começar a personalizar sem falir.','cosmetic','cosmetic_frame',4000,'{"cosmeticType":"frame","equipKey":"cosmetic-lisa","rarity":"common","icon":"▢"}'::jsonb,'p14-frames-v1',true,300),
 ('cosmetic_frame_dupla','Moldura Dupla','Duas linhas, duas vezes mais compromisso com a estética.','cosmetic','cosmetic_frame',5000,'{"cosmeticType":"frame","equipKey":"cosmetic-dupla","rarity":"common","icon":"▣"}'::jsonb,'p14-frames-v1',true,310),
 ('cosmetic_frame_pontilhada','Moldura Pontilhada','Uma borda leve, irreverente e propositalmente incompleta.','cosmetic','cosmetic_frame',6000,'{"cosmeticType":"frame","equipKey":"cosmetic-pontilhada","rarity":"common","icon":"⋯"}'::jsonb,'p14-frames-v1',true,320),
 ('cosmetic_frame_neon_roxa','Neon Roxa','Um neon roxo acessível para quem quer aparecer sem hipotecar o patrimônio.','cosmetic','cosmetic_frame',8000,'{"cosmeticType":"frame","equipKey":"cosmetic-neon-roxa","rarity":"rare","icon":"🟣"}'::jsonb,'p14-frames-v1',true,330),
 ('cosmetic_frame_faisca','Faísca','Pequenas fagulhas percorrem a borda e dão vida ao avatar.','cosmetic','cosmetic_frame',9000,'{"cosmeticType":"frame","equipKey":"cosmetic-faisca","rarity":"rare","icon":"⚡"}'::jsonb,'p14-frames-v1',true,340),
 ('cosmetic_frame_ornamental','Ornamental','Detalhes nos cantos dão um ar de luxo suspeitamente acessível.','cosmetic','cosmetic_frame',10000,'{"cosmeticType":"frame","equipKey":"cosmetic-ornamental","rarity":"rare","icon":"❖"}'::jsonb,'p14-frames-v1',true,350),
 ('cosmetic_frame_cintilante','Cintilante','Reflexos percorrem a borda continuamente como uma carta recém-polida.','cosmetic','cosmetic_frame',65000,'{"cosmeticType":"frame","equipKey":"cosmetic-cintilante","rarity":"epic","icon":"✨"}'::jsonb,'p14-frames-v1',true,360),
 ('cosmetic_frame_arco_iris','Arco-íris','Uma borda iridescente animada que muda de cor sem pedir licença.','cosmetic','cosmetic_frame',110000,'{"cosmeticType":"frame","equipKey":"cosmetic-arco-iris","rarity":"legendary","icon":"🌈"}'::jsonb,'p14-frames-v1',true,370),
 ('cosmetic_frame_folhas','Moldura de Folhas','Folhas luminosas envolvem o avatar como um troféu vivo.','cosmetic','cosmetic_frame',125000,'{"cosmeticType":"frame","equipKey":"cosmetic-folhas","rarity":"legendary","icon":"🌿"}'::jsonb,'p14-frames-v1',true,380),
 ('cosmetic_frame_asas','Asas','Asas brilhantes se abrem nas laterais da moldura para uma entrada nada discreta.','cosmetic','cosmetic_frame',135000,'{"cosmeticType":"frame","equipKey":"cosmetic-asas","rarity":"legendary","icon":"🪽"}'::jsonb,'p14-frames-v1',true,390)
ON CONFLICT(product_key) DO UPDATE SET
 name=EXCLUDED.name,description=EXCLUDED.description,category=EXCLUDED.category,
 product_kind=EXCLUDED.product_kind,price=EXCLUDED.price,config=EXCLUDED.config,
 catalog_version=EXCLUDED.catalog_version,enabled=EXCLUDED.enabled,
 sort_order=EXCLUDED.sort_order,updated_at=now();
