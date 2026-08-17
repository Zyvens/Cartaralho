'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p39.css'),js=read('public/js/p39.js'),index=read('public/index.html'),version=read('api/version.js'),notifications=read('api/notifications.js'),release=read('lib/releaseP39.js');

test('P39 JS compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('Admin some na etapa de apelido e só permanece na Home principal',()=>{
 assert.match(js,/playFormOpen/);
 assert.match(js,/getComputedStyle\(el\)\.display!=='none'/);
 assert.match(js,/currentScreen==='home'/);
 assert.match(js,/!playFormOpen\(\)/);
 assert.match(js,/creator-admin-fab/);
 assert.match(js,/#btn-play,#back-play/);
});

test('Voltar usa proporção do pill Missões e o apelido ancora no topo esquerdo',()=>{
 assert.match(css,/button\.back-button/);
 assert.match(css,/button\.ghost-back/);
 assert.match(css,/button\[id\^='back-'\]/);
 assert.match(css,/padding:10px 14px!important/);
 assert.match(css,/border-radius:999px!important/);
 assert.match(css,/#play-form>#back-play\{[\s\S]*position:fixed!important/);
 assert.match(css,/top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\)!important/);
 assert.match(css,/left:12px!important/);
});

test('Perfil e Sair acompanham a altura do maior bloco da barra de conta',()=>{
 assert.match(css,/\.home-account-bar #profile-shortcut/);
 assert.match(css,/\.home-account-bar #logout-btn/);
 assert.match(css,/align-self:stretch!important/);
 assert.match(css,/height:auto!important/);
});

test('toasts longos quebram linha e o aviso de prontidão fica compacto',()=>{
 assert.match(css,/#toast-container\{[\s\S]*calc\(100vw - 24px\)/);
 assert.match(css,/\.toast\{[\s\S]*white-space:normal!important/);
 assert.match(css,/\.toast-message\{[\s\S]*overflow-wrap:anywhere/);
 assert.match(js,/Prontidão cancelada\. Cartas liberadas para edição\./);
 assert.ok(!js.includes('window.Toast'));
});

test('P39 publica versão e preserva P38/P37 na Central',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.39'/);
 assert.match(release,/release:p39/);
 assert.match(version,/releaseP39/);
 assert.match(notifications,/releaseP39/);
 assert.match(notifications,/releaseP38/);
 assert.match(notifications,/releaseP37/);
});

test('P39 é carregado como camada final com cache-busting',()=>{
 assert.match(index,/css\/p39\.css\?v=1\.4\.39/);
 assert.match(index,/js\/p39\.js\?v=1\.4\.39/);
 assert.ok(index.indexOf('css/p39.css?v=1.4.39')>index.indexOf('css/p37.css?v=1.4.37'));
 assert.ok(index.indexOf('js/p39.js?v=1.4.39')>index.indexOf('js/p38.js?v=1.4.38'));
});
