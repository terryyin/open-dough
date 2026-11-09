# Slice 2 folder and file history

Failure policy: [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests), applied as written. Base `d4130605530aa4aed22c3d2be0e7ff5ff89ad968`. Root owns planning, independent refactor, formatting, staging and delivery.

## Implemented outcome

`IntentFileProof` now follows the existing `IntentScopeProof` composition: its unchanged comparison/single-proof/no-owner/unavailable content lives in `FileProofContent`, and one outer wrapper renders that content plus `IntentScopeTimingHistory(path)`. All four content returns therefore share the same independent local-history placement. No backend projection, reader, unit rule, collector or live recovery changed.

The existing real-artifact fixture owner now has one shared Actions serving function, `serveCollectedScopeProofs`, for actual serialized CLI output. `serveCollectedScopeFileRuns` compiles explicit case/file facts through existing `collectedSummary`/`playwrightRecord`; existing `serveCollectedScopeRuns` delegates its unchanged root-file facts. The same router, run builder, artifact bytes and identity dispatch remain. File times convert explicit milliseconds to the outcomes wire's seconds.

Added two actual collector-to-Done browser journeys and two supplemental MakeMe projection cases. Maintained CI comparison documentation now names folder Summary/file Proof history, hidden descendants and local navigation.

## Source commitments and decisive observations

| Commitments | Trigger/setup → observed result |
| --- | --- |
|3,4: folder Summary and file Proof | Real CLI publication, recorded P/E/R and actual acquired artifacts; selected Done E. Entry case700/file70→1500/150; folder300/30→900/90; nested/file-c200/20→400/40; file-a100/10→0/0. Each rendered scope has two common build rows, E selected, R omitted, independent unit charts/links. |
|9,10,11: navigation and existing readings | Main journey traverses entry→folder→nested→file Proof→another file Proof→Purpose→Proof. Story A, modified file selection and compact comparison remain. Existing 21 browser consumers preserve changed/unchanged source, rename comparison, gaps, Taken/live single proof and Purpose/Proof behavior. |
|43,44,70: breakdown | Actual entry-only P publishes complete case700/file70 without breakdown: entry keeps both numbers; folder and file explain no file breakdown. Actual older-trunk T publishes case part1of2 and complete file20: folder/file show partial case reason, no200ms substitute, file20 remains measured. Ecase0/no file unit keeps earlier file20 and selected file gap/annotation. |
|45,46,55: descendants and membership | E's proof includes folder/ghost500case/50file while its published tree has no ghost control. Folder900/90 includes ghost and nested contribution, whereas P300/30 has no ghost. Supplemental matching case adds root and folder-other traps, independently expecting300→900 and30→90. The common renderer labels the scope observed at each build; no fixed-membership or attribution claim. |
|49: measured zero | Actual E file-a has independent case0/file0 and both remain measured in the file history; gap variation Ecase0 remains numeric while absent file unit stays a gap. |
|53,54: evidenced path/owner, no inferred rename | New MakeMe case supplies a matching parent with9999 plus a longer owner containing only former path: history does not borrow the parent. It retains earlier10, gap, later30 in another segment, selected expired gap with no ms. Existing renamed comparison browser case remains green; file history receives the current repository path only, never baseline rename mapping. |
|56: existing rename comparison | Existing file comparison variants and later-trunk rename journey pass unchanged alongside the new history placement. Their comparison-specific rename handling is not reused by history. |
|86,87: local drill and revisit | Both new actual journeys first observe collector persistence and stop collection via existing reader restart. Initial enclosing comparison finishes before Actions count. Every scope drill/Purpose/Proof revisit leaves that count unchanged; no history response or resulting retained proof is injected. |

`earlier` in the gap variation is completion's actual first parent, asserted distinct from P and branchSide and with merge-base(P,earlier)=P. The real collector persists order P/T/E/R before browser reading. No synthetic reordering makes branchSide into trunk.

## Honest red and repairs

- First baseline command selected one test but stopped on a fixture selector ambiguity: separate declared-unit child rows repeat the same navigation control. Changed only navigation to the `.first()` convention used by existing units journeys, because both controls open the same path; all numeric, common-row, provider and source facts remain unchanged.
- Renewed baseline, before any product edit, reached file Proof and failed because its `Test execution time history` region was absent. Session80860 exit1; actual retained report `dashboard/test-results/2026-11-09T12-35-32.415Z-35326/report.txt`, failure at file-history assertion spec78. Entry, folder and nested assertions had already passed. Root independently inspected this report and accepted the meaningful red.
- The renewed red reused the first external proof-record path, which correctly refused EEXIST. Therefore `/tmp/trace-proof-285-slice2-file-red.json` describes only the earlier selector failure, not the meaningful file-history red. The real second terminal/default report and trace above are the evidence. No red rerun was invented to replace that fact; later commands use new unique record paths.
- After the red, the same literal file arrays/declarations/order/timings moved into the shared producer helper and the outer file wrapper was added. Independent expected entry/folder/file values stayed unchanged. Green actual payload and rendered expectations confirm that this is the same case.
- Initial typecheck diagnosed exact-optional tuple `number|undefined` vs optional number in fixture delegation. The tuple now explicitly permits the pre-existing undefined value, with no runtime change. Final isolated typecheck90730 exits0. No failing or flaky test remains, and no timeout/retry/assertion was weakened.

## Literal terminal proof

Before heavy proof:20:31SGT, AC power,48GiB host, load2.87/3.07/3.39 and58% memory free. Root confirmed no competing heavy proof. All Playwright runs use one worker under `caffeinate -s -i`; each new actual publication/collector test has its own justified60s timeout (the established real journey previously consumed29.8s before navigation). No suite/group/hook timeout or `test.slow`, sleep or rerun-until-green.

Baseline after selector repair:

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/trace-proof-285-slice2-file-red.json caffeinate -s -i npm run test:dashboard -- tests/intent/intent-scope-collected-file-timing-history.spec.ts --workers=1
```

Session80860 terminal1, one actual file-history absence. External record refused EEXIST as qualified above; default report/trace retained. Preceding `--list --reporter=list` selected1test/1file (session61290).

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/trace-proof-285-slice2-file-green.json caffeinate -s -i npm run test:dashboard -- tests/intent/intent-scope-collected-file-timing-history.spec.ts --workers=1
```

Session68454 terminal0. Parsed custom record: completed, selected1, strictpassed, one expected-passed execution and passed retry0 attempt,22.59s. Main actual artifact-to-folder/file/Proof/Purpose journey.

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/trace-proof-285-slice2-consumers.json caffeinate -s -i npm run test:dashboard -- tests/intent/intent-scope-collected-file-timing-gaps.spec.ts tests/intent/intent-scope-collected-timing-history.spec.ts tests/intent/intent-summary-story-comparison.spec.ts tests/intent/intent-summary-story-comparison-file.spec.ts tests/intent/intent-summary-story-comparison-outside.spec.ts tests/intent/intent-summary-story-comparison-gaps.spec.ts tests/intent/intent-summary-story-comparison-renamed.spec.ts tests/intent/intent-summary-ci-proof-gaps.spec.ts tests/intent/intent-file-purpose-proof.spec.ts --workers=1
```

Identical preceding list selected17tests/9files. Actual session93648 terminal0: all17strictpassed, no skips/retries,120.56s. Includes actual artifact gap variation, old collected entry consumer and15 existing enclosing comparison/gap/rename/live Proof cases.

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/trace-proof-285-slice2-file-remaining.json caffeinate -s -i npm run test:dashboard -- tests/intent/intent-summary-story-comparison-fallback.spec.ts tests/intent/intent-summary-story-comparison-source.spec.ts --workers=1
```

Session65776 terminal0. Parsed custom record: selected5, all5strictpassed, no skips/retries,35.69s. These directly reached file-Proof cases preserve unused-Landed/Provisional framing and exact historical source read counts. Together the three passing records contain23distinct browser cases.

```sh
node --test --test-concurrency=1 tests/support/intent-ci-scope-history-matching.test.mjs
npm run typecheck:dashboard
```

Child focused Node terminal0,2pass/0fail/0skip,128ms (c2751d). Supplemental already-supported projection checks, not a claim of new acquisition or failing-first proof. Final standalone typecheck session90730 terminal0 after all runtime/helper edits. Existing untimed/unit/no-breakdown timing matrices from accepted slice1 remain reusable: this slice changes none of their projection, timing, unit or store code.

## Directed consumer dispositions

Final installed trace session75373 terminal0:

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/trace-a-done-story-s-timing-history-into-test-pr --base d4130605530aa4aed22c3d2be0e7ff5ff89ad968 --term IntentFileProof --term FileProofContent --term IntentScopeTimingHistory --term serveCollectedScopeRuns --term serveCollectedScopeFileRuns --term serveCollectedScopeProofs > /tmp/trace-proof-285-slice2-consumers-final.md
```

| Reached consumer/owner | Disposition |
| --- | --- |
|`IntentFileProof` → `IntentFileReading`/selected file panel/kept Purpose-Proof place | API shape and content preserved; one shared history wrapper across all content returns.23browser cases cover new actual file path, existing changed/unchanged/renamed files, fallback/no-proof/running comparisons, Taken Provisional and story-free judged-run Proof. |
|`IntentScopeTimingHistory` → hook/local authenticated reader/server scope projection | New file caller only, same implementation and response contract. Actual folder/file queries and rendered units/gaps/selected markers/no-CI counts pass. Existing entry/DTO scope cases from slice1 remain valid; no reason to rerun unchanged entry-only presentation families. |
|Scope timing/unit/owner/path and segment owners | Unchanged production; new2Node matching cases and actual per-unit/artifact gaps supplement accepted timing/units/untimed matrices. No independent scope model or historical identity/rename owner added. |
|`serveCollectedScopeRuns` and root-file default facts | Existing entry-history case passes in17group, retaining1200/0case and80/900file values, real P/E/R collection, local502Retry and noCI assertions. Delegation changes only the shared technical producer arrangement. |
|New `serveCollectedScopeFileRuns`/`serveCollectedScopeProofs` → existing CLI `collectedSummary`, record parser, Actions/ZIP fixture and collector | New main/gap journeys observe actual retained V2 summaries and independent public/rendered scope values. One native router and MakeMe CI-run owner retained. Raw report/parts/unit inputs are intentionally the producer input under test, not a parallel summary builder. |
|Current file comparison table/evidence labels/cues/source/navigation |17plus5consumer group covers all directly reached file/proof and source/fallback boundaries. Summary sorting and signed-sort specs are excluded: their table implementation/defaults/sorting place did not change; selected current comparison/units assertions remain in existing reached cases. |
|Existing history chart/evidence, provenance/legacy/pending/adapter and retention/restart owners | Unchanged callee implementations; reuse accepted slice1 observations. Actual new journeys verify integration at entry/folder/file; this does not claim G5/G17 collector retry/restart/duplicate/coeviction completion, which remains3. |
|Canonical MakeMe proof/history builders | No builder edits; new Node data uses shared APIs. Unrelated builder importers have no changed default and require no blanket suite. |
|Broad `byFile`, root.spec, setup or generic history matches in CLI/unit/source tests and planning/managed guidance | Lexical/contextual only. Shared CLI implementation and existing producer function unchanged, only explicit call inputs added. Actual artifact path is proved by the new journeys. Root owns planning edits; managed guidance untouched. No unidentified effect-reaching caller remains. |

## Ownership and quiescence

`/tmp/trace-proof-285-slice2-owned-paths.txt` lists exactly6nonplanning paths, including three new tests. Root's concurrent PLAN/evidence edits are excluded. No index/stage, status, formatter, commit, publication or CI observer operation was performed.

All6files marker/whitespace-clean; `git diff --check -- <six owned paths>` exits0. Prettier API preview: file component164lines, complete journey230, gap journey199, shared technical fixture222, Node matching208, maintained doc199; none exceeds250. Root still owns actual selective formatting. All own and child writers/tests/traces/list commands are terminal and quiescent. No unresolved slice2 implementation or proof gap remains in this return.

Independent refactor and renewed actual producer journeys: [refactor-slice-2.md](refactor-slice-2.md).
