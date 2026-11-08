import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {harness} from './gameplay.mjs';
const load=async name=>import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(readFileSync(new URL('../game/src/'+name,import.meta.url),'utf8'),{mode:'strip'})).toString('base64'));
const c=await load('courier.ts'),e=await load('exploration.ts');
// Independent all-pairs shortest paths provide an oracle for route budgets.
const distances=e.roads.map((_,i)=>e.roads.map((_,j)=>i===j?0:Infinity));for(const [a,b] of e.edges)distances[a][b]=distances[b][a]=Math.hypot(e.roads[a].x-e.roads[b].x,e.roads[a].z-e.roads[b].z);for(let k=0;k<e.roads.length;k++)for(let i=0;i<e.roads.length;i++)for(let j=0;j<e.roads.length;j++)distances[i][j]=Math.min(distances[i][j],distances[i][k]+distances[k][j]);
const cost=(from,index)=>distances[e.nearestRoad(from)][c.courierStops[index].node];
const circuits=[];for(let seed=1;seed<6;seed++){const run=c.makeCircuit(seed,e.roads[7],cost);assert.equal(new Set(run.stops).size,3);assert.ok(Number.isFinite(run.optimum)&&run.optimum>0);circuits.push(run.stops.join());}assert.ok(new Set(circuits).size>=3);
assert.equal(c.restoreCircuit({stops:[1,1,2]}),null);const sample=c.makeCircuit(4,e.roads[7],cost);sample.walked=sample.optimum*1.5;assert.ok(c.routeEfficiency(sample)<.7);assert.equal(c.restoreCircuit(sample).active,false);
const g=await harness();g.action('courier');g.click('Take a city walk');const initial=g.evaluate('circuit');let best=Infinity,bestOrder=[];for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let d=0;d<3;d++){if(a===b||a===d||b===d)continue;const order=[a,b,d],len=cost(initial.origin,initial.stops[a])+cost(c.courierStops[initial.stops[a]],initial.stops[b])+cost(c.courierStops[initial.stops[b]],initial.stops[d]);if(len<best){best=len;bestOrder=order;}}
assert.ok(Math.abs(initial.optimum-best)<1e-6);g.tick(5);assert.equal(g.evaluate('circuit.elapsed'),0);
for(let n=0;n<3;n++){const i=bestOrder[n];g.click('Deliver '+i);g.tick(25);assert.equal(g.evaluate('mode'),'courier');assert.equal(g.evaluate('circuit.stamped['+i+']'),true);if(n===0){const reloaded=await harness(412,915,g.stored);assert.equal(reloaded.evaluate('circuit.active'),false);assert.equal(reloaded.evaluate('circuit.stamped.filter(Boolean).length'),1);assert.equal(reloaded.evaluate('keeper.x'),g.evaluate('keeper.x'));}}
assert.equal(g.evaluate('circuit.finished'),true);assert.equal(g.evaluate('courierRuns'),1);assert.ok(g.evaluate('courierBest')>.999);assert.ok(Math.abs(g.evaluate('circuit.walked')-best)<1e-6);g.click('Deliver '+bestOrder[0]);assert.equal(g.evaluate('courierRuns'),1);
for(const [width,height,scale] of [[1360,900,1],[412,915,1],[390,760,2],[915,412,1]]){const ui=await harness(width,height,new Map(),{scale});ui.action('courier');ui.click('Take a city walk');for(const b of ui.evaluate('buttons'))assert.ok(b.x>=0&&b.y>=0&&b.x+b.w<=ui.evaluate('w')+1&&b.y+b.h<=ui.evaluate('h')+1,`${width}x${height}: ${b.label} outside screen`);}
console.log('PASS: varied seeded circuits, independent shortest-route budgets, exact walked distance, paused planning, delivery checkpoints, persisted position, local records and mobile panels.');
