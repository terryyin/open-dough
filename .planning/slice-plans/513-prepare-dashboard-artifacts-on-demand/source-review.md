# Source-only review

The fresh `/root/source_review` agent launched without conversation inheritance.
Its input was the Goal, Scope (including exclusions), and five Key examples of
[the selected story](../../seeds/SEED-262-faster-dashboard-test-feedback.md#prepare-artifacts-on-demand)
at the established start. The launch instructed the reviewer to use only
that text, read no other files, and make no changes.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G01 | Focused dashboard tests give developers faster feedback. | slice 3 | |
| G02 | The run prepares the app build only when a selected case uses it. | slice 1 | observed: globalSetup.ts app producer, runArtifacts.ts request path, and Slice 1 in-process/DOM/frontend/mixed traces |
| G03 | The run prepares the server bundle only when a selected case uses it. | slice 2 | |
| G04 | The run prepares only the installed-start origins its selected cases use. | slice 3 | |
| G05 | The developer runs the same Playwright command. | slice 3 | |
| G06 | The selected cases provide the same proof. | slice 3 | |
| S01 | Demand can originate in the fixture that needs the artifact. | slice 3 | |
| S02 | Demand can originate in the operation that needs the artifact. S01 and S02 are alternatives for placing demand at the point of need. | slice 3 | |
| S03 | The production app build and existing server bundle remain separate artifacts. | slice 2 | |
| S04 | An installed-start origin uses the selected installation layout. | slice 3 | |
| S05 | Workers in the same run safely share each completed artifact. | slice 3 | |
| S06 | Shared artifacts come from the current checkout. | slice 3 | |
| S07 | Artifact cleanup is scoped to the run’s own artifacts. | slice 3 | |
| S08 | The run removes its artifacts after success. | slice 3 | |
| S09 | The run removes its artifacts after failure. | slice 3 | |
| S10 | The run removes its artifacts after graceful interruption. | slice 3 | |
| S11 | Mutable Git copies remain private. | slice 3 | |
| S12 | Preserve the actual preview entry point. | slice 2 | |
| S13 | Preserve the actual boundary entry point. | slice 2 | |
| S14 | Preserve deliberate fixture overrides. | slice 3 | |
| S15 | A failed producer surfaces its error. | slice 3 | |
| S16 | A failed producer leaves no partial output available to consumers. | slice 3 | |
| S17 | Preserve run-level process cleanup. | slice 3 | |
| S18 | Preserve synthetic GitHub isolation. | slice 3 | |
| S19 | Preserve the run’s admission rules. | slice 3 | |
| S20 | This story owns when a run prepares its shared Git copies. | slice 3 | |
| L01 | Faster build production is outside scope. | slice 1 | observed: dashboardBuild.ts invokes the existing npm run build:dashboard command with its explicit outDir |
| L02 | Faster Git production is outside scope. | slice 3 | |
| L03 | Splitting the server bundle into entries is outside scope. | slice 2 | |
| L04 | Artifact persistence across runs is outside scope. | slice 3 | |
| L05 | Per-test fixture speed is outside scope. | slice 3 | |
| L06 | The MakeMe migration owns the Git descriptions. | slice 3 | |
| E1.01 | The developer selects the three in-process session count cases. | slice 3 | |
| E1.02 | All three selected cases pass. | slice 3 | |
| E1.03 | The run invokes the app-build producer zero times. | slice 1 | observed: Slice 1 in-process quiet proof selects the three session-working-count-rule cases with no artifact trace |
| E1.04 | The run invokes the server-bundle producer zero times. | slice 2 | |
| E1.05 | The run invokes the installed-start origin producer zero times. | slice 3 | |
| E2.01 | One frontend journey serves the built app. | slice 1 | observed: frontendApp.ts starts the static built app for startup-host-words.spec.ts, whose startup host and phase assertions passed |
| E2.02 | That journey uses stubbed boundary replies. | slice 1 | observed: frontendApp.ts installs the observation, project and startup reply routes for startup-host-words.spec.ts, which observes their rendered content |
| E2.03 | That journey uses one production app build. | slice 1 | observed: Slice 1 frontend proof trace has one app start and one completion for both frontend cases |
| E2.04 | That journey requires zero server bundles. | slice 2 | |
| E2.05 | That journey requires zero installed-start origins. | slice 3 | |
| E2.06 | A separate frontend case uses only page content. | slice 1 | observed: frontend-tests/observation-measurements.spec.ts calls page.setContent for the measurement cases |
| E2.07 | The page-content case requires zero app builds. | slice 1 | observed: Slice 1 DOM-only proof has four passing attempts and no app request |
| E2.08 | The page-content case requires zero server bundles. | slice 2 | |
| E2.09 | The page-content case requires zero installed-start origins. | slice 3 | |
| E3.01 | A boundary-only selection starts the real bundled Node entry. | slice 2 | |
| E3.02 | The boundary-only selection requires zero app builds. | slice 2 | |
| E3.03 | Adding preview to the boundary selection is one mixed-selection example. | slice 2 | |
| E3.04 | Adding the attention journey to the boundary selection is the other mixed-selection example. | slice 2 | |
| E3.05 | The mixed selection gets the app build once across workers. | slice 1 | observed: Slice 1 mixed proof includes serving-modes preview and agent-launch-attention plus frontend startup, with one app completion |
| E3.06 | The mixed selection gets the server bundle once across workers. | slice 2 | |
| E3.07 | For a source-dev case, loading preview-capable helpers alone creates no app-build demand. | slice 1 | observed: frame-board-look.spec.ts source-dev no-project case passed without artifact trace despite passing the shared preview build resolver |
| E3.08 | For a source-dev case, loading preview-capable helpers alone creates no server-bundle demand. | slice 2 | |
| E3.09 | For an in-process case, loading preview-capable helpers alone creates no app-build demand. | slice 1 | observed: host-status.spec.ts imports the preview-capable dashboardServer helper and its in-process CPU usage case passed without any app request |
| E3.10 | For an in-process case, loading preview-capable helpers alone creates no server-bundle demand. | slice 2 | |
| E4.01 | The developer filters the installed-start isolation spec to the single case that uses both Codex and Cursor. | slice 3 | |
| E4.02 | Codex and Cursor use the same prepared installation layout. | slice 3 | |
| E4.03 | Codex and Cursor receive independent Git repositories. | slice 3 | |
| E4.04 | Filtering out the Claude cases leaves their layout unprepared. | slice 3 | |
| E4.05 | The selected case produces zero app builds. | slice 3 | |
| E4.06 | The selected case produces zero server bundles. | slice 3 | |
| E5.01 | Two workers first need the same artifact while its producer is still making it. | slice 1 | observed: dashboard-artifact-demand.spec.ts holds the actual Vite child at the gate and observes two requests, one start, and zero completions |
| E5.02 | If the producer succeeds, both workers receive the same completed output. | slice 1 | observed: dashboard-artifact-demand.spec.ts complete case observes two worker PIDs serving HTML and recording the same completed directory |
| E5.03 | If the producer fails, both workers see the producer’s failure. | slice 1 | observed: dashboard-artifact-demand.spec.ts fail case observes both workers receiving the same original build error with no artifact directory |
| E5.04 | After run failure, cleanup leaves the other run’s outputs alone. | slice 3 | |
| E5.05 | After run failure, cleanup leaves `dashboard/dist` alone. | slice 3 | |
| E5.06 | After graceful interruption, cleanup leaves the other run’s outputs alone. | slice 3 | |
| E5.07 | After graceful interruption, cleanup leaves `dashboard/dist` alone. | slice 3 | |
