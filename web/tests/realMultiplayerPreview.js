'use strict';
const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');

const base=process.env.BASE_URL||process.env.VISUAL_BASE_URL;
if(!base)throw new Error('BASE_URL/VISUAL_BASE_URL é obrigatório.');
const oidc=process.env.VERCEL_TRUSTED_OIDC_TOKEN||'';
const bypass=process.env.VERCEL_AUTOMATION_BYPASS_SECRET||'';
const out=process.env.VISUAL_OUT||path.join(process.cwd(),'visual-artifacts');
fs.mkdirSync(out,{recursive:true});
const protectedPreviewAuthMode=bypass?'automation-bypass':oidc?'trusted-oidc':'none';
const report={kind:'real-preview-multi-client',realBackend:true,base,protectedPreviewAuth:protectedPreviewAuthMode!=='none',protectedPreviewAuthMode,checks:[],startedAt:new Date().toISOString()};
const check=(name,ok,detail='')=>{report.checks.push({name,ok,detail});if(!ok)throw new Error(`${name}: ${detail}`);};
const suffix=Date.now().toString(36).slice(-8);

function protectionHeaders(){
  const headers={};
  if(bypass){
    headers['x-vercel-protection-bypass']=bypass;
    headers['x-vercel-set-bypass-cookie']='true';
  }else if(oidc){
    headers['x-vercel-trusted-oidc-idp-token']=oidc;
  }
  return headers;
}

async function register(page,role){
  const username=`qa_${role}_${suffix}`.slice(0,24),password='QaPreview#2026',displayName=`QA ${role} ${suffix}`;
  const response=await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  const probe=await page.evaluate(()=>({title:document.title,url:location.href,text:(document.body?.innerText||'').slice(0,180)})).catch(()=>({}));
  report.checks.push({name:`${role} preview document`,ok:response?.status()===200,detail:JSON.stringify({status:response?.status(),...probe})});
  await page.waitForFunction(()=>typeof AuthClient!=='undefined'&&!!window.App&&typeof SocketClient!=='undefined',{timeout:30000});
  const result=await page.evaluate(async({username,password,displayName})=>{
    const r=await fetch('/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password,displayName,email:''})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.token)throw new Error(d.error||`register ${r.status}`);
    localStorage.setItem('cartaralho_auth_token',d.token);
    return {id:d.user?.id,displayName:d.user?.display_name||displayName};
  },{username,password,displayName});
  check(`${role} registered`,!!result.id,JSON.stringify(result));
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.App?.__bootstrapOwned===true&&App.state.currentScreen==='home'&&typeof AuthClient!=='undefined'&&!!AuthClient.user?.id&&typeof SocketClient!=='undefined',{timeout:30000});
  await page.waitForTimeout(500);
  return result;
}

async function ready(page,code){
  return page.evaluate(async code=>{
    const r=await fetch('/api/rooms/ready',{method:'POST',headers:AuthClient.headers({'Content-Type':'application/json'}),body:JSON.stringify({code,ready:true,acceptNoContribution:true})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||d.success===false)throw new Error(d.error||`ready ${r.status}`);
    return d;
  },code);
}

async function start(page,code){
  return page.evaluate(async code=>{
    const r=await fetch('/api/game/start',{method:'POST',headers:AuthClient.headers({'Content-Type':'application/json'}),body:JSON.stringify({code})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||d.success===false)throw new Error(d.error||`start ${r.status}`);
    return d;
  },code);
}

async function snapshot(page){
  return page.evaluate(()=>({screen:App.state.currentScreen,room:App.state.roomCode,socketRoom:SocketClient.roomCode,nickname:App.state.nickname,isCreator:!!App.state.isCreator,isHost:!!App.state.isHost,roundNumber:App.state.roundNumber||0,players:(App.state.players||[]).map(p=>({nickname:p.nickname,cardsReady:!!p.cardsReady,isCreator:!!p.isCreator})),scores:(App.state.scores||[]).map(p=>({nickname:p.nickname,score:p.score||0,isHost:!!p.isHost})),hand:(App.state.hand||[]).length}));
}

(async()=>{
  const browser=await chromium.launch({headless:true});
  const protectedHeaders=protectionHeaders();
  const hostCtx=await browser.newContext({viewport:{width:1280,height:900},extraHTTPHeaders:protectedHeaders});
  const playerCtx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,extraHTTPHeaders:protectedHeaders});
  const thirdCtx=await browser.newContext({viewport:{width:820,height:900},extraHTTPHeaders:protectedHeaders});
  const host=await hostCtx.newPage(),player=await playerCtx.newPage(),third=await thirdCtx.newPage();
  host.on('pageerror',e=>report.checks.push({name:'host pageerror',ok:false,detail:e.message}));
  player.on('pageerror',e=>report.checks.push({name:'player pageerror',ok:false,detail:e.message}));
  third.on('pageerror',e=>report.checks.push({name:'third pageerror',ok:false,detail:e.message}));
  let code=null;
  try{
    const [hu,pu,tu]=await Promise.all([register(host,'host'),register(player,'player'),register(third,'third')]);
    await host.evaluate(name=>{App.state.nickname=name;App.state.playMode='online';},hu.displayName);
    await player.evaluate(name=>{App.state.nickname=name;App.state.playMode='online';},pu.displayName);
    await third.evaluate(name=>{App.state.nickname=name;App.state.playMode='online';},tu.displayName);

    const config={maxPlayers:6,pointsToWin:1,handSize:5,useStandardDeck:true,cardCreationEnabled:false,playerCardsEnabled:false,afkEnabled:true,buffsEnabled:true,narratorEnabled:false};
    await host.evaluate(({name,config})=>SocketClient.createRoom(name,config),{name:hu.displayName,config});
    await host.waitForFunction(()=>App.state.currentScreen==='lobby'&&!!App.state.roomCode&&SocketClient.roomCode===App.state.roomCode,{timeout:30000});
    code=await host.evaluate(()=>App.state.roomCode);
    check('host created persisted room',/^[A-Z0-9]{4,8}$/.test(code||''),String(code));

    await player.evaluate(({name,code})=>SocketClient.joinRoom(name,code),{name:pu.displayName,code});
    await player.waitForFunction(code=>App.state.currentScreen==='lobby'&&App.state.roomCode===code&&SocketClient.roomCode===code,code,{timeout:30000});
    check('player joined same persisted room',true,code);
    await third.evaluate(({name,code})=>SocketClient.joinRoom(name,code),{name:tu.displayName,code});
    await third.waitForFunction(code=>App.state.currentScreen==='lobby'&&App.state.roomCode===code&&SocketClient.roomCode===code,code,{timeout:30000});
    check('third player satisfies canonical three-player minimum',true,code);

    await Promise.all([
      host.waitForFunction(()=>Array.isArray(App.state.players)&&App.state.players.length>=3,{timeout:30000}),
      player.waitForFunction(()=>Array.isArray(App.state.players)&&App.state.players.length>=3,{timeout:30000}),
      third.waitForFunction(()=>Array.isArray(App.state.players)&&App.state.players.length>=3,{timeout:30000})
    ]);
    let hs=await snapshot(host),ps=await snapshot(player),ts=await snapshot(third);
    check('Pusher player-list converged on all real clients',hs.players.length>=3&&ps.players.length>=3&&ts.players.length>=3,JSON.stringify({hs,ps,ts}));
    check('creator authority preserved',hs.isCreator===true&&ps.isCreator===false&&ts.isCreator===false,JSON.stringify({hs,ps,ts}));

    const [hr,pr,tr]=await Promise.all([ready(host,code),ready(player,code),ready(third,code)]);
    check('server accepted concurrent readiness for all users',hr.ready===true&&pr.ready===true&&tr.ready===true,JSON.stringify({hr,pr,tr}));
    await Promise.all([
      host.waitForFunction(()=>Array.isArray(App.state.players)&&App.state.players.filter(p=>p.cardsReady).length>=3,{timeout:30000}),
      player.waitForFunction(()=>Array.isArray(App.state.players)&&App.state.players.filter(p=>p.cardsReady).length>=3,{timeout:30000}),
      third.waitForFunction(()=>Array.isArray(App.state.players)&&App.state.players.filter(p=>p.cardsReady).length>=3,{timeout:30000})
    ]);
    check('readiness broadcast converged on all clients',true);

    const started=await start(host,code);
    check('server accepted start at canonical minimum',started.replayed===false,JSON.stringify(started));
    await Promise.all([
      host.waitForFunction(()=>['host','round'].includes(App.state.currentScreen)&&App.state.roundNumber>=1,{timeout:45000}),
      player.waitForFunction(()=>['host','round'].includes(App.state.currentScreen)&&App.state.roundNumber>=1,{timeout:45000}),
      third.waitForFunction(()=>['host','round'].includes(App.state.currentScreen)&&App.state.roundNumber>=1,{timeout:45000})
    ]);
    hs=await snapshot(host);ps=await snapshot(player);ts=await snapshot(third);
    check('real new_round reached all clients',hs.roundNumber>=1&&ps.roundNumber>=1&&ts.roundNumber>=1,JSON.stringify({hs,ps,ts}));
    const clients=[hs,ps,ts],hosts=clients.filter(s=>s.isHost),players=clients.filter(s=>!s.isHost);
    check('exactly one client owns host role',hosts.length===1,JSON.stringify({hs,ps,ts}));
    check('private hand isolation preserved',hosts[0].hand===0&&players.every(s=>s.hand>0),JSON.stringify({hs,ps,ts}));

    await Promise.all([
      host.screenshot({path:path.join(out,'real-multi-host.png'),fullPage:true}),
      player.screenshot({path:path.join(out,'real-multi-player.png'),fullPage:true}),
      third.screenshot({path:path.join(out,'real-multi-third.png'),fullPage:true})
    ]);
  }finally{
    if(code){
      try{await host.evaluate(async code=>{await fetch('/api/rooms/end',{method:'POST',headers:AuthClient.headers({'Content-Type':'application/json'}),body:JSON.stringify({code,mode:'end'})});},code);}catch(_){}
    }
    await hostCtx.close();await playerCtx.close();await thirdCtx.close();await browser.close();
    report.finishedAt=new Date().toISOString();
    fs.writeFileSync(path.join(out,'real-multiplayer-report.json'),JSON.stringify(report,null,2));
  }
})().catch(e=>{report.failure=e.stack||String(e);fs.writeFileSync(path.join(out,'real-multiplayer-report.json'),JSON.stringify(report,null,2));console.error(e);process.exit(1);});
