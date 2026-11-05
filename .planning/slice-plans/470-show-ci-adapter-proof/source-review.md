# Source review — SEED-236#show-ci-adapter-proof

Launched 2026-11-05 by the execution coordinator (steven-chan session) as a fresh general-purpose
agent with no conversation inheritance. Input: only the selected story's Goal, Scope (including
Preserved, Deferred promises and Boundary assumptions) and Key examples, verbatim from
`.planning/seeds/SEED-236-show-ci-adapter-proof.md#show-ci-adapter-proof` (sha256 of the extracted
text 5d38cd9b…3f59). It was told to read no project files and change nothing. Its notes: examples
illustrate promises, not rejection rules; 4d.1's forms (failed, timed out, nonzero, invalid JSON)
are one display reason and also cover 2f; B3 and 4a are the same check; X1 is shown as 4d.5.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | A developer who opens **Intent → CI status** for a project whose CI is read through a `ciAdapter` sees, below the verdict, the proof counts and parts that the displayed attempt published | slice 3 | |
| G1.q | ...as GitHub Actions projects already do (parity with the existing GitHub Actions display) | slice 3 | |
| G2 | When there is no proof to show, one line says why | slice 3 | |
| G3 | When there is no proof to show, the verdict is unchanged | slice 3 | |
| G4 | Pygardon is the first such project; its controller identifies attempts with UUIDs (so adapter attempt IDs may be non-numeric text) | slice 2 | |
| G5 | `SEED-20261076#publish-pygardon-ci-proof` consumes this story's release to complete its live Intent check | slice 5 | |
| 1a | The CI proof collector accepts a CI-adapter attempt identity | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-summary.test.mjs 'the command line writes an adapter attempt's fragment and summary…' and '…refuses … naming both attempt identities or neither, without writing' |
| 1b | A fragment can name the adapter's `attemptId` as text, with the full revision and the repository, in place of the GitHub Actions `runId` and `runAttempt` integers | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-fragments.test.mjs 'an adapter attempt's identity names its fragment by attemptId'; CLI --attempt-id fragment included by attemptId in src/skills/dough-test-optimization/scripts/ci-proof-summary.test.mjs 'the command line writes an adapter attempt's fragment and summary…' |
| 1c | A summary can name the adapter's `attemptId` as text, with the full revision and the repository, in place of `runId`/`runAttempt` | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-summary.test.mjs written summary names O/P, attemptId, revision, no runId, summaryProblems []; src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs 'an adapter attempt's summary names its attemptId…' |
| 1d | `summarize` collects only fragments of that same attempt and revision, as it does for a GitHub Actions attempt | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs 'an adapter attempt's summary … keeps only fragments of that attempt and revision' and 'an earlier attempt's, an adapter attempt's or another revision's fragment is excluded…'; CLI exclusion notes in src/skills/dough-test-optimization/scripts/ci-proof-summary.test.mjs |
| 1e | A GitHub Actions summary written by an already copied collector stays valid | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs example-1 GitHub summary deepEqual unchanged; dashboard intent-ci-proof*.spec.ts (7 passed) validate collector-built GitHub summaries via ciProofArtifact.ts summaryProblems |
| 2a | The CI adapter protocol gains a `proof` operation | slice 2 | |
| 2b | The `proof` request names the check and the attempt (`runId`, `attemptId`, `sha`), as `diagnose` does | slice 2 | |
| 2c | `proof` answers either with the attempt's summary... | slice 2 | |
| 2d | ...or with `unavailable` and a reason | slice 2 | |
| 2e | The existing per-invocation timeout and stdout limit apply to `proof` | slice 2 | |
| 2f | A summary that exceeds the timeout or stdout limit reads as unreadable | slice 3 | |
| 2g | `discover` is unchanged | slice 2 | |
| 2h | `diagnose` is unchanged | slice 2 | |
| 2i | The execution observer is unchanged; the observer never asks for proof | slice 2 | |
| 3a | The CI status judgment of a `ciAdapter` project keeps the shown attempt's identity (today it is stripped) | slice 2 | |
| 3b | The tab reads that attempt's proof through the project's adapter, run from the project folder like `discover` | slice 2 | |
| 3c | The proof read happens apart from the judgment, so a slow or failed proof read never delays the verdict | slice 3 | |
| 3d | ...and a slow or failed proof read never alters the verdict | slice 3 | |
| 3e | A running result's proof is its completed ancestor's, as for GitHub Actions | slice 2 | |
| 4a | The tab shows the summary only when its repository, `attemptId` and full revision equal the displayed attempt's | slice 3 | |
| 4b | ...and no other discovered attempt has that same `attemptId` and revision | slice 3 | |
| 4c | A numeric adapter `attemptId` matches the summary's text form of it | slice 2 | |
| 4d | Otherwise one line says why Proof is unavailable, for these reasons: | slice 3 | |
| 4d.1 | The adapter answered no proof read (it failed, timed out, exited nonzero or answered invalid JSON, as an adapter without the operation does), with its error | slice 3 | |
| 4d.2 | The adapter's own `unavailable` reason | slice 3 | |
| 4d.3 | The summary is not a valid summary | slice 3 | |
| 4d.4 | The summary names another repository, attempt or revision | slice 3 | |
| 4d.5 | The attempt is ambiguous at its revision | slice 3 | |
| 4e | Each reason follows ADR 0008: missing or conflicting evidence is never shown as a negative result | slice 3 | |
| 5a | The adapter manual documents the `proof` operation | slice 4 | |
| 5b | The adapter manual documents the `proof` operation's answers | slice 4 | |
| 5c | The CI proof summary reference tells an adapter project how to write fragments and its summary inside its own CI job with the adapter identity | slice 4 | |
| 5d | The CI proof summary reference tells an adapter project how its adapter serves the summary, instead of stopping at `ciAdapter` | slice 4 | |
| 6a | Once the changes land on `main`, publish an Open Dough release (the next patch version, through `release-version`) | slice 5 | |
| 6b | The release contains the collector, protocol and guidance, so Pygardon can install them with `dough-update` | slice 5 | |
| 6c | The tab itself reaches the production dashboard from `main` (not via the release) | slice 5 | |
| P1 | The GitHub Actions artifact reader is preserved | slice 3 | |
| P2 | The GitHub Actions run identity is preserved | slice 3 | |
| P3 | The GitHub Actions reasons are preserved | slice 3 | |
| P4 | The GitHub Actions requests are preserved | slice 3 | |
| P5 | The verdict of every project is preserved | slice 3 | |
| X1 | Exclusion: proof for an adapter whose attempt IDs repeat across runs at one revision (shown as ambiguous instead) | slice 3 | |
| X2 | Exclusion: structured adapter reason codes beyond the adapter's own text | slice 3 | |
| X3 | Exclusion: proof history across attempts | slice 3 | |
| X4 | Exclusion: the launch's base-CI confirmation showing proof | slice 3 | |
| X5 | Exclusion: updating the copied collector or adapter in other projects (each project's own `dough-update` and story) | slice 5 | |
| X6 | Exclusion: the live Pygardon check (owned by its own story) | slice 5 | |
| B1 | Boundary assumption: the summary is labelled by the attempt that wrote it | slice 4 | |
| B2 | The adapter checks the summary against its CI service's attempt record | slice 4 | |
| B3 | The tab checks it again against the attempt it displays | slice 3 | |
| B4 | The counts are as trustworthy as the project's CI job | slice 4 | |
| B5 | The dashboard keeps nothing beyond the request (no persisted proof) | slice 3 | |
| E1.s | Setup: `ciAdapter` project; newest attempt `9f1c…` (UUID) passed at `R`; adapter answers the proof read with a summary naming the same repository, `attemptId` `9f1c…` and `R`, `tests` 1,000 passed, 0 failed, 3 other, part 1 of 1 present | slice 2 | |
| E1.r | Result: tab shows Passed, the attempt and short revision, and that `tests` row | slice 2 | |
| E2.s | Setup: attempt `A` failed at `R`; retry `B` passed at `R` | slice 3 | |
| E2.r1 | Result: tab shows `B`'s verdict and `B`'s proof | slice 3 | |
| E2.s2 | Variant: the adapter answers `B`'s read with `A`'s summary | slice 3 | |
| E2.r2 | Result: Proof says it names another attempt and shows no counts | slice 3 | |
| E3.s | Setup: branch head's attempt still running; its parent's attempt finished | slice 2 | |
| E3.r | Result: tab shows the running result beside the completed ancestor's verdict and that ancestor attempt's proof | slice 2 | |
| E4.s | Setup: the project's adapter predates `proof` and exits nonzero for it | slice 3 | |
| E4.r1 | Result: the verdict reads as before | slice 3 | |
| E4.r2 | Result: Proof says the adapter answered no proof read, with its error | slice 3 | |
| E5.s | Setup: adapter answers `{"unavailable": "no summary retained"}` for a pruned attempt | slice 3 | |
| E5.r | Result: Proof shows that reason; the verdict is unchanged | slice 3 | |
| E6.s | Setup: two discovered attempts from different runs both have `attemptId` `1` at `R`; the tab displays one of them | slice 3 | |
| E6.r | Result: Proof says the attempt is ambiguous at its revision and shows no counts | slice 3 | |
| E7.s | Setup: a GitHub Actions project's tab | slice 5 | |
| E7.r | Result: shows its run's proof from the `ci-proof-summary-attempt-<n>` artifact exactly as before | slice 5 | |
