const { sql } = require('../../lib/db');
const { withErrors, ok, requireMethod } = require('../../lib/http');
const { requireUser, cardMaterialTier, cardBorderTier } = require('../../lib/auth');
module.exports=withErrors(async(req,res)=>{if(!requireMethod(req,res,'GET'))return;const user=await requireUser(req,res);if(!user)return;const rows=await sql`SELECT id,type,text,owned,is_player_card,times_used,matches_used,times_seen,times_won,duplicate_creation_count,created_at,updated_at FROM user_cards WHERE user_id=${user.id} ORDER BY type,text`;ok(res,{cards:rows.map(c=>({...c,materialTier:cardMaterialTier(c.matches_used),borderTier:cardBorderTier(c.duplicate_creation_count)}))});});
