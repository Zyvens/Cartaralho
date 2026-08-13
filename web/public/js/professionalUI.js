(()=>{
const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
const attr=v=>esc(v).replace(/"/g,'&quot;');

const PANEL_META={
  cards:{icon:'⭐',title:'Minhas Cartas',subtitle:'Sua coleção, favoritas, Cartas Nativas e cartas criadas pela comunidade.'},
  stats:{icon:'📊',title:'Estatísticas',subtitle:'Seu histórico de decisões questionáveis, em números.'},
  rank:{icon:'🏆',title:'Rank',subtitle:'Temporada, Hall da Vergonha e Hall da Fama.'},
  history:{icon:'📜',title:'Histórico',subtitle:'Revise partidas e abra o replay rodada a rodada.'},
  friends:{icon:'🤝',title:'Amigos de merda',subtitle:'Amizades, pedidos e turmas privadas.'}
};

const AppPanelModal={
  overlay:null,host:null,current:null,keyHandler:null,
  async open(kind){
    const meta=PANEL_META[kind];if(!meta)return;
    this.close();this.current=kind;
    const overlay=document.createElement('div');overlay.className='app-panel-overlay';
    overlay.innerHTML=`<section class="app-panel-shell" role="dialog" aria-modal="true" aria-label="${attr(meta.title)}"><header class="app-panel-header"><div class="app-panel-heading"><span class="app-panel-icon">${meta.icon}</span><div><span class="app-panel-eyebrow">CARTARALHO</span><h2>${esc(meta.title)}</h2><p>${esc(meta.subtitle)}</p></div></div><button class="app-panel-close" type="button" aria-label="Fechar">✕</button></header><main class="app-panel-body"><div class="app-panel-loading"><span></span><b>Carregando...</b></div></main></section>`;
    document.body.appendChild(overlay);document.body.classList.add('app-panel-open');this.overlay=overlay;this.host=overlay.querySelector('.app-panel-body');
    overlay.querySelector('.app-panel-close').onclick=()=>this.close();overlay.addEventListener('mousedown',e=>{if(e.target===overlay)this.close();});
    this.keyHandler=e=>{if(e.key==='Escape')this.close();};document.addEventListener('keydown',this.keyHandler);
    try{
      if(kind==='cards')await ProfessionalUI.renderCards(this.host);
      else if(kind==='stats')await HomeScreen.renderStats(this.host);
      else if(kind==='rank')await MetaUI.renderRank(this.host,'current','rank');
      else if(kind==='history')await HomeScreen.renderHistory(this.host);
      else if(kind==='friends')await SocialUI.render(this.host,'friends');
      this.normalize();
    }catch(e){this.host.innerHTML=`<div class="app-panel-empty"><b>Não deu certo.</b><p>${esc(e.message||'Erro ao abrir esta área.')}</p></div>`;}
  },
  normalize(){
    if(!this.host)return;this.host.querySelectorAll('.panel-close').forEach(x=>x.remove());
    this.host.querySelectorAll(':scope > .home-form.profile-panel').forEach(x=>x.classList.add('app-panel-legacy-content'));
  },
  close(){if(this.overlay)this.overlay.remove();this.overlay=null;this.host=null;this.current=null;if(this.keyHandler)document.removeEventListener('keydown',this.keyHandler);this.keyHandler=null;document.body.classList.remove('app-panel-open');}
};
window.AppPanelModal=AppPanelModal;

const RegistrationModal={
  open(){
    AppPanelModal.close();
    const overlay=document.createElement('div');overlay.className='app-panel-overlay';
    overlay.innerHTML=`<section class="register-modal-shell" role="dialog" aria-modal="true"><button class="app-panel-close register-close" type="button">✕</button><div class="register-brand"><span>🎭</span><div><small>NOVA CONTA</small><h2>Entre para o Cartaralho</h2><p>O usuário identifica sua conta. O nickname é seu nome padrão e ainda pode mudar em cada partida.</p></div></div><div class="register-grid"><label><span>Usuário</span><input id="reg-user" class="input" maxlength="24" autocomplete="username" placeholder="ex.: joaovictor"></label><label><span>Nickname padrão</span><input id="reg-nick" class="input" maxlength="24" placeholder="Como quer aparecer?"></label><label><span>Senha</span><input id="reg-pass" class="input" type="password" minlength="6" autocomplete="new-password" placeholder="Mínimo 6 caracteres"></label><label><span>Confirmar senha</span><input id="reg-pass2" class="input" type="password" minlength="6" autocomplete="new-password" placeholder="Repita a senha"></label><label class="register-email"><span>E-mail <em>opcional</em></span><input id="reg-email" class="input" type="email" autocomplete="email" placeholder="Para facilitar sua recuperação"></label></div><div class="register-actions"><button id="reg-cancel" class="btn btn-secondary">Cancelar</button><button id="reg-submit" class="btn btn-primary">Criar minha conta</button></div></section>`;
    document.body.appendChild(overlay);document.body.classList.add('app-panel-open');
    const close=()=>{overlay.remove();document.body.classList.remove('app-panel-open');};overlay.querySelector('.register-close').onclick=close;overlay.querySelector('#reg-cancel').onclick=close;overlay.addEventListener('mousedown',e=>{if(e.target===overlay)close();});
    overlay.querySelector('#reg-submit').onclick=async()=>{
      const username=overlay.querySelector('#reg-user').value.trim(),nickname=overlay.querySelector('#reg-nick').value.trim(),password=overlay.querySelector('#reg-pass').value,password2=overlay.querySelector('#reg-pass2').value,email=overlay.querySelector('#reg-email').value.trim();
      if(!username)return Toast.warning('Escolha um usuário para sua conta.');if(nickname.length<2)return Toast.warning('Escolha um nickname padrão.');if(password.length<6)return Toast.warning('A senha precisa ter pelo menos 6 caracteres.');if(password!==password2)return Toast.warning('As senhas não conferem.');
      const btn=overlay.querySelector('#reg-submit');btn.disabled=true;btn.textContent='Criando...';
      try{const d=await AuthClient.register(username,password,nickname,email||null);close();Modal.show({title:'Conta criada',message:`Guarde seu código de recuperação:<br><br><strong style="font-size:1.2rem;letter-spacing:.08em">${esc(d.recoveryCode)}</strong><br><br>Ele permite redefinir sua senha caso você perca o acesso.`,confirmText:'Guardei'});HomeScreen.renderAccount();}catch(e){Toast.error(e.message);btn.disabled=false;btn.textContent='Criar minha conta';}
    };
  }
};

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
    root.querySelectorAll('[data-public-user]').forEach(b=>b.onclick=()=>HomeScreen.renderPublicProfile(AppPanelModal.host,b.dataset.publicUser));
  },
  personRow(x,type){const buttons=type==='incoming'?`<button class="btn btn-primary btn-sm" data-friend-action="accept:${x.id}">Aceitar</button><button class="btn btn-secondary btn-sm" data-friend-action="decline:${x.id}">Recusar</button>`:type==='friend'?`<button class="btn btn-secondary btn-sm" data-public-user="${x.user_id}">Perfil</button><button class="social-icon-button" title="Remover amizade" data-friend-action="remove:${x.id}">×</button>`:'<span class="social-pending">Pendente</span>';
    return `<article class="social-person">${this.avatar(x)}<button class="social-person-name" data-public-user="${x.user_id}"><b>${esc(x.display_name)}</b><small>@${esc(x.username)}</small></button><div class="social-person-actions">${buttons}</div></article>`;},
  async renderGroups(root){const d=await MetaClient.groups();root.innerHTML=`<section class="friends-add-card"><div><span class="app-panel-eyebrow">TURMAS PRIVADAS</span><h3>O seu grupo, o seu caos</h3><p>Crie uma turma ou entre com um código para manter ranking e histórico entre amigos.</p></div><div class="group-actions"><button id="group-create" class="btn btn-primary">Criar turma</button><button id="group-join" class="btn btn-secondary">Entrar por código</button></div></section><section class="social-section"><div class="social-section-title"><h3>Suas turmas</h3><span>${d.groups?.length||0}</span></div><div class="group-grid">${d.groups?.map(g=>`<button class="group-card" data-group-id="${g.id}"><span>🫂</span><div><b>${esc(g.name)}</b><small>${g.member_count} membros · ${esc(g.invite_code)}</small></div><em>›</em></button>`).join('')||'<div class="app-panel-empty"><b>Nenhuma turma ainda.</b><p>Crie uma ou entre pelo código de alguém.</p></div>'}</div></section>`;
    root.querySelector('#group-create').onclick=async()=>{const name=await Modal.prompt('Nova turma','Nome da turma:');if(!name)return;try{const x=await MetaClient.createGroup(name);Toast.success(`Turma criada. Código: ${x.group.invite_code}`);await this.renderGroups(root);}catch(e){Toast.error(e.message);}};
    root.querySelector('#group-join').onclick=async()=>{const code=await Modal.prompt('Entrar na turma','Código privado:');if(!code)return;try{await MetaClient.joinGroup(code);Toast.success('Bem-vindo à turma.');await this.renderGroups(root);}catch(e){Toast.error(e.message);}};
    root.querySelectorAll('[data-group-id]').forEach(x=>x.onclick=async()=>{await MetaUI.renderFriendGroup(AppPanelModal.host,x.dataset.groupId);AppPanelModal.normalize();});
  }
};
window.SocialUI=SocialUI;

const ProfessionalUI={
  actionMeta:{cards:['⭐','Minhas Cartas','Coleção, nativas e favoritas'],stats:['📊','Estatísticas','Veja o estrago em números'],rank:['🏆','Rank','Temporada e halls'],history:['📜','Histórico','Partidas e replays'],friends:['🤝','Amigos de merda','Amizades e turmas'],credits:['🎬','Créditos','Quem começou essa ideia']},
  polishHome(){
    document.getElementById('home-admin-btn')?.remove();document.querySelector('[data-panel="profile"]')?.remove();
    const screen=document.querySelector('.home-screen');if(screen)screen.classList.add('professional-home');
    const content=document.querySelector('.home-content');if(content&&!content.querySelector('.home-ambient')){const a=document.createElement('div');a.className='home-ambient';a.innerHTML='<i></i><i></i>';content.prepend(a);}
    const mode=document.getElementById('mode-selection');if(mode){mode.classList.add('home-dashboard');const play=document.getElementById('btn-play');if(play&&!document.getElementById('home-play-copy')){const copy=document.createElement('div');copy.id='home-play-copy';copy.className='home-play-copy';copy.innerHTML='<span>PRONTO PARA COMEÇAR?</span><h2>Abra uma mesa e deixe o bom senso do lado de fora.</h2><p>Crie uma sala ou entre com o código dos seus amigos.</p>';mode.insertBefore(copy,play);}if(play){play.classList.add('home-play-cta');play.innerHTML='<span class="play-icon">🎴</span><span class="play-label"><b>JOGAR</b><small>Criar ou entrar em uma mesa</small></span><span class="play-arrow">→</span>';}}
    const actions=document.querySelector('.profile-actions');if(actions){actions.classList.add('home-action-grid');actions.querySelectorAll('[data-panel]').forEach(b=>{const k=b.dataset.panel,m=this.actionMeta[k];if(!m)return;b.classList.add('home-action-card');b.innerHTML=`<span class="home-action-icon">${m[0]}</span><span class="home-action-copy"><b>${m[1]}</b><small>${m[2]}</small></span><span class="home-action-arrow">›</span>`;});const friend=document.getElementById('friends-menu-btn');if(friend){friend.dataset.panel='friends';friend.classList.add('home-action-card');const m=this.actionMeta.friends;friend.innerHTML=`<span class="home-action-icon">${m[0]}</span><span class="home-action-copy"><b>${m[1]}</b><small>${m[2]}</small></span><span class="home-action-arrow">›</span>`;friend.onclick=()=>HomeScreen.openPanel('friends');}}
    const strip=document.querySelector('.account-strip');if(strip)strip.classList.add('home-account-bar');const profile=document.getElementById('profile-shortcut');if(profile){profile.innerHTML='👤 <span>Perfil</span>';profile.classList.add('home-header-button');}
    const logout=document.getElementById('logout-btn');if(logout){logout.innerHTML='↗ <span>Sair</span>';logout.classList.add('home-header-button');}
  },
  async renderCards(panel){
    const cards=(await AuthClient.cards()).filter(c=>c.owned!==false);let filter='all',query='';
    panel.innerHTML=`<div class="cards-library"><div class="cards-library-toolbar"><div class="cards-search-wrap"><span>⌕</span><input id="library-search" class="input" placeholder="Buscar na coleção..."></div><div class="cards-filter-tabs"><button data-card-filter="all" class="active">Todas</button><button data-card-filter="native">Nativas</button><button data-card-filter="player">De Jogadores</button><button data-card-filter="blackCards">Pretas</button><button data-card-filter="whiteCards">Brancas</button><button data-card-filter="favorites">Favoritas</button></div></div><div class="cards-library-summary"><span><b>${cards.length}</b> cartas na coleção</span><span><b>${cards.filter(c=>c.is_native).length}</b> nativas</span><span><b>${cards.filter(c=>c.is_player_card).length}</b> de jogadores</span></div><div id="library-grid" class="cards-library-grid"></div></div>`;
    const draw=()=>{const list=cards.filter(c=>{const q=!query||c.text.toLowerCase().includes(query);const f=filter==='all'||(filter==='native'&&c.is_native)||(filter==='player'&&c.is_player_card)||(filter==='favorites'&&c.is_favorite)||c.type===filter;return q&&f;});panel.querySelector('#library-grid').innerHTML=list.map(c=>`<article class="library-card tier-${c.materialTier} border-${c.borderTier}" data-card-id="${c.id}"><button class="favorite-card ${c.is_favorite?'on':''}" data-fav-id="${c.id}">${c.is_favorite?'★':'☆'}</button><div class="library-card-top"><span>${c.type==='blackCards'?'🖤':'🤍'}</span><div>${c.is_native?'<em class="card-origin-tag native">NATIVA</em>':c.is_player_card?'<em class="card-origin-tag player">DE JOGADOR</em>':'<em class="card-origin-tag legacy">COLEÇÃO</em>'}</div></div><b>${esc(c.text)}</b><small>${String(c.materialTier).toUpperCase()} · borda ${String(c.borderTier).toUpperCase()} · ${c.matches_used} partidas</small></article>`).join('')||'<div class="app-panel-empty"><b>Nenhuma carta encontrada.</b><p>Tente outro filtro ou termo de busca.</p></div>';panel.querySelectorAll('[data-fav-id]').forEach(btn=>btn.onclick=async e=>{e.stopPropagation();const c=cards.find(x=>String(x.id)===String(btn.dataset.favId));c.is_favorite=!c.is_favorite;await AuthClient.favoriteCard(c.id,c.is_favorite);draw();});panel.querySelectorAll('[data-card-id]').forEach(el=>el.onclick=()=>{const c=cards.find(x=>String(x.id)===String(el.dataset.cardId)),o=c.origin||{};Modal.show({title:c.text,message:`${c.is_native?'<b>🎴 Carta Nativa do Cartaralho</b><br><br>':''}<strong>Material: ${String(c.materialTier).toUpperCase()}</strong><br>${esc(c.rarityExplanation.material)}<br><br><strong>Contorno: ${String(c.borderTier).toUpperCase()}</strong><br>${esc(c.rarityExplanation.border)}<hr><strong>Origem</strong><br>${c.is_native?'Carta oficial/nativa do jogo.':`Criada originalmente por <b>${esc(o.creatorName||'desconhecido')}</b>.<br>Mesas visitadas: <b>${o.tablesVisited||0}</b> · Pessoas que possuem: <b>${o.holders||0}</b>`}`,confirmText:'Fechar'});});};
    panel.querySelector('#library-search').oninput=e=>{query=e.target.value.toLowerCase().trim();draw();};panel.querySelectorAll('[data-card-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.cardFilter;panel.querySelectorAll('[data-card-filter]').forEach(x=>x.classList.toggle('active',x===b));draw();});draw();
  }
};
window.ProfessionalUI=ProfessionalUI;

// Ajusta nomenclaturas sem alterar as chaves internas já persistidas.
if(window.ProfileModal){
  const frameNames={bronze:'Comum',silver:'Incomum',gold:'Rara',platinum:'Lendária'};
  const labels={common:'Comum',rare:'Incomum',superrare:'Raro',epic:'Épico',legendary:'Lendário'};
  const originalRender=ProfileModal.render.bind(ProfileModal);ProfileModal.render=function(){if(this.data){this.data.titles?.forEach(t=>{t.rarityInfo=t.rarityInfo||{};t.rarityInfo.label=labels[t.rarity]||t.rarityInfo.label;});this.data.frames?.forEach(f=>{f.rarityInfo=f.rarityInfo||{};f.rarityInfo.label=labels[f.rarity]||f.rarityInfo.label;if(frameNames[f.key])f.name=frameNames[f.key];});}return originalRender();};
  ProfileModal.rarityLegend=()=>'<span class="rarity-common">● Comum</span><span class="rarity-rare">● Incomum</span><span class="rarity-superrare">● Raro</span><span class="rarity-epic">● Épico</span><span class="rarity-legendary">● Lendário</span>';
}

MetaClient.friends=()=>MetaClient.get('/api/social/friends');
const legacyOpen=HomeScreen.openPanel.bind(HomeScreen);HomeScreen.openPanel=async kind=>{if(kind==='profile')return ProfileModal.open('profile');if(kind==='credits')return legacyOpen(kind);if(PANEL_META[kind])return AppPanelModal.open(kind);return legacyOpen(kind);};
HomeScreen.register=()=>RegistrationModal.open();
const oldCards=HomeScreen.renderCards?.bind(HomeScreen);HomeScreen.renderCards=panel=>ProfessionalUI.renderCards(panel);
const oldRenderAccount=HomeScreen.renderAccount.bind(HomeScreen);HomeScreen.renderAccount=function(){const r=oldRenderAccount();setTimeout(()=>ProfessionalUI.polishHome(),0);return r;};
const oldRender=HomeScreen.render.bind(HomeScreen);HomeScreen.render=async function(container){const r=await oldRender(container);ProfessionalUI.polishHome();return r;};
setTimeout(()=>ProfessionalUI.polishHome(),0);
})();
