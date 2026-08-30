'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');

const protectedMutations=[
 'api/game/play.js',
 'api/game/pick-winner.js',
 'api/game/next-round.js',
 'api/rooms/heartbeat.js',
 'api/rooms/leave.js',
 'api/rooms/end.js'
];

test('mutações críticas derivam identidade da sessão autenticada',()=>{
 for(const file of protectedMutations){
  const src=read(file);
  assert.match(src,/requireUser/,'requireUser ausente em '+file);
  assert.match(src,/await requireUser\(req,res\)/,'sessão não é exigida em '+file);
  assert.doesNotMatch(src,/const\{[^}]*playerId[^}]*\}=getBody\(req\)/,'playerId do body voltou a ser autoridade em '+file);
 }
});

test('criação e entrada separam visualId de identidade autenticada',()=>{
 const create=read('api/rooms/create.js'),join=read('api/rooms/join.js');
 for(const src of [create,join]){
  assert.match(src,/await requireUser\(req,res\)/);
  assert.match(src,/String\(user\.id\)/);
  assert.match(src,/visualId/);
  assert.doesNotMatch(src,/if\(!playerId/);
 }
});

test('next-round aceita apenas coordenadores autenticados e mantém trava de rodada',()=>{
 const src=read('api/game/next-round.js');
 assert.match(src,/roundMasterId/);
 assert.match(src,/callerId===roundMasterId\|\|callerId===String\(room\.creatorId\)/);
 assert.match(src,/room\.currentRound\.number!==expectedRoundNumber/);
 assert.match(src,/stale:true/);
});

test('cliente não envia playerId como autoridade e reduz concorrência de next-round',()=>{
 const src=read('public/js/socket.js');
 assert.doesNotMatch(src,/JSON\.stringify\(\{playerId:this\.playerId/);
 assert.match(src,/visualId:this\.playerId/);
 assert.match(src,/wasRoundMaster/);
 assert.match(src,/isCreator/);
 assert.match(src,/_scheduleNextRound\(code,roundNumber,5200\)/);
 assert.match(src,/_scheduleNextRound\(code,roundNumber,6800\)/);
});

test('restore não apaga token em falha transitória',()=>{
 const src=read('public/js/auth.js');
 assert.match(src,/e\?\.status===401\|\|e\?\.status===403/);
 assert.match(src,/const cached=this\._cachedUser\(\)/);
 assert.match(src,/Conexão instável: sua sessão foi preservada/);
 assert.doesNotMatch(src,/catch\(_\)\{this\.logout\(\);return null;\}/);
});

test('realtime retenta bootstrap e shell crítico não pode ficar cacheado',()=>{
 const socket=read('public/js/socket.js'),vercel=read('vercel.json');
 assert.match(socket,/CONFIG_RETRY_DELAYS=\[0,350,900,1800\]/);
 assert.match(socket,/async _connectRealtime\(\)/);
 assert.match(socket,/this\._ready=this\._connectRealtime\(\)/);
 assert.match(vercel,/"source": "\/"/);
 assert.match(vercel,/"source": "\/js\/auth\.js"/);
 assert.match(vercel,/"source": "\/js\/socket\.js"/);
 assert.match(vercel,/no-store, max-age=0/);
});

test('release v1.5.4 é a versão canônica exposta',()=>{
 const version=read('api/version.js'),notifications=read('api/notifications.js'),release=read('lib/releaseV154.js');
 assert.match(release,/APP_VERSION='v1\.5\.4'/);
 assert.match(version,/require\('\.\.\/lib\/releaseV154'\)/);
 assert.match(notifications,/require\('\.\.\/lib\/releaseV154'\)/);
 assert.match(version,/V153_VERSION/);
 assert.match(notifications,/V153_RELEASE/);
});
