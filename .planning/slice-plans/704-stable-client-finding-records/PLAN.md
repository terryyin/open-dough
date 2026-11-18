# Keep client finding evidence and IDs stable

**Source:** [Store duplicate finding evidence once and preserve IDs across log recreation](../../seeds/SEED-402-stable-client-finding-records.md#keep-client-finding-evidence-and-ids-stable)
**Identity:** SEED-402#keep-client-finding-evidence-and-ids-stable

## Goal and scope

A maintainer can identify a finding and recover the account for each execution after the client log is shortened or recreated. The change covers two existing writing decisions for findings that already qualify. Admission criteria belong to the [SEED-401 pilots](../../seeds/SEED-401-retrospective-finding-pilots.md). Historical findings serve as read-only examples. Client sweeps, historical renumbering, release and rollout are outside this story.

## Decisive premises

Observed at preparation revision `73902add1`. The commands below use existing Git objects or an isolated local Git fixture.

| Decision | Observation and result |
| --- | --- |
| What a pinned link must recover | In Pygardon, `git show ddb61fbcd4b54a217669d7f3d2e42ac21ace1a41:DearDough.md` supplies DD-393. In Open Dough, `git show 692bf5162b86fca9cbebc1c57c98efd227198e9d:docs/maintainer/findings/ODF-153.md` contains its complete eight-line occurrence verbatim, including execution commit `2a35d2d00`, unknown timestamp, release 0.3.78, observed investigation and qualified inference. Other executions occupy the same shared file. Pygardon's `83a41a176:DearDough.md` preserves the pin, local alias and project decision. The two cleanup commits in the seed show the cost of repeated text. Slice 1 checks replay under the changed guidance. |
| Why checking the current path alone can misallocate | In Terry Talks, `git log --name-status --follow -- DearDough.md` shows three add/delete pairs. Reading the file with `git show <revision>:DearDough.md` at the three seed revisions returned DD-001 for a failed preceding check, composited depth review, and full export respectively. The recording reference currently starts a new log at DD-001 before its existing matching and high-water rules. |
| What evidence is available when the log is absent | In a scratch Git repo, the first revision had empty path history. A later `git log --name-status --follow -- DearDough.md` showed deletion, an R100 rename from `former.md`, and its original addition. Reading the old blob at its revision returned adopted ODF-003, alias DD-002 and “Highest allocated local number: 7”. A depth-one clone of the same deleted state gave empty history for both paths and `git rev-parse --is-shallow-repository` returned true. Only the full fixture supported recovering that floor. |

## Ordered slices and outside-in proof

### 1. A client occurrence links directly to its verified shared account

Type: Behavior
Status: planned

During shared collection, follow the existing reconciliation and adoption steps. Before shortening the client entry, resolve the proposed link at its exact committed revision and path. Compare the project, execution and observation, including provenance and uncertainty. Replace only verified duplicate narrative with one pinned locator. Keep the local heading, any former aliases, execution identity and project-only facts or links. Preserve the existing pin on an identical reread. If the target is missing or belongs to another occurrence, retain the affected text.

**Proof.** Walk the [collector](../../../.agents/skills/collect-client-feedback/SKILL.md#collect-reconcile-and-adopt) on isolated copies of the DD-393 source and ODF-153 owner identified above. Inspect the client entry, follow its pin to the exact occurrence, and compare the recovered account with the input. Repeat collection with the same material and compare source and catalog finding files byte for byte. Use a client-only effect and local link as controls. Include another execution with the same symptom and a missing or wrong destination. Check each execution remains individually identifiable, each local addition survives, and no unsupported shortening occurs. For published source evidence the pin must resolve at the revision readers receive, including if the catalog commit changed during integration.

### 2. A recreated client log remembers its earlier allocations

Type: Behavior
Status: planned

When an enabled retrospective has a supported write and the canonical log is missing, use relevant project history, including known former paths and retained high-water metadata, to establish whether this is first use or recreation. Match against the recovered findings by concrete evidence. For a new finding, mint the next DD number above the greatest reservation in current or recovered DD and adopted ODF headings, former local allocations and retained high-water metadata. Preserve the recovered floor across later writes even when the first returning finding has a lower number. An identity or allocation gap that prevents a safe write leaves the log absent and identifies the missing evidence.

**Proof.** Walk [process-finding recording](../../../Distribution/src/skills/dough-execution-retrospective/references/process-finding-recording.md) from an eligible write in disposable Git histories. In first-use history observe DD-001. Use the moved-and-deleted fixture above for two independent starts. A different finding gets DD-008. A verified recurrence of ODF-003 keeps its identity and DD-002 alias, then a different finding still gets DD-008. Inspect the resulting file and high-water information after each write. In the depth-one deleted state with no other recovery evidence, observe the specific gap and the still-absent file. Reopen the three Terry Talks revision-qualified references to distinguish the historical collisions. An ordinary existing-log reread still adds no row for an unchanged execution.

## Current decisions and gates

- The collector owns cross-repository shortening. Extend its existing [retention guidance](../../../.agents/skills/collect-client-feedback/references/retention-and-watch.md) and step 5 where needed. Reconciliation owns the catalog, adoption owns approved names, and the supplied inventory and publication sequence already belong to collection. An isolated review can exercise those decisions without invoking a live feedback cycle.
- The retrospective recording reference owns local matching and numbering. Reuse its [bounded-write safeguards and metadata](../../../Distribution/src/skills/dough-execution-retrospective/references/bounded-process-log.md). Project triage already links to this numbering rule. Keep the existing triggers and authority for each caller. Ordinary Git history and the existing log format suffice.
- Keep the collector internal and edit the recording guidance in its Distribution source. Use the [maintainer behavior review](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review) for each slice. These ordinary guidance edits use the existing source boundaries and representative proof under [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md), [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) and [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
- Local gates for each slice are its representative walk, inspection of the file or refusal it produced, and `git diff --check`. Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md). If a long full run becomes necessary, start fully awake on AC with `caffeinate -s -i`. On battery, plug in or keep the lid open under `caffeinate -i` and check the sleep log afterwards. [Machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
- Size each slice for 15 active minutes. Each changes one existing decision and carries its own focused walk. Slice-plan refinement was unnecessary because the two decisions have distinct callers and observable results. No remaining slice-specific concerns were identified.
