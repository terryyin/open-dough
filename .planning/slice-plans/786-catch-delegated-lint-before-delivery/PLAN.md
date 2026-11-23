# Catch delegated lint failures before guarded delivery

Source: [SEED-345#catch-delegated-lint-before-delivery](../../seeds/SEED-345-session-token-efficiency.md#catch-delegated-lint-before-delivery). Evidence: [ODF-329](../../../docs/maintainer/findings/ODF-329.md#current-assessment--2026-11-23).

## Current decisions

The worker uses the project's established read-only lint command for the files it authored when the project offers one. The coordinator still owns formatting, staged lint, guarded delivery and proof for affected consumers. Projects without an applicable command keep their ordinary route and receive an explicit handoff about the missing check. This work changes the shared briefing and return guidance. Changes to runtime lint machinery, unchanged caller lint coverage and adoption across clients are outside this story.

Reuse the existing [delegation and targeted report](../../../Distribution/src/skills/dough-execute-plan/references/delegation.md#return-a-targeted-report-with-focused-proof) and [guarded delivery](../../../Distribution/src/skills/dough-execute-plan/references/deliver-the-change.md#deliver-the-change) boundaries. The project owns the command and file selection. The shared skill names that responsibility in terms of the project and its current task, as required by [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md). Use a representative guidance comparison and the real command where repeatable, following [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md). Follow the North Star's [production boundaries and test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support) and [Vitest and Playwright boundaries](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e). The proof exercises the existing check and handoff without adding test-support wrappers or a browser test.

## Decisive premises

- The consuming check exists independently of the staged hook. On 2026-11-23, direct read-only ESLint (`node node_modules/eslint/bin/eslint.js dashboard/src/attachedTerminal.ts`) in an isolated archive of [plan 759's accepted revision](https://github.com/terryyin/open-dough/commit/a48e1eae9bbba0ee045e207cee9e234707a5c1a0) reported `no-param-reassign` at line 50 with the historical socket assignment restored (exit 1). The accepted file passed (exit 0) under the same command. This exercises the prospective worker check with the actual rule and file type. It does not establish current handoff adoption or end-to-end elapsed savings.
- The matched scratch decision replay put the same authored edit and clean counterpart in both arms. Both recognized the defect from the source. The candidate required the worker to run the check before returning. The historical coordinator actually received one guarded-formatting refusal and renewed proof. The slice must exercise the changed brief and returned evidence, including the missing-command control, before claiming the new route works.

## Ordered slices

### 1. Catch applicable authored-file lint before worker handoff
Type: Behavior
Status: planned

In the shared delegation guidance, name the project-approved read-only command and authored-file scope in the implementation brief when available. Have the worker own its terminal result and any correction and renewed focused proof before handing back. Keep a short explicit handoff when the project offers no suitable command. Preserve the coordinator's independent responsibilities and existing checks. Use the existing worker brief and report rather than adding a separate lint gate, scanner or result format.

**Proof.** Walk a single representative implementation-to-delivery return with the historical controlled assignment and a clean counterpart. Compare the current and candidate brief at the worker handoff. Run the same read-only command on the failing and corrected source and verify the coordinator still owns the normal delivery gate. Exercise a project brief offering only staged or full-project lint and inspect the return for the gap and preserved focused proof. Check all three outcomes before comparing check invocations, repair returns and renewed proof. Use the [short source-phase redo](../../../Distribution/evaluation/guidance-checks.md#redo-the-source-phase-for-an-uncovered-finding) when a native run is authorized and available. Qualify which behavior was exercised and keep unobserved total effort unknown. Record the implemented response and first containing release when verified in ODF-329. Estimate 8–12 active minutes.

## Local gate and readiness

Use the focused lint discrimination and guidance behavior checks above. Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md). For long macOS runs, start fully awake under `caffeinate -s -i` on AC. On battery, plug in or keep the lid open under `caffeinate -i` and inspect the sleep log afterwards. [Machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)

One Behavior slice covers the whole handoff with a clean and a missing-command control. No separate Structure slice or further plan refinement is needed. The affected guidance is within the file-size limit. The live cost claim remains an evaluation result, outside preparation.

## Story obligations
