# Correct incident identity and observation residue

**Identity:** SEED-225#correct-incident-and-workspace-observation-residue
**Source:** [correction story](../../seeds/SEED-225-restore-dashboard-responsiveness.md#correct-incident-and-workspace-observation-residue)

## Provenance

Execution retrospective of SEED-225#restore-dashboard-responsiveness (plan
456), reviewing `b108395049..0eec7393f` (commits `fc23efe0`, `fb8e6b05`,
`1c986e7f`, `f1e43552`, `77ad1d86`, `c80ed8bf`, `4c0ae9b1`, `41dd68ff`,
`9c69dcc6`, `0eec7393`). The original story's promises, examples and
restrictions stand; this plan only corrects defects in the delivered code
and proof.

## Findings (current at `0eec7393`)

1. **Dev restart reuses the incident identity.** `dashboard/vite.config.mts`
   imports `./server/localBoundaries.ts`, so editing a server file restarts
   Vite in the same process: the new instance loads `incidentRecord.ts`
   again with `sequence = 0` and the same `processStartedAt` (`:39`), entry
   identity is `pid@processStartedAt#seq` (`incidentEntry.ts`), and
   `incidentProcesses.ts` keys processes the same way. The new instance's
   entries replace the old instance's same-seq entries in
   `readIncidentRecord`, and the old instance's `process-ended` ends the
   running one, so a later SIGKILL reads as `ended`, not `lost`.
2. **Timing-fragile recovery proof.** `dashboard/tests/owner-replacement-recovery.spec.ts`
   `waitingOnItsCall` waits about 1 s of wall time for the queued read to
   reach the owner before the kill; under load the read can arrive after the
   kill and the spec fails. Under the project's failing and flaky test
   policy this counts as failing.
3. **Git identity watches folder times.** `gitFilesIdentity.ts` includes the
   checkout's `.git` and the main worktree's `HEAD`; a plain `git status` in
   the main checkout moves `.git`'s mtime (index lock rename), so the next
   poll rescans every worktree (the ~170 ms, 66-spawn path). No workspace
   fact the answer shows depends on those times.
4. **Lost-connection wording covers greetings.** `readFailureMessage.ts`
   words every `connection-failed` as a lost connection without advice, but
   `github-request-owner-endpoint-connection.mjs` also raises it during the
   greeting, before any request was sent, where the endpoint advice applies.
5. **Two lists of history-only fields.** `dashboard/src/doneSessionListing.ts`
   removes and `withRetainedDetail` restores the same four fields from two
   hand-written lists that can drift.

## Preserved promises and constraints

Everything plan 456 proved stays proved: incident evidence across
replacement, stalls, lost processes, recovery without reload or duplicate
dispatch, the unchanged-poll and answer-size targets, and retained-session
behavior. No change to the request owner's protocol (story restriction); a
distinct mid-request cause, if needed, stays inside the consumer library.

## Outside-in proof

Commands from the worktree after `setup-native`:
`env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list <specs>`,
`bash scripts/test.sh <paths>` for node tests (Homebrew Bash 5 on PATH).
Apply the repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written: a failing or flaky test is a defect to fix, reproducing on main
is attribution not exemption, CI failing on a published revision is the
publisher's to repair through to final CI, never rerun-until-green, stop
only for product, design or credential judgment, and preserve another
active owner's uncommitted repair.

## Ordered slices

### 1. A restarted dev server keeps its own incident identity
Type: Behavior
Status: planned
Proof: a focused test mounting the incident boundary twice in one process
(as a Vite restart does): both instances' entries stay listed, the closed
instance reads `ended`, the running one `current`, and a killed process
started after a restart still reads `lost`; the incident-record specs stay
green.

Behavior: Vite restarts the server in the same process → each instance's
entries and lifecycle stay its own.

### 2. The owner-replacement proof waits on a queued signal
Type: Structure
Status: planned
Proof: `owner-replacement-recovery.spec.ts` waits for an observable sign
that the read is queued at the owner (for example a test-only count of
waiting requests in the private owner fixture) instead of wall time; its
assertions are unchanged; `--repeat-each=5` under `--workers=4` with other
specs running stays green.

Structure: the proof's queued precondition is observed, not timed.

### 3. Git in the main checkout leaves the workspace identity alone
Type: Behavior
Status: planned
Proof: `git-files-identity.spec.ts` gains a case where `git status` and a
new top-level file in the main checkout keep the identity, while every
existing change case still moves it; the replay's unchanged poll holds.

Behavior: a developer runs Git in the main checkout → the next poll reuses
the workspaces.

### 4. Only a mid-request loss reads as a lost connection
Type: Behavior
Status: planned
Proof: a greeting-time `connection-failed` keeps the endpoint advice, while
the owner-replacement page spec still reads the lost-connection wording;
consumer trace over the cause and `ownerFailureText`.

Behavior: the owner cannot be greeted → the page says how to correct it;
it is lost mid-request → the page says it was lost and recovers.

### 5. One declared list of history-only fields
Type: Structure
Status: planned
Proof: `doneListing` and `withRetainedDetail` derive from one list; the
listing, retained-history and done-listing specs stay green.

Structure: the history-only field rule has one home in the browser code.

## Current decisions

- Findings 1–5 form one bounded correction of plan 456's delivered code;
  none changes a story promise.

## Learnings

None yet.
