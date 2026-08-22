'use strict';
const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');

const out=process.env.VISUAL_OUT||path.join(process.cwd(),'visual-artifacts');
const base=process.env.VISUAL_BASE_URL||'http://127.0.0.1:4173';
fs.mkdirSync(out,{recursive:true});

const report={base,startedAt:new Date().toISOString(),checks:[],consoleErrors:[],pageErrors:[],requestFailures:[]};
const user={id:990001,username:'visual_rc',display_name:'Visual RC',email:'',avatar_data:null,bio:'QA visual',dirty_balance:1234,equipped_title_key:null,equipped_frame_key:null};
const metagame={level:7,xp:1450,equipped:{titleKey:null,frameKey:null},titles:[{key:'tester',name:'Testador',icon:'🧪',description:'QA',rarity:'common',rarityInfo:{label:'Comum'},unlocked:true,progress:1,target:1}],frames:[{key:'bronze',name:'Bronze',description:'QA',rarity:'common',rarityInfo:{label:'Comum'},unlocked:true,progress:1,target:1}],missions:[]};
const market={dirtyBalance:1234,whiteBalance:3,blackBalance:2,marketplaceEnabled:true,buffsFeatureEnabled:true,catalog:[{category:'clean_cards',product_key:'clean_white',name:'Carta Limpa Branca',description:'Crédito de teste',price:100},{category:'card_pack',product_key:'pack_test',name:'Pack Suspeito',description:'Pack de teste',price:250,product_kind:'pack_random'},{category:'buff',product_key:'buff_test',name:'BUFF Teste',description:'Consumível de teste',price:80}]};
const notifications={currentVersion:'v1.4.77',updates:[{id:'u1',title:'Release candidate',description:'Owner domains em validação visual.',version:'v1.4.77',publishedAt:new Date().toISOString(),icon:'🧪'}],rewards:[]};

function check(name,ok,detail=''){
  report.checks.push({name,ok,detail});
  if(!ok)throw new Error(`${name}: ${detail}`);
}
async function visible(page,selector){
  const locator=page.locator(selector).first();
  return !!(await locator.count())&&await locator.isVisible();
}
async function installHarness(page,mode){
  page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push({mode,text:m.text()});});
  page.on('pageerror',e=>report.pageErrors.push({mode,text:e.message}));
  page.on('requestfailed',r=>report.requestFailures.push({mode,url:r.url(),error:r.failure()?.errorText||''}));
  await page.addInitScript(()=>localStorage.setItem('cartaralho_auth_token','visual-token'));
  await page.route('https://js.pusher.com/**',route=>route.fulfill({status:200,contentType:'application/javascript',body:`window.Pusher=class Pusher{constructor(){this.connection={bind(){}}}subscribe(){return{bind(){},unbind_all(){}}}unsubscribe(){}};`}));
  await page.route('**/api/**',async route=>{
    const p=new URL(route.request().url()).pathname;
    let body={success:true};
    if(p==='/api/config')body={success:true,pusherKey:'visual',pusherCluster:'mt1'};
    else if(p==='/api/auth/me')body={user};
    else if(p==='/api/profile/wallet')body={dirtyBalance:1234};
    else if(p==='/api/profile/metagame')body=metagame;
    else if(p==='/api/profile/missions')body={missions:[]};
    else if(p==='/api/notifications')body=notifications;
    else if(p==='/api/marketplace')body=market;
    else if(p==='/api/sample-cards')body={blackCards:[{text:'Teste _ visual'}],whiteCards:[{text:'Resposta visual'}]};
    else if(p==='/api/social/friends')body={friends:[],requests:[]};
    else if(p==='/api/social/groups')body={groups:[]};
    else if(p==='/api/profile/cards')body={cards:[]};
    else if(p==='/api/profile/history')body={matches:[]};
    else if(p==='/api/profile/rank')body={rank:[],recentMatches:[],seasons:[],me:null,season:'current'};
    else if(p==='/api/profile/stats')body={stats:{},badges:[],totals:{}};
    else if(p==='/api/loot')body={pending:[],pendingCount:0};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
}
async function openHome(page,mode){
  await installHarness(page,mode);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof AuthClient!=='undefined'&&!!AuthClient.user&&!!window.App,{timeout:20000});
  await page.waitForSelector('#home-account .account-strip',{state:'visible',timeout:20000});
  await page.waitForTimeout(1000);
}
async function assertHome(page,label){
  for(const [name,sel] of [['profile','#profile-shortcut'],['logout','#logout-btn'],['profile icon','#profile-shortcut .p56-account-action-icon'],['logout icon','#logout-btn .p56-account-action-icon'],['wallet','.p74-wallet-slot']])check(`${label} ${name} visible`,await visible(page,sel));
  const wallet=await page.locator('.p74-wallet-slot').first().textContent();
  check(`${label} wallet first paint value`,/1[.\s]?234|1234/.test(wallet||''),wallet||'empty');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  check(`${label} no horizontal overflow`,overflow<=2,`overflow=${overflow}`);
}
async function desktop(browser){
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),page=await ctx.newPage();
  await openHome(page,'desktop');
  await assertHome(page,'desktop');
  await page.screenshot({path:path.join(out,'desktop-home.png'),fullPage:true});
  await page.locator('#profile-shortcut').click();
  await page.waitForSelector('.profile-modal-overlay',{state:'visible'});
  check('desktop profile modal visible',await visible(page,'.profile-modal-shell'));
  await page.screenshot({path:path.join(out,'desktop-profile.png'),fullPage:true});
  await page.locator('.profile-modal-close').click();
  await page.locator('#notifications-menu-btn').click();
  await page.waitForSelector('.notifications-overlay',{state:'visible'});
  check('desktop notifications visible',await visible(page,'.notifications-shell'));
  await page.screenshot({path:path.join(out,'desktop-notifications.png'),fullPage:true});
  await page.locator('.notifications-close').click();
  await page.locator('#marketplace-menu-btn').click();
  await page.waitForSelector('.market-overlay',{state:'visible'});
  check('desktop market visible',await visible(page,'.market-shell'));
  await page.screenshot({path:path.join(out,'desktop-market.png'),fullPage:true});
  await ctx.close();
}
async function mobile(browser){
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'}),page=await ctx.newPage();
  await openHome(page,'mobile');
  await assertHome(page,'mobile');
  await page.screenshot({path:path.join(out,'mobile-home.png'),fullPage:true});
  await page.locator('#profile-shortcut').click();
  await page.waitForSelector('.profile-modal-overlay',{state:'visible'});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  check('mobile profile no horizontal overflow',overflow<=2,`overflow=${overflow}`);
  const sizes=await page.locator('.profile-modal-overlay input,.profile-modal-overlay textarea,.profile-modal-overlay select').evaluateAll(els=>els.map(el=>parseFloat(getComputedStyle(el).fontSize||'0')));
  check('mobile profile inputs >=16px',sizes.every(x=>x>=16),JSON.stringify(sizes));
  await page.screenshot({path:path.join(out,'mobile-profile.png'),fullPage:true});
  await page.locator('.profile-modal-close').click();
  await page.locator('#marketplace-menu-btn').click();
  await page.waitForSelector('.market-overlay',{state:'visible'});
  const box=await page.locator('.market-shell').boundingBox();
  check('mobile market fits viewport',!!box&&box.width<=390&&box.height<=844,JSON.stringify(box));
  await page.screenshot({path:path.join(out,'mobile-market.png'),fullPage:true});
  await ctx.close();
}

(async()=>{
  const browser=await chromium.launch({headless:true});
  try{await desktop(browser);await mobile(browser);}
  finally{
    await browser.close();
    report.finishedAt=new Date().toISOString();
    fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
  }
  if(report.pageErrors.length)throw new Error(`page errors: ${JSON.stringify(report.pageErrors)}`);
})().catch(e=>{
  report.failure=e.stack||String(e);
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
  console.error(e);
  process.exit(1);
});
