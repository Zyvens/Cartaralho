'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p59.css'),p58=read('public/css/p58.css'),p51=read('public/css/p51.css'),card=read('public/js/components/card.js'),index=read('public/index.html'),release=read('lib/releaseP59.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P59 carrega depois de P58 como camada visual final',()=>{
 assert.ok(index.indexOf('css/p59.css?v=1.4.59')>index.indexOf('css/p58.css?v=1.4.58'));
});

test('lacuna continua semanticamente ___ mas vira uma única linha visual sem separações',()=>{
 assert.match(card,/black-card-gap[^>]*>___<\/span>/);
 assert.match(css,/\.black-card-gap[\s\S]*display:inline-block!important/);
 assert.match(css,/width:1\.72em!important/);
 assert.match(css,/color:transparent!important/);
 assert.match(css,/background-image:linear-gradient\(90deg,#d946ef,#d946ef\)!important/);
 assert.match(css,/background-size:100% \.12em!important/);
});

test('Minhas Cartas cai de 300px para 200px e usa proporção 1:1',()=>{
 assert.match(p58,/\.p57-library-card-shell\{width:100%!important;max-width:300px!important/);
 assert.match(css,/\.p57-library-card-shell[\s\S]*max-width:200px!important/);
 assert.match(css,/\.p57-library-game-card[\s\S]*width:200px!important[\s\S]*aspect-ratio:1\/1!important/);
});

test('ficha cai de 330px para 220px e também usa proporção 1:1',()=>{
 assert.match(p58,/\.p56-card-preview-host \.p57-detail-game-card[\s\S]*330px/);
 assert.match(css,/\.p56-card-preview-host \.p57-detail-game-card[\s\S]*220px[\s\S]*aspect-ratio:1\/1!important/);
});

test('nome, @usuário e título permanecem alinhados ao mesmo eixo esquerdo',()=>{
 assert.match(p51,/home-account-identity>span,[\s\S]*account-equipped-title[\s\S]*text-align:left!important/);
 assert.ok(index.indexOf('css/p51.css?v=1.4.51')>index.indexOf('css/p49.css?v=1.4.49'));
 assert.doesNotMatch(css,/home-account-identity/);
});

test('P59 publica v1.4.59 e preserva P58 na Central',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.59'/);
 assert.match(version,/releaseP59/);
 assert.match(notifications,/releaseP59/);
 assert.match(notifications,/P58_RELEASE/);
});
