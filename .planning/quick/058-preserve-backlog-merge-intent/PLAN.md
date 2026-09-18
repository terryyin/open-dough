# Restore stable identity and faithful backlog reconciliation

Status: planned correction. Created 2026-09-18 during a requested delivery review.
No execution is authorized or started by this plan.

## Authoritative correction input

Terry Yin requested an audit of the completed first part of Plan 057 against
the original purpose before proceeding with its successor. The bounded outcome
here is that users can edit and reconcile the backlog without losing work or
its identity: recorded IDs survive relocation, compatible intentions survive,
incompatible intentions stop, and reports describe the result truthfully.
This corrects the delivered core; it does not implement the
queued Git/installation/host-guard story.

Original contract: `6063439:.planning/quick/057-script-product-backlog/PLAN.md`,
especially boundaries, proof ownership, and slices 2–3, 6, and 8–9. Completed execution:
`46ce42d:.planning/quick/057-script-product-backlog/PLAN.md`; slices 1–10 were
closed and slices 11–17 transferred to the successor. Current audited revision:
`b017cc5`. The earlier story was `SEED-008#script-product-backlog-list-updates`.
Its successor is [Gate Git backlog conflicts and deliver the scripted
backlog](../../seeds/SEED-008-worktree-branch-trunk-sync.md#gate-and-deliver-scripted-backlog).

### Current findings and decisive evidence

1. Removal wins over explicit reprioritization. Starting with queue [A,B,C,D],
   run `complete --identity B` on one copy and `place --identity B --position
   last` on another. Both succeed. Merge the resulting versions against their
   ancestor: exit 0 publishes [A,C,D], discarding the competing intent for B.
   `product-backlog-combine.mjs:45` compares item fields without ordering;
   the subsequent order calculation filters out the already-removed item.
   The established merge contract includes ordering among per-identity changes
   and says removal does not automatically win over another intention.
2. A one-sided priority change is applied correctly but reported as “neither
   changed the ancestor”. `transitions()` in `product-backlog-merge.mjs:156`
   omits order and preserved surrounding text; `reportMerge()` treats an empty
   transition list as proof of no changes. The existing DD-056 assertion gap
   therefore hides a working defect, not just absent proof.
3. The 926-line merge test file exceeds the current 250-line refactor rule.
   Prior execution explicitly deferred it twice. Preserve its useful coverage
   while making changes to these rules reviewable along cohesive behavior seams.

Review verification: `bash tests/product-backlog.sh` passed all 76 tests with
no skipped tests. Disposable CLI probes at the audited revision reproduced both
defects; the removal probe generated both branches with the actual commands
above, rather than assuming their outcomes in fixture text. Scratch projects
were removed. These observations are evidence, not newly maintained tests.

### Confirmed identity correction

The original plan promised an immutable identity across relocation, with links
as navigation and ID spelling an implementation choice. Execution later made a
correction's path its identity and explicitly prohibited relocation; seed IDs
also require their token in the destination filename and their original anchor
in the URL. A moved document with the correct recorded identity is still refused.
Examples: move `seeds/SEED-001-install-and-update-open-dough.md` to
`seeds/install-guidance.md`, retaining frontmatter and recorded identity; or
move an adopted correction plan to another directory. Both `refresh` calls fail.

Terry confirmed in this conversation that the original relocation-safe ID
promise is correct and the additional restriction is incorrect. Restore that
promise in this plan; the decision is resolved. An ID may initially reuse a
seed/anchor or path, but after recording it its value is independent of current
navigation. Retain existing allocated values; relocation is not re-identification.

## Preserved scope and design

- Terry authorized moving tightly related core corrections out of the successor
  while keeping this correction bounded. Two documentation responsibilities from
  original slice 14 move here: corrected domain merge rules in slice 2, and
  story/plan identity preservation guidance in slice 4. Report proof and merge
  test organization were already owned here. No full delivery slice moves here.
- Keep one readable Markdown backlog, stable identities, Taken and queue
  membership, explicit direction operations, and the existing CLI boundary.
- Persist the full immutable identity rather than reconstructing it from the
  current link. Adoption, rendering, refresh, and reconciliation must share this
  rule. Preserve existing recorded values and reject real collisions; no new
  numbering convention, registry, or historical inventory is needed. Migration
  of active entries is explicit, retry-safe, and never an installer side effect.
- No AI repair, new priority policy, durable operation log, service, registry,
  automatic Git driver, host hooks, or installer change. Ambiguity stops for a
  human, with nonzero exit and destination bytes unchanged.
- Preserve compatible closures, one-sided changes, identical changes, separate
  queue additions, legacy/adopted matching, and scalar direction decisions.
- Do not classify absolute index shifts caused by taking/removing other work
  as explicit reprioritization. Conversely, do not infer which item moved when
  version snapshots cannot establish it; preserve the human-stop boundary.
- Existing `groupWork`, `mergeWork`, `listOrder`, and `transitions` own the
  affected rules. Extend their shared account of changes rather than adding an
  independent resolver or operation history. The root insertion helper has no
  reconciliation solution to reuse; its retirement remains successor scope.
- PFE: existing CLI fixtures, real child processes, and scratch files provide
  the needed proof. No framework or exported internal testing seam is needed.
- Apply [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  for coherent domain ownership and inexpensive changes, and
  [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) for honest
  observable proof. No ADR exception or North Star change is required. The
  current near-future direction, parallel work through trunk-based development,
  makes preservation of independently changed backlog intent directly relevant.

## Ordered slices

### 1. Keep reconciliation proof cohesive and fully discovered
Type: Structure
Status: done
Proof: `bash tests/product-backlog.sh` must discover and pass the same 76
existing cases without skips before behavior changes.

Accepted proof: `bash tests/product-backlog.sh` reported 76 tests, 76 pass, 0
fail, 0 skipped, matching the `2941a3d` baseline. Boundary: the real CLI at
`src/skills/dough-product-backlog/scripts/product-backlog.mjs` run as a child
process against scratch projects. Inspected locations: the `node --test`
discovery list in `tests/product-backlog.sh`, which now names the five merge
files; `tests/support/product-backlog-merge-fixture.mjs` `versions()`, which
supplies only the three version files and the argv naming them; and
`tests/support/product-backlog-merge-items.test.mjs` "merge items keeps both
branches' closures", which observes the destination's whole bytes after the run.
Preservation was verified directly: the 29 merge test names are identical before
and after the split and both sides hold 130 `assert.` calls.

Split the oversized merge test file by cohesive behavior, keeping affected
files within the current size guidance. Preserve meaningful CLI journeys and
all distinct item/order/direction assertions. Reuse the existing fixture
builders; share only genuinely repeated setup. Update the shell runner in the
same slice. This directly owns the evidenced test-structure correction and
enables the following behavior changes. No assertion downgrade or test
removal is justified by the current approximately 1.3-second suite runtime.
Sizing: one test-organization change and one full focused proof loop.

Learnings: `tests/product-backlog.sh` has no glob discovery, so every later
slice adding a merge test file must extend its explicit `node --test` list or
those cases silently stop running. Helper modules that are not `*.test.mjs` are
safe in `tests/support/`, which neither the runner's list nor `scripts/test.sh`
discovers. `tests/support/product-backlog-merge-direction.test.mjs` sits at 242
of the 250-line guidance, so slice 3's report assertions should budget a further
combine/refusal split there rather than discover it late. Slices 2, 3 and 6 now
have obvious homes: removal-versus-priority refusal in the order or items
refusal file, one-sided reorder reporting in
`tests/support/product-backlog-merge-order.test.mjs`, and relocated-item
reconciliation in `tests/support/product-backlog-merge-items.test.mjs`.
`DearDough.md:20` still names the deleted merge test file inside DD-055's
evidence; that is a record of what was observed at `ff8987d`, so it stays.

### 2. Stop when removal conflicts with changed queue priority
Type: Behavior
Status: done
Proof: extend the real CLI suite, then run `bash tests/product-backlog.sh`.

From [A,B,C,D], generate one branch by completing B and the other by placing B
last. Reconciliation must refuse, identify the competing removal/order intent,
and preserve destination bytes. Swap branch inputs to establish no side wins.
Retain positive proof for an unchanged B versus removal, independent closures,
and compatible priority changes among surviving work. Include an unrelated
membership change so shifting numeric positions alone cannot cause refusal.
Observe actual files and diagnostics, not precomputed must-stop booleans.
Align the domain-rule example in the backlog skill's `references/merge-conflicts.md`
with the proved removal-versus-priority refusal. Use the
same scenario for the AGENTS.md guidance behavior review. Preserve the existing
human-stop and no-automatic-priority rules; command routing and Git recovery
instructions remain successor work. This is rule coherence, not a workflow rewrite.

Use one domain account of changed relationships for safety and reporting. Do
not add a handler for this exact four-item arrangement. Version snapshots do
not recover operation history; genuinely ambiguous attribution remains a stop.
Sizing concern: deriving changed relationships without treating unchanged
relative order as intent is the substantive design work. Reassess this slice
if it accumulates fixture-specific exceptions; do not broaden merge policy.

Accepted proof: `bash tests/product-backlog.sh` reported 78 tests, 78 pass, 0
fail, 0 skipped. Boundary: the real CLI at
`src/skills/dough-product-backlog/scripts/product-backlog.mjs` run as a child
process against scratch projects. Inspected locations:
`tests/support/product-backlog-merge-order-refusals.test.mjs` "merge order
refuses completing work the other branch reprioritized", which observes exit 1,
the destination's bytes equal to the ancestor under both branch orderings, the
stderr naming the disputed identity with both intentions, and zero occurrences
of every other identity; and
`tests/support/product-backlog-merge-order.test.mjs` "merge order does not read
work shifting up behind a removal as a reprioritization", which observes exit 0
and the whole destination. Both branch versions are produced by running the real
`complete` and `place` commands through the new `branchFrom` fixture helper, so
no expected branch text is assumed. The coordinator additionally reproduced the
plan's literal scenario against the changed CLI outside the suite: exit 1, the
destination unchanged, and the diagnostic naming both intents, where the audited
revision exited 0 and published [A,C,D].

Design as delivered: `reorderedWork(ancestral, order)` in
`product-backlog-combine.mjs` derives one account of changed queue relationships,
computed once per branch in `mergeBacklogs` and asked of each work item by the
existing `mergeWork`. It compares only the entries both versions list, so work
that shifted up behind taken or removed work is never read as reprioritized, and
it blames the smallest account of the difference, naming every entry a maximal
reading blames rather than inferring one. The Taken list deliberately does not
feed the account, because a place there is display order rather than priority.

Learnings: a take (queue to **Taken**) competing with a reprioritization of the
same work still merges successfully, with the work ending in **Taken** and its
queue place moot. That is unchanged prior behavior, left alone because this
slice is bounded to removal versus priority and the plan forbids broadening
merge policy. It is a genuine judgment call worth a human decision later, not a
defect this correction fixed. Test-file headroom under the 250-line guidance is
now tight: `product-backlog-merge-order-refusals.test.mjs` 223,
`product-backlog-merge-order.test.mjs` 221, and
`product-backlog-merge-direction.test.mjs` 242, so slice 3's report assertions
should budget a split rather than discover the limit late. Slice 3 can reuse the
account this slice established: `mergeBacklogs` now holds the per-branch
reprioritization sets beside the merged work, so `transitions()` can report a
one-sided reorder without a second algorithm.

### 3. Report actual reconciled changes without false no-change claims
Type: Behavior
Status: done
Proof: extend CLI stdout assertions and run `bash tests/product-backlog.sh`.

For a one-sided queue reorder, the persisted priority and report must agree;
the report must not say neither branch changed the ancestor. The same rule
applies to supported surrounding-text changes. Identical unchanged versions
retain a truthful no-change result. Assert the already-promised added/changed
reports identified by DD-056 as well as the established removals and direction
reports, using semantic signals rather than freezing incidental wording.
Reuse the shared reconciliation outcome; do not build a second merge algorithm
inside the reporter. Sizing: one externally observable reporting correction
and its focused proof loop; no new machine protocol or audit log.

Accepted proof: `bash tests/product-backlog.sh` reported 83 tests, 83 pass, 0
fail, 0 skipped. Boundary: the real CLI at
`src/skills/dough-product-backlog/scripts/product-backlog.mjs` run as a child
process against scratch projects, asserted on actual stdout, exit code, and
destination bytes. Inspected locations, all in the new
`tests/support/product-backlog-merge-report.test.mjs`: "merge report names a
one-sided reprioritization instead of claiming nothing changed", which observes
the published order and that the report names the reprioritized work and no
other; "merge report does not read work shifting up behind a removal as a
reprioritization", which observes that the report names only the removal; and
"merge report says neither branch changed the ancestor only when neither did",
which keeps the no-change claim truthful. Assertions read the report's meaning —
the identity named and the kind of change named — rather than whole lines, so
wording can improve without a test standing in the way.

The report now says `reprioritized "<id>" in "## Backlog list"` where the
audited revision said "neither changed the ancestor", and names changed text
above or below the two lists. `reportMerge` needed no change: it was already
truthful once handed a truthful change list.

DD-056 closure: the `added`, `changed`, `removed`, and no-change outputs now
carry assertions alongside the already-asserted direction and removal lines. The
implementation's mutation table reported all seven outputs biting, and the
coordinator independently blanked the `reprioritized` line and observed the new
report tests fail before restoring the source and re-confirming 83 passing.

Learnings: `readVersion`'s epilogue starts at the next `##` heading after the
queue, so free text appended below the last queue entry is parsed as an
unsupported list line and refused; any later test exercising text below the
lists must give it a heading. An item that is both value-changed and
reprioritized emits two lines, which is truthful but has no scenario producing
it in the suite. A relocation that changes only the link while the identity is
retained will report as `changed "<id>", now in "## <list>"`, which slices 5 and
6 may want to phrase more specifically. New merge-report assertions belong in
`product-backlog-merge-report.test.mjs` rather than the three files near the
250-line guidance.

### 4. Retain recorded identities independently of navigation
Type: Behavior
Status: planned
Proof: extend the existing adoption CLI cases; run `bash tests/product-backlog.sh`.

Explicitly adopt active entries into a representation that records their full
identity independently of links, preserving already allocated values in stories,
backlog entries, and active plans. A correction's old path may remain its opaque
ID; it need not remain its destination. Repeating or resuming adoption reuses
the same IDs, preserves membership/order/direction, and cannot allocate twice.
Keep readable legacy inputs supported and collision refusals intact. Align the
shared parser/renderer and ordinary operations with this single representation.
Carry the same recorded ID through the existing source guidance in
`src/skills/dough-story-decomposition/references/seed-format.md` and
`src/skills/dough-story-refinement/references/planning.md`. Link to one identity
contract in the backlog skill instead of restating competing allocation rules.
Review one story-to-plan example for preserving the recorded value after a
location change. Keep this to record/preserve semantics; mandatory script
routing, installation, and native-use proof remain successor responsibilities.
Sizing concern: round-trip and mixed-format compatibility cross existing callers;
keep the change in the shared identity model, not per-command exceptions.

### 5. Refresh a relocated home while retaining its identity
Type: Behavior
Status: planned
Proof: extend refresh CLI journeys; run `bash tests/product-backlog.sh`.

After an identified story's canonical home is moved or renamed, `refresh` must
accept the new location carrying the same recorded ID even when the filename
omits the old seed token or the navigation anchor changes. Apply the same rule
to a correction plan moved to a different directory. Verify the unchanged ID,
membership, priority, unrelated entries, and direction through a subsequent
operation addressed by that ID. Replace tests enforcing the rejected restriction
with positive relocation proof. Keep wrong-ID, duplicate-home, and genuinely
ambiguous identity refusals; do not create a general document-moving tool.
Sizing: one relocation outcome using slice 4's representation and existing home checks.

### 6. Reconcile a relocated item as the same work
Type: Behavior
Status: planned
Proof: extend reconciliation CLI cases; run `bash tests/product-backlog.sh`.

From an identified ancestor, generate one branch with a refreshed moved home
and another with a compatible title change. Merge to exactly one item carrying
the original ID, new link, and changed title; swapping sides has the same result.
Retain supported legacy/adopted matching and removal-versus-change refusals.
Do not equate conflicting recorded IDs merely because their links coincide;
identity ambiguity stops without publishing. Reuse the shared identity and
three-way comparison rules, with no relocation-specific resolver or history log.
Sizing: one cross-branch identity-preservation journey and refusal boundary.

## Execution and review gates

All slices remain planned. No numeric execution limit was supplied. When
execution is separately requested, use the established execution/refactor and
delivery gates, keeping each slice's proof and accepted learning here. Passing
these corrections does not establish Git gating, standalone delivery, or host
protection. All reported core corrections, including the confirmed identity
correction, are now owned here. The successor's handoff is updated to recognize
this dependency; its original slices 11–17 remain that story's responsibility.
Six slices remain; their count is not evidence that execution will be small.
Order-change attribution (slice 2) and legacy identity compatibility (slice 4)
remain the sizing risks. If either requires another independent behavior or
integration proof loop, reassess the boundary before extending the work. Do not
absorb delivery or general error-handling work to clear the successor's list.

## Provenance manifest

The reviewed history contains no interleaved unrelated implementation between
the original planning commit and closure. `ad15f85` immediately before it is
unrelated Claude background-mode refinement and is excluded.

| SHA | Relationship |
| --- | --- |
| `6063439` | Original story refinement and executable plan; provenance only |
| `4441586` | Execution claim and Taken transition |
| `ff8987d` | Slice 1: scripted add/write safety; execution identity |
| `7eeafdb` | Slice 2: identity adoption |
| `67fd664` | Slice 3: take/resume |
| `0a9bf66` | Slice 4: completion |
| `bc5ed17` | Slice 5: queue placement/return |
| `4b8719c` | Slice 6: reference refresh and relocation restriction |
| `63cf411` | Slice 7: explicit direction editing |
| `9f82d79` | Slice 8: item reconciliation and reports |
| `cccd0fb` | Slice 9: ordering reconciliation |
| `b75c3dc` | Slice 10: direction reconciliation proof |
| `47aea5d` | Concluded execution after slice 10 |
| `f6ec7f8` | Split and queued successor |
| `d7af102` | Earlier review findings and successor obligations |
| `46ce42d` | Integrated core; recoverable final execution record |
| `b017cc5` | Closure/cleanup; current revision reviewed |

## Execution identity

Execution started 2026-09-18 by an explicit `/dough-execute-plan 58` request.

- Originating checkout: `/Users/terryyin/git/open-dough`; resolved integration
  branch `main`. This correction is absent from both active backlog lists, so no
  queue claim or **Taken** transition applies.
- Execution checkout: `/tmp/open-dough-058.m8uW3C/worktree`; execution branch
  `claude/quick-058-preserve-backlog-merge-intent`, created from `2941a3d`.
- Integration checkout: `/Users/terryyin/git/open-dough`, branch `main`;
  authorized remote target `origin`, pushing the execution branch.
- Mode: Story Branch Mode. Replanning permission: preserved existing authority
  (neither `--replan` nor `--no-replan` was supplied).
- CI: GitHub Actions, verified workflow selector `ci.yml` and display name `CI`,
  observing branch `claude/quick-058-preserve-backlog-merge-intent`. Observer
  directory `/tmp/dough-ci-501/watch-YjbHWt`; host bridge readiness confirmed.
- Pre-execution baseline: `bash tests/product-backlog.sh` passed 76 tests with
  0 failures and 0 skips at `2941a3d`.
