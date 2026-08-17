'use strict';
(()=>{
 if(window.CartP48Friends)return;
 const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
 const api={
  list:()=>AuthClient.request('/api/social/friends'),
  post:body=>AuthClient.request('/api/social/friends',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),
  heartbeat:()=>AuthClient.request('/api/social/presence',{method:'POST'})
 };
 const F={timer:null,lastList:null,
  statusDot(online){return`<span class="p48-presence-dot ${online?'online':'offline'}" aria-hidden="true"></span>`;},
  async beat(){if(!AuthClient.user||document.hidden)return;try{await api.heartbeat();}catch(_){ }},
  async updateHomePill(force=false){
   if(!AuthClient.user)return;const btn=document.getElementById('friends-menu-btn');if(!btn)return;
   try{const d=force||!this.lastList?await api.list():this.lastList;this.lastList=d;let pill=btn.querySelector('.p48-friends-online-pill');if(!pill){pill=document.createElement('span');pill.className='p48-friends-online-pill';btn.appendChild(pill);}const n=Number(d.onlineCount||0);pill.textContent=String(n);pill.title=n===1?'1 amigo online':`${n} amigos online`;pill.setAttribute('aria-label',pill.title);btn.classList.toggle('has-friends-online',n>0);}catch(_){ }
  },
  friendRow(f){return`<button class="p48-friend-row" data-user-id="${f.user_id}"><span class="p48-friend-avatar-wrap">${HomeScreen.avatar(f.avatar_data,42)}${this.statusDot(!!f.online)}</span><span class="p48-friend-copy"><b>${esc(f.display_name)}</b><small>@${esc(f.username)} · ${f.online?'Online':'Offline'}</small></span></button>`;},
  async render(panel){
   const[d,groups]=await Promise.all([api.list(),MetaClient.groups().catch(()=>({groups:[]}))]);this.lastList=d;
   const friends=d.friends||[],incoming=d.incoming||[],outgoing=d.outgoing||[];
   panel.innerHTML=`<div class="home-form profile-panel p48-friends-panel"><button class="panel-close">✕</button><div class="p48-friends-head"><div><h3>🤝 Amigos de Merda</h3><p class="text-muted">${Number(d.onlineCount||0)} online agora · ${friends.length} amigo${friends.length===1?'':'s'}</p></div></div><div class="p48-friend-request-box"><div class="input-group"><input id="p48-friend-user" class="input" placeholder="@usuario"></div><button id="p48-add-friend" class="btn btn-primary">Adicionar amigo</button></div>${incoming.length?`<div class="meta-section"><h4>Pedidos recebidos <span class="notification-new-pill">${incoming.length}</span></h4>${incoming.map(x=>`<div class="p48-friend-request"><span>${HomeScreen.avatar(x.avatar_data,36)}</span><span><b>${esc(x.display_name)}</b><small>@${esc(x.username)}</small></span><button class="btn btn-primary btn-sm" data-accept="${x.id}">Aceitar</button><button class="btn btn-secondary btn-sm" data-decline="${x.id}">Recusar</button></div>`).join('')}</div>`:''}<div class="meta-section"><div class="p48-friends-section-head"><h4>Seus amigos</h4><span class="p48-online-legend">${this.statusDot(true)} online · ${this.statusDot(false)} offline</span></div><div class="p48-friend-list">${friends.map(f=>this.friendRow(f)).join('')||'<p>Você ainda não adicionou nenhum amigo.</p>'}</div></div>${outgoing.length?`<div class="meta-section"><h4>Pedidos enviados</h4>${outgoing.map(x=>`<div class="p48-friend-request muted"><span>${HomeScreen.avatar(x.avatar_data,34)}</span><span><b>${esc(x.display_name)}</b><small>@${esc(x.username)} · aguardando</small></span></div>`).join('')}</div>`:''}<details class="p48-friend-groups"><summary>Turmas privadas <span>${(groups.groups||[]).length}</span></summary><div class="meta-actions-row"><button id="create-friend-group" class="btn btn-primary">Criar turma</button><button id="join-friend-group" class="btn btn-secondary">Entrar por código</button></div><div class="meta-section">${(groups.groups||[]).map(g=>`<div class="friend-card" data-group-id="${g.id}"><b>${esc(g.name)}</b><small style="display:block">${g.member_count} membros · código <span class="friend-code">${esc(g.invite_code)}</span></small></div>`).join('')||'<p>Você ainda não participa de nenhuma turma.</p>'}</div></details></div>`;
   panel.querySelector('.panel-close').onclick=()=>panel.innerHTML='';
   document.getElementById('p48-add-friend').onclick=async()=>{const username=document.getElementById('p48-friend-user').value.trim();if(!username)return Toast.warning('Digite o usuário da pessoa.');try{const r=await api.post({action:'request',username});Toast.success(r.message||'Pedido enviado.');await this.render(panel);this.updateHomePill(true);}catch(e){Toast.error(e.message);}};
   panel.querySelectorAll('[data-accept]').forEach(b=>b.onclick=async()=>{try{await api.post({action:'accept',friendshipId:b.dataset.accept});Toast.success('Amizade aceita.');await this.render(panel);this.updateHomePill(true);}catch(e){Toast.error(e.message);}});
   panel.querySelectorAll('[data-decline]').forEach(b=>b.onclick=async()=>{try{await api.post({action:'decline',friendshipId:b.dataset.decline});await this.render(panel);}catch(e){Toast.error(e.message);}});
   panel.querySelectorAll('.p48-friend-row').forEach(b=>b.onclick=()=>HomeScreen.renderPublicProfile(panel,b.dataset.userId));
   document.getElementById('create-friend-group')?.addEventListener('click',async()=>{const name=await Modal.prompt('Nova turma','Nome da turma:');if(!name)return;try{const x=await MetaClient.createGroup(name);Toast.success(`Turma criada. Código: ${x.group.invite_code}`);await this.render(panel);}catch(e){Toast.error(e.message);}});
   document.getElementById('join-friend-group')?.addEventListener('click',async()=>{const code=await Modal.prompt('Entrar na turma','Código privado:');if(!code)return;try{await MetaClient.joinGroup(code);Toast.success('Bem-vindo à turma.');await this.render(panel);}catch(e){Toast.error(e.message);}});
   panel.querySelectorAll('[data-group-id]').forEach(x=>x.onclick=()=>MetaUI.renderFriendGroup(panel,x.dataset.groupId));
   this.updateHomePill(false);
  },
  start(){this.beat();setTimeout(()=>this.updateHomePill(true),500);clearInterval(this.timer);this.timer=setInterval(()=>{this.beat();this.updateHomePill(true);},60000);}
 };
 window.CartP48Friends=F;
 if(window.MetaUI)MetaUI.renderFriends=panel=>F.render(panel);
 if(window.HomeScreen){const base=HomeScreen.renderAccount.bind(HomeScreen);HomeScreen.renderAccount=function(...args){const out=base(...args);setTimeout(()=>F.updateHomePill(true),80);return out;};}
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){F.beat();F.updateHomePill(true);}});
 window.addEventListener('focus',()=>{F.beat();F.updateHomePill(true);});
 window.addEventListener('load',()=>F.start(),{once:true});
 F.start();
})();
