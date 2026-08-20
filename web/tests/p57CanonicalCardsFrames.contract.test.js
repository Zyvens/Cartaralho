'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p57.js'),css=read('public/css/p57.css'),index=read('public/index.html'),p53=read('public/css/p53.css'),release=read('lib/releaseP57.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P57 compila e carrega depois do P56',()=>{
 assert.doesNotThrow(()=>new Function(js));
 assert.ok(index.indexOf('css/p57.css?v=1.4.57')>index.indexOf('css/p56.css?v=1.4.56'));
 assert.ok(index.indexOf('js/p57.js?v=1.4.72')>index.indexOf('js/p56.js?v=1.4.71'));
});

test('Minhas Cartas e a ficha usam o CardComponent real do jogo',()=>{
 assert.match(js,/typeof CardComponent!=='undefined'/);
 assert.doesNotMatch(js,/window\.CardComponent/);
 assert.match(js,/C\.createBlackCard\(valueOf\(c\),options\)/);
 assert.match(js,/C\.createWhiteCard\(valueOf\(c\),options\)/);
 assert.match(js,/p57-library-game-card/);
 assert.match(js,/p56-card-art p57-detail-game-card/);
 assert.match(js,/ProfessionalUI\.renderCards=render/);
 assert.match(js,/HomeScreen\.renderCards=render/);
 assert.match(js,/MetaUI\.renderCards=render/);
});

test('renderer final de Minhas Cartas gera autoria em vez de metadado técnico',()=>{
 assert.match(js,/const creatorLabel=c=>/);
 assert.match(js,/o\.creatorUsername\|\|c\?\.creator_username\|\|o\.creatorName/);
 assert.match(js,/<small>Criado por \$\{esc\(creatorLabel\(c\)\)\}<\/small>/);
 assert.doesNotMatch(js,/contorno \$\{label\(c\.borderTier\)\}/);
});

test('Lacunas pretas ficam canônicas também na Reciclagem',()=>{
 assert.match(js,/C\._formatBlackText\(c\.text\)/);
 assert.match(js,/Recycling\.normalize\(body\)/);
 assert.match(css,/recycling-card b \.black-card-gap/);
 assert.match(css,/border-bottom:3px solid #d946ef!important/);
});

test('Molduras do perfil voltam a animar em vez de usar thumbnails congelados do P53',()=>{
 assert.match(p53,/profile-modal-frame-grid[\s\S]*animation:none!important/);
 assert.match(js,/grid\.classList\.remove\('profile-modal-frame-grid'\)/);
 assert.match(js,/grid\.classList\.add\('p57-live-frame-grid'\)/);
 assert.match(css,/\.p57-live-frame-grid \.profile-modal-frame-item\{contain:none!important/);
});

test('Progressão exibida ao jogador é Bronze, Prata, Ouro e Platina',()=>{
 assert.match(js,/copper:'Bronze'/);
 assert.match(js,/silver:'Prata'/);
 assert.match(js,/gold:'Ouro'/);
 assert.match(js,/platinum:'Platina'/);
 assert.doesNotMatch(js,/copper:'Copper'/);
 assert.match(js,/\+\$\{fmt\(remaining\)\} → \$\{label\(next\)\}/);
});

test('P57 preserva o layout P56 do modal e troca somente preview e progressão',()=>{
 assert.match(js,/D\.preview=/);
 assert.match(js,/D\.track=function/);
 assert.doesNotMatch(js,/D\.open=/);
 assert.match(css,/\.p56-card-preview-host \.p57-detail-game-card/);
});

test('P57 permanece publicado e preservado após releases futuros',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.57'/);
 assert.match(version,/releaseP(?:57|5[8-9]|[6-9]\d)/);
 assert.ok(notifications.includes('P57_RELEASE')||notifications.includes("require('../lib/releaseP57')"));
 assert.match(notifications,/P56_RELEASE/);
});
