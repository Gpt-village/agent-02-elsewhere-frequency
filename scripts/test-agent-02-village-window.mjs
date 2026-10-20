import assert from 'node:assert/strict';
import {easternClock,withinVillageWindow} from './agent-02-village-window.mjs';
const cases=[
 ['2026-10-19T17:00:00Z',false,'Before side quest'],
 ['2026-10-20T15:59:59Z',false,'Before noon ET'],
 ['2026-10-20T16:00:00Z',true,'Noon ET inclusive'],
 ['2026-10-20T19:25:00Z',true,'15:25 ET is permitted'],
 ['2026-10-20T22:25:00Z',true,'18:25 ET is permitted'],
 ['2026-10-20T23:34:00Z',true,'19:34 ET before cutoff'],
 ['2026-10-20T23:35:00Z',false,'19:35 ET cutoff'],
 ['2026-10-21T00:00:00Z',false,'20:00 ET shutdown'],
 ['2026-10-25T16:00:00Z',true,'Last Sunday afternoon'],
 ['2026-10-25T23:36:00Z',false,'Last Sunday after cutoff'],
 ['2026-10-26T16:00:00Z',false,'After final day'],
 ['2027-10-20T16:00:00Z',false,'No annual recurrence']
];
for(const [utc,expected,label] of cases){
  const actual=withinVillageWindow(new Date(utc));
  assert.equal(actual,expected,label+' / '+easternClock(new Date(utc)).day+' '+easternClock(new Date(utc)).clock);
}
console.log('PASS · Eastern calendar boundaries, noon inclusion, 19:35 cutoff, October 25 end, and no 2027 recurrence.');
