# Accepted proof records

Companion to [PLAN.md](PLAN.md) for SEED-192#read-playwright-proof. Holds
accepted-proof and behavior-review evidence referenced from each slice so the
plan file stays within the 250-line bound.

<a id="slice-1"></a>

**Slice 1 accepted proof (2026-11-04):**
`PATH=/opt/homebrew/bin:$PATH bash tests/payload-declaration-links.sh`
exit 0; `npm run --silent format` exit 0; post-change refactor shortened
`playwright-proof.md` to 250 lines without dropping examples 1–5 contract
points; source review retained as `source-review.md` with slice 1
commitments 1, 1a, 1b, 1c, 5l, 16c observed.

**Slice 1 behavior review (AGENTS.md, 2026-11-04, agent YeongSheng-chan):**
Walked story key examples 1–5 against
`src/skills/dough-test-optimization/references/playwright-proof.md` as
written for the recording project's agent (re-walked after the 250-line
shorten). Outcome: usable for each; no gap that blocks configuring the
option, extending a reporter, or declaring the location from the
reference alone.

1. **Explicit focused recording** — Covered: `RECORD_PLAYWRIGHT_PROOF=1`
   off in every profile including CI; normal runs leave proof untouched;
   configured `reporter` list and `--reporter` replacement warning;
   declaration example with `runner: "playwright"`, `proof` and
   `proofGeneration.command` using the illustration command; identity
   with `file` from the file suite, `test` as title path, `project`
   omitted when projects are disjoint; `attempts` / `commit` /
   `fileBlob`; recorder prints nothing and never changes exit. Option-off,
   `--list`, CI and full-suite non-recording follow from the off-by-default
   and "normal runs leave untouched" rules.
2. **Retries and repetitions fold** — Covered: final-attempt rule;
   `attempts` = final retry index + 1; `durationMs` sums attempt
   durations; `--repeat-each` and other same-identity executions fold as
   the Vitest reference (one observation; fail clears for the rest of the
   run).
3. **No verdict keeps / verdict clears** — Covered: keep for `skipped`
   (`test.skip`, `test.fixme`, body `skip()`), `interrupted`, unselected
   (selection / project / shard / split) and unreached; clear for
   `failed`, `timedOut`, `test.fail` and printed-output passes under the
   strict `passed` + expected `passed` + empty stdout/stderr rule.
4. **Projects** — Covered: record `project` only when more than one
   configured project selects the file; omit when projects select disjoint
   files; reading section shows one row per observed project.
5. **Nested runs** — Covered: strip `RECORD_PLAYWRIGHT_PROOF` from nested
   runs of the real configuration; fixture projects record only in their
   own temporary checkout via covered-location resolution from that
   checkout's `.planning/open-dough.json`.

<a id="slice-2"></a>

**Slice 2 accepted proof (2026-11-04):** store unit test; focused
`proof-snapshot-*.spec.ts` + proof-record + quiet-reporter (34 passed);
`typecheck:dashboard`; Ex1 recording of
`dashboard/tests/{intent-proof-generation,accessible-board-touch}.spec.ts`
→ 7 observations in `dashboard/tests/proof/latest.json`; non-recording /
`--list` / focused / full suite leave snapshot byte-identical; full suite
under `caffeinate -s -i` on AC Power exit 0 (~64m). Reference gaps fixed:
canonicalize paths before `path.relative` (macOS `/var` vs `/private/var`);
prefer unique repo-relative paths for focused recording (basename filters
are Playwright substrings).

<a id="slice-3"></a>

**Slice 3 accepted proof (2026-11-04):** unit
`intent-vitest-cases` / templates / `intent-proof-runner` /
`intent-playwright-cases`; focused Intent journeys including
`intent-playwright-proof.spec.ts` (21 passed with vitest/cucumber/pytest
absence); `typecheck:dashboard`; full dashboard suite under
`caffeinate -s -i` on AC Power exit 0 (~121m).

<a id="slice-4"></a>

**Slice 4 accepted proof (2026-11-04):** At revision
`2507688594efdaab9d4b97a59dd79c02270b8904` (story tip holding slices 2–3),
through this checkout's dashboard build on port 4174 (production 4173 still
lacks the playwright registration until land):

- Authenticated `intent=locations` for Open Dough: `dashboard/tests` has
  `runner: "playwright"`, proof path `dashboard/tests/proof`, **7**
  observations (3 in `accessible-board-touch.spec.ts`, 4 in
  `intent-proof-generation.spec.ts`), **720** listed files (266 under
  `boundary/`). Cold locations read **~4830 ms**, **1**
  `__authenticated-read?intent=locations` HTTP round-trip (server-side tree
  + proof blobs). Cached repeat **~35 ms**.
- `observedRowsOf` + playwright kind on published sources: all three
  `touch reading > …` rows at lines 42 / 129 / 177 attach successful proof;
  `agent-completion-quiet.spec.ts` lists **0** rows (loop-generated names)
  while its passes remain only in the snapshot — count line over listed
  rows only.
- `boundary/` folder (266 `*.spec.ts`): **660** listed test-case rows,
  **0** with successful proof in the focused first snapshot (expected —
  snapshot covers only example 1's two files).
- Root-summary learning: opening Purpose/Proof for the whole
  `dashboard/tests` location still implies one file-text read per listed
  path on top of locations; a full 720-file authenticated path sweep from
  the browser agent timed out past the MCP bound, so the durable learning
  recorded here is the locations cost above plus file-count **720**.
  Terry's quiet-reporter-plus-editor product judgment remains for the
  execution-complete record after trunk carries this tip (production
  Intent UI today pins `origin/main` / f750cd2 without the snapshot).
