'use strict';
const{chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const out=process.env.VISUAL_OUT||path.join(process.cwd(),'visual-artifacts');
const base=process.env.VISUAL_BASE_URL||'http://127.0.0.1:4173';
fs.mkdirSync(out,{recursive:true});
const checks=[];
const assert=(name,ok,detail='')=>{checks.push({name,ok,detail});if(!ok)throw new Error(`${name}: ${detail}`);};
const user={id:990153,username:'visual_v153',display_name:'Visual v1.5.3',email:'',avatar_data:null,bio:'QA',dirty_balance:12000,equipped_title_key:null,equipped_frame_key:null};
const originalCard={id:'original-153',type:'whiteCards',text:'Carta Original de validação',owned:true,is_native:false,is_player_card:true,is_favorite:false,isOriginal:true,is_original:true,creator_username:'visual_v153',materialTier:'standard',borderTier:'standard',matches_used:3,materialProgress:{nextTier:'silver',remaining:2},borderProgress:{nextTier:'silver',remaining:2},rarityExplanation:{material:'QA',border:'QA'},origin:{creatorUsername:'visual_v153'}};
const mission={id:'visual-weekly-buff',name:'Degustação de Péssimas Decisões',description:'Efetive 3 Buffs diferentes nesta semana.',periodType:'weekly',progress:0,target:3,coins:60,xp:300,completed:false,buffReward:{key:'peek_random_card',name:'Dedo no Olho'}};
async function harness(page){
 await page.addInitScript(()=>localStorage.setItem('cartaralho_auth_token','visual-v153-token'));
 await page.route('https://js.pusher.com/**',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.Pusher=class Pusher{constructor(){this.connection={bind(){}}}subscribe(){return{bind(){},unbind_all(){}}}unsubscribe(){}};'}));
 await page.route('**/api/**',async route=>{
  const p=new URL(route.request().url()).pathname;let body={success:true};
  if(p==='/api/config')body={success:true,pusherKey:'visual',pusherCluster:'mt1'};
  else if(p==='/api/auth/me')body={user};
  else if(p==='/api/profile/wallet')body={dirtyBalance:12000};
  else if(p==='/api/profile/metagame')body={level:7,xp:1200,equipped:{titleKey:null,frameKey:null},titles:[],frames:[],missions:[mission]};
  else if(p==='/api/profile/missions')body={level:7,xp:1200,currentLevelXp:200,missions:[mission]};
  else if(p==='/api/notifications')body={currentVersion:'v1.5.3',updates:[{id:'release:v1.5.3',version:'v1.5.3'}],rewards:[]};
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
  const account=await page.evaluate(()=>{const strip=document.querySelector('#home-account>.account-strip'),wallet=strip?.querySelector('.p74-wallet-slot'),profile=strip?.querySelector('.p56-profile-action'),actions=strip?.querySelector('.p56-account-actions');if(!strip||!wallet||!profile||!actions)return null;const s=strip.getBoundingClientRect(),w=wallet.getBoundingClientRect(),p=profile.getBoundingClientRect(),a=actions.getBoundingClientRect();return{walletProfileGap:p.left-w.right,leftInset:Math.max(0,w.left-s.left),rightInset:s.right-a.right,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};});
  assert('account geometry available',!!account,JSON.stringify(account));
  assert('wallet keeps breathing room before Perfil',account.walletProfileGap>=8,`gap=${account.walletProfileGap}`);
  assert('account strip keeps zero page overflow',account.overflow<=2,`overflow=${account.overflow}`);
  await page.screenshot({path:path.join(out,'v153-account-wallet-profile-gap.png')});

  await page.waitForSelector('#mission-fab',{state:'visible',timeout:10000});await page.locator('#mission-fab').click();
  await page.waitForSelector('#mission-card .mission-row',{state:'visible'});await page.waitForTimeout(250);
  const rewards=await page.evaluate(()=>{const row=document.querySelector('#mission-card .mission-row'),coin=row?.querySelector('.p52-mission-coin-pill'),xp=row?.querySelector('.mission-xp-pill'),buff=row?.querySelector('.p10-mission-buff');if(!row||!coin||!xp||!buff)return null;const c=coin.getBoundingClientRect(),x=xp.getBoundingClientRect(),b=buff.getBoundingClientRect(),cs=getComputedStyle(buff);return{coinCenter:c.top+c.height/2,xpCenter:x.top+x.height/2,buffCenter:b.top+b.height/2,buffText:buff.textContent,paddingLeft:parseFloat(cs.paddingLeft)||0,paddingRight:parseFloat(cs.paddingRight)||0,rowWidth:row.getBoundingClientRect().width,rewardsRight:b.right-row.getBoundingClientRect().right};});
  assert('mission reward geometry available',!!rewards,JSON.stringify(rewards));
  assert('coin XP and BUFF share one centered reward row',Math.max(rewards.coinCenter,rewards.xpCenter,rewards.buffCenter)-Math.min(rewards.coinCenter,rewards.xpCenter,rewards.buffCenter)<=2,JSON.stringify(rewards));
  assert('BUFF reward keeps lateral breathing room',rewards.paddingLeft>=8&&rewards.paddingRight>=8,`padding=${rewards.paddingLeft}/${rewards.paddingRight}`);
  assert('BUFF reward remains Dedo no Olho',String(rewards.buffText).includes('Dedo no Olho'),rewards.buffText);
  assert('mission reward row stays inside card',rewards.rewardsRight<=2,`rightOverflow=${rewards.rewardsRight}`);
  await page.screenshot({path:path.join(out,'v153-mission-rewards-row.png')});

  await page.locator('#mission-fab').click();
  const cardsButton=page.locator('[data-panel="cards"]').first();assert('Minhas Cartas entry exists',await cardsButton.count()>0);await cardsButton.click();
  await page.waitForSelector('.p57-library-card-shell[data-card-id="original-153"]',{state:'visible'});await page.waitForTimeout(350);
  const shell=page.locator('.p57-library-card-shell[data-card-id="original-153"]');await shell.click();await page.waitForSelector('.p56-card-detail-overlay',{state:'visible'});await page.waitForTimeout(250);
  const original=await page.evaluate(()=>{const card=document.querySelector('.p56-card-preview-host .p57-detail-game-card'),mark=card?.querySelector('.canonical-original-mark'),watermark=card?.querySelector('.card-watermark');if(!card||!mark||!watermark)return null;const c=card.getBoundingClientRect(),m=mark.getBoundingClientRect(),w=watermark.getBoundingClientRect();return{markBottomFromCard:c.bottom-m.bottom,gapToWatermark:w.top-m.bottom,text:mark.textContent};});
  assert('Original detail geometry available',!!original,JSON.stringify(original));
  assert('Original mark keeps footer clearance',original.markBottomFromCard>=40,`bottomClearance=${original.markBottomFromCard}`);
  assert('Original mark no longer hugs card watermark',original.gapToWatermark>=6,`gapToWatermark=${original.gapToWatermark}`);
  assert('detail keeps canonical Original label',String(original.text).includes('Original'),original.text);
  await page.screenshot({path:path.join(out,'v153-original-card-clearance.png')});
 }finally{await browser.close();fs.writeFileSync(path.join(out,'v153-report.json'),JSON.stringify({base,checks,finishedAt:new Date().toISOString()},null,2));}
})().catch(e=>{console.error(e);process.exit(1);});
