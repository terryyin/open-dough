# Source-only review

Reviewer: `/root/source_review`, fresh `fork_turns: none` general-purpose agent.
Launch and original input: conversation `collaboration.spawn_agent` call named
`source_review` on 2026-11-10. It supplied only the original selected story Goal,
Scope, restrictions, exclusions, safe stopping, and key examples, with instructions
to read no files and change nothing. The returned decomposition below is retained
verbatim per numbered item; allocation is the coordinator’s subsequent mapping.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Local parallel runs and hosted CI give maintainers and agents the same dashboard suite result. | slice 6 | |
| C02 | The scoped dashboard journeys finish with margin inside the default 30 s case budget. | slice 6 | |
| C03 | Their observations finish with margin inside their 5 s budgets. | slice 6 | |
| C04 | Each temporary case-local allowance is removed after its case fits the default with margin. | slice 6 | |
| C05 | Every distinct behavioral promise survives at an observable boundary. | slice 6 | |
| C06 | Surviving proof is established before deleting a test. | slice 6 | |
| C07 | Surviving proof is established before deleting a step. | slice 6 | |
| C08 | Surviving proof is established before deleting an assertion. | slice 6 | |
| C09 | Repeated setup is reduced. | slice 6 | |
| C10 | Redundant proof is reduced. | slice 6 | |
| C11 | The watcher family becomes at least 10 s faster in median elapsed time. | slice 3 | |
| C12 | The comparable local dashboard suite stays within its previous elapsed time. | slice 6 | |
| C13 | The slowest hosted shard stays within its previous elapsed time. | slice 6 | |
| C14 | The failure watcher journey uses one real deployment. | slice 3 | |
| C15 | An unavailable origin leaves C serving. | slice 3 | |
| C16 | Checks resume after the origin returns. | slice 3 | |
| C17 | Failed-candidate proof continues on that same live deployment. | slice 3 | |
| C18 | Failed-restoration proof continues on that same live deployment. | slice 3 | |
| C19 | The real SIGHUP moves to the existing restart journey. | slice 3 | |
| C20 | Its quiet-exit assertions move to that restart journey. | slice 3 | |
| C21 | Its cleanup assertions move to that restart journey. | slice 3 | |
| C22 | The restart journey restarts from current main. | slice 3 | |
| C23 | It serves the expected page. | slice 3 | |
| C24 | It preserves the same runner. | slice 3 | |
| C25 | It preserves the same client. | slice 3 | |
| C26 | It accepts input after restart. | slice 3 | |
| C27 | The active-build SIGTERM proof remains. | slice 3 | |
| C28 | The final SIGINT proof remains. | slice 3 | |
| C29 | Both distinct fatal-preview outcomes remain proved. | slice 3 | |
| C30 | Their cleanup remains proved. | slice 3 | |
| C31 | The relocated check detects a watcher ignoring SIGHUP. | slice 3 | |
| C32 | The restart check detects reuse of the previously served revision. | slice 3 | |
| C33 | The standalone C-reactivation journey is deleted after the required surviving proof is established. | slice 3 | |
| C34 | Its real install is removed. | slice 3 | |
| C35 | Its real build is removed. | slice 3 | |
| C36 | Its real start is removed. | slice 3 | |
| C37 | One full retired-closure journey remains. | slice 4 | |
| C38 | That journey proves real Git worktree retirement. | slice 4 | |
| C39 | It proves installed reporting retry. | slice 4 | |
| C40 | Reporting retry does not repeat Git operations. | slice 4 | |
| C41 | Reporting retry does not repeat native operations. | slice 4 | |
| C42 | It proves visible Done. | slice 4 | |
| C43 | The existing Story Branch Wrap Up journey carries this proof where it can. | slice 4 | |
| C44 | The different Land path remains. | slice 4 | |
| C45 | The different Trunk Wrap Up path remains. | slice 4 | |
| C46 | Recovery proof covers an unavailable receiver. | slice 4 | |
| C47 | Recovery proof covers lost acknowledgement. | slice 4 | |
| C48 | Recovery proof covers failed writes. | slice 4 | |
| C49 | Recovery proof covers concurrent writers. | slice 4 | |
| C50 | Recovery proof covers reserved-receipt isolation. | slice 4 | |
| C51 | Recovery proof covers message recovery after source deletion. | slice 4 | |
| C52 | A stale receipt preserves newer Done across restart. | slice 4 | |
| C53 | A stale receipt preserves manual Done across restart. | slice 4 | |
| C54 | Altered payloads are refused. | slice 4 | |
| C55 | Post-deletion requests are rejected. | slice 4 | |
| C56 | Existing checks proving these recovery promises are identified. | slice 4 | |
| C57 | Missing recovery proof is added at the existing boundary. | slice 4 | |
| C58 | Covered browser steps are then removed. | slice 4 | |
| C59 | History comparison waits for persisted collector results. | slice 2 | |
| C60 | Revisit request counting waits for the first request to finish. | slice 2 | |
| C61 | A story-state check waits for the selected story to render. | slice 2 | |
| C62 | Exact counts remain where avoiding duplicate work is the promise. | slice 2 | |
| C63 | Siblings sharing each affected setup are inspected. | slice 2 | |
| C64 | Landed fixes serve as examples. | slice 2 | |
| C65 | Domain data uses MakeMe. | slice 6 | |
| C66 | Synchronization uses observable events or a controlled clock. | slice 6 | |
| C67 | Existing shard weights are refreshed after work is removed. | slice 6 | |
| C68 | Shard redistribution is measured separately from summed test durations. | slice 6 | |
| C69 | The project default case timeout remains unchanged. | slice 6 | |
| C70 | Shard deadlines remain unchanged. | slice 6 | |
| C71 | These journeys receive no permanent deadline increases. | slice 6 | |
| C72 | Sleeps do not absorb load variance. | slice 6 | |
| C73 | Retries do not absorb load variance. | slice 6 | |
| C74 | Skips do not absorb load variance. | slice 6 | |
| C75 | Permanent CI jobs do not absorb load variance. | slice 6 | |
| C76 | Flaky or environment-dependent timeouts remain defects until stable locally. | slice 6 | |
| C77 | They remain defects until stable in CI. | slice 6 | |
| C78 | Each retained change preserves its proof. | slice 6 | |
| C79 | Each retained change measurably widens the affected cases’ margin. | slice 6 | |
| C80 | Experiments that add cost are dropped. | slice 6 | |
| C81 | Experiments whose proof remains unestablished are dropped. | slice 6 | |
| C82 | Experiments whose speedup remains unestablished are dropped. | slice 6 | |
| Q01 | The specified local pressure is load 20–30 on 2 workers. | slice 6 | |
| Q02 | The hosted comparison includes a shard about 1.5× slower overall. | slice 6 | |
| Q03 | Watcher-family elapsed time includes moved work. | slice 3 | |
| Q04 | Allowance removal is conditional on that particular case fitting the default with margin. | slice 6 | |
| Q05 | Standalone C reactivation is deleted only after the preceding preservation and detection obligations are satisfied. | slice 3 | |
| Q06 | Story Branch Wrap Up reuse is conditional on its ability to carry the required closure proof. | slice 4 | |
| Q07 | Recovery variants belong at the existing real CLI, HTTP, and store boundary; the source does not require every variant independently at all three boundaries. | slice 4 | |
| Q08 | Exact-count preservation applies where avoiding duplicate work is the behavioral promise. | slice 2 | |
| Q09 | Weight refresh uses all 12 artifacts from a complete passing trunk run. | slice 6 | |
| Q10 | The restrictions protect trustworthy gate meaning; omitted examples do not become rejection rules. | slice 6 | |
| Q11 | Other allowances remain outside unless a harness change made by this story must keep those cases green. | slice 6 | |
| Q12 | The remaining-flake exclusion applies once the named journeys fit. | slice 6 | |
| Q13 | “Margin” is required, but the source supplies no additional numerical margin threshold. | slice 6 | |
| Q14 | Observable events and controlled clocks are alternatives, not cumulative requirements. | slice 6 | |
| J01 | Touch review: “chooses a comparison and file and reads within each pane.” | slice 5 | |
| J02 | First-in-worker preparation cost. | slice 6 | |
| J03 | `agent-launch-preparation-codex`. | slice 6 | |
| J04 | Its retry. | slice 6 | |
| J05 | `responsive-session-access`. | slice 6 | |
| J06 | `responsive-session-reconciliation`. | slice 6 | |
| J07 | `responsive-session-recovery-restart`. | slice 6 | |
| J08 | `side-panel-content-replacement`. | slice 6 | |
| J09 | `production-deployment`. | slice 6 | |
| J10 | `agent-completion-recovery`. | slice 6 | |
| J11 | Watcher-family first-in-worker `beforeAll`. | slice 6 | |
| J12 | Watcher restart paths. | slice 3 | |
| J13 | Watcher policy-repair paths. | slice 6 | |
| J14 | Retired closure. | slice 4 | |
| J15 | `story-review-completed`. | slice 6 | |
| J16 | DD-473 routes. | slice 6 | |
| J17 | DD-476 routes. | slice 6 | |
| J18 | DD-479 routes. | slice 6 | |
| J19 | The three candidates moved from SEED-284; the source does not name them individually. | slice 6 | |
| J20 | Touch review’s 2026-11-09 case-local allowance is removed after it fits. | slice 5 | |
| J21 | The production-deployment allowance is removed after it fits. | slice 6 | |
| J22 | The agent-completion-recovery allowance is removed after it fits. | slice 6 | |
| J23 | The temporary watcher policy-repair allowance on main is removed after it fits. | slice 6 | |
| J24 | The temporary retired-closure allowance on main is removed after it fits. | slice 6 | |
| J25 | The watcher example proceeds from origin unavailability, through origin recovery, into failed candidate and failed restoration on one deployment. | slice 3 | |
| J26 | The restart example detects ignored SIGHUP. | slice 3 | |
| J27 | The restart example detects reuse of the previously served revision. | slice 3 | |
| J28 | The retained closure example combines real retirement, reporting retry without repeated Git/native work, and visible Done. | slice 4 | |
| J29 | The history example waits for persistence before comparing reads. | slice 2 | |
| J30 | The revisit example waits for first-request completion before counting. | slice 2 | |
| J31 | The selected-story example waits for rendering before checking state. | slice 2 | |
| X01 | The Intent CI comparison family belongs to SEED-286. | slice 6 | |
| X02 | Infrastructure acquisition is outside. | slice 6 | |
| X03 | Unrelated branch defects are outside. | slice 6 | |
| X04 | The separate collector-lock repair is outside. | slice 6 | |
| X05 | Other unnamed case-local allowances are outside, subject to Q11. | slice 6 | |
| X06 | Recently-done ad-hoc session journey allowances are specifically outside, subject to Q11. | slice 6 | |
| X07 | Intent timing-history journey allowances are specifically outside, subject to Q11. | slice 6 | |
| X08 | Causal attribution of every remaining CI flake beyond the named patterns is outside once the named journeys fit. | slice 6 | |
| X09 | Margin work does not establish that a collector-lock failure has been solved. | slice 6 | |
| X10 | Margin work does not establish that an infrastructure setup failure has been solved. | slice 6 | |
