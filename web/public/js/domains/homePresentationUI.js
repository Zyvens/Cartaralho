'use strict';
(()=>{
 if(window.CartHomePresentationDomain)return;
 CartDomains.claim('homePresentationUI','domains/homePresentationUI.js',()=>{
  const actionMeta={cards:['⭐','Minhas Cartas','Coleção, nativas e favoritas'],stats:['📊','Estatísticas','Veja o estrago em números'],rank:['🏆','Rank','Temporada e halls'],history:['📜','Histórico','Partidas e replays'],friends:['🤝','Amigos de merda','Amizades e turmas'],credits:['🎬','Créditos','Quem começou essa ideia']};
  function polishHome(){
   document.getElementById('home-admin-btn')?.remove();document.querySelector('[data-panel="profile"]')?.remove();
   const screen=document.querySelector('.home-screen');if(screen)screen.classList.add('professional-home');
   const content=document.querySelector('.home-content');if(content&&!content.querySelector('.home-ambient')){const a=document.createElement('div');a.className='home-ambient';a.innerHTML='<i></i><i></i>';content.prepend(a);}
   const mode=document.getElementById('mode-selection');if(mode){mode.classList.add('home-dashboard');const play=document.getElementById('btn-play');if(play&&!document.getElementById('home-play-copy')){const copy=document.createElement('div');copy.id='home-play-copy';copy.className='home-play-copy';copy.innerHTML='<span>PRONTO PARA COMEÇAR?</span><h2>Abra uma mesa e deixe o bom senso do lado de fora.</h2><p>Crie uma sala ou entre com o código dos seus amigos.</p>';mode.insertBefore(copy,play);}if(play){play.classList.add('home-play-cta');play.innerHTML='<span class="play-icon">🎴</span><span class="play-label"><b>JOGAR</b><small>Criar ou entrar em uma mesa</small></span><span class="play-arrow">→</span>';}}
   const actions=document.querySelector('.profile-actions');if(actions){actions.classList.add('home-action-grid');actions.querySelectorAll('[data-panel]').forEach(b=>{const k=b.dataset.panel,m=actionMeta[k];if(!m)return;b.classList.add('home-action-card');b.innerHTML=`<span class="home-action-icon">${m[0]}</span><span class="home-action-copy"><b>${m[1]}</b><small>${m[2]}</small></span><span class="home-action-arrow">›</span>`;});const friend=document.getElementById('friends-menu-btn');if(friend){friend.dataset.panel='friends';friend.classList.add('home-action-card');const m=actionMeta.friends;friend.innerHTML=`<span class="home-action-icon">${m[0]}</span><span class="home-action-copy"><b>${m[1]}</b><small>${m[2]}</small></span><span class="home-action-arrow">›</span>`;friend.onclick=()=>HomeScreen.openPanel('friends');}}
   const strip=document.querySelector('.account-strip');if(strip)strip.classList.add('home-account-bar');
   const profile=document.getElementById('profile-shortcut');if(profile){profile.innerHTML='👤 <span>Perfil</span>';profile.classList.add('home-header-button');}
   const logout=document.getElementById('logout-btn');if(logout){logout.innerHTML='↗ <span>Sair</span>';logout.classList.add('home-header-button');}
  }
  function install(){if(HomeScreen.__domainHomePresentation)return;HomeScreen.__domainHomePresentation=true;const accountBase=HomeScreen.renderAccount.bind(HomeScreen),renderBase=HomeScreen.render.bind(HomeScreen);HomeScreen.renderAccount=function(...args){const out=accountBase(...args);setTimeout(polishHome,0);return out;};HomeScreen.render=async function(...args){const out=await renderBase(...args);polishHome();return out;};}
  install();setTimeout(polishHome,0);window.CartHomePresentationDomain={actionMeta,polishHome,install};
 });
})();
