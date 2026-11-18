# Keep own-branch ad hoc session results for review

**Identity:** SEED-379#keep-own-branch-session-results-for-review
**Source:** [Keep own-branch ad hoc session results for review](../../seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md#keep-own-branch-session-results-for-review)
**Source review:** [Source-only review](source-review.md)

## Execution context

Story Branch Mode, publisher `dashboard-territory.local-open-dough`, agent Mana-chan. The Dashboard established the linked execution checkout at `/Users/terryyin/git/open-dough/.worktrees/keep-own-branch-ad-hoc-session-results-for-revie` on `codex/keep-own-branch-ad-hoc-session-results-for-revie`, with the integration checkout at `/Users/terryyin/git/open-dough` and authorized trunk `origin/refs/heads/main`. Starting revision `05766f8dc62826113173e73bce1c0a49ee9f78d7`. The Take and initial execution branch were confirmed at `fc73813d6e678f44100e7a8077f55d461cd31689`.

Codex observer `ci-watch-execution:terryyin/open-dough:codex/keep-own-branch-ad-hoc-session-results-for-revie:mana-seed379`, workflow `ci.yml`, coordinator `mana-seed379`, mailbox `/tmp/dough-ci-501/watch-tZzFvT`, PID `37695`, stream session `37973`, cell `g98:11`.

## Goal and current decisions

From a standalone Recently done entry, a developer can read what the session left on its own branch at Done and what reached remote trunk, including a manual conflict resolution. Terry selected an explicit session handoff for a branch or worktree created after a Default main launch. The same association covers a subsequent Dough landing. A verified delivery becomes available automatically. If verification fails, the developer can still inspect the branch result and see what evidence is missing. Reviewer attestation for a squash and backfilling older sessions are deferred.

Keep each comparison with its launch, keyed to the evidence that produced it. Branch capture owns the session's entry state, committed tip and working-tree result at Done. Landing capture owns the actual remote integration. Retain the committed tip even when the branch result includes uncommitted edits. Comparison selection, refresh, list, diff and file text all use the same saved pair and its literal paths. A historical read has no need to fetch, change refs or reopen a worktree. Linked Done story rows keep their existing destination.

Use the existing Done writer, common Git directory, launch-record pin lifecycle, reporting handoff, landed comparison reader and Comparison switch where applicable. An observed new remote tip can trigger capture. On its own it says nothing about which session delivered which changes. Authorization to record evidence conveys no authority to land a branch. See [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them) and the existing North Star topics on [launch records](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment) and [revision observations](../../NORTH-STAR.md#dashboard-status-delivery).

## Observations used for sizing

Observed in this preparation checkout at `67203bcb9` on 2026-11-18, with Node 24.21.0 and Apple Git 2.50.1. Git experiments used disposable repositories. The named dashboard checks used their project Playwright configs and one worker.

| Consuming operation | Result and design consequence |
| --- | --- |
| Isolated capture and historical file reads (1–2, 5) | In a linked worktree, stage the final files through a temporary index using `read-tree HEAD`, `add --all` and `write-tree`. The real index tree and HEAD stayed unchanged. Pin the two trees using `update-ref`, remove the worktree and branch, expire reflogs and run `gc --prune=now`. Calling the checkout's `changedFrom(base, tree, call)` then listed exactly `new` and `session`; both blobs retained their uncommitted text. Calling `retainedPairFiles` on the same saved repository and pair returned `missing: objects` because its contract expects commits. Allow tree endpoints for a branch snapshot while preserving landing commit validation. |
| Branch entry and imported trunk (3, 5) | With an earlier branch file, a later trunk-only file and a session file, diffing from entry included the trunk file. Diffing from incorporated trunk included the earlier branch file. Using `git merge-tree --write-tree --merge-base=<fork> <entry> <incorporated-trunk>` for the clean baseline and comparing it to the captured tree isolated the session's work. This observation covers clean composition. A conflicted composition needs actual attribution evidence before its files can be claimed. The checkout's `commonGitDirectory` returned the same canonical repository for both linked checkouts and a different one for a foreign repository. Git's worktree list reported paths, refs and tips without session identity. |
| Exact manual delivery (8–9) | Against a real bare origin, `verifyLanding` refused an unpushed local merge, then accepted its parent/merge pair after a push, later trunk advance and worktree removal. Walking the authorized trunk's first-parent history found the merge with the retained branch tip as its other parent. Its first-parent diff showed only the manually resolved file. Verification also accepted the unrelated later parent/commit pair. Remote membership requires a separate session association. A single-parent commit with identical content lost the branch ancestry. Two real fast-forward pushes to identical final history delivered different file sets from different previous target tips. A guessed previous remote tip cannot prove a delivery range. |
| Existing capture, file admission and cleanup (1, 3–4, 6–7) | `npm run test:dashboard:backend -- ad-hoc-review.spec.ts ad-hoc-review-file.spec.ts agent-launch-start-session-landing-admission.spec.ts agent-launch-start-session-landing-boundary.spec.ts kept-commits-release.spec.ts --workers=1` passed 15 cases. They reached retained file/text and rename admission, two records' separate ref cleanup, and the installed landing path. A plain launch had no landing context and its attempted unbound submission received 409. A scratch change comparing the base to itself made the worktree-removal HTTP example fail on the missing `delivered.txt`. After restoration the same example and both blank-launch cases passed. These are baselines. Each slice must establish its new fact through its real writer. |
| Comparison selection and later observation (6, 9) | `npm run test:dashboard:frontend -- recently-done-ad-hoc-review.spec.ts recently-done-ad-hoc-session-runs.spec.ts --workers=1` passed three cases, including choosing a second pair and releasing a delayed response. These browser fixtures supply comparisons. `npm run test:dashboard:backend -- authenticated-read-revision-check.spec.ts authenticated-read-revision-stream.spec.ts agent-launch-start-session-landing-retained.spec.ts --workers=1` passed 12 cases. The HTTP revision boundary reported moved main and the retained launch accepted a landing after startup-attempt expiry. Slice 9 joins a real Git history to that observation and proves the resulting review. |

## Ordered slices

Each slice has a 15-active-minute budget, excluding commands. Each capability uses the same session review entry. Pending capabilities must leave an honest evidence gap until their owning slice can produce the comparison.

### 1. Read the isolated session's committed branch result

Type: Behavior
Status: done

An isolated Wait for review session commits on its recorded branch and is marked done. Its standalone entry opens the changed files and their text against the recorded start. Keep the fixed pair in its common repository. Bind capture to the actual Done, including quiet completion and an exact retry. Preserve existing evidence when reopening, settling a newer Done, or receiving an older continuation. A successful empty capture and a missing checkout have distinct answers.

Proof: start an isolated session against the backend fixture's bare origin, commit, mark Done through the normal boundary, remove the worktree, delete the branch, prune and reopen the review. Assert the pair, exact file and text. Drive delete and retention expiry through the existing record owners and check that only this record's pins go. Hold a capture across another Done or deletion and check for stale files or orphan pins. Show the branch comparison through the existing Recently done action in the frontend proof.

Accepted implementation proof uses the real isolated start, manual and quiet Done, exact retry and file APIs in `dashboard/backend-tests/review/ad-hoc-branch-result.spec.ts`. Its empty and missing cases and the standalone Recently done browser cases in `dashboard/frontend-tests/sessions/recently-done-ad-hoc-branch-result.spec.ts` confirm the result and wording. `dashboard/backend-tests/review/ad-hoc-branch-result-race.spec.ts` holds Git ancestry validation to observe an older Done losing to a newer mark or deletion. The backend proof also checks independent pin release, existing landed/Default main review and the Codex start and installed landing consumers. Frontend proof covers existing landed, empty, and session-run views. Dashboard typecheck passed. Literal commands and terminal records are in this worktree's Git evidence directory under `slice-1-implementation.md`.

Independent refactoring separates Done intent from evidence settlement in `dashboard/server/doneCapture.ts`. The two new backend specs share real launch setup and pin inspection. Separate frontend cases observe the changed-file and empty comparisons. The affected backend and frontend cases, dashboard typecheck, and whitespace checks passed. Commands and retained results are in `slice-1-refactor.md`.

At the acceptance freshness check, trunk included the sibling Default main Done correction `e629e2349`. Its change is bounded to fixing the HEAD passed through the Default main reflog scan in `sessionCommitsCapture.ts`. This slice's new isolated capture takes its own literal tip and retains the existing Default main call to `readSessionCommits`. The sibling's pending-Done tests and production path remain compatible.

### 2. Preserve work left uncommitted at Done

Type: Behavior
Status: done

Capture the working-tree result as part of the same Done, using the established workspace-review treatment of staged, unstaged, deleted and nonignored untracked files. Preserve the real index, HEAD and checkout. Store this result and its committed tip separately so a later delivery cannot inherit an uncommitted edit. A delayed continuation must use the tree captured for its mark.

Proof: leave a committed file with a further edit, a deletion, an untracked file and an ignored file. Mark Done, change the live file again before a delayed read, retire the worktree, then open the retained list and individual diffs. Assert the exact saved text, absence of the later edit and ignored file, and unchanged real index/HEAD at capture. A commit-only endpoint loses the further edit. Reuse slice 1's pin cleanup for tree endpoints.

The real quiet-report journey in `dashboard/backend-tests/review/ad-hoc-branch-worktree-result.spec.ts` holds validation after Git writes the snapshot, then overwrites the live draft. It compares the real index bytes and HEAD at the hold. After the receipt answers with native Done pending, it retires the worktree and prunes Git before reviewing exact paths, diffs, and file text. The saved tree excludes the later edit and ignored file and has its committed tip pinned separately. The existing branch tests cover exact retry, manual supersession, and release of dirty-result pins. The 13-spec backend selection, browser review cases, and dashboard typecheck passed. See `slice-2-implementation.md` in the worktree's Git evidence directory for the commands and terminal records.

The independent pass moved object-kind validation into the shared retained comparison reader and simplified Default main capture settlement. The 11 affected backend specs, dashboard typecheck, and whitespace checks passed. See `slice-2-refactor.md` in the Git evidence directory.

### 3. Identify the branch a Default main session takes up

Type: Behavior
Status: done

At branch entry, the session explicitly identifies its own branch in the original checkout or a linked worktree. Resolve that branch through the project's registered worktrees, validate the canonical repository, and record its entry state on the named launch. Make the declaration available with the session's launch context or its confirmed host/session identity, including when the native session began blank. Preserve blank launch input. The capture must distinguish work already present at handoff from what the session adds.

Proof: start on Default main, create an own branch with earlier work, identify it, edit and mark Done. Read the new file from the session review. Repeat with a linked worktree, leaving another plausible worktree untouched. Exercise repeated handoff, a foreign repository and a second launch. Check the session, pair and paths through the backend. Reopen an older or undeclared launch and observe its existing review. Keep normal Default main commit runs available alongside any new result.

`dashboard/backend-tests/review/ad-hoc-session-branch-handoff.spec.ts` drives the actual emitted command after a Default main launch and the confirmed-session request after blank native input. It checks the fixed dirty entry and prior commit, exact changes after Done, separate worktree associations, refused mismatches, stable retry, missing-association explanation, and ordinary pin release. It also reads the original Default main run against the saved cutoff from handoff after another commit on that branch. The retained held-log case from the accepted sibling `e629e2349` confirms the Default main reader binds HEAD before traversal on the normal path. The 14-spec backend gate and dashboard typecheck passed. The scoped native replacement lifecycle remains owned by slice 4. See `slice-3-implementation.md` in the Git evidence directory.

The independent pass consolidated the optional branch pin writes and test parsing of the emitted declaration command. Ten affected backend specs, dashboard typecheck, and whitespace checks passed. See `slice-3-refactor.md` in the Git evidence directory.

### 4. Preserve branch evidence when a native session is replaced

Type: Behavior
Status: done

A Cursor session identifies its branch, then Recover replaces a native chat that cannot be loaded. The launch keeps the branch association and its pinned entry and any earlier branch result through the replacement. A later Done can still use the fixed entry. Deletion or expiry releases the same evidence under the retained launch, including when the native session ID changed.

Exercise the real Dashboard branch-entry and Cursor cannot-load recovery boundaries with the existing native host fixture. Identify a branch and keep its prior evidence, replace the native session, confirm the same launch's entry in the new record and drive Done and review with the new session ID. Delete that record and inspect its original pin namespace and a separate launch's pins. Use the existing retention owner for the aged-out outcome and protect a branch entry made while binding or rekey waits. Reuse unaffected slice 3 evidence.

`dashboard/backend-tests/review/ad-hoc-branch-cursor-recovery.spec.ts` observes the fixed entry and earlier result on the new native ID, a second Done with exact file text, and both pin release paths. It also passes a native record read before handoff into the real replacement and binding operations and confirms the current branch evidence survives. The eight-spec backend gate, two existing Cursor recovery E2E cases, dashboard typecheck, and whitespace checks passed. See `slice-4-implementation.md` in the Git evidence directory.

The independent pass split explicit deletion and retention expiry into separate tests with common recovery setup. The scoped backend spec, dashboard typecheck, and whitespace checks passed. See `slice-4-refactor.md` in the Git evidence directory.

### 5. Exclude earlier branch work and imported trunk from the same comparison

Type: Behavior
Status: done

The branch carries work that predates session entry, later incorporates a changed trunk and then changes a file itself. Use the recorded entry and the trunk incorporated into this branch to identify the attributable difference. Preserve the session's own changes to a file brought in from trunk. If available evidence cannot separate a change, explain that limit. Never silently list earlier work as a session edit.

Proof: create all three histories in the real repository. Assert the exact list and per-file patch, including the session's edit to an imported line, through review after retirement. Diffing from entry alone must admit the trunk-only file. Diffing from trunk alone must admit the earlier branch file. Include a conflicting baseline where a clean composition cannot be assumed and assert the supported comparison or its explicit evidence gap.

`dashboard/backend-tests/review/ad-hoc-branch-attribution.spec.ts` proves the declared and isolated comparisons after real trunk imports and retirement. The patch starts from the imported line and includes the session's change. Direct file admission refuses the omitted trunk-only path. The existing `restatedPoint` composes the dirty entry tree with the incorporated trunk commit. Target first-parent history excludes a branch delivered as a merge's side parent. Cases that cannot separate competing histories return a gap while keeping the committed tip. The eight-spec backend gate, final attribution cases, existing Taken adapter E2E, and dashboard typecheck passed. See `slice-5-implementation.md` in the Git evidence directory.

The independent pass consolidated real Done and fixture retirement setup. The three affected backend specs, dashboard typecheck, and whitespace checks passed. See `slice-5-refactor.md` in the Git evidence directory.

### 6. Switch between the saved branch result and a captured delivery

Type: Behavior
Status: planned

An isolated session already has a branch result when Dough lands its committed work. A fresh review opens the delivered change and offers the saved branch result. Each choice names what it shows. Refresh retains a still-available selection. Choosing a file resolves only that comparison's pair and literal changed path. Keep a single available result directly readable.

Proof: go through real Done and the established Dough capture, then read both pairs and file text. In the browser show a file with different text in each comparison, switch using the keyboard, release a delayed reply and refresh. Check selected text, counts, accessible names and return focus on Close. Check existing Default main runs, landing-only and linked story rows. A substituted pair or mismatched rename old path must fail admission.

### 7. Review a Dough landing from the session-identified workspace

Type: Behavior
Status: planned

Use the explicit association from slice 3 to establish the session's landing context for that workspace and target. Let the installed publisher retain the accepted pair under the original launch. This also works when Done follows publication and retirement.

Proof: extend the installed-publication journey in `agent-launch-start-session-landing-admission.spec.ts`. Launch on Default main, identify the later worktree, publish once to the fixture origin through the installed command, retire, and review. Check the accepted base/revision and the original session. Retry its recording after retirement. The same submission for an undeclared workspace or another launch retains nothing. Exercise the initially blank-session path when it acquires the handoff.

### 8. Read a manual integration that reached trunk before Done

Type: Behavior
Status: planned

Use the identified branch's committed tip and the authorized target's history to retain a provable manual integration. For a merge into trunk, establish the trunk parent and session side and keep the actual merge tree. For a fast-forward, use an evidenced prior target and accepted result when the exact range and association are established. Keep any available branch result separately.

Proof: merge with an actual conflict, resolve it by hand, and check an unpublished local merge, then a plain Git push and Done. Assert the exact trunk-parent/merge pair and resolution even after a further advance. Exercise a verified fast-forward and the ambiguous previous-tip case. A same-content squash with no association, an unrelated accepted pair, or local-only integration leaves delivery unverified and the captured branch inspectable.

### 9. Discover a verified manual delivery after Done

Type: Behavior
Status: planned

A session left its branch for review and is already Done when a developer integrates it. The initial project read and later revision checks already learn the configured target revision (`performedRead.ts` and `performedRevisionCheck.ts`). Use that observation to trigger capture in the saved common repository, including on the first observation after restart. Historical review serves the retained result. Catch up across later trunk advances without a second Done, explicit reporting by the reviewer, or a live worktree.

Proof: mark Done with uncommitted text, shut down the fixture dashboard, manually merge the committed tip with a distinct resolution, push another change and retire the worktree. Restart, drive the ordinary Board target read and open the session review. Assert both fixed diffs, exclusion of the unrelated advance, persistence on refresh and an offline historical reread. Repeated observations leave one delivery, and record deletion/expiry racing observation cannot recreate it. Update the maintained [review](../../../dashboard/STORY-REVIEW-LANDED-RUNS.md) and [capture](../../../dashboard/AGENT-LAUNCH-COMPLETION.md) contracts for the behavior delivered.

## Verification and plan review

Run changed cases and their reached consumers under the corresponding dashboard frontend/backend or distribution test entry. Extend the real Git + HTTP capture tests for writer promises. Browser service fixtures own presentation observations only. Exercise installation, host-input and recovery consumers if the handoff changes shared installed output. Use the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace), the configured MakeMe and page-object selections, default test timeouts, lint and dashboard typecheck for changed code. Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md) to every check and handoff.

Local gate on awake macOS uses `caffeinate -s -i` on AC power. On battery use the maintained open-lid `caffeinate -i` procedure and sleep-log check. [Machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)

Execution refined the in-progress branch handoff slice at 14.7 active minutes. Its normal launch, Done, and explicit deletion checks passed. The replacement path in `dashboard/server/hosts/cursor/recoveryReplacement.ts` exposed a separate proof loop because a replacement retains the launch and changes the native ID used in the original pin namespace. Slice 4 owns that case and the record lifecycle before attribution and landing build on the same evidence. The selected story, completed proof, and order of subsequent outcomes are preserved. The in-progress split brings the plan to nine slices.

## Story obligations

### G1. Capture the working tree for the same Done

Reported: slice 1 — "Before a first Git read can occur, a reported Done may be acknowledged with a pending capture."
Story clause: "A successful capture includes the session's commits and the working-tree changes it leaves for review."
Disposition: proved by slice 2: ad-hoc-branch-worktree-result.spec.ts holds validation after the tree write, changes the draft and reads the fixed tree after receipt and retirement. ad-hoc-branch-result.spec.ts confirms an exact retry keeps the original pair.

### G2. Exclude imported trunk from the branch comparison

Reported: slice 1 — "The comparison shows the committed branch at Done against its starting revision."
Story clause: "Exclude earlier branch work and changes brought in from trunk."
Disposition: proved by slice 5: ad-hoc-branch-attribution.spec.ts verifies exact file list, patch and text, refused trunk-only path, and explicit conflicting attribution after retirement.

### G3. Keep branch evidence selectable with a verified delivery

Reported: slice 1 — "Landing still takes precedence when a saved landing exists; selection and refresh between two available results belong to slice 5."
Story clause: "show what the branch held at Done and what reached trunk as distinct comparisons when both exist."
Disposition: receiving slice 6

### G4. Release branch evidence after native replacement

Reported: slice 3 — "Its Git entry refs are keyed by its old native ID, but releaseSessionBranchRefs later keys cleanup by the new ID."
Story clause: "The launch record's deletion or expiry releases its evidence."
Disposition: proved by slice 4: ad-hoc-branch-cursor-recovery.spec.ts exercises real Cursor replacement, another Done and exact historical review, deletion and expiry under the old evidence owner, and independent pins.
