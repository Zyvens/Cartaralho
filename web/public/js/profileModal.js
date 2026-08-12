(()=>{
const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
const attr=v=>esc(v).replace(/"/g,'&quot;');
const rarityLabel=r=>({common:'Comum',rare:'Raro',superrare:'Super Raro',epic:'Épico',legendary:'Lendário'}[r]||'Comum');

const ProfileModal={
  overlay:null,
  data:null,
  draftAvatar:null,
  activeTab:'profile',
  _keyHandler:null,

  async open(tab='profile'){
    if(!AuthClient.user)return;
    this.close();
    this.activeTab=tab;
    this.draftAvatar=AuthClient.user.avatar_data||null;
    document.getElementById('home-panel')?.replaceChildren();

    const overlay=document.createElement('div');
    overlay.className='profile-modal-overlay';
    overlay.innerHTML=`<div class="profile-modal-shell" role="dialog" aria-modal="true" aria-label="Configuração de perfil">
      <div class="profile-modal-loading"><span class="profile-modal-spinner"></span><b>Carregando seu perfil...</b></div>
    </div>`;
    document.body.appendChild(overlay);
    document.body.classList.add('profile-modal-open');
    this.overlay=overlay;
    overlay.addEventListener('mousedown',e=>{if(e.target===overlay)this.close();});
    this._keyHandler=e=>{if(e.key==='Escape')this.close();};
    document.addEventListener('keydown',this._keyHandler);

    try{
      this.data=await MetaClient.metagame();
      this.render();
    }catch(e){
      this.close();
      Toast.error(e.message||'Não foi possível abrir o perfil.');
    }
  },

  close(){
    if(this.overlay){this.overlay.remove();this.overlay=null;}
    if(this._keyHandler){document.removeEventListener('keydown',this._keyHandler);this._keyHandler=null;}
    document.body.classList.remove('profile-modal-open');
  },

  avatar(src,size=74,frameKey=null){
    const body=src?`<img src="${attr(src)}" alt="">`:`<span class="profile-modal-avatar-fallback">🎭</span>`;
    return `<span class="profile-modal-avatar avatar-frame${frameKey?` frame-${attr(frameKey)}`:''}" style="--avatar-size:${size}px">${body}</span>`;
  },

  render(){
    if(!this.overlay||!this.data)return;
    const u=AuthClient.user,d=this.data;
    const unlockedTitles=d.titles.filter(x=>x.unlocked).length;
    const unlockedFrames=d.frames.filter(x=>x.unlocked).length;
    const currentTitle=d.titles.find(x=>x.key===d.equipped.titleKey);
    const shell=this.overlay.querySelector('.profile-modal-shell');
    shell.innerHTML=`
      <header class="profile-modal-header">
        <div class="profile-modal-identity">
          ${this.avatar(this.draftAvatar,76,d.equipped.frameKey)}
          <div class="profile-modal-who">
            <span class="profile-modal-eyebrow">CONFIGURAÇÃO DE PERFIL</span>
            <h2>${esc(u.display_name)}</h2>
            <div class="profile-modal-handle">@${esc(u.username)}${currentTitle?` <span class="profile-modal-title rarity-${esc(currentTitle.rarity)}">${esc(currentTitle.icon)} ${esc(currentTitle.name)}</span>`:''}</div>
          </div>
        </div>
        <div class="profile-modal-level">
          <span>NÍVEL ${d.level}</span>
          <b>${d.xp} XP</b>
          <div class="profile-modal-mini-xp"><i style="width:${Math.min(100,(d.xp%1000)/10)}%"></i></div>
        </div>
        <button class="profile-modal-close" type="button" aria-label="Fechar">✕</button>
      </header>

      <nav class="profile-modal-tabs" aria-label="Seções do perfil">
        ${this.tabButton('profile','👤','Perfil')}
        ${this.tabButton('titles','🏷️','Títulos',`${unlockedTitles}/${d.titles.length}`)}
        ${this.tabButton('frames','◉','Molduras',`${unlockedFrames}/${d.frames.length}`)}
        ${this.tabButton('progress','✦','Progressão',`Nv. ${d.level}`)}
      </nav>

      <main class="profile-modal-body" id="profile-modal-body"></main>`;

    shell.querySelector('.profile-modal-close').onclick=()=>this.close();
    shell.querySelectorAll('[data-profile-tab]').forEach(b=>b.onclick=()=>{
      this.activeTab=b.dataset.profileTab;
      shell.querySelectorAll('[data-profile-tab]').forEach(x=>x.classList.toggle('active',x===b));
      this.renderTab();
    });
    this.renderTab();
  },

  tabButton(key,icon,label,count=''){
    return `<button type="button" class="profile-modal-tab ${this.activeTab===key?'active':''}" data-profile-tab="${key}"><span>${icon}</span><b>${label}</b>${count?`<em>${esc(count)}</em>`:''}</button>`;
  },

  renderTab(){
    const body=this.overlay?.querySelector('#profile-modal-body');
    if(!body)return;
    if(this.activeTab==='profile')this.renderProfile(body);
    if(this.activeTab==='titles')this.renderTitles(body);
    if(this.activeTab==='frames')this.renderFrames(body);
    if(this.activeTab==='progress')this.renderProgress(body);
    body.scrollTop=0;
  },

  renderProfile(body){
    const u=AuthClient.user;
    body.innerHTML=`<section class="profile-tab-layout profile-tab-layout-profile">
      <div class="profile-modal-card profile-modal-avatar-editor-card">
        <div class="profile-modal-section-heading"><div><span>IDENTIDADE</span><h3>Foto e aparência básica</h3></div></div>
        <div class="profile-modal-avatar-editor">
          <div id="profile-modal-avatar-preview">${this.avatar(this.draftAvatar,116,this.data.equipped.frameKey)}</div>
          <div>
            <label class="btn btn-secondary profile-modal-upload">Trocar foto<input id="profile-modal-avatar-file" type="file" accept="image/*" hidden></label>
            <button id="profile-modal-avatar-remove" class="btn btn-secondary" type="button">Remover foto</button>
            <small>A foto é comprimida para 256×256. A moldura equipada é preservada.</small>
          </div>
        </div>
      </div>

      <div class="profile-modal-card profile-modal-fields-card">
        <div class="profile-modal-section-heading"><div><span>DADOS PÚBLICOS</span><h3>Como você aparece no Cartaralho</h3></div></div>
        <div class="profile-modal-form-grid">
          <label><span>Nome padrão</span><input id="profile-modal-name" class="input" maxlength="24" value="${attr(u.display_name)}"></label>
          <label><span>E-mail</span><input id="profile-modal-email" class="input" type="email" value="${attr(u.email||'')}"></label>
          <label class="profile-modal-bio-field"><span>Bio pública</span><textarea id="profile-modal-bio" class="input" maxlength="240" rows="4">${esc(u.bio||'')}</textarea><small>Até 240 caracteres.</small></label>
        </div>
        <div class="profile-modal-savebar"><span id="profile-modal-save-state">As alterações só entram em vigor ao salvar.</span><button id="profile-modal-save-profile" class="btn btn-primary" type="button">Salvar perfil</button></div>
      </div>
    </section>`;

    body.querySelector('#profile-modal-avatar-file').onchange=async e=>{
      try{
        const file=e.target.files?.[0];if(!file)return;
        this.draftAvatar=await AuthClient.imageToAvatar(file);
        body.querySelector('#profile-modal-avatar-preview').innerHTML=this.avatar(this.draftAvatar,116,this.data.equipped.frameKey);
      }catch(err){Toast.error(err.message);}
    };
    body.querySelector('#profile-modal-avatar-remove').onclick=()=>{
      this.draftAvatar=null;
      body.querySelector('#profile-modal-avatar-preview').innerHTML=this.avatar(null,116,this.data.equipped.frameKey);
    };
    body.querySelector('#profile-modal-save-profile').onclick=()=>this.saveProfile();
  },

  async saveProfile(){
    const btn=this.overlay?.querySelector('#profile-modal-save-profile');
    const state=this.overlay?.querySelector('#profile-modal-save-state');
    if(!btn)return;
    btn.disabled=true;btn.textContent='Salvando...';if(state)state.textContent='Atualizando seu perfil...';
    try{
      await AuthClient.saveProfile({
        displayName:this.overlay.querySelector('#profile-modal-name').value,
        email:this.overlay.querySelector('#profile-modal-email').value,
        bio:this.overlay.querySelector('#profile-modal-bio').value,
        avatarData:this.draftAvatar
      });
      if(state)state.textContent='✓ Perfil salvo com sucesso.';
      Toast.success('Perfil salvo!');
      HomeScreen.renderAccount();
      this.render();
    }catch(e){
      if(state)state.textContent=e.message;
      Toast.error(e.message);
    }finally{
      const fresh=this.overlay?.querySelector('#profile-modal-save-profile');if(fresh){fresh.disabled=false;fresh.textContent='Salvar perfil';}
    }
  },

  renderTitles(body){
    const d=this.data;
    body.innerHTML=`<section class="profile-tab-layout">
      <div class="profile-modal-feature-card">
        <div><span class="profile-modal-eyebrow">TÍTULO EQUIPADO</span><h3>${d.equipped.titleKey?esc((d.titles.find(t=>t.key===d.equipped.titleKey)||{}).name||'Título equipado'):'Nenhum título equipado'}</h3><p>O título aparece ao lado do seu apelido durante as partidas. Clique em um título desbloqueado para equipá-lo.</p></div>
        <button id="profile-modal-clear-title" class="btn btn-secondary" type="button" ${d.equipped.titleKey?'':'disabled'}>Remover título</button>
      </div>
      <div class="profile-modal-legend">${this.rarityLegend()}</div>
      <div class="profile-modal-unlock-grid profile-modal-title-grid">
        ${d.titles.map(t=>this.titleCard(t)).join('')}
      </div>
    </section>`;
    body.querySelector('#profile-modal-clear-title').onclick=()=>this.equipTitle(null);
    body.querySelectorAll('[data-equip-title]').forEach(b=>b.onclick=()=>this.equipTitle(b.dataset.equipTitle));
  },

  titleCard(t){
    const equipped=this.data.equipped.titleKey===t.key;
    const pct=Math.min(100,(Number(t.progress||0)/Math.max(1,Number(t.target||1)))*100);
    return `<article class="profile-modal-unlock rarity-${esc(t.rarity)} ${t.unlocked?'unlocked':'locked'} ${equipped?'equipped':''}">
      <div class="profile-modal-unlock-top"><span class="profile-modal-unlock-icon">${esc(t.icon)}</span><span class="profile-modal-rarity">${esc(t.rarityInfo?.label||rarityLabel(t.rarity))}</span>${equipped?'<span class="profile-modal-equipped-pill">EQUIPADO</span>':''}</div>
      <h3>${esc(t.name)}</h3><p>${esc(t.description)}</p>
      <div class="profile-modal-progress"><span style="width:${pct}%"></span></div>
      <div class="profile-modal-unlock-foot"><small>${Math.min(Number(t.progress||0),Number(t.target||0))}/${t.target}</small>${t.unlocked?`<button type="button" class="profile-modal-equip-button" data-equip-title="${attr(t.key)}">${equipped?'Usando':'Equipar'}</button>`:'<span>Bloqueado</span>'}</div>
    </article>`;
  },

  async equipTitle(key){
    try{
      await MetaClient.equip(key||null,this.data.equipped.frameKey||null);
      this.data.equipped.titleKey=key||null;
      AuthClient.user.equipped_title_key=key||null;
      Toast.success(key?'Título equipado!':'Título removido.');
      this.render();
      this.activeTab='titles';
      this.overlay.querySelectorAll('[data-profile-tab]').forEach(x=>x.classList.toggle('active',x.dataset.profileTab==='titles'));
      this.renderTab();
    }catch(e){Toast.error(e.message);}
  },

  renderFrames(body){
    const d=this.data;
    body.innerHTML=`<section class="profile-tab-layout">
      <div class="profile-modal-frame-hero">
        <div class="profile-modal-frame-preview">${this.avatar(this.draftAvatar,132,d.equipped.frameKey)}</div>
        <div><span class="profile-modal-eyebrow">MOLDURA EQUIPADA</span><h3>${d.equipped.frameKey?esc((d.frames.find(f=>f.key===d.equipped.frameKey)||{}).name||'Moldura especial'):'Sem moldura'}</h3><p>A moldura altera apenas o contorno do avatar. Sua foto nunca é modificada.</p><button id="profile-modal-clear-frame" class="btn btn-secondary" type="button" ${d.equipped.frameKey?'':'disabled'}>Usar avatar sem moldura</button></div>
      </div>
      <div class="profile-modal-legend">${this.rarityLegend()}</div>
      <div class="profile-modal-unlock-grid profile-modal-frame-grid">
        ${d.frames.map(f=>this.frameCard(f)).join('')}
      </div>
    </section>`;
    body.querySelector('#profile-modal-clear-frame').onclick=()=>this.equipFrame(null);
    body.querySelectorAll('[data-equip-frame]').forEach(b=>b.onclick=()=>this.equipFrame(b.dataset.equipFrame));
  },

  frameCard(f){
    const equipped=this.data.equipped.frameKey===f.key;
    const pct=Math.min(100,(Number(f.progress||0)/Math.max(1,Number(f.target||1)))*100);
    return `<article class="profile-modal-unlock profile-modal-frame-item rarity-${esc(f.rarity)} ${f.unlocked?'unlocked':'locked'} ${equipped?'equipped':''}">
      <div class="profile-modal-frame-sample">${this.avatar(this.draftAvatar,64,f.key)}</div>
      <div class="profile-modal-frame-copy"><div class="profile-modal-unlock-top"><span class="profile-modal-rarity">${esc(f.rarityInfo?.label||rarityLabel(f.rarity))}</span>${equipped?'<span class="profile-modal-equipped-pill">EQUIPADO</span>':''}</div><h3>${esc(f.name)}</h3><p>${esc(f.description)}</p><div class="profile-modal-progress"><span style="width:${pct}%"></span></div><div class="profile-modal-unlock-foot"><small>${Math.min(Number(f.progress||0),Number(f.target||0))}/${f.target}</small>${f.unlocked?`<button type="button" class="profile-modal-equip-button" data-equip-frame="${attr(f.key)}">${equipped?'Usando':'Equipar'}</button>`:'<span>Bloqueada</span>'}</div></div>
    </article>`;
  },

  async equipFrame(key){
    try{
      await MetaClient.equip(this.data.equipped.titleKey||null,key||null);
      this.data.equipped.frameKey=key||null;
      AuthClient.user.equipped_frame_key=key||null;
      Toast.success(key?'Moldura equipada!':'Moldura removida.');
      this.render();
      this.activeTab='frames';
      this.overlay.querySelectorAll('[data-profile-tab]').forEach(x=>x.classList.toggle('active',x.dataset.profileTab==='frames'));
      this.renderTab();
    }catch(e){Toast.error(e.message);}
  },

  renderProgress(body){
    const d=this.data;
    const daily=(d.missions||[]).filter(m=>m.periodType==='daily');
    const weekly=(d.missions||[]).filter(m=>m.periodType==='weekly');
    const completed=(d.missions||[]).filter(m=>m.completed).length;
    body.innerHTML=`<section class="profile-tab-layout">
      <div class="profile-modal-progress-hero">
        <div class="profile-modal-level-orb"><span>NÍVEL</span><b>${d.level}</b></div>
        <div class="profile-modal-progress-copy"><span class="profile-modal-eyebrow">PROGRESSÃO</span><h3>${d.xp} XP acumulados</h3><div class="profile-modal-xp-track"><span style="width:${Math.min(100,(d.xp%1000)/10)}%"></span></div><div class="profile-modal-xp-labels"><span>${d.xp%1000} XP</span><span>1.000 XP para o próximo nível</span></div></div>
      </div>
      <div class="profile-modal-summary-grid">
        <div><b>${d.titles.filter(x=>x.unlocked).length}</b><span>Títulos desbloqueados</span></div>
        <div><b>${d.frames.filter(x=>x.unlocked).length}</b><span>Molduras desbloqueadas</span></div>
        <div><b>${completed}</b><span>Missões concluídas</span></div>
      </div>
      <div class="profile-modal-missions-columns">
        <div class="profile-modal-card"><div class="profile-modal-section-heading"><div><span>DIÁRIAS</span><h3>Missões de hoje</h3></div></div>${daily.map(m=>this.missionCard(m)).join('')||'<p class="text-muted">Sem missões diárias.</p>'}</div>
        <div class="profile-modal-card"><div class="profile-modal-section-heading"><div><span>SEMANAIS</span><h3>Desafios da semana</h3></div></div>${weekly.map(m=>this.missionCard(m)).join('')||'<p class="text-muted">Sem missões semanais.</p>'}</div>
      </div>
    </section>`;
  },

  missionCard(m){
    const pct=Math.min(100,(Number(m.progress||0)/Math.max(1,Number(m.target||1)))*100);
    return `<div class="profile-modal-mission ${m.completed?'done':''}"><div><b>${m.completed?'✓':'🎯'} ${esc(m.name)}</b><small>${esc(m.description)}</small></div><strong>+${m.xp} XP</strong><div class="profile-modal-progress"><span style="width:${pct}%"></span></div><em>${m.progress}/${m.target}</em></div>`;
  },

  rarityLegend(){
    return `<span class="rarity-common">● Comum</span><span class="rarity-rare">● Raro</span><span class="rarity-superrare">● Super Raro</span><span class="rarity-epic">● Épico</span><span class="rarity-legendary">● Lendário</span>`;
  }
};

window.ProfileModal=ProfileModal;
const previousOpen=HomeScreen.openPanel.bind(HomeScreen);
HomeScreen.openPanel=async kind=>{
  if(kind==='profile')return ProfileModal.open('profile');
  return previousOpen(kind);
};
})();
