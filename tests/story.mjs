import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {harness} from './gameplay.mjs';
const source=readFileSync(new URL('../game/src/stories.ts',import.meta.url),'utf8');
const st=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source,{mode:'strip'})).toString('base64'));
function solveMosaic(tiles){
 const start=tiles.join(''),goal='123450',queue=[start],prev=new Map([[start,null]]);
 for(let head=0;head<queue.length;head++){const state=queue[head];if(state===goal)break;const gap=state.indexOf('0');for(let i=0;i<6;i++){if(!(Math.floor(i/3)===Math.floor(gap/3)&&Math.abs(i-gap)===1||Math.abs(i-gap)===3))continue;const next=state.split('');[next[i],next[gap]]=[next[gap],next[i]];const key=next.join('');if(!prev.has(key)){prev.set(key,[state,i]);queue.push(key);}}}
 assert.ok(prev.has(goal),'Postcard is solvable');const moves=[];let current=goal;while(current!==start){const [before,index]=prev.get(current);moves.unshift(index);current=before;}return moves;
}
const mosaic=st.createMosaic();assert.notEqual(mosaic.tiles.join(''),'123450');const solution=solveMosaic(mosaic.tiles);assert.ok(solution.length>4);for(const move of solution)assert.equal(st.moveMosaic(mosaic,move),true);assert.equal(mosaic.done,true);assert.equal(st.moveMosaic(mosaic,0),false);
const lamp=st.createLamp();assert.equal(st.strikeLamp(lamp),false);assert.equal(lamp.sparks,0);lamp.assist=true;for(let step=0;step<1000&&!lamp.done;step++){lamp.time+=1/30;if(Math.abs(st.lampNeedle(lamp)-st.lampTargets[lamp.sparks])<.12)st.strikeLamp(lamp);}assert.equal(lamp.done,true);
const g=await harness();g.action('start');g.action('meet0');g.tick(20);assert.equal(g.evaluate('mode'),'resident');assert.equal(g.evaluate('story.met[0]'),true);
for(let i=0;i<2;i++){g.click('Follow the request');g.tick(20);assert.equal(g.evaluate('mode'),'discovery');g.click('Return to the streets');g.action('meet0');g.tick(20);}
g.click('Follow the request');assert.equal(g.evaluate('mode'),'mosaic');
const moves=solveMosaic(g.evaluate('mosaic.tiles'));g.click('Postcard position '+moves[0]);const partial=await harness(412,915,g.stored);assert.equal(partial.evaluate('mosaic.tiles.join()'),g.evaluate('mosaic.tiles.join()'));assert.equal(partial.evaluate('story.done[0]'),false);
for(const move of moves.slice(1))g.click('Postcard position '+move);assert.equal(g.evaluate('story.done[0]'),true);assert.equal(g.evaluate('mode'),'resident');g.click('Use the compass');assert.equal(g.evaluate('travelKind'),'find');g.tick(20);g.click('Return to the streets');
g.action('meet1');g.tick(20);g.click('Follow the request');g.tick(20);assert.equal(g.evaluate('mode'),'discovery');g.click('Return to the streets');g.evaluate('restored[2]=true');g.action('meet1');g.tick(20);g.click('Follow the request');assert.equal(g.evaluate('mode'),'gardenchoice');g.click('Plant a place of shade');assert.equal(g.evaluate('story.done[1]'),true);assert.equal(g.evaluate('story.garden'),0);assert.equal(g.evaluate('brisk'),true);g.click('Change the garden');g.click('Plant a place of colour');assert.equal(g.evaluate('story.garden'),1);g.action('back');
for(let i=0;i<3;i++){
 g.action('meet2');g.tick(20);g.click('Follow the request');g.tick(20);assert.equal(g.evaluate('mode'),'lamplight');if(i===0){const time=g.evaluate('lampGame.time');g.action('journal');g.tick(2);assert.equal(g.evaluate('lampGame.time'),time);g.action('back');assert.equal(g.evaluate('mode'),'lamplight');}
 if(i===0){for(let tries=0;tries<200&&g.evaluate('lampGame.sparks')===0;tries++){if(g.evaluate('Math.abs(lampNeedle(lampGame)-lampTargets[lampGame.sparks])<.1'))g.click('Strike a spark');else g.tick(1/30);}const checkpoint=await harness(412,915,g.stored);assert.equal(checkpoint.evaluate('story.sparks[0]'),1);}
 for(let tries=0;tries<1000&&g.evaluate('mode')==='lamplight';tries++){if(g.evaluate('Math.abs(lampNeedle(lampGame)-lampTargets[lampGame.sparks])<.1'))g.click('Strike a spark');else g.tick(1/30);}
 assert.equal(g.evaluate('story.lamps['+i+']'),true);
}
g.action('meet2');g.tick(20);g.click('Follow the request');assert.equal(g.evaluate('requestCount()'),3);g.action('back');g.action('map');assert.equal(g.evaluate('mode'),'map');g.click('Read the letter');assert.equal(g.evaluate('mode'),'letter');g.click('›');assert.equal(g.evaluate('letterPage'),1);
const restored=await harness(412,915,g.stored);assert.equal(restored.evaluate('requestCount()'),3);assert.equal(restored.evaluate('story.garden'),1);assert.equal(restored.evaluate('story.lamps.every(Boolean)'),true);
for(const [width,height,scale] of [[1360,900,1],[412,915,1],[390,760,2],[915,412,1]]){
 const ui=await harness(width,height,new Map(),{scale});for(const mode of ['map','resident','mosaic','lamplight','gardenchoice','letter']){ui.evaluate(`change('${mode}')`);ui.render();for(const b of ui.evaluate('buttons'))assert.ok(b.x>=0&&b.y>=0&&b.x+b.w<=ui.evaluate('w')+1&&b.y+b.h<=ui.evaluate('h')+1,`${mode}, ${width}x${height}: ${b.label} outside screen`);}
}
console.log('PASS: solvable postcard, timing assists, linked resident requests, persistent partial puzzle, compass, reversible garden, lamp route, paused activities, living letter, save migration and mobile panels.');
