# Wait silently for a paused supplier

**Identity:** SEED-368#reduce-model-work-during-prolonged-supplier-waiting
**Source:** [story](../../seeds/SEED-368-third-blocked-execution-attempt.md#reduce-model-work-during-prolonged-supplier-waiting)
**Source review:** [source commitments](source-review.md)

## Goal and scope

For a developer who tells a blocked execution to watch its paused supplier, the
unchanged wait costs almost no model work: the model re-enters on a supplier
publication, when the host ends its longest wait, or at the watch deadline.

Included: one maintained wait command, the guidance that routes a watch request
to it under the existing long proof run wait, and the findings record of the
check for the next real watch.

Exclusions: host adapters, a watcher agent, dashboard or daemon resume,
phase-loading and general verification efficiency, any native or paid run, and
any change to the retired supplier-watch comparison profile.

Assumption: a supplier's publication is visible as a change on the remote, at
the supplier's branch or at the paths on the target that record its outcome
(its story home and the consumer's dependency agreement).

## Existing solutions and direction

- [Wait for a long proof run](../../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md)
  already owns "no model turn runs until the command finishes or reaches its
  deadline" with its host rules. The supplier watch reuses it; no host rule is
  added or copied.
- [Reassess before extending work](../../../Distribution/src/skills/dough-execute-plan/references/execution-decisions.md#reassess-before-extending-work)
  owns the paused-supplier hold and its stop with a resume condition. It gains
  the route for a watch request and keeps the deadline ending.
- The watched content follows one rule: the object the remote holds for each
  named ref, or for each named path on that ref. A ref alone and a ref with
  paths are the same comparison, so an unrelated push to a busy trunk does not
  end a path-narrowed wait.
- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) §1 and
  §3 and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  apply as the story's Architecture section records.

## Key examples and outside-in proof ownership

| Story example | Owner |
| --- | --- |
| Supplier unchanged → one silent wait, no output | Slice 1 command test: no output while the remote is unchanged |
| Nonqualifying or qualifying publication → the wait ends once | Slice 1 command test: one result line on a watched change; the judgment after it is existing behavior |
| Watch continues to the same deadline after a nonqualifying publication | Slice 1 command test: the result carries the deadline, and a rerun given it ends at that time |
| 60 minutes default, or the named duration → stop with the resume condition | Slice 1 command test for the deadline result and default; slice 2 guidance for the stop |
| No watch request → stop as today; supplier qualifies at entry → no wait | Slice 2 behavior review: the route applies only on a watch request |
| Next real watch is judged from its trace | Slice 3 findings record |

## Decisive premises and observations

Observed 2026-11-15 in the owned workspace at `47f39abba`, Node 24.21.0, Git
from `/opt/homebrew/bin`; scratch files reverted.

| Consuming operation / premise | Form, result and limits |
| --- | --- |
| Slice 1: `git fetch --quiet <remote> <ref>` then `git rev-parse FETCH_HEAD[:path]` detects a watched change and stays silent | Scratch bare remote and clone: fetch printed nothing; an unrelated push changed the commit and left the watched path's object unchanged; a push to the watched path changed it; an absent path exits 1 from `rev-parse --verify --quiet`; working tree stayed clean. |
| Slice 1: a new `Distribution/tests/skills/dough-execute-plan/*.test.mjs` runs through `bash scripts/test.sh <path>` and reports its failure | Scratch failing test at that path: exit 1 with `FAIL:` and the test name. Run with `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH"`. |
| Slices 1 and 2: guidance may link the new script only once the payload declares it | `src/install/open-dough-execution-payload.sh` declares the execute-plan files. `bash scripts/test.sh Distribution/tests/installation/payload-declaration-links.sh`: exit 0 unchanged; with a scratch link from `wait-for-proof.md` to the undeclared script, exit 1 "links to undeclared ../scripts/wait-for-publication.mjs". With a scratch script declared after `watch-ci.mjs`, `install-public-payload.sh`, `payload-declaration-links.sh`, `update-adds-new-payload-skill.sh` and `install-omits-internal.sh` in `Distribution/tests/installation/` each exit 0 through `scripts/test.sh`. |
| Slice 2: Codex accepts an empty poll of 300 seconds and keeps its cache across it | Codex 0.169.0 binary: "empty polls wait 5000-300000 ms"; 2,873 local sessions: 97.7% cached after 270–330 second gaps. Whether a session follows the guidance is the story's pending observation, not a premise of these slices. |

## Ordered slices

### 1. A watched publication or the deadline ends one silent wait
Type: Behavior
Status: done
Proof: `bash scripts/test.sh Distribution/tests/skills/dough-execute-plan/wait-for-publication.test.mjs`, red before the command exists; `bash scripts/test.sh Distribution/tests/installation/payload-declaration-links.sh`.

Behavior: a checkout with a reachable remote → `wait-for-publication.mjs`
is started with a remote, one or more refs, optional paths, and optionally a
duration or a deadline → it prints nothing while the watched objects are
unchanged, including across a push that touches none of the named paths; on a
watched change it prints one result naming what changed and the deadline, and
exits; at the deadline it prints one deadline result and exits. The duration
defaults to 60 minutes. A first observation that cannot read the remote ends
at once with its error; a later failed observation is retried silently until
the deadline.

Add the command to `Distribution/src/skills/dough-execute-plan/scripts/` and
declare it in `src/install/open-dough-execution-payload.sh`. The test drives
the real command against a temporary bare remote with a sub-second interval,
reusing `bare-remote-test-fixtures.mjs` beside it. Apply [dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md)
selection before authoring the test.

### 2. A watch request on a paused supplier waits under the proof-wait rule
Type: Behavior
Status: done
Proof: [behavior review](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review) walking the story's six key examples against the changed text; `bash scripts/test.sh Distribution/tests/installation/payload-declaration-links.sh`.

Behavior: an execution holds on a paused supplier → the developer asks it to
watch → the coordinator starts the slice 1 command once, naming the supplier's
branch and the target paths that record its outcome, with the developer's
duration when one was named, and awaits it under the long proof run wait with
no clock, status, or log call in between. On a publication it judges the exact
agreement as today and, when the hold stays, reruns the command with the
returned deadline. At the deadline it stops with the recorded resume
condition. A hold with no watch request stops as today.

Change `execution-decisions.md` at the paused-supplier hold and
`wait-for-proof.md`, following
[author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md).
Keep the addition to the few sentences this behavior needs; the host rules
stay where they are.

### 3. The findings record the delivered change and the check for the next real watch
Type: Behavior
Status: done
Proof: read the changed section against the story's Evaluation and open each changed link.

Behavior: a maintainer opens
`docs/maintainer/blocked-execution-experiment-findings.md` after a real
supplier watch → reads the third attempt → finds the delivered change, that
its benefit is predicted, the keep criterion (at most one model re-entry per
five unchanged minutes on Codex, none on Claude Code, at least 90% cached
input on the re-entries), how to count re-entries between the watch start and
its result in the session trace, and the instruction to remove the added
guidance otherwise. The evidence the story observed moves here from the seed.

## Execution complete

Product advice: the silent wait and its guidance are delivered and their
benefit stays predicted until the next real supplier watch is judged by the
findings' check. One correction is planned and not queued:
[report a publication made during judgment](../637-report-a-publication-made-during-judgment/PLAN.md),
because a supplier publishing while an earlier publication is judged leaves
the continued watch silent to its deadline. No other product change.

## Current decisions, verification and concern review

- No paid or native run, decided by Terry on 2026-11-15. The benefit stays
  predicted until the next real watch.
- The command's default duration carries the 60-minute deadline, so the
  guidance states no number of its own.
- Local gate: each slice's focused proof above. The command and its test are
  new files whose only other consumer is the payload declaration check named
  there, so no broader local run is required; hosted CI runs the full suite
  after publication.
- Long local gates follow the maintained [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  on AC `caffeinate -s -i`; on battery plug in, or run fully awake with lid
  open under `caffeinate -i` and read the sleep log afterwards.
- [Failing and flaky test policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  applies as written, in every delegation brief and repair handoff.
- Slice 1 delivered contract, for slice 2: run in the watching checkout
  `node <installed-execute-plan>/scripts/wait-for-publication.mjs --remote REMOTE --ref REF[:PATH] [--ref REF[:PATH]]... [--duration-minutes MINUTES | --deadline ISO_TIME]`.
  It prints one JSON line and exits 0: `{"result":"publication","remote",…,"changes":[{"ref","path"?,"before","after"}],"deadline"}`
  or `{"result":"deadline","remote","deadline"}`; pass the returned `deadline`
  to `--deadline` on a rerun. A first unreadable observation exits 1; a usage
  error exits 2. The observation interval defaults to 60 seconds
  (`--interval-seconds`), chosen in slice 1. Each run compares against its own
  first observation.
- Slice 2 changed that contract from one `--path` list applied to every ref
  to `--ref REF` (the ref's object) or `--ref REF:PATH` (that path on that
  ref), so the supplier's branch is watched whole beside paths on the target
  (G2).
- Slice 1 accepted proof: the focused test (10 tests) and the payload
  declaration and installation checks named in its return; refactor pass
  complete.
- Slice 3 accepted as a records-only change (findings and seed): the seed's
  Evidence moved to the findings, whose retired-profile statement already
  covered the fourth bullet. The check's counting rules (which requests count
  as re-entries, rounding a started five minutes up, cached share summed over
  the re-entries) are the slice's reading of the story's criterion.
- Refinement: not needed; three slices, each one outcome and one proof loop.
- Remaining slice-specific concerns: none identified in this review.

## Story obligations

### G1. A second fetch in the watching checkout can end the wait early
Reported: slice 1 — "Another process fetching in the same checkout between its fetch and its `rev-parse` could cause a spurious publication result. The cost is one extra judgment and a rerun."
Story clause: "at no other time"
Disposition: no user cost "the unchanged wait costs almost no model work": `FETCH_HEAD` belongs to one worktree, and the holding coordinator runs no command in it while it awaits the wait (the other fetching scripts run only inside coordinator operations), so nothing reaches the window in a watch; if something did, the wait ends once, the unchanged agreement keeps the hold, and the rerun continues to the same deadline.

### G2. Paths narrow the supplier's branch as well as the target
Reported: slice 2 — "`--path` applies to every `--ref`. The one command the guidance prescribes therefore watches the two homes on both the supplier's branch and the target; a push to the supplier's branch that touches neither home does not end the wait."
Story clause: "ends with one result on a publication or at the deadline"
Disposition: proved by slice 2: Distribution/tests/skills/dough-execute-plan/wait-for-publication.test.mjs "a supplier branch watched whole beside a path on the target stays silent across an unrelated push to the target, and a push to the branch touching no watched path ends the wait naming that ref"; the guidance command in wait-for-proof.md#watch-a-paused-supplier names the supplier branch whole and the target at its two homes.

### G3. A publication between a result and the rerun's first observation is not reported by the rerun
Reported: slice 2 — "Each rerun compares against its own first observation, so a publication landing between the result and the rerun is seen only by the judgment in between, not by the rerun."
Story clause: "the watch continues to the same deadline"
Disposition: no user cost "the unchanged wait costs almost no model work": the window is the seconds between the coordinator's judgment and the rerun's first fetch; a publication inside it leaves the watch silent to the same deadline, where the execution stops with its recorded resume condition and the next entry judges the supplier, which is what a hold without a watch does today. The retrospective found the window is the whole judgment, not seconds; the correction SEED-368#report-a-publication-made-during-supplier-judgment (plan 637) owns it.
