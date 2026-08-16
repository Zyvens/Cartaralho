'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/genesisFrameP29.js'),css=read('public/css/p29.css'),index=read('public/index.html'),notifications=read('lib/appNotifications.js');

test('P29 compila e continua carregando depois da implementação antiga da Gênese',()=>{
  assert.doesNotThrow(()=>new Function(js));
  assert.ok(index.indexOf('css/p29.css?v=1.4.')>index.indexOf('css/p28.css?v=1.4.28'));
  assert.ok(index.indexOf('js/genesisFrameP29.js?v=1.4.')>index.indexOf('js/identityP20.js'));
});

test('P29 separa linha orbital e partícula em elementos reais',()=>{
  assert.match(js,/genese-atom-track/);
  assert.match(js,/genese-atom-particle/);
  assert.match(js,/track\.appendChild\(particle\)/);
  assert.match(js,/frame\.appendChild\(track\)/);
  assert.match(css,/frame-genese-celestial::after[\s\S]*content:none!important/);
});

test('órbita é elíptica proporcional e gira independentemente do arco Celestial',()=>{
  assert.match(css,/genese-atom-track\{[\s\S]*width:145%[\s\S]*height:112%/);
  assert.match(css,/border-radius:50%/);
  assert.match(css,/animation:p29GenesisOrbitPlane 8\.4s linear infinite/);
  assert.match(css,/@keyframes p29GenesisOrbitPlane/);
  assert.match(css,/rotate\(-28deg\)/);
  assert.match(css,/rotate\(332deg\)/);
});

test('corpo orbital continua percorrendo a própria elipse e pulsando',()=>{
  assert.match(css,/animation:p30GenesisPlatinumStar 4\.6s linear infinite/);
  assert.match(css,/0%\{left:100%;top:50%/);
  assert.match(css,/25%\{left:50%;top:0%/);
  assert.match(css,/50%\{left:0%;top:50%/);
  assert.match(css,/75%\{left:50%;top:100%/);
  assert.match(css,/100%\{left:100%;top:50%/);
});

test('decorador cobre frames existentes e novos sem observar atributos ou criar loop de classe',()=>{
  assert.match(js,/decorate\(document\)/);
  assert.match(js,/record\.addedNodes/);
  assert.match(js,/observer\.observe\(document\.body,\{childList:true,subtree:true\}\)/);
  assert.doesNotMatch(js,/attributes:true/);
  assert.match(js,/querySelector\(':scope > \.genese-atom-track'\)/);
});

test('release P29 permanece registrada após versões futuras',()=>{
  assert.match(notifications,/release:p29/);
  assert.match(notifications,/version:'v1\.4\.29'/);
  assert.match(notifications,/Gênese com órbita atômica real/);
});
