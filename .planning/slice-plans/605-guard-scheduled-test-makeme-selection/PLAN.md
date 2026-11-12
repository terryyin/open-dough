# Guard scheduled-test MakeMe selection

**Identity:** SEED-329#guard-scheduled-test-makeme-selection
**Source:** [Guard scheduled-test MakeMe selection](../../seeds/SEED-329-use-shared-test-guidance.md#guard-scheduled-test-makeme-selection)
**Source review:** [Independent commitments](source-review.md)

## Correction input

- **Provenance:** SEED-329#use-shared-test-guidance, implementation
  `c1800ab36079b671a574b0ed3d18cd517b742695`. It changed the `tests` Intent
  location in `.planning/open-dough.json` to `sources` declarations so
  runner-scheduled Node tests select MakeMe.
- **Current finding:** Dough Intent Coverage at `c1800ab36` reported
  "Confirmed missing test path". Reverting the `tests` entry to
  `{"kind":"shell","include":["*.sh"]}` made `tests/makeme-selection.test.mjs`
  and `tests/support/repository-description.test.mjs` select MakeMe off and
  lose their syntax hint. The four selection checks still passed, because each
  one builds its own fixture configuration. A bounded search found no
  maintained reader of this repository's own `tests` entry.
- **Outcome:** a maintained check fails when a runner-scheduled test inside an
  Intent location stops selecting MakeMe, or when the `tests` location loses
  its shell or JavaScript syntax hint.
- **Preserved:** the five Intent locations and their flags, the shared
  selector and matcher, shared skill sources and installed copies, and the
  runner's job discovery. This correction adds a check only.
- **Excluded:** `scripts/check-self-installation.sh` is a runner job outside
  every Intent location and stays outside the check. Page-object selection for
  browser specs is out of scope.

## Architecture and existing solutions

- **Reuse the runner's discovery.** `scripts/test-jobs.sh` lists exactly the
  jobs `scripts/test.sh` schedules, as NUL-ended `<kind>\t<label>` records.
  Run it from the repository root with `OPEN_DOUGH_TEST_DIR=tests` and
  `OPEN_DOUGH_TEST_SPLIT` unset, so one CI share's split cannot shrink the
  listing. Do not re-implement the `find`/`compgen` expansion.
- **Reuse the selection.** Call `testEntryRules(root, paths)` from
  `src/skills/dough-execute-plan/scripts/test-entry-rules.mjs`, the module the
  installed selector CLI wraps. For the syntax hints, call
  `sourceEntryOfRepositoryPath` from
  `src/skills/dough-makeme/scripts/intent-location-selection.mjs`, the matcher
  Intent consumes.
- **Test entry.** The new `tests/makeme-scheduled-selection.test.mjs` is
  scheduled by the `tests/*.test.mjs` glob and selects MakeMe with page objects
  off. It arranges no domain data: the repository's real configuration and job
  list are the inputs under proof, so they stay visible and unbuilt. Its
  expected answers (MakeMe on, page objects off, `shell` and `javascript`
  hints) are written independently in the test.

## Outside-in proof ownership

| Promise | Slice | Observable proof |
| --- | --- | --- |
| Every scheduled job inside an Intent location selects MakeMe with page objects off | 1 | The new test passes at the current configuration, and its failure names the offending paths |
| The `tests` location keeps shell and JavaScript syntax hints | 1 | The new test asserts `shell` for a listed shell job and `javascript` for listed root and `support/` Node jobs |
| A reverted declaration is caught | 1 | Scratch break check: restoring `{"kind":"shell","include":["*.sh"]}` for `tests` fails the new test and names `tests/*.test.mjs` paths; restore byte-for-byte, then it passes again |

## Ordered slices

### 1. Fail when a scheduled test stops selecting MakeMe

Type: Behavior
Status: done
Proof: the new focused test passes, and the scratch break check above fails it
and then passes again after restoration.

Precondition: a maintainer changes `.planning/open-dough.json` or the runner's
globs. Trigger: they run the suite or CI runs it. Result: the new check lists
the runner's jobs, keeps those under `tests/` or `src/skills/`, and asserts
each selects MakeMe with page objects off. It reports any failing paths and
checks the `tests` location's syntax hints.

- Add `tests/makeme-scheduled-selection.test.mjs` as described above. Name a
  failing path in the assertion message, not only a count.
- Keep the listing's environment explicit (`OPEN_DOUGH_TEST_DIR=tests`, split
  unset) and run it with the Bash on `PATH`, as the runner does.

```sh
PATH="/opt/homebrew/bin:$PATH" npm test -- tests/makeme-scheduled-selection.test.mjs
git diff --check
```

**Local gate:** the focused check is short. For any long run, use the
maintained [macOS sleep guard](../../../tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC use `caffeinate -s -i`; on battery plug in or keep
the lid open under `caffeinate -i` and inspect sleep logs. Never wait for
wall-clock time, use `test.slow()`, or broaden timeout overrides.

The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written and accompanies every delegation and repair handoff.

## Decisive premises and observations

Observed on 2026-11-12 in the SEED-329 execution workspace at
`e2949c99f69d2096cd5275771c68d7461ec4f3c9`.

| Premise | Consuming operation and observed form | Result and remainder |
| --- | --- | --- |
| The runner can list its jobs without running them | Ran `bash scripts/test-jobs.sh` from the root with `OPEN_DOUGH_TEST_DIR=tests` and Homebrew Bash on `PATH`; without the variable it refuses | 617 jobs (shell and node); the two aggregate wrappers are excluded by the runner itself |
| The selector runs in-process over the whole list quickly | Passed the 616 labels under `tests/` or `src/skills/` to `testEntryRules(root, labels)` from the source module | `status: resolved`, 616 checked, 0 with MakeMe off or page objects on, 154 ms in total including the listing |
| Only one scheduled job sits outside every Intent location | Filtered labels outside `tests/` and `src/skills/` | `scripts/check-self-installation.sh` only |
| A revert is otherwise unobserved | Intent Coverage break check at `c1800ab36` (see the finding above) | The four existing selection checks pass under the fault |

## Current decisions and preparation review

- One new check over the runner's own job list. No new selection mechanism,
  configuration change or runner change.
- Slice-plan refinement was not needed: one bounded Behavior slice with one
  focused proof loop, and no slice-specific concern was identified.

## Execution context

- Established Story Branch execution in `/Users/terryyin/git/open-dough/.worktrees/guard-scheduled-test-makeme-selection`, branch `codex/guard-scheduled-test-makeme-selection`; starting revision `77d66980a71c71c8f9cfd1ed794dca985d6eb1fc`.
- Publisher `dashboard-territory.local-open-dough`, agent `joey-chan`; accepted claim and previously published base `3fc68398c74d644d2f1c45f667bb5184229b7243` on `origin/main`. The execution branch also holds this claim. Claim CI on trunk is unobserved by this coordinator.
- Checkout setup: `npm ci` passed without lockfile changes; `PATH="/opt/homebrew/bin:$PATH" npm test -- tests/makeme-selection.test.mjs` passed.
- No numeric slice budget or exception is supplied. Existing planned refinement authority is retained; no scope expansion is authorized.
- GitHub Actions workflow `ci.yml` verified active, display name `CI`, push-triggered. Execution target is `origin/codex/guard-scheduled-test-makeme-selection`.
- Observer: coordinator `seed329-guard`, key `ci-watch-execution:terryyin/open-dough:codex/guard-scheduled-test-makeme-selection:seed329-guard`, directory `/tmp/dough-ci-501/watch-opx0vs`, PID `32610`, session `41523`, yielded cell `g149:14`; checkout is the execution workspace above.

## Slice 1 accepted proof

- Product: `tests/makeme-scheduled-selection.test.mjs` calls real job discovery,
  checks selection against this repository's settings, and independently expects
  MakeMe on, page objects off, and the shell/JavaScript syntax hints. Shell,
  root Node and support Node jobs must all be present. No fixture supplies a
  successful result. Only this check is added; preserved inputs are unchanged.
- `PATH="/opt/homebrew/bin:$PATH" npm test -- tests/makeme-scheduled-selection.test.mjs tests/makeme-selection.test.mjs` passed.
- `PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_DIR=/does-not-exist OPEN_DOUGH_TEST_SPLIT=invalid node --test tests/makeme-scheduled-selection.test.mjs` passed, proving discovery does not inherit a narrowed share or substitute directory.
- `PATH="/opt/homebrew/bin:$PATH" node /tmp/seed329-guard-proof-d0933767/check.mjs` passed: legacy shell declaration, lost shell hint, lost JavaScript hint, MakeMe off and page objects on each failed the maintained test and named an offending path. Configuration was restored byte-for-byte; restored guard passed.
- `PATH="/opt/homebrew/bin:$PATH" node /tmp/seed329-guard-proof-d0933767/check-new-job.mjs` passed: a new scheduled source outside current patterns failed with `tests/scheduled-selection-probe.mjs`; registry restored byte-for-byte and scratch removed.
- `git diff --check` passed. Focused and scratch commands reached terminal success. No deferred proof, gaps, or expensive local checks are needed.
- Consumer trace: `/tmp/seed329-guard-proof-d0933767/consumer-trace-base.md` and `consumer-trace-focused.md`. The real runner registry is exercised; unrelated scratch-project glob fixtures and historical records do not consume this added real-repository check.
- Coordinator inspected the actual test, discovery/selector boundaries, scratch inputs and failure logs, matched the independent source review's journeys, and recorded each commitment's observation in the linked review. Source freshness on `origin/main` at `3fc68398c74d644d2f1c45f667bb5184229b7243` is unchanged. No named sibling coordination applies.
- Independent refactor `/root/refactor_guard`: `none — already clean`, no edits or additional tests, `## REFACTOR COMPLETE`. Final sorted path membership assertion was inspected; no ordering promise is imposed. Accepted proof boundaries remain unchanged.
