# Decide plan links by one rule

## Source

**Identity:** SEED-028#plan-link-rule

[Correction story](../../seeds/SEED-028-track-ad-hoc-work.md#plan-link-rule).
A bounded retrospective correction of the completed execution of
`SEED-028#admission-coherence` under its plan
([113](../113-admission-coherence/PLAN.md), all six slices done): claim
`5a05150`, attributable commits `733fe46`, `56ae2aa`, `c700a61`, `0ecd71f`,
`c7893ac`, `73a4763`, `5ce3a25`, `9e635ae`, `33fd629`, `3c54727` on branch
`claude/113-admission-coherence` (net diff `5a05150..3c54727`). That
correction's outcomes stay as delivered; this correction adds no feature
promise. The retrospective authorized planning only; execution needs its own
authority.

## Goal and scope

Every command that writes or checks an entry's plan link — `take` and
admission, `record-state`, the backlog's listing checks (including the plan
check `refresh` shares), and execution startup and continuation — applies one
plan-link rule owned by the backlog domain, so an entry `record-state` accepts
is one that `take` resume and continuation can continue. `record-state` and
`read-state` refuse missing input in the backlog's one refusal shape. Also
split the oversized story-state test file (R3) and repair two stale seed
anchors (R4). One correction outcome, owned by the findings below, each
verified at `3c54727`.

### Current findings

- **R1 — no single plan-link rule (medium-low; regression from `33fd629` and
  plan 113 slice 2 on older code).** `linkTakenPlan`
  (`product-backlog-take.mjs:127`) treats `PLAN.md#section` as linking its
  plan; `take` resume `resolvePlan` (`product-backlog-take.mjs:53`) compares
  whole targets; `take --plan …#section` is refused as unresolved because
  `requireResolvedPlan` resolves the fragment as part of the file name
  (`product-backlog-plan.mjs:18-22`); continuation
  (`dough-execute-plan/scripts/execution-source.mjs:171`) compares whole
  targets and says "queued" even for Taken work; `requireUnlistedHome`,
  `requireUnlistedPlan` (`product-backlog-document.mjs:156,181`) and
  `planOfOther` (`:120`) compare whole targets. So `record-state` accepts a
  section-linked Taken entry that neither `take` resume nor continuation can
  continue. The "declared plan is the home itself, so no link" rule is
  written three times — execute-plan `selectedPreparation.declaredPlan`
  (`execution-source.mjs:92`), backlog `separatePlanPath`/`declaredPlanTarget`
  (`product-backlog-story-state-home.mjs:28-45`), and the dashboard
  (`dashboard/src/workEntryFacts.ts:82`) — while `take`'s `resolvePlan`
  compares `target === entry.href` including the anchor
  (`product-backlog-take.mjs:60`) and `refresh`'s `planFor` does the same
  (`product-backlog-refresh.mjs:102`): `take --plan seeds/SEED-001-x.md` for
  an entry homed at `seeds/SEED-001-x.md#one` links the seed as a plan, which
  startup then refuses. Section links are a real shape: the dashboard
  navigates them (`dashboard/tests/source-navigation.spec.ts:39`,
  `dashboard/tests/storyReadinessFixture.ts:99`). No test asserts
  continuation's "plan link disagrees" refusal.
- **R2 — record-state crashes without `--link` (low; older defect, command
  rehoused by plan 113).** `recordState`
  (`product-backlog-story-state-command.mjs:23-53`) has no `requireField`;
  `request.href ?? ""` (`:37`) works around it and a TypeError follows;
  `readState` hand-writes the missing-link refusal (`:65-67`), duplicating
  `requireField` (`product-backlog-refusal.mjs:21`).
- **R3 — oversized test file (low; plan 113).**
  `tests/support/story-state.test.mjs` is 253 lines, over the 250-line limit.
- **R4 — stale seed anchors (low; plan 113 plus an older guard gap).**
  `.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md:76` and
  `.planning/seeds/SEED-008-worktree-branch-trunk-sync.md:155` link
  `dough-execute-plan/SKILL.md#take-queued-work`, renamed to
  `#take-or-admit-work`. `tests/payload-declaration-links.sh:49` strips
  fragments, so no lasting anchor check exists.

### Preserved promises and constraints

- One claim per work item: provenance stays the commit that moved the identity
  into Taken; no second claim, profile or story. Take, resume, continuation and
  admission never record or imply readiness
  (`record-preparation.md#execution-and-resume`).
- Ordinary continuation writes nothing. `take` and `record-state` never repoint
  an entry to a different plan file; refreshing a reference stays `refresh`'s
  explicit decision.
- Plan-homed corrections and stories whose declared plan is their own home stay
  unlinked. Existing identities and whole-document homes are unchanged.
- Refusals keep their meaning: backlog refusals leave the file unchanged; stop
  statuses (`source-refused`, `source-conflict`, `conflict`, `claim-failed`)
  keep theirs, and refused startup writes nothing and creates no workspace.
- Installed copies under `.agents/skills/` and `.claude/skills/` are not
  hand-edited ([AGENTS.md](../../../AGENTS.md)). Skill text is written for the
  executing agent ([ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)).
  `dough-execute-plan/SKILL.md` is at 249 lines: do not grow it.
- Follow [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  (one representation per fact, reuse cohesive owners) and the North Star topic
  [One backlog interpretation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation):
  the pure backlog domain owns what a backlog link means; execute-plan startup
  consumes that meaning rather than restating it. This correction changes no
  ADR or topic. Test files stay at or below 250 lines.

### Authorized cross-subsystem change

This plan authorizes changes in both the backlog domain
(`src/skills/dough-product-backlog/scripts/`, its SKILL and references) and the
execute-plan startup modules (`execution-source.mjs`,
`execution-admission-source.mjs`, `execution-start-*.mjs`,
`workspace-publication-select.mjs`) and their tests. The dashboard is not
changed: its reading is already path-based and agrees with the rule below.

### Excluded

- Rewriting existing section links to bare paths, or refusing fragments
  anywhere (the rejected alternative below).
- The dashboard importing the domain predicate: its rule already agrees and no
  finding shows divergence there.
- `product-backlog-version.mjs`'s merge comparison of plan-link text, and
  `refresh` repoint semantics beyond the shared own-home and resolution checks.
- A lasting anchor check in `tests/payload-declaration-links.sh`: it checks
  managed payload files only, so it would not have caught R4's planning-record
  links; the one-off anchor check below proves R4.
- Whole-seed readiness basis, continuation ownership across sessions,
  section-aware seed reconciliation (excluded by plan 113 and still owned
  elsewhere).

## Current decisions

- **Section links are supported (confirmed by the developer, 2026-09-26).** An entry's
  plan link satisfies a declared plan when the link's file path — the target
  without its `#fragment` — is that plan's path; the fragment is navigation
  inside the plan and never part of the comparison, of `take --plan`
  resolution, or of listing clashes. This matches the dashboard's path-based
  association and `33fd629`. An entry that already satisfies the plan keeps its
  link text unchanged (`take` resume and `record-state` report `unchanged`); a
  missing link is written as the caller supplied it. Rejected alternative:
  refuse fragments everywhere — would require fixing the dashboard fixtures
  and navigation specs and reverting `33fd629`'s tolerance, removing a
  navigation shape the dashboard already relies on.
- **One owner.** The backlog domain's `product-backlog-plan.mjs` (already the
  home of "what an entry's active plan link says") owns three pure predicates:
  the file a plan link names; whether an entry's link satisfies a plan path;
  and whether a declared plan is the canonical home itself (same file path as
  the home link without its anchor → no link). `takeEntry`/`admitEntry`
  (`resolvePlan`), `linkTakenPlan` (its special case folds into the take rule),
  `refresh`'s own-home check, `requireUnlistedPlan`, `requireUnlistedHome`'s
  plan clause, `planOfOther`, `declaredPlanTarget`/`planLoadOptions`, and
  execute-plan `selectedPreparation.declaredPlan` and continuation all use
  them. Listing clashes compare a plan link's file with another entry's home
  link as written.
- **Continuation wording.** The refusal names the entry's actual list
  ("Taken plan link disagrees…" or "queued plan link disagrees…").
- **Missing input.** `record-state` requires `--identity` and `--link`, and
  `read-state` `--link`, through `requireField` before any read or write.

## Outside-in proof and verification

Reuse the real backlog CLI (`tests/support/`), the real-Git startup and
admission fixtures with local bare remotes
(`workspace-publication-startup-test-fixtures.mjs`,
`workspace-publication-admission-fixtures.mjs`), and the dashboard readiness
fixtures that drive the real `record-state`. No new storage or test framework;
do not widen module exports for tests.

Focused suites (existing unless marked):

- Backlog and story state: `node --test tests/support/*.test.mjs`
- Startup and admission:
  `node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-*.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-race.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-admission*.test.mjs`
- Dashboard readiness regression (drives `record-state` with a section link):
  `npm run test:dashboard -- dashboard/tests/source-navigation.spec.ts` plus
  the specs using `dashboard/tests/storyReadinessFixture.ts`
- Payload links: `/opt/homebrew/bin/bash tests/payload-declaration-links.sh`

Run shell checks with a modern bash (`/opt/homebrew/bin/bash`). Each slice runs
its focused commands after edits and independent post-change refactoring, plus
`git diff --check` and a line-count check on touched test files. Keep ordinary
delivery, CI observation, retrospective and wrap-up gates.

## Ordered slices

### 1. Apply one plan-link rule across the backlog commands
Type: Behavior
Status: planned
Proof: new `tests/support/product-backlog-plan-link.test.mjs`, through the
real backlog CLI:

- a Taken entry linking `slice-plans/N/PLAN.md#ordered-slices` is `unchanged`
  and byte-identical after `record-state --approach planned`, after
  `take --plan slice-plans/N/PLAN.md`, and after
  `take --plan slice-plans/N/PLAN.md#ordered-slices`;
- queued work taken with `--plan slice-plans/N/PLAN.md#ordered-slices` moves
  to Taken with that link (resolved by path; an unresolved file is still
  refused);
- `take --plan seeds/SEED-001-x.md` for an entry homed at
  `seeds/SEED-001-x.md#one` is refused as the canonical home needing no plan
  link, backlog unchanged; admission, which has no backlog CLI of its own, is
  asserted through `admitEntry` the way the existing admission test in
  `product-backlog-take.test.mjs` does;
- `take --plan slice-plans/N/PLAN.md#x` when another entry's whole-document
  home is `slice-plans/N/PLAN.md` is refused, and `add` of that home while
  another entry links `slice-plans/N/PLAN.md#x` is refused, each unchanged;
- moved here from `story-state.test.mjs` (R3) and `story-state-refusals.test.mjs`:
  a planned record links its Taken entry's missing plan, leaves a section
  link unchanged, and refuses a Taken entry linking another plan file.

`tests/support/story-state.test.mjs` ends at or below 250 lines; the whole
`tests/support` suite and the take, refresh and refusal suites stay green.

Behavior: a Taken entry linking a section of its declared plan → `record-state`,
`take` resume, or `take --plan` with or without the fragment → the entry is
left unchanged, and a seed file that is its story's own home is never written
as that story's plan link.

Add the three predicates to `product-backlog-plan.mjs` and route every backlog
caller listed in Current decisions through them; fold `linkTakenPlan`'s
section special case into `takeEntry`. Update the backlog SKILL's
"A planned story requires its resolvable slice-plan link" sentence only as far
as needed to say a link to a section of that plan satisfies it, without growing
the section.

Safe stop: backlog commands agree; execution startup is externally unchanged
(it still refuses section links before calling take).

### 2. Refuse a missing record-state or read-state link cleanly
Type: Behavior
Status: planned
Proof: a table row in `tests/support/story-state-refusals.test.mjs` running
the real CLI: `record-state` without `--link` and without `--identity`, and
`read-state` without `--link`, each exit with the `Missing link: supply
--link.` (or identity) refusal and "The backlog was not changed.", home and
backlog byte-identical, no TypeError in stderr.

Behavior: a caller omits `--link` → `record-state`/`read-state` → the one
missing-input refusal, nothing written.

Use `requireField` at the top of both commands; remove the `?? ""`
workaround and `readState`'s hand-written refusal.

Safe stop: independent of slices 1 and 3.

### 3. Continue and start section-linked work through the same rule
Type: Behavior
Status: planned
Proof: through the real startup CLI with bare remotes:

- `workspace-publication-admission-continuation.test.mjs` (or a new sibling if
  it would pass 250 lines): a published Taken planned story whose entry links
  `PLAN.md#ordered-slices` of its declared plan continues as `existing` at the
  claim sha, remote tip unchanged, one `Claim-Identity`;
- `workspace-publication-startup-source-cases.mjs`: a queued entry linking a
  section of its declared plan is taken with its link unchanged; a queued entry
  and a Taken entry linking a different plan file are refused `source-refused`
  with the list-accurate "plan link disagrees" message, tip unchanged, no
  workspace (first test of this refusal);
- the existing self-planned-seed and legacy plan-homed cases in
  `workspace-publication-startup-canonical-plan-cases.mjs` stay green
  unchanged in assertions.

Then the full startup and admission suite, `tests/support`, and the dashboard
readiness specs.

Behavior: a section-linked entry that preparation accepted → ordinary startup
or continuation → it is taken or continued without writing a different link,
and a genuinely different plan link is refused naming its list.

Replace `selectedPreparation.declaredPlan`'s own-home comparison and
continuation's whole-target comparison with the domain predicates from slice 1.
Keep refusal statuses and the other messages the tests assert.

Safe stop: every command applies the one rule; R1 closed.

### 4. Repair the renamed startup heading links in seeds
Type: Structure
Status: planned
Proof: the two links in `SEED-004` and `SEED-008` point at
`../../src/skills/dough-execute-plan/SKILL.md#take-or-admit-work`; a one-off
check that every `SKILL.md#anchor` link under `.planning/seeds/` and
`src/skills/**/*.md` resolves to a heading in its target reports 0 broken
(literal command and result recorded here); payload link check passes.

Structure: removes R4's stale navigation; product behavior unchanged.

Safe stop: independent of the other slices.

## Promise coverage

| Finding / promise | Owner / decisive observation |
| --- | --- |
| R1 backlog commands (take, admit, record-state, listing, refresh own-home) | 1: plan-link CLI tests |
| R1 startup and continuation, "disagrees" refusal | 3: startup and continuation CLI cases |
| R2 | 2: missing-input refusal rows |
| R3 | 1: `story-state.test.mjs` ≤ 250 lines, moved cases green |
| R4 | 4: repaired links, one-off anchor check |
| Continuation writes nothing; one claim | 3: tip unchanged, one `Claim-Identity` |
| Never repoint; plan-homed stays unlinked | 1 and 3: unchanged entries; existing canonical-plan cases |
| Dashboard unaffected | 3: dashboard readiness specs green |

## Plan review

Four slices, one proof loop each. Slice 1 establishes the domain rule and
proves it at the backlog CLI; slice 3 then makes startup consume it, so
startup never depends on an unproved rule. Slices 2 and 4 are independent and
may run in any order. The examples exercise one common rule — compare plan
file paths; a plan that is the home file is unlinked — rather than a special
case per command, which removes `linkTakenPlan`'s existing special case. No
numeric slice target was supplied; size is judged by one coherent change with
focused proof. Slice 1 touches several backlog callers but they share one
predicate and one CLI proof loop.

## Learnings

None yet.
