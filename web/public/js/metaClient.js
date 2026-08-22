'use strict';
const MetaClient={
 get:p=>AuthClient.request(p),
 post:(p,b)=>AuthClient.request(p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b||{})}),
 metagame(){return this.get('/api/profile/metagame');},
 missions(){return this.get('/api/profile/missions');},
 equip(titleKey,frameKey){return this.post('/api/profile/equip',{titleKey,frameKey});},
 hall(){return this.get('/api/profile/hall-shame');},
 replay(code){return this.get('/api/profile/replay?code='+encodeURIComponent(code));},
 groups(){return this.get('/api/social/groups');},
 group(id){return this.get('/api/social/group?groupId='+encodeURIComponent(id));},
 createGroup(name){return this.post('/api/social/groups',{action:'create',name});},
 joinGroup(code){return this.post('/api/social/groups',{action:'join',code});},
 react(code,emoji){return this.post('/api/game/react',{code,emoji});},
 spectate(code){return this.get('/api/rooms/spectate?code='+encodeURIComponent(code));},
 friends(){return this.get('/api/social/friends');}
};
window.MetaClient=MetaClient;
