# Source review: SEED-192#read-pytest-proof

Launch: 2026-11-04, a fresh general-purpose reviewer without conversation
inheritance, during execution by agent steven-chan. Input: only the story's
original text (Beneficiary, Goal, Scope, Constraints, Scope limits and Key
examples from
[the story](../../seeds/SEED-192-review-product-intent.md#read-pytest-proof),
seed lines 365–391 and 467–627 at `4b9cf5c16`), with instructions to read no
other file, change nothing and return numbered commitments. Its returned ids
and texts are kept below as returned.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| B1 | A Pygardon developer reviewing Python test protection in Intent, such as Terry selecting a file under `tests` and reading what its test cases last proved | slice 6 | |
| G1 | Pygardon records deliberate pytest proof the way it records Cucumber proof | slice 5 | |
| G1a | A published Open Dough reference defines the compact snapshot and the explicit recording run | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md (Configure once, Record from pytest's reports, Identity, Refresh the snapshot, File format, Commit proof) |
| G1b | The `tests` Intent location declares its proof directory and generation command in `.planning/open-dough.json` | slice 5 | |
| G1c | A Pygardon-owned pytest plugin maintains the snapshot | slice 5 | |
| G2 | Selecting a pytest file in Intent then shows each test case's last successful committed proof beside its Python source | slice 6 | |
| G3 | A location or folder summary gives the same figures as for Gherkin | slice 6 | |
| G4 | Extends Proof to Pygardon's largest test family and tests whether the latest-observation model survives parametrization, marker selection, expected failures, setup/teardown and parallel workers | slice 5 | |
| G5 | The story includes the generation of pytest proof, like the Cucumber proof, declared in the project configuration and produced when the project generates proof; the rest is reading it | slice 5 | |
| 1.1 | `src/skills/dough-test-optimization/references/pytest-proof.md` exists | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md |
| 1.2 | Linked from that skill like the Cucumber reference | slice 2 | observed: slice 2: src/skills/dough-test-optimization/SKILL.md links pytest-proof.md beside cucumber-proof.md; install.sh managed_files declares it |
| 1.3 | Written for the agent working in the recording project | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md addressed to the agent in the recording project; behavior review of examples 1-5 in the plan's slice 2 proof |
| 1.4 | It carries the Cucumber contract's recording discipline | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md carries the rule (Configure once, Refresh the snapshot, Commit proof, Record from pytest's reports) |
| 1.4.1 | An explicit project-owned option such as `RECORD_PYTEST_PROOF=1` | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md carries the rule (Configure once, Refresh the snapshot, Commit proof, Record from pytest's reports) |
| 1.4.2 | The option is off in every profile including CI | slice 5 | |
| 1.4.3 | Normal runs leave proof byte-for-byte untouched | slice 5 | |
| 1.4.4 | The recorder prints nothing | slice 5 | |
| 1.4.5 | The recorder never fails the run | slice 5 | |
| 1.4.6 | The recorder records nothing outside a Git checkout | slice 5 | |
| 1.4.7 | One maintained snapshot (`latest.json`) | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md carries the rule (Configure once, Refresh the snapshot, Commit proof, Record from pytest's reports) |
| 1.4.8 | The snapshot is refreshed atomically after each finished case | slice 5 | |
| 1.4.9 | Passing cases only | slice 5 | |
| 1.4.10 | An executed final unsuccessful result clears that case's earlier proof | slice 5 | |
| 1.4.11 | Unexecuted cases keep theirs | slice 5 | |
| 1.4.12 | Deliberate commits | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md carries the rule (Configure once, Refresh the snapshot, Commit proof, Record from pytest's reports) |
| 1.4.13 | `proof` and `proofGeneration` declared on the `python` location | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md carries the rule (Configure once, Refresh the snapshot, Commit proof, Record from pytest's reports) |
| 1.5 | Pytest-specific rules | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md carries the rule (Configure once, Refresh the snapshot, Commit proof, Record from pytest's reports) |
| 1.5.1 | Record on the xdist controller from `pytest_runtest_logreport`, never in workers | slice 5 | |
| 1.5.2 | A case is finished when its teardown report arrives | slice 5 | |
| 1.5.3 | `durationMs` sums the case's own setup, call and teardown phases across its attempts | slice 5 | |
| 1.5.4 | A failure or error in any phase is an executed unsuccessful result that clears proof and records nothing | slice 5 | |
| 1.5.5 | An expected failure (`xfail`) is an executed unsuccessful result that clears proof and records nothing | slice 5 | |
| 1.5.6 | An unexpected pass (`xpass`) is an executed unsuccessful result that clears proof and records nothing | slice 5 | |
| 1.5.7 | `skipped`, deselected (for example by `-m`), uncollected and `--collect-only` cases ran nothing and keep their proof | slice 5 | |
| 1.5.8 | `attempts` counts executed attempts when the project's runner reports reruns, otherwise 1 | slice 5 | |
| 2.1 | One JSON object `{"version": 1, "observations": […]}` | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md Identity and File format; dashboard/src/pytestProof.ts parses that format |
| 2.2 | Observations identified by pytest's own node id parts | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md Identity and File format; dashboard/src/pytestProof.ts parses that format |
| 2.2.1 | `file` (repository path with `/` separators) | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md Identity and File format; dashboard/src/pytestProof.ts parses that format |
| 2.2.2 | `test` (the `::`-joined names after the file, class names included) | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md Identity and File format; dashboard/src/pytestProof.ts parses that format |
| 2.2.3 | `parameterId` (the text inside the node id's outer brackets, present only for a parametrized case) | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md Identity and File format; dashboard/src/pytestProof.ts parses that format |
| 2.3 | Measured fields match Cucumber proof | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md Identity and File format; dashboard/src/pytestProof.ts parses that format |
| 2.3.1 | `outcome: "passed"` | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md Identity and File format; dashboard/src/pytestProof.ts parses that format |
| 2.3.2 | `attempts` | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md Identity and File format; dashboard/src/pytestProof.ts parses that format |
| 2.3.3 | `durationMs` | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md Identity and File format; dashboard/src/pytestProof.ts parses that format |
| 2.3.4 | `finishedAt` | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md Identity and File format; dashboard/src/pytestProof.ts parses that format |
| 2.3.5 | `commit` | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md Identity and File format; dashboard/src/pytestProof.ts parses that format |
| 2.3.6 | `fileBlob` (the test file's Git blob hash as tested) | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md Identity and File format; dashboard/src/pytestProof.ts parses that format |
| 2.4 | Never record collection order or runner object ids | slice 5 | |
| 2.5 | A file holds at most one observation per identity | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md Identity and File format; dashboard/src/pytestProof.ts parses that format |
| 3.1 | The dashboard reads `proof` and `proofGeneration` on a `python` location exactly as on a Gherkin one | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" and dashboard/tests/intent-pytest-proof-summary.spec.ts location summary read tests/proof/latest.json at the pinned revision |
| 3.1.1 | Committed proof at the pinned revision | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" reads committed tests/proof/latest.json at the pinned revision |
| 3.1.2 | The generation instruction shown as text | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" step: the generation instruction shows as text; dashboard/tests/intent-pytest-proof-summary.spec.ts shows the command |
| 3.1.3 | Malformed instruction explained without hiding readable proof | slice 2 | observed: slice 2: shared IntentProofGeneration via proofKindOf for python as for gherkin; dashboard/tests/intent-proof-generation.spec.ts malformed-instruction case |
| 4.1 | Rows come from the published Python text in source order | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" exact header and cells: Test case; test_allows_listed_origin, test_rounding Parameters: up/even, async test_preflight, test_rejects_unknown_origin No successful proof, TestCredentials::test_sends_credentials Earlier file version; count line 6 test cases: 5 passed, 1 without successful proof; definition line data-line in dashboard/tests/intent-pytest-proof-summary.spec.ts |
| 4.1.1 | Every module-level `def test_*` or `async def test_*` | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" exact header and cells: Test case; test_allows_listed_origin, test_rounding Parameters: up/even, async test_preflight, test_rejects_unknown_origin No successful proof, TestCredentials::test_sends_credentials Earlier file version; count line 6 test cases: 5 passed, 1 without successful proof; definition line data-line in dashboard/tests/intent-pytest-proof-summary.spec.ts |
| 4.1.2 | `test_*` methods of `Test*` classes | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" exact header and cells: Test case; test_allows_listed_origin, test_rounding Parameters: up/even, async test_preflight, test_rejects_unknown_origin No successful proof, TestCredentials::test_sends_credentials Earlier file version; count line 6 test cases: 5 passed, 1 without successful proof; definition line data-line in dashboard/tests/intent-pytest-proof-summary.spec.ts |
| 4.1.3 | Each with its definition line | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" exact header and cells: Test case; test_allows_listed_origin, test_rounding Parameters: up/even, async test_preflight, test_rejects_unknown_origin No successful proof, TestCredentials::test_sends_credentials Earlier file version; count line 6 test cases: 5 passed, 1 without successful proof; definition line data-line in dashboard/tests/intent-pytest-proof-summary.spec.ts |
| 4.2 | A function with observed parameter ids shows one row per observed id, named with its parameters as an outline row is named with its example cells | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" exact header and cells: Test case; test_allows_listed_origin, test_rounding Parameters: up/even, async test_preflight, test_rejects_unknown_origin No successful proof, TestCredentials::test_sends_credentials Earlier file version; count line 6 test cases: 5 passed, 1 without successful proof; definition line data-line in dashboard/tests/intent-pytest-proof-summary.spec.ts |
| 4.3 | A function with no observation shows one row reading _No successful proof_ | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" exact header and cells: Test case; test_allows_listed_origin, test_rounding Parameters: up/even, async test_preflight, test_rejects_unknown_origin No successful proof, TestCredentials::test_sends_credentials Earlier file version; count line 6 test cases: 5 passed, 1 without successful proof; definition line data-line in dashboard/tests/intent-pytest-proof-summary.spec.ts |
| 4.4 | Each observed row shows the same cells as a scenario | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" exact header and cells: Test case; test_allows_listed_origin, test_rounding Parameters: up/even, async test_preflight, test_rejects_unknown_origin No successful proof, TestCredentials::test_sends_credentials Earlier file version; count line 6 test cases: 5 passed, 1 without successful proof; definition line data-line in dashboard/tests/intent-pytest-proof-summary.spec.ts |
| 4.4.1 | Last successful proof | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" exact header and cells: Test case; test_allows_listed_origin, test_rounding Parameters: up/even, async test_preflight, test_rejects_unknown_origin No successful proof, TestCredentials::test_sends_credentials Earlier file version; count line 6 test cases: 5 passed, 1 without successful proof; definition line data-line in dashboard/tests/intent-pytest-proof-summary.spec.ts |
| 4.4.2 | Attempts | slice 2 | observed: slice 2: shared ProofObservationCells attempts rendering via the case model, proved by intent-cucumber-proof.spec.ts Passed after retry; pytest rows use the same cells |
| 4.4.3 | Duration | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" exact header and cells: Test case; test_allows_listed_origin, test_rounding Parameters: up/even, async test_preflight, test_rejects_unknown_origin No successful proof, TestCredentials::test_sends_credentials Earlier file version; count line 6 test cases: 5 passed, 1 without successful proof; definition line data-line in dashboard/tests/intent-pytest-proof-summary.spec.ts |
| 4.4.4 | Time since | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" exact header and cells: Test case; test_allows_listed_origin, test_rounding Parameters: up/even, async test_preflight, test_rejects_unknown_origin No successful proof, TestCredentials::test_sends_credentials Earlier file version; count line 6 test cases: 5 passed, 1 without successful proof; definition line data-line in dashboard/tests/intent-pytest-proof-summary.spec.ts |
| 4.4.5 | Commit | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" exact header and cells: Test case; test_allows_listed_origin, test_rounding Parameters: up/even, async test_preflight, test_rejects_unknown_origin No successful proof, TestCredentials::test_sends_credentials Earlier file version; count line 6 test cases: 5 passed, 1 without successful proof; definition line data-line in dashboard/tests/intent-pytest-proof-summary.spec.ts |
| 4.4.6 | Whether the test file's published blob is the one observed | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" exact header and cells: Test case; test_allows_listed_origin, test_rounding Parameters: up/even, async test_preflight, test_rejects_unknown_origin No successful proof, TestCredentials::test_sends_credentials Earlier file version; count line 6 test cases: 5 passed, 1 without successful proof; definition line data-line in dashboard/tests/intent-pytest-proof-summary.spec.ts |
| 4.5 | The header reads **Test case** | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" exact header and cells: Test case; test_allows_listed_origin, test_rounding Parameters: up/even, async test_preflight, test_rejects_unknown_origin No successful proof, TestCredentials::test_sends_credentials Earlier file version; count line 6 test cases: 5 passed, 1 without successful proof; definition line data-line in dashboard/tests/intent-pytest-proof-summary.spec.ts |
| 4.6 | The count line counts test cases | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" exact header and cells: Test case; test_allows_listed_origin, test_rounding Parameters: up/even, async test_preflight, test_rejects_unknown_origin No successful proof, TestCredentials::test_sends_credentials Earlier file version; count line 6 test cases: 5 passed, 1 without successful proof; definition line data-line in dashboard/tests/intent-pytest-proof-summary.spec.ts |
| 5.1 | The same figures as a Gherkin summary over the same rows | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-summary.spec.ts location summary: 11 test functions; 13 test cases: 10 passed, 3 without successful proof; 5.1 s over 10 of 13 test cases with the cost note; Slowest test cases table; generation command; no scenario wording |
| 5.1.1 | An inventory line counting test functions from the read files | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-summary.spec.ts location summary: 11 test functions; 13 test cases: 10 passed, 3 without successful proof; 5.1 s over 10 of 13 test cases with the cost note; Slowest test cases table; generation command; no scenario wording |
| 5.1.2 | The proof count line over cases | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-summary.spec.ts location summary: 11 test functions; 13 test cases: 10 passed, 3 without successful proof; 5.1 s over 10 of 13 test cases with the cost note; Slowest test cases table; generation command; no scenario wording |
| 5.1.3 | Summed last successful duration with coverage and the separate-observations note | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-summary.spec.ts location summary: 11 test functions; 13 test cases: 10 passed, 3 without successful proof; 5.1 s over 10 of 13 test cases with the cost note; Slowest test cases table; generation command; no scenario wording |
| 5.1.4 | Slowest cases | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-summary.spec.ts location summary: 11 test functions; 13 test cases: 10 passed, 3 without successful proof; 5.1 s over 10 of 13 test cases with the cost note; Slowest test cases table; generation command; no scenario wording |
| 5.1.5 | Per-child breakdown | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-summary.spec.ts children with own counts and sums |
| 5.1.6 | Partial labelling while files read or failed | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-summary.spec.ts Partial: 10 test functions across 3 of 4 files; 1 file unread, Retry rereads only it |
| 5.1.7 | Drill-down to a file or to a case's definition line | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-summary.spec.ts folder drill-down opens test_search_run.py Purpose and Proof; slowest row opens Purpose at data-line |
| 5.1.8 | The generation instruction | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-summary.spec.ts location summary: 11 test functions; 13 test cases: 10 passed, 3 without successful proof; 5.1 s over 10 of 13 test cases with the cost note; Slowest test cases table; generation command; no scenario wording |
| 5.2 | Wording says test functions and test cases where Gherkin says scenarios | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-summary.spec.ts location summary: 11 test functions; 13 test cases: 10 passed, 3 without successful proof; 5.1 s over 10 of 13 test cases with the cost note; Slowest test cases table; generation command; no scenario wording |
| 6.1 | Proof file reads accept snapshots well above 1 MiB (a bound of 32 MiB), so Pygardon's single snapshot is read | slice 3 | observed: slice 3: dashboard/server/ghRead.ts maxAnswerBytes 32 MiB; dashboard/tests/intent-pytest-proof.spec.ts "a pytest snapshot of about 2 MB is read and its file's Proof shows its rows" red before (Proof could not be read) and green after |
| 6.2 | The reference says one snapshot per proof directory | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md Refresh the snapshot: one maintained snapshot per proof directory, latest.json |
| 6.3 | The reference names that bound | slice 3 | observed: slice 3: pytest-proof.md Refresh the snapshot: Intent reads a proof file of up to 32 MiB |
| 7.1 | A `python` location without `proof` says proof is not recorded and names the pytest reference | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-absent.spec.ts python without proof: Proof is not recorded ... dough-test-optimization/references/pytest-proof.md, in file Proof and summary |
| 7.2 | A kind with no proof reading yet says Proof is read for Gherkin feature files and pytest files so far | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-absent.spec.ts typescript location: Proof is read for Gherkin feature files and pytest files so far. |
| 7.3 | Unreadable and malformed proof keep their retry explanations | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-absent.spec.ts Proof could not be read: tests/proof/latest.json is not a valid proof file. with Retry; kind mismatch both ways malformed; missing/empty via shared absence path in intent-cucumber-proof-absent.spec.ts |
| 8.0 | Done in a subordinate Pygardon workspace of this execution, as plan 446 did | slice 4 | observed: slice 4: subordinate worktree /Users/terryyin/git/pygardon/.worktrees/record-pytest-proof (claude/record-pytest-proof at ac093aea6), prepared; default checkout untouched |
| 8.1 | A Pygardon-owned pytest plugin following the reference | slice 5 | |
| 8.2 | Registered so the ordinary `pytest`, `scripts/check-worktree.sh pytest` and CI commands load it with recording off | slice 5 | |
| 8.3 | Its tests through pytest's `pytester` | slice 5 | |
| 8.3.1 | A two-worker xdist run | slice 5 | |
| 8.3.2 | Parametrization | slice 5 | |
| 8.3.3 | `xfail` | slice 5 | |
| 8.3.4 | `skip` | slice 5 | |
| 8.3.5 | Deselection | slice 5 | |
| 8.3.6 | A setup error | slice 5 | |
| 8.3.7 | An interrupted refresh | slice 5 | |
| 8.4 | `proof: "tests/proof"` and the real recording command declared on the `tests` location | slice 5 | |
| 8.5 | One explicit focused recording run committed as the first snapshot | slice 5 | |
| 8.6 | Pygardon's publication follows Pygardon's own rules | slice 5 | |
| 9.1 | With that snapshot published, Intent on project Pygardon shows the recorded file's cases with their proof | slice 6 | |
| 9.2 | And a subfolder summary | slice 6 | |
| 9.3 | The root `tests` summary is opened once and its read time and GitHub request count recorded as a learning | slice 6 | |
| 9.4 | Terry evaluates against `pytest -q` output plus an editor | slice 6 | |
| 10.1 | `docs/dashboard-development-intent.md` describes pytest Proof and summaries beside Gherkin | slice 2 | observed: slice 2: docs/dashboard-development-intent.md pytest Proof paragraph with summaries beside Gherkin |
| 10.2 | The reference is linked where the Cucumber one is | slice 2 | observed: slice 2: docs/dashboard-development-intent.md and dough-test-optimization SKILL.md link pytest-proof.md where cucumber-proof.md is linked |
| C1 | Only a plain pass records proof; an executed non-pass clears it | slice 5 | |
| C1a | Proof must not claim behavior a case did not pass (correctness of Proof) | slice 5 | |
| C2 | Normal runs never create, change or delete proof (Terry, 2026-11-02) | slice 5 | |
| C3 | Missing, empty, unreadable or malformed proof is never shown as a pass | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-absent.spec.ts Proof could not be read: tests/proof/latest.json is not a valid proof file. with Retry; kind mismatch both ways malformed; missing/empty via shared absence path in intent-cucumber-proof-absent.spec.ts |
| C4 | Identity uses pytest's own node id text | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md Identity; dashboard/src/pytestProof.ts reads file/test/parameterId |
| C4a | Parameter ids that pytest derives from positions (`param0`) are recorded as given | slice 5 | |
| C4b | The reference recommends explicit `ids=` for stable identity | slice 2 | observed: slice 2: src/skills/dough-test-optimization/references/pytest-proof.md Identity recommends ids= / pytest.param(..., id=...) |
| C4c | No runner object ids | slice 5 | |
| C5 | Existing Cucumber proof files, their reader behavior and wording for Gherkin locations stay unchanged | slice 1 | observed: slice 1: intent-cucumber-proof, intent-cucumber-proof-absent, intent-summary-proof-cost, intent-summary-slowest, intent-entry-folder-summaries, intent-proof-generation specs 19 passed with fixtures and expected rows unchanged; 48 consumer specs passed |
| C5a | The on-disk Cucumber format is not renamed | slice 1 | observed: slice 1: dashboard/src/cucumberProof.ts parseCucumberProofFile reads unchanged feature/scenario/example/featureBlob files; boundary/authenticated-read-intent-proof-retained asserts featureBlobs on the wire |
| C6 | With the plugin loaded, these stay as they are | slice 5 | |
| C6.1 | Pygardon's output | slice 5 | |
| C6.2 | Diagnostics | slice 5 | |
| C6.3 | Exit meaning | slice 5 | |
| C6.4 | Progress containment | slice 5 | |
| C6.5 | Xdist distribution | slice 5 | |
| C6.6 | `filterwarnings = error` | slice 5 | |
| X1 | EXCLUSION: Pygardon's `tests` location only | slice 5 | |
| X1a | EXCLUSION: Legacy Python trees, Doughnut's CLI unittest and other pytest projects are naturally served by the contract and reader but carry no delivery or verification commitment here | slice 5 | |
| X2 | EXCLUSION: No run wall time | slice 2 | observed: slice 2: no wall time, CI comparison, per-folder run cost or staleness rule added (diff) |
| X2a | EXCLUSION: No CI comparison | slice 2 | observed: slice 2: no wall time, CI comparison, per-folder run cost or staleness rule added (diff) |
| X2b | EXCLUSION: No per-folder run cost | slice 2 | observed: slice 2: no wall time, CI comparison, per-folder run cost or staleness rule added (diff) |
| X2c | EXCLUSION: No staleness or expiry rule | slice 2 | observed: slice 2: no wall time, CI comparison, per-folder run cost or staleness rule added (diff) |
| X3 | EXCLUSION: Observations whose identity the published file no longer defines (a renamed or removed test) are not listed; listing them as observed but no longer defined is a deferred promise | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" stale test_old_origin_name not listed; dashboard/tests/intent-pytest-proof-summary.spec.ts slowest table too |
| X4 | EXCLUSION: Tests pytest generates dynamically or collects from non-`Test*` classes are not derived from source; their observations stay in the snapshot and are read when the source rule can name them | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" test_inside_docstring, test_nested_helper, Helper::test_not_collected not listed |
| X5 | EXCLUSION: A cheaper root summary for a flat 1024-file folder is deferred to the measured result | slice 6 | |
| X6 | EXCLUSION: A full-suite proof refresh of Pygardon is Terry's deliberate run after the plugin lands; the story commits a focused selection first | slice 5 | |
| X7 | EXCLUSION: Rerun plugins and per-attempt detail beyond the attempt count are not added | slice 5 | |
| E1.T | Pygardon at a prepared worktree, no `tests/proof` → `RECORD_PYTEST_PROOF=1 nix develop -c scripts/check-worktree.sh pytest tests/test_cors.py` | slice 5 | |
| E1.R1 | `tests/proof/latest.json` holds one passing observation per executed case of that file | slice 5 | |
| E1.R2 | Each observation has `file`, `test`, `parameterId` where parametrized, `commit` at run start and the file's `fileBlob` | slice 5 | |
| E1.R3 | The run's output and exit are those of the same run without the option | slice 5 | |
| E1.T2 | The same command without the option | slice 5 | |
| E1.R4 | Changes nothing under `tests/proof` | slice 5 | |
| E2.T | `test_rounding[up]` and `test_rounding[down]` pass | slice 5 | |
| E2.R1 | Two observations under `test: "test_rounding"` | slice 5 | |
| E2.T2 | A later explicit run in which `[down]` fails | slice 5 | |
| E2.R2 | Removes only the `[down]` observation | slice 5 | |
| E2.R3 | Intent shows the `up` row with its proof and no `down` row until a later pass restores it | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" up row shown, down row absent |
| E3.T | `-n 2 --dist loadfile` with recording on | slice 5 | |
| E3.R1 | Every executed case appears once, recorded by the controller | slice 5 | |
| E3.R2 | Worker processes write nothing | slice 5 | |
| E4.T1 | Default `-m 'not slow'` leaves slow cases unexecuted | slice 5 | |
| E4.R1 | Their earlier proof stays | slice 5 | |
| E4.T2 | `pytest -m slow` with recording on | slice 5 | |
| E4.R2 | Adds theirs | slice 5 | |
| E4.T3 | A `skipped` case and a deselected case | slice 5 | |
| E4.R3 | Keep their proof | slice 5 | |
| E5.T | An `xfail` case that fails as expected, an `xpass`, a fixture `setup` error, and a `teardown` failure after a passing call | slice 5 | |
| E5.R1 | Each remove that case's earlier observation | slice 5 | |
| E5.R2 | And record nothing | slice 5 | |
| E5.R3 | Intent reads _No successful proof_ for it | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof.spec.ts "a pytest file's Proof lists its test cases in definition order with observed parameter rows" test_rejects_unknown_origin reads No successful proof |
| E6.T | Select `tests/test_cors.py` in Pygardon's Intent at the published revision | slice 6 | |
| E6.R1 | A table headed Test case, Last successful proof, Duration, Observed, Commit, Observed on | slice 6 | |
| E6.R2 | Rows in definition order | slice 6 | |
| E6.R3 | A parametrized function expands to its observed ids | slice 6 | |
| E6.R4 | The count line reads, for example, 'Last successful proof: 6 test cases: 5 passed, 1 without successful proof' | slice 6 | |
| E6.R5 | The Purpose pane positions on a row's definition line when opened from a summary or Optimization Candidates | slice 6 | |
| E7.T | Select `tests/search_run` (50 files) | slice 6 | |
| E7.R1 | 'N test functions' from the read files | slice 6 | |
| E7.R2 | The proof count line over cases | slice 6 | |
| E7.R3 | Summed duration with 'over M of N test cases' and the separate-observations note | slice 6 | |
| E7.R4 | Slowest cases | slice 6 | |
| E7.R5 | Children with their sums | slice 6 | |
| E7.R6 | Partial labelling and unread file retry as for Gherkin | slice 6 | |
| E7.R7 | A child name opens that file's Purpose and Proof | slice 6 | |
| E8.T | A published pytest snapshot of 2 MB | slice 3 | observed: slice 3: dashboard/tests/intent-pytest-proof.spec.ts "a pytest snapshot of about 2 MB is read and its file's Proof shows its rows" 2,042,817-byte snapshot, row test_health with cells, count line, no alert |
| E8.R1 | Intent reads it and shows rows | slice 3 | observed: slice 3: dashboard/tests/intent-pytest-proof.spec.ts "a pytest snapshot of about 2 MB is read and its file's Proof shows its rows" 2,042,817-byte snapshot, row test_health with cells, count line, no alert |
| E8.R2 | No read failure | slice 3 | observed: slice 3: dashboard/tests/intent-pytest-proof.spec.ts "a pytest snapshot of about 2 MB is read and its file's Proof shows its rows" 2,042,817-byte snapshot, row test_health with cells, count line, no alert |
| E9.T1 | The `python` location without `proof` | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-absent.spec.ts python without proof: Proof is not recorded ... dough-test-optimization/references/pytest-proof.md, in file Proof and summary |
| E9.R1 | 'Proof is not recorded for this project. To configure deliberate proof generation, follow `dough-test-optimization/references/pytest-proof.md` …' | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-absent.spec.ts python without proof: Proof is not recorded ... dough-test-optimization/references/pytest-proof.md, in file Proof and summary |
| E9.T2 | A `typescript` location | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-absent.spec.ts typescript location: Proof is read for Gherkin feature files and pytest files so far. |
| E9.R2 | Proof is read for Gherkin feature files and pytest files so far | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-absent.spec.ts typescript location: Proof is read for Gherkin feature files and pytest files so far. |
| E9.T3 | A `tests/proof/latest.json` that is not valid proof | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-absent.spec.ts Proof could not be read: tests/proof/latest.json is not a valid proof file. with Retry; kind mismatch both ways malformed; missing/empty via shared absence path in intent-cucumber-proof-absent.spec.ts |
| E9.R3 | 'Proof could not be read: tests/proof/latest.json is not a valid proof file' | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-absent.spec.ts Proof could not be read: tests/proof/latest.json is not a valid proof file. with Retry; kind mismatch both ways malformed; missing/empty via shared absence path in intent-cucumber-proof-absent.spec.ts |
| E9.R4 | With Retry | slice 2 | observed: slice 2: dashboard/tests/intent-pytest-proof-absent.spec.ts Proof could not be read: tests/proof/latest.json is not a valid proof file. with Retry; kind mismatch both ways malformed; missing/empty via shared absence path in intent-cucumber-proof-absent.spec.ts |
| E10.T | Pygardon's and Doughnut's Gherkin locations | slice 1 | observed: slice 1: Pygardon-like fixtures in intent-cucumber-proof and intent-entry-folder-* specs; Doughnut in intent-doughnut-cucumber-proof.spec.ts |
| E10.R1 | Show the same rows, wording and summaries as before this story | slice 1 | observed: slice 1: same specs pass unchanged (rows, wording, summaries), 19 + 48 passed |
