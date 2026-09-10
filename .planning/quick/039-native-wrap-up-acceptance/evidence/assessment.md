# Pre-run assessment for native wrap-up acceptance

Date: 2026-09-10. Assessment lives with this plan's evidence, not in permanent
product docs.

## Candidate

- Worktree: `/private/tmp/open-dough-quick-039-native-wrap-up-acceptance`
- Branch: `worktree-quick-039-native-wrap-up-acceptance`
- Source revision: `de140179fbc1cb69466a77e515e2d6a49324a1ca` (clean)
- Recorded VERSION: `0.3.6` (`deecc7d`). Candidate is not a new release.
- Post-release wrap-up source still in HEAD: `81e9fbb` (seedless corrections
  through wrap-up) and related `fbbb1b2`. `src/skills/dough-story-wrap-up/SKILL.md`
  and `src/skills/dough-product-backlog/SKILL.md` differ from tagged `v0.3.6`.
- Uncommitted source diff at pre-run: none.
- Slice 1 product correction (uncommitted): `src/skills/dough-story-wrap-up/SKILL.md`
  now requires writing a spent-plan-only product fact into maintained
  documentation even when tests exercise related behavior. Hash after correction:
  `93d089e6f4e333c80d2dfacd082c8586fdbe7358995f7c5befde8ab3a47ee53d`.
  Managed installed copies in this worktree were not edited.
- This repository's installed managed copies under `.agents/skills/` and
  `.claude/skills/` differ from current source. ADR 0003: do not edit them.
  Native fixtures must install from this source tree via `install.sh`.

## Prior evidence inspected

- [Quick 027 native integration](../../027-execution-native-acceptance/README.md):
  Codex/Cursor/Claude discovery, host adapters, execute-plan delivery. Shared
  installation/discovery mechanism is unchanged and may be reused. It does
  **not** establish wrap-up closure, preservation, follow-up, or refusal.
- [Wrap-up recognition](../../../../src/skills/dough-story-wrap-up/RECOGNITION.md):
  native wrap-up acceptance unfinished; recover walkthroughs from Git if a
  current native judgment needs them. No wrap-up native run was found in
  current or recovered 027/031/032 evidence.
- Changelog 0.3.6: wrap-up shipped under an explicit native-acceptance
  exception. That exception is historical release context, not passing proof.

## Hosts and bounds

Chosen before first native launch:

| Host | Version command | Observed | Session timeout |
| --- | --- | --- | --- |
| Codex | `codex --version` | `codex-cli 0.144.1` | 3600s + 15s grace |
| Cursor | `cursor agent --version` | `2026.09.08-6caf4ff` | 3600s + 15s grace |
| Claude Code | `claude --version` | `2.1.267` | 3600s + 15s grace |

Native invocation examples: `tests/support/native-codex.sh` plus
`native_run_owned` in `tests/support/native-run-supervise.sh`. Claude wrap-up
needs write/git tools; follow Quick 032 throwaway-fixture
`--dangerously-skip-permissions` rather than the ADR-awareness read-only
`--allowedTools` set. One initial attempt per case; retry once only after an
identified fixture or product correction.

## Requirement / host mapping

| Requirement | Codex | Cursor | Claude |
| --- | --- | --- | --- |
| Native skill use + useful closure | pass slice 1 (attempt 2) | pending slice 2 | pending slice 3 |
| Empty review, durable knowledge, shared-content preservation, history absence, repeat safety | pass slice 1 | reuse permitted; see applicability below | reuse permitted; see applicability below |
| Seedless follow-up, priority, human precedence, no duplicates, provenance, later correction closure | n/a (slice 2) | pending slice 2 | reuse only after slice 2 applicability judgment |
| Unfinished execution/review refusal + existing-story follow-up | reuse only after slice 3 applicability judgment | reuse only after slice 3 applicability judgment | pending slice 3 |
| Recoverable deletion + remaining links | pass slice 1 Codex closure (`f797bd4`) | pending fresh Cursor closure | pending fresh Claude closure |
| Installation/update/coexistence | reuse 027/032; wrap-up skill edit does not invalidate install/update evidence | same | same |

## Slice 1 Codex results

Evidence: [slice-1/](slice-1/). Native skill use: transcript `sed` of
`.agents/skills/dough-story-wrap-up/SKILL.md` with skill body in
`aggregated_output`; `turn.completed`. Empty retrospective (`Status: complete`,
nothing to act on) closed without inventing review artifacts. Shared seed and
DearDough kept Formal titles and DD-002. Spent Trim names history is absent from
the current snapshot and recoverable with
`git show f797bd44f5821dc06db3e687ab18cc13bc2472cd:planning/plans/trim-names.md`.
Repeat hashes matched the closed tree.

Attempt 1 left README unchanged; retry after the skill/fixture correction
assimilated lasting knowledge into README without story/plan identity.

## Applicability of slice 1 shared observations to Cursor and Claude

Empty review, durable knowledge, shared-content preservation, history absence,
and repeat safety may be reused on Cursor and Claude. Wrap-up source and the
product-backlog skill it links are shared; there is no wrap-up host adapter.
This Codex run showed no host-specific wrap-up risk (Codex `sandbox-exec` is
an invocation isolation concern, not wrap-up behavior). Reuse applies only
while those source bytes and adapters stay the same.

Do **not** treat this Codex run as Cursor or Claude native skill-use. Those
hosts still need their slice-owned native journeys for skill-use, useful
closure, and (on each fresh closure) recoverable deletion plus remaining links.
