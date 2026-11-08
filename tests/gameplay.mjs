import vm from 'node:vm';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
const file=name=>readFileSync(new URL('../game/src/'+name,import.meta.url),'utf8');
const load=async name=>import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(file(name),{mode:'strip'})).toString('base64'));
const mechanics=await load('mechanics.ts'),exploration=await load('exploration.ts'),stories=await load('stories.ts'),fieldwork=await load('fieldwork.ts'),courier=await load('courier.ts'),townlife=await load('townlife.ts'),investigation=await load('investigation.ts'),workshop=await load('workshop.ts'),eveningwalk=await load('eveningwalk.ts'),exhibition=await load('exhibition.ts');
export async function harness(width=1360,height=900,stored=new Map(),{scale=1,drawApi=null}={}){
 let studyFocus=-1;const cb={},keys=new Set();const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});const node=()=>({gain:param(),frequency:param(),connect(){},disconnect(){},start(){},stop(){}});
 const ctx=vm.createContext({...mechanics,...exploration,...stories,...fieldwork,...courier,...townlife,...investigation,...workshop,...eveningwalk,...exhibition,Math,Number,String,Boolean,Array,JSON,
  frame:()=>({width:width*scale,height:height*scale,scale,delta:1/60}),onStart:f=>cb.start=f,onFixedUpdate:f=>cb.update=f,onRender:f=>cb.render=f,setFixedRate(){},openLink:async()=> 'unavailable',
  onPointerMove:f=>cb.move=f,onPointerButton:f=>cb.pointer=f,onWheel:f=>cb.wheel=f,onTouch:f=>cb.touch=f,onAction:f=>cb.action=f,value:k=>keys.has(k)?1:0,setCursor(){},
  storage:{getJson:k=>stored.get(k),setJson:(k,v)=>stored.set(k,v)},audio:{createOscillator:node,createGain:node,createNoise:node,createBiquadFilter:node,currentTime:0,bus:()=>({})},
  files:{saveAs:async()=> 'view.png'},renderer:{capture:async()=>new Uint8Array([1,2,3])},draw:drawApi??new Proxy({},{get:()=>()=>{}}),createWorld(){},updateWorld(){},project:(x,y,z,w,h)=>{if(studyFocus<0)return{x:w/2+x*3,y:h/2+z*2-y};const p=fieldwork.studies[studyFocus].position,dx=x-p.x,dy=y-p.y,dz=z-p.z,s=h/(2*Math.max(44,72*h/w))*2.15;return{x:w/2+(.802*dx-.597*dz)*s,y:h/2-(-.355*dx+.804*dy-.477*dz)*s};},sites:[],orbit(){},magnify(){},overview(){studyFocus=-1;},focus(){studyFocus=-1;},residentPlace:i=>({...exploration.roads[stories.residents[i].node]}),focusExhibition(){studyFocus=-1;},focusEvening(){studyFocus=-1;},focusWorkshop(){studyFocus=-1;},focusStudy:i=>studyFocus=i,setNight(){},setSeason(){},groundFromScreen:()=>({x:-5,z:22})
 });
 vm.runInContext(file('history.ts').replace('export const chapters','const chapters'),ctx);
 vm.runInContext(stripTypeScriptTypes(file('main.ts'),{mode:'strip'}).replace(/^import .*;\s*$/gm,''),ctx);cb.start();cb.render();
 const evaluate=s=>vm.runInContext(s,ctx),render=()=>cb.render();
 const action=name=>{cb.action({pressed:true,action:name});render();};
 const tick=seconds=>{for(let i=0;i<Math.ceil(seconds*30);i++)cb.update(1/30);render();};
 const click=label=>{const b=evaluate('buttons').find(b=>b.label===label);assert.ok(b,`Missing button ${label}`);const d=evaluate('d');cb.pointer({button:0,pressed:true,x:(b.x+b.w/2)*d,y:(b.y+b.h/2)*d});cb.pointer({button:0,pressed:false,x:(b.x+b.w/2)*d,y:(b.y+b.h/2)*d});render();};
 return{evaluate,action,click,tick,stored,cb,render,keys};
}
// Route finding must use graph edges and cross the river only at the bridge.
for(let a=0;a<exploration.roads.length;a++)for(let b=0;b<exploration.roads.length;b++){
 const path=exploration.route(exploration.roads[a],b);assert.equal(path.at(-1).x,exploration.roads[b].x);assert.equal(path.at(-1).z,exploration.roads[b].z);
 for(let i=1;i<path.length;i++){const u=exploration.nearestRoad(path[i-1]),v=exploration.nearestRoad(path[i]);assert.ok(exploration.edges.some(e=>e.includes(u)&&e.includes(v)),`Non-street route: ${u} → ${v}`);if(path[i-1].z<18&&path[i].z>0&&path[i].z!==path[i-1].z&&path[i-1].z>=-1){assert.equal(path[i].x,-5);}}
}
const rings=mechanics.createChallenge(0);for(let i=0;i<3;i++)for(let j=0;j<[5,2,7][i];j++)mechanics.turnRing(rings,i);assert.equal(rings.done,true);
const roots=mechanics.createChallenge(2);mechanics.waterNetwork(roots);assert.equal(roots.done,false);roots.tiles.fill(0);assert.equal(mechanics.waterNetwork(roots),true);assert.equal(roots.wet[0],true);assert.equal(roots.wet[3],true);
const melody=mechanics.createChallenge(1);assert.equal(mechanics.playNote(melody,0),false);assert.equal(melody.input.length,0);for(let round=0;round<3;round++){while(melody.playing)mechanics.updateChallenge(melody,.1);mechanics.playNote(melody,(melody.sequence[0]+1)%4);assert.equal(melody.input.length,0);for(const n of melody.sequence.slice())mechanics.playNote(melody,n);}assert.equal(melody.done,true);
const boat=mechanics.createChallenge(3);boat.calm=true;for(let i=0;i<1400&&!boat.done;i++){boat.aim=mechanics.riverGates.find((g,j)=>!boat.hit[j])?.gap??.5;mechanics.updateChallenge(boat,1/30);}assert.equal(boat.done,true);assert.equal(boat.gates,5);
const bump=mechanics.createChallenge(3);bump.boat=.9;bump.aim=.9;bump.distance=.159;mechanics.updateChallenge(bump,.1);assert.equal(bump.bumps,1);assert.ok(bump.distance<.16);assert.equal(bump.hit[0],false);
// Actual game state machine: travel, all four mechanics, historical evidence,
// incorrect-order recovery, notebook, dedication and older save migration.
const g=await harness();g.click('Begin the journey');g.click('The castle');assert.equal(g.evaluate('mode'),'explore');assert.ok(g.evaluate('path.length')>0);g.tick(20);assert.equal(g.evaluate('mode'),'intro');g.click('Enter the echo');assert.equal(g.evaluate('mode'),'challenge');
for(const [label,n] of [['Outer +',5],['Middle +',2],['Inner +',7]])for(let i=0;i<n;i++)g.click(label);g.tick(1.5);assert.equal(g.evaluate('mode'),'puzzle');
g.action('pick0');g.action('pick1');g.action('pick2');g.action('start');assert.equal(g.evaluate('wrong'),true);assert.equal(g.evaluate('count()'),0);
g.action('pick0');g.action('pick1');g.action('pick2');for(const key of ['pick2','pick0','pick1'])g.action(key);g.action('start');assert.equal(g.evaluate('count()'),1);g.action('back');
for(let i=1;i<4;i++){
 g.action('site'+i);g.tick(20);g.action('start');assert.equal(g.evaluate('mode'),'challenge');
 if(i===1){for(let r=0;r<3;r++){g.tick(5);const notes=g.evaluate('challenge.sequence.slice()');for(const n of notes)g.action('pick'+n);}}
 if(i===2){for(let j=0;j<16;j++){let needed=g.evaluate(`(4-challenge.tiles[${j}])%4`);while(needed-->0&&g.evaluate('mode')==='challenge'&&!g.evaluate('challenge.done'))g.click('Channel '+(j+1));}}
 if(i===3){g.click('Calm current');for(let step=0;step<1000&&g.evaluate('mode')==='challenge';step++){const state=g.evaluate('challenge');const next=mechanics.riverGates.find((gate,j)=>!state.hit[j]);g.evaluate(`challenge.aim=${next?.gap??.5}`);g.tick(.1);}}
 g.tick(1.5);assert.equal(g.evaluate('mode'),'puzzle');for(const key of i%2?['pick1','pick2','pick0']:['pick2','pick0','pick1'])g.action(key);g.action('start');assert.equal(g.evaluate('count()'),i+1);g.action('back');
}
g.action('lens');for(let i=0;i<6;i++){g.evaluate(`walkTo(discoveries[${i}].node,'find',${i})`);g.tick(20);assert.equal(g.evaluate('mode'),'discovery');g.click('Return to the streets');}assert.equal(g.evaluate('smallCount()'),6);
g.click('Dedicate the river lights');assert.equal(g.evaluate('mode'),'dedication');g.click('Those after us');assert.equal(g.evaluate('mode'),'finale');assert.equal(g.evaluate('verse'),2);
const loaded=await harness(412,915,g.stored);assert.equal(loaded.evaluate('count()'),4);assert.equal(loaded.evaluate('smallCount()'),6);assert.equal(loaded.evaluate('verse'),2);
const legacy=new Map([['river-memory-v1',{restored:[true,false,true,false],night:true,muted:true}]]);const migrated=await harness(412,915,legacy);assert.equal(migrated.evaluate('count()'),2);assert.equal(migrated.evaluate('smallCount()'),0);
for(const [width,height,scale] of [[1360,900,1],[412,915,1],[390,760,2],[915,412,1]]){
 const test=await harness(width,height,new Map(),{scale});test.action('start');test.action('site1');test.tick(20);test.action('start');test.action('journal');const elapsed=test.evaluate('challenge.elapsed');test.tick(1);assert.equal(test.evaluate('challenge.elapsed'),elapsed);test.action('back');assert.equal(test.evaluate('mode'),'challenge');
 for(const active of [0,1,2,3]){test.evaluate(`active=${active};startChallenge()`);test.render();for(const b of test.evaluate('buttons'))assert.ok(b.x>=0&&b.y>=0&&b.x+b.w<=test.evaluate('w')+1&&b.y+b.h<=test.evaluate('h')+1,`${width}x${height}: ${b.label} outside screen`);}
 const b=test.evaluate('buttons').find(b=>b.label==='Calm current'),d=test.evaluate('d');test.cb.touch({primary:true,control:false,phase:'start',x:(b.x+10)*d,y:(b.y+10)*d});test.cb.touch({primary:true,control:false,phase:'end',x:(b.x+10)*d,y:(b.y+10)*d});assert.equal(test.evaluate('challenge.calm'),true);
}
console.log('PASS: street routes, all four mechanics, retries, travel, evidence, six discoveries, dedication, save migration, paused journal, touch and responsive controls.');
