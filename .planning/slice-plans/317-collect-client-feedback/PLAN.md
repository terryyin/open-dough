# Collect client feedback and prioritize Open Dough improvements

**Identity:** SEED-010#exchange-retrospective-findings-with-another-project

**Source:** [selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#exchange-retrospective-findings-with-another-project)

## Goal and scope

One explicit internal-skill invocation collects shared Open Dough feedback from the maintained project set, leaves compact and traceable
source logs, selects up to two supported leading Open Dough responses, and commits and synchronizes the maintenance result in every changed
repository. Repeated and partially completed runs preserve evidence, identity, live work, and accepted publications.

The source owns collection, reconciliation/adoption, compaction, current watch and noise decisions, challenged ranking, reciprocal stories,
and per-project delivery. Preserve its six key examples and the distinction between missing evidence, unknown release, unexercised fix,
supported recurrence, and resolution. The current seven-calendar-day watch remains an internal shared-feedback policy.

This does not run project-local improvement selection, execute the resulting stories, release or install guidance, change product direction,
schedule future runs, or add a feedback database. Story 12 is not a hard prerequisite; Story 13 owns combined local-then-shared
orchestration. Missing inputs stop affected work, not supported independent projects. Preparation does not run the maintenance cycle against
production repositories.

## Current decisions and reuse

- Author the internal `collect-client-feedback` skill under
  `.agents/skills/collect-client-feedback/`, with only a thin Claude discovery pointer if needed.
  Follow [AGENTS.md](../../../AGENTS.md). Keep it outside `src/skills/` and the installer payload.
  Replace the old [runbook](../../../docs/maintainer/retrospective-findings-runbook.md) with a
  pointer to the single authoritative workflow, retaining incoming links.
- Reuse `reconcile-retrospective-findings` for identity/evidence, `dough-maintain-findings` for
  approved mapping adoption, `triage-retrospective-findings` for ranking/response records, and
  `dough-product-backlog` for canonical placement. The wrapper supplies the selected projects,
  evidence paths, destinations, and explicit invocation's collection/cleanup/selection/publication
  authority. Keep the narrower skills' standalone boundaries; do not make encountering a finding an
  invocation.
- Follow `finding-names.md` to the authoritative linked records. Reconciliation and triage prose
  still contains assumptions about inline catalog entries; change navigation at its owning procedure
  where needed, without a parallel matcher or evidence store. Preserve isolated supplied-catalog
  use. Global allocation must also respect historically allocated codes after pruning.
- Reuse the production configuration convention in `release-and-update-clients` and
  `dashboard/server/projectConfiguration.ts`, without invoking release/rollout or adopting its
  implementation wholesale. Resolve each repository, configured ref and local path; include Open
  Dough's integration checkout, deduplicate, and account for changes before completion. The
  configuration is discovery input, not permission to alter unrelated work.
- One coherent model serves all examples: project-qualified finding and execution identity, retained
  evidence, response and actual exposure, current disposition, reciprocal work links, and
  repository-specific delivery. The composing skill owns cross-project sequencing and watch/cleanup
  decisions; the existing owners retain their domain rules. No per-example handler, central
  transaction service, receipt database, or new persistent phase ledger is needed.
- Use each project's ordinary delivery conventions and owned-result isolation. Where Dough Land
  applies, pass the explicit maintenance keep authority through its maintained handoff, adapting
  that handoff's caller contract if necessary. A whole-checkout landing must contain only the
  cycle's result. Do not copy its Git algorithm, blanket-stash, include unrelated commits, or force
  a push. Keep evidence recoverable before shortening a source; independently confirmed origin
  acceptance, checkout refresh, and a full-cycle result remain distinct.
- [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md) governs
  cohesion and proportionate reuse; [ADR
  0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) governs internal versus
  released guidance and actual response versions; [ADR
  0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) governs behavior evidence and
  bounded native observations; [ADR
  0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md) governs one
  behavioral source and explicit location roles. No Accepted conflict or exception was found.
  [NORTH-STAR.md](../../NORTH-STAR.md)'s machine-local configuration boundary is preserved; no new
  topic is warranted.

## Preparation observations and limits

See [execution observations](proof/observations.md#preparation-observations-and-limits).

## Outside-in proof ownership

Judge resulting files, qualified identities/occurrences, live links, queue order, accepted remote contents, and preserved unrelated bytes. A
narrative self-report, exit 0, source keyword check, or helper-only test cannot establish the composed skill outcome. Use AGENTS.md's
representative behavior review; do not build a prose conformance suite. Keep each native prompt task-based without supplying the expected
classification or ranking.

| Story promises | Owner | Observable proof |
| --- | --- | --- |
| Example 1: explicit invocation, actual inventory/targets, complete collection/adoption and publication including Open Dough | 1 | An isolated multi-repository invocation follows linked findings, adopts qualified mappings, queues supported responses and reaches each local bare origin on its correct target, including a `master` fixture. A non-invoking context starts no writes. |
| Examples 2–3: distinct occurrences, preserved local/uncertain findings, no duplicate response, challenged top-two selection | 1 | Compare source snapshot to retained evidence and logs; inspect canonical goals, reciprocal links, existing queued/Taken work, direction and unaffected order. Severe one-off versus easy/imagined benefit cases test actual ranking. Unchanged repeat adds no story, occurrence or commit; fewer supported problems yields fewer selections. |
| Examples 4–5: compact records, watch, retirement, recurrence, recoverable noise disposition and live-work protection | 2 | A repeat-use sequence changes release/adoption/exposure inputs; inspect retained versus removed entries, distinct occurrence locators, historical-code recovery, live story links, and concise pruning reasons. Unknown/unused fixes remain unpassed; eligible evidence retires and a supported failure resurfaces. |
| Example 6 and incomplete-source part of example 1: partial delivery, rerun, concurrent work and truthful coverage | 3 | In isolated repositories, block one origin, race another and preserve dirty unrelated bytes. Confirm other accepted SHAs; resume only the unfinished boundary without extra commits or stories. Omitted Open Dough publication remains incomplete even when clients succeeded. A missing log/configuration is reported without invented success. |
| One internal source across Codex, Cursor and Claude Code, with unchanged standalone child boundaries | Each changed slice | Review each affected entry point and conditional reference. Use the ordinary shared skill mechanism and only necessary pointer adaptation. Obtain risk-selected native behavior evidence or explicitly justified reuse for affected hosts; do not infer one host's behavior from another or add routine discovery checks. |

## Ordered slices

### 1. One explicit cycle delivers traceable shared-feedback priorities

Type: Behavior
Status: done
Proof: Examples 1–3 through representative review and one bounded native first-use journey reaching real result files and local-origin acceptance, followed by an unchanged replay.

Behavior: Given selected project records and explicit maintenance invocation, the internal skill resolves the maintained set and targets,
collects shared evidence, reconciles/adopts names, selects up to two supported Open Dough responses, and delivers the owned maintenance
changes in every changed project. Local-only and uncertain facets remain correctly attributed; missing inputs limit only dependent work.
Existing queued responses are reused; Taken responses remain ongoing. Repeat reports do not create work or recurrence.

Implement the entry point and complete first-run path, replace the runbook with its pointer, and align stale catalog-navigation assumptions
in existing owners. Pass source identity, supplied evidence and destination paths explicitly. Keep collection/adoption/write authority with
the invoked wrapper; direct child use retains its original trigger and limits. Include exact-duplicate compaction and recoverable retention
required by this first run. Record response versus release/adoption/proof needs before selecting new implementation work.

Use a small isolated Open Dough catalog and two source repositories with bare origins: linked finding files, colliding local codes,
local/shared/uncertain facets, repeated and distinct executions, a severe one-off, an easy low-value repair, queued/Taken coverage, and
different trunk names. Supply this fixture inventory explicitly so no production configuration or repository is changed. Inspect resulting
evidence, aliases, story links, order and remote contents. The fixture is a bounded review aid, not a new general maintenance platform.

Early probe: after the minimal draft, run a fresh available native host with the existing explicit paid-run authority. Record candidate,
host/runtime, literal command, supplied context and decisive output. It must use the new skill and its existing children through accepted
publication, including Open Dough, without a repeated routine approval prompt. A launch or direct helper success is insufficient. If
authority, launch or composition is unavailable or fails, stop dependent work and repair/replan; do not claim readiness of the
implementation.

Safe stopping point: the complete initial collection/priority cycle is useful. Keep existing conservative watch behavior and retain
uncertain cleanup candidates; slice 2 supplies the fuller ongoing cleanup, and slice 3 verifies multi-repository recovery. Do not claim
whole-story completion at this boundary.

### 2. Repeated maintenance reduces records without erasing uncertainty

Type: Behavior
Status: done
Proof: Examples 2, 4–5 through a bounded repeat-use sequence with independently reviewed evidence, removals, recovery locators and live story relationships.

Behavior: Given retained occurrences and claimed responses, another invocation compacts duplicate narrative, follows verified
release/adoption and relevant use, retires a passed watch, removes justified no-action noise, and resurfaces a failed response without
inflating recurrence or losing lineage. Severe one-offs, unknown versions, unexercised fixes and unresolved consequential reports survive.

Keep the cleanup/watch rules at their single internal owner. Carry preserved timestamps, execution releases and qualified inference into
authoritative finding files before shortening sources. Follow allocated-code history when a retired finding returns; continuity and
reintroduction remain the reconciliation owner's decision. Keep pruning reasons recoverable in the maintenance commit/report, without an
archive or false fixed disposition. Resolve live links without cancelling queued or Taken work under cleanup authority.

Exercise a verified seven-day exposed response alongside an elapsed-but-unused response, unknown-version report, failed response, severe
one-off and redundant administrative noise. Reinvoke after an actual supplied corrective release/use change; do not inherit a failed
response's watch age. Inspect the authoritative records and all selected source logs, then their accepted Git contents and the
unchanged-repeat result. Native assessment owns judgment; deterministic checks may inspect file/link/occurrence and Git outcomes but cannot
infer effectiveness.

Safe stopping point: first and repeated complete runs deliver compact, recoverable records and useful priorities. Partial/concurrent
delivery assurance still belongs to slice 3.

### 3. A partial cycle resumes without repeating completed work

Type: Behavior
Status: done
Proof: Example 6 and the missing/concurrent-source boundaries in example 1, through isolated native recovery with real accepted refs and byte preservation.

Behavior: Given a changed or inaccessible source, unrelated checkout work, or partially accepted publication, the invocation reports the
actual per-repository state and continues safe independent work. A rerun uses retained records and Git facts to finish only the missing
boundary; clients-only success cannot hide unpublished Open Dough records/backlog. Local refresh may remain deferred after remote acceptance
and is reported separately.

Extend the same first-use fixture with one unavailable origin, one independent accepted result, and a dirty default checkout. Introduce a
racing origin change and verify the ordinary delivery path reconciles only owned work or returns its recoverable stop. Resume after
restoring availability; assert accepted history was not recreated, evidence/story counts did not increase, source bytes changed only as
intended and unrelated work survived. Account for a changed inventory and a missing log without converting absence into successful watch
evidence.

Keep recovery in existing records/Git and concise per-run receipts; no second state machine or permanent run ledger. Cover caller
propagation from an explicitly invoked combined phase using supplied project/authority context without building Story 13. Review affected
shared-authority callers if their contract changed. Complete useful-behavior review across description, context, examples, references and
pointers. Resolve affected native requirements by actual evidence or justified reuse under ADR 0005; missing evidence remains explicit work,
never a passed claim.

## Verification and execution constraints

The local requirement for conventional guidance is the representative behavior review in AGENTS.md; implementation, proof and cleanup stay
together per slice. Reuse the [exercised Git suites](proof/observations.md#preparation-observations-and-limits) when that shared behavior
changes, adding focused regression proof for actual helper changes if any. An internal prose skill does not require installer changes or an
unrelated dashboard test run. Hosted CI configuration alone is not a requirement to run every suite locally.

Execution follows the installed execute-plan workflow, including its independent post-change refactoring, agent commits, delivery and
asynchronous CI duties. No numeric slice time limit is supplied here; each slice owns one cohesive outcome and proof loop, with the paid
native observation separated as an early feasibility probe rather than hidden preparation. If evidence requires additional machinery or
changes the promised scope, return that decision instead of expanding the story. No implementation is authorized by this preparation.

## Slice 1 accepted proof

See [accepted proof](proof/observations.md#slice-1-accepted-proof) and related [learnings](proof/observations.md#learnings) in the execution
observations.

## Story obligations

### G1. Full retention and response transitions (first reported in slice 1)
Reported: slice 1 — "Actual release/adoption/exposure transitions, seven-day retirement, failed-response resurfacing, new-watch age, recoverable noise pruning and live-link protection through removals remain for slice 2."
Story clause: "Unreleased, unused, and unknown-version cases cannot pass that watch."
Disposition: proved by slice 2: [repeat-use observations](proof/observations-2.md) and actual accepted finding/watch/source contents establish release/use distinctions, retirement, failed-response continuity, fresh corrective watch age, recoverable pruning, historical identity and preserved live work; fresh Claude replay preserves all three HEAD/tree/count/origin snapshots.

### G2. Partial and concurrent delivery (first reported in slice 1)
Reported: slice 1 — "Unavailable/racing origins, partial-delivery recovery, unrelated dirty-byte preservation, deferred refresh, changed inventory/missing logs and clients-only publication refusal remain for slice 3."
Story clause: "A partial run keeps completed work and names unfinished writes or syncs; resume without duplicate collection, stories, or commits."
Disposition: proved by slice 3: [partial/recovery observations](proof/observations-3.md) and assess-partial-use.py first/clients/finish/missing-config inspect actual origins, retained candidates, stable accepted client history/push counts, raw private/index/source bytes, deferred refresh, changed inventory and truthful missing-input reports. Accepted final Open Dough afa5184b687fb827e6049bea7e5bdb34ed0eb57d contains the original retained suffix; seed/backlog bytes and seven occurrences survive.

### G3. Guidance edge paths lack separate native runs
Reported: slice 1 — "Separate native cases for a non-invoking context, zero/one actionable selections and isolated inline-catalog standalone use were not run; their source contracts were reviewed."
Story clause: "Zero or one actionable problem yields zero or one selection."
Disposition: proved by slice 1: [representative behavior review](proof/observations.md#slice-1-accepted-proof) inspects invocation exclusion, validated writable destinations, preserved inline-catalog route and fewer-than-two selection through report/delivery; current authoring changed no production findings. These conventional guidance paths require behavior review, not separate native cases; no native result is inferred.

### G4. Retired identity remains in watch summary
Reported: slice 2 — "Actual watch file confirms retired ODF-004 plain-code summary remains."
Story clause: "retire the eligible finding from active/watch/source records with Git recovery."
Disposition: proved by slice 2: [corrective continuation](proof/observations-2.md#corrective-continuation), actual watch at accepted a54a95a45d79066129b5e6954a58f4db5648500c and assess-repeat-use.py second show retired ODF-004/018 absent from maintained catalog/watch/source records while pre-removal Git evidence remains; the initial incomplete observation is retained.

### G5. Independent race actor used the pushing checkout
Reported: slice 3 — "Git's pre-push environment made the actor's git -C reuse the pushing worktree's GIT_DIR, so it published the candidate rather than its independent commit."
Story clause: "Preserve unrelated and concurrent work."
Disposition: proved by slice 3: [corrected fixture](proof/observations-3.md#corrected-fixture-and-native-sequence); actual alpha origin 0a51020ea12b8426d428cf1ff05f2be51e6d17ca contains independent 54a2d0219e3b2eaa6132629e7a87d49be10a4448, with rejected/reconciled candidates in pre-push records, one maintained reconciliation and only the owned source delta. Initial invalid race evidence remains distinguished.

### G6. Existing provenance reported absent
Reported: slice 3 — "The first run also falsely reported cited provenance files absent despite actual files existing."
Story clause: "Collect shared findings, preserve missing evidence in the authoritative Open Dough finding records"
Disposition: proved by slice 3: [original claim and correction](proof/observations-3.md#preserved-initial-incomplete-observation); coordinator confirms original cited files existed. Corrected native stream reads evidence/usage.md and alpha's VERSION/response-guidance bytes; actual partial and recovery reports verify v0.2.1 provenance, retaining only genuine coverage and age limits.

### G7. Supplemental beta ownership assertion lacked a stage rerun
Reported: slice 3 — "A supplemental beta owned-path assertion was added to the clients branch afterward; that particular assertion was not rerun against the earlier clients-only stage."
Story clause: "Preserve unrelated and concurrent work."
Disposition: proved by slice 3: coordinator's [immutable beta ownership check](proof/observations-3.md#supplemental-beta-ownership-observation) runs the equivalent Git diff on the exact clients-stage accepted SHA, confirms its sole changed path is DearDough.md, and confirms equality with finish/current origin master; no phase reconstruction or native rerun is needed.

## Execution context

- Established start: `SEED-010#exchange-retrospective-findings-with-another-project`,
  publisher `dashboard-territory.local-open-dough`, agent `ruuf-chan`.
- Reused owned execution checkout:
  `/Users/terryyin/git/open-dough/.worktrees/collect-client-feedback-and-prioritize-open-doug`,
  branch `codex/collect-client-feedback-and-prioritize-open-doug`, Story Branch Mode.
  Integration/default checkout: `/Users/terryyin/git/open-dough`.
- Origin: `git@github.com:terryyin/open-dough.git`, trunk `main`.
  Starting revision `73f1b19eebec713a9e0ef9e538d5828808b5d75f`;
  accepted claim and initial published base
  `ae9e5d4feed9f5ff6db44fead22612fccbad259a`.
  Increments target `refs/heads/codex/collect-client-feedback-and-prioritize-open-doug`; latest accepted `d4beef0752b806559fdcfb6baebb4d396c8c8b53`, suffix base `6222747bc602a10c1ed833bc0d128e61ec2b005f` (slice 2; observer reused).
- Changed since readiness review remains recorded; the selected source and plan
  still describe the same three-slice outcome. Execution does not renew readiness.
  Existing planning authority is retained; no explicit no-replan restriction.
- Checkout setup: Node `24.21.0` matches `.node-version`; `npm ci` and
  `PATH=/opt/homebrew/bin:$PATH npm test -- tests/test-runner-selection.sh`
  both exited 0 in this checkout on 2026-10-19. Lockfile unchanged.
  `.githooks/pre-commit` is check-only (staged lint, then dashboard typecheck
  only for staged scripts); coordinator owns formatting and hook execution.
- Codex observer: cell `9`, session `70216`, PID `43710`, directory
  `/tmp/dough-ci-501/watch-kzR7nb`, coordinator `ruuf-chan-execution`.
  GitHub workflow `ci.yml` verified active with display name `CI`, observing the
  execution branch from the execution checkout. The trunk claim is unobserved;
  managed delivery registers increments on this retained stream.
