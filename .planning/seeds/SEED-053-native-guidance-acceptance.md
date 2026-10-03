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

Maintainers need host-specific evidence for premise-verification and one-shot guidance. [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) says evidence from one host does not transfer to another. The Cursor one-shot result is recorded in [SEED-028](SEED-028-track-ad-hoc-work.md#story-decomposition). The Pygardon premise miss is recoverable at `24b5cbc1a821382d38b726d6079ac55e01635391:.planning/seeds/SEED-044-verify-planning-premises.md#name-the-feature-that-runs-moved-seeding`.

## Stories

The Cursor acceptance story is closed. Its evidence remains recoverable from the commit before this cleanup. The shared cases below stay because later premise work still uses them.

<a id="quiet-dashboard-completion"></a>

### Accept quiet dashboard completion and retained attention messages

**Identity:** SEED-053#quiet-dashboard-completion
**Completed implementation:** [SEED-008's completion story](https://github.com/terryyin/open-dough/blob/db75dac39cc8a1aae33e7e881d5c3363730f93c9/.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#installed-story-branch-integration), [plan 220](https://github.com/terryyin/open-dough/blob/db75dac39cc8a1aae33e7e881d5c3363730f93c9/.planning/slice-plans/220-quiet-dashboard-session-completion/PLAN.md).
**Outcome:** Developers can rely on the installed completion operation and quiet
Land/Wrap Up behavior on Codex, Claude Code, and Cursor. This acceptance home
tracks missing native proof separately from functional implementation; it adds
no queue assignment or independent execution authority.

**Feasibility prerequisite:** One fresh bounded session per host using the
dashboard's existing native launch mode and input builder, a private installed
representative skill, and a disposable launch-scoped receiver. Inspect native
command use, received facts, and exact host/session association. Representative
shared coverage must also observe Claude reporting before session binding,
continuation context, and a callable reporting operation after workspace
removal. Failure blocks dependent plan-220 slices.

**Integration acceptance after implementation:** On every affected host, fresh
dashboard launch context reaches the installed operation, the receipt belongs
to that session, and durable receipt precedes local Done without stopping the
sending turn. Cover attention retention, retry, and retirement representatively;
reuse unchanged host integration only with matching mechanism evidence.

**Skill behavior acceptance:** Fresh native Land and Wrap Up use settles the
existing operations, gives no routine success recap, submits the same useful
attention text retained by the dashboard when needed, and reports unfinished
operations or unacknowledged delivery truthfully. Direct use needs no dashboard
connection. Shared integration success does not prove these skill behaviors.

**Completion criteria:** Required integration evidence on all three hosts plus
representative Land/Wrap Up behavior evidence or justified reusable proof for
each requirement; no pending requirement may be called passed. Complete before
affected release under ADR 0005. The slice-1 fixture only proves feasibility.
No prior evidence was reusable for this new callback mechanism. Paid runs remain
explicitly invoked; add none to default tests or CI.

**Current state:** [Recovered slice-1 observations](https://github.com/terryyin/open-dough/blob/db75dac39cc8a1aae33e7e881d5c3363730f93c9/.planning/slice-plans/220-quiet-dashboard-session-completion/PLAN.md#accepted-execution-evidence-2026-10-02)
retain accepted Codex reporting, same-session continuation and post-retirement callability,
and accepted Cursor reporting on its original session. Native fixture trust was resolved
interactively. Claude's later “Code from External” rejection stopped its path until the
user explicitly approved the reviewed initial reporting command and an exact fixture-only
Bash rule. Recovery then resumed the original stopped Claude session: real Bash result,
matching receipt before session binding, exact reconciliation, retained acknowledgment,
and normal native `end_turn` were inspected and accepted by the coordinator.
No global permission mode, broad allowance, unapproved phase, or alternate rejected route
was used. The three-host fixture evidence establishes mechanism feasibility only, including
representative early binding, continuation and post-retirement callability. Shipped integration
and actual quiet Land/Wrap Up skill behavior remain unproved on all three hosts; complete
that separate acceptance before affected release. Selected plan execution and subsequent
acceptance selection retain their own authority boundaries.

## Shared premise-verification cases

These cases are the shared premise-verification setup. The guidance is delivered.
The Pygardon miss is recoverable at `24b5cbc1a821382d38b726d6079ac55e01635391:.planning/seeds/SEED-044-verify-planning-premises.md#name-the-feature-that-runs-moved-seeding`.
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
| Pygardon seeding proof | **Fail.** Plan `208` moves `gate_baseline_genome` under tests and proves that with pytest. It never names `live_strategies.feature` or `seed_named_genome_live_strategy_pair.py`, although that feature was in the checkout. The guidance change is recoverable at `24b5cbc1a821382d38b726d6079ac55e01635391:.planning/seeds/SEED-044-verify-planning-premises.md#name-the-feature-that-runs-moved-seeding`. |
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
