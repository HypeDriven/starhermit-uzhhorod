// These residents and their requests are fictional, not historical testimony.
export const residents=[
 {name:'Marta',role:'The bookbinder',node:20,color:0xa47772,title:'The unsent letter',
  hello:'The postcard has a view, but no voice. The folded paper has words, but no address. Bring them together. A place needs someone to tell it carefully.',
  question:'What belongs in the letter?',answer:'The window with someone behind it. The tree planted for somebody not yet born. You may keep the castle too — just do not let it take up the whole page.',
  finished:'The postcard is whole, but your letter is still open. Keep adding what you notice. Here: a compass for the small things people walk past.',reward:'Memory compass · follow the nearest unfound story'},
 {name:'Olena',role:'The gardener',node:11,color:0x789477,title:'A garden for a stranger',
  hello:'People call a garden finished when the planting is done. I call that the beginning. Bring me the pressed leaf, and help the promenade remember how to carry water.',
  question:'What would you plant first?',answer:'Something for someone else. Shade for a tired walker, or flowers for a person who has forgotten to look up. There is more than one way to care for a street.',
  finished:'You have made a choice for someone you may never meet. That is what a public garden is. The paths feel a little more familiar under your feet now.',reward:'Brisk walking · a new public garden appears'},
 {name:'Danylo',role:'The lamplighter',node:7,color:0xb49562,title:'A path after dark',
  hello:'Three lamps have lost their little fires. One by the western walk, one near the music, and one across the river. Help them catch, and I will string lights along the bridge.',
  question:'Why keep the lamps lit?',answer:'A light does not need to explain the whole road. Sometimes it only needs to show the next person where to put a foot.',
  finished:'Look at the crossing now. The extra lights are not a monument to us. They are an invitation to whoever comes after sunset.',reward:'Bridge illumination · a warmer river-light finale'}
];
export const repairLamps=[{node:0,name:'Western walk'},{node:4,name:'Music square'},{node:13,name:'Opposite bank'}];
export type StoryState={met:boolean[];done:boolean[];mosaic:boolean;lamps:boolean[];sparks:number[];garden:number};
export function blankStory():StoryState{return{met:[false,false,false],done:[false,false,false],mosaic:false,lamps:[false,false,false],sparks:[0,0,0],garden:-1};}
export function questReady(s:StoryState,i:number,finds:boolean[],restored:boolean[]){return i===0?finds[0]&&finds[2]&&s.mosaic:i===1?finds[3]&&restored[2]:s.lamps.every(Boolean);}
export function questTask(s:StoryState,i:number,finds:boolean[],restored:boolean[]){
 if(s.done[i])return residents[i].reward;
 if(i===0){if(!finds[0])return 'Find the printer’s scrap in the old town.';if(!finds[2])return 'Find the unfinished postcard in the western old town.';if(!s.mosaic)return 'Bring the two papers to Marta and mend the postcard.';return 'Return to Marta with the mended postcard.';}
 if(i===1){if(!finds[3])return 'Find the pressed linden leaf across the river.';if(!restored[2])return 'Restore the living promenade’s memory.';return 'Return to Olena and choose a public garden.';}
 const next=s.lamps.indexOf(false);return next<0?'Return to Danylo at the bridge.':'Relight the lamp at '+repairLamps[next].name+'.';
}
export type Mosaic={tiles:number[];moves:number;done:boolean};
export function moveMosaic(m:Mosaic,index:number){if(m.done||index<0||index>=6)return false;const gap=m.tiles.indexOf(0),sameRow=Math.floor(gap/3)===Math.floor(index/3);if(!(sameRow&&Math.abs(gap-index)===1||Math.abs(gap-index)===3))return false;[m.tiles[index],m.tiles[gap]]=[m.tiles[gap],m.tiles[index]];m.moves++;m.done=m.tiles.every((v,i)=>v===(i+1)%6);return true;}
export function createMosaic():Mosaic{const m:Mosaic={tiles:[1,2,3,4,5,0],moves:0,done:false};for(const index of [4,1,0,3,4,5,2,1,4,3,0,1])moveMosaic(m,index);m.moves=0;m.done=false;return m;}
export type LampGame={time:number;sparks:number;error:number;assist:boolean;done:boolean};
export function createLamp():LampGame{return{time:0,sparks:0,error:0,assist:false,done:false};}
export function lampNeedle(l:LampGame){return .5+.46*Math.sin(l.time*(l.assist?1.25:2.1));}
export const lampTargets=[.3,.68,.48];
export function strikeLamp(l:LampGame){if(l.done)return true;const hit=Math.abs(lampNeedle(l)-lampTargets[l.sparks])<(l.assist?.22:.115);if(hit){l.sparks++;l.error=0;l.done=l.sparks===3;}else l.error=1.1;return hit;}
