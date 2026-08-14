'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const migration=read('db/p17_frame_rarity_rebalance.sql'),css=read('public/css/p17.css'),ui=read('public/js/cosmeticUI.js'),index=read('public/index.html'),legacy=read('public/css/p14.css');

test('CosmeticUI P17 compila',()=>assert.doesNotThrow(()=>new Function(ui)));

test('P17 reorganiza as 17 molduras com raridade e preço explícitos',()=>{
 const expected=[
  ['cosmetic_frame_lisa','common',4000,300],['cosmetic_frame_dupla','common',5000,310],['cosmetic_frame_pontilhada','common',6000,320],
  ['cosmetic_frame_fita_isolante','rare',15000,330],['cosmetic_frame_agiota','rare',17500,340],['cosmetic_frame_buraco_negro','rare',20000,350],
  ['cosmetic_frame_ouro_de_pobre','superrare',30000,360],['cosmetic_frame_glitch_radioativo','superrare',35000,370],['cosmetic_frame_neon_roxa','superrare',40000,380],['cosmetic_frame_neon_duvidoso','superrare',45000,390],
  ['cosmetic_frame_ornamental','epic',65000,400],['cosmetic_frame_folhas','epic',75000,410],['cosmetic_frame_asas','epic',85000,420],
  ['cosmetic_frame_cintilante','legendary',110000,430],['cosmetic_frame_arco_iris','legendary',130000,440],['cosmetic_frame_faisca','legendary',150000,450],
  ['cosmetic_frame_lavagem_completa','celestial',250000,460]
 ];
 for(const[key,rarity,price,sort]of expected){
  const re=new RegExp(`\\('${key}','[^']+','${rarity}',${price},${sort}\\)`);assert.match(migration,re,key);
 }
 assert.equal((migration.match(/\('cosmetic_frame_/g)||[]).length,17);
});

test('distribuição de raridade segue Comum até Celestial',()=>{
 const values=[...migration.matchAll(/\('cosmetic_frame_[^']+','[^']+','(common|rare|superrare|epic|legendary|celestial)',\d+,\d+\)/g)].map(x=>x[1]);
 assert.deepEqual(values,['common','common','common','rare','rare','rare','superrare','superrare','superrare','superrare','epic','epic','epic','legendary','legendary','legendary','celestial']);
});

test('loja ordena molduras e títulos por raridade antes do sort_order',()=>{
 assert.match(ui,/RARITY_ORDER=Object\.freeze\(\{common:1,rare:2,superrare:3,epic:4,legendary:5,celestial:6\}\)/);
 assert.match(ui,/frames=products\.filter\(x=>x\.product_kind==='cosmetic_frame'\)\.sort\(sortByRarity\)/);
 assert.match(ui,/titles=products\.filter\(x=>x\.product_kind==='cosmetic_title'\)\.sort\(sortByRarity\)/);
 assert.match(ui,/ordenados de Comum até Celestial/);
});

test('Bronze, Silver, Gold e Platinum recebem aura e faísca nas cores do tier',()=>{
 for(const tier of['bronze','silver','gold','platinum']){assert.match(css,new RegExp(`frame-${tier}`));assert.match(css,new RegExp(`frame-${tier}::after`));}
 for(const marker of['p17ProgressAura','p17ProgressSpark','#ffc27a','#f7fbff','#fff1a3','#dffcff'])assert.ok(css.includes(marker),marker);
 assert.match(css,/content:'✦'/);
});

test('Cintilante e Arco-íris animam somente a moldura e nunca filtram a foto',()=>{
 assert.match(css,/frame-cosmetic-cintilante>img[^}]*filter:none!important/);
 assert.match(css,/frame-cosmetic-arco-iris>img[^}]*filter:none!important/);
 assert.match(css,/frame-cosmetic-cintilante::before/);
 assert.match(css,/frame-cosmetic-arco-iris::before/);
 assert.doesNotMatch(css,/hue-rotate/);
 assert.match(legacy,/hue-rotate\(360deg\)/,'o P17 deve sobrepor explicitamente a regra antiga carregando depois');
});

test('Celestial muda somente a moldura em paleta celestial',()=>{
 for(const marker of['frame-cosmetic-lavagem-completa','p17CelestialGlow','p17CelestialSpark','p17FrameOrbit','#a5f3fc','#93c5fd','#c4b5fd'])assert.ok(css.includes(marker),marker);
 assert.match(css,/frame-cosmetic-lavagem-completa>img[^}]*filter:none!important/);
 assert.match(css,/frame-cosmetic-lavagem-completa::before/);
 assert.match(css,/frame-cosmetic-lavagem-completa::after/);
});

test('P17 é a última camada CSS para vencer animações legadas',()=>{const p16=index.indexOf('css/p16.css'),p17=index.indexOf('css/p17.css');assert.ok(p16>0&&p17>p16);});
