# Prove the destination cue restarts on repeated activation

**Identity:** SEED-296#prove-repeat-destination-cue-restarts
**Source:** [Refined story](../../seeds/SEED-296-prove-repeat-destination-cue-restarts.md#prove-repeat-destination-cue-restarts)
**Source review:** [Source-only commitments](source-review.md)
**Preparation:** owned workspace
`/Users/terryyin/git/open-dough/.worktrees/prove-the-destination-cue-restarts-on-repeated-a`,
branch `codex/prove-the-destination-cue-restarts-on-repeated-a`, reviewed at
`13ee6e184ec9db8a91fa58be8c6300fb6d0aeada`. This plan authorizes no execution.

## Goal and scope

Maintainers have a maintained browser assertion that detects a destination
animation continuing from its old fading state after the same story reference
is activated again. Strengthen the existing selected, inspected supplier-card
journey, preserving its navigation and cue-lifetime proof. The known fault is
removing `card.getBoundingClientRect()` between cue removal and reapplication
in `dashboard/src/destinationCue.ts`.

Delivery is regression proof within the existing journey and test helpers.
Cue design, duration, new navigation capabilities, and new motion-preference
behavior are outside this increment. Existing motion and reduced-motion
assertions retain their promises.

## Reuse and design

PFE responsibility: distinguish a fresh destination animation from the same
animation continuing, through the developer's real reference activation.
The existing owner is
`dashboard/tests/navigation/story-reference-navigation.spec.ts`, test
“a dependency opens its active story, keeping the dashboard and inspection on
repeated activation”. It already follows the reference twice around a
controlled 1000 ms page-clock advance and preserves selection, inspection,
focus, reading position, cue expiry, and source evidence navigation.

Reuse `dashboard/tests/destinationCue.ts` for cue observations and
`autoRefreshJourney.ts` for page-clock control. The existing repeat-destination
spec covers returning from Intent and System settings after the preceding cue
has ended; it does not replace the mid-cue restart case. `agentPortrait.ts`
uses `getAnimations` to finish incidental animations, which would erase this
case's precondition. Keep restart-specific setup and observation with the cue
helpers rather than adding another browser fixture or generic clock layer.

Production already owns restart in `cueDestination`, called by
`pageEntries.ts`'s `revealStory`. No new product responsibility or consequential
architecture choice is needed. The existing selection and inspection concepts
stay as defined in [Accepted ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
No North Star topic applies or needs changing.

Expected edit homes are the navigation spec (216 lines at review) and cue
helper (58 lines); neither exceeds the 250-line refactoring check. Keep each
cohesive and within that check, placing animation observation/setup in the
existing helper when it would crowd the journey.

## Outside-in proof ownership

| Final promise | Owner and observable proof |
| --- | --- |
| Repeating a reference to the selected, inspected, in-view supplier restarts a fading cue | Slice 1: establish those preconditions, observe the first cue at nonzero animation time and partial opacity, activate the real reference, then observe animation progress reset and full opacity |
| Class and animation-name presence cannot mask the known fault | Slice 1: remove only the layout read in a disposable edit; the strengthened maintained assertion fails at restart; restore the read and the complete selected journey passes |
| Navigation, selection, inspection, focus, and cue expiry remain proved | Slice 1: retain the existing assertions and run the whole navigation spec; page-clock advancement still removes the repeated cue while selection stays |
| Proof is deterministic without wall-clock waits | Slice 1: paused page clock controls timers; explicitly hold the first CSS animation at a known fading point as setup; no sleep or assumption that JS clock advancement advances CSS animation time |

## Decisive premises

All observations below ran on 2026-11-10 in this owned checkout at
`13ee6e184ec9db8a91fa58be8c6300fb6d0aeada`, with Node 24.21.0, locked
Playwright 1.63.0, headless Chromium 153.0.8010.12, and the normal built-preview
fixture. Native npm, browser, and check setup completed successfully.

Literal focused observation command:

```sh
caffeinate -s -i npm run test:dashboard -- dashboard/tests/navigation/story-reference-navigation.spec.ts -g 'a dependency opens its active story' --workers=2
```

| Premise and consuming operation | Observation in that form and profile | Result and remainder |
| --- | --- | --- |
| The existing journey reaches the real repeated-reference path and its retained checks can run here; slice 1 extends it | Ran the command above after restoring every scratch edit | Passed; no route or prerequisite gap |
| Advancing the paused JS page clock alone establishes a partly faded CSS animation; slice 1's setup would otherwise rely on this | Scratch assertion after `passPartOfCue(page, 1000)` read animation time 0; a screenshot-assisted attempt still observed opacity 1 | False; do not use this as the fading precondition |
| A deterministic fading precondition and restart observation can discriminate the known fault; slice 1's assertion design | In the existing journey, find the named CSS animation with `card.getAnimations({ subtree: true })`, call `pause()`, set `currentTime = 1000`, await `ready`, and assert positive time and opacity between 0 and 1. Activate the existing reference and assert nonnegative time lower than before and opacity 1. Run the command above with production intact, then with only the layout read removed, then restored | Passed intact; the fault failed the restart assertion with time still 1000 instead of less than 1000; passed restored. The real reference activation, rather than setup, must produce the fresh animation. No unverified remainder for this approach |

Every scratch source and assertion edit was reverted before writing these
preparation records. These observations establish feasibility and discrimination;
execution still owns delivering the maintained assertion and its final proof.

## Ordered slices

### 1. Repeated reference activation has discriminating restart proof
Type: Behavior  
Status: done
Proof: The maintained repeated-reference journey fails on removal of the layout
read, passes after restoration, and the complete navigation spec passes with all
preserved assertions. Run the focused command above for fault discrimination
and `npm run test:dashboard -- dashboard/tests/navigation/story-reference-navigation.spec.ts --workers=2`
for the final spec.

Behavior: The supplier card is selected, inspected, and in view, and its first
destination cue is held at a known fading point under the controlled test
setup → activate its dependency reference again through the page → observe a
fresh animation at its beginning and full opacity, preserve selection,
inspection and focus, and let controlled page time end the repeated cue.

Reuse the observed Web Animations setup for the precondition, with direct
observations of progress and opacity before and after the trigger. Setup may
hold only the first animation; it must not restart, seek, finish, or fabricate
the post-activation animation. Retain the existing checks rather than replacing
them with animation-only proof. Keep any missing-animation failure explicit.

Use the existing MakeMe-backed `queuedReadyRepository().withRevision(...).please()`
and dependency fixture. Add no parallel scenario or repository builder.
Keep actions and animation observations outside domain-data builders.

During the fault check, remove only `card.getBoundingClientRect()` from
`cueDestination`, verify that the new restart assertion is the failing
observation, restore the source, and rerun the maintained journey. Revert the
fault before any commit. Include slice-local cleanup and post-change refactoring
before the final proof and commit.

## Consumer trace and local gates

The effect is stronger test observation, with no intended production output or
shared runtime-contract change. The navigation spec owns the changed journey.
The shared cue helper is also used by `story-reference-done.spec.ts`,
`notification-story-navigation.spec.ts`, and
`story-destination-repeat-cue.spec.ts`, all under `dashboard/tests/navigation/`.
Adding a restart-specific helper used only by this journey leaves their current
proof reusable. If editing existing shared assertions or clock semantics, run
all four named specs and include any other affected callers found by the
execution consumer trace; their reduced-motion and repeat-return purposes
remain distinct. Do not broaden the local gate to the full dashboard solely
because hosted CI runs it.

Local gates are fault discrimination, the final complete navigation spec,
affected shared-helper consumers when applicable, and the normal commit hooks
(staged lint and dashboard typecheck for staged scripts). Generate the required
consumer-trace record from the actual implementation diff and give each listed
consumer its run, reused, or evidenced exclusion disposition.

For long local runs start fully awake. On AC power use the maintained
`caffeinate -s -i` guard; on battery plug in, or keep the lid open under
`caffeinate -i` and inspect the sleep log, as
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)
requires. Follow [local suite admission](../../../tests/local-test-resources.md)
if a full run becomes necessary.

The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written, including in every delegation brief and repair handoff.
No wall-clock sleeps, `test.slow()`, or suite/file/group/hook timeout overrides;
keep the default test timeout. Execution owns applicable local and published
CI failures through the required final CI.

## Current decisions and plan concern assessment

One cohesive rule: observe the restart caused by the real repeat activation,
using a known fading precondition and preserving the navigation journey's
other promises. Animation state is test setup before the trigger and observed
behavior after it. Class/name checks alone are insufficient; page-clock
advancement alone is insufficient to arrange CSS progress in this profile.

Slice-plan refinement was not needed: one bounded Behavior slice owns the
assertion, known-fault discrimination, retained navigation proof, and cleanup
in one proof loop. No numeric slice target or hard limit was supplied.
This review identified no remaining slice-specific concern or human-owned
decision. No blocking supplier dependency is needed.

## Execution context

Established story-branch execution: workspace and branch match Preparation above.
Agent ebacky-chan; publisher dashboard-territory.local-open-dough; starting revision
49367c2e4d10ce1aeb96bb7a40512e585fa0bd8c. Accepted claim and current candidate:
5796043743a9f87766f9abe307e1d93911fccf15 on origin/main (verified remote).
Ordinary increments target origin/refs/heads/codex/prove-the-destination-cue-restarts-on-repeated-a.
Originating and execution checkout are this owned linked worktree; integration
checkout /Users/terryyin/git/open-dough is maintained only through publication.
No numeric slice limit or override; existing planning authority retained.
Native checkout setup: Node 24.21.0; locked npm and browser acquisition and
Chromium 153.0.8010.12 prerequisite command passed here on 2026-11-10.
Check-only hook: staged lint/format check, then dashboard typecheck for scripts.
Selective formatter: npm run format (changed files only).

Observer: Codex yielded cell g1177:12, coordinator seed296-ebacky,
session 91625, PID 49460, directory /tmp/dough-ci-501/watch-lbjufg;
runtime .agents/skills/dough-execute-plan in this checkout, repository
terryyin/open-dough, target codex/prove-the-destination-cue-restarts-on-repeated-a.
Verified GitHub workflow ci.yml, display name CI, push trigger.
The earlier trunk claim has pendingCi: unobserved; ordinary branch delivery
uses this observer. No existing observer was retained for this new coordinator.

## Slice 1 accepted proof

Source freshness: unchanged at origin/main
5796043743a9f87766f9abe307e1d93911fccf15; no named coordination siblings.
Inspected original source commitments, actual diff, cue helper, journey, CSS,
reading-position observation and unchanged shared-helper callers. Each original
trigger and expected result is mapped to its actual observation in source-review.md.
No implementation or proof gaps found. Production source is unchanged.

Commands run by implementation agent, with terminal results:
- `caffeinate -s -i npm run test:dashboard -- dashboard/tests/navigation/story-reference-navigation.spec.ts -g 'a dependency opens its active story' --workers=2`: intact pass; same command with only the layout read removed fails at restart time (<1000 expected, 1000 observed), after class/name checks passed. Fault restored.
- `caffeinate -s -i npm run test:dashboard -- dashboard/tests/navigation/story-reference-navigation.spec.ts --workers=2`: restored full three-test spec pass.
Fault evidence /tmp/seed296-restart-fault.log and dashboard/test-results/2026-11-10T14-40-01.590Z-83229; final log /tmp/seed296-navigation-final.log.

Generated consumer trace: /tmp/seed296-consumer-trace.md; all 471 located
consumers disposed in /tmp/seed296-consumer-trace-disposed.md. Actual new
exports reach only the changed journey (run). Other three cue specs import
unchanged exports and preserve their normal/reduced-motion purposes (effect
excluded); page clock semantics and production cue/reveal/CSS are unchanged.
Other matches are unrelated opacity/style knowledge, unchanged scheduling
history or plan/source-review references; each is excluded with its reason.

Expensive-proof decision: local macOS, 16 CPUs/48 GB, load 19.89, unrelated
watcher/npm work; no competing owned heavy verification. Implementation owner
chose the bounded selected runs at maximum two workers under AC caffeinate
-s -i; actual spec has three cases. No failures/contention changed this basis.
Reconsider if load, workload or failures invalidate it; no proof deferred.

Independent refactor: `/root/refactor` returned REFACTOR COMPLETE. Consolidated
the duplicated named-animation lookup in private cueProgress; only fading
setup supplies holdAt, post-trigger observation remains read-only. Coordinator
inspected the new helper and trigger. All files remain below 250 lines.
Renewed the exact focused fault command above: reset assertion failed at
helper line 92, expected <1000, observed 1000; source restored exactly.
Renewed the exact full-spec command above: all three tests passed terminally.
Current evidence: /tmp/seed296-refactor-fault.log, /tmp/seed296-refactor-final.log,
and dashboard/test-results/2026-11-10T14-45-01.825Z-2918.
Refactor trace /tmp/seed296-refactor-consumer-trace-disposed.md disposes all
471 matches; unchanged consumers excluded on the same inspected boundaries.
Whitespace check passed. Host load18.58, memory66%free, AC supported the
same bounded workers2 choice; no proof deferred.

## Execution complete

Product advice: no change. The existing journey now discriminates the known
restart fault with one controlled browser observation; navigation and cue
lifetime proof remain intact. No parallel scenario or production seam added.

Retrospective complete: source and original plan compared to accepted product
commit 536dcf13218bae15339ffbd1288464649940047e; claim 579604374 is provenance,
base/nearby SEED-261 work is unrelated. ADR0008 selection/inspection and
transient-navigation meanings remain intact; the near-future intent-protection
direction is served. Existing browser coverage earns its integration cost;
no justified whole-suite consolidation or correction found.
Process occurrences ODF-264 and DD-488 recorded in DearDough.md (997 lines);
lower-impact DD-487 trial confound retained in Git at 536dcf132:DearDough.md.
No unresolved advice or correction; branch CI remains pending at this review.
