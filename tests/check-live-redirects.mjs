/**
 * Agent-02: real Chrome verifies published GitHub Pages compatibility redirects.
 * No browser profile or visit data is kept after this check.
 */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const binary=process.argv[2];assert(binary,'Pass Chrome executable path');
const base='https://minuteandone.github.io/Village-store/';
const checks=[
 {suffix:'',hash:'#legacy-relay=1'},
 {suffix:'listening-map/',hash:'#mix=1010'},
 {suffix:'confluence/',hash:'#pair=glass-tide'},
 {suffix:'signal-loom/',hash:'#loom=01010101'},
 {suffix:'studio/',hash:'#score=91a4548190-2n'},
 {suffix:'atlas/',hash:'#route=01234.n.l.a'}
];
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'elsewhere-redirect-chrome-'));
const port=9361;
const child=spawn(binary,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--remote-debugging-port='+port,'--remote-debugging-address=127.0.0.1','--user-data-dir='+tmp,'about:blank'],{stdio:['ignore','ignore','pipe']});
let ws,seq=0;const tasks=new Map();const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function getTarget(){
 for(let i=0;i<95;i++){
  try{
   const response=await fetch('http://127.0.0.1:'+port+'/json/list');
   if(response.ok){const tabs=await response.json();const tab=tabs.find(t=>t.type==='page'&&t.webSocketDebuggerUrl);if(tab)return tab}
  }catch(_){}
  await sleep(130);
 }
 throw new Error('Chrome debug tab was unavailable');
}
async function send(method,params={}){
 return new Promise((resolve,reject)=>{
  const id=++seq;tasks.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));
 });
}
async function evaluate(expression){
 const output=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(output.exceptionDetails)throw new Error('Page evaluation: '+JSON.stringify(output.exceptionDetails));
 return output.result?.value;
}
async function eventually(condition,label){
 for(let i=0;i<125;i++){try{if(await evaluate(condition))return}catch(_){}await sleep(120)}
 const last=await evaluate('location.href').catch(()=>'(unavailable)');
 throw new Error('Redirect timed out for '+label+'; browser reached '+last);
}
try{
 const tab=await getTarget();ws=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{
  ws.addEventListener('open',resolve,{once:true});
  ws.addEventListener('error',reject,{once:true});
  ws.addEventListener('message',event=>{
   const msg=JSON.parse(event.data);
   if(msg.id&&tasks.has(msg.id)){
    const t=tasks.get(msg.id);tasks.delete(msg.id);
    if(msg.error)t.reject(new Error(JSON.stringify(msg.error)));else t.resolve(msg.result);
   }
  });
 });
 await send('Page.enable');await send('Runtime.enable');
 for(const entry of checks){
  const origin=base+'worlds/agent-02/'+entry.suffix+'?from=legacy-browser'+entry.hash;
  const canonical=base+'site/worlds/agent-02/'+entry.suffix+'?from=legacy-browser'+entry.hash;
  const nav=await send('Page.navigate',{url:origin});
  assert(!nav.errorText,'Could not load legacy route '+origin+': '+nav.errorText);
  await eventually('location.href==='+JSON.stringify(canonical)+' && document.readyState===\'complete\'','legacy '+entry.suffix);
  assert.equal(await evaluate('location.href'),canonical,'Share fragment/query preserved in Chrome');
  console.log('PASS redirect: '+origin+' -> '+canonical);
 }
 console.log('PASS: all six published Elsewhere redirects preserve old hash and query in real Chrome.');
}finally{
 try{ws?.close()}catch(_){}
 if(child.exitCode===null){const stopped=new Promise(r=>child.once('exit',r));child.kill('SIGTERM');await Promise.race([stopped,sleep(1400)])}
 try{fs.rmSync(tmp,{recursive:true,force:true,maxRetries:4,retryDelay:150})}catch(error){console.warn('Chrome temp cleanup skipped: '+error.message)}
}
