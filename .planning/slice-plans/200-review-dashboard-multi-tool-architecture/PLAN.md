# Review dashboard architecture before adding more AI IDE tools

**Identity:** SEED-069#review-dashboard-multi-tool-architecture
**Source:** [refined story](../../seeds/SEED-069-review-dashboard-multi-tool-architecture.md#review-dashboard-multi-tool-architecture)
**Authority:** Planning only. No Take, execution, or publication. The refined
story and this plan are kept locally in the preparation workspace, unlanded,
at Terry's direction (2026-10-01).
**Preparation:** Established workspace `/Users/terryyin/git/open-dough/.worktrees/review-dashboard-architecture-before-adding-more`, branch `claude/review-dashboard-architecture-before-adding-more`, remote `origin`, trunk `main`, agent `bas-chan`, published assignment `ce968f8d2957fea3d6eed242d0112955540471c0`, integration checkout `/Users/terryyin/git/open-dough`.

## Goal and scope

Terry receives a decision-ready review of how the delivered Claude Code and
Codex integrations divide shared and host-specific responsibility. The review
ranks the improvements that should precede Cursor support. Terry selects which
of them become queued stories ahead of Cursor.

Included:

- The six concerns the story names: launch and preparation handoff, workspace
  context, conversation identity and persistence, native session observation
  and lifecycle, continuation and terminal interaction, and failure/retry
  recovery. Each covers server and browser code.
- The per-host browser spec families.
- Corrections to `dashboard/AGENT-LAUNCH.md` where it misdescribes the current
  host boundary, and an ADR-impact verdict.
- Adding the selected direction to the North Star topic
  [Agent launch as a requested assignment](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment).
  Its realized statements were already retired during preparation.
- Queued stories for the recommendations Terry selects.

Excluded, as the story defers: implementing any improvement, adding Cursor,
and any native Cursor, Claude, or Codex run (paid observations are manual
only). The review reads code, tests, and maintained documentation. To confirm
a behavior claim, it may run an existing unpaid dashboard spec that uses
substitute host processes.

Also considered and excluded:

- **A standalone architecture document under `docs/`.** Retained design stays
  explained by code. Unbuilt direction goes in the North Star topic.
- **A new ADR.** The host boundary concerns only the dashboard, and ADR 0005
  already governs cross-tool evidence. Slice 3 still reports the verdict.

## Review home

The review lives in this plan's directory as `REVIEW.md`. It is an execution
record that wrap-up deletes once its lasting knowledge has moved elsewhere:
selected improvements become queued stories, selected direction goes into the
North Star topic, documentation corrections go into `dashboard/AGENT-LAUNCH.md`,
and retained design stays explained by code. The review has these sections:

- **Per concern:** an ownership table (shared module, `LaunchHost` operation,
  each host's native implementation), then findings or a retain decision.
- **Per finding:** cited files, a confirmed-or-question label, the
  consequence for adding Cursor, a bounded improvement, and a priority (before
  Cursor or later).
- **Cursor questions:** questions that need native Cursor evidence, addressed
  to the [Cursor story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#use-cursor-from-dashboard).
- **Limitations:** including Codex attachment recovery while
  [SEED-073](https://github.com/terryyin/open-dough/blob/ae22469918f20d03640fe5cd584a89c55eedfc04/.planning/seeds/SEED-073-investigate-codex-terminal-attachment.md#investigation-evidence-2026-10-01)
  was closed without repair; original workspace-removal timing remains unconfirmed.

## Applicable decisions and direction

- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  minimal platform adapters, shared logic tested once with adapter differences
  per tool, and no inference of one tool's success from another's. Findings
  must not claim that Cursor fits a boundary without native evidence.
- [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  §3 and [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md):
  host, session, launch record, and workflow map directly to one domain model.
- Proposed ADR 0008 and the North Star topic inform the review but bind
  nothing. The topic's rule that host-specific code stays in one module per
  host is the main yardstick.
- PFE: the review adds no implementation responsibility. Each recommended
  improvement names the existing module it would reuse or move work into, so
  each queued story starts from that PFE basis.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| The Codex dashboard story is closed, so the review uses a complete Codex integration | Slices 1–2 (scope) | `git log --oneline` shows `fff70ca7 Close completed Codex dashboard workflows and sessions`; `grep '^<a id' .planning/seeds/SEED-052-*.md` has no `use-codex-from-dashboard` anchor | Holds |
| Codex attachment recovery remains a limitation | Slice 2 (limitation) | SEED-073’s preserved investigation demonstrates missing-workspace attachment failure; Terry closed the investigation without repair | Original removal timing unconfirmed; assess recovery as a limitation |
| Native operations already sit behind one host boundary with optional operations | Slices 1–2 (trace) | `dashboard/server/launchHosts.ts` defines `LaunchHost` (`launch`, optional `recover`, `sessions`, `attach`, `rename`, `stop`, `close`) and `launchHost()` dispatch; `dashboard/server/hosts/{claude,codex}/` hold 3 and 9 modules | Holds |
| Shared server and browser code branch on host names | Slices 1–2 (findings) | `grep -rnE '=== "codex"\|=== "claude"' dashboard/server dashboard/src` hits `agentLaunches.ts:144,178`, `agentLaunchAdmission.ts:174`, `sessionCapabilities.ts`, `sessionShown.ts:51,55,118`, `StartLaunch.tsx:191`, `LaunchHostModel.tsx:56`, `agentLaunchClient.ts:52`, `launchRecord.ts:28` | Holds |
| The browser suite has per-host spec families with substitute host processes | Slice 2 (test assessment) | `ls dashboard/tests` shows `agent-launch-codex-*`, `agent-launch-done-codex*`, `agent-terminal-codex*`, and `agent-launch-preparation-codex-*`; `tests/support/codexLaunch.ts` and `codexTerminal.ts` exist | Holds |
| The North Star topic no longer states realized direction | Slice 4 | At Terry's 2026-10-01 direction, preparation replaced "no adapter interface is built ahead of a second host" with the delivered `LaunchHost` boundary and rewrote the closed "Codex remainder" paragraph as rules for later hosts | Done during preparation |
| `dashboard/AGENT-LAUNCH.md` describes the current host boundary accurately | Slice 3 | Its section "Native hosts and durable evidence" says common code does not call another host's private helpers; `grep -rn 'hosts/codex\|hosts/claude' dashboard/server dashboard/src` finds imports only in `claudeHost.ts` and `codexHost.ts`. It does not claim shared code is free of host-name branches | Holds; no change needed during preparation. Slice 3 rechecks against the review's findings |

No premise depends on a paid or state-changing observation.

## Proof ownership

| Promise (story scope or example) | Slice | Observable proof |
| --- | --- | --- |
| Launch-side concerns traced with ownership and native differences (example 1) | 1 | `REVIEW.md` launch-side sections; independent citation check |
| Session-side concerns traced (example 1, continued) | 2 | `REVIEW.md` session-side sections; independent citation check |
| Host-name branches assessed with their Cursor consequence and a bounded improvement (example 2) | 1, 2 | Every grep hit in the premises table has a finding or a stated reason |
| Retain decisions with evidence (example 3) | 1, 2 | At least the terminal transport concern decided either way, with citations |
| Cursor questions kept separate from findings (example 4) | 2 | `REVIEW.md` Cursor-questions section; no finding asserts Cursor behavior |
| Per-host test families assessed | 2 | Test-ownership subsection per concern |
| Ranked recommendations | 2 | Priority-ordered list ending `REVIEW.md` |
| `AGENT-LAUNCH.md` matches the code; ADR verdict | 3 | Each corrected statement cites the code it now matches; verdict recorded in `REVIEW.md` |
| North Star carries the selected direction | 4 | Topic diff: each added statement traces to a selected recommendation; the review link is replaced by that direction |
| Selected recommendations queued ahead of Cursor; declined ones leave nothing (example 5) | 4 | `read-state` on each new story; backlog order shows them before `SEED-052#use-cursor-from-dashboard`; no story for declined items |

## Slices

### 1. Launch-side responsibilities are reviewed
Type: Behavior
Status: done
Proof: The launch-side sections of `REVIEW.md` exist. A fresh subagent that
has not seen the review re-opens every cited file and line, then confirms or
refutes each finding's claim. Refuted claims are corrected before the slice
ends.

Behavior: Given the delivered Claude Code and Codex integrations, the review
traces a refinement launch and an execution launch from dialog request through
admission, preparation handoff, workspace selection, recording, and
failure/retry recovery. Afterwards, `REVIEW.md` holds an ownership table,
findings, and retain decisions for four concerns: launch and preparation
handoff, workspace context, conversation identity and persistence, and
failure/retry recovery. The Codex-only duplicate-launch and creation
reconciliation in `agentLaunches.ts` and the model check in
`agentLaunchAdmission.ts` are each judged: either a native difference that
belongs behind the host boundary, or a shared rule applied to only one host.

### 2. Session-side responsibilities and test ownership are reviewed and ranked
Type: Behavior
Status: done
Proof: Same independent citation check as slice 1 for the new sections. Every
host-name grep hit from the premises table appears in a finding or retain
decision across slices 1–2. The Cursor-questions section contains no claim
presented as a finding.

Behavior: Given slice 1's sections, the review traces observation, attention,
done mark, rename, stop, embedded terminal attachment, and continuation for
both hosts through `sessions`, `attach`, `rename`, and `stop`, and through the
browser presentation (`sessionCapabilities.ts`, `sessionShown.ts`,
`StartLaunch.tsx`, `LaunchHostModel.tsx`, `agentLaunchClient.ts`,
`launchRecord.ts`). Afterwards, `REVIEW.md` covers two more concerns: native
session observation and lifecycle, and continuation and terminal interaction.
It also covers:

- **Test ownership:** for every concern, which specs prove shared behavior once
  and which prove a native difference.
- **Cursor questions:** open questions for the Cursor story.
- **Limitations:** including SEED-073's status, re-read now.
- **Ranking:** one list across all six concerns, ordered by whether each
  improvement should precede Cursor.

### 3. Maintained launch documentation matches the reviewed boundary
Type: Behavior
Status: planned
Proof: The diff of `dashboard/AGENT-LAUNCH.md` shows each changed statement
next to the code it now matches. The ADR verdict is recorded in `REVIEW.md`.
The repository's commit-time lint passes.

Behavior: Given the review's findings about the current code, a reader of
`dashboard/AGENT-LAUNCH.md` finds no statement about the host boundary that
the code contradicts. For example, "common workflow, records, actions and
presentation do not call another host's private helpers" either stays true or
is qualified by naming the shared code that does branch on host. The review
states whether any Accepted or Proposed ADR needs an update. It proposes text
only when a finding changes a decision that general-purpose agents rely on;
otherwise it records "no ADR change" with the reason. This slice changes no
code.

### 4. Terry's selection becomes queued stories and North Star direction
Type: Behavior
Status: planned
Proof: `product-backlog.mjs read-state` shows each new story recorded as
not-refined and unselected. The `## Backlog list` order puts every selected
story before `SEED-052#use-cursor-from-dashboard`. No story exists for a
declined recommendation. The North Star diff adds only direction that traces to
a selected recommendation, and replaces the topic's link to this review.

Behavior: Given the ranked recommendations, execution stops at a checkpoint
and presents them to Terry, recommending which should precede Cursor. Once
Terry selects some recommendations, each becomes a canonical story in a
suitable seed. Each story's Goal names the improvement, and it cites its
`REVIEW.md` evidence through its lasting content, not through a link to the
plan. Each story is added with `product-backlog.mjs add --before
SEED-052#use-cursor-from-dashboard`. The North Star topic gains the selected unbuilt
direction in place of its link to this review. If Terry declines everything,
the link is removed and the backlog is unchanged.

## Execution record

- **Mode and identity:** Story Branch Mode; workspace and branch as in
  Preparation; remote `origin`, target `main`; agent `YeongSheng-chan`;
  published claim `6ac22ba8a6f0a30cbd41b3028fe7eafb2ad96871` on `main`
  (unobserved by CI: a Story Branch claim publishes to trunk before the
  branch observer is armed).
- **Slice 1 proof (accepted):** `REVIEW.md` §§1–4 hold ownership tables,
  findings L1-1–L1-5, W2-1–W2-3, I3-1–I3-3, F4-1–F4-3 and retains
  R1-1–R4-3. A fresh verifier re-opened every cited line at `6ac22ba8` and
  confirmed each item; its partial corrections (R1-2, I3-3, L1-4 and R4-1
  wording, traced-path step 7, F4-2 and R3-1 citations) were applied. All 19
  hits of `grep -rnE '=== "codex"|=== "claude"|!== "codex"|!== "claude"'
  dashboard/server dashboard/src` appear in the review's coverage table.
  Judgments: `agentLaunches.ts:144` and `:178` are shared rules applied to
  one host (F4-1, F4-2); `agentLaunchAdmission.ts:174` is a native
  difference that belongs behind the boundary (L1-2).
- **Merge of `main` (`1cdd476c`):** before slice 2's check, `main` had
  closed SEED-073 without repair (`a13ac883`, which also updated this plan's
  SEED-073 rows) and changed launch-preparation, launch-record, and
  terminal-panel code. The branch merged `origin/main` so the review
  describes current code; no conflicts.
- **Slice 2 proof (accepted):** `REVIEW.md` §5 (S5-1–S5-5, R5-1–R5-5), §6
  (T6-1–T6-4, R6-1–R6-4; R6-1 retains the shared terminal transport), Test
  ownership with TO-1, Cursor questions CQ-1–CQ-8, Limitations, and a
  16-item Ranking (8 before Cursor). A fresh verifier re-opened every
  citation in the whole review at `1cdd476c`; its corrections (line drift,
  T6-1, R6-1, ranking item 1, SEED-073 limitation) were applied. Both greps
  (19 narrow hits; 41 wide hits outside the host modules) are fully mapped.
  Existing unpaid specs `launch-observations`, `session-alerts`,
  `agent-launch-codex-observation-alerts` (11 passed) and
  `agent-terminal-boundary`, `agent-terminal-codex`, `agent-terminal-close`,
  `agent-terminal-codex-close` (39 passed) ran at `47ef4368`.
- **For slice 3:** slice 2 found `dashboard/AGENT-LAUNCH.md` statements at
  `:45-46` (host-name branches in shared code), `:127-128` (alert meaning
  re-read by host name), `:183-184` (done order: rename through the open
  attachment, then detach, then stop — `server/doneMarks.ts:39-53`), and
  `:187-188` (skipping stop on confirmed absence is shared) that misdescribe
  the code; `docs/dashboard-session-troubleshooting.md` now covers the
  missing-workspace case.

## Learnings

- The premises' grep misses default-parameter and schema-default host
  literals (`host = "claude"`, `.default("claude")`), where silent fallback to
  Claude lives. Slice 2's coverage check also uses
  `grep -rnE '"claude"|"codex"'` outside `server/hosts/`, `claudeHost.ts`,
  and `codexHost.ts`.
- The North Star topic's "Sessions are the machine's" bullet was damaged
  during preparation (`d91886ab`): it breaks off at "cards, Recent
  sessions,", and a fragment " registry or assuming every conversation has an
  assignment. Follow Accepted ADRs" is left dangling after the paragraph.
  Slice 4, which owns that topic, repairs it.

## Current decisions

- The review document is a plan-directory execution record, not a maintained
  document (see Review home).
- Slice 4 is a human checkpoint. Execution does not choose which
  recommendations become stories.
