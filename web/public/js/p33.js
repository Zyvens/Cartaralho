'use strict';
(()=>{
 if(!window.MetaUI||!window.AuthClient||!window.HomeScreen)return;
 const state={rank:null};
 const originalRank=AuthClient.rank.bind(AuthClient);
 AuthClient.rank=async function(season='current'){
  const data=await originalRank(season);
  state.rank=data;
  return data;
 };
 const titleName=key=>window.IdentityUI?.titleName?.(key)||(window.MetaTitleNames||{})[key]||String(key||'').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
 const playerRows=tab=>tab==='fame'?(state.rank?.hallOfFame||[]):(state.rank?.rank||[]);
 function copyNode(button){
  const node=[...button.children].find(el=>el.tagName==='SPAN'&&el.querySelector('b'));
  if(node)node.classList.add('rank-copy');
  return node||null;
 }
 function ensureAvatar(button,row){
  let avatar=[...button.children].find(el=>el.classList?.contains('user-avatar'))||button.querySelector('.rank-avatar-frame .user-avatar,.rank-avatar-frame img,.rank-avatar-frame .identity-avatar-fallback');
  if(!avatar){
   const temp=document.createElement('span');
   temp.innerHTML=HomeScreen.avatar(row.avatar_data,38);
   avatar=temp.firstElementChild;
   const copy=copyNode(button);
   if(avatar)button.insertBefore(avatar,copy||null);
  }
  if(!avatar)return;
  const frame=row.equipped_frame_key||null;
  if(!frame)return;
  if(avatar.closest('.avatar-frame'))return;
  if(window.IdentityUI?.wrapExisting){
   IdentityUI.wrapExisting(avatar,frame);
   const wrapper=avatar.closest('.avatar-frame');
   wrapper?.classList.add('rank-avatar-frame');
   return;
  }
  const wrapper=document.createElement('span');
  wrapper.className=`avatar-frame public-avatar-frame rank-avatar-frame frame-${frame}`;
  avatar.parentNode?.insertBefore(wrapper,avatar);
  wrapper.appendChild(avatar);
 }
 function ensureTitle(button,row){
  const key=row.equipped_title_key||null,copy=copyNode(button);
  if(!key||!copy||copy.querySelector('.rank-equipped-title'))return;
  const title=document.createElement('span');
  title.className='rank-equipped-title equipped-title public-equipped-title';
  title.dataset.titleKey=key;
  title.textContent=titleName(key);
  const stats=copy.querySelector('small');
  copy.insertBefore(title,stats||null);
 }
 function decorate(panel,tab){
  if(!panel||tab==='shame'||!state.rank)return;
  const rows=playerRows(tab),byUser=new Map(rows.map(row=>[String(row.user_id),row]));
  panel.querySelectorAll('.rank-player[data-user-id]').forEach(button=>{
   const row=byUser.get(String(button.dataset.userId));
   if(!row)return;
   ensureAvatar(button,row);
   ensureTitle(button,row);
  });
  window.MetaUI?.decorateTitles?.();
 }
 const originalRender=MetaUI.renderRank.bind(MetaUI);
 MetaUI.renderRank=async function(panel,season='current',tab='rank'){
  const out=await originalRender(panel,season,tab);
  decorate(panel,tab);
  return out;
 };
})();
