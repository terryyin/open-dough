# Tests protect their own behavior without incidental coupling

**Source:** [selected story](../../seeds/SEED-393-test-quality-learning-from-effort-replays.md#tests-ignore-unrelated-launch-changes-without-losing-proof)
**Source review:** [independent source promises](source-review.md)
**Identity:** SEED-393#tests-ignore-unrelated-launch-changes-without-losing-proof

## Goal and scope

Clarify the existing refactor checks so a test’s own name determines its
subject and a newly added promise gets its own test. Preserve strict
format/default owners, positive witnesses and the existing case-branch rule.
Only source guidance changes; no current product/test repair or release.

## Accepted proof amendment

2026-11-17: Terry replied “as recommended” to skipping the full redo and
retaining the wording as a reviewed clarification. The previous Claude redo
took 104.49 minutes; the two-sentence delta targets already observed
misreadings, while one full replay would not isolate its effect. Acceptance
is the six-example review and payload link check already delivered in slice 1.
No new native run or smaller blind comparison is selected. Improved agent
behavior and effort savings remain unverified. The paid-run and assessment
slices 2–3 are removed, not marked done. Their preparation and input conflict
are recoverable in Git at `56856821c` and [redo evidence](redo-launch.md);
no participant launch, trust change or guard occurred. Scratch resources are
owned temporary preparation and may be retired at wrap-up.

## Existing solution and constraints

The existing `dough-post-change-refactor` refactor checks remain the one home;
test optimization’s links need no edit. Source-only publication follows
ADR 0004 (release delivery) and ADR 0006 §3 (one home). No native comparison
claim is made under ADR 0005; ADR 0010 bounds this outcome to clarification.
Only `Distribution/src/skills` changes; installed copies await a later release.

## Execution context

Established execution: Julia-chan, publisher
`dashboard-territory.local-open-dough`, Story Branch Mode, owned workspace
`/Users/terryyin/git/open-dough/.worktrees/tests-protect-their-own-behavior-without-inciden`,
branch `codex/tests-protect-their-own-behavior-without-inciden`.
Starting revision `4eb4f8e594ee003a2894c28c8ab2600e1c42b835`;
published claim and initial candidate
`c35afa491790aa019d47efef8f3e376fa8ba94fa` accepted on `origin/main`.
Ordinary increments publish to the same branch on `origin`; no trunk landing
is selected. The claim’s trunk CI is unobserved by this execution.
The originating/integration checkout is `/Users/terryyin/git/open-dough`;
its state is not a prerequisite for this owned-worktree execution.
Checkout setup: `PATH=/opt/homebrew/bin:$PATH npm ci` with unchanged
`package-lock.json`, then `PATH=/opt/homebrew/bin:$PATH npm run --silent lint`
passed on 2026-11-17.
CI: GitHub Actions `terryyin/open-dough`, verified workflow `ci.yml` (CI,
351271804), execution branch target above. Codex yielded stream:
prior observer `/tmp/dough-ci-501/watch-yGKWFz` stopped with confirmed exit;
current coordinator `julia-tests-focus`, directory `/tmp/dough-ci-501/watch-JTnQUS`,
PID 622, session 89761, cell `g764:10`, checkout as above; runtime is this
checkout’s `.agents/skills/dough-execute-plan`. No other observer is owned.
Replanning: preserve the existing plan’s planning authority; no override.

## Proof ownership

| Promise | Observable proof |
| --- | --- |
| Own-name subject and new-promise separation | Slice 1: settling sentences walked over frozen B feedback, status and chosen-model diffs. |
| Branches, strict owners and witnesses stay | Slice 1: unchanged sentences and key examples 4–6 inspected. |
| Reviewed clarification, with no behavioral gain claim | Amended story and this plan name the unverified effect; no native run. |

## Ordered slices

Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Local gate: existing payload link check only, then coordinator
selective formatting and commit hook. No E2E or redo is selected; any future
heavy local proof still follows the AC-only `caffeinate -s -i` guard in
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).

### 1. A test’s subject is its own name, and an added promise gets its own test
Type: Behavior
Status: done
Proof: key examples 1–6 reviewed against the text; payload declaration/link
check passed; independent refactor returned clean; selective formatting and
check-only commit hook passed. Publication `c9b39e4b8300ec00a9cff1b95b659d44d8a22209`.

Behavior: the existing refactor-check paragraphs instruct separate tests for
new promises and ownership by each test’s own name, preserving strict owner,
witness and case-branch guidance. This is textual acceptance, not observation
of an agent producing better tests.

## Slice 1 accepted evidence

Frozen B inspected at `c629d0d93..d8efcf6fb`; candidate wording is the
uncommitted source diff over the claim. Each source key example maps below.

| Example | Settling instruction and observation |
| --- | --- |
| 1, feedback | “Give a promise the change adds its own test … do not add it to another behavior’s test or widen that test’s name or header.” Rejects the added effort assertion/header in `feedback-maintenance-launch.spec.ts`’s attention-report notification case. |
| 2, status | Same sentence requires a status-effort case instead of three complete effort strings in `system-settings-feedback-maintenance.spec.ts`’s persistence/privacy/reload case. |
| 3, model | “Its subject is what its own name promises, not its file, header or plan row” and “observe that part” reject medium, length 7 and effort fields in chosen-model cases of `agent-launch-model-boundary.spec.ts`. |
| 4, blank input | Same subject/partial-output rule preserves the actual argv reader’s absent-instruction assertion in `agent-launch-ad-hoc-boundary.spec.ts`; frozen B already did this correctly, so no extra instruction was added. |
| 5, branches | Existing “A body that branches on its case parameter holds separate tests” already requires splitting edited Cancel/Escape cases. Older unedited display loop is residue, not new scope. |
| 6, owners/witnesses | Existing whole-shape/default owner and positive-distinguishing/absence sentences are unchanged; the first launch-boundary case keeps complete argv. |

`node .agents/skills/dough-execute-plan/scripts/slice-clock.mjs run --log
/tmp/seed393-slice1-proof.log --exit-file /tmp/seed393-slice1-proof.exit -- env
PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh
Distribution/tests/installation/payload-declaration-links.sh` passed, exit 0.
Setup: existing payload declaration and mutation copies; observing signal:
`check_declared_links` plus undeclared-target rejection checks. This proves
payload link structure, not agent behavior. No test source changed.
Consumer trace: `/tmp/seed393-slice1-consumer-trace.md`; source skill and
test-optimization entry links retain the single home; installed copies await
release; incidental phrase matches and frozen command fixtures do not consume
changed text. Invocation and required project inputs remain unchanged.
Source freshness: unchanged at trunk `3ecf64459`; incoming FollowUpBuilder
and story-5 environment preparation do not affect this slice or a named
coordination sibling’s behavior. Independent refactor `/root/refactor_slice1`:
`## REFACTOR COMPLETE`, none — already clean; no edits, unchanged proof reused,
`git diff --check` passed. Slice clock paused at 3.3 active minutes.
Improved agent application remains unverified under Terry’s accepted proof amendment.

## Story obligations

### G1. Blind redo proof withdrawn (first reported in removed slice 2)
Reported: slice 1 — "No paid native launch occurred; exact frozen input contains nested launcher code targeting frozen B’s old path. The proposed task-only prompt is unselected; native trust and no-competing-paid-run checks also remain unmet."
Story clause: "The guidance change is judged by a fresh B redo of the frozen effort execution against frozen A."
Disposition: owner changed "No new native redo or blind comparison is required."

### G2. Desired agent outcomes remain explicitly unverified
Reported: slice 1 — "The amended source-only reviewer lists desired example outcomes 7–17 separately from observable guidance requirements; no new native observation establishes those outcomes."
Story clause: "its effect on agent behavior remains unverified."
Disposition: owner changed "No new native redo or blind comparison is required."

## Retrospective

Automatic product and process review completed in the execution coordinator’s
real conversation. Related manifest: `c9b39e4b8` guidance/proof;
`56856821c` redo preparation; `c35afa491` claim provenance. Other trunk
preparation and FollowUpBuilder work are unrelated. The source amendment is
Terry’s “as recommended” acceptance; no source restriction is silently waived.
One-home/source-only constraints (ADR 0004, 0006) hold; ADR 0010 limits this to
a delivered clarification, not observed improvement. No product defect or
correction plan found. No E2E test drove this prose change; no automated test,
assertion or discovery path changed, so Intent Coverage has no protection risk
to check. Existing test boundaries are unaffected.
Process: DD-562 records unused replay preparation before the proof-cost/value
reassessment, with the 8.2 active-minute setup and frozen 104.49-minute run as
qualified evidence. No total savings claim. No product/backlog recommendation
beyond the already accepted proof amendment; no follow-up execution selected.
Current branch CI remains pending until the completion receipt.

## Execution complete

Product advice: keep the source wording as a reviewed clarification. Improved
agent behavior and effort savings remain unverified; no native redo or blind
comparison is required under Terry’s accepted amendment.
