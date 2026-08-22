'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const legacy=read('public/css/p42.css'),identityBase=read('public/css/accountIdentityBaseCurrent.css'),identityAlign=read('public/css/accountIdentityAlignmentCurrent.css'),topBase=read('public/css/topControlsBaseCurrent.css'),topNav=read('public/css/topNavigationCurrent.css'),topPixel=read('public/css/topControlsPixelCurrent.css'),index=read('public/index.html'),version=read('api/version.js');

test('P42 permanece apenas como proveniência histórica',()=>{
 assert.match(legacy,/^\/\* HISTORICAL P42/);
 assert.doesNotMatch(legacy,/\{[^*]/);
 assert.match(index,/css\/p42\.css\?v=1\.4\.42/);
 assert.match(version,/releaseP75/);
});

test('identidade da Home é owned pelas camadas atuais P49/P51',()=>{
 assert.match(identityBase,/\.home-account-bar \.home-account-identity\{/);
 assert.match(identityBase,/display:flex!important/);
 assert.match(identityBase,/margin-left:7px!important/);
 assert.match(identityBase,/\.home-account-bar \.home-account-identity>strong/);
 assert.match(identityAlign,/\.home-account-bar \.home-account-identity>span/);
 assert.match(identityAlign,/text-align:left!important/);
});

test('Voltar p42-home-back é integralmente controlado pela trajetória P45→P47',()=>{
 assert.match(topBase,/#back-play\.p42-home-back/);
 assert.match(topBase,/height:44px!important/);
 assert.match(topNav,/#back-play\.p42-home-back/);
 assert.match(topNav,/height:40px!important/);
 assert.match(topNav,/z-index:9600!important/);
 assert.match(topPixel,/#back-play\.p42-home-back/);
 assert.match(topPixel,/transform:none!important/);
 assert.match(topPixel,/translate:none!important/);
});
