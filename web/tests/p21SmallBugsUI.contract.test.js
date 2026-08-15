'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const audio=read('public/js/audioIntegrationP13.js'),create=read('public/js/screens/createRoom.js'),cards=read('public/js/screens/cardCreation.js'),css=read('public/css/p21.css'),index=read('public/index.html'),notifications=read('lib/appNotifications.js'),migration=read('db/p18_creator_entitlements.sql'),metagame=read('api/profile/metagame.js');

for(const[name,src]of[['audioIntegrationP13.js',audio],['createRoom.js',create],['cardCreation.js',cards]])test(`${name} compila no P21`,()=>assert.doesNotThrow(()=>new Function(src)));

test('música fica armada para carga e primeiro gesto permitido, inclusive touch no iOS',()=>{
 assert.match(audio,/const gestureEvents=\['touchstart','pointerdown','click','keydown'\]/);
 assert.match(audio,/if\(s\?\.music===false\)return/);
 assert.match(audio,/CartSoundtrack\?\.unmute/);
 assert.match(audio,/addEventListener\('pageshow',resumeMusic\)/);
 assert.match(audio,/addEventListener\('load'.*resumeMusic\(\)/s);
 assert.match(audio,/visibilitychange/);
});

test('valores numéricos das regras ficam explicitamente visíveis em WebKit',()=>{
 assert.match(css,/\.room-rules-card \.config-value/);
 assert.match(css,/color:#fff!important/);
 assert.match(css,/-webkit-text-fill-color:#fff!important/);
 assert.match(css,/opacity:1!important/);
 assert.match(css,/min-width:42px!important/);
});

test('Gênese permanece entitlement especial e a concessão oficial também a equipa',()=>{
 assert.match(migration,/equipped_frame_key='genese-celestial'/);
 assert.match(migration,/'genese-celestial','frame','admin'/);
 assert.match(metagame,/special_entitlements/);
 assert.match(metagame,/genese-celestial/);
});

test('criação da mesa ordena Configuração, Resumo, Estimativa e Como Jogar por último',()=>{
 const config=create.indexOf('dashboard-config-card'),summary=create.indexOf('dashboard-summary-slot'),estimate=create.indexOf('dashboard-estimate-card'),howto=create.indexOf('how-to-play-card');
 assert.ok(config>=0&&summary>config&&estimate>summary&&howto>estimate);
 assert.match(create,/<details class="dashboard-card how-to-play-card">/);
 assert.match(create,/<summary class="dashboard-section-heading dashboard-collapsible-heading">/);
 assert.doesNotMatch(create,/create-room-column/);
 assert.match(css,/grid-template-areas:'config summary' 'config estimate' 'howto howto'/);
 assert.match(css,/@media\(max-width:760px\)[\s\S]*grid-template-areas:'config' 'summary' 'estimate' 'howto'/);
});

test('os quatro cards compartilham a mesma gramática visual de cabeçalho',()=>{
 assert.match(css,/\.room-rules-heading,\.room-summary-heading,\.dashboard-section-heading/);
 assert.match(create,/RECOMPENSAS/);
 assert.match(create,/Estimativa para mesa cheia/);
 assert.match(create,/REGRAS/);
 assert.match(create,/Como Jogar/);
 assert.match(css,/\.dashboard-estimate-card \.economy-preview-head\{display:none!important\}/);
});

test('abas de cartas têm contraste semântico preto/branco',()=>{
 assert.match(cards,/card-type-tab-black active/);assert.match(cards,/card-type-tab-white/);assert.match(cards,/card-tab-heart/);
 assert.match(css,/card-type-tab-black\.active\{background:#050506!important;color:#fff!important/);
 assert.match(css,/card-type-tab-white\.active\{background:#f7f7f5!important;color:#111114!important/);
});

test('pilha de Cartas Limpas consome a carta superior e termina em slot pontilhado',()=>{
 assert.match(cards,/Math\.min\(8,n\)/);
 assert.match(cards,/clean-stack-top/);assert.match(cards,/clean-stack-depth/);assert.match(cards,/clean-stack-empty/);
 assert.match(cards,/animateCleanConsumption\(type\)/);
 assert.match(cards,/await this\.animateCleanConsumption\(cleanType\)/);
 assert.match(css,/clean-stack-top\.is-consuming\{animation:p21CleanConsume/);
 assert.match(css,/border:2px dashed rgba\(167,139,250,\.48\)!important/);
 assert.match(cards,/n===0\?'Sem cartas disponíveis'/);
});

test('P21 permanece carregado e registrado mesmo com versões posteriores',()=>{
 assert.ok(index.indexOf('css/p21.css')>index.indexOf('css/p20.css'));
 assert.match(notifications,/release:p21/);
});
