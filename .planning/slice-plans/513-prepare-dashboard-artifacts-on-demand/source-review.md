# Source-only review

The fresh `/root/source_review` agent launched without conversation inheritance.
Its input was the Goal, Scope (including exclusions), and five Key examples of
[the selected story](../../seeds/SEED-262-faster-dashboard-test-feedback.md#prepare-artifacts-on-demand)
at the established start. The launch instructed the reviewer to use only
that text, read no other files, and make no changes.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G01 | Focused dashboard tests give developers faster feedback. | slice 3 | observed: Final comparison and repeat in Slice 3 proof: focused in-process, frontend and filtered installed starts are faster with the same strict cases |
| G02 | The run prepares the app build only when a selected case uses it. | slice 1 | observed: globalSetup.ts app producer, runArtifacts.ts request path, and Slice 1 in-process/DOM/frontend/mixed traces |
| G03 | The run prepares the server bundle only when a selected case uses it. | slice 2 | observed: globalSetup.ts registers the bundle; dashboardServer.ts acquires it at preview or boundary start; Slice 2 no-demand and bundle traces |
| G04 | The run prepares only the installed-start origins its selected cases use. | slice 3 | observed: Filtered and whole start-origin-isolation traces request only the selected layout keys, each completed once |
| G05 | The developer runs the same Playwright command. | slice 3 | observed: Eager baseline and final comparison use the same npm run test:dashboard entry, reporter, selection and two workers |
| G06 | The selected cases provide the same proof. | slice 3 | observed: Matching quiet proof records preserve 3, 2, 13 and 1 passing attempts and whole installed isolation preserves source, private copies and failures |
| S01 | Demand can originate in the fixture that needs the artifact. | slice 3 | observed: frontendApp.ts fixture requests at static-server first use, observed in startup-host-words trace |
| S02 | Demand can originate in the operation that needs the artifact. S01 and S02 are alternatives for placing demand at the point of need. | slice 3 | observed: initializeStartOrigin requests a layout immediately before copying, observed in start-origin-isolation and origins.proof.ts |
| S03 | The production app build and existing server bundle remain separate artifacts. | slice 2 | observed: Slice 2 boundary and static-frontend proofs trace different keys and the mixed run completes both once |
| S04 | An installed-start origin uses the selected installation layout. | slice 3 | observed: startOriginPreparation.ts maps Claude to its own key and Codex/Cursor to a shared key, confirmed by the whole and filtered traces |
| S05 | Workers in the same run safely share each completed artifact. | slice 3 | observed: dashboard-artifact-demand.spec.ts app and bundle gates show two actual worker PIDs with the same completed output; installed starts share the same layout completion |
| S06 | Shared artifacts come from the current checkout. | slice 3 | observed: dashboardBuild.ts and serverBundle.ts use repoRoot, and start-origin-isolation exercises changed working-tree source and current fallback copies |
| S07 | Artifact cleanup is scoped to the run’s own artifacts. | slice 3 | observed: start-origin-demand.spec.ts compares distinct roots and leaves the completed Claude root usable after Codex failure; nested app failure and interruption preserve the outer run path |
| S08 | The run removes its artifacts after success. | slice 3 | observed: Final comparison traces and whole origin proof verify each recorded completed output removed at run exit |
| S09 | The run removes its artifacts after failure. | slice 3 | observed: Nested app, Rolldown and real Codex failure proofs verify incomplete output removed and never served |
| S10 | The run removes its artifacts after graceful interruption. | slice 3 | observed: dashboard-artifact-demand.spec.ts signals the actual runner with SIGINT and observes both Vite PID and partial output gone |
| S11 | Mutable Git copies remain private. | slice 3 | observed: start-origin-isolation.spec.ts verifies independent Git packs, refs, writes, HOME and later Git fsck |
| S12 | Preserve the actual preview entry point. | slice 2 | observed: serving-modes.spec.ts compares actual preview replies and the bundled Cursor argv with real source-dev |
| S13 | Preserve the actual boundary entry point. | slice 2 | observed: boundary-server.spec.ts inspects the running Node and Cursor argv and sees boundary-only HTTP behavior |
| S14 | Preserve deliberate fixture overrides. | slice 3 | observed: start-origin-isolation.spec.ts exercises explicit prepared source, missing and corrupt override and ownerless fallback; Slice 1 preserves private and explicit preview paths |
| S15 | A failed producer surfaces its error. | slice 3 | observed: Nested Vite, Rolldown and Git failure cases assert the specific producer error at the consuming boundary |
| S16 | A failed producer leaves no partial output available to consumers. | slice 3 | observed: Both nested app/bundle waiters report no directory on failure; the installed Codex clone rejection removes its failed root before continuing |
| S17 | Preserve run-level process cleanup. | slice 3 | observed: run-processes.spec.ts explicit inner setup still ends and names an otherwise unreachable process after worker exit |
| S18 | Preserve synthetic GitHub isolation. | slice 3 | observed: authenticated-read-owner-failures and installed-wrapper proof retained synthetic GitHub isolation; globalSetup still installs and rejects access to its ownerless root |
| S19 | Preserve the run’s admission rules. | slice 3 | observed: Local admission proof includes native Playwright config sharing admission, unfiltered selection, nested ancestry, and failure and signal release |
| S20 | This story owns when a run prepares its shared Git copies. | slice 3 | observed: initializeStartOrigin takes the run layout at first copy while prepareStartOrigin keeps the existing private origin and Git setup |
| L01 | Faster build production is outside scope. | slice 1 | observed: dashboardBuild.ts invokes the existing npm run build:dashboard command with its explicit outDir |
| L02 | Faster Git production is outside scope. | slice 3 | observed: prepareStartOrigin keeps Git init, real commit, no-local bare pack and maintenance configuration; the change controls when the work runs |
| L03 | Splitting the server bundle into entries is outside scope. | slice 2 | observed: serverBundle.ts still invokes Rolldown for the same Vite config, boundary, and Cursor entries under one key |
| L04 | Artifact persistence across runs is outside scope. | slice 3 | observed: globalSetup and runArtifacts remove per-run prepared paths, and installed isolation confirms successive current-source preparations |
| L05 | Per-test fixture speed is outside scope. | slice 3 | observed: initializeStartOrigin still makes the private origin copy and no-hardlinks checkout with independent origin refs |
| L06 | The MakeMe migration owns the Git descriptions. | slice 3 | observed: The installed producer still uses existing queuedStories and working-tree skills; separate MakeMe description migration remains queued on trunk |
| E1.01 | The developer selects the three in-process session count cases. | slice 3 | observed: Matching session-working-count-rule selection contains precisely three in-process cases |
| E1.02 | All three selected cases pass. | slice 3 | observed: Final in-process quiet proof has three selected, passing attempts |
| E1.03 | The run invokes the app-build producer zero times. | slice 1 | observed: Slice 1 in-process quiet proof selects the three session-working-count-rule cases with no artifact trace |
| E1.04 | The run invokes the server-bundle producer zero times. | slice 2 | observed: Slice 2 no-preview proof selects all three session-working-count-rule cases and traces only the app from the frontend cases |
| E1.05 | The run invokes the installed-start origin producer zero times. | slice 3 | observed: Final in-process selection has no artifact trace |
| E2.01 | One frontend journey serves the built app. | slice 1 | observed: frontendApp.ts starts the static built app for startup-host-words.spec.ts, whose startup host and phase assertions passed |
| E2.02 | That journey uses stubbed boundary replies. | slice 1 | observed: frontendApp.ts installs the observation, project and startup reply routes for startup-host-words.spec.ts, which observes their rendered content |
| E2.03 | That journey uses one production app build. | slice 1 | observed: Slice 1 frontend proof trace has one app start and one completion for both frontend cases |
| E2.04 | That journey requires zero server bundles. | slice 2 | observed: Slice 2 no-preview proof selects both startup-host-words cases and traces the app without a server-bundle request |
| E2.05 | That journey requires zero installed-start origins. | slice 3 | observed: Final startup-host-words trace completes only the app key |
| E2.06 | A separate frontend case uses only page content. | slice 1 | observed: frontend-tests/observation-measurements.spec.ts calls page.setContent for the measurement cases |
| E2.07 | The page-content case requires zero app builds. | slice 1 | observed: Slice 1 DOM-only proof has four passing attempts and no app request |
| E2.08 | The page-content case requires zero server bundles. | slice 2 | observed: Slice 2 exact frontend observation-measurements proof has four DOM-only passes and no artifact trace |
| E2.09 | The page-content case requires zero installed-start origins. | slice 3 | observed: Final exact frontend observation-measurements selection passes four cases with no artifact trace |
| E3.01 | A boundary-only selection starts the real bundled Node entry. | slice 2 | observed: boundary-server.spec.ts observes the actual running Node command using boundaryServer.mjs from the completed bundle |
| E3.02 | The boundary-only selection requires zero app builds. | slice 2 | observed: Slice 2 boundary proof has two passing cases and one bundle completion without an app request |
| E3.03 | Adding preview to the boundary selection is one mixed-selection example. | slice 2 | observed: Slice 2 mixed proof selects boundary-server and serving-modes preview cases and observes both producer keys |
| E3.04 | Adding the attention journey to the boundary selection is the other mixed-selection example. | slice 2 | observed: Slice 2 mixed proof also selects both integrated agent-launch-attention cases with real preview |
| E3.05 | The mixed selection gets the app build once across workers. | slice 1 | observed: Slice 1 mixed proof includes serving-modes preview and agent-launch-attention plus frontend startup, with one app completion |
| E3.06 | The mixed selection gets the server bundle once across workers. | slice 2 | observed: Slice 2 mixed trace completes server-bundle once, and nested proof holds real Rolldown while both workers request that same directory |
| E3.07 | For a source-dev case, loading preview-capable helpers alone creates no app-build demand. | slice 1 | observed: frame-board-look.spec.ts source-dev no-project case passed without artifact trace despite passing the shared preview build resolver |
| E3.08 | For a source-dev case, loading preview-capable helpers alone creates no server-bundle demand. | slice 2 | observed: Slice 2 source-dev frame-board case imports the preview-capable fixture, passes its no-project assertion, and writes no artifact trace |
| E3.09 | For an in-process case, loading preview-capable helpers alone creates no app-build demand. | slice 1 | observed: host-status.spec.ts imports the preview-capable dashboardServer helper and its in-process CPU usage case passed without any app request |
| E3.10 | For an in-process case, loading preview-capable helpers alone creates no server-bundle demand. | slice 2 | observed: Slice 2 in-process host-status CPU case imports the preview-capable fixture, passes, and writes no artifact trace |
| E4.01 | The developer filters the installed-start isolation spec to the single case that uses both Codex and Cursor. | slice 3 | observed: Final filtered start-origin-isolation command selects the single concurrent Codex/Cursor case by title |
| E4.02 | Codex and Cursor use the same prepared installation layout. | slice 3 | observed: Filtered trace contains one Codex layout start and completion despite requests from both real start callers |
| E4.03 | Codex and Cursor receive independent Git repositories. | slice 3 | observed: Filtered installed proof compares separate pack inodes, refs and HOME and verifies the later clone with Git fsck |
| E4.04 | Filtering out the Claude cases leaves their layout unprepared. | slice 3 | observed: Filtered trace completes only start-origin-codex with no Claude request |
| E4.05 | The selected case produces zero app builds. | slice 3 | observed: Filtered trace has no app request |
| E4.06 | The selected case produces zero server bundles. | slice 3 | observed: Filtered trace has no server-bundle request |
| E5.01 | Two workers first need the same artifact while its producer is still making it. | slice 1 | observed: dashboard-artifact-demand.spec.ts holds the actual Vite child at the gate and observes two requests, one start, and zero completions |
| E5.02 | If the producer succeeds, both workers receive the same completed output. | slice 1 | observed: dashboard-artifact-demand.spec.ts complete case observes two worker PIDs serving HTML and recording the same completed directory |
| E5.03 | If the producer fails, both workers see the producer’s failure. | slice 1 | observed: dashboard-artifact-demand.spec.ts fail case observes both workers receiving the same original build error with no artifact directory |
| E5.04 | After run failure, cleanup leaves the other run’s outputs alone. | slice 3 | observed: dashboard-artifact-demand.spec.ts app failure compares distinct paths, removes the nested path and confirms the outer real app unchanged |
| E5.05 | After run failure, cleanup leaves `dashboard/dist` alone. | slice 3 | observed: dashboard-artifact-demand.spec.ts app failure compares dashboard/dist fingerprint before and after nested cleanup |
| E5.06 | After graceful interruption, cleanup leaves the other run’s outputs alone. | slice 3 | observed: dashboard-artifact-demand.spec.ts SIGINT removes the nested path and confirms the distinct outer real app unchanged |
| E5.07 | After graceful interruption, cleanup leaves `dashboard/dist` alone. | slice 3 | observed: dashboard-artifact-demand.spec.ts SIGINT compares dashboard/dist fingerprint before and after nested cleanup |
