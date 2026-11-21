# Get fast proof of composing and starting a launch

**Identity:** SEED-413#speed-dashboard-launch-proof
**Source:** [Get fast proof of composing and starting a launch](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-launch-proof)
**Source review:** [Source-only commitments](source-review.md)

## Goal and scope

Give dashboard maintainers faster feedback that composing and starting a launch
keeps the intended draft, host, model, effort, options, attachments, dictation,
and note handoff, and that a refused or uncertain start leaves a truthful
recovery path. Move all 81 legacy cases in the 29 `launches/` specs onto Vitest
mounted production owners. Board and frame observations of opening a launch,
Done review, live session and terminal internals, and frontend runner retirement
each stay with their campaign stories. Real installation, native host launch, and
cross-service startup stay in existing `e2e/launches/` coverage. Backend
launch-boundary and attachment specs keep their owners.

## Current decisions

- Apply the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories),
  [Architectural North Star](../../NORTH-STAR.md)
  (directly testable production; Vitest for unit; shrink test support),
  [frontend test entry guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses),
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
  and [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
- Reuse `mountComponent`, page-loadable MakeMe, and production CSS. Mount
  `LaunchDialog`, `StartLaunch`, `StartSession`, `StoryCardLaunches`,
  `StartupStatus`, `StartupAnnouncer`, `CreationEntry`, and `AttachStoryNotes`
  through their typed production props. Give the smallest production input the
  proof needs; avoid a broad `MachineSessions` bag when only offers, attempts,
  or `onStart` matter. Prefer a required typed source over App providers or
  optional defaults for host catalog and instruction transcription reads that
  today fetch inside hooks.
- Use native Chromium input and geometry for keyboard, pointer, touch, zoom, and
  overflow. Supply recorded answers for presentation-only proof. Keep real mic,
  native host argv, install, and held origin publication in E2E.
- Map each legacy title and its distinct assertions to a named replacement or
  inspected existing observation before deletion. The roster below assigns each
  spec to one slice. Keep distinct viewport, focus, wording, refusal, and race
  observations where they show different risks. Use the project's MakeMe and
  page-object selection rules before authoring at each destination. Colocate
  page objects beside the specs; reuse E2E launch objects where they already
  name the control. Add no shared wrapper.
- Act directly with retrying observations. Retire whole-app launch FE consumption
  of route substitutes as the last scoped consumer moves. Check external
  consumers first (`navigation/` board-paging launch dialog, E2E). Keep shared
  E2E page objects (`launchStoryCardPage`, `launchJourney`, attachment fixtures,
  responsive helpers).
- Compare equivalent focused selections at two workers, including preparation,
  counts by engine and destination, any E2E cost, and the slowest remaining
  cases. Accept consolidation when the proof still distinguishes the preserved
  risks.

## Local gate

On macOS run from an awake machine on AC with `caffeinate -s -i`, the maintained
[sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Keep default test timeouts and follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run each affected frontend engine's explicit paths separately through
`npm run test:dashboard:frontend -- <paths> --workers=2` while both exist.
Run the named E2E paths with `npm run test:e2e -- <paths> --workers=2` when
changing their observations or their composed boundary. Typecheck changed
dashboard production inputs and callers with `npm run typecheck:dashboard`.

See [launch proof evidence](proof.md) for the baseline, decisive premises,
and preserved observations.

## Execution context

- Story Branch Mode in the dashboard-established worktree
  `get-fast-proof-of-composing-and-starting-a-launc`, on
  `codex/get-fast-proof-of-composing-and-starting-a-launc`. The default
  `open-dough` checkout is the integration checkout. Trunk is `origin/main`.
- Publisher `dashboard-territory.local-open-dough`, agent Ai-chan. Starting
  revision `0da1d3a2b316e6255b68b2f9c751ac49ea23cf97`. The established claim
  `d709083818ab9ae49c7980d4b82fc5038e70ad6d` is on trunk and was published as
  the initial story-branch candidate.
- Checkout-local `npm ci`, `node scripts/setup-native.mjs check`, and
  `npm run typecheck:dashboard` passed. The plan's recorded legacy proof is
  retained as `legacy-launches-baseline.jsonl` in the checkout's Git evidence
  directory. No launch spec changed between that baseline and the claim.
- Story-branch CI observes GitHub Actions `ci.yml` (CI), coordinator
  `launch-proof-762`, mailbox `/tmp/dough-ci-501/watch-8V0V1S`, PID `98694`,
  Codex session `82053`, cell `g185:13`.
- Preserve existing planning authority. The invocation selected neither
  `--replan` nor `--no-replan`.

## Slices

Frontend spec names below are relative to `dashboard/frontend-tests/launches/`
and omit `.spec.ts` unless otherwise specified.

### 1. Ad-hoc Start session opens, cancels, and stays readable

Type: Behavior
Status: done

Move `agent-launch-ad-hoc`, `agent-launch-ad-hoc-instructed`,
`agent-launch-creation-gates`, `agent-launch-start-session-layout`,
`agent-launch-start-session-answer-touch`, `agent-launch-dialog-layout`, and
`agent-launch-dialog-touch` (17). Mount `StartSession` / `ProjectActions` for
placement and offer, `LaunchDialog` with `unattachedSession` for the dialog,
and `CreationEntry` for stand-in inspection arguments. Use stub `onStart` and
typed attempt answers for progress and refusal wording. Early-probe any
`SessionsOnPage` handoff the instructed case needs; keep real held start in
`e2e/launches/`.

**Proof.** Start session sits opposite direction help, stays offered while
published work reads or fails, and hides with the roster. The dialog names
project and host, focuses the empty instruction, and Escape or Cancel send
nothing and return the keyboard. Layout and touch keep order, reachability,
and draft through narrow, zoom, and rotation. Creation gates show supplied
inspection arguments.

### 2. Attachment paste, refusal, and cancel keep the draft

Type: Behavior
Status: done

Move `agent-launch-ad-hoc-attachments-paste`,
`agent-launch-ad-hoc-attachments-refusal`, and
`agent-launch-ad-hoc-attachments-cancel` (4). Mount `LaunchDialog` with
`LaunchAttachments` over typed attachment inputs. Keep real upload recording in
`e2e/launches/` and backend attachment-boundary specs.

**Proof.** Pasted text still inserts. Refused PDF, oversized, or excess images
keep the draft with reasons. Cancel or Escape after Attach uploads nothing and
reopens empty.

### 3. Story-card Starts offer the right dialogs and noted appearance

Type: Behavior
Status: done

Move `agent-launch-story-card`, `agent-launch-story-card-dialogs`, and
`agent-launch-story-card-noted-start` (8). Mount `StartLaunch` and
`StoryCardLaunches` over typed work entries, readiness notes, and host
capability callbacks. Keep native story start in `e2e/launches/agent-launch-story-card.spec.ts`.

**Proof.** Backlog cards offer Start execution then Start refinement with the
ready note only when assessed Ready; Taken offers neither. Dialogs name story,
host, and command, share Attach images, and state Take/workspace effects only
when the skill establishes a start. Noted Starts keep readable layout and
clickable appearance in light and dark schemes.

### 4. Startup answers, uncertain recovery, and host words stay truthful

Type: Behavior
Status: done

Move `agent-launch-story-card-answers`, `agent-launch-story-card-uncertain`, and
`startup-host-words` (9). Mount `StoryCardLaunches`, `StartupStatus`, and
`LaunchProblemAnswer` over typed attempts and startup observations.

**Proof.** While an accepted start runs, Preparing versus Starting wording and
Backlog protection match whether the skill establishes a start. Folder-missing
failures stay beside the right Start. In-flight Start disables; uncertain or
lost acknowledgment protects the story with reachable recovery. Host words keep
Preparing/Starting choice and never borrow another host's native-check advice.

### 5. Host catalog, model, and effort drive what Start asks for

Type: Behavior
Status: planned

Move `agent-launch-codex-catalog`, `agent-launch-model`, and
`agent-launch-native-effort` (11). Early probe: add a required typed host-options
source production also supplies, wire `useLaunchHostOptions` through it, and
prove held, failed, and retry catalog paths on a mounted `LaunchDialog` before
retiring substitute catalog routes for these cases. Keep native model/effort
recording in E2E.

**Proof.** Slow or unavailable catalog retains focus and recovers on retry;
late replies cannot replace another host's or project's options. Claude effort
defaults to medium with named costs; host switches reset incompatible effort;
Tab order reaches Record through Start. Compatible effort is preserved across
model changes; incompatible selection stays invalid and can block Start.

### 6. Refinement options and recorded model or option lines stay accurate

Type: Behavior
Status: planned

Move `agent-launch-options`, `agent-launch-options-entries`, and
`agent-launch-model-entries` (13). Mount `LaunchDialog` / `LaunchOptions` for
dialog selection and session card or sidebar fragments over MakeMe launch
records for entry wording. Consolidate representative option and model entry
variants when setup and risk are the same. Keep boundary recording of
selections in backend and E2E owners.

**Proof.** Execution and session dialogs offer no options; refinement clears a
group with No Approach; unread or reread options say so and Start asks for
refinement with none; Cancel after refusal drops the kept selection. Card and
sidebar lines name requested options and models through reload without a
Recently done duplicate; absent model or effort lines stay absent.

### 7. Instruction voice abandons cleanly and respects the character limit

Type: Behavior
Status: planned

Move `session-instruction-voice-lifecycle`,
`session-instruction-voice-overflow`, and
`session-instruction-voice-capture-failures` (10). Early probe: add a required
typed transcription source production also supplies, wire instruction recording
through it, and prove Cancel abandons a held reply before retiring FE
transcription substitutes. Keep real mic and provider journeys in E2E.

**Proof.** Cancel or Escape abandons capture; late grants or replies cannot
populate the next dialog; unexpected track end preserves typed text. Overflow
beyond 4,000 retains both drafts for edit; Start sends the edited final text.
Permission, device, and format unavailability make no transcription request and
recover in the same dialog.

### 8. Follow-up notes and responsive start access recover correctly

Type: Behavior
Status: planned

Move `follow-up-attach-notes`, `responsive-session-access`,
`responsive-session-access-unattached`, and
`responsive-session-recovery-reads` (9). Mount `AttachStoryNotes` /
`StartSession` with `StoryNotesOnPage`, and `StartupAnnouncer` with
`StoryCardLaunches` / `StartupStatus` over typed notes, attempts, and machine
reads. Early-probe `SessionsOnPage` where unattached terminal presentation is
the unit observation. Keep held origin publication and settle in
`e2e/launches/responsive-session-start*.spec.ts`.

**Proof.** Follow up offers Attach when notes wait and Start names the choice;
with no waiting notes Attach is unavailable and Start still works; Taken shows
notes waiting without Follow up. Keyboard start under reduced motion protects
the card or Start session progress, announces each transition once, and leaves
a task begun meanwhile focused. Starts wait for launch evidence; lost acceptance
keeps static protection with Recheck until a later read shows the accepted
start.

## Plan review

Slice-plan refinement was not needed: eight Behavior slices follow distinct
compose, refuse, and recover outcomes; cumulative design reuses `LaunchDialog`
and typed launch attempts rather than accumulating special-case mounts; proof
ownership splits unit mounts from E2E native/install journeys; counts are the
starting 81-case workload with consolidation authorized where risks coincide.
No remaining slice-specific concern. Early probes for typed host-options and
transcription sources, and for `SessionsOnPage` handoff where asserted, are
named on Slices 1, 5, 7, and 8.
