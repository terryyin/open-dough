# Source-only review

Reviewer: `/root/source_review`.
Launch: `fork_turns: none`.
Input: the original source text below was supplied in the initial agent prompt.
The reviewer read no project files and changed nothing during the review.
This record is a separate clerical follow-up; the final two table columns are reserved for coordinator allocation.

## Original source text

Goal: For an Open Dough maintainer, make native acceptance and A/B evaluation tooling recognizable and independently runnable, with its own automated checks, while keeping its CI proof in the existing Distribution Tests Intent entry and its implementation outside the installed client payload.

Scope:
- Give the tool one home under Distribution/evaluation/, with src/ for implementation, cases/ for reusable scenarios and their assessors, tests/ for automated checks of the tool, and a maintainer README.md.
- Reuse the existing native execution, observation and assessment in acceptance journeys and A/B comparisons. Relocate their shared implementation once; preserve case selection, host support, outcome and failure semantics, supervision, retention and evidence identity during the move.
- Provide the focused automated-check command npm run test:evaluation. Extend the existing Distribution Tests Intent source patterns and retain combined CI proof. A separate Intent entry can be considered later.
- Keep real native journeys and A/B experiments explicitly invoked on demand; routine automated checks continue to use controlled hosts and retained streams.
- Update affected callers, discovery, documentation and evidence-recovery paths. Keep retained comparison records and baseline archives byte for byte, with their original hashes and historical paths; relocation must not relabel an earlier observation or make it unrecoverable.
- Keep installation governed by the declared payload. The new home is maintenance material under ADR 0004, so no evaluation implementation, case, retained stream or automated check becomes installed runtime content.

Scope limits: no new native host support, case qualification, experiment, performance claim, release, installation change or separate Intent entry. The queued comparison-harness corrections retain their own outcome and proof. Old command paths need no permanent compatibility layer: update maintained callers and document the new commands, preserving historical evidence paths.

Key examples:
- Given an installed contributor toolchain, a maintainer runs npm run test:evaluation → only the tool's automated checks run, using controlled hosts and retained streams; a broken assessor or runner fails the command without starting a real native host.
- Given an ordinary CI run, both guidance checks and evaluation-tool checks run → their file and Node-case results remain in the existing Distribution Tests proof, with each check scheduled once across its shares.
- Given an existing acceptance case, a maintainer explicitly invokes its new entry with the same host and case options → it runs the same isolated journey, assessment and retained-result lifecycle. An ordinary test command never starts that native journey.
- Given the existing comparison catalog, a maintainer lists or filters it from the new entry → the same cases and traits are selected. An explicitly requested comparison retains its existing quality-first verdict and limits; controlled substitutes prove the relocation without purchasing native runs.
- Given a comparison record kept before the move, a maintainer recovers it through the new entry → recovery finds the original committed basis and prints the original record unchanged. An immutable baseline archive remains reassessable with its original provenance after raw attempts are removed.
- Given the relocated tool in the release source, an ordinary supported installation → installed managed bytes and unrelated project content remain as before, and no evaluation material appears in the installed output.

Explicit human amendments: Terry approved naming Distribution/evaluation/ as maintainer evaluation tooling while retaining Distribution Tests as the shared Intent and CI group. No paid session is required or authorized. The separately queued comparison harness corrections remain outside this story.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Commitment: Give the tooling one home at `Distribution/evaluation/`. | slice 9 |  |
| C02 | Commitment: Put implementation in that home’s `src/`. | slice 5 | observed: slice-5-evidence.md ownership and current product: actual comparison entry/runtime in evaluation/src, four cases and shared supplier materialization/events in cases/comparison, README plus comparison/baseline guides. Mixed default assertions remain explicit G11 until6/7. |
| C03 | Commitment: Put reusable scenarios in that home’s `cases/`. | slice 5 | observed: slice-5-evidence.md ownership and current product: actual comparison entry/runtime in evaluation/src, four cases and shared supplier materialization/events in cases/comparison, README plus comparison/baseline guides. Mixed default assertions remain explicit G11 until6/7. |
| C04 | Commitment: Put scenario assessors in that home’s `cases/`. | slice 5 | observed: slice-5-evidence.md ownership and current product: actual comparison entry/runtime in evaluation/src, four cases and shared supplier materialization/events in cases/comparison, README plus comparison/baseline guides. Mixed default assertions remain explicit G11 until6/7. |
| C05 | Commitment: Put automated checks of the tool in that home’s `tests/`. | slice 8 |  |
| C06 | Commitment: Provide a maintainer `README.md` in that home. | slice 9 |  |
| C07 | Commitment: Make native acceptance tooling recognizable to an Open Dough maintainer. | slice 2 | observed: Distribution/evaluation/README.md ADR acceptance commands and native-adr-awareness-wrappers.md; slice-2-evidence.md commands 1 and 2 observe actual new-entry listing/options and controlled-host lifecycle |
| C08 | Commitment: Make A/B evaluation tooling recognizable to an Open Dough maintainer. | slice 5 | observed: slice-5-evidence.md ownership and current product: actual comparison entry/runtime in evaluation/src, four cases and shared supplier materialization/events in cases/comparison, README plus comparison/baseline guides. Mixed default assertions remain explicit G11 until6/7. |
| C09 | Commitment: Make the tooling independently runnable. | slice 8 |  |
| C10 | Commitment: Give the tooling its own automated checks. | slice 8 |  |
| C11 | Commitment: Reuse existing native execution in acceptance journeys and A/B comparisons. | slice 5 | observed: slice-5-evidence.md terminal comparison gates and final supplier renewal: actual new CLI, shared supervisor/reader, case materialization/events, observer and existing judge run through controlled external hosts; independent product/assertions retained. |
| C12 | Commitment: Reuse existing native observation in acceptance journeys and A/B comparisons. | slice 5 | observed: slice-5-evidence.md terminal comparison gates and final supplier renewal: actual new CLI, shared supervisor/reader, case materialization/events, observer and existing judge run through controlled external hosts; independent product/assertions retained. |
| C13 | Commitment: Reuse existing native assessment in acceptance journeys and A/B comparisons. | slice 5 | observed: slice-5-evidence.md terminal comparison gates and final supplier renewal: actual new CLI, shared supervisor/reader, case materialization/events, observer and existing judge run through controlled external hosts; independent product/assertions retained. |
| C14 | Commitment: Relocate the shared implementation once. | slice 3 | observed: Shared core exists once in evaluation/src (six delivered reader/session modules plus 26 runtime/retained-reader modules); slice-3-evidence.md real lifecycle, identities, standalone and current admission/archive/replay observations; family-specific closure remains explicitly owned by G10/slice4 |
| C15 | Commitment: Preserve case selection during the move. | slice 5 | observed: slice-5-evidence.md actual new-entry catalog and default assertions in native-comparison.sh: all four names and trait fields, blocked+codex and nix filters, nonmatching-filter refusal unchanged. |
| C16 | Commitment: Preserve host support during the move. | slice 4 | observed: slice-4-evidence.md 15-check renewal and 21-check final: real publication substitute suites iterate codex/cursor/claude; native-delivery-updated-use-adapters.sh asserts Cursor/Claude adapter identity, completion and truncated-stream failures; native entries retain the same supported-host guards. |
| C17 | Commitment: Preserve outcome semantics during the move. | slice 5 | G12 |
| C18 | Commitment: Preserve failure semantics during the move. | slice 4 | observed: slice-4-evidence.md publication/one-shot/owned-context suites and eight-check correction: real assessor counterexamples reject altered observations; browser controls retain wrong-item and empty-catalog failure diagnostics; comparison pairs retain preserved/regressed verdicts. |
| C19 | Commitment: Preserve supervision during the move. | slice 4 | observed: slice-4-evidence.md controlled publication and updated-use adapter journeys source the same evaluation/src supervisor; assert_no_retry observes supervised launch counts, truncated streams fail, retained host logs and failure status remain visible. |
| C20 | Commitment: Preserve retention during the move. | slice 4 | observed: slice-4-evidence.md native-delivery-updated-use and adapters assert retained record/events/responses/stderr/snapshots plus scratch cleanup on success, truncated streams and payload abort; admission replay checks retained artifact bytes stay unchanged. |
| C21 | Commitment: Preserve evidence identity during the move. | slice 4 | observed: slice-4-evidence.md initial family identity proof retained; slice-6-evidence.md current writer/input mutations, fixture-identity and operational admission comparison pass after removing check-only identity inputs. The actual public native child CLI also retains its selected entry input-hash and real result artifacts. |
| C22 | Commitment: Provide the focused automated-check command `npm run test:evaluation`. | slice 8 |  |
| C23 | Commitment: Extend the existing Distribution Tests Intent source patterns. | slice 8 |  |
| C24 | Commitment: Keep evaluation-tool CI proof in the existing Distribution Tests Intent entry. | slice 9 |  |
| C25 | Commitment: Retain combined CI proof. | slice 9 |  |
| C26 | Commitment: Keep real native journeys explicitly invoked on demand. | slice 4 | observed: slice-4-evidence.md native entry --help and controlled default suites; inspected git-publication-native.sh native_flag guard exits after credential-free checks unless --native; moved ADR/family entries preserve explicit native options. Final test-only extraction remains G8/G11. |
| C27 | Commitment: Keep real A/B experiments explicitly invoked on demand. | slice 5 | observed: slice-5-evidence.md controlled-host gates and actual CLI tripwires: unsupported host/case/payload refusals do not launch; retired supplier check and raw-cleanup baseline export leave unexpected-launch tripwires untouched; no native session purchased. |
| C28 | Commitment: Continue using controlled hosts for routine automated checks. | slice 8 |  |
| C29 | Commitment: Continue using retained streams for routine automated checks. | slice 8 |  |
| C30 | Commitment: Update affected callers. | slice 8 |  |
| C31 | Commitment: Update affected discovery paths. | slice 8 | G13 |
| C32 | Commitment: Update affected documentation. | slice 9 |  |
| C33 | Commitment: Update affected evidence-recovery paths. | slice 5 | observed: slice-5-evidence.md isolated real-history candidate4949700 parented to ed6f4c8: both original records recover basis9c20a8086fe48e2bd60f283f478607440a057216 and stdout suffix equals original bytes; coordinator independently inspected outputs, record bytes and lookup code. Refresh also observes tracked moves/drift/changed and conflicting inputs. |
| C34 | Commitment: Keep retained comparison records byte for byte. | slice 5 | observed: slice-5-evidence.md frozen41-input manifest independently compared with old HEAD bytes and SHA256 by coordinator, including all8 retained record/archive/usage files. Original content hashes/historical paths/task/wake/project inputs and pinned URLs remain unchanged. |
| C35 | Commitment: Keep baseline archives byte for byte. | slice 5 | observed: slice-5-evidence.md frozen41-input manifest independently compared with old HEAD bytes and SHA256 by coordinator, including all8 retained record/archive/usage files. Original content hashes/historical paths/task/wake/project inputs and pinned URLs remain unchanged. |
| C36 | Commitment: Preserve the original hashes of retained comparison records and baseline archives. | slice 5 | observed: slice-5-evidence.md frozen41-input manifest independently compared with old HEAD bytes and SHA256 by coordinator, including all8 retained record/archive/usage files. Original content hashes/historical paths/task/wake/project inputs and pinned URLs remain unchanged. |
| C37 | Commitment: Preserve their historical paths. | slice 5 | observed: slice-5-evidence.md frozen41-input manifest independently compared with old HEAD bytes and SHA256 by coordinator, including all8 retained record/archive/usage files. Original content hashes/historical paths/task/wake/project inputs and pinned URLs remain unchanged. |
| C38 | Commitment: Do not relabel an earlier observation through relocation. | slice 5 | observed: slice-5-evidence.md frozen41-input manifest independently compared with old HEAD bytes and SHA256 by coordinator, including all8 retained record/archive/usage files. Original content hashes/historical paths/task/wake/project inputs and pinned URLs remain unchanged. |
| C39 | Commitment: Do not make an earlier observation unrecoverable through relocation. | slice 5 | observed: slice-5-evidence.md isolated real-history candidate4949700 parented to ed6f4c8: both original records recover basis9c20a8086fe48e2bd60f283f478607440a057216 and stdout suffix equals original bytes; coordinator independently inspected outputs, record bytes and lookup code. Refresh also observes tracked moves/drift/changed and conflicting inputs. |
| C40 | Commitment: Keep installation governed by the declared payload. | slice 9 |  |
| C41 | Commitment: Treat the new home as maintenance material under ADR 0004. | slice 9 |  |
| C42 | Commitment: Keep evaluation implementation outside installed runtime content. | slice 9 |  |
| C43 | Commitment: Keep evaluation cases outside installed runtime content. | slice 9 |  |
| C44 | Commitment: Keep retained evaluation streams outside installed runtime content. | slice 9 |  |
| C45 | Commitment: Keep evaluation automated checks outside installed runtime content. | slice 9 |  |
| C46 | Commitment: Document the new commands. | slice 9 |  |
| Q01 | Qualification: Terry approved naming `Distribution/evaluation/` as maintainer evaluation tooling. | slice 9 |  |
| Q02 | Qualification: That naming approval retains Distribution Tests as the shared Intent. | slice 9 |  |
| Q03 | Qualification: That naming approval retains Distribution Tests as the shared CI group. | slice 9 |  |
| Q04 | Qualification: A separate Intent entry may be considered later; this is an option, not a promise to create one. | slice 8 |  |
| Q05 | Qualification: Old command paths need no permanent compatibility layer; this does not prohibit a temporary layer. | slice 8 |  |
| Q06 | Qualification: Maintained callers must nevertheless be updated. | slice 8 |  |
| Q07 | Qualification: Historical evidence paths must nevertheless be preserved. | slice 5 | observed: slice-5-evidence.md frozen41-input manifest independently compared with old HEAD bytes and SHA256 by coordinator, including all8 retained record/archive/usage files. Original content hashes/historical paths/task/wake/project inputs and pinned URLs remain unchanged. |
| Q08 | Qualification: The separately queued comparison-harness corrections retain their own outcome. | slice 5 | observed: slice-5-evidence.md queued621 location-only reorganization: coordinator compared all original sections, none missing; only live paths and linked evidence heading differ. Goal/scope/slices/assertions/premises preserved; cleanup/payload/qualification fixes remain queued, existing readiness judgment untouched. |
| Q09 | Qualification: Those corrections retain their own proof. | slice 5 | observed: slice-5-evidence.md queued621 location-only reorganization: coordinator compared all original sections, none missing; only live paths and linked evidence heading differ. Goal/scope/slices/assertions/premises preserved; cleanup/payload/qualification fixes remain queued, existing readiness judgment untouched. |
| X01 | Exclusion: Add no new native host support. | slice 9 |  |
| X02 | Exclusion: Perform no new case qualification. | slice 9 |  |
| X03 | Exclusion: Conduct no new experiment. | slice 9 |  |
| X04 | Exclusion: Make no new performance claim. | slice 9 |  |
| X05 | Exclusion: Perform no release. | slice 9 |  |
| X06 | Exclusion: Make no installation change. | slice 9 |  |
| X07 | Exclusion: Create no separate Intent entry in this story. | slice 9 |  |
| X08 | Exclusion: Keep the separately queued comparison-harness corrections outside this story. | slice 5 | observed: slice-5-evidence.md queued621 location-only reorganization: coordinator compared all original sections, none missing; only live paths and linked evidence heading differ. Goal/scope/slices/assertions/premises preserved; cleanup/payload/qualification fixes remain queued, existing readiness judgment untouched. |
| X09 | Exclusion: No paid session is required. | slice 9 |  |
| X10 | Exclusion: No paid session is authorized. | slice 9 |  |
| J01 | Trigger/example: Given an installed contributor toolchain, a maintainer can invoke `npm run test:evaluation`. | slice 8 |  |
| J02 | Journey promise: That invocation runs only the tool’s automated checks. | slice 8 |  |
| J03 | Journey promise: Those checks use controlled hosts. | slice 8 |  |
| J04 | Journey promise: Those checks use retained streams. | slice 8 |  |
| J05 | Failure example: A broken assessor fails that command. | slice 8 |  |
| J06 | Failure example: A broken runner fails that command. | slice 8 |  |
| J07 | Journey promise: That command does not start a real native host. | slice 8 |  |
| J08 | Trigger/example: An ordinary CI run runs guidance checks. | slice 9 |  |
| J09 | Journey promise: An ordinary CI run also runs evaluation-tool checks. | slice 9 |  |
| J10 | Journey promise: Their file results remain in the existing Distribution Tests proof. | slice 9 |  |
| J11 | Journey promise: Their Node-case results remain in the existing Distribution Tests proof. | slice 9 |  |
| J12 | Journey promise: Each check is scheduled once across its shares. | slice 9 |  |
| J13 | Trigger/example: Given an existing acceptance case, a maintainer explicitly invokes its new entry with the same host options. | slice 4 | observed: slice-4-evidence.md host adapters remain supported; slice-6-evidence.md git-publication-native-entry.sh invokes the actual moved CLI in a separate Bash with --native codex --case publication/publish-boundary and controlled external host, yielding completed/pass retained evidence. |
| J14 | Trigger/example: That invocation also retains the same case options. | slice 4 | observed: slice-4-evidence.md updated-use wrapper and publication journey suites retain actual case names, native_case_known rejection and per-host routing; README/acceptance.md commands name the moved entries and existing host/case options. |
| J15 | Journey promise: The invocation runs the same isolated journey. | slice 4 | observed: slice-4-evidence.md controlled publication/updated-use runners create actual isolated fixtures; assert_watched_empty and assert_attempt_layout verify no scratch remains and no adopter/candidate leaks into retained attempts. |
| J16 | Journey promise: The invocation retains the same assessment. | slice 4 | observed: slice-4-evidence.md publication assessor counterexamples, updated-use assessment-status assertions, admission replay and comparison preserved/regressed outcomes exercise the original assessors after relocation. |
| J17 | Journey promise: The invocation retains the same retained-result lifecycle. | slice 4 | observed: slice-4-evidence.md updated-use success/truncated/payload-abort assertions inspect result-path, record and concrete retained artifacts; operational admission replay preserves original artifact bytes and separates unavailable evidence. |
| J18 | Journey promise: An ordinary test command never starts that native journey. | slice 4 | observed: slice-4-evidence.md explicit native guards retained; slice-6-evidence.md five actual credential-free test defaults and continuation gates pass after body separation. Public CLI positive proof substitutes only the external host; ordinary/default paths retain explicit native gating. |
| J19 | Trigger/example: A maintainer can list the existing comparison catalog from the new entry. | slice 5 | observed: slice-5-evidence.md actual new-entry catalog and default assertions in native-comparison.sh: all four names and trait fields, blocked+codex and nix filters, nonmatching-filter refusal unchanged. |
| J20 | Alternative trigger/example: A maintainer can filter that catalog from the new entry. | slice 5 | observed: slice-5-evidence.md actual new-entry catalog and default assertions in native-comparison.sh: all four names and trait fields, blocked+codex and nix filters, nonmatching-filter refusal unchanged. |
| J21 | Journey promise: Listing or filtering selects the same cases. | slice 5 | observed: slice-5-evidence.md actual new-entry catalog and default assertions in native-comparison.sh: all four names and trait fields, blocked+codex and nix filters, nonmatching-filter refusal unchanged. |
| J22 | Journey promise: Listing or filtering selects the same traits. | slice 5 | observed: slice-5-evidence.md actual new-entry catalog and default assertions in native-comparison.sh: all four names and trait fields, blocked+codex and nix filters, nonmatching-filter refusal unchanged. |
| J23 | Trigger/example: A comparison is run when explicitly requested. | slice 5 | observed: slice-5-evidence.md controlled-host gates and actual CLI tripwires: unsupported host/case/payload refusals do not launch; retired supplier check and raw-cleanup baseline export leave unexpected-launch tripwires untouched; no native session purchased. |
| J24 | Journey promise: An explicitly requested comparison retains its existing quality-first verdict. | slice 5 | observed: slice-5-evidence.md actual pairs assertions observe preserved/regressed quality before effort, same conditions, distinct sessions and payload digests; incomplete/inflight cases retain stopped/unknown/not-comparable outcomes; unchanged CLI model/effort/deadline options reach the existing supervisor. |
| J25 | Journey promise: An explicitly requested comparison retains its existing limits. | slice 5 | observed: slice-5-evidence.md actual pairs assertions observe preserved/regressed quality before effort, same conditions, distinct sessions and payload digests; incomplete/inflight cases retain stopped/unknown/not-comparable outcomes; unchanged CLI model/effort/deadline options reach the existing supervisor. |
| J26 | Proof qualification: Controlled substitutes prove the relocation. | slice 5 | observed: slice-5-evidence.md controlled-host gates and actual CLI tripwires: unsupported host/case/payload refusals do not launch; retired supplier check and raw-cleanup baseline export leave unexpected-launch tripwires untouched; no native session purchased. |
| J27 | Proof qualification: That proof does not purchase native runs. | slice 5 | observed: slice-5-evidence.md controlled-host gates and actual CLI tripwires: unsupported host/case/payload refusals do not launch; retired supplier check and raw-cleanup baseline export leave unexpected-launch tripwires untouched; no native session purchased. |
| J28 | Trigger/example: A maintainer can recover a comparison record kept before the move through the new entry. | slice 5 | observed: slice-5-evidence.md isolated real-history candidate4949700 parented to ed6f4c8: both original records recover basis9c20a8086fe48e2bd60f283f478607440a057216 and stdout suffix equals original bytes; coordinator independently inspected outputs, record bytes and lookup code. Refresh also observes tracked moves/drift/changed and conflicting inputs. |
| J29 | Journey promise: Recovery finds the original committed basis. | slice 5 | observed: slice-5-evidence.md isolated real-history candidate4949700 parented to ed6f4c8: both original records recover basis9c20a8086fe48e2bd60f283f478607440a057216 and stdout suffix equals original bytes; coordinator independently inspected outputs, record bytes and lookup code. Refresh also observes tracked moves/drift/changed and conflicting inputs. |
| J30 | Journey promise: Recovery prints the original record unchanged. | slice 5 | observed: slice-5-evidence.md isolated real-history candidate4949700 parented to ed6f4c8: both original records recover basis9c20a8086fe48e2bd60f283f478607440a057216 and stdout suffix equals original bytes; coordinator independently inspected outputs, record bytes and lookup code. Refresh also observes tracked moves/drift/changed and conflicting inputs. |
| J31 | Trigger/example: An immutable baseline archive remains reassessable after raw attempts are removed. | slice 5 | observed: slice-5-evidence.md native-comparison-baselines.sh removes raw results/codex-home, then actual current assessment asserts pass and sourceIntegrity==archive.integrity with assessor hash; compact archive copy preserves original value and missing executed proof is refused. |
| J32 | Journey promise: That reassessment retains the archive’s original provenance. | slice 5 | observed: slice-5-evidence.md native-comparison-baselines.sh removes raw results/codex-home, then actual current assessment asserts pass and sourceIntegrity==archive.integrity with assessor hash; compact archive copy preserves original value and missing executed proof is refused. |
| J33 | Trigger/example: The relocated tool can be present in release source when an ordinary supported installation runs. | slice 9 |  |
| J34 | Journey promise: Installed managed bytes remain as before. | slice 9 |  |
| J35 | Journey promise: Unrelated project content remains as before. | slice 9 |  |
| J36 | Journey promise: No evaluation material appears in installed output. | slice 9 |  |
