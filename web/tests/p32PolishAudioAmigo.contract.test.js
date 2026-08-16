'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p32.css'),players=read('public/js/components/playerList.js'),sound=read('public/js/soundtrack.js'),recovery=read('public/js/musicRecoveryP28.js'),defs=read('lib/buffDefinitions.js'),amigo=read('lib/amigoDeMerdaP32.js'),api=read('api/buffs.js'),index=read('public/index.html'),notifications=read('lib/appNotifications.js'),migration=read('db/p32_amigo_de_merda_redraw.sql'),seed=read('db/metagame_v1_4_package8.sql');

test('P32 JS crítico compila',()=>{
 assert.doesNotThrow(()=>new Function(players));
 assert.doesNotThrow(()=>new Function(sound));
 assert.doesNotThrow(()=>new Function(recovery));
});

test('identidade do jogador ganha espaçamento sem inline gap legado',()=>{
 assert.match(players,/class="player-main"/);
 assert.doesNotMatch(players,/gap:10px;flex:1/);
 assert.match(css,/\.player-main\{[^}]*gap:20px/);
 assert.match(css,/\.player-main>\.player-info\{[^}]*display:grid[^}]*gap:5px/);
});

test('Asas ficam na borda inferior e a direita é espelhada',()=>{
 assert.match(css,/frame-cosmetic-asas::before,[\s\S]*bottom:-10px!important/);
 assert.match(css,/frame-cosmetic-asas::before\{[\s\S]*left:-10px!important[\s\S]*right:auto!important/);
 assert.match(css,/frame-cosmetic-asas::after\{[\s\S]*right:-10px!important[\s\S]*scaleX\(-1\)/);
});

test('Cintilante aplica RGB somente à foto',()=>{
 assert.match(css,/frame-cosmetic-cintilante>img/);
 assert.match(css,/animation:p32CintilanteRGB 5\.4s linear infinite!important/);
 assert.match(css,/@keyframes p32CintilanteRGB/);
 assert.match(css,/hue-rotate\(120deg\)/);
 assert.match(css,/hue-rotate\(240deg\)/);
 assert.doesNotMatch(css,/frame-cosmetic-arco-iris>img[^\{]*\{[^}]*p32CintilanteRGB/);
});

test('música recupera contextos Web Audio não-running e fechados no iPhone/PWA',()=>{
 assert.match(sound,/context\?\.state==='closed'/);
 assert.match(sound,/if\(ctx\.state!=='running'\)await ctx\.resume\(\)/);
 assert.match(sound,/get state\(\)\{return context\?\.state\|\|'none'\}/);
 assert.match(sound,/visibilitychange[^\n]*unlockAndPlay/);
 assert.match(recovery,/touchend/);
 assert.match(recovery,/pointerup/);
 assert.match(recovery,/CartSoundtrack\?\.state==='running'/);
 assert.match(index,/soundtrack\.js\?v=1\.4\.32/);
 assert.match(index,/musicRecoveryP28\.js\?v=1\.4\.32/);
});

test('Amigo de Merda troca a mão inteira no servidor em vez de só reordenar',()=>{
 assert.match(defs,/buff_amigo_de_merda[\s\S]*devolva toda a mão dele ao bolo e force uma nova mão do mesmo tamanho/);
 assert.match(api,/buffKey==='buff_amigo_de_merda'\?await amigo\.activate/);
 assert.match(amigo,/room\.whiteDeck\.push\(\.\.\.target\.hand\.splice\(0\)\)/);
 assert.match(amigo,/shuffle\(room\.whiteDeck\)/);
 assert.match(amigo,/for\(let i=0;i<n;i\+\+\)target\.hand\.push\(room\.whiteDeck\.pop\(\)\)/);
 assert.match(amigo,/oldHandSize:n,newHandSize:afterHand\.length,redrawn:true/);
 assert.doesNotMatch(amigo,/shuffle\(target\.hand\)/);
});

test('redraw do Amigo é transacional, idempotente e limpa posse temporária no engine avançado',()=>{
 assert.match(amigo,/temporaryPossessions\[tid\]=\[\]/);
 assert.match(amigo,/UPDATE rooms SET current_round=/);
 assert.match(amigo,/UPDATE players SET hand=/);
 assert.match(amigo,/INSERT INTO buff_activations/);
 assert.match(amigo,/UPDATE buff_inventory SET quantity=quantity-1/);
 assert.match(amigo,/buff_inventory_ledger/);
 assert.match(amigo,/isolationMode:'Serializable'/);
 assert.match(amigo,/prior\(actorDbId,activation\)/);
});

test('catálogo e migration descrevem a regra nova',()=>{
 assert.match(migration,/buff_amigo_de_merda/);
 assert.match(migration,/nova mão do mesmo tamanho/);
 assert.match(seed,/buff_amigo_de_merda','Amigo de Merda','Antes da submissão do alvo, devolva toda a mão dele ao bolo e force uma nova mão do mesmo tamanho/);
});

test('P32 é a camada final publicada',()=>{
 assert.match(index,/css\/p32\.css\?v=1\.4\.32/);
 assert.ok(index.indexOf('css/p32.css?v=1.4.32')>index.indexOf('css/p29.css?v=1.4.31'));
 assert.match(notifications,/APP_VERSION='v1\.4\.32'/);
 assert.match(notifications,/release:p32/);
});
