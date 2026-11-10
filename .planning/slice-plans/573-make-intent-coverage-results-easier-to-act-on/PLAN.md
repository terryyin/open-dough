# Make Intent Coverage results easier to act on

**Identity:** SEED-258#make-intent-coverage-results-easier-to-act-on
**Source:** [Refined story](../../seeds/SEED-258-dough-intent-coverage.md#make-intent-coverage-results-easier-to-act-on)
**Source review:** [Source-only review](source-review.md)

## Goal and scope

A developer can distinguish missing journey proof, a weak assertion and an
inconclusive probe, and choose the next proof action. Evaluate whether reusing
available focused context lowers total check effort before keeping that handoff.
One targeted fault still establishes only the protection observed for its promise.

Include the new verdict, evidence and restoration requirements, optional validated
handoff hints, bounded proof search, and a prospective two-case paired comparison
with decisions and costs. Retain Caught and the existing cost/report finisher.

Exclude opt-in selection, closure joins and follow-up routing, storage/schema or
dashboard changes, historical backfill, repairs to sampled product tests, automatic
token collection, a benchmark framework, installation, release and rollout.
The [closure story](../../seeds/SEED-258-dough-intent-coverage.md#finish-opted-in-stories-with-intent-coverage)
owns report persistence/disposition. Reconcile its shared Wrap Up edits; do not
require its completion to start this independent checker/handoff work.

## Existing solutions and architectural decisions

PFE responsibility: return actionable evidence for one promise at justified cost.

- Change `src/skills/dough-intent-coverage/SKILL.md`, the existing owner of target
  selection, scratch checks, verdicts and reporting. Its current selection assumes
  a maintained assertion exists; permit nearest relevant checks plus an independent
  scratch witness for a missing path. Do not make absence itself a confirmed gap.
- Change only the request context in `dough-story-wrap-up/SKILL.md`. It already
  supplies story/plan/revision and prefers a plausible review gap. Pass available
  proof hints without making the caller rediscover missing ones or moving probe
  mechanics into closure. Explicit manual requests remain valid without hints.
- Reuse `finish-report.mjs`: prepared body passes through verbatim, and the helper
  appends complete invocation-to-report elapsed or an explicit unavailable reason.
  Put additional supported cost observations in that body; no helper API change.
- Completion already stores a free report string and `IntentStoryCoverage.tsx`
  renders it whole. Reuse the existing report/disposition for decisions; no enum,
  parser, schema, new dashboard view or parallel follow-up mechanism is needed.
- Reuse native host execution, `tests/support/native-run-supervise.sh` for bounded
  process ownership, and `native-host-stream.mjs` for available stream facts.
  These support an active trial; do not build a permanent experiment runner.

[ADR 0002 — Lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports those existing owners and reconciliation without a blocking dependency.
[ADR 0003 — Release lifecycle](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
keeps source edits in `src/skills/`, leaving installed copies and release metadata.
[ADR 0006 — Executing-agent guidance](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
keeps project context explicit and rules with one owner; follow
[maintainer guidance](../../../AGENTS.md#skill-authoring).
[ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
separates conventional behavior review from native trial evidence; this trial
claims only its observed host/conditions, not universal cross-tool performance.
[ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
requires the prospective basis, total costs, disclosed unknowns and a keep decision.
Relevant index/in-file statuses agree; no conflict, exception or supersession was
found. `.planning/NORTH-STAR.md` has no governing topic for this local change;
no new consequential architectural direction or topic is needed.

## Outside-in proof ownership

For the candidate guidance, walk invocation context, required context and useful
outcome under the repository's behavior review. Record selected actions, evidence,
verdict and next action, rather than an exact-wording test or a native-use claim.

| Source promise / key example | Owner and distinguishing observation |
| --- | --- |
| Independent wrong navigation, maintained checks omit project-change path | Slice 1: Recently done evidence becomes Confirmed missing test path; name examined checks, transition, baseline and restoration. Reviewer chooses journey proof and recognizes the already-planned correction. |
| Maintained path exercises independently observed wrong behavior but stays green | Slice 1: Assertion gap; reviewer chooses an assertion change, not a missing-journey claim. Preserve fixture/assertion during the fault. |
| Earlier maintained helper catches the fault | Slice 1: Caught names the actual helper and unreached later assertion; do not overstate observed protection. |
| No wrong-behavior observation, unrelated failure, missing reach/baseline/restoration | Slice 1: Insufficient evidence names the missing observation; Side panel stays inconclusive. No matching test alone is insufficient for confirmation. |
| Valid or misleading focused hints; missing command/fixture/assertion | Slice 2: worker validates/revises suggestions, reuses valid work, and performs bounded narrow search for incomplete context; broad exploration is not an automatic fallback. |
| Search-heavy and already-focused paired comparison | Slice 2: actual reports, decision before/after, causal decision delta and preparation/probe costs support keep, simplify or no-change. Both arms retain equally strong proof and restoration. |
| Runtime, elapsed, effort, wrap-up wait and available token observations | Slice 2: report distinct units, endpoints and measured/estimated basis; unknowns have reasons, elapsed/runtime do not imply wait, and no token collector is added. |

Trace changed effects with the installed `consumer-trace.mjs` before accepting each
slice. Include `Insufficient evidence`, `Assertion gap`, selected assertion/reach,
handoff hints and report costs. Give every located caller/test a run, reuse or
evidenced exclusion disposition. Current consumers are the manual invocation,
Wrap Up request, arbitrary-string completion and whole-report rendering. The
last two need no semantic change; re-evaluate if implementation changes that fact.

Use this existing regression when request/report changes reach completion input:

```sh
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh \
  tests/support/product-backlog-complete-intent-coverage.test.mjs
```

When changed runtime links affect dependency closure, run
`PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/payload-declaration-links.sh`.
No new exact-prose tests or dashboard suite is required solely for report wording.
If executable code changes become necessary, first map its actual behavior and
consumers to discriminating proof instead of substituting guidance assertions.

## Decisive premises and observations

Observed on 2026-11-10 in this owned preparation at
`d95199a1f556d3e37b8d3d04c3ec855e76c81d0a`. No product scratch edit was made.

| Premise / consuming operation | Form, result and evidence | Unverified remainder / owner |
| --- | --- | --- |
| Current verdict cannot express independently confirmed omitted journey | Read current checker selection/run/result flow against Recently done report recovered with `git show fe715e5730f2ab3e627517f6b38c7d6eb2683207:.planning/done/SEED-272_select-recently-done-sessions.json`. Its maintained family passed 8/8; faulted independent journey failed on wrong project choice; restored journey and family passed. Current report says Insufficient evidence (reach). | Symptom established by actual retained runs; slice 1 changes classification, not those historical tests. |
| Inconclusive evidence must stay inconclusive | `git show 401bc8bd5d5c12d6d7cd64b43b6763786c59e58e:.planning/done/SEED-268_conclude-fluent-side-panel-pilot.json`: read-only inspection, no baseline/fault/restored run and no wrong behavior observed. | Calibration for slice 1; do not invent a witness from missing test source. |
| Focused handoff can already be supplied, yet setup dominates | `git show d887ac73e87d981dc59bae792543907b2b1bbf45:.planning/done/SEED-285_see-landed-ci-wall-time-history.json`: suggested fault/focused file used; 601531 ms elapsed versus 39.8 s runner time; actual catch was `untilKept`. | Historical timing is exploratory context, not a prospective saving or wrap-up wait. Slice 2 measures new paired runs. |
| Report finisher preserves prepared cost fields without a new API | Piped a smoke body into `node src/skills/dough-intent-coverage/finish-report.mjs`: body preserved, elapsed explicitly unavailable without start. Read the write-then-clock implementation. | No native probe benefit claimed; pass a comparable start clock in actual runs. |
| Completion does not parse verdicts | Retained discriminating CLI observation in plan 572 at `f8dcc87a7`: saved report passed, removal of report persistence failed, exact restoration passed. `git diff f8dcc87a7..HEAD -- src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs tests/support/product-backlog-complete-intent-coverage.test.mjs` is empty. Whole-string rendering remains unchanged; later UI changes only clarify opt-in wording. | Reuse persistence evidence; no new storage/renderer contract is proposed. |
| Historical sample source and observations are recoverable | Read selection spec at `1935f49a58e35557e2026500baf61113351e691e` and pending-proof spec at `9fcff1d9a765df93a6e3f783fcbbfd75b0b17fb6` using `git show`; inputs/assertions match the reports above. | Dependency/browser setup and fresh host execution at these exact revisions belong to slice 2's early paid probe. |
| Native comparison route | `command -v claude; claude --version` returned Claude Code 2.1.321; `command -v codex; codex --version` returned codex-cli 0.167.0. Read existing native supervisor/host adapters. | Presence is not an authenticated run. Slice 2 first validates the selected host/model and exact-revision focused baseline; paid/credentialed execution is deliberately deferred to that authorized probe. |

## Ordered slices

### 1. Return the proof action supported by the observed path

Type: Behavior
Status: done
Proof: Accepted guidance in `src/skills/dough-intent-coverage/SKILL.md` (selection,
run/reach, four verdicts, next proof action, prior disposition). Behavior review
of Recently done → Confirmed missing test path; assertion gap; helper Caught;
Side panel Insufficient evidence. Consumer-trace dispositions: manual invocation
and Wrap Up request reused; free-string completion and whole-report render
excluded as unchanged. Source-review ids 1–12, 30–31, 37–40, 43, 50/50.1/50.3/50.4,
54 observed. Refactor: intro naming aligned to next proof action.

Behavior: Given evidence for one selected promise and fault, when the checker
returns its result, the reviewer distinguishes an omitted journey, a weak
assertion, an actual maintained catch and an inconclusive attempt, and can name
the appropriate next observation or proof change.

- Amend selection, run/reach and verdict rules together. A missing maintained
  path can use nearest relevant passing checks and an independent scratch witness;
  do not require a nonexistent selected assertion before investigating it.
- Keep fault injection separate from fixtures/assertions and require baseline,
  independently observed wrong behavior, exact restoration and restored pass.
  Bound absence to examined checks and preserve all existing scratch safety.
- State the actual next proof action and prior disposition separately from the
  verdict, leaving test repair and follow-up routing with the caller.
- Review the examples against candidate instructions. A report-only reclassification
  is calibration evidence, not a fresh native run or a newly discovered defect.
- Apply post-change refactoring, mapped checks and ordinary delivery.

One common evidence rule selects the verdict according to whether maintained
proof exercises the wrong path and catches it. No special Recently done handler,
new runtime enum, Structure slice or interim behavior is needed.

### 2. Keep a focused handoff only when its paired trial earns the effort

Type: Behavior
Status: done
Proof: Four Claude Code arms under `trial/` (A1/A2 Recently done; B1/B2 Landed CI)
with reports and summaries; `trial/02-comparison-and-keep-decision.md` keeps the
candidate handoff (lower search-heavy effort, equal proof, no focused-case
penalty). Working `src/skills/dough-intent-coverage/SKILL.md` and
`dough-story-wrap-up/SKILL.md` match `trial/skills-candidate/`. Completion
free-string test passed; consumer dispositions: manual + Wrap Up reused;
completion/render excluded as unchanged. Source-review ids allocated to slice 2
observed.

Behavior: Given available review context, when a developer requests a check,
the worker validates and reuses it without broad rediscovery. A prospective
comparison tells the maintainer whether to retain that handoff; a negative or
inconclusive result retains the supported verdict change and settles the trial.

- Begin with the permitted early paid probe: select one available native host,
  record effective model/settings/version, and verify authentication, isolated
  setup and focused passing baselines at the historical sample revisions above.
  Reuse `tests/native-setup.md` and owned process supervision. If the real route
  fails, stop dependent sampling and diagnose; do not replace it with transcript
  replay or claim a performance result. A needed credential is the developer's
  action; ordinary fixture/test defects remain execution's repair responsibility.
- Before sampling or editing the handoff, freeze the current workflow from
  `d95199a1f` and record the candidate, keep criteria, prompts, decisions before
  probes, selected promises/faults, evidence requirements and cost endpoints in
  this plan directory. Preserve existing classification differences explicitly.
  Use the same revision/promise within each pair: Recently done's unanswered-read
  project change for search-heavy, and landed CI's proof-wait walk for focused.
- Use fresh independent sessions, the same host/effective model/settings, matched
  checkout/setup conditions and recorded run order. Current arms use the frozen
  current workflow; candidate arms get available focused context. Do not supply
  expected verdicts or findings. Record warm-cache/order effects and other
  confounds; historical reports cannot replace the current arms' measured costs.
- For each arm retain report, commands, relevant stream facts, restoration and
  decision before/after. Include caller handoff preparation, setup/probe work,
  runner runtime and complete elapsed; separate one-time authoring/evaluation
  costs. Observe extra wrap-up wait only when a real closure join is observed;
  otherwise mark it unavailable. Report human/agent effort with supported basis,
  and comparable tokens only if already exposed, without new collection tooling.
- Trial the smallest candidate: pass available promise/fault/command/fixture/
  assertion hints through the existing Wrap Up request; checker validates/revises
  them and bounds missing-proof search. Preserve the closure story's concurrent
  join, selection and disposition changes. Add no required caller research phase.
- Judge against the seed's criteria: lower total effort from avoided broad work
  or equivalent setup, equally strong proof, no material extra focused-case
  preparation. Record whether any action changed because of the probe. Explain
  unknowns; do not add overlapping times or treat fewer tokens as sufficient.
  Keep the candidate only when supported; otherwise simplify/revert its handoff
  changes and record negative/inconclusive evidence under ADR 0010. An unknown
  effect can settle the trial without becoming a claimed improvement.
- Refactor, check affected consumers and deliver the selected final guidance.
  Keep trial evidence in this active plan for retrospective; wrap-up assimilates
  lasting guidance and removes spent records through ordinary Git recovery.

This is one experiment and keep decision; handoff implementation, its measured
use and disposition stay together. No automatic repeated trials or all-host
benchmark matrix is committed. Reconsider only on new diagnostic evidence.

## Gates and current decisions

- Slices 1–2 implemented in the execution checkout; handoff candidate **kept**.
- Checker skill is 127 lines; Wrap Up remains 250 lines after cohesive request
  prose replacement. Detailed probe rules remain with the checker. Concurrent
  closure sibling has not landed Wrap Up skill edits on trunk since Take.
- Learning: historical Done reports keep prior wording; only new runs follow
  Confirmed missing test path. Paired trial kept focused hint handoff under
  ADR 0010; wrap-up wait unobserved; harness cwd confound noted in trial/02.
- Local gates: mapped behavior review, affected consumer proof, conditional
  commands above and ordinary commit hooks; no mandatory full-suite run for this
  guidance change. For long runs start fully awake: on AC use `caffeinate -s -i`;
  on battery plug in or keep the lid open under `caffeinate -i` and inspect sleep
  logs per [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
- The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  applies as written to every delegation and repair handoff. Shared `makeMe`
  arranges automated domain data; no sleeps, `test.slow()` or suite/hook timeout
  overrides. Deliberate restored scratch faults are probe evidence, not a waived
  failure. Execution owns applicable local and published CI repairs.
- Inspect actual host load/memory and competing work before the native comparison;
  sequence its owned heavy runs and retain host, command, unknowns and the bounded
  run decision. Reconsider on changed conditions or infrastructure failure.
- No project numeric slice limit is supplied. Each slice has one proof loop;
  native setup/external waiting is explicit trial work, not hidden preparation.

## Plan concern assessment

Slice-plan refinement was not needed: verdict/action and empirical handoff retention
are cohesive independent results, with one checker model and mapped proof. This
review found no remaining slice-specific concern outside the permitted slice-2
early paid probe. Native feasibility and benefit are not claimed as observed;
the probe can stop sampling, and a negative/inconclusive comparison is an expressly
supported trial result. No human-owned scope or ADR decision is pending.


## Story obligations

### X1. Deferred promises remain out of scope
Reported: slice 1 — "source review — deferred promises listed as not in this story"
Story clause: "Deferred promises: changing opt-in, wrap-up's join/disposition lifecycle, Done storage or dashboard presentation, repairing sampled product tests, historical report backfill, automatic token collection, general benchmarking, release and rollout."
Disposition: excluded "Deferred promises: changing opt-in, wrap-up's join/disposition lifecycle, Done storage or dashboard presentation, repairing sampled product tests, historical report backfill, automatic token collection, general benchmarking, release and rollout."
Commitment: 34, 34.1, 34.2, 34.3, 34.4, 34.5, 34.6, 34.7, 34.8


### X2. Closure story keeps persistence and follow-up routing
Reported: slice 1 — "source review — closure story ownership of persistence and follow-up routing"
Story clause: "The [closure story](#finish-opted-in-stories-with-intent-coverage) keeps ownership of persistence and follow-up routing."
Disposition: excluded "The [closure story](#finish-opted-in-stories-with-intent-coverage) keeps ownership of persistence and follow-up routing."
Commitment: 35