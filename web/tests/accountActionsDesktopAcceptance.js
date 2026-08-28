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
async function verifyViewport(browser,width,height,label,file){
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
   const actions=strip?.querySelector('.p56-account-actions');
   const profile=actions?.querySelector('.p56-profile-action');
   const logout=actions?.querySelector('.p56-logout-action');
   if(!strip||!actions||!profile||!logout)return null;
   const s=strip.getBoundingClientRect(),a=actions.getBoundingClientRect(),p=profile.getBoundingClientRect(),l=logout.getBoundingClientRect();
   const as=getComputedStyle(actions),ss=getComputedStyle(strip);
   return{
    strip:{left:s.left,right:s.right,width:s.width,paddingRight:parseFloat(ss.paddingRight)||0,borderRight:parseFloat(ss.borderRightWidth)||0},
    actions:{left:a.left,right:a.right,width:a.width,paddingLeft:parseFloat(as.paddingLeft)||0,borderLeft:parseFloat(as.borderLeftWidth)||0,justifyContent:as.justifyContent},
    profile:{left:p.left,right:p.right,width:p.width},
    logout:{left:l.left,right:l.right,width:l.width},
    leftBreathing:p.left-a.left,
    rightBreathing:s.right-l.right,
    groupCenter:(p.left+l.right)/2,
    actionZoneCenter:(a.left+s.right)/2,
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
   };
  });
  assert(`${label}: account action geometry available`,!!g,JSON.stringify(g));
  assert(`${label}: Perfil/Sair are centered in their tag zone`,Math.abs(g.groupCenter-g.actionZoneCenter)<=1,JSON.stringify(g));
  assert(`${label}: left and right breathing room are symmetric`,Math.abs(g.leftBreathing-g.rightBreathing)<=1,`left=${g.leftBreathing}, right=${g.rightBreathing}`);
  assert(`${label}: account actions keep centered flex alignment`,g.actions.justifyContent==='center',g.actions.justifyContent);
  assert(`${label}: no horizontal page overflow`,g.overflow<=2,`overflow=${g.overflow}`);
  await page.screenshot({path:path.join(out,file)});
 }finally{await ctx.close();}
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  await verifyViewport(browser,1440,1000,'desktop 1440','account-actions-desktop-1440.png');
  await verifyViewport(browser,900,900,'desktop 900','account-actions-desktop-900.png');
 }finally{
  await browser.close();
  fs.writeFileSync(path.join(out,'account-actions-desktop-report.json'),JSON.stringify({base,checks,finishedAt:new Date().toISOString()},null,2));
 }
})().catch(e=>{console.error(e);process.exit(1);});
