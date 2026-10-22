# Stop asking for native checks once their question is answered

**Identity:** SEED-010#reuse-native-proof-after-attribution
**Source:** [Story 15](../../seeds/SEED-010-learn-from-execution-retrospectives.md#reuse-native-proof-after-attribution)

## Goal and scope

A developer whose own hands a native check needs is asked for an interactive
round only while that round answers a question the plan or acceptance still
holds open. Once answered, a change that the observed native path renders
unchanged reuses the retained native proof, and the changed detail is proved
at the emitted source. The story's Scope lists the five commitments; this plan
delivers them through the shared proof guidance in `src/skills/`.

Excluded, as the story defers: how a probe is staged (ODF-262 consent
combination, ODF-307 foreground batching); tooling that counts developer
rounds or detects text-only changes; changes to the standalone manual-testing
mission beyond its existing rule not to replay proven checks.

Assumptions: guidance tests check meaning-bearing phrases, not exact sentences
([ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) §2);
the native replay itself is a paid developer-operated run and stays manual,
so the plan's deterministic proof is guidance structure plus a recorded
desk-check of plan 330's inputs.

## Existing solution (PFE)

The responsibility, deciding when a retained observation still covers a
changed candidate, already exists in three places; this plan changes them
rather than adding a file or skill.

- `src/skills/dough-story-refinement/references/executable-proof.md` is the
  shared proof guidance: slice planning reads it from
  `dough-slice-planning/SKILL.md#write-the-plan`, and execution reaches it
  through `planning.md#own-executable-proof` at delegation and acceptance.
  Its "Reuse sufficient evidence" and "Reuse adequate baselines" paragraphs
  state reuse for automated baselines but say nothing about observations only
  the developer can perform, nor about which later changes keep them.
- `src/skills/dough-execute-plan/references/execution-decisions.md#require-current-regression-proof-before-a-live-action`
  already defines correspondence of a retained pass: a relevant change to the
  candidate breaks it, an irrelevant change such as documentation-only leaves
  it intact, and a held correspondence is cited instead of rerun. The new
  guidance applies that same rule to a native baseline; it does not define a
  second correspondence rule.
- `src/skills/dough-slice-planning/references/settle-decisive-premises.md`
  owns the early probe slice for a paid, credentialed, owner-held, or
  state-changing observation. It says nothing about what such a slice names
  when the developer's hands are the instrument.
- `src/skills/dough-execute-plan/references/wrap-up.md#accept-proof` is the
  passage the coordinator reads before accepting a return (boundary row
  "Before accepting a return", 9,082 bytes of its 30,000 budget). It mentions
  reuse only as "check source completeness before reuse".
- `src/skills/dough-manual-testing/SKILL.md` already says "Reuse sufficient
  automated evidence; do not replay deterministic checks or proven setup",
  and that a plan-slice observation continues under that story.

Decision: add one section to `executable-proof.md`, "Plan and reuse
developer-operated observation", holding both the planning rule (question,
rounds, developer-performed steps) and the reuse rule (open question only;
correspondence of the retained native baseline; changed detail proved at the
emitted source; a changed consulted path reopens only its own question).
The three readers link to it: the probe paragraph in
`settle-decisive-premises.md`, the acceptance passage in `wrap-up.md`, and
the manual-testing Plan section for slice-required observation. The plan's
existing retained-proof fields (promise, covered boundary, inspected setup
and observation locations, literal command, result) carry what a native
baseline observed; no new evidence format.

No consequential architectural choice: the ADR index and
`.planning/NORTH-STAR.md` were reviewed; no topic covers native proof reuse,
and ADR 0005 §3 (native acceptance tracked separately, reusable evidence)
supports reusing sufficient native evidence. No North Star topic is added.

## Decisive premises and preparation observations

Observed 2026-10-22 in this checkout at `67d354be`:

1. A new file `src/skills/dough-story-refinement/scripts/<name>.test.mjs`
   is scheduled by the runner and discriminates: a scratch test asserting
   `/developer-operated observation/i` in `executable-proof.md`, run as
   `bash scripts/test.sh <file>` with `/opt/homebrew/bin` first on `PATH`,
   exited 1 at that assertion (the phrase is absent from every `src/skills`
   Markdown file). The scratch file was deleted; the workspace holds only
   this preparation.
2. `bash scripts/test.sh` on `read-budget-guidance.test.mjs`,
   `consumer-trace-guidance.test.mjs` and
   `workspace-ownership-lifecycle.test.mjs` exited 0 at the same revision.
   The runner refuses `/bin/bash` 3.2; it needs Bash 5 first on `PATH`.
3. Boundary row sizes under the budget test's own section rule: "Before
   accepting a return" 9,082 bytes; "Before first implementation delegation"
   20,912 bytes. `executable-proof.md` is named by no row, so the new section
   adds no row bytes; the link sentences in `wrap-up.md#accept-proof` add
   well under the 20,918 bytes of headroom. Plan 346, now Taken, adds about
   1,931 bytes to the delegation row, leaving over 7,000.
4. Key example 1's inputs are recoverable:
   `ac342c94:.planning/slice-plans/330-branded-alert-click-automation/`
   holds `PLAN.md`, `native-baseline-evidence.md`,
   `native-baseline-history.md` and `slice-2-evidence.md`.

## Outside-in proof

| Promise | Owner and proof |
| --- | --- |
| A developer round is requested only for an open question; a change the observed native path renders unchanged reuses the retained baseline and proves the changed detail at the emitted source; the acceptance record names both. | Slice 1: `developer-observation-guidance.test.mjs` asserts the new section states the open-question rule, the correspondence rule by reference to the live-action decision, the emitted-source regression, and the record; and that `wrap-up.md#accept-proof` links the section for a return whose proof includes a developer-operated observation. Desk-check of plan 330's inputs recorded in Learnings: with the new text, slice 2 of plan 330 reuses the baseline and requests no round (key example 1); a replaced posting process reopens the attribution question for that path only (example 3); the unobserved Chrome dialog stays the same unproved promise (example 4). |
| A probe slice that needs the developer's hands names the question, the rounds that answer it, and the steps the developer performs themselves, requested with the first round. | Slice 2: the same test asserts the section states question, rounds and developer-performed steps named before the first round; `settle-decisive-premises.md` links the section from its probe paragraph; `dough-manual-testing/SKILL.md` takes question, rounds and developer steps from the slice for slice-required observation. Desk-check of plan 330 slice 1 rewritten under the new text (key example 2) recorded in Learnings. |
| Retained baselines stay reusable through the plan's existing retained-proof fields. | Slice 1: the section names those fields by reference to `planning.md#write-an-executable-plan`; no new evidence format is introduced (reviewed in the slice's diff). |
| Every boundary row still fits; nothing else changes meaning. | Both slices: `bash scripts/test.sh src/skills/dough-execute-plan/scripts/read-budget-guidance.test.mjs src/skills/dough-execute-plan/scripts/consumer-trace-guidance.test.mjs src/skills/dough-manual-testing/scripts/workspace-ownership-lifecycle.test.mjs src/skills/dough-story-refinement/scripts/developer-observation-guidance.test.mjs`, `/opt/homebrew/bin/bash tests/payload-declaration-links.sh`, `npm run lint`. |
| Completion records the actual response at ODF-324. | Slice 2 ends by updating the Follow-up line of `docs/maintainer/findings/ODF-324.md` with the response revision and "release pending"; the containing release is recorded when it is cut. ODF-324 stays unresolved until later native executions show fewer developer rounds for answered questions. |

## Ordered slices

### 1. Acceptance reuses native proof whose question is answered
Type: Behavior
Status: done
Proof: as mapped above; the new assertions fail first against `67d354be`'s text.

Behavior: a slice's proof includes a developer-operated observation, and the
retained native baseline already answers its question → the coordinator
accepts a later change that only alters text or another detail the observed
path renders unchanged → the acceptance record names the reused baseline and
the emitted-source regression that proves the changed detail, and no
developer round is requested. A change to what the path consults or does
(permission row, posting process or sender identity, click mechanism)
reopens the question for that path, and one fresh observation bounded to it
is requested. A promise the baseline never covered stays reported as the
same unproved promise, not a reason for a replay.

Edits: add the section to `executable-proof.md` (reuse half, including the
link to the live-action correspondence rule and the retained-proof fields);
add one sentence to `wrap-up.md#accept-proof` that sends a return with
developer-operated proof to it; write
`src/skills/dough-story-refinement/scripts/developer-observation-guidance.test.mjs`
in the style of `consumer-trace-guidance.test.mjs`. Record the plan 330
desk-check for examples 1, 3 and 4 in Learnings.

### 2. Planning names the question, rounds and developer steps of a native probe
Type: Behavior
Status: planned
Proof: as mapped above; the new assertions fail first.

Behavior: a plan's proof needs an observation only the developer can perform
→ slice planning writes the probe slice → it names the question each round
answers, the rounds that answer it, and the steps the developer performs
themselves because the agent's tools cannot (local authentication, opening a
system panel that a chat reply dismisses, reading a native dialog the tool
refuses), so the first request carries all of them; and the manual-testing
skill, when a slice requires the observation, takes those from the slice and
asks once for the set rather than round by round.

Edits: the planning half of the same section in `executable-proof.md`; one
link sentence in the early-probe paragraph of
`settle-decisive-premises.md`; one or two sentences in the Plan section of
`dough-manual-testing/SKILL.md`; extend the guidance test. Then update the
ODF-324 Follow-up line as mapped above. Record the plan 330 slice 1
desk-check (example 2) in Learnings.

## Current decisions

- One shared section in `executable-proof.md` holds both halves so planning
  and acceptance read one rule; readers link, they do not restate it.
- Correspondence is defined once, in the live-action decision; the new
  section cites it for native baselines rather than defining a second rule.
- The guidance test lives beside the owner of `executable-proof.md`
  (`dough-story-refinement/scripts/`) and reads the three linking passages
  across skills, as `consumer-trace-guidance.test.mjs` does.
- Run the suite with Bash 5 first on `PATH`; `/bin/bash` is refused.

## Learnings

Slice 1 accepted proof (promise: open-question rule, correspondence by the
live-action decision, emitted-source regression, record names both, changed
consulted path reopens only its question, unobserved promise unchanged,
retained-proof fields with observed revision and settings; boundary:
`executable-proof.md#plan-and-reuse-developer-operated-observation` and its
link from `wrap-up.md#accept-proof`):
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh src/skills/dough-execute-plan/scripts/read-budget-guidance.test.mjs src/skills/dough-execute-plan/scripts/consumer-trace-guidance.test.mjs src/skills/dough-manual-testing/scripts/workspace-ownership-lifecycle.test.mjs src/skills/dough-story-refinement/scripts/developer-observation-guidance.test.mjs`
and `tests/payload-declaration-links.sh` pass; the guidance test's seven
tests failed first against the unchanged text (the revision/settings
assertion failed before its sentence was added at acceptance). Consumer trace:
story-obligations, execution-increment-delivery, shared-checkout-writers,
ci-supported-host-contract and interrupted-delegation guidance tests pass;
the retained native delivery-evidence records that hash both files are a paid
manual re-record, excluded. "Before accepting a return" row: 9,082 → 9,303
of 30,000 bytes.

Plan 330 desk-check under the slice 1 text (inputs at
`ac342c94:.planning/slice-plans/330-branded-alert-click-automation/`):

- Example 1: `native-baseline-evidence.md` "Slice 1 acceptance" answered
  the attribution question (Safari probes 2/4 refusal, 3 retry; Chrome 5/7
  refusal, 9 retry; Open Dough → browser row). Slice 2's only product-source
  edit was the message literal (`slice-2-evidence.md`); row, click
  mechanism, sender and navigation were unchanged, so the baseline
  corresponds, the message is proved by the emitted-callback regression at
  `session-alerts-activation.spec.ts:93` (red, then green), and the record
  names both. The question is not open, so no round is requested; plan 330
  instead posted four final cards for developer clicks.
- Example 3: replacing the posting process changes what the observed path
  does (posting process and sender identity), which reopens only that
  path's question: one fresh refusal/retry observation of the new path,
  baseline reused for the rest.
- Example 4: a promise the baseline never observed (Chrome's recovery
  dialog, in the story's variant) stays reported as the same unproved
  promise; a text change is proved at the emitted source and requests no
  replay.

## Concern evidence

Refinement was not needed: two Behavior slices with independent proof loops,
one shared section and three link edits, each bounded by a guidance test and
the measured row budget. No remaining slice-specific concern was identified.
