'use strict';

(function refinementP13(){
  const RARITY_ORDER={common:1,rare:2,superrare:3,epic:4,legendary:5,celestial:6};
  const RARITY_LABEL={common:'Comum',rare:'Incomum',superrare:'Raro',epic:'Épico',legendary:'Lendário',celestial:'Celestial'};
  const FRAME_NAMES={bronze:'Bronze',silver:'Prata',gold:'Ouro',platinum:'Platina'};
  const TITLE_DESCRIPTIONS={
    'caos-com-metodo':'Efetive 5 Buffs diferentes em partidas válidas.',
    'fiscal-federal':'Use Intervenção Federal e cancele de verdade outro Buff.',
    'agente-do-caos':'Efetive CAOS TOTAL em uma partida válida.',
    'saqueador-profissional':'Receba uma parcela real de um Saqueador coletivo.',
    'contrabandista':'Adote 10 cartas deliberadamente por Espólio.',
    'direto-da-fonte':'Vença uma rodada válida usando uma carta criada originalmente por você.',
    'traficante-de-ideias':'Faça suas criações somarem 10 adoções deliberadas por Espólio.',
    'viralizador':'Faça uma criação sua atingir o status de Legado Viral.',
    'folclore-vivo':'Faça uma criação sua atingir o status de Legado Folclore.'
  };
  const TECHNICAL_COPY='Ledger auditável · saldo ligado à conta';
  const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
  const money=n=>Number(n||0).toLocaleString('pt-BR');
  const rarity=(r)=>RARITY_LABEL[r]||'Comum';
  const compareRarity=(a,b)=>(RARITY_ORDER[a?.rarity]||99)-(RARITY_ORDER[b?.rarity]||99)||String(a?.name||'').localeCompare(String(b?.name||''),'pt-BR');

  function stackLevel(count){count=Number(count)||0;return count<=0?0:count===1?1:count<=3?2:count<=9?3:4;}
  function cleanStack(type,count,{compact=false,consumed=false}={}){
    const n=Math.max(0,Number(count)||0),level=stackLevel(n),label=type==='white'?'Cartas Limpas Brancas':'Cartas Limpas Pretas',layers=level?Array.from({length:level},(_,i)=>`<i class="clean-stack-sheet" style="--stack-i:${i}"></i>`).join(''):'<i class="clean-stack-empty" aria-hidden="true"></i>';
    return `<div class="clean-stack-resource clean-stack-${type} level-${level}${compact?' compact':''}${consumed?' just-consumed':''}" data-clean-type="${type}" data-clean-count="${n}"><div class="clean-stack-visual" aria-hidden="true">${layers}</div><div class="clean-stack-copy"><small>${label}</small><b>${money(n)}</b></div></div>`;
  }
  window.CartCleanStack={render:cleanStack,level:stackLevel};

  function patchRewardPreview(){
    if(!window.RewardPreviewUI||RewardPreviewUI.__p13)return;
    RewardPreviewUI.__p13=true;
    RewardPreviewUI.card=function(p,title='Estimativa econômica'){
      if(!p)return'<div class="economy-preview loading">Calculando...</div>';
      const c=p.class||{},loot=p.loot||{},payout=p.payouts||{};
      const lootItem=(icon,pos,value)=>`<div class="economy-loot-place"><span>${icon}</span><div><small>${pos}</small><b>Até ${Number(value||0)} carta${Number(value||0)===1?'':'s'}</b></div></div>`;
      return `<div class="economy-preview class-${c.key||'padrao'}"><div class="economy-preview-head"><div><small>${title}</small><h3>${c.icon||'🎯'} Partida ${c.label||'Padrão'}</h3></div></div><div class="economy-context"><b>${p.participants} jogadores · ${p.pointsToWin} pontos</b><span>Duração relativa: ${c.duration||'moderada'}</span></div><div class="economy-payout-grid"><div><span>🥇 1º</span><b>${this.money(payout.first?.total)} 🪙</b></div><div><span>🥈 2º</span><b>${this.money(payout.second?.total)} 🪙</b></div><div><span>🥉 3º</span><b>${this.money(payout.third?.total)} 🪙</b></div><div><span>Sobrevivência</span><b>${this.money(payout.survivalBonus)} 🪙</b></div></div><div class="economy-loot"><div class="economy-loot-title"><b>🎒 Espólio estimado</b><small>Limite de curadoria por colocação</small></div><div class="economy-loot-grid">${lootItem('🥇','1º lugar',loot.first)}${lootItem('🥈','2º lugar',loot.second)}${lootItem('🥉','3º lugar',loot.third)}${p.participants>3?lootItem('🃏','Demais',loot.other):''}</div></div><small class="economy-note">A mão (${p.handSize} cartas) muda variedade, não recompensa. Valores finais usam participação efetiva.</small></div>`;
    };
  }

  function patchCreateRoom(){
    if(!window.CreateRoomScreen||CreateRoomScreen.__p13)return;
    CreateRoomScreen.__p13=true;
    const base=CreateRoomScreen.render.bind(CreateRoomScreen);
    CreateRoomScreen.render=function(container){
      base(container);
      const layout=container.querySelector('.create-room-layout'),rules=layout?.querySelector('.rules-panel'),preview=layout?.querySelector('#preview-economic');
      if(layout&&rules&&preview&&!layout.querySelector('.reward-preview-panel')){
        const panel=document.createElement('section');panel.className='reward-preview-panel';panel.setAttribute('aria-label','Estimativa de recompensa');
        panel.appendChild(preview);layout.appendChild(panel);
      }
      container.querySelectorAll('.rules-list li').forEach(li=>{
        const strong=li.querySelector('strong');let seen=strong===null;
        for(const node of li.childNodes){if(node===strong){seen=true;continue;}if(seen&&node.nodeType===Node.TEXT_NODE&&node.nodeValue.trim()){node.nodeValue=node.nodeValue.replace(/^(\s*)([a-zá-ú])/,(_,sp,ch)=>sp+ch.toLocaleUpperCase('pt-BR'));break;}}
      });
    };
  }

  let lastClean={white:null,black:null};
  function patchCardCreation(){
    if(!window.CardCreationScreen||CardCreationScreen.__p13)return;
    CardCreationScreen.__p13=true;
    const baseRender=CardCreationScreen.render.bind(CardCreationScreen),baseTab=CardCreationScreen.renderTabContent.bind(CardCreationScreen);
    CardCreationScreen.render=function(container){
      const r=baseRender(container);const intro=container.querySelector('.card-creation-screen > p.text-center');
      if(intro&&!intro.querySelector('.dirty-card-zero-line')){
        const marker=' Enviar zero cartas continua válido.';const txt=intro.textContent;
        if(txt.includes(marker)){const[first]=txt.split(marker);intro.replaceChildren(document.createTextNode(first.trim()),document.createElement('br'));const span=document.createElement('span');span.className='dirty-card-zero-line';span.textContent='Enviar zero cartas continua válido.';intro.appendChild(span);}
      }
      return r;
    };
    CardCreationScreen.renderTabContent=function(){
      const previous={...lastClean};const r=baseTab();const inv=this.cleanInventory||{},white=Number(inv.whiteBalance)||0,black=Number(inv.blackBalance)||0;
      const holder=document.querySelector('#tab-content > div[style*="grid-template-columns"]');
      if(holder){holder.removeAttribute('style');holder.className='clean-stack-grid';holder.innerHTML=cleanStack('white',white,{consumed:previous.white!==null&&white<previous.white})+cleanStack('black',black,{consumed:previous.black!==null&&black<previous.black});}
      lastClean={white,black};return r;
    };
  }

  function cleanProductVisual(product){
    const white=Number(product.config?.white||0),black=Number(product.config?.black||0);
    const item=(type,count)=>count>0?`<div class="market-clean-unit ${type}"><span class="market-clean-card-icon" aria-hidden="true"></span><b>${count}×</b><small>${type==='white'?'Brancas':'Pretas'}</small></div>`:'';
    return `<div class="market-clean-breakdown">${item('white',white)}${item('black',black)}</div>`;
  }
  function patchMarket(){
    if(window.MarketUI&&!MarketUI.__p13){
      MarketUI.__p13=true;
      MarketUI.wallets=function(){return `<div class="market-wallets refined-wallets"><div class="market-wallet dirty-wallet"><small>Moedas Sujas</small><b>🪙 ${this.money(this.data.dirtyBalance)}</b></div>${cleanStack('white',this.data.whiteBalance,{compact:true})}${cleanStack('black',this.data.blackBalance,{compact:true})}</div>`;};
    }
    if(window.MarketShop&&!MarketShop.__p13){
      MarketShop.__p13=true;
      const render=MarketShop.render.bind(MarketShop),buy=MarketShop.buy.bind(MarketShop);
      MarketShop.render=function(body,m){
        render(body,m);
        body.querySelectorAll('[data-buy]').forEach(btn=>{
          const p=(m.data.catalog||[]).find(x=>x.product_key===btn.dataset.buy),card=btn.closest('.market-product');if(!p||!card)return;
          card.dataset.productKey=p.product_key;
          if(p.category==='clean_cards'&&!card.querySelector('.market-clean-breakdown')){card.classList.add('market-clean-product');card.querySelector('p')?.insertAdjacentHTML('afterend',cleanProductVisual(p));}
          if(p.category==='buff'&&!card.querySelector('.market-buff-presentation')){
            const info=window.CartBuffPresentation?.info(p.product_key)||{icon:'⚡',rarity:'common',label:'Comum'};card.classList.add(`rarity-${info.rarity}`);const first=card.querySelector(':scope > small');if(first){first.className='buff-type-pill';first.textContent='BUFF';}card.insertAdjacentHTML('afterbegin',`<div class="market-buff-presentation"><span class="market-buff-icon">${info.icon}</span><span class="buff-rarity-pill rarity-${info.rarity}">${info.label}</span></div>`);
          }
        });
      };
      MarketShop.buy=async function(product,m){const before=Number(m.data?.dirtyBalance||0);const r=await buy(product,m);if(Number(m.data?.dirtyBalance||0)<before)window.CartSFX?.play('purchase');return r;};
    }
  }

  function patchBuffUI(){
    if(window.BuffUI&&!BuffUI.__p13){
      BuffUI.__p13=true;
      const base=BuffUI.card.bind(BuffUI);
      BuffUI.card=function(item,used){
        const info=window.CartBuffPresentation?.info(item?.def?.key)||{icon:item?.def?.icon||'⚡',rarity:'common',label:'Comum'};
        let html=base(item,used);
        html=html.replace('<article class="buff-card ',`<article data-buff-key="${esc(item.def.key)}" class="buff-card rarity-${info.rarity} `);
        html=html.replace('<div class="buff-card-top">',`<div class="buff-presentation-row"><span class="buff-type-pill">BUFF</span><span class="buff-rarity-pill rarity-${info.rarity}">${info.label}</span></div><div class="buff-card-top">`);
        return html;
      };
    }
    if(window.SocketClient?.activateBuff&&!SocketClient.__p13BuffSfx){
      SocketClient.__p13BuffSfx=true;const base=SocketClient.activateBuff.bind(SocketClient);
      SocketClient.activateBuff=async function(code,key,activationId,input){const r=await base(code,key,activationId,input);window.CartSFX?.playBuff(key,activationId);return r;};
      SocketClient.on?.('buff_resolved',d=>{const key=d?.buffKey||d?.buff_key||d?.buff?.key,activation=d?.activationId||d?.activation_id;if(key)window.CartSFX?.playBuff(key,activation||'');});
    }
  }

  function normalizedTitleCopy(item){
    const copy=TITLE_DESCRIPTIONS[item.key];if(!copy)return item;
    return {...item,description:copy,rarityInfo:{...(item.rarityInfo||{}),label:rarity(item.rarity)}};
  }
  function patchProfile(){
    if(window.ProfileModal&&!ProfileModal.__p13){
      ProfileModal.__p13=true;
      ProfileModal.rarityLegend=()=>`<span class="rarity-common">● Comum</span><span class="rarity-rare">● Incomum</span><span class="rarity-superrare">● Raro</span><span class="rarity-epic">● Épico</span><span class="rarity-legendary">● Lendário</span><span class="rarity-celestial">● Celestial</span>`;
      const titleCard=ProfileModal.titleCard.bind(ProfileModal),frameCard=ProfileModal.frameCard.bind(ProfileModal),renderTitles=ProfileModal.renderTitles.bind(ProfileModal),renderFrames=ProfileModal.renderFrames.bind(ProfileModal);
      ProfileModal.titleCard=t=>titleCard(normalizedTitleCopy({...t,rarityInfo:{...(t.rarityInfo||{}),label:rarity(t.rarity)}}));
      ProfileModal.frameCard=f=>frameCard({...f,name:FRAME_NAMES[f.key]||f.name,rarityInfo:{...(f.rarityInfo||{}),label:rarity(f.rarity)}});
      ProfileModal.renderTitles=function(body){const prev=this.data.titles;this.data.titles=[...prev].map(normalizedTitleCopy).sort(compareRarity);try{return renderTitles(body);}finally{this.data.titles=prev;}};
      ProfileModal.renderFrames=function(body){const prev=this.data.frames;this.data.frames=[...prev].map(f=>({...f,name:FRAME_NAMES[f.key]||f.name,rarityInfo:{...(f.rarityInfo||{}),label:rarity(f.rarity)}})).sort(compareRarity);try{return renderFrames(body);}finally{this.data.frames=prev;}};
    }
    if(window.AchievementUI&&!AchievementUI.__p13){
      AchievementUI.__p13=true;const base=AchievementUI.renderBadges.bind(AchievementUI),notify=AchievementUI.notify.bind(AchievementUI);
      AchievementUI.renderBadges=function(body,data){const rows=[...(data.achievements||[])].map(a=>({...a,rarityInfo:{...(a.rarityInfo||{}),label:rarity(a.rarity)}})).sort(compareRarity);return base(body,{...data,achievements:rows});};
      AchievementUI.notify=function(data){if(data?.newUnlocks?.length)window.CartSFX?.play('achievement');return notify(data);};
    }
  }

  function openSettings(){
    document.getElementById('audio-settings-modal')?.remove();const s=window.CartSFX?.getSettings?.()||{volume:.8,music:true,sfx:true,musicVolume:.82,sfxVolume:.78};
    const overlay=document.createElement('div');overlay.id='audio-settings-modal';overlay.className='audio-settings-overlay';overlay.innerHTML=`<section class="audio-settings-shell" role="dialog" aria-modal="true" aria-label="Configurações"><header><div><small>CONFIGURAÇÕES</small><h2>Áudio do Cartaralho</h2><p>Ajuste a trilha e os efeitos sem sair do jogo.</p></div><button class="audio-settings-close" type="button" aria-label="Fechar">✕</button></header><div class="audio-settings-body"><label class="audio-setting-slider"><span><b>Volume geral</b><em data-volume-output>${Math.round(s.volume*100)}%</em></span><small>Controla o nível máximo de música e efeitos.</small><input data-audio-setting="volume" type="range" min="0" max="100" value="${Math.round(s.volume*100)}"></label><div class="audio-setting-toggle"><div><b>Música</b><small>Ativa ou desativa a trilha sonora da partida.</small></div><label class="switch"><input data-audio-toggle="music" type="checkbox" ${s.music?'checked':''}><span></span></label></div><label class="audio-setting-slider"><span><b>Volume da música</b><em data-music-volume-output>${Math.round(s.musicVolume*100)}%</em></span><small>Define a presença da trilha em relação ao volume geral.</small><input data-audio-setting="musicVolume" type="range" min="0" max="100" value="${Math.round(s.musicVolume*100)}"></label><div class="audio-setting-toggle"><div><b>Efeitos sonoros</b><small>Cliques, interface, recompensas e efeitos exclusivos dos BUFFs.</small></div><label class="switch"><input data-audio-toggle="sfx" type="checkbox" ${s.sfx?'checked':''}><span></span></label></div><label class="audio-setting-slider"><span><b>Volume dos efeitos</b><em data-sfx-volume-output>${Math.round(s.sfxVolume*100)}%</em></span><small>Mantenha baixo se preferir uma interface mais discreta.</small><input data-audio-setting="sfxVolume" type="range" min="0" max="100" value="${Math.round(s.sfxVolume*100)}"></label></div><footer><span>Preferências salvas neste dispositivo.</span><button class="btn btn-primary" data-audio-done type="button">Concluído</button></footer></section>`;document.body.appendChild(overlay);document.body.classList.add('app-panel-open');window.CartSFX?.play('modal_open');
    const close=()=>{overlay.remove();document.body.classList.remove('app-panel-open');window.CartSFX?.play('modal_close');};overlay.querySelector('.audio-settings-close').onclick=close;overlay.querySelector('[data-audio-done]').onclick=close;overlay.addEventListener('mousedown',e=>{if(e.target===overlay)close();});
    overlay.querySelectorAll('[data-audio-setting]').forEach(input=>input.oninput=()=>{const key=input.dataset.audioSetting,value=Number(input.value)/100;window.CartSFX?.setSettings({[key]:value});const out=overlay.querySelector(`[data-${key.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}-output]`);if(out)out.textContent=`${input.value}%`;});
    overlay.querySelectorAll('[data-audio-toggle]').forEach(input=>input.onchange=()=>window.CartSFX?.setSettings({[input.dataset.audioToggle]:input.checked}));
  }
  function ensureSettingsButton(){
    const actions=document.querySelector('.profile-actions');if(!actions||document.getElementById('audio-settings-menu-btn'))return;
    const b=document.createElement('button');b.id='audio-settings-menu-btn';b.type='button';b.className='btn btn-secondary home-action-card audio-settings-home-card';b.innerHTML='<span class="home-action-icon">⚙️</span><span class="home-action-copy"><b>Configurações</b><small>Volume, música e efeitos sonoros</small></span><span class="home-action-arrow">›</span>';b.onclick=openSettings;const credits=actions.querySelector('[data-panel="credits"]');credits?actions.insertBefore(b,credits):actions.appendChild(b);
  }
  window.CartAudioSettings={open:openSettings};

  function scrubText(root=document){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode())){
      if(node.nodeValue?.includes(TECHNICAL_COPY))node.nodeValue=node.nodeValue.replace(TECHNICAL_COPY,'').replace(/\s{2,}/g,' ');
      if(node.nodeValue?.includes('Título por achievement:')){
        const card=node.parentElement?.closest?.('.profile-modal-unlock,.unlock-card'),key=card?.querySelector?.('[data-equip-title]')?.dataset?.equipTitle,title=key&&TITLE_DESCRIPTIONS[key];if(title)node.nodeValue=title;
      }
    }
    root.querySelectorAll?.('.profile-modal-unlock,.unlock-card').forEach(card=>{
      const key=card.querySelector('[data-equip-title]')?.dataset?.equipTitle,copy=TITLE_DESCRIPTIONS[key];if(copy){const p=card.querySelector('p,small');if(p&&/Título por achievement:/i.test(p.textContent))p.textContent=copy;}
    });
  }
  function polish(root=document){scrubText(root);ensureSettingsButton();}

  function patchToasts(){
    if(!window.Toast||Toast.__p13)return;Toast.__p13=true;
    for(const[name,sound]of[['success','confirm'],['error','error']]){if(typeof Toast[name]!=='function')continue;const base=Toast[name].bind(Toast);Toast[name]=function(...args){window.CartSFX?.play(sound);return base(...args);};}
    window.SocketClient?.on?.('final_reward_settled',()=>window.CartSFX?.play('reward'));
  }

  patchRewardPreview();patchCreateRoom();patchCardCreation();patchMarket();patchBuffUI();patchProfile();patchToasts();polish(document);
  const observer=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)polish(node);});observer.observe(document.body,{childList:true,subtree:true});
})();
