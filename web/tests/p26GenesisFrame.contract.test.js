'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p26.css'),index=read('public/index.html'),notifications=read('lib/appNotifications.js');

test('P26 carrega depois das camadas antigas da Gênese',()=>{
  const old=index.indexOf('css/p18.css'),next=index.indexOf('css/p26.css?v=1.4.26');
  assert.ok(old>=0&&next>old);
});

test('Gênese usa borda média e preserva a cor da foto',()=>{
  assert.match(css,/frame-genese-celestial\{[\s\S]*padding:4px!important/);
  assert.match(css,/frame-genese-celestial>img[\s\S]*filter:none!important/);
});

test('anel celestial inteiro gira sem girar a foto',()=>{
  assert.match(css,/frame-genese-celestial::before[\s\S]*conic-gradient/);
  assert.match(css,/animation:p26GenesisRing 7\.2s linear infinite/);
  assert.match(css,/@keyframes p26GenesisRing\{to\{transform:rotate\(360deg\)\}\}/);
  assert.doesNotMatch(css,/frame-genese-celestial>img[\s\S]{0,180}animation:/);
});

test('glint usa órbita elíptica independente',()=>{
  assert.match(css,/frame-genese-celestial::after[\s\S]*inset:-8px -14px/);
  assert.match(css,/border-radius:50%/);
  assert.match(css,/radial-gradient\(circle at 100% 50%/);
  assert.match(css,/animation:p26GenesisOrbit 4\.9s linear infinite/);
  assert.match(css,/@keyframes p26GenesisOrbit/);
});

test('P26 aparece na Central de Notificações',()=>{
  assert.match(notifications,/APP_VERSION='v1\.4\.26'/);
  assert.match(notifications,/P26 — Gênese refinada/);
});
