'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p37.css'),js=read('public/js/p37.js'),server=read('lib/creatorAdminP37.js'),api=read('api/admin/creator-tools.js'),pusher=read('lib/pusherServer.js'),version=read('api/version.js'),notifications=read('api/notifications.js'),release=read('lib/releaseP37.js'),index=read('public/index.html');

test('P37 JS crítico compila',()=>assert.doesNotThrow(()=>new Function(js)));
test('backend administrativo compila',()=>{assert.doesNotThrow(()=>new Function(server));assert.doesNotThrow(()=>new Function(api));assert.doesNotThrow(()=>new Function(pusher));});

test('seleção de Cartas de Jogador ganha respiro, grátis em pill e favoritas destacadas',()=>{
 assert.match(css,/\.card-creation-screen \.player-library-title\{margin:32px 0 18px!important/);
 assert.match(css,/\.created-cards-grid\{margin:0 0 42px!important/);
 assert.match(css,/\.player-library-free-pill\{/);
 assert.match(css,/\.player-card-library-card\.is-favorite\{/);
 assert.match(js,/Number\(!!b\.is_favorite\)-Number\(!!a\.is_favorite\)/);
 assert.match(js,/Reutilizar Cartas de Jogador:<\/span><span class="player-library-free-pill">grátis/);
 assert.match(js,/DE JOGADOR/);
 assert.match(js,/b\.remove\(\)/);
});

test('megafone global funciona fora de salas e aviso de versão pede reinício',()=>{
 assert.match(pusher,/GLOBAL_CHANNEL='cartaralho-global'/);
 assert.match(pusher,/broadcastGlobal/);
 assert.match(js,/subscribe\(GLOBAL_CHANNEL\)/);
 assert.match(js,/bind\('admin_megaphone'/);
 assert.match(js,/Nova atualização \$\{server\} disponível\. Reinicie o jogo para adicionar as atualizações\./);
 assert.match(js,/setInterval\(checkVersion,60000\)/);
 assert.match(version,/currentVersion:APP_VERSION/);
});

test('ferramentas do Criador são exclusivas do user_id 1 no cliente e no servidor',()=>{
 assert.match(js,/Number\(AuthClient\.user\?\.id\)===1/);
 assert.match(server,/CREATOR_ADMIN_USER_ID=1/);
 assert.ok(server.includes('Number(user.id)!==CREATOR_ADMIN_USER_ID'));
 assert.match(api,/requireCreatorAdmin/);
 assert.match(css,/#home-admin-btn\{display:none!important\}/);
 assert.match(css,/\.creator-admin-fab\{/);
});

test('admin oferece Megafone e Prêmios individual/coletivo',()=>{
 for(const marker of["action==='megaphone'","action==='reward'","scope==='individual'",'creditIndividual','creditAll','broadcastGlobal'])assert.ok(api.includes(marker),marker);
 for(const label of['📣 Megafone','🎁 Prêmios','Individual','Coletivo','Premiar jogador','Premiar todos'])assert.ok(js.includes(label),label);
 assert.match(api,/targetUserIds/);
});

test('créditos administrativos são transacionais e idempotentes',()=>{
 assert.match(server,/sql\.transaction/);
 assert.match(server,/idempotency_key/);
 assert.match(server,/ON CONFLICT\(idempotency_key\) DO NOTHING/);
 assert.ok(server.includes("'adjustment'"));
 assert.match(server,/admin:\$\{operationId\}:\$\{id\}/);
 assert.match(server,/isolationMode:'Serializable'/);
});

test('Central e endpoint de versão preservam P37 mesmo após releases futuros',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.37'/);
 assert.match(release,/release:p37/);
 assert.match(notifications,/data\.currentVersion=APP_VERSION/);
 assert.match(notifications,/P37_RELEASE|releaseP37/);
 assert.match(version,/APP_VERSION/);
});

test('P37 permanece carregado com cache-busting próprio',()=>{
 assert.match(index,/css\/p37\.css\?v=1\.4\.37/);
 assert.match(index,/js\/p37\.js\?v=1\.4\.37/);
 assert.ok(index.indexOf('css/p37.css?v=1.4.37')>index.indexOf('css/p36.css?v=1.4.36'));
 assert.ok(index.indexOf('js/p37.js?v=1.4.37')>index.indexOf('js/p36.js?v=1.4.36'));
});
