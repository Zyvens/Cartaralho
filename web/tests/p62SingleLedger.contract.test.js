'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const marketUI=read('public/js/domains/marketplaceUI.js'),css=read('public/css/accountLedgerCurrent.css'),compat=read('public/css/p62.css'),index=read('public/index.html'),release=read('lib/releaseP62.js'),version=read('api/version.js');

test('owner canônico do Mercado compila e está executável',()=>{
 assert.doesNotThrow(()=>new Function(marketUI));
 assert.match(marketUI,/CartDomains\.claim\('marketplaceUI','domains\/marketplaceUI\.js'/);
 assert.match(index,/<script src="js\/domains\/marketplaceUI\.js\?v=domain-2"><\/script>/);
});

test('P62 não volta a misturar Estatísticas com economia',()=>{
 assert.doesNotMatch(marketUI,/renderStats|stripStatsEconomy|installStatsRenderer|p61-stats-ledger|p54-stats-ledger/);
 assert.doesNotMatch(css,/p61-stats-ledger|p54-stats-ledger|stats-economy|economy-history|economy-ledger/);
});

test('mostrador de moedas abre Mercado Paralelo diretamente no Extrato',()=>{
 assert.match(marketUI,/openLedger\(\)/);
 assert.match(marketUI,/MarketUI\.open\('ledger'\)/);
 assert.match(marketUI,/Abrir extrato de Moedas Sujas no Mercado Paralelo/);
 assert.match(marketUI,/p62-market-ledger-shortcut/);
 assert.match(css,/p62-market-ledger-shortcut:hover/);
 assert.match(css,/p62-market-ledger-shortcut:focus-visible/);
});

test('atalho do saldo também funciona por teclado',()=>{
 assert.match(marketUI,/slot\.setAttribute\('role','button'\)/);
 assert.match(marketUI,/slot\.setAttribute\('tabindex','0'\)/);
 assert.match(marketUI,/\['Enter',' '\]\.includes\(e\.key\)/);
});

test('P62 CSS não possui mais regra funcional e preserva sua posição por shim',()=>{
 assert.match(compat,/COMPAT P62/);
 assert.match(compat,/@import url\('\.\/accountLedgerCurrent\.css'\)/);
 assert.doesNotMatch(compat,/p62-market-ledger-shortcut\s*\{/);
 assert.match(index,/<link rel="stylesheet" href="css\/p62\.css\?v=1\.4\.71">/);
});

test('P62 JS é apenas proveniência histórica e P75 é corrente',()=>{
 assert.match(index,/<script type="application\/x-cartaralho-legacy" src="js\/p62\.js\?v=1\.4\.71"><\/script>/);
 assert.match(release,/APP_VERSION='v1\.4\.62'/);
 assert.match(version,/releaseP75/);
});
