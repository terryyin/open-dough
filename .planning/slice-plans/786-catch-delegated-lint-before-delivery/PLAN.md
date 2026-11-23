# Catch delegated lint failures before guarded delivery

**Source:** [SEED-345#catch-delegated-lint-before-delivery](../../seeds/SEED-345-session-token-efficiency.md#catch-delegated-lint-before-delivery)
**Source review:** [Source-only review](source-review.md)

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
Status: done

Shorten the worker briefing restriction in the distribution source under the [skill authoring behavior review](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review). Leave the shared delivery rule as the single owner of staged lint. Use the normal proof path with the project's explicit command and owned paths. Walk implementation and refactor returns through the existing evidence contract. Estimate 10–15 active minutes.

**Proof.** Replay the historical socket edit and its clean counterpart in an isolated checkout or fixture. Compare baseline delivery with the same candidate checked first using the literal scoped ESLint command, followed on success by the same existing focused proof. Observe the lint exit, whether focused proof starts, the repair and rerun count and the first guarded delivery result. Use local-only fresh preparation or the maintained fresh fixtures to verify the formatting refusal boundary and a successful clean delivery without a live push. Include a refactor that changes a checked path and a handoff with no scoped command. Confirm the no-command case carries its usual focused proof and normal delivery checks. Measure the extra check time on the clean path and compare the worker brief before and after. A controlled replay can show which work is avoided in that replay. Ongoing human and model-effort savings remain unknown.

## Local gate and readiness

Run the focused replay above under the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md). Start long macOS runs fully awake with `caffeinate -s -i` on AC. On battery, plug in or keep the lid open under `caffeinate -i` and inspect the sleep log afterward. [Machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)

One Behavior slice owns the earlier feedback and its proof. Further slice refinement is unnecessary because the change removes a restriction and uses the same command, evidence and delivery boundaries. No remaining slice concern was identified.

## Execution context

Story Branch Mode. Owned checkout `/Users/terryyin/git/open-dough/.worktrees/catch-delegated-lint-failures-before-guarded-del` on `codex/catch-delegated-lint-failures-before-guarded-del`. Yua-chan continues the published claim `67f8d37bfd8cb4ad61dc3d6a9ce2675e13bdb905`, which started at `94de28b8edc463b821d805c5a035ac93cb2a8702`. The remote story branch confirms the claim revision and `origin/main` contains it.

The checkout passed `node scripts/setup-native.mjs npm` and `node node_modules/eslint/bin/eslint.js --max-warnings=0 --no-warn-ignored -- dashboard/src/attachedTerminal.ts`. Branch CI uses GitHub Actions `ci.yml` on `terryyin/open-dough`. Codex coordinator `yua-chan-786` owns the yielded stream `/tmp/dough-ci-501/watch-au4U0y` (PID 60535, session 69604, cell `g367:8`). The trunk claim preceded this branch observer.


## Accepted proof

At `67f8d37bfd8cb4ad61dc3d6a9ce2675e13bdb905`, a scratch clone with its own locked install and no remote replayed the historical socket edit. Both defective inputs moved the binary type assignment into `attachTerminal` and restored the writable socket type. The baseline ran `npm run typecheck:dashboard` and `npm run test:dashboard:frontend -- --workers=1 frontend-tests/terminals/session-terminal-keyboard.spec.ts`. All four selected Chromium cases passed in the 36.74 s focused round. Local-only fresh preparation with `npm run format` then refused `no-param-reassign` in 6.46 s, before the staged hook or commit. The coordinator-role repair moved the assignment back to the opener and restored the readonly type. The same proof passed again, and the guarded retry committed through the real hook.

The paired implementation handoff prefixed the same focused command with `node node_modules/eslint/bin/eslint.js --max-warnings=0 --no-warn-ignored -- dashboard/src/attachedTerminal.ts` and Bash `&&`. ESLint returned 1 on the same defect after 3.35 s without changing the input bytes or reaching the proof marker. After the same mechanical repair in the worker role, lint passed in 3.90 s, all four cases and typecheck passed, and the first guarded attempt committed through the real hook. Baseline versus scoped replay used two versus one focused rounds and two versus one guard attempts. Each needed one repair. The clean scoped check took 2.12 s before usual typecheck. A refactor changed the checked attachment path, renewed lint in 1.97 s, and passed typecheck and guarded delivery. Both the staged-only and whole-repository-only handoffs supplied usual typecheck without a scoped worker command. Both passed typecheck and local-only fresh with their normal formatter and real staged hook.

The worker brief went from 180 to 179 lines and 11,052 to 11,013 bytes. The representative walk followed its existing literal command, return and checked-path proof reuse. The delivery guidance retains coordinator formatting, hook-owned staged lint and guarded publication. The selected shell check `Distribution/evaluation/tests/delivery-evidence/delivery-evidence-native-routing.sh` passed through `scripts/test.sh` with Bash 5. It checked the installed briefing's input identity in the credential-free routing fixture.

**Decision.** Retain the deletion. Earlier feedback removed a refused delivery and its renewed proof in this replay, with a measured 2.12 s clean check. The initial replay hit its outer deadline under load and resumed outstanding arms with live capture. The first routing launch stopped at the Bash version check. Different host loads, a focused four-case replay, and modeled handoffs limit the comparison to the observed work. Real-world frequency, net savings and agent behavior remain unmeasured. The named source observations and the terminal records are indexed in `implementation-return.md` under this worktree's Git evidence directory.

Independent post-change review found no refactor candidates or invalidated proof. The ODF-329 evaluation is a coordinator records-only edit.

## Story obligations
