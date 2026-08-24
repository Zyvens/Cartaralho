'use strict';
const{dispatch}=require('./_common');
module.exports=(req,res)=>dispatch(req,res,{fixed:{
 'friends':require('../api/social/friends'),
 'group':require('../api/social/group'),
 'groups':require('../api/social/groups'),
 'presence':require('../api/social/presence')
}});
