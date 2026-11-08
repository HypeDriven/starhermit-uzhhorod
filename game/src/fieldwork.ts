export const studies=[
 {name:'Shelestovo wooden church',short:'Timber & towers',node:23,position:{x:43,y:7,z:-14},clue:'Beyond the castle, seek three rising wooden towers. Begin with the material closest to your hand.',source:'Uzhhorod Skansen; Zakarpattia Regional Council',url:'https://www.uzhhorod-skansen.com/en/%D0%B4%D0%B5%D1%82%D0%B0%D0%BB%D1%8C%D0%BD%D1%96%D1%88%D0%B5-%D0%BF%D1%80%D0%BE-%D0%B5%D0%BA%D1%81%D0%BF%D0%BE%D0%B7%D0%B8%D1%86%D1%96%D1%8E',
  features:[{name:'Timber walls',x:43,y:3,z:-9.8,note:'The church is built from oak beams and clad with wooden shingles. Look for the horizontal wall courses in this stylized model.'},{name:'Rising towers',x:43,y:14,z:-10,note:'Its three-part form is expressed by three towers. Stepped roofs and Baroque-shaped cupolas meet in one wooden composition.'},{name:'A building that travelled',x:43,y:6.5,z:-17,note:'Built in Shelestovo in 1777, it was moved to Mukachevo in 1927 and installed at the Uzhhorod museum in 1974.'}]},
 {name:'Holy Cross Cathedral',short:'Two towers, many uses',node:24,position:{x:8,y:8,z:-25},clue:'Find the paired towers above the old town. A building can carry a new role without losing every trace of its earlier life.',source:'Uzhhorod municipal tourism',url:'https://travel.rada-uzhgorod.gov.ua/?p=599',
  features:[{name:'The earlier church',x:3.4,y:12.5,z:-22,note:'Construction began in 1640. The church originally served the Jesuit monastery.'},{name:'A change of custody',x:12.6,y:12.5,z:-22,note:'In 1775 the former Jesuit complex was transferred to the Mukachevo Greek Catholic eparchy.'},{name:'A changing interior',x:8,y:4.2,z:-21.3,note:'The church was adapted for the Eastern rite. Its dedication is to the Exaltation of the Cross.'}]}
];
export type FieldState={marks:boolean[][];recorded:boolean[];paths:number[][];gathered:boolean};
export function blankField():FieldState{return{marks:[[false,false,false],[false,false,false]],recorded:[false,false],paths:[[],[],[]],gathered:false};}
export const weavePairs=[[0,14],[5,19],[6,12]];
// A valid full-board arrangement, offered one thread at a time as a guide.
export const weaveGuide=[[0,1,2,3,4,9,14],[5,10,15,20,21,22,23,24,19],[6,7,8,13,18,17,16,11,12]];
export function adjacent(a:number,b:number){return Math.abs(a-b)===5||Math.floor(a/5)===Math.floor(b/5)&&Math.abs(a-b)===1;}
export function pathsValid(paths:number[][]){if(paths.length!==3)return false;const used=new Set<number>();for(let c=0;c<3;c++){const p=paths[c];if(p.length&&!weavePairs[c].includes(p[0]))return false;for(let j=0;j<p.length;j++){const n=p[j];if(!Number.isInteger(n)||n<0||n>=25||used.has(n)||j>0&&!adjacent(p[j-1],n)||j>0&&j<p.length-1&&weavePairs[c].includes(n))return false;for(let k=0;k<3;k++)if(k!==c&&weavePairs[k].includes(n))return false;used.add(n);}}return true;}
export function connected(paths:number[][],c:number){const p=paths[c];return p.length>1&&weavePairs[c].includes(p[0])&&weavePairs[c].includes(p[p.length-1])&&p[0]!==p[p.length-1];}
export function weaveComplete(paths:number[][]){return pathsValid(paths)&&paths.every((_,i)=>connected(paths,i))&&paths.reduce((n,p)=>n+p.length,0)===25;}
export function extendThread(paths:number[][],active:number,cell:number){
 if(!Number.isInteger(cell)||cell<0||cell>=25)return active;
 for(let c=0;c<3;c++)if(weavePairs[c].includes(cell)){if(c!==active||paths[c].length===0||cell===paths[c][0]){paths[c]=[cell];return c;}}
 if(active<0||active>2||!paths[active].length)return active;const p=paths[active],earlier=p.indexOf(cell);if(earlier>=0){paths[active]=p.slice(0,earlier+1);return active;}if(connected(paths,active)||!adjacent(p[p.length-1],cell)||paths.some((q,c)=>c!==active&&q.includes(cell))||weavePairs.some((pair,c)=>c!==active&&pair.includes(cell)))return active;p.push(cell);return active;
}
export function gatheringReady(restored:boolean[],requests:boolean[],finds:boolean[],recorded:boolean[]){return restored.every(Boolean)&&requests.every(Boolean)&&finds.every(Boolean)&&recorded.every(Boolean);}
