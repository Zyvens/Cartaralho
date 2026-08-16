'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/genesisFrameP29.js'),css=read('public/css/p29.css'),p17=read('public/css/p17.css'),index=read('public/index.html'),notifications=read('lib/appNotifications.js');

test('Gênese usa a mesma estrela visual da progressão Platina',()=>{
  assert.match(p17,/frame-platinum::after[\s\S]*content:'✦'/);
  assert.match(p17,/frame-platinum\{--p17-spark:#dffcff;--p17-glow:rgba\(139,234,255,\.98\)\}/);
  assert.match(js,/const STAR='✦'/);
  assert.match(js,/particle\.textContent=STAR/);
  assert.match(css,/genese-atom-particle\{[\s\S]*color:#dffcff/);
  assert.match(css,/text-shadow:0 0 5px #fff,0 0 10px rgba\(139,234,255,\.98\),0 0 18px rgba\(139,234,255,\.98\)/);
});

test('partícula deixou de ser bolinha radial e virou estrela tipográfica',()=>{
  const block=css.match(/\.avatar-frame\.frame-genese-celestial>\.genese-atom-track>\.genese-atom-particle\{([\s\S]*?)\n\}/)?.[1]||'';
  assert.match(block,/background:none/);
  assert.match(block,/border-radius:0/);
  assert.match(block,/font-size:\.84em/);
  assert.doesNotMatch(block,/radial-gradient/);
});

test('estrela percorre a elipse, pulsa e gira enquanto o plano orbital também gira',()=>{
  assert.match(css,/animation:p29GenesisOrbitPlane 8\.4s linear infinite/);
  assert.match(css,/animation:p30GenesisPlatinumStar 4\.6s linear infinite/);
  assert.match(css,/0%\{left:100%;top:50%;opacity:\.48;transform:translate\(-50%,-50%\) scale\(\.68\) rotate\(0deg\)/);
  assert.match(css,/25%\{left:50%;top:0%;opacity:1;transform:translate\(-50%,-50%\) scale\(1\.28\) rotate\(90deg\)/);
  assert.match(css,/50%\{left:0%;top:50%;opacity:\.48;transform:translate\(-50%,-50%\) scale\(\.68\) rotate\(180deg\)/);
  assert.match(css,/75%\{left:50%;top:100%;opacity:1;transform:translate\(-50%,-50%\) scale\(1\.28\) rotate\(270deg\)/);
});

test('foto e arco Celestial continuam independentes da estrela orbital',()=>{
  assert.match(read('public/css/p26.css'),/frame-genese-celestial>img[\s\S]*filter:none!important/);
  assert.match(read('public/css/p26.css'),/animation:p26GenesisRing 7\.2s linear infinite/);
  assert.match(css,/genese-atom-track/);
});

test('cache-bust e Central publicam P30',()=>{
  assert.match(index,/css\/p29\.css\?v=1\.4\.30/);
  assert.match(index,/js\/genesisFrameP29\.js\?v=1\.4\.30/);
  assert.match(notifications,/APP_VERSION='v1\.4\.30'/);
  assert.match(notifications,/release:p30/);
  assert.match(notifications,/Estrela orbital da Gênese/);
});
