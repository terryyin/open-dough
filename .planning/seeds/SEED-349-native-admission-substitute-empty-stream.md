---
id: SEED-349
status: active
planted: 2026-11-14
trigger_when: selected from the product backlog
scope: story
---

# SEED-349 — Native admission substitute ends with an empty stream

<a id="explain-native-admission-substitute-empty-stream"></a>

### Explain and repair an empty native admission substitute stream

**Identity:** SEED-349#explain-native-admission-substitute-empty-stream
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/892-explain-native-admission-substitute-empty-stream/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e08c3b1beeb36e9a4087f19831324afa7302b9f94e117a6e7fdc17a5c034ed49","plan":"7cc9015568e8fd0022fc68a921d7a7d4308b090c633fbe55aa1983a580fba8ca"}}
```

**Goal.** A developer running `npm test` gets the same native admission
result every time, locally and in CI, instead of an occasional unexplained
"incomplete or stale native stream (missing)" failure. This restores trust in
the repository suite's native publication checks; it does not promise that
other load-sensitive jobs become stable.

**Evidence so far.** In a full `npm test` on 2026-11-13 (22:11–22:53 +0800,
load falling from a 15-minute average of 77 to 14),
`git-publication-native-admission-correction.sh` and `-investigation.sh`
(`Distribution/evaluation/tests/git-publication/`) failed with that reason:
the substitute host admitted the claim but left `events.jsonl`, `response.md`
and `stderr.log` empty. A direct run minutes later failed the same way; about
570 later targeted runs and the next full gate passed. Inducing SIGTERM on the
host's bash reproduces the signature. SEED-334 added host-exit diagnostics
(`NATIVE_AGENT_EXIT_LOG`, `<run>/host-exit.log`, printed on failure) that name
a caught signal, an errexit command and line, a KILL, or a host still running.
No recurrence has been seen since: the native admission checks are absent from
the last 60 `main` CI runs' failures (checked 2026-11-28), and no retained
local `host-exit.log` records one.

**Scope.**

- Required: name the cause from a recurrence's host-exit record or from a
  deterministic reproduction, then repair it with a test that fails first on
  that cause, or show with evidence that the cause lies outside this
  repository.
- Required: reaching a recurrence may use deliberate local load comparable to
  2026-11-13 (a full local suite beside repeated runs of the two checks); it
  is unpaid and touches no shared system.
- Scope limits: other load-sensitive jobs and the 180 s job deadline, unless
  the cause is shared; real (paid) native host runs; changing what the
  assessor accepts as a complete stream.
- Safe stopping point: a confirmed cause with its evidence, before the repair.

**Key examples.**

1. The two admission checks run repeatedly beside a full local suite at a load
   near 2026-11-13's → one run fails with the empty stream → its printed
   `host-exit.log` names how the host session ended (for example "caught
   SIGTERM", or "stopped by status 1 at line N: <command>"), which points at
   the code or process that ended it.
2. That cause is induced deterministically in a focused test (for example the
   named command failing, or the named signal arriving at the named point) →
   the test fails on the current code → after the repair it passes, and the
   two admission checks pass under the same load.
3. The record names an end no repository code causes (for example the OS
   killing the process under memory pressure, with its system log entry) →
   the evidence is recorded in this story and it closes without a code
   change.
4. A bounded load run produces no recurrence → the run count, load and
   duration are reported; whether to close with the diagnostics kept or to
   keep the story waiting for a recurrence is Terry's decision
   (recommendation: close, since the diagnostics already name any future
   recurrence's cause).
