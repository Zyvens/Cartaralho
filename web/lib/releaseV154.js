'use strict';
const APP_VERSION='v1.5.4';
const RELEASE={
 id:'release:v1.5.4',
 type:'update',
 icon:'🛡️',
 title:'v1.5.4 — integridade multiplayer e reconexão',
 description:'Hotfix de estabilidade e segurança: ações de partida passam a usar exclusivamente a identidade da sessão autenticada; avanço de rodada é coordenado pelo Mestre com fallback do criador; sessão não é descartada por falhas transitórias de rede; realtime ganha retry de bootstrap; e os assets críticos recebem cache-bust explícito.',
 version:APP_VERSION,
 publishedAt:'2026-08-30T04:45:00.000Z'
};
module.exports={APP_VERSION,RELEASE};
