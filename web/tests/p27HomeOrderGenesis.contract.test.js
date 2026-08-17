'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/homeMenuP27.js'),css=read('public/css/p27.css'),index=read('public/index.html'),notifications=read('lib/appNotifications.js');

test('P27 compila e continua carregado depois do P25/P26 com cache-bust atualizável',()=>{
  assert.doesNotThrow(()=>new Function(js));
  assert.match(index,/css\/p27\.css\?v=1\.4\.\d+/);
  assert.match(index,/js\/homeMenuP27\.js\?v=1\.4\.\d+/);
  assert.ok(index.indexOf('css/p27.css')>index.indexOf('css/p26.css'));
  assert.ok(index.indexOf('js/homeMenuP27.js')>index.indexOf('js/uiP25.js'));
});

test('ordem visual é permanente por CSS e segue a sequência consolidada',()=>{
  const expected=[
    ['#marketplace-menu-btn',1],['#friends-menu-btn',2],['[data-panel="cards"]',3],['[data-panel="rank"]',4],['[data-panel="history"]',5],['#notifications-menu-btn',6],['[data-panel="stats"]',7],['#audio-settings-menu-btn',8],['[data-panel="credits"]',9]
  ];
  let previous=-1;
  for(const[selector,order]of expected){
    const pos=css.indexOf(selector);
    assert.ok(pos>previous,`${selector} fora da sequência CSS`);previous=pos;
    const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/"/g,'\\"');
    assert.match(css,new RegExp(`${escaped}\\{order:${order}!important\\}`));
  }
});

test('ordenador usa um único observer no contêiner estável da Home',()=>{
  assert.match(js,/document\.getElementById\('home-main'\)/);
  assert.match(js,/mainObserver\?\.disconnect\(\)/);
  assert.match(js,/mainObserver\.observe\(main,\{childList:true,subtree:true\}\)/);
  assert.doesNotMatch(js,/observe\(document\.body/);
  assert.match(js,/node\.style\.setProperty\('order',String\(index\+1\),'important'\)/);
  assert.match(js,/actions\.append\(\.\.\.ordered/);
  assert.match(js,/HomeScreen\.renderAccount=function/);
  assert.match(js,/HomeScreen\.render=async function/);
});

test('Gênese P27 preserva órbita elíptica simétrica e glint pulsante como fallback',()=>{
  assert.match(css,/frame-genese-celestial::after[\s\S]*inset-block:-7px[\s\S]*inset-inline:-12px/);
  assert.match(css,/background-image:radial-gradient\(circle/);
  assert.match(css,/animation:p27GenesisOrbitalGlint 5\.2s linear infinite!important/);
  assert.match(css,/0%\{background-position:100% 50%;background-size:11px 11px/);
  assert.match(css,/25%\{background-position:50% 0%;background-size:17px 17px/);
  assert.match(css,/50%\{background-position:0% 50%;background-size:11px 11px/);
  assert.match(css,/75%\{background-position:50% 100%;background-size:17px 17px/);
  assert.doesNotMatch(css,/radial-gradient\([^\n]*,.*radial-gradient\(/);
});

test('Central preserva o release P27 e permite versões posteriores',()=>{
  assert.match(notifications,/const APP_VERSION='v1\.4\.\d+'/);
  assert.match(notifications,/release:p27/);
  assert.match(notifications,/release:p26/);
  assert.match(notifications,/release:p25/);
});
