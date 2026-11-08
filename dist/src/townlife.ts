// A fictional, accelerated town day. These are game events, not real opening hours.
export const dayEvents=[
 {name:'The morning market',node:14,start:9,end:13,kind:'market',description:'Pack a balanced basket of little gifts.'},
 {name:'The reading circle',node:20,start:14,end:17,kind:'reading',description:'Arrange a shared sentence and choose what to leave in its margin.'},
 {name:'The evening recital',node:4,start:18,end:21,kind:'recital',description:'Play four short phrases with the neighbourhood musicians.'}
];
export type TownDay={day:number;minute:number;running:boolean;weather:number;stamps:number[];visits:number[];margin:number};
export function blankTown():TownDay{return{day:1,minute:8*60,running:true,weather:-1,stamps:[0,0,0],visits:[0,0,0],margin:-1};}
export function advanceTown(town:TownDay,seconds:number){if(!town.running)return;const total=town.minute+Math.max(0,seconds)*2;town.day+=Math.floor(total/1440);town.minute=total%1440;}
export function weatherAt(town:TownDay){return town.weather>=0?town.weather:((town.day+Math.floor(town.minute/180))%6===0?1:(town.day+Math.floor(town.minute/240))%5===0?2:0);}
export const weatherNames=['Clear','Rain','Mist'];
export function timeLabel(town:TownDay){const hours=Math.floor(town.minute/60),minutes=Math.floor(town.minute%60);return String(hours).padStart(2,'0')+':'+String(minutes).padStart(2,'0');}
export function isEventOpen(town:TownDay,index:number){const e=dayEvents[index],hour=town.minute/60;return hour>=e.start&&hour<e.end;}
export function waitForEvent(town:TownDay,index:number){if(isEventOpen(town,index))return;const start=dayEvents[index].start*60;if(town.minute>=start)town.day++;town.minute=start;}
export function stampEvent(town:TownDay,index:number){if(town.stamps[index]===town.day)return false;town.stamps[index]=town.day;town.visits[index]++;return true;}
export function loadTown(value:unknown,legacyNight=false):TownDay{const out=blankTown();if(legacyNight)out.minute=21*60;if(!value||typeof value!=='object'||Array.isArray(value))return out;const s=value as Record<string,unknown>;if(typeof s.day==='number'&&Number.isFinite(s.day))out.day=Math.max(1,Math.floor(s.day));if(typeof s.minute==='number'&&Number.isFinite(s.minute))out.minute=((s.minute%1440)+1440)%1440;out.running=s.running!==false;if(typeof s.weather==='number'&&Number.isInteger(s.weather)&&s.weather>=-1&&s.weather<=2)out.weather=s.weather;for(const key of ['stamps','visits'] as const)if(Array.isArray(s[key])&&s[key].length===3)out[key]=s[key].map(v=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.floor(v)):0);if(typeof s.margin==='number'&&Number.isInteger(s.margin)&&s.margin>=-1&&s.margin<3)out.margin=s.margin;return out;}
export const marketWeights=[2,3,1];
export function marketGoal(day:number){const recipes=[[1,2,1],[2,1,1],[1,1,2]],recipe=recipes[(day-1)%3];return{count:4,weight:recipe.reduce((n,v,i)=>n+v*marketWeights[i],0)};}
export function basketReady(counts:number[],day:number){const goal=marketGoal(day);return counts.length===3&&counts.every(v=>Number.isInteger(v)&&v>=1&&v<=4)&&counts.reduce((n,v)=>n+v,0)===goal.count&&counts.reduce((n,v,i)=>n+v*marketWeights[i],0)===goal.weight;}
export const readingLines=['A city','keeps its stories','when its people','make room to listen.'];
export function readingReady(order:number[]){return order.length===4&&order.every((v,i)=>v===i);}
export type Recital={bar:number;beat:number;phase:number;hit:boolean;barHits:number;done:boolean;assist:boolean;error:number;cue:number;repeats:number};
export const recitalNotes=[[0,1,2,1],[2,3,1,0],[0,2,3,2],[1,3,2,0]];
export function newRecital():Recital{return{bar:0,beat:0,phase:-.3,hit:false,barHits:0,done:false,assist:false,error:0,cue:-1,repeats:0};}
export function tapRecital(r:Recital,lane:number){if(r.done||r.hit)return false;if(lane!==recitalNotes[r.bar][r.beat]||r.phase<.55||r.phase>1.08){r.error=.5;return false;}r.hit=true;r.barHits++;return true;}
export function advanceRecital(r:Recital,dt:number){r.error=Math.max(0,r.error-dt);if(r.done)return -1;if(!r.assist||r.hit||r.phase<.82)r.phase+=dt/.8;const id=r.bar*4+r.beat;let note=-1;if(r.phase>=0&&r.cue!==id){r.cue=id;note=recitalNotes[r.bar][r.beat];}if(r.phase>=1.08){r.phase=0;r.hit=false;r.beat++;if(r.beat===4){r.beat=0;if(r.barHits>=3){r.bar++;if(r.bar===4){r.done=true;r.bar=3;return note;}}else r.repeats++;r.barHits=0;r.cue=-1;}}return note;}
