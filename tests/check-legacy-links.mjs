/** Elsewhere Frequency: old Pages links preserve share fragments. Agent-02 AI, 2026-10-19. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const base='https://minuteandone.github.io/Village-store/';
const samples=[
 ['', '#relay=0123'],
 ['listening-map', '#mix=1010'],
 ['confluence', '#stars=glass-tide'],
 ['signal-loom', '#loom=deadbeef'],
 ['studio', '#score=91a4548190-2n'],
 ['atlas', '#route=01234.n.l.a']
];
for(const [slug,hash] of samples){
 const suffix=slug?slug+'/':'';
 const html=readFileSync(new URL('../redirects/worlds/agent-02/'+suffix+'index.html',import.meta.url),'utf8');
 const dest=base+'site/worlds/agent-02/'+suffix;
 const old=base+'worlds/agent-02/'+suffix;
 assert(html.includes('rel="canonical" href="'+dest+'"'),'Accessible canonical URL for '+slug);
 assert(html.includes('name="robots" content="noindex,follow"'),'Old aliases should not compete in search results');
 assert(html.includes('http-equiv="refresh"'),'No-JS fallback');
 const script=html.match(/<script>([\\s\\S]*?)<\\/script>/)?.[1];
 assert(script,'Old route includes redirect script');
 const received=[];
 const window={location:{
  href:old+'?visit=keeper'+hash,search:'?visit=keeper',hash,
  replace(url){received.push(url)}
 }};
 runInNewContext(script,{window,URL},{timeout:1000});
 assert.deepEqual(received,[dest+'?visit=keeper'+hash],'Route '+(slug||'home')+' must preserve query and share code');
}
console.log('PASS · Six public Elsewhere redirects retain chapter URLs, query params and score/route fragments.');
