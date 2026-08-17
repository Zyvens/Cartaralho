'use strict';
(()=>{
 const COLORS={common:'#f4f4f5',rare:'#22c55e',superrare:'#3b82f6',epic:'#a855f7',legendary:'#facc15',celestial:'#bff7ff'};
 const frameClasses=node=>[...(node?.classList||[])].filter(c=>c.startsWith('frame-'));

 function titleName(key){return window.IdentityUI?.titleName?.(key)||(window.MetaTitleNames||{})[key]||String(key||'').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());}

 function decorateHomeIdentity(){
  if(typeof AuthClient==='undefined'||!AuthClient.user)return;
  const strip=document.querySelector('.account-strip');if(!strip)return;
  strip.classList.add('home-account-bar');
  const u=AuthClient.user,frame=u.equipped_frame_key||null,title=u.equipped_title_key||null;

  let avatar=strip.querySelector(':scope > .user-avatar');
  if(!avatar)avatar=strip.querySelector(':scope > .avatar-frame .user-avatar');
  if(frame&&avatar&&!avatar.closest('.avatar-frame')&&window.IdentityUI?.wrapExisting)IdentityUI.wrapExisting(avatar,frame);

  const identity=[...strip.children].find(el=>el.tagName==='DIV'&&el.querySelector('strong'))||strip.querySelector(':scope > div');
  if(identity){
   identity.classList.add('home-account-identity');
   let badge=identity.querySelector('.account-equipped-title');
   if(title){
    if(!badge){badge=document.createElement('small');badge.className='account-equipped-title equipped-title public-equipped-title';identity.appendChild(badge);}
    badge.dataset.titleKey=title;badge.textContent=titleName(title);
   }else badge?.remove();
  }

  const balance=[...strip.children].find(el=>{
   if(el===identity||el.id==='profile-shortcut'||el.id==='logout-btn'||el.classList.contains('avatar-frame')||el.classList.contains('user-avatar'))return false;
   const text=(el.textContent||'').trim();return /🪙|moedas?/i.test(text)||(/^\s*[🪙]?\s*\d[\d.\s]*\s*$/.test(text)&&!text.includes('@'));
  });
  balance?.classList.add('home-account-balance');
  window.MetaUI?.decorateTitles?.();
 }

 function keepBasicPhotoPlain(){
  const node=document.querySelector('.profile-modal-avatar-editor-card #profile-modal-avatar-preview .profile-modal-avatar');
  if(!node)return;
  frameClasses(node).forEach(c=>node.classList.remove(c));
 }

 function itemRarity(kind,key){
  if(!key||typeof ProfileModal==='undefined')return'common';
  const list=kind==='title'?ProfileModal.data?.titles:ProfileModal.data?.frames;
  return(list||[]).find(x=>String(x.key)===String(key))?.rarity||'common';
 }
 function colorAppearanceSelectors(){
  if(typeof ProfileModal==='undefined')return;
  const pairs=[['title',document.querySelector('[data-profile-draft-title]')],['frame',document.querySelector('[data-profile-draft-frame]')]];
  pairs.forEach(([kind,select])=>{
   if(!select)return;
   [...select.options].forEach(option=>{
    if(!option.value){option.style.color='#8b8796';return;}
    const rarity=itemRarity(kind,option.value);option.dataset.rarity=rarity;option.style.color=COLORS[rarity]||COLORS.common;
   });
   const rarity=select.value?itemRarity(kind,select.value):'common';
   select.dataset.rarity=select.value?rarity:'';
   select.style.setProperty('color',select.value?(COLORS[rarity]||COLORS.common):'#b1adba','important');
  });
 }

 function patchProfile(){
  if(typeof ProfileModal==='undefined'||ProfileModal.__p40IdentityPolish)return;
  ProfileModal.__p40IdentityPolish=true;

  if(typeof ProfileModal._syncAppearanceDom==='function'){
   const baseSync=ProfileModal._syncAppearanceDom.bind(ProfileModal);
   ProfileModal._syncAppearanceDom=function(...args){const out=baseSync(...args);keepBasicPhotoPlain();colorAppearanceSelectors();return out;};
  }

  if(typeof ProfileModal.renderProfile==='function'){
   const baseProfile=ProfileModal.renderProfile.bind(ProfileModal);
   ProfileModal.renderProfile=function(body){
    const out=baseProfile(body),preview=()=>body.querySelector('#profile-modal-avatar-preview');
    const repaint=()=>{const p=preview();if(p)p.innerHTML=this.avatar(this.draftAvatar,116,null);keepBasicPhotoPlain();};
    repaint();
    const file=body.querySelector('#profile-modal-avatar-file');
    if(file)file.onchange=async e=>{try{const chosen=e.target.files?.[0];if(!chosen)return;this.draftAvatar=await AuthClient.imageToAvatar(chosen);repaint();}catch(err){Toast.error(err.message);}};
    const remove=body.querySelector('#profile-modal-avatar-remove');if(remove)remove.onclick=()=>{this.draftAvatar=null;repaint();};
    return out;
   };
  }

  const baseRenderTab=ProfileModal.renderTab.bind(ProfileModal);
  ProfileModal.renderTab=function(...args){const out=baseRenderTab(...args);keepBasicPhotoPlain();colorAppearanceSelectors();return out;};
 }

 function settle(){decorateHomeIdentity();patchProfile();keepBasicPhotoPlain();colorAppearanceSelectors();}
 if(typeof HomeScreen!=='undefined'&&!HomeScreen.__p40HomeIdentity){
  HomeScreen.__p40HomeIdentity=true;const base=HomeScreen.renderAccount.bind(HomeScreen);
  HomeScreen.renderAccount=function(...args){const out=base(...args);queueMicrotask(decorateHomeIdentity);setTimeout(decorateHomeIdentity,80);return out;};
 }
 const observer=new MutationObserver(()=>{if(document.querySelector('.account-strip')||document.querySelector('.profile-modal-overlay'))queueMicrotask(settle);});
 observer.observe(document.documentElement,{childList:true,subtree:true});
 document.addEventListener('change',e=>{if(e.target.matches('[data-profile-draft-title],[data-profile-draft-frame]'))queueMicrotask(()=>{colorAppearanceSelectors();keepBasicPhotoPlain();});});
 window.addEventListener('load',settle,{once:true});
 settle();
 window.CartP40={decorateHomeIdentity,colorAppearanceSelectors,keepBasicPhotoPlain};
})();
