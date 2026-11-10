// Quiet, locally synthesised water and birds. Nothing plays until a user asks.
export function createGardenAudio(win){
 const onVisibility=()=>{if(master)master.gain.setTargetAtTime(win.document?.hidden?0:volume,context.currentTime,.15);};
 let context=null,master=null,water=null,timer=null,enabled=false,volume=.22;
 async function start(){
  const AudioContext=win.AudioContext||win.webkitAudioContext;if(!AudioContext)throw new Error('Garden audio is not supported in this browser.');
  if(!context){context=new AudioContext();master=context.createGain();master.gain.value=volume;master.connect(context.destination);win.document?.addEventListener('visibilitychange',onVisibility);
   const buffer=context.createBuffer(1,context.sampleRate*4,context.sampleRate),samples=buffer.getChannelData(0);let smooth=0;
   for(let i=0;i<samples.length;i++){smooth=(smooth+Math.random()*.12-.06)/1.025;samples[i]=smooth*3;}
   water=context.createBufferSource();water.buffer=buffer;water.loop=true;const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1400;water.connect(filter);filter.connect(master);water.start();
  }
  await context.resume();enabled=true;
  if(!timer)timer=win.setInterval(()=>{if(!enabled||win.document?.hidden)return;const now=context.currentTime;for(let i=0;i<3;i++){const oscillator=context.createOscillator(),gain=context.createGain(),at=now+i*.16;oscillator.type='sine';oscillator.frequency.setValueAtTime(2200+i*340,at);oscillator.frequency.exponentialRampToValueAtTime(3500+i*180,at+.07);oscillator.frequency.exponentialRampToValueAtTime(2400,at+.14);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.07,at+.025);gain.gain.exponentialRampToValueAtTime(.0001,at+.15);oscillator.connect(gain);gain.connect(master);oscillator.start(at);oscillator.stop(at+.17);}},4300);
 }
 async function stop(){enabled=false;if(timer){win.clearInterval(timer);timer=null;}if(context)await context.suspend();}
 return {start,stop,get enabled(){return enabled;},get volume(){return volume;},setVolume(value){volume=Math.max(0,Math.min(.5,Number(value)||0));if(master)master.gain.setTargetAtTime(volume,context.currentTime,.08);},async dispose(){await stop();if(context)await context.close();context=null;win.document?.removeEventListener('visibilitychange',onVisibility);}};
}
