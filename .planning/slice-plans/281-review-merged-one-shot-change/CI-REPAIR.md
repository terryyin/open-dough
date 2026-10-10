# Owned CI repair during slice 5 delivery

Execution: `SEED-088#review-merged-one-shot-change`; current published HEAD
`1e6fecc06ac0fa2bc6594f76d2f521f7001e59ac`. No slice6 work had started.

## Classification and preservation

Recovered observer `/tmp/dough-ci-501/watch-lAm58a` exactly matches this
checkout, repository `terryyin/open-dough`, execution mode and story branch.
Its stream parsed terminal `finished`, `result.json` agrees, process16455 ended,
and `delivery.json` acknowledges through sequence7. Events1–6 identify these
registered owned revisions and attempt1 jobs:

- `1b2c631f8b92309c452577152746291e0865da88`, run38005633984:
  jobs114073655731 (dashboard1/9) and114073655737 (dashboard6/9).
- `56fd15b6b7ed1a4b8c2a3eb693dc1fa704f8cf63`, run38007783610:
  jobs114080479541 (dashboard4/9) and114080479760 (dashboard6/9).
- `2ea792df655cdda3d1803ab7b2abd17d473233fc`, run38010280032:
  jobs114088436428 (dashboard6/9) and114088436521 (dashboard7/9).

All three attempts are completed/failure. Bounded failed-job logs and job JSON
are `/tmp/dough-seed088-ci-<run>.log` and `-jobs.json`; obtained with
`gh run view <run> --repo terryyin/open-dough --attempt 1 --log-failed` and
the corresponding `--json status,conclusion,jobs,url`, all terminal exit0.
All six jobs have test causes: Cursor recovery types a continuation on a
working screen; the legacy capture and historical review tests print Git push
stderr, rejected by the strict reporter. Identical printed causes explain
every remaining failed job. Sequence7's GitHub connection loss explains lost
observation, not those test failures. No infrastructure disposition or rerun
until green substitutes for repair.

All writers were terminal and tree clean. Installed preservation command:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR PATH="/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH" node .agents/skills/dough-execute-plan/scripts/ci-repair-stash.mjs save --checkout /Users/terryyin/git/open-dough/.worktrees/review-a-story-s-merged-one-shot-change --label 'dough-execute-plan CI repair 38005633984/1,38007783610/1,38010280032/1'
```

Receipt `clean`, no stash entry; record
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-ukFHt3/record.json`.
The adapter prohibits restarting a valid terminal finished observer. Later
managed delivery retains the explicit unobserved limitation; no replacement,
provider polling or fabricated CI success.

## Implementation proof accepted

Coordinator inspected runnerKeep's existing idleComposer branch,
LaunchInstruction's ordered evaluation, KeptClientScreen's parsed frame state,
both deterministic frame assertions, native recovery's working/no-input and
idle/same-chat assertions, the ordinary split-screen paste contract, and the
Git helper's callers in the reported failed capture/review journeys.
Only recovery waits for a synchronized paint to finish before judging idle;
ordinary launch/paste timing and unframed idle composition remain useful.
The deterministic journey supplies terminal fragments, never the resulting
input. It observes no input before/after the completed working frame, exactly
one continuation on subsequent idle paint and on an unframed idle composer.
Git helper uses captured stdio; reporter rules remain unchanged.

Red evidence: `/tmp/dough-seed088-ci-repair-output-red.log` reproduces both
assertion-passing-but-printed failures; `/tmp/dough-seed088-ci-repair-frame-red.log`
shows a continuation after the incomplete working paint. Both exit1.
Output red ran at clean unchanged `1e6fecc06ac0fa2bc6594f76d2f521f7001e59ac`.
Frame red added only the first observing regression and returned the existing
evaluation promise from write; no readiness/guard/runner/stdout behavior had
changed. Literal red commands:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS PATH="/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH" npm run test:dashboard -- --workers=1 --max-failures=3 dashboard/tests/one-shot-landing-capture-binding.spec.ts dashboard/tests/story-review-one-shot.spec.ts > /tmp/dough-seed088-ci-repair-output-red.log 2>&1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS PATH="/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH" npm run test:dashboard -- --workers=1 --max-failures=3 dashboard/tests/cursor-recovery-frame.spec.ts > /tmp/dough-seed088-ci-repair-frame-red.log 2>&1
```

Green literal commands below use the configured strict reporter; no line
reporter override. All commands terminal exit0:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS PATH="/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH" npm run test:dashboard -- --workers=1 --max-failures=3 dashboard/tests/cursor-recovery-frame.spec.ts dashboard/tests/cursor-session-recovery.spec.ts dashboard/tests/cursor-session-recovery-stops.spec.ts dashboard/tests/one-shot-landing-capture-binding.spec.ts dashboard/tests/story-review-one-shot.spec.ts dashboard/tests/one-shot-landing-recovery.spec.ts
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS PATH="/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH" npm run test:dashboard -- --workers=1 --max-failures=3 dashboard/tests/cursor-recovery-frame.spec.ts dashboard/tests/cursor-session-recovery.spec.ts dashboard/tests/cursor-session-recovery-stops.spec.ts dashboard/tests/agent-launch-ad-hoc-cursor-split-screen.spec.ts dashboard/tests/agent-terminal-cursor-launch.spec.ts
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS PATH="/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH" npm run test:dashboard -- --workers=1 --max-failures=3 dashboard/tests/one-shot-landing-capture.spec.ts dashboard/tests/one-shot-landing-capture-cli.spec.ts dashboard/tests/one-shot-landing-capture-admission.spec.ts dashboard/tests/one-shot-landing-recovery-binding.spec.ts dashboard/tests/one-shot-landing-recovery-retention.spec.ts dashboard/tests/one-shot-landing-recovery-deletion.spec.ts dashboard/tests/story-review-one-shot-admission.spec.ts dashboard/tests/story-review-one-shot-unavailable.spec.ts dashboard/tests/story-review-one-shot-choices.spec.ts
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS PATH="/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH" npm run test:dashboard -- --workers=1 --max-failures=3 dashboard/tests/cursor-recovery-frame.spec.ts dashboard/tests/story-review-one-shot-choice.spec.ts dashboard/tests/story-review-one-shot-choice-refresh.spec.ts dashboard/tests/story-review-one-shot-choice-races.spec.ts
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR PATH="/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH" npm run typecheck:dashboard
git diff --check
```

Logs under `/tmp/dough-seed088-ci-repair-`: `green.log`, `cursor-green.log`,
`consumers-green.log`, `choice-green.log`; selection log confirms45 distinct
tests in19 files. The plural `choices` argument matched no file; its eight
other specs ran, then all three actual choice files ran explicitly. Consumer
trace covers Cursor native recovery/stops, ordinary fragmented paste and dev/
preview launch, all capture/admission/retention/deletion/historical/choice
callers of the shared Git helper. Unchanged shared-launch boundaries retain
existing proof; the new guard is confined to Cursor idle recovery.
All five product/test files raw/projected≤196 lines. No diagnosed defect
remains; local proof is not a hosted CI verdict.

## Independent refactor and delivery

Fresh refactor returned `## REFACTOR COMPLETE`, giving the two regression
journeys one local fixture owner. Coordinator inspected fixture construction
and every ordering assertion; all production/native/Git/landing/review proof
stays unchanged. Only the two frame journeys were invalidated and rerun, both
passed under the strict reporter, plus typecheck and whitespace, terminal0:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS PATH="/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH" npm run test:dashboard -- --workers=1 --max-failures=3 dashboard/tests/cursor-recovery-frame.spec.ts
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR PATH="/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH" npm run typecheck:dashboard
git diff --check
```

Coordinator format `/tmp/dough-seed088-ci-repair-format.log` exited1 on
floating promise at LiveTerminalClient's existing fire-and-forget launch write
and an async-without-await test callback. Mechanical corrections explicitly
ignore the same returned promise and return a resolved promise from the same
synchronous counter; accepted semantics/order/proof remain unchanged.
Retry command exited0:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR PATH="/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH" npm run format > /tmp/dough-seed088-ci-repair-format-retry.log 2>&1
```

No behavior gap or ADR conflict. Slice statuses remain1–5done/6planned; no
readiness renewal. Agent commit `5a7e236706df4b349b546f1071de907acfe58d9e`
passed the check-only hook. Managed delivery accepted the same SHA at
`refs/heads/codex/review-a-story-s-merged-one-shot-change`, suffix base
`1e6fecc06ac0fa2bc6594f76d2f521f7001e59ac`, no reconciliation, maintenance not
applicable, observation explicitly unobserved. This is the next published base.
Installed `ci-repair-stash.mjs restore --record` the exact retained record
returned `resumed`, oid null, applied false, dropped null. There was no saved
entry to restore. Known failures are repaired; slice6 can begin. No hosted
verdict is claimed for this or later unobserved publications.
