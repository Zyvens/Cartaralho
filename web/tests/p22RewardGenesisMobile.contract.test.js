'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const reward=read('public/js/rewardPreviewUI.js'),profile=read('public/js/profileAppearanceP20.js'),metagame=read('api/profile/metagame.js'),css=read('public/css/p22.css'),index=read('public/index.html'),notifications=read('lib/appNotifications.js');

for(const[name,src]of[['rewardPreviewUI.js',reward],['profileAppearanceP20.js',profile]])test(`${name} compila no P22`,()=>assert.doesNotThrow(()=>new Function(src)));

test('estimativa elimina redundância e mantém classificação da partida',()=>{
 assert.doesNotMatch(reward,/Prêmios estimados/);
 assert.match(reward,/economy-classification/);
 assert.match(reward,/Partida \$\{c\.label\|\|'Padrão'\}/);
 assert.match(reward,/economy-match-facts/);
 assert.match(reward,/👥 \$\{p\.participants\} jogadores/);
 assert.match(reward,/🏁 \$\{p\.pointsToWin\} pontos/);
 assert.match(reward,/⏱️ \$\{c\.duration\|\|'moderada'\}/);
});

test('Lobby usa Estimativa da partida com o mesmo padrão de cabeçalho do Resumo',()=>{
 assert.match(reward,/this\.card\(data\.preview,'Estimativa da partida'/);
 assert.match(css,/\.lobby-reward-card \.economy-preview/);
 assert.match(css,/\.economy-preview-head\{/);
 assert.match(css,/padding:17px 18px 14px!important/);
 assert.match(css,/border-bottom:1px solid rgba\(255,255,255,\.065\)!important/);
});

test('Gênese é materializada por entitlement ou por moldura equipada no backend',()=>{
 assert.match(metagame,/const specialKeys=new Set\(extra\.map\(r=>r\.unlock_key\)\)/);
 assert.match(metagame,/fresh\.equipped_frame_key&&SPECIAL_FRAMES\[fresh\.equipped_frame_key\]/);
 assert.match(metagame,/specialKeys\.add\(fresh\.equipped_frame_key\)/);
 assert.match(metagame,/genese-celestial/);
});

test('Perfil reconcilia Gênese mesmo quando uma fonte intermediária omite a moldura',()=>{
 assert.match(profile,/_reconcileSpecialAppearance/);
 assert.match(profile,/prestige\?\.entitlements/);
 assert.match(profile,/entitlement_key==='genese-celestial'/);
 assert.match(profile,/d\.frames\.push\(\{\.\.\.GENESIS\}\)/);
 assert.match(profile,/equipped_frame_key==='genese-celestial'/);
});

test('mobile esconde o bullet +X mas preserva pilha e slot pontilhado',()=>{
 assert.match(css,/@media\(max-width:760px\)[\s\S]*\.card-creation-screen \.clean-stack-depth\{display:none!important\}/);
 const p21=read('public/css/p21.css');
 assert.match(p21,/clean-stack-sheet/);
 assert.match(p21,/clean-stack-empty/);
 assert.match(p21,/border:2px dashed/);
});

test('seleção de cartas usa coração preto e branco, sem coração rosa',()=>{
 assert.match(css,/content:'🖤'/);
 assert.match(css,/content:'🤍'/);
 assert.doesNotMatch(css,/💗|💖|💕|pink/i);
});

test('P22 permanece carregado e registrado mesmo com versões posteriores',()=>{
 assert.ok(index.indexOf('css/p22.css')>index.indexOf('css/p21.css'));
 assert.match(notifications,/release:p22/);
 assert.match(notifications,/version:'v1\.4\.22'/);
});
