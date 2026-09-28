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

### Pending Claude Code acceptance regrouped by host

The escalation story, with its recorded identity, feasibility requirement and
harness limits, has moved to the
[Claude Code acceptance story](SEED-053-native-guidance-acceptance.md#native-acceptance-claude-code).
This anchor remains a navigation reference, not a separate active story.

<a id="native-one-shot-other-hosts"></a>

### Pending Codex and Cursor acceptance regrouped by host

The existing one-shot cases are now part of the
[Codex](SEED-053-native-guidance-acceptance.md#native-acceptance-codex) and
[Cursor](SEED-053-native-guidance-acceptance.md#native-acceptance-cursor)
acceptance stories, retaining the escalation feasibility dependency and
[one-shot release gate](SEED-053-native-guidance-acceptance.md#shared-one-shot-cases).
This anchor remains a navigation reference, not a separate active story.

## Breadcrumbs

- Maintainer capture on 2026-09-24; refinement decisions on 2026-09-26.
- [Product backlog](../PRODUCT-BACKLOG.md).
