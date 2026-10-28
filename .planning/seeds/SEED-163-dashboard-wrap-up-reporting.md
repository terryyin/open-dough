---
id: SEED-163
status: active
planted: 2026-10-28
planted_during: Terry's report of a completed Cursor story left open after its worktree was retired
trigger_when: A successful dashboard-started wrap-up retires its workspace without recording landing and completion
scope: story
---

# SEED-163: Reliable dashboard wrap-up reporting

## Why This Matters

A developer expects a successful story that needs no human attention to wrap up
quietly. Quiet completion still sends the dashboard an explicit success receipt
with an empty message. A native final response, process exit, or missing worktree
does not supply that receipt.

The Cursor execution of **Choose effort when starting a Cursor session** delivered
and closed its story on `main`, passed CI, and retired its worktree and branch.
It omitted both its supplied landing context during integration and the final
dashboard completion command. The dashboard therefore retained an open session
without landing or completion evidence. Opening that session offered a final
report panel containing no report and a missing-workspace explanation. Terry
initially could not tell whether the work had failed, whether normal cleanup
confused the dashboard, or whether an action was required.

## Selected Story

<a id="reliably-report-dashboard-wrap-up"></a>

### Reliably record quiet dashboard wrap-up after workspace retirement

**Identity:** SEED-163#reliably-report-dashboard-wrap-up
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/367-reliably-report-dashboard-wrap-up/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"84802d19ece17280600c5d4cedb8635ba1905a0d039c8d571cb425fafe5782ae","plan":"696a9405e35a25ae1863632e8ccb65978821e390d543f2e8b642b0d2ca3d1121"}}
```

**Beneficiary:** A developer using the dashboard to start and observe story work,
especially when successful wrap-up removes the session's temporary workspace.

**Goal:** A successful dashboard-started wrap-up retains its supplied landing
evidence and acknowledges quiet completion so the session settles without
unnecessary human attention. When a reporting duty is incomplete after accepted
product work, the session leaves a specific recoverable explanation that
separates accepted product work from missing dashboard evidence, without treating
normal workspace retirement as product failure.

**Scope:** Carry the launch's existing supplied landing and final-completion
duties through first trunk publication, observation/shutdown, refresh, and
workspace retirement on the shared Dough Land / Story Wrap Up reporting contract.

Responsibility stays with those existing operations: the first-trunk publication
handoff that already accepts `--landing-context` / `landingContext`, and the
final dashboard completion command after wrap-up or land settles. Do not add
another store, completion-inference owner, or lifecycle. Instruction-only
reminders are rejected as the prevention mechanism: the incident already had
correct launch text and installed guidance and still omitted both duties.

Prevention must make those duties leave observable receipts that a native final
reply, marker, silence, or process exit cannot substitute. Preserve the
distinction among product-story completion, dashboard session disposition, native
activity, and saved-directory availability. Explicit Mark as done keeps its
existing session meaning and neither completes a product story nor fabricates a
landing receipt. Direct invocations without supplied dashboard context still make
no dashboard contact. Preserve the shared Codex, Cursor, and Claude Code
reporting contract; add host-specific proof only where that host's integration
changes.

When dashboard evidence is incomplete, explain known facts without inventing
others: no completion receipt is distinct from a quiet `completed` receipt with
an empty message; missing or unknown workspace is an independent directory fact.
Claim published product closure in the panel only from dashboard-readable
evidence under the existing tracked-execution closure gates (retained landing and
readable published closure). When those facts are absent, do not claim the story
is complete because a directory disappeared. Do not present ordinary retirement
as evidence that the product work failed.

**Key examples:**

- Pre-condition: a dashboard-started tracked execution has surviving landing and
  reporting contexts outside its worktree. Trigger: it publishes final closure
  with the supplied landing context on its first trunk publication, satisfies
  existing completion gates, refreshes when applicable, retires its owned
  worktree and branch, then runs the final completion command with
  `outcome: completed` and no message. Result: landing is retained against the
  original launch; the receipt acknowledges quiet completion; with published
  closure confirmed the dashboard marks the session Done quietly, with no unread
  attention message or alert, and normal retirement needs no human acknowledgment.
- Pre-condition: the same journey has already accepted Git publication or
  retirement. Trigger: landing capture or final completion fails or goes
  unacknowledged. Result: accepted product work stays accepted; the exact
  surviving reporting-only retry input is retained; the unfinished reporting
  operation is identified; retry never repeats publication or retirement; a lost
  acknowledgment recovers the original receipt without duplicate work.
- Pre-condition: a session has a quiet `completed` receipt with an empty message
  and, separately, a session has no completion receipt at all; one or both may
  also show a missing workspace. Trigger: the developer opens the final report.
  Result: empty successful completion is not presented as “no retained final
  report”; absent completion says no final dashboard message was saved; missing
  workspace states only that terminal continuation is unavailable; none of these
  alone invents product success or product failure.
- Pre-condition: tracked-execution closure evidence is readable (retained landing
  and published closure under existing gates) while completion reporting is
  still missing after retirement. Trigger: the developer opens the session’s
  final report. Result: the panel states that product closure evidence is present,
  the temporary workspace is gone so terminal continuation is unavailable, and no
  final dashboard message was saved—without treating directory absence as the
  proof of completion.
- Pre-condition: work still needs attention, or the journey is unfinished.
  Trigger: final reporting runs. Result: the exact useful message is retained;
  unfinished work stays unfinished; a native final reply or process exit does not
  manufacture dashboard success.
- Pre-condition: Dough Land or Story Wrap Up runs with no supplied dashboard
  context. Trigger: closure settles. Result: no dashboard contact is made.

**Constraints:** Reuse the prepared reporting executable and landing context
outside the temporary worktree, existing automatic-Done gates for tracked
execution, and reporting retries that preserve delivery identity. An
execution-complete handoff alone does not close a tracked session. Do not replace
those mechanisms with a new store, completion inference, or lifecycle owner.

**Effort hypothesis:** S–M, medium confidence. Quiet success and truthful
recovery share one outcome; slice planning must decide whether mechanical
prevention of omitted landing and omitted final completion, plus panel
distinction of evidence states, fit one coherent plan or need ordered slices with
owned proof. No planless or execution authority is supplied by this record.

**Depends on:** No known blocking story prerequisite. The queued
[dashboard responsiveness story](SEED-162-long-running-dashboard-responsiveness.md#keep-long-running-dashboard-sessions-responsive)
addresses memory and observation/control responsiveness; sharing session code
does not make it a prerequisite or duplicate this completion outcome.

**Safe stopping point:** Accepted product publication remains accepted throughout
reporting failure and recovery. Any increment must preserve recoverable session
evidence and the existing completion gates. The story is complete only when its
quiet-success and truthful-recovery examples are proved or its scope is explicitly
changed.

**Deferred promises:** Manually reconciling the original stale session is a
separate recovery task. A wording-only change does not complete prevention of the
observed omission. This story does not promise a native Cursor transcript reader,
automatic reconstruction of a missed historical landing, or automatic Done based
solely on a missing directory, deleted branch, native response, or exit.

## Incident Evidence

Evidence was read from this machine's saved launch records, the Cursor transcript,
and Git history on 2026-10-28. The story was already closed at investigation time;
the observed discrepancy is the session's reporting and disposition.

### Identity, delivery, and retirement

- Product story: `SEED-160#choose-cursor-session-effort`, **Choose effort when
  starting a Cursor session**; agent `jacked-chan`, host Cursor, model `auto`.
- Execution session: `d81d9cb8-4785-4882-a568-c21ac48ac1d7`.
- Dashboard launch reference: `5817a830-988c-4175-a840-eb3028a50e6a`;
  origin `http://127.0.0.1:4173`.
- Saved workspace:
  `/Users/terryyin/git/open-dough/.worktrees/choose-effort-when-starting-a-cursor-session`.
- Execution branch: `cursor/choose-effort-when-starting-a-cursor-session`;
  mode `story-branch`, target `origin/main`.
- Plan at startup: `.planning/slice-plans/365-choose-cursor-session-effort/PLAN.md`;
  starting revision `94876e7255e1187c1ca742a7abe74f25cf17c6f1`;
  published Take `a585ac1e22c49da8bf0f9213021c3a6b7e393cfc`.
- Implementation `705fdde48e49c90a076292ec6030692db58589d8`;
  execution-complete record `a305dbae62df9e7812b74f954f14e6ffc989c2e7`;
  final closure `2a32549970eb0fa8af0e6ff47bb478301755e43b`;
  accepted integration `f18004383c6e3ca4b109574bf879cba529a82065`.
- The [published done record](../done/SEED-160_choose-cursor-session-effort.json)
  records completion at `2026-10-28T10:15:30.309Z` (18:15:30 Singapore time).
  Integration was committed at 18:16:33 Singapore time. Closure removed the
  Taken entry, spent seed, and plan. These SHAs retain recovery if the done
  record later expires.

### Supplied instructions and actual ending

The saved confirmed first input contained both the absolute reporting command
and `landing-context.json`, prepared under
`~/.open-dough/dashboard/reporting/5817a830-988c-4175-a840-eb3028a50e6a/`.
It required passing `--landing-context <supplied file>` to the first trunk
publication, then reporting `--outcome completed` with no message file as the
final operation after wrap-up settled, and waiting for its matching receipt.
It explicitly said silence, a marker, or process exit cannot report success.
The executable and its dependency survive worktree removal.

The session's 75-line main transcript shows:

- Line 64: `history-preserving-publication.mjs integrate` was invoked for the
  published closure tip and `refs/heads/main`, with the correct story identity,
  workspace, branch, and remote, but without `--landing-context`.
- Line 66: the session registered integration `f1800438` with the trunk CI
  observer and awaited its completion. Its following message reported green CI.
- Line 70: `worktree-retirement.mjs retire` was invoked for the owned worktree,
  local and remote execution branch, with its story identity and contained
  integration, closure, and implementation SHAs. Subsequent reads showed the
  worktree gone.
- Lines 71–73: the session verified trunk/backlog and refreshed the default
  checkout. It then completed its native todo.
- Line 74: the native final response began “SEED-160 is done and on `main`” and
  summarized the delivered Cursor effort selection, green CI, retired resources,
  and refreshed checkout. Line 75 recorded `turn_ended` with status `success`.
- Neither the main transcript nor its four subagent transcripts contains a
  Shell invocation of `dashboard-completion`, `--outcome`, or `--landing-context`.
  No failed reporting command or retry input was found. This is evidence of
  omitted operations, not evidence that a sent completion was lost in transit.

At observation time, this launch's record had no `completion`, `doneAt`, or
`landing`. Its retained landing authority named the correct repository, workspace,
branch, identity, and target, but `preparations` was empty. Its launch-attempt
record likewise had no completion. The surviving reporting directory contained
`dashboard-completion.mjs`, `ci-direct-entry.mjs`, `dashboard-landing.mjs`, and
`landing-context.json`, confirming that deletion had not removed the supplied
reporting executable. The reason the agent skipped the instructions is unknown.

### Successful comparison

The same story's earlier refinement session
`3077346e-23fa-450c-8405-dc70170e6436`, launch
`c60e0931-2af8-4ec1-84cf-c78eb586cefa`, had retained landing evidence,
`outcome: completed`, `message: ""`, and `doneAt` matching its receipt time
`2026-10-28T08:40:45.023Z`.

The nearby Cursor execution of **Publish source for hosted proof without marking
its slice complete**, session `a31e4462-23f3-4fdf-a710-339817791962`, likewise had
landing evidence, an empty completed report, and Done at
`2026-10-28T09:01:48.228Z`. Thus quiet success is an existing working path; this
incident differed in its missing dashboard operations, not a need for human
attention in the completed product work.

### Screenshot and explanation

The panel was headed by the story title and execution session ID, with
**Mark as done** and **Close**. It displayed all of these statements, followed
by **Retry report**:

> Read-only final report. Reading it does not continue or mark the session done.
>
> Mark as done acknowledges this session; it does not complete the story.
>
> The saved workspace is missing. Terminal continuation is unavailable here.
>
> No retained final report is available. Cursor cannot read a native final report
> here. The saved conversation is unchanged.

`sessionWorkspace.ts` observes directory existence independently of conversation
or Done; it does not examine branch deletion or establish who removed the
directory. `sessionAccess.ts` switches missing/unknown directories to the report
panel. For Cursor, `finalReportAdmission.ts` reads only the dashboard's retained
explicit completion message. It gives the same unavailable explanation for no
completion and for an empty message on a successful completion. The dashboard
does not extract Cursor's native final answer; the native transcript still
existed and was read separately during this investigation.

The panel's missing-directory fact is correct. Its combined wording obscures
normal retirement, missing dashboard reporting, and independently verified story
closure. A possible incident-specific explanation discussed with Terry was:

> This story is complete. Its temporary workspace is no longer present, so
> terminal continuation is unavailable. No final message was saved by the dashboard.

That wording improves comprehension but does not prevent omitted reporting. A
manual Mark as done can acknowledge the session without implementing anything;
it cannot supply the missed launch landing or substitute for a durable repair.

## Breadcrumbs

- [Explicit completion and retained attention messages](../../dashboard/AGENT-LAUNCH-COMPLETION.md),
  including tracked-execution closure gates and the surviving reporting executable.
- [Dashboard completion and landing handoff](../../src/skills/dough-land/references/dashboard-completion.md)
  and [quiet completion attention](../../src/skills/dough-land/references/completion-attention.md).
- [Story wrap-up](../../src/skills/dough-story-wrap-up/SKILL.md) and its
  [Story Branch integration](../../src/skills/dough-story-wrap-up/references/story-branch-integration.md).
- [Reporting instruction](../../dashboard/server/reportingInstruction.ts),
  [reporting preparation](../../dashboard/server/completionReporting.ts),
  [completion delivery](../../dashboard/server/completionDelivery.ts), and
  [automatic closure gate](../../dashboard/server/completionClosure.ts).
- [Workspace observation](../../dashboard/server/sessionWorkspace.ts),
  [session access](../../dashboard/src/sessionAccess.ts),
  [final report reader](../../dashboard/server/finalReportAdmission.ts), and
  [report panel](../../dashboard/src/FinalReport.tsx).
- [Cursor retirement scenarios](../../dashboard/tests/session-workspace-retirement-cursor.spec.ts)
  and [final-report admission scenarios](../../dashboard/tests/boundary/final-report-admission.spec.ts);
  [dashboard test strategy](../../dashboard/tests/README.md) for focused proof.
- Machine-local launch/attempt evidence: `~/.open-dough/dashboard/agent-launches.json`
  and `~/.open-dough/dashboard/launch-attempts.json`, matched by the IDs above.
- Machine-local main transcript:
  `~/.cursor/projects/Users-terryyin-git-open-dough-worktrees-choose-effort-when-starting-a-cursor-session/agent-transcripts/d81d9cb8-4785-4882-a568-c21ac48ac1d7/d81d9cb8-4785-4882-a568-c21ac48ac1d7.jsonl`;
  its four transcripts under `subagents/` were checked for reporting invocations.
  The extracted evidence above remains useful without these machine-local files.
