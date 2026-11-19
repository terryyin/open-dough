# Default dashboard backend checks to the mounted boundary

**Identity:** SEED-408#default-dashboard-backend-checks-to-the-mounted-boundary
**Source:** [Default dashboard backend checks to the mounted boundary](../../seeds/SEED-408-default-dashboard-backend-checks-to-the-mounted-boundary.md#default-dashboard-backend-checks-to-the-mounted-boundary)

## Goal and scope

Use the existing opt-in mount from SEED-403 for ordinary Dashboard Backend Test
boundary starts. Keep named live cases and other test groups' existing entries.
Refinement on 2026-11-19 replaced the inherited 800-start floor. Acceptance is
the seed's list: unchanged assertions, every reasonless boundary start mounted,
matched start and first-close time below a quarter of live, and a lower CI
median. Full frontend and E2E runs mount nothing, and the entry rule is
updated. The mounted count is evidence only.

Exclusions follow the seed's scope limits. This plan moves no browser case,
changes no dev or preview start, relocates no test below the boundary, returns
no held live case, and puts no live proof on the stand-in.

## Slice mapping

Original SEED-403 slices 1–6 belong to its completed opt-in outcome. Original
slice 7 becomes slice 1 here and original slice 8 becomes slice 2. The former
G1 fixture-failure obligation follows slice 1 here. The scratch failure
retained the original assertion and fake GitHub call attachment, then the
mounted fixture closed and restored the worker HOME.

## Decisive premises

Observations on 2026-11-19 at preparation revision `161554a7e`, Node 24.21.0,
two workers, on AC with `caffeinate -s -i`, load average 8–11 from other
sessions:

| Operation | Observed result and remaining question |
| --- | --- |
| Reuse the candidate on trunk | `git apply --check --unidiff-zero slice-7-candidate.patch` passed. `git diff --stat 73f859a5d HEAD` over the patch's 21 files was empty. |
| Whole backend with the candidate default and focused repairs (scratch apply, then revert) | `npm run --silent test:dashboard:backend` exited 1 after about 19 minutes. Three cases failed. They are listed in the next three rows. All three passed alone twice with the same candidate. The premise "the repairs make the whole backend pass" is false. |
| `launches/agent-launch-follow-up-story.spec.ts` › refuses a follow-up whose done record cannot be read | Expected 502 and got 200. It reproduced with `npx playwright test --config dashboard/backend.playwright.config.ts backend-tests/usage-history/ backend-tests/launches/`. Cause read: `dashboard/server/followUpStory.ts` keeps a module-level `pinned` memo that is created once per process. A done record read at the deterministic origin revision by an earlier mounted case therefore answers this case, whose fake GitHub fails. The candidate put the sibling case on `liveServer: "separate process"`, which misnames this cause. The memo belongs to the install's lifetime, as `authenticatedRead.ts` already does it. |
| `usage-history/usage-check-freshness.spec.ts` › Checked follows a later import | `Unexpected Cursor protocol work on the runner stand-in: GET /sessions`, raised at mounted close, once. It did not recur in the two whole runs and the `usage-history/`+`launches/` subset below. In whole run 2 every Cursor runner sessions read was logged with its stack: no mounted server made one. Remaining reads came from live servers and a direct runner spec. Slice 2 treats a recurrence under the failure policy. |
| `intent/landed-ci-history-time-without-runner-waits.spec.ts` › keeps CI time without runner waits | A 5 s poll ended with one of two expected revisions. Cause observed below: process-level remembered attempt jobs. |
| Process-level CI memos (whole run 1, 2026-11-19 12:33–12:50, load 5–9, at `cda297a84` with the candidate and the slice 1 memo fix applied as a scratch) | `npm run --silent test:dashboard:backend` exited 1 with three cases failing, all `intent/landed-ci-*`: the runner-waits case above, `landed-ci-scope-proof-lifecycle.spec.ts` › legacy unreadable proof (proof summary carried the other variant's revision) and `landed-ci-scope-proof-recovery.spec.ts` › resumes unanswered proof (got `summary`, expected `unavailable`). The follow-up 502 case and `usage-check-freshness` passed. `npx playwright test --config dashboard/backend.playwright.config.ts backend-tests/intent/landed-ci` reproduced them mounted. It passed with a scratch live default, and the runner-waits case passed alone three times mounted. Cause: module-level answer memos keyed by repository and run, not by install. `readCiProofArtifact` (`ciProofArtifact.ts`) and `readCiAdapterProof` (`ciAdapterProof.ts`) remember summaries by `repository#run#attempt`, and `baseCiGithubRevisionLookup.ts` `rememberedAttemptJobs` remembers job lists the same way. Fixture cases reuse run numbers on `terryyin/open-dough`. With all three plus the CI comparison and status answers recreated at each mount (scratch), the same subset passed twice in a row (13:12–13:17, load 9–12), against two failing runs just before. |
| Collection outlives a mount's close | Scratch logging in `LandedCiCollection` (13:05–13:11) showed passes still running after `close()` returned, with the worker's HOME already restored to the developer's home. `close()` only aborts, and `collect()` still calls `keepLandedCiOrder` after the abort. No fixture revision reached `~/.open-dough/dashboard/landed-ci-history.json`, but a late pass resolves the machine store through the restored HOME. Slice 1 makes a mounted close wait for it. |
| Whole backend with every fix (whole run 2, 13:18–13:41, load 8–17) | The same command with the candidate, the follow-up memo, the CI memos recreated at each mount and the Cursor-read logging, all as scratch: exit 0, no failed case. All scratch edits were reverted with `git checkout -- dashboard`. |
| Other module-level server state | `usageGit.ts` `immutableReads` and `historicalUsageStory.ts` `cache` are keyed by checkout path, which is per case. `machineJsonStore.ts` `heldDocuments` is keyed by file path and checks file identity. Whole run 2 needed no change to them. |

The original candidate run is not reusable as a pass/fail baseline. It ran
before the focused repairs. The mounted count (702 of 952) and the 35.410 s
summed start and close from that run remain evidence only.

## Ordered slices

### 1. Each mount has its own remembered answers

Type: Structure
Status: planned
Budget: 15 active minutes, excluding commands.

Change: apply the [candidate patch](slice-7-candidate.patch), after
`git apply --check --unidiff-zero`. Move the process-level answer memos to
the authenticated-read install's lifetime, so each mount gets its own and a
live server keeps one, as `authenticatedRead.ts` already does with `pinned`:
`followUpStory.ts`'s `pinned`, `readCiProofArtifact`, `readCiAdapterProof`,
`rememberedAttemptJobs`, and the CI comparison and status answers that their
reads keep. Make a mounted close wait for the landed CI collection pass
under way, and keep `collect()` from writing the order after the abort.
Remove the candidate's `freshStoryRead` live request from
`agent-launch-follow-up-story.spec.ts`. This enables slice 2's whole-run
default.

The candidate also carries the fixture's failure path, the former G1
obligation. When the fixture receives a mounted server, it attaches the
available fake GitHub calls without asking for child output. It closes even
when diagnostics fail. It keeps the case's original failure and restores the
worker before another mount.

Proof: with the mounted default, before the move,
`backend-tests/usage-history/` with `backend-tests/launches/` fails the
follow-up case with 200, and `backend-tests/intent/landed-ci` fails a
landed-CI case, as observed above. After the move, both commands pass, and
`agent-launch-follow-up-story.spec.ts` › refuses a follow-up whose done
record cannot be read answers 502. Dashboard typecheck passes.

### 2. The whole backend passes with the mounted default

Type: Behavior
Status: planned
Budget: 15 active minutes, excluding commands.

Behavior: a backend case starts a boundary-mode server without asking →
the boundaries mount in the worker → its assertions are unchanged. A case
that asked for the live server gets one, and its reason names its cause.

Proof: the whole backend suite passes under the
[shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Whole run 2 above passed with slice 1's changes applied as a scratch. A
failure that appears now, such as a recurrence of the Cursor `GET /sessions`
at mounted close, first gets its cause found. State
that outlives a mount moves to the mount's lifetime. Any other cause is named
in the case's live request. A failure that load explains is still a defect
under the failure policy; classify it by rerunning the subset and recording
the load. No case is skipped or loosened. Temporarily record every start's
entry, live reason, and start and close time. Every boundary-mode start
without `liveServer` mounted. Every live boundary start names one of the
entry rule's kinds or a named mount cause. Report the mounted count as
evidence. Remove the recorder before commit.

If a failure stays unexplained after this slice's budget, stop and
replan instead of adding live requests that name no cause.

### 3. Mounted starts are faster and stay inside the backend group

Type: Behavior
Status: planned
Budget: 15 active minutes, excluding commands.

Behavior: the same backend run under the mounted default → its mounted
starts take under a quarter of their live time → frontend and E2E runs still
start live servers.

Proof: run the same implementation once with a scratch live default. Pair the
originally live starts by case and call order with the starts the mounted
default routed in-process. The mounted starts' summed start and first close
must be under a quarter of their live mates'. Explicit mount-only runtime
checks keep their requested entry in both runs and have no live mate. Retain
any unpaired rows for review. Alternate the live and mounted defaults three
times over `review/` and record both wall times. Run
`npm run test:dashboard:frontend` and `npm run test:e2e`, since the start is
shared with them, and confirm neither mounted a server. Revert the scratch
default and recorder.

### 4. The entry rule names the mount and the live request

Type: Behavior
Status: planned
Budget: 15 active minutes, excluding commands.

Behavior: a developer reads
[which entry a case uses](../../../dashboard/backend-tests/README.md#which-entry-a-case-uses)
→ it says Dashboard Backend Test mounts a boundary-mode start in the test
worker on the stand-in. It replaces "defaults to the live server" and says how a case asks for the live
server and with which reasons. It says Cursor work is such a reason, that a
test's own child command needs its own environment, and that server state
lives with its install → the header comment of `dashboardServer.ts` agrees.

Proof: the README and the fixture comments match the delivered option names;
`npm run lint` passes. The CI comparison in the seed's acceptance is owed to
target CI: the median `dashboard-backend` test-step time over the five main
runs after landing against the five before, read from CI.

## Plan review

Slice-plan refinement was not needed. The premise runs changed slice 1's
change list, and each slice has one outcome and owned proof. This review found
no remaining slice-specific concern. The once-seen Cursor `GET /sessions`
failure did not recur in two whole runs, and slice 2's failure-policy proof
and stop-and-replan bound own any recurrence.

## Recovery

The original plan, trial, and accepted opt-in slices are recoverable with
`git show 73f859a5da6e9e45f6bb6c194693b23e685f713c:.planning/slice-plans/710-reach-dashboard-backend-checks-through-the-mount/PLAN.md`.
The [candidate patch](slice-7-candidate.patch) was verified against that
revision. It preserves the partial default switch and the focused repairs.
Review it against the newly selected checkout before reusing it. Check
applicability with `git apply --check --unidiff-zero <patch>`. The candidate
kept a paused slice clock at 10.2 active minutes with no overrun.

The original checkout's evidence, failure traces, route files, rehearsal and
post-repair runs, full working-tree patch, and pre-split plan and source review
are archived under the repository's common Git directory at
`open-dough/recovery/SEED-408/` on the execution machine. The portable patch
and observations above are the inputs available from a fresh clone.

## Local verification

Use the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md),
default test timeouts, dashboard typecheck, and lint. Run long local gates on
awake macOS on AC with `caffeinate -s -i`; on battery follow the
[open-lid procedure](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
