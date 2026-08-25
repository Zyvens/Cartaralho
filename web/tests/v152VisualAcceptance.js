'use strict';
const{chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const out=process.env.VISUAL_OUT||path.join(process.cwd(),'visual-artifacts');
const base=process.env.VISUAL_BASE_URL||'http://127.0.0.1:4173';
fs.mkdirSync(out,{recursive:true});
const checks=[];
const assert=(name,ok,detail='')=>{checks.push({name,ok,detail});if(!ok)throw new Error(`${name}: ${detail}`);};
const user={id:990152,username:'visual_v152',display_name:'Visual v1.5.2',email:'',avatar_data:null,bio:'QA',dirty_balance:12000,equipped_title_key:null,equipped_frame_key:null};
const originalCard={id:'original-152',type:'whiteCards',text:'Carta Original de validação',owned:true,is_native:false,is_player_card:true,is_favorite:false,isOriginal:true,is_original:true,creator_username:'visual_v152',materialTier:'standard',borderTier:'standard',matches_used:3,materialProgress:{nextTier:'silver',remaining:2},borderProgress:{nextTier:'silver',remaining:2},rarityExplanation:{material:'QA',border:'QA'},origin:{creatorUsername:'visual_v152'}};
async function harness(page){
 await page.addInitScript(()=>localStorage.setItem('cartaralho_auth_token','visual-v152-token'));
 await page.route('https://js.pusher.com/**',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.Pusher=class Pusher{constructor(){this.connection={bind(){}}}subscribe(){return{bind(){},unbind_all(){}}}unsubscribe(){}};'}));
 await page.route('**/api/**',async route=>{
  const p=new URL(route.request().url()).pathname;let body={success:true};
  if(p==='/api/config')body={success:true,pusherKey:'visual',pusherCluster:'mt1'};
  else if(p==='/api/auth/me')body={user};
  else if(p==='/api/profile/wallet')body={dirtyBalance:12000};
  else if(p==='/api/profile/metagame')body={level:7,xp:1200,equipped:{titleKey:null,frameKey:null},titles:[],frames:[],missions:[]};
  else if(p==='/api/profile/missions')body={missions:[]};
  else if(p==='/api/notifications')body={currentVersion:'v1.5.2',updates:[],rewards:[]};
  else if(p==='/api/marketplace')body={dirtyBalance:12000,whiteBalance:2,blackBalance:2,marketplaceEnabled:true,buffsFeatureEnabled:true,catalog:[]};
  else if(p==='/api/sample-cards')body={blackCards:[{text:'Teste _'}],whiteCards:[{text:'Resposta'}]};
  else if(p==='/api/social/friends')body={friends:[],requests:[]};
  else if(p==='/api/social/groups')body={groups:[]};
  else if(p==='/api/profile/cards')body={cards:[originalCard]};
  else if(p==='/api/loot')body={pending:[],pendingCount:0};
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 });
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});
 const page=await ctx.newPage();
 try{
  await harness(page);await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof AuthClient!=='undefined'&&!!AuthClient.user&&!!window.App,{timeout:20000});
  await page.waitForSelector('#home-account .account-strip',{state:'visible'});await page.waitForTimeout(700);
  const geom=await page.evaluate(()=>{const strip=document.querySelector('#home-account>.account-strip'),avatar=strip?.querySelector('.user-avatar'),actions=strip?.querySelector('.p56-account-actions');if(!strip||!avatar||!actions)return null;const s=strip.getBoundingClientRect(),a=avatar.getBoundingClientRect(),g=actions.getBoundingClientRect();return{leftInset:a.left-s.left,rightInset:s.right-g.right,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};});
  assert('mobile account geometry available',!!geom,JSON.stringify(geom));
  assert('avatar has aesthetic left inset',geom.leftInset>=8,`leftInset=${geom.leftInset}`);
  assert('logout group has aesthetic right inset',geom.rightInset>=8,`rightInset=${geom.rightInset}`);
  assert('mobile account keeps zero page overflow',geom.overflow<=2,`overflow=${geom.overflow}`);
  await page.screenshot({path:path.join(out,'v152-mobile-account-inset.png')});
  const cardsButton=page.locator('[data-panel="cards"]').first();assert('Minhas Cartas entry exists',await cardsButton.count()>0);await cardsButton.click();
  await page.waitForSelector('.p57-library-card-shell[data-card-id="original-152"]',{state:'visible'});await page.waitForTimeout(500);
  const shell=page.locator('.p57-library-card-shell[data-card-id="original-152"]');
  assert('Original mark visible in Minhas Cartas',await shell.locator('.canonical-original-mark').isVisible());
  await shell.click();await page.waitForSelector('.p56-card-detail-overlay',{state:'visible'});await page.waitForTimeout(250);
  const detailMark=page.locator('.p56-card-preview-host .canonical-original-mark');
  assert('Original mark visible in card detail',await detailMark.isVisible());
  assert('detail reuses canonical Original label',(await detailMark.textContent()).includes('Original'),await detailMark.textContent());
  await page.screenshot({path:path.join(out,'v152-original-card-detail.png')});
 }finally{await browser.close();fs.writeFileSync(path.join(out,'v152-report.json'),JSON.stringify({base,checks,finishedAt:new Date().toISOString()},null,2));}
})().catch(e=>{console.error(e);process.exit(1);});
