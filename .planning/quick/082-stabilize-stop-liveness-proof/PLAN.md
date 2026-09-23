# Stabilize explicit-stop worker-liveness proof

Status: planned. No execution has started or been authorized.

**Identity:** quick/082-stabilize-stop-liveness-proof/PLAN.md
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f0beb05a31ec1e965cb07947086de88b1ecd99793cb1d3dbc87ff3985d84d1ac"}}
```

## Source and outcome

Bounded retrospective correction from
SEED-008#self-ending-ci-observer /
`.planning/quick/079-complete-ci-observation/PLAN.md`
("Complete CI observation without separate agent bookkeeping").

Provenance: related published implementation commits
`57102252facd1856b135218845c7b38d1ec684ca` (slice 1) and
`1d2e4bede8f8bc79c0c4cd24d9b5f4ea45471f7a` (slice 2) on
`refs/heads/cursor/079-complete-ci-observation`. Review of tip `1d2e4be`.

A developer (and this project's GitHub Actions `test` job) gets a reliable
pass for the new quiet-gap / explicit-stop liveness check introduced with
`complete-revision`, so a brief gap between a recorded `stopped` terminal
result and OS process exit cannot fail the suite on a loaded runner.

## Current findings and scope

GitHub Actions run
[35815782612](https://github.com/terryyin/open-dough/actions/runs/35815782612)
for `1d2e4bede8f8bc79c0c4cd24d9b5f4ea45471f7a` failed one test:

`a quiet gap without completion leaves the worker alive; explicit stop stays separate`
in `ci-mailbox-complete-unresolved-cases.mjs`.

The CLI `stop` receipt already reported `terminal.status: "stopped"`, then
`assertWorkerDead` expected `process.kill(pid, 0)` to throw `ESRCH`
immediately. On the runner it did not yet throw (`Missing expected
exception`), so the OS process was still briefly alive after the terminal
result was recorded. Five local reruns of the same test at review tip
passed. Accepted local `bash tests/execution-ci-runtime.sh` (223 pass) did
not catch the race.

Scope: make that proof wait for confirmed worker death (or equivalent
stable liveness observation already used by mailbox helpers) after an
explicit stop, without changing the completion contract, shutdown policy,
or ordinary agent-facing recipes.

## Preserved behavior and constraints

- Preserve `complete-revision` success/failure/unresolved/unread-failure
  shutdown rules and the read-only `await-revision` purpose.
- Preserve explicit stop as a separate cancellation path; do not fold stop
  into completion or add idle/restart lifecycle.
- Do not invent a second observer, evidence format, or host adapter.
- Do not expand into DD-090's "ended vs attached" coordinator signal (process
  finding; separate product priority).
- Follow Accepted ADR 0005: stabilize deterministic proof; do not treat this
  as a substitute for native host journeys already accepted under plan 079.

## Key examples

1. **Quiet gap:** After register without completion, a short delay leaves the
   worker alive and `result.json` absent; coverage remains undiscovered or
   pending.
2. **Explicit stop:** `ci-mailbox.mjs stop` returns `terminal.status:
   "stopped"` and the worker is observably dead under a race-safe check.
3. **No product drift:** Diff stays in the completion test helpers / this
   case (and only production wait helpers if the same race is already owned
   there). Guidance and `complete-revision` receipts unchanged.

## Ordered slices

### 1. Make explicit-stop liveness proof race-safe

Type: Behavior
Status: planned

Adjust
`src/skills/dough-execute-plan/scripts/ci-mailbox-complete-unresolved-cases.mjs`
(and shared assert helpers in `ci-mailbox-complete-test-fixtures.mjs` if
needed) so after a successful explicit `stop` receipt the proof confirms
worker death without requiring instantaneous `ESRCH` on the first
`kill(pid, 0)`. Prefer reusing existing mailbox liveness /
`waitForWorkerExit`-style helpers over a new polling framework. Keep the
quiet-gap alive/no-result assertions.

Proof:

```text
command: node --test --test-name-pattern='quiet gap without completion' \
  src/skills/dough-execute-plan/scripts/ci-mailbox-complete-unresolved-cases.mjs
boundary: explicit-stop liveness after quiet gap
setup: process mailbox fixture from existing complete-revision suites
observations: test passes repeatedly under ordinary local load; stop receipt
  remains stopped; worker dead under the race-safe check
result: (record on execution)
```

Also rerun the focused completion suites used by plan 079 slice 1:

```text
node --test src/skills/dough-execute-plan/scripts/ci-mailbox*.test.mjs \
  src/skills/dough-execute-plan/scripts/ci-*-lifecycle.test.mjs \
  src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs
```

Safe stopping point: the explicit-stop liveness case no longer fails on a
brief post-`stopped` process exit window; completion behavior unchanged.

## Sizing, stopping points, and remaining concerns

One Behavior slice; no supplied numeric target. No remaining slice-specific
concern identified in this review. Separately, live Story Branch CI for
`1d2e4be` and the ended mailbox `/tmp/dough-ci-501/watch-9Auvy6` belong to
the invoking execution's completion/repair path, not this correction's
implementation footprint.

Execution requires separate authorization. Planning alone performs no
product-behavior change, commit, push, or backlog queue edit.
