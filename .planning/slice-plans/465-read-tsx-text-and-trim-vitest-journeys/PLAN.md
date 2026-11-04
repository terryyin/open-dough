# Read JSX text safely and trim repeated Vitest journeys

**Identity:** SEED-192#read-tsx-text-and-trim-vitest-journeys
**Source:** [correction story](../../seeds/SEED-192-review-product-intent.md#read-tsx-text-and-trim-vitest-journeys)
**Source review:** [source-review.md](./source-review.md)
**Prepared:** 2026-11-04. Planning only, handed off by the execution
retrospective, in the reviewed story's workspace (branch
`claude/read-frontend-vitest-proof-in-both-projects`); the invoking execution
commits these records.

## Provenance

Execution retrospective of SEED-192#read-vitest-proof (plan 460 at
`134da134afd70acbba0ee7d2856acee660f6025c:.planning/slice-plans/460-read-vitest-proof/PLAN.md`),
reviewing commits `beadffb07`, `55108e4cc`, `3e5181a35`, `949bda1ca`,
`b82b8fbd7`, `cfdd94c07`, `311288943` and `30ac552b0`. The original story's
promises, examples and restrictions stand; this plan only corrects the
delivered code and its proof.

## Findings (current at `30ac552b0`)

1. **JSX text is read as code.** `dashboard/src/scriptTokens.ts` treats an
   apostrophe in JSX text as an opening string quote, `//` as a comment and a
   backtick as a template. `quotedText` (lines 121–133) stops an unclosed
   string at the newline and then steps over it (`at += 1`) without counting
   the line. A probe at `30ac552b0` with
   `it("a", () => { render(<p>Don't</p>); }); it("b", …); it("c", …)` on
   lines 1–5 returned only `b` at line 3 and `c` at line 4 (they are on
   lines 4 and 5) and dropped `a`; `<p>see http://x</p>` dropped its test;
   a backtick in `<code>` text returned no rows. Neither frontend's current
   files trigger it (a TypeScript-AST oracle matched all 197 Pygardon and 396
   Doughnut files), but Pygardon's tests are React `.tsx`, so a later test
   rendering such text would silently lose rows or misplace Purpose targets.
2. **Repeated journeys.** `dashboard/tests/intent-vitest-proof-summary.spec.ts:177`
   (Partial and Retry) repeats `intent-pytest-proof-summary.spec.ts:174` with
   only paths and words changed, a kind-independent rule already proved for
   Gherkin (`intent-entry-folder-summary-partial.spec.ts`) and pytest.
   `intent-vitest-proof.spec.ts:158` (fractional rounding and count line)
   repeats the unit proof at `tests/support/intent-proof-runner.test.mjs:12`
   and journey 1's count line; `:234` (proof a later failing run cleared)
   shows only a missing observation, which journey 1's _No successful proof_
   row already proves. The steps in `intent-pytest-proof-absent.spec.ts`
   (around line 74), `intent-cucumber-proof-absent.spec.ts` (around line 98)
   and `intent-entry-folder-summary-explanations.spec.ts` (around line 100)
   were retargeted to the Vitest reference wording, which
   `intent-vitest-proof-absent.spec.ts:123` and the unit test already prove,
   so the other-kinds sentence is now proved only by that spec's `shell` step.

## Preserved promises and constraints

Everything plan 460 proved stays proved: rows in definition order by full
`describe` path, template rows in code-point order, project rows in
code-point order, _No successful proof_ rows, summary figures and Partial
labelling for Vitest locations, the runner explanations, the Vitest
reference wording for `typescript`/`javascript` locations without proof, and
Cucumber and pytest behavior and wording. Removing a journey requires the
named surviving proof to cover its rule. Not in this correction: a
placeholder-only template (`"%s"`, `"$label"`) also matching stale sibling
observations, which awaits Terry's decision on the story's "observations
whose identity the published file no longer defines are not listed".

Apply this repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
throughout, including delegated work and CI repair. Local full suites follow
`tests/local-test-resources.md`: Bash 5 on PATH and, on AC power,
`caffeinate -s -i` around the run
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).

## Decisive premises

| Premise | Consuming operation, observed form, revision | Result | Unverified remainder |
| --- | --- | --- | --- |
| JSX text with `'`, `//` or a backtick drops or shifts rows | `vitestRowsOf` on probe texts at `30ac552b0` (retrospective reviewer, `/tmp/vprobe/`) | Settled: `a` dropped and `b`, `c` one line low; URL text dropped its test; backtick text gave `[]` | none |
| The kind-independent Partial rule and the count, rounding and cleared-row rules have surviving proof | `intent-entry-folder-summary-partial.spec.ts`, `intent-pytest-proof-summary.spec.ts:174`, `tests/support/intent-proof-runner.test.mjs:12`, `intent-vitest-proof.spec.ts:100` at `30ac552b0` | Settled by source read | none |

## Outside-in proof

| Finding | Owning slice | Observable signal |
| --- | --- | --- |
| 1 | 1 | New cases in `tests/support/intent-vitest-cases.test.mjs`: a test rendering JSX text with `'`, with `http://`, and with a backtick keeps every row at its own line; an unclosed string on one line does not shift later rows; existing cases unchanged |
| 2 | 2 | The removed journeys' rules each named with their surviving proof; the three absence steps assert the other-kinds sentence for a kind Intent reads no proof for; the focused Intent journeys green |

Local gates: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/support/intent-vitest-cases.test.mjs tests/support/intent-vitest-case-templates.test.mjs tests/support/intent-vitest-proof.test.mjs tests/support/intent-proof-runner.test.mjs`,
`npm run --silent typecheck:dashboard`, the focused Intent proof, summary and
absence journeys (`env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list <specs>`),
and `npm run --silent format` before each commit.

## Ordered slices

### 1. The test-call reader keeps JSX text out of code
Type: Behavior
Status: done
Proof: accepted. `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash scripts/test.sh tests/support/intent-vitest-cases.test.mjs tests/support/intent-vitest-cases-jsx.test.mjs tests/support/intent-vitest-case-templates.test.mjs tests/support/intent-vitest-proof.test.mjs tests/support/intent-proof-runner.test.mjs` (pass); `npm run --silent typecheck:dashboard` (pass); `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/intent-vitest-proof.spec.ts` (4 passed); TypeScript-AST oracle over Pygardon `frontend/src` and Doughnut `frontend/tests` still matches (0 mismatches). Observations: `tests/support/intent-vitest-cases-jsx.test.mjs` JSX apostrophe/URL/backtick rows; `tests/support/intent-vitest-cases.test.mjs` unclosed-string rows; `dashboard/src/scriptTokensJsx.ts` skips JSX text.

Behavior: a `.tsx` test rendering `Don't`, a URL or a backtick in JSX text →
its rows and every later row keep their own definition lines.

### 2. Each Vitest rule is proved once
Type: Structure
Status: done
Proof: accepted. Removed Partial/Retry (`intent-vitest-proof-summary.spec.ts`;
surviving: `intent-entry-folder-summary-partial.spec.ts`,
`intent-pytest-proof-summary.spec.ts`), rounding/count
(`intent-vitest-proof.spec.ts`; surviving:
`tests/support/intent-proof-runner.test.mjs` and journey 1 count line), and
cleared-proof journey (surviving: journey 1 `_No successful proof_` for
`formats an empty pattern`). Restored other-kinds sentence on shell in
`intent-pytest-proof-absent.spec.ts`, `intent-cucumber-proof-absent.spec.ts`,
`intent-entry-folder-summary-explanations.spec.ts`. Focused:
`env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list` on those six specs — 18 passed.

Internal change: fewer browser journeys for the same promises; the other-kinds
sentence regains its proof in the specs that owned it.

## Current decisions

- Correct the reader rather than document the JSX limitation: the story
  promises every literal test's row at its line, and Pygardon's tests are
  `.tsx`.
- Keep one Vitest location-summary journey and the folder journey; the
  Partial behavior is shared summary code.

## Learnings

- Unclosed strings shifted later rows because `quotedText` advanced past the
  newline without incrementing `line`; leaving the newline for the main loop
  fixes counting.
- Adding JSX scanning pushed `scriptTokens.ts` and the cases file over the
  250-line limit; split JSX scan (`scriptTokensJsx.ts`) and escape helpers
  (`scriptTokenEscapes.ts`), and move JSX cases to
  `intent-vitest-cases-jsx.test.mjs`.
- Vitest Partial/Retry, rounding, and cleared-proof journeys were redundant
  with kind-independent or unit proof; absence steps for other kinds belong
  on shell, not the Vitest reference wording.

## Concern evidence

Slice-plan refinement was not needed: two independent corrections, each one
proof loop in the code it corrects. No slice-specific concern remains.


## Story obligations

### X1. Placeholder-only template listing stale siblings stays outside this correction
Reported: slice 1 — "Awaits Terry decision; not implemented"
Story clause: "A placeholder-only template listing stale sibling observations is outside this correction: it awaits Terry's decision on that story's promise."
Disposition: excluded "A placeholder-only template listing stale sibling observations is outside this correction: it awaits Terry's decision on that story's promise."
Commitment: 9x.1
