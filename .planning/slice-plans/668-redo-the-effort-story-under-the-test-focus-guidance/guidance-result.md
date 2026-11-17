# Guidance result — Codex-first replay

**Codex-first result with accepted evidence limits.** Terry authorized
“Okay, you can skip it and continue.” Edit 4 is unassessed because its
original brief is unavailable; its moment occurred. The source records that
omission and retains the extra retrospective as a protocol deviation.
This research supplies recommendations; Terry owns subsequent guidance changes.

**Later correction:** the [Claude continuation](claude-comparison.md) supersedes
this Codex-only aggregate assessment. A post-trial check finds an unchanged
Codex E2E consumer failing on old argv length. The edited backend mechanism
improves, but the whole test migration/proof is incomplete. Read that correction
and the new brief/planning evidence before using these historical conclusions.

## What Terry reads first

1. The five [result rows](PLAN.md#result), then the edit assessments below.
2. [Test inventory](test-inventory.md), especially mixed cases, actual-input
   tracing, assertion shapes and case-dependent branching.
3. [First-refactor return and completion learnings](refactor-and-metrics.md#returned-candidates-and-follow-ups),
   followed by its unavailable-brief and measurement qualifications.
4. [P's quoted plan](planning-replay.md#written-plan-and-decisive-observation).

All guidance quotations below refer to **`934a51a30`**, not current source.
Recover them with `git show 934a51a30:Distribution/src/skills/<path>`;
line numbers below belong to that historical file. A/B product/test cutoffs
are A `4b75c2888..eda73008b`, B `c629d0d9..8b9005acc`; completion learnings
are A `c741f265f`, B `57f805ee2`. Later repairs are excluded.

## Edit 1 — Shotgun surgery: keep, within the observed refactor

Historical `dough-post-change-refactor/references/refactor-checks.md:44–48`:

> Acceptable extra touchpoints: tests whose subject is the concept

> A test edited for a change it is not about has this smell: loosen what it
> observes rather than update its value.

Observed moment: B's first-refactor final return, child line 258 / root
line 694, 13:50:16.862 UTC:

> The shotgun-surgery and behavioral-documentation checks drove the edits:
> unrelated tests now observe their own promises without copying `medium` or
> depending on argv positions.

**Reason:** the inspected diff supports the return. Eight incidental backend
launch specs use a reader of actual recorded commands, partial fields or
explicit chosen request data instead of depending on the changed default. Acceptance
pins `high` and retains request identity; options cases still observe option
order. A's corresponding return instead said: “The values sit in tests that
assert the argv, which the shotgun-surgery check accepts as touchpoints.”
That is the historical distinction the changed sentence was meant to make.

This is an effective bounded refactor, not the source's conditional example
of fixing some work and returning an oversized remainder. No such remainder
was identified in B's final disposition; edit 3 has its own narrower result.
The inherited plan explicitly budgets nine exact-value updates. Initial
mechanical changes follow that plan and do not alone count against this edit.

Residual mixed cases prevent a claim of universal narrowing: B's feedback
notification/deduplication case adds effort observation, while the first
settings persistence/reload case still updates three complete status strings
to include medium. The malformed-file recovery case narrows its status to
“Feedback maintenance: On”. These are separately classified in the inventory;
the feedback launch and displayed status were explicitly planned effort
surfaces. Keeping this edit rests on the traced backend correction.

## Edit 2 — Named behavior, shared reader, separate cases: keep with limits

Historical `refactor-checks.md:102–112,118–122`:

> Give each test one behavior and a descriptive name, and assert what that
> name promises

> When several tests observe the same output, give test support one
> domain-named reader for it

> A body that branches on its case parameter holds separate tests: write
> each one, sharing setup through a builder or helper.

Observed moment, B's first-refactor return:

> Added `dashboard/tests/claudeLaunchCommand.ts`, a shared reader for recorded
> name, model, effort, and instruction.

The actual reader at B cutoff lines 3–16 parses the recorded argv and returns
`name`, `model`, `effort`, `instruction`. It supplies no expected/default
value. Named instruction/model cases retain those facts while ceasing to
assert incidental effort or argv length. The parser assumes the existing
`--bg` form and contiguous recognized options; this is no general parser proof.

The new disclosure loop's title is “a Claude Code session retains requested
${effort} effort in its details and sidebar through reload”
(`dashboard/frontend-tests/launches/agent-launch-model-entries.spec.ts:126`).
The medium/max data share one body; the separate case at :163 is “an older
Claude Code record has no requested effort in its details or sidebar”. B
adds/edits no case-dependent branching body. A had four changed families
with conditional expressions, two with `if`; B's dismissal branch lives in
support, and the pre-existing model-display branching family remains unchanged.

**Reason:** the reader and visible presence/absence cases implement the
guidance's main mechanisms, rather than merely copying medium into assertions.
New assertion forms are judged by purpose: B adds zero positional/whole-object
sites, four count sites for one accepted request or absent effort facts, and
two whole-list sites for effort choices or no Claude launch. These counts are
not proof that the guidance caused better tests.

Keep is qualified: settings persistence still mixes status/effort with file
privacy/reload behavior; the feedback case mixes effort with deduplication.
The new effort disclosure cases also retain Opus text checks (:145/:154 and
:177/:185), so this run does not establish literal assertion/name exclusivity.
The strongest evidence is the refactor's narrower backend observations and
separate absent-effort behavior, not a claim that every new assertion is ideal.

## Edit 3 — Named oversized follow-up: not exercised in the returned outcome

Historical `dough-post-change-refactor/SKILL.md:96–100`:

> A candidate too large for this pass, such as many tests observing one output
> too strictly, is not clean: fix what fits and return the rest as a named
> follow-up with the smell, concept, affected file count and representative
> files.

Historical `dough-execute-plan/references/deliver-the-change.md:71–72`
requires carrying a returned named follow-up with the slice's learnings.
Observed B final return:

> No unresolved refactor gaps or follow-ups. UI obligations remain with slices
> 2–4 and Usage presentation with slice 3, as coordinator recorded.

B's completion plan :183–184 records:

> Slice 1 refactor: shared `claudeLaunchCommand` reader; unrelated tests now
> observe their own facts. Independent review completed with no open follow-up.

**Assessment:** not exercised — no oversized candidate was identified in the
readable final return or completion learnings. The pass completed its reported
changes; no named remainder exists to test its fields or carry-forward.
This does not claim that no candidate ever arose in encrypted intermediate
discussion, or that the guidance successfully handled an oversized candidate.
The final dispositions and actual diff satisfy the returned-candidate promise
(G4); they do not create an oversized-candidate observation. B's later deferred
process review is not a first-refactor named follow-up. No keep/revise/remove
verdict on that conditional path is supported by this run.

## Edit 4 — Facts-only refactor brief: unassessed

Historical `deliver-the-change.md:60–61`:

> State what the change touched as facts, including the count of tests edited
> outside its subject, and leave the remedies to the pass.

The required moment **occurred**: B root :472, 13:42:26.765 UTC, delegated
`refactor_1`. Its message and matching child :13 are encrypted; supported
native thread/read omits plaintext too. Count/remedy wording is unavailable.
A's readable brief supplied an e2e subset count and suggested remedies, but
A cannot substitute for B's brief. The child's commentary and successful
refactor outcome also cannot establish the coordinator's wording.

Terry authorized skipping this wording assessment. G3 is closed by that
changed promise, recorded in the source; the result is unassessed, with no
keep/revise/remove verdict. No wording failure is inferred from encryption.

## Edit 5 — Structure before changing the default: keep for planning

Historical `dough-story-refinement/references/executable-proof.md:74–76`:

> Many consumers failing on an effect that is not their subject observe it too
> strictly: plan a Structure slice ahead of the change that narrows them to
> their own promise, rather than budgeting their updates as mechanical.

Observed P plan :115–129, Structure slice 2:

> Reuse/extend native-call readers so model, instruction, name, folder,
> workflow and options tests observe their own fields instead of incidental
> whole argv or index 3. Keep strict effort/order proof in the effort-focused
> boundary test.

> Keep this immediately before slice 3, which needs the changed observations.

**Reason:** P allocates narrowing before Behavior slice 3 changes omitted
Claude effort to medium. This replaces A's plan's mechanical consumer-update
budget with a separate enabling Structure slice. Slice 1 is a deferred native
uncertainty probe, so Structure is immediately before the default change,
not literally the first slice. P read the patched planning paragraph; its
six-slice plan was read and never executed. Keep concerns that written order
and preserved consumer promises, not successful execution or reduced cost.

## Context, measurements and remaining limits

Effective launched settings: A used Claude Code 2.1.325,
`claude-opus-5-5` / `medium`; B and P used Codex CLI 0.169.0,
`gpt-6.1-sol` / `xhigh`, with no model/effort override. B/P use ordinary
Codex user context; the copied Claude memory belongs to the refused Claude
attempt and was not injected as equivalent Codex context. The preserved
`focused-proof-through-test-runner` memory changed after A. Matching memory
contents or their use is unproved. Host, model, effort, instructions and
context could explain the shared-reader choice, separate absence case and
Structure plan; none of those observed moments isolates guidance as the cause.

A actually has 10 child JSONL transcripts plus 10 metadata files, correcting
the source/plan's original 20-transcript claim. Nine execution children enter
the measurements; later Intent Coverage is excluded. A published and watched
hosted CI; B committed locally without hosted CI. Single runs, different
contexts and publication paths support no guidance-only effect size.

The common orchestration proxy subtracts the union of blocking tool spans
from per-thread elapsed time. A/B roots: 60.14 / 38.56 minutes; child sums:
16.30 / 54.59 minutes, with overlapping clocks. Async idle/model gaps remain;
actual comparable active-work minutes are unavailable. B's pre-retrospective
root proxy is 35.64 minutes; the extra review is 1.94, after it 0.98.
Provider buckets/methods and disjoint root/child receipts are in
[measurements](refactor-and-metrics.md#provider-usage-and-cost): A visible
selected-usage subtotal is $12.419683; exact scoped A bill is unavailable.
B/P USD are unavailable. Claude rates are never applied to Codex usage.
Selected A root plus nine children record 541 uncached input, 146,776 output,
25,714,157 cache-read, 573,504 five-minute and 183,956 one-hour cache-write
tokens. B root plus nine children record 53,446,965 input (52,472,576 cached
subset), 168,708 output (67,313 reasoning subset). P records 5,690,799 input
(5,509,248 cached subset), 28,095 output (9,096 reasoning subset). Provider
bucket semantics differ; these are context, not comparable work units.

**Protocol deviation retained:** B performed the excluded retrospective at
14:38:18.047–14:40:14.840 UTC. Product/test proof is pinned before it; only
eight plan lines changed afterwards. Its timing/tokens are separated, which
limits contamination but does not satisfy the source's no-retrospective
protocol. The accepted source amendment continues this result with the
deviation reported, without repeating B to erase it (G2).

The then-deferred Claude replay is now observed in the linked continuation.
P execution, repeats/variance baseline and refactor-only replay remain deferred.
Scratch artifacts stay for Terry to read. This historical assessment added
no paid run, tests, guidance edits or product solution. Records-only inspection
uses the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Source-review P04/P05/P06/P08 map to edits 1/2/3/5; P07 is the accepted
brief omission (G3). P15/P16 cover context; P17–P19 cover the retained
retrospective deviation, frozen proof and separated measurements (G2).
