'use strict';
(()=>{
 if(window.CartSocialFoundationDomain)return;
 CartDomains.claim('socialFoundationUI','domains/socialFoundationUI.js',()=>{
  const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
  const SocialUI={
   async render(host,tab='friends'){
    host.innerHTML=`<div class="social-tabs"><button class="social-tab ${tab==='friends'?'active':''}" data-social-tab="friends">👥 Amigos</button><button class="social-tab ${tab==='groups'?'active':''}" data-social-tab="groups">🫂 Turmas</button></div><div id="social-content" class="social-content"><div class="app-panel-loading"><span></span><b>Carregando...</b></div></div>`;
    host.querySelectorAll('[data-social-tab]').forEach(b=>b.onclick=()=>this.render(host,b.dataset.socialTab));
    if(tab==='friends')await this.renderFriends(host.querySelector('#social-content'));else await this.renderGroups(host.querySelector('#social-content'));
   },
   async data(){return MetaClient.get('/api/social/friends');},
   async action(action,payload={}){return MetaClient.post('/api/social/friends',{action,...payload});},
   avatar(u,size=42){return HomeScreen.avatar(u.avatar_data,size);},
   async renderFriends(root){
    const d=await this.data();
    root.innerHTML=`<section class="friends-add-card"><div><span class="app-panel-eyebrow">ADICIONAR AMIZADE</span><h3>Conhece o @ da pessoa?</h3><p>Envie um pedido pelo usuário da conta. Apelidos de partida não valem aqui.</p></div><div class="friends-add-row"><input id="friend-username" class="input" placeholder="@usuario"><button id="friend-add" class="btn btn-primary">Adicionar</button></div></section>${d.incoming?.length?`<section class="social-section"><div class="social-section-title"><h3>Pedidos recebidos</h3><span>${d.incoming.length}</span></div><div class="social-list">${d.incoming.map(x=>this.personRow(x,'incoming')).join('')}</div></section>`:''}${d.outgoing?.length?`<section class="social-section"><div class="social-section-title"><h3>Pedidos enviados</h3><span>${d.outgoing.length}</span></div><div class="social-list">${d.outgoing.map(x=>this.personRow(x,'outgoing')).join('')}</div></section>`:''}<section class="social-section"><div class="social-section-title"><h3>Seus amigos</h3><span>${d.friends?.length||0}</span></div><div class="social-list">${d.friends?.map(x=>this.personRow(x,'friend')).join('')||'<div class="app-panel-empty"><b>Ninguém ainda.</b><p>Talvez seja um sinal. Ou só falta mandar o primeiro pedido.</p></div>'}</div></section>`;
    root.querySelector('#friend-add').onclick=async()=>{const username=root.querySelector('#friend-username').value.trim();if(!username)return;try{const r=await this.action('request',{username});Toast.success(r.message||'Pedido enviado.');await this.renderFriends(root);}catch(e){Toast.error(e.message);}};
    root.querySelectorAll('[data-friend-action]').forEach(b=>b.onclick=async()=>{const[action,id]=b.dataset.friendAction.split(':');try{await this.action(action,{friendshipId:Number(id)});Toast.success(action==='accept'?'Amizade aceita.':action==='remove'?'Amizade removida.':'Pedido removido.');await this.renderFriends(root);}catch(e){Toast.error(e.message);}});
    root.querySelectorAll('[data-public-user]').forEach(b=>b.onclick=()=>HomeScreen.renderPublicProfile(window.AppPanelModal?.host||root,b.dataset.publicUser));
   },
   personRow(x,type){const buttons=type==='incoming'?`<button class="btn btn-primary btn-sm" data-friend-action="accept:${x.id}">Aceitar</button><button class="btn btn-secondary btn-sm" data-friend-action="decline:${x.id}">Recusar</button>`:type==='friend'?`<button class="btn btn-secondary btn-sm" data-public-user="${x.user_id}">Perfil</button><button class="social-icon-button" title="Remover amizade" data-friend-action="remove:${x.id}">×</button>`:'<span class="social-pending">Pendente</span>';return `<article class="social-person">${this.avatar(x)}<button class="social-person-name" data-public-user="${x.user_id}"><b>${esc(x.display_name)}</b><small>@${esc(x.username)}</small></button><div class="social-person-actions">${buttons}</div></article>`;},
   async renderGroups(root){
    const d=await MetaClient.groups();
    root.innerHTML=`<section class="friends-add-card"><div><span class="app-panel-eyebrow">TURMAS PRIVADAS</span><h3>O seu grupo, o seu caos</h3><p>Crie uma turma ou entre com um código para manter ranking e histórico entre amigos.</p></div><div class="group-actions"><button id="group-create" class="btn btn-primary">Criar turma</button><button id="group-join" class="btn btn-secondary">Entrar por código</button></div></section><section class="social-section"><div class="social-section-title"><h3>Suas turmas</h3><span>${d.groups?.length||0}</span></div><div class="group-grid">${d.groups?.map(g=>`<button class="group-card" data-group-id="${g.id}"><span>🫂</span><div><b>${esc(g.name)}</b><small>${g.member_count} membros · ${esc(g.invite_code)}</small></div><em>›</em></button>`).join('')||'<div class="app-panel-empty"><b>Nenhuma turma ainda.</b><p>Crie uma ou entre pelo código de alguém.</p></div>'}</div></section>`;
    root.querySelector('#group-create').onclick=async()=>{const name=await Modal.prompt('Nova turma','Nome da turma:');if(!name)return;try{const x=await MetaClient.createGroup(name);Toast.success(`Turma criada. Código: ${x.group.invite_code}`);await this.renderGroups(root);}catch(e){Toast.error(e.message);}};
    root.querySelector('#group-join').onclick=async()=>{const code=await Modal.prompt('Entrar na turma','Código privado:');if(!code)return;try{await MetaClient.joinGroup(code);Toast.success('Bem-vindo à turma.');await this.renderGroups(root);}catch(e){Toast.error(e.message);}};
    root.querySelectorAll('[data-group-id]').forEach(x=>x.onclick=async()=>{const host=window.AppPanelModal?.host||root;await MetaUI.renderFriendGroup(host,x.dataset.groupId);window.AppPanelModal?.normalize?.();});
   }
  };
  window.SocialUI=SocialUI;
  window.CartSocialFoundationDomain={SocialUI};
 });
})();
