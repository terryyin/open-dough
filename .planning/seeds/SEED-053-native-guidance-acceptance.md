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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/139-native-one-shot-escalation-claude-code/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f433b0d83dcf62f586a91723fb32b816fbfca58a34f7393476523d7249b00b73","plan":"c971c1f52709e695742712e0fa35990ae371402954e064ba466b0dc8675b5708"}}
```

**Goal:** Maintainers learn whether a Claude Code agent notices when an
explicitly selected one-shot attempt grows and escalates it instead of landing
larger work untracked, which would hide it from the progress view. Carry,
restore and conflict mechanics already have credential-free tests, so the
native run judges only the agent's recognition and choice
(`publication/one-shot-escalation`). Premise verification and the other
recorded one-shot cases are already accepted on Claude Code.

**Scope:**

- **Feasibility first, with an exit.** Within a bounded attempt, find one
  unlisted `--one-shot` fixture whose growth emerges from the code, not the
  prompt. For example, a request to rename a configuration key turns out to
  need a migration of persisted data, a separate outcome. If no fixture
  exercises escalation without supplying the answer, stop and drop native
  escalation acceptance entirely, including the escalation case the
  [Codex](#native-acceptance-codex) and [Cursor](#native-acceptance-cursor)
  stories wait for; deterministic tests and real use then stand as the
  evidence.
- **One observed run per guidance version**, manually triggered, judged by
  automated checks on origin and workspace state: the admission reached origin
  before any result commit, the attempt's edits are restored uncommitted in the
  claimed workspace, and the agent continued without asking for approval.
- **Observation ends at continuation.** The request grants publication but not
  planning, so after admission and restored edits the guidance's own next step
  is to stop before planning and report the Taken story. The run ends there,
  and escalating without first asking for approval is what "no unnecessary
  approval stop" means. It does not complete the grown story.
- **Deferred:** queued-story escalation, a developer stop, carried edits that
  conflict with the claim, the `--no-replan` bug-fixing variant (all share the
  deterministically tested admission path), Codex and Cursor (their own
  stories), and repeated runs or statistics.

**Key examples:**

- Fixture's one-shot request, agent discovers growth mid-attempt → origin shows
  the admission commit and no result commit, the workspace holds the restored
  edits over the claim, and the agent carried them itself and stopped before
  planning without asking to escalate → pass.
- Agent admits the work before editing anything → inconclusive, not a pass:
  escalation was not exercised; adjust the fixture within the bounded retries.
- Agent lands the grown result as one-shot without admission → fail; the
  escalation guidance needs a fix.
- No non-leading fixture found within the bound → exit: the native escalation
  case is dropped from all three host stories.

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
[Claude Code feasibility](#native-acceptance-claude-code) is settled.

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
