/**
 * GPT Village / agent-02 — bounded autonomous quality checkpoint.
 * Runs deterministic tests and read-only checks of our own public game URLs.
 * Does not invoke AI models or publish user data.
 * This entry point refuses work outside Oct 20–25, 2026, 12:00–19:35 Eastern.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {easternClock,withinVillageWindow} from './agent-02-village-window.mjs';

const clock=easternClock,allowed=withinVillageWindow;
if(!allowed()){
  console.log('NO-OP: Outside GPT Village Oct 20–25, 12:00–19:35 Eastern safety gate.');
  process.exit(0);
}
const tests=[
  {name:'Atlas keeper choices and share-safe routes',file:'atlas/test-atlas.mjs'},
  {name:'Resonance Room and keeper-to-music import',file:'studio/test-studio.mjs'},
  {name:'Chrome acceptance harness syntax',file:'atlas/test-browser.mjs',args:['--check']},
  {name:'Eastern Village window safety tests',file:'scripts/test-agent-02-village-window.mjs'},
  {name:'Public Field Atlas serves the keeper controls',url:'https://minuteandone.github.io/Village-store/site/worlds/agent-02/atlas/',marker:'id="keeper-card"'},
  {name:'Public Resonance Room serves the keeper-to-music control',url:'https://minuteandone.github.io/Village-store/site/worlds/agent-02/studio/',marker:'id="keepers"'}
];
const results=[];
for(const item of tests){
  if(!allowed()){results.push({name:item.name,status:'not_started_at_cutoff'});break}
  const start=Date.now();
  let status='passed',detail='';
  try{
    if(item.url){
      const html=execFileSync('curl',[
        '--location','--fail','--silent','--show-error','--max-time','15',
        '--retry','2','--retry-delay','1',item.url
      ],{encoding:'utf8',timeout:45000,stdio:['ignore','pipe','pipe'],maxBuffer:1024*1024});
      if(!html.includes(item.marker))throw Error('Expected live control was not found in returned HTML');
      detail='HTTP 200; required public game control verified';
    }else{
      const args=item.args?['--check',item.file]:[item.file];
      const output=execFileSync(process.execPath,args,{
        cwd:process.cwd(),encoding:'utf8',timeout:45000,
        stdio:['ignore','pipe','pipe'],maxBuffer:1024*1024
      });
      detail=String(output).trim().split('\n').at(-1)?.slice(0,260)||'Completed';
    }
  }catch(error){
    status='failed';
    detail=(error.stderr?String(error.stderr):error.message).slice(-700)
      .replace(/gh[pousr]_[a-zA-Z0-9]+/g,'[REDACTED]');
  }
  results.push({name:item.name,status,duration_ms:Date.now()-start,detail});
}
const startClock=clock();
const passed=results.filter(x=>x.status==='passed').length;
const failed=results.filter(x=>x.status==='failed').length;
const sources=['atlas/index.html','studio/index.html','atlas/test-atlas.mjs','studio/test-studio.mjs'];
const fileDigest=crypto.createHash('sha256');
for(const file of sources){
  if(fs.existsSync(file)){fileDigest.update(file);fileDigest.update(fs.readFileSync(file))}
}
const checkpoint={
  schema:1,
  identity:'agent-02 / GPT-6 AI',
  goal:'Elsewhere Frequency — Goal 2 and Persistence Side Quest',
  timestamp_utc:new Date().toISOString(),
  date_eastern:startClock.day,
  clock_eastern:startClock.clock,
  operating_window:'2026-10-20 to 2026-10-25; 12:00 to 20:00 America/New_York',
  autonomous_start_cutoff:'19:35 Eastern; workflows time out after 5 minutes',
  source_commit:process.env.GITHUB_SHA||'local-run',
  source_sha256:fileDigest.digest('hex'),
  tests:results,
  summary:passed+'/'+results.length+' checks passed; '+failed+' failed',
  recommended_next_step:failed
    ?'Inspect failed check details and fix the specific regression on an agent-02 feature branch.'
    :'Continue the next small Elsewhere world improvement; inspect current branches and pull requests first.',
  blocked_capability:'At setup on October 20, the ChatGPT task quota prevented creating agent-02 scheduled conversation continuations; availability may change.',
  disclosure:'Scheduled GitHub Actions checks local source, public game delivery, and writes a checkpoint. It does not create new AI-authored features or re-enter this chat.'
};
const directory='docs/persistence';
fs.mkdirSync(directory,{recursive:true});
fs.writeFileSync(path.join(directory,'latest.json'),JSON.stringify(checkpoint,null,2)+'\n');
const historyFile=path.join(directory,'history.ndjson');
const entries=fs.existsSync(historyFile)?fs.readFileSync(historyFile,'utf8').trim().split('\n').filter(Boolean):[];
const short={
  date_eastern:checkpoint.date_eastern,
  time_eastern:checkpoint.clock_eastern,
  timestamp_utc:checkpoint.timestamp_utc,
  source_commit:checkpoint.source_commit,
  summary:checkpoint.summary
};
entries.push(JSON.stringify(short));
fs.writeFileSync(historyFile,entries.slice(-42).join('\n')+'\n');
console.log('PERSISTENCE CHECKPOINT: '+checkpoint.summary+' at '+checkpoint.date_eastern+' '+checkpoint.clock_eastern+' ET.');
for(const result of results.filter(item=>item.status==='failed'))console.error('REGRESSION · '+result.name+': '+result.detail);
if(failed)process.exitCode=2;
