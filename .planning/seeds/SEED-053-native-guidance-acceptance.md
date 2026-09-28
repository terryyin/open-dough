---
id: SEED-053
status: active
planted: 2026-09-28
planted_during: Maintainer request to regroup existing native acceptance by host
trigger_when: Completing the existing pending native acceptance on Codex, Claude Code or Cursor
scope: unknown
---

# SEED-053: Accept existing guidance natively on each host

## Why This Matters

Maintainers need host-specific evidence for the pending premise-verification
and one-shot guidance. [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)
says evidence from one host does not transfer to another. This seed regroups
the existing work from [SEED-044](SEED-044-verify-planning-premises.md) and
[SEED-028](SEED-028-track-ad-hoc-work.md) into one story per host, with no
additional acceptance cases or implementation scope.

## Stories

<a id="native-acceptance-codex"></a>

### Accept existing guidance natively on Codex

**Identity:** SEED-044#native-premise-acceptance-codex-cursor
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Codex planners catch the recorded false premises and keep the
sound-premise control proportionate; Codex agents pass the one-shot cases
already accepted on Claude Code and the escalation case once feasible.

**Evaluation:** Run the Codex portion of the shared premise-verification and
one-shot cases below. The existing result and queued fixtures run with
`--native codex` and need no new fixture.

**Escalation sequencing:** Only the escalation case waits for
[Claude Code's fixture feasibility](#native-acceptance-claude-code).
Premise verification and the already accepted one-shot cases can proceed
independently.

<a id="native-acceptance-claude-code"></a>

### Accept existing guidance natively on Claude Code

**Identity:** SEED-028#native-one-shot-escalation
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A Claude Code one-shot attempt that proves larger than one-shot
allows is admitted before further edits, keeps its edits, and continues without
an unnecessary approval stop (`publication/one-shot-escalation`). Premise
verification and the other recorded one-shot cases are already accepted on
Claude Code; this story retains only the pending escalation work.

**Feasibility first:** Find a fixture where the agent discovers the growth
without the prompt supplying the expected answer; admitting up front is a
legitimate outcome, not a failure.

**Harness limits:** `tests/support/git-publication-native-one-shot.sh` (249
lines) and `tests/support/git-publication-native-assess.sh` (250) are at the
250-line limit, so an escalation case needs its own support file. The native
job measured 52.2 s on CI against `per-job-seconds=71`; if a further substitute
journey would breach that, move the one-shot substitute journeys into their own
test job.

<a id="native-acceptance-cursor"></a>

### Accept existing guidance natively on Cursor

**Identity:** SEED-028#native-one-shot-other-hosts
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Cursor planners catch the recorded false premises and keep the
sound-premise control proportionate; Cursor agents pass the one-shot cases
already accepted on Claude Code and the escalation case once feasible.

**Evaluation:** Run the Cursor portion of the shared premise-verification and
one-shot cases below. The existing result and queued fixtures run with
`--native cursor` and need no new fixture.

**Escalation sequencing:** Only the escalation case waits for
[Claude Code's fixture feasibility](#native-acceptance-claude-code).
Premise verification and the already accepted one-shot cases can proceed
independently.

## Shared premise-verification cases

These cases belong to the [Codex](#native-acceptance-codex) and
[Cursor](#native-acceptance-cursor) stories. The premise-verification guidance
is delivered; neither story has an implementation prerequisite for these cases.
Claude Code acceptance is recoverable at
`874f9a8:.planning/seeds/SEED-044-verify-planning-premises.md`.

**Reusable cases** (from plan 115 slice 2, recoverable at
`874f9a8:.planning/slice-plans/115-verify-planning-premises/PLAN.md`):

| Case | Revision | Pass when the written plan |
| --- | --- | --- |
| Doughnut "no test" | parent of `20efa7ec81`, seed from `20efa7ec81` | names `scripts/test/quality_changed.test` with a recorded observation instead of claiming the commit-gate script has no test |
| Pygardon seeding proof | parent of `b2ad7c394`, seed and backlog from `b2ad7c394` | proves the moved seeding with a feature that runs the seeding script, such as `live_strategies.feature`, not `strategy_verify.feature` alone |
| Open Dough control | parent of `e7107e5`, seed from `e7107e5` | records observations, reaches `ready`, and adds no probe slice, new approval or full-suite run beyond plan 111 |

**Setup per case:** A disposable clone with `origin` removed, checked out at
the pre-plan parent; restore the refined seed with its story state reset to
`refined`/`unselected`; run `install.sh --target <clone> --source <open-dough
checkout> --platform <host> --force`; then run the host's planning-only
invocation naming the story link, told not to implement, commit, push or
publish.

**Constraints:** Paid native runs are manually triggered only. Add none to
`npm test`, `scripts/test.sh`, CI, or a wrapper whose default calls a real
host. Each case runs once per guidance version, and claims stay limited to
the observed runs compared with a pre-change baseline on that host.

**Claude Code reference:** The baseline caught Pygardon but missed Doughnut.
After the change all three cases passed; the control's observations were
heavier than brief.

## Shared one-shot cases

[Claude Code's accepted evidence](SEED-028-track-ad-hoc-work.md#story-decomposition)
covers `publication/one-shot-result`, `publication/one-shot-queued` and
`publication/admission-investigation`. The [Codex](#native-acceptance-codex)
and [Cursor](#native-acceptance-cursor) stories retain acceptance of these
existing cases on their own host, plus escalation after its feasibility is
established in the [Claude Code story](#native-acceptance-claude-code).
This pending acceptance continues to gate release of the one-shot guidance
under ADR 0005.

## Priority and regrouping

Keep the three existing acceptance slots in the product backlog: Codex uses
the former combined premise-verification slot, Claude Code keeps its escalation
slot, and Cursor uses the former combined one-shot slot. Unrelated entries
keep their order. The three recorded identities and their unrefined,
unselected preparation facts carry across; this is regrouping, not new work
or acceptance evidence.

## Breadcrumbs

- Maintainer request on 2026-09-28: one existing acceptance story per host;
  preserve scope and approximately preserve priority.
- [Product backlog](../PRODUCT-BACKLOG.md).
