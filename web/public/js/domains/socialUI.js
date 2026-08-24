'use strict';
(()=>{
 if(window.CartSocialDomain)return;
 CartDomains.claim('socialUI','domains/socialUI.js',()=>{
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const key=()=>`cartaralho_friends_online_${AuthClient?.user?.id||AuthClient?.user?.username||'anon'}`;
  const read=()=>{try{const v=localStorage.getItem(key());return v===null?null:Number(v);}catch(_){return null;}};
  const save=v=>{try{if(Number.isFinite(Number(v)))localStorage.setItem(key(),String(Number(v)));}catch(_){ }};
  let lastList=null,timer=null;
  async function list(){const d=await AuthClient.request('/api/social/friends');lastList=d;return d;}
  async function heartbeat(){if(!AuthClient?.user||document.hidden)return;try{await AuthClient.request('/api/social/presence',{method:'POST'});}catch(_){ }}
  function ensureFriendPill(){const btn=document.getElementById('friends-menu-btn');if(!btn)return null;let pill=btn.querySelector('.p48-friends-online-pill');if(!pill){pill=document.createElement('span');pill.className='p48-friends-online-pill p53-presence-pending';btn.appendChild(pill);}const live=Number(lastList?.onlineCount),cached=read(),n=Number.isFinite(live)?live:cached;if(n!==null&&Number.isFinite(Number(n))){pill.textContent=String(n);pill.classList.remove('p53-presence-pending');btn.classList.toggle('has-friends-online',Number(n)>0);}else if(!pill.textContent)pill.textContent='…';return pill;}
  async function updateHomePill(force=true){if(!AuthClient?.user)return;ensureFriendPill();try{const d=force||!lastList?await list():lastList,n=Number(d?.onlineCount);if(Number.isFinite(n)){save(n);ensureFriendPill();}return d;}catch(_){return null;}}
  function installSocialRenderer(){if(!window.SocialUI||SocialUI.__domainPresence)return;SocialUI.__domainPresence=true;const baseFriends=SocialUI.renderFriends?.bind(SocialUI),basePerson=SocialUI.personRow?.bind(SocialUI);if(baseFriends)SocialUI.renderFriends=async function(root,...args){const out=await baseFriends(root,...args);try{lastList=await list();}catch(_){ }ensureFriendPill();return out;};if(basePerson)SocialUI.personRow=function(x,type){if(type!=='outgoing')return basePerson(x,type);return `<article class="social-person">${this.avatar(x)}<button class="social-person-name" data-public-user="${x.user_id}"><b>${esc(x.display_name)}</b><small>@${esc(x.username)}</small></button><div class="social-person-actions social-pending-actions"><span>Pendente</span><button class="social-cancel-button" data-friend-action="decline:${x.id}">Cancelar</button></div></article>`;};}
  function start(){installSocialRenderer();heartbeat();updateHomePill(true);clearInterval(timer);timer=setInterval(()=>{heartbeat();updateHomePill(true);},60000);}
  installSocialRenderer();window.addEventListener('load',start,{once:true});window.addEventListener('focus',()=>{heartbeat();updateHomePill(true);});document.addEventListener('visibilitychange',()=>{if(!document.hidden){heartbeat();updateHomePill(true);}});window.CartSocialDomain={start,heartbeat,updateHomePill,ensureFriendPill,installSocialRenderer,get lastList(){return lastList;}};
 });
})();
