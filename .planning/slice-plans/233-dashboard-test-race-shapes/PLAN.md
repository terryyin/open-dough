# Keep the dashboard tests' recurring race shapes out by construction

**Identity:** SEED-093#expose-timing-races-locally
**Source:** [refined story](../../seeds/SEED-093-local-checks-agree-with-ci.md#expose-timing-races-locally),
with its field evidence and the findings it links (DD-186, DD-195, DD-199).
**Prepared:** 2026-10-03. Planning only, in the established preparation workspace. This instruction authorizes neither implementation nor publication.

## Goal and boundaries

The dashboard browser suite stops producing the race shapes that keep failing
CI. Shared test support takes over three jobs that each spec has been doing
for itself: draining the page's intercepted reads at teardown, waiting for a
settled page, and ordering fault setups after the events they depend on.

Material exclusions are the story's:

- No local slow-path or jitter detector.
- No repeat-run gate for changed specs.
- No work on the `agent-launch-start-taken.spec.ts:53` cause.
- No Node test races.
- No product code changes.
- Repairs wait for events. They do not lengthen deadlines, add sleeps, or add
  retries (`retries: 0` stays).

Assumption: the time-bounded absence checks are not fault setups and stay as
they are. Each one waits out a window to show that nothing else happens:
`production-watcher-failures.spec.ts:143` (1.1 s after stop) and
`support/voiceRecovery.ts:89` (200 ms quiet before acting).

## Direction and PFE

PFE: Playwright already provides each piece. `page.unrouteAll({ behavior:
"wait" })` waits for in-flight route handlers, fixture teardown runs in
reverse dependency order, and ESLint's `no-restricted-imports` can forbid an
import name. The repository already has these, each written for one spec:

- **Drain:** `afterEach` blocks in `startup-host-words.spec.ts` (two copies,
  left by a merge) and `project-remove.spec.ts`.
- **Settled page:**
  - `settled` in `storyStagesPage.ts:39` waits for a card first, then for no
    "Reading preparation…".
  - `expectMembership` in `dashboardPage.ts:134` waits for the stages' card
    titles.
  - 15 files repeat `expect(page.getByText("Reading preparation…")).toHaveCount(0)`.
- **Fault after event:** the `3fdae6f2` repair shape, which awaits held
  accepted input before disconnecting.

The work moves each into one owner in shared test support and points every
copy at it.

- **One page-test base for every spec.** About 100 spec files import `test`
  straight from `@playwright/test`. Only 90 import `./dashboardTest.ts`, whose
  `base.extend` the other fixture modules build on (`codexLaunch.ts`,
  `cursorStart.ts`, `preparationPage.ts`, `voiceTest.ts`,
  `responsiveStart.ts`, `storyDependencyFixture.ts`, `codexStart.ts`,
  `sessionAlerts.ts`).
  - A new `dashboard/tests/support/pageTest.ts` extends `@playwright/test`
    with the `page` teardown drain, and `dashboardTest.ts` builds on it.
  - Every other module that imports `test` from `@playwright/test` imports
    it from `pageTest.ts` instead.
  - An ESLint `no-restricted-imports` rule for the `test` import name of
    `@playwright/test` under `dashboard/tests/` keeps it that way. It allows
    `support/pageTest.ts` and the quiet-reporter proof fixtures
    (`tests/fixtures/quiet-reporter/*.proof.ts`), which run under their own
    substitute configuration.
  - Specs without a page pay nothing, because Playwright creates `page` only
    for tests that use it.
- **One settled-page helper.** `dashboardPage.ts`, beside `parts` and
  `expectMembership`, gains one helper.
  - It waits until the stages show their cards, either the given membership
    or the first card, and then until no card says "Reading preparation…".
  - `storyStagesPage.settled`, `launchCardPage.ts:94`, `autoRefreshJourney.ts:69`,
    and the hand-rolled spec copies call it.
  - A spec that asserts the reading state itself keeps its own assertion, for
    example `story-readiness.spec.ts:72` and
    `auto-refresh-project-isolation.spec.ts:190`, which expect "Reading
    preparation…" to be visible.
- **The rule's home.** The header comment of `pageTest.ts` states the rule:
  observe the event, never a deadline, sleep, or retry. The lint rule enforces
  the drain part. No new document is added.

Accepted ADRs:
[0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
favours small, inexpensive change. No Accepted ADR conflicts, and no North Star
topic is needed.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| The current trunk still has the patterns the plan names | All slices | `git rebase origin/main` onto `fa0afd3a`, then a re-grep of `unrouteAll`, "Reading preparation…", and the two sleeps | Present: `unrouteAll` in 2 files (3 uses); preparation waits in 15 files; sleeps at `agent-launch-cross-server-accept.spec.ts:79` and `agent-terminal-cursor-launch.spec.ts:190` |
| Without a drain, a route handler is still in flight when the context tears down; draining in the `page` fixture's teardown finishes it first | Slice 1 | A temporary spec (removed) with a handler that fetches, waits 300 ms, then reads the response, recording the order of events | No drain: `page teardown > context teardown`, and the handler had not read yet. With drain: `handler read ok > page teardown > context teardown` |
| Generic slowdown does not discriminate, so proof is deterministic ordering, not stress | Proof choice | Refinement probes recorded in the story's field evidence | Throttling failed the repaired spec 16 of 20 times; jitter did not change the reverted race's rate |
| Specs import `test` outside the shared fixture | Slice 1 | `grep -lE 'import \{[^}]*\btest\b[^}]*\} from "@playwright/test"'` over `dashboard/tests` | About 100 files, plus `sessionAlerts.ts`, `responsiveStart.ts`, `revisionCheckBoundary.ts`, and the quiet-reporter fixtures |
| ESLint lints the dashboard test TypeScript | Slice 1 | `eslint.config.mjs` applies its TS block to `**/*.{ts,mts,tsx}`, and `scripts/lint.mjs` runs ESLint with `--max-warnings=0` | Covered |
| At least one hand-rolled preparation wait can pass before any card renders | Slice 2 | Read `auto-refresh-detail-recovery.spec.ts:33-37`: after `page.reload()`, `not.toContainText(gap)` and the count-zero wait both pass while the card is absent | Unguarded |
| A card's preparation read is a page request that a route can hold | Slice 2 proof | DD-195's CI repair evidence: "a route delay reproduced the exact values" for card preparation arriving late | Routable. The endpoint is identified during the slice |
| `agent-terminal-cursor-launch.spec.ts:190` sleeps 300 ms before reading the kept first-input state | Slice 3 | Read lines 186-191 | Sleep before `keptCursor(...).firstInput?.state`; replace it with a poll |
| `agent-launch-cross-server-accept.spec.ts:79` sleeps 250 ms so the accept "reaches the locked write" | Slice 4 | Read lines 76-79 and `server/machineJsonStore.ts:74-90`: the server retries `mkdir` every 25 ms and leaves no observable trace | **Unsettled**: no event is known. Slice 4 opens with a probe |

## Outside-in proof

| Promise (story example) | Owning slice | Observable proof |
| --- | --- | --- |
| A spec's in-flight intercepted read finishes before disposal, without a teardown of its own | 1 | A support spec records handler completion before context teardown under the shared base. `startup-host-words.spec.ts` and `project-remove.spec.ts` pass with their drains removed |
| Every page spec gets the drain by construction | 1 | `npm run lint` passes. A temporary direct `test` import from `@playwright/test` in a spec fails lint (observed, then reverted) |
| A spec measuring cards after a reload sees the settled page | 2 | A support spec holds one card's preparation read and shows that the helper does not return until the read is released and the card's facts are shown. The 15 converted files pass |
| A fault setup observes its precondition event before injecting | 3, 4 | The converted specs assert the event, such as the kept uncertain state or the accept waiting on the lock, before the fault. They pass with `--repeat-each=20` at `--workers=8` |

Commands use `--reporter=line` so a passing run prints its count (DD-216).
Run them from the repository root, e.g.
`npx playwright test --config dashboard/playwright.config.ts <spec paths> --reporter=line --repeat-each=N`.
Slice 1 changes the fixture every page spec loads, so it also runs the whole
dashboard suite once (`npm run test:dashboard`). The other slices run their
affected files.

## Slices

### 1. Every page spec drains its intercepted reads through one shared base

Type: Structure (test-suite correction: per-spec teardown drains, and specs
able to forget them)
Status: planned
Proof: the drain support spec; `startup-host-words.spec.ts` and
`project-remove.spec.ts` with `--repeat-each=10 --workers=8`; `npm run lint`,
plus a planted direct import that lint rejects, then reverted; the full
`npm run test:dashboard` once.

Change:
- Add `support/pageTest.ts`, whose `page` fixture runs
  `unrouteAll({ behavior: "wait" })` after `use`. Base `dashboardTest.ts` on it.
- Point every module that imports `test` from `@playwright/test` at
  `pageTest.ts`.
- Add the lint rule.
- Delete the three per-spec `afterEach` drains.
- Add a support spec, `page-teardown-drain.spec.ts`, that records order the
  way the premise probe did: handler read, then page teardown, then context
  teardown.

Preserved behavior: every existing spec keeps its verdict.

### 2. Shared helpers return only on a settled page

Type: Structure (test-suite correction: hand-rolled settle waits, one of
which is unguarded)
Status: planned
Proof: a support spec holds one card's preparation read with `page.route`. It
shows the helper still pending while the read is held, then resolved once the
read is released and the facts show. The 15 converted files pass with
`--repeat-each=3`.

Change:
- Add the settled-page helper to `dashboardPage.ts`, taking an optional
  membership.
- Make `storyStagesPage.settled`, `launchCardPage.ts`, `autoRefreshJourney.ts`,
  and the spec copies call it.
- `auto-refresh-detail-recovery.spec.ts:36` waits on the shown claims card
  before its gap check.
- Keep the specs that assert the reading state itself.

### 3. The Cursor first-input fault reads its kept state once it is recorded

Type: Structure (fault setup ordered after its event)
Status: planned
Proof: `agent-terminal-cursor-launch.spec.ts` with `--repeat-each=20
--workers=8`. The sleep is gone, and an `expect.poll` on the kept first-input
state reaching `uncertain` precedes the second launch.

The ad hoc Cursor "first prompt `uncertain` instead of `confirmed`" CI flake
(run 37098217155) is in the same area. If this spec's evidence explains it,
record that in the learnings. Do not widen the slice.

### 4. The cross-server accept waits on the lock as an observed event

Type: Structure (fault setup ordered after its event), probe first
Status: planned
Proof: first, the probe. The test must observe, using only test-side means,
that the second server's accept is waiting on the held attempts lock. One
option is watching the lock's parent directory or the server's retry
attempts. If that works, the 250 ms sleep goes, the spec asserts the waiting
before writing the first attempt, and the spec passes with
`--repeat-each=20 --workers=8`.

If no test-side observation exists, stop this slice and record why. A product
seam would be a scope decision for the developer. Slices 1–3 stand without it.

## Current decisions

- The proof is deterministic ordering, not stress. Throttling and jitter
  were rejected on refinement evidence.
- One base module owns the drain, and a lint rule enforces it. The other
  fixture modules extend it rather than repeating it.
- Absence windows are out of scope (see the assumption above).

## Learnings

None yet.
