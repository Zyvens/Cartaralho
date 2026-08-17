'use strict';
const{withErrors,ok,requireMethod}=require('../lib/http');
const{requireUser}=require('../lib/auth');
const notifications=require('../lib/appNotifications');
const{APP_VERSION,RELEASE}=require('../lib/releaseP40');
const{RELEASE:P39_RELEASE}=require('../lib/releaseP39');
const{RELEASE:P38_RELEASE}=require('../lib/releaseP38');
const{RELEASE:P37_RELEASE}=require('../lib/releaseP37');
module.exports=withErrors(async(req,res)=>{
 if(!requireMethod(req,res,'GET'))return;
 const user=await requireUser(req,res);if(!user)return;
 const data=await notifications.center(user.id);
 data.currentVersion=APP_VERSION;
 const blocked=new Set([RELEASE.id,P39_RELEASE.id,P38_RELEASE.id,P37_RELEASE.id]);
 data.updates=[RELEASE,P39_RELEASE,P38_RELEASE,P37_RELEASE,...(data.updates||[]).filter(x=>!blocked.has(x.id))];
 ok(res,data);
});
