---
id: SEED-044
status: active
planted: 2026-09-26
planted_during: Maintainer review of retrospective finding priorities
trigger_when: A plan's readiness depends on claims about existing code or executable proof
scope: unknown
---

# SEED-044: Start execution from verified planning premises

## Why This Matters

Developers and execution coordinators need a ready plan whose decisive claims
about existing code, fixtures, environment and proof paths hold in the target
project. Discovering an invalid premise during execution causes avoidable scope
changes, failed paid runs, replanning and missing CI evidence. This serves the
low coordination cost and empirical improvement goals of
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).

## Pending native acceptance

<a id="native-premise-acceptance-codex-cursor"></a>

The pending premise-verification work belongs to the
[Cursor](SEED-053-native-guidance-acceptance.md#native-acceptance-cursor)
story. The original cases, setup, constraints and Claude Code reference
are retained in their [shared acceptance context](SEED-053-native-guidance-acceptance.md#shared-premise-verification-cases).
This anchor remains a navigation reference, not a separate active story.
