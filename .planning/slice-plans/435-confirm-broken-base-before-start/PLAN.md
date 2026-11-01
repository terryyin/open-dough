# Confirm a broken base before starting execution

**Identity:** SEED-210#confirm-broken-base-before-start
**Source:** [selected story](../../seeds/SEED-210-confirm-broken-base-before-start.md#confirm-broken-base-before-start).
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

Before a dashboard story execution start runs the installed start script, the
dashboard boundary judges the origin target's CI state: the newest result of
the project's selected check at the target head or, when the head has none,
its nearest ancestor that has one. A pass starts as today. Failed, running, or
unreadable asks first in the dialog; Back starts nothing; Continue names the
judged revision and state and is asked again when the boundary now judges
otherwise. GitHub Actions and command-adapter (Pygardon) projects are both
covered. Excluded (story scope limits): waiting for, retrying, or diagnosing
CI; a board badge; a kept confirmation; a check inside the start script;
refinement starts, Start session, and resumed or kept starts.

## Existing solutions and decisions

PFE:

- **Gate point.** `dashboard/server/launchStart.ts` `unconfirmedStart`, called
  from `launchPreAcceptance.ts` before any attempt, start record, or script,
  already answers Default main's existing changes with a fingerprint the
  request must name (`LAUNCH-EXISTING-CHANGES.md`). The base-CI judgment joins
  that same pre-acceptance answer for `workflow: "execution"` with no kept
  start (`keptStart`), as a second kind of unconfirmed answer. When both apply,
  existing changes are asked first, then the base. Do not add a second
  pre-start path.
- **Confirmation UI.** `dashboard/src/LaunchExistingChanges.tsx` is the
  pattern (replaces the choices, heading takes focus, Back/Escape, continue
  resends with the confirmation). Generalize or mirror it once for the base
  question; the request carries the confirmed `{revision, state}` the way it
  carries `existingChanges` (`src/launchRequest.ts`, `launchChoices.ts`), and
  `sameLaunch`/kept-request stripping treat it as that field is treated.
- **CI selection and reading.** Reuse
  `src/skills/dough-execute-plan/scripts/ci-project-configuration.mjs`
  (`readCiConfiguration(projectFolder)`), `ci-github-actions.mjs`
  (`createGitHubActions().listRuns` for push runs of the selected workflow,
  `readGitHubActions` for the head's commit listing, both through this user's
  shared GitHub request owner and its rate-limit wait), and
  `ci-command-adapter.mjs` (`createCommandAcquisition` →
  `discoverAncestorCandidates` for latest attempts per revision, run with
  `root` = the project folder). The dashboard already imports execute-plan
  source modules (`src/launchRequest.ts` → `session-policy.mjs`).
- **Judgment rule.** One rule for both providers: list the target head's
  history newest first (`repos/<repo>/commits?sha=<target>`, one page), take
  the first commit that has a result of the selected check, and judge its
  newest attempt: `success` → pass; `failure`, `cancelled`, `timed_out` (and
  any other completed non-success) → failed; queued/in progress/pending →
  running; nothing found in that page, a provider or adapter error, a held or
  rate-limited read, or the read's time bound → could not be read, with the
  reason. Bound the judgment by the authenticated read's 30-second wait
  (`readWaitLimitMs`).
- Applicable Accepted decisions: ADR 0008 (observe workflow outcomes without
  owning them; no server database) — the judgment is an observation answered
  per request and kept nowhere. No conflict; no North Star topic needed.
  Product documentation goes in a new "Base CI before an execution start"
  section of `dashboard/LAUNCH-START.md`, linked from
  `LAUNCH-EXISTING-CHANGES.md` as the sibling confirmation.

## Outside-in proof

| Story promise / example | Slice | Observable proof |
| --- | --- | --- |
| Passing nearest result (head has none) starts with no question | 1 | New `dashboard/tests/agent-launch-base-ci.spec.ts` (real installed start, bare origin as `agent-launch-default-checkout-warning.spec.ts` uses, fake GitHub answering the head's commit listing and Actions runs): Start execution proceeds to the session; one later commit has no run. |
| Failed base asks; Back leaves nothing; Continue starts | 1 | Same spec: "Base CI failed" names `main`, the judged short SHA and subject, one later commit without a result, and the run URL; Back restores choices and text, origin `main` unchanged (no Take), no workspace folder or branch, `keptStarts` empty; Continue on failing base starts and publishes the Take. |
| Confirmed X, then fixed (pass) → starts; new failure at Y → asks again | 1 | Same spec: change the fake run answers between the question and Continue. |
| Kept start resumed → no question | 1 | Same spec or an existing recovery spec: a kept start's Start is not asked even with a failing base. |
| Existing execution journeys unchanged | 1 | The shared fake GitHub answers a passing run for the published head by default, so the 35 specs that start execution stay green without edits; run them (full dashboard suite before publishing, per the shared-path rule). |
| Running, and could-not-be-read (no result, rate limit, provider failure) ask truthfully | 2 | `agent-launch-base-ci-running-unread.spec.ts` cases: in-progress run → "still running" with Continue while CI runs; rate-limited Actions answer and an empty run listing → "could not be read" with the reason and Continue without CI result; none shows a pass. |
| Command-adapter project judged the same way | 3 | Spec case with a project whose `.planning/open-dough.json` names a fixture `ciAdapter` script answering `discover`: failing nearest attempt asks; adapter exit failure → could not be read. |
| Real projects | 3 | Real observation through the running dashboard: Pygardon (failing `main` at plan time) — Start execution on a queued story shows "Base CI failed", then Back; origin `main` and `.worktrees` unchanged. Open Dough's pass judgment observed through the boundary module from a scratch script, not by starting. Revisions retained in this plan. |

## Ordered slices

### 1. Ask before starting on a failing base
Type: Behavior
Status: done
Proof: `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-base-ci.spec.ts --reporter=line` → 5/5 pass (pass when head has none; failed/Back/Continue; recheck pass; recheck new failure Y; kept-start resume). Representative Start-execution specs with default passing answer: `agent-launch-base-ci` + `agent-launch-default-checkout-warning` + `agent-launch-start-taken` + `boundary/agent-launch-start` + `boundary/agent-launch-session-kept-start` → 16/16. Full dashboard suite before publishing (coordinator).

Behavior: a dashboard execution start whose GitHub Actions base judgment is a
pass starts as today → a failed judgment answers the question before any
attempt or script, Back starts nothing, Continue with the confirmed revision
and state starts, and a changed judgment asks again or starts on a pass. Lands
the judgment module, the pre-acceptance answer, the dialog question, the
request field, the shared fake's default, and the `LAUNCH-START.md` section.

### 2. Say when the base's CI is running or unreadable
Type: Behavior
Status: done
Proof: `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-base-ci.spec.ts dashboard/tests/agent-launch-base-ci-running-unread.spec.ts --reporter=line` → 8/8 (5 failed/pass/recheck/kept + 3 in-progress/rate-limited/empty). Scratch maps of running→pass and unread→pass each fail the matching new case (reverted).

Behavior: in-progress, rate-limited, failed-read, timed-out, and no-result
judgments each ask with their own truthful wording and continue action; none
starts without confirmation, and nothing waits for CI.

### 3. Judge a command-adapter project's base and observe real projects
Type: Behavior
Status: planned
Proof: adapter spec case (failed attempt asks; adapter failure is unreadable);
real Pygardon observation (question shown, Back, nothing created) and Open
Dough pass judgment, revisions recorded here.

Behavior: a project with `ciAdapter` is judged from its adapter's `discover`
attempts, run in the project folder, with the same rule and question.

## Story obligations

### Q1. Trunk-head planning-only qualification
Reported: slice 1 — "Trunk heads are usually planning-only commits that CI never runs (observed below), so the head's own result alone would almost never exist."
Story clause: "Trunk heads are usually planning-only commits that CI never runs (observed below), so the head's own result alone would almost never exist."
Disposition: no user cost "Do not silently start new work on a broken build": the clause explains why nearest-ancestor judgment is needed; it does not add product behavior.
Commitment: 10

### Q2. Adapter discover assessment qualification
Reported: slice 1 — "so Pygardon's base is judged the same way and no follow-up story is needed"
Story clause: "so Pygardon's base is judged the same way and no follow-up story is needed"
Disposition: no user cost "Do not silently start new work on a broken build": assessment note only; adapter judgment is owned by commitments 11.2, 22, 30, 42.
Commitment: 23

### E1. No waiting, retrying, or diagnosing CI
Reported: slice 1 — "No waiting for, retrying, or diagnosing CI from the dashboard"
Story clause: "No waiting for, retrying, or diagnosing CI from the dashboard"
Disposition: excluded "No waiting for, retrying, or diagnosing CI from the dashboard"
Commitment: 24

### E2. No persistent trunk-CI badge
Reported: slice 1 — "no persistent trunk-CI badge on the board"
Story clause: "no persistent trunk-CI badge on the board"
Disposition: excluded "no persistent trunk-CI badge on the board"
Commitment: 25

### E3. No check in the start script
Reported: slice 1 — "No check in the start script itself, so agent-invoked starts outside the dashboard are unchanged"
Story clause: "No check in the start script itself, so agent-invoked starts outside the dashboard are unchanged"
Disposition: excluded "No check in the start script itself, so agent-invoked starts outside the dashboard are unchanged"
Commitment: 27

### E4. No re-check beyond Continue comparison
Reported: slice 1 — "Trunk moving between the confirmed judgment and the start script's own fetch is not re-checked beyond the boundary's comparison at Continue"
Story clause: "Trunk moving between the confirmed judgment and the start script's own fetch is not re-checked beyond the boundary's comparison at Continue"
Disposition: excluded "Trunk moving between the confirmed judgment and the start script's own fetch is not re-checked beyond the boundary's comparison at Continue"
Commitment: 28

### Q3. Shared session-policy import qualification
Reported: slice 1 — "as the dashboard already imports the shared session policy from source"
Story clause: "as the dashboard already imports the shared session policy from source"
Disposition: no user cost "Do not silently start new work on a broken build": explains reuse precedent; not a separate product promise.
Commitment: 41

## Current decisions

- Gate only new execution starts in pre-acceptance; kept or established starts
  are not asked (their Take is published).
- Existing changes are asked before the base question when both apply.
- History comes from GitHub's commit listing for the target head (one page);
  the dashboard does not fetch or read the project folder's Git history.

## Learnings and preparation review

Execution (slice 1):

- Fake GitHub only routed known `GhRequest` kinds to per-repo answerers; Actions
  was `unknown` → `noConnection`. Parse Actions workflow/runs so the shared
  default reaches the judgment. Boundary servers that own their own fake GitHub
  also need the default (`startDashboardServer` when `ownsGitHub`).
- Confirmation hook renamed to `useLaunchConfirmation` once base-CI joined
  existing-changes as a second unconfirmed answer kind; Actions/history fake
  answers consolidated in `baseCiActions.ts`.
- API `accept`/`launch` helpers resend with confirmed `baseCi` when the boundary
  asks, so hook/boundary launches without a page still continue. Judgment before
  acceptance can delay the first sessions poll: open a second observer only after
  preparing is visible, or the 5s Preparing assert races the 15s poll interval.
- `publishMovingOrigin` / `publishOrigin` must answer Actions and empty-path
  commit listings with a passing head; otherwise another project's
  `github.serve` replaces the suite default and Start hits Base CI unread.
- Judgment and the held start share one accept request, so Start keeps the
  Starting… label; “Checking base CI…” is a submitting status line, not the
  button text (responsive held-start journeys assert Starting…).

Decisive premises, observed 2026-11-01 in this workspace:

- **Trunk heads lack their own result** (consumed by the judgment rule).
  `gh run list -R terryyin/open-dough -b main -w ci.yml`: head `3d189f2` has no
  run. Pygardon adapter `discover`: head `e72b32b0a` has no attempt. Settled.
- **GitHub route reaches the judgment through the reused modules.** Scratch
  script importing `ci-github-actions.mjs` (`createGitHubActions({repo:
  "terryyin/open-dough", workflow: "ci.yml"}).listRuns({branch: "main"})` and
  `readGitHubActions(["api","repos/terryyin/open-dough/commits?sha=main&per_page=30"])`):
  `head 3d189f2 judged 62defee completed success skipped 4`. Settled.
- **Adapter route reaches the judgment through the reused modules.** Scratch
  script with `readCiConfiguration("/Users/terryyin/git/pygardon")`,
  `createCommandAcquisition({command, repo: "terryyin/pygardon", branch:
  "main", root})`, `acquireRuns` then `discoverAncestorCandidates`, and the
  GitHub commit listing: `head e72b32b0a judged 83a41a176 completed failure
  skipped 1`. Settled; attempts without a `branch` are kept
  (`ci-command-attempts.mjs` `targetCommandAttempts`).
- **Gate point precedes every effect.** `launchPreAcceptance.ts` returns
  `unconfirmedStart` before an attempt is admitted or `started` runs the
  script (read in `launchStart.ts` and `launchPreAcceptance.ts`); slice 1's
  Back assertions (no Take, workspace, branch, or kept start) observe it.
- **Existing execution specs would otherwise be asked.** 35 specs click
  "Start execution"; their fake GitHub answers no Actions routes, so without a
  default passing answer each would meet "could not be read". Slice 1 owns that
  default.

Refinement not needed: each slice is one proof loop over one judgment rule,
with provider and state variants extending the same model rather than adding
recognizers. No remaining slice-specific concern identified in this review.
