# Decide plan links by one rule

## Source

**Identity:** SEED-028#plan-link-rule

[Correction story](../../seeds/SEED-028-track-ad-hoc-work.md#plan-link-rule).
A bounded retrospective correction of the completed execution of
`SEED-028#admission-coherence` under its plan
(recoverable at
`ee563d5:.planning/slice-plans/113-admission-coherence/PLAN.md`, all six
slices done): claim
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

### 1. Let a section link satisfy its plan in take and record-state
Type: Behavior
Status: done
Proof: new `tests/support/product-backlog-plan-link.test.mjs`, through the
real backlog CLI:

- a Taken entry linking `slice-plans/N/PLAN.md#ordered-slices` is `unchanged`
  and byte-identical after `record-state --approach planned`, after
  `take --plan slice-plans/N/PLAN.md`, and after
  `take --plan slice-plans/N/PLAN.md#ordered-slices`;
- queued work taken with `--plan slice-plans/N/PLAN.md#ordered-slices` moves
  to Taken with that link (resolved by path; an unresolved file is still
  refused);
- a Taken entry linking a different plan file is still refused by `take` and
  `record-state`, unchanged;
- moved here from `story-state.test.mjs` (R3) and `story-state-refusals.test.mjs`:
  a planned record links its Taken entry's missing plan, leaves a section
  link unchanged, and refuses a Taken entry linking another plan file.

`tests/support/story-state.test.mjs` ends at or below 250 lines; the whole
`tests/support` suite and the take and refusal suites stay green.

Behavior: a Taken entry linking a section of its declared plan → `record-state`,
`take` resume, or `take --plan` with or without the fragment → the entry is
left unchanged.

Add to `product-backlog-plan.mjs` the predicates for the file a plan link
names and whether an entry's link satisfies a plan path; resolve `take --plan`
by that file (`requireResolvedPlan`). Route `takeEntry`/`admitEntry`
(`resolvePlan`) and `linkTakenPlan` through them, folding `linkTakenPlan`'s
section special case into the take rule. Update the backlog SKILL's
"A planned story requires its resolvable slice-plan link" sentence only as far
as needed to say a link to a section of that plan satisfies it, without growing
the section.

Safe stop: take and record-state agree on section links; own-home and listing
checks keep their current whole-target comparison; execution startup is
externally unchanged.

Accepted proof (2026-09-26): `node --test tests/support/*.test.mjs` passes
(184 before the refactor split one test; the edited file then 5/5).
Observations in `tests/support/product-backlog-plan-link.test.mjs` ("plan
link: …" tests, setup `projectWith()`): section-linked Taken entry byte-identical
through `record-state` and both `take --plan` forms; queued take keeps the
section link; a section of an absent plan file is refused unchanged; another
plan file is refused by `take` and `record-state`, unchanged. Startup and
admission suite (focused command above) 63/63, as `takeEntry`/`admitEntry`
are consumed by `workspace-publication-select.mjs`. `story-state.test.mjs` is
183 lines. `product-backlog-plan.mjs` owns private `planFileOf` and exported
`linksPlan`; `requireResolvedPlan` resolves by file, so `refresh --plan X#s`
now resolves by file too (the shared resolution check, in scope).

### 2. Keep own-home plans unlinked and compare plan files in listing checks
Type: Behavior
Status: done
Proof: in `tests/support/product-backlog-plan-link.test.mjs` (or a sibling if
it would pass 250 lines), through the real backlog CLI:

- `take --plan seeds/SEED-001-x.md` for an entry homed at
  `seeds/SEED-001-x.md#one` is refused as the canonical home needing no plan
  link, backlog unchanged; admission, which has no backlog CLI of its own, is
  asserted through `admitEntry` the way the existing admission test in
  `product-backlog-take.test.mjs` does;
- `record-state --approach planned` whose declared plan is its own home file
  writes no plan link (existing story-state own-home cases stay green);
- `take --plan slice-plans/N/PLAN.md#x` when another entry's whole-document
  home is `slice-plans/N/PLAN.md` is refused, and `add` of that home while
  another entry links `slice-plans/N/PLAN.md#x` is refused, each unchanged;
- `refresh` keeps its own-home decision for a section-anchored home (existing
  refresh suite green, plus one own-home row when none covers the anchor).

The whole `tests/support` suite and the take, refresh and refusal suites stay
green.

Behavior: a declared plan that is the story's own home file, with or without
an anchor → take, admission, record-state or refresh → no plan link is
written; a plan link and another entry's home that name the same file → the
listing check refuses.

Add the own-home predicate (same file path as the home link without its
anchor → no link) to `product-backlog-plan.mjs` and route `refresh`'s
own-home check (`planFor`), `declaredPlanTarget`/`separatePlanPath`/
`planLoadOptions`, `requireUnlistedPlan`, `requireUnlistedHome`'s plan clause
and `planOfOther` through the slice 1 and slice 2 predicates.

Safe stop: every backlog command applies the one rule; execution startup is
externally unchanged (it still refuses section links before calling take).

Accepted proof (2026-09-26): `node --test tests/support/*.test.mjs` 192/192.
New `tests/support/product-backlog-plan-home.test.mjs` ("plan home: …", setup
`projectWith()`): take and `admitEntry` refuse the story's own home file as
its plan; a planned record whose plan is its own home file, with or without
an anchor, writes no link and has no `basis.plan`; a section link to another
entry's whole-document home is refused by `take`, and `add` of a home another
entry links a section of is refused; a backlog listing a home and a section of
it as another plan is refused (`planOfOther`); each unchanged. New `homeFile`
row in `product-backlog-refresh-refusals.test.mjs`. All new tests failed
against the pre-change product files except the plain-file own-home record,
which `separatePlanPath` already handled. Startup and admission suite 63/63;
dashboard `vite build` succeeds with no `node:` import in the bundle.

Design as delivered: `product-backlog-plan.mjs` is pure (the dashboard bundles
it through `product-backlog-document.mjs`) and owns `planFileOf`,
`sameDocument(link, other)` — one predicate for both "an entry's link already
links this plan" and "a declared plan is the entry's own home", replacing
slice 1's `linksPlan` — and the asymmetric `planNamesHome(target, href)` for
listing clashes. `requireResolvedPlan` moved to `product-backlog-home.mjs`, the
existing filesystem loader for documents backlog links name.

### 3. Refuse a missing record-state or read-state link cleanly
Type: Behavior
Status: done
Proof: a table row in `tests/support/story-state-refusals.test.mjs` running
the real CLI: `record-state` without `--link` and without `--identity`, and
`read-state` without `--link`, each exit with the `Missing link: supply
--link.` (or identity) refusal and "The backlog was not changed.", home and
backlog byte-identical, no TypeError in stderr.

Behavior: a caller omits `--link` → `record-state`/`read-state` → the one
missing-input refusal, nothing written.

Use `requireField` at the top of both commands; remove the `?? ""`
workaround and `readState`'s hand-written refusal.

Accepted proof (2026-09-26): `tests/support/story-state-refusals.test.mjs`
"story-state: a missing identity or link gets the missing-input refusal"
(real CLI, `scratchProject` + `plantSeed`): each row exits 1 with
`Missing <field>: supply --<field>.` followed by "Nothing was written." — the
story-state commands' existing refusal trailer via `preparationRefusal`, not
"The backlog was not changed." as first planned — with seed and backlog
byte-identical and no TypeError. Before the change the missing-`--link` row
failed with a TypeError; the other two rows already refused and now guard the
move to `requireField`. `node --test tests/support/story-state*.test.mjs`
13/13; `node --test tests/support/*.test.mjs` 186/186. `recordStoryState`
keeps its own guards: it is a shared API execute-plan fixtures call directly.

Safe stop: independent of slices 1, 2 and 4.

### 4. Continue and start section-linked work through the same rule
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
continuation's whole-target comparison with the domain predicates from slices 1
and 2 (`sameDocument` for both the own-home and link-agreement checks).
Keep refusal statuses and the other messages the tests assert.

Safe stop: every command applies the one rule; R1 closed.

### 5. Repair the renamed startup heading links in seeds
Type: Structure
Status: done
Proof: the two links in `SEED-004` and `SEED-008` point at
`../../src/skills/dough-execute-plan/SKILL.md#take-or-admit-work`; a one-off
check that every `SKILL.md#anchor` link under `.planning/seeds/` and
`src/skills/**/*.md` resolves to a heading in its target reports 0 broken
(literal command and result recorded here); payload link check passes.

Structure: removes R4's stale navigation; product behavior unchanged.

Safe stop: independent of the other slices.

Accepted proof (2026-09-26): both links now target
`../../src/skills/dough-execute-plan/SKILL.md#take-or-admit-work` (heading
`## Take or admit work`). One-off check — a throwaway node script, not
committed, that resolves every `](…SKILL.md#anchor)` link in `.planning/seeds/`
and `src/skills/**/*.md` relative to its file and matches GitHub heading slugs
or `<a id>` anchors — `node check-anchors.mjs <root>`: at `c97afbb`
"checked 37 SKILL.md#anchor links; broken 2" (exactly the two R4 links); after
the change "checked 37 SKILL.md#anchor links; broken 0".
`/opt/homebrew/bin/bash tests/payload-declaration-links.sh` passes. Installed
copies under `.agents/skills/` and `.claude/skills/` still carry the old anchor
until a released payload updates them.

## Promise coverage

| Finding / promise | Owner / decisive observation |
| --- | --- |
| R1 take, take --plan, resume, record-state section links | 1: plan-link CLI tests |
| R1 own-home, admission, refresh own-home, listing clashes | 2: own-home and clash CLI tests |
| R1 startup and continuation, "disagrees" refusal | 4: startup and continuation CLI cases |
| R2 | 3: missing-input refusal rows |
| R3 | 1: `story-state.test.mjs` ≤ 250 lines, moved cases green |
| R4 | 5: repaired links, one-off anchor check |
| Continuation writes nothing; one claim | 4: tip unchanged, one `Claim-Identity` |
| Never repoint; plan-homed stays unlinked | 1, 2 and 4: unchanged entries; existing canonical-plan cases |
| Dashboard unaffected | 4: dashboard readiness specs green |

## Plan review

Five slices, one proof loop each. Slices 1 and 2 establish the domain rule
and prove it at the backlog CLI — first section links in take and
record-state, then own-home plans and listing clashes; slice 4 then makes
startup consume it, so startup never depends on an unproved rule. Slices 3
and 5 are independent and may run in any order. The examples exercise one
common rule — compare plan file paths; a plan that is the home file is
unlinked — rather than a special case per command, which removes
`linkTakenPlan`'s existing special case. No numeric slice target was
supplied; size is judged by one coherent change with focused proof.

Refined 2026-09-26 (slice-plan refinement): the former slice 1 bundled two
independently observable outcomes with separate proof — section links
satisfying their plan in take and record-state, and own-home plans plus
listing-clash comparisons across `refresh`, story-state and the document
checks — so it was split into slices 1 and 2. Later slices were renumbered;
their content is unchanged apart from dependency references. Retained:
slices 3, 4 and 5 (formerly 2, 3 and 4), each one gate and one proof loop.

## Learnings

None yet.
