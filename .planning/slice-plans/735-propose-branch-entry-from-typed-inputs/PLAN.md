# Propose a branch entry from typed inputs and expose its pin refs

**Identity:** SEED-413#split-branch-entry-proposal-from-store
**Source:** [Propose a branch entry from typed inputs and expose its pin refs](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#split-branch-entry-proposal-from-store)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Dashboard maintainers exercise branch-entry decisions with a typed launch
record and real Git. Entry persists through the existing handoff adapter.
Review, attribution and publisher cases arrange the kept entry as data, and
pin assertions read real refs through the production owners of both namespaces.
The same deletion, expiry, replacement and publication promises keep their proof.

The [Done transition](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#split-done-mark-decision-from-store)
owns Done state and Git capture. The [observation](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#observe-done-deliveries-over-typed-records)
and [landing report](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#decide-landings-over-typed-attempts-and-records)
stories own their respective store splits. The [launch arrangement story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#fold-done-capture-launches-into-makeme)
owns the general presets. Reuse any composed Done state already delivered.
The branches, revisions and timelines supplied by this plan also work with
the current Done adapter where a case still calls it.

## Key examples and proof

| Example | Observer and slice |
| --- | --- |
| An open Default main launch proposes a registered draft with a dirty tree and a distinct Default main tip. A foreign clone, mismatched branch or second place is refused. The same place returns the first entry after main moves. | Proposal with a typed record and real Git, plus one store-backed dirty-entry case for real pinning and same-place retry against a stale caller record. Slice 1. |
| Removing a replaced Cursor session clears the original host-qualified owner's pins and preserves another session's pins. A newer Done keeps only its own comparison. | Branch-pin queries in the Cursor replacement, expiry and Done race cases. Slices 2 and 6. |
| A manual delivery keeps one pair across repeated observations. Deletion or loss during inspection releases only the evidence it owns. | Real ref queries in the revision observation, lifecycle and blank publication cases. Slices 3 and 6. |
| A review starting with its entry shows post-entry branch files and the earlier Default main run separately. Imported trunk text and conflicting baseline evidence still produce their existing comparisons or refusal. | Composed entry in the typed review and attribution cases. Slice 4. |
| The installed publisher's prepared pair and exact retry belong to the declared launch after retirement and Done. | Real installed publisher with a kept record composed with its entry and production `branchLandingContext`. Slice 5. |

## Current decisions

- Follow the [Architectural North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
  Keep one `SessionBranchEntry` shape and one owner for each pin namespace.
  The same typed record goes into the review and local persistence adapters.
- **Proposal and persistence.** Modularize the Git work already in
  `sessionBranchEntry.ts`. Reuse `resolvedCheckout`,
  `readBranchWorkspace`, `branchTrunk` and `observeBranchTrunk`.
  The proposal accepts the source trunk ref, a `LaunchRecord` and the
  requested place, distinguishes a kept entry from a new one, and uses the
  current conflicts. It can write the working tree object to Git. Persistence
  and ref pinning run only in `recordSessionBranchEntry`. That adapter takes
  the source id and ref and rechecks the live launch, existing place and
  repository in `changeSessionRecord` before pinning. Preserve the cleanup
  if pinning or the write fails. Preserve the HTTP request shapes, origin
  check, session and reporting-reference admission, and landing-context
  creation after the write.
- **Pin reads.** Reuse the `for-each-ref` read already in
  `launchLandingGit.ts` alongside `removePins`. Return real ref names
  and object ids, ordered by Git ref name. Read session branch pins beside
  `sessionBranchRefPrefix` from a typed `SessionReference`; use
  `branchPinOwner` where the native id changed. Read one-shot refs beside
  the landing prefixes for the repository and, when the consumer names
  them, the reporting reference or delivery. Check object ids and the
  complete ref set where the older assertions checked for stray pins.
- **Composed entries.** Extend `makeMe.aLaunchRecord` with the existing
  outcome or branch-evidence builder's entry step. The outcome builder is
  235 lines at the preparation base. Keep the branch evidence steps together
  in the Done story's evidence module if present. If the new step would
  exceed the limit before that module lands, move the coherent capture
  evidence steps into the builder's existing inheritance chain. Keep launch
  request and reporting builders separate. Use known fixture commits and
  trees for a clean entry. When an attribution case needs the actual dirty
  entry tree or observed trunk, take that value from the store-free proposal
  before subsequent work, then compose it. Keep Done capture in the
  attribution cases whose assertions depend on how Git imports are detected.
- **Removal.** Use the existing per-write retention notification seam.
  Let its write take the explicit callback for expiry cases and reuse the
  production cleanup in that callback. Keep the launch boundary's normal
  dispatch as the default and call cleanup after an actual rewrite.
  Explicit deletion already goes through `deleteRecord` with its own
  cleanup order and stays that way.

## Decisive premises observed

All observations below are from this owned preparation checkout at
`ddbb2cb90ce6` on 2026-11-20, on AC power, with Node 24.21.0 and
`npm ci`. Scratch changes were restored. The command prefix for both
test runners was
`caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`.

| Consuming operation | Observation and result | Limit and plan consequence |
| --- | --- | --- |
| Actual Git entry, attribution, review, publisher, deletion and expiry consumers (slices 1, 3–6) | `npm run --silent test:dashboard:backend -- ad-hoc-session-branch-entry ad-hoc-branch-entry-attribution ad-hoc-branch-cursor-recovery ad-hoc-branch-result ad-hoc-branch-worktree-result ad-hoc-manual-landing-observation-lifecycle ad-hoc-manual-landing-revision-observation ad-hoc-prepared-landing-done declared-blank-launch-publication declared-worktree-publication kept-commits-release --workers=2`. Vitest passed all 28 cases in 12 files. This exercised the dirty handoff and repeat, both review comparisons, attribution conflict, real publisher acceptance and retry, and the lifecycle races. | The baseline uses the existing production operations and establishes the outputs to preserve. The slice proofs exercise the new seam and new arrangements on the same journeys. |
| Adapter really retains the distinct entry objects in Git (slices 1–2) | `npm run --silent test:dashboard:backend -- ad-hoc-session-branch-entry --workers=2 --grep 'keeps its entry state'`. Temporarily bypassing `keepBranchEntryRefs` left the proposal's tips intact but failed the existing ref assertion with an empty list where three objects were expected. Restored, it passed. | Keep a real write and object assertions in this case even after the proposal and pin query move. |
| The request-based Done race observes actual pins after a quiet completion overtakes a held manual Done (slice 2) | `./node_modules/.bin/playwright test --config dashboard/backend.playwright.config.ts ad-hoc-branch-result-race.spec.ts --workers=2 --reporter=line`. One case passed, observing the later revision and its pins and excluding the earlier one. | Keep this native runner in the focused proof so an unnoticed selection difference cannot omit the HTTP race. |
| Expiry uses the original owner's branch pins after Cursor replacement (slices 2 and 6) | `npm run --silent test:dashboard:backend -- ad-hoc-branch-cursor-recovery --workers=2`. Temporarily bypassing `releaseExpiredRecordPins` in the retention callback left two pins at the expiry assertion. Deletion and stale binding passed. After restoration, all three passed. | Route the explicit expiry collaborator through the document write so this same observer still exercises real pin cleanup. |

## Slices

### 1. A typed launch can propose its branch entry

Type: Behavior
Status: done

Given the launch record and a worktree, the proposal answers the captured or
previously kept entry, or refuses the conflicting place. Keep lazy admission
before a new Git capture and the transaction check after capture. Move the
foreign clone, wrong branch and second-place assertions in
`ad-hoc-session-branch-entry` to the proposal, including the second session
that can declare its own worktree. Keep the dirty-entry pin-and-repeat case at
the adapter and the stale native replacement case on the production store.

**Proof.** The typed cases run with real Git and composed records without
`keep` or a HOME stub. Assert the working tree, Default main tip and trunk
fields. A same-place proposal from an already kept entry returns it after
main advances. The adapter case still checks all three real objects and the
entry returned on repeat. Run the two entry specs, Cursor recovery and the
declared publisher specs. Exercise the actual branch-entry route with a
valid local handoff in the affected boundary proof, observing its stored
entry and returned answer.

**Learning.** `proposeBranchEntry` lives in `dashboard/server/branchEntryProposal.ts`;
`branch-entry-proposal.spec.ts` holds the typed cases and still builds its
record with `aDeclaringLaunch`, which slice 5 replaces. At load 19–23 the
13-file consumer run timed out at the 5 s default in ten 3–5 s Git-heavy
cases across untouched files (Cursor recovery, declared publication, manual
observation lifecycle, attribution); the same cases passed at load ~15. Slices
2–6 remove setup from exactly these cases; the final ADR 0010 comparison must
show them clear of the edge, and any CI timeout on them is this execution's repair.

### 2. Branch evidence is read by host and session

Type: Behavior
Status: done

Given a repository and a `SessionReference`, the production query reads
only the requested host and session's refs. Migrate all `sessionBranchPins`
readers and Cursor's local `cursorPins`. Keep checks for the original,
replacement and unrelated session as separate reads where the scenario
distinguishes them. Remove the copied session prefix from support.

**Proof.** Run `ad-hoc-session-branch-entry`, Cursor recovery, the
branch-result lifecycle, worktree and supersession specs, the manual
observation lifecycle and the retained `ad-hoc-branch-result-race` case.
Keep the entry's three object ids, the newer Done's pins and exclusion of
the earlier result, and the unrelated owner's refs after deletion or expiry.

**Learning.** `heldPins` in `launchLandingGit.ts` is the one `for-each-ref`
read; `sessionBranchPins` in `launchRecordPins.ts` reads by `SessionReference`,
and specs assert its `{ref, objectId}` entries directly. The Cursor
recovery deletion case timed out at 5.0 s at load 15 (also once in slice 1)
and passed at 3.2–3.5 s: a flaky case that slice 6 repairs.

### 3. Landing evidence is read through its own namespace

Type: Behavior
Status: done

Given a repository with one-shot delivery pins, query the actual pins through
the shared landing prefixes. Migrate the observation lifecycle, repeated
revision and blank publication cases from `landingPins`; use the scoped
reads for exact pair or reference checks and the repository-wide read where
the case checks for duplicates, other owners or an empty namespace. Remove
the copied helper. Keep the branch-retirement operation in that support file.

**Proof.** The two observation specs and blank publication case still show
the expected base and revision, preserve the same refs after repeated
observation, and show the expected survivors or empty ref set after removal.

**Learning.** `heldLandingPins(repository, scope?)` reads the one-shot
namespace, one reporting reference or one delivery. The one-shot recovery
deletion and capture admission specs use it too. Session-commits queries and
whole-repository snapshots are outside both pin namespaces. Test support only
shrinks in this story: extra worktrees come from MakeMe's `withWorkspace`, and
`adHocBranchRefs.ts` keeps only `retireAdHocBranch`. The vitest backend runner
silently skips Playwright-backed specs; run those through
`dashboard/backend.playwright.config.ts`.

### 4. Review and attribution start from composed branch entries

Type: Behavior
Status: done

Given a record built with an entry, the review separates the branch's later
changes from pre-entry main work, and attribution sees the same baseline
when trunk changes are imported. Add the MakeMe entry step with the first
review move. Migrate the review-topic cases in `ad-hoc-session-branch-entry`
and the entry preconditions in `ad-hoc-branch-entry-attribution`.
Run the real Git Done capture when the case proves its attribution or its
refusal. Compose the rest of the review input through the existing typed
review seam where Done is also a precondition.

**Proof.** Keep both run keys, comparison ends, file text, the own-branch
selection for two sessions, the imported-versus-local line diff, and the
409s when another comparison or file is requested. Run the two entry specs
and the consumer trace's users of the changed MakeMe builder, including
Distribution readers that consume its launch record.

**Learning.** `makeMe.aLaunchRecord` gained `enteredBranch(entry)` in
`launchOutcomeTestData.mjs` (248 of 250 lines; the next outcome step needs
the planned move of capture evidence steps). A composed entry needs `trunk`
and canonical workspace paths. Review and attribution cases still run real
Done capture because no composed Done state has landed. At load 18–35 every
Git-heavy case in these specs, including the unchanged adapter case, ran
4.6–5.1 s and timed out. Hosted CI run 44763695804 passed on `f64b3dd`.

### 5. Declared publication starts from a composed kept entry

Type: Behavior
Status: planned

Given the installed publisher and a kept record whose entry names its real
worktree, production `branchLandingContext` derives the launch's existing
authority. Move `aDeclaredPublisherBranch` to this setup using the MakeMe
entry step. Keep reporting facts and other records visible in the cases.
Reduce the preset to its existing publisher concerns, with branch-entry
data constructed through MakeMe. Replace remaining `aDeclaringLaunch`
and `identifyBranch` calls where the actual branch adapter is the topic
with the existing launch builder and direct production call. Retire
`declaredBranchCase.ts` and update its references in the backend-test guide.

**Proof.** Run both declared publication specs, `ad-hoc-prepared-landing-done`,
the entry specs and Cursor recovery. Keep the original launch's authority,
wrong launch and candidate refusals, prepared pair, acceptance, exact retry,
the comparison after retirement and Done, and the deletion result.

**Learning.** `declaredBranchCase.ts` is gone; `aDefaultLaunch` defaults its
Git directory to the canonical path production records, and the publisher
preset composes the proposal's entry. The publisher cases never needed the
session-branch pins the old adapter path wrote. Local proof ran at load 25–39
with the Git-heavy timeouts recorded under slice 4; hosted CI proves this
revision.

### 6. Expiry cases pass the cleanup operation explicitly

Type: Behavior
Status: planned

Given the typed expiry callback, a real record write that drops a record
calls the production cleanup on that dropped record after the rewrite.
Thread the callback through the write used by `changeSessionRecord` and
reuse the same cleanup function in `installRecordRemovalDispatch`.
Convert the expiry setup in Cursor recovery, branch-result lifecycle,
manual observation lifecycle and kept-commits release. Keep the explicit
delete cases on `deleteRecord` and the launch-boundary startup dispatch.

**Proof.** Run the four lifecycle specs and affected launch record and
history readers. Keep the proof that only the leaving record's pins are
released, the survivor can finish an observation, and a removed launch
cannot be recreated by its held inspection. Rerun the pin-cleanup
discrimination from the premises against the explicit callback.

**Repair carried here.** The Cursor recovery deletion and expiry cases flake
at the 5 s default under load ~15 (slices 1–2). Make their setup cheaper while
converting this spec, without raising timeouts, and show both cases well clear
of the limit across three runs at comparable load.

## Local gates

- Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Apply [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) before editing
  tests or builders and apply [page-object selection](../../../.agents/skills/dough-page-objects/SKILL.md)
  for browser-backed proof. Use default test timeouts and omit `test.slow()`.
- On AC power, use `caffeinate -s -i` as described in
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos),
  clearing `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `NO_COLOR` and `FORCE_COLOR`
  as above. Run the focused backend commands per slice and
  `npm run typecheck:dashboard` for the typed boundaries. Run
  `npm run lint` across the changed TypeScript and JavaScript. For the
  retained race, use
  `./node_modules/.bin/playwright test --config dashboard/backend.playwright.config.ts ad-hoc-branch-result-race.spec.ts --workers=2 --reporter=line`
  to see its native result.
- Run the installed [consumer trace](../../../.agents/skills/dough-execute-plan/scripts/consumer-trace.mjs)
  with `--base HEAD` for each changed boundary. Include effect terms
  `sessionBranchEntryEndpoint`, `branchLandingContext`, `sessionBranchPins`,
  `landingPins`, `cursorPins`, `declaredBranchCase`, `aDeclaredPublisherBranch`
  and `installRecordRemovalDispatch` where applicable. Follow the recorded
  entry into `sessionBranchCapture`, `recordDoneAt`, branch landing
  authority, publication and review. Run the reached readers in addition
  to the slice cases. Done catalog entries are historical and the
  unchanged reporting command and route registration are exercised by the
  branch-entry route proof.
- Under [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md),
  record the affected roster at the execution base and compare the same
  cases on the final candidate with the same runner and worker count at
  comparable load. Count branch-entry helper imports and calls, HOME stubs
  and backend imports of `adHocReview.ts`. Use the runner's proof or timing
  records for median and summed case time over three interleaved runs.
  A worthwhile gain is fewer replayed entry writes and duplicated ref
  queries with every promise still covered. Record timing and remaining
  store use by proof owner, including the publisher and lifecycle cases.

## Plan review

Slice-plan refinement was unnecessary. Each slice has one observable
consumer outcome, with the entry builder introduced alongside its first
review use and the branch pin query preceding its retention use. This
review found no remaining slice-specific concern.
