#!/usr/bin/env node
// Publish exactly committed dist/ to the existing Uzhhorod listing.
// node scripts/publish.mjs --dry-run   validates and packs without a network write.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import net from 'node:net';
import dns from 'node:dns';
net.setDefaultAutoSelectFamily(false);dns.setDefaultResultOrder('ipv4first');
const root=fileURLToPath(new URL('../',import.meta.url));
const gameId='aa9ff15f-c11a-4b7a-9d08-09c220917078';
const api=process.env.STARHERMIT_API_URL||'https://api.starhermit.com/api/v1';
const git=(...args)=>execFileSync('git',['-C',root,...args],{maxBuffer:64*1024*1024});
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
assert.equal(git('status','--porcelain').toString().trim(),'','Commit all changes before publishing.');
const head=git('rev-parse','HEAD').toString().trim();
const index=JSON.parse(git('show','HEAD:dist/starhermit-files.json'));
const stage=fs.mkdtempSync(path.join(os.tmpdir(),'uzhhorod-publish-'));
try{
 for(const name of [...Object.keys(index.files),'starhermit-files.json']){
  assert.ok(!path.isAbsolute(name)&&!name.split('/').includes('..'),'Unsafe package path');
  const bytes=git('show','HEAD:dist/'+name),entry=index.files[name];
  if(entry){assert.equal(bytes.length,entry.size,name);assert.equal(hash(bytes),entry.sha256,name);}
  const target=path.join(stage,'client',name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);
 }
 const manifestBytes=fs.readFileSync(path.join(stage,'client/starhermit.txt'));
 const manifest=Object.fromEntries(manifestBytes.toString().split('\n').filter(l=>l.includes('=')&&!l.startsWith('#')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i),l.slice(i+1)];}));
 fs.writeFileSync(path.join(stage,'starhermit.txt'),manifestBytes);
 const extra=[];
 for(const key of ['description.file','release_notes.file'])if(manifest[key]){
  const name=manifest[key];assert.ok(!path.isAbsolute(name)&&!name.split('/').includes('..'));
  fs.copyFileSync(path.join(stage,'client',name),path.join(stage,name));extra.push(name);
 }
 const archive=path.join(stage,'bundle.tar.gz');
 execFileSync('tar',['--format=ustar','-czf',archive,'-C',stage,'client','starhermit.txt',...extra]);
 const bytes=fs.readFileSync(archive);
 console.log(`Release ${head.slice(0,7)}: ${Object.keys(index.files).length+1} files, ${(bytes.length/1048576).toFixed(2)} MiB compressed`);
 if(!process.argv.includes('--dry-run')){
  const remote=git('ls-remote','origin','refs/heads/main').toString().split(/\s/)[0];
  assert.equal(remote,head,'Push this commit to origin/main before publishing.');
  const envFile=process.env.STARHERMIT_ENV_FILE||path.resolve(root,'../.env');
  if(fs.existsSync(envFile))process.loadEnvFile(envFile);
  const token=await login(),headers={authorization:'Bearer '+token};
  const owned=await call('/me/github-games',{headers});
  assert.ok(owned.some(g=>g.id===gameId),'The current account does not own this listing.');
  const result=await call('/me/github-games/'+gameId+'/bundle',{method:'POST',headers:{...headers,'content-type':'application/gzip'},body:bytes});
  const receiptFile=path.join(root,'publication.json');
  let receipt={game:{id:gameId},sourceCommit:head,publishedAt:new Date().toISOString(),archiveSha256:hash(bytes),bytesReceived:bytes.length,result};
  fs.writeFileSync(receiptFile,JSON.stringify(receipt,null,2)+'\n');
  // The listing has a manually uploaded cover, which overrides cover= in the manifest.
  await call('/me/github-games/'+gameId+'/cover',{method:'PUT',headers:{...headers,'content-type':'application/json'},body:JSON.stringify({imageBase64:fs.readFileSync(path.join(stage,'client',manifest.cover)).toString('base64')})});
  const game=(await call('/me/github-games',{headers})).find(g=>g.id===gameId);
  assert.ok(game);assert.equal(game.hosting?.deployStatus,'live');
  assert.ok(game.description?.includes('After the Rain'),'Catalog description did not update.');
  const live=new URL(game.hosting.hostedUrl),assets=[];
  const expected={...index.files,'starhermit-files.json':{sha256:hash(git('show','HEAD:dist/starhermit-files.json'))}};
  const names=Object.keys(expected);
  for(let i=0;i<names.length;i+=4)assets.push(...await Promise.all(names.slice(i,i+4).map(async name=>{
   const url=new URL(name,live);url.searchParams.set('release',head);
   const response=await fetch(url,{headers:{'cache-control':'no-cache'}});assert.equal(response.status,200,name);
   const actual=hash(Buffer.from(await response.arrayBuffer()));assert.equal(actual,expected[name].sha256,'Live hash mismatch: '+name);
   return{file:name,status:response.status,sha256:actual};
  })));
  const coverResponse=await fetch(api+'/github-games/'+gameId+'/cover?release='+head);
  assert.equal(coverResponse.status,200);assert.equal(hash(Buffer.from(await coverResponse.arrayBuffer())),index.files[manifest.cover].sha256,'Catalog cover mismatch');
  const iconResponse=await fetch(api+'/github-games/'+gameId+'/icon?release='+head);
  assert.equal(iconResponse.status,200);
  const catalogIconHash=hash(Buffer.from(await iconResponse.arrayBuffer()));
  const catalogIcon={source:iconResponse.headers.get('x-starhermit-art'),sha256:catalogIconHash,matchesPublishedIcon:catalogIconHash===index.files['favicon.svg'].sha256};
  // Catalog icon resolution can temporarily return the platform fallback. The actual
  // hosted favicon must still match HEAD, as verified with every other file above.
  assert.ok(catalogIcon.matchesPublishedIcon||catalogIcon.source==='default','Unexpected catalog icon content');
  if(!catalogIcon.matchesPublishedIcon)console.warn('Catalog icon resolver is showing its platform fallback; the published favicon is verified.');
  receipt={...receipt,game,verifiedAt:new Date().toISOString(),verification:{live:true,description:true,cover:true,icon:true,catalogIcon,assets}};
  fs.writeFileSync(receiptFile,JSON.stringify(receipt,null,2)+'\n');
  console.log('Published and verified:',game.hosting.hostedUrl);
 }
}finally{fs.rmSync(stage,{recursive:true,force:true});}

async function call(route,init={}){
 const response=await fetch(api+route,init),text=await response.text();
 if(!response.ok)throw new Error(`${init.method||'GET'} ${route}: HTTP ${response.status}`);
 return text?JSON.parse(text):null;
}
async function login(){
 const publicKey=process.env.STARHERMIT_PUBLIC_KEY,privateKey=process.env.STARHERMIT_PRIVATE_KEY;
 assert.ok(publicKey&&privateKey,'Set STARHERMIT_PUBLIC_KEY and STARHERMIT_PRIVATE_KEY, or STARHERMIT_ENV_FILE.');
 const seed=Buffer.from(privateKey,'base64');assert.equal(seed.length,32);
 const key=crypto.createPrivateKey({key:Buffer.concat([Buffer.from('302e020100300506032b657004220420','hex'),seed]),format:'der',type:'pkcs8'});
 assert.equal(crypto.createPublicKey(key).export({format:'der',type:'spki'}).subarray(-32).toString('base64'),publicKey);
 const headers={'content-type':'application/json'};
 for(let attempt=0;attempt<10;attempt++){
  const challenge=await call('/auth/public-key/challenge',{method:'POST',headers,body:JSON.stringify({keyType:'Ed25519',keyData:publicKey})});
  const p=challenge.payload,signed={ChallengeId:p.challengeId,Fingerprint:p.fingerprint,Issuer:p.issuer,Audience:p.audience,Expiry:p.expiry,Nonce:p.nonce,ClientTimestamp:p.clientTimestamp};
  const signature=crypto.sign(null,Buffer.from(JSON.stringify(signed)),key).toString('base64');
  try{return(await call('/auth/public-key/complete',{method:'POST',headers,body:JSON.stringify({challengeId:challenge.challengeId,signature,keyType:'Ed25519',keyData:publicKey})})).accessToken;}
  catch(error){if(attempt===9||!String(error).includes('HTTP 401'))throw error;}
 }
 throw new Error('Public-key authentication failed.');
}
