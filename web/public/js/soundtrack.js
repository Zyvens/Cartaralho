'use strict';

(function soundtrackBootstrap(){
  const STORAGE_KEY='cartaralho:music-muted:v1';
  const VOLUME_KEY='cartaralho:music-volume:v1';
  const AudioCtx=window.AudioContext||window.webkitAudioContext;

  const BPM=166;
  const STEP_SECONDS=60/BPM/2;
  const LOOKAHEAD_SECONDS=.32;
  const SCHEDULER_MS=55;
  const MASTER_LEVEL=.05;
  const LOOP_STEPS=128;

  let context=null,master=null,compressor=null,noiseBuffer=null,scheduler=null;
  let nextStepTime=0,stepIndex=0,unlocked=false;

  function storedMuted(){try{return localStorage.getItem(STORAGE_KEY)==='1';}catch(_){return false;}}
  function storedVolume(){try{const raw=localStorage.getItem(VOLUME_KEY);return raw===null?1:Math.max(0,Math.min(1,Number(raw)||0));}catch(_){return 1;}}
  let muted=storedMuted();
  let volume=storedVolume();

  const chords=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]];
  const roots=[45,41,36,43];
  const barProgression=[0,1,2,3,0,1,2,3,1,3,0,0,1,2,3,3];
  const bassOffsets=[0,7,12,7,0,7,12,7];
  const leadGate=[1,0,1,1,0,1,0,1];
  const melodyBars=[
    [69,null,72,76,null,72,null,69],[69,null,72,77,null,76,null,72],
    [67,null,72,76,null,79,null,76],[67,null,71,74,null,71,null,69],
    [69,null,72,76,null,79,null,76],[69,null,72,77,null,72,null,69],
    [67,null,72,76,null,72,null,67],[67,null,71,74,null,79,null,74],
    [69,72,77,76,null,72,null,69],[71,74,79,74,null,71,null,67],
    [72,76,81,79,null,76,null,72],[69,72,76,81,null,79,null,76],
    [69,72,77,81,null,77,null,72],[67,72,76,79,null,76,null,72],
    [71,74,79,83,null,79,null,74],[67,71,74,79,null,74,71,69]
  ];

  const targetLevel=()=>muted?0.0001:Math.max(.0001,MASTER_LEVEL*volume);
  const midiToHz=note=>440*Math.pow(2,(note-69)/12);

  function resetAudio(){
    if(scheduler){clearInterval(scheduler);scheduler=null;}
    try{master?.disconnect?.();}catch(_){}
    try{compressor?.disconnect?.();}catch(_){}
    context=null;master=null;compressor=null;noiseBuffer=null;unlocked=false;nextStepTime=0;
  }
  function ensureAudio(){
    if(context?.state==='closed')resetAudio();
    if(context||!AudioCtx)return context;
    context=new AudioCtx();master=context.createGain();compressor=context.createDynamicsCompressor();
    compressor.threshold.value=-19;compressor.knee.value=14;compressor.ratio.value=6;compressor.attack.value=.006;compressor.release.value=.18;
    master.gain.value=targetLevel();master.connect(compressor);compressor.connect(context.destination);return context;
  }
  function tone(note,when,duration,type,level,detune=0,attack=.008,cutoff=0){
    if(!context||!master||muted||volume<=0)return;
    const osc=context.createOscillator(),gain=context.createGain();let source=osc;
    osc.type=type;osc.frequency.setValueAtTime(midiToHz(note),when);osc.detune.setValueAtTime(detune,when);
    if(cutoff>0){const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.setValueAtTime(cutoff,when);filter.Q.setValueAtTime(.7,when);osc.connect(filter);source=filter;}
    gain.gain.setValueAtTime(.0001,when);gain.gain.exponentialRampToValueAtTime(level,when+attack);gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
    source.connect(gain);gain.connect(master);osc.start(when);osc.stop(when+duration+.03);
  }
  function getNoiseBuffer(){
    if(noiseBuffer||!context)return noiseBuffer;const length=Math.max(1,Math.floor(context.sampleRate*.22));noiseBuffer=context.createBuffer(1,length,context.sampleRate);const data=noiseBuffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=Math.random()*2-1;return noiseBuffer;
  }
  function noiseHit(when,duration,level,frequency,open=false){
    if(!context||!master||muted||volume<=0)return;const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=getNoiseBuffer();filter.type='highpass';filter.frequency.setValueAtTime(frequency,when);gain.gain.setValueAtTime(level,when);gain.gain.exponentialRampToValueAtTime(.0001,when+duration);source.connect(filter);filter.connect(gain);gain.connect(master);source.start(when);source.stop(when+duration+(open?.03:.01));
  }
  function kick(when,accent=1){
    if(!context||!master||muted||volume<=0)return;const osc=context.createOscillator(),gain=context.createGain();osc.type='sine';osc.frequency.setValueAtTime(138,when);osc.frequency.exponentialRampToValueAtTime(48,when+.09);gain.gain.setValueAtTime(.32*accent,when);gain.gain.exponentialRampToValueAtTime(.0001,when+.13);osc.connect(gain);gain.connect(master);osc.start(when);osc.stop(when+.15);
  }
  function snare(when,accent=1){noiseHit(when,.105,.115*accent,1550);tone(50,when,.065,'triangle',.032*accent,0,.003,1200);}
  function hat(when,open=false,accent=1){noiseHit(when,open?.095:.03,(open?.038:.021)*accent,7000,open);}
  function chordStab(chord,when,accent=1){chord.forEach((note,i)=>{const detune=i===0?-2:i===1?0:2;tone(note,when,STEP_SECONDS*.42,'sawtooth',.026*accent,detune,.004,2400);tone(note+12,when+.004,STEP_SECONDS*.32,'triangle',.013*accent,-detune,.003,3200);});}
  function bass(note,when,accent=1){tone(note,when,STEP_SECONDS*.76,'triangle',.102*accent,0,.004,900);tone(note+12,when,STEP_SECONDS*.54,'square',.026*accent,0,.004,1050);}
  function leadHit(note,when,index,accent=1){if(note===null||note===undefined)return;const d=index%2===0?-2:2;tone(note,when+.008,STEP_SECONDS*.48,'triangle',.055*accent,d,.004,3600);tone(note+12,when+.012,STEP_SECONDS*.34,'square',.014*accent,-d,.003,2600);}
  function chaosFill(chord,when,bar){
    [chord[0]+12,chord[1]+12,chord[2]+12,chord[1]+12].forEach((note,i)=>tone(note,when+i*STEP_SECONDS*.2,STEP_SECONDS*.16,i%2?'triangle':'square',.024,(i%2?-1:1)*2,.002,3000));
    if(bar===15){kick(when+STEP_SECONDS*.42,.82);snare(when+STEP_SECONDS*.68,.72);}
  }
  function scheduleStep(index,when){
    const bar=Math.floor(index/8)%16,within=index%8,progression=barProgression[bar],chord=chords[progression],root=roots[progression],sectionB=bar>=8;
    if(within===0||within===4)kick(when,within===0?1.08:.92);if(sectionB&&within===3&&bar%2===0)kick(when,.66);if(sectionB&&within===7&&bar%2===1)kick(when,.58);if(within===2||within===6)snare(when,within===6?1.04:.94);
    hat(when,within===7&&bar%4===3,within%2===0?1.04:.78);if(within===1||within===5)hat(when+STEP_SECONDS*.5,false,.42);
    if(within===0||within===2||within===4||within===6)bass(root+bassOffsets[within],when,within===0?1.08:.84);if(sectionB&&within===7&&bar%2===0)bass(root+7,when,.62);
    if(within===1||within===3||within===5||(sectionB&&within===7))chordStab(chord,when,within===3?1:.82);
    const melody=melodyBars[bar][within];if(leadGate[within]&&melody!==null)leadHit(melody,when,index,sectionB?1.04:.94);if(within===7&&(bar===3||bar===7||bar===15))chaosFill(chord,when,bar);
  }
  function scheduleAhead(){
    if(!context||context.state!=='running'||muted||volume<=0)return;if(nextStepTime<context.currentTime-.5)nextStepTime=context.currentTime+.05;while(nextStepTime<context.currentTime+LOOKAHEAD_SECONDS){scheduleStep(stepIndex,nextStepTime);nextStepTime+=STEP_SECONDS;stepIndex=(stepIndex+1)%LOOP_STEPS;}
  }
  function ensureScheduler(){if(scheduler)return;nextStepTime=(context?.currentTime||0)+.06;scheduler=setInterval(scheduleAhead,SCHEDULER_MS);scheduleAhead();}
  async function unlockAndPlay(retry=true){
    if(muted||!AudioCtx)return false;let ctx=ensureAudio();if(!ctx)return false;
    try{
      if(ctx.state!=='running')await ctx.resume();
      if(ctx.state==='closed'&&retry){resetAudio();return unlockAndPlay(false);}
      unlocked=ctx.state==='running';
      if(unlocked){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(targetLevel(),ctx.currentTime,.06);ensureScheduler();scheduleAhead();}
      return unlocked;
    }catch(_){
      if(ctx?.state==='closed'&&retry){resetAudio();return unlockAndPlay(false);}
      unlocked=false;return false;
    }
  }
  function persistMuted(){try{localStorage.setItem(STORAGE_KEY,muted?'1':'0');}catch(_){} }
  function persistVolume(){try{localStorage.setItem(VOLUME_KEY,String(volume));}catch(_){} }
  async function setMuted(value){
    muted=!!value;persistMuted();const ctx=ensureAudio();if(!ctx||!master)return false;if(muted){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(.0001,ctx.currentTime,.035);return true;}return unlockAndPlay();
  }
  function setVolume(value){
    volume=Math.max(0,Math.min(1,Number(value)||0));persistVolume();if(context&&master&&context.state!=='closed'){master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(targetLevel(),context.currentTime,.035);}return volume;
  }
  function installAutoplayUnlock(){const attempt=()=>{if(!muted)unlockAndPlay();};['touchstart','touchend','pointerdown','pointerup','click','keydown'].forEach(type=>document.addEventListener(type,attempt,{capture:true,passive:type!=='keydown'}));}
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!muted)unlockAndPlay();});
  window.addEventListener('pageshow',()=>{if(!muted)unlockAndPlay();});
  function init(){if(!AudioCtx){muted=true;return;}installAutoplayUnlock();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

  window.CartSoundtrack={
    get muted(){return muted;},get volume(){return volume;},get state(){return context?.state||'none';},
    mute(){return setMuted(true);},unmute(){return setMuted(false);},resume(){return unlockAndPlay();},setVolume
  };
})();
