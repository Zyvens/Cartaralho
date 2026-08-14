const Pusher=require('pusher');const crypto=require('crypto');
let instance=null;
function getPusher(){if(instance)return instance;const{PUSHER_APP_ID,PUSHER_KEY,PUSHER_SECRET,PUSHER_CLUSTER}=process.env;if(!PUSHER_APP_ID||!PUSHER_KEY||!PUSHER_SECRET||!PUSHER_CLUSTER)throw new Error('Credenciais do Pusher não configuradas (PUSHER_APP_ID / PUSHER_KEY / PUSHER_SECRET / PUSHER_CLUSTER).');instance=new Pusher({appId:PUSHER_APP_ID,key:PUSHER_KEY,secret:PUSHER_SECRET,cluster:PUSHER_CLUSTER,useTLS:true});return instance;}
function roomChannel(code){return`room-${String(code).toUpperCase().trim()}`;}
async function broadcast(code,event,payload){const eventId=crypto.randomUUID(),body={...(payload||{}),_eventId:eventId,_eventAt:new Date().toISOString()};await getPusher().trigger(roomChannel(code),event,body);return eventId;}
module.exports={getPusher,roomChannel,broadcast};
