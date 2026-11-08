import { AmbientLight, DirectionalLight, PointLight, Color, Group, Mesh, BoxGeometry, SphereGeometry, CylinderGeometry, ConeGeometry, TorusGeometry, CircleGeometry, BufferGeometry, Float32BufferAttribute, MeshStandardMaterial, MeshBasicMaterial, OrthographicCamera, Vector3, InstancedMesh, scene, renderer, ACESFilmicToneMapping, FogExp2 } from 'starhermit:scene';
import {roads,edges,discoveries,route,advance} from './exploration.js';
import type {Place} from './exploration.js';
import {residents,repairLamps} from './stories.js';
import {archiveCases} from './investigation.js';
import {exhibitOrder} from './exhibition.js';
import type {ExhibitLayout} from './exhibition.js';
import {defaultDesign} from './workshop.js';
import type {LanternDesign} from './workshop.js';
import {studies} from './fieldwork.js';

export const sites = [
 {x:25,y:13,z:-22}, {x:8,y:6,z:-5}, {x:-27,y:5,z:-4}, {x:-5,y:3,z:7}
];
const TAU=Math.PI*2;
const rand=(n:number)=>{const a=Math.sin(n*127.1+47.7)*43758.5453;return a-Math.floor(a);};
const stone=new MeshStandardMaterial({color:0xbbb2a0,roughness:.95});
const paving=new MeshStandardMaterial({color:0xaaa995,roughness:1});
const trim=new MeshStandardMaterial({color:0xe8d3ae,roughness:.8});
const iron=new MeshStandardMaterial({color:0x243c3f,roughness:.65,metalness:.3});
const bark=new MeshStandardMaterial({color:0x63534e,roughness:1});
const gold=new MeshStandardMaterial({color:0xe5b86e,emissive:0xffba61,emissiveIntensity:.8,roughness:.4});
const glass=new MeshStandardMaterial({color:0xffdc98,emissive:0xffc16f,emissiveIntensity:1.7});
const water=new MeshStandardMaterial({color:0x237a84,emissive:0x103c48,emissiveIntensity:.5,metalness:.35,roughness:.2});
const boatGlow=new MeshStandardMaterial({color:0xffd899,emissive:0xffc577,emissiveIntensity:2.3});
const flowerColors=[0xe5a1b9,0xe5c787,0xc0b9db].map(color=>new MeshStandardMaterial({color,roughness:.8}));
const boxGeo=new BoxGeometry(1,1,1),sphere=new SphereGeometry(1,10,8),cylinder=new CylinderGeometry(1,1,1,10),cone=new ConeGeometry(1,1,8);
const flows:Mesh[]=[];const lamps:Mesh[]=[];const beacons:Group[]=[];const petals:InstancedMesh[]=[];const boats:Group[]=[];const memoryRings:Mesh[]=[];
const dummy=new Group();
const walkers:Group[]=[],birds:Group[]=[],findObjects:Group[]=[],routeDots:Mesh[]=[],restorationShafts:Mesh[]=[];
const citizens:Group[]=[],repairFlames:Mesh<MeshStandardMaterial>[]=[],festival:Group=new Group(),gardenTrees:Group[]=[],flowerGarden:Group=new Group(),cats:Group[]=[];
const actorLegs=new Map<Group,Mesh[]>(),wasCompany=[false,false,false],companyReturnPaths:Place[][]=[[],[],[]],walkRibbons:Group[]=[];
const gatheringPaths:Place[][]=[],citizenPaths:Place[][]=[];let wasGathering=false;
let townSun:DirectionalLight,townAmbient:AmbientLight,rainMesh:InstancedMesh,rainBlend=0,wetness=0,basket:Group;
const puddles:Mesh[]=[],umbrellas:Group[]=[],marketStalls=new Group(),recitalStage=new Group(),marginBoard=new Group(),marginNotes:Group[]=[];
const archiveGems:Mesh<MeshStandardMaterial>[]=[],archiveDisplay=new Group(),archiveBanners:Group[]=[];
type LanternModel={group:Group;hull:Mesh<MeshStandardMaterial>;rig:Group;sail:Mesh<MeshStandardMaterial>;light:Mesh<MeshStandardMaterial>;marks:Group[];weights:Mesh[]};
const fleetModels:LanternModel[]=[];let benchModel:LanternModel;
type ExhibitStand={group:Group;seat:Group;plinth:Group;contents:Group[];plaque:Mesh<MeshStandardMaterial>;architecture:Mesh<MeshStandardMaterial>[];architectureMat:MeshStandardMaterial;roofMat:MeshStandardMaterial;boat:LanternModel};
const exhibitStands:ExhibitStand[]=[],exhibitPeople:Group[]=[],exhibitLamps:PointLight[]=[],exhibitRibbons:Group[]=[];let exhibitCanopy:Mesh<MeshStandardMaterial>;
let keeper:Group,feet:Mesh[]=[],season=0;
export function setSeason(n:number){season=n;const palette=n===0?[0x537956,0x6c8b61,0x8b9c6a,0xd894b0,0xedb6c5,0xe5a4b9]:n===1?[0x537956,0x6c8b61,0x8b9c6a,0x4c7954,0x6e9965,0x92ac78]:[0xb47b43,0xd09b4b,0x9c663e,0xc89451,0xdcad6b,0xa76c48];leaves.forEach((m,i)=>m.color.setHex(palette[i]));}
export function groundFromScreen(x:number,y:number,w:number,h:number){const a=new Vector3(x/w*2-1,1-y/h*2,-1).unproject(camera),b=new Vector3(x/w*2-1,1-y/h*2,1).unproject(camera);const k=(1-a.y)/(b.y-a.y);return{x:a.x+(b.x-a.x)*k,z:a.z+(b.z-a.z)*k};}
export const camera=new OrthographicCamera(-60,60,40,-40,.1,550);
export const target=new Vector3(0,1,-5);
let angle=.64,desiredAngle=.64,zoom=1,desiredZoom=1,viewX=0,viewZ=-5,viewY=2,night=false,zoomLimit=2.5;
export let orbiting=false;
export function orbit(dx:number){desiredAngle+=dx*.006;orbiting=true;}
export function magnify(d:number){desiredZoom=Math.max(.75,Math.min(zoomLimit,desiredZoom+d));}
export function overview(){zoomLimit=2.5;orbiting=false;viewX=0;viewZ=-5;viewY=2;desiredZoom=1;}
export function focus(i:number){zoomLimit=2.5;viewX=sites[i].x*.62;viewZ=sites[i].z*.65;viewY=2;desiredZoom=1.48;}
export function focusStudy(i:number){zoomLimit=2.5;const p=studies[i].position;viewX=p.x;viewZ=p.z;viewY=p.y;desiredZoom=2.15;desiredAngle=.64;}
export function residentPlace(i:number):Place{const p=citizens[i]?.position;return p?{x:p.x,z:p.z}:{...roads[residents[i].node]};}
export function focusExhibition(){zoomLimit=10;viewX=38;viewZ=37;viewY=1.8;desiredZoom=8;desiredAngle=.64;}
export function focusEvening(node:number){zoomLimit=2.5;const p=roads[node];viewX=p.x;viewZ=p.z;viewY=3;desiredZoom=1.8;desiredAngle=.64;}
export function focusWorkshop(){zoomLimit=2.5;viewX=15;viewZ=24;viewY=2.5;desiredZoom=2.2;desiredAngle=.64;}
export function setNight(n:boolean){night=n;}
function mesh<T extends MeshStandardMaterial|MeshBasicMaterial>(geo:BufferGeometry,mat:T,x:number,y:number,z:number,sx=1,sy=1,sz=1,parent:Group|typeof scene=scene){const m=new Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box<T extends MeshStandardMaterial|MeshBasicMaterial>(x:number,y:number,z:number,sx:number,sy:number,sz:number,mat:T,parent:Group|typeof scene=scene){return mesh(boxGeo,mat,x,y,z,sx,sy,sz,parent);}
function ball(x:number,y:number,z:number,r:number,mat:MeshStandardMaterial|MeshBasicMaterial,parent:Group|typeof scene=scene){return mesh(sphere,mat,x,y,z,r,r,r,parent);}
function rod(a:Vector3,b:Vector3,r:number,mat:MeshStandardMaterial,parent:Group|typeof scene=scene){const d=b.clone().sub(a),m=mesh(cylinder,mat,(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2,r,d.length(),r,parent);m.quaternion.setFromUnitVectors(new Vector3(0,1,0),d.normalize());return m;}
function roof(w:number,h:number,d:number){const p=[-w/2,0,-d/2,w/2,0,-d/2,0,h,-d/2, -w/2,0,d/2,0,h,d/2,w/2,0,d/2, -w/2,0,-d/2,0,h,-d/2,0,h,d/2,-w/2,0,-d/2,0,h,d/2,-w/2,0,d/2, w/2,0,-d/2,w/2,0,d/2,0,h,d/2,w/2,0,-d/2,0,h,d/2,0,h,-d/2];for(let i=0;i<p.length;i+=9){for(let j=0;j<3;j++){const v=p[i+3+j];p[i+3+j]=p[i+6+j];p[i+6+j]=v;}}const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(p,3));g.computeVertexNormals();return g;}
const roofs=[new MeshStandardMaterial({color:0x905649,roughness:.9}),new MeshStandardMaterial({color:0x667875,roughness:.85}),new MeshStandardMaterial({color:0xa86451,roughness:.9})];
const walls=[0xcbb38d,0xdfc0a3,0xaaa88e,0xd8c9ad,0xbfb5ac,0xd2a895].map(color=>new MeshStandardMaterial({color,roughness:.92}));
const roofCache:Record<string,BufferGeometry>={};
function house(x:number,z:number,w:number,d:number,h:number,seed:number){const g=new Group();g.position.set(x,.8,z);scene.add(g);const mat=walls[seed%walls.length];box(0,h/2,0,w,h,d,mat,g);box(0,.2,0,w+.2,.4,d+.2,stone,g);box(0,h-.15,0,w+.25,.25,d+.25,trim,g);const key=[w,d].join(',');if(!roofCache[key])roofCache[key]=roof(w+.8,2.1,d+.8);mesh(roofCache[key],roofs[seed%3],0,h,0,1,1,1,g);
 for(let row=0;row<2;row++)for(let j=0;j<Math.max(2,Math.floor(w/1.8));j++){const xx=-w/2+1+j*1.75;if(xx>w/2-.5)continue;box(xx,1.9+row*2, d/2+.03,.72,1.1,.12,iron,g);if(rand(seed*31+j+row*7)>.3)box(xx,1.9+row*2,d/2+.11,.5,.84,.05,glass,g);box(xx,1.3+row*2,d/2+.16,.92,.12,.32,trim,g);}
 for(let j=0;j<2;j++){box(w/2+.04,2+j*2,0,.09,1,.7,iron,g);box(w/2+.1,2+j*2,0,.04,.72,.5,glass,g);}
 box(.1,.95,d/2+.1,.9,1.8,.16,bark,g);box(w*.25,h+1,0,.5,1.7,.6,stone,g);return g;
}
function tree(x:number,z:number,seed:number,pink=false,y=.9){const g=new Group();g.position.set(x,y,z);scene.add(g);const height=3.1+rand(seed)*1.8;mesh(cylinder,bark,0,height/2,0,.18,height,.18,g);for(let i=0;i<3;i++){const a=i*2.1;rod(new Vector3(0,height*.5,0),new Vector3(Math.cos(a)*1.5,height+.4,Math.sin(a)*1.5),.1,bark,g);}
 const mat=leaves[(pink?3:0)+(seed%3)];for(let i=0;i<6;i++){const a=i*2.4;const r=1.3+rand(seed*13+i)*.65;const m=ball(Math.cos(a)*1.1,height+.4+rand(seed+i)*1.5,Math.sin(a)*1.1,r,mat,g);m.scale.y=.85;m.castShadow=false;}
 return g;
}
const leaves=[0x537956,0x6c8b61,0x8b9c6a,0xd894b0,0xedb6c5,0xe5a4b9].map(color=>new MeshStandardMaterial({color,roughness:1}));
function lamp(x:number,z:number,y=.9){mesh(cylinder,iron,x,y+1.5,z,.07,3,.07);box(x,y+3.1,z,.48,.65,.48,glass);mesh(cone,iron,x,y+3.6,z,.43,.4,.43);lamps.push(ball(x,y+3.1,z,.08,gold));}
function castle(){const g=new Group();g.position.set(25,5.2,-24);scene.add(g);
 const hill=new MeshStandardMaterial({color:0x526f53,roughness:1});mesh(cylinder,hill,25,2.3,-24,17,5,13);mesh(cylinder,stone,25,4.3,-24,14.5,1.4,10.5);
 for(const z of [-8,8]){box(0,2.2,z,24,4.4,1.1,stone,g);box(0,4.6,z,24.4,.6,1.5,trim,g);}
 for(const x of [-12,12]){box(x,2.2,0,1.1,4.4,17,stone,g);for(let j=0;j<7;j++)box(x,4.9,-7+j*2.2,1.3,.7,.8,stone,g);}
 for(const x of [-11,11])for(const z of [-7,7]){box(x,2.4,z,5,4.8,5,stone,g);box(x,4.9,z,5.5,.5,5.5,trim,g);}
 box(0,3,-4,16,6,6,walls[3],g);mesh(roof(17,3.2,7),roofs[0],0,6,-4,1,1,1,g);
 for(let j=0;j<7;j++){box(-6.3+j*2.1,3.5,-.93,.68,1.2,.1,iron,g);box(-6.3+j*2.1,3.5,-.86,.44,.9,.05,glass,g);}
 box(0,1.2,8.58,2.3,2.5,.16,iron,g);box(0,2.95,8.66,1,.55,.16,gold,g);
 for(let j=0;j<15;j++)for(let k=0;k<3;k++){if(j===7&&k<2)continue;box(-10.5+j*1.5+(k%2)*.7,.65+k*1.1,8.57,1.25,.05,.06,trim,g);}
 box(1,-2,14,4,.4,11,stone,g);for(let i=0;i<8;i++)box(1,-2.2-i*.26,11+i*1.1,4,.25,1.3,trim,g);
 // The stylized quadrangular fortress follows the palace and bastion silhouette.
}
function synagogue(){const g=new Group();g.position.set(9,.9,-8);scene.add(g);const brick=new MeshStandardMaterial({color:0x9e5247,roughness:.8});box(0,3,0,9,6,7,brick,g);box(0,.25,0,9.5,.5,7.5,stone,g);mesh(roof(9.7,2.8,7.8),roofs[1],0,6,0,1,1,1,g);
 for(let i=0;i<7;i++)box(0,.8+i*.75,3.57,9,.16,.13,trim,g);
 box(0,5,3.65,4,3.8,.45,brick,g);const ring=new Mesh(new TorusGeometry(1.2,.18,8,32),trim);ring.position.set(0,5.4,3.94);g.add(ring);ball(0,5.4,3.78,1,glass,g).scale.z=.1;
 for(let i=0;i<12;i++){const a=i*TAU/12;rod(new Vector3(0,5.4,3.95),new Vector3(Math.cos(a)*1.05,5.4+Math.sin(a)*1.05,3.95),.035,iron,g);}
 for(const x of [-3.5,3.5]){box(x,3.7,3.3,1.5,7.4,1.7,brick,g);for(let j=0;j<7;j++)box(x,.8+j,4.2,1.6,.16,.15,trim,g);mesh(sphere,iron,x,7.5,3.3,.8,.7,.8,g);mesh(cone,gold,x,8.2,3.3,.25,.7,.25,g);box(x,3.8,4.21,.7,2,.1,glass,g);}
 for(const x of [-1.6,0,1.6]){box(x,1.2,3.92,1.05,2.3,.15,iron,g);const arch=new Mesh(new TorusGeometry(.53,.1,6,16,Math.PI),trim);arch.position.set(x,2.2,4.05);g.add(arch);}
 box(0,7.2,3.7,2.9,.25,.8,trim,g);for(const x of [-1.8,1.8])mesh(cone,gold,x,7.8,3.7,.26,.8,.26,g);
}
function cathedral(){const g=new Group();g.position.set(8,.8,-26);scene.add(g);const plaster=walls[3];box(0,4,0,8,8,9,plaster,g);mesh(roof(8.8,3,10),roofs[1],0,8,0,1,1,1,g);for(const x of [-4.6,4.6]){box(x,5.5,4,2.8,11,3,plaster,g);box(x,9.4,5.56,1.3,2,.12,iron,g);mesh(sphere,roofs[1],x,11.7,4,1.7,1.4,1.7,g);mesh(cone,roofs[1],x,13.8,4,.8,3,.8,g);rod(new Vector3(x,15,4),new Vector3(x,16.3,4),.055,gold,g);rod(new Vector3(x-.4,15.9,4),new Vector3(x+.4,15.9,4),.05,gold,g);}
 for(let i=0;i<4;i++)box(-3+i*2,4,4.6,.2,7,.3,trim,g);box(0,1.8,4.7,1.8,3.5,.25,iron,g);
 for(let i=0;i<4;i++){const x=-2.9+i*1.93;mesh(cylinder,trim,x,3.4,5.7,.25,5.8,.25,g);box(x,6.5,5.7,.8,.35,.7,trim,g);}box(0,6.9,5.8,8.7,.5,1.3,trim,g);mesh(roof(9,1.8,1.6),plaster,0,7.1,5.8,1,1,1,g);for(const x of [-2,0,2]){box(x,4.5,4.7,.9,1.5,.1,glass,g);const arch=new Mesh(new TorusGeometry(.48,.09,6,16,Math.PI),trim);arch.position.set(x,5.2,4.8);g.add(arch);}for(let i=0;i<5;i++)box(0,.2+i*.16,7.4-i*.28,8-i*.4,.15,1.5,stone,g);
}
function woodenChurch(){
 const g=new Group();g.position.set(43,.9,-14);scene.add(g);const wood=new MeshStandardMaterial({color:0x624b3c,roughness:1}),shingles=new MeshStandardMaterial({color:0x4d4b43,roughness:.95});box(0,.2,0,7.4,.4,13.5,stone,g);box(0,2.1,0,6.3,3.8,11.5,wood,g);
 for(let row=0;row<17;row++){box(0,.5+row*.22,5.81,6.4,.035,.09,bark,g);for(const x of [-3.18,3.18])box(x,.5+row*.22,0,.08,.035,11.6,bark,g);}
 const pyramid=new CylinderGeometry(.2,1,1,4);for(const [z,height,width] of [[3.7,8.6,3.1],[0,4.2,3.4],[-3.8,3,2.7]]){
  box(0,(height+1)/2,z,width*1.1,height-1,width*1.1,wood,g);for(let tier=0;tier<4;tier++){const baseY=height+.4+tier*.65,r=width*(1-tier*.13);const roofMesh=mesh(pyramid,shingles,0,baseY,z,r,1.6,r,g);roofMesh.rotation.y=Math.PI/4;}
  const top=height+.4+3*.65+1.1;mesh(sphere,shingles,0,top+.4,z,.65,.85,.65,g);mesh(cone,shingles,0,top+1.4,z,.35,1.6,.35,g);rod(new Vector3(0,top+2,z),new Vector3(0,top+3,z),.045,iron,g);rod(new Vector3(-.3,top+2.6,z),new Vector3(.3,top+2.6,z),.045,iron,g);
 }
 for(const x of [-3.7,3.7]){for(let j=0;j<8;j++)mesh(cylinder,wood,x,1.7,-5+j*1.4,.07,2.7,.07,g);box(x,3.1,0,.8,.18,13,shingles,g);}box(0,1.6,5.87,1.3,2.7,.12,iron,g);box(0,1.6,5.96,.9,2.3,.08,bark,g);for(const z of [-3,0,3])for(const x of [-3.24,3.24])box(x,2.5,z,.07,.75,.5,glass,g);
 for(let i=0;i<14;i++){const x=36+i;box(x,1.35,-22,.13,.95,.13,bark);box(x,1.35,-6,.13,.95,.13,bark);}for(const z of [-21.5,-20,-18.5,-17,-15.5,-14,-12.5,-11,-9.5,-8]){box(35.8,1.35,z,.13,.95,.13,bark);box(50,1.35,z,.13,.95,.13,bark);}for(const z of [-22,-6])box(43,1.7,z,14.4,.1,.08,bark);
}
function bridge(){const g=new Group();g.position.set(-5,1.3,7);scene.add(g);box(0,0,0,3.8,.4,20,stone,g);for(const x of [-2,2]){box(x,1.35,0,.1,.1,20,iron,g);box(x,.7,0,.08,.08,20,iron,g);for(let j=0;j<21;j++)box(x,.7,-10+j,.07,1.4,.07,iron,g);}
 for(const z of [-5,5]){box(0,-1.2,z,1.3,2.2,1.2,stone,g);}
 for(const x of [-2.8,2.8])for(const z of [-9,9])lamp(-5+x,7+z,1.3);
}
function person(color:number,lantern=false){const g=new Group(),coat=new MeshStandardMaterial({color,roughness:.85});mesh(cylinder,coat,0,.77,0,.27,.87,.35,g);ball(0,1.43,0,.23,trim,g);ball(0,1.62,-.02,.24,iron,g).scale.y=.35;const legs=[box(-.13,.24,0,.15,.48,.19,iron,g),box(.13,.24,0,.15,.48,.19,iron,g)];actorLegs.set(g,legs);if(lantern){rod(new Vector3(.25,1,0),new Vector3(.55,.8,.12),.06,coat,g);box(.57,.71,.13,.18,.25,.18,glass,g);feet=legs;}return g;}
function streetDetails(){
 // Shared, instanced paving keeps the close view detailed at a bounded cost.
 const cobbles=new InstancedMesh(boxGeo,new MeshStandardMaterial({color:0xb2afa0,roughness:1}),1400);let k=0;for(let row=0;row<7;row++)for(let col=0;col<200;col++){dummy.position.set(-52+col*.53+(row%2)*.22,.928,-3.8+row*.49);dummy.rotation.set(0,0,0);dummy.scale.set(.43,.045,.37);dummy.updateMatrix();cobbles.setMatrixAt(k++,dummy.matrix);}cobbles.receiveShadow=true;scene.add(cobbles);
 // A small cafe, planters, signboards, roof seams and masonry details.
 for(let i=0;i<5;i++){const x=-42+i*5.5;mesh(cylinder,iron,x,1.55,-6,.07,1.3,.07);mesh(cylinder,trim,x,2.2,-6,.7,.09,.7);for(const s of [-1,1]){box(x+s,1.3,-6,.6,.1,.6,bark);box(x+s,.99,-6,.08,.6,.08,iron);}box(x,1.15,-4.7,1,.5,.5,stone);for(let j=0;j<4;j++)ball(x-.35+j*.23,1.7,-4.7,.18,leaves[3+j%3]);}
 for(let i=0;i<8;i++){const x=-45+i*12;box(x,1.5,23,.9,1.1,.08,iron);box(x,1.5,23.05,.73,.92,.02,trim);for(let j=0;j<4;j++)box(x-.18,1.7-j*.12,23.08,.35,.025,.02,bark);}
 for(const x of [6,12]){rod(new Vector3(x,6.5,-1),new Vector3(x,8,-1),.035,iron);box(x+.42,7.7,-1,.8,.27,.035,new MeshStandardMaterial({color:0x578fc4}));box(x+.42,7.43,-1,.8,.27,.035,new MeshStandardMaterial({color:0xe4c35b}));}
 keeper=person(0x3f7485,true);keeper.scale.setScalar(1.35);scene.add(keeper);
 for(let i=0;i<12;i++){const p=person([0x785c58,0x798678,0x8d7958,0x6e758d][i%4]);scene.add(p);walkers.push(p);}
 for(let i=0;i<9;i++){const b=new Group();box(-.24,0,0,.5,.035,.1,iron,b).rotation.z=.25;box(.24,0,0,.5,.035,.1,iron,b).rotation.z=-.25;scene.add(b);birds.push(b);}
 for(let i=0;i<discoveries.length;i++){const p=roads[discoveries[i].node],g=new Group();g.position.set(p.x,2.5,p.z);mesh(cone,gold,0,0,0,.23,.6,.23,g);const r=new Mesh(new TorusGeometry(.48,.035,6,20),gold);g.add(r);scene.add(g);findObjects.push(g);}
 for(let i=0;i<100;i++){const m=ball(0,0,0,.075,gold);m.castShadow=false;routeDots.push(m);}
 for(let i=0;i<4;i++){const m=mesh(cylinder,new MeshBasicMaterial({color:[0xeac78d,0xe5b5cd,0xa4d5b4,0x9bdde7][i],transparent:true,opacity:.065,depthWrite:false}),sites[i].x,sites[i].y+4,sites[i].z,1,13,1);m.castShadow=false;restorationShafts.push(m);}
 neighbourhoodDetails();
}
function neighbourhoodDetails(){
 for(let i=0;i<residents.length;i++){const npc=person(residents[i].color),p=roads[residents[i].node];npc.position.set(p.x,1,p.z);npc.scale.setScalar(1.5);scene.add(npc);citizens.push(npc);}
 // An invented bookbinder's stall: paper layers, book spines and a striped awning.
 const shop=new Group();shop.position.set(-30,.95,-32);scene.add(shop);box(0,.7,0,3.5,1.4,1.2,bark,shop);for(let i=0;i<9;i++){box(-1.45+i*.34,1.6,0,.24,.5+rand(i)*.25,.8,roofs[i%3],shop);box(-1.45+i*.34,1.7,.42,.18,.025,.03,trim,shop);}for(let i=0;i<6;i++){box(1.1,1.45+i*.04,.25,.65,.025,.6,trim,shop);}for(const x of [-1.8,1.8])box(x,2,0,.07,4,.07,iron,shop);for(let i=0;i<8;i++)box(-1.58+i*.45,3.7,.15,.45,.09,2.4,i%2?trim:roofs[0],shop).rotation.x=.12;
 for(let i=0;i<repairLamps.length;i++){const p=roads[repairLamps[i].node];box(p.x,.96,p.z,1.2,.25,1.2,stone);mesh(cylinder,iron,p.x,2.8,p.z,.085,3.7,.085);const mat=new MeshStandardMaterial({color:0x4d5d58,emissive:0xffca7c,emissiveIntensity:0});const flame=new Mesh(boxGeo,mat);flame.position.set(p.x,4.65,p.z);flame.scale.set(.58,.8,.58);scene.add(flame);repairFlames.push(flame);mesh(cone,iron,p.x,5.2,p.z,.5,.45,.5);}
 scene.add(festival,flowerGarden);for(const x of [-7.2,-2.8])for(let i=0;i<15;i++){const z=-2+i*1.4,y=5.1-Math.sin(i/14*Math.PI)*.7;ball(x,y,z,.105,gold,festival);if(i){const pz=-2+(i-1)*1.4,py=5.1-Math.sin((i-1)/14*Math.PI)*.7;rod(new Vector3(x,py,pz),new Vector3(x,y,z),.018,iron,festival);}}
 box(-25,1.12,25,13,.45,2.3,stone);for(let i=0;i<18;i++){const x=-30.5+(i%9)*1.4,z=24.5+Math.floor(i/9)*.85;rod(new Vector3(x,1.3,z),new Vector3(x,1.8+rand(i)*.4,z),.023,bark,flowerGarden);ball(x,1.85+rand(i)*.4,z,.22,flowerColors[i%3],flowerGarden);}
 for(const x of [-30,-20]){const treeGroup=tree(x,25,100+x,false,1.25);treeGroup.scale.setScalar(1.25);gardenTrees.push(treeGroup);}box(-25,1.6,26.4,3,.16,.65,bark);for(const x of [-26,-24])box(x,1.25,26.4,.12,.7,.5,iron);
 for(let i=0;i<4;i++){const cat=new Group();mesh(sphere,bark,0,.25,0,.32,.22,.55,cat);ball(0,.47,.4,.24,bark,cat);for(const x of [-.14,.14])mesh(cone,bark,x,.7,.4,.1,.2,.1,cat);rod(new Vector3(0,.3,-.45),new Vector3(0,.65,-.8),.055,bark,cat);scene.add(cat);cats.push(cat);}
 townLifeDetails();archiveDetails();workshopDetails();eveningDetails();exhibitionDetails();
}
function townLifeDetails(){
 const rainMat=new MeshBasicMaterial({color:0xa3c5d6,transparent:true,opacity:.28,depthWrite:false});rainMesh=new InstancedMesh(boxGeo,rainMat,220);rainMesh.castShadow=false;scene.add(rainMesh);
 const puddleMat=new MeshStandardMaterial({color:0x476f7b,emissive:0x153440,emissiveIntensity:.25,roughness:.15,metalness:.4,transparent:true,opacity:.65,depthWrite:false});for(let i=0;i<12;i++){const p=new Mesh(new CircleGeometry(1,24),puddleMat);p.rotation.x=-Math.PI/2;p.position.set(-45+i*8,.94,i%2?22:-2);p.scale.set(1.2,.35,1);scene.add(p);puddles.push(p);}
 for(const actor of [keeper,...citizens,...walkers]){const u=new Group();mesh(cylinder,iron,0,1.3,0,.025,1.8,.025,u);mesh(cone,new MeshStandardMaterial({color:0x596b76,roughness:.8}),0,2.22,0,.82,.32,.82,u);actor.add(u);umbrellas.push(u);}
 basket=new Group();box(0,.83,-.4,.5,.4,.26,bark,basket);const handle=new Mesh(new TorusGeometry(.24,.035,6,18,Math.PI),trim);handle.position.set(0,1.04,-.4);basket.add(handle);keeper.add(basket);
 scene.add(marketStalls,recitalStage,marginBoard);for(let i=0;i<3;i++){const x=-17+i*4;box(x,1.4,-18.4,2.8,1,1.2,bark,marketStalls);for(const dx of [-1.3,1.3])box(x+dx,2.3,-18.4,.05,3,.05,iron,marketStalls);for(let j=0;j<7;j++)box(x-1.4+j*.45,3.5,-18.2,.45,.08,2.1,j%2?trim:roofs[i],marketStalls);for(let j=0;j<8;j++)ball(x-.9+(j%4)*.6,2,-18.4+Math.floor(j/4)*.4,.18,flowerColors[i],marketStalls);}
 box(15,1.05,-2,6,.3,3.6,stone,recitalStage);for(let i=0;i<3;i++){const p=person([0x6b637e,0x8e6a74,0x607b7c][i]);p.position.set(13+i*1.7,1.2,-2);recitalStage.add(p);ball(13+i*1.7,2,-1.6,.3,roofs[0],recitalStage);rod(new Vector3(12.7+i*1.7,2.2,-1.5),new Vector3(13.4+i*1.7,2.4,-1.5),.025,trim,recitalStage);}
 marginBoard.position.set(-27,1,-30);box(0,1.4,0,2,2.2,.12,bark,marginBoard);box(0,1.45,.09,1.7,1.8,.03,trim,marginBoard);for(let i=0;i<5;i++)box(-.1,2.1-i*.26,.12,1.2,.03,.01,iron,marginBoard);for(let k=0;k<3;k++){const notes=new Group();marginBoard.add(notes);marginNotes.push(notes);if(k===0){box(0,2.55,.14,1.8,.06,.02,gold,notes);}else if(k===1){for(let j=0;j<3;j++)box(-.7+j*.65,1.1+j*.4,.15,.44,.57,.03,flowerColors[j],notes);}else{const question=new Mesh(new TorusGeometry(.3,.055,6,18,Math.PI*1.5),gold);question.position.set(0,1.85,.16);notes.add(question);box(.17,1.35,.16,.07,.3,.04,gold,notes);ball(.17,1.04,.16,.07,gold,notes);}}
}

function archiveDetails(){
 const colors=[0x95c9cc,0xb9c896,0xd5ad88];for(let c=0;c<3;c++)for(let i=0;i<4;i++){const p=roads[archiveCases[c].records[i].node],g=new Group(),height=p.x>20&&p.x<38&&p.z<-7?Math.min(5.2,.95+(-p.z-7)*.5):p.z>0&&p.z<20?1.6:.98;g.position.set(p.x+1.5,height,p.z+.6);scene.add(g);box(0,.6,0,.12,1.2,.12,iron,g);box(0,1.3,0,1.2,.1,.7,bark,g);for(const sign of [-1,1]){const page=box(sign*.28,1.39,0,.54,.04,.56,trim,g);page.rotation.z=sign*.12;for(let line=0;line<3;line++)box(sign*.28,1.43,-.15+line*.15,.39,.018,.02,iron,g);}const material=new MeshStandardMaterial({color:colors[c],emissive:colors[c],emissiveIntensity:.3});const gem=new Mesh(new SphereGeometry(.13,6,5),material);gem.position.set(0,1.8,0);g.add(gem);archiveGems.push(gem);}
 scene.add(archiveDisplay);archiveDisplay.position.set(-34,1,-29);box(0,1,0,3.8,2,1.1,bark,archiveDisplay);for(let i=0;i<7;i++)box(-1.4+i*.45,2.15,0,.25,.45,.8,roofs[i%roofs.length],archiveDisplay);for(let k=0;k<3;k++){const g=new Group();archiveDisplay.add(g);archiveBanners.push(g);if(k===0){for(let j=0;j<4;j++){const ring=new Mesh(new TorusGeometry(.36,.045,6,22),gold);ring.position.set(-1.1+j*.73,2.9+Math.sin(j)*.25,0);g.add(ring);}}else if(k===1){for(let j=0;j<3;j++){box(-1.1+j*1.1,2.9,0,.85,1,.1,trim,g);box(-1.1+j*1.1,2.83,.08,.4,.55,.06,roofs[j],g);}}else{for(let j=0;j<5;j++){const page=box(-1.2+j*.6,2.6+j*.1,0,.5,.65,.06,trim,g);page.rotation.z=(j-2)*.08;if(j<3)for(let n=0;n<3;n++)box(-1.2+j*.6,2.45+j*.1+n*.12,.06,.3,.025,.025,iron,g);}}}
}

function makeLantern(parent:Group|typeof scene):LanternModel{
 const group=new Group();parent.add(group);const points=[[-1,0,0],[-.55,.28,-.43],[.65,.28,-.43],[1,0,0],[.65,.28,.43],[-.55,.28,.43]],verts:number[]=[];for(let i=0;i<6;i++){const a=points[i],b=points[(i+1)%6];verts.push(0,-.18,0,...a,...b);verts.push(0,-.18,0,...b,...a);}const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(verts,3));geometry.computeVertexNormals();const hull=mesh(geometry,new MeshStandardMaterial({color:0xdac5a1,roughness:.86}),0,0,0,1,1,1,group);
 const rig=new Group();group.add(rig);box(-.1,.8,0,.035,1.6,.035,bark,rig);const sailGeo=new BufferGeometry();sailGeo.setAttribute('position',new Float32BufferAttribute([-.07,.43,.02,-.07,1.58,.02,.72,.5,.02,.72,.5,.02,-.07,1.58,.02,-.07,.43,.02],3));sailGeo.computeVertexNormals();const sail=mesh(sailGeo,new MeshStandardMaterial({color:0xe8bd78,roughness:.85}),0,0,0,1,1,1,rig);
 const light=box(.28,.5,.05,.28,.38,.28,new MeshStandardMaterial({color:0xffdba2,emissive:0xffc46f,emissiveIntensity:2.4,roughness:.8}),group);const marks:Group[]=[],weights:Mesh[]=[];for(let k=0;k<3;k++){const mark=new Group();mark.position.set(.15,.92,.045);rig.add(mark);marks.push(mark);if(k===0){const wave=new Mesh(new TorusGeometry(.16,.023,5,18,Math.PI*1.35),trim);wave.rotation.z=.5;mark.add(wave);}else if(k===1){const leaf=ball(0,0,0,.16,trim,mark);leaf.scale.set(.55,1,.12);leaf.rotation.z=-.4;}else{const starVerts:number[]=[];for(let j=0;j<10;j++){const a=j*Math.PI/5-Math.PI/2,b=(j+1)*Math.PI/5-Math.PI/2,ra=j%2?.075:.17,rb=(j+1)%2?.075:.17;starVerts.push(0,0,0,Math.cos(a)*ra,Math.sin(a)*ra,0,Math.cos(b)*rb,Math.sin(b)*rb,0,0,0,0,Math.cos(b)*rb,Math.sin(b)*rb,0,Math.cos(a)*ra,Math.sin(a)*ra,0);}const star=new BufferGeometry();star.setAttribute('position',new Float32BufferAttribute(starVerts,3));star.computeVertexNormals();mesh(star,trim,0,0,0,1,1,1,mark);}}
 for(let i=0;i<2;i++)weights.push(ball(-.55+i*.28,.12,0,.11,iron,group));return{group,hull,rig,sail,light,marks,weights};
}
function dressLantern(model:LanternModel,d:LanternDesign,t:number,dedication=-1){const palette=[0xe8bd78,0xe8a1b6,0x91ccd0];model.hull.scale.z=.75+d.width*.28;model.rig.scale.y=.5+d.sail*.35;model.rig.rotation.x=Math.sin(t*3)*.025;model.sail.material.color.setHex(palette[d.paint]);model.light.material.color.setHex(palette[d.paint]);model.light.material.emissive.setHex(palette[dedication>=0?dedication:d.paint]);model.light.material.emissiveIntensity=2.1+Math.sin(t*4)*.2;model.marks.forEach((g,i)=>g.visible=i===d.motif);model.weights.forEach((m,i)=>m.visible=i<d.ballast);}
function workshopDetails(){
 const stand=new Group();stand.position.set(15,1,25);scene.add(stand);box(0,.8,0,5,.25,2.1,bark,stand);for(const x of [-2,2])for(const z of [-.8,.8])box(x,.35,z,.13,.7,.13,iron,stand);for(let i=0;i<5;i++)box(-1.7+i*.08,1.02+i*.035,.2,1.1,.03,.7,trim,stand);for(let i=0;i<3;i++){const jar=new Mesh(new CylinderGeometry(.13,.11,.28,10),flowerColors[i]);jar.position.set(1.2+i*.35,1.1,.25);stand.add(jar);rod(new Vector3(1.2+i*.35,1.15,.25),new Vector3(1.35+i*.35,1.7,.2),.02,bark,stand);}benchModel=makeLantern(stand);benchModel.group.position.set(0,.97,-.15);benchModel.group.scale.setScalar(.9);box(-2.3,2,0,.08,3.5,.08,iron,stand);const roof=box(0,3.7,0,5.7,.12,2.5,roofs[1],stand);roof.rotation.z=-.04;for(let i=0;i<7;i++)box(-2.5+i*.8,3.78,0,.35,.04,2.5,trim,stand);
}

function eveningDetails(){
 const g=new Group();g.position.set(-12,1,25);scene.add(g);for(let i=0;i<3;i++)box(0,.9,-.5+i*.35,4,.14,.28,bark,g);for(const x of [-1.6,1.6]){box(x,.45,0,.13,.9,.8,iron,g);box(x,1.7,.6,.12,1.8,.12,iron,g);}for(let i=0;i<3;i++)box(0,1.3+i*.3,.6,4,.15,.1,bark,g);for(let i=0;i<3;i++){const ribbon=new Group();ribbon.position.set(-1.2+i*1.2,2.1,.7);g.add(ribbon);box(0,-.15,0,.35,.9,.04,flowerColors[i],ribbon);const ring=new Mesh(new TorusGeometry(.15,.025,5,20),gold);ring.position.set(0,.3,.02);ribbon.add(ring);walkRibbons.push(ribbon);}
}

function exhibitionDetails(){
 box(51,.82,29.5,2.3,.15,15,paving);box(44.5,.82,37,13,.15,2.3,paving);const room=new Group();room.position.set(38,.95,37);scene.add(room);box(0,-.04,0,10,.12,4.2,stone,room);for(const x of [-4.7,4.7])for(const z of [-1.9,1.9])box(x,2.2,z,.1,4.4,.1,iron,room);for(const z of [-1.9,1.9])box(0,4.4,z,9.6,.12,.1,bark,room);const cloth=new MeshStandardMaterial({color:0xd9c6a3,roughness:.9,transparent:true,opacity:.22,depthWrite:false});exhibitCanopy=box(0,4.5,0,9.5,.035,4.1,cloth,room);exhibitCanopy.castShadow=false;
 for(let i=0;i<4;i++){const g=new Group();g.position.set(i%2?2.2:-2.2,0,Math.floor(i/2)?1.2:-1.2);room.add(g);const seat=new Group();g.add(seat);box(0,.55,0,1.25,.12,.55,bark,seat);for(const x of [-.45,.45])box(x,.25,0,.09,.5,.4,iron,seat);const plinth=new Group();g.add(plinth);box(0,.48,0,.98,.96,.75,stone,plinth);box(0,1,0,1.1,.08,.83,trim,plinth);const plaque=box(0,.63,.4,.7,.16,.025,new MeshStandardMaterial({color:0xe7bd7c,emissive:0xe7bd7c,emissiveIntensity:.12}),plinth);const contents:Group[]=[];for(let k=0;k<7;k++){const c=new Group();c.position.y=1.06;plinth.add(c);contents.push(c);}
  for(let j=0;j<4;j++){const page=box(.02*j,.04+j*.035,0,.64,.025,.52,trim,contents[0]);page.rotation.y=j*.06;for(let n=0;n<3;n++)box(.02*j,.06+j*.035,-.15+n*.13,.42,.009,.016,iron,contents[0]);}box(-.34,.04,0,.025,.08,.55,roofs[1],contents[0]);
  const key=new Mesh(new TorusGeometry(.17,.035,6,24),gold);key.position.set(-.12,.23,0);contents[1].add(key);box(.12,.1,0,.4,.055,.055,gold,contents[1]);for(let j=0;j<2;j++)box(.18+j*.13,.04,0,.045,.12,.06,gold,contents[1]);const leaf=ball(0,.2,0,.3,new MeshStandardMaterial({color:0xa8b281,roughness:.9}),contents[2]);leaf.scale.set(.5,1,.1);leaf.rotation.z=-.35;rod(new Vector3(-.05,-.02,0),new Vector3(.08,.45,.01),.012,bark,contents[2]);for(let j=0;j<3;j++){const thread=new Mesh(new TorusGeometry(.2+j*.02,.018,5,28),new MeshStandardMaterial({color:0x92b9d0,roughness:.7}));thread.rotation.x=Math.PI/2;thread.position.y=.04+j*.025;contents[3].add(thread);}
  const architectureMat=new MeshStandardMaterial({color:0xa58c69,roughness:.85}),roofMat=new MeshStandardMaterial({color:0x6d6c62,roughness:.8}),architecture:Mesh<MeshStandardMaterial>[]=[];box(0,.2,0,.85,.4,.55,architectureMat,contents[4]);for(let j=0;j<3;j++){const tower=box(-.3+j*.3,.4+j%2*.15,0,.18,.65,.3,architectureMat,contents[4]);architecture.push(tower);const top=mesh(cone,roofMat,-.3+j*.3,.82+j%2*.15,0,.18,.25,.22,contents[4]);architecture.push(top);}contents[4].scale.setScalar(.85);const boat=makeLantern(contents[5]);boat.group.scale.setScalar(.43);boat.group.position.y=.06;
  const medallion=new Mesh(new TorusGeometry(.15,.03,6,24),gold);medallion.position.y=.35;contents[6].add(medallion);box(0,.13,0,.2,.35,.04,roofs[i%3],contents[6]);exhibitStands.push({group:g,seat,plinth,contents,plaque,architecture,architectureMat,roofMat,boat});}
 for(let i=0;i<3;i++){const light=new PointLight(0xffd29a,18,9,2);light.position.set(-3+i*3,3.6,0);room.add(light);exhibitLamps.push(light);const personModel=person([0x759495,0xa18075,0x968e75][i]);personModel.scale.setScalar(.85);room.add(personModel);exhibitPeople.push(personModel);const ribbon=new Group();ribbon.position.set(4.75,3.5-i*.48,0);room.add(ribbon);box(0,0,0,.08,.32,.48,flowerColors[i],ribbon);exhibitRibbons.push(ribbon);}
}
export function createWorld(){renderer.camera=camera;renderer.shadowMap.enabled=true;renderer.antialias='fxaa';renderer.toneMapping=ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;renderer.bloom={strength:.2,radius:.35,threshold:1.1,resolution:.5};renderer.ao={radius:1.1,blendIntensity:.5,samples:8,resolution:.5};
 scene.background=new Color(0x142e3c);scene.fog=new FogExp2(0x193d4b,.0026);townAmbient=new AmbientLight(0xabbfce,2.1);scene.add(townAmbient);
 const sun=new DirectionalLight(0xffd1a0,3.3);townSun=sun;sun.position.set(-45,70,30);sun.castShadow=true;sun.shadow.mapSize=2048;sun.shadow.bias=-.00025;sun.shadow.normalBias=.09;sun.shadow.radius=2.5;const sc=sun.shadow.camera as OrthographicCamera;sc.left=-78;sc.right=78;sc.top=70;sc.bottom=-70;sc.near=1;sc.far=180;scene.add(sun,sun.target);
 const rim=new DirectionalLight(0x82c8dc,1.2);rim.position.set(40,25,-40);scene.add(rim,rim.target);
 const earth=new MeshStandardMaterial({color:0x48565b,roughness:1});box(0,-3.8,-2,106,6.5,86,earth);box(0,-.25,-22,106,1.8,46,new MeshStandardMaterial({color:0x75846c,roughness:1}));box(0,-.25,31,106,1.8,20,new MeshStandardMaterial({color:0x75846c,roughness:1}));
 // River occupies an actual channel; no streets cross it except the bridge.
 box(0,.1,10,106,.55,18,water);const flowMat=new MeshBasicMaterial({color:0x9fd9d5,transparent:true,opacity:.23,depthWrite:false});for(let i=0;i<105;i++){const m=box(rand(i*9)*106-53,.43,2+rand(i*3+1)*16,1+rand(i)*4,.015,.045,flowMat);m.castShadow=false;flows.push(m);}
 const quay=new MeshStandardMaterial({color:0x9a9d90,roughness:1});for(const z of [.6,19.4]){box(0,.7,z,106,1.1,1.1,quay);box(0,1.3,z,106,.15,1.5,trim);}
 box(0,.82,-2.1,106,.16,4.6,paving);box(0,.82,22,106,.16,4,paving);box(-9,.81,-20,4,.14,32,paving);box(0,.82,-17,82,.14,3,paving);
 // Warm old-town facades, clustered above the north bank.
 for(let i=0;i<12;i++){const x=-46+i*7.7;if(x>-1&&x<19)continue;house(x,-9,5.2,6,5.2+(i%3)*.5,i);}
 for(let i=0;i<11;i++){const x=-46+i*6.9;if(x>0)continue;house(x,-22,5,7,5.7+(i%2),i+14);house(x,-34,5,6,4.7+(i%3)*.5,i+31);}
 for(let i=0;i<14;i++){const x=-48+i*7.2;house(x,31,5.2,7,4.5+(i%3)*.5,i+5);}
 castle();synagogue();cathedral();bridge();woodenChurch();
 // The linden promenade and ornamental cherry trees are different plantings.
 for(let i=0;i<12;i++)tree(-48+i*3.8,-3.5,i+20,false);
 for(let i=0;i<13;i++){tree(-49+i*8,24.7,i+3,true);if(i<6)tree(-45+i*6.5,-29,i+8,true);}
 for(let i=0;i<8;i++){const x=38+rand(i)*12,z=-10-rand(i*7)*25;if(Math.hypot(x-43,z+14)>9)tree(x,z,i+60);}
 for(let i=0;i<14;i++){lamp(-49+i*7.5,-.8);if(i%2===0)lamp(-48+i*7.4,20.7);}
 for(let i=0;i<5;i++){box(-39+i*9,1.2,-1.9,1.8,.2,.5,bark);for(const x of [-.6,.6])box(-39+i*9+x,.95,-1.9,.15,.5,.4,iron);}
 // Clouds and distant mountain silhouettes give the model an open horizon.
 const mountainMat=new MeshStandardMaterial({color:0x335760,roughness:1});for(let i=0;i<14;i++){const m=mesh(cone,mountainMat,-100+i*15,5,-90-rand(i)*20,12+rand(i)*20,20+rand(i*4)*30,12);m.castShadow=false;}
 for(let i=0;i<9;i++){const m=ball(-80+i*22,35+rand(i*7)*10,-70-rand(i)*25,8,new MeshBasicMaterial({color:0x3a606b}));m.scale.set(1.6,.18,.6);m.castShadow=false;}
 for(let i=0;i<4;i++){const g=new Group();g.position.set(sites[i].x,sites[i].y,sites[i].z);scene.add(g);const m=new Mesh(new TorusGeometry(.8,.055,6,32),gold);g.add(m);ball(0,0,0,.18,gold,g);beacons.push(g);const halo=new Mesh(new TorusGeometry(4,.045,6,64),new MeshBasicMaterial({color:0x92e9ec,transparent:true,opacity:.6,depthWrite:false}));halo.position.set(sites[i].x,i===0?5.3:1.5,sites[i].z);halo.rotation.x=-Math.PI/2;halo.castShadow=false;scene.add(halo);memoryRings.push(halo);}
 // Petal clouds use GPU instances, with one upload per cloud per frame.
 const petalGeo=new SphereGeometry(1,4,3);for(let k=0;k<2;k++){const p=new InstancedMesh(petalGeo,new MeshStandardMaterial({color:k?0xffd1d6:0xffe3bc,emissive:k?0x551b31:0x45340d,emissiveIntensity:.3}),130);p.castShadow=false;scene.add(p);petals.push(p);}
 for(let i=0;i<64;i++){const model=makeLantern(scene);model.group.scale.setScalar(.48);fleetModels.push(model);boats.push(model.group);}
 const light=new PointLight(0xffc28a,22,16,2);light.position.set(10,6,-2);scene.add(light);
 streetDetails();
}
export function updateWorld(t:number,dt:number,w:number,h:number,restored:boolean[],lens:boolean,finale=false,presentation=false,details?:{keeper:Place;moving:boolean;finds:boolean[];trail:Place[];dedication:number;storyDone?:boolean[];litLamps?:boolean[];garden?:number;gathering?:boolean;hour?:number;weather?:number;dayVisits?:number[];margin?:number;archiveFound?:boolean[][];archiveAccount?:number;workshopDesign?:LanternDesign;workshopFleet?:LanternDesign[];company?:(Place|null)[];walkBadges?:boolean[];exhibitLayout?:ExhibitLayout;exhibitAwards?:boolean[];exhibitVisitors?:boolean;exhibitBoat?:LanternDesign}){
 if(details?.gathering&&finale&&!orbiting)desiredAngle+=dt*.035;angle+=(desiredAngle-angle)*Math.min(1,dt*6);zoom+=(desiredZoom-zoom)*Math.min(1,dt*5);target.x+=(viewX-target.x)*Math.min(1,dt*3);target.z+=(viewZ-target.z)*Math.min(1,dt*3);target.y+=(viewY-target.y)*Math.min(1,dt*3);
 const span=Math.max(44,72*h/w);camera.left=-span*w/h;camera.right=span*w/h;camera.top=span*(presentation&&h>w?.62:1);camera.bottom=-span*(presentation&&h>w?1.38:1);camera.zoom=zoom;camera.position.set(target.x+Math.sin(angle)*100,74+target.y,target.z+Math.cos(angle)*100);camera.lookAt(target.x,target.y,target.z);camera.updateProjectionMatrix();
 for(let i=0;i<flows.length;i++){const m=flows[i];m.position.x=((rand(i*9)*106+t*(.6+rand(i)*.6))%106)-53;m.position.y=.44+Math.sin(t+i)*.012;}
 for(let i=0;i<beacons.length;i++){const g=beacons[i];g.position.y=sites[i].y+Math.sin(t*1.7+i)*.35;g.rotation.y=t*.5;g.scale.setScalar(restored[i] ? 1.4 : .75);const halo=memoryRings[i];halo.visible=restored[i]||lens;halo.scale.setScalar(1+Math.sin(t*.8+i)*.06);restorationShafts[i].visible=restored[i];}
 for(let k=0;k<petals.length;k++){const p=petals[k];for(let i=0;i<130;i++){const speed=.4+rand(i+5)*.6;dummy.position.set(((rand(i*3+k)*120+t*(1+speed))%120)-60,1+((rand(i*9)*20-t*speed)%20+20)%20,rand(i*7+k)*70-37+Math.sin(t*.3+i)*2);dummy.rotation.set(t*.3+i,t*.5+i,i);dummy.scale.set(.05+rand(i)*.065,.025,.1);dummy.updateMatrix();p.setMatrixAt(i,dummy.matrix);}p.instanceMatrix.needsUpdate=true;}
 for(let i=0;i<boats.length;i++){const b=boats[i];b.visible=i<(details?.gathering?64:finale?16:4);b.position.set(((t*(finale?1.5:.45)+i*7)%104)-52,.68+Math.sin(t+i)*.05,4+rand(i)*12);b.rotation.y=Math.sin(t*.4+i)*.12;const designs=details?.workshopFleet??[];dressLantern(fleetModels[i],designs.length?designs[i%designs.length]:{width:0,sail:0,ballast:0,paint:details?.dedication??0,motif:0},t+i,details?.dedication??0);}
 const hour=details?.hour??(night?21:8),weather=details?.weather??0,daylight=Math.max(0,Math.sin((hour-6)/12*Math.PI));rainBlend+=((weather===1?1:0)-rainBlend)*Math.min(1,dt*1.5);wetness+=((weather===1?1:0)-wetness)*Math.min(1,dt*(weather===1?.5:.035));
 townSun.position.set(Math.cos((hour-6)/12*Math.PI)*65,Math.max(5,daylight*75),30);townSun.intensity=.15+daylight*3*(1-rainBlend*.45);townSun.color.setHex(daylight>.65?0xffe1bd:0xffb783);townAmbient.intensity=.95+daylight*1.25;glass.emissiveIntensity=1+(1-daylight)*2;stone.roughness=.95-wetness*.5;paving.roughness=1-wetness*.78;water.emissiveIntensity=lens?1.3:.3+(1-daylight)*.3;renderer.toneMappingExposure=.9+daylight*.28;
 const sky=weather===2?0x536b75:weather===1?0x334d5b:daylight>.15?0x355d73:0x0b1b30;(scene.background as Color).lerp(new Color(lens?0x19364b:sky),Math.min(1,dt*1.5));(scene.fog as FogExp2).density+=( (weather===2?.010:weather===1?.005:.0026)-(scene.fog as FogExp2).density)*Math.min(1,dt);
 rainMesh.visible=rainBlend>.02;rainMesh.count=Math.floor(220*rainBlend);if(rainMesh.visible){for(let i=0;i<rainMesh.count;i++){dummy.position.set(rand(i*7)*110-55,1+((rand(i)*32-t*(12+rand(i+3)*7))%32+32)%32,rand(i*11)*78-40);dummy.rotation.set(0,0,-.13);dummy.scale.set(.018,1+rand(i)*.8,.018);dummy.updateMatrix();rainMesh.setMatrixAt(i,dummy.matrix);}rainMesh.instanceMatrix.needsUpdate=true;}umbrellas.forEach(u=>u.visible=rainBlend>.3);puddles.forEach((p,i)=>{p.visible=wetness>.04;p.scale.set((1+rand(i)*.8)*wetness,.4*wetness,1);});basket.visible=(details?.dayVisits?.[0]??0)>0;marketStalls.visible=hour>=9&&hour<13;recitalStage.visible=hour>=18&&hour<21||details?.gathering===true&&(details.dayVisits?.[2]??0)>0;marginBoard.visible=(details?.dayVisits?.[1]??0)>0;marginNotes.forEach((g,i)=>g.visible=details?.margin===i);
 if(details?.exhibitLayout){const layout=details.exhibitLayout,palette=[0xffd29a,0xe6f2ef,0x8ec8da];exhibitLamps.forEach(light=>{light.color.setHex(palette[layout.light]);light.intensity=layout.light===1?24:18;});exhibitCanopy.material.color.setHex(palette[layout.light]);exhibitStands.forEach((stand,i)=>{const id=layout.slots[i];stand.seat.visible=id<0;stand.plinth.visible=id>=0;const kind=id===1?1:id===3?2:id===5?3:id===10||id===11?4:id===12?5:id===13?6:0;stand.contents.forEach((g,k)=>g.visible=k===kind);stand.plaque.material.color.setHex([0xe7bd7c,0xe7a8bd,0x9bd5d5][layout.captions[i]]);stand.plaque.material.emissive.copy(stand.plaque.material.color);stand.architectureMat.color.setHex(id===10?0x967b56:0xd4c4a3);stand.roofMat.color.setHex(id===10?0x665845:0x667e70);stand.architecture.forEach((m,j)=>m.visible=id!==11||Math.floor(j/2)!==1);dressLantern(stand.boat,details.exhibitBoat??defaultDesign(),t);});const order=exhibitOrder(layout);exhibitPeople.forEach((p,i)=>{p.visible=details.exhibitVisitors===true;const phase=(t*.12+i*.77)%4,a=order[Math.floor(phase)],b=order[(Math.floor(phase)+1)%4],u=Math.max(0,(phase%1-.45)/.55),ax=a%2?2.2:-2.2,az=Math.floor(a/2)?.35:-.35,bx=b%2?2.2:-2.2,bz=Math.floor(b/2)?.35:-.35;p.position.set(ax+(bx-ax)*u,0,az+(bz-az)*u);p.rotation.y=u>0?Math.atan2(bx-ax,bz-az):Math.floor(a/2)?0:Math.PI;actorLegs.get(p)?.forEach((leg,j)=>leg.rotation.x=u>0?Math.sin(t*9+j*Math.PI)*.25:0);});exhibitRibbons.forEach((g,i)=>g.visible=details.exhibitAwards?.[i]===true);}
 dressLantern(benchModel,details?.workshopDesign??defaultDesign(),t);
 archiveGems.forEach((gem,i)=>{const found=details?.archiveFound?.[Math.floor(i/4)]?.[i%4]===true;gem.material.emissiveIntensity=found?1.5:.25;gem.scale.setScalar(found?1:.8+Math.sin(t*2+i)*.13);});archiveDisplay.visible=(details?.archiveFound?.some(row=>row.some(Boolean))??false);archiveBanners.forEach((g,i)=>{g.visible=details?.archiveAccount===i;g.rotation.y=Math.sin(t*.2)*.06;});
 if(details){boatGlow.color.setHex([0xffd899,0xf3bdd7,0xb5dfdd][details.dedication]??0xffd899);boatGlow.emissive.setHex([0xffc577,0xee93c1,0x92d7dc][details.dedication]??0xffc577);const p=details.keeper,gy=p.x>20&&p.x<38&&p.z<-7?Math.min(5.2,.95+(-p.z-7)*.5):p.z>0&&p.z<20?1.6:.98;keeper.position.set(p.x,gy,p.z);if(details.trail.length){const q=details.trail[0];keeper.rotation.y=Math.atan2(q.x-p.x,q.z-p.z);}feet.forEach((m,i)=>m.rotation.x=details.moving?Math.sin(t*13+i*Math.PI)*.4:0);
  findObjects.forEach((g,i)=>{g.visible=lens&&!details.finds[i];g.position.y=2.5+Math.sin(t*2+i)*.3;g.rotation.y=t;});
  citizens.forEach((g,i)=>{const escort=details.company?.[i],home=details.gathering?(i===0?3:7):residents[i].node,oldX=g.position.x,oldZ=g.position.z;
   if(escort){wasCompany[i]=true;const x=escort.x+(i-1)*.65,z=escort.z+(i%2?.3:-.3),ground=x>20&&x<38&&z<-7?Math.min(5.2,.95+(-z-7)*.5):z>0&&z<18?1.52:1;g.position.set(x,ground,z);g.rotation.y=Math.atan2(details.keeper.x-x,details.keeper.z-z);}
   else{if(wasCompany[i]){companyReturnPaths[i]=route({x:g.position.x,z:g.position.z},home);wasCompany[i]=false;}let path=companyReturnPaths[i];if(!path.length&&details.gathering){if(!wasGathering)citizenPaths[i]=route({x:g.position.x,z:g.position.z},home);path=citizenPaths[i]??[];}if(path.length){const point={x:g.position.x,z:g.position.z},next=path[0];g.rotation.y=Math.atan2(next.x-point.x,next.z-point.z);advance(point,path,dt,7);const ground=point.x>20&&point.x<38&&point.z<-7?Math.min(5.2,.95+(-point.z-7)*.5):point.z>0&&point.z<18?1.52:1;g.position.set(point.x,ground,point.z);}else{const p=roads[home];g.position.set(p.x,1+Math.sin(t*1.6+i)*.018,p.z);g.rotation.y=Math.atan2(details.keeper.x-p.x,details.keeper.z-p.z);}}
   const moving=Math.hypot(g.position.x-oldX,g.position.z-oldZ)>.005;actorLegs.get(g)?.forEach((leg,j)=>leg.rotation.x=moving?Math.sin(t*11+j*Math.PI)*.32:0);
  });walkRibbons.forEach((g,i)=>{g.visible=details.walkBadges?.[i]===true;g.rotation.z=Math.sin(t*1.8+i)*.045;});repairFlames.forEach((m,i)=>{m.material.emissiveIntensity=details.litLamps?.[i]?2.7+Math.sin(t*3+i)*.2:0;m.material.color.setHex(details.litLamps?.[i]?0xffd79b:0x4d5d58);});festival.visible=details.storyDone?.[2]===true;flowerGarden.visible=details.garden===1;gardenTrees.forEach(g=>g.visible=details.garden===0);
  const points=[p,...details.trail];let index=0;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],len=Math.hypot(a.x-b.x,a.z-b.z);for(let s=0;s<len&&index<routeDots.length;s+=1.3){const m=routeDots[index++];m.position.set(a.x+(b.x-a.x)*s/len,1.1,a.z+(b.z-a.z)*s/len);m.visible=true;}}for(;index<routeDots.length;index++)routeDots[index].visible=false;
 }
 if(details?.gathering&&!wasGathering){for(let i=0;i<walkers.length;i++){const p=walkers[i].position;gatheringPaths[i]=route({x:p.x,z:p.z},p.z<10?3:7);}}wasGathering=details?.gathering===true;
 for(let i=0;i<walkers.length;i++){const p=walkers[i];if(details?.gathering){const point={x:p.position.x,z:p.position.z},path=gatheringPaths[i]??[];if(path.length){const q=path[0];p.rotation.y=Math.atan2(q.x-point.x,q.z-point.z);advance(point,path,dt,5);p.position.set(point.x,point.z>0&&point.z<18?1.52:.98,point.z);}else{const side=i%2?-1:1;p.position.x+=(-5+side*(1+i*.35)-p.position.x)*Math.min(1,dt);}}else{const e=edges[i%edges.length],a=roads[e[0]],b=roads[e[1]],u=(Math.sin(t*.07+i*.8)+1)/2;const z=a.z+(b.z-a.z)*u;p.position.set(a.x+(b.x-a.x)*u,z>0&&z<18?1.52:.98,z);p.rotation.y=Math.atan2(b.x-a.x,b.z-a.z)+(Math.cos(t*.07+i*.8)<0?Math.PI:0);}}
 for(let i=0;i<birds.length;i++){const b=birds[i];b.position.set(Math.sin(t*.1+i)*37,20+i*.4+Math.sin(t*.6+i)*.5,-17+Math.cos(t*.1+i)*20);b.rotation.y=t*.1+i;b.scale.y=.5+Math.abs(Math.sin(t*4+i))*.6;}
 lamps.forEach((m,i)=>m.scale.setScalar(.8+Math.sin(t*1.5+i)*.12+(night?.35:0)));if(petals[1])petals[1].visible=season===0;
 cats.forEach((cat,i)=>{cat.position.set(-34+i*18+Math.sin(t*.12+i)*3,1.05,i%2?23:-2);cat.rotation.y=Math.cos(t*.12+i)>0?Math.PI/2:-Math.PI/2;});
}
export function project(x:number,y:number,z:number,w:number,h:number){const v=new Vector3(x,y,z).project(camera);return{x:(v.x+1)*w/2,y:(1-v.y)*h/2};}
