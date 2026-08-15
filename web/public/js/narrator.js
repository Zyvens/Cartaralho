'use strict';

(function narratorBootstrap(){
  const synth=window.speechSynthesis||null;
  let voice=null;
  let lastRound=0;
  let lastSpoken='';
  let deferredRound=null;

  const enabled=()=>!!(synth&&window.App?.state?.isCreator&&window.App?.state?.config?.narratorEnabled);
  const text=v=>{const raw=typeof v==='string'?v:v?.text||v?.card?.text||'';return String(raw||'').replace(/_{2,}/g,' lacuna ').replace(/\s+/g,' ').trim();};
  function chooseVoice(){if(!synth)return null;const voices=synth.getVoices?.()||[];voice=voices.find(v=>/^pt-BR$/i.test(v.lang))||voices.find(v=>/^pt/i.test(v.lang))||voices[0]||null;return voice;}
  function speak(message,{interrupt=true,rate=1.03,pitch=.98}={}){if(!enabled())return false;const copy=String(message||'').replace(/\s+/g,' ').trim();if(!copy||copy===lastSpoken)return false;lastSpoken=copy;if(interrupt)synth.cancel();const u=new SpeechSynthesisUtterance(copy);u.lang='pt-BR';u.rate=rate;u.pitch=pitch;u.volume=.92;u.voice=voice||chooseVoice();synth.speak(u);return true;}
  function cancel(){try{synth?.cancel();}catch(_){}lastSpoken='';deferredRound=null;}
  function answerText(submission){const cards=Array.isArray(submission?.cards)&&submission.cards.length?submission.cards:[submission?.card??submission];const parts=cards.map(text).filter(Boolean);return parts.length>1?parts.join('. E depois: '):parts[0]||'';}
  function submissionTexts(data){return(data?.submissions||[]).map(answerText).filter(Boolean);}
  function announceRound(data,{interrupt=true}={}){const round=Number(data?.roundNumber||App.state.roundNumber||0);if(round&&round===lastRound)return false;lastRound=round;const card=text(data?.blackCard||App.state.currentBlackCard);return speak(`${round?`Rodada ${round}. `:''}${card?`Carta preta: ${card}`:'Nova rodada.'}`,{interrupt});}
  function flushDeferredRound(){const data=deferredRound;deferredRound=null;if(!data)return false;return announceRound(data,{interrupt:false});}

  function register(){
    chooseVoice();
    if(synth&&'onvoiceschanged'in synth)synth.onvoiceschanged=chooseVoice;
    SocketClient.on('room_config_updated',d=>{if(d?.config?.narratorEnabled===false)cancel();});
    SocketClient.on('game_started',()=>speak('Atenção. A partida começou. Preparem o bom senso para ser descartado.'));
    SocketClient.on('new_round',data=>{if(window.App?.state?.playerShowcaseActive){deferredRound=data;return;}announceRound(data);});
    SocketClient.on('all_cards_played',data=>{const cards=submissionTexts(data);if(!cards.length){speak('Todas as respostas chegaram. Hora do julgamento.',{interrupt:false});return;}const reading=cards.map((c,i)=>`Resposta ${i+1}: ${c}.`).join(' ');speak(`Todas as respostas chegaram. ${reading} Mestre, escolha o estrago.`,{rate:1});});
    SocketClient.on('round_result',data=>{const winner=String(data?.winnerNickname||'').trim(),winnerCards=Array.isArray(data?.winnerCards)&&data.winnerCards.length?data.winnerCards:[data?.winnerCard],card=winnerCards.map(text).filter(Boolean).join('. E: ');speak(`${winner?`${winner} venceu a rodada. `:'Temos uma resposta vencedora. '}${card?`A resposta escolhida foi: ${card}.`:''}`);});
    SocketClient.on('game_over',data=>{const winner=String(data?.winnerNickname||data?.ranking?.[0]?.nickname||'').trim();speak(winner?`Fim de jogo. ${winner} venceu o Cartaralho. Parabéns, eu acho.`:'Fim de jogo. O caos foi oficialmente encerrado.');});
    SocketClient.on('room_cancelled',cancel);SocketClient.on('room_closed',cancel);
  }

  window.CartNarrator={speak,cancel,enabled:()=>enabled(),supported:!!synth,chooseVoice,answerText,flushDeferredRound};
  document.addEventListener('DOMContentLoaded',register,{once:true});
})();
