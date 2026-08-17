const Pusher=require('pusher');const crypto=require('crypto');
let instance=null;
const GLOBAL_CHANNEL='cartaralho-global';
function getPusher(){if(instance)return instance;const{PUSHER_APP_ID,PUSHER_KEY,PUSHER_SECRET,PUSHER_CLUSTER}=process.env;if(!PUSHER_APP_ID||!PUSHER_KEY||!PUSHER_SECRET||!PUSHER_CLUSTER)throw new Error('Credenciais do Pusher não configuradas (PUSHER_APP_ID / PUSHER_KEY / PUSHER_SECRET / PUSHER_CLUSTER).');instance=new Pusher({appId:PUSHER_APP_ID,key:PUSHER_KEY,secret:PUSHER_SECRET,cluster:PUSHER_CLUSTER,useTLS:true});return instance;}
function roomChannel(code){return`room-${String(code).toUpperCase().trim()}`;}
function eventBody(payload){return{...(payload||{}),_eventId:crypto.randomUUID(),_eventAt:new Date().toISOString()};}
async function broadcast(code,event,payload){const body=eventBody(payload);await getPusher().trigger(roomChannel(code),event,body);return body._eventId;}
async function broadcastGlobal(event,payload){const body=eventBody(payload);await getPusher().trigger(GLOBAL_CHANNEL,event,body);return body._eventId;}
module.exports={getPusher,roomChannel,broadcast,GLOBAL_CHANNEL,broadcastGlobal};
