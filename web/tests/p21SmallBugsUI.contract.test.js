'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const audio=read('public/js/domains/audioUI.js'),create=read('public/js/screens/createRoom.js'),room=read('public/js/domains/roomUI.js'),cards=read('public/js/screens/cardCreation.js'),cardCreation=read('public/js/domains/cardCreationUI.js'),shim=read('public/css/p21.css'),roomCss=read('public/css/roomSetupDashboardCurrent.css'),tabsCss=read('public/css/cardTypeTabsCurrent.css'),stackCss=read('public/css/cleanCardStackCurrent.css'),accordionCss=read('public/css/roomAccordionCurrent.css'),index=read('public/index.html'),notifications=read('lib/appNotifications.js'),migration=read('db/p18_creator_entitlements.sql'),metagame=read('api/profile/metagame.js'),version=read('api/version.js');

test('música fica armada para carga e gestos inclusive touch no iOS pelo audioUI',()=>{
 assert.doesNotThrow(()=>new Function(audio));
 for(const evt of['touchstart','touchend','pointerdown','pointerup','click','keydown'])assert.ok(audio.includes(`'${evt}'`),evt);
 assert.ok(audio.includes('wantsMusic()'));
 assert.ok(audio.includes('CartSoundtrack?.resume?.()'));
 assert.ok(audio.includes("window.addEventListener('pageshow'"));
 assert.ok(audio.includes("document.addEventListener('visibilitychange'"));
});

test('valores numéricos das regras continuam explícitos em WebKit no owner da sala',()=>{
 assert.ok(roomCss.includes('.room-rules-card .config-value'));
 assert.ok(roomCss.includes('color:#fff!important'));
 assert.ok(roomCss.includes('-webkit-text-fill-color:#fff!important'));
 assert.ok(roomCss.includes('opacity:1!important'));
 assert.ok(roomCss.includes('min-width:42px!important'));
 assert.ok(shim.includes('roomSetupDashboardCurrent.css'));
});

test('Gênese permanece entitlement especial e concessão oficial também a equipa',()=>{
 assert.ok(migration.includes("equipped_frame_key='genese-celestial'"));
 assert.ok(migration.includes("'genese-celestial','frame','admin'"));
 assert.ok(metagame.includes('special_entitlements'));
 assert.ok(metagame.includes('genese-celestial'));
});

test('criação da mesa mantém ordem semântica e grid responsivo v1.5.1',()=>{
 const config=create.indexOf('dashboard-config-card'),summary=create.indexOf('dashboard-summary-slot'),estimate=create.indexOf('dashboard-estimate-card'),howto=create.indexOf('how-to-play-card');
 assert.ok(config>=0&&summary>config&&estimate>summary&&howto>estimate);
 assert.ok(roomCss.includes("grid-template-areas:'config summary' 'config estimate' 'config howto'!important"));
 assert.ok(roomCss.includes("grid-template-areas:'config' 'summary' 'estimate' 'howto'!important"));
 assert.ok(room.includes('openCreateSummary'));
 assert.ok(room.includes('estimate.open=true'));
 assert.ok(room.includes('how.open=false'));
 assert.ok(!create.includes('create-room-column'));
});

test('gramática de cabeçalho estrutural P21 permanece e acordeões finais pertencem ao owner P36',()=>{
 assert.ok(roomCss.includes('.room-rules-heading,.room-summary-heading,.dashboard-section-heading'));
 assert.ok(room.includes('room-info-accordion'));
 assert.ok(accordionCss.includes('.room-info-accordion>summary'));
 assert.ok(!shim.includes('dashboard-collapse-chevron'));
});

test('abas de cartas têm contraste preto/branco em owner canônico',()=>{
 assert.ok(cards.includes('card-type-tab-black active'));
 assert.ok(cards.includes('card-type-tab-white'));
 assert.ok(cards.includes('card-tab-heart'));
 assert.ok(tabsCss.includes('.card-type-tab-black.active{background:#050506!important;color:#fff!important'));
 assert.ok(tabsCss.includes('.card-type-tab-white.active{background:#f7f7f5!important;color:#111114!important'));
 assert.ok(shim.includes('cardTypeTabsCurrent.css'));
});

test('pilha de Cartas Limpas usa markup atual, consumo superior e slot vazio',()=>{
 assert.ok(cards.includes('Math.min(8,n)'));
 assert.ok(cards.includes('clean-stack-top'));
 assert.ok(cards.includes('clean-stack-depth'));
 assert.ok(cards.includes('clean-stack-empty'));
 assert.ok(cards.includes('animateCleanConsumption(type)'));
 assert.ok(cards.includes('await this.animateCleanConsumption(cleanType)'));
 assert.ok(stackCss.includes('.clean-stack-top.is-consuming{animation:p21CleanConsume'));
 assert.ok(stackCss.includes('border:2px dashed rgba(167,139,250,.48)!important'));
 assert.ok(cards.includes("n===0?'Sem cartas disponíveis'"));
 assert.ok(cardCreation.includes('enforceSingleCleanStack'));
 assert.ok(shim.includes('cleanCardStackCurrent.css'));
});

test('P21 preserva shim histórico fora do runtime, owners diretos e linhagem corrente',()=>{
 assert.equal(index.indexOf('css/p21.css'),-1);
 const base=index.indexOf('css/showcaseCurrent.css'),roomPos=index.indexOf('css/roomSetupDashboardCurrent.css'),tabs=index.indexOf('css/cardTypeTabsCurrent.css'),stack=index.indexOf('css/cleanCardStackCurrent.css'),next=index.indexOf('css/rewardEstimateCurrent.css');
 assert.ok(base>=0&&roomPos>base&&tabs>roomPos&&stack>tabs&&next>stack);
 assert.ok(shim.startsWith('/* COMPAT P21'));
 assert.ok(notifications.includes('release:p21'));
 assert.ok(version.includes('releaseV151'));
});
