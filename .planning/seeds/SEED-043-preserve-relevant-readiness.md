---
id: SEED-043
status: active
planted: 2026-09-26
planted_during: Authorized three-project retrospective findings maintenance
trigger_when: Stories in a shared seed are prepared or closed concurrently
scope: small
---

# SEED-043: Keep readiness tied to relevant story changes

## Why This Matters

Developers preparing parallel work should be able to start an unchanged ready
story after an unrelated sibling is edited or closed. Whole-seed invalidation
adds reassessment and publication work without identifying a changed premise.
This serves low coordination cost and empirical simplification under
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).

## Stories

<a id="preserve-sibling-readiness"></a>

### Preserve readiness when an unrelated sibling story changes

**Identity:** SEED-043#preserve-sibling-readiness
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/129-preserve-sibling-readiness/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"510ed6dc34497b903f33e11cf25e7c59846eee3c88a976a8ca709a13e14e4e4c","plan":"2b0e665ddaa0b5d8b470b133ac32a30b6836b84cb88763c74eeabc0e77ab9be9"}}
```

**Goal:** An execution coordinator can start a ready story without repeating
preparation solely because a sibling story in the same seed was prepared,
edited or closed. Parallel preparation and execution of stories that share a
seed then stop racing over one readiness basis, in line with the near-future
direction of parallel trunk-based agents.

**Scope:**

- A story's readiness basis covers its own section, the seed's shared context
  and, when planned with a distinct file, its plan. The story's section is the
  region the backlog reader already uses: from its anchor to the next anchor or
  `## ` heading. Shared context is everything in the seed outside every
  anchored story section (frontmatter, title, seed-level prose such as "Why
  This Matters"). Story-state blocks stay excluded as today.
- Any change to the story's own section, including its **Depends on** line,
  to shared context, or to its plan still yields `needs-reassessment`.
- The CLI reader, `record-state`'s expected-basis check, execution startup and
  the dashboard share one basis meaning.
- A readiness assessment recorded under the former whole-seed basis stays
  valid while the whole seed is unchanged, and otherwise reads as
  `needs-reassessment`; it is never upgraded to ready without review.
- A home whose link names no story anchor, including a plan-homed correction,
  keeps its current whole-document basis.

**Deferred promises:**

- No detection of code drift or stale plan premises; readiness remains a
  preparation-content check (premise verification is SEED-044's concern).
- No relevance analysis between sections: a sibling section is excluded even
  when it mentions this story, and a change to shared context always
  invalidates, even when it concerns only one sibling.
- No renewal of siblings' readiness by wrap-up or preparation writers, and no
  handling of satisfied dependencies (ODF-120).
- No change to startup authority: a mismatched basis still refuses; no new
  dashboard presentation.

**Key examples:**

1. Stories A and B in seed S are both recorded ready. B is wrapped up and its
   section removed. Starting A succeeds with no new readiness commit.
2. A is ready; B is refined and planned in the same seed. Starting A succeeds.
3. A is ready; A's own text changes, for example its **Depends on** line after
   a dependency lands. Starting A is refused with `needs-reassessment`.
4. A is ready and A's plan changes. Starting A is refused.
5. A is ready and S's "Why This Matters" or frontmatter changes. Starting A is
   refused.
6. A was recorded ready before this change, under the whole-seed basis. With S
   untouched, A still reads ready; after B's closure, A reads
   `needs-reassessment`, and a fresh assessment then records the new basis.
7. A correction whose canonical home is its plan keeps reading ready or
   `needs-reassessment` exactly as before.

Cover the shared reader and startup contract; the logic is host-neutral Node
code, so justified reuse under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) replaces
native host runs.

**Supporting finding:** [ODF-116](../../docs/maintainer/finding-names.md#odf-116):
14 occurrences across Pygardon and Doughnut on 0.3.40–0.3.42 (2026-09-26/27),
on Claude Code and Codex, triggered by sibling preparation as well as closure;
each cost about 6–12 tool calls and an extra commit on main, and two raced a
concurrent Take. The executions and their provenance remain in the finding
record and sources.

**Completion:** Update ODF-116 with the actual response, commit, first containing
release and effectiveness limits. Queueing is not resolution.

**Depends on:** None. Satisfied dependency conditions (ODF-120), missing correction
preparation (ODF-122), and plan-during-execution authority (ODF-123) remain separate.

**Safe stopping point:** Parallel preparation avoids unrelated invalidation while
retaining the existing reassessment gate for relevant changes.
