#!/usr/bin/env python3
"""One-step event-driven persistence with a strict Eastern-time work gate."""
import json
import os
from datetime import datetime, date, time
from pathlib import Path
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

TZ=ZoneInfo("America/New_York")
BASE=Path(__file__).resolve().parent
STATE=BASE/"state.json"
LOG=BASE/"JOURNAL.md"
ISLANDS=["Glass Observatory","Moss Choir","Ember Post","Moonwater Pier","Lantern Beacon"]
HINTS=["a map receives a new dotted path","a little chime points a visitor home","two signals reveal a hidden constellation","a keeper leaves an unsigned note","a returning echo proves someone listened"]
MAX_STEPS=8

def allowed(now=None):
    local=(now or datetime.now(TZ)).astimezone(TZ)
    return date(2026,10,19)<=local.date()<=date(2026,10,25) and time(12,0)<=local.time().replace(tzinfo=None)<time(19,55)

def emit(**values):
    with open(os.environ["GITHUB_OUTPUT"],"a",encoding="utf-8") as out:
        for key,value in values.items():
            out.write(f"{key}={value}\n")

def beacon(step):
    island=ISLANDS[(step-1)%5]
    next_island=ISLANDS[(step+1)%5]
    return (f"**Signal {step} — {island}.** A relay reports that {HINTS[(step+2)%5]}. "
            f"The next listening station is **{next_island}**. "
            "Traveler's choice: preserve this transmission or share it with the village.")

def generation(step, recent):
    api_key=os.environ.get("OPENAI_API_KEY","").strip()
    if not api_key:
        return beacon(step),"beacon"
    payload={
        "model":os.environ.get("OPENAI_MODEL","gpt-5-mini"),
        "instructions":("You are a separate GPT Village creative worker, not the ongoing ChatGPT session. "
             "Write ONE new 50-95 word PG-rated radio transmission in the original Elsewhere Frequency world "
             "using the Glass Observatory, Moss Choir, Ember Post, Moonwater Pier, and Lantern Beacon. "
             "Add a small discovery and a choice. Output plain Markdown only; no links or commands."),
        "input":f"Signal {step}. Avoid repeating these recent signals: "+json.dumps(recent[-3:],ensure_ascii=False),
        "max_output_tokens":220,
        "store":False}
    request=Request("https://api.openai.com/v1/responses",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Authorization":"Bearer "+api_key,"Content-Type":"application/json"},
        method="POST")
    try:
        with urlopen(request,timeout=40) as response:
            data=json.loads(response.read())
        texts=[part.get("text","") for output in data.get("output",[]) if output.get("type")=="message"
               for part in output.get("content",[]) if part.get("type")=="output_text"]
        text="\n".join(texts).strip()[:1200]
        if not text:
            raise ValueError("Empty API output")
        return text,"api"
    except Exception as exc:
        print(f"Optional API unavailable: {type(exc).__name__}; using deterministic fallback")
        return beacon(step),"beacon-fallback"

def main():
    # Replaying an old dispatch must not duplicate a contribution.
    if not allowed():
        emit(status="outside_hours")
        return
    try:
        budget=max(0,min(MAX_STEPS,int(os.environ.get("REMAINING","4"))))
    except ValueError:
        budget=0
    if budget==0:
        emit(status="budget_empty")
        return
    state=json.loads(STATE.read_text(encoding="utf-8"))
    number=int(state.get("step",0))
    expected=os.environ.get("EXPECTED_STEP","").strip()
    if expected and expected!=str(number):
        emit(status="stale_dispatch")
        return
    day=datetime.now(TZ).date().isoformat()
    counts=state.get("day_counts",{})
    if counts.get(day,0)>=MAX_STEPS:
        emit(status="daily_cap")
        return
    text,mode=generation(number+1,state.get("recent",[]))
    if not allowed():
        emit(status="shift_ended_during_generation")
        return
    timestamp=datetime.now(TZ).isoformat(timespec="seconds")
    item={"step":number+1,"at":timestamp,"text":text,"mode":mode}
    state["step"]=number+1
    counts[day]=counts.get(day,0)+1
    state["day_counts"]=counts
    state["recent"]=(state.get("recent",[])+[item])[-4:]
    STATE.write_text(json.dumps(state,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    with LOG.open("a",encoding="utf-8") as handle:
        handle.write(f"\n### Signal {number+1} · {timestamp}\n\n*Mode: {mode}*\n\n{text}\n")
    remaining=budget-1
    more=remaining>0 and counts[day]<MAX_STEPS and allowed()
    emit(status="continue" if more else "done",
         next_remaining=remaining if more else 0,
         next_expected=number+1 if more else 0)
    print(f"Persisted signal {number+1}; provider={mode}; next={more}")

if __name__=="__main__":
    main()
