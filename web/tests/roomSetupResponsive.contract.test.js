'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const share=read('public/js/domains/roomShareUI.js'),room=read('public/js/domains/roomUI.js'),css=read('public/css/roomSetupDashboardCurrent.css'),account=read('public/css/accountActionsCurrent.css');

test('link da sala usa o card inteiro como ação de copiar sem botão separado',()=>{
 assert.match(share,/direct-room-copy/);assert.match(share,/role','button'/);assert.match(share,/tabindex','0'/);assert.match(share,/direct-room-copy-hint/);assert.match(share,/clique para copiar/);assert.doesNotMatch(share,/id=\\?"copy-room-link/);
});
test('link direto não quebra nem usa ellipsis no owner responsivo',()=>{
 assert.match(css,/\.direct-room-link-line/);assert.match(css,/white-space:nowrap!important/);assert.match(css,/overflow-x:auto!important/);assert.match(css,/text-overflow:clip!important/);assert.doesNotMatch(css,/direct-room-link-line[^}]*text-overflow:ellipsis/);
});
test('dashboard desktop mantém configuração à esquerda e stack informativo à direita',()=>{
 assert.match(css,/grid-template-areas:'config summary' 'config estimate' 'config howto'/);assert.match(css,/gap:14px!important/);assert.match(css,/\.dashboard-config-card\{grid-area:config/);assert.match(css,/\.dashboard-summary-slot\{grid-area:summary/);assert.match(css,/\.dashboard-estimate-card\{grid-area:estimate/);assert.match(css,/\.how-to-play-card\{grid-area:howto/);
});
test('resumo e estimativa iniciam abertos e Como Jogar retraído',()=>{
 assert.match(room,/openCreateSummary\(\)/);assert.match(room,/estimate\.open=true/);assert.match(room,/how\.open=false/);assert.match(room,/CreateRoomScreen\.updateSummary=function/);
});
test('header mobile reserva espaço para voltar/missões e descrição separa do dashboard',()=>{
 assert.match(css,/\.create-room-screen>h2\{margin-top:82px!important/);assert.match(css,/@media\(max-width:760px\)/);assert.match(css,/\.create-room-screen>h2\{margin-top:104px!important/);assert.match(css,/margin-bottom:34px!important/);
});
test('Perfil e Sair têm centro geométrico explícito no desktop e mobile',()=>{
 assert.match(account,/place-self:center!important/);assert.match(account,/place-items:center!important/);assert.match(account,/width:44px!important/);assert.match(account,/height:44px!important/);assert.match(account,/padding:0!important/);
});
