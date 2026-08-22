'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/domains/audioUI.js');
const html=read('public/index.html');

test('owner final de áudio compila e substitui integrações históricas',()=>{
 assert.doesNotThrow(()=>new Function(js));
 assert.match(html,/js\/domains\/audioUI\.js\?v=domain-2/);
 assert.doesNotMatch(html,/<script\s+src="js\/audioIntegrationP13\.js/);
 assert.doesNotMatch(html,/<script\s+src="js\/musicRecoveryP28\.js/);
});

test('migração de preferências respeita mute legado e recuperação de autoplay',()=>{
 assert.match(js,/cartaralho:audio-settings:v1/);
 assert.match(js,/cartaralho:music-muted:v1/);
 assert.match(js,/cartaralho:music-autostart-p18:v1/);
 assert.match(js,/localStorage\.getItem\(LEGACY_MUTE_KEY\)!=='1'/);
 assert.match(js,/touchstart/);assert.match(js,/visibilitychange/);assert.match(js,/pageshow/);
});

test('modais, BUFFs, toasts e recompensa preservam feedback sonoro',()=>{
 assert.match(js,/Modal\.show/);assert.match(js,/Modal\.hide/);
 assert.match(js,/modal_open/);assert.match(js,/modal_close/);
 assert.match(js,/profile-modal-overlay/);assert.match(js,/market-overlay/);assert.match(js,/buff-drawer-shell/);
 assert.match(js,/playBuff/);assert.match(js,/achievement|reward/);
});

test('configurações de áudio continuam acessíveis pela Home',()=>{
 assert.match(js,/function openSettings/);
 assert.match(js,/audio-settings-menu-btn/);
 assert.match(js,/Volume geral/);assert.match(js,/Volume da música/);assert.match(js,/Efeitos sonoros/);
});
