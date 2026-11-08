// An invented public exhibition of the player's game collection.
export const exhibitThemes=['Routes','Care','Voices','Making','Time'];
export const captionNames=['Source summary','Game fiction','Player keepsake'];
export const exhibitLights=['Warm','Study','Dusk'];
export const exhibitItems=[
 {name:'The folded paper',kind:1,tags:[2,3],lead:'Find the printer’s scrap in the old town.',find:0,chapter:-1,study:-1},
 {name:'The little key',kind:1,tags:[1,2],lead:'Find the tiny key along the eastern bank.',find:1,chapter:-1,study:-1},
 {name:'The postcard',kind:1,tags:[0,3],lead:'Find the unwritten postcard in the western old town.',find:2,chapter:-1,study:-1},
 {name:'The pressed leaf',kind:1,tags:[1,0],lead:'Find the linden leaf across the river.',find:3,chapter:-1,study:-1},
 {name:'The programme',kind:1,tags:[2,3],lead:'Find the programme beside the listening bench.',find:4,chapter:-1,study:-1},
 {name:'The blue thread',kind:1,tags:[0,1],lead:'Find the ferryman’s thread in the old town.',find:5,chapter:-1,study:-1},
 {name:'Castle source card',kind:0,tags:[4,0],lead:'Restore the castle memory.',find:-1,chapter:0,study:-1},
 {name:'Music source card',kind:0,tags:[2,3],lead:'Restore the synagogue and philharmonic memory.',find:-1,chapter:1,study:-1},
 {name:'Promenade card',kind:0,tags:[1,0],lead:'Restore the living promenade memory.',find:-1,chapter:2,study:-1},
 {name:'Crossing source card',kind:0,tags:[0,4],lead:'Restore the crossing memory.',find:-1,chapter:3,study:-1},
 {name:'The timber study',kind:0,tags:[1,3,0],lead:'Record the wooden church field study.',find:-1,chapter:-1,study:0},
 {name:'The tower study',kind:0,tags:[2,4],lead:'Record the cathedral field study.',find:-1,chapter:-1,study:1},
 {name:'Your paper boat',kind:2,tags:[1,3,0],lead:'Keep a successful workshop design or deliver a commission.',find:-1,chapter:-1,study:-1},
 {name:'An evening ribbon',kind:2,tags:[1,2,0],lead:'Complete an Evening Company walk.',find:-1,chapter:-1,study:-1},
 {name:'The evidence folio',kind:0,tags:[4,3,0],lead:'Check all three claims in any City Archive case.',find:-1,chapter:-1,study:-1},
 {name:'The keeper’s map',kind:1,tags:[0,2],lead:'An imagined map of the game town, available from the beginning.',find:-1,chapter:-1,study:-1}
];
export const exhibitBriefs=[
 {name:'A careful first page',resident:'Marta',description:'Begin with evidence, leave fiction clearly named, and connect the objects into a readable thread.',yes:'A clear label leaves the next reader room to trust you.',no:'Give a visitor a source to begin with, and a thread to follow.'},
 {name:'Room to linger',resident:'Olena',description:'Make room for a pause, bring the evening’s keepsake, and let care lead the display.',yes:'There is a place here for someone who wants to stay a little longer.',no:'An empty space can be useful. Give someone room to sit with what they have seen.'},
 {name:'Hands and journeys',resident:'Danylo',description:'Bring a made boat, a checked folio and an imagined paper object together under study light.',yes:'The work of checking and the work of making can light each other.',no:'Let a visitor follow the connection between the record, the paper and the boat.'}
];
export type ExhibitLayout={slots:number[];captions:number[];light:number;entrance:number};
export type ExhibitionState={draft:ExhibitLayout;brief:number;open:{layout:ExhibitLayout;brief:number}|null;versions:number;awards:boolean[]};
export function blankLayout():ExhibitLayout{return{slots:[-1,-1,-1,-1],captions:[0,0,0,0],light:0,entrance:0};}
export function blankExhibition():ExhibitionState{return{draft:blankLayout(),brief:0,open:null,versions:0,awards:[false,false,false]};}
export function copyLayout(l:ExhibitLayout):ExhibitLayout{return{slots:l.slots.slice(),captions:l.captions.slice(),light:l.light,entrance:l.entrance};}
export function exhibitOrder(l:ExhibitLayout){return l.entrance===0?[0,1,3,2]:[2,3,1,0];}
export function arrangeExhibit(l:ExhibitLayout,slot:number,item:number,available:boolean[]){if(!Number.isInteger(slot)||slot<0||slot>3||!Number.isInteger(item)||item< -1||item>=exhibitItems.length||item>=0&&!available[item])return false;const old=l.slots.indexOf(item);if(item>=0&&old>=0&&old!==slot){[l.slots[old],l.slots[slot]]=[l.slots[slot],l.slots[old]];[l.captions[old],l.captions[slot]]=[l.captions[slot],l.captions[old]];}else l.slots[slot]=item;return true;}
export function exhibitConnections(l:ExhibitLayout){const objects=exhibitOrder(l).map(i=>l.slots[i]).filter(i=>i>=0);let links=0;for(let i=1;i<objects.length;i++)if(exhibitItems[objects[i-1]].tags.some(tag=>exhibitItems[objects[i]].tags.includes(tag)))links++;return links;}
export type ExhibitCheck={text:string;ok:boolean};
export function assessExhibition(l:ExhibitLayout,brief:number,available:boolean[]):ExhibitCheck[]{
 const ids=l.slots.filter(i=>i>=0),order=exhibitOrder(l),first=l.slots[order[0]],honest=l.slots.every((id,i)=>id<0||l.captions[i]===exhibitItems[id]?.kind),checks:ExhibitCheck[]=[{text:'Show at least three different objects',ok:ids.length>=3&&new Set(ids).size===ids.length},{text:'Use objects you have actually collected',ok:ids.every(id=>available[id]===true)},{text:'Give every object an honest caption',ok:honest}];
 if(brief===0)checks.push({text:'Begin the visitor route with a source summary',ok:first>=0&&exhibitItems[first].kind===0},{text:'Include a clearly named imagined object',ok:ids.some(id=>exhibitItems[id].kind===1)},{text:'Make at least two links between neighbours',ok:exhibitConnections(l)>=2});
 if(brief===1)checks.push({text:'Leave a quiet space in the middle of the route',ok:l.slots[order[1]]===-1||l.slots[order[2]]===-1},{text:'Show an evening ribbon and two objects about care',ok:ids.includes(13)&&ids.filter(id=>exhibitItems[id].tags.includes(1)).length>=2},{text:'Choose warm light',ok:l.light===0});
 if(brief===2)checks.push({text:'Show your boat beside the checked folio',ok:ids.includes(12)&&ids.includes(14)&&Math.abs(exhibitOrder(l).filter(i=>l.slots[i]>=0).map(i=>l.slots[i]).indexOf(12)-exhibitOrder(l).filter(i=>l.slots[i]>=0).map(i=>l.slots[i]).indexOf(14))===1},{text:'Include an imagined object about making',ok:ids.some(id=>exhibitItems[id].kind===1&&exhibitItems[id].tags.includes(3))},{text:'Use study light and make two thematic links',ok:l.light===1&&exhibitConnections(l)>=2});
 return checks;
}
export function openExhibition(s:ExhibitionState,available:boolean[]){const checks=assessExhibition(s.draft,s.brief,available);if(!checks.slice(0,3).every(c=>c.ok))return false;s.open={layout:copyLayout(s.draft),brief:s.brief};s.versions++;if(checks.every(c=>c.ok))s.awards[s.brief]=true;return true;}
export function loadExhibition(value:unknown,available:boolean[]):ExhibitionState{const out=blankExhibition();if(!value||typeof value!=='object'||Array.isArray(value))return out;const s=value as Record<string,unknown>;const layout=(v:unknown):ExhibitLayout|null=>{if(!v||typeof v!=='object'||Array.isArray(v))return null;const r=v as Record<string,unknown>;if(!Array.isArray(r.slots)||r.slots.length!==4||!Array.isArray(r.captions)||r.captions.length!==4)return null;const slots:number[]=[],captions:number[]=[];for(let i=0;i<4;i++){const id=r.slots[i],caption=r.captions[i];slots.push(typeof id==='number'&&Number.isInteger(id)&&id>=0&&id<exhibitItems.length&&available[id]&&!slots.includes(id)?id:-1);captions.push(typeof caption==='number'&&Number.isInteger(caption)&&caption>=0&&caption<3?caption:0);}return{slots,captions,light:r.light===1||r.light===2?r.light:0,entrance:r.entrance===1?1:0};};out.draft=layout(s.draft)??out.draft;if(s.brief===1||s.brief===2)out.brief=s.brief;const opened=s.open;if(opened&&typeof opened==='object'&&!Array.isArray(opened)){const o=opened as Record<string,unknown>,l=layout(o.layout),brief=o.brief===1||o.brief===2?o.brief:0;if(l&&assessExhibition(l,brief,available).slice(0,3).every(c=>c.ok))out.open={layout:l,brief};}if(typeof s.versions==='number'&&Number.isFinite(s.versions))out.versions=Math.max(0,Math.floor(s.versions));if(Array.isArray(s.awards)&&s.awards.length===3)out.awards=s.awards.map(v=>v===true);return out;}
