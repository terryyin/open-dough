# Use released ADR guidance on one real Donut task

## Source and readiness

Source: [SEED-006 Story 2](../../seeds/SEED-006-extend-adr-guidance-adoption.md#prepare-donut-adr-adoption).
Status: completed 2026-09-07 against Donut SEED-009 Story 5 / Plan 045 using
public `v0.2.1` in native Codex. [Plan 015](../quick/015-prepare-donut-adr-adoption/PLAN.md)
records release identity, installation, native use, and coexistence.

The prior three-tool plan was reduced to a scope record; no completed slices
belong to this story. This replaces that record, retaining the one-task boundary.

## Goal and scope

The Donut maintainer receives a supported answer from released
`dough-adr-awareness` in native Codex to this question:

> Does the planned isolated single-note deletion — complete-diff isolation
> before mutation, soft-delete that leaves authored links, keeping the
> notebook or folder container without manufacturing a README, and rolling
> back on publication failure — respect current notebook-format and
> failure-handling guidance? Which constraint confirms the approach, calls
> for a correction, or requires a human decision before deletion work proceeds?

Selected task: Donut SEED-009 Story 5, “Delete a note locally without
transferring its private data,” currently #1 on Donut's product backlog. Read
its existing Plan 045 and record one concise reviewed conclusion there. A
supported confirmation is useful; changing the design is not required. A real
task/ADR conflict may produce a precise human decision as the result; an
unresolved delivery or skill/context gap leaves this adoption incomplete.

Include inspection of the latest public release, installation/update in the
Codex root, only required existing adopter context, explicit fresh native use,
and evidence of preserved guidance and unrelated work.

Exclude implementing, verifying, or replanning deletion, repairing Donut
fixture deadlocks, later SEED-009 stories, other tasks/tools, caller repair,
original removal, automatic-use proof, shared-source changes, generic
migration/recovery, further publication, and new release or test
infrastructure. Story 2b owns other tools; Story 3 owns cleanup.

## Execution context and current decisions

- Open Dough checkout: `/Users/terryyin/git/open-dough`.
  Live target: `/Users/terryyin/git/doughnut`; do not use a disposable fixture
  or an isolated Donut worktree as evidence of this live adoption.
- Source repository: `https://github.com/terryyin/open-dough.git`, the existing
  project's public source. Use its latest numeric release, selected and pinned
  through [the existing installation procedure](../../../docs/installation-and-updates.md).
  Reuse authorization for the bounded story; do not run the updater's optional
  equivalence/replacement/cleanup flows.
- Read-only public tag check on 2026-09-07 originally found latest `v0.2.0`,
  which lacked Plan 013 replacement sections and Plan 014 request-scoped
  context behavior. Public `v0.2.1` is now published: annotated tag
  `1ed5a78cdd748e75f2cb25a39e1c0efa7d46d60e`, peeled commit
  `22b65e63090836b5441c8b4c9a4b3e8afd271d50`. Slice 1 must independently fetch
  and inspect that identity before any installer run. Local working source and
  fixture tags remain non-substitutes.
- On inspection, Donut had neither `.agents/skills/dough-update/` nor
  `.agents/skills/dough-adr-awareness/`; the expected path is fresh installation.
  Its original `.agents/skills/adr-awareness/SKILL.md` remains present.
  Recheck actual state before writing. An existing compatible managed install
  uses the ordinary inspected update flow; local edits, unsafe topology, or
  legacy bootstrap needs are gaps, not permission for a forced overwrite.
- Donut's `.cursor/rules/architecture-decisions.mdc` links its ADR playbook and
  original skill. Keep that link and every caller unchanged. The playbook/index,
  relevant records, and explicitly scoped request are the starting context;
  no context edit is currently known to be needed. If one original-only fact
  is essential, retain only that existing fact in the local architecture rule,
  with provenance and no copied behavioral workflow or invented policy.
- Donut inputs: `.planning/seeds/SEED-009-git-backed-local-notebook-workflow.md`,
  `.planning/quick/045-publish-local-note-deletion/PLAN.md`, and
  `docs/adrs/README.md`. ADR 0004, **OKF-compatible notebook Markdown**, and
  ADR 0006, **Failure handling**, are current relevant starting points; ADR 0002
  remains Proposed. Let fresh use inspect status/successors and choose any other
  actually relevant decision. Do not prescribe a verdict or turn this into
  implementation or deadlock-repair testing.
- Donut HEAD `151b81bd08` was clean at retarget. Open Dough may have concurrent
  planning edits. Snapshot current state, including relevant untracked paths and
  symlink targets, before writes; preserve those edits. Compare changes with
  that baseline, not a clean HEAD. If concurrent edits overlap, reconcile
  ownership; never reset either checkout.
- Allowed Donut writes: the three public payload files and Codex updater
  `VERSION`; if actually needed, existing facts added to the architecture rule;
  and one assessment entry in Plan 045. No other tool root, original skill,
  caller/link, ADR, application code, or home guidance may change.
- Open Dough [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) preserves
  human decision ownership. [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  requires a maintainer-supplied version and immutable published tag. Neither
  decision is changed. Proposed ADRs remain non-binding.

## Outside-in proof and contract ownership

| Promise / story example | Owner | Observable proof |
| --- | --- | --- |
| Use the eligible public release, never branch/fixture content | 1; identity preserved in 2 | Fresh Git tag selection, exact fetched commit, inspected call chain/payload and metadata; required behavior is present |
| Missing release or stale target stops dependent work | 1 | Recorded eligibility result and unchanged live target; changed task returns to selection before installation |
| Codex receives the declared release with usable request context | 2 | Three payload byte comparisons plus installed version; required facts reachable without original skill; exact allowed-path diff |
| Original, links/callers, ADRs, other tools, unrelated and concurrent work survive | 1 baseline; 2 and 3 comparison | Relevant hashes/symlink targets and tracked/untracked state match except the named allowed writes; report concurrent changes separately |
| Fresh native discovery/invocation uses the installed shared skill independently | 3 | Native catalog/expansion or successful skill read plus skill-specific behavior; transcript contains no load of original contents |
| Useful deletion-plan assessment, including supported confirmation | 3 | Current ADR citations, reasoning against the actual deletion plan, reviewed conclusion and concrete next step in Plan 045 |
| Real task/ADR conflict remains human-owned | 3, only if encountered | Specific incompatible choice and human decision recorded; no exception/status invented and no dependent implementation |
| Missing context, ambiguous status, or ineffective skill leaves acceptance pending | 2 or 3 at observation | Exact gap recorded, no completion claim or original-skill fallback; no speculative repair |
| Release identity, exact changes, evidence and temporary cleanup are recorded | Each owning slice | This plan contains durable observations; owned temporary files cleaned on success or stop, with evidence retained first |

## Ordered execution leaves

### 1. Establish whether the public release can support this live assessment
Type: Behavior
Status: done — 2026-09-07; public `v0.2.1` eligible, Plan 045 still live, no Donut writes
Proof: One read-only release-and-target eligibility decision, recorded here.

Behavior: A newer public release is available and the selected task remains
relevant → inspect that release and current target → the maintainer can see
whether this exact release is suitable for the bounded live installation, or
which concrete prerequisite prevents proceeding.

Use Git to select latest, fetch its peeled commit into an owned temporary
checkout, and inspect the installer/helper call chain, all three public sources,
VERSION and changelog before any fetched code runs. Follow the existing staged
procedure; record source/tag/commit and verify the two required behaviors.
Do not assume a version number alone proves either behavior. Recheck Plan 045,
selected native roots and existing context; record the current preservation
baseline. Do not modify Donut or manufacture a substitute release.

Stop-safe: an unsuitable release or stale task leaves the target unchanged.
On a gap, retain the finding here and remove the owned checkout. On success,
retain its absolute temporary path only until slice 2, with explicit cleanup
ownership across tool calls; no trap in an earlier exiting shell may remove it.
Sizing: about five minutes of inspection and recording; a single network fetch
is an external-wait exception. Broad dependency repair is excluded.

### 2. Make the inspected guidance available for the next Codex assessment
Type: Structure
Status: done — 2026-09-07; Codex `v0.2.1` installed at live Donut; original preserved
Proof: Installed-payload identity and preservation check at the live target.

Internal change: Use the inspected installer for the fresh Codex installation,
following its release-selection recheck. Write only the three declared public
files and `.agents/skills/dough-update/VERSION`. If live state has changed,
use the eligible ordinary update path described above or stop on the precise
gap. Do not force through a collision or invoke optional replacement.

Verify installed bytes/version against the same snapshot and current context
reachability. Only if needed, retain an existing original-only fact in the
architecture rule while preserving all existing instructions and links. An
unknown policy or broader context change is a stop, not a new task in this plan.
Record exact changes and compare protected paths/state with slice 1's baseline.
Clean the owned release checkout after comparisons on success or failure.

Unchanged external behavior: the original remains effective for all existing
callers/tools; ADR policy and deletion publication behavior are unchanged. An incomplete
installation remains explicitly incomplete; no success/rollback claim.
Immediately enables: slice 3's independent explicit native use on the real task.
Sizing: about five minutes including comparison, evidence, and cleanup. The
inspected installer is reused; no product or harness implementation is needed.

### 3. Obtain and apply the ADR assessment to the deletion task's next step
Type: Behavior
Status: done — 2026-09-07; native Codex assessment recorded in Plan 045
Proof: One fresh native assessment, reviewed against current inputs and recorded
in the real task's existing work record, with preservation verified.

Behavior: The inspected shared skill is installed with sufficient request
context → explicitly invoke it in fresh native Codex on the selected question
→ Plan 045 contains a supported conclusion and actionable next deletion step.

Reuse `tests/support/native-codex.sh` from Open Dough as a temporary read-only
native runner; do not run the disposable adoption scripts against the live repo.
Its interface is `native_codex_prepare <owned-proof-dir> <protected-Donut-root>`
then `native_codex_run <Donut-root> <answer-file> <prompt> <JSON-transcript>`.
The protected Donut root forbids native writes; output/state stay in the owned
proof directory. Keep the sandbox protection intact. This runner starts a fresh
`codex exec --ephemeral --ignore-user-config` session in the actual target.

The prompt explicitly invokes `$dough-adr-awareness`, gives the selected question
and Donut story/plan paths, asks for relevant current ADR citations and the
concrete next step, and limits work to read-only assessment. Instruct it to use
the installed shared skill, not load the original `adr-awareness` contents,
implement deletion, repair fixtures, or propose/approve policy. Do not paste the
shared or original workflow or expected conclusion into the prompt. Existing
links stay intact; explicit selection in this request supplies the skill choice.

Review discovery/expansion and actual behavior, including absence of original
loads; a separate shell read is not required if native expansion proves loading.
Review the answer against Plan 045 and cited current records. If supported,
append one concise assessment entry to Plan 045 with source release, citations,
conclusion and next step; preserve all existing leaves and readiness state.
Record decisive native observations and release/preservation evidence here.
A concrete human conflict decision is a valid assessment result; do not execute
that decision. A skill/context failure or unhelpful answer leaves this slice
pending and revisits further adoption priority, without repeat-until-pass prompts.

Check that native use made no Donut writes and the coordinator's final diff
contains only the assessment entry beyond slice 2's writes. Preserve raw output
until decisive evidence is durably recorded, then clean the owned proof directory
on success or failure. No new test suite, app startup, or deletion implementation.
Sizing: about five minutes of active assessment review, recording and cleanup;
one native model invocation may take longer as an explicit external wait.
Review/comparison work itself is not exempt from the active-work limit.

## Slice-plan refinement

The requested refinement reviewed the proposed installation-to-assessment flow
before finalizing these leaves; no execution attempt or overrun has occurred.

| Candidate boundary | Classification | Final boundary |
| --- | --- | --- |
| Inspect release, prepare target, install, then prove use together | Refine: eligibility, payload preservation, and useful native advice are separable observations | 1 eligibility decision → 2 immediately enabling installation → 3 useful assessment |
| Install guidance as its own completed user outcome | Refine: installation alone does not deliver this story's value | Structure 2 immediately before Behavior 3 |
| Generate advice, then separately record it as another slice | Refine: unreviewed output does not yet help the real task | Review and durable task conclusion remain together in Behavior 3 |

Each final leaf has one proof loop, a safe stopping point, and an approximately
five-minute active-work hypothesis. Fetch/model waits are the only stated
exceptions; if active work exceeds five minutes, check for hidden work. At ten
minutes, safely park only attempt-owned work, record evidence, and apply Donut's
problem-decomposition learning escalation. A second non-exempt overrun requires
story review, not another automatic split. Do not expand this one-tool outcome.
All final promises above have an owning slice; none is satisfied by this plan.

## Per-platform evidence and remaining questions

| Platform | Reusable evidence where behavior/delivery is unchanged | New live evidence |
| --- | --- | --- |
| Codex | Story 1's explicit/automatic discovery/use and context checks; unchanged installation/update coverage linked from its evidence record | 2026-09-07 live Donut: public `v0.2.1` installed for Codex; explicit `$dough-adr-awareness` produced `## ADR CHECK COMPLETE`; Plan 045 records the reviewed conclusion. Original skill was not loaded. |
| Cursor | Story 1's independent native discovery/invocation, context and coexistence proof; linked delivery evidence | Pending Story 2b; not executed or inferred here |
| Claude Code | Story 1's independent native discovery/invocation, context and coexistence proof; linked delivery evidence | Pending Story 2b; not executed or inferred here |

Any shared rule/skill change invalidating reuse needs separately scoped native
acceptance for discovery, invocation/application, behavior, affected delivery,
and coexistence in all three tools. This plan adds no such change.

All slices done. Public `v0.2.1` and Donut SEED-009 Story 5 / Plan 045 were
the selected release and live task. Native Codex assessment is recorded in
Plan 045.

## Learnings

- Public tag enumeration confirms the previously recorded release gap; it is
  not an assumed blocker or a reason to enlarge adoption into release work.
- The live Codex target currently needs fresh installation, and existing local
  context has no demonstrated gap for this request. No generic migration,
  automatic discovery repair, or new native harness is justified.
- Slice 1 independently selected public `v0.2.0`, annotated tag
  `426acffe15d6227098d1282a3115690d7569cdf4`, peeled commit
  `676188a66504f7dc751e03311f9be5245757b24a`. Inspection of its complete
  installer/helper chain, three payloads, `VERSION`, and changelog confirmed it
  still lacks Plan 013's replacement sections and Plan 014's request-scoped
  context behavior. No fetched code ran, and the operation-owned checkout was
  removed.
- The selected Donut boundary is no longer live: Plan 047 was deleted by
  `97999a207a` (`docs: complete reliable login history story`), SEED-014 is
  absent at current Donut HEAD `685d77db71`, and Donut's product backlog records
  the login story as recently done. Substituting another task would change this
  story's scope and requires story review under the borrowed execution rules.
- Donut remained unmodified by this attempt. It still has no managed Codex Open
  Dough installation; the original ADR skill and architecture-rule link remain,
  and ADR 0005 and ADR 0006 remain Accepted. Concurrent Donut worktree changes
  appeared and cleared during inspection; this task neither authored nor reset
  them.
- Resume recheck (borrowed execute-plan, 2026-09-07) independently selected the
  same public `v0.2.0` identity (`426acffe15d6227098d1282a3115690d7569cdf4` /
  `676188a66504f7dc751e03311f9be5245757b24a`). The peeled commit still has the
  unconditional context-list preamble and lacks Plan 013 replacement sections
  and Plan 014 request-scoped context behavior. No fetch-to-run or target write
  occurred. Live Donut is now clean `151b81bd08` (`chore: update VSCode settings
  and clean up user step definitions`); Plan 047 and SEED-014 remain absent,
  login recovery remains in Donut's recently done backlog, and Codex Open Dough
  files remain uninstalled. Open Dough's current-host CI mailbox is unavailable
  in this checkout, so this resume promised no CI observation.
- After that stop, `v0.2.1` was finalized and pushed (`22b65e63090836b5441c8b4c9a4b3e8afd271d50`).
  Donut's product-backlog #1 is SEED-009 Story 5 / Plan 045; Story 2 and this
  plan were retargeted to that live task. Slice 1 must inspect the new public
  identity independently.
- Slice 1 independently selected public `v0.2.1`, annotated tag
  `1ed5a78cdd748e75f2cb25a39e1c0efa7d46d60e`, peeled commit
  `22b65e63090836b5441c8b4c9a4b3e8afd271d50`. Owned checkout
  `/private/tmp/open-dough-015.Ski5Bn/release` matches that HEAD. Inspected
  installer/helper chain, three payloads, `VERSION` `0.2.1`, and changelog
  `## 0.2.1 - 2026-09-07`. Skill SHA-256
  `ff023b773bf9c5fc5f0f7cf09259df2b96044d28de93f24820820457cc62cd4e` has the
  request-scoped preamble; recognition contains Assessment / Retain context /
  Switch callers; updater defers to those sections. No fetched installer ran.
  Live Donut remains clean `151b81bd08` with Plan 045 and SEED-009 present,
  Codex Open Dough files absent, original skill
  `3717b94b62a9bee2810805f910180e6bb648ef382c8e5c8557e81ce00e06cf75`,
  architecture-rule link unchanged, ADR 0004/0006 Accepted and ADR 0002
  Proposed. Checkout retained for slice 2.
- Slice 2 rechecked `resolve-url` still returned `v0.2.1` /
  `22b65e63090836b5441c8b4c9a4b3e8afd271d50` / `0.2.1`, then ran the inspected
  `install.sh --platform codex` with no `--force`. Installed bytes match the
  snapshot; recorded version `0.2.1`. Exact Donut writes are the four allowed
  Codex files. Original skill and architecture-rule hashes are unchanged.
  No architecture-rule edit was required. Owned release checkout will be
  removed after this record.
- Slice 3 ran `codex-cli 0.144.1` via `tests/support/native-codex.sh` against
  live Donut with `$dough-adr-awareness`. The answer cited Accepted ADR 0004
  and ADR 0006, treated ADR 0002 as Proposed, emitted `## ADR CHECK COMPLETE`,
  and named the next Plan 045 step as the existing fixture-deadlock scope
  decision rather than further deletion implementation. Commands read Plan 045,
  Story 5, the ADR index, and relevant records; they did not read
  `.agents/skills/adr-awareness/SKILL.md`. Donut status before and after native
  use was identical (only the four Codex install files). The reviewed
  conclusion was appended to Plan 045. Proof directory
  `/tmp/open-dough-015-proof.KTBOGR` is removed after this record.
