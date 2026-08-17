'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const p41=read('public/js/p41.js'),css=read('public/css/p44.css'),recycling=read('lib/cardRecycling.js'),index=read('public/index.html'),version=read('api/version.js'),notifications=read('api/notifications.js'),release=read('lib/releaseP44.js');

test('Admin não cria loop de MutationObserver ao abrir',()=>{
 assert.match(p41,/eyebrow&&eyebrow\.textContent!==adminLabel/);
 assert.match(p41,/security&&security\.textContent!==securityCopy/);
});

test('detalhe de Minhas Cartas fica acima do modal de perfil e tem layout dedicado',()=>{
 assert.match(css,/\.p41-card-detail-overlay\{[\s\S]*z-index:42000!important/);
 assert.match(css,/grid-template-areas:"preview progression" "preview origin"/);
 assert.match(css,/\.p41-origin-section\{/);
});

test('Missões e Voltar compartilham exatamente o mesmo eixo e altura',()=>{
 assert.match(css,/\.mission-fab,[\s\S]*#back-play\.p42-home-back\{[\s\S]*top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\)!important/);
 assert.match(css,/height:44px!important/);
 assert.match(css,/\.mission-fab\{right:12px!important;left:auto!important\}/);
 assert.match(css,/#back-play\.p42-home-back\{left:12px!important;right:auto!important\}/);
});

test('reciclagem tipa parâmetros usados em jsonb_build_object',()=>{
 assert.match(recycling,/jsonb_build_object\('cardCount',\$\{ids\.length\}::int,'rewardPerCard',\$\{p\.rewardPerCard\}::int\)/);
 assert.match(recycling,/\$\{reward\}::int/);
});

test('P44 publica versão e força asset corrigido do P41',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.44'/);
 assert.match(version,/releaseP44/);
 assert.match(notifications,/releaseP44/);
 assert.match(index,/css\/p44\.css\?v=1\.4\.44/);
 assert.match(index,/js\/p41\.js\?v=1\.4\.44/);
});
