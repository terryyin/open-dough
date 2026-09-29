---
id: SEED-053
status: active
planted: 2026-09-28
planted_during: Maintainer request to regroup existing native acceptance by host
trigger_when: Completing the remaining Cursor native acceptance
scope: unknown
---

# SEED-053: Accept existing guidance natively on each host

## Why This Matters

Maintainers need host-specific evidence for premise-verification and one-shot guidance. [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) says evidence from one host does not transfer to another. The Cursor one-shot result is recorded in [SEED-028](SEED-028-track-ad-hoc-work.md#story-decomposition). The Pygardon premise miss is [SEED-044#name-the-feature-that-runs-moved-seeding](SEED-044-verify-planning-premises.md#name-the-feature-that-runs-moved-seeding).

## Stories

The Cursor acceptance story is closed. Its evidence remains recoverable from the commit before this cleanup. The shared cases below stay because later premise work still uses them.

## Shared premise-verification cases

These cases are the shared premise-verification setup. The guidance is delivered.
The Pygardon miss is a separate queued story.
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

**Cursor premise evidence (2026-09-29):** guidance installed as Open Dough
`0.3.46` from source checkout `0901bbabd1b08ee49a0c843d19bbecf271ed0bf1`,
Cursor agent `2026.09.28-64d2043`. One planning-only run per case
(`cursor agent --print --force --trust --sandbox disabled`), told not to
implement, commit, push, or publish. Transcripts and written plans are under
`native-results/cursor-premise/`.

| Case | Verdict |
| --- | --- |
| Doughnut "no test" | **Pass.** Plan `043` names `scripts/test/quality_changed.test` and records that its fake `pnpm` sees unstaged files for format and only staged components for lint. It reaches `ready`. |
| Pygardon seeding proof | **Fail.** Plan `208` moves `gate_baseline_genome` under tests and proves that with pytest. It never names `live_strategies.feature` or `seed_named_genome_live_strategy_pair.py`, although that feature was in the checkout. The guidance change is [SEED-044#name-the-feature-that-runs-moved-seeding](SEED-044-verify-planning-premises.md#name-the-feature-that-runs-moved-seeding). |
| Open Dough control | **Pass, heavier than plan 111.** Plan `111` records five observed premises, reaches `ready`, and adds no probe slice, new approval, or full-suite run. Its proof also names dashboard Playwright specs that assert plan paths. |

## Shared one-shot cases

[Claude Code's accepted evidence](SEED-028-track-ad-hoc-work.md#story-decomposition)
covers `publication/one-shot-result`, `publication/one-shot-queued`,
`publication/admission-investigation` and `publication/one-shot-escalation`.
The [Cursor](#native-acceptance-cursor) story retains acceptance of these
cases on its own host.
ADR 0005 requires acceptance before ordinary release of affected behavior.
The [release history](../../CHANGELOG.md) records explicit maintainer exceptions
that shipped this behavior with native acceptance still pending; those
exceptions establish neither a pass nor closure of these requirements.

## Priority and regrouping

Keep the Cursor acceptance story in its existing product backlog position.
Unrelated entries keep their order.

## Breadcrumbs

- Maintainer request on 2026-09-28: one existing acceptance story per host;
  preserve scope and approximately preserve priority.
- [Product backlog](../PRODUCT-BACKLOG.md).
