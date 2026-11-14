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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer running `npm test` gets the same native admission
  result every time, locally and in CI, instead of an occasional unexplained
  failure.
- **Evaluation.** In a full `npm test` on 2026-11-13 (22:11–22:53 +0800, load
  falling from a 15-minute average of 77 to 14), `tests/git-publication-native-admission-correction.sh`
  and `-investigation.sh` failed with "incomplete or stale native stream
  (missing)": the substitute host admitted the claim but left `events.jsonl`,
  `response.md` and `stderr.log` empty. A direct run minutes later failed the
  same way; about 570 later targeted runs and the next full gate passed.
  Inducing SIGTERM on the host's bash reproduces the signature. SEED-334 added
  host-exit diagnostics (`NATIVE_AGENT_EXIT_LOG`, `<run>/host-exit.log`,
  printed on failure) that name a caught signal, errexit command and line, a
  KILL, or a host still running. The story is done when the cause is
  identified from a recurrence or a deterministic reproduction and repaired
  with a test that fails first, or the cause is shown to lie outside this
  repository with that evidence.
- **Boundary.** Other load-sensitive jobs and the 180 s job deadline are out
  of scope unless the cause is shared.
- **Value / learning.** Restores trust in the repository suite's native
  publication checks.
- **Safe stopping point.** A confirmed cause with its evidence, before the
  repair, is a useful stop.
