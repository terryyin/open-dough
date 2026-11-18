# Move story reference checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#move-story-reference-checks
**Source:** [Story reference checks](../../seeds/SEED-334-product-wide-end-to-end-tests.md#move-story-reference-checks)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Move the six `dashboard/tests/navigation/story-reference-*` specs (1,075
lines, 19 tests) to Frontend homes, or a Backend or E2E home where a rule
needs the real server, with every assertion and product behavior preserved.
`source-navigation` then runs alone in the interim group on one shard. The
source owns scope and exclusions: `source-navigation`, the group's retirement
and the `dashboard/tests/` Markdown belong to its two successor stories. No
product code change. No blocking dependency.

## Existing solutions and current decisions

- Follow the delivered conversion of
  SEED-334#retire-integrated-ui-test-and-its-documents (plan 688, recoverable
  at
  `7649aea947b870eb8d84da67f0fa63d0a9c6b9bb:.planning/slice-plans/688-move-story-destination-and-card-selection-checks/PLAN.md`):
  specs land in `dashboard/frontend-tests/navigation/` under their interim
  file and test names, take `test` from `dashboard/tests/support/frontendApp.ts`,
  publish through the `put*` helpers of `frontendServiceState.ts`, hold reads
  with `holdAuthenticatedReads.ts`, fail them with
  `frontendAuthenticatedReadControl.ts` and count them with
  `countAuthenticatedReads`. Reuse the page objects unchanged
  (`storyReference`, `destinationCue`, `storyCardControls`,
  `storyCardSelection`, `recentlyDoneColumn`, `readingPlace`, `dashboardPage`,
  `agentRosterRecords.expectRoute`). Add no second app harness.
- Reuse, do not rebuild: `putFrontendDependencies`
  (`frontendStoryDependencies.ts`) for Story A's agreements,
  `recordHostRequests` (`frontendHostRequests.ts`) for "no launch, no attach",
  `answerOwnPublications` (`frontendCatalogProjects.ts`) for Pygardon's own
  publication, `putFrontendDoneRecords` and `installFrontendDoneBodyReads`
  (`hold`, `failNext`) for Done records, and the revision move of
  `frontendDoneProjectRefresh.ts` (assign `services.revision` and files, then
  `passTimeUntilChecked`) for a later publication.
- The page reads the backlog as the authenticated read with no `path`,
  `done`, `intent` or `agents` parameter, the Done catalog as `done=catalog`
  and Done records as `done=bodies&file=…`
  (`frontendAuthenticatedReadSubstitute.ts`). Interim holds and answers of
  `.planning/PRODUCT-BACKLOG.md` and `.planning/done/.catalog.json` become
  holds and controls of those reads.
- `recordsAsked(githubFor(page))` (the server's GitHub record reads) becomes
  the file names the page asked in `done=bodies` reads. Where the interim
  count depends on what the server spares (its cache), the assertion map names
  the Backend owner (`backend-tests/observation/authenticated-read-listed-records.spec.ts`
  or a case added beside it) instead of a page-side count.
- A starting story is an accepted start not yet launched (a held acceptance
  keeps the Start dialog open). The real Take is E2E (G1).
- Dependency data stays pure: `agreement`, `twoDependencies`,
  `suppliersInOneSeed`, `secondInSeedB` (`storyDependencyFixture.ts`) and
  `queuedSeedWithDependencies`. The interim product-backlog CLI and Git steps
  (`recordDependency`, `takeSupplier`, `publishDependencies`) have no Frontend
  counterpart; the published result is arranged directly.
- New arrangements go in their own `frontend*.ts` module. No edited file may
  pass 250 lines: `frontendServiceState.ts` is 241 and `dashboardTest.ts` 243.
- `storyReferenceDone.ts` data (35 Done records, near, far, later, expired and
  unlisted references) moves into the Frontend Done-reference arrangement in
  slice 5; the interim module is deleted with its last importer in slice 8.
  `takeSupplier`, `retryReference`, `pointerDownOn` and `passTimeToRecovery`
  have no importer outside the interim specs: each gains a Frontend consumer
  or is removed by the slice that leaves it unused.
- An interim step that an existing maintained case already asserts is dropped
  only when the assertion map names that case and its assertion.
- Interim `pausePageClock` and `openUntilRead` guard real-server refresh; the
  Frontend case pauses the page clock only where it passes time itself.
- Accepted ADRs [0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md), [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  [0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md), [0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  support the move; no conflict, no North Star topic.

## Outside-in proof ownership and gates

Before removing a spec, inspect its setup and assertions and record each
distinct assertion's destination under its slice in
[execution-evidence.md](execution-evidence.md): the exact new
spec and test, equivalent existing proof, or a Backend/E2E owner. Include
negatives, focus, keyboard, tap, scroll reveals, reduced motion, read counts
and held or failed recovery. Split mixed cases across their real boundaries
without supplying the behavior under proof. A case the Frontend substitutes
cannot express keeps a Backend or E2E home under this rule.

For each slice, apply one scratch product break before deleting the interim
case; prove the replacement catches that break and passes when restored, and
record the fault, observation and literal commands and results in
execution-evidence.md under its slice. Keep the
interim case until its mapped replacement passes.

Each slice: rerun the installed test-entry selector for its paths (Frontend
selects MakeMe and page objects), then run the changed specs with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/frontend.playwright.config.ts <paths> --workers=2`
(the configured strict reporter; exit code is the verdict), the interim
listing
(`npx playwright test --config dashboard/integrated.playwright.config.ts --list`),
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh Distribution/tests/support/browser-group-shards.test.mjs Distribution/tests/support/ci-browser-groups.test.mjs`,
`npm run lint`, `npm run --silent typecheck:dashboard`, and consumers from the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
of any changed support. Local gate: use `caffeinate -s -i` on awake macOS on
AC power; on battery use the maintained open-lid `caffeinate -i` procedure and
inspect sleep logs under
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Default timeouts and retries stay; never `test.slow()`. Follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written and carry that link into every delegation and repair handoff.

Source promises and their owning slices are allocated in
[source-review.md](source-review.md).

## Ordered slices

Interim paths are under `dashboard/tests/navigation/`, Frontend homes under
`dashboard/frontend-tests/navigation/`. Each slice has 15 active minutes
excluding command time. Slices 1–4 (active references) and 5–8 (Done
references) are each complete on their own.

### 1. Follow a reference to an active story
Type: Behavior
Status: done
Proof: `story-reference-navigation` tests "a dependency opens its active
story…" and "an identified active block with unreadable detail…" in
`story-reference-navigation.spec.ts`, on `putFrontendDependencies` with a long
Story B seed. Scratch break: select the destination card when a reference is
followed; the first case fails.

Behavior: Story A waits on Story B → following the reference opens Story B's
detail at its reading top, focused, cued and unselected; a repeat while the
cue fades restarts it and keeps selection and detail; the canonical record
opens the GitHub blob at the published revision; a later revision keeps the
keyboard on Story A's Inspect; a seed that cannot be read still opens with its
read gap and an empty notice. The page sends no launch or attach request.
CI repair (run 44233235497, share 3/3 deadline): Distribution shares rebalanced.

### 2. Reveal a starting story without opening it
Type: Behavior
Status: done
Proof: "a reference reveals a starting story…" in the same Frontend spec, on
an accepted, unlaunched start; then delete the
interim `story-reference-navigation`. Scratch break: open detail on reveal
although Inspect is protected; the case fails.

Behavior: Story B's start is sent and unanswered (Inspect disabled) → the
reference focuses its card, opens no detail, keeps the canonical record
visible, and the page has sent exactly that one acceptance and no attach;
launching the start enables Inspect. The real Take is E2E (G1).

### 3. Tell references apart by identity and project
Type: Behavior
Status: planned
Proof: both `story-reference-identity` tests in
`story-reference-identity.spec.ts`: two suppliers in one seed with Story B
Taken (published data, no CLI), and Pygardon's own publication through
`answerOwnPublications`; then delete the interim spec. Scratch break: resolve
a reference by its seed path instead of its identity; the first case fails.

Behavior: at 390×844 with reduced motion, a tap opens Dependencies, the
keyboard follows "Second story in seed B" and a tap follows "Story B" → each
opens its own story in view with `behavior: "auto"`, the earlier detail stays
open; in Pygardon the reference's link is Pygardon's blob URL and opens
Pygardon's telling with the route on `pygardon`. E2E
`stories/story-dependencies.spec.ts` "two suppliers sharing one seed…" keeps
the real-server reading of the same data.

### 4. Recover an active reference
Type: Behavior
Status: planned
Proof: the three `story-reference-recovery` tests in
`story-reference-recovery.spec.ts`, holding and failing the backlog read and
publishing Story C as queued at a later revision; then delete the interim
spec. Scratch break: show "unavailable" for a failed read; the first case
fails.

Behavior: `SEED-C#c` unqueued → "unavailable" in the one live region; retry
with the backlog held → "Reading Open Dough to find SEED-C#c"; released as a
failure → "Could not read…", not "unavailable"; retry after recovery → Story
C's detail, focused, notice empty. Choosing Pygardon, or Story A's Inspect,
while the retry is held wins: no late focus or detail.

### 5. Reveal a Done story from a reference
Type: Behavior
Status: planned
Proof: `story-reference-done` tests "a Done reference without sessions…" and
"a delayed Done detail…" in `story-reference-done.spec.ts`, on a new Frontend
Done-reference arrangement holding the `storyReferenceDone.ts` data. Scratch
break: keep ten shown when a reference names a later Done story; the first
case fails.

Behavior: ten of 35 Done stories shown → the near reference focuses its card
without growing the range; the far one grows it to "Showing 27 of 35 entries"
and it stays; the page asks only the shown records and referenced suppliers;
with the far record held at 390×740 and reduced motion the destination reads
"Reading done story…", unfocused, then arrives focused with a motionless cue.

### 6. Show a Done reference's gap and read a replaced disclosure when opened
Type: Behavior
Status: planned
Proof: the other two `story-reference-done` tests ("a failed Done detail…",
"a dependency disclosure replaced…") in the same Frontend spec; then delete
the interim spec. Scratch break: read supplier titles before the disclosure
opens; the second case fails.

Behavior: the far record fails → its destination shows "This done story could
not be read." under its identity, focused; "Retry done stories" recovers
through 27 without asking for older records. Story A's agreements become
unreadable then name a new supplier → "Dependencies · 1 blocking" stays closed
and its supplier record is asked once, only after opening.

### 7. Recover a Done reference
Type: Behavior
Status: planned
Proof: the four `story-reference-done-recovery` tests in
`story-reference-done-recovery.spec.ts`, holding and failing the `done=catalog`
read and passing page time with `passTimeToRecovery`; then delete the interim
spec. Scratch break: show "unavailable" while the catalog is still being
read; the second case fails.

Behavior: an expired or unlisted reference → "unavailable", no destination, no
further read; a held catalog → "Reading…", failed → "Could not read…" and
"Done stories could not be read.", retry waits out "Reading unanswered detail
again" then reaches the far story; an Inspect chosen after an unavailable or
failed reference stays when the catalog heals, with ten shown of 35.

### 8. Cancel a pending Done reference and leave source navigation alone in the group
Type: Behavior
Status: planned
Proof: the three `story-reference-done-cancellation` tests (touch) in
`story-reference-done-cancellation.spec.ts`; then delete the interim spec and
`storyReferenceDone.ts`, set `dashboard-integrated` to `shards: "[1]"` with no
`specs` in `.github/workflows/ci.yml`, point the "pattern matching no spec"
case of `Distribution/tests/support/browser-group-shards.test.mjs` at the
Backend group, and set the group's shard count to 1 in
`dashboard/tests/shards.md`. Scratch break: move focus to a Done destination
that arrives after a pointer down; the second case fails.

Behavior: with the far Done record held and its reference followed → Inspect,
"Show latest 10", a pointer down on Inspect or Tab away from Dismiss
supersedes the jump: the record arrives, the keyboard stays where the
developer moved it, the notice empties and the pointer's own click still
opens detail. The interim group lists 3 tests in 1 file.


## Story obligations

### G1. Real Take home named by the story asserts only refusal
Reported: slice 2 — "e2e/launches/agent-launch-start-dependencies.spec.ts asserts takenProfiles and claudeLaunchCalls empty, not a real Take"
Story clause: "The real Take behind a starting story stays with E2E `launches/agent-launch-start-dependencies.spec.ts`"
Disposition: proved by slice 2: e2e/launches/agent-launch-story-card.spec.ts 'only explicit Start sends the exact multiline draft and the card distinguishes accepted startup from a launched session' (held host, Local startup in progress, claudeLaunchCalls length 1; developer chose this existing case as the home on 2026-11-18)
Commitment: 5a
