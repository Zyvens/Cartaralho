'use strict';
const{chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const out=process.env.VISUAL_OUT||path.join(process.cwd(),'visual-artifacts');
const base=process.env.VISUAL_BASE_URL||'http://127.0.0.1:4173';
fs.mkdirSync(out,{recursive:true});
const checks=[];
const assert=(name,ok,detail='')=>{checks.push({name,ok,detail});if(!ok)throw new Error(`${name}: ${detail}`);};
const user={id:990155,username:'desktop_account_qa',display_name:'Desktop Account QA',email:'',avatar_data:null,bio:'QA',dirty_balance:12000,equipped_title_key:null,equipped_frame_key:null};
async function harness(page){
 await page.addInitScript(()=>localStorage.setItem('cartaralho_auth_token','desktop-account-qa-token'));
 await page.route('https://js.pusher.com/**',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.Pusher=class Pusher{constructor(){this.connection={bind(){}}}subscribe(){return{bind(){},unbind_all(){}}}unsubscribe(){}};'}));
 await page.route('**/api/**',async route=>{
  const p=new URL(route.request().url()).pathname;let body={success:true};
  if(p==='/api/config')body={success:true,pusherKey:'visual',pusherCluster:'mt1'};
  else if(p==='/api/auth/me')body={user};
  else if(p==='/api/profile/wallet')body={dirtyBalance:12000};
  else if(p==='/api/profile/metagame')body={level:7,xp:1200,equipped:{titleKey:null,frameKey:null},titles:[],frames:[],missions:[]};
  else if(p==='/api/profile/missions')body={level:7,xp:1200,currentLevelXp:200,missions:[]};
  else if(p==='/api/notifications')body={currentVersion:'v1.5.3',updates:[],rewards:[]};
  else if(p==='/api/marketplace')body={dirtyBalance:12000,whiteBalance:2,blackBalance:2,marketplaceEnabled:true,buffsFeatureEnabled:true,catalog:[]};
  else if(p==='/api/sample-cards')body={blackCards:[{text:'Teste _'}],whiteCards:[{text:'Resposta'}]};
  else if(p==='/api/social/friends')body={friends:[],requests:[]};
  else if(p==='/api/social/groups')body={groups:[]};
  else if(p==='/api/profile/cards')body={cards:[]};
  else if(p==='/api/loot')body={pending:[],pendingCount:0};
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 });
}
async function verifyViewport(browser,width,height,label,file,compact){
 const ctx=await browser.newContext({viewport:{width,height}});
 const page=await ctx.newPage();
 try{
  await harness(page);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof AuthClient!=='undefined'&&!!AuthClient.user&&!!window.App,{timeout:20000});
  await page.waitForSelector('#home-account>.account-strip .p56-profile-action',{state:'visible',timeout:10000});
  await page.waitForSelector('#home-account>.account-strip .p56-logout-action',{state:'visible',timeout:10000});
  await page.waitForTimeout(500);
  const g=await page.evaluate(()=>{
   const strip=document.querySelector('#home-account>.account-strip');
   const wallet=strip?.querySelector('.p74-wallet-slot');
   const actions=strip?.querySelector('.p56-account-actions');
   const profile=actions?.querySelector('.p56-profile-action');
   const logout=actions?.querySelector('.p56-logout-action');
   const profileIcon=profile?.querySelector('.p56-account-action-icon');
   const logoutIcon=logout?.querySelector('.p56-account-action-icon');
   const profileCopy=profile?.querySelector('.p56-account-action-copy');
   const logoutCopy=logout?.querySelector('.p56-account-action-copy');
   if(!strip||!wallet||!actions||!profile||!logout||!profileIcon||!logoutIcon)return null;
   const rect=el=>{const r=el.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,cx:(r.left+r.right)/2,cy:(r.top+r.bottom)/2};};
   const w=rect(wallet),a=rect(actions),p=rect(profile),l=rect(logout),pi=rect(profileIcon),li=rect(logoutIcon);
   const actionStyle=getComputedStyle(actions);
   const borderLeft=parseFloat(actionStyle.borderLeftWidth)||0;
   return{
    wallet:w,
    actions:{...a,borderLeft,paddingLeft:parseFloat(actionStyle.paddingLeft)||0},
    walletToDivider:a.left-w.right,
    dividerToProfile:p.left-(a.left+borderLeft),
    profile:{button:p,icon:pi,leftGap:pi.left-p.left,rightGap:p.right-pi.right,copyDisplay:profileCopy?getComputedStyle(profileCopy).display:null},
    logout:{button:l,icon:li,leftGap:li.left-l.left,rightGap:l.right-li.right,copyDisplay:logoutCopy?getComputedStyle(logoutCopy).display:null},
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
   };
  });
  assert(`${label}: account action geometry available`,!!g,JSON.stringify(g));
  assert(`${label}: wallet/divider/Perfil breathing room is symmetric`,Math.abs(g.walletToDivider-g.dividerToProfile)<=1,`walletToDivider=${g.walletToDivider}, dividerToProfile=${g.dividerToProfile}`);
  assert(`${label}: wallet/divider/Perfil keeps visible breathing room`,g.walletToDivider>=10&&g.dividerToProfile>=10,`walletToDivider=${g.walletToDivider}, dividerToProfile=${g.dividerToProfile}`);
  assert(`${label}: no horizontal page overflow`,g.overflow<=2,`overflow=${g.overflow}`);
  if(compact){
   assert(`${label}: Perfil copy is hidden`,g.profile.copyDisplay==='none',g.profile.copyDisplay);
   assert(`${label}: Sair copy is hidden`,g.logout.copyDisplay==='none',g.logout.copyDisplay);
   assert(`${label}: Perfil icon is centered in its own button`,Math.abs(g.profile.button.cx-g.profile.icon.cx)<=1,JSON.stringify(g.profile));
   assert(`${label}: Perfil has symmetric inner breathing room`,Math.abs(g.profile.leftGap-g.profile.rightGap)<=1,`left=${g.profile.leftGap}, right=${g.profile.rightGap}`);
   assert(`${label}: Sair icon is centered in its own button`,Math.abs(g.logout.button.cx-g.logout.icon.cx)<=1,JSON.stringify(g.logout));
   assert(`${label}: Sair has symmetric inner breathing room`,Math.abs(g.logout.leftGap-g.logout.rightGap)<=1,`left=${g.logout.leftGap}, right=${g.logout.rightGap}`);
  }
  await page.screenshot({path:path.join(out,file)});
 }finally{await ctx.close();}
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  await verifyViewport(browser,1440,1000,'desktop 1440','account-actions-desktop-1440.png',false);
  await verifyViewport(browser,900,900,'desktop compact 900','account-actions-desktop-900.png',true);
  await verifyViewport(browser,760,900,'desktop compact 760','account-actions-desktop-760.png',true);
 }finally{
  await browser.close();
  fs.writeFileSync(path.join(out,'account-actions-desktop-report.json'),JSON.stringify({base,checks,finishedAt:new Date().toISOString()},null,2));
 }
})().catch(e=>{console.error(e);process.exit(1);});
