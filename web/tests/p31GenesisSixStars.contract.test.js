'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/genesisFrameP29.js'),css=read('public/css/p29.css'),index=read('public/index.html'),notifications=read('lib/appNotifications.js');

test('Gênese renderiza exatamente seis estrelas orbitais',()=>{
  assert.match(js,/const STAR_COUNT=6/);
  assert.match(js,/for\(let index=0;index<STAR_COUNT;index\+=1\)/);
  assert.match(js,/particle\.className='genese-atom-particle genese-atom-star'/);
  assert.match(js,/track\.appendChild\(particle\)/);
  assert.match(js,/window\.GenesisFrameP29=\{decorate,mount,syncStars,STAR,STAR_COUNT\}/);
});

test('seis estrelas ficam equidistantes por fases de um sexto do ciclo',()=>{
  assert.match(css,/nth-child\(1\)\{animation-delay:0s\}/);
  assert.match(css,/nth-child\(2\)\{animation-delay:-\.766667s\}/);
  assert.match(css,/nth-child\(3\)\{animation-delay:-1\.533333s\}/);
  assert.match(css,/nth-child\(4\)\{animation-delay:-2\.3s\}/);
  assert.match(css,/nth-child\(5\)\{animation-delay:-3\.066667s\}/);
  assert.match(css,/nth-child\(6\)\{animation-delay:-3\.833333s\}/);
  assert.match(css,/animation:p30GenesisPlatinumStar 4\.6s linear infinite/);
});

test('elipse continua girando como guia mas fica visualmente invisível',()=>{
  const block=css.match(/\.avatar-frame\.frame-genese-celestial>\.genese-atom-track\{([\s\S]*?)\n\}/)?.[1]||'';
  assert.match(block,/width:145%/);
  assert.match(block,/height:112%/);
  assert.match(block,/border:0!important/);
  assert.match(block,/background:transparent!important/);
  assert.match(block,/box-shadow:none!important/);
  assert.match(block,/filter:none!important/);
  assert.match(block,/animation:p29GenesisOrbitPlane 8\.4s linear infinite/);
});

test('Gênese não desenha segunda borda estrutural sobre o arco Celestial',()=>{
  const block=css.match(/\.avatar-frame\.frame-genese-celestial\{([\s\S]*?)\n\}/)?.[1]||'';
  assert.match(block,/border:0!important/);
  assert.match(block,/outline:0!important/);
  assert.match(block,/background:transparent!important/);
  assert.doesNotMatch(block,/0 0 0 1px/);
  assert.match(css,/@keyframes p31GenesisBreath/);
});

test('P31 usa cache-bust novo e fica registrado na Central',()=>{
  assert.match(index,/css\/p29\.css\?v=1\.4\.31/);
  assert.match(index,/js\/genesisFrameP29\.js\?v=1\.4\.31/);
  assert.match(notifications,/APP_VERSION='v1\.4\.31'/);
  assert.match(notifications,/release:p31/);
  assert.match(notifications,/Seis estrelas orbitais da Gênese/);
});
