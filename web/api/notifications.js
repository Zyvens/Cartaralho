'use strict';
const{withErrors,ok,requireMethod}=require('../lib/http');
const{requireUser}=require('../lib/auth');
const notifications=require('../lib/appNotifications');
const{APP_VERSION,RELEASE}=require('../lib/releaseP37');
module.exports=withErrors(async(req,res)=>{
 if(!requireMethod(req,res,'GET'))return;
 const user=await requireUser(req,res);if(!user)return;
 const data=await notifications.center(user.id);
 data.currentVersion=APP_VERSION;
 data.updates=[RELEASE,...(data.updates||[]).filter(x=>x.id!==RELEASE.id)];
 ok(res,data);
});
