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

### Accept quiet completion and retained dashboard attention messages

**Identity:** SEED-053#quiet-dashboard-completion
**Completed implementation:** [SEED-008's completion story](https://github.com/terryyin/open-dough/blob/db75dac39cc8a1aae33e7e881d5c3363730f93c9/.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#installed-story-branch-integration), [plan 220](https://github.com/terryyin/open-dough/blob/db75dac39cc8a1aae33e7e881d5c3363730f93c9/.planning/slice-plans/220-quiet-dashboard-session-completion/PLAN.md).
Quiet wording and its response consumers also follow [SEED-145's completed story](https://github.com/terryyin/open-dough/blob/1ad488d7f3757d7a85f54f2277424f7c301ff1bb/.planning/seeds/SEED-145-no-news-is-good-news.md#quiet-land-and-wrap-up)
and [plan 331](https://github.com/terryyin/open-dough/blob/1ad488d7f3757d7a85f54f2277424f7c301ff1bb/.planning/slice-plans/331-quiet-land-and-wrap-up/PLAN.md).
Native cases must keep settled findings, authorized follow-up dispositions and
verified retirement quiet, while preserving actionable exceptions and requested
details. Their deterministic proof does not establish native compliance.
**Outcome:** Developers can rely on installed quiet completion and actionable
exceptions for Land/Wrap Up, standalone retrospective and planned execution on
Codex, Claude Code, and Cursor. This acceptance home
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

**Additional covered work:** [SEED-145's quiet retrospective and planned
execution story](SEED-145-no-news-is-good-news.md#quiet-execution-and-retrospective),
[plan 332](../slice-plans/332-quiet-execution-and-retrospective/PLAN.md). Its
functional guidance and credential-free assessor checks do not prove native
response selection. This extension changes no backlog assignment and authorizes
no paid sessions, release or rollout.

**Retrospective and execution behavior cases:** Select fresh installed sessions
by unresolved risk. Use the existing
[execution-review journeys](../../tests/native-publication.md) for controlled
review/completion/CI ordering where they fit; inspect standalone and attention
semantics against the following expectations rather than adding another runner.

| Case | Required observed outcome |
| --- | --- |
| Standalone settled review | No routine recap for no findings or already settled records; preserved proof, process findings and authorized dispositions remain inspectable. |
| Standalone actionable review | A draft or unresolved correction/adoption choice starts with `DEVELOPER ATTENTION REQUIRED`, names consequence, action/owner and evidence links; an explicit detail or review request remains effective. |
| Automatic review and quiet planned finish | Review returns without a separate visible report; record and records-only publication precede the completion operation. Actual applicable CI and product shutdown succeed before a quiet/minimal response, with workspace retained for separate wrap-up. |
| Explicit review skip | Records `Product advice: retrospective skipped`, completes observation/shutdown, and finishes quietly without an optional-skip warning or automatic review. |
| Duplicate attention followed by green CI | Overlapping reviews contribute one current issue after completion. A later successful check or no-change advice does not erase it; an evidenced authorized disposition can settle it. |
| Failure or missing evidence | A required failure, missing attribution/requested process history, or unconfirmed shutdown produces marked limitation and recovery action; partial review and needed resources survive, and no unsupported success is claimed. |
| Reporting boundary | Direct invocation makes no dashboard contact. Supplied context submits the exact marked attention text with completed/unfinished outcome and waits for its matching receipt; a quiet execution handoff submits nothing and leaves terminal/session continuation intact. |

Evidence must distinguish accepted publication from validated integrated state,
retain review limits, findings/correction records and completion receipts in
their existing homes, and show that quiet output starts no wrap-up, retirement,
follow-up execution or advice adoption. Empty response, a banner, host exit,
static guidance assertions and substitute-process observations prove none of
those operations. Assess native response meaning and actions, not just markers.

**Reuse and outstanding proof:** The earlier three-host reporting feasibility
evidence above remains limited to its unchanged callback mechanism. Inspect its
current inputs and conditions before reusing it for shipped integration; it does
not establish review behavior or the agent's choice to report. Existing
installation/publication evidence may cover unchanged mechanisms with a recorded
matching basis. Old banner-bearing transcripts cannot prove changed quiet or
actionable responses and must not be rewritten.

The shared attention framing also applies to Land/Wrap Up refresh attention.
Their bounded response assessor checks quiet/minimal output and refresh action
semantics; its unmarked positive fixtures do not prove marker-first framing.
Inspect that framing in native acceptance rather than treating its automated
pass as full attention-response acceptance.

| Host | Shared integration | Changed retrospective/planned-execution behavior |
| --- | --- | --- |
| Codex | Prior feasibility only; shipped integration pending or justified reuse required | Pending |
| Claude Code | Prior feasibility only; shipped integration pending or justified reuse required | Pending |
| Cursor | Prior feasibility only; shipped integration pending or justified reuse required | Pending |

For every affected requirement on each host, record fresh evidence or justified
reuse; select representative cases across hosts without inferring one host's
success from another or demanding every scenario on every host. Keep integration
claims separate from skill behavior claims. Functional implementation can close
with this acceptance pending. Affected release waits for acceptance or an explicit
human-owned exception under ADR 0005; paid native runs remain explicitly invoked.

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
- [Maintained CI background-delivery behavior and native acceptance](../../docs/maintainer/ci-background-delivery.md).
