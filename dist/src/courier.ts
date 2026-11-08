// Fictional, replayable walks; distances are game-world street units.
export const courierStops=[
 {node:0,x:-45,z:-1,name:'Western linden walk',message:'A note for someone resting in the shade.'},
 {node:6,x:44,z:-1,name:'Eastern embankment',message:'A page for a neighbour who watches the river.'},
 {node:10,x:-42,z:22,name:'Opposite-bank bench',message:'A folded drawing for a person taking the long way home.'},
 {node:13,x:42,z:22,name:'South-eastern walk',message:'A concert invitation, with room for one more guest.'},
 {node:14,x:-10,z:-17,name:'Old-town crossroads',message:'A repaired book returned to its reader.'},
 {node:20,x:-30,z:-30,name:'Bookbinder’s corner',message:'A bundle of blank paper. Someone else will choose the words.'},
 {node:23,x:48,z:-7,name:'Open-air museum gate',message:'A sketch of a roof, for somebody learning to look closely.'},
 {node:24,x:8,z:-20,name:'Cathedral approach',message:'A little letter that has finally found an address.'}
];
export type Circuit={seed:number;stops:number[];stamped:boolean[];active:boolean;finished:boolean;walked:number;elapsed:number;optimum:number;origin:{x:number;z:number}};
export function makeCircuit(seed:number,origin:{x:number;z:number},cost:(from:{x:number;z:number},destination:number)=>number):Circuit{
 let state=seed>>>0;const order=courierStops.map((_,i)=>i);for(let i=order.length-1;i>0;i--){state=(Math.imul(state,1664525)+1013904223)>>>0;const j=state%(i+1);[order[i],order[j]]=[order[j],order[i]];}
 const stops=order.slice(0,3);let optimum=Infinity;for(const a of stops)for(const b of stops)for(const c of stops){if(a===b||b===c||a===c)continue;optimum=Math.min(optimum,cost(origin,a)+cost(courierStops[a],b)+cost(courierStops[b],c));}
 return{seed,stops,stamped:[false,false,false],active:true,finished:false,walked:0,elapsed:0,optimum,origin:{...origin}};
}
export function stampStop(c:Circuit,index:number){if(!c.active||index<0||index>2||c.stamped[index])return false;c.stamped[index]=true;if(c.stamped.every(Boolean)){c.finished=true;c.active=false;}return true;}
export function routeEfficiency(c:Circuit){return c.walked>0?Math.min(1,c.optimum/c.walked):1;}
export function routeMedal(c:Circuit){const efficiency=routeEfficiency(c);return efficiency>=.96?'A thoughtful route':efficiency>=.82?'A good wandering route':'A route with room to wander';}
export function restoreCircuit(value:unknown):Circuit|null{if(!value||typeof value!=='object'||Array.isArray(value))return null;const s=value as Record<string,unknown>,origin=s.origin;if(!Array.isArray(s.stops)||s.stops.length!==3||s.stops.some(n=>typeof n!=='number'||!Number.isInteger(n)||n<0||n>=courierStops.length)||new Set(s.stops).size!==3||!Array.isArray(s.stamped)||s.stamped.length!==3||!origin||typeof origin!=='object'||Array.isArray(origin))return null;const p=origin as Record<string,unknown>;if(typeof p.x!=='number'||typeof p.z!=='number'||!Number.isFinite(p.x)||!Number.isFinite(p.z))return null;for(const key of ['seed','walked','elapsed','optimum'])if(typeof s[key]!=='number'||!Number.isFinite(s[key])||(s[key] as number)<0)return null;return{seed:s.seed as number,stops:s.stops as number[],stamped:s.stamped.map(v=>v===true),active:false,finished:s.stamped.every(v=>v===true),walked:s.walked as number,elapsed:s.elapsed as number,optimum:s.optimum as number,origin:{x:p.x,z:p.z}};}
