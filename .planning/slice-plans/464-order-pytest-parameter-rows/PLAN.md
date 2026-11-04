# Order pytest parameter rows by parameter id

**Identity:** SEED-192#order-pytest-parameter-rows
**Source:** [correction story](../../seeds/SEED-192-review-product-intent.md#order-pytest-parameter-rows)
**Prepared:** 2026-11-04. Planning only, handed off by the execution
retrospective, in the reviewed story's workspace (branch
`claude/read-pygardon-pytest-proof`); the invoking execution commits these
records.

## Provenance

Execution retrospective of SEED-192#read-pytest-proof (plan
[459](../459-read-pytest-proof/PLAN.md)), reviewing commits `85ce0030a`,
`d62a2306a`, `d9a94c272`, `d5249a45a` and `5082cb99e`. In `5082cb99e` Terry
amended the story (2026-11-04): a parametrized function's rows are "ordered
by parameter id, since pytest's collection order is not recorded", and key
example 6 reads "a parametrized function expands to its observed ids in
parameter id order". The original story's other promises, examples and
restrictions stand; this plan only corrects the delivered code, proof and
text.

## Findings (current at `5082cb99e`)

1. **The reader keeps snapshot order.** `pytestRowsOf` in
   `dashboard/src/pytestCases.ts` (lines 116–127) expands a function's
   variants in the order of the observations it receives; nothing sorts by
   parameter id. `dashboard/tests/intentPytestProofFixtures.ts` publishes
   `up` before `even`, and `dashboard/tests/intent-pytest-proof.spec.ts`
   (lines 115–116) asserts `Parameters: up` then `Parameters: even`, pinning
   the order the amendment rejects. Real Pygardon showed parameter id order
   only because its plugin sorts the snapshot (`scripts/pytest_proof.py`
   `sorted(kept, key=_identity_key)`); the reference
   `src/skills/dough-test-optimization/references/pytest-proof.md` asks for
   that ordering only "to limit diff noise" (line 157) and its "Reading
   proof" section is silent on order. A recorder that does not sort, or a
   merged or hand-edited snapshot, shows parametrized rows in arbitrary
   order, and ties in the slowest cases between rows on one line inherit it.
2. **Guidance misstates other kinds and summaries.**
   `docs/dashboard-development-intent.md` (about line 57) says "Non-Gherkin
   kinds, undeclared proof, and unusable locations reuse the same
   Proof-absent or location explanations as a file; without declared proof a
   Gherkin summary still gives the statistics it can". `IntentSummary.tsx`
   gates on `proofKindOf`, so a `python` location now gets a summary and an
   inventory without declared proof. The pytest paragraph (lines 67–78) does
   not state the parameter id order.
3. **The Python definition scanner has no unit coverage.** Its rules
   (strings and triple-quoted docstrings, open brackets, indentation blocks,
   nested helpers, non-`Test*` classes, `async def`) sit in one E2E fixture
   (`dashboard/tests/intentPytestSourceFixtures.ts`).

## Preserved promises and constraints

Everything plan 459 proved stays proved: functions in definition order,
observed-id expansion with only observed ids as rows, a function without an
observation as one _No successful proof_ row, Gherkin rows, wording and
summaries unchanged, the Intent answer and proof file fields unchanged, and
collection order never recorded. The recorder's own snapshot ordering
recommendation stays; the reader no longer depends on it.

Material exclusions: renaming the Cucumber-named answer fields (a separate
decision for Terry); consolidating the overlapping pytest summary and parser
journeys; the installed copies under `.agents/skills/` and
`.claude/skills/`, which update only from a released payload (AGENTS.md).

## Direction and PFE

- **Order where rows derive.** `pytestRowsOf` is the one place a function's
  observed ids become rows; sorting its variants there orders file Proof,
  summaries and slowest ties at once. No second ordering in the parser,
  answer or components.
- **Code-point order.** Compare parameter ids by Unicode code point, as
  Python's `sorted` orders `str`, so Intent and a sorting recorder agree.
  JavaScript's default string comparison orders UTF-16 code units and
  differs for characters beyond the Basic Multilingual Plane (premise
  below).
- **Unit proof beside its precedent.** A `node:test` file under
  `tests/support/` importing `dashboard/src/pytestCases.ts`, as
  `tests/support/intent-summary-proof-cost.test.mjs` imports dashboard
  modules.
- No Accepted ADR is implicated beyond plan 459's; no new ADR or North Star
  topic.

## Decisive premises

| Premise | Consuming operation, observed form, revision | Result | Unverified remainder |
| --- | --- | --- | --- |
| `pytestRowsOf` keeps observation order | `node --input-type=module` importing `dashboard/src/pytestCases.ts`, `pytestRowsOf("def test_rounding(d):\n    pass\n", [up, even])` at `5082cb99e` (Node 24.21.0, matching `.node-version`) | Settled: returns `up` then `even` | none |
| The journey's fixture is already unsorted, so asserting `even` before `up` is red before the change | Source read of `intentPytestProofFixtures.ts` (observations `up`, then `even`) and `intent-pytest-proof.spec.ts` lines 115–116 at `5082cb99e` | Settled; slice 1 runs the changed spec red before changing the reader | none |
| JavaScript default sort differs from Python `sorted` beyond the BMP | `node -e '["｡","\u{1F600}"].sort()'` gives `1f600, ff61`; `python3 -I -c 'sorted(["｡","\U0001F600"])'` gives `0xff61, 0x1f600` (2026-11-04) | Settled: code-point comparison is needed | none |
| The slowest-cases ordering uses a stable sort over derived rows, so it inherits row order for ties | Source read of `dashboard/src/intentSummaryProofCost.ts` line 178 (`Array.prototype.sort` by `durationMs`, stable) at `5082cb99e` | Settled | none |
| A `node:test` file under `tests/support/` can import dashboard TypeScript | `tests/support/intent-summary-proof-cost.test.mjs` imports `dashboard/src/*.ts`; the `node` import above ran the same way | Settled | none |

## Outside-in proof

| Finding | Owning slice | Observable signal |
| --- | --- | --- |
| 1 order | 1 | `intent-pytest-proof.spec.ts` reads `test_rounding Parameters: even` before `Parameters: up` from the unchanged unsorted fixture, red before the change; the new unit test orders ids by code point, including `"｡"` before `"\u{1F600}"` and `"Z"` before `"a"` |
| 1 reference, 2 guidance | 1 | The reference's "Reading proof" and the guidance's pytest paragraph state parameter id order; the guidance's other-kinds and summary sentences name the kinds Intent reads no proof for and cover Gherkin and pytest summaries without declared proof; payload links pass |
| 3 scanner | 2 | The unit test pins each scanner rule against small Python texts |

Commands from the worktree after `node scripts/setup-native.mjs check`:

- `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/intent-pytest-proof.spec.ts dashboard/tests/intent-pytest-proof-summary.spec.ts dashboard/tests/intent-pytest-proof-absent.spec.ts`
- `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/support/intent-pytest-cases.test.mjs`
- `npm run --silent typecheck:dashboard`
- `PATH=/opt/homebrew/bin:$PATH bash tests/payload-declaration-links.sh`
- `npm run --silent format` before each commit.

Local gates: the focused commands above. No full local suite is required:
the change is confined to pytest row derivation, its proof and text, and no
shared fixture or answer shape changes. Should a full run become necessary,
use Homebrew Bash 5 first on `PATH` and wrap it in `caffeinate -s -i` on AC
power, the maintained macOS sleep guard from
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)
(`-s` is honored only on AC; on battery plug in or start fully awake under
`caffeinate -i` and read the sleep log afterwards). Hosted CI runs the full
suites after publication, and its failures stay owned.

Apply this repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written, carried verbatim:

- A failing or flaky test is a defect to fix. Tests must be stable and give
  the same result locally and in CI. A test that fails locally but passes in
  CI, or the reverse, or passes alone but fails in the full run, has a bug in
  the test or its environment assumptions. A flaky test counts as failing
  until it is no longer flaky.
- Reproducing a failure on the base or main is attribution, not an
  exemption. A plan may record that a known failure predates its story; it
  does not exclude that failure from the executing agent's repair, and no
  executor reports it and moves on.
- CI failing on a revision you published is yours to diagnose and repair,
  even when the step also failed on earlier commits or does not reproduce
  locally, through to the applicable final CI. Never rerun until green as a
  fix. Stop for a human only when the fix needs product, design or
  credential judgment.
- When another active execution already owns that exact repair, preserve its
  uncommitted files: do not stash, claim, or write a duplicate repair. Report
  that owner and the remaining gate as the coordination boundary. A claim
  that a failure is "pre-existing" is not evidence of such an owner.
- A human-authorized exception, such as Terry waiving one native probe or
  authorizing one landing despite a failure, covers only its stated scope.
  Report the outcome it qualifies truthfully; it never becomes the default
  for later work.

## Ordered slices

### 1. A parametrized function's rows read in parameter id order
Type: Behavior
Status: planned
Proof: Change `intent-pytest-proof.spec.ts` to expect
`test_rounding Parameters: even` before `test_rounding Parameters: up`, keep
the fixture's unsorted `up`-then-`even` snapshot (name it unsorted in the
fixture comment), and run the spec red before changing the reader; then the
three pytest Proof journeys pass. A new
`tests/support/intent-pytest-cases.test.mjs` asserts `pytestRowsOf` orders a
function's observed ids by code point whatever the input order (`up`/`even`,
`Z` before `a`, `"｡"` before `"\u{1F600}"`), keeps functions in
definition order, and leaves a function without observations as one plain
row. `npm run --silent typecheck:dashboard` and
`tests/payload-declaration-links.sh` pass.

Behavior: a published snapshot holds a function's parameter ids in any
order → Intent's file Proof, summaries and slowest ties list that function's
rows in parameter id order. The reference's "Reading proof" states that
order (the recording order recommendation stays for diff noise), and
`docs/dashboard-development-intent.md` states it in the pytest paragraph and
replaces the other-kinds sentence: kinds Intent reads no proof for and
unusable locations reuse the file explanations, and without declared proof a
Gherkin or pytest summary still gives the statistics it can. Update the
`pytestCases.ts` header comment to name the order.

### 2. The Python definition scanner's rules are pinned by unit tests
Type: Structure
Status: planned
Proof: `tests/support/intent-pytest-cases.test.mjs` gains cases for the
scanner over small texts, each asserting names and 1-based definition lines:
`def test_` inside a triple-quoted docstring and inside a bracketed
multi-line expression is not a case; a `#` comment and a quoted `#` do not
end scanning wrongly; `async def test_*` is a case; `test_*` methods of a
`Test*` class and of a nested `Test*` class are named with `::`; a nested
helper `def test_*` inside a function and methods of a non-`Test*` class
are not cases; a non-test function and dedent end a class's block. The unit
test passes; the three pytest Proof journeys stay green.

Structure: the scanner's rules have direct, fast proof, directly owned by
retrospective finding 3; no behavior changes.

## Concern evidence

Refinement: not needed; two slices with independent proof inside one
bounded correction, no fragmented or combined concerns.

Remaining slice-specific concerns: none identified in this review.

## Current decisions

- Findings 1–3 form one bounded correction of plan 459's delivered code,
  proof and text; none changes a story promise.
- Intent orders parameter ids itself rather than requiring a sorted
  snapshot, so the amended story holds for any recorder.

## Learnings

None yet.
