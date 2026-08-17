'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p48.css'),js=read('public/js/p48.js'),create=read('api/cards/create.js'),index=read('public/index.html'),release=read('lib/releaseP48.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('Home prioriza Cartaralho e move Jogo de Cartas para o topo central',()=>{
 assert.match(css,/\.home-subtitle\{[\s\S]*position:fixed!important[\s\S]*left:50%!important/);
 assert.match(css,/\.home-logo\{[\s\S]*min-height:52svh!important/);
 assert.match(css,/\.logo-image\{[\s\S]*560px/);
});

test('Lobby desce o código e reduz o vazio antes dos jogadores',()=>{
 assert.match(css,/data-cart-screen="lobby"[\s\S]*\.lobby-screen[\s\S]*padding-top/);
 assert.match(css,/\.room-code-display[\s\S]*margin:18px auto 14px!important/);
 assert.match(css,/\.lobby-content[\s\S]*margin-top:12px!important/);
});

test('cardCreation esconde Missões e a troca de tela elimina flash de Admin',()=>{
 assert.match(css,/data-cart-screen="cardCreation"\] \.mission-fab\{display:none!important\}/);
 assert.match(js,/App\.showScreen=function\(name,data=\{\}\)\{P\.screen\(name\);P\.clearBack\(\)/);
 assert.match(css,/body:not\(\[data-cart-screen="home"\]\) \.creator-admin-fab\{display:none!important\}/);
});

test('Voltar de telas é promovido para o mesmo referencial da viewport',()=>{
 assert.match(js,/p48-top-nav-host/);
 assert.match(js,/querySelector\('#app button\.back-button'\)/);
 assert.match(css,/p48-promoted-back[\s\S]*top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\)!important/);
});

test('Minhas Cartas oferece criação fora de sala sem seleção',()=>{
 assert.match(js,/Criar nova Carta de Jogador/);
 assert.match(js,/libraryMode:true/);
 assert.match(create,/const\{code,type,text,creationId,libraryMode\}=getBody\(req\)/);
 assert.match(create,/if\(!libraryMode\)\{/);
 assert.match(create,/matchId=''/);
});

test('novidades indicam seção e item e só são lidas ao fechar',()=>{
 assert.match(js,/notifications-section-new/);
 assert.match(js,/notification-new-pill/);
 assert.match(js,/__p48PendingRead/);
 assert.match(js,/N\.close=function/);
});

test('P48 é a camada final e publica v1.4.48',()=>{
 assert.match(index,/css\/p48\.css\?v=1\.4\.48/);
 assert.match(index,/js\/p48\.js\?v=1\.4\.48/);
 assert.match(release,/APP_VERSION='v1\.4\.48'/);
 assert.match(version,/releaseP48/);
 assert.match(notifications,/releaseP48/);
 assert.match(notifications,/P47_RELEASE/);
});
