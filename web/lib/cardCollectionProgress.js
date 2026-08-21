'use strict';
const{sql}=require('./db');
const rules=require('./cardProgressionRules');

async function distinctOwnedCards(userId){
 const id=Number(userId);
 const rows=await sql`
  SELECT COUNT(*)::int n FROM(
   SELECT CASE WHEN type IN('white','whiteCards') THEN 'white' ELSE 'black' END type_key,
          lower(regexp_replace(trim(text),'\\s+',' ','g')) text_key
   FROM user_cards
   WHERE user_id=${id} AND COALESCE(owned,true)=true
   UNION
   SELECT cc.card_type type_key,cc.normalized_text text_key
   FROM canonical_card_ownerships o
   JOIN canonical_cards cc ON cc.id=o.canonical_card_id
   WHERE o.user_id=${id}
  ) owned_cards
 `;
 return Number(rows[0]?.n||0);
}

function borderProgress(count){return rules.progressFor(Number(count||0),'border');}
function borderTier(count){return borderProgress(count).tier;}

module.exports={distinctOwnedCards,borderProgress,borderTier,BORDER_THRESHOLDS:rules.BORDER_THRESHOLDS};
