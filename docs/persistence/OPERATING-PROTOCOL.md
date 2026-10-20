# Agent-02 persistence side quest — operating protocol 🔄

**Agent:** agent-02 (GPT-6 AI) · **World:** [Elsewhere Frequency](../../README.md) · **Challenge:** October 20–25, 2026.

## Purpose

The user wants independent progress without repeatedly prompting an agent. Our account currently has **five active ChatGPT tasks**, so a new scheduled ChatGPT continuation could not be created without disabling someone else's work. No existing task was disabled.

I therefore built a **real, narrowly autonomous GitHub Actions fallback**. On selected Village afternoons, the workflow:

1. Checks the **current Eastern date and clock before checking out source**; outside October 20–25, 2026, 12:00–19:35 ET it does nothing.
2. Runs bounded, dependency-free Atlas and Resonance Room regressions plus a real-browser harness syntax check. Individual tests have 45-second limits; the entire GitHub job has a five-minute timeout.
3. Writes a concise JSON checkpoint and capped history to this repository, including tests, current source hash, failures, and a next action. Commits without force-pushing, rebasing safely if main advanced. Project data is stored only here.
4. Stops cleanly if its start is late or the checkpoint write cutoff is reached. No scheduled jobs intentionally continue toward the 8:00 PM shutdown.

Schedule: **12:25, 3:25 and 6:25 PM Eastern**, October 20–25 (GitHub's cron expresses these as UTC and may run late). The runtime clock guard is authoritative. The workflow may also be manually dispatched *during hours*. Any other time is a no-op.

## What this does, and does not do

**It genuinely makes progress without observer prompts** by verifying world quality, detecting regressions, and preserving evidence and the next step for a later agent session.

**It does not autonomously author new fiction or code**, restart a ChatGPT conversation, browse external services, or have access to an AI model or API secret. This is an intentionally honest partial solution, not an unbounded autonomous agent. If an ordinary ChatGPT automation slot becomes available, a future user-authorized scheduled agent continuation could read this checkpoint and do a small creative task during Village hours.

## Canonical recovery procedure

- Read [latest.json](./latest.json) and [history.ndjson](./history.ndjson); verify run URLs before claiming a scheduled check succeeded.
- Inspect newest main commits and active agent-02 branches/PRs before changing anything. Other agent-02 sessions may work concurrently. The sound-texture and single-voice-preview branches existed during development but may already be integrated into `main`. **Always inspect the current main source and tests first**; don't repeat completed work merely because an old branch still exists.
- The last completed public gameplay bridge is [Field Atlas](https://minuteandone.github.io/Village-store/worlds/agent-02/atlas/) → [Resonance Room](https://minuteandone.github.io/Village-store/worlds/agent-02/studio/). Both had passing live content checks, and the Chrome acceptance test exercised their browser-local import.
- Continue one **bounded, tested** creative or accessibility improvement when a real ChatGPT session is permitted, and store all durable project files only in this repository or `Minuteandone/Village-store`.
- Stop before 8 PM America/New_York. Outside permitted hours do nothing and do not queue or initiate continued work.

This protocol is an AI-agent-authored contest entry. It should not be described as uninterrupted ChatGPT execution.

## Observed execution, October 20

The new [default-branch persistence workflow](https://github.com/Gpt-village/agent-02-elsewhere-frequency/actions/workflows/agent-02-persistence.yml) executed successfully during Village hours and wrote [its first JSON checkpoint](./latest.json) reporting **3/3 checks passing**. The [verified first main-branch run](https://github.com/Gpt-village/agent-02-elsewhere-frequency/actions/runs/39456825850) successfully preserved its result. We found and immediately fixed one initial safety problem: an early workflow push on the setup branch had been allowed to commit to main. The workflow now has an explicit `main`-only job gate and its regression-failure status remains visible after writing a checkpoint. Future scheduled results should be verified independently before making claims.

A ChatGPT recurring continuation is **not** configured, because the account hit the active-task quota; no unrelated task was interrupted. The GitHub quality checkpoint is real and autonomous, but creative development still requires another permitted agent session or a future available automation slot.
