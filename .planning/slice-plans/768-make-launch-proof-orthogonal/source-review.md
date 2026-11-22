# Source review: SEED-413#make-launch-proof-orthogonal

Launch: fresh general-purpose sub-agent, no conversation inheritance, on
2026-11-22 after the developer narrowed the story at the delivered Slice 6
boundary. Input: the narrowed story's Goal, Scope, Key examples and Baseline
verbatim from
`.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#make-launch-proof-orthogonal`,
plus the referenced "Acceptance shared by the eight stories" verbatim. No
plan, product, proof or slice scope was supplied. It replaces the review of
the original eight-second story (ids P1–P23, recoverable from history).

Unnumbered context returned: the owned spec list; the delivery deferral of
note attachment, unattached startup, attachments, record details, the
whole-selection eight-second measurement and the hand-built launches
composites to SEED-413#finish-launch-proof-orthogonal; the recorded
baselines; the one-minute campaign target owned by the final story; separate
owners for the timing follow-up, the renamed-diff correction and remaining
legacy cases; guidance and consolidation techniques as means, not promises.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| R1 | The reshaped launch families give faster feedback than their starting files, compared by paired runs under similar load at two workers, recording elapsed time including preparation, counts by engine and destination, and remaining slow cases. | slice 6 | observed: Interleaved pair of the 16 starting files at 0a6217aeb (baseline worktree) vs the 17 reshaped files at 840788d00, two workers, load 13→16: before 29.02 s and 26.01 s wall, after 21.40 s and 21.68 s; 53→52 cases, all on Vitest chromium (story-card-startup and story-card-launch-offers on chromium-desktop); slowest remaining: story-card-launch-offers:135 2.4 s, launch-refinement-options:132 2.2 s, mounted-instruction-voice:12 2.1 s, ad-hoc-refinement-touch:37 2.1 s, ad-hoc-launch-dialog:94 2.0 s; evidence s6-family-pair.log, s6-family-slow.log; per-family pairs in PLAN.md mappings |
| R2 | Fewer maintained cases, with reasons for each consolidation or kept repetition. | slice 6 | observed: 53→52 cases across the reshaped families (s6-family-pair.log); per-slice mappings in PLAN.md give each consolidation and kept repetition with its reason (Slices 1, 2, 4 consolidated; Slices 2, 3, 6 added owner cases) |
| R3 | Each in-scope case is arranged at its smallest production owner through the typed entry and inputs production uses; no test copy of a production composition, provider stack or private pipeline call; added reads are required typed sources; production narrows owners where needed. |  | G5 |
| R4 | Each case depends only on what can change its result; independent dimensions are separate and combinations stay only where they change the result. | slice 6 | observed: PLAN.md Slice 1–6 mappings: dimensions split into direct rule cases (fitTranscript, launchSettingsBlocked), typed-owner cases (TranscriptReview, StartupStatus, StartupRecovery) and one composed case per distinct race |
| R5 | Every removed observation is mapped before deletion to a retained case that fails for the same regression; wording, accessibility and error/retry boundaries stay proved where they are the proof. | slice 6 | observed: PLAN.md retired→retained mappings per slice with obligations G2, G3, G4 closing found losses |
| R6 | Viewport, zoom, touch, pointer, native input and focus stay proved in headless Chromium. | slice 6 | observed: zoomToTwoHundredPercent waits for devicePixelRatio 2 (G1); ad-hoc-refinement-touch constrained-height case; chromium-desktop retained for fine-pointer cases (Slice 5 mapping); evidence s6-family-pair.log |
| R7 | Capture and recovery races stay proved. | slice 6 | observed: mounted-instruction-voice held reply and late permission races; startup-recovery-reads lost acknowledgment and unanswered evidence races; startup-recovery acceptance focus race; evidence s4-refactor-specs.log, s6-paired-3.log |
| R8 | The existing composed, native, install and backend journeys stay at their owners, and the backend and E2E groups keep their runner and coverage. | slice 6 | observed: backend agent-launch-model-boundary.spec.ts:123 (s2-backend-effort-proof.json); E2E session-instruction-voice.spec.ts:165 (s3-e2e-proof.json); built-app StartupRecovery consumers (s6-e2e-proof.json, s6-quiet-proof.json); no runner configuration changed |
| R9 | No E2E case is added. | slice 6 | observed: git diff 0a6217aeb..HEAD -- e2e is empty |
| R10 | In-scope checks run on plain Vitest, with React `act` and `IS_REACT_ACT_ENVIRONMENT` retired and cases waiting on observed results. | slice 6 | observed: git grep finds no act( or IS_REACT_ACT_ENVIRONMENT under dashboard/frontend-tests/launches; all launch cases run on Vitest browser mode |
| R11 | Support whose last consumer moved is removed and the shared test-support surface shrinks. |  | G6 |
| R12 | Dense layout: every option selected is checked at each viewport where layout differs from one selection; geometry cases no longer reselect. | slice 1 | observed: PLAN.md Slice 1 mapping; ad-hoc-launch-dialog.spec.ts dense case (one selection, stacked at 320 px, beside at verified 200%) and ad-hoc-start-session-layout.spec.ts merged offered/unavailable cases; evidence s1-after-four-2.log, s1-refactor-zoom-2.log |
| R13 | Dense layout: one case proves option-to-command mapping. | slice 1 | observed: ad-hoc-launch-dialog.spec.ts "with every option selected, Command details list every flag…" all-flags check; evidence s1-refactor-zoom-2.log |
| R14 | Dense layout: one case proves native tab order. | slice 1 | observed: ad-hoc-launch-dialog.spec.ts "the instruction comes first, tabs in order…" followsTabOrder; Start session tab-order case unchanged; evidence s1-after-four-2.log |
| R15 | Shared reset: selecting model and effort then dismissing resets the shared dialog model, proved once at the dialog. | slice 2 | observed: launch-model-effort.spec.ts "dismissing with Cancel or Escape resets the chosen model and effort when the dialog opens again"; evidence s2-refactor-specs.log |
| R16 | Each launcher keeps only its own launch and focus handoff. | slice 2 | observed: launch-model-effort.spec.ts per-launcher dismissal and focus cases (story card execution/refinement, Start session); evidence s2-refactor-specs.log, s2-after.log |
| R17 | Host-specific effort rules are checked without reopening three launchers. | slice 2 | observed: launch-native-effort.spec.ts Cursor rule at launchSettingsBlocked and Codex cases on one mounted catalog dialog; backend reread agent-launch-model-boundary.spec.ts:123 (s2-backend-effort-proof.json) |
| R18 | An over-limit and an exactly 4,000-character transcript are fed as text to the owner of overflow, editing and discard, in the `transcript-review` spec. | slice 3 | observed: transcript-review.spec.ts fit-rule case (exactly 4,000 with separator, one over, well over) and TranscriptReview text cases; E2E session-instruction-voice.spec.ts:165 (s3-e2e-proof.json) |
| R19 | Native recording is used only for, and still proves, a held reply, late permission, track loss and capture failures. | slice 4 | observed: mounted-instruction-voice.spec.ts held reply, late permission and track loss cases; mounted-instruction-voice-capture-failures.spec.ts permission and device/format cases; overflow spec keeps two composed review cases; evidence s4-refactor-specs.log |
| R20 | Story card startup presentation is proved from its typed status. | slice 5 | observed: story-card-startup.spec.ts typed StartupStatus case over 8 host/workflow/establishing rows; evidence s5-refactor-focused-1.log |
| R21 | Startup recovery is proved from its typed attempt and read. | slice 6 | observed: startup-recovery.spec.ts direct cases from typed StartupRecoveryItem (aStartupRecoveryItem) and AttemptEvidence at StartupRecovery; evidence s6-refactor-1.log, s6-paired-3.log |
| R22 | One representative keyboard launch-to-focus journey remains mounted. | slice 5 | observed: responsive-story-startup.spec.ts "a keyboard start protects the selected story, announces each transition once…" with StartupAnnouncer log [progress, waiting, reconciled]; evidence s5-final-1.log |
