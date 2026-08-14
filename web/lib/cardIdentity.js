'use strict';

const TYPE_ALIASES=Object.freeze({white:'white',whiteCards:'white',black:'black',blackCards:'black'});
const CANONICAL_TO_LEGACY=Object.freeze({white:'whiteCards',black:'blackCards'});
const INVISIBLE_CODE_POINTS=new Set([0x200B,0x200C,0x200D,0x2060,0xFEFF]);
const BLACK_GAP='______';

function canonicalCardType(type){const canonical=TYPE_ALIASES[String(type||'')];if(!canonical)throw new Error('Tipo de carta inválido.');return canonical;}
function legacyCardType(type){return CANONICAL_TO_LEGACY[canonicalCardType(type)];}
function cleanDisplayText(text){let out='';for(const char of String(text??'').normalize('NFKC')){const code=char.codePointAt(0);if(code===9||code===10||code===11||code===12||code===13){out+=' ';continue;}if(code<=31||(code>=127&&code<=159)||INVISIBLE_CODE_POINTS.has(code))continue;out+=char;}return out.trim().replace(/\s+/gu,' ');}
function normalizeBlackCardDisplay(text,{requireGap=true}={}){
 const cleaned=cleanDisplayText(text);
 if(requireGap&&!/_+/u.test(cleaned))throw new Error('Toda Carta Preta precisa ter pelo menos uma lacuna (_).');
 return cleaned.replace(/\s*_+\s*/gu,` ${BLACK_GAP} `).replace(/\s+([,.!?;:])/gu,'$1').replace(/\s+/gu,' ').trim();
}
function prepareDisplayText(type,text,{requireBlackGap=false}={}){const cardType=canonicalCardType(type);return cardType==='black'?normalizeBlackCardDisplay(text,{requireGap:requireBlackGap}):cleanDisplayText(text);}
function normalizeCardText(text){return cleanDisplayText(text).toLowerCase();}
// Identidade canônica preserva cartas históricas; a normalização de lacuna é aplicada apenas no fluxo de nova criação.
function canonicalIdentity(type,text){const cardType=canonicalCardType(type),displayText=cleanDisplayText(text),normalizedText=normalizeCardText(displayText);if(!normalizedText)throw new Error('O texto da carta não pode ficar vazio.');return{cardType,normalizedText,displayText};}
function sameCanonicalCard(aType,aText,bType,bText){const a=canonicalIdentity(aType,aText),b=canonicalIdentity(bType,bText);return a.cardType===b.cardType&&a.normalizedText===b.normalizedText;}
function creationKind(canonicalCard,matchId){if(!canonicalCard||!matchId||canonicalCard.origin_uncertain)return'independent';return String(canonicalCard.origin_match_id||'')===String(matchId)?'original':'independent';}
function submissionIsCreation(userId,alreadyOwned){return Boolean(userId&&!alreadyOwned);}
module.exports={BLACK_GAP,canonicalCardType,legacyCardType,cleanDisplayText,normalizeBlackCardDisplay,prepareDisplayText,normalizeCardText,canonicalIdentity,sameCanonicalCard,creationKind,submissionIsCreation};
