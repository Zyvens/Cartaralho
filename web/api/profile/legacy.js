'use strict';
const{withErrors,ok,requireMethod}=require('../../lib/http');
const{requireUser}=require('../../lib/auth');
const cardProgression=require('../../lib/cardProgressionService');
module.exports=withErrors(async(req,res)=>{if(!requireMethod(req,res,'GET'))return;const user=await requireUser(req,res);if(!user)return;const legacy=await cardProgression.getLegacyProfile(user.id);ok(res,{progressionEnabled:process.env.CARD_PROGRESSION_V2_ENABLED!=='false',legacy,thresholds:{material:cardProgression.MATERIAL_THRESHOLDS,border:cardProgression.BORDER_THRESHOLDS,legacy:cardProgression.LEGACY_THRESHOLDS}});});
