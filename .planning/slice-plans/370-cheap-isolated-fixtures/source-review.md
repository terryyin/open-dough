# Independent source review

Fresh reviewer `/root/fixture_source_contract`, fork_turns none, received only
this selected story's original Goal, Scope, Examples, Evaluation and Excluded
text. The launch required no file reads or edits and individual numbered source
clauses without plan, implementation or acceptance context. Its actual returned
commitments, qualifications, journey examples and exclusions are retained below.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | Make isolated dashboard fixtures cheaper. | slice 2 | observed: origin fixture442.99s to81.66s; normal45-case wall41.26s to30.88s; complete CI comparison in docs/maintainer/dashboard-test-timings.md |
| C2 | Preserve existing coverage. | slice 2 | observed: candidate40814111625 preserves all1735 original full case identities/verdicts and adds3passing isolation guards; no removed assertions in aggregate diff |
| C3 | Preserve fixture isolation. | slice 2 | observed: private Git/home mutation guards and actual concurrent server/browser profile preserve peers and later instances |
| C4 | Measure the effect on CI time. | slice 2 | observed: named full baseline40809484652 versus candidate40814111625: maxjob230s to219s; maxsuite199.324s to187.702s; fullCI235s to221s |
| C5 | Target repeated preview-server bootstrap. | slice 2 | observed: real globalSetup and preview profile:269–276ms startup,4–7ms before spawn; existing build/bundle reuse leaves no justified additional immutable change |
| C6 | Target Git fixture preparation. | slice 1 | observed: startOriginPreparation.ts replaces repeated copying/indexing with packed immutable seeds and private native clones; final45-case wall41.26s to30.88s |
| C7 | Target installed-skill fixture preparation. | slice 1 | observed: single installedStartSkills manifest; complete initial tree parity and actual installed starts in final guards/ordinary consumers |
| C8 | Preserve every existing scenario. | slice 2 | observed: all existing spec files and scenario registrations untouched; full original selection occurs once with unchanged verdicts |
| C9 | Preserve every existing assertion. | slice 2 | observed: all existing spec assertions untouched in aggregate runtime diff; added guards only |
| C10 | Preserve each private HOME. | slice 1 | observed: start-origin-isolation.spec.ts independent HOME markers, peer snapshots and cleanup; no shared writable HOME |
| C11 | Preserve each writable Git origin. | slice 1 | observed: concurrent real starts/private pushes plus distinct writable origin pack/config/ref state and peer fsck |
| C12 | Preserve each writable worktree. | slice 1 | observed: private native clones/indexes, distinct physical packs, arbitrary edits and first project fsck after origin corruption |
| C13 | Preserve each HTTP server. | slice 2 | observed: slice2-profile-worker.json: distinct preview PIDs/ports, real HTTP responses and stopA leaves B responsive |
| C14 | Preserve each browser context. | slice 2 | observed: profile creates two distinct browser contexts; separate localStorage markers remain after closing A |
| C15 | Preserve each fixture’s fake-service state. | slice 2 | observed: distinct fake GitHub endpoints and Codex sockets/model state; mutationA leaves B answers/model unchanged |
| C16 | Preserve every strict verdict. | slice 2 | observed: normal45 and isolation3 strict passes; full hosted16jobs pass with1734expected/same4skipped and zero extra attempts; reporter/config untouched |
| C17 | Keep native-touch observations unchanged. | slice 2 | observed: all native-touch helpers, assertions and scenarios unchanged and included in complete hosted comparison |
| C18 | Keep every-control observations unchanged. | slice 2 | observed: all every-control helpers/observations unchanged and included in complete hosted comparison |
| C19 | Profile fixture substeps before selecting experiments. | slice 1 | observed: real five-origin subprofile before selection, origin-profile-before.json; existing full CI reports separate fixture costs |
| C20 | Compare the same normal local test family before and after. | slice 1 | observed: local-comparison-final.json: same45 full names/verdicts, wall41.26s to30.88s; eager preparation included |
| C21 | Use identical workers for that local comparison. | slice 1 | observed: literal normal command uses unchanged default8workers on the same16CPU host |
| C22 | Use identical filters for that local comparison. | slice 1 | observed: identical five file filters in family-before and family-stable commands, retained in slice1-proof.md |
| C23 | Use identical relevant environment for that local comparison. | slice 1 | observed: both use env -u NO_COLOR, unchanged compile-cache disable policy, same dependency state; host load variance explicitly retained |
| C24 | Compare full hosted CI on a named baseline revision and a named candidate revision. | slice 2 | observed: a94c65e2 baseline40809484652 and8c55a30c candidate40814111625; named full revisions and commands in timing report |
| C25 | Include case equality in the hosted comparison. | slice 2 | observed: ci-comparison.json removedOrChanged is empty; every original identity occurs exactly once,3expected new guards |
| C26 | Include verdict equality in the hosted comparison. | slice 2 | observed: same1731 original expected and4platform skips, plus3newexpected; ci-attempts.json zero retry attempts |
| C27 | Include fixture costs in the hosted comparison. | slice 2 | observed: reported origin442.99s to81.66s, dashboard1162.17s to1191.43s; nested accumulated spans distinguished from elapsed |
| C28 | Include queue time in the hosted comparison. | slice 2 | observed: first-job queue3s to2s, all-job startspread2s to0s; run creation to last completion retained separately |
| C29 | Include job time in the hosted comparison. | slice 2 | observed: maxdashboardjob230s to219s, dashboardjob aggregate2329s to2245s, all16jobs passed |
| C30 | Include suite time in the hosted comparison. | slice 2 | observed: maxHTMLsuite199.324s to187.702s; actual4workers per each12shards unchanged |
| C31 | Include uncertainty in the hosted comparison. | slice 2 | observed: small shared-runner sample, load/cache variability, diagnostic first-use slowdown and eager1.71–3.29s cost retained explicitly; no guaranteed per-run gain |
| C32 | Report inconclusive experiments honestly. | slice 2 | observed: first-use diagnostic6.813s versus8.176s remains inconclusive; no standalone gain claimed; incomplete diagnostics excluded |
| C33 | Report rejected experiments honestly. | slice 2 | observed: further bootstrap change rejected: real remaining privateprep4–7ms and no supported removable immutable work; no speculative code retained |
| Q1 | Reused preparation must be immutable. | slice 2 | observed: only fresh run-owned seeds/builds/bundles are read by instances; complete seed snapshots unchanged after arbitrary peer mutations; independent object inodes/no alternates |
| Q2 | Reuse preparation only when measurements justify it. | slice 2 | observed: normal45-case25.2%wall improvement and fullCI component81.6%lower support reuse including eager setup cost; focused zero-start commands can be slower |
| Q3 | Retain only supported gains. | slice 2 | observed: retains only measured origin preparation change; no independent first-use or preview-bootstrap speed claim |
| J1 | Two concurrent tests can edit their own fixtures independently. | slice 1 | observed: final concurrent guard: real installed starts and private file edit/commit in Promise.all |
| J2 | Two concurrent tests can publish their own fixtures independently. | slice 1 | observed: final concurrent guard: independent Take and private branch publication, each origin reads its own content |
| J3 | Two concurrent tests can stop their own fixtures independently. | slice 2 | observed: actual concurrent profile closesA, observes connection refusal/stoppedPID/deletedHOME while B stays live; then closesB independently |
| J4 | Two concurrent tests can clean up their own fixtures independently. | slice 1 | observed: first and second cleanup preserve active peers/later instances; prepared input snapshots remain unchanged |
| J5 | In that concurrent journey, neither test changes the other test’s files. | slice 1 | observed: peer complete file hashes unchanged after arbitrary HOME/worktree/config/pack edits and cleanup |
| J6 | In that concurrent journey, neither test changes the other test’s refs. | slice 1 | observed: peer refs unchanged after real private publications and cleanup; original initial ref layout preserved |
| J7 | In that concurrent journey, neither test changes the other test’s server. | slice 2 | observed: B real HTTP/browser remains responsive after A mutation and stop; own addresses/PIDs unchanged |
| J8 | In that concurrent journey, neither test changes the other test’s state. | slice 2 | observed: B fake answer/model/HOME and context storage unchanged after mutation/stopA |
| J9 | In that concurrent journey, neither test changes the other test’s results. | slice 2 | observed: B returns original revision/backlog/browser marker before and after A mutation/stop |
| J10 | Prepared source reflects the current working tree on each run. | slice 1 | observed: fresh preparations from changed working-tree source install new marker while earlier instance remains unchanged; default source root and initial trees match baseline |
| J11 | Successive runs never consume a stale cache. | slice 1 | observed: two distinct fresh preparation roots plus no-setup fresh source; no persistent cache survives invocation/run |
| J12 | Source skills remain installed through the real entry points. | slice 1 | observed: same real installed source layouts for Claude and sharedCodex/Cursor; initial tree parity |
| J13 | Source skills remain exercised through the real entry points. | slice 1 | observed: real takenByAnotherAgent and ordinary Claude/Codex/Cursor consumers; no command outcome stub introduced |
| J14 | Failures retain cleanup behavior. | slice 1 | observed: failure guard removes own missing-input/partial-clone machines and preparation; peer unchanged; globalSetup owns normal run cleanup |
| J15 | Failures retain unexpected-error behavior. | slice 1 | observed: missing-source ENOENT and real cloneGit128/badconfig errors retained rather than swallowed |
| X1 | Shared mutable Git origins. | slice 1 | observed: five distinct physical object packs, no hardlinks/alternates; arbitrary writable mutation does not affect seed or peers |
| X2 | Shared mutable servers. | slice 2 | observed: no server reuse change; concurrent real previews have distinct process/address and independent stopping |
| X3 | Shared mutable HOME. | slice 2 | observed: private origin HOME guards and separate real preview HOMEs observed; no shared writable HOME introduced |
| X4 | Shared mutable fake-service state. | slice 2 | observed: distinct fakeGitHub/Codex state and mutation/stop peer invariance observed |
| X5 | Scenario removal. | slice 2 | observed: no original spec removed or rewritten; full selection unchanged |
| X6 | Assertion removal. | slice 2 | observed: no original assertion removed or weakened; aggregate code diff and full hosted proof inspected |
| X7 | Skips. | slice 2 | observed: same4existing platform skips; no new skip and config unchanged |
| X8 | Retries. | slice 2 | observed: retry policy unchanged; baseline/candidate both zero extra attempts |
| X9 | Browser-clock changes. | slice 2 | observed: clock helpers/config/callers untouched; full workload preserved |
| X10 | Coarser native input. | slice 2 | observed: native input helpers and cases untouched; full workload preserved |
| X11 | Deployment-policy tier changes. | slice 2 | observed: deployment-policy implementation, scenarios and project tier unchanged |
| X12 | Additional CI shards. | slice 2 | observed: workflow/shard config unchanged;12observed report artifacts |
| X13 | Additional CI workers. | slice 2 | observed: workflow/worker config unchanged;4observed workers eachshard |
| X14 | Product feature changes. | slice 2 | observed: runtime diff confined to test support/newguards; no production feature edit |
| X15 | Release work. | slice 2 | observed: no release version/tag/payload/install change |
