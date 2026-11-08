# Keep one launch store vocabulary and coherent kept records in dashboard tests

**Source:** [Keep one launch store vocabulary and coherent kept records in dashboard tests](../../seeds/SEED-261-share-domain-test-data.md#align-kept-launch-store-setup)

**Source review:** [Source-only commitments](source-review.md)

**Identity:** SEED-261#align-kept-launch-store-setup

## Provenance and findings

Correction of SEED-261#map-launch-and-session-test-data
(`3e177c0ef59a0d5a4045a0fa167979845324c873:.planning/seeds/SEED-261-share-domain-test-data.md#map-launch-and-session-test-data`;
plan `3e177c0ef59a0d5a4045a0fa167979845324c873:.planning/slice-plans/534-map-launch-and-session-test-data/PLAN.md`
and its `source-review.md`), from its execution retrospective. Reviewed
commits on claim `e75b693ab`: `681a9d6f8`, `fef192f3d`, `737f509fb`,
`3e177c0ef`. Findings re-verified at `3e177c0ef`:

1. `dashboard/tests/terminals/agent-terminal-avatar.spec.ts:31-41`
   `establish` rewrites the server-written ad hoc Claude record, and its
   three steps (`:135-141`, `:169-178`, `:189-198`) give it a story
   `preparation` or `start` for `SEED-001#story`. The dashboard never
   records that launch: `makeMe.aLaunchRecord.please()` refuses an ad hoc
   record with a story branch ("only a story's start or preparation
   establishes a story branch"). Slice 3 of plan 534 left it "for
   siblings", but no sibling story owns a Claude terminal-header portrait
   case.
2. Outside `dashboard/tests/support/launchStore.ts`, 27 dashboard test files
   build `.open-dough/dashboard/agent-launches.json` by hand to read the
   store back or wait for it (listed under slice 2). The story's scope says
   the store file and its location stay harness layers, and plan 534 kept
   reading back with the harness; the owner already has `launchStoreFile`
   and `keptLaunchStore`.
3. `dashboard/tests/machineLaunchRecords.ts:15-28` keeps `storeFile`,
   `seedStore` and `storedRecords`, forwarders parallel to the owner's
   `launchStoreFile`, `keepLaunchStoreText` and `keptLaunchStore` over
   `machineHome(machine)`. Exact-text writes use both names (`seedStore` in
   about six files; `keepLaunchStoreText` directly in
   `agent-launch-codex-creation.spec.ts`, `production-watcher-updates.spec.ts`
   and `agent-launch-held-revision-after-action.spec.ts`).
4. At `cf709170a`, `final-report-admission.spec.ts` still derives Claude and
   Cursor fixtures from a retained Codex launch. Their requests retain the
   Codex host even though their sessions name a different host. The completion
   and landing story has closed, and the developer added this cleanup to 543.

## Goal and scope

Maintainers reading dashboard tests find the kept launch store written and
read through one harness owner with one name per operation. The avatar and
final report admission tests keep records the dashboard can record.

Preserved: every assertion's discriminating check and all product
behavior; exact, malformed, legacy and unreadable store text written
explicitly at the call site; record construction through
`makeMe.aLaunchRecord`.

Excluded (reasoned no-change or owned elsewhere):

- `recently-done-sessions-sidebar-projects.spec.ts` keeps its dedicated E1
  case as the key-example proof.
- Host setup in `agent-terminal-codex.spec.ts` and the legacy reporting setup
  in `oneShotReviewChoices` stay outside this correction. The closed host
  continuation work already removed the Codex cast in
  `project-restored-session.spec.ts`. Its store reader remains in slice 2.
- The opt-in `sessions-replay.spec.ts` timeout override stays (plan 534 G1).
- Sibling-family helpers keep their store code for their stories:
  `support/codexLaunch.ts`, `support/cursorStart.ts`,
  `support/keptCursorTurn.ts`, `support/cursorSessionRecovery.ts`,
  `support/completionRecovery.ts` (its fault hook matches the store's
  temporary file name) and the `fixtures/fake-cursor` executable.
  `session-alerts-activation.spec.ts` names the `/api/agent-launches` URL,
  not the store.

## Current decisions

- `dashboard/tests/support/launchStore.ts` stays the one owner. Add one read
  counterpart to `keepLaunchRecords`: `keptLaunchRecords(home, source =
  "open-dough")`, the project's records as the store holds them, replacing
  `storedRecords`. Delete `storeFile`, `seedStore` and `storedRecords` from
  `machineLaunchRecords.ts`; callers name `launchStoreFile`,
  `keepLaunchStoreText` and `keptLaunchRecords` with `machineHome(machine)`.
  `machineHome` and the clock helpers stay where they are.
- A test that compares the store's exact bytes reads
  `readFileSync(launchStoreFile(home), "utf8")`; one that parses it uses
  `keptLaunchStore` or `keptLaunchRecords`; one that waits for the store
  polls `existsSync(launchStoreFile(home))`. A case that puts the store's
  lock or its directory under test derives them from `launchStoreFile`
  (`agent-completion-identity.spec.ts`), and a fault hook embedding the
  path embeds `launchStoreFile(...)`
  (`agent-completion-early-recovery.spec.ts`).
- The avatar case keeps the ad hoc start it makes through the dashboard for
  its no-agent step, then, per agent step, keeps one record built by
  `makeMe.aLaunchRecord.executing(...)` or `.refining(...)` of the Taken story
  (`takenIdentity`/`takenStory` from `agentRosterRecords.ts`)
  `.onStoryBranch({ ...workspace, agent })`
  `.inClaudeSession({ sessionId })`, launched when the server-written record
  was, through `changeLaunchStore`/`keepLaunchRecords`. `establish` and its
  untyped `Kept` go. The "rows unchanged" check keeps proving the portrait
  does not displace the rows; its expected text now names the record the
  step keeps (the Taken story's title and "Execution session" or
  "Refinement session"), written independently at the call site. Only this
  literal follows the coherent record; every portrait, size, position and
  identity assertion stays as is.
- In final report admission, keep the real retained Codex launch for native
  history. Build the Claude launch with its own session ID, a saved completion,
  and no established workspace. Build the Cursor launches with their own
  session IDs, saved workspace and resume details, and the existing present,
  empty, absent and closure-evidence variants. Keep the wrong-host request
  against the Codex ID and all assertions exactly as written.
- No MakeMe builder change is needed (premise 1). If one turns out to be
  needed, run `npm run typecheck:dashboard` and the full suites named below,
  because `tests/support/makeMe.mjs` is loaded by every runner.
- Follow [ADR 0002 §5](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
  and [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state):
  the record is the domain fact, the store file is harness.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| A coherent kept execution or refinement record of the Taken story, keeping the server-written Claude session id and launch time, attaches its terminal and shows the agent's portrait with the same portrait, size and position checks | `npm run test:dashboard -- dashboard/tests/terminals/agent-terminal-avatar.spec.ts` | 2026-11-09 at `3e177c0ef`: a scratch copy of the spec replaced `establish` with the builder record above (`executing`/`refining` + `onStoryBranch({ workspace, branch, agent })` + `inClaudeSession({ sessionId })` + `launchedAt(kept)`) and expected rows "See who owns Taken work" / "Execution session" or "Refinement session"; ran with `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run test:dashboard -- <copy> <original> --reporter=list --workers=2` beside the original; scratch removed | Both passed (5.1 s, 5.2 s). Settled; no builder change needed. |
| `launchStoreFile` yields the exact path each hand-built form names | Every converted reader in slice 2 | 2026-11-09 at `3e177c0ef`: `node --input-type=module` importing `launchStore.ts` and `machineLaunchRecords.ts`, comparing `launchStoreFile(h)` and `launchStoreFile({ home: h })` with `path.join(h, ".open-dough/dashboard/agent-launches.json")`, the three-segment join and the template-string form, and `launchStoreFile(machineHome(m))` with `path.join(m, "home/.open-dough/dashboard/agent-launches.json")` | All four equal. Settled. |
| Removing the forwarders leaves no unseen consumer | Slice 2's forwarder deletion | `npm run typecheck:dashboard` (`tsc --build dashboard/tsconfig.json`) covers `tests`, `frontend-tests` and `backend-tests` (`dashboard/tsconfig.node.json`), so every importer fails to compile until converted; the JavaScript `fixtures/fake-cursor` imports no test module | Settled by the slice's own typecheck gate. |
| The wrong-host rejection and the unsupported-reader response depend on different facts | `/__agent-launch/result` with the existing requests in `final-report-admission.spec.ts` | 2026-11-09 in the owned preparation checkout at `28f90f8b0`: temporarily replaced the copied records with the Claude and Cursor MakeMe records and ran `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH=/opt/homebrew/bin:$PATH caffeinate -s -i npm run test:dashboard -- 'backend-tests/sessions/final-report-admission\.spec\.ts$' --reporter=list`. The one selected spec passed in Chromium with its original assertions and requests. Scratch edits were restored. | Settled. Slice 3 repeats the proof on the delivered fixture. |

## Proof and local gates

Each slice keeps every assertion except the one avatar literal named
above, and its touched specs pass. Before each change, trace the consumers
of every altered or removed helper with the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
and run the specs it lists. No native scenario reads the kept store through
these helpers; confirm that in the trace.

Local gate: follow the [test automation rules](../../../AGENTS.md#test-automation)
and the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written, carried into every slice and delegation. A fresh worktree needs
[native setup](../../../tests/native-setup.md) first. Run Playwright through
`npm run test:dashboard -- <spec selection>` with `NO_COLOR`, `FORCE_COLOR`
and `GIT_ALTERNATE_OBJECT_DIRECTORIES` unset; run
`npm run typecheck:dashboard` after each slice, since both change shared
dashboard test support, and `npm run lint` before each commit. On fully
awake macOS with AC power wrap each multi-spec run in `caffeinate -s -i`
with Homebrew Bash 5 first on `PATH`; on battery follow the lid-open and
log-check guidance in
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
No full local suite is required: MakeMe and runner-wide fixtures do not
change, and the traced specs cover every consumer of the changed helpers.
Hosted CI and publication follow the selected execution mode.

For the final [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
evaluation, compare original and converted call sites: one store vocabulary
remains, the facts governing each outcome stay visible, and the avatar
case's records are ones the dashboard records.

## Slices

### 1. The terminal header portrait case keeps records the dashboard records
Type: Behavior
Status: planned
Proof: `dashboard/tests/terminals/agent-terminal-avatar.spec.ts` passes with every portrait, size, position and identity assertion unchanged; `npm run typecheck:dashboard`.

An execution of the Taken story by stanly-chan is kept with its Claude
session → its terminal opens → the header shows stanly-chan's cartoon left
of the rows naming the story and "Execution session". Apply the avatar
decision above to all three agent steps (Yui-chan's refinement, stanly-chan's
and ruuf-chan's executions), delete `establish` and `Kept`, and read or wait
for the store through `launchStoreFile`/`keptLaunchStore` instead of the
hand-built `storeFile` at `:86-92`. The no-agent ad hoc step and its rows
stay as they are.

### 2. One store vocabulary reads and writes the kept launch store
Type: Structure
Status: planned
Proof: Every spec the consumer trace lists for `storeFile`, `seedStore`, `storedRecords` and the 26 converted readers passes with unchanged assertions; `npm run typecheck:dashboard`; a search of `dashboard/tests`, `dashboard/backend-tests` and `dashboard/frontend-tests` finds `agent-launches.json` only in `support/launchStore.ts` and the excluded sibling helpers, and no import of the deleted forwarders.

Add `keptLaunchRecords` to the owner, delete the three forwarders and
convert their callers (`agent-launch-records*.spec.ts`,
`agent-launch-own-record-continuation-race.spec.ts`,
`ownRecordContinuation.ts`, `agent-completion-binding.spec.ts`,
`agent-launch-done-close.spec.ts`, `agent-launch-retention-scope.spec.ts`,
`agent-launch-open-session.spec.ts`, `agent-completion-quiet-claude.spec.ts`,
`project-add.spec.ts`, `project-configuration.spec.ts`,
`project-remove.spec.ts`, `agent-launch-creation-gates.spec.ts`,
`project-restored-session.spec.ts`). Then route the hand-built readers
through the owner under the decision above:

- `backend-tests`: `launches/agent-launch-codex-options`,
  `launches/agent-launch-host-identity`,
  `review/one-shot-landing-recovery-retention`,
  `sessions/agent-completion-attempt-loss`,
  `sessions/agent-completion-binding`,
  `sessions/agent-completion-early-recovery`,
  `sessions/agent-completion-identity`, `sessions/agent-launch-delete`,
  `sessions/agent-launch-session-listing`.
- `tests`: `configuration/project-remove`,
  `launches/agent-launch-codex-model`,
  `launches/agent-launch-preparation-cursor`,
  `launches/agent-launch-start-cursor`, `launches/agent-launch-start-taken`,
  `launches/codexEffortWorkspaceCases`, `launches/codexModelCatalogCases`,
  `launches/responsive-session-recovery-verification`,
  `review/story-review-trunk-worktree`, `runtime/productionUpdateJourney`,
  `sessions/agent-completion-attention`,
  `sessions/agent-launch-codex-observation`,
  `sessions/agent-launch-recent-delete-unavailable`,
  `sessions/agent-launch-recent-delete`,
  `sessions/agent-launch-story-card-delete-problems`,
  `sessions/agent-launch-story-card-delete`,
  `terminals/agent-terminal-cursor-page`.

Only the store path or read changes in sibling-family specs; their setup
stays for their stories. Delete a local `recordFile`/`storeFile` helper
once it only restates `launchStoreFile`.

### 3. Final report admission keeps records for the hosts it exercises
Type: Behavior
Status: planned
Proof: `dashboard/backend-tests/sessions/final-report-admission.spec.ts` passes with every existing assertion unchanged, including wrong-host rejection, unsupported Claude reads, all Cursor report and closure cases, and the Codex native-read checks; `npm run typecheck:dashboard`.

Replace the copied Codex records in this spec with coherent Claude and
Cursor `makeMe.aLaunchRecord` records. Preserve the fixture facts from the
decision above and write the records through the store harness. Keep the
actual Codex launch and its native-history setup.

## Concern evidence

The avatar and store boundaries remain useful on their own. Final report
admission has a separate focused proof loop and leaves both earlier slices
recoverable. All three slices fit their existing focused test gates.
