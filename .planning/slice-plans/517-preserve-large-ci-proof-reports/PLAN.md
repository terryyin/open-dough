# Preserve large CI proof reports and surface size failures

**Identity:** SEED-267#preserve-large-ci-proof-reports

**Source:** [Preserve large CI proof reports and surface size failures](../../seeds/SEED-267-preserve-large-ci-proof-reports.md#preserve-large-ci-proof-reports)
**Source review:** [source-review.md](./source-review.md)

## Goal and boundaries

Developers reviewing CI proof in Intent see complete adapter proof reports up
to the collector contract's 1 MiB summary read limit, and recognize a proof
that a size limit kept from being read, from either proof source, as an
error rather than as absent proof. The seed's scope and key examples are the
source; this plan adds no promise.

Exclusions, from the seed: no change to the summary schema, the collector's
fragments or summarizing, or how proof sources are chosen; other unavailable
reasons keep their presentation; every non-proof adapter answer keeps 64 KiB;
Pygardon's own adapter change belongs to that project.

## Current decisions

- **The proof limit stays where it is owned.** `SUMMARY_READ_LIMIT_BYTES` in
  `src/skills/dough-test-optimization/scripts/ci-proof-contract.mjs` (1 MiB)
  becomes the limit for any CI proof summary Intent reads; its comment and
  the collector's over-limit warning in `ci-proof-summary.mjs` stop naming
  only GitHub Actions. No second constant.
- **The adapter runner takes its answer limit per call.** `runAdapter` in
  `src/skills/dough-execute-plan/scripts/ci-command-run.mjs` gains an
  `answerBytes` option defaulting to `adapterResponseBytes` (64 KiB);
  `readCommandProof` passes through an optional `answerBytes`. Only the
  dashboard asks `proof`, so `dashboard/server/ciAdapterProof.ts` passes
  `SUMMARY_READ_LIMIT_BYTES`, which it can import as `ciProofArtifact.ts`
  does; the execute-plan scripts import nothing from test optimization.
  Discover, diagnose and the observer keep the default.
- **A size failure is its own unavailable reason.** `ciProofUnavailableReasons`
  in `dashboard/src/ciProof.ts` gains a too-large reason whose answer carries
  the limit in bytes and the actual size in bytes when known, so wording is
  formatted once in `dashboard/src/ciProofAbsenceWording.ts` for the CI
  status line, the adapter line, the build lines used by the Story Branch
  comparison and the Landed equivalent and later-trunk lines. Sizes read in
  KiB or MiB to one decimal. The adapter read reports it on
  `ERR_CHILD_PROCESS_STDIO_MAXBUFFER` without a size; the GitHub Actions read
  reports it with the zip entry's uncompressed size when `onlyZipEntry`
  finds the entry over the limit (`dashboard/server/zipEntry.ts` gives that
  case a distinguishable error), and with the artifact's listed size when
  the listing check refuses it first.
- **Prominence reuses the problem styling.** The shown-proof state
  (`dashboard/src/useIntentCiShownProof.ts`) marks a too-large line as a
  problem; `IntentCiProof.tsx` and `IntentScopeProof.tsx` render it with
  the existing `--problem` / `--problem-soft` tokens as `frame-states.css`
  `.read-problem` does, and the words alone still say it is a size failure.
  Quiet absence lines are unchanged.
- **Coordination.** Plan 515 (SEED-266, Taken) adds an adapter `jobs`
  operation under the same 64 KiB limit and moves `failureOf` out of
  `ciAdapterProof.ts` to share it. Rebase on whatever lands first; `jobs`
  keeps the default limit, and the shared failure wording names the limit
  the call used.

## Outside-in proof

| Promise | Owner | Required observation |
| --- | --- | --- |
| Seed example 1: a 157 KiB-class adapter summary with file breakdowns is shown whole | Slice 1 | `dashboard/tests/intent/intent-ci-proof-adapter.spec.ts`: the fixture adapter answers a valid, matching summary built by the collector with `--by-file` for 1,213 files (over 64 KiB, asserted in the spec); Proof shows its `tests` row with 1,213 passed and no unavailable line, and Check again asks no second `proof`. This case failed with "its answer is longer than 64 KiB" before the change (premise below). |
| Seed example 4 and the runner's limits | Slice 1 | `src/skills/dough-execute-plan/scripts/ci-command-adapter-proof.test.mjs`: a `proof` answer over 64 KiB is accepted with `answerBytes` of 1 MiB and refused (`maxBuffer`) above it; a `discover` answer over 64 KiB is still refused. |
| Guidance: complete summary, `--by-file` within 1 MiB | Slice 1 | `custom-ci-proof.md`, `custom-ci.md` (the per-call limit sentence names the proof exception) and `ci-proof-summary.md` say the proof limit is 1 MiB, that a successful answer carries the complete summary and is never trimmed or replaced by `unavailable` for size; the 64 KiB `--by-file` advice is gone. `ci-proof-breakdown-summary.test.mjs` asserts the collector warning's new wording. |
| Seed example 2: an adapter answer over 1 MiB is a prominent size error | Slice 2 | `dashboard/tests/intent/intent-ci-proof-adapter-reasons.spec.ts`: the oversized case's line says the proof is larger than the 1 MiB proof limit, carries the problem styling (asserted through the line's class or computed border colour), shows no counts and leaves the verdict; the `unavailable: "no summary retained"` case (seed example 5) keeps its quiet line without that styling. |
| Seed example 3: a GitHub Actions summary over 1 MiB names its size | Slice 2 | `dashboard/tests/intent/intent-ci-proof-reasons.spec.ts`: a run whose artifact holds a 1.3 MiB summary shows the too-large line naming 1.3 MiB and the 1 MiB limit with the problem styling. `tests/support/dashboard-ci-proof-breakdown-read.test.mjs` asserts the zip entry problem carries the entry's size. |
| Same words wherever a build's proof cannot be used | Slice 2 | `dashboard/tests/intent/intent-ci-comparison-adapter-gaps.spec.ts`: an endpoint whose adapter proof is over the limit shows the build line's too-large words in its cell. `npm run typecheck:dashboard` enforces a line for the new reason in every reason table. |

## Decisive premises

| Consuming operation | Observation | Result |
| --- | --- | --- |
| Slice 1: a proof answer over 64 KiB reaches Intent intact once the runner limit is 1 MiB; slice 1's spec discriminates | 2026-11-08 at `662d3f63f`, this worktree: scratch spec in `dashboard/tests/intent/` (removed) used `adapterProject` and answered a `summarize`d summary from `fragmentsFromOutcomes(..., { byFile: true })` for 1,213 files (131,455 answer bytes); ran `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config playwright.config.ts tests/intent/scratch-large-adapter-proof.spec.ts --reporter=list` from `dashboard/`, then again with `adapterResponseBytes` scratch-set to `1024 * 1024` (reverted) | Before: Proof showed "This attempt's CI adapter answered no proof read: its answer is longer than 64 KiB." and the spec failed. After: Proof showed the `tests` row with 1213 passed checks and the spec passed (4.7 s). No server-to-browser size limit intervened. |
| Slice 2: the adapter read stops at the limit with a recognizable error | 2026-11-08, Node 24.21.0: `execFile` with `maxBuffer: 65536` on a child writing 200,000 bytes | Rejected after 27 ms with `ERR_CHILD_PROCESS_STDIO_MAXBUFFER` and 65,536 bytes of stdout; the actual size is not known, so the adapter line names only the limit. The existing oversized reasons case already observes this through the dashboard. |
| Slice 2: the GitHub Actions read refuses a 1.3 MiB summary at the zip entry, where its size is known | 2026-11-08 at `662d3f63f`, Node 24.21.0 strip-types: a job-tmp script imported `onlyZipEntry` from `dashboard/server/zipEntry.ts` and `zipOf` from `dashboard/tests/support/ciProofArtifacts.ts`, zipped a 1,363,148-byte `ci-proof-summary.json` and read it with the 1 MiB limit | The archive was 1,478 bytes, so the listing's `size_in_bytes` check would not refuse it; `onlyZipEntry` threw `ZipEntryProblem` "ci-proof-summary.json is larger than 1048576 bytes" from the central directory's uncompressed `size` before inflating. The size is in scope there but not yet reported; slice 2 reports it. |

## Local gates

Follow the [test automation rules](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).
Arrange data through MakeMe where a domain builder exists (the proof
summaries come from the collector, as the existing fixtures build them),
never sleep, never use `test.slow()`, and keep default timeouts. For longer
runs on awake macOS with AC power, use `caffeinate -s -i` with Homebrew Bash
first on `PATH`; on battery follow the lid-open procedure.
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)

Each slice runs, with `NO_COLOR`, `FORCE_COLOR` and
`GIT_ALTERNATE_OBJECT_DIRECTORIES` unset:

- `bash scripts/test.sh` on `src/skills/dough-execute-plan/scripts/ci-command-adapter*.test.mjs`,
  `src/skills/dough-test-optimization/scripts/ci-proof-*.test.mjs`,
  `tests/support/dashboard-ci-*.test.mjs` and
  `tests/support/dashboard-later-trunk-landed.test.mjs`;
- `npx playwright test --config dashboard/playwright.config.ts` on every
  `dashboard/tests/intent/intent-ci-proof*.spec.ts`,
  `intent-ci-comparison*.spec.ts` (including the skipped and
  cancelled-landing specs that show the Landed equivalent and later-trunk
  lines) and `intent-summary-ci-proof*.spec.ts` (the proof read, its reasons
  and the shown-proof state they share change);
- `npm run typecheck:dashboard`.

Hosted CI runs the full suites after publication; no full local suite is
required because the change stays inside the proof reads, the adapter
runner's per-call limit and the proof wording.

## Slices

### 1. Adapter proof up to 1 MiB reaches Intent whole

Type: Behavior

Status: done

Proof: seed examples 1 and 4 and the guidance, as mapped above.

Behavior: an adapter answers `proof` with a valid, matching summary larger
than 64 KiB and within 1 MiB → the developer opens Intent's CI status →
Proof shows that summary's entries and totals, with its file breakdown kept,
and remembers it; a `discover` answer over 64 KiB is still refused. Includes
the runner's per-call `answerBytes`, the dashboard passing the contract
limit, the failure line naming the limit the call used, the contract
comment and collector warning, and the adapter and collector guidance.

Accepted proof (reuse):
- `PATH=/opt/homebrew/bin:$PATH env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i bash scripts/test.sh` on `ci-command-adapter*.test.mjs`, `ci-proof-*.test.mjs`, `dashboard-ci-*.test.mjs`, `dashboard-later-trunk-landed.test.mjs` — pass (post-refactor).
- From `dashboard/`: Playwright on `intent-ci-proof-adapter.spec.ts` and `intent-ci-proof-adapter-reasons.spec.ts` — 7 passed, including “over 64 KiB… remembered” with 1,213 passed checks and Check again asking no second `proof`.
- `npm run typecheck:dashboard` — pass.
- Learning: reasons fixtures that pad past the proof limit must exceed 1 MiB now that proof uses `SUMMARY_READ_LIMIT_BYTES`; interim quiet line names 1024 KiB until slice 2.

### 2. A proof over the limit is a prominent size error

Type: Behavior

Status: planned

Proof: seed examples 2, 3 and 5 and the shared build lines, as mapped above.

Behavior: an adapter answer passes 1 MiB, or a GitHub Actions run's summary
is over 1 MiB → the developer opens the attempt's or run's Proof, the
selected scope's Summary, or the Story Branch comparison → one line says the
proof is larger than the 1 MiB proof limit, with its size when known, styled
as a problem where Proof and Summary show it, distinct from "published no CI
proof summary"; no counts are shown and nothing is remembered. Includes the
too-large reason with its limit and size, both readers reporting it, the
zip entry's size on its error, the wording tables, the shown-proof problem
mark and its styling, and the custom-ci-proof manual's description of how
an oversized answer is shown.

## Plan concerns

Slice-plan refinement was not needed: two Behavior slices with independent
proof loops (a large answer accepted versus an oversized one reported), each
with its own spec cases. No slice-specific concern remains.

Accepted interim behavior: until slice 2, an adapter answer over 1 MiB shows
the existing quiet "answered no proof read: its answer is longer than
1024 KiB" line, and an oversized GitHub Actions summary keeps its current
"could not be opened" line. Slice 2 replaces both.

## Story obligations

### G1. No proof summary schema change
Reported: slice 1 — "No change to the proof summary schema."
Story clause: "No change to the proof summary schema"
Disposition: excluded "No change to the proof summary schema, its collector, or how proof sources are chosen"
Commitment: 7.1

### G2. No proof summary collector change
Reported: slice 1 — "No change to the proof summary collector."
Story clause: "its collector"
Disposition: excluded "No change to the proof summary schema, its collector, or how proof sources are chosen"
Commitment: 7.2

### G3. No proof-source selection change
Reported: slice 1 — "No change to how proof sources are chosen."
Story clause: "how proof sources are chosen"
Disposition: excluded "No change to the proof summary schema, its collector, or how proof sources are chosen"
Commitment: 7.3

### G4. Other unavailable reasons keep presentation
Reported: slice 1 — "Other unavailable reasons keep their current presentation."
Story clause: "Other unavailable reasons keep their current presentation"
Disposition: excluded "Other unavailable reasons keep their current presentation"
Commitment: 7.4

### G5. Pygardon adapter change deferred
Reported: slice 1 — "Pygardon's own adapter change to stop stripping belongs to that project, after it updates its Open Dough guidance."
Story clause: "Pygardon's own adapter change to stop stripping belongs to that project, after it updates its Open Dough guidance"
Disposition: excluded "Pygardon's own adapter change to stop stripping belongs to that project, after it updates its Open Dough guidance"
Commitment: 7.5

### G6. Prominent size error deferred to slice 2
Reported: slice 1 — "until slice 2, an adapter answer over 1 MiB shows the existing quiet line, and an oversized GitHub Actions summary keeps its current could not be opened line"
Story clause: "When a proof is over that limit, from either source, Intent shows it under the affected attempt's or run's Proof as an error, styled as an evidence problem rather than the quiet line of "published no CI proof summary""
Disposition: interim until slices 2
Commitment: 2, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.2, 5.3, 6.2, 8.4, 8.5, 8.6, 10, 11
