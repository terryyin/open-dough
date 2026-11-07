# Observe hosted proof before marking a progress-published slice done

**Identity:** SEED-010#observe-progress-revision-before-slice-done
**Source:** [Selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#observe-progress-revision-before-slice-done)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Give the coordinator one discoverable sequence from a guarded `progress: true`
publication to accepted evidence and guarded `done`. Use the exact published
revision and keep the same observer available for repairs, later slices, and
the normal execution-completion action. A records-only done delivery follows
existing CI applicability. The goal is to eliminate the extra foreground watch
for that delivery. The workflow may still schedule a run for it.

The change is to the maintained Execute Plan guidance. Keep the existing
observer, Intent, obligation, and guarded fresh interfaces. CI trigger changes,
combining progress and done into one publication, installation changes, release,
and rollout are outside this slice.

**Failure policy.** [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to execution, verification, delegation, and repair handoffs.

**Local gate.** Walk the representative uses below and run `git diff --check`.
Use the [focused proof commands](#outside-in-proof) for affected contracts and
guidance consumers. The coordinator runs the existing selective `npm run format`
at delivery. The commit hook owns staged lint. For long runs, follow the
[maintained macOS sleep guard and power condition](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Start fully awake and run under `caffeinate -s -i` on AC power. On battery,
plug in or keep the lid open under `caffeinate -i` and inspect the sleep log
afterward.

## Existing solutions and decisions

- Put the sequence where [guarded fresh delivery](../../../src/skills/dough-execute-plan/references/fresh-increment.md)
  returns the accepted publication and attachment. Link it from the
  [delivery checklist](../../../src/skills/dough-execute-plan/references/wrap-up.md)
  and [completion mechanics](../../../src/skills/dough-execute-plan/references/ci-completion-wait.md).
  Reuse the [observer's applicability and repair rules](../../../src/skills/dough-execute-plan/references/ci-monitor.md)
  and the project's documented Intent CI status read where the plan requires a
  summary. The mailbox supplies the verdict and attribution, and Intent
  supplies the same attempt's summary where required. Completion owns observer
  shutdown at its existing boundary. These responsibilities already have homes.
- Keep one shared, project-relative instruction in the maintained source under
  `src/skills/dough-execute-plan/`. Follow [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  for release provenance, [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  for representative behavior review and evidence reuse, and
  [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  for instructions addressed to the executing agent. The
  [North Star](../../NORTH-STAR.md) keeps dashboard observations separate from
  execution ownership. This story needs no new direction or host adapter.
- Ordinary Story Branch execution is sufficient. The slice need not act from
  trunk. The response revision and first containing release, or unreleased
  status, are recorded in the finding at story completion.

## Decisive premises observed during preparation

Observations were made in the preparation checkout on `36ad4ee47` on 2026-11-07.
The test commands below use the maintained source checkout and disposable
observer and Git fixtures. They do not wait on a live CI provider.

| Premise and consuming operation | Observed result and remaining limit |
| --- | --- |
| A coordinator starting from guarded progress delivery lacks a named observation step. | Walked `wrap-up.md` step 5 into `fresh-increment.md`'s progress field and accepted receipt. Neither gives a reader command. `ci-completion-wait.md` shows `complete-revision` and bars it after ordinary delivery, with `await-revision` mentioned only as a low-level reader. The [retained Clipboard cases](../../../docs/maintainer/findings/ODF-418.md#odf-418) show the consequence: a direct `gh` watch on `7d55a1b` and `1f75f4a`, an inferred mailbox read on `5380548`, and a dashboard proof read on repair `15d276ba`. |
| The slice can name a working read-only command and keep the same observer. | `node --test src/skills/dough-execute-plan/scripts/ci-mailbox-await.test.mjs` invokes the real `await-revision DIRECTORY SHA` CLI against a registered revision. It returns `CI_OBSERVER` success with the requested SHA, target and exact attempt after pending, leaves delivery state and worker lifetime intact, and distinguishes failure, missing registration and unavailable observation. Clipboard's `5380548` example independently retains the same command form and successful run 41656910713. |
| Guarded delivery can publish the required source first and enforce the gate on `done`. | `node --test src/skills/dough-execute-plan/scripts/execution-increment-fresh-progress.test.mjs` showed that the selected slice stays planned with its receiving obligation open, ordinary fresh refuses while it stays open, and ordinary fresh changes it to done with accepted proof. The recovery case confirms the exact candidate can be accepted without a second preparation. |
| The existing observer distinguishes CI applicability from exact hosted proof. | `node --test src/skills/dough-execute-plan/scripts/ci-path-applicability.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox-await.test.mjs` showed an ignored-only descendant follows its applicable ancestor to success or failure, a triggering change requires its own coverage, and an exact attempt can supersede inherited coverage. `node --test src/skills/dough-execute-plan/scripts/ci-mailbox-complete.test.mjs src/skills/dough-execute-plan/scripts/ci-integrated-state-journey.test.mjs` showed completion preserves exact and ignored-only evidence, handles declared integrated-state policy separately, and owns shutdown. The Clipboard records-only commits cited above triggered CI in their observed executions. |
| Intent can supply the required summary for a specific hosted attempt. | Clipboard `SEED-004#publish-clipboard-ci-proof` on 0.3.86 retained the Intent counts `770/0/33` on run `42028715651` for progress repair `15d276ba`, before done `4479368b`. Replay uses that recorded read for attribution. The current [adapter read contract](../../../src/skills/dough-execute-plan/manuals/custom-ci-proof.md) matches attempt and full revision; this plan has no dependency on current Clipboard credentials or CI state. |

## Outside-in proof

| Source promise | Slice 1 observation |
| --- | --- |
| Discoverable read-only progress step for a slice in an active plan | Starting at the delivery checklist, walk `SEED-001#bounded-helper-owner-write` using its recorded progress publications. The guidance names `node '<installed-execute-plan>/scripts/ci-mailbox.mjs' await-revision '<attached mailbox>' FULL_ACCEPTED_SHA`, with the exact target, attached mailbox, and `receipt.sha` after any rewrite. The receipt remains attributable, obligations are settled before ordinary fresh without `progress`, and the observer continues. |
| Final-slice evidence and records-only applicability | Replay `SEED-003#host-independent-desktop-free-tests` and `SEED-004#publish-clipboard-ci-proof` from the finding. The first retains exact CI evidence. The second checks the matching run and attempt in Intent before accepting the summary. Walk both the observed triggering records and the fixture's ignored-only case. The normal completion operation remains after the normal final record, using the last accepted registered revision and applicable evidence. No extra watch is prescribed for done paperwork. |
| Failure, missing evidence, and ordinary delivery boundaries | Walk a failed receipt and a no-verdict or mismatched proof case. Keep the slice planned, send owned failures through the existing repair route, and use the accepted repair SHA for any required new proof. Inherited or integrated-state evidence can satisfy applicable CI under existing policy. A story promise about its own published revision requires evidence of that revision. A slice whose CI is observational uses ordinary delivery. |
| Evaluation traceability | Keep the walkthrough and attributable proof in the plan while active. At completion record the actual response revision and first containing release or explicit unreleased status in [ODF-418](../../../docs/maintainer/findings/ODF-418.md), with [ODF-275](../../../docs/maintainer/findings/ODF-275.md) cross-reference and an ordinary-use observation still open. |

For the unchanged interfaces, reuse matching preparation receipts while their
paths and profiles still match. For the edited guidance, run the existing
guidance consumers under `src/skills/dough-execute-plan/scripts/`, including
`ci-completion-lifecycle-guidance.test.mjs`, `story-obligations-guidance.test.mjs`,
and any other consumers reached by the actual edit. Recheck changed assumptions
with the focused runtime suites above. Use the scenario walkthrough for the
new instruction and review invocation, required context and useful outcome under
[AGENTS.md](../../../AGENTS.md#behavior-review). A live push or dashboard run
would repeat historical observations without exercising new runtime behavior.

## Slices

### 1. Observe published proof and settle the slice through guarded delivery

Type: Behavior
Status: done
Proof: The three Clipboard walkthroughs and the negative and applicability
cases above exercise the edited guidance from its existing entry point.

A coordinator has a planned slice that needs hosted evidence of its own
publication. Guarded progress publishes the implementation and leaves the
slice planned. The revised guidance gives the exact read-only observation,
evidence acceptance and ordinary guarded done transition. The observer stays
owned by the same execution until its established completion action. Keep the
existing proof and source-freshness checks in the delivery checklist. Put the
whole sequence and its boundary examples in this slice so delivery never
points at a partial procedure.

**Accepted proof.** Walked SEED-001#bounded-helper-owner-write,
SEED-003#host-independent-desktop-free-tests, and
SEED-004#publish-clipboard-ci-proof against
`fresh-increment.md## Observe progress proof` and the delivery checklist link
in `wrap-up.md`. Guidance names
`ci-mailbox.mjs await-revision` on the attached mailbox and `receipt.sha`,
keeps Intent summary via `custom-ci-proof.md`, leaves failed evidence planned,
routes repair through `ci-monitor.md`, and keeps `complete-revision` at
completion only. Focused suites passed:
`progress-observation-guidance.test.mjs`,
`ci-completion-lifecycle-guidance.test.mjs`, `read-budget-guidance.test.mjs`,
`story-obligations-guidance.test.mjs`, plus runtime rechecks
`ci-mailbox-await`, `execution-increment-fresh-progress`,
`ci-path-applicability`, `ci-mailbox-complete`, `ci-integrated-state-journey`
(104 pass). Source review retained and checked; commitment 12 pending
lifecycle `landing`. Refactor gated the accepted-publication pointer on
`progress: true`.

## Concern evidence

Slice-plan refinement was unnecessary. One read, acceptance and delivery
sequence owns the examples and has one representative proof loop. All
mechanics already exist and require no preparatory Structure. No remaining
slice-specific concern was identified.

## Learnings

Delivery and finish read budgets for Execute Plan are tight (~52/0 bytes of
headroom before this edit). The observe body must stay out of the delivery
row (`#publish` split); finish-row edits must stay size-neutral.


## Story obligations

### X1. X1 deferred by Scope
Reported: slice 1 — "Scope excludes this work from the increment"
Story clause: "CI trigger changes, observer or delivery API changes, Intent UI changes, eliminating the guarded done publication, and release or rollout are deferred."
Disposition: excluded "CI trigger changes, observer or delivery API changes, Intent UI changes, eliminating the guarded done publication, and release or rollout are deferred."
Commitment: X1

### X2. X2 deferred by Scope
Reported: slice 1 — "Scope excludes this work from the increment"
Story clause: "CI trigger changes, observer or delivery API changes, Intent UI changes, eliminating the guarded done publication, and release or rollout are deferred."
Disposition: excluded "CI trigger changes, observer or delivery API changes, Intent UI changes, eliminating the guarded done publication, and release or rollout are deferred."
Commitment: X2

### X3. X3 deferred by Scope
Reported: slice 1 — "Scope excludes this work from the increment"
Story clause: "CI trigger changes, observer or delivery API changes, Intent UI changes, eliminating the guarded done publication, and release or rollout are deferred."
Disposition: excluded "CI trigger changes, observer or delivery API changes, Intent UI changes, eliminating the guarded done publication, and release or rollout are deferred."
Commitment: X3

### X4. X4 deferred by Scope
Reported: slice 1 — "Scope excludes this work from the increment"
Story clause: "CI trigger changes, observer or delivery API changes, Intent UI changes, eliminating the guarded done publication, and release or rollout are deferred."
Disposition: excluded "CI trigger changes, observer or delivery API changes, Intent UI changes, eliminating the guarded done publication, and release or rollout are deferred."
Commitment: X4

### X5. X5 deferred by Scope
Reported: slice 1 — "Scope excludes this work from the increment"
Story clause: "CI trigger changes, observer or delivery API changes, Intent UI changes, eliminating the guarded done publication, and release or rollout are deferred."
Disposition: excluded "CI trigger changes, observer or delivery API changes, Intent UI changes, eliminating the guarded done publication, and release or rollout are deferred."
Commitment: X5