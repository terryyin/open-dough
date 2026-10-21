# Judge CI evidence reuse by its later product consequences

**Identity:** SEED-010#evaluate-later-product-consequences
**Source:** [Selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#evaluate-later-product-consequences)

## Goal and scope

Give the developer and maintainer a supported retain, adapt, reject, or
continue-observing decision about the CI evidence reuse delivered on
2026-10-14 to 16 and first released in 0.3.62 and 0.3.63: retained CI history
coverage for registered revisions, exact-commit validation reuse at
integration (plan 306), and coalesced CI validation with opt-in
integrated-state completion (plan 307), with its pre-release correction (plan
308) and Donut's isolated adoption proof (plan 309). The claim under test is
that reusing existing CI evidence reduced expensive CI executions and waiting
without materially worse correctness, test confidence, or next-change cost.

Judge the story's bounded sample only: plan 308's findings and execution
record; plan 309's Donut burst table and product advice; Pygardon's DD-308 as
[ODF-320](../../../docs/maintainer/findings/ODF-320.md); the 0.3.66
corrections `75958eca` and `27a67521` with their unit cases and the Codex
session that produced them; [DD-302](../../../ProjectFindings.md#dd-302) and
the two CI-observer test races the 0.3.64 release notes record; the process
occurrences on plans 307 to 309 in ODF-254, ODF-255, ODF-256, ODF-169 and
ODF-074; the 0.3.62 to 0.3.67 `CHANGELOG.md` entries; this repository's
`main` CI run outcomes for 2026-10-08 to 21; and the read-only adoption state
of the local Pygardon and Donut checkouts. Newer events do not enlarge it.

Write the compact result as a follow-up in
[the existing research report](../../../docs/maintainer/empirical-process-control-research.md),
linking evidence rather than copying it. Count avoided CI job executions and
added test job-seconds where the record states them; mark unmeasured human
time, money and tokens unknown. Separate conservative consequences (stuck or
delayed completion, repeated advisories) from unsafe ones (a success the
evidence did not support), and say for each later correction whether the
record shows it observed in use or found by review. Use the architecture
scenario "when a provider coalesces differently, is the adaptation local to
its adapter or shared?" and test effectiveness only where they bear on the
claim. Record this evaluation's own effort from available evidence.

No runtime guidance or code change, quality dashboard, scoring system,
complexity ratio, token counter, measurement service, fresh paid CI burst,
native host run, release, rollout, change to another repository, new process
finding without support, or implementation of a supported adaptation is
planned. ODF-320's ownership decision and the clients' normal rollout stay
with their owners. The completed sample stories stay completed.

## Existing solutions and architectural direction

PFE: the research report already hosts the maintainer's bounded assessments
and carries the decision-oriented measures menu and the "include later
effects" principle this story applies; its two 21 October follow-ups set the
compact follow-up form. The finding homes own each consequence's provenance
and the retrospective's
[real-record review](../../../src/skills/dough-execution-retrospective/SKILL.md#review-process-only-from-a-real-record)
owns how native history may be read; the sibling story 4 evaluation in
ODF-139 shows evaluation rules fixed before scoring. Reuse all of them; no new
record, registry or measurement mechanism is needed.

[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
asks for value and low-cost change over a single cost metric and for
mechanisms to justify their burden. [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
keeps implementation, release and adoption distinct: `git tag --contains`
fixes each change's first release. [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
keeps controlled proof distinct from ordinary use and retains compact findings
rather than raw artifacts. [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
keeps this analysis in maintainer records. The ADR index agrees with these
Accepted statuses. The [North Star](../../NORTH-STAR.md) topics concern the
dashboard and launches; this assessment adds no direction there and needs no
ADR exception.

## Preparation observations and execution inputs

Observed read-only on 2026-10-21 in the established preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/evaluate-an-improvement-against-its-later-produc`
at `8d8c2ded95e4d793870d76f69ac5eb8fec14fe52`:

| Premise / consuming review | Literal observation | Result and limit |
| --- | --- | --- |
| The original promises and completion records are recoverable. | `git show 09e7b429^:.planning/slice-plans/306-reuse-ci-validation-at-integration/PLAN.md`, `git show 5145f435^:.planning/slice-plans/307-coalesced-ci-validation/PLAN.md`, `git show b4cae932^:.planning/slice-plans/308-integrated-state-correction/PLAN.md`, `git show 1e1dbc55^:.planning/slice-plans/309-donut-coalesced-ci-adoption/PLAN.md`, and the seed sections at the same parents | All four plans print with Goal, findings or proof, and `## Execution complete`. Plan 308's findings state 547/349/604 CI job-seconds against the 710 ceiling and about 80 job-seconds of journeys; plan 309's burst table shows pushes B and D cancelled with 0 jobs, C failed on an external flake, and E validated. Plan 306's `EVIDENCE.md` and `CUSTOM-CI-EVIDENCE.md` sit beside it at `09e7b429^`. |
| Each change's first release is fixed. | `git tag --contains <sha> \| sort -V \| head -1` for `09247d6c`, `500802fb`, `1d9239c2`, `d429430a`, `75958eca` | `v0.3.62`, `v0.3.63`, `v0.3.63`, `v0.3.63`, `v0.3.66`. Donut commit `7e443633` is in no tag here: it lives in Donut's unpushed branch. |
| Later consequences exist with provenance. | `cat docs/maintainer/findings/ODF-320.md`; `sed -n '/<a id="dd-302"/,/^<a id=/p' ProjectFindings.md`; `grep -n "DD-305\|DD-306" DearDough.md`; `git show 75958eca --stat`; `grep -n '^test(' src/skills/dough-execute-plan/scripts/ci-inherited-evidence-refresh.test.mjs` | ODF-320 retains Pygardon DD-308 of 2026-10-20 (release unknown; a replaced head stays `undiscovered`, repeated advisories). DD-302 links its evidence file. DD-305/306 are ODF-256 and ODF-169. `75958eca` touches three modules and adds one 138-line test with five cases: nearer retained failure replaces inherited success, disappearing evidence withdraws inherited completion, nearer failure outranks a running ancestor, exact candidate precedence, provenance kept. |
| The 0.3.66 corrections' origin is readable. | `grep -rl "refresh inherited evidence" ~/.codex/sessions`; then the Python below on `rollout-2026-10-20T08-35-32-01a15685-3237-7941-989b-f9e586a786e2.jsonl` | Four Codex records of 2026-10-20 match. Line 15 (`2026-10-19T23:35:39Z`) is the instruction: a recheck of Pygardon's CI evidence readiness against Open Dough 0.3.65 reproduced three inherited-coverage defects in an isolated A → B → C metadata-only history, including `recordedCompletion` still returning `success` after B gained a retained failure, blocking a Pygardon story. This was found by a recheck, not reported as a wrong verdict in live use; the 984-line record carries the rest. |
| Exposure in this repository and the clients is observable. | `gh run list --branch main --limit 200 --created '>=2026-10-08' --json conclusion,createdAt` grouped by day; `grep -n "concurrency\|reuse\|integrated" .github/workflows/ci.yml`; `git -C /Users/terryyin/git/doughnut log --oneline -3 -- .github/workflows/ci.yml`; `git -C <client> branch --list 'dough/coalesced*'`; `grep -c DD-308 /Users/terryyin/git/pygardon/DearDough.md` | 153 runs, none cancelled; `ci.yml` has `paths-ignore` only, no concurrency group or reuse gate, so coalescing is unexercised here. Donut's workflow has no concurrency group; both clients still hold the unpushed `dough/coalesced-ci-candidate` branch; Pygardon's own CI runs only the newest head and its log names DD-308 twice. Client checkouts are read-only inputs, never write locations. |
| Current trunk CI timings are an optional route. | `bash scripts/ci-test-times.sh` (read-only through `gh`) | Not run in preparation. It reads only the last ten successful runs' retained artifacts, so the 2026-10-14 to 16 job-seconds come from plan 308's findings; the script can only supply today's baseline. |

Literal session-reading observation (run with Python 3 in the named checkout):

```python
import json
from pathlib import Path
source = next(Path('/Users/terryyin/.codex/sessions/2026/10/20').glob(
    '*01a15685-3237-7941-989b-f9e586a786e2.jsonl'))
rows = source.read_text().splitlines()
print('session lines', len(rows))
for n, row in enumerate(rows, 1):
    event = json.loads(row)
    value = event['payload']
    if value.get('type') == 'message' and value.get('role') == 'user':
        text = ' '.join(c.get('text', '') for c in value.get('content', []))
        if not text.lstrip().startswith(('#', '<')):
            print(n, event['timestamp'], text[:900])
            break
```

Execution reuses every source read-only. If a native record or client
checkout disappears, retain the gap and stop only the dependent claim; do not
replace the sample. All new writes belong to the workspace established by
execution startup.

## Outside-in proof ownership

All promises belong to slice 1 and its one evidence-to-decision review loop:

| Promise | Observable proof |
| --- | --- |
| Example 1: initial benefit counted with its limit | The follow-up cites plan 309's burst rows, counts the avoided job executions from them, and places plan 308 and the post-release corrections beside that count before any judgment |
| Example 2: later defects classified against the original promises | ODF-320 is classified conservative with its evidence; the 0.3.66 scenario is classified from its tests and the session instruction (reproduced by a recheck, stale success verdict), with live-use occurrence stated unknown |
| Example 3: test effectiveness judged by detection and cost | The follow-up names, for plan 308 finding 3, DD-302, the 0.3.64 races and the 0.3.66 cases, which wrong or stuck verdicts retained proof detected or missed and the job-seconds the record states; no coverage or journey count stands in for confidence |
| Example 4: changeability as a diagnostic | The follow-up lists the modules, tests and plan slices plan 308 and `75958eca`/`27a67521` touched and the ODF-255 seam, and answers the adapter-versus-shared scenario from ODF-320's open ownership question, without a score |
| Example 5: exposure labelled per project | The follow-up states this repository's uncancelled run count, Donut's missing concurrency group, the unpushed candidate branches and Pygardon's native coalescing, and labels absent exposure pending |
| Example 6: decision with confidence and next observation | Retain, adapt, reject or continue observing is stated with counterevidence, this evaluation's own effort, and one named next observation and owner; no initial-metric improvement claim survives materially worse correctness or next-change cost |
| Re-review adds no occurrence or work | Repeat interpretation of the same records yields the same follow-up; no finding row, story, release, rollout or reopened story follows |

## Ordered slices

### 1. Judge the reuse improvement from its later consequences
Type: Behavior
Status: done
Proof: A maintainer can trace every claim in the follow-up to a named plan
revision, finding, commit, release tag, run row or session line, reproduce
the exposure and session observations above, and read a retain, adapt,
reject or continue-observing decision without mistaking missing exposure or
unmeasured cost for success.

Behavior: Given the fixed revisions, original promises and bounded sample,
when the maintainer evaluates the improvement against its later consequences
→ the research report gains one compact follow-up that reports the observed
benefit, each later consequence with its provenance and classification, the
two diagnostics where they bear, the stated and unknown costs, and the
supported decision with its next observation.

Read the original promises from the recovered plans and seed sections before
judging any consequence. Reconcile each consequence with its current finding
home; use execution-time guidance when judging historical behavior and
current guidance when recommending. Keep observations, causal hypotheses and
recommendations distinct. Change no finding, watch, story or client record;
a supported adaptation is advice naming its owner. Perform the execution
workflow's post-change refactoring and delivery gates. Validate changed
Markdown links and `git diff --check`; no application test suite is required
for an analysis-only edit. If execution finds that a runtime change is
necessary to fulfil this outcome, stop and revisit scope instead of adding
implementation.

Accepted proof (2026-10-21): the research report gained
[the follow-up](../../../docs/maintainer/empirical-process-control-research.md#later-product-consequences-follow-up)
recording continue observing with low confidence. A fresh source-only review
of the story section returned its commitments; each was compared with the
follow-up, and the coordinator rechecked plan 309's burst rows at
`1e1dbc55^`, the 37 `src` files of `f6037523^..7740842a` with `d170afb1`,
the DD-302 anchor and ODF-254's extra round. Proof commands: a relative
Markdown link check over the section (0 bad links), `git diff --check`, and
`npm run lint`. Execution reproduced the preparation observations except
that `grep -rl "refresh inherited evidence" ~/.codex/sessions` now matches
five 2026-10-20 records, not four; the selected session and its line 15 are
unchanged and the sample was not enlarged.

## Execution complete

Product advice: no change to the backlog. The follow-up's decision is
continue observing; its next observation (the first Pygardon execution after
an authorized integrated-state rollout in which CI replaces a delivered
commit) belongs to [ODF-320](../../../docs/maintainer/findings/ODF-320.md)'s
existing follow-up and Pygardon's own rollout, so it needs no new story.

## Current decisions

- One Behavior slice: evidence reading, classification, diagnostics and the
  decision form one proof loop with no independently useful part and no
  Structure. The sample is bounded by named records; no supplied numeric
  slice target or hard limit was found, so none is invented.
- Preparation authorizes no execution. The eventual execution instruction
  owns the assessment and its ordinary delivery.
- Native and client history is not copied into the repository; the follow-up
  retains compact conclusions and locators. The spent plan follows normal
  wrap-up cleanup and Git recovery.

## Learnings

The 0.3.66 corrections were prompted by a recheck of Pygardon's readiness
against 0.3.65 that reproduced a stale success verdict in isolated history,
not by a wrong verdict reported from live use. This separates "unsafe
consequence found by review" from "unsafe consequence observed in use" before
scoring, and it fixes the first release containing the repair at 0.3.66.

## Plan concern review

Slice-plan refinement was not needed: one bounded outcome has one proof loop,
no cross-slice dependency and no separate structure. This review identified
no remaining slice-specific concerns. Every record the sample names was
reached read-only in preparation; loss of a source at execution is handled
as an explicit evidence gap.
