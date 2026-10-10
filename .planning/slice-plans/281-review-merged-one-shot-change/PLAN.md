# Review a story's merged one-shot change

**Identity:** SEED-088#review-merged-one-shot-change
**Source:** [refined story](../../seeds/SEED-088-dashboard-story-code-review.md#review-merged-one-shot-change).

## Goal and boundaries

A developer can select a story's retained one-shot run and review its combined
delivered change after landing and workspace retirement, without searching
trunk's commits. Refinement leaves the story queued; execution can close it,
so both the ordinary story card and Recently done must reach this review.

Include reliable launch-bound capture of the final delivery base and accepted
revision; automatic and later explicit landing; a comparison independent of
today's trunk and of the retired workspace; every retained run, newest first;
the existing file browser, counts, diffs, file moves and side panel; preserving
the live workspace's comparisons and mark; Refresh and restart continuity;
object preservation; honest empty/unavailable states; and reporting-only
recovery without another publication. Default-checkout content joined into the
one-shot result belongs in the delivered comparison.

Use the seed's draft defaults: **Landed one-shot runs**, initially selecting
the newest captured run, with the current workspace comparison still the
opening default when readable. Otherwise show the newest captured run; if no
captured run exists, expose the retained run's evidence gap. A selected landed
run has no Mark reviewed control and never replaces the workspace mark.

Deferred: reconstructing old landings without captured evidence; discovering
other machines' or non-dashboard runs; extending record retention; combining
runs; selecting commits within a run; run-specific marks; arbitrary story
commits interwoven on trunk; ordinary landed Story Branch Mode reviews. No
release, installed-copy update, native-host activation change, new story-state
grammar, or CI observer is included.

Read [selected approach, integration decisions, promise ownership and verification
duties](PREPARATION.md) with the slices below. The [preparation observations and
baseline limits](OBSERVATIONS.md) remain evidence, not execution acceptance.
Accepted execution proof and delivery are retained in [PROOF.md](PROOF.md).

## Execution context

Established execution: `SEED-088#review-merged-one-shot-change`, publisher
`dashboard-territory.local-open-dough`, agent `philip-chan`, Story Branch Mode.
Owned reused worktree and branch:
`/Users/terryyin/git/open-dough/.worktrees/review-a-story-s-merged-one-shot-change`,
`codex/review-a-story-s-merged-one-shot-change`. Integration checkout:
`/Users/terryyin/git/open-dough`; authorized trunk `origin/main`; increments
publish to `origin/refs/heads/codex/review-a-story-s-merged-one-shot-change`.
Starting revision `51281f8fdd7d88e8e397bccd5c7f34f4f040aee8`; accepted claim and
initial published base `1b28c208779ce5c2ebf4b504078f492ac35d54c6`.
No numeric slice budget or exception applies. Existing planning authority is
retained; no `--no-replan` instruction was supplied.

Checkout-bound setup on 2026-10-10: exact Node 24.21.0 at
`/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin`, Bash 5 first;
`env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR PATH="/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH" node scripts/setup-native.mjs npm`,
then `browser` and `check`, passed with Chromium 153.0.8010.12.
The pre-commit hook is check-only (`npm run --silent lint -- --staged`).
CI source is GitHub Actions, verified `ci.yml`, display name `CI`;
the trunk claim has `pendingCi: unobserved` because this execution observes
its story branch. Codex yielded observer: cell `16`, session `6862`, directory
`/tmp/dough-ci-501/watch-lAm58a`, PID `16455`, coordinator `root`; launched
from the execution checkout against the story branch before delivery.

## Ordered slices

### 1. Carry one delivery comparison through publication and resume
Type: Structure
Status: done
Proof: Extend the production publication/resume suites so they consume the
returned pair in a diff, including a multi-commit suffix rebased onto another
writer's commit and a resume after that accepted candidate is an ancestor of
a newer trunk. Assert callback retention identifies the final base before each
push, the accepted pair is unchanged on resume, and no push/CI registration,
ownership, validation or default-checkout behavior regresses. Cover the
default-checkout suffix that includes pre-existing unpublished commits.

Internal change: expose the final suffix base alongside the candidate to the
existing pre-push retention callback and carry the explicitly retained pair
through managed delivery/resume. Align their CLI consumers and guidance with
that contract. Legacy callers without retained comparison context continue
their current resume semantics, but cannot manufacture historical review
evidence; new one-shot handoffs carry it. Do not redefine publication acceptance
or broaden delivery authority. This immediately enables slice 2's durable
launch-bound recording, including interruption between push and response.

Safe stopping point: existing publication remains useful and compatible;
the new comparison handoff is available, with no review promise exposed yet.

### 2. Retain an accepted one-shot landing against its own launch
Type: Behavior
Status: done
Proof: Add `dashboard/tests/one-shot-landing-capture.spec.ts`: real dashboard
one-shot start, installed source delivery/handoff and reporting CLI, real local
bare origin, production receiver and saved launch record. Observe a successful
receipt and exact pair for refinement and execution; verify source/identity,
object types and target containment; reject a failed/unconfirmed push and a
foreign launch or request path. Pin before saving, retire the real worktree,
prune Git and read both ends. Explicit record deletion removes only that
launch's pins and preserves another retained comparison. Check the report
changes no completion, Done, story membership, index or checkout bytes. Run the affected completion,
session-policy and native input grammar consumers.

Behavior: An accepted dashboard one-shot landing has a final comparison → the
workflow records it before retirement using its supplied reporting context →
that particular launch keeps a confirmed fixed comparison independently of
completion and later finish problems, with needed objects retained.

Extend the standalone installed reporting CLI with a landing-record operation
and exact retained retry payload, and the existing receiver/store discipline
with the separate typed fact. Capture repository context server-side from the
established workspace. Use launch-specific comparison refs. Apply the existing
retention filter to offered facts; remove this fact's pins on explicit record
deletion with recoverable ordering, without adding a daemon or history catalog.
Keep old records/scripts readable and explain unavailable capture capabilities.
Update the source one-shot execution/refinement, Dough Land and shared reporting
handoff at their existing behavioral homes. Preserve the final completion
operation and its exact launch context, and the host builders' blank intent and
paragraph grammar. New runtime dependencies, if needed, must be declared and
copied with the standalone CLI; do not edit managed installed copies.

Interim behavior: historical inspection arrives in slice 3; ordinary recording
and retry are available now, while slice 5 proves and completes interrupted
and early-binding paths. Failed capture retains exact input and a visible gap;
it never authorizes another push.

Safe stopping point: a developer receives durable accepted landing evidence
and can recover its reporting input even after the workspace is gone.

### 3. Inspect a captured run after its workspace and branch are retired
Type: Behavior
Status: done
Proof: Add `dashboard/tests/story-review-one-shot.spec.ts`, starting with
capture through slice 2's real CLI rather than writing landing metadata into
the store. Retire worktree/branch, open Review changes, assert heading/pair,
exact changed paths, counts and selected file diff. Exercise rename, binary
and ordinary text through the existing browser and moves. Advance/revert trunk,
restart the dashboard and assert the original comparison remains. Observe
legacy missing capture, missing repository/object and a valid empty comparison;
every unavailable state has no guessed/substitute list. Preserve the review,
file and same-origin refusal checks and compare repository refs/index/status
before and after historical reads.

Behavior: A story has one retained captured run and no readable workspace →
Review changes opens the newest captured run → the existing side panel shows
its delivered change, from saved base to accepted result, without needing the
old workspace or today's trunk as a baseline.

Introduce the historical response/admission at the existing review boundary.
Resolve the saved common repository and admit the chosen launch and pair;
reuse the file-list/count/diff operations and common view. Keep historical
heading, empty state and unavailable reason explicit rather than presenting a
historical result as a live workspace snapshot. Hidden Mark reviewed is a
workspace-only control, including at the request boundary where appropriate.
Keep feature documentation in `dashboard/AGENT-LAUNCH-REVIEW.md` current.

Safe stopping point: the primary landed-refinement example is reviewable.
The newest captured run is initially shown; slice 4 adds the full choice.

### 4. Choose retained runs alongside the live workspace review
Type: Behavior
Status: done
Proof: Add `dashboard/tests/story-review-one-shot-choice.spec.ts`: two captured
one-shot runs, one older uncaptured run and a newer standard launch. By keyboard
choose each run; assert workflow/time/revision/target, exact files/diffs, one
selection and explicit missing-evidence feedback. Switch to the live marked
workspace and back; observe the mark and stored reviewed ref are untouched.
Refresh after another capture keeps the selected run; remove/expire the selected
record and Refresh chooses the newest captured run, or the supported gap state
when none remains. Run the whole affected review/panel suite and action/focus
consumers, preserving the delivered Commits selection, refresh and range reads.

Behavior: Several retained runs coexist with a live workspace → the developer
chooses Landed one-shot runs and a particular run → only that run's fixed
comparison is shown; Refresh retains that run while available, and returning
to workspace review restores its current comparison and mark.

Derive all run choices newest first from one retained-record read, not from
latest-workspace selection or Git subjects. Use one panel selection state;
never let an earlier asynchronous run/file response answer a later choice.
Keep maximize, resize, Hide/Show files, Close/focus return and narrow layout
behavior. Document opening/selection/refresh defaults with the review.

Safe stopping point: every retained refinement or execution run can be chosen
without replacing the live review's meaning or mark.

### 5. Recover landing evidence without repeating accepted work
Type: Behavior
Status: done
Proof: Add `dashboard/tests/one-shot-landing-recovery.spec.ts` using production
receiver, real filesystem fault/acknowledgment-loss seams and the copied CLI.
Lose a push response after reconciliation and use the retained candidate/base
from slice 1; resume confirms the same pair with no push. Interrupt recording
before its record write, lose its acknowledgment, report before native binding,
apply a late binding writer and send a newer completion report. Retry returns
the same landing evidence once, bound only to that launch; no metadata, mark,
message or explicit Done intent is lost. Deleted/mismatched launches refuse
without recreation. Run the entire completion/binding/recovery and record
deletion/retention consumers affected by the saved fact.

Behavior: Remote accepted the run, but its response or landing-record delivery
was interrupted → resume or retry the retained reporting input → the original
launch keeps the exact accepted comparison once, while push count is unchanged
and a newer launch and completion report remain independent.

Use the existing write-ahead and attempt-before-record ordering, preserving
the fact through early native binding and all later record writers. An expired
or deleted record cannot be resurrected by retry. A failed capture remains an
attention gap until acknowledged; report the original accepted publication
separately from that gap. Complete source retry/handoff guidance and its
representative behavior review rather than adding another recovery registry.

Safe stopping point: the review evidence is recoverable through supported
landing/reporting interruptions without duplicate publication.

### 6. Review a completed one-shot execution from Recently done
Type: Behavior
Status: done
Proof: Add `dashboard/tests/recently-done-one-shot-review.spec.ts`: perform an
installed queued one-shot execution, include earlier pending/default-checkout
content, close its backlog/story/plan with the installed workflow, then land
and capture through the real reporting channel. Publish the done record into
the page fixture and retire the workspace. Open its review from Recently done;
assert the same delivered pair/content and no need for the deleted seed.
Also keep the review reachable when accepted publication has an unfinished
attention report and its session is still open. Preserve ordinary done-card
session nesting, progressive reading, identity/title, edge counts and focus
return after Close. Run the affected Recently done surface's suites.

Behavior: A one-shot execution closed the queued story and its result landed →
the developer chooses Review changes on its Recently done card → the same
historical run review opens, including checkout content joined into delivery,
even though the canonical seed/plan and execution workspace are gone.

Give `DoneStoryCard` the configured project context and full retained launch
read for the shared review action. Its existing nested sessions remain filtered
as today; review availability cannot depend on native availability, quiet
completion or the deleted story source. Update the maintained Recently done
and review documentation where those interactions are owned.

Safe stopping point: the full story works for both queued refinements and
completed executions.

## Execution complete

Product advice: keep the existing Story Branch and Trunk review follow-ups and
priorities; no additional product backlog work is justified.
