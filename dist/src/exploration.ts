// The walks and found objects belong to the game's fictional memory-keeper.
// Routes use a fixed street graph: the Uzh can only be crossed at the bridge.
export type Place={x:number;z:number};
export const roads:Place[]=[
 {x:-45,z:-1},{x:-27,z:-1},{x:-10,z:-1},{x:-5,z:-1},{x:9,z:-1},{x:25,z:-1},{x:44,z:-1},
 {x:-5,z:22},{x:-5,z:7},{x:-5,z:18},{x:-42,z:22},{x:-25,z:22},{x:15,z:22},{x:42,z:22},
 {x:-10,z:-17},{x:8,z:-17},{x:25,z:-17},{x:-30,z:-17},{x:-44,z:-17},{x:-10,z:-30},{x:-30,z:-30},
 {x:25,z:-12},{x:48,z:-17},{x:48,z:-7},{x:8,z:-20},{x:51,z:22},{x:51,z:37},{x:38,z:37}
];
export const edges:number[][]=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[3,8],[8,9],[9,7],[7,11],[11,10],[7,12],[12,13],[2,14],[14,15],[15,16],[16,21],[14,17],[17,18],[14,19],[19,20],[20,17],[6,23],[22,23],[15,24],[13,25],[25,26],[26,27]];
export const entrances=[21,4,1,8];
export const discoveries=[
 {name:'The printer’s scrap',node:17,site:0,object:'A folded paper',title:'Many names, one place',body:'Ungvár. Užhorod. Ужгород. Imagine a printer changing the type while the same river moves past the window. A name carries a language and a point of view.',detail:'Fictional found object. The castle museum discusses the older names Ung and Ungvar and the later official use of Uzhhorod.'},
 {name:'The warm window',node:6,site:1,object:'A tiny brass key',title:'History has an inside',body:'A city is not only what you can point at from the street. Someone once warmed their hands here, worried about tomorrow, and made room for a guest.',detail:'A fictional everyday-life vignette, not a recovered historical testimony.'},
 {name:'The unfinished postcard',node:18,site:0,object:'An unwritten postcard',title:'Who gets the last word?',body:'There is a drawing of the castle, but no message. The sender has left you the harder part: say what matters without pretending the view contains everything.',detail:'A fictional postcard inspired by the castle’s changing roles.'},
 {name:'The linden leaf',node:10,site:2,object:'A pressed leaf',title:'A gift that takes decades',body:'The promenade’s trees were planted in 1928. Their shade reaches people their planters never met. You press a leaf between the pages and leave the branch intact.',detail:'Fictional leaf; the planting date is documented by municipal tourism.'},
 {name:'The listening bench',node:12,site:1,object:'A concert programme',title:'Listen past the walls',body:'The organ installed in 1974 has 2,250 pipes. The imagined programme asks you to listen to the present without allowing it to erase the building’s Jewish past.',detail:'Fictional programme. The organ details are documented; the note is the game’s writing.'},
 {name:'The ferryman’s thread',node:19,site:3,object:'A blue thread',title:'A route can survive its bridge',body:'The iron bridge was destroyed in 1944. Later, a different bridge carried people between the banks. Repair is not the same as returning to the past.',detail:'Fictional thread. The predecessor bridge’s destruction is documented by municipal tourism.'}
];
export const distance=(a:Place,b:Place)=>Math.hypot(a.x-b.x,a.z-b.z);
export function nearestRoad(p:Place){let best=0;for(let i=1;i<roads.length;i++)if(distance(p,roads[i])<distance(p,roads[best]))best=i;return best;}
export function route(from:Place,to:number):Place[]{
 const start=nearestRoad(from),dist=roads.map(()=>Infinity),prev=roads.map(()=>-1),used=roads.map(()=>false);dist[start]=0;
 for(let k=0;k<roads.length;k++){let u=-1;for(let i=0;i<roads.length;i++)if(!used[i]&&(u<0||dist[i]<dist[u]))u=i;if(u<0||!Number.isFinite(dist[u]))break;used[u]=true;if(u===to)break;
  for(const edge of edges){const v=edge[0]===u?edge[1]:edge[1]===u?edge[0]:-1;if(v<0)continue;const nd=dist[u]+distance(roads[u],roads[v]);if(nd<dist[v]){dist[v]=nd;prev[v]=u;}}
 }
 const indices:number[]=[];for(let i=to;i!==-1;i=prev[i]){indices.unshift(i);if(i===start)break;}return indices.map(i=>({...roads[i]}));
}
export function advance(p:Place,path:Place[],dt:number,speed=14,measure?:(walked:number)=>void){let left=dt*speed,walked=0;while(path.length&&left>0){const q=path[0],len=distance(p,q);if(len<=left){p.x=q.x;p.z=q.z;path.shift();left-=len;walked+=len;}else{p.x+=(q.x-p.x)/len*left;p.z+=(q.z-p.z)/len*left;walked+=left;left=0;}}if(measure)measure(walked);return path.length===0;}
export function stepRoad(p:Place,dx:number,dz:number){const start=nearestRoad(p),a=roads[start];let best=-1,bestDot=.3;for(const e of edges){const i=e[0]===start?e[1]:e[1]===start?e[0]:-1;if(i<0)continue;const b=roads[i],len=distance(a,b),dot=((b.x-a.x)*dx+(b.z-a.z)*dz)/len;if(dot>bestDot){best=i;bestDot=dot;}}return best;}
