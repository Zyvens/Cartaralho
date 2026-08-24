'use strict';
const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const base=process.env.VISUAL_BASE_URL||'http://127.0.0.1:4173';
const out=process.env.VISUAL_OUT||path.join(process.cwd(),'visual-artifacts');
fs.mkdirSync(out,{recursive:true});
const report={kind:'simulated-multi-client',realBackend:false,base,checks:[],startedAt:new Date().toISOString()};
const check=(name,ok,detail='')=>{report.checks.push({name,ok,detail});if(!ok)throw new Error(`${name}: ${detail}`);};
function user(id,name){return{id,username:name.toLowerCase().replace(/\s+/g,'_'),display_name:name,email:'',avatar_data:null,bio:'',dirty_balance:1000,equipped_title_key:null,equipped_frame_key:null};}
async function harness(page,{role,id,name}){
 const u=user(id,name);
 page.on('pageerror',e=>{report.checks.push({name:`${role} pageerror`,ok:false,detail:e.message});});
 await page.addInitScript(({token,sid})=>{localStorage.setItem('cartaralho_auth_token',token);localStorage.setItem('cartalho_session_id',sid);},{token:`token-${role}`,sid:`session-${role}`});
 await page.route('https://js.pusher.com/**',r=>r.fulfill({status:200,contentType:'application/javascript',body:`window.Pusher=class Pusher{constructor(){this.connection={bind(){}}}subscribe(){return{bind(){},unbind_all(){}}}unsubscribe(){}};`}));
 await page.route('**/api/**',async route=>{
  const p=new URL(route.request().url()).pathname;let body={success:true};
  if(p==='/api/config')body={success:true,pusherKey:'qa',pusherCluster:'mt1'};
  else if(p==='/api/auth/me')body={user:u};
  else if(p==='/api/profile/wallet')body={dirtyBalance:1000};
  else if(p==='/api/profile/metagame')body={level:5,xp:1000,equipped:{titleKey:null,frameKey:null},titles:[],frames:[],missions:[]};
  else if(p==='/api/profile/missions')body={missions:[]};
  else if(p==='/api/notifications')body={currentVersion:'v1.4.77',updates:[],rewards:[]};
  else if(p==='/api/social/friends')body={friends:[],requests:[]};
  else if(p==='/api/social/groups')body={groups:[]};
  else if(p==='/api/loot')body={pending:[],pendingCount:0};
  else if(p==='/api/game/hand')body=role==='host'?{success:true,roundNumber:1,blackCard:{text:'Quem vai _ hoje?'},hand:[],scores:[{nickname:'Host QA',score:0,isHost:true},{nickname:'Player QA',score:0,isHost:false}],isHost:true,submissions:[],buffs:{},engineVersion:'advanced'}:{success:true,roundNumber:1,blackCard:{text:'Quem vai _ hoje?'},hand:[{text:'testar o Cartaralho'},{text:'roubar o pote'}],scores:[{nickname:'Host QA',score:0,isHost:true},{nickname:'Player QA',score:0,isHost:false}],isHost:false,hasPlayed:false,requiredSubmissions:1,cardsPerAnswer:1,answerCount:1,buffs:{},engineVersion:'advanced'};
  else if(p==='/api/game/next-round'||p==='/api/rooms/heartbeat')body={success:true,minimumGrace:null};
  else if(p.includes('reward')||p.includes('finalize'))body={success:true,status:'settled'};
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 });
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>typeof AuthClient!=='undefined'&&!!window.App&&typeof SocketClient!=='undefined',{timeout:20000});
 await page.evaluate(({u,name,role})=>{AuthClient.user=u;App.state.nickname=name;App.state.isCreator=role==='host';App.state.playMode='local-server';SocketClient.roomCode='MCQA77';},{u,name,role});
}
async function state(page){return page.evaluate(()=>({screen:App.state.currentScreen,room:App.state.roomCode,socketRoom:SocketClient.roomCode,nickname:App.state.nickname,isHost:App.state.isHost,hand:(App.state.hand||[]).map(x=>x?.text||x),scores:(App.state.scores||[]).map(x=>({nickname:x.nickname,score:x.score||0,isHost:!!x.isHost})),submissions:(App.state.submissions||[]).length}));}
async function emit(page,event,data){await page.evaluate(async({event,data})=>{await SocketClient._handleRoomEvent(event,data);},{event,data});await page.waitForTimeout(300);}
(async()=>{
 const browser=await chromium.launch({headless:true});
 const hostCtx=await browser.newContext({viewport:{width:1280,height:900}}),playerCtx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const host=await hostCtx.newPage(),player=await playerCtx.newPage();
 try{
  await Promise.all([harness(host,{role:'host',id:990101,name:'Host QA'}),harness(player,{role:'player',id:990102,name:'Player QA'})]);
  const config={maxPlayers:6,pointsToWin:1,handSize:5,cardCreationEnabled:true,playerCardsEnabled:true,buffsEnabled:true,narratorEnabled:false};
  const lobbyPlayers=[{nickname:'Host QA',score:0,isHost:true,isCreator:true,connected:true},{nickname:'Player QA',score:0,isHost:false,connected:true}];
  await host.evaluate(d=>SocketClient._emit('room_created',d),{code:'MCQA77',config,players:lobbyPlayers});
  await player.evaluate(d=>SocketClient._emit('room_joined',d),{code:'MCQA77',config,isCreator:false,players:lobbyPlayers});
  await Promise.all([host.waitForTimeout(500),player.waitForTimeout(500)]);
  let hs=await state(host),ps=await state(player);check('both clients enter same lobby',hs.screen==='lobby'&&ps.screen==='lobby'&&hs.room==='MCQA77'&&ps.room==='MCQA77',JSON.stringify({hs,ps}));
  const players=[{nickname:'Host QA',score:0,isHost:true,isCreator:true,connected:true,cardsReady:true},{nickname:'Player QA',score:0,isHost:false,connected:true,cardsReady:true}];
  await Promise.all([emit(host,'player_list_update',{players,_eventId:'players-1'}),emit(player,'player_list_update',{players,_eventId:'players-1'})]);
  hs=await state(host);ps=await state(player);check('player list converges on both clients',hs.scores.length===2&&ps.scores.length===2,JSON.stringify({hs,ps}));
  const round={roundNumber:1,blackCard:{text:'Quem vai _ hoje?'},scores:players,_eventId:'round-1'};
  await Promise.all([emit(host,'new_round',round),emit(player,'new_round',round)]);
  hs=await state(host);ps=await state(player);check('roles isolate host and player screens',hs.screen==='host'&&ps.screen==='round'&&hs.isHost===true&&ps.isHost===false,JSON.stringify({hs,ps}));check('private hand stays with player context',hs.hand.length===0&&ps.hand.length===2,JSON.stringify({hostHand:hs.hand,playerHand:ps.hand}));
  const played={submissionCount:1,totalExpected:1,_eventId:'played-1'};await Promise.all([emit(host,'card_played',played),emit(player,'card_played',played)]);
  const submissions=[{id:'s1',nickname:'Player QA',cards:[{text:'testar o Cartaralho'}]}];await Promise.all([emit(host,'all_cards_played',{submissions,_eventId:'all-1'}),emit(player,'all_cards_played',{submissions,_eventId:'all-1'})]);
  hs=await state(host);check('host receives revealed submissions',hs.submissions===1,JSON.stringify(hs));
  const result={blackCard:{text:'Quem vai _ hoje?'},winnerCard:{text:'testar o Cartaralho'},winnerNickname:'Player QA',scores:[{nickname:'Host QA',score:0,isHost:true},{nickname:'Player QA',score:1,isHost:false}],roundNumber:1,gameOver:true,_eventId:'result-1'};
  await Promise.all([emit(host,'round_result',result),emit(player,'round_result',result)]);hs=await state(host);ps=await state(player);check('round result converges',hs.screen==='result'&&ps.screen==='result',JSON.stringify({hs,ps}));
  const over={winnerNickname:'Player QA',ranking:[{nickname:'Player QA',score:1},{nickname:'Host QA',score:0}],finalRewardWindow:{status:'open',seconds:15},_eventId:'over-1'};
  await Promise.all([emit(host,'game_over',over),emit(player,'game_over',over)]);hs=await state(host);ps=await state(player);check('game over converges before settlement',hs.screen==='gameOver'&&ps.screen==='gameOver',JSON.stringify({hs,ps}));
  await Promise.all([host.screenshot({path:path.join(out,'multi-host-gameover.png')}),player.screenshot({path:path.join(out,'multi-player-gameover.png')})]);
  await Promise.all([emit(host,'final_reward_settled',{status:'settled',_eventId:'settled-1'}),emit(player,'final_reward_settled',{status:'settled',_eventId:'settled-1'})]);
  hs=await state(host);ps=await state(player);check('settlement unsubscribes transport on both clients',hs.socketRoom===null&&ps.socketRoom===null,JSON.stringify({hs,ps}));
 }finally{await hostCtx.close();await playerCtx.close();await browser.close();report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(out,'multiplayer-report.json'),JSON.stringify(report,null,2));}
})().catch(e=>{report.failure=e.stack||String(e);fs.writeFileSync(path.join(out,'multiplayer-report.json'),JSON.stringify(report,null,2));console.error(e);process.exit(1);});
