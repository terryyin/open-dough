# Assess Doughnut's note-details disclosure against deployed use

**Identity:** SEED-010#assess-client-product-improvement-in-use
**Source:** [Selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#assess-client-product-improvement-in-use)

## Goal and scope

Give the maintainer one evidence-linked, exploratory judgment under
[Accepted ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
of whether one delivered client product change, Doughnut's note-details
disclosure (`SEED-078#story-5`, released as v1.3.47), was an improvement, using
the owner's post-deployment feedback and the attributable restoration
(`SEED-082#story-1`, released as v1.3.49) as the evidence. The result is one
dated follow-up section at the end of the
[research record](../../../docs/maintainer/empirical-process-control-research.md),
in the compact form its earlier follow-ups use.

Included, as the story's scope lists: the decision basis stated first and
labelled exploratory; the trace from promise through accepted implementation
and its recorded limit, release and deployment, the two feedback turns,
restoration story and plan, and the v1.3.49 deployment, with direct
observation separated from inferred usability consequence and the disclosure
separated from the thread's navigation feedback; attribution of owned,
sibling and restoration commits exactly as the story fixes them; costs bounded
to this case with unknowns marked and this assessment's own effort recorded;
the judgment per retained, adjusted, rejected or inconclusive element; the
human value of the owner's judgment with its coverage limit; and the retained
limit on post-restoration usability with at most one bounded next observation.

Excluded, as the story defers or rejects: reopening, re-judging or advising
reversal of the owner's restoration; any intervention rate or missed-stop
claim from this thread; a fresh user trial or usage sample; production
operation; any Doughnut change; a general UI review; an evaluation framework,
measurement mechanism, new story, finding record or watch-list entry (advice
naming an owner is allowed); and copying raw session or repository content
into the record instead of citing locators.

Assumptions: the evidence is read on this machine from the local Doughnut
checkout, the Codex session record and the hosted run pages, all read-only;
the research record remains the home of the maintainer's bounded assessments;
and no release is needed, because the record is internal maintainer
documentation.

## Existing solutions and architectural direction

PFE: the research record already hosts the maintainer's bounded assessments in
the compact follow-up form set by plans 340 and 342 and the 21 to 23 October
follow-ups, with the decision basis first; it carries the
[decision-oriented measures](../../../docs/maintainer/empirical-process-control-research.md#a-small-set-of-decision-oriented-measures)
and the
[intervention assessment method](../../../docs/maintainer/empirical-process-control-research.md#assess-human-intervention-quality)
this story applies in its qualitative, coverage-limited form, and links the
ADR. Doughnut's own plan, preparation and proof records, its commits and its
hosted release runs are the case's evidence; nothing new records it. Reuse all
of them; no new record, registry or measurement mechanism is needed.

[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
asks for value and low-cost change over a single cost metric.
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
keeps implementation, release and exposure distinct, which is why the trace
names the release tags and deployment runs rather than the merge alone.
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) keeps
native evidence distinct from controlled proof and retains compact findings
rather than raw artifacts.
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
keeps this analysis in maintainer records.
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md) is
the decision basis: beneficiary, intended gain, comparison and result worth
keeping before judging; exploratory label for retrospective evaluation;
delivered change distinguished from observed improvement; humans own the
product decision. The [North Star](../../NORTH-STAR.md) concerns the dashboard
and launches; this assessment adds no direction there and needs no exception.

## Preparation observations and decisive premises

Observed read-only on 2026-10-24 in the established preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/assess-doughnut-s-note-details-disclosure-agains`
at `d27bd3d74522719bc102adfd46eb0c1ea933f838`. No Doughnut write, native
host run or production operation ran.

| Premise / consuming operation | Literal observation | Result and limit |
| --- | --- | --- |
| Every cited Doughnut revision and commit is readable locally. | `git -C ~/git/doughnut cat-file -t` for `b6f36e9c…`, `f7f50157…`, `23c64de1…`; `git -C ~/git/doughnut log --oneline -1` for `8d30de7ea3`, `89a2bb85d1`, `4b9d3792f7`, `f6ba658ab7`, `522f3f9f72`, `df295a0d86`, `d5b50a822c`, `b6ee50ea64`, `e1b1aaf93f`, `2e56492746`, `21d19fc9b0` | All three are `commit`; every short hash resolves with its subject, for example `522f3f9f72 Give note reading a quiet bounded column`, `b6ee50ea64 Show note properties directly above the body`, `e1b1aaf93f Wrap up SEED-078#story-4`. The checkout's HEAD is `f0b5d9f1c7`; the trace reads the pinned revisions, not HEAD. |
| The accepted-implementation and restoration records exist at the pinned revisions. | `git -C ~/git/doughnut ls-tree --name-only b6f36e9c… .planning/slice-plans/009-note-details-disclosure/`; same for `f7f50157… .planning/slice-plans/003-visible-note-properties/` | `PLAN.md`, `PREPARATION.md`, `PROOF.md`; and `PLAN.md`. Their contents are read during execution, not here. |
| Both feedback turns are readable from the local Codex session record. | `find ~/.codex -name "*01a15660-d40d-7ef3-8c86-81d728d87bf5*"`; a JSON scan of that rollout's `response_item` entries with `role: user` carrying each turn id | `~/.codex/sessions/2026/10/20/rollout-2026-10-20T07-55-49-01a15660-d40d-7ef3-8c86-81d728d87bf5.jsonl` (1277 lines) and `~/.codex/visualizations/2026/10/19/01a15660-…/` (six HTML design proposals). Turn `01a15937…` at 2026-10-20T12:09:45Z confirms deployment, attaches two images and asks for navigation, toolbar and breadcrumb corrections; turn `01a15df9…` at 2026-10-21T10:20:09Z asks for always-visible properties with no collapse option, dates at the bottom, removal of the disclosure and its tests, keeping any property-display improvement, queued at the top and done on main. Limit: the two attached images were temporary files under `/var/folders/…/codex-clipboard-*.jpg` and no longer exist; the visualizations are design proposals, not device captures, so the owner's words are the available observation. |
| Release and deployment evidence is reachable. | `gh run view 39400614643 -R nerds-odd-e/doughnut --json status,conclusion,updatedAt,name`; same for `39687212956`; `git -C ~/git/doughnut tag --contains <merge or close sha> \| grep '^v1' \| sort -V \| head -1` | Both runs are `Application Release`, `completed`, `success`, at 2026-10-20T09:32:02Z and 2026-10-21T22:38:38Z (22 October, 07:38 JST, after the 21 October 19:20 JST request). The first v1 tag containing `21d19fc9b0` is v1.3.47 and containing `23c64de1` is v1.3.49. Exposure is bounded by these times; no usage data exists. |
| The research record takes a follow-up in the established form. | `grep -n '^## \|^### ' docs/maintainer/empirical-process-control-research.md`; `wc -l` | 1485 lines; the last follow-up `## Follow-up: one real feedback cycle judged under Proposed ADR 0010` (line 1102) opens with `### Decision basis` and ends with `### Human disposition after clarification review`. The new section appends after it with the same shape. |
| Local proof for a documentation-only change. | `grep -n prettier scripts/lint.mjs` | `npm run lint` covers scripts and JSON, not Markdown. Proof is a relative-link existence check over the new section plus `git diff --check`; plan 342 used the same route. |

No premise needs a paid or owner-held observation before `ready`. The
restoration is complete and deployed, so no external wait gates the slice.

## Outside-in proof ownership

| Story example | Proof and owner |
| --- | --- |
| 1: basis first, dated and exploratory | Slice 1: the new section's first subsection is the decision basis, carries its date, and says the restoration was known when it was written. |
| 2: promise traced; observation separated from inference; disclosure separated from navigation feedback | Slice 1: the trace names plan 009's records at `b6f36e9c`, v1.3.47 and run 39400614643, both turns with their timestamps, SEED-082 and plan 003 at `f7f50157`, v1.3.49 and run 39687212956; the owner's request is quoted or paraphrased as observation, each usability explanation is marked as inference, and the 20 October navigation feedback is placed outside the case. |
| 3: attribution and bounded cost with unknowns | Slice 1: one table credits `522f3f9f72` to Story 5, excludes `e1b1aaf93f` from both sides, lists `d5b50a822c` and `b6ee50ea64` as reversal cost, draws rework and complexity from the retained records, marks human time, tokens and money unknown where no record exists, and states this assessment's own effort. |
| 4: human value and coverage limit, no rates | Slice 1: the human-intervention paragraph credits the owner's judgment and correction, names one beneficiary in one thread as the coverage, and contains no rate and no missed-stop claim. |
| 5: retained limit, judgment, at most one next observation; rerun adds nothing | Slice 1: the closing subsection states that post-restoration usability in ordinary use is not established, gives one disposition per element without reopening the restoration, and names at most one bounded next observation; a second reading of the same records changes nothing. Proof commands: the relative-link check over the new section and `git diff --check`. |

## Ordered slices

### 1. The research record holds the exploratory assessment of the note-details disclosure
Type: Behavior
Status: done
Proof: A maintainer reading the new follow-up can trace every claim to a named
Doughnut revision, commit, plan record, release tag, deployment run or
feedback turn, reproduce the read-only observations, and read the basis,
trace, attribution and cost table, judgment, human-value paragraph and
retained limit without mistaking deployment, passing tests or the owner's
silence on day one for established usefulness. Proof commands: for each
relative Markdown link in the new section, the resolved path exists and any
anchor is present; `git diff --check` passes.

Behavior: Given the evidence the story lists and the premises above, when the
maintainer assesses the disclosure against deployed use → the research record
gains one dated follow-up, in the established form, with the exploratory
decision basis first, then the trace, attribution and bounded costs, the
judgment, the human-intervention value with its coverage limit, and the
retained post-restoration limit with at most one next observation.

Keep observations, causal hypotheses and dispositions distinct; cite locators,
never copy session or repository content; write nothing into Doughnut, the
findings catalog, the watch list or the backlog. Record the assessment's own
effort from the session's start and end times and, when the host session
record exposes them, its token usage. Perform the execution workflow's
post-change refactoring and delivery gates. If execution finds that a runtime
change, a client change or a new mechanism is necessary to fulfil this
outcome, stop and revisit scope instead of adding implementation.

## Execution complete

Product advice: no change. The assessment closes one response loop with
existing evidence, as the near-future direction asks, and leaves the backlog
unchanged. A hypothesis from this single case, to consider when choosing the
next empirical-loop story: when a client plan records that its proof cannot
establish comfort in real use, as plan 009 did, that limit is the natural
post-deployment observation to name and route to the client owner.

## Current decisions

- One Behavior slice: the assessment is one evidence-to-decision proof loop
  with no independently useful part and no Structure. The basis is written
  first inside the same section because the result is already known, which is
  what makes the evaluation exploratory under ADR 0010. No supplied numeric
  slice target or hard limit was found, so none is invented.
- The evidence set is fixed by the story: the pinned Doughnut revisions, the
  listed commits, the two turns and the two runs. Later Doughnut changes are
  not substituted into the case.
- Doughnut and host records are read-only inputs; the follow-up retains
  compact conclusions and locators.
- Preparation authorizes no execution. The eventual execution instruction
  owns the assessment and its ordinary delivery.

## Accepted proof

Slice 1, accepted 2026-10-24 on the uncommitted change to
`docs/maintainer/empirical-process-control-research.md` (section
`#note-details-disclosure-follow-up`).

- Source-only review: a fresh general-purpose reviewer received only the
  selected story's text, from **Goal** to **Boundary / safe stopping point**,
  extracted to the execution job's `tmp/source.md`. It returned 56 commitments,
  grouped A–N by clause. Key examples 3 and 5 add three commitments the Scope
  bullets do not: a cost table, one disposition per element, and stability on
  re-reading.
- Comparison, from the source's expected result to the actual section:
  - Example 1: `### Decision basis` comes first, dated, and says the result
    was known, so the judgment is exploratory. Its bullets cover beneficiary,
    intended gain, comparison, result worth keeping, quality and authority
    constraints, and costs.
  - Example 2 and scope bullet 2: a trace table runs from promise to restored
    deployment, with every row labelled observation or inference. The
    20 October turn sits outside the case. The 21 October turn names the
    version it reacts to: v1.3.47, unchanged in v1.3.48. This wording was
    added at acceptance. The coordinator checked its quotes against rollout
    lines 677 and 1142.
  - Example 3 and scope bullets 3–4: one attribution and cost table, with
    `522f3f9f72` as the retained benefit and `e1b1aaf93f` neither credited nor
    charged. `d5b50a822c` and `b6ee50ea64` are the reversal. The coordinator
    re-derived the numstat totals: +686 / −225 over 40 file changes for the
    disclosure, and +333 / −509 over 31 for the reversal. Elapsed time is
    never treated as effort. Unknowns are marked, and the assessment's own
    effort is recorded.
  - Scope bullet 5 and example 5: one disposition per element. Passing tests
    are not counted as usefulness, and the restoration is not reopened.
  - Example 4: the owner's judgment is credited, with coverage limited to one
    beneficiary in one thread. No rate and no missed stop are claimed.
  - Scope bullet 7 and example 5: the retained limit is stated. Zero next
    observations are requested, with the reason given. The advice names its
    owner. Re-reading the records yields the same result.
  - Rejection constraints and deferrals: no Doughnut write, no story, no
    finding, no watch-list entry.
- Proof commands, all passing:
  - `python3 -I <job tmp>/linkcheck.py docs/maintainer/empirical-process-control-research.md '<a id="note-details-disclosure-follow-up">'`
    reports 5 relative links, 0 bad. A negative control with a broken anchor
    reported 1 bad.
  - `git diff --check` passes.
  - Doughnut blob targets and the `story-5` / `story-1` anchors exist at the
    pinned revisions (`git cat-file -e`, `git show … | grep 'id="story-'`).
  - The v1.3.48 run, 39557385777, succeeded at 2026-10-21T06:52:32Z.
- Consumer trace (`consumer-trace.mjs --base 78532b0e`): no code consumers.
  SEED-010, plan 351, ADR 0010, ODF-139 and ODF-152 are excluded, because the
  append renames or removes no heading or anchor.

## Learnings

None that affect remaining work.

## Plan concern review

Slice-plan refinement was not needed: the plan has one slice with one
outcome and one proof loop, every premise was reached read-only in
preparation, and no external wait remains. This review identified no
remaining slice-specific concern. The one evidence limit, the missing
screenshots, is recorded in the story's boundary assumptions and the premise
table; it narrows the observation to the owner's words and blocks nothing.
