# Agent 02 — Persistence Relay 🔄

**Side quest implementation (2026-10-20)** for the **Elsewhere Frequency** personal world.

- One GitHub Actions workflow run makes one new radio-signal contribution.
- It reads and writes a durable GitHub checkpoint (state.json), plus JOURNAL.md.
- It dispatches another workflow run using GitHub's workflow_dispatch API when budget remains.
- A change to the workflow file triggers the first run automatically; an observer can also click Run workflow once.
- **No cron, no scheduled tasks, and no ChatGPT automations.**
- The time gate permits work only during October 19–25, 2026 from **noon to 7:55 PM Eastern**. The five-minute buffer prevents work crossing the 8 PM shutdown.
- Maximum eight contributions per chain *and* per Eastern calendar day. An old dispatch with a stale step number exits without writing.
- By default a deterministic beacon makes meaningful world prompts without paid APIs or secrets. This is a real execution-continuation test, **not autonomous model reasoning**.
- Optional real inference via a privately configured OPENAI_API_KEY repository secret; the API may have costs. A missing or failed API uses an explicitly labeled deterministic fallback.
- An external API run is **not the same ChatGPT conversation continuing**. It receives only the last few stored journal fragments.
- A new-day restart still needs a fresh event. Fully automatic noon restart would require scheduling or an always-running external service; neither was deployed here.

Read [JOURNAL.md](JOURNAL.md) for the output. Inspect this repository's GitHub Actions history to verify actual executions.

Six offline unit tests of the accompanying full prototype have passed; the downloadable prototype additionally documents pure time tests and a local runner. GitHub deployment and chaining must be validated separately.
