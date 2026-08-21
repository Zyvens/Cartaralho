'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const reward=read('public/js/rewardPreviewUI.js'),profile=read('public/js/domains/profileUI.js'),metagame=read('api/profile/metagame.js'),shim=read('public/css/p22.css'),rewardCss=read('public/css/rewardEstimateCurrent.css'),semanticCss=read('public/css/cardCreationSemanticOverridesCurrent.css'),stackCss=read('public/css/cleanCardStackCurrent.css'),roomCss=read('public/css/roomAccordionCurrent.css'),index=read('public/index.html'),notifications=read('lib/appNotifications.js'),version=read('api/version.js');

test('estimativa elimina redundância e mantém classificação da partida',()=>{
 assert.doesNotThrow(()=>new Function(reward));
 assert.ok(!reward.includes('Prêmios estimados'));
 assert.ok(reward.includes('economy-classification'));
 assert.ok(reward.includes("Partida ${c.label||'Padrão'}"));
 assert.ok(reward.includes('economy-match-facts'));
 assert.ok(reward.includes('👥 ${p.participants} jogadores'));
 assert.ok(reward.includes('🏁 ${p.pointsToWin} pontos'));
 assert.ok(reward.includes("⏱️ ${c.duration||'moderada'}"));
});

test('conteúdo visual da estimativa vive em owner próprio e a casca do acordeão é refinada por P36',()=>{
 assert.ok(rewardCss.includes('.economy-preview-head'));
 assert.ok(rewardCss.includes('.economy-classification'));
 assert.ok(rewardCss.includes('.economy-match-facts'));
 assert.ok(rewardCss.includes('.dashboard-estimate-card .economy-preview-head{display:none!important}'));
 assert.ok(roomCss.includes('.room-info-accordion>.dashboard-card-body>.economy-preview'));
 assert.ok(shim.includes('rewardEstimateCurrent.css'));
});

test('Gênese é materializada por entitlement ou moldura equipada no backend atual',()=>{
 assert.ok(metagame.includes('const specialKeys=new Set(extra.map(r=>r.unlock_key))'));
 assert.ok(metagame.includes('fresh.equipped_frame_key&&SPECIAL_FRAMES[fresh.equipped_frame_key]'));
 assert.ok(metagame.includes('specialKeys.add(fresh.equipped_frame_key)'));
 assert.ok(metagame.includes('genese-celestial'));
});

test('profileUI reconcilia Gênese mesmo se uma fonte intermediária a omitir',()=>{
 assert.doesNotThrow(()=>new Function(profile));
 assert.ok(profile.includes("entitlement_type==='frame'&&e?.entitlement_key==='genese-celestial'"));
 assert.ok(profile.includes("equipped==='genese-celestial'"));
 assert.ok(profile.includes("pm.data.frames.push({...GENESIS})"));
});

test('mobile esconde o +X sem remover a pilha nem o slot vazio',()=>{
 assert.ok(semanticCss.includes('@media(max-width:760px){.card-creation-screen .clean-stack-depth{display:none!important}}'));
 assert.ok(stackCss.includes('.clean-stack-sheet'));
 assert.ok(stackCss.includes('.clean-stack-empty'));
 assert.ok(stackCss.includes('border:2px dashed'));
});

test('seleção de cartas usa coração preto e branco, sem coração rosa',()=>{
 assert.ok(semanticCss.includes("content:'🖤'"));
 assert.ok(semanticCss.includes("content:'🤍'"));
 assert.doesNotMatch(semanticCss,/💗|💖|💕|pink/i);
 assert.ok(shim.includes('cardCreationSemanticOverridesCurrent.css'));
});

test('P22 é shim semântico e P75 é a release corrente',()=>{
 assert.ok(index.indexOf('css/p22.css')>index.indexOf('css/p21.css'));
 assert.ok(shim.startsWith('/* COMPAT P22'));
 assert.ok(notifications.includes('release:p22'));
 assert.ok(notifications.includes("version:'v1.4.22'"));
 assert.ok(version.includes('releaseP75'));
});
