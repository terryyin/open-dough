---
id: SEED-028
status: active
planted: 2026-09-24
planted_during: Product backlog capture requested by the maintainer
trigger_when: Authorized product work would start outside the product backlog
scope: unknown
---

# SEED-028: Make ad hoc work visible in the product backlog

## Why This Matters

Developers cannot coordinate product work they cannot see. Bug fixing and test
optimization can start from a direct request without appearing alongside queued
stories. The problem is the missing admission into shared work tracking, rather
than a distinct kind of execution or completion.

## Alternatives and Direction

For developers coordinating concurrent product work, independently accepted work
that currently bypasses the queue should become visible with ordinary story
ownership and closure, while an explicit `--one-shot` option keeps genuinely
trivial work proportionate.

Doing nothing retains the visibility gap. Manually assembling a seed, claim and
profile with existing tools is the strongest smaller alternative, but leaves
each entry workflow responsible for remembering and publishing a consistent
claim. A rule to "remember the backlog" alone does not establish that boundary.
Use shared admission and the ordinary lifecycle, with one explicit exception for
one-shot work. These alternatives are the decomposition's rationale, not claims
that a manual experiment has already been performed.

The first story tests whether minimal story admission makes real emergent work
visible without forcing a plan. The second tests whether the trivial-work
exception can remain cheap without hiding work that grows. Research and necessary
cross-layer changes belong within these outcomes, not in separate infrastructure,
dashboard or research stories.

## Story Decomposition

<a id="native-one-shot-acceptance"></a>

### 4. Accept one-shot natively on Claude Code

**Identity:** SEED-028#native-one-shot-acceptance
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A Claude Code agent asked for explicit one-shot work publishes only
its verified result, and completes a queued story in one commit.

**Why:** [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)
requires native behavior evidence before release; the one-shot guidance has
mechanical proof only. The remaining risk is agent judgment the scripts do not
cover: selecting `--one-shot` only when asked, and composing a queued story's
closure into the result commit.

**Cases** (named in plan 112, recoverable at
`36e62435:.planning/slice-plans/112-one-shot-work/PLAN.md`), as manual cases in
`tests/git-publication-native.sh`: `publication/one-shot-result` (explicit flag,
only the result on trunk, workspace retired; ordinary contextual work still
admits, reusing the admission native evidence where entry coherence left it
valid), `publication/one-shot-queued` (result and cleanup in one commit, no
intermediate Taken on origin).

**Excludes:** Codex and Cursor, and escalation (stories 5 and 6); bug-fixing
and test-optimization entry routes; the ownership-changed race, interrupted
publication resume and carry conflict, which deterministic tests cover.

**Constraints:** Paid native runs are manually triggered only, once per case
per guidance version.

<a id="native-one-shot-escalation"></a>

### 5. Accept one-shot escalation natively on Claude Code

**Identity:** SEED-028#native-one-shot-escalation
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A Claude Code one-shot attempt that proves larger than one-shot
allows is admitted before further edits, keeps its edits, and continues without
an unnecessary approval stop (`publication/one-shot-escalation`).

**Feasibility first:** find a fixture where the agent discovers the growth
without the prompt supplying the expected answer; admitting up front is a
legitimate outcome, not a failure.

<a id="native-one-shot-other-hosts"></a>

### 6. Accept one-shot natively on Codex and Cursor

**Identity:** SEED-028#native-one-shot-other-hosts
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Codex and Cursor agents pass the one-shot cases already accepted on
Claude Code; evidence from Claude Code does not transfer.

**Depends on:** [Claude Code acceptance](#native-one-shot-acceptance) and, for
escalation, [its feasibility](#native-one-shot-escalation).

## Breadcrumbs

- Maintainer capture on 2026-09-24; refinement decisions on 2026-09-26.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Existing test optimization continuation](SEED-004-extract-and-adopt-project-guidance.md#continue-test-optimization-plans).
