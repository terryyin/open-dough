---
id: SEED-332
status: active
---

# SEED-332 — Answer fake GitHub reads in process

<a id="answer-fake-gh-reads-in-process"></a>

### Answer fake GitHub reads without a process per call

**Identity:** SEED-332#answer-fake-gh-reads-in-process

**Goal.** The checks' fake GitHub reads answer in the calling process, so a
family of checks no longer starts a process per read and stays within its
default budgets under natural load.

**Scope.** `src/fake-gh.mjs` gains an in-process reader with the same answers
as the per-process reader. Real native CLI controls stay intact. Acceptance
needs the full suite, an explanation of any earlier unexplained failure, and
three consecutive family passes in a natural one-minute CPU-load 30–50 window
with every case within 25 s.

Plan: [610-answer-fake-gh-reads-in-process](../slice-plans/610-answer-fake-gh-reads-in-process/PLAN.md).
