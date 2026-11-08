import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {harness} from './gameplay.mjs';
const code=stripTypeScriptTypes(readFileSync(new URL('../game/src/fieldwork.ts',import.meta.url),'utf8'),{mode:'strip'});
const fw=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const paths=[[],[],[]];let active=-1;for(const guide of fw.weaveGuide)for(const cell of guide)active=fw.extendThread(paths,active,cell);assert.equal(fw.pathsValid(paths),true);assert.equal(fw.weaveComplete(paths),true);
assert.equal(fw.pathsValid([[0,6],[],[]]),false);assert.equal(fw.pathsValid([[0,1],[5,0],[]]),false);assert.equal(fw.pathsValid([[0,-5],[],[]]),false);const unchanged=JSON.stringify(paths);fw.extendThread(paths,0,-5);assert.equal(JSON.stringify(paths),unchanged);
const partial=[[],[],[]];active=fw.extendThread(partial,-1,0);active=fw.extendThread(partial,active,1);active=fw.extendThread(partial,active,2);fw.extendThread(partial,active,1);assert.deepEqual(partial[0],[0,1]);
const g=await harness();g.action('start');g.action('fieldwork');g.click('Prepare the gathering');assert.equal(g.evaluate('mode'),'fieldwork');
for(let i=0;i<2;i++){
 const study=fw.studies[i];g.click('Follow '+study.short);g.tick(20);assert.equal(g.evaluate('mode'),'observation');g.click('Keep field notes');assert.equal(g.evaluate('field.recorded['+i+']'),false);
 for(const feature of study.features)g.click(feature.name);
 if(i===0){await g.evaluate('saveView()');assert.equal(g.evaluate('savingView'),false);assert.match(g.evaluate('toast'),/PNG/);g.evaluate("renderer.capture=async()=>{throw new Error('No GPU')}");await g.evaluate('saveView()');assert.match(g.evaluate('toast'),/could not save/);assert.equal(g.evaluate('field.marks[0].every(Boolean)'),true);}
 g.click('Keep field notes');assert.equal(g.evaluate('mode'),'fieldwork');assert.equal(g.evaluate('field.recorded['+i+']'),true);
}
g.evaluate('restored=[true,true,true,true];story.done=[true,true,true];finds=[true,true,true,true,true,true];');g.render();g.click('Prepare the gathering');assert.equal(g.evaluate('mode'),'weaving');
for(const cell of fw.weaveGuide[0])g.click('Thread cell '+cell);const recovered=await harness(412,915,g.stored);assert.equal(recovered.evaluate('field.paths[0].join()'),fw.weaveGuide[0].join());assert.equal(recovered.evaluate('field.recorded.every(Boolean)'),true);
for(const guide of fw.weaveGuide.slice(1))for(const cell of guide)g.click('Thread cell '+cell);assert.equal(g.evaluate('weaveComplete(field.paths)'),true);g.click('Bring the city together');assert.equal(g.evaluate('mode'),'dedication');assert.equal(g.evaluate('field.gathered'),true);g.click('Those beside us');assert.equal(g.evaluate('mode'),'finale');
for(const [width,height,scale] of [[1360,900,1],[412,915,1],[390,760,2],[915,412,1]]){
 const ui=await harness(width,height,new Map(),{scale});for(const mode of ['fieldwork','observation','weaving']){ui.evaluate(`change('${mode}')`);if(mode==='observation')ui.evaluate('focusStudy(0)');ui.render();for(const b of ui.evaluate('buttons'))assert.ok(b.x>=0&&b.y>=0&&b.x+b.w<=ui.evaluate('w')+1&&b.y+b.h<=ui.evaluate('h')+1,`${mode}, ${width}x${height}: ${b.label} outside screen`);}
 // Continuous touch dragging creates one complete thread without pointer clicks.
 const board=ui.evaluate('weaveBoard'),d=ui.evaluate('d'),point=cell=>({x:(board.x+(cell%5+.5)*board.size)*d,y:(board.y+(Math.floor(cell/5)+.5)*board.size)*d});
 const first=point(0);ui.cb.touch({primary:true,control:false,phase:'start',...first});for(const cell of fw.weaveGuide[0].slice(1))ui.cb.touch({primary:true,control:false,phase:'move',...point(cell)});ui.cb.touch({primary:true,control:false,phase:'end',...point(14)});assert.equal(ui.evaluate('connected(field.paths,0)'),true);
}
const old=await harness(412,915,new Map([['river-memory-v1',{restored:[true,true,true,true],story:{done:[true,true,true],met:[true,true,true],lamps:[true,true,true],sparks:[3,3,3],mosaic:true,garden:0}}]]));assert.equal(old.evaluate('fieldCount()'),0);assert.equal(old.evaluate('requestCount()'),3);
console.log('PASS: heritage visits, detail inspection, note recording, PNG success/failure handling, valid light weaving, non-crossing paths, partial saves, gathering unlocks, touch drawing, mobile panels and older saves.');
