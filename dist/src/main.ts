import { localizedDrawOptions as __l10nDrawOptions } from "./l10n/font.js";
import { withLanguageRender as __l10nRender } from "./l10n/menu.js";
// localization-runtime:attached
import { localizedFont as __l10nFont } from "./l10n/font.js";
// display-localization:attached
import { localizedText as __displayText, wrapDisplayText as __wrapDisplay, preserveUserText as __keepDisplayText } from "./l10n/text.js";
import {frame,onStart,onFixedUpdate,onRender,setFixedRate,setReady} from 'starhermit:engine';
import {onPointerMove,onPointerButton,onTouch,onAction,value,setCursor} from 'starhermit:input';
import {storage} from 'starhermit:storage';
import * as draw from 'starhermit:draw';
import {blankRiver,restoreRiver,advanceRiver,mailPosition,nearLanding,deliver,chapterComplete,nextChapter,deliveredCount,landings,palettes,reeds,clamp} from './river.js';
import type {Target} from './river.js';
import {chapters} from './chapters.js';
import {createWorld,updateWorld,screenPoint,riverPoint,worldReady,worldError} from './world.js';
import {loadSound,startSound,muteSound,chime} from './sound.js';

type Mode='title'|'intro'|'sail'|'letter'|'chapter'|'ending'|'journal'|'pause'|'reset';
type Button={x:number;y:number;w:number;h:number;label:string;act:()=>void};
const SAVE='after-the-rain-v2',C={cream:'#f5edda',peach:'#efb69b',ink:'#173537',muted:'#bfcac0',paper:'#f0e5ce'};
let state=blankRiver(),mode:Mode='title',pauseReturn:Mode='sail',journalReturn:Mode='sail',w=1440,h=900,d=1,t=0;
let buttons:Button[]=[],mx=-1,my=-1,held=false,touchTime=-5,target:Target=null,autoDock=-1;
let selected=0,selectedReply=0,journalChapter=0,toast='',toastTime=0,saveTime=0,fade=0,soundReady=false,writeFailed=false;
const f=(n:number)=>n*d;
const rect=(x:number,y:number,a:number,b:number,color:string)=>draw.rect(f(x),f(y),f(a),f(b),color);
const line=(x:number,y:number,a:number,b:number,color:string,width=1)=>draw.line(f(x),f(y),f(a),f(b),color,f(width));
const ellipse=(x:number,y:number,a:number,b:number,color:string)=>draw.ellipse(f(x),f(y),f(a),f(b),color);
function text(s:string,x:number,y:number,size=14,color=C.cream,font='sans-serif',align:'start'|'center'|'end'='start',tracking=0){draw.text(__displayText(s),f(x),f(y),__l10nDrawOptions({size:f(size),font: __l10nFont(font),color,align,letterSpacing:f(tracking)}));}
function wrap(s:string,x:number,y:number,maxWidth:number,size=17,color=C.muted,font='sans-serif',leading=1.65){
 const lines=__wrapDisplay(s,maxWidth,value=>draw.measureText(__displayText(__keepDisplayText(value)),__l10nDrawOptions({size:f(size),font: __l10nFont(font)})).width/f(1));
 lines.forEach((line,i)=>text(line,x,y+i*size*leading,size,color,font));return lines.length*size*leading;
}
function button(label:string,x:number,y:number,bw:number,bh:number,act:()=>void,primary=false){
 const hover=mx>=x&&mx<=x+bw&&my>=y&&my<=y+bh;
 draw.roundRect(f(x),f(y),f(bw),f(bh),f(4),primary?(hover?'#f8d8b6':C.paper):(hover?'rgba(247,235,213,.15)':'rgba(14,38,41,.78)'));
 if(!primary)draw.strokeRoundRect(f(x),f(y),f(bw),f(bh),f(4),'rgba(239,226,204,.3)',f(1));
 text(label,x+bw/2,y+(bh-15)/2,15,primary?C.ink:C.cream,'sans-serif','center');buttons.push({x,y,w:bw,h:bh,label,act});
}
function mark(i:number,x:number,y:number,size:number,color:string){
 const shapes=['M0 15 Q-3 1 14-10 Q18 6 0 15 Z M0 15 L10-4','M0-13 L4-4 L14-4 L6 3 L9 13 L0 7 L-9 13 L-6 3 L-14-4 L-4-4 Z','M-15-4 Q-8-12 0-4 T15-4 M-15 5 Q-8-3 0 5 T15 5'];
 draw.path(shapes[i],f(x),f(y),{stroke:color,lineWidth:1.5,scale:f(size/30),lineCap:'round',lineJoin:'round'});
}
function envelope(i:number,x:number,y:number,size:number,alpha=1){
 draw.roundRect(f(x-size*.56),f(y-size*.35),f(size*1.12),f(size*.7),f(2),`rgba(244,232,207,${alpha})`,{ });
 line(x-size*.55,y-size*.34,x,y+size*.03,'#b59a77');line(x,y+size*.03,x+size*.55,y-size*.34,'#b59a77');
 ellipse(x,y+size*.04,size*.13,size*.13,palettes[i]);mark(i,x,y+size*.025,size*.16,C.ink);
}
function notify(s:string){toast=s;toastTime=4;}
function save(){try{storage.setJson(SAVE,state);writeFailed=false;}catch{if(!writeFailed)notify('This device could not save. You can keep sailing.');writeFailed=true;}}
function change(next:Mode){mode=next;held=false;target=null;autoDock=-1;}
function begin(){if(!worldReady)return;if(soundReady)startSound(state.muted);change(state.finished?'ending':deliveredCount(state)>0||state.mail.flat().some(m=>m===1)?'sail':'intro');}
function resume(){change(mode==='journal'?journalReturn:pauseReturn);}
function pause(){if(mode==='title')return;pauseReturn=mode;change('pause');save();}
function openJournal(){if(mode==='journal'){resume();return;}journalReturn=mode;journalChapter=state.chapter;change('journal');save();}
function toggleMute(){state.muted=!state.muted;muteSound(state.muted);save();}
function interact(){
 const i=nearLanding(state);if(i<0){notify('Sail closer to a landing, then press E.');return;}
 if(state.mail[state.chapter][i]===0){notify('Find the drifting letter with this landing’s seal.');return;}
 if(state.mail[state.chapter][i]===2){notify('This letter is home. Find the next pale envelope on the water.');return;}
 selected=i;selectedReply=0;change('letter');save();
}
function chooseReply(reply:number){
 if(!deliver(state,selected,reply))return;
 chime(true);save();fade=.55;change(chapterComplete(state)?'chapter':'sail');
 notify(chapters[state.chapter].notes[selected].answers[reply]);
}
function continueJourney(){if(!nextChapter(state))return;save();fade=1;change(state.finished?'ending':'intro');}
function aim(x:number,y:number){const p=riverPoint(x,y,w,h);target={x:clamp(p.x,80,1360),y:clamp(p.y,535,825)};autoDock=-1;}
function clickAt(x:number,y:number){
 const hit=buttons.find(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);if(hit){hit.act();return true;}
 if(mode==='sail'){aim(x,y);return false;}return false;
}
onStart(()=>{
 setFixedRate(60);try{state=restoreRiver(storage.getJson(SAVE));}catch{state=blankRiver();}
 setReady(false,{label:__displayText('painted river scenes and mail boat'),seconds:60});
 void createWorld().then(()=>{if(worldReady)setReady(true);});void loadSound().then(()=>{soundReady=true;});
});
onPointerMove((x,y)=>{mx=x/d;my=y/d;if(held&&mode==='sail')aim(mx,my);});
onPointerButton(e=>{if(e.button!==0||t-touchTime<.4)return;mx=e.x/d;my=e.y/d;if(e.pressed){held=!clickAt(mx,my);}else held=false;});
onTouch(e=>{if(!e.primary||e.control)return;touchTime=t;mx=e.x/d;my=e.y/d;if(e.phase==='start'){held=!clickAt(mx,my);}else if(e.phase==='move'&&held&&mode==='sail')aim(mx,my);else if(e.phase==='end'||e.phase==='cancel')held=false;});
onAction(e=>{
 if(!e.pressed)return;
 if(e.action==='mute'){toggleMute();return;}
 if(e.action==='journal'&&mode!=='title'&&mode!=='reset'){openJournal();return;}
 if(e.action==='back'){if(mode==='pause'||mode==='journal')resume();else if(mode==='reset')change('pause');else if(mode==='letter')change('sail');else if(mode!=='title')pause();return;}
 if(e.action==='gentle'){state.gentle=!state.gentle;save();return;}
 if(mode==='letter'&&(e.action==='left'||e.action==='up'))selectedReply=0;
 if(mode==='letter'&&(e.action==='right'||e.action==='down'))selectedReply=1;
 if(mode==='sail'&&e.action==='interact'){interact();return;}
 if(e.action==='start'){
  if(mode==='title')begin();else if(mode==='intro')change('sail');else if(mode==='chapter')continueJourney();else if(mode==='letter')chooseReply(selectedReply);else if(mode==='sail')interact();else if(mode==='pause'||mode==='journal')resume();
 }
 if(mode==='letter'&&(e.action==='reply0'||e.action==='reply1'))chooseReply(e.action==='reply0'?0:1);
 if(mode==='journal'&&(e.action==='left'||e.action==='right'))journalChapter=clamp(journalChapter+(e.action==='left'?-1:1),0,2);
});
onFixedUpdate(dt=>{
 t+=dt;toastTime=Math.max(0,toastTime-dt);fade=Math.max(0,fade-dt*.8);
 if(mode!=='sail')return;
 if(soundReady)startSound(state.muted);
 const ix=value('right')-value('left'),iy=value('down')-value('up');
 if(ix||iy){target=null;autoDock=-1;}
 const events=advanceRiver(state,dt,{x:ix,y:iy,brake:value('brake')>0,target});
 for(const event of events)if(event.kind==='letter'){chime();save();notify('A letter for '+chapters[state.chapter].notes[event.index].to+'.');}
 if(target&&Math.hypot(target.x-state.x,target.y-state.y)<15){target=null;if(autoDock>=0){autoDock=-1;interact();}}
 if(autoDock>=0&&nearLanding(state)===autoDock&&state.mail[state.chapter][autoDock]===1){autoDock=-1;interact();}
 saveTime+=dt;if(saveTime>2){saveTime=0;save();}
});

function atmosphere(){
 // Thin moving strokes let the painted water breathe without obscuring it.
 for(let i=0;i<37;i++){
  const x=(i*173.3+t*(i%2?4:-3))%1440,y=560+(i*61.7)%270,p=screenPoint(x,y,w,h);
  const a=.035+.035*Math.sin(t*.7+i);line(p.x-9,p.y,p.x+16,p.y,`rgba(245,224,188,${a})`,1);
 }
 if(state.chapter===2)for(let i=0;i<22;i++){const x=(i*73.7)%1440,y=340+(i*41.3)%380,p=screenPoint(x+Math.sin(t*.3+i)*18,y+Math.sin(t*.5+i)*13,w,h);ellipse(p.x,p.y,1.5,1.5,`rgba(245,205,132,${.2+.3*(1+Math.sin(t*1.7+i))/2})`);}
}
function riverObjects(){
 const scale=h/900;
 if(!state.gentle)for(const r of reeds(state.chapter)){
  const p=screenPoint(r.x,r.y,w,h);ellipse(p.x,p.y,r.r*1.25*scale,r.r*.3*scale,'rgba(11,40,36,.26)');
  for(let i=0;i<7;i++){const xx=p.x+Math.sin(i*2.4)*r.r*.8*scale,yy=p.y+Math.cos(i*1.7)*r.r*.18*scale;
   draw.path('M-11 0 Q-7-7 6-4 Q14-2 9 3 Q0 8-11 0Z',f(xx),f(yy),{fill:i%2?'rgba(71,98,73,.5)':'rgba(96,123,82,.42)',scale:f(scale)});
  }
 }
 const boat=screenPoint(state.x,state.y,w,h),speed=Math.hypot(state.vx,state.vy);
 for(let i=0;i<4;i++){const offset=(t*.6+i*.25)%1,rad=(20+offset*50)*scale;draw.strokeEllipse(f(boat.x-(state.vx>0?1:-1)*(30+offset*25)*scale),f(boat.y+14*scale),f(rad),f(rad*.2),`rgba(239,230,205,${(1-offset)*.09*Math.min(1,speed/50)})`,f(1));}
 for(let i=0;i<3;i++){
  const m=state.mail[state.chapter][i],pos=mailPosition(i,state.time),p=screenPoint(pos.x,pos.y,w,h);
  if(m===0){
   const glow=.1+.04*Math.sin(t*2+i);ellipse(p.x,p.y+5,35*scale,11*scale,`rgba(247,215,155,${glow})`);
   draw.strokeEllipse(f(p.x),f(p.y+7),f(30*scale),f(10*scale),'rgba(241,221,183,.28)',f(1));envelope(i,p.x,p.y+Math.sin(t*1.6+i)*2,33*scale);
   const nearby=Math.hypot(state.x-pos.x,state.y-pos.y)<170;
   if(nearby)text('Recover letter',p.x,p.y-35*scale,11,C.cream,'sans-serif','center');
  }
  const landing=landings[i],lp=screenPoint(landing.x,510,w,h),near=nearLanding(state)===i;
  // Floating seals are wayfinding markers, not extra scenery pasted over the painting.
  ellipse(lp.x,lp.y,19,19,m===2?'rgba(104,135,115,.9)':'rgba(20,47,46,.92)');mark(i,lp.x,lp.y-1,23,m===1?C.peach:m===2?'#d5dfc6':C.paper);
  if(m===1)draw.strokeCircle(f(lp.x),f(lp.y),f(23+Math.sin(t*2)*1.5),C.peach,f(1));
  if(lp.x>-20&&lp.x<w+20){buttons.push({x:lp.x-27,y:lp.y-29,w:54,h:58,label:'Sail to '+landing.name,act:()=>{target={x:landing.x,y:545};autoDock=i;}});}
  if(near||w>850){text(m===2?'Delivered':landing.name,lp.x,lp.y-39,12,m===1?C.peach:C.cream,'sans-serif','center');}
 }
 if(target){const p=screenPoint(target.x,target.y,w,h);draw.strokeEllipse(f(p.x),f(p.y),f(13),f(5),'rgba(238,222,190,.45)',f(1));}
}
function topShade(strength=.85){draw.box(0,0,f(w),f(210),{background:{type:'linear',angle:180,stops:[`rgba(10,29,32,${strength})`,'rgba(10,29,32,0)']}});}
function bottomShade(){draw.box(0,f(h-170),f(w),f(170),{background:{type:'linear',angle:0,stops:['rgba(10,29,32,.91)','rgba(10,29,32,0)']}});}
function hud(){
 topShade();bottomShade();const pad=w<600?22:44,c=chapters[state.chapter];
 text('UZHHOROD',pad,26,12,C.cream,'sans-serif','start',3);text(c.time.toUpperCase(),pad,49,10,C.peach,'sans-serif','start',1.6);
 button('Ⅱ',w-pad-45,25,45,39,pause);button('Letters',w-pad-132,25,77,39,openJournal);
 const y=h-107;text('0'+(state.chapter+1)+'  /  '+c.place,pad,y,10,C.peach,'sans-serif','start',1.5);
 text(c.name,pad,y+23,w<600?23:31,C.cream,'serif');
 const count=state.mail[state.chapter].filter(m=>m===2).length;
 if(w>700){text(count+' / 3 letters home',w-pad,h-70,14,C.cream,'sans-serif','end');text('WASD / arrows · steer    E · deliver    Space · slow',w-pad,h-43,11,C.muted,'sans-serif','end');}
 else{text(count+' / 3 home',pad,h-33,11,C.muted);}
 const near=nearLanding(state);
 if(near>=0&&state.mail[state.chapter][near]===1)button('Deliver letter  →',w/2-100,h*.58,200,48,interact,true);
 const trayX=w<700?w-144:w-202,trayY=w<700?h-35:91;
 for(let i=0;i<3;i++){const x=trayX+i*43,m=state.mail[state.chapter][i];ellipse(x,trayY,15,15,'rgba(15,39,40,.6)');if(m===1)envelope(i,x,trayY,18);else mark(i,x,trayY,17,m===2?C.peach:'rgba(224,228,204,.38)');}
 if(t<16&&state.chapter===0&&deliveredCount(state)===0){const hint=w<600?'Tap the water to sail. Find a pale envelope.':'Click the water or use WASD to sail. Recover a pale envelope, then follow its seal to a landing.';text(hint,w/2,w<600?131:h-145,w<600?11:13,C.cream,'sans-serif','center');}
 if(w<700){
  // A tap on this river strip also moves the camera to distant parts of the scene.
  const x=pad,y=90,bw=w-pad*2;line(x,y,x+bw,y,'rgba(229,222,198,.28)',2);
  for(let i=0;i<3;i++){const lx=x+landings[i].x/1440*bw;mark(i,lx,y,13,state.mail[state.chapter][i]===2?C.peach:C.muted);}
  ellipse(x+state.x/1440*bw,y,3,3,C.cream);
  buttons.push({x,y:y-17,w:bw,h:34,label:'River overview',act:()=>{target={x:clamp((mx-x)/bw*1440,80,1360),y:state.y};autoDock=-1;}});
 }
}
function title(){
 draw.box(0,0,f(w),f(h),{background:{type:'linear',angle:w>650?90:0,stops:w>650?['rgba(11,31,34,.94)',{color:'rgba(11,31,34,.8)',at:.28},{color:'rgba(11,31,34,.03)',at:.78}]:['rgba(11,31,34,.94)',{color:'rgba(11,31,34,.48)',at:.67},'rgba(11,31,34,.2)']}});
 const x=w<650?30:Math.max(60,w*.065),y=h*(w<650?.28:.19),tw=Math.min(490,w-x*2);
 text('A RIVER STORY',x,y,11,C.peach,'sans-serif','start',3.3);line(x,y+33,x+64,y+33,C.peach);
 text('Uzhhorod',x,y+56,w<650?67:112,C.cream,'serif');
 text('After the Rain',x,y+(w<650?140:185),w<650?30:43,C.peach,'serif');
 const by=y+(w<650?204:270);
 wrap('A little boat. A handful of lost letters. A city waiting on the other side of the water.',x,by,tw,17,C.cream,'sans-serif',1.7);
 const label=worldError?'Art could not load':!worldReady?'Preparing the river…':state.finished?'Return to the river  →':deliveredCount(state)>0||state.mail.flat().some(m=>m===1)?'Continue your journey  →':'Cast off  →';
 button(label,x,by+115,Math.min(255,tw),55,begin,true);
 if(worldError)wrap(worldError,x,by+180,tw,11,C.peach);
 text('STEER SLOWLY. BRING SOMETHING HOME.',x,h-(w<650?120:67),9,C.muted,'sans-serif','start',1.5);
 text('01 — 03   /   A QUIET ADVENTURE',w-x,34,9,C.cream,'sans-serif','end',1.5);
 button(state.muted?'Sound off':'Sound on',w-x-99,h-77,99,35,()=>{toggleMute();if(soundReady)startSound(state.muted);});
}
function panel(width=600){
 rect(0,0,w,h,'rgba(9,29,32,.7)');const pw=Math.min(width,w-36),ph=Math.min(650,h-70),x=(w-pw)/2,y=(h-ph)/2;
 draw.roundRect(f(x),f(y),f(pw),f(ph),f(5),'#183638');draw.strokeRoundRect(f(x),f(y),f(pw),f(ph),f(5),'rgba(229,207,170,.32)',f(1));return{x,y,w:pw,h:ph,pad:w<600?25:42};
}
function intro(){
 topShade(.35);bottomShade();rect(0,0,w,h,'rgba(11,31,34,.38)');
 const pw=Math.min(530,w-58),x=(w-pw)/2,y=h*.25,c=chapters[state.chapter];
 text('CHAPTER 0'+(state.chapter+1),w/2,y,11,C.peach,'sans-serif','center',3);
 const hh=wrap(c.name,x,y+49,pw,w<650?38:53,C.cream,'serif',1.15);
 const next=y+hh+86;wrap(c.intro,x,next,pw,17,C.cream,'sans-serif',1.7);
 button('Take to the water  →',w/2-123,next+145,246,52,()=>{change('sail');save();},true);
 text('Find the letters. Match their seals to the landings.',w/2,next+219,w<600?11:13,C.cream,'sans-serif','center');
}
function letter(){
 const b=panel(620),note=chapters[state.chapter].notes[selected],x=b.x+b.pad,y=b.y+36,iw=b.w-b.pad*2;
 mark(selected,x+12,y+9,27,C.peach);text('LETTER 0'+(state.chapter*3+selected+1),x+42,y,10,C.peach,'sans-serif','start',2);
 const hh=wrap(note.title,x,y+51,iw,34,C.cream,'serif',1.12);text(note.to,x,y+hh+70,12,C.peach);
 line(x,y+hh+106,x+iw,y+hh+106,'rgba(225,208,172,.3)');
 wrap(note.body,x,y+hh+131,iw,w<600?18:21,C.paper,'serif',1.6);
 text('LEAVE A SMALL REPLY',x,b.y+b.h-166,9,C.peach,'sans-serif','start',2);
 button(note.choices[0],x,b.y+b.h-131,iw,44,()=>chooseReply(0),selectedReply===0);
 button(note.choices[1],x,b.y+b.h-76,iw,44,()=>chooseReply(1),selectedReply===1);
}
function chapterEnd(){
 const b=panel(),x=b.x+b.pad,iw=b.w-b.pad*2,y=b.y+49,c=chapters[state.chapter];
 text('THREE LETTERS HOME',x,y,10,C.peach,'sans-serif','start',2.3);
 text('A little less distance.',x,y+48,w<600?29:38,C.cream,'serif');
 wrap(c.ending,x,y+118,iw,20,C.paper,'serif',1.6);
 for(let i=0;i<3;i++){const yy=y+230+i*63;mark(i,x+14,yy+8,23,palettes[i]);text(c.notes[i].to.split(' · ')[0],x+47,yy,15,C.cream);wrap(c.notes[i].answers[state.replies[state.chapter][i]===1?1:0],x+47,yy+24,iw-47,12,C.muted);}
 button(state.chapter===2?'Bring the last story home  →':'Follow the river  →',x,b.y+b.h-90,iw,52,continueJourney,true);
}
function ending(){
 rect(0,0,w,h,'rgba(9,27,34,.67)');const pw=Math.min(565,w-60),x=(w-pw)/2,y=h*.16;
 text('ALL NINE LETTERS ARE HOME',w/2,y,10,C.peach,'sans-serif','center',2.3);
 const size=w<650?44:63,hh=wrap('Every crossing begins with a small hello.',x,y+57,pw,size,C.cream,'serif',1.12);
 wrap('The river keeps moving. Tonight, so do the stories.',x,y+hh+98,pw,20,C.paper,'serif');
 button('Read the letters',x,y+hh+206,pw,50,openJournal,true);
 button('Stay by the river',x,y+hh+269,pw,46,()=>change('sail'));
 text('An imagined evening in Uzhhorod.',w/2,h-57,12,C.muted,'serif','center');
}
function journal(){
 const b=panel(700),x=b.x+b.pad,iw=b.w-b.pad*2,y=b.y+32,c=chapters[journalChapter];
 text('LETTERS FROM THE RIVER',x,y,10,C.peach,'sans-serif','start',2);text(deliveredCount(state)+' / 9 home',x+iw,y,12,C.muted,'sans-serif','end');
 text(c.place,x,y+43,w<600?19:25,C.cream,'serif');
 const rowH=(b.h-205)/3;
 for(let i=0;i<3;i++){
  const yy=y+99+i*rowH,m=state.mail[journalChapter][i],note=c.notes[i];
  line(x,yy-16,x+iw,yy-16,'rgba(225,208,172,.22)');mark(i,x+12,yy+10,23,m===2?C.peach:C.muted);
  text(note.to.split(' · ')[0],x+44,yy,15,C.cream);text(m===2?'DELIVERED':m===1?'ABOARD':'ON THE RIVER',x+iw,yy+3,8,m===2?C.peach:C.muted,'sans-serif','end',.6);
  const body=m===2?note.body:m===1?'Safe in your satchel. Bring it to the landing with the matching seal.':'A pale envelope is turning in the current.';
  wrap(body,x+44,yy+29,iw-44,w<600?12:14,C.muted,'serif',1.45);
 }
 button('←',x,b.y+b.h-66,45,35,()=>{journalChapter=Math.max(0,journalChapter-1);});
 text('0'+(journalChapter+1)+' / 03',x+iw/2,b.y+b.h-56,11,C.muted,'sans-serif','center');
 button('→',x+iw-45,b.y+b.h-66,45,35,()=>{journalChapter=Math.min(2,journalChapter+1);});
 button('Close',w/2-47,b.y+b.h+12,94,36,resume);
}
function paused(){
 const b=panel(540),x=b.x+b.pad,iw=b.w-b.pad*2,y=b.y+40;
 text('THE RIVER CAN WAIT',x,y,10,C.peach,'sans-serif','start',2.3);text('A moment on the bank.',x,y+45,w<600?29:37,C.cream,'serif');
 wrap('Tap or hold on the water to steer. On a keyboard, use WASD or the arrows. Space slows the boat. Recover a letter, then tap its matching landing or press E nearby.',x,y+112,iw,16,C.muted);
 text('No timer. No lost letters. Take your time.',x,y+276,13,C.paper,'serif');
 button('Return to the water',x,b.y+b.h-234,iw,48,resume,true);
 button(state.gentle?'Gentle current: on':'Gentle current: off',x,b.y+b.h-174,iw,42,()=>{state.gentle=!state.gentle;save();});
 button(state.muted?'Sound: off':'Sound: on',x,b.y+b.h-122,iw/2-5,39,toggleMute);
 button('Start over',x+iw/2+5,b.y+b.h-122,iw/2-5,39,()=>change('reset'));
 text('An imagined evening in Uzhhorod.',w/2,b.y+b.h-49,12,C.muted,'serif','center');
}
function reset(){const b=panel(470),x=b.x+b.pad,iw=b.w-b.pad*2; text('Begin again?',x,b.y+70,37,C.cream,'serif');wrap('This starts a new river journey and clears these nine deliveries.',x,b.y+143,iw,18,C.muted);button('Keep this journey',x,b.y+b.h-145,iw,47,()=>change('pause'),true);button('Start a new journey',x,b.y+b.h-86,iw,43,()=>{const muted=state.muted,gentle=state.gentle;state=blankRiver();state.muted=muted;state.gentle=gentle;save();change('intro');});}
onRender(__l10nRender(()=>{
 const v=frame();d=v.scale*Math.min(1,(v.height/v.scale)/760);if(d<=0)return;w=v.width/d;h=v.height/d;buttons=[];
 updateWorld(state,w,h,v.delta,mode==='title');atmosphere();
 if(mode==='sail'){riverObjects();hud();}
 if(mode==='title')title();else if(mode==='intro')intro();else if(mode==='letter')letter();else if(mode==='chapter')chapterEnd();else if(mode==='ending')ending();else if(mode==='journal')journal();else if(mode==='pause')paused();else if(mode==='reset')reset();
 if(toastTime>0&&mode==='sail'){
  const bw=Math.min(w-36,620),hh=55;draw.roundRect(f((w-bw)/2),f(145),f(bw),f(hh),f(4),'rgba(14,38,39,.92)');wrap(toast,(w-bw)/2+18,161,bw-36,12,C.paper,'sans-serif',1.4);
 }
 if(fade>0)rect(0,0,w,h,`rgba(239,222,185,${fade*.3})`);
 setCursor(buttons.some(b=>mx>=b.x&&mx<=b.x+b.w&&my>=b.y&&my<=b.y+b.h)?'pointer':mode==='sail'?'crosshair':'default');
}));

// localization-runtime:menu
import { installLanguageMenu as __installLanguageMenu } from "./l10n/menu.js";
__installLanguageMenu(true);
