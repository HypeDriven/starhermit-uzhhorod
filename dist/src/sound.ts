import {context as audio} from 'starhermit:audio';
import type {AudioBuffer,GainNode,AudioBufferSourceNode} from 'starhermit:audio';
let mixer:GainNode|null=null,started=false,music:AudioBuffer|null=null,water:AudioBuffer|null=null,paper:AudioBuffer|null=null;
const loops:AudioBufferSourceNode[]=[];
export async function loadSound(){
 const results=await Promise.allSettled([audio.loadBuffer('assets/music.ogg'),audio.loadBuffer('assets/water.ogg'),audio.loadBuffer('assets/paper.ogg')]);
 if(results[0].status==='fulfilled')music=results[0].value;
 if(results[1].status==='fulfilled')water=results[1].value;
 if(results[2].status==='fulfilled')paper=results[2].value;
}
export function startSound(muted:boolean){
 if(started)return;started=true;mixer=audio.createGain();mixer.gain.value=muted?0:.8;mixer.connect(audio.destination);
 for(const [buffer,volume] of [[music,.42],[water,.25]] as const)if(buffer){const source=audio.createBufferSource(),gain=audio.createGain();source.buffer=buffer;source.loop=true;gain.gain.value=volume;source.connect(gain);gain.connect(mixer);source.start();loops.push(source);}
}
export function muteSound(muted:boolean){if(mixer)mixer.gain.setTargetAtTime(muted?0:.8,audio.currentTime,.12);}
export function chime(delivery=false){
 if(!mixer)return;
 if(paper){const source=audio.createBufferSource(),g=audio.createGain();source.buffer=paper;g.gain.value=.25;source.connect(g);g.connect(mixer);source.onended=()=>{source.disconnect();g.disconnect();};source.start();}
 for(const [i,hz] of (delivery?[392,493.88,587.33]:[440,659.25]).entries()){
  const source=audio.createOscillator(),g=audio.createGain(),at=audio.currentTime+i*.11;
  source.type='sine';source.frequency.value=hz;g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(.075,at+.02);g.gain.exponentialRampToValueAtTime(.001,at+1.2);source.connect(g);g.connect(mixer);source.onended=()=>{source.disconnect();g.disconnect();};source.start(at);source.stop(at+1.3);
 }
}
