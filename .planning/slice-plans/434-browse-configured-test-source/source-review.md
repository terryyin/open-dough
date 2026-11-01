# Source review — SEED-192#browse-configured-test-source

## Launch and input

Fresh general-purpose reviewer (no conversation inheritance). Inputs: story
Goal, Scope, key examples, deferred exclusions, and the 2026-11-01 human
amendment that a location's file selection leaves out unmatched files. No plan,
implementation return, product, or proof.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer reviewing Open Dough’s, Doughnut’s, or Pygardon’s product intent can find and read the project’s TypeScript, Python, Node, and shell test source in Intent, including tests kept beside application code, as they already read Cucumber features. | slice 3 | observed: after-publish Intent Ex 1–4 in `dashboard/test-results/slice3-intent-observation-after-publish-20261101-132747/holds-summary.md`; Terry usefulness confirm 2026-11-01 |
| 2 | Each location lists only the files its configuration selects, so specs are not buried among helpers and product files. Human amendment: selection leaves out unmatched files; a project adds a pattern or location to read helpers. | slice 1 | observed: `dashboard/tests/intent-code-browse.spec.ts` Ex 1–4 listing omissions |
| 3 | This extends the Purpose reader to every requested test family without a separate story per language. | slice 3 | observed: same holds-summary; kinds on three projects |
| 4 | It supplies the test source that later Proof stories and the optimization-candidate links point into. | slice 3 | observed: readable listed files at published DN/PG SHAs and OD `a0ba689a` |
| 5.1 | Kind may be `typescript` (`.ts`, `.tsx`) | slice 1 | observed: `intentSourceKinds.typescript` in `dashboard/server/intentLocationSelection.ts`; Ex 1–2 listing |
| 5.2 | Kind may be `javascript` (`.js`, `.mjs`, `.cjs`) | slice 1 | observed: `intentSourceKinds.javascript`; Ex 4 javascript listing |
| 5.3 | Kind may be `python` (`.py`) | slice 1 | observed: `intentSourceKinds.python`; Ex 3 listing |
| 5.4 | Kind may be `shell` (`.sh`, `.bash`) | slice 1 | observed: `intentSourceKinds.shell`; Ex 4 shell listing |
| 5.5 | Kind may be `gherkin` (`.feature`) | slice 1 | observed: `intentSourceKinds.gherkin`; `intent-gherkin-browse.spec.ts` Ex 5 |
| 5.6 | Each `.tsx` file is styled as TSX. | slice 2 | observed: `sourceHighlight.ts` path→tsx; Ex 2 colourOf in `intent-code-browse.spec.ts` |
| 5.7 | Another kind keeps the existing unsupported-kind explanation. | slice 1 | observed: `intent-gherkin-unusable.spec.ts` unsupported kind `java` |
| 6.1 | A location may give `include`, path patterns relative to the location: `*` one folder, `**` across folders. | slice 1 | observed: `locationSelectsRelativePath` + `path.posix.matchesGlob`; PROJECT-CONFIGURATION.md |
| 6.2 | When given, lists only files of its kind matching at least one pattern. | slice 1 | observed: `intent-code-browse.spec.ts` Ex 1–4 |
| 6.3 | Without `include`, lists every file of its kind; existing configurations unchanged. | slice 1 | observed: `intent-gherkin-browse.spec.ts` Ex 5 |
| 7 | Each location shows its path, kind, and any include patterns. | slice 1 | observed: heading assertions in `intent-code-browse.spec.ts`; `IntentLocationTree.tsx` |
| 8 | Selecting a listed file shows its exact text with line numbers and styling for its kind; styling only aids reading. | slice 1 | observed: Ex 1–4 exact text + colourOf keyword/string in `intent-code-browse.spec.ts`; Gherkin unchanged |
| 9.1 | No matching files → says so, naming path and selection, not `.feature` files. | slice 1 | observed: Ex 6 in `intent-gherkin-unusable.spec.ts`; `locationExplanation` |
| 9.2 | Absent, malformed, unreadable settings, unsupported kind, failed read keep distinct explanations. | slice 1 | observed: `intent-gherkin-unusable.spec.ts`; boundary settings cases |
| 9.3 | Proof still says none is available yet. | slice 1 | observed: unchanged Proof none wording (full suite) |
| 10.1 | Open Dough: `dashboard/tests` (`typescript`, `**/*.spec.ts`) | slice 3 | observed: `.planning/open-dough.json` on `a0ba689a`; Ex 1 API |
| 10.2 | Open Dough: `tests` (`shell`, `*.sh`) | slice 3 | observed: same settings; Ex 4 shell API at `a0ba689a` |
| 10.3 | Open Dough: `src/skills` (`javascript`, `**/*.test.mjs`) | slice 3 | observed: same settings file |
| 10.4 | Doughnut: `frontend/tests` (`typescript`, `**/*.spec.ts`) | slice 3 | observed: Intent UI at `d47bdcdedc` |
| 10.5 | Doughnut: `scripts` (`javascript`, `**/*.test.mjs`) | slice 3 | observed: Intent UI at `d47bdcdedc` |
| 10.6 | Doughnut: `infra` (`javascript`, `**/*.test.mjs`) | slice 3 | observed: settings on `d47bdcdedc` |
| 10.7 | Pygardon: `frontend/src` (`typescript`, four spec/test patterns) | slice 3 | observed: Intent UI at `b6485b82b` |
| 10.8 | Pygardon: `tests` (`python`, `**/test_*.py`) | slice 3 | observed: Intent UI at `b6485b82b` |
| 10.9 | Doughnut and Pygardon get settings-only commits pushed without force. | slice 3 | observed: `d47bdcdedc`→doughnut main; `b6485b82b`→pygardon main |
| 10.10 | Execution confirms that outward step with Terry before pushing. | slice 3 | observed: Terry 2026-11-01 “confirm all” before push |
| 11.1 | Reads stay limited to files a configured location lists (kind + include). | slice 1 | observed: Ex 7 `authenticated-read-intent-locations.spec.ts` |
| 11.2 | A colocated location must not make the folder’s product source readable. | slice 1 | observed: Ex 7 unmatched `AspyPage.tsx` 404 outside-locations |
| E1 | Spec among helpers: list specs, omit helpers; select shows exact text with TypeScript styling and revision. | slice 1 | observed: Ex 1 listing + colourOf TypeScript in `intent-code-browse.spec.ts` |
| E2 | Colocated: list `.spec.tsx`, omit product and `*.spec.helpers.tsx`; styled as TSX. | slice 1 | observed: Ex 2 listing + colourOf TSX in `intent-code-browse.spec.ts` |
| E3 | Python: list `test_*.py`, omit support; Python styling. | slice 1 | observed: Ex 3 listing + colourOf Python in `intent-code-browse.spec.ts` |
| E4.1 | Shell `*.sh` lists top-level checks, not under `tests/support`. | slice 1 | observed: Ex 4 shell in `intent-code-browse.spec.ts` |
| E4.2 | JavaScript `**/*.test.mjs` lists matched test, not `*-fixtures.mjs`. | slice 1 | observed: Ex 4 javascript in `intent-code-browse.spec.ts` |
| E5 | Gherkin without include lists the same `.feature` files as before. | slice 1 | observed: `intent-gherkin-browse.spec.ts` |
| E6 | No match names path and patterns; other locations still browse. | slice 1 | observed: Ex 6 in `intent-gherkin-unusable.spec.ts` |
| E7 | Unmatched file inside pattern location refused as outside configured locations. | slice 1 | observed: Ex 7 boundary admission |
| X1 | Showing support files beside matched tests | | X1 |
| X2 | Exclude patterns | | X2 |
| X3 | A filter or search over long lists | | X3 |
| X4 | Reading the runner’s own selection | | X4 |
| X5 | Doughnut’s CLI Vitest, CLI Python, and Java/JUnit locations | | X5 |
| X6 | Case or scenario outline | | X6 |
| X7 | AST parsing | | X7 |
| X8 | Test execution | | X8 |
| X9 | Any Proof collection | | X9 |

## Comparison (slice 1 acceptance)

| Id | Source-expected | Actual observation | Owner |
| --- | --- | --- | --- |
| 2, 5.1–5.5, 5.7, 6.*, 7, 9.*, 11.*, E4.*, E5–E7 | List/select/headings/admission/distinct states as source states | Fake-origin Intent journeys and boundary `file-at` match expected listing, wording, and refusal | slice 1 done |
| 5.6, 8, E1–E3 | Kind styling on selected code files | Lazy grammars + colourOf keyword≠string for `.ts`/`.tsx`/`.mjs`/`.py`/`.sh`; Gherkin unchanged | proved by slice 2 |
| 1, 3, 4, 10.* | Real three-project configurations and goal completion | DN/PG trunks + OD settings SHA Ex 1–4 hold; Terry usefulness confirm; OD catalog main Intent UI awaits land | slice 3 done |
