'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const legacy=read('public/js/notificationsUI.js'),domain=read('public/js/domains/notificationsUI.js');

test('arquivo-base de notificações não possui mais implementação runtime',()=>{
 assert.match(legacy,/status:'SUPERSEDED'/);
 assert.doesNotMatch(legacy,/const N=/);
 assert.doesNotMatch(legacy,/HomeScreen\.renderAccount=/);
 assert.doesNotMatch(legacy,/\/api\/notifications/);
});

test('domain owns botão, fetch, modal e badge',()=>{
 assert.doesNotThrow(()=>new Function(domain));
 assert.match(domain,/CartDomains\.claim\('notificationsUI'/);
 assert.match(domain,/AuthClient\.request\('\/api\/notifications'\)/);
 assert.match(domain,/notifications-menu-btn/);
 assert.match(domain,/notifications-overlay/);
 assert.match(domain,/notification-home-badge/);
 assert.match(domain,/window\.NotificationsUI=N/);
 assert.match(domain,/installAccountEntry\(\)/);
});

test('não-lidas permanecem pendentes até fechar o modal',()=>{
 assert.match(domain,/this\.__domainPendingRead=new Set/);
 assert.match(domain,/this\.saveRead\(before\)/);
 assert.match(domain,/if\(this\.__domainPendingRead\?\.size\)/);
 assert.match(domain,/this\.__domainPendingRead\.forEach\(id=>read\.add\(id\)\)/);
 assert.match(domain,/notifications-section-new/);
 assert.match(domain,/notification-new-pill/);
});
