'use strict';
const{sql}=require('../../lib/db');
const{withErrors,ok,requireMethod}=require('../../lib/http');
const{requireUser,cardMaterialTier,nextTierProgress}=require('../../lib/auth');
const{canonicalIdentity}=require('../../lib/cardIdentity');
const collectionProgress=require('../../lib/cardCollectionProgressP64');

function authorLabel(authors){
 const names=(authors||[]).map(a=>a.display_name).filter(Boolean);
 if(!names.length)return'Legado do Cartaralho';
 if(names.length<=3)return names.join(', ').replace(/, ([^,]*)$/, ' e $1');
 return`${names.slice(0,2).join(', ')} e +${names.length-2}`;
}
function metaKey(type,text){try{const x=canonicalIdentity(type,text);return`${x.cardType}:${x.normalizedText}`;}catch(_){return null;}}
function borderShape(count){
 const p=collectionProgress.borderProgress(count);
 return{tier:p.tier,progress:{current:p.score,nextTier:p.nextTier,target:p.target,remaining:p.remaining}};
}

module.exports=withErrors(async(req,res)=>{
 if(!requireMethod(req,res,'GET'))return;
 const user=await requireUser(req,res);if(!user)return;

 const ownedDistinctCards=await collectionProgress.distinctOwnedCards(user.id);
 const border=borderShape(ownedDistinctCards);

 const rows=await sql`SELECT c.id,c.type,c.text,c.owned,c.is_player_card,c.is_favorite,c.times_used,c.matches_used,c.times_seen,c.times_won,c.duplicate_creation_count,c.created_at,c.updated_at,COALESCE(d.is_native,false) is_native,co.creator_user_id legacy_creator_user_id,COALESCE(u.display_name,co.creator_name_snapshot) legacy_creator_name,u.username legacy_creator_username,co.first_room_code legacy_first_room_code,co.first_seen_at legacy_first_seen_at,co.recreated_count legacy_recreated_count,(SELECT COUNT(DISTINCT crp.room_code)::int FROM card_room_presence crp WHERE crp.type=c.type AND lower(regexp_replace(trim(crp.text),'\\s+',' ','g'))=lower(regexp_replace(trim(c.text),'\\s+',' ','g'))) tables_visited FROM user_cards c LEFT JOIN deck_cards d ON d.type=c.type AND lower(regexp_replace(trim(d.text),'\\s+',' ','g'))=lower(regexp_replace(trim(c.text),'\\s+',' ','g')) LEFT JOIN card_origins co ON co.type=c.type AND co.text_key=lower(regexp_replace(trim(c.text),'\\s+',' ','g')) LEFT JOIN users u ON u.id=co.creator_user_id WHERE c.user_id=${user.id} ORDER BY c.is_favorite DESC,c.type,c.text`;

 const canonicalRows=await sql`SELECT cc.id,cc.card_type,cc.normalized_text,cc.display_text,cc.origin_match_id,cc.origin_uncertain,cc.created_at,o.acquisition_source,o.source_user_id,o.source_match_id,o.acquired_at,su.display_name source_display_name,su.username source_username,(SELECT COUNT(*)::int FROM canonical_card_ownerships h WHERE h.canonical_card_id=cc.id) holders,COALESCE((SELECT json_agg(json_build_object('user_id',a.user_id,'display_name',COALESCE(au.display_name,a.author_name_snapshot,au.username,'Criador desconhecido'),'username',au.username,'authored_at',a.authored_at) ORDER BY a.authored_at,a.user_id) FROM canonical_card_authors a LEFT JOIN users au ON au.id=a.user_id WHERE a.canonical_card_id=cc.id),'[]'::json) authors FROM canonical_card_ownerships o JOIN canonical_cards cc ON cc.id=o.canonical_card_id LEFT JOIN users su ON su.id=o.source_user_id WHERE o.user_id=${user.id}`;
 const canonicalByKey=new Map(canonicalRows.map(x=>[`${x.card_type}:${x.normalized_text}`,x]));

 const merged=[],byKey=new Map();
 for(const row of rows){
  const meta=row.is_player_card?canonicalByKey.get(metaKey(row.type,row.text)):null;
  const key=meta?`canonical:${meta.id}`:`legacy:${row.id}`;
  if(byKey.has(key)){
   const target=byKey.get(key);
   target.is_favorite=Boolean(target.is_favorite||row.is_favorite);
   target.owned=Boolean(target.owned||row.owned);
   target.times_used+=Number(row.times_used||0);
   target.matches_used+=Number(row.matches_used||0);
   target.times_seen+=Number(row.times_seen||0);
   target.times_won+=Number(row.times_won||0);
   target.duplicate_creation_count+=Number(row.duplicate_creation_count||0);
   target.origin.tablesVisited=Math.max(target.origin.tablesVisited,Number(row.tables_visited||0));
   continue;
  }
  const authors=Array.isArray(meta?.authors)?meta.authors:[];
  const creatorName=row.is_native?'Cartaralho':(authors.length?authorLabel(authors):(row.legacy_creator_name||'Legado do Cartaralho'));
  const isOriginal=authors.some(a=>String(a.user_id)===String(user.id));
  const card={...row,text:meta?.display_text||row.text,canonicalCardId:meta?.id||null,isOriginal,times_used:Number(row.times_used||0),matches_used:Number(row.matches_used||0),times_seen:Number(row.times_seen||0),times_won:Number(row.times_won||0),duplicate_creation_count:Number(row.duplicate_creation_count||0),origin:{authors:authors.map(a=>({userId:a.user_id,displayName:a.display_name,username:a.username||null,authoredAt:a.authored_at})),creatorUserId:authors[0]?.user_id||row.legacy_creator_user_id||null,creatorName,creatorUsername:authors[0]?.username||row.legacy_creator_username||null,firstRoomCode:meta?.origin_match_id||row.legacy_first_room_code||null,firstSeenAt:meta?.created_at||row.legacy_first_seen_at||null,originUncertain:Boolean(meta?.origin_uncertain),tablesVisited:Number(row.tables_visited||0),holders:Number(meta?.holders||0),recreatedCount:Number(row.legacy_recreated_count||0)},genealogy:{acquisitionSource:meta?.acquisition_source||'legacy_import',sourceUserId:meta?.source_user_id||null,sourceUserName:meta?.source_display_name||null,sourceUsername:meta?.source_username||null,sourceMatchId:meta?.source_match_id||null,acquiredAt:meta?.acquired_at||row.created_at||null}};
  byKey.set(key,card);merged.push(card);
 }

 ok(res,{ownedDistinctCards,cards:merged.map(c=>({...c,
  materialTier:cardMaterialTier(c.matches_used),
  borderTier:border.tier,
  materialProgress:nextTierProgress(c.matches_used,'material'),
  borderProgress:border.progress,
  ownedDistinctCards,
  rarityExplanation:{
   material:'O material muda pela quantidade de partidas diferentes em que você usou esta carta: Bronze >10, Prata >30, Ouro >60, Platina >100.',
   border:'O contorno acompanha o tamanho da sua coleção de cartas diferentes: Bronze 5, Prata 15, Ouro 40, Platina 100.'
  }
 }))});
});
