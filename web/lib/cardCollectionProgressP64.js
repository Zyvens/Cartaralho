'use strict';
const{sql}=require('./db');
const rules=require('./cardProgressionRules');

async function distinctOwnedCards(userId){
 const id=Number(userId);
 const rows=await sql`
  SELECT COUNT(*)::int n FROM(
   SELECT DISTINCT type,lower(regexp_replace(trim(text),'\\s+',' ','g')) text_key
   FROM user_cards
   WHERE user_id=${id} AND COALESCE(owned,true)=true
  ) owned_cards
 `;
 return Number(rows[0]?.n||0);
}

function borderProgress(count){return rules.progressFor(Number(count||0),'border');}
function borderTier(count){return borderProgress(count).tier;}

module.exports={distinctOwnedCards,borderProgress,borderTier,BORDER_THRESHOLDS:rules.BORDER_THRESHOLDS};
