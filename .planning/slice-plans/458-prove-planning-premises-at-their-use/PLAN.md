# Prove decisive planning premises where the slice uses them

**Identity:** SEED-010#prove-planning-premises-at-their-use
**Source:** [story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#prove-planning-premises-at-their-use)
in SEED-010, selected on 2026-11-04 as the response to
[ODF-074](../../../docs/maintainer/findings/ODF-074.md).
**Source review:** [source-review.md](source-review.md)
**Prepared:** 2026-11-04. Planning only, in the story's established workspace
(branch `claude/prove-decisive-planning-premises-where-the-slice`, agent
aki-chan).

## Goal and boundaries

Slice planning calls a decisive premise settled only when its observation
uses the form and profile the slice consumes, and records, per premise, the
consuming operation, the observed form and profile, when or at which
revision, the result, and any unverified remainder. Readiness names an
unverified input or host condition that can change a slice's outcome, and
the delegation brief carries each slice's premise rows and their remainder
to the executing agent. The story's seven key examples are the evaluation.

Included scope, one source each:

- the premise rule in
  `src/skills/dough-slice-planning/references/settle-decisive-premises.md`;
- the readiness criteria in
  `src/skills/dough-product-backlog/references/record-preparation.md`
  "Assess readiness at preparation completion";
- the brief contents in
  `src/skills/dough-execute-plan/references/delegation.md` "Give the agent";
- one guidance test file for the three rules; and
- the response record at `docs/maintainer/findings/ODF-074.md`.

Material exclusions (from the story): the owner-held handoff problem
(ODF-252); a recorder check that parses premise rows; reassessing plans
already recorded `ready`; editing the Pygardon or Doughnut logs; any new
requirement to run full suites or native probes. Also outside this plan:
the installed copies under `.agents/skills/` and `.claude/skills/`, which
update only from a released payload (AGENTS.md).

Assumptions: the first containing release is pending until a later
`release-version`, so the finding record says so; native host evaluation of
the revised wording stays unverified under ADR 0005 and is reported as such.

## Direction and PFE

- **Revise in place.** The premise rule already lives in one reference
  file, the readiness rule in one section, and the brief contents in one
  list. The change sharpens what settles (same form and profile), adds the
  row fields that readiness and execution read, admits reuse by citation,
  and names selection premises; no second copy, checklist, or new reference
  file is added. The story's "match the observation to the use" is a
  refinement of the existing "reaches the consuming operation" sentence, not
  a parallel rule.
- **Keep the existing grammar.** "Decisive premise", "consuming operation",
  "presence, not settling", "unreached operation", and the early probe slice
  stay. The new words are "proxy", "the form and profile the slice
  consumes", "unverified input or host condition", and "settled by citation".
- **Executing-agent audience** ([ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)):
  the guidance names commands, profiles, checkouts, and the plan; findings
  and releases stay in the maintainer record.
- **Proof form.** Guidance tests here assert meaning-bearing phrases, not
  sentences (ADR 0005 section 2; `developer-observation-guidance.test.mjs`
  is the model). The behavior review per AGENTS.md walks the story's
  examples against the revised text and is the evaluation's replay.
- **Finding record form.** ODF-074's "Selected response — 2026-11-04"
  section is replaced by a delivered record: Follow-up "delivered,
  unreleased", Response / limit naming the response commits and
  `git tag --contains` output, the replay results with review effort, and
  what remains to observe.

No Accepted ADR conflicts. No North Star topic is needed.

## Decisive premises

Recorded in the form slice 1 prescribes.

| Premise | Consuming operation, observed form, revision | Result | Unverified remainder |
| --- | --- | --- | --- |
| Tests that read the three files pin phrases these edits must keep | `grep -rn` over `src/**/*.test.mjs` and `tests/` at `1b5b80e78`: `developer-observation-guidance.test.mjs:97` (early probe sentence through "developer's hands" to the executable-proof link), `preparation-finish-guidance.test.mjs:117` ("The caller reports the recorder's result only as needed. A refusal leaves the home unchanged…"), `one-shot-guidance.test.mjs:57` ("### Accepted work and context-only quick execution" start locations), six execute-plan tests reading `delegation.md` (obligation commands, "refusal blocks delegation", ownership and stash phrases, expected proof window, consumer-trace link) | Settled: keep those sentences and headings; the paragraphs this plan edits are not asserted | none |
| A new test under `src/skills/dough-slice-planning/scripts/` runs in the suite without declaration | `tests/node-test-files` lists `src/skills/*/scripts/*.test.mjs`; `install.sh` declares no `.test.mjs`, and `src/skills/dough-story-wrap-up/scripts/` holds only an undeclared test fixture | Settled | none |
| `delegation.md` is a captured native-evidence input, not a pinned text | `tests/delivery-evidence-native-routing.sh:80` and `tests/support/delivery-evidence-native-evidence.sh:24,68` list it among sha-captured inputs | Settled: a content change keeps the test green; it runs in slice 3's proof anyway | none |
| The retained observation for example 3 exists | `gh run list --branch main --limit 2`: CI `success` at `200642759` (2026-11-03T23:32Z) and `3ce39d2d6`; `origin/main` at planning is `1561db199` (a preparation announcement) | Settled as a candidate: a dated CI run at a named revision with the suite's exact command; the executor records which run it cites and that the checkout is unchanged on the paths the cited command runs through | whether the executor's checkout revision still matches at execution; the replay records it |
| Next free plan number | `git ls-tree origin/main .planning/slice-plans/` → highest 457; sibling worktrees hold 436, 441, 457 | Allocated 458 | none |
| Toolchain | `node -v` → 24.21.0 = `.node-version`; `scripts/test.sh` present; focused runs use `bash scripts/test.sh <paths>` with Homebrew Bash 5 first on PATH | Settled | none |

## Proof ownership

| Promise | Slice | Proof |
| --- | --- | --- |
| An observation in a different form or profile is a proxy; it settles only with a recorded reason the difference cannot change the outcome, else the row names the unverified input or host condition | 1 | Examples 1 and 2 walkthrough; guidance test phrases |
| A premise row names operation, observed form and profile, time or revision, result, unverified remainder | 1 | Example 4's row shape; guidance test |
| A retained observation reaching the exact form settles by citation when nothing result-changing has changed | 1 | Example 3 walkthrough; guidance test |
| A promised selected set carries a premise about the selecting code | 1 | Example 5 walkthrough; guidance test |
| Smallest safe observation, owned-workspace scratch edits, early probe slices, no full-suite or native requirement survive | 1 | Example 6 walkthrough; `developer-observation-guidance.test.mjs` green |
| An unverified remainder that can change the outcome is a `not-ready` reason naming it unless a probe slice bounds it | 2 | Example 4 walkthrough; guidance test; `preparation-finish-guidance.test.mjs` and `one-shot-guidance.test.mjs` green |
| The brief carries the slice's premise rows and remainder; the agent reuses or checks in the exact form first and returns a false premise through execution reassessment | 3 | Example 7 walkthrough; guidance test; the six delegation-reading tests and `tests/delivery-evidence-native-routing.sh` green |
| ODF-074 records the response commits, release status, replay results with effort, and what remains to observe | 4 | Reading the entry; `git tag --contains <sha>` recorded |

Focused proof runs through the runner, `bash scripts/test.sh <paths>`, with
the pinned Node and Homebrew Bash 5 first on PATH. This project's failure
policy applies as written in [AGENTS.md](../../../AGENTS.md#failing-and-flaky-tests):
a failing or flaky test is a defect to fix, attribution to the base is not an
exemption, and CI failing on a published revision is the publisher's to
repair.

## Ordered slices

### 1. A premise is settled in the form and profile the slice uses
Type: Behavior
Status: done
Proof: Behavior review per AGENTS.md on the revised
`settle-decisive-premises.md`: walk examples 1, 2, 3, 5 and 6 and show the
one reading of the text that yields each recorded result: `python3 -c` for
`python3 -I` and the manifest's companion files for the production
profile's published datasets each leave the premise open with the
difference named; the dated CI run cited with its revision settles example
3 without a re-run, and a moved checkout on the command's paths reopens it;
"the shown done sessions" sends derivation to the selecting browser code;
example 6 keeps its unpaid parts observed and its remainder as an early
probe slice. Record the review's effort (time, and tokens where known) for
slice 4. Then a new
`src/skills/dough-slice-planning/scripts/settle-decisive-premises-guidance.test.mjs`
asserts the meaning-bearing phrases (proxy; same form and profile;
unverified input or host condition; row fields; cited with its time or
revision; selecting code), and
`bash scripts/test.sh src/skills/dough-story-refinement/scripts/developer-observation-guidance.test.mjs src/skills/dough-slice-planning/scripts/settle-decisive-premises-guidance.test.mjs`
passes.

Behavior: A planning agent settling a premise about a command, its flags or
interpreter mode, a named input, or the profile or environment that consumes
it observes it in that same form and profile. An observation in a different
form is a proxy: it settles the premise only when the row records why the
difference cannot change the outcome; otherwise the premise stays open and
the row names the unverified input or host condition. Each row records the
consuming operation, the form and profile observed, when or at which
revision, the result, and any unverified remainder. A retained observation
that already reached the exact form in the consumed profile settles the
premise by citation with its time or revision and result, when nothing that
changes the result has changed since. A promised outcome that names a
selected set or restriction carries a premise about how the product selects
it, and derivation reads the selecting code before sizing. The smallest safe
observation, owned-workspace scratch edits with a revert before recording,
read-only queries of the consuming profile, and early probe slices for paid,
credentialed, owner-held, or state-changing remainders stay as they are.

Deliver together: the revised reference (its "settled only when" sentence,
the derivation paragraph, the record sentence, and a short reuse sentence),
phrased for the executing agent, and the new guidance test.

Accepted proof (2026-11-04): the focused command above passes (15 cases);
the five new cases fail on the base text in a temporary copy. Behavior
review, about 2 minutes (whole slice about 8 minutes; tokens unavailable):
examples 1 and 2 stay open as named proxies (`python3 -c` for `-I`; the
manifest's companion files for the profile's published dataset), and the
read-only profile listing settles example 2; example 3 cites CI run
41744226091 (`ci.yml`, success, 2026-11-04T00:05:50Z) at `6f2a50ec8`, whose
suite paths are unchanged to `06839e887`, and this slice's `src/skills`
edits reopen it; example 5 sends derivation to
`dashboard/src/recentlyDoneView.ts` `useRecentlyDone`; example 6's early
probe paragraph is unchanged. Consumer trace: only
`developer-observation-guidance.test.mjs` reads the reference (green);
`install.sh:121` and `dough-slice-planning/SKILL.md:121` cite the path.
Learning: the read-only profile query sentence says it *settles* a premise
about that profile's own state, so it does not read against "read-only host
queries locate it".

### 2. Readiness names the unverified input or host condition
Type: Behavior
Status: done
Proof: Behavior review on the revised "Criteria" in `record-preparation.md`:
walk example 4. A plan whose row records "manifest hash and factor files
verified on the host" with "published in the production profile" as the
unverified remainder and no probe slice yields `not-ready` with a `--reason`
naming the premise and that remainder; the same plan with the read-only
profile listing recorded, or with the remainder as an early probe slice
that stops dependents, yields `ready`. Confirm the text links to slice 1's
definitions rather than restating them. The guidance test from slice 1
gains the criteria assertion, and
`bash scripts/test.sh src/skills/dough-slice-planning/scripts/settle-decisive-premises-guidance.test.mjs src/skills/dough-story-refinement/scripts/preparation-finish-guidance.test.mjs src/skills/dough-execute-plan/scripts/one-shot-guidance.test.mjs`
passes.

Behavior: An agent recording readiness reads the plan's premise rows. A row
whose unverified input or host condition can change its slice's outcome,
with no early probe slice bounding it, is a blocking reason naming the
premise and that condition, alongside the existing unreached-operation
reason; the agent records `not-ready` with those reasons and `ready` only
when none remain.

Deliver together: the `ready` criteria row and the blocking-reason paragraph
(currently lines 76 and 93–97).

Accepted proof (2026-11-04): the focused command above, plus
`refinement-outcome-guidance.test.mjs`, `preparation-handoff-guidance.test.mjs`
and `one-shot-refinement-guidance.test.mjs` (the other readers of
`record-preparation.md`), passes; the new criteria test fails on the base
text. Behavior review, about 5 minutes (tokens unavailable): example 4's
unbounded "published in the production profile" remainder yields
`not-ready` with a `--reason` naming the premise and that host condition;
the cited read-only listing, or an early probe slice stopping dependents,
yields `ready`. Learning: the unchanged "clear a premise-based reason only
with a fresh observation" sentence contradicted reuse by citation (story
commitment 3.1); it now admits a matching retained observation cited with
its time or revision, while re-citing the evidence that left the premise
open still does not clear it.

### 3. The brief carries the slice's premise boundary
Type: Behavior
Status: done
Proof: Behavior review on the revised "Give the agent" list in
`delegation.md`: walk example 7. A brief for a slice whose row carries an
unverified host condition names that row; the agent checks the condition in
the prescribed form before dependent work, reuses a settled result without
repeating its observation, and returns a false premise under
[execution reassessment](../../../src/skills/dough-execute-plan/references/execution-decisions.md#reassess-before-extending-work).
The guidance test gains the brief assertion, and
`bash scripts/test.sh src/skills/dough-slice-planning/scripts/settle-decisive-premises-guidance.test.mjs src/skills/dough-execute-plan/scripts/story-obligations-guidance.test.mjs src/skills/dough-execute-plan/scripts/read-budget-guidance.test.mjs src/skills/dough-execute-plan/scripts/overdue-delegated-verification-guidance.test.mjs src/skills/dough-execute-plan/scripts/shared-checkout-writers-guidance.test.mjs src/skills/dough-execute-plan/scripts/consumer-trace-guidance.test.mjs src/skills/dough-execute-plan/scripts/interrupted-delegation-guidance.test.mjs tests/delivery-evidence-native-routing.sh`
passes.

Behavior: A coordinator delegating a planned slice gives the agent that
slice's premise rows from the plan, including each unverified remainder.
The agent reuses a settled result as recorded, checks a remainder in the
exact form the slice prescribes before work that depends on it, and returns
a false premise through execution reassessment rather than continuing on it.

Deliver together: one bullet in the "Give the agent" list, phrased like its
neighbours, with the link above.

Accepted proof (2026-11-04): the focused command above passes; the new brief
test fails on the base text. Behavior review, one read-through (about 2
minutes; tokens unavailable): a brief naming a row with an unverified host
condition has the agent check it in the prescribed form before dependent
work, reuse a settled row without re-running it, and return a false premise
through execution reassessment before the dependent run. CI run 41752420616
on `4165f1f` was cancelled by same-ref `cancel-in-progress` when `ddbc5bb`
was pushed: proven supersession.

### 4. ODF-074 records the response and the replay
Type: Behavior
Status: done
Proof: Read `docs/maintainer/findings/ODF-074.md`. Its Follow-up reads
"delivered, unreleased: SEED-010#prove-planning-premises-at-their-use" with
the story link kept; its Response / limit names slices 1–3's commits, the
`git tag --contains <sha>` result (expected: none) with the date, native
evaluation unverified, and that later ordinary use remains a separate
observation; the "Selected response — 2026-11-04" section is replaced by
the replay record: examples 1 and 2 from the retained evidence and example
3 from the cited CI run, each with its result under the revised text and
the review effort from slices 1–3. Prior responses, assessments,
occurrences, and external links are retained; no Pygardon or Doughnut log
is edited.

Behavior: A maintainer reviewing ODF-074 after this story lands sees the
actual response commits, that the containing release is pending, what the
replay showed and cost, and what remains to observe.

Deliver together: the record edits and the dated verification line.

Accepted proof (2026-11-04): the entry's Follow-up reads "delivered,
unreleased" with the story link and the prior 0.3.58 response kept; Response
/ limit names `4165f1f20`, `ddbc5bb45` and `0aaa8f1f1` as story-branch
revisions, `git tag --contains` none, native evaluation unverified and later
use separate; "Response replay — 2026-11-04" replaces the selected-response
section. `git diff --stat` shows only ODF-074.md; no test reads
`docs/maintainer/findings`. Learning: landing may rewrite the story-branch
SHAs; wrap-up replaces them with the landed revisions if so.

## Current decisions

- Guidance is written for the executing agent; findings and releases stay
  in the maintainer record.
- The guidance test lives beside the skill whose rule it reads,
  `src/skills/dough-slice-planning/scripts/`, discovered by
  `tests/node-test-files`; it is not a payload file.
- The plan's own premise table uses the row form slice 1 prescribes, so the
  story's readiness view (example 4) is visible on this plan before the
  rule lands.

## Concern evidence

Refinement was not needed: four Behavior slices, each one file and one
proof loop, no shared preparation, no interim behavior. No remaining
slice-specific concern was identified. Example 3's retained observation is
a candidate the executor confirms at its revision; that confirmation is the
example's own replay, not a readiness gap.
