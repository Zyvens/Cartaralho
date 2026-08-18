'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p58.js'),css=read('public/css/p58.css'),card=read('public/js/components/card.js'),index=read('public/index.html'),release=read('lib/releaseP58.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P58 compila e carrega depois de P57',()=>{
 assert.doesNotThrow(()=>new Function(js));
 assert.ok(index.indexOf('css/p58.css?v=1.4.58')>index.indexOf('css/p57.css?v=1.4.57'));
 assert.ok(index.indexOf('js/p58.js?v=1.4.58')>index.indexOf('js/p57.js?v=1.4.57'));
 assert.match(index,/js\/components\/card\.js\?v=1\.4\.58/);
});

test('lacuna canônica é underline textual ___ rosa/roxo e não barra contínua',()=>{
 assert.match(card,/black-card-gap[^>]*>___<\/span>/);
 assert.match(js,/black-card-gap[^>]*>___<\/span>/);
 assert.match(css,/\.black-card-gap[\s\S]*color:#d946ef!important/);
 assert.match(css,/border-bottom:0!important/);
});

test('Minhas Cartas usa proporção real de baralho e esconde badge redundante sobre a carta',()=>{
 assert.match(css,/\.p57-library-game-card[\s\S]*aspect-ratio:5\/7!important/);
 assert.match(css,/\.p56-card-preview-host \.p57-detail-game-card[\s\S]*aspect-ratio:5\/7!important/);
 assert.match(css,/\.p57-library-game-card \.card-progression-badge[\s\S]*display:none!important/);
});

test('Reciclagem remove rótulos redundantes de cor e preserva favorito',()=>{
 assert.match(js,/meta\.remove\(\)/);
 assert.match(js,/meta\.textContent='⭐ FAVORITA'/);
 assert.match(js,/cleanRecycleConfirm/);
 assert.match(css,/p41-recycle-card-preview>span\{display:none!important\}/);
});

test('criador de Minhas Cartas reutiliza linguagem visual do criador da partida',()=>{
 assert.match(js,/card-creation-screen/);
 assert.match(js,/card-type-tabs/);
 assert.match(js,/clean-stack-grid/);
 assert.match(js,/creation-instruction/);
 assert.match(js,/creation-input-row/);
 assert.match(js,/CartP48\.openLibraryCreator=openLibraryCreator/);
});

test('Gênese no Perfil usa órbita de transform único para estabilidade no scroll',()=>{
 assert.match(js,/p58-genesis-preview/);
 assert.match(css,/p58GenesisPreviewOrbit/);
 assert.match(css,/genese-atom-particle[\s\S]*animation:none!important/);
 assert.match(css,/genese-atom-track[\s\S]*will-change:transform!important/);
});

test('P58 publica v1.4.58 e preserva P57 na Central',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.58'/);
 assert.match(version,/releaseP58/);
 assert.match(notifications,/releaseP58/);
 assert.match(notifications,/P57_RELEASE/);
});
