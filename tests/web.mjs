// Run: node tests/web.mjs DIST ENGINE_DIRECTORY [SCREENSHOT_DIRECTORY]
// Uses the official pinned engine files locally, without changing the web loader.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,existsSync,mkdirSync} from 'node:fs';
import {resolve,join,extname} from 'node:path';
import {createRequire} from 'node:module';
const root=resolve(process.argv[2]??'dist'),engine=resolve(process.argv[3]??'/home/albert/sh/starhermit-developer-wiki/engine/1.38.0');
const shots=resolve(process.argv[4]??'/tmp/uzhhorod-browser');mkdirSync(shots,{recursive:true});
const {chromium}=createRequire('/home/albert/.local/bin/node_modules/playwright-core/package.json')('playwright-core');
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.wasm':'application/wasm','.ttf':'font/ttf','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ogg':'audio/ogg','.glb':'model/gltf-binary'};
const server=createServer((req,res)=>{
 const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(path==='/api/v1/time'){res.writeHead(200,{'content-type':'application/json'}).end(JSON.stringify({serverTime:Date.now(),serverTimeIso:new Date().toISOString()}));return;}
 const file=resolve(root,'.'+(path==='/'?'/index.html':path));
 if(!file.startsWith(root+'/')){res.writeHead(403).end();return;}
 try{res.writeHead(200,{'content-type':mime[extname(file)]??'application/octet-stream'}).end(readFileSync(file));}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port;
process.env.GPU_LOCK_WAIT_S='1';
const {launchChrome}=await import('/home/albert/games/tools/gpu-chrome.mjs');
const {browser,gpu,close}=await launchChrome(chromium);
console.log('Browser renderer:',gpu);
try{
 for(const [name,width,height,touch] of [['desktop',1440,900,false],['phone',390,844,true]]){
  const ctx=await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch,deviceScaleFactor:1});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.route(/https:\/\/(engine|wiki)\.starhermit\.com\/engine\/1\.38\.0\/.*/,async route=>{
   const path=new URL(route.request().url()).pathname.split('/1.38.0/')[1],file=join(engine,path);
   assert.ok(existsSync(file),'missing official engine file '+path);
   await route.fulfill({status:200,body:readFileSync(file),headers:{'content-type':mime[extname(file)]??'application/octet-stream','access-control-allow-origin':'*'}});
  });
  await page.goto(url,{waitUntil:'load'});
  await page.waitForFunction(()=>document.documentElement.dataset.starhermit==='running',null,{timeout:90000});
  await page.waitForTimeout(2500);
  await page.screenshot({path:join(shots,name+'-title.png')});
  await page.keyboard.press('Enter');await page.waitForTimeout(400);
  await page.keyboard.press('Enter');await page.waitForTimeout(700);
  await page.screenshot({path:join(shots,name+'-river.png')});
  if(!touch){
   await page.mouse.click(420,727);await page.waitForTimeout(3200);
   await page.mouse.click(245,510);await page.waitForTimeout(2500);
   await page.screenshot({path:join(shots,name+'-letter.png')});
   await page.keyboard.press('Enter');await page.waitForTimeout(300);
   await page.screenshot({path:join(shots,name+'-delivered.png')});
  }
  if(touch){await page.touchscreen.tap(width*.7,height*.78);await page.waitForTimeout(600);}
  await page.keyboard.press('KeyJ');await page.waitForTimeout(300);
  await page.screenshot({path:join(shots,name+'-journal.png')});
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.starhermit),'running');
  assert.deepEqual(errors,[],name+' console errors');
  console.log('PASS:',name,'loads, renders, responds to input, opens journal; no console errors');
  await ctx.close();
 }
}finally{await close();server.close();}
