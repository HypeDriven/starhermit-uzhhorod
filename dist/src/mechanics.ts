// Four distinct, fictional memory-restoration mechanisms. Historical
// evidence is kept in history.ts and follows each mechanism.
export type Challenge={site:number;elapsed:number;done:boolean;hint:boolean;rings:number[];tiles:number[];wet:boolean[];sequence:number[];round:number;input:number[];playhead:number;playing:boolean;lastNote:number;error:number;boat:number;aim:number;distance:number;gates:number;bumps:number;calm:boolean;hit:boolean[];weatherFactor:number};
const sequences=[[0,2,1],[2,0,3,1],[1,3,0,2,1]];
export const rootMasks=[7,10,10,13,5,0,0,5,5,0,0,5,3,10,10,13];
const N=1,E=2,S=4,W=8;
export function rotateMask(mask:number,steps:number){for(let i=0;i<steps%4;i++)mask=((mask<<1)&15)|((mask>>3)&1);return mask;}
export function createChallenge(site:number):Challenge{return{site,elapsed:0,done:false,hint:false,rings:[3,6,1],tiles:[1,2,3,1,1,0,0,3,2,0,0,1,3,1,2,1],wet:Array(16).fill(false) as boolean[],sequence:sequences[0].slice(),round:0,input:[],playhead:-.6,playing:true,lastNote:-1,error:0,boat:.5,aim:.5,distance:0,gates:0,bumps:0,calm:false,hit:[false,false,false,false,false],weatherFactor:1};}
export function turnRing(c:Challenge,i:number){if(c.done)return;c.rings[i]=(c.rings[i]+1)%8;c.done=c.rings.every(v=>v===0);}
export function waterNetwork(c:Challenge){const masks=rootMasks.map((m,i)=>rotateMask(m,c.tiles[i])),wet=Array(16).fill(false) as boolean[];const queue:number[]=[];if(masks[15]&S){wet[15]=true;queue.push(15);}
 while(queue.length){const i=queue.shift()!,x=i%4,y=Math.floor(i/4);for(const [bit,op,delta,okay] of [[N,S,-4,y>0],[E,W,1,x<3],[S,N,4,y<3],[W,E,-1,x>0]] as [number,number,number,boolean][]){const j=i+delta;if(okay&&(masks[i]&bit)&&(masks[j]&op)&&!wet[j]){wet[j]=true;queue.push(j);}}}
 c.wet=wet;c.done=wet[0]&&!!(masks[0]&N)&&wet[3]&&!!(masks[3]&N);return c.done;
}
export function turnTile(c:Challenge,i:number){if(c.done||rootMasks[i]===0)return;c.tiles[i]=(c.tiles[i]+1)%4;waterNetwork(c);}
export function replay(c:Challenge){c.input=[];c.playhead=-.6;c.playing=true;c.lastNote=-1;c.error=0;}
export function playNote(c:Challenge,n:number){if(c.done||c.playing)return false;c.lastNote=n;c.input.push(n);if(c.sequence[c.input.length-1]!==n){c.error=1.5;c.input=[];return false;}if(c.input.length===c.sequence.length){if(c.round===2){c.done=true;}else{c.round++;c.sequence=sequences[c.round].slice();replay(c);}}return true;}
export const riverGates=[{at:.16,gap:.28},{at:.33,gap:.7},{at:.5,gap:.4},{at:.69,gap:.73},{at:.86,gap:.3}];
export function updateChallenge(c:Challenge,dt:number,axis=0){c.elapsed+=dt;c.error=Math.max(0,c.error-dt);if(c.done)return -1;
 if(c.site===1&&c.playing){c.playhead+=dt/.62;const i=Math.floor(c.playhead);if(i>=c.sequence.length){c.playing=false;c.lastNote=-1;return -1;}if(i>=0&&i!==c.lastNote){c.lastNote=i;return c.sequence[i];}}
 if(c.site===3){c.distance=Math.min(1,c.distance+dt*.041);c.aim=Math.max(.08,Math.min(.92,c.aim+axis*dt*.65));c.boat+=(c.aim-c.boat)*Math.min(1,dt*8);c.boat=Math.max(.06,Math.min(.94,c.boat+(c.calm?0:Math.sin(c.elapsed*1.4)*dt*.035*c.weatherFactor)));
  for(let i=0;i<riverGates.length;i++){const g=riverGates[i];if(c.hit[i]||c.distance<g.at)continue;c.hit[i]=true;if(Math.abs(c.boat-g.gap)<(c.calm?.31:.21)){c.gates++;}else{c.bumps++;c.error=1.1;c.distance=Math.max(0,c.distance-.075);c.aim=g.gap;c.boat=g.gap;c.hit[i]=false;}}
  if(c.distance>=1)c.done=true;
 }
 return -1;
}
