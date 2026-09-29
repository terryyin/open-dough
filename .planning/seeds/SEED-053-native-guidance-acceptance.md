---
id: SEED-053
status: active
planted: 2026-09-28
planted_during: Maintainer request to regroup existing native acceptance by host
trigger_when: Completing the existing pending native acceptance on Codex or Cursor
scope: unknown
---

# SEED-053: Accept existing guidance natively on each host

## Why This Matters

Maintainers need host-specific evidence for the pending premise-verification and one-shot guidance. [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) says evidence from one host does not transfer to another. This seed regroups the existing work from [SEED-044](SEED-044-verify-planning-premises.md) and [SEED-028](SEED-028-track-ad-hoc-work.md) into one story per host, with no additional acceptance cases or implementation scope.

## Stories

<a id="native-acceptance-codex"></a>

### Accept existing guidance natively on Codex

**Identity:** SEED-044#native-premise-acceptance-codex-cursor
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/141-codex-native-guidance-acceptance/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d6e8b4c6be78b0ba2a534f5379d397cca55d871d0b0fbe08307c29649a2eb49c","plan":"7649f3ecaf87238d48f04b7f0e173096da0d457a4dbd8ffa38492806855dd808"}}
```

**Goal:** Developers using Codex can rely on the selected planning and work-tracking guidance: plans observe decisive premises before readiness, explicitly selected trivial work stays proportionate, and work requiring ordinary tracking becomes visible before further substantive action. Establish host-specific acceptance for these recorded behaviors, with claims limited to the observed sessions and justified reusable evidence.

**Why now:** These behaviors are already installable: release 0.3.43 included premise verification and one-shot execution, while subsequent releases retained pending native requirements under explicit maintainer exceptions. This story reduces uncertainty about available behavior; it does not unblock a first release. A false planning premise can waste implementation and paid runs, while missed admission hides work from the coordination and dashboard direction. The cases and publication fixtures already exist, giving a bounded way to learn. Current Codex exposure, incident frequency and a deadline are not established; keep the current backlog position for this refinement without claiming that its inherited third-place slot proves urgency or quantified benefit.

**Scope:**

- Accept the three recorded planning cases and the existing
  `publication/admission-investigation`, `publication/one-shot-result`, and
  `publication/one-shot-queued` cases on Codex. Reuse applicable Codex evidence
  only after checking its guidance, fixture, adapter and runtime applicability.
  Claude Code results inform case design, not Codex acceptance.
- Initially evaluate released guidance at `v0.3.45`; pin the actual installed
  revision. Compare planning cases with the pre-premise-change source at
  `2c5ff71^` on the same Codex runtime/model unless matching baseline evidence
  can be recovered. Separate present acceptance from evidence of improvement.
- Retain native escalation acceptance. Claude feasibility informs the case;
  establish replacement feasibility here before the renewed Codex run. Partial
  results are useful, but escalation prevents whole-story completion.
- Reuse existing isolated fixtures, native adapter, supervision and assessment.
  Necessary bounded repairs to those mechanisms belong with their affected
  case. No new acceptance framework or additional behavioral cases are promised.
  A guidance defect is reported for a separate correction decision; this
  acceptance story does not authorize changing the guidance being evaluated.

**Key examples:**

| Precondition and trigger | Required observed result |
| --- | --- |
| Doughnut's historical commit-gate story is planned on Codex | The plan finds `scripts/test/quality_changed.test`, records an observation and uses the existing proof instead of asserting there is no test. |
| Pygardon's historical removal story moves seeding used by an E2E fixture | The plan traces the seeding caller and selects proof that executes it, rather than relying on `strategy_verify.feature` alone. |
| Open Dough's historical folder-reference story has sound premises | The plan records proportionate observations and reaches `ready` without an unjustified probe, approval or additional full-suite run. Plan 111 supplies the comparison, not a required identical plan. |
| An accepted unlisted investigation is requested without selecting one-shot | A published Taken claim precedes the investigation's substantive probe; unrelated human edits survive. |
| An unlisted trivial edit explicitly selects one-shot | The installed guidance is used; origin accepts only the verified result, no planning records or Taken claim, and the clean owned workspace is retired. |
| A queued trivial story with a plan and unfinished sibling explicitly selects one-shot | One accepted commit holds its result and closure; no accepted push lists it Taken, its spent records are removed, and the sibling and human edits survive. |
| A feasible fixture reveals growth after Codex has started one-shot and made edits | Before further edits, Codex admits the work with carry, preserves the edits and continues within the original authority. The inherited fixture may withhold planning authority, in which case the prescribed stop after admission is valid. |

**Genuine constraints:** Paid native sessions are manually selected, bounded
and kept out of default test/CI paths. Prompts supply the task and authority,
not the expected command or verdict. Require actual installed-guidance use,
complete session evidence and independent plan/Git observations; self-report or
exit 0 is insufficient. An early ordinary admission is safe but does not prove
the one-shot escalation transition. Baseline success limits improvement claims;
it does not invalidate a present-behavior acceptance result.

**Excluded and deferred promises:** Other hosts; general agent competence or
statistical reliability; all skill/entry-route coverage; routine discovery,
installation or update revalidation; dashboard changes; queued escalation,
carry conflicts and interrupted-publication races beyond the inherited cases;
guidance redesign; automatic correction, acceptance registries and ongoing
monitoring. Existing deterministic proof can be reused without making these
additional native commitments.

**Completion:** Every included requirement has passing Codex native evidence or
justified Codex reuse for the evaluated revision. A failed or inconclusive case
stays outstanding with its cause and next decision. Completing the six available
cases is useful partial acceptance, not full acceptance while escalation is
pending. Preserve unaffected proof; a changed guidance revision requires an
explicit applicability review before reuse.

**Open questions and handling:**

- What current Codex use or upcoming commitment makes this uncertainty urgent?
  This affects reprioritization and recommendation strength; it does not block
  the bounded acceptance approach or justify inventing exposure figures.
- Does recoverable Codex evidence cover any current requirement or baseline?
  Inspect before a paid launch; absent applicable proof, use a fresh session.
- Does the replacement reveal genuine growth after owned edits? Establish
  inexpensive feasibility, then observe native ordering and uncommitted carry.
  Early admission leaves this example unproved; do not delete its promise.
- Will current Codex sessions remain proportionate on the control and actually
  use the installed guidance? These are evaluation questions answered by the
  cases, not additional acceptance scope.

**Known evidence — 2026-09-28:** The folder-reference control failed on
`v0.3.45`. The candidate plan made hosted CI checks unconditional local gates
([plan 141, slice 2 observation](../slice-plans/141-codex-native-guidance-acceptance/PLAN.md#slice-2-observation-and-execution-stop-2026-09-28)).
Slice planning later gained a rule that hosted CI configuration alone does not
make a check a local gate (`8cafa49d`). Rerun the control on a release that
contains that rule, under separate paid-run authority. Do not retry it on
unchanged guidance. If the rerun still adds unconditional hosted-CI gates,
decide then whether to add a readiness criterion.

**Deferred acceptance — 2026-09-28:** Terry returned this incomplete story
from Taken to third priority in the Backlog list, after the owned-checkout and
installed wrap-up fixes, ahead of further dashboard launch work. The original
execution was landed at `b065a8b9`; its worktree and execution branch were
retired. Release the obsolete Sola-chan execution assignment; this story is
queued for a later, explicitly selected run, not complete or currently executing.

**Original resume conditions — 2026-09-28:** Select and pin a released guidance revision containing
`8cafa49d` before rerunning slice 2. For slice 7, resolve the fixture's early
migration visibility so the nonleading case actually exercises growth after
owned edits and their uncommitted restoration; unchanged early admission is
still inconclusive. Review the remaining plan and readiness before execution.
Retain passes for slices 1 and 3–6 and reuse them only after checking their
applicability to the selected guidance, fixture, adapter and runtime. Preserve
slice 2's failure and slice 7's inconclusive evidence. This queue decision does
not authorize a paid run now or an unchanged retry.

**Authorized continuation — 2026-09-29:** Terry authorized replacing the unsuitable escalation fixture and continuing execution. The repair belongs to this story, retains growth after owned edits and uncommitted carry, and has no unfinished Claude-story dependency. Plan 141 records the bounded proof and evaluated releases.

**Slice plan:** [Codex native guidance acceptance](../slice-plans/141-codex-native-guidance-acceptance/PLAN.md).

<a id="native-acceptance-cursor"></a>

### Accept existing guidance natively on Cursor

**Identity:** SEED-028#native-one-shot-other-hosts
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/140-native-guidance-acceptance-cursor/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c0195a78dab934e0c23d64eebb272a23c003a58aa10b518cdeec26395f529695","plan":"821a2356fd0c7cacce4834a3be55fc2b73c3cd1cb97b1646103a8ee50f8cd9eb"}}
```

**Goal:** Maintainers hold Cursor-native evidence that planners catch the
recorded false premises with a proportionate sound-premise control, and that
agents pass the one-shot cases already accepted on Claude Code, so those
behaviors may be claimed as accepted on Cursor under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) without
treating Claude Code proof as transferable. Unrelated releases may continue;
Cursor-native acceptance for these paths requires this evidence. Escalation
joins only after
[Claude Code feasibility](SEED-028-track-ad-hoc-work.md#story-decomposition) is settled.

**Scope:**

- **Existing cases only.** Run the shared premise-verification cases with
  `--platform cursor` and the shared one-shot cases
  (`publication/one-shot-result`, `publication/one-shot-queued`,
  `publication/admission-investigation`) with
  `tests/git-publication-native.sh --native cursor`. No new fixtures, cases,
  or product guidance.
- **One observed paid run per case per guidance version**, manually triggered
  with Terry's go-ahead. Add none to `npm test`, `scripts/test.sh`, CI, or a
  wrapper whose default calls a real host. Claims cover only the observed runs.
- **Escalation sequenced.** `publication/one-shot-escalation` waits for the
  Claude Code story's pass or exit; on pass, run the same case on Cursor; on
  exit, apply the shared drop. Premise verification and the three already
  accepted one-shot cases proceed independently of escalation.
- **Failed native runs** stop for a human guidance decision; this story does
  not change the guidance.
- **Deferred:** Codex and Claude Code acceptance (sibling stories), new
  harnesses, statistics or repeated runs, and inventing clone sources when
  Doughnut or Pygardon cannot be located.

**Key examples:**

- Disposable Doughnut clone at the pre-plan parent with the refined seed
  restored → Cursor planning-only for that story → written plan names
  `scripts/test/quality_changed.test` with a recorded observation instead of
  claiming the commit-gate script has no test → pass for that case.
- Same setup for Pygardon → plan proves moved seeding with a feature that runs
  the seeding script (for example `live_strategies.feature`), not
  `strategy_verify.feature` alone → pass.
- Open Dough control at plan 111's parent → plan records observations, reaches
  `ready`, and adds no probe slice, new approval, or full-suite run beyond plan
  111 → pass (proportionate control).
- Current guidance revision, no Cursor one-shot evidence →
  `tests/git-publication-native.sh --native cursor --case publication/one-shot-result`
  (and the queued and admission-investigation cases) → harness assessor passes
  → Cursor one-shot acceptance recorded for that revision.
- Claude Code records escalation pass → same case on Cursor passes under the
  shared assessor → Cursor escalation accepted. Claude Code takes the exit →
  escalation case removed from this story with the shared one-shot cases.

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
covers `publication/one-shot-result`, `publication/one-shot-queued`,
`publication/admission-investigation` and `publication/one-shot-escalation`.
The [Codex](#native-acceptance-codex) and [Cursor](#native-acceptance-cursor)
stories retain acceptance of these cases on their own host.
ADR 0005 requires acceptance before ordinary release of affected behavior.
The [release history](../../CHANGELOG.md) records explicit maintainer exceptions
that shipped this behavior with native acceptance still pending; those
exceptions establish neither a pass nor closure of these requirements.

## Priority and regrouping

Keep the existing acceptance slots in the product backlog: Codex uses the
former combined premise-verification slot, and Cursor uses the former combined
one-shot slot. Unrelated entries keep their order. At regrouping, the recorded
identities and their
unrefined, unselected preparation facts carried across; subsequent preparation
updates each selected story's own facts. Regrouping supplied no acceptance
evidence.

## Breadcrumbs

- Maintainer request on 2026-09-28: one existing acceptance story per host;
  preserve scope and approximately preserve priority.
- [Product backlog](../PRODUCT-BACKLOG.md).
