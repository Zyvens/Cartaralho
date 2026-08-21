'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const history=read('public/js/p37.js'),shim=read('public/css/p37.css'),adminUI=read('public/js/domains/adminUI.js'),cardCreation=read('public/js/domains/cardCreationUI.js'),reuseCss=read('public/css/cardCreationReuseCurrent.css'),megaCss=read('public/css/adminMegaphoneCurrent.css'),adminCss=read('public/css/creatorAdminCurrent.css'),server=read('lib/creatorAdmin.js'),compat=read('lib/creatorAdminP37.js'),api=read('api/admin/creator-tools.js'),pusher=read('lib/pusherServer.js'),version=read('api/version.js'),notifications=read('api/notifications.js'),release=read('lib/releaseP37.js'),index=read('public/index.html'),home=read('public/js/screens/home.js');

test('owners atuais de P37 compilam e a implementação histórica permanece apenas como proveniência',()=>{
 [history,adminUI,cardCreation,server,api,pusher].forEach(src=>assert.doesNotThrow(()=>new Function(src)));
 assert.ok(index.includes('type="application/x-cartaralho-legacy" src="js/p37.js?v=1.4.37"'));
 assert.ok(!index.includes('<script src="js/p37.js'));
 assert.ok(index.includes('js/domains/adminUI.js?v=domain-2'));
 assert.ok(index.includes('js/domains/cardCreationUI.js?v=domain-2'));
});

test('reutilização e favoritos de Cartas de Jogador pertencem a cardCreationUI + owner visual',()=>{
 assert.ok(cardCreation.includes("h.classList.add('player-library-title-selected')"));
 assert.ok(cardCreation.includes("h.classList.add('is-reuse-title')"));
 assert.ok(cardCreation.includes('player-library-free-pill'));
 assert.ok(cardCreation.includes("el.classList.toggle('is-favorite'"));
 assert.ok(reuseCss.includes('.player-library-free-pill'));
 assert.ok(reuseCss.includes('.player-card-library-card.is-favorite'));
 assert.ok(shim.includes('cardCreationReuseCurrent.css'));
});

test('Megafone global e aviso de versão vivem no owner adminUI',()=>{
 assert.ok(pusher.includes("GLOBAL_CHANNEL='cartaralho-global'"));
 assert.ok(adminUI.includes('subscribe(GLOBAL_CHANNEL)'));
 assert.ok(adminUI.includes("bind('admin_megaphone'"));
 assert.ok(adminUI.includes('Nova atualização ${current} disponível'));
 assert.ok(adminUI.includes('setInterval(checkVersion,60000)'));
 assert.ok(adminUI.includes("toast.className='toast info megaphone'"));
 assert.ok(megaCss.includes('.toast.megaphone'));
 assert.ok(megaCss.includes('.toast-megaphone-reward'));
 assert.ok(shim.includes('adminMegaphoneCurrent.css'));
});

test('Ferramentas do Criador continuam exclusivas do user_id 1 e o botão Admin legado permanece oculto',()=>{
 assert.ok(adminUI.includes('Number(AuthClient?.user?.id)===1'));
 assert.ok(server.includes('CREATOR_ADMIN_USER_ID=1'));
 assert.ok(server.includes('Number(user.id)!==CREATOR_ADMIN_USER_ID'));
 assert.ok(api.includes('requireCreatorAdmin'));
 assert.ok(home.includes('id="home-admin-btn"'));
 assert.ok(adminCss.includes('#home-admin-btn{display:none!important}'));
 assert.ok(adminCss.includes('.creator-admin-overlay'));
 assert.ok(adminCss.includes('.creator-admin-shell'));
 assert.ok(shim.includes('creatorAdminCurrent.css'));
});

test('admin oferece Megafone e Prêmios individual/coletivo',()=>{
 for(const marker of["action==='megaphone'","action==='reward'","scope==='individual'",'creditIndividual','creditAll','broadcastGlobal'])assert.ok(api.includes(marker),marker);
 for(const label of['📣 Megafone','🎁 Prêmios','Individual','Coletivo','Premiar jogador','Premiar todos'])assert.ok(adminUI.includes(label),label);
 assert.ok(api.includes('targetUserIds'));
});

test('créditos administrativos continuam transacionais e idempotentes no owner canônico',()=>{
 assert.ok(server.includes('sql.transaction'));
 assert.ok(server.includes('idempotency_key'));
 assert.ok(server.includes('ON CONFLICT(idempotency_key) DO NOTHING'));
 assert.ok(server.includes("'adjustment'"));
 assert.ok(server.includes('admin:${operationId}:${id}'));
 assert.ok(server.includes("isolationMode:'Serializable'"));
});

test('backend P37 é apenas alias COMPAT e a API usa o owner sem sufixo',()=>{
 assert.ok(compat.includes("module.exports=require('./creatorAdmin')"));
 assert.ok(api.includes("require('../../lib/creatorAdmin')"));
 assert.ok(!api.includes('creatorAdminP37'));
});

test('P37 CSS é shim semântico e P75 é a release corrente',()=>{
 assert.ok(shim.startsWith('/* COMPAT P37'));
 assert.ok(index.includes('css/p37.css?v=1.4.37'));
 assert.ok(release.includes("APP_VERSION='v1.4.37'"));
 assert.ok(version.includes('releaseP75'));
 assert.ok(notifications.includes('releaseP75'));
 assert.ok(notifications.includes('P37_RELEASE')||notifications.includes('releaseP37'));
});
