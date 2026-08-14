'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const defs=require(path.join(root,'lib','prestigeDefinitions'));
const migration=read('db/metagame_v1_4_package11.sql'),purchase=read('lib/marketplacePurchase.js'),cosmetic=read('lib/marketplaceCosmetic.js'),service=read('lib/prestigeService.js'),admin=read('api/admin/prestige-entitlement.js');

test('P11 usa gate oficial de nível 5',()=>{assert.equal(defs.MIN_COSMETIC_LEVEL,5);assert.equal(defs.MIN_COSMETIC_XP,4000);assert.equal(defs.levelFromXp(3999),4);assert.equal(defs.levelFromXp(4000),5);assert.match(purchase,/status:'level_locked'/);assert.match(cosmetic,/u\.xp>=\$\{MIN_COSMETIC_XP\}/);});

test('catálogo histórico P11 mantém exatamente 7 molduras e 6 títulos com preços v1.4',()=>{const rows=[['Fita Isolante Premium',25000],['Ouro de Pobre',40000],['Neon de Procedência Duvidosa',55000],['Glitch Radioativo',75000],['Buraco Negro Fiscal',100000],['Moldura Agiota',150000],['Lavagem Completa',250000],['Cliente Preferencial',20000],['Lavador de Moedinhas',30000],['Patrocinador do Caos',45000],['Dinheiro Não Compra Talento',65000],['Herdeiro do Cartaralho',100000],['Patrimônio Inexplicável',200000]];for(const[name,price]of rows){assert.ok(migration.includes(`'${name}'`),name);assert.ok(migration.includes(`,${price},`),`${name}:${price}`);}assert.equal((migration.match(/\('cosmetic_(?:frame|title)_/g)||[]).length,13);});

test('cosmético é ownership permanente e não user_unlock/consumível',()=>{assert.match(migration,/PRIMARY KEY\(user_id,cosmetic_key\)/);assert.match(cosmetic,/NOT EXISTS\(SELECT 1 FROM cosmetic_ownerships/);assert.match(cosmetic,/ON CONFLICT\(user_id,cosmetic_key\) DO NOTHING/);assert.doesNotMatch(cosmetic,/user_unlocks|buff_inventory/);assert.match(purchase,/status:'already_owned'/);});

test('feature flag fecha compra mas não invalida equip/ownership',()=>{assert.match(purchase,/COSMETICS_FEATURE_ENABLED/);assert.match(purchase,/cosmetics_feature_disabled/);assert.doesNotMatch(service,/COSMETICS_FEATURE_ENABLED/);assert.match(service,/canEquipTitle/);assert.match(service,/canEquipFrame/);});

test('Celestial existe acima de Lendário e títulos especiais são não métricos',()=>{assert.equal(defs.RARITIES.celestial.order,6);assert.ok(defs.RARITIES.celestial.order>defs.RARITIES.legendary.order);assert.equal(defs.SPECIAL_TITLES['o-criador'].rarity,'celestial');assert.equal(defs.SPECIAL_TITLES['o-criador'].description,'Você não zerou o jogo. Você fez essa merda existir.');assert.equal(defs.SPECIAL_TITLES.betinha.rarity,'epic');assert.equal(defs.SPECIAL_TITLES.betinha.description,'Estava aqui quando isso ainda quebrava com personalidade.');});

test('O Criador só vem de entitlement administrativo explícito por user_id',()=>{assert.doesNotMatch(migration,/INSERT INTO special_entitlements[^;]*'o-criador'/s);assert.match(admin,/key!==['"]o-criador['"]/);assert.match(admin,/userId/);assert.match(admin,/source_type/);assert.match(admin,/'admin'/);assert.match(admin,/Betinha é exclusivo do snapshot Beta congelado/);});

test('Betinha usa snapshot válido e congelado na primeira aplicação',()=>{assert.match(migration,/prestige_snapshots/);assert.match(migration,/snapshot_insert/);assert.match(migration,/valid_for_rewards=true/);assert.match(migration,/WHERE EXISTS\(SELECT 1 FROM snapshot_insert\)/);assert.match(migration,/'betinha','title','beta_snapshot'/);assert.match(migration,/ON CONFLICT\(snapshot_key\) DO NOTHING/);});

test('molduras cosméticas permanecem separadas dos tiers de progressão após expansão P14',()=>{assert.doesNotMatch(migration,/Copper|Silver|Gold|Platinum|card_personal_progress|user_card_progress/);assert.equal(Object.values(defs.COSMETIC_EQUIP_KEYS).filter(x=>x.type==='frame').length,17);});
