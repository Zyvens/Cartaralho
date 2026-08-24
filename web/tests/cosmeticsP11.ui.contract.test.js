'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const cosmetic=read('public/js/cosmeticUI.js'),prestige=read('public/js/prestigeUI.js'),identity=read('public/js/domains/identityUI.js'),css=read('public/css/prestigeP11.css'),html=read('public/index.html');

test('aba Cosméticos fica visível com preview mesmo antes do nível 5',()=>{assert.match(cosmetic,/data-market-tab=['"]cosmetics['"]/);assert.match(cosmetic,/Disponível no nível/);assert.match(cosmetic,/As prévias já estão liberadas/);assert.match(cosmetic,/cosmetic-preview-frame/);assert.match(cosmetic,/cosmetic-preview-title/);});

test('achievement e entitlements especiais são explicitamente separados da loja',()=>{assert.match(cosmetic,/Achievement não está à venda/);assert.match(cosmetic,/O Criador/);assert.match(cosmetic,/Betinha/);assert.match(cosmetic,/nunca aparecem à venda/);});

test('P11 não introduz MutationObserver amplo novo no legado',()=>{assert.doesNotMatch(cosmetic,/MutationObserver/);assert.doesNotMatch(prestige,/MutationObserver/);});

test('owner de identidade preserva nomes e raridades dos títulos P11',()=>{for(const key of['cliente-preferencial','lavador-de-moedinhas','patrocinador-do-caos','dinheiro-nao-compra-talento','herdeiro-do-cartaralho','patrimonio-inexplicavel','o-criador','betinha'])assert.ok(identity.includes(`'${key}'`),key);assert.match(identity,/MetaTitleNames/);assert.match(identity,/MetaTitleRarities/);assert.match(identity,/decorateTitles/);assert.match(identity,/title-rarity-/);});

test('Celestial tem efeito sutil, mobile-safe e respeita reduced motion',()=>{assert.match(css,/\.title-rarity-celestial/);assert.match(css,/background-clip:text/);assert.match(css,/@media\(max-width:680px\)/);assert.match(css,/text-overflow:ellipsis/);assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);});

test('as sete molduras cosméticas possuem render próprio',()=>{for(const key of['fita-isolante','ouro-de-pobre','neon-duvidoso','glitch-radioativo','buraco-negro','agiota','lavagem-completa'])assert.match(css,new RegExp(`frame-cosmetic-${key}`));});

test('assets P11 permanecem rastreáveis enquanto owners finais executam',()=>{assert.ok(html.indexOf('achievementsP10.css')<html.indexOf('prestigeP11.css'));assert.ok(html.includes('type="application/x-cartaralho-legacy" src="js/prestigeUI.js"')||html.includes('js/prestigeUI.js'));assert.ok(html.includes('js/domains/identityUI.js?v=domain-2'));assert.ok(html.includes('type="application/x-cartaralho-legacy" src="js/cosmeticUI.js"'));});
