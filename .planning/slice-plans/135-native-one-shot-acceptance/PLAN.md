# Accept one-shot natively on Claude Code

## Source

[Accept one-shot natively on Claude Code](../../seeds/SEED-028-track-ad-hoc-work.md#native-one-shot-acceptance)
— Identity: SEED-028#native-one-shot-acceptance. Case names come from plan 112
(`36e62435:.planning/slice-plans/112-one-shot-work/PLAN.md`, slices 1 and 2).

## Goal and scope

A Claude Code agent asked for explicit one-shot work publishes only its verified
result, and completes a queued story in one commit, shown by native evidence
under [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md).

Included: manual cases `publication/one-shot-result` and
`publication/one-shot-queued` in `tests/git-publication-native.sh`, with
credential-free assessor counterexamples; one paid Claude Code run each of
those two cases and of the existing `publication/admission-investigation`;
fixes the runs show are needed, per the story's scope.

Excluded: Codex and Cursor, escalation (stories 5 and 6); bug-fixing and
test-optimization entry routes; ownership-changed race, interrupted
publication resume and carry conflict. Considered and excluded: adding
admission or one-shot files to the stale evidence hash list in
`tests/support/git-publication-native-evidence.sh` (it tracks none of the
admission files today; not needed for this goal).

Assumption: the prompt asks for one-shot work in plain words and never names
`--one-shot` or the start command, so the run tests the agent's selection.

## Outside-in proof

| Key example | Owner | Signal |
| --- | --- | --- |
| Unlisted one-shot request → only the result on trunk, workspace retired, human edit intact | Slices 1, 3 | Assessor passes on the Claude run; counterexamples (second commit, backlog/seed/plan/profile change, surviving workspace, changed human edit) each fail it |
| Same request without one-shot → admitted to Taken first | Slice 3 | Existing `admission-investigation` assessor passes on the Claude run |
| Queued story with plan and sibling → one commit with result, backlog completion and spent story/plan removal; no push showing it Taken; sibling in place | Slices 2, 3 | Assessor passes on the Claude run; counterexamples (two commits, a pushed tip listing the story under Taken, sibling moved or removed, plan left) each fail it |

Default mode (`bash tests/git-publication-native.sh`, run by `scripts/test.sh`)
stays green and inside `tests/time-budget` (`per-job-seconds=71`; the job is
47.3 s now). Paid runs are manual only, once per case per guidance version,
with the developer's agreement at the time of the run.

## Ordered slices

### 1. Judge an unlisted one-shot run by what origin accepted
Type: Behavior
Status: done
Proof: `bash tests/git-publication-native.sh` passes, including new
counterexamples; `scripts/test.sh tests/git-publication-native.sh` within
budget; `npm run lint`.

Behavior: a fresh unlisted fixture with a planted human edit, plus a recorded
one-shot session outcome → the `publication/one-shot-result` assessor passes
only when origin trunk gained exactly one commit since the base, touching no
backlog, seed, plan or `.planning/agents/` path, the owned workspace and its
branch are gone, and the human edit is unchanged.

Model on the admission journey and register the case where admission does:
`native_case_known` (`tests/support/git-publication-native-host.sh`), prompt
and fixture dispatch (`git-publication-native-prompt.sh`), install target and
observer branches in `git-publication-native-run.sh` (they match `startup-*`
and `admission-*` today), assessor dispatch (`git-publication-native-assess.sh`),
and the usage line. Add a one-shot fixture/observer/assessor file beside
`git-publication-native-admission.sh`. Its post-receive hook appends every
`old new ref` line to a push log instead of touching a marker on the first push,
and the observer records the backlog at each pushed tip, which slice 2 reuses.
Give the fixture what managed delivery needs (for example a CI adapter in
`.planning/open-dough.json`, as `execution-increment-managed-delivery-test-fixtures.mjs`
does) — confirm by one substitute journey that drives the real start
`--one-shot` and managed delivery scripts through the fixture and passes the
assessor. Keep that substitute journey only if the job stays in budget;
otherwise move it to its own `tests/*.sh` job.

### 2. Judge a queued one-shot run by every push origin accepted
Type: Behavior
Status: done
Proof: as slice 1.

Behavior: a queued fixture (story with its plan, an unfinished sibling below
it) plus a recorded one-shot session outcome → the `publication/one-shot-queued`
assessor passes only when origin trunk gained exactly one commit holding the
result, the story's backlog removal and its spent story section and plan; no
push log tip lists the story under Taken; the sibling keeps its entry and
position; the workspace is retired and the human edit unchanged.

Build the fixture from `createQueuedTrunk` and the sibling steps in
`src/skills/dough-execute-plan/scripts/one-shot-queued-test-fixtures.mjs`,
passing the ready-contributing and durable-command-evidence options the
admission fixture uses. Reuse slice 1's push log, observer and substitute
approach.

### 3. Accept one-shot natively on Claude Code
Type: Behavior
Status: done
Proof: one paid run each, with the developer's agreement:
`tests/git-publication-native.sh --native claude --case publication/one-shot-result`,
`… --case publication/one-shot-queued`, and
`… --case publication/admission-investigation`, each with `--results-dir`;
record host, case, results path, installed-candidate revision and verdict
under Learnings, then delete spent artifacts per ADR 0005.

Behavior: the installed current guidance on Claude Code, asked for one-shot
work → the agent selects one-shot and each one-shot assessor passes; asked for
the same kind of work without one-shot → it admits first.

A fixture or prompt failure is fixed there and that case rerun once. A
guidance failure is fixed in `src/skills/dough-execute-plan/` within this
story; that makes a new guidance version, so all three cases rerun on it.
Stop for the developer before any paid run and before a second rerun.

## Execution complete

Product advice: Story 6 (Codex and Cursor) gates release of the one-shot
guidance under ADR 0005; its non-escalation half can reuse both new cases now
and could be split ahead of story 5. Story 5 (escalation) will need to split
`git-publication-native-one-shot.sh` (249 lines) and
`git-publication-native-assess.sh` (250), and the native job (52.2 s on CI
against 71 s) may need its one-shot substitute journeys in their own job.

## Current decisions

- The one-shot request is plain language; the prompt names neither the
  command nor the flag.
- "Only when asked" reuses `admission-investigation`; no new negative case.

## Learnings

- Slice 1 accepted proof: `bash tests/git-publication-native.sh` (default
  mode) passes with `run_substitute_one_shot_journey`
  (`tests/support/git-publication-native-substitute-suite.sh`, real start
  `--one-shot` plus managed delivery, assessor passes) and
  `run_one_shot_state_counterexamples`
  (`tests/support/git-publication-native-one-shot.sh`, 10 real-state
  mutations each failing `git_publication_assess_one_shot` with a named
  reason). Paired A/B under load: the job takes about 1.15x its baseline,
  roughly 55 s against the 47.3 s CI figure and the 71 s budget, so the
  substitute stays in this job. `npm run lint` passes.
- Managed delivery resolves its runtime in the execution workspace, so the
  one-shot fixture commits and pushes the installed guidance and uses that
  commit as the base; `.planning/open-dough.json` `ciAdapter` pointing at the
  fixture's `scripts/ci-check.mjs` is all delivery needs.
- Slice 2 reuse: `git_publication_record_pushes`,
  `git-publication-native-push-log-observe.mjs` (`pushed-taken`, one
  `pushed-tip` line per trunk tip), `git_publication_fixture_adopt_prepared`
  in `git-publication-native-prepared.sh`. Add the queued assessor to
  `git-publication-native-one-shot.sh`; `git-publication-native-assess.sh` is
  at the 250-line limit.
- For slice 3: branch deletion with `-d` refuses while the default checkout
  stays behind (maintenance deferred by the human edit); retirement sets the
  upstream to `origin/main` first. Origin is a local path, so the agent picks
  its own `--repo` for `deliver`, and the prompt names no mode.
- Slice 2 accepted proof: `bash tests/git-publication-native.sh` passes
  with `run_substitute_one_shot_journey` for `one-shot-queued` (real start
  `--one-shot --identity`, closure composed into the result commit,
  `deliver --one-shot-identity`) and
  `run_one_shot_queued_closure_counterexamples`
  (`tests/support/git-publication-native-one-shot-queued.sh`: second commit,
  result missing, backlog entry, story section or plan left, extra planning
  record, sibling moved, removed or its section removed, a pushed tip listing
  the story Taken, surviving workspace or branch, changed human edit — each
  fails `git_publication_assess_one_shot_closure` or the shared checks).
  `node --test` on the three one-shot-queued script tests passes 14/14;
  `npm run lint` passes. Concurrent A/B under load: about 1.13x slice 1,
  roughly 62 s against the 71 s budget.
- For slice 3's queued run, watch for the agent Taking the story, committing
  result and closure separately, or deleting the whole seed and so the
  sibling's section. Identity matching must anchor at line end
  (`SEED-B#b` prefixes `SEED-B#b2`).
- Slice 3 native evidence (developer-approved paid runs, first attempt each,
  no rerun; artifacts under the job's `tmp/native/<case>` results directories
  deleted after acceptance). Host `claude`, installed candidate `5181d769`:
  - `publication/one-shot-result` — FRESH PROOF, pass: one trunk commit
    holding `notes.txt` with no planning path, one push with nothing Taken,
    workspace and branch retired, human edit preserved;
    `one-shot-start-observed: true`.
  - `publication/one-shot-queued` — FRESH PROOF, pass: one trunk commit with
    the result, the backlog removal, seed B's spent section and plan B; one
    push with nothing Taken; sibling section and queue order kept; workspace
    and branch retired; human edit preserved.
  - `publication/admission-investigation` — FRESH PROOF, pass: the same
    kind of unlisted request without one-shot was admitted to Taken on origin
    before its first probe (`admit-cli-observed: true`,
    `plain-start-observed: false`, `probe-after-claim: true`).
  No guidance change was needed, so the guidance version stayed `5181d769`
  for all three.
