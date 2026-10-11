# Choose workspace and automatic landing for unattached Start session

**Identity:** SEED-066#unattached-session-options
**Source:** [story](../../seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options).
Planning only; this plan grants no Take, execution, or publication.

## Goal and boundaries

A developer starting an unattached Start session from the project row chooses
where the conversation runs (Default main or an isolated workspace) and
whether results it later verifies land automatically, with the story dialogs'
words and the same existing-changes confirmation. The choices create no
story, Take, or assignment. A workflow the developer later invokes in that
session works in the established place and honors the session's landing
intent; tracking comes from the invocation itself.

Included: the Start session dialog's Workspace and After checks choices with
the line beside Start and Command details; the existing-changes confirmation
for Default main, including the default choices; an isolated worktree
established through the installed shared start; the “Established session”
handoff on Claude Code, Codex, and Cursor; recovery of a stopped or expired
start to the same worktree; the installed skills' rule for an established
session; the dashboard launch documentation.

Excluded (the story's deferred promises): a Tracking choice in Start session;
automatic story or task selection; changes to the execution and refinement
dialogs; cleanup of an unattached worktree that never lands beyond Dough
Land's existing retirement; representing review-waiting results as published
facts; new hosts.

Assumptions: the no-selection default is Default main · Wait for review, a
stated decision in the story; an unattached request carries workspace and
landing only, and the one-shot-only rule for those choices is a story-workflow
rule that does not apply here; confirming existing changes never selects
automatic landing; direct skill invocations keep their contracts; native host
proof (ADR 0005) is a paid manual observation.

## Architecture

The seed's shared direction is followed; the
[North Star topic](../../NORTH-STAR.md#composable-session-policy-and-workflow-owned-start)
“Composable session policy and workflow-owned start” governs this choice, and
the UX North Star's
[launch dialog information hierarchy](../../../docs/dashboard-ux-ui-north-star.md#launch-dialog-information-hierarchy)
governs the dialog. Both topics retire at wrap-up once the code and
`dashboard/LAUNCH-START.md` carry their rules.

- **One policy owner.** `src/skills/dough-execute-plan/scripts/session-policy.mjs`
  stays the one definition of the choices, their values and flags. It gains
  the unattached choice set (workspace and landing, no tracking) so the
  dashboard (`dashboard/src/launchRequest.ts`, `sessionPolicyWords.ts`,
  `LaunchSessionPolicy.tsx`) renders Start session's group from the same
  words, offering the subset instead of a second component.
- **Workflow-owned establishment.** The launch boundary establishes an
  unattached session's place through the installed
  `execution-start.mjs start --one-shot` with no identity or publisher, exactly
  as PFE found it already serving unlisted one-shot work: `--integration
  <project>` and a `.worktrees/<slug>` workspace on the host's branch
  namespace for Isolated workspace; `--default-main` with the project folder
  on the target branch for Default main; `--auto-land --push-authorized` only
  for Automatically land. The receipt (`prepared`, `role`, `startingRevision`,
  `fetched`, `created`) is the established context. The dashboard creates no
  worktree itself and the native session creates none. Default main · Wait for
  review with a blank instruction runs nothing and stays today's blank launch.
- **Handoff.** A new `established-session.mjs` formatter beside
  `established-start.mjs` spells the “Established session:” block: workspace,
  workspace role, branch, remote, target, landing, and startingRevision and
  fetched when known. It names no tracking, identity, mode, or agent. Each
  host adapter places it where it places established starts
  (`hosts/claude/launch.ts`, `hosts/codex/input.ts`, `hosts/cursor/prompt.ts`),
  before the reporting context and the developer's text; a block makes the
  launch sendable, so the reporting context (with the launch's landing
  context) goes with it even when the instruction is blank. Launch records
  keep the policy and the established session, which `recordedWorkspace`
  reads for terminals and the sidebar.
- **Kept start per attempt.** Story starts are kept by project, story, and
  workflow; an unattached start has no story, so its kept start is bound to
  its launch attempt. Continue from Startup recovery resumes that workspace
  and branch and runs no second start; a stop that created no workspace
  removes it. No new registry or locking.
- **Skill rule.** One reference, `dough-execute-plan/references/established-session.md`,
  owned by the session policy's skill, states how an invoked workflow continues
  in an established session; the other skills link it rather than restating
  it. The rule rests on the observed start behavior below: a start given the
  established workspace and branch reuses it when clean (`published`,
  `created: false`, or `prepared`) and refuses a worktree with pending edits
  (`setup-failed`, `pending-edit`) without touching them, so the session
  commits or sets aside its edits and reruns; `--default-main` takes the
  default checkout as it is. Landing from the block is the advance keep for
  one-shot and contextual results and Dough Land; tracked work's own lifecycle
  publishes and ignores it.

Set aside: a dashboard-side worktree creation (the start already owns it); a
full `SessionPolicy` with a fabricated `tracking` for unattached requests;
reusing the one-shot “Established start” block, whose `tracking: one-shot`
would tell a later skill that one-shot work has begun. Accepted ADRs 0002,
0005, and 0006 apply as the seed records; no ADR changes.

## Observed premises

Observed on 2026-10-11 in this preparation worktree at `2fbcbb6f` with
Node 24.21.0 after `node scripts/setup-native.mjs npm`; scratch fixtures
lived under the job's temp directory and were removed.

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| The installed start prepares an unlisted one-shot workspace with no identity, at fetched trunk, publishing nothing, and `--default-main` takes a dirty default checkout as it is | Slices 2 and 3 establishment | `node --test src/skills/dough-execute-plan/scripts/one-shot.test.mjs src/skills/dough-execute-plan/scripts/default-checkout-session.test.mjs` | 6 pass; `prepared`, `created: true`, `startingRevision` = trunk, no remote head change; default-main receipt `role: "default-checkout"`, HEAD retained, nothing created |
| A tracked start given an existing established worktree and branch reuses it when clean and refuses pending edits without touching them | Slice 5's rule and example | Scratch script: `createQueuedTrunk`, `startCliResult(… ["--one-shot"], {identity: null, branch: "claude/session"})`, then `startCliResult(… [], {workspace, branch, identity: identityA})`; repeated with `notes.txt` written in the worktree | Clean: `published`, `created: false`, worktree HEAD at the Take on `claude/session`. Dirty: exit 1, `setup-failed`, `recovery.error` “existing workspace cannot continue on fetched trunk as claude/session2: pending-edit”, `?? notes.txt` still present |
| The real-start Playwright harness (bare origin, installed start, synthetic `claude`) runs here and the ad hoc boundary records what `claude` received | Every dashboard proof below | `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-default-checkout-warning.spec.ts dashboard/tests/agent-launch-ad-hoc-boundary.spec.ts` | 21 passed in 6.3 s (after installing dependencies in the worktree; the first run failed with `spawn …/node_modules/.bin/vite ENOENT`) |
| Today the boundary skips the existing-changes check and runs no start for an ad hoc request, and hosts send no block for it | Slices 1 and 2 | `vite-node` script importing `dashboard/server/launchStart.ts` in this dirty worktree: `unconfirmedStart(source, {workflow: "ad-hoc", instruction: "hi", …}, folder)` and `started(…)`; read of `claudeInstruction`, `codexInput` and `cursorPrompt`, which join only instruction and reporting | `undefined` and `{"kind":"none"}`: no warning and no start for ad hoc today, so slice 1's and 2's specs fail first for that reason |

## Outside-in proof ownership

| Promise | Owner and observable proof |
| --- | --- |
| Default choices in a dirty default checkout show the existing-changes screen; Back and Cancel start nothing; Continue starts with the changes preserved and the landing unchanged; a clean checkout starts without a warning | Slice 1, `dashboard/tests/agent-launch-start-session-existing-changes.spec.ts` with the real-start harness |
| Default choices with an instruction launch exactly as today: project folder, instruction and reporting context, no block, no story or assignment | Slice 1: the existing ad hoc specs stay green, and the new spec asserts the recorded `claude` argv |
| After checks offered; Automatically land sends the block with `landing: auto-land`, the reporting context with the landing context, and the line beside Start names the push Start authorizes; a blank instruction with a non-default choice is sent | Slice 2, `dashboard/tests/agent-launch-start-session-landing.spec.ts`; formatter unit test `established-session.test.mjs`; Codex and Cursor first-input cases added to their ad hoc specs |
| Isolated workspace creates one worktree at fetched trunk on the host's namespace, the session opens there, nothing is published, Command details and the sidebar name it | Slice 3, `dashboard/tests/agent-launch-start-session-isolated.spec.ts` (Claude), one Codex case |
| A stopped or expired start names its worktree and Continue resumes it without a second worktree | Slice 4, `dashboard/tests/agent-launch-start-session-recovery.spec.ts` with `DOUGH_START_TIMEOUT_MS` |
| Installed skills continue in the established session: workspace from the block, tracking from the invocation, landing inherited, no second workspace; pending edits are reported, not bypassed | Slice 5, `established-session-guidance.test.mjs` on the reference and its links, and `established-session-start.test.mjs` recording the start behavior in the premise table |
| Native behavior on Claude Code, Codex, and Cursor (ADR 0005) | Slice 6, manual observation record |
| Everything the launch contract already proves | `dashboard/tests/agent-launch*.spec.ts`, `one-shot-*.spec.ts`; `npm run typecheck:dashboard`; `npm run lint`; `node --test` over the touched skill scripts |

Local gates: `npm run lint` and `npm run typecheck:dashboard` are the
project's hooks for every commit; the focused Playwright and `node --test`
files above are each slice's proof, and the ad hoc and launch suites run where
a change reaches their surface (the dialog, the boundary answer, the hosts).

## Ordered slices

### 1. An unattached start in Default main confirms existing changes before starting
Type: Behavior
Status: done
Proof: the new spec and the existing ad hoc specs in the proof table.
Accepted proof: `agent-launch-start-session-existing-changes.spec.ts` (3 tests:
the dialog journey, the clean start, the raw boundary answers); the ten
`agent-launch-ad-hoc*.spec.ts` files and the default-checkout warning spec; the
`agent-launch*` and `one-shot-*` suites; `session-policy.test.mjs`.

Behavior: the project's default checkout holds a changed, a deleted, a staged
and an untracked file; the developer opens Start session, types an
instruction, Start → “Existing changes in default main” lists the paths and
count and says “Wait for review remains selected”; Back returns to the text as
typed; Cancel starts nothing; Continue with existing changes starts the session
in the project folder with `git status` unchanged, the instruction and
reporting context as today, and no block. A clean checkout starts at once.

Change: the ad hoc request schema takes the unattached `policy` (workspace,
landing, from the shared definition's new unattached choice set) and the
transient `existingChanges`; `unconfirmedStart` checks an ad hoc request
whose workspace is the default checkout, which the absent policy is; the
Start session dialog shows `LaunchExistingChanges` as the story dialogs do.
Run the ad hoc Playwright specs: any fixture with a dirty project folder now
meets the confirmation and is a consumer to adjust. `LAUNCH-START.md`
“Existing changes in default main” names Start session.

Safe stopping point: the default-checkout warning contract covers Start
session; nothing else changed.

### 2. After checks: Automatically land hands the session its landing intent
Type: Behavior
Status: planned
Proof: the landing spec, the formatter unit test, and the Codex and Cursor
first-input cases in the proof table.

Behavior: Start session with a blank instruction, After checks set to
Automatically land → the line beside Start reads `Default main · Automatically
land` and says verified results land on origin without another review and
that pressing Start authorizes that push; Start runs the installed
`execution-start.mjs start --one-shot --default-main --auto-land
--push-authorized` in the project folder and the session's first message is
“Established session:” with `workspace role: default-checkout`, `branch`,
`remote`, `target`, `landing: auto-land`, `startingRevision`, `fetched`, then
the reporting context carrying `--landing-context`. With Wait for review and
an instruction, the start still runs and the block says `landing: review`;
with Wait for review and no instruction, nothing runs and the launch stays
blank. The record keeps the policy. Codex and Cursor place the same block in
their first input; a blank Cursor start with a chosen model stays refused.

Change: `session-policy.mjs` exports the unattached choices and their flags;
`established-session.mjs` formats the block (fields in one fixed order,
optional fields omitted); the Session group renders the After checks subset
for Start session; `launchStart.ts` runs the start for an ad hoc request whose
policy or instruction makes the launch sendable, keeps the receipt as the
established session, and the three host adapters prepend the block;
`reportingInstruction` treats a launch with a block as sendable. `startWorkflows`
gains the unattached words for an uncertain start and a formatter that could
not be read. `AGENT-LAUNCH-HOSTS.md` replaces “ad hoc sends only optional text”.

Safe stopping point: Default main sessions can carry a landing intent;
Isolated workspace is not yet offered.

### 3. Isolated workspace starts the session in a new worktree
Type: Behavior
Status: planned
Proof: the isolated spec and its Codex case in the proof table.

Behavior: Start session, Workspace set to Isolated workspace, instruction
“Tidy the README wording” → the start creates `.worktrees/tidy-the-readme-wording`
on `claude/tidy-the-readme-wording` at fetched trunk, `created: true`; the
session opens there with the block (`workspace role: isolated`) and the
reporting context; origin's heads are unchanged; Command details says the
session runs in a new workspace under `.worktrees/`; the Sessions sidebar and
the terminal name that worktree. A blank instruction slugs to `session`,
numbered on collision. Codex starts with the worktree as its working directory.

Change: the Workspace subset joins the Session group; `startChoice`-style
selection reuses `launchWorkspace` with the session's label; the start runs
with `--integration <project>`, the worktree path and branch; the record's
established session supplies `recordedWorkspace`. `LAUNCH-START.md` “Session
choices” gains the Start session paragraph: the two choices, the default, no
Tracking, and where each runs.

Safe stopping point: all four workspace and landing combinations launch.

### 4. A stopped or expired unattached start keeps its worktree for Continue
Type: Behavior
Status: planned
Proof: the recovery spec in the proof table.

Behavior: an Isolated workspace start whose script wait expires
(`DOUGH_START_TIMEOUT_MS`) → “Startup needs reconciliation” beside Start
session and in Startup recovery names the worktree and branch and says the
start publishes nothing; Continue resumes that workspace and branch, launches
the session there, and `.worktrees/` holds one worktree. A start refused
before any workspace existed keeps no start.

Change: the unattached kept start is bound to its launch attempt (a
`session-starts.json` keyed by attempt beside the workflow start stores, or
the attempt record itself; choose the smaller), written before the script
runs and read by `continue`; `continuedStart` is reused for an established
one. `AGENT-LAUNCH.md` startup recovery names the ad hoc start's recovery.

Safe stopping point: the launch contract's recovery covers unattached starts.

### 5. Installed skills continue in an established session
Type: Behavior
Status: planned
Proof: the guidance test and the start-behavior test in the proof table, plus
the existing guidance tests of the linking references.

Behavior: a session whose first message carries “Established session:” later
receives `/dough-execute-plan SEED-X#story --one-shot` → the one-shot start is
given the established workspace and branch (`--default-main` for the
default-checkout role), creates no second workspace, retains the block's
`startingRevision`, and `landing: auto-land` lands the verified result with
the launch's landing context without a landing request. The same session
receiving a standard invocation hands the established worktree to the tracked
start and reports its answer: `published` with `created: false` continues
there; `setup-failed` with `pending-edit` means the conversation's edits are
committed or set aside first, never discarded, and never answered with a new
worktree. Dough Land invoked in the session lands that checkout. A session
with no block keeps today's direct-invocation behavior.

Change: `dough-execute-plan/references/established-session.md` states the
block, the workspace and landing inheritance, tracking from the invocation,
the pending-edit handling, and that the block grants no execution, admission,
or Take; `SKILL.md` “Take or admit work”, `one-shot.md`,
`admit-accepted-work.md` and `execution-location.md` link it;
`dough-story-refinement/references/preparation-workspace.md` and
`one-shot-refinement.md`, `dough-land/SKILL.md` “Resolve the checkout and
target”, and `dough-bug-fixing/SKILL.md` link it where they select a
workspace or landing checkout. Edit `src/skills/`; installed copies are not
hand-synchronized.

Safe stopping point: the whole story is deliverable by the installed payload;
only native proof remains.

### 6. Native hosts honor the unattached session on this machine
Type: Behavior
Status: planned
Proof: a manual observation record in this plan under
[dough-manual-testing](../../../src/skills/dough-manual-testing/SKILL.md),
run by the developer because each native run is paid.

Behavior: on each of Claude Code, Codex, and Cursor, Start session with
Isolated workspace · Automatically land and a blank instruction → the native
conversation opens in the worktree with the block; asking a question lands
nothing; invoking `/dough-execute-plan <queued trivial story> --one-shot`
there uses that worktree, lands the result with the launch's landing context,
and the dashboard shows the landed comparison. On Claude Code also: Default
main with a dirty checkout → the confirmation, then Continue.

Change: none expected; a discrepancy becomes a learning and a slice before
wrap-up.

Safe stopping point: ADR 0005 evidence recorded; the story is complete.

## Current decisions

- Default main · Wait for review is the no-selection default; a blank
  instruction with those choices stays a blank launch with no start.
- The unattached policy carries workspace and landing only; tracking is never
  fabricated for it.
- The “Established session” block is distinct from the “Established start”
  blocks and is owned by the session policy's skill.
- The developer runs slice 6; automated fakes do not substitute for it.

## Story obligations

### G1. A non-default unattached policy is accepted but not honored
Reported: slice 1 — "A raw request with `policy: { workspace: "isolated", … }` or `landing: "auto-land"` is accepted, recorded with that policy, and launched in the project folder with no block."
Story clause: "The native session opens in that worktree."
Disposition: interim until slices 2, 3

### G2. The isolated branch of the existing-changes check is untested
Reported: slice 1 — "No test covers "an isolated ad hoc workspace skips the check", because asserting it now would cement the interim launch above."
Story clause: "A Default main start, including the default choices, follows the shared existing-changes contract"
Disposition: receiving slice 3

### G3. The confirmation's landing line is fixed at the unattached default
Reported: slice 1 — "The dialog's landing line is fixed at the unattached default."
Story clause: "never changes the landing choice"
Disposition: receiving slice 2

### G4. Codex and Cursor are untested for the confirmation
Reported: slice 1 — "The new spec exercises Claude only. The check runs before host selection matters, so it is host-independent by construction, but that is unproven."
Story clause: "Back and Cancel start nothing"
Disposition: receiving slice 2

## Learnings

- Continue from Startup recovery runs the same pre-acceptance existing-changes
  check for a kept ad hoc attempt, whose kept request carries no fingerprint:
  with a dirty default checkout it answers “did not confirm” and cannot be
  confirmed from recovery, as a story's Default main start does. Slice 4
  accounts for it; an isolated recovery skips the check.

- A fresh `.worktrees/` checkout has no `node_modules`; run
  `node scripts/setup-native.mjs npm` before Playwright proof there.
- `LaunchDialog.tsx` (248 lines) and `launchAttemptOwner.ts` (247) sit at the
  250-line limit; the Session choices of slices 2 and 3 need their own seam
  rather than more lines in the dialog.
