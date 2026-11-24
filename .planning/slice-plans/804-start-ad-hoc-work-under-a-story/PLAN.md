# Start ad hoc work under a story

**Identity:** SEED-426#start-ad-hoc-work-under-a-story
**Source:** [Start ad hoc work under a story](../../seeds/SEED-426-start-ad-hoc-work-under-a-story.md#start-ad-hoc-work-under-a-story)

## Goal and scope

Start ad hoc work under a Taken story and return to its sessions and changes
through the Board, Recently done and Intent. Reuse the source identity for
follow-ups, with a distinct session ID. Retire the standalone lifecycle.

Include blank, attachment-only, default-checkout, isolated, scheduled feedback
and contextual starts. Respect existing checkout changes, workspace and landing
choices, and publication authority. Scratch operations outside Open Dough's
session workflow have no launch record. Keep identity-bearing workflow rules,
including queued one-shot review and review before publishing the work itself.

The seed settles the title and cutover. Other stories own context composition,
card cues, the Intent session picker, Review repository adoption and the blocked
legacy runner retirement.

## Current decisions

- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  makes the workflow the owner of repository admission, membership and
  published comparisons. The Dashboard binds an accepted start to its launch;
  its files hold local operational evidence. Publish the story and Taken
  assignment before native start. Retry with the original attempt and workspace.
- [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  guides the direct domain mapping and locally runnable proof. Apply
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  by checking simplification alongside independent behavioral observations.
- [Dashboard UX/UI North Star, Start ad hoc work under a story](../../../docs/dashboard-ux-ui-north-star.md#start-ad-hoc-work-under-a-story)
  supplies the pending, retry, blank-terminal and ordinary card behavior.
  [Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
  supplies the common story review destination and scope selection.
- [Architectural North Star, Read published comparisons from the Review repository](../../NORTH-STAR.md#read-published-comparisons-from-the-review-repository)
  keeps published comparisons independent of the execution checkout. Extend
  the existing published review path for these stories, respecting the recorded
  endpoints. SEED-428 owns adoption across readers.
- [Make production code directly testable](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows),
  and [Plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  govern proof. Mount the owner in frontend Vitest, call typed server boundaries
  in Node Vitest, and keep native host, Git and reload journeys at their real
  boundaries. Apply the repo's MakeMe and page-object selections before test
  changes. Apply maintainer skill-authoring guidance before shipped guidance
  changes.
- Reuse `execution-start --admit` and the product backlog's canonical identity,
  assignment, atomic publication and recovery. Its existing caller supplies a
  draft from a checkout. Expose the same admission operation to the new start
  with an owned draft, using `used-identities` and the published backlog rules
  for new identities. Preserve the admitted attempt across retries. Keep the
  execution checkout's existing work outside the admission commit. Carry
  workspace facts through the launch attempt.
- The follow-up resolves authoritative membership in `followUpAdmission` from
  the source story or bound session. Keep workflow action and story identity
  distinct in the shared launch contract. Use the existing session close and
  published review contracts for UUID and ranges. `branchLandingContext`,
  `decideRetainedLanding` and `resolveLandingComparison` own authority and the
  exact pair; compare the bound story as part of that authority. Retire the
  standalone `completedStoryAssociation` and local review path. Keep Git
  range and expiry rules with the existing readers.
- Keep the existing `feedbackMaintenanceCheck.ts` (292 lines) caller at its
  shared launch entry. Its due-date origin and deduplication stay with that
  caller. Absorb changes in the common admission boundary. In files already
  at the limit (`StartSession.tsx`, `SessionEntry.tsx`, `launchRecord.ts`,
  execute-plan `SKILL.md`, each 250 lines), shorten obsolete branching as the
  relevant slice edits it. If an addition needs a split, keep form UI, card
  actions, persisted session schema, and detailed startup procedure in their
  respective existing seams. Preserve the public adapters and their proof.
- Use the published Story Branch Mode assignment. Publish validated slices to
  the execution branch. Rehearse the final reader and migration there before
  integrating into trunk. Coordinate that integration with the writer pause
  and production watcher in slice 9 so the last verified package and store can
  continue serving until the cutover is ready. Transitional readers in
  implementation slices expire in slice 9.

## Execution context

- Publisher `dashboard-territory.local-open-dough`, agent Sola-chan, Story Branch Mode.
- Execution checkout `.worktrees/start-ad-hoc-work-under-a-story` in this
  repository, branch `codex/start-ad-hoc-work-under-a-story`.
  Integration checkout `/Users/terryyin/git/open-dough`; trunk `origin/main`.
- Starting revision `2ae40178f5d1bd39555dd0b52fe87cab9d6f81c8`.
  Published Take `46dd56241b745df00d8459cd36483d8732187261` on trunk and
  the execution branch.
- Slice 1 published as `d1271312797dc8394764efea4b74c969fd2c5d77` on the
  execution branch.
- Slice 2 published as `efca0e5a9ecd3686eaa38abe0ab359f81f26a7fb` on the
  execution branch. The developer waived the original frontend CI failure
  for this execution after two diagnosis rounds. The published cleanup
  revision is `aabca7d1947eba45cfa6a6b600d784834daed002`. The managed
  stash restored Slice 3's edits. [CI diagnosis](diagnosis-frontend-browser-connection.md)
- The first-story admission repair and revised launch boundaries published as
  `e4586ebd97caf82d5970f9d26abe29d0b040c3f0` on the execution branch.
- Codex CI observer `sola-chan-804`, GitHub Actions `ci.yml` (CI),
  `/tmp/dough-ci-501/watch-aNGFlu`, PID 20728, session 71797, cell `g66:4`.

## Premises and baseline

Observations use `c80f0559a` in the preparation checkout unless stated.
Listings verify selection. Each changed journey earns proof in its slice.

| Consuming operation | Observation and result |
| --- | --- |
| Existing admitted claim resumes and completes against fetched trunk | `node --test --test-reporter=spec Distribution/tests/skills/dough-execute-plan/workspace-publication-startup-admission-recovery.test.mjs Distribution/tests/skills/dough-execute-plan/workspace-publication-admitted-completion.test.mjs` passed 7 cases. The fixtures exercise accepted-but-lost response, interruption, competing trunk work, refusal and ordinary admitted completion with a bare remote. Slices 2 and 3 add the new draft and accepted-start callers. |
| Declared branch accepts and replays exact comparison | `npm run test:dashboard:backend -- dashboard/backend-tests/launches/declared-worktree-publication.spec.ts` passed the installed publication and retry case with an identity-free context. Calling `decideRetainedLanding` for `prepare` with the actual old retained authority and matching context identity reproduced 409. The record is Done with no checkout, preparations, or accepted comparison. `git rev-parse 0bdef6cb2^` and `git merge-base --is-ancestor 0bdef6cb2 origin/main` verified the historical pair and trunk containment. Slice 6 proves the linked acceptance and rejection paths. |
| Production launch document and retained contexts | In the listening deployment at `e9c2517`, importing `readStoredRecords` from `./dashboard/server/launchRecordDocument.ts` and calling it against the production home read all 1,639 launch rows. Two were open and linked. Ninety-five closed rows had no corroborated story. Raw operational inventory found one uncertain isolated ad hoc attempt with a kept start, clean matching branch without unique commits, and no bound launch. One of 2,041 context files had the identified declared-branch regression on a retained record. The JSONL usage archive held 307 readable rows. Slice 1 verifies native binding and rehearses the exact cutover input without a write. |
| Published session history | `git ls-tree -r --name-only HEAD .planning/sessions` and parsing each record counted 84 records at the post-revert preparation baseline. Seventy-one carry story identities and 13 are storyless. Preserve the latter through Git history. Slice 7 exercises published review from an empty machine store. |
| Legacy frontend inventory | `node node_modules/@playwright/test/cli.js test --config dashboard/frontend.playwright.config.ts --list --reporter=list recently-done-ad-hoc recently-done-sessions-review-cue-evidence recently-done-sessions-review-cue-races 'recently-done-sessions-select\.spec' 'recently-done-story-sessions\.spec'` listed 21 cases in ten files. See the seed for the boundary and slice 8 for the replacement observations. |
| Startup recovery and published review E2E selection | `npm run test:e2e -- --list --reporter=list e2e/launches/agent-launch-start-session-recovery.spec.ts e2e/sessions/recently-done-published-sessions.spec.ts` listed four Chromium cases in two specs. Keep the bare remote, distinct launch and empty-machine setup when changing these journeys. |
| Comparable simplification measurement | At this post-revert baseline, `git ls-files` and counting physical lines in tracked UTF-8 files found 52,374 lines under `Distribution/src` and 131,034 under `dashboard/src` and `dashboard/server`. The browser listings below counted 821 frontend, 1,951 backend and 811 E2E cases. The Distribution discovery listed 539 Node jobs and 118 shell checks. Slice 1 obtains comparable Node case counts from full case artifacts before edits. |

Compare the post-revert execution base and delivered revision, controlling for
unrelated commits. Report Distribution code, shipped Markdown and their total,
and Dashboard source and shipped guidance. Use the same measurements twice:

- `git ls-files -z -- Distribution/src dashboard/src dashboard/server` and
  count UTF-8 physical lines by area and Markdown/code. Include shipped text
  moved outside those roots if a change relocates it.
- `OPEN_DOUGH_TEST_DIR=Distribution/tests bash scripts/test-jobs.sh` and
  `OPEN_DOUGH_TEST_CASE_OUTCOMES=<absolute file> npm test`. Count each discovered
  shell check once and each registered Node leaf in the case report. Compare
  completed CI case artifacts from the same runner and revision when available.
- `npm run test:dashboard:frontend -- --list`,
  `npm run test:dashboard:backend -- --list` and
  `npm run test:e2e -- --list --reporter=list`. Count case rows, including both
  Dashboard engines in the group listings. Use the direct legacy config with
  `--reporter=list` for an all-legacy selection if its group output is quiet.

## Slices

### 1. Establish the cutover baseline
Type: Behavior
Status: done
Proof: Inventory output, recovered Git evidence and comparable test-case
counts are available before implementation changes their subjects.

Before edits, capture the baseline case outputs and repeat the read-only joins. Correlate recorded and unresolved native launches by
retained references, validate the isolated attempt's checkout and ownership,
and inspect unresolved attempt outcomes rather than only `settledAt`. Copy
operational inputs to a private scratch home and keep raw records out of Git.
If a long or state-changing observation needs permission or native tooling,
this probe owns obtaining it. A changed unresolved binding or missing evidence
stops the dependent migration path until its disposition is known.

Baseline at the published Take, `46dd56241`. Local tracked-source counts are
38,428 Distribution code lines and 13,946 Markdown lines (52,374 total),
and 131,034 Dashboard code lines with no Markdown in the measured roots.
Distribution discovery finds 539 Node jobs and 118 shell checks, including
the repository self-installation check outside the Distribution-only CI
fragments. GitHub Actions run 45327072530, attempt 1 at `2c300bd10`, covers
the same test and runner inputs and the exact Node job selection. Its 2,259
Node leaves (2,256 passed, three other) bring Distribution to 2,377 cases.
Frontend lists 821, backend 1,951, and E2E 811, for 5,960 combined cases.
The legacy selection lists 21 in ten files. Published Git history has 85
session records, 72 linked and 13 storyless.

The live `e9c2517` reader parsed all 1,641 rows, 1,658 attempts, and 307
history rows from the private copy. Three open launches match their native
sessions and retained attempts. Two are story-linked. A standalone Claude
session was still working. Of 1,638 closed rows, 1,437 were linked in their
stored records. The published-history lookup found nine associations among
the remaining rows, established absence for 191, and had one unavailable
lookup. The one uncertain Cursor attempt retains the original clean
checkout and has no recorded native ID. The native evidence leaves an
orphaned conversation possible. The historical declared-branch context
reproduced the legacy 409 on the released reader, and Git confirms the
planned comparison is on trunk.

Run commands and terminal observations are in the worktree Git evidence
directory, `open-dough/evidence/slice-1-return.md`. The production snapshot
and exact references stay private there. The comparison inputs are
`baseline-counts-matched.log.run.json`, `baseline-production-joined.log.run.json`,
and `baseline-associations.log.run.json`. Disposition is records-only.

### 2. Admit independent work as a Taken story
Type: Behavior
Status: done
Proof: Distribution's installed startup against a fixture bare remote shows
one canonical story, assignment and Taken entry after lost response and retry.

With a new launch attempt and no existing story, start admission using the
existing claim transaction. Provide a minimal ordinary story and `unselected`
preparation facts. Retain the allocated identity and the original request.
Use existing identity collision and concurrent-claim handling, including
sibling admissions and divergent remote edits. Verify the queued list's order
and that a refusal leaves both story and Taken absent. Exercise current CLI
admission and an identity-bearing start so their normal paths still work.

The installed `execution-start.mjs draft --repository PATH --remote origin
--target BRANCH --title TEXT --goal TEXT` returns a proposed identity, link,
title and `ownedDraft`. Retain that response and an attempt-specific
publisher before calling `start --admit --identity ID --link HREF --title TEXT
--owned-draft JSON`. Use the separate owned claim worktree and Trunk Mode
when the session borrows the default checkout. Passing the default checkout
as `--repository` keeps its HEAD, index and worktree outside the claim.
Recover an uncertain result using the exact retained request and candidate.
A definitive different-owner or occupied-seed refusal leaves the losing
attempt unadmitted. A new draft of its launch request can allocate again.
The backlog renderer rejects brackets in titles. Dashboard admission applies the
unusable-label fallback when the existing label cannot be recorded.

The bare-remote proof observes exact published story and Taken membership,
agent assignment, queue order, dirty checkout preservation, a lost response,
an interrupted publication, and competing and sibling admissions. The
unchanged startup, Dashboard and installer proof passed, as did Dashboard
typecheck. The independent refactor consolidated retained-draft validation
and restored legacy membership lookup order. Its 40 affected CLI tests passed.
Literal commands, observations, consumer trace and terminal records are in
`open-dough/evidence/slice-2-return.md` and `slice-2-refactor.md` in the
worktree Git directory.

The first-story repair lets the exact published snapshot represent an absent
seed tree as empty while the shared reader still checks active and historical
identity evidence. A new bare-remote case failed at draft before the fix and
then observed the canonical first seed and sole Taken entry at the accepted
remote tip. All 22 scoped cases, source installation and Dashboard typecheck
passed. Independent review found no needed edits. The proof and consumer
trace are recorded in `open-dough/evidence/first-story-admission-repair-return.md`.

### 3. Open an isolated session under its admitted story
Type: Behavior
Status: done
Proof: An isolated launch publishes the story and Taken entry before native
start. Continue reuses the retained attempt and opens one Session entry.

Use the existing isolated workspace selection for the admission claim when
that owned workspace can carry it. Keep the native handoff's selected place,
manual and automatic landing, and writer and attempt gates. Preserve first
input and attachment behavior. In the installed bare-remote recovery journey,
observe the held publication, refusal or interruption, exact remote story
and Taken entry, one native call, and the card. Change the affected isolated
startup, kept-start and native refusal assertions with this increment. Show
pending and retry with accurate publication facts for the isolated choice.

The selected isolated worktree carries both the installed admission and the
native session. The accepted Take SHA establishes its comparison start,
and the retained attempt records the bound story before native dispatch.
The held-reply browser journey observed the actual remote seed and Taken
entry before any native call. Continue reused the same branch, worktree,
identity and SHA, then opened one native session and one entry on the
Taken card. The browser and backend selections also verified existing
review and automatic landing choices, blank first input, failed and
interrupted startup, and installed landing capture. Dashboard typecheck
and mounted compatibility passed. The independent refactor shared the
attempt's story lookup across Board reconciliation and native recovery,
then passed its focused backend, mounted and held-reply checks.

The isolated competing-candidate and receipt-write branches are safe to
refuse before native startup. Slice 4 owns their retry and feedback gaps.
The established-session landing keeps its observed exact comparison until
slice 6 binds the authority to the admitted story. Literal commands and
consumer dispositions are in `open-dough/evidence/slice-3-isolated-return.md`
and `slice-3-isolated-refactor-return.md` in the worktree Git directory.

### 4. Open a session in the default checkout under its admitted story
Type: Behavior
Status: planned
Proof: An independent launch borrows the selected checkout and publishes one
Taken story before native start, including a blank start and retry.

Apply the same admission and binding boundary to the no-policy default,
explicit default with auto-land, attachment-only, blank and scheduled
maintenance launches. Keep the actual checkout's HEAD, index and changes
outside the isolated claim worktree, preserve checkout-change and writer
checks, and keep the native workspace and landing routing. Exercise actual
installed publication and no-native-on-refusal or competing-writer behavior
in the affected host fixtures. Keep blank first input pending until the
developer types. Mount `StartSession` through its typed start and progress
boundary and observe blank, pending, refusal, accepted and Retry. Revise
all affected existing default-launch callers and assertions with this increment.
Use the published identity and existing Session entry so Board behavior
continues through the same card and launch record used by slice 3.
Settle retry of a definitively competing owned candidate through the common
admission boundary. Reuse the same attempt and selected workspace, preserving
the losing candidate and any developer changes. Prove a losing attempt opens
no session and that safe reallocation on Retry cannot adopt the winning
claim or duplicate an already accepted start.
When admission succeeds but the attempt receipt cannot be written, preserve
the confirmed claim, show that recording failed, and keep native startup
waiting until Continue can record it. Observe the retained accepted SHA.

### 5. Follow up under the source story
Type: Behavior
Status: planned
Proof: Start through the ordinary card and session actions against published
Taken and Done facts, checking the launch's story, new session ID and status.

With a source story or a session whose recorded identity resolves to one,
verify its membership in fetched facts and bind the follow-up to that
identity. The typed resolver takes source identity or session reference,
project membership and record readers. Check both sources and a mismatched
or unavailable source. Keep context delivery, original workspace/host rules,
and accepted retry binding. Observe no new story or membership mutation.

### 6. Land a story-linked follow-up with exact evidence
Type: Behavior
Status: planned
Proof: The declared-worktree publication spec exercises the installed Land
entry through two calls and reads the exact retained and published pairs.

For a new linked or retained matching declared-branch context, resolve the
bound launch, verify story and the full declared authority, prepare the
immutable pair, publish and record it under the follow-up UUID. A retry
reports the same pair. Check invalid story, host, workspace, branch, remote,
target and revision against the real validation boundary and observe no push
on refusal. Recreate the v0.3.113 shape in the fixture, and check the retained
record route after attempt expiry. Preserve the closed production incident's
Git evidence without treating it as an accepted Dashboard report.
The same landing authority must match the bound story on newly admitted
independent launches. Preserve the exact observed range and retained retry
that the isolated session path already exercises.

### 7. Return to completed ad hoc work through ordinary review
Type: Behavior
Status: planned
Proof: An admitted story completes via the installed workflow, then another
clone with empty launch storage opens its story and session changes in Intent.

Run the admitted completion and published sessions journeys with admission and
Land as setup actions, preserving independent observations of session IDs,
range order, repeat review, expiry and shared-checkout uncertainty where applicable. Observe Done membership, retirement and exact endpoints. Include a no-change completion through the ordinary
workflow. The second checkout fetches published facts to populate Recently done.

### 8. Retire standalone review and completion
Type: Behavior
Status: planned
Proof: Ordinary story-linked selection and warnings still work after
standalone rows, selectors, guidance and their 21 legacy cases disappear.

Remove standalone associations, row/range navigation, completion fallbacks
and branch-result readers used only by them. Follow `recentlyDoneListing`,
`recentlyDoneSelection`, `storyReviewSnapshot`, `completedStoryAssociation`
and `completionReporting` through Board, sidebar, Intent, published review,
completion and fixtures. Keep story-linked cue, focus, comparison and stale
response observations when they still express current behavior. Run the
exact legacy listing, check the owning mounted specs and retarget only E2E
journeys that still protect a live behavior. Remove shared support when its
last caller goes. Remove any standalone workflow instructions left by slices
2–7. Temporarily retain only store decoding needed for slice 9.

### 9. Switch the deployed store to story-linked sessions
Type: Behavior
Status: planned
Proof: The shipped Dashboard parses the complete migrated production store
before writes resume. Scope-specific deletion measurements and final discovery
show smaller Distribution and Dashboard production surfaces and fewer combined
executable cases, with the promised journeys still green.

In the actual deployment profile, rehearse using a private copy and the
candidate reader. Pause writers at cutover and recheck the snapshot gathered
in slice 1. Preserve a restorable copy of the original stores. Convert only
verified associations, and preserve the unresolved startup as a resumable
attempt if its ownership and native state are established. Store closed
standalone evidence outside the active schema. Reconcile companion attempt,
start and reporting references with each converted record. Require schema
parse, row/disposition accounting and lookup of still-open linked sessions
through the actual Dashboard reader. On failure keep writes paused and restore
or retain the prior complete store and deployment. After acceptance remove the
one-time converter and confirm no product reader or writer accepts a new
unassociated session. Keep Git session history recoverable. Deploy only after
final proof under the existing production and client-update authorization.

## Proof gates and slice review

Run the per-slice outside-in checks, the installed
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
with retired behavior and changed launch/review shape terms, and all reached
assertions. Run the Dashboard typecheck for script edits and Distribution
installation checks when changing installed contracts. Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
For long full-suite runs on macOS start awake on AC under `caffeinate -s -i`.
On battery plug in or start awake with the lid open under `caffeinate -i` and
check the sleep log. Follow shared local full-suite admission and assess load
before launching long runs. [Machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)

The initial Dashboard launch slice reached two independent fixture families
in 11.1 active minutes. The shared-path draft passed the queued-remote
lost-response check, while the changed isolated refusal path exposed legacy
no-publication assertions and the empty remote exposed a first-story bug.
An isolated and a default-checkout launch each have a complete acceptance
journey. They share retained admission and story binding, and differ in
checkout ownership. The plan splits that in-progress slice into two, with
the existing production cutover as one switch. The previous attempt's
uncommitted source and proof are parked in the worktree Git evidence directory
at `slice-3-before-split` and `slice-3-return.md`. The original attempt
remains incomplete, with no accepted Dashboard change.

## Story obligations

### G1. Open standalone launch at baseline
Reported: slice 1 — "The stored launch, retained attempt, and native Claude session all identify an open standalone session that was still working."
Story clause: "Deliver one switch to story-linked startup, completion and review."
Disposition: receiving slice 9

### G2. Cursor timeout with uncertain native binding
Reported: slice 1 — "The retained worktree matches the timed-out attempt. The available native listing and retained references cannot rule out a conversation without a stored ID."
Story clause: "Keep the checkout and evidence if ownership or native state cannot be confirmed."
Disposition: receiving slice 9

### G3. Closed launch with unavailable association lookup
Reported: slice 1 — "The current completion-history lookup for one Lizard launch was unavailable. Retain that record and its related evidence until publication history or an explicit disposition settles its status."
Story clause: "Archive closed records with no corroborated story and their linked attempt and reporting evidence."
Disposition: receiving slice 9

### G4. First admission to a project with no seed directory
Reported: slice 3 — "The installed owned-draft command refused a bare origin with a valid empty published backlog and no seed files."
Story clause: "Establish and persist the canonical story and its Taken entry before a new ad hoc session can proceed."
Disposition: proved by slice 2: `workspace-publication-startup-admission-recovery.test.mjs`, the first owned admission publishes its canonical story directly to Taken

### G5. Default-checkout launches remain on their current path during isolated rollout
Reported: slice 3 — "The in-progress launch slice separated isolated and default-checkout startup because their supported workspace ownership and affected proof differ."
Story clause: "Every Open Dough project session has a story identity from startup."
Disposition: receiving slice 4

### G6. Retry after a competing claim leaves a local candidate
Reported: slice 3 — "A definitive different-owner refusal after local candidate creation currently repeats the same refusal on Continue because the losing candidate still occupies the retained workspace."
Story clause: "On refusal, show the reason and let the developer retry that start."
Disposition: receiving slice 4

### G7. Isolated launch landing still uses legacy established-session authority
Reported: slice 3 — "The isolated session record binds a Taken story. Its retained landing still uses the legacy established-session authority to preserve the current exact comparison."
Story clause: "Use the ordinary story lifecycle and recorded membership for Land, completion, follow-ups and review, including after checkout retirement and from another clone."
Disposition: receiving slice 6

### G8. Admission receipt write failure obscures a confirmed publication
Reported: slice 3 — "The accepted isolated claim is retained and native startup is blocked if saving the attempt receipt fails, but the resulting generic uncertainty omits the known publication and failed write."
Story clause: "On refusal, show the reason and let the developer retry that start."
Disposition: receiving slice 4
