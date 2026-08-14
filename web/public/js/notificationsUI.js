'use strict';
(()=>{
 const N={data:null,overlay:null,loading:false,
  esc(v){const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;},
  userKey(){return `cartaralho:notifications-read:v1:${AuthClient.user?.id||'anon'}`;},
  readSet(){try{return new Set(JSON.parse(localStorage.getItem(this.userKey())||'[]'));}catch(_){return new Set();}},
  saveRead(set){try{localStorage.setItem(this.userKey(),JSON.stringify([...set].slice(-300)));}catch(_){}},
  items(){return[...(this.data?.updates||[]),...(this.data?.rewards||[])];},
  unread(){const read=this.readSet();return this.items().filter(x=>!read.has(String(x.id))).length;},
  async load(){if(!AuthClient.user)return null;this.data=await AuthClient.request('/api/notifications');this.updateBadge();return this.data;},
  async refresh(){try{await this.load();}catch(_){}},
  ensureButton(){
   const actions=document.querySelector('.profile-actions'),existing=document.getElementById('notifications-menu-btn');
   if(!AuthClient.user||!actions){existing?.remove();return;}
   if(existing){this.updateBadge();return;}
   const b=document.createElement('button');b.id='notifications-menu-btn';b.type='button';b.className='btn btn-secondary home-action-card notifications-home-card';b.innerHTML='<span class="home-action-icon">🔔</span><span class="home-action-copy"><b>Central de Notificações</b><small>Atualizações, versão e prêmios recebidos</small></span><span class="notification-home-badge" hidden>0</span><span class="home-action-arrow">›</span>';b.onclick=()=>this.open();const settings=actions.querySelector('#audio-settings-menu-btn'),credits=actions.querySelector('[data-panel="credits"]');if(settings)actions.insertBefore(b,settings);else if(credits)actions.insertBefore(b,credits);else actions.appendChild(b);this.refresh();
  },
  updateBadge(){const b=document.querySelector('#notifications-menu-btn .notification-home-badge');if(!b)return;const n=this.unread();b.hidden=n<1;b.textContent=n>99?'99+':String(n);},
  row(item,kind){const date=item.receivedAt||item.publishedAt,when=date?new Date(date).toLocaleDateString('pt-BR'):'',version=item.version?`<span>${this.esc(item.version)}</span>`:'';return `<article class="notification-item ${kind}"><div class="notification-icon">${item.icon||'🔔'}</div><div class="notification-copy"><div class="notification-title"><b>${this.esc(item.title)}</b>${version}</div><p>${this.esc(item.description)}</p>${when?`<small>${when}</small>`:''}</div></article>`;},
  async open(){
   if(!AuthClient.user)return Toast.warning('Entre na sua conta para abrir as notificações.');
   if(this.loading)return;this.loading=true;
   try{await this.load();}catch(e){this.loading=false;return Toast.error(e.message);}this.loading=false;
   this.close();const d=this.data||{},o=document.createElement('div');o.className='notifications-overlay';o.id='notifications-center';o.innerHTML=`<section class="notifications-shell" role="dialog" aria-modal="true" aria-label="Central de Notificações"><header class="notifications-head"><div><small>CENTRAL DE NOTIFICAÇÕES</small><h2>🔔 O que rolou por aqui</h2><p>Atualizações do Cartaralho e recompensas ligadas à sua conta.</p></div><button class="notifications-close" type="button" aria-label="Fechar">✕</button></header><div class="notifications-version"><div><small>VERSÃO ATUAL</small><b>${this.esc(d.currentVersion||'—')}</b></div><span>Você está na versão mais recente publicada.</span></div><div class="notifications-body"><section><div class="notifications-section-title"><h3>🆕 Últimas atualizações</h3><small>${(d.updates||[]).length} registros</small></div><div class="notifications-list">${(d.updates||[]).map(x=>this.row(x,'update')).join('')||'<div class="notification-empty">Nenhuma atualização publicada.</div>'}</div></section><section><div class="notifications-section-title"><h3>🎁 Prêmios recebidos</h3><small>${(d.rewards||[]).length} registros</small></div><div class="notifications-list">${(d.rewards||[]).map(x=>this.row(x,'reward')).join('')||'<div class="notification-empty">Nenhum prêmio registrado ainda.</div>'}</div></section></div></section>`;document.body.appendChild(o);document.body.classList.add('app-panel-open');this.overlay=o;o.querySelector('.notifications-close').onclick=()=>this.close();o.addEventListener('mousedown',e=>{if(e.target===o)this.close();});const key=e=>{if(e.key==='Escape'){document.removeEventListener('keydown',key);this.close();}};document.addEventListener('keydown',key);const read=this.readSet();this.items().forEach(x=>read.add(String(x.id)));this.saveRead(read);this.updateBadge();window.CartSFX?.play('modal_open');
  },
  close(){if(!this.overlay)return;this.overlay.remove();this.overlay=null;document.body.classList.remove('app-panel-open');window.CartSFX?.play('modal_close');}
 };
 window.NotificationsUI=N;
 const observer=new MutationObserver(()=>N.ensureButton());observer.observe(document.body,{childList:true,subtree:true});window.addEventListener('load',()=>N.ensureButton());setTimeout(()=>N.ensureButton(),0);
})();
