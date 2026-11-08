// Authored source summaries, placed at invented reading stations in the game.
// No card is presented as a recovered original document or eyewitness account.
const bridgeSource={source:'Uzhhorod municipal tourism',url:'https://travel.rada-uzhgorod.gov.ua/?p=640'};
const churchSource={source:'Transcarpathian Museum of Folk Architecture and Life',url:'https://www.uzhhorod-skansen.com/en/%D0%B4%D0%B5%D1%82%D0%B0%D0%BB%D1%8C%D0%BD%D1%96%D1%88%D0%B5-%D0%BF%D1%80%D0%BE-%D0%B5%D0%BA%D1%81%D0%BF%D0%BE%D0%B7%D0%B8%D1%86%D1%96%D1%8E'};
const castleSource={source:'Transcarpathian Museum of Local History',url:'https://www.zkmuseum.com/p/uzhhorod-castle-history.html'};
export const archiveCases=[
 {name:'The crossing',subtitle:'A route is not the same as its structure',...bridgeSource,
  records:[
   {name:'1898 · An iron bridge',node:3,body:'An iron crossing opened in 1898 for pedestrians and vehicles.'},
   {name:'1907 · The toll ends',node:9,body:'The remaining crossing toll was abolished on 30 September 1907.'},
   {name:'1921 · A city bus',node:7,body:'A city bus used the bridge in 1921.'},
   {name:'1944 · A break in the structure',node:4,body:'The iron bridge was destroyed in 1944. The modern crossing was built later.'}
  ],
  claims:[
   {text:'The toll ended before the first city bus crossed.',answer:0,pairs:[[1,2]],why:'Compare the two dates: 1907 precedes 1921.'},
   {text:'Today’s pedestrian bridge is the iron structure opened in 1898.',answer:1,pairs:[[0,3]],why:'The earlier iron structure was destroyed. Continuity of a route does not mean continuity of its fabric.'},
   {text:'Every traveller welcomed the end of the toll.',answer:2,pairs:[[1,2],[0,1],[1,3]],why:'These summaries describe events, not the opinions of every traveller. Absence of testimony is not agreement.'}
  ]},
 {name:'A travelling church',subtitle:'A building can carry a journey',...churchSource,
  records:[
   {name:'1777 · Shelestovo',node:23,body:'The Church of Archangel Michael was built in Shelestovo in 1777.'},
   {name:'1927 · Mukachevo',node:22,body:'It was moved to Mukachevo in 1927 for preservation.'},
   {name:'1974 · Uzhhorod',node:6,body:'It was installed at the Uzhhorod museum in 1974.'},
   {name:'A three-part plan',node:5,body:'The museum describes a vestibule, nave and altar forming the church’s three-part plan.'}
  ],
  claims:[
   {text:'The church made two recorded moves before reaching this museum.',answer:0,pairs:[[1,2]],why:'The route is Shelestovo, Mukachevo, then Uzhhorod.'},
   {text:'The church was first built in Uzhhorod in 1974.',answer:1,pairs:[[0,2]],why:'The construction date belongs to Shelestovo. The later date records an installation in Uzhhorod.'},
   {text:'Every original timber survived both moves.',answer:2,pairs:[[0,2],[1,2],[2,3]],why:'Dates, locations and a floor plan do not establish the survival of every piece of material.'}
  ]},
 {name:'Inside the castle',subtitle:'Dates reveal changes, and leave gaps',...castleSource,
  records:[
   {name:'1598 · The palace',node:21,body:'The date above the entrance marks the palace’s near completion in 1598.'},
   {name:'1775 · New custody',node:16,body:'The castle passed to the Greek Catholic eparchy in 1775 and became a seminary.'},
   {name:'1947 · The museum',node:15,body:'The regional museum has occupied the castle since 1947.'},
   {name:'Before the palace',node:19,body:'The museum places a fortified settlement on Castle Hill in the tenth century.'}
  ],
  claims:[
   {text:'The palace predates the castle’s use as a museum.',answer:0,pairs:[[0,2]],why:'The palace date comes centuries before the museum’s arrival.'},
   {text:'The 1598 date proves that Castle Hill had no earlier fortification.',answer:1,pairs:[[0,3]],why:'A date on a palace is not the beginning of all occupation. The museum records an earlier fortified settlement.'},
   {text:'These dates tell us the daily life of every person who lived here.',answer:2,pairs:[[0,2],[1,2],[0,1],[2,3]],why:'Institutional milestones cannot establish everyone’s experience. A careful account leaves room for missing voices.'}
  ]}
];
export const verdictNames=['Supported','Contradicted','Not settled'];
export const accountTitles=['A city of journeys','A city of changing rooms','An unfinished archive'];
export const accountLines=[
 'I followed a crossing through different bridges and a church through different towns. A place can be carried by a route as well as by a wall.',
 'I watched a palace become other kinds of shelter. Keeping a building asks us to care for the people and purposes within it.',
 'I kept what the records could support, and left the gaps visible. The next reader deserves evidence, and room to ask another question.'
];
export type ArchiveState={found:boolean[][];solved:boolean[][];draftPairs:number[][][];draftVerdicts:number[][];account:number};
export function blankArchive():ArchiveState{return{found:Array.from({length:3},()=>[false,false,false,false]),solved:Array.from({length:3},()=>[false,false,false]),draftPairs:Array.from({length:3},()=>[[],[],[]]),draftVerdicts:Array.from({length:3},()=>[-1,-1,-1]),account:-1};}
export function archiveReady(s:ArchiveState){return s.solved.every(row=>row.every(Boolean));}
export function collectRecord(s:ArchiveState,c:number,i:number){if(!archiveCases[c]?.records[i])return false;const fresh=!s.found[c][i];s.found[c][i]=true;return fresh;}
export function toggleEvidence(s:ArchiveState,c:number,q:number,i:number){if(!s.found[c]?.[i]||!archiveCases[c]?.claims[q]||s.solved[c][q])return;const p=s.draftPairs[c][q],old=p.indexOf(i);if(old>=0)p.splice(old,1);else if(p.length<2)p.push(i);}
export function assessClaim(s:ArchiveState,c:number,q:number){const claim=archiveCases[c]?.claims[q];if(!claim)return 'missing';const p=s.draftPairs[c][q];if(p.length!==2||new Set(p).size!==2||p.some(i=>!s.found[c][i]))return 'evidence';if(s.draftVerdicts[c][q]!==claim.answer)return 'verdict';if(claim.answer!==2&&!claim.pairs.some(pair=>pair.every(i=>p.includes(i))))return 'connection';s.solved[c][q]=true;return 'accepted';}
export function loadArchive(value:unknown):ArchiveState{const out=blankArchive();if(!value||typeof value!=='object'||Array.isArray(value))return out;const s=value as Record<string,unknown>;for(let c=0;c<3;c++){const found=Array.isArray(s.found)?s.found[c]:null;if(Array.isArray(found)&&found.length===4)out.found[c]=found.map(v=>v===true);for(let q=0;q<3;q++){const pair=Array.isArray(s.draftPairs)&&Array.isArray(s.draftPairs[c])?s.draftPairs[c][q]:null;if(Array.isArray(pair))out.draftPairs[c][q]=pair.filter((v:unknown)=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<4&&out.found[c][v]).filter((v:number,i:number,a:number[])=>a.indexOf(v)===i).slice(0,2);const verdict=Array.isArray(s.draftVerdicts)&&Array.isArray(s.draftVerdicts[c])?s.draftVerdicts[c][q]:-1;if(typeof verdict==='number'&&Number.isInteger(verdict)&&verdict>=0&&verdict<3)out.draftVerdicts[c][q]=verdict;const solved=Array.isArray(s.solved)&&Array.isArray(s.solved[c])?s.solved[c][q]===true:false;if(solved&&assessClaim(out,c,q)!=='accepted')out.solved[c][q]=false;}}if(typeof s.account==='number'&&Number.isInteger(s.account)&&s.account>=0&&s.account<3&&archiveReady(out))out.account=s.account;return out;}
