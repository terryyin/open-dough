---
id: SEED-008
status: active
planted: 2026-09-08
planted_during: unknown
trigger_when: when evaluating or designing branch/worktree workflows for trunk-based development
scope: unknown
---

# SEED-008: Execute stories with continuous trunk integration

## Why This Matters

Developers and agents prepare changes in owned workspaces and share validated
increments through the project's remote trunk. The same publication contract
serves worktrees on one machine and clones on different machines. The default
local checkout is optional and may remain the developer's playground. Automated
work derives its shared baseline and publication evidence from the authorized
remote branch; safe local refresh is a separate convenience.

The selected direction is described in
[ADR 0009 — Git branching and integration](../../docs/adrs/0009-git-branching-and-integration.md).
Terry authorized this backlog alignment on 2026-09-21. The ADR retains Proposed
status; this seed records desired outcomes for implementation planning. Terry's
2026-09-28 decision below replaces the proposed default-checkout coordination
outcome without changing ADR status or execution authority.

## Stories

<a id="land-unfinished-stories-without-retirement"></a>

### Land unfinished story changes without retiring their execution workspace

**Identity:** SEED-008#land-unfinished-stories-without-retirement
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** Developers who need to release an intermediate story result
before completing its remaining execution or acceptance work.

**Outcome:** The developer can publish reviewed story changes to trunk while
keeping the unfinished story's workspace, branches, assignment and dashboard
continuation usable. Landing an increment never implies story completion.

**Agreed behavior (Terry, 2026-10-18):**

- Ordinary `/dough-land` refuses an unfinished story's worktree before committing
  or publishing, explaining the remaining work and the explicit retention
  option. Taken membership alone is insufficient to establish incompleteness:
  inspect remaining slices and completion obligations. Missing or ambiguous
  completion evidence must not permit retirement.
- `/dough-land --keep-worktree` publishes through the existing landing operation
  and applies the existing optional default-checkout refresh, while preserving
  the execution worktree, local branch, remote execution branch, story
  assignment and the context needed to resume from the dashboard.
- Report the distinct outcomes accurately: changes landed, story unfinished,
  resources retained. Keep the story Taken and retain an unfinished dashboard
  report while work remains; do not automatically acknowledge that session as
  Done merely because publication succeeded. Manual session acknowledgment
  continues to leave the story and remaining slices unchanged.
- Completed stories continue through ordinary story wrap-up and its completion
  and retirement gates. Ordinary reviewed work without an unfinished story
  keeps its existing landing behavior. Extend Dough Land; add no separate skill
  or duplicate publication path.

**Acceptance examples:**

| Situation | Required observation |
| --- | --- |
| Thirteen of fourteen slices are done; the last needs a release; ordinary Dough Land is requested | Refuse before commit or publication; preserve the worktree and branches and explain `--keep-worktree` |
| The same story is landed with `--keep-worktree` | Trunk contains its changes; the worktree, both execution branches and assignment remain; the story stays Taken and its next slice is resumable |
| An earlier retained landing is repeated after trunk already contains its changes | No duplicate commit or publication; preserve the same resources and continuation |
| The story is Taken but its execution has completed | Judge the actual completion obligations; queue membership alone does not label it unfinished or authorize closure |
| Completion evidence is missing, or publication fails | Retain recoverable resources and report the precise refusal or failure |

**Evidence:** Pygardon story
`SEED-133#story-sharadar-update-in-ten-minutes` had slice 14 pending when Terry
invoked `/dough-land` to make a release possible. On 2026-10-18 at about
07:23 JST, landing published `490876aafa7ccfc7f34297faad50afcbdb506c74` and
retirement returned `worktree: removed`, `branch: removed`, and
`remoteBranch: removed`. The story correctly remained Taken and the dashboard
report correctly said `unfinished`, but its execution workspace was gone.
The implementation and plan remained on main. This is an intermediate-landing
lifecycle gap, not evidence of false published story completion.

**Effort hypothesis:** Unestimated until refinement checks the landing,
retirement and dashboard continuation boundaries together. No implementation,
release or Pygardon story closure is authorized by queueing this work.

<a id="accept-queued-start-native-behavior"></a>

### Queued-start native acceptance completed

The identity `SEED-008#accept-queued-start-native-behavior` is retired: startup
native acceptance is complete on Codex, Cursor, and Claude Code (Terry's
decision of 2026-09-24 to run the last check outside the executing plan 089).
Ordinary startup, refusal, and Codex/Cursor resume were accepted in plan 82,
recoverable from
`820077c3e7fcf16421c97231eb5bc01bb69ea3dc:.planning/slice-plans/082-accept-queued-start-native/PLAN.md`.
The behavior has been released since 0.3.27, so this is retroactive acceptance.

- **Claude resume: fresh pass (2026-09-24).** Claude Code `2.1.281`, candidate
  `7581b2b`, `publication/startup-resume`. The trace shows only an inspecting
  `--help` before a single startup call returning `resumed` with
  `created: false`, then setup and command, then the first feature edit. The
  fixture origin holds base, exactly one pre-created claim, and the independent
  advance; no claim was pushed again. Human and selected-source bytes were
  preserved and the local refresh was deferred. Run output and the fixture were
  deleted after judging.
- **Candidate reconciliation.** Since accepted candidate
  `02108dfb28cabd05839c3aa16d820ce7d0fc33c7`, `publication-resume.mjs` only
  parameterizes the remote name, the Take guidance only relaxes
  default-checkout refresh declarations, and the startup fixture/assessor split
  setup and command markers more strictly. None invalidates the earlier host
  judgments.

## Publication delivery boundaries

**Parent problem:** Developers executing concurrent work need reliable shared
claims and delivery with less routine agent coordination. Preserve authority,
user work, and truthful remote/CI evidence while reducing total instructions.

**Reviewed decomposition (2026-09-23):** The installed startup operation;
ordinary execution publication plus CI attachment, delivered by plan 083
(recoverable at `463c48a:.planning/slice-plans/083-publish-execution-ci/PLAN.md`);
preparation keep; and closure. The previous separate execution-increment candidate
duplicated the CI story's publication boundary and was absorbed there.
Preparation keep and closure adoption are delivered by the
[Dough Land](../../src/skills/dough-land/SKILL.md) skill. No separate
library, command-framework, or testing-only story is required.

**Alternatives and limits:** Another instruction-only reminder repeats a rule
already installed during the incident. The startup and execution-publication
outcomes remain distinct from the combined Dough Land outcome. Each includes only
the runtime, concise guidance, payload delivery, and proof its outcome needs.

**Effort hypothesis:** No project S/M/L definitions were found. Startup carries
the greatest initial runtime/native-adoption uncertainty. The combined CI/delivery
story adds candidate revalidation and existing-observer attachment, not a new
observer lifecycle. Estimates remain unassigned
pending planning evidence.

<a id="publish-execution-increments-through-shared-operation"></a>

### Execution-increment candidate absorbed into CI delivery

The proposed identity `SEED-008#publish-execution-increments-through-shared-operation`
was never queued. Its outcome was absorbed into the managed execution delivery
of plan 083, avoiding two stories that each wire the same publication boundary.
This is a retired navigation reference, not another candidate.

### Priority rationale and scope reduction

The [product backlog](../PRODUCT-BACKLOG.md) is the sole ordered queue.

- Startup addressed the reproduced claim-visibility failure; its remaining
  native acceptance is complete on all three hosts.
- Managed execution delivery and CI observation shipped in 0.3.33. Terry dropped
  its separate native-acceptance story on 2026-09-24: projects use it
  continuously, deterministic tests cover the mechanism, and a missing or false
  CI signal reported from real use goes through bug fixing. No native
  acceptance is claimed for it.
- Published ownership and execution-branch visibility stay next. They directly
  serve the remote-first dashboard direction and retain higher value than
  migrating every occasional publication caller immediately.
- The first queued story now removes default-checkout dependencies from worktree
  workflows. Terry rejected the local coordination feature on 2026-09-28;
  publication and optional refresh retain shared owners.
- Planning-format validation and existing process follow-ups retain their relative
  order below this cluster. They are not prerequisites for publication.

If reducing investment, retain the first story's complete claim guarantee and
reassess further simplification against actual native use;
no invisible host startup, scheduler, arbitrary-push watcher, or global workflow
registry is selected. No new execution authority or ADR acceptance is implied.

## Existing related stories

<a id="reduce-ci-observer-overhead"></a>

### Reduce CI observer overhead across execution and wrap-up

The retired identity `SEED-008#reduce-ci-observer-overhead` is not queued or
reallocated. Its remaining outcomes are the delivered
[completion operation](../../src/skills/dough-execute-plan/references/ci-monitor.md#await-the-applicable-revision-at-completion)
and the managed execution delivery of plan 083, released in 0.3.33.

Terry's 2026-09-22 Pygardon report described repeated observer setup and handle
transcription, early provisional coverage notifications, and a separate closure
observer cycle. No raw transcript established the repeated-setup cause. The
full investigation is retained in Git at `1352844`.
Later source review corrected the claimed production readiness command: it was
a test substitute. Current story scope replaces the earlier idle-expiry
and ref-watching proposals; do not implement those historical mechanisms.

## Architectural Context

[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports continuous integration and resolving conflicts through shared intent.
[ADR 0005 — Cross-tool validation](../../docs/adrs/0005-cross-tool-validation-accepted.md)
governs behavior and native acceptance evidence.
[ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires shared behavior written for the executing project, with necessary host
adaptation. Follow the [maintainer guideline](../../AGENTS.md) when authoring.

[ADR 0007 — Software development lifecycles](../../docs/adrs/0007-software-development-lifecycles.md)
owns lifecycle discussion;
[ADR 0009 — Git branching and integration](../../docs/adrs/0009-git-branching-and-integration.md)
owns the proposed Git contract. Both retain Proposed status. ADR 0007 records
the unresolved relationship between Story Branch Mode's delayed integration and
Accepted ADR 0002; human resolution of that question remains separate from this
Git migration.
