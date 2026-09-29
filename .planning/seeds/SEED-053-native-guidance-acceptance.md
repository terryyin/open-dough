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

Maintainers need host-specific evidence for the pending premise-verification and one-shot guidance. [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) says evidence from one host does not transfer to another. The remaining Cursor story reuses the cases from [SEED-044](SEED-044-verify-planning-premises.md) and [SEED-028](SEED-028-track-ad-hoc-work.md), with no additional acceptance cases or implementation scope.

## Stories

<a id="native-acceptance-cursor"></a>

### Accept existing guidance natively on Cursor

**Identity:** SEED-028#native-one-shot-other-hosts
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/140-native-guidance-acceptance-cursor/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"466ff22c6aad996d8e3d1938e3e38c7b4ff0093f80fbe763998638de004c2ae8","plan":"a8dc0755c88af8c95f0daa559eea27e91c0dda6bf768855726ad51c5d9a040b5"}}
```

**Goal:** Maintainers hold Cursor-native evidence that planners catch the
recorded false premises with a proportionate sound-premise control, and that
agents pass the one-shot cases already accepted on Claude Code, so those
behaviors may be claimed as accepted on Cursor under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) without
treating Claude Code proof as transferable. Unrelated releases may continue;
Cursor-native acceptance for these paths requires this evidence. Claude Code
already passed `publication/one-shot-escalation` against guidance revision
`23563ee0` on 2026-09-28, recorded in
[SEED-028](SEED-028-track-ad-hoc-work.md#story-decomposition), so Cursor
acceptance includes that case.

**Scope:**

- **Existing cases only.** Run the shared premise-verification cases with
  `--platform cursor` and the shared one-shot cases
  (`publication/one-shot-result`, `publication/one-shot-queued`,
  `publication/admission-investigation`, and `publication/one-shot-escalation`)
  with `tests/git-publication-native.sh --native cursor`. No new fixtures,
  cases, or product guidance.
- **One observed paid run per case per guidance version**, manually triggered
  with Terry's go-ahead. Add none to `npm test`, `scripts/test.sh`, CI, or a
  wrapper whose default calls a real host. Claims cover only the observed runs.
- **Escalation is in scope.** Claude Code passed
  `publication/one-shot-escalation`; the exit was not taken. Run that existing
  case once on Cursor with the same harness.
- **Failed native runs** stop for a human guidance decision; this story does
  not change the guidance.
- **Deferred:** other hosts, new harnesses, statistics or repeated runs, and
  inventing clone sources when Doughnut or Pygardon cannot be located.

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
  (and the queued, admission-investigation, and escalation cases) → harness
  assessor passes → Cursor one-shot acceptance recorded for that revision.
- Claude Code already passed `publication/one-shot-escalation` on `23563ee0` →
  one Cursor run of that case → harness assessor passes → Cursor escalation
  accepted for that guidance revision.

**Cursor one-shot evidence (2026-09-29):** source revision
`a99c67f7823b6c0f219d57748f3d8532d8723354`, Cursor agent
`2026.09.28-64d2043`. Each case passed once under
`tests/git-publication-native.sh --native cursor --results-dir native-results/cursor-one-shot`:

| Case | Assessor | Result path |
| --- | --- | --- |
| `publication/one-shot-result` | pass — only the one-shot result reached remote trunk and its workspace retired | `native-results/cursor-one-shot/cursor/publication/one-shot-result/20260929T035401-179d` |
| `publication/one-shot-queued` | pass — the queued story's result and closure reached remote trunk as one commit and its workspace retired | `native-results/cursor-one-shot/cursor/publication/one-shot-queued/20260929T035727-18d3` |
| `publication/admission-investigation` | pass — accepted investigation was admitted to remote Taken before its first probe | `native-results/cursor-one-shot/cursor/publication/admission-investigation/20260929T035934-4301` |
| `publication/one-shot-escalation` | pass — the grown one-shot attempt was admitted as `SEED-C#notes-directory-rename` and its edits restored uncommitted over the claim | `native-results/cursor-one-shot/cursor/publication/one-shot-escalation/20260929T040252-4fa6` |

## Shared premise-verification cases

These cases belong to the [Cursor](#native-acceptance-cursor) story. The
premise-verification guidance is delivered; this story has no implementation
prerequisite for these cases.
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
| Pygardon seeding proof | **Fail.** Plan `208` moves `gate_baseline_genome` under tests and proves that with pytest. It never names `live_strategies.feature` or `seed_named_genome_live_strategy_pair.py`, so it does not prove the moved seeding with a feature that runs the seeding script. |
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
