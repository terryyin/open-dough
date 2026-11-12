# Express Terminal test intent through shared controls

**Identity:** SEED-300#express-terminal-test-intent-through-page-objects
**Source:** [Story](../../seeds/SEED-300-dashboard-test-page-objects.md#express-terminal-test-intent-through-page-objects)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

A developer reading Terminal tests in Intent follows the chosen session, exact input/output and deliberate recovery
while shared screen/input controls have one browser owner. Resolve the story's Terminal finding and current siblings
across integrated, frontend and cross-feature callers, preserving every distinct behavior check and test tier. This
realigns the existing receiving plan; no original slices, implementation or completed proof are invented.

Include keyboard, trust/prompts, connecting/refused/ended input, touch keys, soft-keyboard fitting, composition,
selection/copy, paste and voice. Keep caller facts, actual input modality/focus, holds/releases, provider events,
clocks, WebSocket/HTTP observations, native attach/PTY evidence and records explicit. A browser read never substitutes
for native evidence. Direct accessibility, rendition and measurement assertions keep their independent expectations.

Exclude dashboard behavior changes, a new framework, universal fluent adoption, fewer-case/speed claims and unrelated
sibling-workflow mechanics. No sibling story is a blocking prerequisite; reuse whatever owners exist when executing.

## Architecture and reuse decisions

Use [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md) and [ADR 0008 — Project
dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
Terminal is a session's Side panel content; session entry, Selected story and panel frame retain their owners. Closing
preserves the Selected story. [ADR 0002 — Software development lifecycle
principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md) supports one representation
per conceptual solution and PFE. [ADR 0010 — Definition of
improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md) requires readable scenarios and fewer
mechanics edit sites worth their helper cost. Index/in-file Accepted statuses agree; no supersession/conflict or
exception was found. The existing [North Star](../../NORTH-STAR.md), especially “Agent launch as a requested
assignment,” keeps host/session/transport ownership; this test-side change needs no new topic or architecture decision.

PFE at `8aa440077`: `terminalPages.ts` is a fluent cue adapter, unsuitable as a frontend fixture dependency. Expose its
screen/input mechanics as a focused procedural component owner shared with the fluent adapter. Extend suitable existing
owners rather than another universal Terminal journey. In `dashboard/tests/`, retain `touchTerminalPage.ts`
(touch/fitting/compose), `touchTerminalSoftKeyboardPage.ts` (viewport stand-in), `terminalPastePage.ts` (phone setup),
`terminalSelectPage.ts` (paused selection), and `support/terminalVoicePage.ts` (voice/prompts).
`support/frontendTouchTerminal.ts` keeps frontend setup; `agentTerminalBoundary.ts`, host fixtures and traffic observers
keep transport/native evidence. Reuse existing session-entry and Side panel operations; do not duplicate their selectors
or change their policy.

Cumulative design: one scoped screen/input solution supports all modalities; touch, paste, selection and voice retain
distinct domain protocols. Slices migrate and name these protocols, not introduce parallel screen owners. `typeLine`
means typing then Enter; insertion, keypress, fill, paste, dictation and reconnect remain distinct operations when that
distinction is under proof. An output wait does not implicitly release a held transport or submit input.

## Current caller inventory and disposition ownership

Inventory observed on 2026-11-12 at `8aa440077`. Reproduce the literal starting set with `rg -l
'xterm-rows|xterm-helper-textarea' dashboard/tests dashboard/frontend-tests --glob '*.spec.ts'`. It finds **65** current
specs. The historical query `git grep -l -E 'xterm-rows|xterm-helper-textarea' 7eab3d6ca -- dashboard/tests
dashboard/frontend-tests` filtered to `.spec.ts` reproduces **63**; do not use a glob that omits top-level frontend
specs. Four additions are ad-hoc attachments/instructed/follow-up launch and touch selection. Frontend paste-image and
session-column-membership moved direct mechanics into helpers; both remain consumers, not omissions.

| Current direct-selector directory | Specs to disposition |
| --- | --- |
| `dashboard/frontend-tests/` | `terminal-prompts-recovery.spec.ts` |
| `dashboard/tests/configuration/` | `system-settings.spec.ts` |
| `dashboard/tests/launches/` | `agent-launch-ad-hoc-attachments.spec.ts`, `agent-launch-ad-hoc-codex.spec.ts`, `agent-launch-ad-hoc-instructed.spec.ts`, `agent-launch-ad-hoc-resolved.spec.ts`, `agent-launch-codex.spec.ts`, `agent-launch-follow-up-session.spec.ts`, `agent-launch-model-entries.spec.ts`, `cursor-startup-trust.spec.ts` |
| `dashboard/tests/navigation/` | `board-paging-side-panel.spec.ts`, `board-reading.spec.ts`, `development-intent-frame-sessions.spec.ts`, `frame-sessions-look.spec.ts`, `side-panel-width-covering.spec.ts`, `side-panel-width-kept.spec.ts`, `side-panel-width.spec.ts` |
| `dashboard/tests/sessions/` | `agent-launch-ad-hoc-sessions.spec.ts`, `agent-launch-done-question-follows.spec.ts`, `agent-launch-story-card-sessions.spec.ts`, `agent-session-cursor-done.spec.ts`, `agent-terminal-delete.spec.ts`, `agent-terminal-done-codex-page.spec.ts`, `agent-terminal-done-pending.spec.ts`, `agent-terminal-done-question.spec.ts`, `agent-terminal-done-reopen.spec.ts`, `agent-terminal-done-report.spec.ts`, `agent-terminal-done.spec.ts`, `compact-session-entry.spec.ts`, `cursor-runner-replacement.spec.ts`, `cursor-runner-sessions.spec.ts`, `cursor-session-scope-continuation.spec.ts`, `cursor-sessions-sidebar-navigation.spec.ts`, `recently-done-sessions-sidebar-reopen.spec.ts`, `session-management-touch.spec.ts`, `session-workspace-retirement-lifetime.spec.ts`, `sessions-sidebar-keyboard.spec.ts`, `sessions-sidebar-navigation.spec.ts`, `sessions-sidebar-touch.spec.ts` |
| `dashboard/tests/stories/` | `recently-done-progressive-navigation.spec.ts`, `recently-done-progressive-reset.spec.ts`, `recently-done-progressive-state.spec.ts` |
| `dashboard/tests/terminals/` | `agent-launch-ad-hoc-terminal.spec.ts`, `agent-terminal-avatar.spec.ts`, `agent-terminal-codex-page.spec.ts`, `agent-terminal-cursor-launch-page.spec.ts`, `agent-terminal-cursor-page.spec.ts`, `agent-terminal-cursor-trust-page.spec.ts`, `agent-terminal-ended-input-recovery.spec.ts`, `agent-terminal-keyboard.spec.ts`, `agent-terminal-lifetime.spec.ts`, `agent-terminal-maximize.spec.ts`, `agent-terminal-pending-readiness-input.spec.ts`, `agent-terminal-theme.spec.ts`, `agent-terminal-touch-composer.spec.ts`, `agent-terminal-touch-keyboard-fit.spec.ts`, `agent-terminal-touch-keys.spec.ts`, `agent-terminal-touch-paste.spec.ts`, `agent-terminal-touch-select.spec.ts`, `agent-terminal-touch.spec.ts`, `agent-terminal.spec.ts`, `session-terminal-prompts.spec.ts`, `session-terminal-voice-lifecycle.spec.ts`, `session-terminal-voice-recovery.spec.ts`, `session-terminal-voice.spec.ts` |

Slice 1 owns common output/identity mechanics in every row, including support owners and fluent callers. Slices 2–5 own
the remaining modality-specific protocols, as named below. A caller migrated in slice 1 remains in the later slice's
proof when that slice changes an operation it uses. Exact rendition, accessibility and measurement contracts may retain
low-level observations; record why each remaining direct use owns that contract rather than blanket allowing a file or
imposing zero selectors as the acceptance metric.

Ten non-spec owners also contain these literals: `sidePanelWidthPage.ts`, `support/adHocTerminalStartup.ts`,
`support/cursorSessionReading.ts`, `support/frontendTouchTerminal.ts`, `support/startedAdHocSession.ts`,
`support/terminalVoicePage.ts`, `terminalPages.ts`, `terminalPastePage.ts`, `terminalSelectPage.ts`,
`touchTerminalPage.ts`. Their static import closure adds 89 specs outside the 65, a conservative discovery set rather
than proof that every imported utility executes Terminal mechanics. Follow the changed export to its actual use: e.g.
`openTakenCursorSession`, `openWhileStarting`, `startAdHocAndClose`, `openFrontendTerminalByTouch/Mouse`,
`phonePasteJourney`, `expectPausedShowsDrawnRowsInPlace`, `openTerminalVoice`, `sidePanelPages`, and `expectStillHolds`.
Helpers' unrelated exports do not justify exclusion of callers that do use the changed operation.

Concrete outside-set consumers include both fluent side-panel-content specs, session-column-membership,
agent-session-cursor/stop, cursor-session-recovery and recovery-stops, integrated paste-image, and frontend paste-image,
application-scroll and all four touch-select specs. Search `.xterm-screen`, generic panel `textarea`, Terminal
region/heading and shared-operation names as well as the two literal selectors; trace whole-panel observations and
setup. At each slice record every affected consumer as `run`, `reused` with matching evidence, or `excluded` with the
reason the changed effect cannot reach it, using the installed [consumer
trace](../../../.agents/skills/dough-execute-plan/scripts/consumer-trace.mjs). Keep dispositions/evidence in this plan;
no new inventory framework or policy.

## Observed premises and proof route

All observations ran in this owned checkout at `8aa440077` with only the selected preparation draft plus the stated
disposable scratch edits. Native setup followed `tests/native-setup.md`: Node 24.21.0, locked npm dependencies installed
locally, Chromium 158.0.8127.18 check passed. No copied dependencies.

| Premise / consuming operation | Form, result and remaining limits |
| --- | --- |
| Frontend, integrated native and fluent fixtures can exercise the planned boundaries here | P0 below completed 10/10 cases, strict passed, 60.2 s, 2026-11-12 07:40–07:41 UTC. It reaches actual input/recovery, held trust rendition, compose insertion and native line, held voice release and panel replacement, not merely runner selection. These are synthetic host/PTY fixtures, not a claim of fresh live host acceptance. |
| Scoped screen/input mechanics can serve the different fixture tiers without hiding case facts | P1 below applied one 14-line procedural screen-parts/text-observation owner to fluent Terminal, frontend prompt and touch setup, and integrated voice setup. All 8 cases passed (32.0 s), and `npm run typecheck:dashboard` passed. Original transport holds, sent arrays, provider and native assertions stayed at their existing boundaries. This tests the common seam; full caller migration and final helper cost remain execution work. |
| Prompt recovery proof discriminates a missing literal insertion after readiness recovers | P2 below suppressed only `insert("as recommended")` in production `TerminalPrompts.tsx`, with the shared scratch owner still used. Both connecting and refused cases failed at the independent `sent == ["as recommended"]` assertion (actual `[]`), 16.1 s. Thus the helper does not self-certify delivery. P3 restores and passes the unchanged proof. |

P0: `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-terminal-baseline.json caffeinate -i npm run test:dashboard -- frontend-tests/terminal-prompts-recovery.spec.ts frontend-tests/agent-terminal-touch-paste-image.spec.ts tests/terminals/agent-terminal-cursor-trust-page.spec.ts tests/terminals/agent-terminal-touch-composer.spec.ts tests/terminals/session-terminal-voice.spec.ts tests/navigation/side-panel-content-switching.spec.ts --workers=1`.

P1: `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-terminal-shared-screen.json caffeinate -i npm run test:dashboard -- frontend-tests/terminal-prompts-recovery.spec.ts frontend-tests/agent-terminal-touch-paste-image.spec.ts tests/terminals/session-terminal-voice.spec.ts tests/navigation/side-panel-content-switching.spec.ts --workers=1`.

P2: `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-terminal-input-fault.json caffeinate -i npm run test:dashboard -- frontend-tests/terminal-prompts-recovery.spec.ts --workers=1` with the stated fault.

P3: `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-terminal-restored.json caffeinate -i npm run test:dashboard -- frontend-tests/terminal-prompts-recovery.spec.ts --workers=1` after reverting every scratch edit: 2/2 cases strict passed, 6.6 s, finished 2026-11-12 07:43:56 UTC.

Pre-launch host decision: this Mac had 16 logical CPUs, 48 GiB RAM, 61% memory free, load 3.67/5.52/8.25 and no
competing test runner observed. It was fully awake on battery at 77%; bounded selections used one worker under
`caffeinate -i`, with sleep-log inspection afterwards. No sleep/wake event overlapped the observations. Reconsider
concurrency on changed load, power or failed proof. These observations settle the common seam and discrimination
premises; they do not claim all 65 callers or all recovery variants have passed a migration.

## Ordered slices

All types are Behavior: the evaluated outcome is how a developer can read and maintain the proof, with unchanged product
behavior. Each slice includes its helper changes, caller migration, focused regression proof and cleanup. Source review
compares the before/after scenario at `8aa440077` and the historical finding at `7eab3d6ca`; record clarity, control
edit sites and added helper cost. Partial migration is safe: untouched callers remain until their named slice;
completion requires one shared mechanics owner across the final affected set.

### 1. Read one session's Terminal through shared controls
Type: Behavior
Status: done
Proof: Story examples 1 and 6; source comparison and original output, identity,
attach-count, record and reattachment assertions in affected callers.
Accepted: Shared `dashboard/tests/terminalScreenPage.ts` owns ordinary screen/identity/open/close;
fluent `Terminal.expectText` and support owners reuse it; inventory ordinary `.xterm-rows` /
helper-textarea / Terminal region uses migrated (0 residual in `*.spec.ts`); listing arrange/blocked-Start
in `storyCardSessionListing.ts` (161) with journeys in `agent-launch-story-card-sessions.spec.ts` (242).
Native attach/record/reconnect stay caller-local. Implementation proof
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-terminal-slice1-proof.json caffeinate -i npm run test:dashboard --
tests/terminals/agent-terminal-codex-page.spec.ts tests/terminals/agent-terminal-cursor-page.spec.ts
tests/terminals/agent-terminal-cursor-launch-page.spec.ts tests/terminals/agent-terminal.spec.ts
tests/terminals/agent-terminal-lifetime.spec.ts tests/navigation/side-panel-content-switching.spec.ts
tests/navigation/side-panel-content-replacement.spec.ts tests/sessions/agent-launch-story-card-sessions.spec.ts
tests/sessions/agent-launch-story-card-session-states.spec.ts --workers=1` → 15/15 expected, strict passed (~143s);
`npm run typecheck:dashboard` passed. Refactor close/open/listing focus
`/tmp/seed300-terminal-slice1-refactor-proof.json` → 18/18 expected (~84s). Consumer dispositions:
proof-set and listing consumers **run**; support owners and mechanical inventory **reused**;
paused-select/fit evaluate contracts and local page `closeTerminal` aliases (pre-refactor) **excluded**
per contract; post-refactor shared `closeTerminal(panel)` consolidated. Source-review slice-1 ids observed.

Behavior: A developer follows an opening, replacement or reconnect case → reads named Terminal output/identity
operations → the expected session and text stay visible and native/record evidence still distinguishes detach from
session end. Expose the shared procedural seam and reuse it from fluent Terminal and support owners; migrate ordinary
screen/identity uses across the inventory, leaving low-level contract observations explicit. Preserve width-history and
trust rendition assertions. Include Codex, Cursor and Claude lifecycle specs, the two fluent content specs and
cross-feature callers reached by changed owners. Run those complete affected specs, not only an accessor unit test.

The expected edited `sessions/agent-launch-story-card-sessions.spec.ts` is 272 lines. Cohesive reorganization in this
slice: move its shared queued-session arrangement/listing and blocked-Start observation into the existing
`storyCardSessionListing.ts` (121 lines), leaving each published Preparing, Taken and no-list/Recently-done journey,
origin transitions and independent expected membership/attach facts visible. Keep both modules at most 250 lines, retain
the helper API for other callers and run this complete spec plus actual consumers of the changed listing contract. Other
expected control owners are 35–234 lines; reassess any newly oversized expected edit by the same rule.

Baseline command for this boundary: `npm run test:dashboard --
tests/terminals/agent-terminal-codex-page.spec.ts tests/terminals/agent-terminal-cursor-page.spec.ts
tests/terminals/agent-terminal-cursor-launch-page.spec.ts tests/terminals/agent-terminal.spec.ts
tests/terminals/agent-terminal-lifetime.spec.ts tests/navigation/side-panel-content-switching.spec.ts
tests/navigation/side-panel-content-replacement.spec.ts
tests/sessions/agent-launch-story-card-sessions.spec.ts --workers=1`. Add the remaining inventory consumers
reached by the actual diff.

### 2. Follow exact keyboard input and deliberate recovery
Type: Behavior
Status: done
Proof: Story example 2; exact bytes, focus, refusal status, native lines,
attachment identity and no-auto-replay assertions remain independent.
Accepted: `terminalScreenPage` owns focus/input, `insertTerminalText` (never Enter), `pressTerminalKey`,
`typeLine` (composes insert+Enter), Open again/Reconnect, and Prompts open/choose; fluent `typeLine` and
voice prompts re-export reuse it; phone `tapWhereShown` vs desktop click stay at call sites. Proof
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-terminal-slice2-proof.json caffeinate -i npm run test:dashboard --
tests/terminals/agent-terminal-keyboard.spec.ts tests/terminals/session-terminal-prompts.spec.ts
tests/terminals/agent-terminal-pending-readiness-input.spec.ts tests/terminals/agent-terminal-ended-input-recovery.spec.ts
tests/terminals/agent-terminal-cursor-trust-page.spec.ts frontend-tests/terminal-prompts-recovery.spec.ts
tests/terminals/agent-terminal-codex-page.spec.ts tests/navigation/side-panel-content-switching.spec.ts --workers=1`
→ 13/13 expected (~68s); typecheck passed. Refactor replacement: prompts+codex+side-panel focused reruns green
(`/tmp/seed300-terminal-slice2-refactor-proof.json`, side-panel sole-spec after load timeout). Consumers: slice-2
specs + codex + fluent typeLine **run**; voice prompt re-exports **reused**; remaining lifetime/touch/voice
inline recovery left for later slices **excluded**. Source-review slice-2 ids observed.

Behavior: A developer reads a key/prompt/trust/ended-input case → follows named input and recovery choices around the
actual keys and held releases → the source shows what reaches the session and what requires another deliberate choice.
Cover `agent-terminal-keyboard`, `session-terminal-prompts`, `agent-terminal-pending-readiness-input`,
`agent-terminal-ended-input-recovery`, `agent-terminal-cursor-trust-page` and frontend `terminal-prompts-recovery`, plus
actual users of any shared input/recovery operation. Preserve compound shortcut steps, intermediate focus and trust
rendition/replay dimensions. Run all these complete specs and those consumers; an insertion method must never imply
Enter.

Command: `npm run test:dashboard -- tests/terminals/agent-terminal-keyboard.spec.ts tests/terminals/session-terminal-prompts.spec.ts tests/terminals/agent-terminal-pending-readiness-input.spec.ts tests/terminals/agent-terminal-ended-input-recovery.spec.ts tests/terminals/agent-terminal-cursor-trust-page.spec.ts frontend-tests/terminal-prompts-recovery.spec.ts --workers=1`, plus traced consumers.

### 3. Follow phone input, viewport changes and paused selection
Type: Behavior
Status: done
Proof: Story example 3; exact gesture/key, draft, independent focus/geometry,
reported native size, paused copied text and application input evidence.
Accepted: Touch keys/fit/compose/select stay on existing focused owners sharing screen/input with
`terminalScreenPage`; `.terminal-screen` paused host kept distinct from `.xterm-screen`; composer
no-auto-replay uses `page.clock.runFor` (not wall sleep); Insert ≠ Enter preserved. Proof
`/tmp/seed300-terminal-slice3-proof.json` 21/21 (~104s) + consumers `/tmp/seed300-terminal-slice3-consumers.json`
8/8 (~52s) for `focusByTouch`/`tapTerminalKey`; typecheck passed. Refactor: `typeLine`/`terminalStatus`
cohesion; `/tmp/seed300-terminal-slice3-refactor-proof.json` 6/6; `agent-terminal-touch.spec.ts` ≤250.
Dispositions: proof-set + paste/ended/pending consumers of changed focus/key **run**; unchanged helper
bodies **reused**; paste protocol and voice left for slices 4–5 **excluded**. Source-review slice-3
ids observed.

Behavior: A developer reads a phone interaction → sees the actual modality and chosen draft/viewport around shared
operations → focus, fit and insertion without submission remain explicit; paused selection sends no unintended session
input. Use touch/soft-keyboard/selection owners for integrated touch, keys, composer, keyboard-fit and select specs, and
frontend application-scroll and touch-select, select-fit, select-held, select-screens specs. Preserve dimensions,
controlled viewport events and the selection observer's independent drawn-row comparison. Run every complete affected
touch/selection spec in both tiers, including cross-feature touch callers when their shared action changes.

Command: `npm run test:dashboard -- 'tests/terminals/agent-terminal-touch(-keys|-composer|-keyboard-fit|-select)?\.spec\.ts' 'frontend-tests/agent-terminal-touch-(application-scroll|select.*)\.spec\.ts' --workers=1`, plus traced consumers.

### 4. Follow a clipboard choice through refusal and retry
Type: Behavior
Status: done
Proof: Story example 4; payload/clipboard/provider faults, HTTP body/status,
sent bytes, draft and native output stay caller facts at their original tiers.
Accepted: `terminalPastePage` names pasteKey and clipboard seed/revoke helpers (payloads as args, not MakeMe);
`terminalStatus`/reconnectControl shared; release→retry order stays call-site stepwise; frontend 413/held
substitutes remain frontend. Proof `/tmp/seed300-terminal-slice4-proof.json` 9/9 (~62s) including paste specs +
pending/ended/select consumers; typecheck passed. Refactor: select consumer seeds via `copyClipboardText`;
`/tmp/seed300-terminal-slice4-refactor-proof.json` 1/1. Dispositions: paste set + consumers **run**; shared
status/reconnect/touch helpers **reused**; instruction-field paste and voice **excluded**. Source-review
slice-4 ids observed.

Behavior: A developer follows Paste while connecting, attached or refused → reads named clipboard/Terminal operations
around the explicit payload and release/retry → the source distinguishes insertion, refusal and a new choice. Reuse
phone paste/touch/frontend owners; run both integrated terminal touch-paste and touch-paste-image specs and frontend
touch-paste-image, plus actual consumers of changed paste controls. Do not move clipboard bytes into MakeMe or turn a
frontend attachment substitute into a native-attach assertion.

Command: `npm run test:dashboard -- tests/terminals/agent-terminal-touch-paste.spec.ts tests/terminals/agent-terminal-touch-paste-image.spec.ts frontend-tests/agent-terminal-touch-paste-image.spec.ts --workers=1`, plus traced consumers.

### 5. Follow voice input without hiding its lifecycle
Type: Behavior
Status: done
Proof: Story example 5 and final example 6; provider calls/releases, track stop,
retained transcript, session isolation and exact native submitted line.
Accepted: `terminalVoicePage` owns dictate/stop/status/retained insert·discard; reuses screen
prompts/status/reconnect; provider hold/release and modality stay call-site. Proof
`/tmp/seed300-terminal-slice5-proof.json` 13/13 (~133s) voice* + ended + pending; typecheck passed.
Residual direct `xterm-rows|xterm-helper-textarea` in `*.spec.ts` = 0. Inventory 65: voice/ended/pending
**run**; slices 1–4 callers **reused** with prior proof; none excluded for residual selectors.
Helper cost: ~+70 lines on voice owner justified by named lifecycle ops without lost distinct checks.
Refactor: route ended/recovery call sites through `expectNoUnsentTranscript`/`expectVoiceStatus`/
`expectTerminalInputFocused`; accepted proof reused (boundary unchanged). Source-review slice-5 ids
observed. Exclusions X1–X5 held (test-only; no product/framework/fluent/speed/sibling-workflow migration).

Behavior: A developer follows recording, provider answer and a later user choice → reads focused voice/input operations
between explicit events → the case still proves safe insertion/retry, cancellation and no transcript entering a
different or reopened session. Extend the existing voice owner and run all three `session-terminal-voice*.spec.ts` files
and changed prompt/input consumers. Finish the inventory dispositions and evaluate the aggregate shared-owner gain
against helper cost; retain every distinct behavior check and required gate.

Command: `npm run test:dashboard -- 'tests/terminals/session-terminal-voice.*\.spec\.ts' --workers=1`, plus traced consumers.

## Verification, delivery and remaining concerns

Local gates: run changed specs and transitive behavioral consumers after edits; run `npm run typecheck:dashboard` for
shared TypeScript changes (also a commit hook), with post-change refactoring before each slice commit. Use the installed
Execute Plan delivery/retrospective/wrap-up procedures only once execution is authorized. A full local dashboard suite
is warranted if a changed ubiquitous fixture makes its consumer boundary the full suite; hosted CI configuration alone
does not impose every CI check as a local gate.

Carry the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests) as written, by this link, into
every delegation and repair handoff. A failure on base is attribution, not exemption; preserve another active owner's
exact repair and report that coordination boundary. Use MakeMe for domain data; exact input, malformed wire contracts
and independent expectations stay outside builders. No sleeps, `test.slow()` or widened suite/hook timeouts.

Long-run macOS local gate: start fully awake; on AC use `caffeinate -s -i`. On battery plug in, or keep the lid open
under `caffeinate -i` and inspect the sleep log afterwards, per [machine sleep on
macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos). Record resources/concurrency before expensive
runs and reconsider on contention. The shared test-entry selector currently resolves both flags false for the inspected
sources; this story and AGENTS.md still own its page-object outcome and MakeMe requirement. Recheck entry selection for
newly implicated sources.

Slice-plan refinement was not needed: each slice has one protocol-reading outcome/proof loop, and all use the observed
shared component seam. There is no project numeric slice limit to invent. The broad slice-1 caller sweep is bounded by a
single screen/identity contract, with explicit transitive-consumer proof; if actual execution reveals independent
outcomes or an unbounded proof loop, realign this plan under the normal sizing rule before continuing. No remaining
slice-specific blocking concern or human decision was identified. Final caller migration and improvement evidence are
slice obligations, not completed work.

## Learnings

Preparation settled the shared seam across fixture tiers and demonstrated that independent sent-byte evidence detects a
lost prompt insertion. All scratch source/test changes were reverted before recording preparation or committing.

Slice 1: keep `openTerminalFromEntry` in `terminalScreenPage.ts` (do not re-import `startedSessionTerminal`) to avoid a
circular module dependency. Multi-line shared-owner imports tip files over 250 — collapse imports when migrating.
Side-panel Story review headings are not Terminal screen parts; do not route them through `terminalScreenParts`.
Retain `expectNoTerminalText` for slice 2 negative text observations. Local page-level `closeTerminal(page)` helpers
were a naming clash with the shared panel closer; prefer `closeTerminal(panel)` / renamed page wrappers.

Slice 2: `typeLine` must compose `insertTerminalText` + Enter/`pressTerminalKey`, never the reverse. Keep phone
`tapWhereShown` vs desktop `click` outside prompt-choose helpers. Own prompts on the screen module; voice re-exports —
do not import voice from `terminalScreenPage`.

Slice 3: keep `.terminal-screen` (paused overlay host) separate from `terminalScreenParts().screen` (`.xterm-screen`).
Composer no-auto-replay uses explicit `page.clock.runFor`, not wall-clock sleep. After Prettier one-import-per-line,
trim headers so touch specs stay ≤250.

Slice 4: keep Paste activation as `tapTerminalKey` vs `tapWhereShown(pasteKey)` when focus-as-was is under proof.
Phone reconnect uses `tapWhereShown(reconnectControl(panel))`, not click-only `reconnectTerminal`. Clipboard helpers
take payloads as arguments; do not fold release/retry into one helper.

Slice 5: keep phone stop/insert as `tapWhereShown(stopRecordingControl|insertTranscriptControl)` — do not fold modality
into `stopTerminalClip`/`insertRetainedTranscript`. Keyboard Dictate stays call-site; `beginTerminalClip` is the
ordinary pointer path. Voice reuses screen status/prompts/reconnect outward; do not import voice from
`terminalScreenPage`.

CI repair (quiet Story Branch Wrap Up): under shard load, Read final report could click without opening when access was
re-derived and Board refresh raced the panel. Pass the control's resolved access, commit the Side panel before story
selection, wait for `.final-report-text` with a retried open, and give that closure 60s.

## Execution complete

Product advice:
- Assimilate the lasting test-side pattern: one shared screen/input owner; modality protocols stay separate; `insertTerminalText` ≠ Enter; `.terminal-screen` ≠ `.xterm-screen`; do not import voice into `terminalScreenPage`.
- No backlog reorder: Board and later SEED-300 siblings already follow Terminal in the approved family order; Review remains a parallel Taken peer.
- No new product-story recommendation from this migration alone.
- Owned CI repair `694c8dceb` settled the quiet Story Branch Wrap Up Final-report open flake under shard load; carry that open-path lesson with the Terminal owners.
