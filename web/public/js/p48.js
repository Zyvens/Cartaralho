'use strict';
(()=>{
 if(window.CartP48)return;
 const P={
  opId(prefix){const r=globalThis.crypto?.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now();return`${prefix}_${r}`;},
  screen(name){document.body.dataset.cartScreen=name||App?.state?.currentScreen||'home';},
  navHost(){let h=document.getElementById('p48-top-nav-host');if(!h){h=document.createElement('div');h.id='p48-top-nav-host';document.body.appendChild(h);}return h;},
  clearBack(){document.querySelectorAll('#p48-top-nav-host>.p48-promoted-back').forEach(b=>b.remove());},
  promoteBack(){const b=document.querySelector('#app button.back-button');if(!b)return;b.classList.add('p48-promoted-back');this.navHost().appendChild(b);},
  decorateHome(){
   const account=document.getElementById('home-account');if(account)account.setAttribute('aria-label','Identidade do jogador');
  },
  esc(v){const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;},
  async openLibraryCreator(panel,type='whiteCards'){
   const clean=await AuthClient.cleanCards(),inv=clean.inventory||{},isBlack=type==='blackCards',balance=Number(isBlack?inv.blackBalance:inv.whiteBalance)||0,dirty=Number(inv.dirtyBalance)||0,price=Number(inv.unitPrice||200);
   panel.innerHTML=`<div class="home-form profile-panel p48-library-creator"><button class="panel-close" type="button">✕</button><div class="p48-card-creator-head"><div><small style="color:var(--text-muted)">MINHAS CARTAS</small><h3>🧽 Criar Carta de Jogador</h3></div></div><div class="p48-clean-summary"><div class="p48-clean-card"><small>Cartas Limpas Brancas</small><b>${Number(inv.whiteBalance||0)}</b></div><div class="p48-clean-card"><small>Cartas Limpas Pretas</small><b>${Number(inv.blackBalance||0)}</b></div></div><div class="p48-card-creator-tabs"><button class="btn btn-secondary ${!isBlack?'active':''}" data-p48-type="whiteCards">🤍 Carta Branca</button><button class="btn btn-secondary ${isBlack?'active':''}" data-p48-type="blackCards">🖤 Carta Preta</button></div><small class="p48-create-help">${isBlack?'Crie uma pergunta ou frase com 1 ou 2 lacunas usando _.':'Crie uma palavra ou frase curta para responder às Cartas Pretas.'}</small><div class="input-group"><input id="p48-card-input" class="input" maxlength="${isBlack?200:120}" placeholder="Nova carta"></div><div class="p48-create-actions"><button id="p48-create-card" class="btn btn-primary btn-block">🧽 Sujar esta carta</button>${balance<1?`<button id="p48-buy-clean" class="btn btn-secondary btn-block">Comprar 1 Carta Limpa por 🪙 ${price}</button><small style="text-align:center;color:var(--text-muted)">Saldo: 🪙 ${dirty}</small>`:''}<button id="p48-back-cards" class="btn btn-secondary btn-block">← Voltar para Minhas Cartas</button></div></div>`;
   panel.querySelector('.panel-close').onclick=()=>panel.innerHTML='';
   panel.querySelectorAll('[data-p48-type]').forEach(b=>b.onclick=()=>this.openLibraryCreator(panel,b.dataset.p48Type));
   document.getElementById('p48-back-cards').onclick=()=>HomeScreen.renderCards(panel);
   const input=document.getElementById('p48-card-input');
   const create=async()=>{let text=String(input?.value||'').trim();if(!text)return Toast.warning('Digite o texto da carta.');if(isBlack){const gaps=(text.match(/_+/g)||[]).length;if(gaps<1)return Toast.warning('Toda Carta Preta precisa ter pelo menos uma lacuna (_).');if(gaps>2)return Toast.warning('Carta Preta pode ter no máximo 2 lacunas.');text=String(text).trim().replace(/\s*_+\s*/g,' ______ ').replace(/\s+([,.!?;:])/g,'$1').replace(/\s+/g,' ').trim();}try{document.getElementById('p48-create-card').disabled=true;await AuthClient.createPaidCard({libraryMode:true,type,text,creationId:this.opId('library_creation')});Toast.success('Carta sujada e adicionada às suas cartas.');await this.openLibraryCreator(panel,type);}catch(e){Toast.error(e.message);document.getElementById('p48-create-card')&&(document.getElementById('p48-create-card').disabled=false);}};
   document.getElementById('p48-create-card').onclick=create;if(input)input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();create();}};
   document.getElementById('p48-buy-clean')?.addEventListener('click',async()=>{try{await AuthClient.buyCleanCard(type,this.opId('library_purchase'));Toast.success(`+1 Carta Limpa ${isBlack?'Preta':'Branca'}.`);await this.openLibraryCreator(panel,type);}catch(e){Toast.error(e.message);}});
  },
  decorateCards(panel){const tools=panel?.querySelector('.card-tools');if(!tools||panel.querySelector('.p48-create-card-entry'))return;const b=document.createElement('button');b.type='button';b.className='btn btn-primary p48-create-card-entry';b.innerHTML='🧽 Criar nova Carta de Jogador';b.onclick=()=>this.openLibraryCreator(panel,'whiteCards');tools.parentNode.insertBefore(b,tools);},
  decorateNotifications(N,preRead){
   const updates=N.data?.updates||[],rewards=N.data?.rewards||[],groups=[['updates',updates],['rewards',rewards]];
   groups.forEach(([key,items])=>{const unread=items.filter(x=>!preRead.has(String(x.id))),details=N.overlay?.querySelector(`details.notifications-spoiler[data-section="${key}"]`);if(!details||!unread.length)return;const summary=details.querySelector('summary');if(summary&&!summary.querySelector('.notifications-section-new')){const pill=document.createElement('span');pill.className='notifications-section-new';pill.textContent=unread.length===1?'1 nova':`${unread.length} novas`;summary.appendChild(pill);}const rows=[...details.querySelectorAll('.notification-item')];items.forEach((item,i)=>{if(preRead.has(String(item.id)))return;const row=rows[i];if(!row)return;row.classList.add('is-new');const title=row.querySelector('.notification-title');if(title&&!title.querySelector('.notification-new-pill')){const pill=document.createElement('span');pill.className='notification-new-pill';pill.textContent='NOVA';title.appendChild(pill);}});});
  }
 };
 window.CartP48=P;

 /* Tela de destino conhecida antes da transição: elimina flashes de controles. */
 const baseShow=App.showScreen.bind(App);
 App.showScreen=function(name,data={}){P.screen(name);P.clearBack();const out=baseShow(name,data);setTimeout(()=>{P.promoteBack();if(name==='home')P.decorateHome();},325);return out;};
 P.screen(App.state?.currentScreen||'home');

 /* Minhas Cartas ganha criação sem seleção para partida. */
 const baseCards=HomeScreen.renderCards.bind(HomeScreen);
 HomeScreen.renderCards=async function(panel,...args){const out=await baseCards(panel,...args);P.decorateCards(panel);return out;};

 /* Notificações: novidade só vira lida quando o painel é fechado. */
 if(window.NotificationsUI){
  const N=NotificationsUI,baseOpen=N.open.bind(N),baseClose=N.close.bind(N);
  N.open=async function(...args){const before=this.readSet();const out=await baseOpen(...args);if(!this.overlay)return out;this.saveRead(before);this.updateBadge();this.__p48PendingRead=new Set(this.items().filter(x=>!before.has(String(x.id))).map(x=>String(x.id)));P.decorateNotifications(this,before);return out;};
  N.close=function(...args){if(this.overlay&&this.__p48PendingRead?.size){const read=this.readSet();this.__p48PendingRead.forEach(id=>read.add(id));this.saveRead(read);this.__p48PendingRead=null;this.updateBadge();}return baseClose(...args);};
 }
})();
