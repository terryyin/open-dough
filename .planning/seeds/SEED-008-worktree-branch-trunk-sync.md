---
id: SEED-008
status: active
planted: 2026-09-08
planted_during: unknown
trigger_when: when evaluating or designing branch/worktree workflows for trunk-based development
scope: unknown
---

# SEED-008: Execute stories with continuous trunk integration

## Why This Matters

Developers and agents prepare changes in owned workspaces and share validated
increments through the project's remote trunk. The same publication contract
serves worktrees on one machine and clones on different machines. The default
local checkout is optional and may remain the developer's playground. Automated
work derives its shared baseline and publication evidence from the authorized
remote branch; safe local refresh is a separate convenience.

The selected direction is described in
[ADR 0009 — Git branching and integration](../../docs/adrs/0009-git-branching-and-integration.md).
Terry authorized this backlog alignment on 2026-09-21. The ADR retains Proposed
status; this seed records desired outcomes for implementation planning. Terry's
2026-09-28 decision below replaces the proposed default-checkout coordination
outcome without changing ADR status or execution authority.

## Stories

<a id="accept-queued-start-native-behavior"></a>

### Queued-start native acceptance completed

The identity `SEED-008#accept-queued-start-native-behavior` is retired: startup
native acceptance is complete on Codex, Cursor, and Claude Code (Terry's
decision of 2026-09-24 to run the last check outside the executing plan 089).
Ordinary startup, refusal, and Codex/Cursor resume were accepted in plan 82,
recoverable from
`820077c3e7fcf16421c97231eb5bc01bb69ea3dc:.planning/slice-plans/082-accept-queued-start-native/PLAN.md`.
The behavior has been released since 0.3.27, so this is retroactive acceptance.

- **Claude resume: fresh pass (2026-09-24).** Claude Code `2.1.281`, candidate
  `7581b2b`, `publication/startup-resume`. The trace shows only an inspecting
  `--help` before a single startup call returning `resumed` with
  `created: false`, then setup and command, then the first feature edit. The
  fixture origin holds base, exactly one pre-created claim, and the independent
  advance; no claim was pushed again. Human and selected-source bytes were
  preserved and the local refresh was deferred. Run output and the fixture were
  deleted after judging.
- **Candidate reconciliation.** Since accepted candidate
  `02108dfb28cabd05839c3aa16d820ce7d0fc33c7`, `publication-resume.mjs` only
  parameterizes the remote name, the Take guidance only relaxes
  default-checkout refresh declarations, and the startup fixture/assessor split
  setup and command markers more strictly. None invalidates the earlier host
  judgments.

## Publication delivery boundaries

**Parent problem:** Developers executing concurrent work need reliable shared
claims and delivery with less routine agent coordination. Preserve authority,
user work, and truthful remote/CI evidence while reducing total instructions.

**Reviewed decomposition (2026-09-23):** The installed startup operation;
ordinary execution publication plus CI attachment, delivered by plan 083
(recoverable at `463c48a:.planning/slice-plans/083-publish-execution-ci/PLAN.md`);
preparation keep; and closure. The previous separate execution-increment candidate
duplicated the CI story's publication boundary and was absorbed there.
Preparation keep and closure adoption are delivered by the
[Dough Land](../../src/skills/dough-land/SKILL.md) skill. No separate
library, command-framework, or testing-only story is required.

**Alternatives and limits:** Another instruction-only reminder repeats a rule
already installed during the incident. The startup and execution-publication
outcomes remain distinct from the combined Dough Land outcome. Each includes only
the runtime, concise guidance, payload delivery, and proof its outcome needs.

**Effort hypothesis:** No project S/M/L definitions were found. Startup carries
the greatest initial runtime/native-adoption uncertainty. The combined CI/delivery
story adds candidate revalidation and existing-observer attachment, not a new
observer lifecycle. Estimates remain unassigned
pending planning evidence.

<a id="publish-execution-increments-through-shared-operation"></a>

### Execution-increment candidate absorbed into CI delivery

The proposed identity `SEED-008#publish-execution-increments-through-shared-operation`
was never queued. Its outcome was absorbed into the managed execution delivery
of plan 083, avoiding two stories that each wire the same publication boundary.
This is a retired navigation reference, not another candidate.

### Priority rationale and scope reduction

The [product backlog](../PRODUCT-BACKLOG.md) is the sole ordered queue.

- Startup addressed the reproduced claim-visibility failure; its remaining
  native acceptance is complete on all three hosts.
- Managed execution delivery and CI observation shipped in 0.3.33. Terry dropped
  its separate native-acceptance story on 2026-09-24: projects use it
  continuously, deterministic tests cover the mechanism, and a missing or false
  CI signal reported from real use goes through bug fixing. No native
  acceptance is claimed for it.
- Published ownership and execution-branch visibility stay next. They directly
  serve the remote-first dashboard direction and retain higher value than
  migrating every occasional publication caller immediately.
- The first queued story now removes default-checkout dependencies from worktree
  workflows. Terry rejected the local coordination feature on 2026-09-28;
  publication and optional refresh retain shared owners.
- Planning-format validation and existing process follow-ups retain their relative
  order below this cluster. They are not prerequisites for publication.

If reducing investment, retain the first story's complete claim guarantee and
reassess further simplification against actual native use;
no invisible host startup, scheduler, arbitrary-push watcher, or global workflow
registry is selected. No new execution authority or ADR acceptance is implied.

## Existing related stories

<a id="installed-story-branch-integration"></a>

### Complete dashboard sessions quietly and retain messages needing attention

**Identity:** SEED-008#installed-story-branch-integration
**Slice plan:** [Quiet dashboard session completion](../slice-plans/220-quiet-dashboard-session-completion/PLAN.md).
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/220-quiet-dashboard-session-completion/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"257c93f206fcec417e901d50ca022fea08b6bb71e29abd4a0f58d2fd0590d13f","plan":"912c893ef2167bb7a28b45b5e1e4c2d1be546241f6e6cfacbf96226bd71c92c2"}}
```

**Direction (2026-10-02):** Terry repurposed the queued story from installed
Story Branch integration to completion reporting for dashboard-started sessions.
Landing and wrap-up keep their current operational responsibilities. Their
worktree and branch retirement already uses the installed
[retirement script](../../src/skills/dough-land/scripts/worktree-retirement.mjs);
moving that responsibility to the dashboard adds no established value here.
The earlier integration-command candidate came from plan 146's retrospective
(`e02f4dad:.planning/slice-plans/146-installed-wrap-up-command/PLAN.md`). That
candidate is deferred by this decision, not delivered or separately queued.
The recorded identity and anchor remain stable.

**Goal:** Developers can let successful dashboard-started landing and wrap-up
sessions finish without manually marking each session done or reading routine
recaps. When the agent has something requiring attention, the dashboard retains
and displays that message, and the session stays open until the developer marks
it done. Important final words survive workspace retirement and native-session
closure.

**Scope:**

- Apply “no news is good news” to Dough Land and Story Wrap Up on all three
  hosts: successful completion with nothing requiring attention produces no
  recap or summary, with at most a minimal end marker where the host needs one.
  A marker is not an attention message. This also applies to direct invocation.
- When there is a concern, remaining work, reminder, failure, or other material
  qualification, provide enough useful information to understand the issue,
  what finished, and what action remains. Do not suppress an existing truthful
  publication, observation, or retirement limitation to obtain quiet success.
- For a dashboard-started session, an installed operation referenced by the
  owning skill sends explicit completion facts and the optional attention
  message to the dashboard and obtains an acknowledgment. No broadly
  discoverable MCP tool is required. The skill supplies the substantive message;
  a process exit, stop hook, transcript silence, or generic final reply is not
  evidence that the workflow completed successfully.
- Supply explicit dashboard-launch/session context so the operation can identify
  the intended session and reporting channel. Do not infer dashboard ownership
  merely from the worktree path or a running dashboard. Direct invocation keeps
  the existing standalone workflow and needs no dashboard connection.
- Successful completion with no attention message automatically marks the
  matching dashboard **session** done. Successful completion with a message
  retains it on the session's story card and leaves the session open, with its
  existing Mark as done action available. A failure or unfinished workflow
  retains its explanation and stays open; it cannot use the quiet-success path.
- Store the message and accepted completion facts before acknowledging receipt
  or closing the session. Finish substantive final reporting before automatic
  closure can interrupt the native turn. The report remains readable after
  restart and after the worktree has been removed.
- Failed reporting must leave the session open and tell the agent/developer
  that delivery was not acknowledged. Preserve the message for retry; retrying
  the same completion must not duplicate messages or affect another session.
  Delivery failure does not undo accepted Git work or rerun landing/retirement.
- Preserve the existing operational ownership and gates for publication,
  conflict judgment, CI observation, and retirement. This story adds completion
  reporting and session disposition, not dashboard integration or cleanup.

**UI:** No message means automatic session Done after successful completion.
An attention message is readable on the session/story card while the session
remains open. The developer can address it and click Mark as done. Neither
card presentation nor session Done declares the underlying product story
complete; its existing backlog/wrap-up workflow owns that fact.

**Challenge resolved:** Absence of a final message alone cannot authorize Done:
crashes, interruptions, and unfinished work can also be silent. Require an
explicit successful workflow outcome with an optional attention message.
The agent determines material qualifications; the dashboard consumes the
reported facts rather than making merge or product-intent decisions.

**Key examples:**

1. A dashboard-started Land session completes publication and the applicable
   existing cleanup gates, with nothing requiring attention → the skill sends
   successful completion without a message → the dashboard acknowledges and
   marks that session done; no success recap appears.
2. Wrap-up finishes but has a reminder the developer needs to see → send
   completion with the useful reminder → the dashboard retains it on the card
   and the session stays open until the developer clicks Mark as done, even
   though the workflow itself finished.
3. A merge needs unresolved judgment, CI has a material coverage limitation, or
   required retirement is held → provide the exact issue and next action → the
   dashboard retains the message and keeps the session open. A held or failed
   workflow never becomes successful because its process exited.
4. Land or Wrap Up is invoked directly → perform the existing standalone
   operations → stay quiet on success, or report the material issue locally;
   absence of dashboard launch context does not block the skill.
5. The dashboard is unavailable after Git work has been accepted → the agent
   preserves the attention message and reports unacknowledged delivery → no
   automatic Done; after recovery, retry delivery without repeating Git work.
6. Receipt was stored but its acknowledgment was lost → retry for the same
   session/completion → reuse the receipt, with one message and one completion
   effect. A late report for an older session cannot close a different session.
7. An agent stops or crashes without sending successful completion → the
   session remains open. A minimal end marker on its own cannot close it.

**Observed context and communication research (2026-10-02):** The dashboard
already has a shared [host interface](../../dashboard/server/launchHosts.ts),
but only [Codex](../../dashboard/server/codexHost.ts) currently implements
`readResult`; [Cursor](../../dashboard/server/cursorHost.ts) and
[Claude Code](../../dashboard/server/claudeHost.ts) do not. The existing
[Done action](../../dashboard/server/doneMarks.ts) records session-level user
intent and can interrupt a native turn. It does not establish workflow success
or preserve an explicit completion message before shutdown.

Claude Code and Cursor support configured MCP servers
([Claude documentation](https://code.claude.com/docs/en/mcp),
[Cursor documentation](https://cursor.com/docs/mcp)). A skill cannot make a
server available merely by describing it. For this agent-to-dashboard outcome,
a skill-referenced installed script can instead submit structured facts and
receive a receipt; tool discovery is not wanted. This is a visibility/invocation
choice, not filesystem access control. Transport spelling remains an
implementation choice.

[Claude Stop hooks](https://code.claude.com/docs/en/hooks#stop) and
[Cursor response/stop hooks](https://cursor.com/docs/hooks) can expose final
response text and lifecycle facts, but a turn ending is not successful workflow
closure. Research also found Cursor native
[ACP](https://cursor.com/docs/cli/acp), both vendors' SDK/session interfaces,
and Claude preview channels; replacing launch/attachment or pushing into a
running agent is unnecessary for the selected outcome. An unpaid Cursor ACP
initialization-only probe (`2026.10.01-e373342`) returned protocol 1 and
session-loading capability; installed Claude was `2.1.287`. No model prompt or
native behavioral acceptance journey was run, and the probe does not prove
compatibility with current dashboard sessions.

**Rejection constraints:** Honor existing authorized remote targets,
[history-preserving publication](../../src/skills/dough-execute-plan/references/publish-the-candidate.md#preserve-published-history),
[backlog reconciliation](../../src/skills/dough-product-backlog/references/merge-conflicts.md),
and [retirement ownership/containment gates](../../src/skills/dough-land/SKILL.md#retire-the-worktree).
A notification supplies no additional repair, merge, cleanup, or stop authority
for unfinished work. Useful warnings and failures remain visible. Unlisted
valid cases are not rejected merely for lacking an example.

**Deferred promises:** The original installed integration/observer-coordination
command, dashboard retirement ownership, generic agent messaging, transport
replacement, general automatic session completion for other skills, and
installer/Git-helper redesign are not delivery commitments. Dashboard-owned CI
monitoring and messages into agents remain in
[their existing story](SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring).
No separate ADR 0007/ADR 0002 lifecycle decision is made here.

**Delivery and acceptance:** Keep one shared skill behavior and only necessary
host adaptation under [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
Required installed dependencies must remain self-contained and follow
[ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
[ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md);
installer declaration relocation is not a prerequisite. Functional proof must
cover completion, attention-message retention, retry, and safe session closure.
Native launch context, skill reporting, and final-message/closure ordering on
Codex, Cursor, and Claude Code need proof under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md). Missing native
requirements belong in linked acceptance work before release; research and
file presence alone establish no native acceptance. Refinement authorizes no
implementation or native test journey.

<a id="reduce-ci-observer-overhead"></a>

### Reduce CI observer overhead across execution and wrap-up

The retired identity `SEED-008#reduce-ci-observer-overhead` is not queued or
reallocated. Its remaining outcomes are the delivered
[completion operation](../../src/skills/dough-execute-plan/references/ci-monitor.md#await-the-applicable-revision-at-completion)
and the managed execution delivery of plan 083, released in 0.3.33.

Terry's 2026-09-22 Pygardon report described repeated observer setup and handle
transcription, early provisional coverage notifications, and a separate closure
observer cycle. No raw transcript established the repeated-setup cause. The
full investigation is retained in Git at `1352844` and linked findings
[ODF-069](../../docs/maintainer/finding-names.md#odf-069).
Later source review corrected the claimed production readiness command: it was
a test substitute. Current story scope replaces the earlier idle-expiry
and ref-watching proposals; do not implement those historical mechanisms.

## Architectural Context

[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports continuous integration and resolving conflicts through shared intent.
[ADR 0005 — Cross-tool validation](../../docs/adrs/0005-cross-tool-validation-accepted.md)
governs behavior and native acceptance evidence.
[ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires shared behavior written for the executing project, with necessary host
adaptation. Follow the [maintainer guideline](../../AGENTS.md) when authoring.

[ADR 0007 — Software development lifecycles](../../docs/adrs/0007-software-development-lifecycles.md)
owns lifecycle discussion;
[ADR 0009 — Git branching and integration](../../docs/adrs/0009-git-branching-and-integration.md)
owns the proposed Git contract. Both retain Proposed status. ADR 0007 records
the unresolved relationship between Story Branch Mode's delayed integration and
Accepted ADR 0002; human resolution of that question remains separate from this
Git migration.
