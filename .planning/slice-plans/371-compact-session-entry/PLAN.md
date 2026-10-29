# Compact session entry

**Story:** [SEED-169#compact-session-entry](../../seeds/SEED-169-compact-session-entry.md#compact-session-entry)
**Status:** ready
**Source:** [Selected story](../../seeds/SEED-169-compact-session-entry.md#compact-session-entry). The developer accepted the Compact proposal in this chat and requested implementation.
**Source review:** [Independent commitments](source-review.md)

## Goal and scope

Implement the accepted compact information hierarchy on existing session entries.
Keep existing host behavior, state uncertainty, warnings, recovery, unread reports,
published slice facts and branch qualification. No native host or persistence changes.

## Existing solution and constraints

`SessionEntry`, `LaunchSession`, `sessionRecordActions` and `shownSession` already
own the representation, host capabilities, confirmations and attention state.
Change/modularize these in place; reuse frame controls, Icon/IconButton and theme
tokens. The Sessions sidebar already has a disclosure pattern; reuse its meaning
without replacing that separate compact navigation representation.

Follow ADR 0008 (`docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md`):
session observations and controls do not establish published story state. The
North Star's Meaning and terminology, Evidence/freshness and accessibility topics
retain qualified slice counts, requested-vs-observed model, meaningful uncertainty,
focus and touch access. The approved design changes scan hierarchy, not those facts.

## Ordered slices

### 1. Scan and operate a compact session

Type: Behavior
Status: done

Precondition: A story or local session entry has a retained session record.
Trigger: Read the entry, disclose details or session actions, then use a control.
Postconditions:

- Status, host/requested model, supported main action and attention stay visible.
- Routine technical details start closed, open and close accessibly, with one
  workspace representation and accessible continuation command/copy affordance.
- More session actions holds existing secondary lifecycle controls. Confirmations,
  failures, busy states, keyboard focus and disabled story frames still work.
- Positive execution-readiness scan text yields to an open execution session;
  preparation evidence remains in story inspection and warnings remain visible.
- Shared card/local/Recently done entries remain coherent and responsive, using
  the existing design foundation rather than the proposal's standalone CSS.

Proof: extend the session browser journey with collapsed-default, keyboard
disclosure/menu, unchanged terminal and done/stop behavior, visible attention and
narrow-width checks; adapt shared journey helpers at the changed disclosure
boundary. Run focused session/recovery/mark-done journeys affected by those
helpers, dashboard typecheck and changed-file lint. Use synthetic hosts only.
Observe the new collapsed-default assertion fail before the implementation and
pass afterward. An initial fixture/command failure stops dependent edits until
its cause is resolved. No paid, private or live host operation is needed.

Consumer trace: `LaunchSession` has `SessionEntry` as its presentation consumer;
SessionEntry is used by StorySessions and the local/Recently done lists. Existing
journeys read launch/session text and click lifecycle controls directly, so those
helpers/assertions must use the new details/actions disclosure while retaining
their original behavioral promises. Search consumers of the moved labels and
controls and run the affected journey family before acceptance.

Setup: locked `npm ci`, then `npm run typecheck:dashboard` in the execution
checkout. The check-only pre-commit hook runs staged lint and typecheck for scripts.

## Preparation review

Refinement was not needed: one accepted layout, cohesive slice and outside-in
proof loop. The discriminating premise is settled by the red/green proof below;
no live host behavior is inferred from the mockup.

## Execution identity and setup

Story Branch Mode; owned managed worktree created for this chat at
`/Users/terryyin/.codex/worktrees/compact-session-card/open-dough`, branch
`codex/compact-session-card`. Originating/default checkout:
`/Users/terryyin/git/open-dough`. Base `d848e6d0fc35037635923ac6cbd3643772a5ecd9`.
Accepted admission `e4fdd3ef3d1a359568a5326303a57f9522d9e121` on origin/main,
also the published execution branch base; assigned agent bas-chan. Startup
reported reused because the Codex app had just created/attached the worktree.
`npm ci` with current lockfile and `npm run typecheck:dashboard` passed in this
exact worktree; no parent dependency resolution or mutable installation sharing.

Ordinary target: origin `refs/heads/codex/compact-session-card`. Final integration
target: origin `refs/heads/main`. GitHub CI selector `ci.yml`, verified id
351271804, display name CI. Observer coordinator `compact-session-card-20261029`,
directory `/tmp/dough-ci-501/watch-uQyWVa`, PID 93361, stream session 94095,
yielded functions cell 35. Startup claim on trunk was not observed by this
branch observer; normal code delivery is registered through managed delivery.

## Accepted implementation proof

The new compact journey failed before production edits at the missing Session
details control (`dashboard/test-results/2026-10-29T03-49-19.159Z`), then passed
with the compact implementation. Source-only reviewer launch and commitments
are retained in source-review.md. Parent inspected production, observing tests,
fixture setup and desktop/narrow screenshots. Setup supplies only native/Git
starting state; real page disclosures, routing, actions and feedback supply the
observed outcomes.

The main regression command below selected 56 tests, all strict passed in 59s;
record `/private/tmp/compact-session-regression-proof.json` was inspected with
phase completed, selectedCount/tests 56, runnerStatus/strictStatus passed.
Literal command:

```sh
env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/private/tmp/compact-session-regression-proof.json npm run test:dashboard -- compact-session-entry.spec.ts agent-completion-quiet-claude.spec.ts agent-completion-quiet.spec.ts agent-launch-ad-hoc-sessions.spec.ts agent-launch-recent-delete-unavailable.spec.ts agent-launch-story-card-delete-problems.spec.ts agent-launch-story-card-delete.spec.ts agent-launch-story-card-done.spec.ts agent-launch-story-card-open-session.spec.ts agent-terminal-delete.spec.ts cursor-session-scope-noninterference.spec.ts session-attribution.spec.ts session-column-membership.spec.ts session-unread-report-message.spec.ts session-unread-report.spec.ts agent-launch-session-state-pace.spec.ts agent-launch-story-card-sessions.spec.ts agent-launch-story-card-session-states.spec.ts agent-launch-model-entries.spec.ts agent-launch-options-entries.spec.ts agent-launch-codex-observation-workspace.spec.ts agent-launch-start-session-isolated.spec.ts agent-launch-start-session-landing.spec.ts agent-launch-preparation-kept.spec.ts agent-launch-done-question.spec.ts agent-launch-done-question-follows.spec.ts
```

Additional focused command covering uncertainty, workspace/report access,
unconfirmed Stop, Cursor recovery and touch management (pass):

```sh
env -u NO_COLOR npm run test:dashboard -- compact-session-entry.spec.ts agent-launch-recent-delete.spec.ts agent-session-cursor-stop.spec.ts agent-launch-codex-recovery.spec.ts session-workspace-retirement-cursor.spec.ts cursor-session-recovery-stops.spec.ts session-management-touch.spec.ts agent-completion-cursor.spec.ts session-workspace-retirement-claude-done.spec.ts agent-session-cursor.spec.ts agent-session-cursor-done.spec.ts
```

Responsive/continuation/established-workspace consumer command (pass):

```sh
env -u NO_COLOR npm run test:dashboard -- compact-session-entry.spec.ts agent-launch-codex.spec.ts recently-done-story-sessions.spec.ts responsive-session-access.spec.ts agent-launch-start-story-card.spec.ts agent-launch-start-session-recovery.spec.ts agent-launch-start-taken.spec.ts project-add.spec.ts
```

Final command after removing screenshot-only instrumentation and adding the
single-workspace assertion/final-report glyph (pass), followed by typecheck:

```sh
env -u NO_COLOR npm run test:dashboard -- compact-session-entry.spec.ts session-workspace-retirement-cursor.spec.ts
npm run typecheck:dashboard
git diff --check
```

Consumer trace: `/private/tmp/compact-session-consumer-trace.md`, produced by the
installed tracer and inspected for shared entry/card/local/Recently done,
confirmation, metadata and panel purposes. The new disclosure helper is reached
by existing lifecycle helpers; their behavior assertions remain. Native/panel
protocol details have unchanged production ownership; common changed UI
boundaries use the equivalent-purpose observations above. No full local suite,
live host session or hook-owned lint was run. Focused selections are bounded
by the changed frontend presentation/helper effects; no expensive proof deferred.


## Accepted independent refactor

Fresh reviewer returned REFACTOR COMPLETE. Routine metadata moved unchanged to
SessionDetails, list functions to SessionLists, compact rules to a top-imported
session-entry.css, with all import consumers updated. Documentation has one
maintained session-entry home. Repeated test action orchestration is shared;
the independent active/done membership journey moved intact to its own spec.
Parent inspected the extraction, import/cascade consumers and retained assertions.
No new native responsibility or user behavior. Existing detailed protocol,
readiness, warning and lifecycle proof remains valid; replaced module/CSS/list
wiring proof passed below. The new built-preview run has 35 selected/passed,
strict passed in 125.6s. Two workers were deliberately chosen on this busy Mac;
no competing owned heavy command, no unrelated processes changed.

```sh
env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/private/tmp/compact-session-refactor-proof.json npm run test:dashboard -- --workers=2 compact-session-entry.spec.ts agent-launch-story-card-sessions.spec.ts agent-launch-story-card-open-session.spec.ts agent-launch-story-card-delete.spec.ts agent-launch-recent-delete.spec.ts agent-session-cursor-stop.spec.ts cursor-session-recovery.spec.ts cursor-session-scope-noninterference.spec.ts recently-done-story-sessions.spec.ts recently-done-active-story-sessions.spec.ts session-column-membership.spec.ts session-management-touch.spec.ts session-unread-report.spec.ts sessions-sidebar.spec.ts recently-done-sessions-sidebar.spec.ts
npm run typecheck:dashboard
git diff --check
```

Trace `/private/tmp/compact-session-refactor-consumer-trace.md` disposes all 157
located consumers with run/reused/excluded boundary reasons. New SessionLists
consumers include both sidebar lists, observed by sessions-sidebar and
recently-done-sessions-sidebar; their separate entry rendering is unchanged.
No uncovered consumer, gap, deferred observation or further product advice.
Saved and formatting-preview source/prose files meet the refactor size rule.


Mechanical preparation initially refused a Clipboard API optional guard because
DOM typings assume secure-context availability. The equivalent feature check
now derives optional availability from property presence. No behavior changed;
renewed `env -u NO_COLOR npm run test:dashboard -- --workers=2 compact-session-entry.spec.ts`
passed, observing success, rejection and unavailable API again. Formatter-only
edits preserve all other accepted boundaries. The refused attempt committed and
published nothing; guarded preparation is retried on the repaired candidate.


## Execution retrospective

Reviewed planned intent, all 57 independently derived source clauses, aggregate
implementation and current product boundaries. Attribution: admission e4fdd3ef
is preparation provenance; implementation c036dbd73a6f58949356b3b7de497085642bd1fc
is the delivered UI/test/doc change. Other trunk work since the fork is excluded
from this execution's claims. Trunk source check reports unchanged.

The compact scan, independent disclosures and visible exceptions match the
accepted outcome. One shared entry remains responsible for card/local/Recently
done presentation; extracted details/list/styles retain that ownership. Native
capabilities, confirmations, terminal/report routing and published story facts
remain separate under ADR 0008. No refactoring residue or product defect was
found in the inspected changed boundaries or their relevant untouched consumers.

Outside-in tests drove the change from a failing compact expectation. The two
new integrated journeys use existing fixtures, observe real UI outcomes and do
not duplicate native protocol variants. Existing scenarios/assertions survive
disclosure helper changes and the intact membership-test split. Full-suite
assessment used current focused proof and boundary inspection, not a local full
run. CI remains pending on the published execution branch.

Process review used this coordinator's record and available delegate handoffs.
DD-368 records the diagnostic excerpt omitting an earlier failure from the same
CI job, verified by full failure inventories. DearDough.md has 616 physical
lines (500-line threshold warning, within 1000 ceiling). No process fix or new
product scope is implemented; no further dashboard backlog change recommended.

## Execution complete

Product advice: no further product change recommended from this execution.

## Story obligations

### G1. Offscreen navigation precondition after compact layout
Reported: slice 1 — "CI run 40817756668/1 dashboard (12/12) failed sessions-sidebar-navigation-cases.spec.ts:147 before selection: the local Taken entry was expected offscreen but had viewport ratio 0.1958. Current navigation proof must retain its real offscreen-to-revealed journey under the shorter layout."
Story clause: "Keep native host capabilities, session lifecycle, terminal/review routing and workflow facts."
Disposition: proved by slice 1: sessions-sidebar-navigation-cases.spec.ts offscreen-to-revealed/terminal assertions, /private/tmp/compact-session-ci-repair-green.json (4/4 strict passed, retry 0)


### G2. Conditional readiness in the published-facts comparator
Reported: slice 1 — "CI run 40819519249/1 dashboard (12/12) failed agent-launch-attention.spec.ts:199: the published-facts text comparator included the scan Ready badge, which intentionally reappears after the last execution session closes. Full logs show this assertion also failed in run 40817756668/1; its bounded diagnostic excerpt omitted that earlier failure."
Story clause: "retain preparation facts in Inspect story and preserve warnings."
Disposition: proved by slice 1: agent-launch-attention.spec.ts retains three fact comparisons excluding only conditional positive scan; compact-session-entry.spec.ts observes initial/open/closed scan readiness and inspected Assessment: Ready

## CI repair proof

G1: Mac red reproduced the CI offscreen assertion (.19387 vs .19584). Explicit
1280x600 setup preserves real terminal/reveal/outline/current-entry assertions.
No production behavior changed; full logs confirm G1 passed in the next run.

```sh
env -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/private/tmp/compact-session-ci-repair-green.json npm run test:dashboard -- sessions-sidebar-navigation-cases.spec.ts --workers=2
```

Parent inspected 4 selected/passed, strict passed, each retry 0. Sibling cases
already establish their viewport/column preconditions. Prior accepted UI/native
proof and retrospective conclusions remain applicable; G1 supplies the missing
geometry consumer. Repair stash record is clean/no entry at
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-pGgvxS/record.json`.


G2 red reproduced the same line-199 comparison at unchanged 76d61616. The
comparator excludes only conditional positive scan readiness, keeping all other
published facts/warnings; the Compact journey now marks its actual session done,
observes Ready restored and inspects unchanged Assessment: Ready. Green:
`env -u FORCE_COLOR -u NO_COLOR npm run --silent test:dashboard -- agent-launch-attention.spec.ts compact-session-entry.spec.ts --workers=2`.
No production change, retry, skipped assertion or timeout increase.
