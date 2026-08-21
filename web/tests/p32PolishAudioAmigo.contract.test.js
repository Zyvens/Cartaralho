'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const shim=read('public/css/p32.css'),identityCss=read('public/css/publicPlayerIdentityLayoutCurrent.css'),wingsCss=read('public/css/cosmeticWingsCurrent.css'),specialCss=read('public/css/cosmeticSpecialFramesCurrent.css'),players=read('public/js/components/playerList.js'),sound=read('public/js/soundtrack.js'),audio=read('public/js/domains/audioUI.js'),defs=read('lib/buffDefinitions.js'),amigo=read('lib/amigoDeMerda.js'),compat=read('lib/amigoDeMerdaP32.js'),api=read('api/buffs.js'),index=read('public/index.html'),appNotifications=read('lib/appNotifications.js'),version=read('api/version.js'),notifications=read('api/notifications.js'),migration=read('db/p32_amigo_de_merda_redraw.sql'),seed=read('db/metagame_v1_4_package8.sql');

test('identidade pública P32 vive em owner visual canônico e usa markup atual',()=>{
 assert.doesNotThrow(()=>new Function(players));
 assert.ok(players.includes('class="player-main"'));
 assert.ok(players.includes('class="player-info"'));
 assert.ok(players.includes('class="player-status-text"'));
 assert.ok(players.includes('class="player-meta"'));
 assert.ok(identityCss.includes('.player-main{display:flex;align-items:center;gap:20px'));
 assert.ok(identityCss.includes('.player-main>.player-info{display:grid;gap:5px'));
 assert.ok(identityCss.includes('.player-meta{display:flex;align-items:center;gap:8px'));
 assert.ok(identityCss.includes('@media(max-width:520px){.player-main{gap:17px}}'));
 assert.ok(shim.includes('publicPlayerIdentityLayoutCurrent.css'));
});

test('Asas P32 foram supersedidas pela geometria final P36',()=>{
 assert.ok(!shim.includes('frame-cosmetic-asas'));
 assert.ok(!identityCss.includes('frame-cosmetic-asas'));
 assert.ok(wingsCss.includes('.avatar-frame.frame-cosmetic-asas'));
 assert.ok(wingsCss.includes('bottom:-10px!important'));
 assert.ok(wingsCss.includes('z-index:40!important'));
 assert.ok(wingsCss.includes('transform:scaleX(-1) rotate(45deg)!important'));
});

test('Cintilante P32 foi supersedido pelo owner P33 que anima apenas a foto',()=>{
 assert.ok(!shim.includes('p32CintilanteRGB'));
 assert.ok(!identityCss.includes('p32CintilanteRGB'));
 assert.ok(specialCss.includes('.avatar-frame.frame-cosmetic-cintilante img'));
 assert.ok(specialCss.includes('animation:p33CintilantePhotoRGB 5.4s linear infinite!important'));
 assert.ok(specialCss.includes('@media(prefers-reduced-motion:reduce)'));
 assert.ok(!specialCss.includes('frame-cosmetic-arco-iris'));
});

test('áudio recupera Web Audio no owner atual inclusive iPhone/PWA',()=>{
 assert.doesNotThrow(()=>new Function(sound));
 assert.doesNotThrow(()=>new Function(audio));
 assert.ok(sound.includes("context?.state==='closed'"));
 assert.ok(sound.includes("if(ctx.state!=='running')await ctx.resume()"));
 for(const evt of['touchstart','touchend','pointerdown','pointerup','click','keydown'])assert.ok(audio.includes(`'${evt}'`),evt);
 assert.ok(audio.includes('attempt(true)'));
 assert.ok(index.includes('soundtrack.js?v=1.4.32'));
 assert.ok(index.includes('js/domains/audioUI.js?v=domain-2'));
});

test('Amigo de Merda troca a mão inteira no owner canônico',()=>{
 assert.doesNotThrow(()=>new Function(amigo));
 assert.match(defs,/buff_amigo_de_merda[\s\S]*devolva toda a mão dele ao bolo e force uma nova mão do mesmo tamanho/);
 assert.match(api,/buffKey==='buff_amigo_de_merda'\?await amigo\.activate/);
 assert.match(amigo,/room\.whiteDeck\.push\(\.\.\.target\.hand\.splice\(0\)\)/);
 assert.match(amigo,/shuffle\(room\.whiteDeck\)/);
 assert.match(amigo,/for\(let i=0;i<n;i\+\+\)target\.hand\.push\(room\.whiteDeck\.pop\(\)\)/);
 assert.match(amigo,/oldHandSize:n,newHandSize:afterHand\.length,redrawn:true/);
 assert.doesNotMatch(amigo,/shuffle\(target\.hand\)/);
});

test('redraw do Amigo é transacional, idempotente e limpa posse temporária',()=>{
 assert.match(amigo,/temporaryPossessions\[tid\]=\[\]/);
 assert.match(amigo,/UPDATE rooms SET current_round=/);
 assert.match(amigo,/UPDATE players SET hand=/);
 assert.match(amigo,/INSERT INTO buff_activations/);
 assert.match(amigo,/UPDATE buff_inventory SET quantity=quantity-1/);
 assert.match(amigo,/buff_inventory_ledger/);
 assert.match(amigo,/isolationMode:'Serializable'/);
 assert.match(amigo,/prior\(actorDbId,activation\)/);
});

test('backend P32 é alias COMPAT e API usa owner sem sufixo',()=>{
 assert.match(compat,/module\.exports=require\('\.\/amigoDeMerda'\)/);
 assert.match(api,/require\('\.\.\/lib\/amigoDeMerda'\)/);
 assert.doesNotMatch(api,/amigoDeMerdaP32/);
});

test('catálogo e migration preservam a regra canônica do Amigo',()=>{
 assert.match(migration,/buff_amigo_de_merda/);
 assert.match(migration,/nova mão do mesmo tamanho/);
 assert.match(seed,/buff_amigo_de_merda','Amigo de Merda','Antes da submissão do alvo, devolva toda a mão dele ao bolo e force uma nova mão do mesmo tamanho/);
});

test('P32 permanece na proveniência e P75 é a release corrente',()=>{
 assert.ok(index.includes('css/p32.css?v=1.4.32'));
 assert.ok(shim.startsWith('/* COMPAT P32'));
 assert.ok(appNotifications.includes('release:p32'));
 assert.ok(version.includes('releaseP75'));
 assert.ok(notifications.includes('releaseP75'));
});
