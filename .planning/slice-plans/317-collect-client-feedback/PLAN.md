# Collect client feedback and prioritize Open Dough improvements

**Identity:** SEED-010#exchange-retrospective-findings-with-another-project

**Source:** [selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#exchange-retrospective-findings-with-another-project)

## Goal and scope

One explicit internal-skill invocation collects shared Open Dough feedback from
the maintained project set, leaves compact and traceable source logs, selects up
to two supported leading Open Dough responses, and commits and synchronizes the
maintenance result in every changed repository. Repeated and partially completed
runs preserve evidence, identity, live work, and accepted publications.

The source owns collection, reconciliation/adoption, compaction, current watch
and noise decisions, challenged ranking, reciprocal stories, and per-project
delivery. Preserve its six key examples and the distinction between missing
evidence, unknown release, unexercised fix, supported recurrence, and resolution.
The current seven-calendar-day watch remains an internal shared-feedback policy.

This does not run project-local improvement selection, execute the resulting
stories, release or install guidance, change product direction, schedule future
runs, or add a feedback database. Story 12 is not a hard prerequisite; Story 13
owns combined local-then-shared orchestration. Missing inputs stop affected work,
not supported independent projects. Preparation does not run the maintenance
cycle against production repositories.

## Current decisions and reuse

- Author the internal `collect-client-feedback` skill under
  `.agents/skills/collect-client-feedback/`, with only a thin Claude discovery
  pointer if needed. Follow [AGENTS.md](../../../AGENTS.md). Keep it outside
  `src/skills/` and the installer payload. Replace the old
  [runbook](../../../docs/maintainer/retrospective-findings-runbook.md) with a
  pointer to the single authoritative workflow, retaining incoming links.
- Reuse `reconcile-retrospective-findings` for identity/evidence,
  `dough-maintain-findings` for approved mapping adoption,
  `triage-retrospective-findings` for ranking/response records, and
  `dough-product-backlog` for canonical placement. The wrapper supplies the
  selected projects, evidence paths, destinations, and explicit invocation's
  collection/cleanup/selection/publication authority. Keep the narrower skills'
  standalone boundaries; do not make encountering a finding an invocation.
- Follow `finding-names.md` to the authoritative linked records. Reconciliation
  and triage prose still contains assumptions about inline catalog entries;
  change navigation at its owning procedure where needed, without a parallel
  matcher or evidence store. Preserve isolated supplied-catalog use. Global
  allocation must also respect historically allocated codes after pruning.
- Reuse the production configuration convention in
  `release-and-update-clients` and `dashboard/server/projectConfiguration.ts`,
  without invoking release/rollout or adopting its implementation wholesale.
  Resolve each repository, configured ref and local path; include Open Dough's
  integration checkout, deduplicate, and account for changes before completion.
  The configuration is discovery input, not permission to alter unrelated work.
- One coherent model serves all examples: project-qualified finding and execution
  identity, retained evidence, response and actual exposure, current disposition,
  reciprocal work links, and repository-specific delivery. The composing skill
  owns cross-project sequencing and watch/cleanup decisions; the existing owners
  retain their domain rules. No per-example handler, central transaction service,
  receipt database, or new persistent phase ledger is needed.
- Use each project's ordinary delivery conventions and owned-result isolation.
  Where Dough Land applies, pass the explicit maintenance keep authority through
  its maintained handoff, adapting that handoff's caller contract if necessary.
  A whole-checkout landing must contain only the cycle's result. Do not copy its
  Git algorithm, blanket-stash, include unrelated commits, or force a push.
  Keep evidence recoverable before shortening a source; independently confirmed
  origin acceptance, checkout refresh, and a full-cycle result remain distinct.
- [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  governs cohesion and proportionate reuse;
  [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) governs
  internal versus released guidance and actual response versions;
  [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) governs
  behavior evidence and bounded native observations;
  [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  governs one behavioral source and explicit location roles. No Accepted conflict
  or exception was found. [NORTH-STAR.md](../../NORTH-STAR.md)'s machine-local
  configuration boundary is preserved; no new topic is warranted.

## Preparation observations and limits

Observed on 2026-10-19 in the established preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/collect-client-feedback-and-prioritize-open-doug`
at `1b3c54fbeeb8bb0afd1ee3baa073239639453134`, using Node 24.21.0.

| Premise and consuming operation | Result-bearing observation |
| --- | --- |
| Current discovery can resolve repositories and targets without the runbook's fixed paths | Read `~/.open-dough/dashboard/projects-production.json` with Python `json.loads`, then for every expanded `localPath` ran `git -C <path> rev-parse --show-toplevel`, `remote get-url origin`, `branch --show-current`, and `status --short`, and tested `<path>/DearDough.md`. Five origins matched configured identities. Open Dough, Doughnut and Pygardon used `main` and had logs; Terry Talks and Lizard used `master` and lacked logs. Terry Talks had unrelated work. This settles the current read/identity route, not future availability or publication authority. |
| Existing Git delivery supports exact-target acceptance, repeat/resume, and preservation of other work | `PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/execution-increment-publication.test.mjs src/skills/dough-execute-plan/scripts/publication-resume.test.mjs src/skills/dough-execute-plan/scripts/publication-checkout-maintenance.test.mjs` exited 0. Inspected fixtures use real local bare origins and assert remote refs/content, repeat commit counts, and unchanged checkout/index bytes. No production remote was used. |
| Acceptance proof distinguishes an attempted push from actual delivery | In a scratch edit to `publication-git.mjs`, omitted only `tryPushExactRef`'s call to `pushExactRef`. `node --test --test-name-pattern='Story Branch Mode increment publishes' src/skills/dough-execute-plan/scripts/execution-increment-publication.test.mjs` exited 1 with `remote did not accept the candidate`. Restored original bytes; the same command exited 0 with one passing test. Scratch changes were removed before recording refinement. This tests the reusable publication boundary, not the new wrapper. |
| Ranking, ownership and incomplete sync are evidenced needs | The [runbook-history review](../../../docs/maintainer/empirical-process-control-research.md#runbook-automation-follow-up) documents actual user corrections and the October 12 instruction to also sync Open Dough. The current runbook excludes commit/push; the catalog index points to separate files. These inspected records establish the design mismatch, not fresh proof of old outcomes. |

Reconciliation, ranking and guidance composition are agent judgments. Their
future reliable execution cannot be inferred from files being present or from
the Git tests. Only native use can settle that premise; slice 1 owns a permitted
early probe after its minimal draft, with existing paid-run authorization. A
failed or unavailable probe stops dependent slices for repair/replanning. No paid
or native agent session ran during preparation. Later effectiveness remains a
watch question rather than a readiness premise for delivering this skill.

Plan 317 follows the highest allocated plan number 316, checked across current
paths and Git history immediately before creation.

## Outside-in proof ownership

Judge resulting files, qualified identities/occurrences, live links, queue order,
accepted remote contents, and preserved unrelated bytes. A narrative self-report,
exit 0, source keyword check, or helper-only test cannot establish the composed
skill outcome. Use AGENTS.md's representative behavior review; do not build a
prose conformance suite. Keep each native prompt task-based without supplying
the expected classification or ranking.

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
Status: planned
Proof: Examples 1–3 through representative review and one bounded native first-use
journey reaching real result files and local-origin acceptance, followed by an
unchanged replay.

Behavior: Given selected project records and explicit maintenance invocation,
the internal skill resolves the maintained set and targets, collects shared
evidence, reconciles/adopts names, selects up to two supported Open Dough
responses, and delivers the owned maintenance changes in every changed project.
Local-only and uncertain facets remain correctly attributed; missing inputs
limit only dependent work. Existing queued responses are reused; Taken responses
remain ongoing. Repeat reports do not create work or recurrence.

Implement the entry point and complete first-run path, replace the runbook with
its pointer, and align stale catalog-navigation assumptions in existing owners.
Pass source identity, supplied evidence and destination paths explicitly. Keep
collection/adoption/write authority with the invoked wrapper; direct child use
retains its original trigger and limits. Include exact-duplicate compaction and
recoverable retention required by this first run. Record response versus
release/adoption/proof needs before selecting new implementation work.

Use a small isolated Open Dough catalog and two source repositories with bare
origins: linked finding files, colliding local codes, local/shared/uncertain
facets, repeated and distinct executions, a severe one-off, an easy low-value
repair, queued/Taken coverage, and different trunk names. Supply this fixture
inventory explicitly so no production configuration or repository is changed.
Inspect resulting evidence, aliases, story links, order and remote contents.
The fixture is a bounded review aid, not a new general maintenance platform.

Early probe: after the minimal draft, run a fresh available native host with the
existing explicit paid-run authority. Record candidate, host/runtime, literal
command, supplied context and decisive output. It must use the new skill and
its existing children through accepted publication, including Open Dough, without
a repeated routine approval prompt. A launch or direct helper success is
insufficient. If authority, launch or composition is unavailable or fails, stop
dependent work and repair/replan; do not claim readiness of the implementation.

Safe stopping point: the complete initial collection/priority cycle is useful.
Keep existing conservative watch behavior and retain uncertain cleanup candidates;
slice 2 supplies the fuller ongoing cleanup, and slice 3 verifies multi-repository
recovery. Do not claim whole-story completion at this boundary.

### 2. Repeated maintenance reduces records without erasing uncertainty

Type: Behavior
Status: planned
Proof: Examples 2, 4–5 through a bounded repeat-use sequence with independently
reviewed evidence, removals, recovery locators and live story relationships.

Behavior: Given retained occurrences and claimed responses, another invocation
compacts duplicate narrative, follows verified release/adoption and relevant use,
retires a passed watch, removes justified no-action noise, and resurfaces a failed
response without inflating recurrence or losing lineage. Severe one-offs,
unknown versions, unexercised fixes and unresolved consequential reports survive.

Keep the cleanup/watch rules at their single internal owner. Carry preserved
timestamps, execution releases and qualified inference into authoritative finding
files before shortening sources. Follow allocated-code history when a retired
finding returns; continuity and reintroduction remain the reconciliation owner's
decision. Keep pruning reasons recoverable in the maintenance commit/report,
without an archive or false fixed disposition. Resolve live links without
cancelling queued or Taken work under cleanup authority.

Exercise a verified seven-day exposed response alongside an elapsed-but-unused
response, unknown-version report, failed response, severe one-off and redundant
administrative noise. Reinvoke after an actual supplied corrective release/use
change; do not inherit a failed response's watch age. Inspect the authoritative
records and all selected source logs, then their accepted Git contents and the
unchanged-repeat result. Native assessment owns judgment; deterministic checks
may inspect file/link/occurrence and Git outcomes but cannot infer effectiveness.

Safe stopping point: first and repeated complete runs deliver compact,
recoverable records and useful priorities. Partial/concurrent delivery assurance
still belongs to slice 3.

### 3. A partial cycle resumes without repeating completed work

Type: Behavior
Status: planned
Proof: Example 6 and the missing/concurrent-source boundaries in example 1,
through isolated native recovery with real accepted refs and byte preservation.

Behavior: Given a changed or inaccessible source, unrelated checkout work, or
partially accepted publication, the invocation reports the actual per-repository
state and continues safe independent work. A rerun uses retained records and Git
facts to finish only the missing boundary; clients-only success cannot hide
unpublished Open Dough records/backlog. Local refresh may remain deferred after
remote acceptance and is reported separately.

Extend the same first-use fixture with one unavailable origin, one independent
accepted result, and a dirty default checkout. Introduce a racing origin change
and verify the ordinary delivery path reconciles only owned work or returns its
recoverable stop. Resume after restoring availability; assert accepted history
was not recreated, evidence/story counts did not increase, source bytes changed
only as intended and unrelated work survived. Account for a changed inventory
and a missing log without converting absence into successful watch evidence.

Keep recovery in existing records/Git and concise per-run receipts; no second
state machine or permanent run ledger. Cover caller propagation from an explicitly
invoked combined phase using supplied project/authority context without building
Story 13. Review affected shared-authority callers if their contract changed.
Complete useful-behavior review across description, context, examples, references
and pointers. Resolve affected native requirements by actual evidence or justified
reuse under ADR 0005; missing evidence remains explicit work, never a passed claim.

## Verification and execution constraints

The local requirement for conventional guidance is the representative behavior
review in AGENTS.md; implementation, proof and cleanup stay together per slice.
Reuse the exercised Git suites above when that shared behavior changes, adding
focused regression proof for actual helper changes if any. An internal prose
skill does not require installer changes or an unrelated dashboard test run.
Hosted CI configuration alone is not a requirement to run every suite locally.

Execution follows the installed execute-plan workflow, including its independent
post-change refactoring, agent commits, delivery and asynchronous CI duties.
No numeric slice time limit is supplied here; each slice owns one cohesive
outcome and proof loop, with the paid native observation separated as an early
feasibility probe rather than hidden preparation. If evidence requires additional
machinery or changes the promised scope, return that decision instead of expanding
the story. No implementation is authorized by this preparation.

## Learnings

No execution learnings yet. Preparation evidence and its limits are recorded above.
