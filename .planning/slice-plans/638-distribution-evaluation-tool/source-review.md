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
| C01 | Commitment: Give the tooling one home at `Distribution/evaluation/`. | slice 7 |  |
| C02 | Commitment: Put implementation in that home’s `src/`. | slice 5 |  |
| C03 | Commitment: Put reusable scenarios in that home’s `cases/`. | slice 5 |  |
| C04 | Commitment: Put scenario assessors in that home’s `cases/`. | slice 5 |  |
| C05 | Commitment: Put automated checks of the tool in that home’s `tests/`. | slice 7 |  |
| C06 | Commitment: Provide a maintainer `README.md` in that home. | slice 7 |  |
| C07 | Commitment: Make native acceptance tooling recognizable to an Open Dough maintainer. | slice 2 | observed: Distribution/evaluation/README.md ADR acceptance commands and native-adr-awareness-wrappers.md; slice-2-evidence.md commands 1 and 2 observe actual new-entry listing/options and controlled-host lifecycle |
| C08 | Commitment: Make A/B evaluation tooling recognizable to an Open Dough maintainer. | slice 5 |  |
| C09 | Commitment: Make the tooling independently runnable. | slice 7 |  |
| C10 | Commitment: Give the tooling its own automated checks. | slice 7 |  |
| C11 | Commitment: Reuse existing native execution in acceptance journeys and A/B comparisons. | slice 5 |  |
| C12 | Commitment: Reuse existing native observation in acceptance journeys and A/B comparisons. | slice 5 |  |
| C13 | Commitment: Reuse existing native assessment in acceptance journeys and A/B comparisons. | slice 5 |  |
| C14 | Commitment: Relocate the shared implementation once. | slice 3 | observed: Shared core exists once in evaluation/src (six delivered reader/session modules plus 26 runtime/retained-reader modules); slice-3-evidence.md real lifecycle, identities, standalone and current admission/archive/replay observations; family-specific closure remains explicitly owned by G10/slice4 |
| C15 | Commitment: Preserve case selection during the move. | slice 5 |  |
| C16 | Commitment: Preserve host support during the move. | slice 4 | observed: slice-4-evidence.md 15-check renewal and 21-check final: real publication substitute suites iterate codex/cursor/claude; native-delivery-updated-use-adapters.sh asserts Cursor/Claude adapter identity, completion and truncated-stream failures; native entries retain the same supported-host guards. |
| C17 | Commitment: Preserve outcome semantics during the move. | slice 5 |  |
| C18 | Commitment: Preserve failure semantics during the move. | slice 4 | observed: slice-4-evidence.md publication/one-shot/owned-context suites and eight-check correction: real assessor counterexamples reject altered observations; browser controls retain wrong-item and empty-catalog failure diagnostics; comparison pairs retain preserved/regressed verdicts. |
| C19 | Commitment: Preserve supervision during the move. | slice 4 | observed: slice-4-evidence.md controlled publication and updated-use adapter journeys source the same evaluation/src supervisor; assert_no_retry observes supervised launch counts, truncated streams fail, retained host logs and failure status remain visible. |
| C20 | Commitment: Preserve retention during the move. | slice 4 | observed: slice-4-evidence.md native-delivery-updated-use and adapters assert retained record/events/responses/stderr/snapshots plus scratch cleanup on success, truncated streams and payload abort; admission replay checks retained artifact bytes stay unchanged. |
| C21 | Commitment: Preserve evidence identity during the move. | slice 4 | observed: slice-4-evidence.md final eight-check native-evidence-identity.sh exercises every writer input mutation; admission reuse observes current candidate identity and unchanged retained artifacts; all18 moved delivery inputs match base hashes. |
| C22 | Commitment: Provide the focused automated-check command `npm run test:evaluation`. | slice 7 |  |
| C23 | Commitment: Extend the existing Distribution Tests Intent source patterns. | slice 7 |  |
| C24 | Commitment: Keep evaluation-tool CI proof in the existing Distribution Tests Intent entry. | slice 7 |  |
| C25 | Commitment: Retain combined CI proof. | slice 7 |  |
| C26 | Commitment: Keep real native journeys explicitly invoked on demand. | slice 4 | observed: slice-4-evidence.md native entry --help and controlled default suites; inspected git-publication-native.sh native_flag guard exits after credential-free checks unless --native; moved ADR/family entries preserve explicit native options. Final test-only extraction remains G8/G11. |
| C27 | Commitment: Keep real A/B experiments explicitly invoked on demand. | slice 5 |  |
| C28 | Commitment: Continue using controlled hosts for routine automated checks. | slice 7 |  |
| C29 | Commitment: Continue using retained streams for routine automated checks. | slice 7 |  |
| C30 | Commitment: Update affected callers. | slice 7 |  |
| C31 | Commitment: Update affected discovery paths. | slice 7 |  |
| C32 | Commitment: Update affected documentation. | slice 7 |  |
| C33 | Commitment: Update affected evidence-recovery paths. | slice 5 |  |
| C34 | Commitment: Keep retained comparison records byte for byte. | slice 5 |  |
| C35 | Commitment: Keep baseline archives byte for byte. | slice 5 |  |
| C36 | Commitment: Preserve the original hashes of retained comparison records and baseline archives. | slice 5 |  |
| C37 | Commitment: Preserve their historical paths. | slice 5 |  |
| C38 | Commitment: Do not relabel an earlier observation through relocation. | slice 5 |  |
| C39 | Commitment: Do not make an earlier observation unrecoverable through relocation. | slice 5 |  |
| C40 | Commitment: Keep installation governed by the declared payload. | slice 7 |  |
| C41 | Commitment: Treat the new home as maintenance material under ADR 0004. | slice 7 |  |
| C42 | Commitment: Keep evaluation implementation outside installed runtime content. | slice 7 |  |
| C43 | Commitment: Keep evaluation cases outside installed runtime content. | slice 7 |  |
| C44 | Commitment: Keep retained evaluation streams outside installed runtime content. | slice 7 |  |
| C45 | Commitment: Keep evaluation automated checks outside installed runtime content. | slice 7 |  |
| C46 | Commitment: Document the new commands. | slice 7 |  |
| Q01 | Qualification: Terry approved naming `Distribution/evaluation/` as maintainer evaluation tooling. | slice 7 |  |
| Q02 | Qualification: That naming approval retains Distribution Tests as the shared Intent. | slice 7 |  |
| Q03 | Qualification: That naming approval retains Distribution Tests as the shared CI group. | slice 7 |  |
| Q04 | Qualification: A separate Intent entry may be considered later; this is an option, not a promise to create one. | slice 7 |  |
| Q05 | Qualification: Old command paths need no permanent compatibility layer; this does not prohibit a temporary layer. | slice 7 |  |
| Q06 | Qualification: Maintained callers must nevertheless be updated. | slice 7 |  |
| Q07 | Qualification: Historical evidence paths must nevertheless be preserved. | slice 5 |  |
| Q08 | Qualification: The separately queued comparison-harness corrections retain their own outcome. | slice 5 |  |
| Q09 | Qualification: Those corrections retain their own proof. | slice 5 |  |
| X01 | Exclusion: Add no new native host support. | slice 7 |  |
| X02 | Exclusion: Perform no new case qualification. | slice 7 |  |
| X03 | Exclusion: Conduct no new experiment. | slice 7 |  |
| X04 | Exclusion: Make no new performance claim. | slice 7 |  |
| X05 | Exclusion: Perform no release. | slice 7 |  |
| X06 | Exclusion: Make no installation change. | slice 7 |  |
| X07 | Exclusion: Create no separate Intent entry in this story. | slice 7 |  |
| X08 | Exclusion: Keep the separately queued comparison-harness corrections outside this story. | slice 5 |  |
| X09 | Exclusion: No paid session is required. | slice 7 |  |
| X10 | Exclusion: No paid session is authorized. | slice 7 |  |
| J01 | Trigger/example: Given an installed contributor toolchain, a maintainer can invoke `npm run test:evaluation`. | slice 7 |  |
| J02 | Journey promise: That invocation runs only the tool’s automated checks. | slice 7 |  |
| J03 | Journey promise: Those checks use controlled hosts. | slice 7 |  |
| J04 | Journey promise: Those checks use retained streams. | slice 7 |  |
| J05 | Failure example: A broken assessor fails that command. | slice 7 |  |
| J06 | Failure example: A broken runner fails that command. | slice 7 |  |
| J07 | Journey promise: That command does not start a real native host. | slice 7 |  |
| J08 | Trigger/example: An ordinary CI run runs guidance checks. | slice 7 |  |
| J09 | Journey promise: An ordinary CI run also runs evaluation-tool checks. | slice 7 |  |
| J10 | Journey promise: Their file results remain in the existing Distribution Tests proof. | slice 7 |  |
| J11 | Journey promise: Their Node-case results remain in the existing Distribution Tests proof. | slice 7 |  |
| J12 | Journey promise: Each check is scheduled once across its shares. | slice 7 |  |
| J13 | Trigger/example: Given an existing acceptance case, a maintainer explicitly invokes its new entry with the same host options. | slice 4 | observed: slice-4-evidence.md controlled updated-use adapter wrapper calls --native --case delivery/updated-use and dispatches actual moved entry; publication substitutes exercise same codex/cursor/claude host adapters; entry parser retains host guards. |
| J14 | Trigger/example: That invocation also retains the same case options. | slice 4 | observed: slice-4-evidence.md updated-use wrapper and publication journey suites retain actual case names, native_case_known rejection and per-host routing; README/acceptance.md commands name the moved entries and existing host/case options. |
| J15 | Journey promise: The invocation runs the same isolated journey. | slice 4 | observed: slice-4-evidence.md controlled publication/updated-use runners create actual isolated fixtures; assert_watched_empty and assert_attempt_layout verify no scratch remains and no adopter/candidate leaks into retained attempts. |
| J16 | Journey promise: The invocation retains the same assessment. | slice 4 | observed: slice-4-evidence.md publication assessor counterexamples, updated-use assessment-status assertions, admission replay and comparison preserved/regressed outcomes exercise the original assessors after relocation. |
| J17 | Journey promise: The invocation retains the same retained-result lifecycle. | slice 4 | observed: slice-4-evidence.md updated-use success/truncated/payload-abort assertions inspect result-path, record and concrete retained artifacts; operational admission replay preserves original artifact bytes and separates unavailable evidence. |
| J18 | Journey promise: An ordinary test command never starts that native journey. | slice 4 | observed: slice-4-evidence.md credential-free defaults and controlled-host journeys passed; inspected actual native_flag branch requires --native before run_native_host, with test-only extraction still explicitly owned by G8/G11. |
| J19 | Trigger/example: A maintainer can list the existing comparison catalog from the new entry. | slice 5 |  |
| J20 | Alternative trigger/example: A maintainer can filter that catalog from the new entry. | slice 5 |  |
| J21 | Journey promise: Listing or filtering selects the same cases. | slice 5 |  |
| J22 | Journey promise: Listing or filtering selects the same traits. | slice 5 |  |
| J23 | Trigger/example: A comparison is run when explicitly requested. | slice 5 |  |
| J24 | Journey promise: An explicitly requested comparison retains its existing quality-first verdict. | slice 5 |  |
| J25 | Journey promise: An explicitly requested comparison retains its existing limits. | slice 5 |  |
| J26 | Proof qualification: Controlled substitutes prove the relocation. | slice 5 |  |
| J27 | Proof qualification: That proof does not purchase native runs. | slice 5 |  |
| J28 | Trigger/example: A maintainer can recover a comparison record kept before the move through the new entry. | slice 5 |  |
| J29 | Journey promise: Recovery finds the original committed basis. | slice 5 |  |
| J30 | Journey promise: Recovery prints the original record unchanged. | slice 5 |  |
| J31 | Trigger/example: An immutable baseline archive remains reassessable after raw attempts are removed. | slice 5 |  |
| J32 | Journey promise: That reassessment retains the archive’s original provenance. | slice 5 |  |
| J33 | Trigger/example: The relocated tool can be present in release source when an ordinary supported installation runs. | slice 7 |  |
| J34 | Journey promise: Installed managed bytes remain as before. | slice 7 |  |
| J35 | Journey promise: Unrelated project content remains as before. | slice 7 |  |
| J36 | Journey promise: No evaluation material appears in installed output. | slice 7 |  |
