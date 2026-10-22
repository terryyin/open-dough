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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/342-normalize-delivery-commit-identities/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"43291f2f92f2204143b69cb0ea7906994a6e510631563d806576a8feb174d9cf","plan":"2b20f63dee808d5403d3b3f400d44914cc1877e8e52867989fe84628529d107c"}}
```

**Goal:** Developers and agents who run managed delivery with a full or a
uniquely abbreviated published-base commit ID get the same correct publication
decision, receipt, and recovery facts, so a shortened ID copied from a receipt
or a log never produces a misleading reconciliation refusal, an unobserved
plain push, or a source-reading detour. This is Terry's bounded response to
[ODF-142](../../docs/maintainer/findings/ODF-142.md), selected on 2026-10-22
immediately after SEED-010's one-cycle evaluation: it removes wasted delivery
attempts and coordinator intervention without another workflow engine.

**Evidence:** ODF-142 retains two ordinary 0.3.56 executions, Pygardon's
`SEED-094#story-production-observations-without-round-trips` (a plain push
without observation after the refusal) and Doughnut's
`SEED-066#prompt-dictation-results` (one failed call and three source reads
before a full-ID retry); their qualified diagnoses and occurrence identities
stay there. The 2026-10-20 Codex chat **Analyze Lights on Software Factory**
(`01a158e8-bfbc-7822-ba5e-a165605db3cd`) reported a controlled probe with the
actual publication function in temporary repositories. Refinement on
2026-10-22 repeated that probe in this preparation's workspace at `f6e19749`
with the same function and the clean-trunk fixture, and observed:

- a unique ten-character base on an existing target stops with `rebase left
  the pre-rebase SHA as the candidate` and pushes nothing; the full ID is
  accepted without reconciliation;
- the same abbreviation on a new target, and on an already-published retry,
  is accepted, but the receipt's `suffixBase` is the abbreviated string
  rather than a commit ID;
- an abbreviation of the candidate itself (an empty suffix) is classified
  `already-published`, where the full ID is accepted without that
  classification;
- an unknown string, a blob ID, and an ambiguous four-character prefix all
  stop as `unpublished-base`, naming the raw input.

The cause is the raw string comparison in the live publication
(`remoteTip !== previouslyPublishedBase` and the already-published check)
while containment lets Git resolve the same input. The probe artifacts were
removed.

**Scope:**

Required behavior:

- At the live delivery boundary that every managed publication passes
  (deliver, fresh, wrap-up closure, and Dough Land's use of the shared API),
  resolve the supplied published-base input to exactly one commit in the owned
  workspace after the fetch, then use that full commit ID in every
  comparison, classification, retained comparison, receipt, and stop or
  recovery fact. A full ID and its unique abbreviation give identical results.
- Resolution identifies the supplied commit only. The input is a hexadecimal
  object ID, full or abbreviated; a ref name such as `HEAD` or a branch is not
  a published base and is refused, because accepting it would substitute
  today's HEAD or tip for the recorded base.
- Input that names no object, more than one object, or a non-commit object is
  refused before any rewrite, push, or observation, with a stop that names the
  input, the problem (unknown, ambiguous, or not a commit), and the permitted
  next step: supply the full ID from the delivery receipt. `unpublished-base`
  keeps its meaning, a resolved commit that no fetched remote ref holds.
- Existing containment, candidate-match, unchanged-candidate (no-op rebase),
  reconciliation, proof, ownership, and already-published checks keep their
  meaning and their tests; none is weakened to make a case pass.

Rejection constraints: non-hex input and ambiguous or non-commit objects are
refused because the story requires that resolution never substitute another
commit. The retained-comparison contract in
[publication comparison](../../src/skills/dough-execute-plan/scripts/publication-comparison.mjs)
keeps requiring full immutable IDs on resume, because retained facts must be
immutable; live canonicalization is what makes every retained comparison
satisfy it.

Deferred promises: no change to abbreviated input anywhere other than the live
delivery base (resume's `--suffix-base` and `--validated-candidate` keep their
current contracts); no new workflow, observer, lint, or guidance rewrite
beyond the usage and reference lines that describe the argument; no
measurement of field effectiveness, which follows under Evaluation.

Boundary assumptions: Git's own abbreviation rules decide uniqueness, so a
prefix unique today may be ambiguous later, and the refusal then names it.
The owned workspace holds the previously published base after the fetch, as
every current caller already assumes.

**Key examples:**

1. Existing target, remote unchanged, base supplied as its first ten
   characters → deliver → accepted without reconciliation; the receipt and
   `suffixBase` carry the full base ID, and the result equals the full-ID call.
2. Existing target advanced by another writer, abbreviated base → deliver →
   one reconciliation onto the fetched tip with applicable proof required,
   exactly as with the full ID.
3. New execution target with no remote tip, abbreviated base → deliver →
   accepted; the retained comparison and receipt carry the full ID.
4. Candidate already on the remote after a lost acceptance answer,
   abbreviated base → deliver → `already-published` acceptance with no new
   commit or push and the full ID in its facts; an abbreviation of the
   candidate itself (empty suffix) behaves as the full ID does.
5. Base is an unknown string, an ambiguous prefix, a blob or tree ID, or a ref
   name → deliver → a refusal naming the input and the problem and asking for
   the full ID from the receipt; nothing is rewritten, pushed, or observed.
6. Base resolves to a commit the fetched remote does not hold → deliver →
   `unpublished-base`, as today, naming the full ID.
7. The branch already sits on the advanced tip while the supplied base is
   older → deliver → the existing unchanged-candidate refusal, unchanged.

**Evaluation and follow-up:** After delivery, update ODF-142's supplied finding
record with the response revision, proof, release/adoption state when known and
remaining limits under [finding status](../../docs/maintainer/finding-names.md#retained-evidence).
Keep it unresolved until supported evidence permits a stronger disposition.
The next ordinary eligible use should record input form, decision, failed calls,
recovery effort and any false refusal; controlled acceptance alone does not
establish field effectiveness or a measured saving.

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
