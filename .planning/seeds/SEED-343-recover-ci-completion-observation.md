---
id: SEED-343
status: active
planted: 2026-11-13
planted_during: Combined retrospective maintenance and Terry's priority for Pygardon DD-501
trigger_when: An execution observer expires before the final accepted revision has a completion receipt
scope: story
---

# SEED-343: Recover the CI verdict after execution observation expires

## Why This Matters

A coordinator closing an accepted story needs the effective CI verdict and
confirmed observer shutdown before retiring its worktree. An expired observer
left Pygardon waiting for a run that could never start. The same eight-hour
observer has expired on GitHub Actions executions. The Open Dough lifecycle
owns the budget and recovery. The configured provider supplies CI evidence.

## Stories

<a id="recover-ci-completion-observation"></a>

### 1. Recover CI completion after the observer expires

**Identity:** SEED-343#recover-ci-completion-observation
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** When the execution observer's budget expires before a coordinator can
obtain the required CI receipt, give the coordinator a managed recovery path for
the already accepted SHA on its authorized target. Finish through the ordinary
completion receipt, including the effective evidence and confirmed shutdown when
successful. Preserve the original observation and publication records, keep
retries bounded, and leave resources available when evidence is unresolved or a
failure needs repair.

**Scope and evaluation**

- **Shared behavior.** Exercise the expiry-to-completion path through both
  GitHub Actions and a configured command adapter. GitHub Actions expiry is
  recorded in Open Dough and Clipboard. Pygardon exposed the closure consequence
  on its custom CI. Doughnut's separate GitHub Actions observer loss came from
  HTTP 502 and a TLS handshake timeout. Keep transport errors distinguishable
  from budget expiry. [ODF-259 and its provider evidence](../../docs/maintainer/findings/ODF-259.md) ·
  [ODF-121](../../docs/maintainer/findings/ODF-121.md).
- **Custom CI evidence.** Reproduce an ignored-only merge landing shaped like
  Pygardon `a5ceb3881`. The CI service reports `path_excluded`. The command
  adapter exposes attempts and queue state. Verify it can provide the applicable
  ancestor through that boundary. Effective evidence identifies passing basis `3855ca648` on the story-side
  ancestry. The older main attempt `9ae9897a6` cannot stand in for it. Confirm
  that GitHub Actions with a matching path filter can reach the same shared
  receipt semantics when an ignored-only revision has no exact run.
- **Applicability.** Reuse the existing exact-attempt and `not_required` rules.
  When no exact attempt exists, resolve the nearest attempted reachable
  ancestor across the merge ancestry and establish that the tree difference to
  it is ignored-only. An applicable failed or pending attempt keeps its actual
  state. Missing or ambiguous evidence stays unresolved. Preserve the existing
  completion rules for integrated state and actionable failures.
- **One recovery owner.** Start with the existing `deliver` / `finish`
  continuation, CI mailbox completion and shared applicability classifier.
  Execution and wrap-up use the same recovery and effective-evidence owner.
  If a read-only effective-verdict entry point is needed by another caller,
  expose the same calculation through it. Keep provider-specific acquisition at
  the existing adapter boundary and Pygardon's production release admission in
  its current owner. Preserve the original completion deadline on resume and
  verify repeat invocation leaves one owned observation and one receipt for the
  accepted SHA. [ADR 0006, one authoritative home per rule](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
- **Completion evidence.** Record the delivered recovery, its containing
  release, and both provider outcomes at [ODF-259](../../docs/maintainer/findings/ODF-259.md).
  Link the relevant outcome to [ODF-298](../../docs/maintainer/findings/ODF-298.md)
  and [ODF-334](../../docs/maintainer/findings/ODF-334.md) where it addresses
  their closure-continuation and polling evidence.
