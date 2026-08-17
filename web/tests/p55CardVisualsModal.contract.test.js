'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p55.js'),css=read('public/css/p55.css'),recycling=read('public/js/marketplaceRecycling.js'),index=read('public/index.html'),release=read('lib/releaseP55.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P55 compila e carrega após P54',()=>{
 assert.doesNotThrow(()=>new Function(js));
 assert.doesNotThrow(()=>new Function(recycling));
 assert.ok(index.indexOf('css/p55.css?v=1.4.55')>index.indexOf('css/p54.css?v=1.4.54'));
 assert.ok(index.indexOf('js/p55.js?v=1.4.55')>index.indexOf('js/p54.js?v=1.4.54'));
});

test('Reciclagem usa exatamente o formatador canônico de lacunas das Cartas Pretas',()=>{
 assert.match(recycling,/cardText\(c,m\)/);
 assert.match(recycling,/CardComponent\._formatBlackText\(c\.text\)/);
 assert.match(recycling,/\$\{this\.cardText\(c,m\)\}/);
 assert.match(css,/recycling-card b \.black-card-gap/);
 assert.match(css,/border-bottom:3px solid #d946ef!important/);
 assert.match(index,/marketplaceRecycling\.js\?v=1\.4\.55/);
});

test('Detalhe de Minhas Cartas não usa Modal genérico e fica acima do AppPanel',()=>{
 assert.match(js,/p55-card-detail-overlay/);
 assert.match(js,/role="dialog"/);
 assert.match(css,/\.p55-card-detail-overlay[\s\S]*z-index:52000/);
 assert.doesNotMatch(js,/Modal\.show\(/);
 assert.match(js,/ProfessionalUI\.renderCards=async function/);
 assert.match(js,/stopImmediatePropagation\(\)/);
});

test('Detalhe apresenta a carta real, evolução e origem em linguagem visual própria',()=>{
 assert.match(js,/CardComponent\.createBlackCard/);
 assert.match(js,/CardComponent\.createWhiteCard/);
 assert.match(js,/Evolução e origem/);
 assert.match(js,/MATERIAL/);
 assert.match(js,/CONTORNO/);
 assert.match(js,/MESAS VISITADAS/);
 assert.match(js,/PESSOAS QUE POSSUEM/);
 assert.doesNotMatch(js,/rarityExplanation/);
});

test('P55 permanece no histórico após releases posteriores',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.55'/);
 assert.match(version,/releaseP\d+/);
 assert.match(notifications,/P55_RELEASE/);
 assert.match(notifications,/P54_RELEASE/);
});
