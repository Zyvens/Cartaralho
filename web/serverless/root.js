'use strict';
const{dispatch}=require('./_common');
module.exports=(req,res)=>dispatch(req,res,{fixed:{
 'buffs':require('../api/buffs'),
 'config':require('../api/config'),
 'loot':require('../api/loot'),
 'marketplace':require('../api/marketplace'),
 'notifications':require('../api/notifications'),
 'recycling':require('../api/recycling'),
 'sample-cards':require('../api/sample-cards'),
 'version':require('../api/version')
}});
