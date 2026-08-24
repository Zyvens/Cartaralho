'use strict';
const{dispatch}=require('./_common');
module.exports=(req,res)=>dispatch(req,res,{fixed:{
 'config':require('../api/rooms/config'),
 'create':require('../api/rooms/create'),
 'end':require('../api/rooms/end'),
 'heartbeat':require('../api/rooms/heartbeat'),
 'info':require('../api/rooms/info'),
 'join':require('../api/rooms/join'),
 'leave':require('../api/rooms/leave'),
 'preview':require('../api/rooms/preview'),
 'ready':require('../api/rooms/ready'),
 'spectate':require('../api/rooms/spectate')
}});
