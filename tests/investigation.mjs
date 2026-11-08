import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {harness} from './gameplay.mjs';
const load=async name=>import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(readFileSync(new URL('../game/src/'+name,import.meta.url),'utf8'),{mode:'strip'})).toString('base64'));
const inv=await load('investigation.ts'),walk=await load('exploration.ts');
const blank=inv.blankArchive();blank.found[0][0]=true;assert.equal(blank.found[1][0],false);inv.toggleEvidence(blank,0,0,1);assert.equal(blank.draftPairs[0][0].length,0);assert.equal(inv.assessClaim(blank,0,0),'evidence');
const corrupt=inv.loadArchive({found:[[true,true,true,true],[true,true,true,true],[true,true,true,true]],solved:[[true,true,true],[true,true,true],[true,true,true]],draftPairs:[[[1,1,2,999]],null,'bad'],draftVerdicts:[[1,Infinity,3]],account:2});assert.equal(inv.archiveReady(corrupt),false);assert.equal(corrupt.account,-1);assert.deepEqual(corrupt.draftPairs[0][0],[1,2]);assert.equal(corrupt.solved[0][0],false);
const gap=inv.blankArchive();gap.found[2]=[true,true,true,true];gap.draftPairs[2][2]=[0,3];gap.draftVerdicts[2][2]=2;assert.equal(inv.assessClaim(gap,2,2),'accepted');gap.draftPairs[2][2]=[0,0];assert.equal(inv.assessClaim(gap,2,2),'evidence');
for(const c of inv.archiveCases)for(const r of c.records){assert.ok(walk.roads[r.node]);assert.deepEqual(walk.route(walk.roads[7],r.node).at(-1),walk.roads[r.node]);}
// Collect every summary by walking to it, then test reasoning and revision.
const g=await harness();g.action('start');g.action('journal');g.click('City archive  I');assert.equal(g.evaluate('mode'),'archive');g.click('View the unfinished account');g.click('Account 2');assert.equal(g.evaluate('archiveState.account'),-1);g.action('back');
for(let c=0;c<3;c++){
 g.click('Case '+c);
 for(let i=0;i<4;i++){g.click('Record '+i);assert.equal(g.evaluate('mode'),'explore');assert.equal(g.evaluate(`archiveState.found[${c}][${i}]`),false);g.tick(20);assert.equal(g.evaluate('mode'),'archiverecord');assert.equal(g.evaluate(`archiveState.found[${c}][${i}]`),true);g.click('Back to case');}
 g.click('Compare claims');
 if(c===0){g.click('Evidence 0');g.click('Evidence 1');g.click('Verdict 1');g.click('Check reasoning');assert.match(g.evaluate('archiveFeedback'),/Reconsider/);assert.equal(g.evaluate('archiveState.solved[0][0]'),false);g.click('Verdict 0');g.click('Check reasoning');assert.match(g.evaluate('archiveFeedback'),/pair/);g.click('Evidence 0');g.click('Evidence 2');g.click('Check reasoning');assert.equal(g.evaluate('archiveState.solved[0][0]'),true);g.click('›');}
 for(let q=c===0?1:0;q<3;q++){
  const pair=inv.archiveCases[c].claims[q].pairs[0];for(const i of pair)g.click('Evidence '+i);g.click('Verdict '+inv.archiveCases[c].claims[q].answer);
  if(c===1&&q===1){const reloaded=await harness(412,915,new Map(JSON.parse(JSON.stringify([...g.stored]))));assert.equal(reloaded.evaluate('archiveState.draftPairs[1][1].join()'),pair.join());assert.equal(reloaded.evaluate('archiveState.draftVerdicts[1][1]'),1);}
  g.click('Check reasoning');assert.equal(g.evaluate(`archiveState.solved[${c}][${q}]`),true);if(q<2)g.click('›');
 }
 const minute=g.evaluate('town.minute');g.tick(4);assert.equal(g.evaluate('town.minute'),minute);g.action('back');g.click('All cases');
}
assert.equal(g.evaluate('archiveReady(archiveState)'),true);g.click('Write your account');g.click('Account 2');assert.equal(g.evaluate('archiveState.account'),2);g.click('Account 0');assert.equal(g.evaluate('archiveState.account'),0);
const saved=new Map(JSON.parse(JSON.stringify([...g.stored]))),reload=await harness(412,915,saved);assert.equal(reload.evaluate('archiveReady(archiveState)'),true);assert.equal(reload.evaluate('archiveState.account'),0);assert.equal(reload.evaluate('archiveState.found.flat().filter(Boolean).length'),12);reload.evaluate('restart()');assert.equal(reload.evaluate('archiveState.account'),-1);assert.equal(reload.evaluate('archiveState.found.flat().some(Boolean)'),false);
const legacy=await harness(412,915,new Map([['river-memory-v1',{restored:[true,true,true,true],finds:[true,false,false,false,false,false]}]]));assert.equal(legacy.evaluate('count()'),4);assert.equal(legacy.evaluate('smallCount()'),1);assert.equal(legacy.evaluate('archiveReady(archiveState)'),false);
for(const [width,height,scale] of [[1360,900,1],[412,915,1],[390,760,2],[915,412,1]]){const ui=await harness(width,height,saved,{scale});for(const mode of ['archive','archivecase','archiverecord','archiveboard','account']){ui.evaluate(`change('${mode}');archiveCase=2;archiveClaim=1;archiveGuide=true;`);ui.render();for(const b of ui.evaluate('buttons'))assert.ok(b.x>=0&&b.y>=0&&b.x+b.w<=ui.evaluate('w')+1&&b.y+b.h<=ui.evaluate('h')+1,`${width}x${height}: ${mode}/${b.label} outside screen`);}}
// Keyboard and touch can link the same evidence without bypassing collection.
const input=await harness(390,760,new Map(),{scale:2});input.evaluate("archiveState.found[0]=[true,true,true,true];change('archiveboard')");input.action('pick1');input.action('pick2');input.action('movedown');input.action('start');assert.equal(input.evaluate('archiveState.solved[0][0]'),true);input.action('orbitright');input.render();const b=input.evaluate('buttons').find(b=>b.label==='Evidence 0'),d=input.evaluate('d');input.cb.touch({primary:true,control:false,phase:'start',x:(b.x+12)*d,y:(b.y+10)*d});input.cb.touch({primary:true,control:false,phase:'end',x:(b.x+12)*d,y:(b.y+10)*d});assert.equal(input.evaluate('archiveState.draftPairs[0][1][0]'),0);
console.log('PASS: twelve routed reading stations, nine evidence arguments, wrong-pair/verdict recovery, paused research, partial and complete saves, account revision, old-save compatibility, touch, keyboard and responsive archive panels.');
