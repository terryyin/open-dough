# Assess intended behavior without requiring expected wording

Status: complete — 2026-09-07. Leaves 1–4 remain applicable.
`npm test` and `npm run lint` ran once at completion. This plan closes
[SEED-007 Story 2](../../seeds/SEED-007-cross-tool-validation.md#trust-native-verdicts)
cheap checks. Story 3 owns outstanding native evidence.

Order: **20 → 22 → 21**. Plans 20 and 22 delivered Story 1 cheap checks.

## Scope

Repair prompts and assessment in the existing context and delivery checks under
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md). Consume
[plan 22](../022-retain-native-evidence-for-verdicts/PLAN.md)'s retained
context and combined update→fresh-use artifacts. Shared behavior is tested once;
only command/event differences are per tool. No skill/installer changes, native
runs, or native-acceptance claims.

## Ordered slices

### 1. Gate assessment on execution and installed activation

Type: Behavior
Status: done

Recorded proof: `tests/native-prerequisite-gate.sh`. Shared success, execution
failure, missing evidence, and wrong-copy once. Cursor successful installed
`readToolCall` vs requested read. Codex recorded expansion vs completion
marker. Claude Skill request stays inconclusive.

### 2. Replace wording checks in clear and conflicting ADR use

Type: Behavior
Status: done

Recorded proof: `tests/native-adr-behavior.sh`. Same ordinary session-storage
prompt for clear and conflict. Valid recommendation, valid stop, conditional
stop, misleading wording, uncertain prose inconclusive.

### 3. Assess the combined update and fresh use from observed state

Type: Behavior
Status: done

Recorded proof: `tests/native-journey-state.sh` plus
`tests/native-delivery-updated-use.sh` and adapter proof. Ordinary update/use
prompts. Observed bytes/version/preservation plus the shared conflict stop.

### 4. Keep legacy refusal as a shared product behavior check

Type: Behavior
Status: done

Recorded proof: `tests/native-legacy-refusal.sh`. Unchanged trees plus a genuine
refusal pass; unrelated execution failure and a refusal claim with writes
cannot pass. Unresolved prose stays inconclusive. Selected
`delivery/legacy-refusal` remains unavailable. Cheap wrappers do not certify
native refusal.

## Completion and native evidence

| Platform | Cheap adapter proof | Native acceptance |
| --- | --- | --- |
| Codex | Shared assessors; recorded expansion vs marker. Historical live expansion is input, not new proof. | Pending Story 3: discovery, invocation/application, intended behavior, install/update/coexistence or justified reuse, including representative refusal. |
| Cursor | Shared assessors; successful installed `readToolCall` vs requested read. | Pending Story 3 as above. |
| Claude Code | Shared assessors. Skill request stays inconclusive; no supported recorded activation form. | Pending Story 3 native activation observation and representative refusal; a Skill request is not activation evidence. |

This plan's completion closes test migration only. Coached historical runs gain
no new claim. Do not write `.planning/STATE.md` as resume state.

## Learnings

- Claude Code's only recorded activation form is a Skill request. That stays
  inconclusive; do not invent a vendor success event.
- Complete execution is a prerequisite, not a wording pass. Vague prose stays
  inconclusive for review.
- `tests/README.md` documents automatic vs review checks and which native
  refusal evidence Story 3 still needs.
