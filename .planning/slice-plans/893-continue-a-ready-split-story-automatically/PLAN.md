# Continue a ready split story automatically after wrap-up

**Identity:** SEED-366#continue-a-ready-split-story-automatically
**Source:** [Story](../../seeds/SEED-366-continue-split-stories-automatically.md#continue-a-ready-split-story-automatically)

## Goal and scope

A closing execution session names, on its final `completed` dashboard
completion report, the one follow-on story a developer has nothing to decide
about: a split remainder or a retrospective follow-up. The dashboard backend
evaluates that once and starts the story's execution through the same launch
acceptance a manual start uses, with the reporting launch's recorded choices,
or holds it and keeps the reason with the completion. A machine setting turns
automatic starts off.

Excluded: telling the developer about a hold (developer messages, their UI
and notification), which is
[the next story](../../seeds/SEED-366-continue-split-stories-automatically.md#tell-the-developer-why-an-automatic-start-was-held);
retrying a hold; naming more than one next story; a per-project setting; any
change to the manual start's base CI confirmation.

## Current decisions

- **Names.** The report field is the *next story* (`nextStory`, flag
  `--next-story <identity>`); the dashboard's answer is an *automatic start*
  with a typed outcome `started | held (reason, detail) | off`. "Continuation"
  already means resuming a launch attempt
  (`dashboard/server/launchAttemptContinuation.ts`) and is not reused.
- **One start path.** The automatic start calls `AgentLaunches.accept`
  (`dashboard/server/agentLaunches.ts`) with a `workflow: "execution"` request
  built from the reporting attempt's recorded request: host, model, effort,
  options and policy, without its `instruction`. It takes that `accept` as a
  typed dependency, as `FeedbackMaintenanceCheck` does. PFE result: reuse;
  nothing in the start, Take or host launch is copied.
- **Eligibility is enforced once.** The start script
  (`execution-source.mjs`) stays the only enforcement of `ready` and
  dependencies. The automatic start reads that refusal from its own attempt's
  outcome and records it as the hold; it derives no eligibility itself.
- **One base CI judgment, two deciders.** `judgeBranchCi` is unchanged. The
  manual start keeps asking on every non-pass; the automatic start holds only
  on `failed`, or on `running` whose `completedAncestor` failed, and proceeds
  on `running` otherwise and on `unread`, supplying the matching `baseCi`
  confirmation itself.
- **Evaluated once per reporting launch.** A retried delivery or a later
  report from the same launch does not start or evaluate again; a delivery
  cannot change its named next story (the same-content rule covers it).
  `--next-story` with `unfinished` is refused by the script and by admission.
- **Queue membership and title** come from the published backlog read
  `completionClosure.ts` already makes (`parseBacklog` at the landing
  repository's fetched target); a story not in **Backlog list** is held.
- **Setting.** One machine file beside `feedback-maintenance.json`, absent
  meaning on, served through `localJsonEndpoints.ts`; its control joins the
  existing machine settings UI.
- **File size.** `dashboard/server/launchStart.ts` (250 lines) and
  `dashboard/server/feedbackMaintenanceCheck.ts` (250) are at the limit.
  Slice 4 moves the base CI start gate (`unconfirmedStart`'s CI half and
  `baseCiFound`) into its own module by responsibility before slice 5 adds to
  it; `feedbackMaintenanceCheck.ts` is not edited.
- **Shipped guidance** is edited only under `Distribution/src/skills/`,
  following
  [author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md)
  with its behavior review. Sessions name a next story once a release
  installs the changed reporting script and guidance in a project; the
  dashboard side is inert until then.
- **North Star.**
  [Make production code directly testable](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support):
  the evaluation is a typed handler taking `accept`, the base CI judgment,
  the backlog read and the setting as typed inputs; specs add MakeMe builder
  steps only, no test-support wrapper.
  [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e):
  new backend specs are plain Vitest; the one journey spec lives in `e2e/`.
- Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written; carry this link into every delegation and repair handoff.
- Local gate per slice: its focused specs through
  `npm run test:dashboard:backend -- <spec>` (or `test:e2e`,
  `test:dashboard:frontend`, `bash scripts/test.sh <path>`), then
  `npm run typecheck:dashboard` and `npm run lint`. Long macOS checks run
  from a fully awake machine on AC power under `caffeinate -s -i`. No full
  suite is a local gate; hosted CI runs them after publication.

## Decisive premises

Observed 2026-11-28 at `fb915f81d` in this workspace (Node 24.21.0, after
`npm ci`).

| Premise / consuming operation | Observation and result |
| --- | --- |
| P1. A backend spec can drive the installed reporting script into production completion admission and delivery (slices 1, 2, 5, 6) | `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:backend -- dashboard/backend-tests/sessions/agent-completion-binding.spec.ts dashboard/backend-tests/launches/feedback-maintenance-due-admission.spec.ts` passed 10 cases in 12 s; the first reports through `reportInstalled` over `Distribution/src/.../dashboard-completion.mjs`, the second drives a backend-initiated `accept` through a typed `launches` parameter. |
| P2. The reporting script and admission reject an unknown field, so `nextStory` must be added to all three: script allowlist, `submissionSchema`, `completionSchema` (slice 1) | Read: `dashboard-completion.mjs:73-99` throws `Malformed reporting arguments.` for a flag outside its allowlist; `completionAdmission.ts:14-27` is a `z.strictObject`; `sameCompletionContent` compares outcome and message only. Not run; slice 1's first failing case observes it. |
| P3. The reporting attempt keeps the launch's choices where completion delivery reads it (slice 2) | Read: `completionDelivery.ts` resolves `reportingAttempt(attempts, report, origin)`; attempts keep the full `request` (`launchAttemptStore.ts`, `src/launchOutcome.ts:138-165`). Unverified remainder: whether `options` and `policy` survive on an attempt bound to a record after restart; slice 2's spec asserts each field and slice 5 owns the "choices not found" hold. |
| P4. A running judgment carries its nearest finished ancestor (slice 5) | Read: `baseCiNearest.ts:188-229` sets `completedAncestor` only when the nearest judged run is `running`. Existing proof: `e2e/launches/agent-launch-base-ci-completed-history.spec.ts` (not run here). |
| P5. The start script's refusal of an ineligible story reaches the attempt's result with its explanation (slice 6) | `npm run --silent test:dashboard:backend -- dashboard/backend-tests/launches/execution-start-result.spec.ts` passed 7 cases; case `:117` words a `source-refused` stop as "The story's published source cannot be started: published preparation is not-ready. Nothing was launched." Read: `launchStart.ts:80-86,197` puts that explanation on the attempt as `{ kind: "failed", reason, explanation }`, and `Distribution/tests/skills/dough-execute-plan/workspace-publication-startup-readiness-cases.mjs` and `-dependencies-cases.mjs` own the script's refusals. |
| P6. The served dashboard can run a report-then-start journey with the fake Claude host (slice 3) | Read: `e2e/launches/feedback-maintenance-launch.spec.ts` runs the real start, launch and installed reporting command with fake Claude and GitHub. Not run here; slice 3 owns the observation. |

## Outside-in proof

| Story promise | Owning slice | Observation |
| --- | --- | --- |
| A `completed` report names one next story; `unfinished` names none | 1 | backend spec through the installed script |
| The named story starts with the reporting launch's host, model, effort, options and policy, once | 2 | backend spec on the typed evaluation |
| The Board shows the story Taken with its new session (example 1) | 3 | e2e journey |
| A failed nearest finished trunk build holds; a running build is tolerated (examples 1, 2) | 5 | backend spec over `judgeBranchCi` results |
| Not queued, already Taken, choices missing, a pre-acceptance question, a refused acceptance, and a start refused for readiness or a dependency hold with a kept reason (example 5) | 6 | backend spec |
| Turned off, nothing starts and nothing is held (example 6) | 7 | backend spec and settings component spec |
| A closing session names a `ready` split remainder or retrospective follow-up and names none with an open decision (examples 3, 4) | 8 | guidance tests and behavior review |

## Ordered slices

### 1. Name the next story on a completion report
Type: Behavior
Status: planned
Proof: a new `dashboard/backend-tests/sessions/agent-completion-next-story.spec.ts`
reports through `reportInstalled` with `--outcome completed --next-story <identity>`
and reads the identity back from the attempt's completion and the bound
record; `--outcome unfinished --next-story …` is refused by the script; a
`--retry` of the retained file delivers the same identity; a second delivery
of the same `delivery` with another identity is refused 409.

Behavior: a session with reporting context reports `completed` naming a story
identity → the receipt is answered as today and the completion keeps the
named next story.

### 2. Start the named story with the reporting launch's choices
Type: Behavior
Status: planned
Proof: `dashboard/backend-tests/launches/automatic-start.spec.ts` gives the
typed evaluation a recording `accept`, a passing base CI judgment and a
published backlog listing the story: a Claude attempt with model, effort,
options and policy reports naming it → `accept` receives one
`workflow: "execution"` request with those choices, the backlog's title and
no instruction; the completion keeps outcome `started`; a retried delivery
and a later report from the same launch call `accept` no further. A report
naming no next story calls nothing.

Behavior: the dashboard accepts a completion naming a queued story → that
story's execution launch is accepted once with the reporting launch's
choices.

### 3. See the continued story Taken on the Board
Type: Behavior
Status: planned
Proof: `e2e/launches/automatic-start.spec.ts`, on the served dashboard with
the fake Claude host and a queued ready repository: a launched execution
reports `completed` naming a second queued ready story through its real
reporting command → the Board shows that story Taken with a new session
launched with the first launch's model and effort (story example 1). Page
objects per [`dashboardPage.ts`](../../../dashboard/test-support/dashboardPage.ts).

Behavior: wires the evaluation into the completion endpoint beside
`launches.accept` (`launchBoundaryAnswer.ts`), after the receipt is answered
so the reporting turn is not held by the start.

### 4. Give the base CI start gate its own module
Type: Structure
Status: planned
Proof: `npm run test:dashboard:backend -- dashboard/backend-tests/launches/agent-launch-boundary.spec.ts`
and `npm run test:e2e -- e2e/launches/agent-launch-base-ci.spec.ts e2e/launches/agent-launch-base-ci-completed-history.spec.ts`
stay green; `launchStart.ts` falls under 250 lines.

Structure: move the base CI half of `unconfirmedStart` and `baseCiFound`
from `launchStart.ts` into a base CI start gate module, behavior unchanged.
Enables slice 5, which adds the automatic start's decision there.

### 5. Hold on a failed finished trunk build and tolerate a running one
Type: Behavior
Status: planned
Proof: `automatic-start.spec.ts` cases over supplied `judgeBranchCi`
results: `failed` → held, reason trunk build failed, detail the revision and
run URL, `accept` not called; `running` with a failed `completedAncestor` →
held on the ancestor; `running` with a passing ancestor, `running` with
none, and `unread` → accepted with the matching `baseCi` confirmation;
`pass` → accepted. `agent-launch-boundary.spec.ts` still shows a manual
request without confirmation answered `base-ci` on `running`.

Behavior: story examples 1 and 2.

### 6. Hold with a kept reason when the story cannot start
Type: Behavior
Status: planned
Proof: `automatic-start.spec.ts` cases: story absent from **Backlog list** or
in **Taken** → held "not queued"; reporting attempt's choices missing → held;
`accept` answering `existing-changes` or a refusal → held with that answer's
words; an accepted attempt whose start is refused for `not-ready` or a
waiting dependency → the completion's outcome becomes held with the start
script's explanation (story example 5). In each, at most one `accept` call
and the outcome is readable from the completion after a server restart.

Behavior: any hold condition in the story's scope → nothing more starts and
the completion keeps `held` with its reason and detail.

### 7. Turn automatic starts off
Type: Behavior
Status: planned
Proof: `automatic-start.spec.ts`: with the setting off a report naming a
queued ready story calls no `accept` and keeps outcome `off`; with no
setting file it starts. A frontend component spec mounts the setting's
control: it reads On by default, and switching it posts Off and shows Off
after a reload of the setting. `npm run test:dashboard:frontend -- <spec>`.

Behavior: story example 6; the control sits with the feedback maintenance
setting and says that sessions' named next stories then wait for a manual
start.

### 8. A closing session names its ready follow-on story
Type: Behavior
Status: planned
Proof: the guidance tests under `Distribution/tests/skills/` for
dough-land, dough-story-wrap-up and dough-execute-plan pass with cases added
for the new rule (`bash scripts/test.sh <path>`), and the
author-open-dough-skills behavior review reads each edited passage for:
names the split remainder (story example 1) and the queued retrospective
follow-up (example 3); names none with an open decision, an `unfinished`
outcome or no reporting context (example 4); names at most the one first in
the backlog.

Behavior: edits under `Distribution/src/skills/`:
`dough-land/references/dashboard-completion.md` (the `--next-story`
argument and when to add it), `dough-land/references/completion-attention.md`
(the judgment; replace "Quiet completion grants no authority to … execute a
follow-up" with the named-next-story path),
`dough-story-wrap-up/references/follow-up-disposition.md` and
`dough-execute-plan/references/execution-decisions.md` (the queued follow-up
and the split remainder are the candidates),
`dough-product-backlog/references/record-preparation.md` and
`dough-product-backlog/SKILL.md` (eligibility alone starts nothing; the
dashboard's automatic start is the one start without a developer's
instruction). Removed prohibitions are deleted, not negated.

## Concerns

Slice-plan refinement: not needed; each slice is one proof loop from the
story's examples and the plan holds eight slices. This review identified no
remaining slice-specific concern: the premises above are settled by the
recorded runs and reads, and P3's remainder is asserted by slice 2 and owned
as a hold by slice 6.
