# Turn finding proposals into developer-selected backlog work

## Source and authority

[SEED-010 Story 7](../../seeds/SEED-010-learn-from-execution-retrospectives.md#act-on-identified-retrospective-findings).
Status: executing. The 2026-09-10 conversation authorized plan execution in
worktree `/Users/terryyin/git/open-dough-quick-039` on branch
`worktree-quick-039-triage-retrospective-findings`, then merge back to `main`.
Story 7 is under **Taken**. Story 2's release/adoption work and remaining queue
order are unchanged.

## Goal and scope

Build an internal maintainer skill that recommends an evidence-backed order for
process findings and turns a developer-selected proposal into a canonical,
seed-hosted backlog story with a reciprocal link to the retained finding.

Use explicitly supplied accumulated evidence with reconciled internal finding
identities. The input location is supplied at invocation, not guessed from the
skill directory or naming catalog. This bounded input contract allows building
with fictional records without introducing a new maintained log. Unknown or
missing identities route to the existing naming workflow; this skill does not
allocate codes, rename findings, collect occurrences, or fetch other projects.
Missing evidence limits recommendations; missing writable finding location
blocks the dependent reciprocal-link update with a concrete explanation.

Ranking considers observed severity, distinct supported recurrence, confidence,
and established product direction. Explain judgment; no numeric formula or
minimum recurrence threshold. A severe one-off can outrank repeated minor cost.
An uncertain response may warrant an evidence request, deferral, or no change.
Only a developer-selected proposal enters the queue. Preserve original findings,
occurrences, human notes, and established direction. Queue placement follows the
existing backlog workflow and any developer priority instruction.

Excluded: applying the skill to real DearDough.md now, actual code allocation,
collection or storage infrastructure, scheduled review, public payload changes,
release/adoption, downstream story refinement/planning/execution, automatic
guidance changes, effectiveness assessment, and finding removal/archival.

## Implementation context and constraints

- Author one internal skill, proposed name `triage-retrospective-findings`, under
  `.agents/skills/triage-retrospective-findings/SKILL.md`; follow root
  [AGENTS.md](../../../AGENTS.md). A Claude discovery pointer may defer to this
  shared source as existing internal skills do. Do not synchronize managed
  public copies or modify installer payload declarations.
- Reuse `reconcile-finding-names` for identity ownership and link to
  `dough-product-backlog` for canonical backlog updates and ordering. Use the
  established seed format for minimal story creation; creating an evaluable
  story does not invoke downstream story refinement or execution planning.
- The naming catalog remains a mapping record, not a response/occurrence store.
  Follow-up disposition belongs with the supplied finding evidence, using its
  existing conventions. Do not prescribe a separate status database.
- Relevant current Accepted decisions: [ADR 0003 — Release lifecycle and
  versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
  [ADR 0005 — Cross-tool validation through native acceptance
  stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md), and
  [ADR 0006 — Write skills for executing
  agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
  Index and record statuses agree; no relevant supersession or conflict found.
  Conventional internal skill authoring uses the representative behavior review;
  this plan makes no public native-acceptance or release claim.

## Proof approach

Each slice owns one isolated behavior walkthrough using fictional Markdown
findings with clearly fictional ODF identities, an isolated backlog, and seeds.
Do not allocate those identities in the maintained catalog. Review invocation,
required inputs, and actual output against AGENTS.md, not exact prose matching.
Keep the decisive fixture changes and assessment under this plan's evidence/
while active. Verify real DearDough.md and finding-names.md stay unchanged during
walkthroughs. These checks prove authoring behavior, not native cross-tool
acceptance. Do not add a runner, scoring engine, or tests that merely search
skill text. No infrastructure experiment is needed for ordinary Markdown edits.

## Ordered slices

### 1. Receive a reasoned finding-priority proposal
Type: Behavior
Status: done
Proof: Isolated ranking walk placed severe one-off `ODF-901` first over
recurring minor `ODF-902` (two distinct executions, not three rows); `ODF-903`
surfaced as an evidence request. Missing path/empty/prose/unidentified-identity
stops invented nothing. Real `DearDough.md` and `docs/maintainer/finding-names.md`
stayed byte-identical.
Evidence: [evidence/slice-1/WALKTHROUGH.md](evidence/slice-1/WALKTHROUGH.md).

Behavior: Given supplied reconciled fictional findings and product direction,
a maintainer requests triage and receives an ordered, evidence-linked proposal
without queue or finding edits. The recommendation distinguishes observed impact
from inference, uses distinct occurrences rather than repeated reports, and
makes uncertainty or an evidence request visible.

Safe stop: The maintainer can manually act on a useful proposal. No persistent
state changes or downstream commitment are implied.

### 2. Queue a selected response in an existing seed
Type: Behavior
Status: done
Proof: Isolated accepted walk recorded story 4 with stable anchor
`prevent-wrap-up-from-overwriting-reviewed-commits`, canonical Backlog list
entry, and `Follow-up: queued, not resolved` on `ODF-901`. Occurrences, notes,
`ODF-902`, Taken order, unrelated queue order, and direction stayed intact.
Missing writable finding location was a pre-edit stop (seed and queue unchanged).
Recommendation-only still wrote nothing. Real log and catalog stayed
byte-identical.
Evidence: [evidence/slice-2/WALKTHROUGH.md](evidence/slice-2/WALKTHROUGH.md).

Behavior: Given a developer-selected proposal, an appropriate existing seed,
and supplied writable finding record, record one evaluable story, queue its
canonical reference, and link the retained finding and story in both directions.
Record the developer's selection as queued follow-up, not problem resolution.

Safe stop: Accepted work is discoverable and the original evidence is retained.
The caller supplies an existing seed for this first increment; missing-seed
support is the next slice, not a permanent restriction.

### 3. Host a selected response when no suitable seed exists
Type: Behavior
Status: planned

Behavior: Given the same accepted-response journey without a suitable seed,
create a minimal canonical seed using this project's identity and anchor
conventions, then produce the same linked queued outcome as slice 2. Reuse a
suitable existing seed whenever one exists; do not force unrelated work into it.

Proof: One isolated absent-seed walkthrough checks the newly allocated seed's
required metadata, beneficiary and evaluable story, canonical queue link, and
reciprocal finding link. Missing canonical seed conventions stops the dependent
write usefully rather than inventing a location. No slice plan or implementation
is generated for the proposed fix.

Safe stop: The selected work has a durable home without downstream refinement.

### 4. Recognize retained findings with existing follow-up
Type: Behavior
Status: planned

Behavior: Given the linked result and a later triage request, surface existing
queued or Taken follow-up and relevant new evidence without duplicating the
story, seed, queue reference, or disposition. Retain the existing disposition and finding evidence.

Proof: Revisit the accepted fixture in one follow-up-aware walkthrough. Check
existing links remain usable, occurrence history remains intact, and rereview
alone is byte-identical.
New evidence may change the proposal, but does not authorize another queued fix.

Safe stop: Repeated review surfaces existing work without duplicate commitments.

### 5. Retain a developer decision without queuing a fix
Type: Behavior
Status: planned

Behavior: Given a finding and the developer's explicit choice to defer, seek
more evidence, or retain current behavior, record that disposition against the
supplied finding identity without creating backlog work or deleting evidence.

Proof: One disposition walkthrough uses a fictional finding with uncertain
cause and an explicit developer evidence request. Check the recorded decision
and rationale, retained finding/history, and unchanged backlog. Deferral and
no-change use this same concise disposition rule, not separate workflows.

Safe stop: A recoverable human decision remains useful without executing a fix,
measuring effectiveness, or removing the finding.

## Proof ownership and cumulative assessment

| Promise | Owner |
| --- | --- |
| Reasoned severity/recurrence ordering, uncertainty, direction, missing input/identity | Slice 1 |
| Developer selection, existing-seed story, canonical queue, reciprocal links, preservation | Slice 2 |
| No suitable seed, canonical allocation, no downstream refinement/execution | Slice 3 |
| Existing follow-up and duplicate avoidance | Slice 4 |
| Evidence-request, deferral, or no-change disposition | Slice 5 |
| Fictional-only use and real-log/catalog preservation | Every walkthrough |

Common model: a finding retains identity and evidence; a proposal explains a
possible response; a developer disposition may link to one canonical work item.
Seed existence changes destination resolution, not the finding model. Subsequent
review reads the same links rather than maintaining another queue or log.

All five slices are Behavior gates with one bounded walkthrough each. No numeric
target or hard limit was supplied. Sizing includes authoring, the focused
walkthrough, and cleanup. No independent Structure slice or infrastructure is
justified. Assessment found no remaining slice-specific concern; the input path
is an explicit invocation parameter, not a hidden new storage commitment.
The common disposition handling should remain one rule; if implementation
requires unrelated lifecycle machinery, revisit scope rather than adding it.

## Slice refinement assessment

The user authorized refinement if needed. Replaced the original slice 4's
combined rereview-and-new-disposition behavior with slices 4 and 5 above.
Result: five slices, all classified Ready: one Behavior gate and one focused
proof loop each, with the same finding/proposal/disposition model. No sizing
exceptions or resplit recommendation. No remaining slice-specific concerns
identified in this assessment. Execution started 2026-09-10; delivery gates
below still apply.

## Execution and delivery gates

When separately authorized, use dough-execute-plan: take the existing queued
Story 7 entry, deliver each slice with the required independent post-change
refactor, selective formatting, staged lint, commit/push, and asynchronous CI
observation. Preserve unrelated installed-guidance modifications already present.
Repository commands are `npm run format`, `npm run lint`, and `npm test`;
CI runs lint and test. Confirm selective-format and check-only commit-hook
contracts plus authorized push destination before execution delivery; no custom
hooksPath was found during planning. Do not invent or bypass a missing hook.
Use representative behavior review for this prose change, not a routine full
native-discovery matrix or full-CI rerun before each commit.

Retain plan and evidence for retrospective and story wrap-up.

## Delivery

- Slice 1 `57425ff`: recommendation-only skill, ranking evidence under
  `evidence/slice-1/`.
- Slice 2 delivered in this wrap-up: selected-proposal queue path in the same
  skill; evidence under `evidence/slice-2/`. Missing writable finding location
  is a pre-edit stop.
- Branch: `worktree-quick-039-triage-retrospective-findings`.
- CI observer: `/tmp/dough-ci-501/watch-6ldH7a` (workflow `ci.yml` / `CI`).
  Started from the main-checkout skill scripts so Cursor hooks bind the
  coordinator session; the observer watches this worktree branch.

## Learnings

None that change remaining slices. Slice 3 must create a minimal canonical seed
when no suitable existing seed is supplied, then reuse the same linked queued
outcome as slice 2. Do not force unrelated work into an existing seed. Fictional
`ODF-901`–`ODF-903` stay out of the naming catalog.
