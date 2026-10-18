# Protect accepted starts during dashboard updates

<a id="preserve-starts-during-dashboard-updates"></a>

### Preserve execution starts across automatic dashboard updates

**Identity:** SEED-137#preserve-starts-during-dashboard-updates
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** An automatic dashboard update must not interrupt an accepted execution start between its published assignment and confirmed native session.

**Scope:** Repair the production dashboard replacement/startup lifecycle and add focused regression coverage. Preserve existing launch recovery and explicit shutdown behavior. Do not resume Pygardon's interrupted story as part of this repair.

**Known expectations:**

- An accepted start finishes its handoff while an automatic update is pending.
- A replacement cannot race with acceptance of another start.
- Once starts settle, the automatic update can activate normally.
- Existing native sessions and retained launch evidence remain available.

**Reported evidence:** Pygardon's SEED-128 execution was accepted at 2026-10-19 08:47:29 JST, published its Take at 08:47:39 as 031040873, then retained no script result or execution session when production was replaced at 08:48:13. The recorded server and worker had exited. The update stops the old preview process group, which includes its startup worker.

**Remaining uncertainty:** Confirm the interruption with a focused failing regression and select the smallest safe coordination boundary. The bounded bug-repair workflow authorizes one planless repair attempt with no replanning and a ten-minute implementation limit.
