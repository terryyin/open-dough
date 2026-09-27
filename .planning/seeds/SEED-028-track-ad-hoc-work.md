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

**One-shot native acceptance on Claude Code** is complete. Claude Code runs of
`publication/one-shot-result`, `publication/one-shot-queued` and
`publication/admission-investigation` passed with fresh proof against guidance
revision `5181d769` on 2026-09-27. Codex, Cursor and escalation remain pending,
so one-shot is not yet natively accepted for release under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).

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

**Harness limits:** `tests/support/git-publication-native-one-shot.sh` (249
lines) and `tests/support/git-publication-native-assess.sh` (250) are at the
250-line limit, so an escalation case needs its own support file. The native
job measured 52.2 s on CI against `per-job-seconds=71`; if a further substitute
journey would breach that, move the one-shot substitute journeys into their own
test job.

<a id="native-one-shot-other-hosts"></a>

### 6. Accept one-shot natively on Codex and Cursor

**Identity:** SEED-028#native-one-shot-other-hosts
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Codex and Cursor agents pass the one-shot cases already accepted on
Claude Code; evidence from Claude Code does not transfer.

**Depends on:** Claude Code acceptance, now complete, and, for escalation,
[its feasibility](#native-one-shot-escalation). The result and queued cases
need no new fixture: run them with `--native codex` and `--native cursor`.
This story gates release of the one-shot guidance under ADR 0005.

## Breadcrumbs

- Maintainer capture on 2026-09-24; refinement decisions on 2026-09-26.
- [Product backlog](../PRODUCT-BACKLOG.md).
