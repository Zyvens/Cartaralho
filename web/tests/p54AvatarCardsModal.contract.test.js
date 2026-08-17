'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p54.css'),js=read('public/js/p54.js'),index=read('public/index.html'),release=read('lib/releaseP54.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P54 compila e é a última camada carregada',()=>{
 assert.doesNotThrow(()=>new Function(js));
 assert.ok(index.indexOf('css/p54.css?v=1.4.54')>index.indexOf('css/p53.css?v=1.4.53'));
 assert.ok(index.indexOf('js/p54.js?v=1.4.54')>index.indexOf('js/p53.js?v=1.4.53'));
});

test('avatar com moldura remove a borda cinza legada da foto',()=>{
 assert.match(css,/avatar-frame\.public-avatar-frame>\.user-avatar/);
 assert.match(css,/border:0!important/);
 assert.match(css,/background:transparent!important/);
});

test('Perfil preserva o diâmetro da foto e deixa o padding da moldura crescer para fora',()=>{
 assert.match(css,/profile-modal-avatar\[class\*="frame-"\][\s\S]*box-sizing:content-box!important/);
});

test('grid de Molduras desfaz paint containment e camada GPU que piscavam no iOS',()=>{
 assert.match(css,/profile-modal-frame-item[\s\S]*contain:layout!important/);
 assert.doesNotMatch(css,/contain:layout paint!important/);
 assert.match(css,/avatar-frame img[\s\S]*transform:none!important/);
 assert.doesNotMatch(css,/translateZ\(0\)/);
 assert.match(css,/genese-atom-track[\s\S]*animation:none!important/);
});

test('Minhas Cartas monta criação no renderer profissional realmente usado pelo modal',()=>{
 assert.match(js,/ProfessionalUI\.renderCards=async function/);
 assert.match(js,/cards-library/);
 assert.match(js,/cards-library-toolbar/);
 assert.match(js,/p54-create-card-entry/);
 assert.match(js,/Criar nova Carta de Jogador/);
 assert.match(js,/root\.insertBefore\(btn,anchor\)/);
 assert.match(js,/CartP48\?\.openLibraryCreator/);
});

test('Estatística traz movimentações junto do primeiro render e fechadas por padrão',()=>{
 assert.match(js,/AuthClient\.stats=async function/);
 assert.match(js,/latestStatsPayload=data/);
 assert.match(js,/HomeScreen\.renderStats=async function/);
 assert.match(js,/mountStatsLedger\(panel,latestStatsPayload\)/);
 assert.match(js,/<details class="p54-stats-ledger">/);
 assert.doesNotMatch(js,/<details class="p54-stats-ledger" open/);
});

test('Extrato nunca expõe transaction_type cru e usa descrições humanas',()=>{
 assert.match(js,/starter_grant:'Bônus inicial recebido'/);
 assert.match(js,/mission_reward:'Missão concluída'/);
 assert.match(js,/card_recycling:'Reciclagem de cartas'/);
 assert.match(js,/TRANSACTION_COPY\[type\]\|\|'Movimentação de moedas'/);
 assert.doesNotMatch(js,/\$\{[^}]*transaction_type[^}]*\}/);
});

test('P54 publica v1.4.54 e preserva P53 na Central',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.54'/);
 assert.match(version,/releaseP54/);
 assert.match(notifications,/releaseP54/);
 assert.match(notifications,/P53_RELEASE/);
});
