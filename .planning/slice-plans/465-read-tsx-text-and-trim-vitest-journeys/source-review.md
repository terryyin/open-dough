# Source review — SEED-192#read-tsx-text-and-trim-vitest-journeys

**Launch:** Fresh general-purpose reviewer with no conversation inheritance;
inputs only the correction story Goal and Scope from
`.planning/seeds/SEED-192-review-product-intent.md#read-tsx-text-and-trim-vitest-journeys`
(no plan, return, product, or proof).

**Input:** Goal and Scope text for Read JSX text safely and trim repeated
Vitest journeys (identity SEED-192#read-tsx-text-and-trim-vitest-journeys).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Every test appears at its own definition line when a developer reads Vitest Proof for a React `.tsx` test file in Intent (holds with JSX apostrophe, `//`, or backtick in rendered text) | slice 1 | observed: tests/support/intent-vitest-cases-jsx.test.mjs JSX apostrophe/URL/backtick cases keep every row on its definition line; dashboard/src/scriptTokensJsx.ts scanJsxChildren |
| 2 | Intent Vitest journeys prove each rule once (residue of the read-vitest-proof retrospective) | slice 2 | observed: Removed Partial/Retry, rounding, and cleared-proof Vitest journeys; surviving proofs named in PLAN learnings and intent-vitest-proof*.spec.ts file headers; remaining Vitest journeys keep one proof each |
| 3 | Correct the reviewed defects named in the plan without changing that story's promises; no new product behavior | slice 2 | observed: Slice 1 reader fix plus slice 2 journey trim only; no new product behavior; parent promises retained |
| 4 | The TypeScript test-call reader does not read JSX text as code | slice 1 | observed: dashboard/src/scriptTokensJsx.ts scanJsxChildren skips JSX text so quotes comments and backticks are not code tokens |
| 4a.1 | A JSX apostrophe does not drop a test | slice 1 | observed: intent-vitest-cases-jsx.test.mjs Dont apostrophe probe keeps it(a) at line 1 |
| 4a.2 | A JSX apostrophe does not shift later lines | slice 1 | observed: intent-vitest-cases-jsx.test.mjs Dont apostrophe probe keeps b at line 4 and c at line 5 |
| 4a.3 | A JSX URL does not drop a test | slice 1 | observed: intent-vitest-cases-jsx.test.mjs http:// URL probe keeps it(a) at line 1 |
| 4a.4 | A JSX URL does not shift later lines | slice 1 | observed: intent-vitest-cases-jsx.test.mjs http:// URL probe keeps it(b) at line 2 |
| 4a.5 | A JSX backtick does not drop a test | slice 1 | observed: intent-vitest-cases-jsx.test.mjs backtick in code probe keeps it(a) at line 1 |
| 4a.6 | A JSX backtick does not shift later lines | slice 1 | observed: intent-vitest-cases-jsx.test.mjs backtick probe keeps it(b) at line 2 |
| 5 | The TypeScript test-call reader counts the newline after an unclosed string | slice 1 | observed: intent-vitest-cases.test.mjs unclosed string case keeps a at line 2 and b at line 3; scriptTokens quotedText leaves newline |
| 6 | Unit tests pin the cases in 4–5 (including 4a.1–4a.6) | slice 1 | observed: intent-vitest-cases-jsx.test.mjs and intent-vitest-cases.test.mjs pin JSX and unclosed-string cases |
| 7 | Vitest journeys that repeat a kind-independent rule or a unit-proved rule are removed or folded | slice 2 | observed: intent-vitest-proof-summary Partial journey and intent-vitest-proof rounding/cleared journeys removed or folded |
| 7a.1 | Journeys that repeat a kind-independent rule → removed or folded | slice 2 | observed: intent-vitest-proof-summary.spec.ts Partial/Retry removed; surviving: intent-entry-folder-summary-partial.spec.ts and intent-pytest-proof-summary.spec.ts |
| 7a.2 | Journeys that repeat a unit-proved rule → removed or folded | slice 2 | observed: intent-vitest-proof.spec.ts rounding and cleared-proof journeys removed; surviving: intent-proof-runner.test.mjs and journey 1 No successful proof row |
| 8 | The three absence steps, retargeted to the Vitest reference, prove the other-kinds sentence again for a kind Intent reads no proof for | slice 2 | observed: intent-pytest-proof-absent, intent-cucumber-proof-absent, intent-entry-folder-summary-explanations assert other-kinds sentence on shell locations |
| 9x.1 | A placeholder-only template listing stale sibling observations is outside this correction (awaits Terry's decision) |  | X1 |
