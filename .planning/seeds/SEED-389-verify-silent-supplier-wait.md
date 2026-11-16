---
id: SEED-389
status: active
planted: 2026-11-16
planted_during: Terry asked to queue a follow-up to verify the silent supplier wait after release
trigger_when: selected from the backlog after a release containing the silent supplier wait and its follow-up fix is in use
scope: two stories
---

# SEED-389 — Verify the silent supplier wait in real use

## Shared evaluation

An Open Dough maintainer can decide whether SEED-368's silent wait is worth
keeping based on how much model work it avoids during real waits for paused
suppliers and whether those waits still handle publications and deadlines.

When either story comes up in the queue, the maintainer checks the retained
traces for that host. Start with three independent watches on the released
installation containing the wait and its follow-up fix. Include an unchanged
interval long enough to distinguish the old repeated polling behavior. If
the available examples are insufficient, record what is missing, defer that
story in the queue, and continue to the next eligible work. Revisit it when
more traces are available. Surface clear misses promptly under the
[recorded live-watch criteria](../../docs/maintainer/blocked-execution-experiment-findings.md#check-the-next-real-supplier-watch).

Retain each trace reference, installed release, unchanged duration, model wake
count, cached input share where there are wakes, and publication or deadline
outcome. Note missed publications, failed continuation, and developer
interventions. Record a host-specific keep, revise, or remove recommendation,
or an inconclusive result, in the
[experiment findings](../../docs/maintainer/blocked-execution-experiment-findings.md).
Use comparable historical waits where available and quantify token savings
when that comparison supports it.

<a id="verify-silent-supplier-wait-in-use"></a>

### Verify the silent supplier wait in Codex

**Identity:** SEED-389#verify-silent-supplier-wait-in-use
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

Use Codex traces to judge whether the wait stays within one model wake per
started five unchanged minutes and those wakes have at least 90% cached input.

<a id="verify-silent-supplier-wait-in-claude-code"></a>

### Verify the silent supplier wait in Claude Code

**Identity:** SEED-389#verify-silent-supplier-wait-in-claude-code
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

Use Claude Code traces to judge whether the background task lets the model
stay asleep while the supplier is unchanged and resumes it on completion.
