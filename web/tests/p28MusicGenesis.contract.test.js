'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const recovery=read('public/js/musicRecoveryP28.js'),recycling=read('public/js/marketplaceRecycling.js'),css=read('public/css/p28.css'),index=read('public/index.html'),notifications=read('lib/appNotifications.js');

test('P28 carrega áudio com cache-bust e recovery depois da integração existente',()=>{
  assert.doesNotThrow(()=>new Function(recovery));
  assert.match(index,/js\/soundtrack\.js\?v=1\.4\.28/);
  assert.match(index,/js\/sfx\.js\?v=1\.4\.28/);
  assert.ok(index.indexOf('js/musicRecoveryP28.js?v=1.4.28')>index.indexOf('js/audioIntegrationP13.js'));
});

test('recovery respeita música desligada e tenta novamente em gestos futuros',()=>{
  assert.match(recovery,/function wantsMusic\(\)\{return readSettings\(\)\.music!==false;\}/);
  assert.match(recovery,/CartSoundtrack\?\.unmute/);
  assert.match(recovery,/touchstart/);
  assert.match(recovery,/pointerdown/);
  assert.match(recovery,/click/);
  assert.match(recovery,/keydown/);
  assert.doesNotMatch(recovery,/once:true[^\n]*gestureAttempt/);
  assert.match(recovery,/pageshow/);
  assert.match(recovery,/visibilitychange/);
  assert.match(recovery,/cartaralho:audio-settings/);
});

test('Gênese tem arco Celestial giratório preservado e órbita elíptica atômica independente',()=>{
  assert.ok(index.indexOf('css/p28.css?v=1.4.28')>index.indexOf('css/p27.css?v=1.4.27'));
  assert.match(css,/frame-genese-celestial::after/);
  assert.match(css,/inset-block:-8px/);
  assert.match(css,/inset-inline:-15px/);
  assert.match(css,/border:1px solid/);
  assert.match(css,/border-radius:50%/);
  assert.match(css,/animation:p28GenesisAtomOrbit 6\.2s linear infinite!important/);
});

test('partícula percorre a elipse enquanto cresce e diminui e a própria órbita gira',()=>{
  assert.match(css,/0%\{transform:rotate\(-24deg\);background-position:100% 50%;background-size:9px 9px/);
  assert.match(css,/25%\{transform:rotate\(66deg\);background-position:50% 0%;background-size:15px 15px/);
  assert.match(css,/50%\{transform:rotate\(156deg\);background-position:0% 50%;background-size:9px 9px/);
  assert.match(css,/75%\{transform:rotate\(246deg\);background-position:50% 100%;background-size:15px 15px/);
  assert.match(css,/100%\{transform:rotate\(336deg\);background-position:100% 50%;background-size:9px 9px/);
});

test('Reciclagem não retrai o modal enquanto busca os dados',()=>{
  assert.doesNotThrow(()=>new Function(recycling));
  assert.match(recycling,/skeleton\(body\)/);
  assert.match(recycling,/body\.classList\.add\('recycling-loading'\)/);
  assert.match(recycling,/if\(this\.data\)this\.paint\(body,m\);else this\.skeleton\(body\)/);
  assert.match(recycling,/recycling-skeleton-grid/);
  assert.match(css,/market-body\.recycling-loading\{min-height:min\(540px,62dvh\)\}/);
  assert.match(css,/recycling-skeleton-grid>span/);
});

test('P28 permanece registrado na Central após versões futuras',()=>{
  assert.match(notifications,/release:p28/);
  assert.match(notifications,/version:'v1\.4\.28'/);
  assert.match(notifications,/Música persistente e Gênese atômica/);
});
