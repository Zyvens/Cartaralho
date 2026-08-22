'use strict';
const APP_VERSION='v1.4.77';
const RELEASE={id:'release:p77',type:'update',icon:'🪙',title:'P77 — carteira ligada aos owners reais da Home',description:'Corrige a regressão em que o owner da carteira procurava AuthClient, HomeScreen, ProfessionalUI e SocketClient em window, embora esses componentes sejam bindings lexicais globais. O mostrador volta a nascer com a tag da conta e recompensas do Megafone permanecem sincronizadas em tempo real.',version:APP_VERSION,publishedAt:'2026-08-22T01:50:00.000Z'};
module.exports={APP_VERSION,RELEASE};
