import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
const file=name=>readFileSync(new URL('../game/src/'+name,import.meta.url),'utf8');
const load=async name=>import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(file(name),{mode:'strip'})).toString('base64'));
const river=await load('river.ts'),{chapters}=await load('chapters.ts');
// Persistence accepts only bounded, finite state and never trusts a skipped chapter.
assert.deepEqual(river.restoreRiver(null),river.blankRiver());
assert.equal(river.restoreRiver({version:1,restored:[true,true,true,true]}).chapter,0);
const corrupt=river.restoreRiver({version:2,chapter:99,x:Infinity,y:-99,time:NaN,mail:[[7,2]],finished:true});
assert.equal(corrupt.chapter,0);assert.equal(corrupt.x,140);assert.equal(corrupt.y,river.WATER_TOP);assert.equal(corrupt.time,0);assert.equal(corrupt.finished,false);
const s=river.blankRiver();assert.equal(river.nextChapter(s),false);assert.equal(river.deliver(s,0,0),false);
s.x=245;s.y=540;s.mail[0][0]=1;assert.equal(river.deliver(s,1,0),false);assert.equal(river.deliver(s,0,3),false);assert.equal(river.deliver(s,0,1),true);assert.equal(river.deliver(s,0,0),false);
// The bank and river bounds hold under sustained input, including dropped-frame deltas.
for(const x of [-1,1])for(const y of [-1,1]){const st=river.blankRiver();for(let i=0;i<1200;i++)river.advanceRiver(st,2,{x,y,brake:false,target:null});assert.ok(st.x>=80&&st.x<=1360);assert.ok(st.y>=river.WATER_TOP&&st.y<=river.WATER_BOTTOM);}
const bump=river.blankRiver(),reed=river.reeds(0)[0];bump.x=reed.x;bump.y=reed.y;bump.vx=90;assert.ok(river.advanceRiver(bump,1/60,{x:0,y:0,brake:false,target:null}).some(e=>e.kind==='bump'));assert.ok(bump.vx<90);
const gentle=river.blankRiver();gentle.gentle=true;gentle.x=reed.x;gentle.y=reed.y;assert.equal(river.advanceRiver(gentle,1/60,{x:0,y:0,brake:false,target:null}).length,0);
const braking=river.blankRiver();braking.vx=100;river.advanceRiver(braking,.05,{x:0,y:0,brake:true,target:null});assert.ok(braking.vx<50);

function harness(width=1440,height=900,scale=1,stored=new Map()){
 const cb={},keys=new Set();let cameraX=720,visibleWidth=1440;
 const draw=new Proxy({measureText:(s,o)=>({width:s.length*o.size*.53,height:o.size})},{get:(o,k)=>o[k]??(()=>{})});
 const ctx=vm.createContext({...river,chapters,Math,Number,String,Boolean,Array,JSON,Promise,
  frame:()=>({width:width*scale,height:height*scale,scale,delta:1/60}),onStart:f=>cb.start=f,onFixedUpdate:f=>cb.tick=f,onRender:f=>cb.render=f,setFixedRate(){},setReady(){},
  onPointerMove:f=>cb.move=f,onPointerButton:f=>cb.pointer=f,onTouch:f=>cb.touch=f,onAction:f=>cb.action=f,value:k=>keys.has(k)?1:0,setCursor(){},
  storage:{getJson:k=>stored.get(k),setJson:(k,v)=>stored.set(k,structuredClone(v))},
  draw,worldReady:true,worldError:'',createWorld:async()=>{},loadSound:async()=>{},startSound(){},muteSound(){},chime(){},
  updateWorld:(s,w,h,dt,title)=>{visibleWidth=900*w/h;cameraX=title||visibleWidth>=1440?720:Math.max(visibleWidth/2,Math.min(1440-visibleWidth/2,s.x));},
  screenPoint:(x,y,w,h)=>({x:(x-cameraX)/visibleWidth*w+w/2,y:y/900*h}),
  riverPoint:(x,y,w,h)=>({x:(x-w/2)/w*visibleWidth+cameraX,y:y/h*900})
 });
 vm.runInContext(stripTypeScriptTypes(file('main.ts'),{mode:'strip'}).replace(/^import .*;\s*$/gm,''),ctx);cb.start();cb.render();
 const evaluate=code=>vm.runInContext(code,ctx),render=()=>cb.render();
 const tick=seconds=>{for(let i=0;i<Math.ceil(seconds*60);i++)cb.tick(1/60);render();};
 const action=name=>{cb.action({pressed:true,action:name});render();};
 const click=label=>{const b=evaluate('buttons').find(b=>b.label===label);assert.ok(b,`missing ${label} in ${evaluate('mode')}`);const d=evaluate('d');cb.pointer({button:0,pressed:true,x:(b.x+b.w/2)*d,y:(b.y+b.h/2)*d});cb.pointer({button:0,pressed:false,x:(b.x+b.w/2)*d,y:(b.y+b.h/2)*d});render();};
 const sailTo=(x,y)=>{evaluate(`target={x:${x},y:${y}}`);for(let i=0;i<1800;i++){cb.tick(1/60);if(evaluate(`Math.hypot(state.x-${x},state.y-${y})`)<25){render();return;}}assert.fail(`could not sail to ${x},${y}: ${evaluate('JSON.stringify({mode,state,target})')}`);};
 return{evaluate,render,tick,action,click,sailTo,stored,keys,cb};
}
const legacy=new Map([['river-memory-v1',{restored:[true,true,false,false]}]]),g=harness(1440,900,1,legacy);
g.click('Cast off  →');assert.equal(g.evaluate('mode'),'intro');g.click('Take to the water  →');
g.keys.add('right');g.tick(.6);g.keys.clear();assert.ok(g.evaluate('state.x')>160);
g.action('journal');const before=g.evaluate('state.time');g.tick(2);assert.equal(g.evaluate('state.time'),before);g.click('Close');assert.equal(g.evaluate('mode'),'sail');
for(let c=0;c<3;c++){
 for(let i=0;i<3;i++){
  // Sail through the actual physics to each drifting envelope and matching landing.
  let p=g.evaluate(`mailPosition(${i},state.time)`);g.sailTo(p.x,p.y);
  assert.equal(g.evaluate(`state.mail[${c}][${i}]`),1);
  g.sailTo(river.landings[i].x,545);g.action('interact');assert.equal(g.evaluate('mode'),'letter');
  if(c===0&&i===0){g.action('down');assert.equal(g.evaluate('selectedReply'),1);g.action('up');g.action('start');}else g.click(chapters[c].notes[i].choices[(c+i)%2]);assert.equal(g.evaluate(`state.mail[${c}][${i}]`),2);
  assert.equal(g.evaluate(`state.replies[${c}][${i}]`),(c+i)%2);
 }
 assert.equal(g.evaluate('mode'),'chapter');g.click(c===2?'Bring the last story home  →':'Follow the river  →');
 if(c<2)g.click('Take to the water  →');
}
assert.equal(g.evaluate('mode'),'ending');assert.equal(g.evaluate('state.finished'),true);assert.equal(g.evaluate('deliveredCount(state)'),9);assert.deepEqual(legacy.get('river-memory-v1'),{restored:[true,true,false,false]});
const reloaded=harness(412,915,1,g.stored);reloaded.action('start');assert.equal(reloaded.evaluate('mode'),'ending');
// Restart has a cancel path, retains accessibility/audio preferences, and resets only this game.
g.click('Stay by the river');g.action('back');g.action('journal');g.click('Close');g.click('Return to the water');assert.equal(g.evaluate('mode'),'sail');g.action('back');g.click('Start over');g.click('Keep this journey');assert.equal(g.evaluate('deliveredCount(state)'),9);g.click('Gentle current: off');g.click('Start over');g.click('Start a new journey');assert.equal(g.evaluate('deliveredCount(state)'),0);assert.equal(g.evaluate('state.gentle'),true);
// Every screen's interactive controls fit desktop, portrait, landscape and HiDPI layouts.
for(const [width,height,scale] of [[1440,900,1],[390,844,1],[412,915,2],[915,412,1]]){
 const test=harness(width,height,scale);test.action('start');test.action('start');
 for(const mode of ['sail','intro','letter','chapter','ending','journal','pause','reset','title']){
  test.evaluate(`mode='${mode}'`);test.render();
  for(const b of test.evaluate('buttons'))assert.ok(b.x>=-30&&b.y>=0&&b.x+b.w<=test.evaluate('w')+30&&b.y+b.h<=test.evaluate('h'),`${width}x${height} ${mode}: ${b.label} outside screen`);
 }
 test.evaluate("mode='sail'");test.render();const xx=test.evaluate('w')*.5,yy=test.evaluate('h')*.8,d=test.evaluate('d');
 test.cb.touch({primary:true,control:false,phase:'start',x:xx*d,y:yy*d});test.cb.touch({primary:true,control:false,phase:'end',x:xx*d,y:yy*d});assert.ok(test.evaluate('target'));
 test.action('back');const x=test.evaluate('state.x');test.tick(2);assert.equal(test.evaluate('state.x'),x);
}
console.log('PASS: nine-letter journey, physics, collisions, docking, replies, chapter gates, saves, legacy isolation, pause, restart, touch, responsive layouts.');
