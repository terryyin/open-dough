# Reliably record quiet dashboard wrap-up after workspace retirement

**Identity:** SEED-163#reliably-report-dashboard-wrap-up
**Source:** [Selected story](../../seeds/SEED-163-dashboard-wrap-up-reporting.md#reliably-report-dashboard-wrap-up)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A successful dashboard-started wrap-up retains its supplied landing evidence and
acknowledges quiet completion so the session settles without unnecessary human
attention. When a reporting duty is incomplete after accepted product work, the
session leaves a specific recoverable explanation that separates accepted product
work from missing dashboard evidence, without treating normal workspace
retirement as product failure.

Carry the launch's existing supplied landing and final-completion duties through
first trunk publication, observation/shutdown, refresh, and workspace retirement
on the shared Dough Land / Story Wrap Up reporting contract. Responsibility
stays with the first-trunk publication handoff (`--landing-context` /
`landingContext`) and the final dashboard completion command after wrap-up or
land settles. Do not add another store, completion-inference owner, or lifecycle.
Instruction-only reminders are rejected as the prevention mechanism.

**Excluded:** manually reconciling the original stale SEED-160 session; a
wording-only change as sole prevention; a native Cursor transcript reader;
automatic reconstruction of a missed historical landing; automatic Done based
solely on a missing directory, deleted branch, native response, or exit; host
exit gates that invent a new completion lifecycle; coupling
`worktree-retirement` so it waits on dashboard completion (report remains after
retirement).

## Existing solution and architectural direction

PFE across landing capture, completion delivery, and final-report admission
found existing owners for each duty. Change those owners; do not invent a
parallel evidence store or session lifecycle.

- **Reuse / change** first-trunk publication
  (`history-preserving-publication.mjs`, `publishExecutionIncrement` /
  execution-increment publication and resume) so a launch that prepared
  `landing-context.json` cannot finish that first trunk publish as a silent
  no-landing success when the agent omits the flag. Keep later trunk
  publications and no-dashboard runs without landing context. Landing capture,
  unacknowledged retry-only, and “never republish to retry” stay as today
  (`dashboard-landing.mjs`, story-branch landing capture fixtures).
- **Reuse** final `dashboard-completion.mjs` / `completionDelivery.ts` for quiet
  `completed` with empty message, attention messages, unfinished reports, and
  reporting-only retry. Automatic Done for tracked execution already requires
  retained landing plus readable published closure (`completionClosure.ts`); an
  execution-complete handoff alone does not close the session. Native reply,
  silence, and process exit already cannot manufacture Done.
- **Change** Cursor/Claude retained final-report admission
  (`finalReportAdmission.ts`) and panel composition (`FinalReport.tsx` /
  `sessionAccess.ts`) so no completion, quiet empty completed, attention
  message, and missing/unknown workspace are independent facts. Claim product
  closure in the panel only by reusing existing tracked-execution closure-gate
  facts (retained landing + readable published closure)—never from directory
  absence. Preserve Codex’s native reader contract; host-specific proof only
  where the retained-reader path changes (Cursor incident host; Claude shares
  the retained reader).

No North Star topic is warranted: this stays on the established launch reporting
and publication boundaries under
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(repository/launch records own durable workflow facts).

### Selected landing prevention approach

When reporting preparation writes `landing-context.json` for an established
workspace, also plant a durable **first-landing expectation** outside the
working tree (git common dir / management context for that repository, keyed so
this launch’s workspace and branch match), naming the absolute prepared context
path. First-trunk publication resolves `landingContext` as today when the
flag/API argument is present; when it is absent and a matching open expectation
exists, it uses that prepared path automatically. After accepted capture (or
equivalent already-accepted recording), clear the expectation so later trunk
publications take none. Explicit `--landing-context` / `landingContext` still
wins. Runs with no prepared expectation stay unchanged and make no dashboard
contact. Do not discover a dashboard origin or reconstruct a missing launch
from the worktree alone.

Completion omission after accepted work already cannot manufacture Done without
a receipt. This story makes that open-session state explainable and keeps
retry-only for attempted-but-unacked delivery; it does not auto-run completion
or add a host exit gate.

## Observed premises

Preparation observed in
`/Users/terryyin/git/open-dough/.worktrees/reliably-record-quiet-dashboard-wrap-up-after-wo`
at revision `6682d1157012cfd9cd8cf766e7f437e4807a6fa5` (plus this preparation’s
uncommitted seed edit).

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Omitting `landingContext` on history-preserving publish succeeds with no `landing` field and nothing to retry | First-trunk landing prevention | Scratch `publishHistoryPreservingCandidate` on `closure-git-fixtures` clean trunk, no `landingContext`; result `classification: "published"`, `hasLanding: false` | True — silent no-landing success |
| Cursor/Claude retained reader treats `completion.message === ""` like missing useful report text (same unavailable copy in current admission) | Final-report evidence distinction | `npm run test:dashboard -- tests/boundary/final-report-admission.spec.ts`: Cursor empty-message fixture expects unavailable “No retained final report…”; source condition `completion === undefined \|\| completion.message === ""` | True — empty quiet completion and “no useful report text” share today’s unavailable path; story still requires distinguishing **no completion record** from quiet empty completed |
| Automatic Done already needs retained landing + readable published closure | Quiet success / incomplete reporting | Read `completionClosure.ts` tracked-execution path | True — reuse; do not replace |
| Guidance places dashboard completion after retirement; retirement scripts do not gate on it | Completion sequencing | Read `dashboard-completion.md`, `worktree-retirement.md`, Story Wrap Up Report | True — do not reverse into retirement-waits-on-completion |
| Quiet success already works when both duties run | Positive path proof | Seed comparisons + existing landing-capture / quiet-completion fixtures | True — extend, do not reinvent |

## Outside-in proof

Key examples map to slices below. Prefer extending:

- `dashboard/tests/boundary/final-report-admission.spec.ts`
- `dashboard/tests/session-workspace-retirement-cursor.spec.ts` (and Claude twin where the shared retained reader changes)
- `dashboard/tests/boundary/story-branch-landing-capture.spec.ts` /
  `dashboard/tests/support/storyBranchIntegration.ts`
- `dashboard/tests/boundary/story-branch-landing-later-publication.spec.ts`
- landing unit / closure cases:
  `src/skills/dough-execute-plan/scripts/dashboard-landing.test.mjs`,
  `src/skills/dough-story-wrap-up/scripts/closure-story-landing-retention-cases.mjs`
- quiet completion / closure helpers already used by completion delivery tests

Local gate: focused dashboard boundary or journey specs named per slice, plus
affected Node publication/landing unit tests. Hosted CI remains the broader
check after publication; do not treat full dashboard suite as every slice’s
local proof.

## Ordered slices

### 1. Distinguish final-report evidence states after retirement
Type: Behavior
Status: done
Proof: Extend `final-report-admission.spec.ts` so no-completion vs quiet empty
`completed` vs nonempty attention message return distinct retained-reader
answers; extend `session-workspace-retirement-cursor.spec.ts` (and Claude twin
if shared wording changes) so missing workspace stays an independent line and,
when `record.landing` plus existing closure readability hold while completion is
absent, the panel states product-closure evidence, unavailable terminal
continuation, and that no final dashboard message was saved—without treating
directory absence as proof of completion or failure.

Accepted proof:
`PATH="/opt/homebrew/bin:$PATH" npm run test:dashboard -- tests/boundary/final-report-admission.spec.ts tests/session-workspace-retirement-cursor.spec.ts tests/session-workspace-retirement-claude.spec.ts --reporter=line`
→ 10 passed. Observations: distinct quiet/absent/attention retained-reader
answers; Cursor panel product-closure + workspaceMissing + unsaved message;
Claude quiet twin with independent workspaceMissing; Codex native path unchanged.

Behavior: Pre-condition → developer opens the final report for a kept
Cursor/Claude session after retirement-shaped workspace absence → Result:
evidence states are not conflated; Mark as done meaning unchanged; Codex native
reader path undisturbed unless a shared string helper is reused without changing
its contract.

Learnings: Opposite early-return polarities for “claimed tracked execution”
belong behind one positively named predicate when splitting closure evidence
from Done closing (`claimedTrackedExecution` in `completionClosure.ts`).

### 2. Plant and clear first-landing expectation outside the working tree
Type: Structure
Status: planned
Proof: Focused unit/boundary coverage that reporting preparation for an
established workspace writes the expectation beside the git common dir (or the
chosen management-context location), keyed to that workspace/branch; clearing
runs after accepted capture; no expectation when landing context is not
prepared; working tree stays free of commit-polluting pointer files.

Internal change: Extend `completionReporting.ts` (and any start/prep caller that
already materializes `landing-context.json`) to plant the expectation; extend
landing capture acceptance path to clear it. Enables slice 3. External launch
instruction may still name `--landing-context`; planting is not an
instruction-only fix.

### 3. First trunk publication retains landing when expectation is open
Type: Behavior
Status: planned
Proof: Story-branch (and one-shot/increment as touched) publish without an
explicit `--landing-context` still retains/records landing when the expectation
from slice 2 is open; later trunk publication after cleared expectation takes no
landing; no-dashboard / no-expectation publish unchanged; unacknowledged landing
still prints reporting-only retry and does not republish. Extend
`story-branch-landing-capture.spec.ts` / later-publication twin and
history-preserving / increment unit coverage.

Behavior: Pre-condition: launch prepared landing context and open expectation →
Trigger: first trunk `integrate` / `publishExecutionIncrement` omits the flag →
Result: landing is retained against the original launch (or unacknowledged with
retry-only if transport fails); accepted Git stays accepted; expectation clears
after accepted capture so a later trunk publish does not capture again.

### 4. Keep incomplete completion reporting recoverable without manufacturing Done
Type: Behavior
Status: planned
Proof: Preserve/extend reporting-only retry fixtures for attempted-but-unacked
completion; panel/admission from slice 1 covers never-attempted completion after
accepted work and retirement; quiet success journey (or focused equivalent)
still reaches Done only with landing + empty completed receipt + existing
closure gates. No new auto-completion or host exit gate.

Behavior: Pre-condition: accepted publication/retirement with incomplete
completion evidence → Trigger: developer reads the session / retries when a
pending file exists → Result: unfinished reporting is identified; retry never
repeats Git or retirement; native final reply still does not set Done; when both
duties succeed, quiet Done still works as today.

## Concern evidence

Slice-plan refinement was not needed: four slices each own one proof loop
(panel distinction; expectation plant/clear structure; first-publish landing
behavior; incomplete-completion recovery), Structure sits immediately before the
Behavior it enables, cumulative design stays on existing publication and
admission owners without a second lifecycle, and completion “prevention” is
explicitly the existing no-receipt→no-Done rule plus truthful recovery rather
than a parallel automation.

Remaining slice-specific concerns: none identified. Interim: after slice 1
alone, landing omission can still succeed until slices 2–3 land; that is an
accepted ordered trade-off, not a remaining concern.

## Story obligations

### G-excl-stale. Manual stale-session reconciliation deferred
Reported: slice 1 — "Manually reconciling the original stale session is a separate recovery task"
Story clause: "Manually reconciling the original stale session is a separate recovery task"
Disposition: excluded "Manually reconciling the original stale session is a separate recovery task"
Commitment: 17

### G-excl-native-reader. No native Cursor transcript reader promised
Reported: slice 1 — "This story does not promise a native Cursor transcript reader"
Story clause: "This story does not promise a native Cursor transcript reader, automatic reconstruction of a missed historical landing, or automatic Done based solely on a missing directory, deleted branch, native response, or exit."
Disposition: excluded "This story does not promise a native Cursor transcript reader, automatic reconstruction of a missed historical landing, or automatic Done based solely on a missing directory, deleted branch, native response, or exit."
Commitment: 19.1

### G-excl-reconstruct-landing. No automatic reconstruction of missed landing
Reported: slice 1 — "automatic reconstruction of a missed historical landing"
Story clause: "This story does not promise a native Cursor transcript reader, automatic reconstruction of a missed historical landing, or automatic Done based solely on a missing directory, deleted branch, native response, or exit."
Disposition: excluded "This story does not promise a native Cursor transcript reader, automatic reconstruction of a missed historical landing, or automatic Done based solely on a missing directory, deleted branch, native response, or exit."
Commitment: 19.2

### G-excl-auto-done. No automatic Done from directory/native/exit alone
Reported: slice 1 — "automatic Done based solely on a missing directory, deleted branch, native response, or exit"
Story clause: "This story does not promise a native Cursor transcript reader, automatic reconstruction of a missed historical landing, or automatic Done based solely on a missing directory, deleted branch, native response, or exit."
Disposition: excluded "This story does not promise a native Cursor transcript reader, automatic reconstruction of a missed historical landing, or automatic Done based solely on a missing directory, deleted branch, native response, or exit."
Commitment: 19.3
