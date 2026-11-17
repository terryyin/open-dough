---
id: SEED-397
status: active
planted: 2026-11-18
planted_during: Wrap-up retained the agreed post-release evaluation from SEED-345
trigger_when: A release containing the recoverable-proof changes is installed and a real planned execution is available
scope: one evaluation
---

# Evaluate recoverable proof evidence in real execution

<a id="evaluate-recoverable-proof-evidence"></a>

### Evaluate recoverable proof evidence in the next real planned execution

**Identity:** SEED-397#evaluate-recoverable-proof-evidence
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal and beneficiary.** Developers and maintainers can judge whether retained run records and compact hand-backs reduce rereading and recovery without dropping proof. Retain the agreed keep, revise or stop judgment from the [delivered source](https://github.com/terryyin/open-dough/blob/45ff02fee774a270826cd7507fee2ce1c9d077cc/.planning/seeds/SEED-345-session-token-efficiency.md#recover-decisive-verification-evidence).

**Scope.** After a release containing `45ff02fee774a270826cd7507fee2ce1c9d077cc` is installed, inspect the next real planned execution's trace on any host, using the [retained effort command](../../dashboard/AGENT-EFFORT.md). No paid comparison or synthetic replacement execution. Preserve proof quality and compare total coordinator and worker effort on comparable work.

**Examples and decision.** Keep when hand-backs are shorter than the baseline median, acceptance reaches decisions from records/logs/the report, and no proof is rerun merely to recover output. Revise when a second round is needed for a proof row the verdict dropped, or CI, retrospective or a later slice finds a defect the full return would have shown. Stop and rethink when coordinators load whole reports or logs anyway. Record the observed evidence and limits; this evaluation does not itself implement a revision.

**Baseline.** The source retained 315 Claude Code coordinator hand-backs, 2.78M characters, median 7.8k and 90th percentile 14.4k across whole sessions. Keep that host/session scope explicit when interpreting the next execution. The original research and output-loss examples remain linked from the delivered source.
