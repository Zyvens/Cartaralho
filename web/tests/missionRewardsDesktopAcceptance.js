'use strict';
const{chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const out=process.env.VISUAL_OUT||path.join(process.cwd(),'visual-artifacts');
const base=process.env.VISUAL_BASE_URL||'http://127.0.0.1:4173';
fs.mkdirSync(out,{recursive:true});
const checks=[];
const assert=(name,ok,detail='')=>{checks.push({name,ok,detail});if(!ok)throw new Error(`${name}: ${detail}`);};
const user={id:990154,username:'desktop_mission_qa',display_name:'Desktop Mission QA',email:'',avatar_data:null,bio:'QA',dirty_balance:12000,equipped_title_key:null,equipped_frame_key:null};
const mission={id:'desktop-weekly-buff',name:'Degustação de Péssimas Decisões',description:'Efetive 3 Buffs diferentes nesta semana.',periodType:'weekly',progress:0,target:3,coins:60,xp:300,completed:false,buffReward:{key:'peek_random_card',name:'Dedo no Olho'}};
async function harness(page){
 await page.addInitScript(()=>localStorage.setItem('cartaralho_auth_token','desktop-mission-qa-token'));
 await page.route('https://js.pusher.com/**',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.Pusher=class Pusher{constructor(){this.connection={bind(){}}}subscribe(){return{bind(){},unbind_all(){}}}unsubscribe(){}};'}));
 await page.route('**/api/**',async route=>{
  const p=new URL(route.request().url()).pathname;let body={success:true};
  if(p==='/api/config')body={success:true,pusherKey:'visual',pusherCluster:'mt1'};
  else if(p==='/api/auth/me')body={user};
  else if(p==='/api/profile/wallet')body={dirtyBalance:12000};
  else if(p==='/api/profile/metagame')body={level:7,xp:1200,equipped:{titleKey:null,frameKey:null},titles:[],frames:[],missions:[mission]};
  else if(p==='/api/profile/missions')body={level:7,xp:1200,currentLevelXp:200,missions:[mission]};
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
function geometryScript(rootSelector){
 const row=document.querySelector(`${rootSelector} .mission-row`);
 const copy=row?.querySelector(':scope > .mission-copy');
 const rewards=row?.querySelector(':scope > .p52-mission-rewards');
 const coin=rewards?.querySelector('.p52-mission-coin-pill');
 const xp=rewards?.querySelector('.mission-xp-pill');
 const buff=rewards?.querySelector('.p10-mission-buff');
 if(!row||!copy||!rewards||!coin||!xp||!buff)return null;
 const rr=row.getBoundingClientRect(),cr=copy.getBoundingClientRect(),rw=rewards.getBoundingClientRect(),rewardStyle=getComputedStyle(rewards);
 const pills=[coin,xp,buff].map(el=>{const r=el.getBoundingClientRect(),cs=getComputedStyle(el);return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,fontSize:parseFloat(cs.fontSize)||0};});
 const groupLeft=Math.min(...pills.map(x=>x.left)),groupRight=Math.max(...pills.map(x=>x.right));
 return{
  row:{left:rr.left,right:rr.right,width:rr.width},
  rewards:{left:rw.left,right:rw.right,width:rw.width,justifyContent:rewardStyle.justifyContent},
  copyBottom:cr.bottom,
  rewardsTop:rw.top,
  groupLeft,groupRight,
  heights:pills.map(x=>x.height),
  fontSizes:pills.map(x=>x.fontSize),
  rewardTexts:[coin.textContent,xp.textContent,buff.textContent]
 };
}
function verify(label,g){
 assert(`${label}: geometry available`,!!g,JSON.stringify(g));
 assert(`${label}: rewards are below description`,g.rewardsTop>=g.copyBottom+2,`copyBottom=${g.copyBottom}, rewardsTop=${g.rewardsTop}`);
 assert(`${label}: rewards keep normal left alignment`,g.rewards.justifyContent==='flex-start'&&Math.abs(g.groupLeft-g.rewards.left)<=1,JSON.stringify(g));
 assert(`${label}: coin XP and BUFF have equal height`,Math.max(...g.heights)-Math.min(...g.heights)<=1,`heights=${g.heights.join('/')}`);
 assert(`${label}: coin XP and BUFF have equal text size`,Math.max(...g.fontSizes)-Math.min(...g.fontSizes)<=0.1,`fontSizes=${g.fontSizes.join('/')}`);
 assert(`${label}: BUFF remains present`,String(g.rewardTexts[2]||'').includes('Dedo no Olho'),g.rewardTexts.join(' | '));
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await ctx.newPage();
 try{
  await harness(page);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof AuthClient!=='undefined'&&!!AuthClient.user&&!!window.App&&!!window.ProfileModal,{timeout:20000});
  await page.waitForSelector('#mission-fab',{state:'visible',timeout:10000});

  await page.locator('#mission-fab').click();
  await page.waitForSelector('#mission-card .mission-row',{state:'visible'});
  await page.waitForTimeout(250);
  const menuGeometry=await page.evaluate(geometryScript,'#mission-card');
  await page.screenshot({path:path.join(out,'mission-rewards-desktop-menu.png')});
  verify('desktop Missões',menuGeometry);

  await page.locator('#mission-fab').click();
  await page.evaluate(()=>ProfileModal.open('progress'));
  await page.waitForSelector('.profile-modal-body .mission-row',{state:'visible',timeout:10000});
  await page.waitForTimeout(250);
  const profileGeometry=await page.evaluate(geometryScript,'.profile-modal-body');
  await page.screenshot({path:path.join(out,'mission-rewards-desktop-profile-progress.png')});
  verify('desktop Perfil > Progressão',profileGeometry);
 }finally{
  await browser.close();
  fs.writeFileSync(path.join(out,'mission-rewards-desktop-report.json'),JSON.stringify({base,checks,finishedAt:new Date().toISOString()},null,2));
 }
})().catch(e=>{console.error(e);process.exit(1);});
