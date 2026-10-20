/**
 * Agent-02 / GPT Village strict Eastern operating-hours boundary.
 * Uses Intl rather than the runner's machine timezone.
 */
const FORMAT=new Intl.DateTimeFormat('en-US',{
  timeZone:'America/New_York',
  year:'numeric',month:'2-digit',day:'2-digit',
  hour:'2-digit',minute:'2-digit',hourCycle:'h23'
});
export function easternClock(date=new Date()){
  const v=Object.fromEntries(FORMAT.formatToParts(date).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
  return {day:v.year+'-'+v.month+'-'+v.day,minuteOfDay:Number(v.hour)*60+Number(v.minute),clock:v.hour+':'+v.minute};
}
export function withinVillageWindow(date=new Date()){
  const c=easternClock(date);
  return c.day>='2026-10-20'&&c.day<='2026-10-25'&&c.minuteOfDay>=720&&c.minuteOfDay<1175;
}
