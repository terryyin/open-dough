# Remaining MakeMe conversions

Reviewed on main through 7eab3d6ca. The line links identify the reviewed
locations. A shared helper is listed where changing it covers its callers.

The source scan covered all 1,577 registered test files across the shell
runner, Node runner and the three dashboard suites. It also searched test
support code, shell helpers and generated fixtures for record literals,
local factories, and writes of product data. The review traced flagged
setup through builders, encoders, and the boundaries that consume it.

The inventory covers synthetic setup and valid requests. Exact legacy or malformed
inputs, captured evidence, test operations, and independent expected values
keep their existing role. A test with one of those inputs can still have
ordinary surrounding facts to convert. See the
[test data architecture](../../tests/test-data-architecture.md).

## Slice 9 reconciliation (2026-11-11)

Walked all **362** line-linked locations on branch
`cursor/make-remaining-test-domain-setup-express-intent` at HEAD
`e8513214bb58a12efd595d975a3e5b1d5341c20c` (slices 1–8 already landed). Every
location is either converted through MakeMe (or a MakeMe-backed shared
fixture/renderer) or recorded below as a controlled shape. No audited valid
setup remains unconverted. Suite-local domain constructors displaced by
slices 1–8 (inline `request` / `groupedOptions` / `listedRun` / `ownBuild` /
proof-run literals and peers) already have no callers; none remained to
delete in this slice.

### Converted (335)

| Audit section | Converted locations |
| --- | ---: |
| Launch requests, saved launches and attempts | 88 |
| Native session listing, runner state and host samples | 22 |
| Project and launch-option configuration | 38 |
| Published stories, plans and backlog membership | 55 |
| CI provider runs, jobs, policy and adapter evidence | 42 |
| CI comparison, landed history and proof answers | 90 |

Call sites name distinguishing facts; incidental defaults and product shapes
come from shared MakeMe builders (`aLaunchRequest`, `aCreationRecord`,
`aLaunchRecord`, `aHostSession`, listing/host builders, `aPublishedSource`,
`anOptionsDefinition`, membership renderers, CI run/job/attempt/policy
builders, `aKeptBuild`, comparison slots, proof answers, and peers). Some
original line anchors drifted after conversion; construction now sits at the
MakeMe `please()` (or shared fixture) call in the same file or its helper.

### Controlled shapes (27)

Recorded here so maintainers do not treat them as unfinished conversion.

**Delivery-evidence native scenario copies** (fixture prose and Git scenario
layout the native journeys exercise; not ordinary membership setup):

- [tests/support/delivery-evidence-amended-native-scenario-content.sh:135](../../tests/support/delivery-evidence-amended-native-scenario-content.sh#L135)
- [tests/support/delivery-evidence-original-native-scenario-content.sh:126](../../tests/support/delivery-evidence-original-native-scenario-content.sh#L126)
- [tests/support/delivery-evidence-scheduling-native-scenario-content.sh:104](../../tests/support/delivery-evidence-scheduling-native-scenario-content.sh#L104)

**Supplier-dependency correction path/summary** (case-driving resolution prose
kept explicit; agreement body still via MakeMe):

- [tests/support/supplier-dependency-correction-fixture.mjs:18](../../tests/support/supplier-dependency-correction-fixture.mjs#L18)
  (`path: ".planning/seeds/B.md#b"`, `correctionSummary`)

**Done / quiet-completion mutations on live or MakeMe-backed retained
records** (case-defining `doneAt` / cleared completion; base record from a
real launch or `keepTrackedClosureEvidence`):

- [dashboard/backend-tests/sessions/agent-completion-quiet-closure.spec.ts:91](../../dashboard/backend-tests/sessions/agent-completion-quiet-closure.spec.ts#L91)
- [dashboard/backend-tests/sessions/session-unread-rule.spec.ts:122](../../dashboard/backend-tests/sessions/session-unread-rule.spec.ts#L122)
- [dashboard/tests/sessions/agent-launch-codex-observation.spec.ts:112](../../dashboard/tests/sessions/agent-launch-codex-observation.spec.ts#L112)
- [dashboard/tests/sessions/cursor-session-recovery.spec.ts:170](../../dashboard/tests/sessions/cursor-session-recovery.spec.ts#L170)
- [dashboard/tests/sessions/recently-done-sessions-sidebar-navigation.spec.ts:87](../../dashboard/tests/sessions/recently-done-sessions-sidebar-navigation.spec.ts#L87),
  [157](../../dashboard/tests/sessions/recently-done-sessions-sidebar-navigation.spec.ts#L157)
- [dashboard/tests/sessions/recently-done-sessions-sidebar-reopen.spec.ts:38](../../dashboard/tests/sessions/recently-done-sessions-sidebar-reopen.spec.ts#L38),
  [73](../../dashboard/tests/sessions/recently-done-sessions-sidebar-reopen.spec.ts#L73),
  [110](../../dashboard/tests/sessions/recently-done-sessions-sidebar-reopen.spec.ts#L110)
- [dashboard/tests/sessions/session-workspace-retirement-done.spec.ts:57](../../dashboard/tests/sessions/session-workspace-retirement-done.spec.ts#L57)
- [dashboard/tests/stories/recently-done-progressive-navigation-cursor.spec.ts:91](../../dashboard/tests/stories/recently-done-progressive-navigation-cursor.spec.ts#L91)
- [dashboard/tests/stories/recently-done-progressive-state.spec.ts:169](../../dashboard/tests/stories/recently-done-progressive-state.spec.ts#L169)
- [dashboard/tests/terminals/agent-terminal-codex-page.spec.ts:57](../../dashboard/tests/terminals/agent-terminal-codex-page.spec.ts#L57),
  [177](../../dashboard/tests/terminals/agent-terminal-codex-page.spec.ts#L177)
- [dashboard/tests/terminals/agent-terminal-pending-readiness-input.spec.ts:72](../../dashboard/tests/terminals/agent-terminal-pending-readiness-input.spec.ts#L72)

**Landing / first-input / session-replacement mutations for recovery proof**
(clear landing evidence, plant first-input state, or replace session id on a
real retained launch):

- [dashboard/backend-tests/review/one-shot-landing-recovery-deletion.spec.ts:101](../../dashboard/backend-tests/review/one-shot-landing-recovery-deletion.spec.ts#L101)
- [dashboard/backend-tests/review/one-shot-landing-recovery-retention.spec.ts:126](../../dashboard/backend-tests/review/one-shot-landing-recovery-retention.spec.ts#L126),
  [132](../../dashboard/backend-tests/review/one-shot-landing-recovery-retention.spec.ts#L132)
- [dashboard/tests/review/one-shot-landing-recovery.spec.ts:157](../../dashboard/tests/review/one-shot-landing-recovery.spec.ts#L157)
- [dashboard/tests/sessions/cursor-session-recovery.spec.ts:138](../../dashboard/tests/sessions/cursor-session-recovery.spec.ts#L138)

**Deliberate validation / options mismatch** (wrong `command` on an otherwise
MakeMe `groupedOptions` definition):

- [dashboard/tests/launches/agent-launch-options-exclusive.spec.ts:120](../../dashboard/tests/launches/agent-launch-options-exclusive.spec.ts#L120)

**CI reuse-policy attempt variations** (spread of MakeMe `aCiReuseAttempt`
`source` with case-driving unresolved / ambiguous / superseding fields):

- [src/skills/dough-execute-plan/scripts/ci-reuse-policy.test.mjs:102](../../src/skills/dough-execute-plan/scripts/ci-reuse-policy.test.mjs#L102),
  [119](../../src/skills/dough-execute-plan/scripts/ci-reuse-policy.test.mjs#L119)

Other deliberate malformed, corrupt, or invalid wire inputs cited in section
prose (collector output, corrupt terminal-theme bytes, refused CI fields)
remain literal at their call sites under commitments 10–13; surrounding valid
setup is MakeMe-converted.

## Launch requests, saved launches and attempts

Use shared launch request, record, observation and attempt construction for valid setup. Give unresolved creation its own canonical construction. For a case that changes a real stored launch, express the added facts through MakeMe and retain the read, write, and reload in the case.

Launch request variant copied from another request and given new scenario facts.

- [dashboard/backend-tests/launches/agent-launch-acceptance-kept-first.spec.ts:35](../../dashboard/backend-tests/launches/agent-launch-acceptance-kept-first.spec.ts#L35)
- [dashboard/backend-tests/launches/agent-launch-acceptance.spec.ts:47](../../dashboard/backend-tests/launches/agent-launch-acceptance.spec.ts#L47)
- [dashboard/backend-tests/launches/agent-launch-codex-lifetime.spec.ts:69](../../dashboard/backend-tests/launches/agent-launch-codex-lifetime.spec.ts#L69)
- [dashboard/backend-tests/launches/agent-launch-duplicate.spec.ts:43](../../dashboard/backend-tests/launches/agent-launch-duplicate.spec.ts#L43), [90](../../dashboard/backend-tests/launches/agent-launch-duplicate.spec.ts#L90)
- [dashboard/backend-tests/launches/agent-launch-model-boundary.spec.ts:69](../../dashboard/backend-tests/launches/agent-launch-model-boundary.spec.ts#L69), [124](../../dashboard/backend-tests/launches/agent-launch-model-boundary.spec.ts#L124)
- [dashboard/backend-tests/launches/agent-launch-preparation-codex-continuation.spec.ts:26](../../dashboard/backend-tests/launches/agent-launch-preparation-codex-continuation.spec.ts#L26)
- [dashboard/backend-tests/launches/agent-launch-preparation-codex-retry.spec.ts:37](../../dashboard/backend-tests/launches/agent-launch-preparation-codex-retry.spec.ts#L37)
- [dashboard/backend-tests/launches/agent-launch-preparation-resume.spec.ts:36](../../dashboard/backend-tests/launches/agent-launch-preparation-resume.spec.ts#L36)
- [dashboard/backend-tests/launches/agent-launch-preparation-start.spec.ts:34](../../dashboard/backend-tests/launches/agent-launch-preparation-start.spec.ts#L34)
- [dashboard/backend-tests/launches/agent-launch-preparation-stops.spec.ts:36](../../dashboard/backend-tests/launches/agent-launch-preparation-stops.spec.ts#L36)
- [dashboard/backend-tests/launches/agent-launch-start-codex-recovery.spec.ts:29](../../dashboard/backend-tests/launches/agent-launch-start-codex-recovery.spec.ts#L29)
- [dashboard/backend-tests/launches/agent-launch-start-duplicate.spec.ts:33](../../dashboard/backend-tests/launches/agent-launch-start-duplicate.spec.ts#L33)
- [dashboard/backend-tests/launches/agent-launch-start-kept-not-running.spec.ts:18](../../dashboard/backend-tests/launches/agent-launch-start-kept-not-running.spec.ts#L18)
- [dashboard/backend-tests/launches/agent-launch-start-refusal.spec.ts:34](../../dashboard/backend-tests/launches/agent-launch-start-refusal.spec.ts#L34)
- [dashboard/backend-tests/launches/agent-launch-start.spec.ts:32](../../dashboard/backend-tests/launches/agent-launch-start.spec.ts#L32)
- [dashboard/backend-tests/launches/dashboard-update-drain.spec.ts:29](../../dashboard/backend-tests/launches/dashboard-update-drain.spec.ts#L29)
- [dashboard/backend-tests/launches/ownRecordContinuation.ts:41](../../dashboard/backend-tests/launches/ownRecordContinuation.ts#L41)
- [dashboard/tests/keptExecutionStart.ts:27](../../dashboard/tests/keptExecutionStart.ts#L27)
- [dashboard/tests/launches/agent-launch-codex-creation.spec.ts:27](../../dashboard/tests/launches/agent-launch-codex-creation.spec.ts#L27)
- [dashboard/tests/launches/agent-launch-codex-recheck.spec.ts:10](../../dashboard/tests/launches/agent-launch-codex-recheck.spec.ts#L10)
- [dashboard/tests/launches/agent-launch-codex-reconciliation.spec.ts:20](../../dashboard/tests/launches/agent-launch-codex-reconciliation.spec.ts#L20)
- [dashboard/tests/launches/agent-launch-continuation.spec.ts:59](../../dashboard/tests/launches/agent-launch-continuation.spec.ts#L59)
- [dashboard/tests/launches/agent-launch-preparation-codex-recovery.spec.ts:37](../../dashboard/tests/launches/agent-launch-preparation-codex-recovery.spec.ts#L37)
- [dashboard/tests/launches/agent-launch-preparation-codex-retry.spec.ts:29](../../dashboard/tests/launches/agent-launch-preparation-codex-retry.spec.ts#L29)
- [dashboard/tests/launches/agent-launch-second-server.spec.ts:26](../../dashboard/tests/launches/agent-launch-second-server.spec.ts#L26)
- [dashboard/tests/launches/agent-launch-start-taken.spec.ts:109](../../dashboard/tests/launches/agent-launch-start-taken.spec.ts#L109)
- [dashboard/tests/support/keptPreparation.ts:31](../../dashboard/tests/support/keptPreparation.ts#L31)

Inline launch request. Keep deliberate validation variations explicit.

- [dashboard/backend-tests/launches/agent-launch-ad-hoc-boundary.spec.ts:21](../../dashboard/backend-tests/launches/agent-launch-ad-hoc-boundary.spec.ts#L21)
- [dashboard/backend-tests/launches/agent-launch-ad-hoc-codex-input.spec.ts:25](../../dashboard/backend-tests/launches/agent-launch-ad-hoc-codex-input.spec.ts#L25)
- [dashboard/backend-tests/launches/agent-launch-codex-model-boundary.spec.ts:10](../../dashboard/backend-tests/launches/agent-launch-codex-model-boundary.spec.ts#L10)
- [dashboard/backend-tests/launches/agent-launch-duplicate.spec.ts:44](../../dashboard/backend-tests/launches/agent-launch-duplicate.spec.ts#L44), [149](../../dashboard/backend-tests/launches/agent-launch-duplicate.spec.ts#L149), [210](../../dashboard/backend-tests/launches/agent-launch-duplicate.spec.ts#L210), [236](../../dashboard/backend-tests/launches/agent-launch-duplicate.spec.ts#L236)
- [dashboard/backend-tests/launches/agent-launch-matching-rules.spec.ts:8](../../dashboard/backend-tests/launches/agent-launch-matching-rules.spec.ts#L8), [41](../../dashboard/backend-tests/launches/agent-launch-matching-rules.spec.ts#L41), [65](../../dashboard/backend-tests/launches/agent-launch-matching-rules.spec.ts#L65), [85](../../dashboard/backend-tests/launches/agent-launch-matching-rules.spec.ts#L85)
- [dashboard/backend-tests/launches/agent-launch-model-boundary.spec.ts:25](../../dashboard/backend-tests/launches/agent-launch-model-boundary.spec.ts#L25)
- [dashboard/backend-tests/launches/agent-launch-preparation-store-failure.spec.ts:39](../../dashboard/backend-tests/launches/agent-launch-preparation-store-failure.spec.ts#L39)
- [dashboard/backend-tests/launches/agent-launch-records.spec.ts:225](../../dashboard/backend-tests/launches/agent-launch-records.spec.ts#L225)
- [dashboard/backend-tests/launches/agent-launch-start-session-identity.spec.ts:28](../../dashboard/backend-tests/launches/agent-launch-start-session-identity.spec.ts#L28)
- [dashboard/backend-tests/launches/agent-launch-start-session-kept.spec.ts:45](../../dashboard/backend-tests/launches/agent-launch-start-session-kept.spec.ts#L45)
- [dashboard/backend-tests/launches/agent-launch-start-session-landing-boundary.spec.ts:33](../../dashboard/backend-tests/launches/agent-launch-start-session-landing-boundary.spec.ts#L33)
- [dashboard/backend-tests/launches/agent-launch-start-session-retention.spec.ts:30](../../dashboard/backend-tests/launches/agent-launch-start-session-retention.spec.ts#L30)
- [dashboard/backend-tests/launches/agent-launch-start-session-stops.spec.ts:34](../../dashboard/backend-tests/launches/agent-launch-start-session-stops.spec.ts#L34)
- [dashboard/backend-tests/launches/codexEffortBoundaryCases.ts:3](../../dashboard/backend-tests/launches/codexEffortBoundaryCases.ts#L3)
- [dashboard/backend-tests/launches/followUpBoundaryCases.ts:31](../../dashboard/backend-tests/launches/followUpBoundaryCases.ts#L31)

Creation, retained launch, observed session, or settled attempt assembled inline.

- [dashboard/backend-tests/launches/agent-launch-creation-recovery.spec.ts:11](../../dashboard/backend-tests/launches/agent-launch-creation-recovery.spec.ts#L11)
- [dashboard/backend-tests/launches/agent-launch-open-session-continue.spec.ts:93](../../dashboard/backend-tests/launches/agent-launch-open-session-continue.spec.ts#L93)
- [dashboard/backend-tests/launches/launch-attempt-attention.spec.ts:30](../../dashboard/backend-tests/launches/launch-attempt-attention.spec.ts#L30)
- [dashboard/backend-tests/launches/ownRecordContinuation.ts:123](../../dashboard/backend-tests/launches/ownRecordContinuation.ts#L123)
- [dashboard/backend-tests/sessions/agent-completion-input.spec.ts:19](../../dashboard/backend-tests/sessions/agent-completion-input.spec.ts#L19), [30](../../dashboard/backend-tests/sessions/agent-completion-input.spec.ts#L30)
- [dashboard/backend-tests/sessions/agent-completion-quiet-closure.spec.ts:91](../../dashboard/backend-tests/sessions/agent-completion-quiet-closure.spec.ts#L91)
- [dashboard/backend-tests/sessions/agent-launch-done-codex.spec.ts:147](../../dashboard/backend-tests/sessions/agent-launch-done-codex.spec.ts#L147)
- [dashboard/backend-tests/sessions/cursor-session-belonging-subagents.spec.ts:28](../../dashboard/backend-tests/sessions/cursor-session-belonging-subagents.spec.ts#L28), [48](../../dashboard/backend-tests/sessions/cursor-session-belonging-subagents.spec.ts#L48)
- [dashboard/backend-tests/sessions/cursor-session-owned-pending-ci.spec.ts:40](../../dashboard/backend-tests/sessions/cursor-session-owned-pending-ci.spec.ts#L40)
- [dashboard/backend-tests/sessions/session-unread-rule.spec.ts:26](../../dashboard/backend-tests/sessions/session-unread-rule.spec.ts#L26), [59](../../dashboard/backend-tests/sessions/session-unread-rule.spec.ts#L59), [88](../../dashboard/backend-tests/sessions/session-unread-rule.spec.ts#L88), [122](../../dashboard/backend-tests/sessions/session-unread-rule.spec.ts#L122), [147](../../dashboard/backend-tests/sessions/session-unread-rule.spec.ts#L147)
- [dashboard/backend-tests/terminals/agent-terminal-codex.spec.ts:172](../../dashboard/backend-tests/terminals/agent-terminal-codex.spec.ts#L172)

Stored receipt or Done facts assembled for recovery.

- [dashboard/backend-tests/review/one-shot-landing-recovery-deletion.spec.ts:101](../../dashboard/backend-tests/review/one-shot-landing-recovery-deletion.spec.ts#L101)
- [dashboard/backend-tests/review/one-shot-landing-recovery-retention.spec.ts:126](../../dashboard/backend-tests/review/one-shot-landing-recovery-retention.spec.ts#L126), [132](../../dashboard/backend-tests/review/one-shot-landing-recovery-retention.spec.ts#L132)

Creation or establishing request inside MakeMe-backed setup.

- [dashboard/frontend-tests/agent-launch-creation-gates.spec.ts:20](../../dashboard/frontend-tests/agent-launch-creation-gates.spec.ts#L20)
- [dashboard/frontend-tests/startup-host-words.spec.ts:46](../../dashboard/frontend-tests/startup-host-words.spec.ts#L46)

Inline launch request or predecessor request.

- [dashboard/tests/agentLaunchBoundary.ts:52](../../dashboard/tests/agentLaunchBoundary.ts#L52)
- [dashboard/tests/claudeVerification.ts:14](../../dashboard/tests/claudeVerification.ts#L14)
- [dashboard/tests/launches/agent-launch-ad-hoc-codex-recovery.spec.ts:13](../../dashboard/tests/launches/agent-launch-ad-hoc-codex-recovery.spec.ts#L13)
- [dashboard/tests/launches/agent-launch-creation-gates.spec.ts:32](../../dashboard/tests/launches/agent-launch-creation-gates.spec.ts#L32)
- [dashboard/tests/launches/agent-launch-start-session-existing-changes.spec.ts:176](../../dashboard/tests/launches/agent-launch-start-session-existing-changes.spec.ts#L176)
- [dashboard/tests/launches/agent-launch-start-session-failed.spec.ts:33](../../dashboard/tests/launches/agent-launch-start-session-failed.spec.ts#L33)
- [dashboard/tests/launches/agent-launch-start-session-isolated-boundary.spec.ts:39](../../dashboard/tests/launches/agent-launch-start-session-isolated-boundary.spec.ts#L39)
- [dashboard/tests/launches/agent-launch-start-session-recovery.spec.ts:180](../../dashboard/tests/launches/agent-launch-start-session-recovery.spec.ts#L180)
- [dashboard/tests/launches/agent-launch-unconfirmed-input.spec.ts:15](../../dashboard/tests/launches/agent-launch-unconfirmed-input.spec.ts#L15)
- [dashboard/tests/launches/responsive-session-recovery-ad-hoc.spec.ts:19](../../dashboard/tests/launches/responsive-session-recovery-ad-hoc.spec.ts#L19)
- [dashboard/tests/runtime/production-watcher-updates.spec.ts:71](../../dashboard/tests/runtime/production-watcher-updates.spec.ts#L71)
- [dashboard/tests/support/startSessionLandingCapture.ts:28](../../dashboard/tests/support/startSessionLandingCapture.ts#L28)

Creation or retained launch facts assembled inline, including Done, first input, and continuation changes.

- [dashboard/tests/launches/agent-launch-creation-gates.spec.ts:67](../../dashboard/tests/launches/agent-launch-creation-gates.spec.ts#L67)
- [dashboard/tests/launches/agent-launch-unconfirmed-input.spec.ts:41](../../dashboard/tests/launches/agent-launch-unconfirmed-input.spec.ts#L41)
- [dashboard/tests/sessions/agent-launch-codex-observation.spec.ts:112](../../dashboard/tests/sessions/agent-launch-codex-observation.spec.ts#L112)
- [dashboard/tests/sessions/cursor-session-recovery.spec.ts:138](../../dashboard/tests/sessions/cursor-session-recovery.spec.ts#L138), [170](../../dashboard/tests/sessions/cursor-session-recovery.spec.ts#L170), [180](../../dashboard/tests/sessions/cursor-session-recovery.spec.ts#L180)
- [dashboard/tests/sessions/recently-done-sessions-sidebar-navigation.spec.ts:87](../../dashboard/tests/sessions/recently-done-sessions-sidebar-navigation.spec.ts#L87), [157](../../dashboard/tests/sessions/recently-done-sessions-sidebar-navigation.spec.ts#L157)
- [dashboard/tests/sessions/recently-done-sessions-sidebar-reopen.spec.ts:38](../../dashboard/tests/sessions/recently-done-sessions-sidebar-reopen.spec.ts#L38), [73](../../dashboard/tests/sessions/recently-done-sessions-sidebar-reopen.spec.ts#L73), [110](../../dashboard/tests/sessions/recently-done-sessions-sidebar-reopen.spec.ts#L110)
- [dashboard/tests/sessions/session-workspace-retirement-done.spec.ts:57](../../dashboard/tests/sessions/session-workspace-retirement-done.spec.ts#L57)
- [dashboard/tests/stories/recently-done-progressive-navigation-cursor.spec.ts:91](../../dashboard/tests/stories/recently-done-progressive-navigation-cursor.spec.ts#L91)
- [dashboard/tests/stories/recently-done-progressive-state.spec.ts:169](../../dashboard/tests/stories/recently-done-progressive-state.spec.ts#L169)
- [dashboard/tests/support/retainedReport.ts:114](../../dashboard/tests/support/retainedReport.ts#L114), [175](../../dashboard/tests/support/retainedReport.ts#L175)
- [dashboard/tests/support/sessionsReplayRecords.ts:120](../../dashboard/tests/support/sessionsReplayRecords.ts#L120), [132](../../dashboard/tests/support/sessionsReplayRecords.ts#L132), [149](../../dashboard/tests/support/sessionsReplayRecords.ts#L149), [176](../../dashboard/tests/support/sessionsReplayRecords.ts#L176)
- [dashboard/tests/terminals/agent-terminal-codex-page.spec.ts:57](../../dashboard/tests/terminals/agent-terminal-codex-page.spec.ts#L57), [177](../../dashboard/tests/terminals/agent-terminal-codex-page.spec.ts#L177)
- [dashboard/tests/terminals/agent-terminal-pending-readiness-input.spec.ts:72](../../dashboard/tests/terminals/agent-terminal-pending-readiness-input.spec.ts#L72)

A stored receipt assembled for a recovery case.

- [dashboard/tests/review/one-shot-landing-recovery.spec.ts:157](../../dashboard/tests/review/one-shot-landing-recovery.spec.ts#L157)

## Native session listing, runner state and host samples

Construct valid facts at the fake boundary through MakeMe. The native listing, stored host session and dashboard runner response each have their own shape. Keep the fake processes and transport in the harness.

Claude listing rows or a saved host session with continuation facts.

- [dashboard/backend-tests/launches/agent-launch-records.spec.ts:142](../../dashboard/backend-tests/launches/agent-launch-records.spec.ts#L142)
- [dashboard/backend-tests/launches/launch-record-session-rules.spec.ts:29](../../dashboard/backend-tests/launches/launch-record-session-rules.spec.ts#L29)
- [dashboard/backend-tests/sessions/final-report-codex.spec.ts:29](../../dashboard/backend-tests/sessions/final-report-codex.spec.ts#L29)
- [dashboard/backend-tests/sessions/session-workspace-retirement-boundary.spec.ts:18](../../dashboard/backend-tests/sessions/session-workspace-retirement-boundary.spec.ts#L18)
- [dashboard/backend-tests/sessions/session-workspace-retirement-startup.spec.ts:70](../../dashboard/backend-tests/sessions/session-workspace-retirement-startup.spec.ts#L70)

Runner listings or host resource samples served to the browser.

- [dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts:46](../../dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts#L46), [50](../../dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts#L50), [54](../../dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts#L54)
- [dashboard/frontend-tests/sessions-sidebar-host-status.spec.ts:76](../../dashboard/frontend-tests/sessions-sidebar-host-status.spec.ts#L76), [94](../../dashboard/frontend-tests/sessions-sidebar-host-status.spec.ts#L94), [103](../../dashboard/frontend-tests/sessions-sidebar-host-status.spec.ts#L103), [126](../../dashboard/frontend-tests/sessions-sidebar-host-status.spec.ts#L126)

Synthetic native or machine state assembled in the fixture.

- [dashboard/tests/support/fakeClaudeListing.ts:31](../../dashboard/tests/support/fakeClaudeListing.ts#L31), [107](../../dashboard/tests/support/fakeClaudeListing.ts#L107), [123](../../dashboard/tests/support/fakeClaudeListing.ts#L123), [138](../../dashboard/tests/support/fakeClaudeListing.ts#L138)
- [dashboard/tests/support/fakeCursorSharedConfig.ts:31](../../dashboard/tests/support/fakeCursorSharedConfig.ts#L31), [56](../../dashboard/tests/support/fakeCursorSharedConfig.ts#L56)
- [dashboard/tests/support/frontendServiceState.ts:109](../../dashboard/tests/support/frontendServiceState.ts#L109), [110](../../dashboard/tests/support/frontendServiceState.ts#L110)
- [dashboard/tests/support/sessionsReplaySeed.ts:30](../../dashboard/tests/support/sessionsReplaySeed.ts#L30), [76](../../dashboard/tests/support/sessionsReplaySeed.ts#L76)

## Project and launch-option configuration

Reuse the published-source builder for valid sources. Build ordinary skill option definitions and project CI settings in their existing file shapes, with the chosen flags, groups or adapter explicit.

Inline published source or valid option setup around validation cases.

- [dashboard/backend-tests/intent/intent-shared-reads.spec.ts:20](../../dashboard/backend-tests/intent/intent-shared-reads.spec.ts#L20)
- [dashboard/backend-tests/launches/agent-launch-options-groups.spec.ts:60](../../dashboard/backend-tests/launches/agent-launch-options-groups.spec.ts#L60), [72](../../dashboard/backend-tests/launches/agent-launch-options-groups.spec.ts#L72), [83](../../dashboard/backend-tests/launches/agent-launch-options-groups.spec.ts#L83)
- [dashboard/backend-tests/launches/agent-launch-options-rules.spec.ts:43](../../dashboard/backend-tests/launches/agent-launch-options-rules.spec.ts#L43)
- [dashboard/backend-tests/observation/authenticated-read-shared-listing-failures.spec.ts:198](../../dashboard/backend-tests/observation/authenticated-read-shared-listing-failures.spec.ts#L198)

Valid project CI adapter configuration assembled at the file boundary.

- [dashboard/backend-tests/intent/landed-ci-repeat-admission.spec.ts:130](../../dashboard/backend-tests/intent/landed-ci-repeat-admission.spec.ts#L130)
- [dashboard/backend-tests/support/ciProofMemory.ts:28](../../dashboard/backend-tests/support/ciProofMemory.ts#L28)
- [dashboard/tests/intent/intent-ci-status-reads.spec.ts:168](../../dashboard/tests/intent/intent-ci-status-reads.spec.ts#L168)
- [dashboard/tests/intentCiAdapterProofProject.ts:111](../../dashboard/tests/intentCiAdapterProofProject.ts#L111)
- [dashboard/tests/launches/agent-launch-base-ci-adapter.spec.ts:29](../../dashboard/tests/launches/agent-launch-base-ci-adapter.spec.ts#L29)
- [src/skills/dough-execute-plan/scripts/ci-command-adapter-cli.test.mjs:59](../../src/skills/dough-execute-plan/scripts/ci-command-adapter-cli.test.mjs#L59), [73](../../src/skills/dough-execute-plan/scripts/ci-command-adapter-cli.test.mjs#L73)
- [src/skills/dough-execute-plan/scripts/ci-command-adapter-failures.test.mjs:75](../../src/skills/dough-execute-plan/scripts/ci-command-adapter-failures.test.mjs#L75)
- [src/skills/dough-execute-plan/scripts/ci-command-adapter-history-coverage.test.mjs:60](../../src/skills/dough-execute-plan/scripts/ci-command-adapter-history-coverage.test.mjs#L60)
- [src/skills/dough-execute-plan/scripts/ci-command-adapter-unavailable.test.mjs:82](../../src/skills/dough-execute-plan/scripts/ci-command-adapter-unavailable.test.mjs#L82)
- [src/skills/dough-execute-plan/scripts/ci-command-adapter.test.mjs:58](../../src/skills/dough-execute-plan/scripts/ci-command-adapter.test.mjs#L58), [215](../../src/skills/dough-execute-plan/scripts/ci-command-adapter.test.mjs#L215)
- [src/skills/dough-execute-plan/scripts/ci-custom-bridge-test-fixtures.mjs:74](../../src/skills/dough-execute-plan/scripts/ci-custom-bridge-test-fixtures.mjs#L74)
- [src/skills/dough-execute-plan/scripts/ci-integrated-state-custom-test-fixtures.mjs:89](../../src/skills/dough-execute-plan/scripts/ci-integrated-state-custom-test-fixtures.mjs#L89)
- [src/skills/dough-execute-plan/scripts/ci-mailbox-await-wake-cases.mjs:46](../../src/skills/dough-execute-plan/scripts/ci-mailbox-await-wake-cases.mjs#L46)
- [src/skills/dough-execute-plan/scripts/ci-reuse-custom-test-fixtures.mjs:34](../../src/skills/dough-execute-plan/scripts/ci-reuse-custom-test-fixtures.mjs#L34)
- [src/skills/dough-execute-plan/scripts/ci-revision-coverage-test-fixtures.mjs:103](../../src/skills/dough-execute-plan/scripts/ci-revision-coverage-test-fixtures.mjs#L103)
- [src/skills/dough-execute-plan/scripts/ci-target-branch-worktree-test-fixtures.mjs:124](../../src/skills/dough-execute-plan/scripts/ci-target-branch-worktree-test-fixtures.mjs#L124)
- [src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs:125](../../src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs#L125)
- [tests/support/dashboard-ci-adapter-proof.test.mjs:39](../../tests/support/dashboard-ci-adapter-proof.test.mjs#L39)
- [tests/support/dashboardCiAdapterComparisonEndpoint.mjs:15](../../tests/support/dashboardCiAdapterComparisonEndpoint.mjs#L15)
- [tests/support/git-publication-native-one-shot-fixture.mjs:123](../../tests/support/git-publication-native-one-shot-fixture.mjs#L123)

Valid recovered terminal-theme preference; keep the corrupt inputs explicit.

- [dashboard/tests/configuration/system-settings-terminal-theme-recovery.spec.ts:44](../../dashboard/tests/configuration/system-settings-terminal-theme-recovery.spec.ts#L44)

Inline published source or valid refinement definition.

- [dashboard/tests/launchStoryCardPage.ts:65](../../dashboard/tests/launchStoryCardPage.ts#L65), [72](../../dashboard/tests/launchStoryCardPage.ts#L72)
- [dashboard/tests/launches/agent-launch-options-exclusive.spec.ts:33](../../dashboard/tests/launches/agent-launch-options-exclusive.spec.ts#L33), [80](../../dashboard/tests/launches/agent-launch-options-exclusive.spec.ts#L80), [120](../../dashboard/tests/launches/agent-launch-options-exclusive.spec.ts#L120)
- [dashboard/tests/launches/agent-launch-options-kept.spec.ts:41](../../dashboard/tests/launches/agent-launch-options-kept.spec.ts#L41)
- [dashboard/tests/launches/agent-launch-options.spec.ts:94](../../dashboard/tests/launches/agent-launch-options.spec.ts#L94)
- [dashboard/tests/support/codexLaunch.ts:65](../../dashboard/tests/support/codexLaunch.ts#L65)
- [dashboard/tests/support/frontendServiceState.ts:21](../../dashboard/tests/support/frontendServiceState.ts#L21), [29](../../dashboard/tests/support/frontendServiceState.ts#L29)

## Published stories, plans and backlog membership

Use shared facts for ordinary seed sections, plans, and membership where an outer repository description already uses MakeMe. Keep the prose that drives a case explicit and render the surrounding facts at the file boundary.

Seed or backlog facts supplied to an authenticated read or review.

- [dashboard/backend-tests/observation/authenticated-branch-read-boundary.spec.ts:68](../../dashboard/backend-tests/observation/authenticated-branch-read-boundary.spec.ts#L68)
- [dashboard/backend-tests/observation/authenticated-read-boundary.spec.ts:107](../../dashboard/backend-tests/observation/authenticated-read-boundary.spec.ts#L107)
- [dashboard/backend-tests/observation/authenticated-read-committed-last.spec.ts:52](../../dashboard/backend-tests/observation/authenticated-read-committed-last.spec.ts#L52)

Hand-rendered story or backlog content. Keep case-specific body text and deliberate formatting or refusal inputs.

- [dashboard/tests/assignmentCreditRecords.ts:52](../../dashboard/tests/assignmentCreditRecords.ts#L52)
- [dashboard/tests/autoRefreshJourney.ts:34](../../dashboard/tests/autoRefreshJourney.ts#L34)
- [dashboard/tests/branchProgressRecords.ts:96](../../dashboard/tests/branchProgressRecords.ts#L96)
- [dashboard/tests/catalogProjectRecords.ts:50](../../dashboard/tests/catalogProjectRecords.ts#L50)
- [dashboard/tests/doughnutProject.ts:43](../../dashboard/tests/doughnutProject.ts#L43)
- [dashboard/tests/intentCiStoryBoard.ts:108](../../dashboard/tests/intentCiStoryBoard.ts#L108)
- [dashboard/tests/limitedReadingRecords.ts:60](../../dashboard/tests/limitedReadingRecords.ts#L60), [70](../../dashboard/tests/limitedReadingRecords.ts#L70), [97](../../dashboard/tests/limitedReadingRecords.ts#L97)
- [dashboard/tests/navigation/board-height.spec.ts:66](../../dashboard/tests/navigation/board-height.spec.ts#L66)
- [dashboard/tests/observation/read-turns-across-tabs.spec.ts:36](../../dashboard/tests/observation/read-turns-across-tabs.spec.ts#L36)
- [dashboard/tests/observation/shared-observer-reads.spec.ts:58](../../dashboard/tests/observation/shared-observer-reads.spec.ts#L58)
- [dashboard/tests/observation/transient-detail-recovery.spec.ts:65](../../dashboard/tests/observation/transient-detail-recovery.spec.ts#L65)
- [dashboard/tests/preparingJourney.ts:71](../../dashboard/tests/preparingJourney.ts#L71)
- [dashboard/tests/publishedFactsArrival.ts:57](../../dashboard/tests/publishedFactsArrival.ts#L57)
- [dashboard/tests/publishedFactsIsolation.ts:69](../../dashboard/tests/publishedFactsIsolation.ts#L69), [77](../../dashboard/tests/publishedFactsIsolation.ts#L77)
- [dashboard/tests/reopenedProject.ts:57](../../dashboard/tests/reopenedProject.ts#L57), [66](../../dashboard/tests/reopenedProject.ts#L66)
- [dashboard/tests/revisionReuseOrigin.ts:71](../../dashboard/tests/revisionReuseOrigin.ts#L71), [91](../../dashboard/tests/revisionReuseOrigin.ts#L91), [92](../../dashboard/tests/revisionReuseOrigin.ts#L92)
- [dashboard/tests/sliceClockRecords.ts:48](../../dashboard/tests/sliceClockRecords.ts#L48)
- [dashboard/tests/stories/plan-execution-complete-detail.spec.ts:73](../../dashboard/tests/stories/plan-execution-complete-detail.spec.ts#L73)
- [dashboard/tests/stories/taken-slice-progress.spec.ts:54](../../dashboard/tests/stories/taken-slice-progress.spec.ts#L54), [60](../../dashboard/tests/stories/taken-slice-progress.spec.ts#L60), [68](../../dashboard/tests/stories/taken-slice-progress.spec.ts#L68), [74](../../dashboard/tests/stories/taken-slice-progress.spec.ts#L74)
- [dashboard/tests/stories/takenExecutionCompleteFixture.ts:67](../../dashboard/tests/stories/takenExecutionCompleteFixture.ts#L67)
- [dashboard/tests/storyReadinessRecords.ts:40](../../dashboard/tests/storyReadinessRecords.ts#L40), [50](../../dashboard/tests/storyReadinessRecords.ts#L50), [60](../../dashboard/tests/storyReadinessRecords.ts#L60), [116](../../dashboard/tests/storyReadinessRecords.ts#L116), [133](../../dashboard/tests/storyReadinessRecords.ts#L133), [150](../../dashboard/tests/storyReadinessRecords.ts#L150), [169](../../dashboard/tests/storyReadinessRecords.ts#L169)
- [dashboard/tests/support/frontendServiceState.ts:57](../../dashboard/tests/support/frontendServiceState.ts#L57), [58](../../dashboard/tests/support/frontendServiceState.ts#L58), [59](../../dashboard/tests/support/frontendServiceState.ts#L59)
- [dashboard/tests/unchangedRecordsRefresh.ts:47](../../dashboard/tests/unchangedRecordsRefresh.ts#L47)

Story sections and starting planning facts in Git publication fixtures.

- [src/skills/dough-execute-plan/scripts/source-freshness-test-fixtures.mjs:29](../../src/skills/dough-execute-plan/scripts/source-freshness-test-fixtures.mjs#L29), [35](../../src/skills/dough-execute-plan/scripts/source-freshness-test-fixtures.mjs#L35)
- [src/skills/dough-execute-plan/scripts/workspace-publication-admission-fixtures.mjs:24](../../src/skills/dough-execute-plan/scripts/workspace-publication-admission-fixtures.mjs#L24)

Shell starting backlog, repository history, or plan facts. Keep scenario prose, raw evidence and Git operations under proof explicit.

- [tests/product-backlog-payload-update.sh:89](../../tests/product-backlog-payload-update.sh#L89)
- [tests/support/delivery-evidence-amended-native-scenario-content.sh:135](../../tests/support/delivery-evidence-amended-native-scenario-content.sh#L135)
- [tests/support/delivery-evidence-original-native-scenario-content.sh:126](../../tests/support/delivery-evidence-original-native-scenario-content.sh#L126)
- [tests/support/delivery-evidence-scheduling-native-scenario-content.sh:104](../../tests/support/delivery-evidence-scheduling-native-scenario-content.sh#L104)

Valid seed, plan, or agreement around the operation being checked.

- [tests/support/consumer-discovery-anchors.test.mjs:28](../../tests/support/consumer-discovery-anchors.test.mjs#L28), [52](../../tests/support/consumer-discovery-anchors.test.mjs#L52), [64](../../tests/support/consumer-discovery-anchors.test.mjs#L64)
- [tests/support/product-backlog-correction-story.test.mjs:26](../../tests/support/product-backlog-correction-story.test.mjs#L26)
- [tests/support/product-backlog-plan-link.test.mjs:36](../../tests/support/product-backlog-plan-link.test.mjs#L36)
- [tests/support/story-state-fixture.mjs:29](../../tests/support/story-state-fixture.mjs#L29), [95](../../tests/support/story-state-fixture.mjs#L95)
- [tests/support/supplier-dependency-correction-fixture.mjs:18](../../tests/support/supplier-dependency-correction-fixture.mjs#L18)
- [tests/support/supplier-reconciliation-fixture.mjs:62](../../tests/support/supplier-reconciliation-fixture.mjs#L62)

## CI provider runs, jobs, policy and adapter evidence

Reuse the existing GitHub run, job, adapter attempt, queue and coverage builders. Share valid current-attempt and reuse-policy construction where the product consumes a distinct shape. Keep provider encoding and actual mailbox registration in the harness.

Provider run or dashboard run read assembled in the fixture.

- [dashboard/tests/support/completionCi.ts:10](../../dashboard/tests/support/completionCi.ts#L10)
- [dashboard/tests/support/landedCiTrunkRuns.ts:47](../../dashboard/tests/support/landedCiTrunkRuns.ts#L47)

Inline CI provider, reuse or retention facts. Keep any malformed or contradicted field under proof explicit.

- [src/skills/dough-execute-plan/scripts/ci-background-test-fixtures.mjs:184](../../src/skills/dough-execute-plan/scripts/ci-background-test-fixtures.mjs#L184)
- [src/skills/dough-execute-plan/scripts/ci-codex-delivery-acknowledgment.test.mjs:44](../../src/skills/dough-execute-plan/scripts/ci-codex-delivery-acknowledgment.test.mjs#L44), [134](../../src/skills/dough-execute-plan/scripts/ci-codex-delivery-acknowledgment.test.mjs#L134), [172](../../src/skills/dough-execute-plan/scripts/ci-codex-delivery-acknowledgment.test.mjs#L172)
- [src/skills/dough-execute-plan/scripts/ci-github-current-attempt.test.mjs:63](../../src/skills/dough-execute-plan/scripts/ci-github-current-attempt.test.mjs#L63)
- [src/skills/dough-execute-plan/scripts/ci-inherited-evidence-refresh.test.mjs:75](../../src/skills/dough-execute-plan/scripts/ci-inherited-evidence-refresh.test.mjs#L75)
- [src/skills/dough-execute-plan/scripts/ci-integrated-state-github-test-fixtures.mjs:103](../../src/skills/dough-execute-plan/scripts/ci-integrated-state-github-test-fixtures.mjs#L103)
- [src/skills/dough-execute-plan/scripts/ci-integrated-state-judge-test-fixtures.mjs:16](../../src/skills/dough-execute-plan/scripts/ci-integrated-state-judge-test-fixtures.mjs#L16), [93](../../src/skills/dough-execute-plan/scripts/ci-integrated-state-judge-test-fixtures.mjs#L93), [107](../../src/skills/dough-execute-plan/scripts/ci-integrated-state-judge-test-fixtures.mjs#L107)
- [src/skills/dough-execute-plan/scripts/ci-integrated-state-judge.test.mjs:73](../../src/skills/dough-execute-plan/scripts/ci-integrated-state-judge.test.mjs#L73), [74](../../src/skills/dough-execute-plan/scripts/ci-integrated-state-judge.test.mjs#L74), [81](../../src/skills/dough-execute-plan/scripts/ci-integrated-state-judge.test.mjs#L81)
- [src/skills/dough-execute-plan/scripts/ci-integrated-state-replaced-basis.test.mjs:62](../../src/skills/dough-execute-plan/scripts/ci-integrated-state-replaced-basis.test.mjs#L62), [135](../../src/skills/dough-execute-plan/scripts/ci-integrated-state-replaced-basis.test.mjs#L135)
- [src/skills/dough-execute-plan/scripts/ci-reuse-custom-example.test.mjs:19](../../src/skills/dough-execute-plan/scripts/ci-reuse-custom-example.test.mjs#L19)
- [src/skills/dough-execute-plan/scripts/ci-reuse-custom-test-fixtures.mjs:41](../../src/skills/dough-execute-plan/scripts/ci-reuse-custom-test-fixtures.mjs#L41)
- [src/skills/dough-execute-plan/scripts/ci-reuse-journey-test-fixtures.mjs:131](../../src/skills/dough-execute-plan/scripts/ci-reuse-journey-test-fixtures.mjs#L131)
- [src/skills/dough-execute-plan/scripts/ci-reuse-policy.test.mjs:5](../../src/skills/dough-execute-plan/scripts/ci-reuse-policy.test.mjs#L5), [18](../../src/skills/dough-execute-plan/scripts/ci-reuse-policy.test.mjs#L18), [102](../../src/skills/dough-execute-plan/scripts/ci-reuse-policy.test.mjs#L102), [119](../../src/skills/dough-execute-plan/scripts/ci-reuse-policy.test.mjs#L119)
- [src/skills/dough-execute-plan/scripts/ci-revision-coverage-ignored-only-failure.test.mjs:112](../../src/skills/dough-execute-plan/scripts/ci-revision-coverage-ignored-only-failure.test.mjs#L112), [121](../../src/skills/dough-execute-plan/scripts/ci-revision-coverage-ignored-only-failure.test.mjs#L121)
- [src/skills/dough-execute-plan/scripts/ci-revision-coverage-late-github-failure-test-fixtures.mjs:57](../../src/skills/dough-execute-plan/scripts/ci-revision-coverage-late-github-failure-test-fixtures.mjs#L57)
- [src/skills/dough-execute-plan/scripts/ci-revision-coverage-late-github-failure.test.mjs:37](../../src/skills/dough-execute-plan/scripts/ci-revision-coverage-late-github-failure.test.mjs#L37), [57](../../src/skills/dough-execute-plan/scripts/ci-revision-coverage-late-github-failure.test.mjs#L57), [58](../../src/skills/dough-execute-plan/scripts/ci-revision-coverage-late-github-failure.test.mjs#L58), [59](../../src/skills/dough-execute-plan/scripts/ci-revision-coverage-late-github-failure.test.mjs#L59), [60](../../src/skills/dough-execute-plan/scripts/ci-revision-coverage-late-github-failure.test.mjs#L60), [117](../../src/skills/dough-execute-plan/scripts/ci-revision-coverage-late-github-failure.test.mjs#L117), [153](../../src/skills/dough-execute-plan/scripts/ci-revision-coverage-late-github-failure.test.mjs#L153)
- [src/skills/dough-execute-plan/scripts/ci-revision-coverage-not-required-shutdown.test.mjs:67](../../src/skills/dough-execute-plan/scripts/ci-revision-coverage-not-required-shutdown.test.mjs#L67)
- [src/skills/dough-execute-plan/scripts/ci-revision-coverage-not-required.test.mjs:200](../../src/skills/dough-execute-plan/scripts/ci-revision-coverage-not-required.test.mjs#L200)
- [src/skills/dough-execute-plan/scripts/ci-target-branch-worktree.test.mjs:87](../../src/skills/dough-execute-plan/scripts/ci-target-branch-worktree.test.mjs#L87), [93](../../src/skills/dough-execute-plan/scripts/ci-target-branch-worktree.test.mjs#L93), [99](../../src/skills/dough-execute-plan/scripts/ci-target-branch-worktree.test.mjs#L99), [106](../../src/skills/dough-execute-plan/scripts/ci-target-branch-worktree.test.mjs#L106)

Provider run or custom adapter attempt assembled for closure.

- [src/skills/dough-story-wrap-up/scripts/trunk-closure-observer-selection-test-fixtures.mjs:56](../../src/skills/dough-story-wrap-up/scripts/trunk-closure-observer-selection-test-fixtures.mjs#L56)
- [src/skills/dough-story-wrap-up/scripts/trunk-closure-test-fixtures.mjs:125](../../src/skills/dough-story-wrap-up/scripts/trunk-closure-test-fixtures.mjs#L125)

Inline run or adapter identity.

- [tests/support/dashboard-later-trunk-fixture.mjs:79](../../tests/support/dashboard-later-trunk-fixture.mjs#L79)
- [tests/support/dashboard-story-branch-ci-adapter.test.mjs:194](../../tests/support/dashboard-story-branch-ci-adapter.test.mjs#L194)

## CI comparison, landed history and proof answers

Build retained builds and comparison endpoints as well as their proof contents. A shared proof entry inside a handcrafted answer still leaves the answer shape duplicated. Keep real collector output and deliberately invalid wire inputs explicit.

Inline proof subject, comparison response, or recorded-build input.

- [dashboard/backend-tests/intent/ci-comparison-client-eligibility.spec.ts:67](../../dashboard/backend-tests/intent/ci-comparison-client-eligibility.spec.ts#L67)
- [dashboard/backend-tests/intent/ci-comparison-client-identity.spec.ts:21](../../dashboard/backend-tests/intent/ci-comparison-client-identity.spec.ts#L21)
- [dashboard/backend-tests/intent/ci-comparison-finality-unanswered.spec.ts:42](../../dashboard/backend-tests/intent/ci-comparison-finality-unanswered.spec.ts#L42)
- [dashboard/backend-tests/intent/ci-done-wall-reference.spec.ts:56](../../dashboard/backend-tests/intent/ci-done-wall-reference.spec.ts#L56)
- [dashboard/backend-tests/intent/ci-prior-build-revision-order.spec.ts:50](../../dashboard/backend-tests/intent/ci-prior-build-revision-order.spec.ts#L50)
- [dashboard/backend-tests/intent/ci-proof-memory-adapter-gaps.spec.ts:12](../../dashboard/backend-tests/intent/ci-proof-memory-adapter-gaps.spec.ts#L12)
- [dashboard/backend-tests/intent/ci-proof-memory-adapter.spec.ts:13](../../dashboard/backend-tests/intent/ci-proof-memory-adapter.spec.ts#L13), [133](../../dashboard/backend-tests/intent/ci-proof-memory-adapter.spec.ts#L133)
- [dashboard/backend-tests/intent/landed-ci-proof-collection.spec.ts:75](../../dashboard/backend-tests/intent/landed-ci-proof-collection.spec.ts#L75)
- [dashboard/backend-tests/intent/landed-ci-scope-pending-order.spec.ts:99](../../dashboard/backend-tests/intent/landed-ci-scope-pending-order.spec.ts#L99)
- [dashboard/backend-tests/intent/landed-ci-scope-retained-window.spec.ts:97](../../dashboard/backend-tests/intent/landed-ci-scope-retained-window.spec.ts#L97)
- [dashboard/backend-tests/support/ciProofMemory.ts:12](../../dashboard/backend-tests/support/ciProofMemory.ts#L12)

Retained build or adapter-attempt facts assembled beside a history builder.

- [dashboard/backend-tests/intent/landed-ci-attempt-start-adapter.spec.ts:55](../../dashboard/backend-tests/intent/landed-ci-attempt-start-adapter.spec.ts#L55), [59](../../dashboard/backend-tests/intent/landed-ci-attempt-start-adapter.spec.ts#L59)
- [dashboard/backend-tests/intent/landed-ci-repeat-reconciliation.spec.ts:127](../../dashboard/backend-tests/intent/landed-ci-repeat-reconciliation.spec.ts#L127)

Inline retained build passed to the history builder.

- [dashboard/backend-tests/intent/landed-ci-attempt-start.spec.ts:90](../../dashboard/backend-tests/intent/landed-ci-attempt-start.spec.ts#L90)
- [dashboard/backend-tests/intent/landed-ci-scope-legacy-gap.spec.ts:115](../../dashboard/backend-tests/intent/landed-ci-scope-legacy-gap.spec.ts#L115), [124](../../dashboard/backend-tests/intent/landed-ci-scope-legacy-gap.spec.ts#L124)
- [tests/support/ci-attempt-wall-time-basis.test.mjs:59](../../tests/support/ci-attempt-wall-time-basis.test.mjs#L59)
- [tests/support/ci-follow-up-ledger.test.mjs:171](../../tests/support/ci-follow-up-ledger.test.mjs#L171)
- [tests/support/ci-prior-build-boundaries.test.mjs:20](../../tests/support/ci-prior-build-boundaries.test.mjs#L20)
- [tests/support/intent-ci-scope-history-cohort.test.mjs:18](../../tests/support/intent-ci-scope-history-cohort.test.mjs#L18), [88](../../tests/support/intent-ci-scope-history-cohort.test.mjs#L88), [97](../../tests/support/intent-ci-scope-history-cohort.test.mjs#L97), [106](../../tests/support/intent-ci-scope-history-cohort.test.mjs#L106)
- [tests/support/intent-ci-scope-history-gaps.test.mjs:67](../../tests/support/intent-ci-scope-history-gaps.test.mjs#L67), [102](../../tests/support/intent-ci-scope-history-gaps.test.mjs#L102)
- [tests/support/intent-ci-scope-history-links.test.mjs:48](../../tests/support/intent-ci-scope-history-links.test.mjs#L48)
- [tests/support/intent-ci-scope-history-matching.test.mjs:51](../../tests/support/intent-ci-scope-history-matching.test.mjs#L51), [165](../../tests/support/intent-ci-scope-history-matching.test.mjs#L165)
- [tests/support/intent-ci-scope-history-provenance.test.mjs:22](../../tests/support/intent-ci-scope-history-provenance.test.mjs#L22), [109](../../tests/support/intent-ci-scope-history-provenance.test.mjs#L109)
- [tests/support/intent-ci-scope-history-timing.test.mjs:23](../../tests/support/intent-ci-scope-history-timing.test.mjs#L23), [37](../../tests/support/intent-ci-scope-history-timing.test.mjs#L37), [51](../../tests/support/intent-ci-scope-history-timing.test.mjs#L51), [89](../../tests/support/intent-ci-scope-history-timing.test.mjs#L89), [131](../../tests/support/intent-ci-scope-history-timing.test.mjs#L131), [174](../../tests/support/intent-ci-scope-history-timing.test.mjs#L174), [188](../../tests/support/intent-ci-scope-history-timing.test.mjs#L188)
- [tests/support/intent-ci-scope-history.test.mjs:35](../../tests/support/intent-ci-scope-history.test.mjs#L35), [50](../../tests/support/intent-ci-scope-history.test.mjs#L50), [65](../../tests/support/intent-ci-scope-history.test.mjs#L65)
- [tests/support/landed-ci-history-order.test.mjs:44](../../tests/support/landed-ci-history-order.test.mjs#L44), [52](../../tests/support/landed-ci-history-order.test.mjs#L52), [60](../../tests/support/landed-ci-history-order.test.mjs#L60), [201](../../tests/support/landed-ci-history-order.test.mjs#L201), [209](../../tests/support/landed-ci-history-order.test.mjs#L209), [217](../../tests/support/landed-ci-history-order.test.mjs#L217)
- [tests/support/landed-ci-history-proof-versions.test.mjs:45](../../tests/support/landed-ci-history-proof-versions.test.mjs#L45), [52](../../tests/support/landed-ci-history-proof-versions.test.mjs#L52)
- [tests/support/landed-ci-history-reading-order.test.mjs:88](../../tests/support/landed-ci-history-reading-order.test.mjs#L88)

Inline retained build, proof subject, history point, or comparison slot.

- [dashboard/tests/intent/intent-ci-prior-build-average.spec.ts:93](../../dashboard/tests/intent/intent-ci-prior-build-average.spec.ts#L93)
- [dashboard/tests/intent/intent-ci-proof-ancestor.spec.ts:60](../../dashboard/tests/intent/intent-ci-proof-ancestor.spec.ts#L60)
- [dashboard/tests/intent/intent-ci-proof-sources.spec.ts:40](../../dashboard/tests/intent/intent-ci-proof-sources.spec.ts#L40)
- [dashboard/tests/intentCiProofPage.ts:30](../../dashboard/tests/intentCiProofPage.ts#L30)
- [dashboard/tests/support/comparisonMountFacts.ts:26](../../dashboard/tests/support/comparisonMountFacts.ts#L26), [41](../../dashboard/tests/support/comparisonMountFacts.ts#L41), [78](../../dashboard/tests/support/comparisonMountFacts.ts#L78)
- [dashboard/tests/support/comparisonMountSelections.ts:26](../../dashboard/tests/support/comparisonMountSelections.ts#L26), [40](../../dashboard/tests/support/comparisonMountSelections.ts#L40)
- [dashboard/tests/support/doneWallProvenanceHistory.ts:67](../../dashboard/tests/support/doneWallProvenanceHistory.ts#L67)
- [dashboard/tests/support/doneWallReferenceHistory.ts:75](../../dashboard/tests/support/doneWallReferenceHistory.ts#L75)
- [dashboard/tests/support/mountedComparisonFacts.ts:20](../../dashboard/tests/support/mountedComparisonFacts.ts#L20), [33](../../dashboard/tests/support/mountedComparisonFacts.ts#L33), [94](../../dashboard/tests/support/mountedComparisonFacts.ts#L94)
- [dashboard/tests/support/relativeCiComparisonReading.ts:56](../../dashboard/tests/support/relativeCiComparisonReading.ts#L56), [72](../../dashboard/tests/support/relativeCiComparisonReading.ts#L72)
- [dashboard/tests/support/retainedTrunkProofs.ts:60](../../dashboard/tests/support/retainedTrunkProofs.ts#L60)
- [dashboard/tests/support/scopePriorReferenceHistory.ts:101](../../dashboard/tests/support/scopePriorReferenceHistory.ts#L101)
- [dashboard/tests/support/storyCiComparisonEntryProofs.ts:34](../../dashboard/tests/support/storyCiComparisonEntryProofs.ts#L34)

Inline GitHub or adapter proof subject used by valid proof cases.

- [src/skills/dough-test-optimization/scripts/ci-proof-check.test.mjs:14](../../src/skills/dough-test-optimization/scripts/ci-proof-check.test.mjs#L14), [73](../../src/skills/dough-test-optimization/scripts/ci-proof-check.test.mjs#L73)
- [src/skills/dough-test-optimization/scripts/ci-proof-leads-test-fixtures.mjs:41](../../src/skills/dough-test-optimization/scripts/ci-proof-leads-test-fixtures.mjs#L41)
- [src/skills/dough-test-optimization/scripts/ci-proof-leads.test.mjs:189](../../src/skills/dough-test-optimization/scripts/ci-proof-leads.test.mjs#L189)
- [src/skills/dough-test-optimization/scripts/ci-proof-read.test.mjs:26](../../src/skills/dough-test-optimization/scripts/ci-proof-read.test.mjs#L26)
- [src/skills/dough-test-optimization/scripts/ci-proof-test-fixtures.mjs:6](../../src/skills/dough-test-optimization/scripts/ci-proof-test-fixtures.mjs#L6), [14](../../src/skills/dough-test-optimization/scripts/ci-proof-test-fixtures.mjs#L14)

Synthetic original or repeated build used by the follow-up ledger.

- [tests/support/ci-follow-up-ledger.test.mjs:200](../../tests/support/ci-follow-up-ledger.test.mjs#L200), [228](../../tests/support/ci-follow-up-ledger.test.mjs#L228)
- [tests/support/ci-follow-up-policy.test.mjs:38](../../tests/support/ci-follow-up-policy.test.mjs#L38)

Inline retained build or proof identity around canonical proof data.

- [tests/support/dashboard-later-trunk-fixture.mjs:124](../../tests/support/dashboard-later-trunk-fixture.mjs#L124)
- [tests/support/dashboard-later-trunk-landed.test.mjs:137](../../tests/support/dashboard-later-trunk-landed.test.mjs#L137)
- [tests/support/intent-ci-scope-history-links.test.mjs:20](../../tests/support/intent-ci-scope-history-links.test.mjs#L20), [89](../../tests/support/intent-ci-scope-history-links.test.mjs#L89)
- [tests/support/intent-ci-scope-history-units.test.mjs:61](../../tests/support/intent-ci-scope-history-units.test.mjs#L61), [177](../../tests/support/intent-ci-scope-history-units.test.mjs#L177)
- [tests/support/landed-ci-history-identity.test.mjs:24](../../tests/support/landed-ci-history-identity.test.mjs#L24), [97](../../tests/support/landed-ci-history-identity.test.mjs#L97), [154](../../tests/support/landed-ci-history-identity.test.mjs#L154)
- [tests/support/landed-ci-history-reading-order.test.mjs:75](../../tests/support/landed-ci-history-reading-order.test.mjs#L75)
