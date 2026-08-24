'use strict';
const{dispatch}=require('./_common');
module.exports=(req,res)=>dispatch(req,res,{fixed:{
 'finalize-rewards':require('../api/game/finalize-rewards'),
 'hand':require('../api/game/hand'),
 'next-round':require('../api/game/next-round'),
 'pick-winner':require('../api/game/pick-winner'),
 'play':require('../api/game/play'),
 'react':require('../api/game/react'),
 'replay':require('../api/game/replay'),
 'spectator':require('../api/game/spectator'),
 'start':require('../api/game/start')
}});
