export const WORLD_W=1440, WATER_TOP=535, WATER_BOTTOM=825;
export const landings=[{x:245,name:'The bookshop',mark:0},{x:720,name:'The garden',mark:1},{x:1195,name:'The last light',mark:2}];
export const palettes=['#e5a893','#bac49a','#eccb87'];
export const letters=[{x:420,y:727},{x:900,y:646},{x:1235,y:763}];
export type MailState=0|1|2;
export type RiverState={version:2;chapter:number;x:number;y:number;vx:number;vy:number;time:number;mail:MailState[][];replies:number[][];muted:boolean;gentle:boolean;finished:boolean};
export type Target={x:number;y:number}|null;
export type RiverEvent={kind:'letter'|'bump';index:number};
export const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
export function blankRiver():RiverState{return{version:2,chapter:0,x:140,y:725,vx:0,vy:0,time:0,mail:[[0,0,0],[0,0,0],[0,0,0]],replies:[[-1,-1,-1],[-1,-1,-1],[-1,-1,-1]],muted:false,gentle:false,finished:false};}
export function restoreRiver(raw:unknown):RiverState{
 const s=blankRiver();if(!raw||typeof raw!=='object'||(raw as {version?:number}).version!==2)return s;
 const r=raw as Partial<RiverState>;
 s.chapter=typeof r.chapter==='number'&&Number.isFinite(r.chapter)?clamp(Math.floor(r.chapter),0,2):0;
 s.x=typeof r.x==='number'&&Number.isFinite(r.x)?clamp(r.x,80,1360):s.x;
 s.y=typeof r.y==='number'&&Number.isFinite(r.y)?clamp(r.y,WATER_TOP,WATER_BOTTOM):s.y;
 s.time=typeof r.time==='number'&&Number.isFinite(r.time)?clamp(r.time,0,1e8):0;
 for(let c=0;c<3;c++)for(let i=0;i<3;i++){
  const m=r.mail?.[c]?.[i],reply=r.replies?.[c]?.[i];
  s.mail[c][i]=m===1||m===2?m:0;s.replies[c][i]=reply===0||reply===1?reply:-1;
 }
 // A chapter can only be reached after every previous delivery.
 for(let c=0;c<s.chapter;c++)if(!s.mail[c].every(m=>m===2)){s.chapter=c;break;}
 s.muted=r.muted===true;s.gentle=r.gentle===true;s.finished=r.finished===true&&s.mail.every(row=>row.every(m=>m===2));
 return s;
}
export function mailPosition(i:number,time:number){return{x:letters[i].x+Math.sin(time*.23+i*2)*18,y:letters[i].y+Math.sin(time*.41+i)*7};}
export function reeds(chapter:number){return[{x:570,y:795,r:34},{x:1020,y:570,r:30},{x:350+chapter*70,y:580,r:28}];}
export function advanceRiver(s:RiverState,dt:number,input:{x:number;y:number;brake:boolean;target:Target}):RiverEvent[]{
 dt=clamp(dt,0,.05);s.time+=dt;const events:RiverEvent[]=[];
 let ix=input.x,iy=input.y;
 if(input.target&&Math.hypot(ix,iy)<.01){const dx=input.target.x-s.x,dy=input.target.y-s.y,len=Math.hypot(dx,dy);if(len>8){const strength=Math.min(1,len/65);ix=dx/len*strength;iy=dy/len*strength;}}
 const size=Math.max(1,Math.hypot(ix,iy));ix/=size;iy/=size;
 const current=s.gentle?0:Math.sin(s.time*.33+s.chapter)*12+9;
 const speed=s.gentle?170:150,drag=input.brake?10:4;
 s.vx+=(ix*speed+current-s.vx)*Math.min(1,dt*drag);s.vy+=(iy*speed*.75-s.vy)*Math.min(1,dt*drag);
 if(input.brake){s.vx*=Math.exp(-dt*8);s.vy*=Math.exp(-dt*8);}
 s.x=clamp(s.x+s.vx*dt,80,1360);s.y=clamp(s.y+s.vy*dt,WATER_TOP,WATER_BOTTOM);
 if(!s.gentle)for(const [i,r] of reeds(s.chapter).entries()){
  const dx=s.x-r.x,dy=s.y-r.y,d=Math.hypot(dx,dy),radius=r.r+22;
  if(d<radius){s.vx*=Math.exp(-dt*3);s.vy*=Math.exp(-dt*3);events.push({kind:'bump',index:i});}
 }
 for(let i=0;i<3;i++)if(s.mail[s.chapter][i]===0){const p=mailPosition(i,s.time);if(Math.hypot(s.x-p.x,s.y-p.y)<49){s.mail[s.chapter][i]=1;events.push({kind:'letter',index:i});}}
 return events;
}
export function nearLanding(s:RiverState){let index=-1,best=110;landings.forEach((l,i)=>{const d=Math.hypot(s.x-l.x,(s.y-535)*1.1);if(d<best){best=d;index=i;}});return index;}
export function deliver(s:RiverState,i:number,reply:number){if(i<0||i>2||reply!==0&&reply!==1||nearLanding(s)!==i||s.mail[s.chapter][i]!==1)return false;s.mail[s.chapter][i]=2;s.replies[s.chapter][i]=reply;return true;}
export function chapterComplete(s:RiverState){return s.mail[s.chapter].every(m=>m===2);}
export function nextChapter(s:RiverState){if(!chapterComplete(s))return false;if(s.chapter===2){s.finished=true;return true;}s.chapter++;s.x=140;s.y=725;s.vx=0;s.vy=0;return true;}
export function deliveredCount(s:RiverState){return s.mail.flat().filter(m=>m===2).length;}
