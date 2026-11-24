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
- Deliver the cutover in Trunk Mode (`--trunk`). Changes may land in bounded
  increments on trunk. Keep the current deployed package serving until the
  candidate and migrated store pass the final cutover. Transitional readers
  in implementation slices expire in slice 8.

## Premises and baseline

Observations use `c80f0559a` in the preparation checkout unless stated.
Listings verify selection. Each changed journey earns proof in its slice.

| Consuming operation | Observation and result |
| --- | --- |
| Existing admitted claim resumes and completes against fetched trunk | `node --test --test-reporter=spec Distribution/tests/skills/dough-execute-plan/workspace-publication-startup-admission-recovery.test.mjs Distribution/tests/skills/dough-execute-plan/workspace-publication-admitted-completion.test.mjs` passed 7 cases. The fixtures exercise accepted-but-lost response, interruption, competing trunk work, refusal and ordinary admitted completion with a bare remote. Slices 2 and 3 add the new draft and accepted-start callers. |
| Declared branch accepts and replays exact comparison | `npm run test:dashboard:backend -- dashboard/backend-tests/launches/declared-worktree-publication.spec.ts` passed the installed publication and retry case with an identity-free context. Calling `decideRetainedLanding` for `prepare` with the actual old retained authority and matching context identity reproduced 409. The record is Done with no checkout, preparations, or accepted comparison. `git rev-parse 0bdef6cb2^` and `git merge-base --is-ancestor 0bdef6cb2 origin/main` verified the historical pair and trunk containment. Slice 5 proves the linked acceptance and rejection paths. |
| Production launch document and retained contexts | In the listening deployment at `e9c2517`, importing `readStoredRecords` from `./dashboard/server/launchRecordDocument.ts` and calling it against the production home read all 1,639 launch rows. Two were open and linked. Ninety-five closed rows had no corroborated story. Raw operational inventory found one uncertain isolated ad hoc attempt with a kept start, clean matching branch without unique commits, and no bound launch. One of 2,041 context files had the identified declared-branch regression on a retained record. The JSONL usage archive held 307 readable rows. Slice 1 verifies native binding and rehearses the exact cutover input without a write. |
| Published session history | `git ls-tree -r --name-only HEAD .planning/sessions` and parsing each record counted 84 records at the post-revert preparation baseline. Seventy-one carry story identities and 13 are storyless. Preserve the latter through Git history. Slice 6 exercises published review from an empty machine store. |
| Legacy frontend inventory | `node node_modules/@playwright/test/cli.js test --config dashboard/frontend.playwright.config.ts --list --reporter=list recently-done-ad-hoc recently-done-sessions-review-cue-evidence recently-done-sessions-review-cue-races 'recently-done-sessions-select\.spec' 'recently-done-story-sessions\.spec'` listed 21 cases in ten files. See the seed for the boundary and slice 7 for the replacement observations. |
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
Status: planned
Proof: Inventory output, recovered Git evidence and comparable test-case
counts are available before implementation changes their subjects.

Before edits, capture the baseline case outputs and repeat the read-only joins. Correlate recorded and unresolved native launches by
retained references, validate the isolated attempt's checkout and ownership,
and inspect unresolved attempt outcomes rather than only `settledAt`. Copy
operational inputs to a private scratch home and keep raw records out of Git.
If a long or state-changing observation needs permission or native tooling,
this probe owns obtaining it. A changed unresolved binding or missing evidence
stops the dependent migration path until its disposition is known.

### 2. Admit independent work as a Taken story
Type: Behavior
Status: planned
Proof: Distribution's installed startup against a fixture bare remote shows
one canonical story, assignment and Taken entry after lost response and retry.

With a new launch attempt and no existing story, start admission using the
existing claim transaction. Provide a minimal ordinary story and `unselected`
preparation facts. Retain the allocated identity and the original request.
Use existing identity collision and concurrent-claim handling, including
sibling admissions and divergent remote edits. Verify the queued list's order
and that a refusal leaves both story and Taken absent. Exercise current CLI
admission and an identity-bearing start so their normal paths still work.

### 3. Open a new session under its admitted story
Type: Behavior
Status: planned
Proof: Installed start and real launch fixture observe the remote story and
Taken entry before native launch, then one Session entry after Continue.

Route all independent Dashboard launches through admission, including the
no-policy default, isolated, attachment-only, blank and maintenance paths.
Keep pending and refusal UI, checkout-change and writer checks, and retry
through the retained attempt in `launchStart` and launch binding.
Mount `StartSession` with its typed start/progress interface and exercise the
blank, refusal and accepted variants. In the startup recovery journey observe
remote content, native launch count, the card and the first-input behavior
rather than seeding the accepted result. Assert that a second writer or a
failed admission cannot open a native session. Preserve manual and automatic
landing selections and existing launch context routing.

### 4. Follow up under the source story
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

### 5. Land a story-linked follow-up with exact evidence
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

### 6. Return to completed ad hoc work through ordinary review
Type: Behavior
Status: planned
Proof: An admitted story completes via the installed workflow, then another
clone with empty launch storage opens its story and session changes in Intent.

Run the admitted completion and published sessions journeys with admission and
Land as setup actions, preserving independent observations of session IDs,
range order, repeat review, expiry and shared-checkout uncertainty where applicable. Observe Done membership, retirement and exact endpoints. Include a no-change completion through the ordinary
workflow. The second checkout fetches published facts to populate Recently done.

### 7. Retire standalone review and completion
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
2–6. Temporarily retain only store decoding needed for slice 8.

### 8. Switch the deployed store to story-linked sessions
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

Separate slice-plan refinement was unnecessary. The slices have independent
acceptance observations and use one shared membership rule. Slice 1 owns the
remaining baseline and host observations. No other slice concern remains.
