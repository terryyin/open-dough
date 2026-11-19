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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/688-evaluate-recoverable-proof-evidence/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"6dda89b8b3b00af4454b0a3cb1c3d1cf057c1b8810382a1379171e34daeee212","plan":"737c5cf191c788e7c8c976b23b99a6bec1b444f3c2c0ab12313c6d9259167720"}}
```

**Goal.** Open Dough maintainers decide, from one real planned execution, whether to keep, revise or stop the retained run records and compact hand-backs from the [delivered source](https://github.com/terryyin/open-dough/blob/45ff02fee774a270826cd7507fee2ce1c9d077cc/.planning/seeds/SEED-345-session-token-efficiency.md#recover-decisive-verification-evidence). Developers whose stories a coordinator executes benefit when the change reduces rereading and recovery with every required proof row kept.

**Scope.**

- **Qualifying execution.** The first planned execution, on any host and in any project on this machine, that started under an installed release containing `45ff02fee774a270826cd7507fee2ce1c9d077cc`, delegated at least one slice to a worker, and reached the coordinator's proof acceptance. Release v0.3.105 contains that revision and was installed on 2026-11-18 by 08:53:30 +0800. When none qualifies, record what is missing in the plan, leave the story queued, and continue with other work.
- **Observations.** Read the execution's retained coordinator and worker traces. Take total coordinator and worker effort from `dashboard/server/compareAgentEffort.ts` in task mode. The command reports no hand-back sizes, so measure each worker hand-back the coordinator received in characters from the trace. From the coordinator's tool calls, establish what each acceptance decision read (run record, log excerpt, full report or whole log), each proof command rerun and its reason, and each second round returned to a worker with its cause. The evidence location is removed when the execution worktree retires, so the trace is the source.
- **Later defects.** Include what CI, the retrospective and later slices of the same execution found up to the time of evaluation; name what had not yet run as a limit.
- **Verdict.** One of keep, revise, stop and rethink, or inconclusive, under the decision below, recorded in the plan with the trace references, the installed release, the figures and the limits. A revise or stop verdict also queues one follow-up story carrying that evidence.

**Scope limits.** No paid comparison and no synthetic or replacement execution. The evaluation changes no guidance or script; a revision is the follow-up story's work. One execution is the sample; its verdict claims nothing about other hosts or projects.

**Decision.** Keep when hand-backs are shorter than the baseline median, acceptance reaches its decisions from records, log excerpts and the report, and no proof is rerun merely to recover output. Revise when a second round is needed for a proof row the verdict dropped, or CI, the retrospective or a later slice finds a defect the full return would have shown. Stop and rethink when coordinators load whole reports or logs anyway. Inconclusive when the observations support none of these; say which observation was missing.

**Key examples.**

1. Keep: a Claude Code execution's six hand-backs have a 2.1k-character median against the 7.8k baseline, each acceptance reads a run record and the named assertions, and no proof command is repeated → keep, with the figures and trace references recorded.
2. Revise: a hand-back omits one promise's observation, the coordinator returns the slice for it, and the second return supplies a row the earlier full return format required → revise, and a follow-up story is queued with that exchange as evidence.
3. Stop: hand-backs are short, but the coordinator opens the full report and the whole log for most acceptance decisions, so coordinator effort is not lower → stop and rethink, with a queued follow-up.
4. Other host: the qualifying execution ran in Codex, where no hand-back baseline exists → hand-back sizes are reported without the median comparison, the verdict rests on the acceptance-read and rerun observations, and the missing baseline is a named limit.
5. Not yet: no release contains the revision, or the only executions since were planless → the plan records what is missing and the story stays queued.

**Baseline.** The source retained 315 Claude Code coordinator hand-backs, 2.78M characters, median 7.8k and 90th percentile 14.4k across whole sessions, in the [session-efficiency research](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/session-token-efficiency-research.md#2-return-decision-sized-evidence-and-retain-the-full-artifacts). It covers Claude Code only and whole sessions, not single executions; keep that scope explicit when comparing. The output-loss examples remain linked from the delivered source.
