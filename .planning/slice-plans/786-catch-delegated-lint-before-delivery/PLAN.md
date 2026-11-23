# Catch delegated lint failures before guarded delivery

**Source:** [SEED-345#catch-delegated-lint-before-delivery](../../seeds/SEED-345-session-token-efficiency.md#catch-delegated-lint-before-delivery)

## Goal and scope

Catch an applicable authored-file lint failure while the worker can fix it and before affected proof runs. Use the project's existing read-only lint and the existing focused-proof command path. The trial covers Open Dough's ESLint command and a control whose project has no scoped command. The coordinator retains selective formatting, staged lint, guarded delivery and proof for affected consumers. [ODF-329](../../../docs/maintainer/findings/ODF-329.md#evidence-2026-11-23-open-dough-odf-329) records the baseline. [ODF-529](../../../docs/maintainer/findings/ODF-529.md) covers unchanged consumers.

## Current decisions

- Remove the duplicate hook-owned lint clause from the shipped worker brief in [delegation.md](../../../Distribution/src/skills/dough-execute-plan/references/delegation.md). It has led workers to skip read-only proof. The [delivery rule](../../../Distribution/src/skills/dough-execute-plan/references/deliver-the-change.md) owns the staged hook. The existing literal focused command and worker result carry the check, and the existing refactor proof reuse rule covers a change to a checked path.
- A project that supplies suitable lint can compose its normal command as `lint … && existing-check …` within the approved focused proof. The tool's exit status determines whether proof starts. Projects without a suitable command keep their usual proof. A universal hook, path scanner, staged lint on the worker side and a whole-project fallback would add scope or recurring cost without supporting evidence. This slice needs no new shipped instruction, script, setting, handoff field or model invocation.
- Keep the change only if the replay makes the shipped guidance shorter, catches the retained defect before proof and avoids a refused delivery and repeated proof in that case. Compare the clean-run cost and actual repair work, and record the retain or no-change decision in ODF-329. Clean-run overhead applies every time the project chooses the check. Its frequency and the net saving across real slices remain unmeasured. Record the containing release only when verified.
- Follow [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md) by keeping project commands outside shared guidance and [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md) by reviewing a representative handoff and measuring the deterministic outcome. The [North Star on directly testable production boundaries](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support) supports exercising the existing proof and delivery entry points.

## Decisive premises

- Open Dough plan 759, slice 2, reached guarded formatting with `socket.binaryType` assigned on a parameter. The formatter refused and the coordinator renewed typecheck, six focused Vitest specs and four E2E journeys before [accepted delivery](https://github.com/terryyin/open-dough/commit/a48e1eae9bbba0ee045e207cee9e234707a5c1a0). That is the observed baseline. Later clean returns are evidence of feasibility, with no measured end-to-end saving.
- On 2026-11-23 at `63d05c6a7`, the owned preparation checkout ran `node node_modules/eslint/bin/eslint.js --max-warnings=0 --no-warn-ignored -- dashboard/src/attachedTerminal.ts` as the first command in a Bash `&&` chain. The restored historical assignment failed at line 50 on `no-param-reassign` in 2.10 s and skipped the following marker. The clean source passed in 1.79 s and reached the marker. The check left both inputs byte-for-byte unchanged. The scratch edit and temporary link to the integration checkout's installed dependencies were removed. The marker proves ordering. The delivery and proof comparison below measures work through the actual entry points.
- At `47e57c28c`, the maintained runner `bash scripts/test.sh` reported both [fresh](../../../Distribution/tests/skills/dough-execute-plan/execution-increment-fresh.test.mjs) and [fresh commit](../../../Distribution/tests/skills/dough-execute-plan/execution-increment-fresh-commit.test.mjs) passed. They exercise a formatting refusal before commit and a succeeding retry after repair. The socket replay still needs to exercise the combined path.

## Ordered slices

### 1. Catch scoped lint before focused proof
Type: Behavior
Status: planned

Shorten the worker briefing restriction in the distribution source under the [skill authoring behavior review](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review). Leave the shared delivery rule as the single owner of staged lint. Use the normal proof path with the project's explicit command and owned paths. Walk implementation and refactor returns through the existing evidence contract. Estimate 10–15 active minutes.

**Proof.** Replay the historical socket edit and its clean counterpart in an isolated checkout or fixture. Compare baseline delivery with the same candidate checked first using the literal scoped ESLint command, followed on success by the same existing focused proof. Observe the lint exit, whether focused proof starts, the repair and rerun count and the first guarded delivery result. Use local-only fresh preparation or the maintained fresh fixtures to verify the formatting refusal boundary and a successful clean delivery without a live push. Include a refactor that changes a checked path and a handoff with no scoped command. Confirm the no-command case carries its usual focused proof and normal delivery checks. Measure the extra check time on the clean path and compare the worker brief before and after. A controlled replay can show which work is avoided in that replay. Ongoing human and model-effort savings remain unknown.

## Local gate and readiness

Run the focused replay above under the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md). Start long macOS runs fully awake with `caffeinate -s -i` on AC. On battery, plug in or keep the lid open under `caffeinate -i` and inspect the sleep log afterward. [Machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)

One Behavior slice owns the earlier feedback and its proof. Further slice refinement is unnecessary because the change removes a restriction and uses the same command, evidence and delivery boundaries. No remaining slice concern was identified.

## Story obligations
