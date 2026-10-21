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

<a id="normalize-delivery-commit-identities"></a>

### 1. Normalize commit identities before delivery comparisons

**Identity:** SEED-008#normalize-delivery-commit-identities
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / outcome:** Developers and agents using managed delivery can supply a
full or uniquely abbreviated published-base commit ID and get the same correct
publication decision, without misleading reconciliation refusals or an
unobserved fallback push. Terry selected this bounded
[ODF-142](../../docs/maintainer/findings/ODF-142.md) response on 2026-10-22,
immediately after SEED-010's one-cycle evaluation.

**Evidence and limits:** ODF-142 retains two distinct ordinary executions on
0.3.56: Pygardon's `SEED-094#story-production-observations-without-round-trips`
and Doughnut's `SEED-066#prompt-dictation-results`. The former records a plain
push without observation after refusal; the latter records a failed call and
three source reads before a successful full-ID retry. Preserve their qualified
historical diagnoses and occurrence identities.

The 2026-10-20 Codex chat **Analyze Lights on Software Factory**
(`01a158e8-bfbc-7822-ba5e-a165605db3cd`) reports a controlled probe using the actual
publication function and temporary local Git repositories: a unique ten-character
base on an existing target produced the misleading rebase error with no push;
the same full ID succeeded without reconciliation; already-published recovery
made no extra push; and an abbreviated base on a new target already succeeded.
The temporary probe artifacts were removed. This is reported controlled evidence,
not another production occurrence or a new run by this story. The 2026-10-22
source review still found the raw/full string comparison; recheck it during
refinement against the then-current implementation.

**Existing owner and gap:** [Remote containment](../../src/skills/dough-execute-plan/scripts/publication-git.mjs)
lets Git resolve the base, but [publication](../../src/skills/dough-execute-plan/scripts/execution-increment-publication.mjs)
compares `remoteTip !== previouslyPublishedBase` without canonicalizing that
argument. The resulting unnecessary replay can reach the legitimate
[unchanged-candidate refusal](../../src/skills/dough-execute-plan/scripts/execution-increment-reconciliation.mjs).
[Request parsing](../../src/skills/dough-execute-plan/scripts/execution-increment-request.mjs)
currently checks presence and passes the argument onward. Reuse the existing Git
resolution utilities and the resolution-before-comparison pattern in
[history-preserving candidates](../../src/skills/dough-execute-plan/scripts/history-preserving-candidate.mjs).

**Scope:** Resolve the supplied published-base identity unambiguously to a commit
at the existing live delivery boundary, then use that canonical identity
consistently in comparisons and result/recovery facts. Inspect reached callers so
the same boundary behaves consistently. Invalid, ambiguous or noncommit input
gets an actionable refusal naming the input problem and a permitted next step,
before rewrite or publication. The resolution must identify the supplied commit,
never substitute current HEAD or today's remote tip. Existing ownership,
containment, candidate, reconciliation and proof checks retain their meaning.

**Acceptance criteria:**

- On the existing-target case, a full base and its unique abbreviation produce
  equivalent accepted candidates and canonical full-ID receipts/comparisons,
  without unnecessary reconciliation or the misleading no-op-rebase error.
- Creating a new execution target with the same valid abbreviation still works;
  existing full-ID calls remain valid. A blanket full-ID-only refusal is not the
  selected response.
- Invalid, ambiguous and noncommit inputs receive specific, truthful refusals
  with no rewrite or push. A valid but unpublished base still fails containment;
  a genuinely different validated candidate still fails candidate matching.
- A real remote advance still requires the applicable reconciliation and proof.
  Preserve the legitimate unchanged-candidate guard and existing refusal tests;
  do not obtain a passing case by removing safety checks.
- An already-published retry, including a lost acceptance response and a later
  remote tip, recovers the original candidate/base without another commit or
  duplicate push. The separate [retained-comparison contract](../../src/skills/dough-execute-plan/scripts/publication-comparison.mjs)
  continues to require full immutable commit IDs; do not relax resume validation
  merely to accept abbreviated live input.
- Add discriminating regressions through the maintained delivery path, reusing
  the existing local Git fixtures and [reconciliation tests](../../src/skills/dough-execute-plan/scripts/execution-increment-publication-reconciliation.test.mjs).
  Demonstrate the representation mismatch on the prior behavior and its corrected
  result, alongside the safety and recovery cases above.

**Evaluation and follow-up:** After delivery, update ODF-142's supplied finding
record with the response revision, proof, release/adoption state when known and
remaining limits under [finding status](../../docs/maintainer/finding-names.md#retained-evidence).
Keep it unresolved until supported evidence permits a stronger disposition.
The next ordinary eligible use should record input form, decision, failed calls,
recovery effort and any false refusal; controlled acceptance alone does not
establish field effectiveness or a measured saving.

**Effort uncertainty:** Consistent canonical identity across live input,
publication and retained recovery while preserving the existing contracts.
No calibrated effort band is assigned.

**Prerequisites / safe stopping point:** Reuse the delivered publication
machinery. Queue order does not create a dependency on Story 10. The correction
is independently useful without another workflow engine, new observer, generic
lint framework or autonomous feedback implementation. This is queued planning
input, not authorization to implement or release it.

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
