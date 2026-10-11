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
proof (ADR 0005) is the follow-up story's paid manual observation.

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
| An unattached landing is captured for its launch with no story identity | Slice 6, `agent-launch-start-session-landing-context.spec.ts` and the `dashboard-landing.mjs` tests |
| A Start session with different choices starts a new session | Slice 7, `agent-launch-start-session-identity.spec.ts` |
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
Status: done
Proof: the landing spec, the formatter unit test, and the Codex and Cursor
first-input cases in the proof table.
Accepted proof: `agent-launch-start-session-landing.spec.ts`,
`-landing-boundary.spec.ts`, `-stops.spec.ts` and `-layout.spec.ts`;
`agent-launch-ad-hoc-codex-input.spec.ts` and
`agent-launch-ad-hoc-cursor-established.spec.ts`;
`established-session.test.mjs`; the `agent-launch*` and `one-shot-*` suites;
the installer checks that read `managed_files`. Delivered without the two
pending decisions under Current decisions.

Behavior: Start session with a blank instruction, After checks set to
Automatically land → the line beside Start reads `Default main · Automatically
land` and says verified results land on origin without another review and
that pressing Start authorizes that push; Start runs the installed
`execution-start.mjs start --one-shot --default-main --auto-land
--push-authorized` in the project folder and the session's first message is
“Established session:” with `workspace role: default-checkout`, `branch`,
`remote`, `target`, `landing: auto-land`, `startingRevision`, `fetched`, then
the reporting context (its `--landing-context` arrives with slice 6). With the
default choices nothing runs and no block is sent, with or without an
instruction; a blank instruction stays a blank launch. The record keeps the policy. Codex and Cursor place the same block in
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
Status: done
Proof: the isolated spec and its Codex case in the proof table.
Accepted proof: `agent-launch-start-session-isolated.spec.ts` and
`-isolated-boundary.spec.ts` (Claude, Codex, slug numbering, capability
gating); the isolated Cursor case in
`agent-launch-ad-hoc-cursor-established.spec.ts`; the stops, landing and layout
specs; the `agent-launch*`, `one-shot-*`, sidebar and workspace suites. The
open terminal shows no workspace for any session kind; the worktree is named by
the sidebar entry and the saved workspace, as for one-shot starts.

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
Status: done
Proof: the recovery spec in the proof table.
Accepted proof: `agent-launch-start-session-recovery.spec.ts` (expiry, Continue
in the kept worktree, a start lost with its server before and after its
workspace existed) and `-kept.spec.ts` (a refused start, Default main, an
unconfirmed Codex first input); the stops spec's uncertain words;
`agent-terminal-cursor-launch-page.spec.ts`, “a session started before the
page first read the machine's sessions still opens its terminal”; the
`agent-launch*`, `one-shot-*`, sidebar and start-store suites. The kept start
is `session-starts.json`, keyed by project and attempt.

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
Status: done
Proof: the guidance test and the start-behavior test in the proof table, plus
the existing guidance tests of the linking references.
Accepted proof: `established-session-guidance.test.mjs` (the rule's statements
and its eight links) and `established-session-start.test.mjs` (reuse at the
Take, `pending-edit`, `unpublished-commits`, admission, one-shot reuse, a
symlinked workspace path, the default checkout); every
`src/skills/*/scripts/*.test.mjs`; the installer, payload, link and
native-evidence-identity checks; the Start session and one-shot dashboard
specs. The landing-context sentence is conditional on the reporting context
naming one (obligation G5).

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

### 6. An unattached session's landing is captured for its launch
Type: Behavior
Status: done
Proof: `dashboard/tests/agent-launch-start-session-landing-context.spec.ts`
with the real-start harness; the installed `dashboard-landing.mjs` unit tests;
the existing launch-landing specs.
Accepted proof: `agent-launch-start-session-landing-context.spec.ts`,
`-landing-admission.spec.ts` and `-landing-retained.spec.ts` (the handoff, a
real landing captured before and after the push, the older-installation case,
Codex's delivery command, capture after the attempt expired);
`dashboard-landing.test.mjs`; `one-shot-landing-capture-admission.spec.ts`;
the landing, completion and launch suites; every
`src/skills/*/scripts/*.test.mjs`; the payload and publication shell checks.

Behavior: Start session, Isolated workspace · Automatically land, blank
instruction → the reporting context in the first message carries
`--landing-context <file>`, and that file names the launch's base, remote and
target with no story identity. A publication from that worktree given the
context (the installed publication command, as one-shot delivery and Dough
Land run it) records its landing before the push and its accepted evidence
after, kept with the launch record. A Default main ·
Automatically land session does the same from the default checkout. A story
launch's landing context still requires and carries its identity, and a
context naming an identity is still matched on it. Wait for review sessions
carry the context too: the developer may ask the session to land later.

Change: the landing identity becomes optional where the launch is unattached:
`landingRepositorySchema` (`dashboard/src/launchLanding.ts`),
`completionReporting.ts` (writes `landing-context.json` from an established
session), `launchLandingReporting.ts` and `launchLandingAdmission.ts` (admit an
ad hoc launch that has an established session), `launchLandingReservation.ts`
(match by launch reference when no identity is named), and the installed
`src/skills/dough-execute-plan/scripts/dashboard-landing.mjs` `validate`.
`reportingInstruction` names the context for an unattached launch that
establishes a session. `established-session.md`'s landing-context sentence and
`dashboard/STORY-REVIEW-LANDED-RUNS.md` / `AGENT-LAUNCH-COMPLETION.md` state
the unattached case. Closes obligation G5.

Safe stopping point: unattached landings are captured as story landings are.

### 7. A Start session with different choices starts a new session
Type: Behavior
Status: done
Proof: `dashboard/tests/agent-launch-start-session-identity.spec.ts`; the
existing ad hoc recovery and continuation specs.
Accepted proof: `agent-launch-start-session-identity.spec.ts` (a pending
Isolated conversation left to its own continuation, a pending default one not
resumed by Isolated, the landing axis, the same choices resuming); the
duplicate, continuation, recovery, launch and landing suites.

Behavior: a blank Start session on Codex with Isolated workspace whose first
input is unconfirmed, then a blank Start session on Codex with the default
choices → a new session in the project folder; the pending conversation and
its worktree stay as they were for their own continuation. The same choices
again resume the pending conversation, as today. An instruction still
distinguishes launches as before.

Change: `sameLaunch` (`dashboard/src/launchRequest.ts`) compares an ad hoc
launch's unattached policy (the default when none is named) beside project,
host and instruction; its comment and `LAUNCH-START.md` “Start session” say so. Closes
obligation G8.

Safe stopping point: an unattached launch's identity includes its choices.

## Current decisions

- Default main · Wait for review is the no-selection default; a blank
  instruction with those choices stays a blank launch with no start.
- The unattached policy carries workspace and landing only; tracking is never
  fabricated for it.
- The “Established session” block is distinct from the “Established start”
  blocks and is owned by the session policy's skill.
- Decided by the developer on 2026-10-11: the native observation (ADR 0005)
  is split out to
  [SEED-066#unattached-session-native-observation](../../seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-native-observation),
  first in the backlog, because it needs a released payload that exists only
  after this story lands. This story concludes at slice 7.
- Decided by the developer on 2026-10-11: the default choices establish no
  session and send no block, with or without an instruction
  (`establishesSession` in `dashboard/src/unattachedSession.ts`); the story's
  scope sentence now says so.
- Decided by the developer on 2026-10-11: an unattached launch's landing is
  captured with no story identity, keyed by its launch (slice 6).
- Decided by the developer on 2026-10-11: an unattached launch's identity
  includes its policy (slice 7).
- An unattached launch is handed a landing context only where the selected
  host's installed `dashboard-landing.mjs` exports
  `acceptsLandingWithoutIdentity`; an older installation gets the block and
  reporting context with none, so its landing is not captured and never fails
  on a context it cannot validate.
- Decided by the coordinator on 2026-10-11, the developer having left it to
  the coordinator: an unattached launch's landing is captured only. The
  evidence is kept on the launch record; the card-bound landed-run review does
  not list it, and this story adds no surface for it.
- `established-session.mjs` and `references/established-session.md` are
  declared in `install.sh` `managed_files`; until a release installs them and
  the changed `dashboard-landing.mjs` here, this repository's own dashboard
  disables a non-default Start session choice.

## Story obligations

### G1. A non-default unattached policy is accepted but not honored
Reported: slice 1 — "A raw request with `policy: { workspace: "isolated", … }` or `landing: "auto-land"` is accepted, recorded with that policy, and launched in the project folder with no block."
Story clause: "The native session opens in that worktree."
Disposition: proved by slice 3: `dashboard/tests/agent-launch-start-session-isolated-boundary.spec.ts`, "a raw isolated request is honored, and its slug is numbered"

### G2. The isolated branch of the existing-changes check is untested
Reported: slice 1 — "No test covers "an isolated ad hoc workspace skips the check", because asserting it now would cement the interim launch above."
Story clause: "A Default main start, including the default choices, follows the shared existing-changes contract"
Disposition: proved by slice 3: `dashboard/tests/agent-launch-start-session-isolated.spec.ts`, "with existing changes in default main, Isolated workspace · Automatically land starts at once"

### G3. The confirmation's landing line is fixed at the unattached default
Reported: slice 1 — "The dialog's landing line is fixed at the unattached default."
Story clause: "never changes the landing choice"
Disposition: proved by slice 2: `dashboard/tests/agent-launch-start-session-landing.spec.ts`, "existing changes are confirmed with Automatically land still selected"

### G4. Codex and Cursor are untested for the confirmation
Reported: slice 1 — "The new spec exercises Claude only. The check runs before host selection matters, so it is host-independent by construction, but that is unproven."
Story clause: "Back and Cancel start nothing"
Disposition: proved by slice 2: the existing-changes cases in `dashboard/tests/agent-launch-ad-hoc-codex-input.spec.ts` and `dashboard/tests/agent-launch-ad-hoc-cursor-established.spec.ts`

### G5. An unattached launch's reporting context carries no landing context
Reported: slice 2 — "the reporting context **is** sent with the block, even for a blank instruction, but with **no** `--landing-context`."
Story clause: "with the launch's landing context"
Disposition: proved by slice 6: `dashboard/tests/agent-launch-start-session-landing-context.spec.ts`, "Isolated workspace · Automatically land with no text hands the session its landing context, and a landing from its worktree is captured for the launch with no story"

### G6. Start session does not gate a choice on what the installed skills can establish
Reported: slice 2 — "The Start session dialog does not gate Automatically land on installed capability; the server refuses with a 400 after Start."
Story clause: "The Start session dialog offers the Session group's"
Disposition: proved by slice 3: `dashboard/tests/agent-launch-start-session-isolated-boundary.spec.ts`, "a host whose installation cannot establish a session offers only the default choices, and says why"

### G7. Continue after an expired isolated start creates a second worktree
Reported: slice 3 — "Continue on that attempt is accepted and reruns the start with a fresh slug."
Story clause: "creates no second worktree"
Disposition: proved by slice 4: `dashboard/tests/agent-launch-start-session-recovery.spec.ts`, "an Isolated workspace start that outlasts its wait names its worktree and branch, and Continue resumes it there without a second workspace"

### G8. A pending blank Start session is resumed by the next blank one, whatever its choices
Reported: slice 4 — "A pending blank non-default conversation is therefore recovered by the next blank Start session on that host, whatever its Workspace / After checks choice, in the pending conversation's own workspace."
Story clause: "The native session opens in that worktree."
Disposition: proved by slice 7: `dashboard/tests/agent-launch-start-session-identity.spec.ts`, "a pending Isolated workspace conversation is left to its own continuation by a Start session with the default choices"

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
- `sameLaunch` identifies an ad hoc launch by its instruction alone: a blank
  Automatically land launch whose first input is unconfirmed makes the next
  blank Start session on that host recover that conversation. Slice 7 adds the
  policy to that identity.
- The unattached start keeps nothing on expiry yet: it answers uncertain and
  Continue reruns the start, which is idempotent for Default main only.
- `unattachedStarted` (`dashboard/server/unattachedStart.ts`) fixes the project
  folder and trunk as workspace and branch; slice 3 changes that spot, and
  `policyArguments(unattachedStartPolicy(policy), project)` already emits
  `--integration` for isolated. Test support for slices 3 and 4:
  `dashboard/tests/support/startSessionLanding.ts`.
- The installed start's isolated `prepared` receipt reports `startingRevision`
  (the fetched-trunk base) and `created`, and `fetched` only for
  `--default-main`: an isolated block has no `fetched` line. Slice 5's
  reference and example expect none.
- Start session's non-default choices are enabled only where the installation
  ships `execution-start.mjs`, `session-policy.mjs` and
  `established-session.mjs`; the real-start origin fixture does, the
  launch-journey fixture does not.
- The installed start reuses an existing one-shot workspace only under the path
  Git names its top level by: a symlinked path answers `setup-failed`,
  `not-the-workspace-toplevel` (`workspace-publication-select.mjs` compares
  `git rev-parse --show-toplevel` with the request verbatim near line 126 and
  uses `realpathSync` near line 225). Slice 5's start-behavior test uses real
  paths or fixes that comparison.
- A reused workspace holding the session's own commits is refused with
  `unpublished-commits`, beside `pending-edit`; slice 5's reference names both.
- Start session captured the page's host operations when Start was pressed, so
  a Cursor session started before the first sessions read never opened its
  terminal; `presentTerminal` (`dashboard/src/pageSidePanel.ts`) now reads them
  when it runs. This was the intermittent failure of the Cursor start specs
  under load.
- In a `default-checkout` session a tracked start selects its own owned
  workspace with the block's workspace as its integration checkout, as a
  direct invocation there does: the start refuses the main worktree as an
  owned workspace and `--default-main` is one-shot only. An admission from an
  isolated session keeps the project's default checkout as `--integration`.
- The native observation's journey reaches the one-shot reuse path only while the
  conversation has made no edits or commits in the worktree; otherwise the
  expected native behavior is the reported `pending-edit` or
  `unpublished-commits` refusal.
- The dashboard's real-path argument on a kept rerun (`asGitNames`) stays until
  a release carries the start's path-identity comparison.
- A test or agent that runs `execution-increment-delivery.mjs deliver --host
  claude` inside a Claude session starts a real CI observer of this repository;
  the landing specs land Claude sessions through the shared publication API and
  use the delivery command only with `--host codex`.
- Two story-launch specs failed intermittently under load for reasons in the
  tests, unchanged since the story's base: raw test requests reused a
  keep-alive connection the server had closed after five idle seconds
  (`dashboard/tests/support/rawHttp.ts` now opens one per request), and bounds
  shorter than a real start subprocess under load (the landing-context poll in
  `one-shot-landing-capture-binding.spec.ts`; the 3 s start wait of
  `responsive-session-recovery.spec.ts` and
  `agent-launch-uncertain-continuation.spec.ts`).
