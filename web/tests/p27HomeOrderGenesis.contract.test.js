'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/homeMenuP27.js'),css=read('public/css/p27.css'),index=read('public/index.html'),notifications=read('lib/appNotifications.js');

test('P27 compila e carrega depois do P25/P26',()=>{
  assert.doesNotThrow(()=>new Function(js));
  assert.ok(index.indexOf('css/p27.css?v=1.4.27')>index.indexOf('css/p26.css?v=1.4.26'));
  assert.ok(index.indexOf('js/homeMenuP27.js?v=1.4.27')>index.indexOf('js/uiP25.js?v=1.4.25'));
});

test('ordem visual é permanente por CSS e segue exatamente a sequência acordada',()=>{
  const expected=[
    ['#marketplace-menu-btn',1],['#notifications-menu-btn',2],['#friends-menu-btn',3],['[data-panel="cards"]',4],['[data-panel="rank"]',5],['[data-panel="history"]',6],['[data-panel="stats"]',7],['#audio-settings-menu-btn',8],['[data-panel="credits"]',9]
  ];
  let previous=-1;
  for(const[selector,order]of expected){
    const normalized=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/"/g,'\\"');
    const pos=css.indexOf(selector);
    assert.ok(pos>previous,`${selector} fora da sequência CSS`);previous=pos;
    assert.match(css,new RegExp(`order:${order}!important`));
    assert.ok(normalized.length>0);
  }
});

test('ordenador observa o contêiner estável da Home, sobrevivendo à troca da grade',()=>{
  assert.match(js,/document\.getElementById\('home-main'\)/);
  assert.match(js,/mainObserver\.observe\(main,\{childList:true,subtree:true\}\)/);
  assert.doesNotMatch(js,/observe\(document\.body/);
  assert.match(js,/node\.style\.setProperty\('order',String\(index\+1\),'important'\)/);
  assert.match(js,/actions\.append\(\.\.\.ordered,\.\.\.unknown\)/);
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
