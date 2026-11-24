---
id: SEED-432
status: active
planted: 2026-11-24
planted_during: Execution split of SEED-426
trigger_when: selected from the product backlog
scope: one story
---

# SEED-432 — Finish story-linked ad hoc sessions in the Dashboard

<a id="finish-story-linked-ad-hoc-sessions"></a>

### Finish story-linked ad hoc sessions in the Dashboard

**Identity:** SEED-432#finish-story-linked-ad-hoc-sessions
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-432#finish-story-linked-ad-hoc-sessions","dependencies":[{"supplier":{"identity":"SEED-426#start-ad-hoc-work-under-a-story","href":"seeds/SEED-426-start-ad-hoc-work-under-a-story.md#start-ad-hoc-work-under-a-story"},"implementation":"Use the installed owned draft and stopped-claim recovery through the Dashboard launch boundary.","rationale":"The mapped Dashboard launch routes call the installed operation and need its authoritative behavior available on the shared integration base.","condition":"The installed owned-draft admission and retained-candidate retry are integrated on trunk with their bare-remote proof.","state":"satisfied","resolution":{"revision":"f5396f92c15036b7f1e4af81a824692414792ebd","path":".planning/seeds/SEED-426-start-ad-hoc-work-under-a-story.md#start-ad-hoc-work-under-a-story","summary":"Installed draft admission and retained-candidate retry are integrated. The first-seed and lost-response cases prove one canonical story and Taken assignment on a bare remote. The retry cases prove the losing candidate is retained, a clean same-worktree retry succeeds, and unrelated edits remain safe. Ordinary completion is covered. Fourteen focused installed cases and branch CI run 45373952427 passed.\nCondition satisfied: The installed owned-draft admission and retained-candidate retry are integrated on trunk with their bare-remote proof.\nAccepted integration: 96feeac0c68d517fc1e4432c5b750550bce92cb2 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/813-finish-story-linked-ad-hoc-sessions/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"899d36e21db629dcb54b2b27d91909519db19613726d24adf258a9dd504beae2","plan":"2a5df5d48f13ea48efaf7131ca6117c14e19b0110e6a4f51a162193321321dfb"}}
```

**Goal.** A developer who starts ad hoc work from the Dashboard can return
to the same story on the Board, in Recently done, and in Intent. The
published story and any session comparison remain available after the
session's checkout retires and from another clone.

**Developer decision.** Admit new independent ad hoc work as an ordinary
story directly into **Taken**, using the same product backlog admission as
accepted contextual work. A follow-up uses the source story and gets its own
session ID. The project repository owns membership and published comparisons.
The Dashboard keeps the local launch and recovery evidence. [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
defines those responsibilities.

**Scope.**

- A new independent start publishes one canonical story and its Taken
  assignment before opening a native session. Include isolated and default
  checkouts, blank and attachment-only starts, and scheduled feedback.
  Preserve native access and writer checks, the chosen checkout and landing
  policy, and the original first input. Refused admission opens no native
  session. Continue after interruption or a lost reply uses the same attempt
  and admits or recovers the same story.
- Follow up from a Taken or Done story, including through one of its sessions.
  Resolve the source against published membership and preserve its status.
  Refuse a new follow-up whose source cannot be resolved. Continue an already
  admitted follow-up from its retained binding.
- Land checks the bound story and declared Git authority before push. Each
  published session keeps its own accepted comparison and supports reporting
  recovery without another push. Ordinary completion and review use the
  story's membership and published session records. An admitted story with no
  changes can still complete.
- Retire standalone session startup, completion and review across Distribution
  and the Dashboard, including their persisted shapes, branching, tests and
  guidance. Remove the remaining legacy standalone frontend cases and keep
  applicable story-linked selection, review and warning coverage.
  [Runner retirement](SEED-413-renovate-dashboard-unit-tests.md#retire-legacy-dashboard-frontend-runner)
  waits for that removal. Record comparable source and executable case counts
  to show that both production surfaces and their combined proof footprint
  shrink.
- Session selection within Intent, follow-up context composition, open
  follow-up card cues and Review repository adoption have their own stories.
  This story preserves those readers' published comparison contract.

**UI.** **Start session** shows admission in progress. A refusal explains the
reason and offers retry for that attempt. Use the existing instruction label
as the initial story title. With no usable label, use “Ad hoc work” with the
launch date and time, fixed on the first attempt. A blank start opens the
terminal awaiting the developer's first input after admission, subject to the
selected host's native input requirements. The new Session entry appears on
the ordinary Story card.

**Cutover.** Switch production startup, completion and review together.
Preserve open sessions with verified story membership and their original
identifiers. Convert closed records when published evidence corroborates
their story and archive the rest with their linked attempt and reporting
evidence. A former standalone row, title or shared workspace cannot establish
membership. Recheck open records and unresolved starts against native
bindings, workspace ownership and published membership. A verified unbound
start can continue with its original attempt and checkout. Preserve uncertain
evidence and hold the switch while an open record has no safe disposition.
Verify the complete migrated store with the delivered Dashboard reader before
resuming writes. Keep the original store recoverable and retire migration-only
code after acceptance.

**Key examples.**

- A developer submits an instruction or opens a blank terminal in a supported
  host. The remote receives one story and Taken assignment without changing
  queue order. On the Board, the story carries the new Session entry. When
  the admission reply is lost, Continue reuses that identity and opens one
  native session.
- A developer follows up from a Taken or Done story or its session. The new
  session has its own ID and the source keeps its status. Land verifies the
  declared branch, records the accepted pair, and reports the same pair after
  retry. Mismatched authority stops before push.
- A developer completes admitted work, retires its owned checkout, and opens
  the project in a fresh clone with empty launch storage. Recently done opens
  the same story and Intent shows the published session's recorded endpoints
  even after trunk advances.
- When production data includes an open linked session, a verified unbound
  interrupted start and a closed unassociated record, the candidate reader
  still opens the first session with its original ID and retains Continue for
  the second. The third remains recoverable in the archive.

**Preparation.** [Plan 813](../slice-plans/813-finish-story-linked-ad-hoc-sessions/PLAN.md)
holds the launch evidence from SEED-426, the v0.3.113 Land regression, and the
store and test baselines needed for the cutover. The developer withdrew
SEED-420's separate identity, association and review model. Its
[preparation](https://github.com/terryyin/open-dough/commit/985168b9c1bf32c84c45814a83393bc9d17a1c2b)
and [integrated implementation](https://github.com/terryyin/open-dough/commit/eef6f7234dffe03e7a3fa33e41805533b0dfdacc)
remain recoverable in Git.
