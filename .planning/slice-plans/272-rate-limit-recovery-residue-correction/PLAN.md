# Rate-limit recovery waits, resumes, and labels as promised

**Identity:** SEED-113#rate-limit-recovery-residue-correction
**Source:** [correction story](../../seeds/SEED-113-dashboard-github-responsiveness.md#rate-limit-recovery-residue-correction),
from the execution retrospective of SEED-113#recover-consistently-from-rate-limits
(story at `11c71766:.planning/seeds/SEED-113-dashboard-github-responsiveness.md#recover-consistently-from-rate-limits`,
plan at `11c71766:.planning/slice-plans/264-rate-limit-recovery/PLAN.md`, all seven
slices done), delivered by commits a2d43dde, 823c1eda, 9935c040, b015cb8b,
68d46d28, 5d767de4, 7edb4b2b, 4b9695eb, 8025b9eb, 35b025ed and adc41a56 on
`claude/recover-consistently-from-github-rate-limits`.
**Prepared:** 2026-10-07. Planning only, in the execution's worktree at
`adc41a561d261b795b6e2d1d85901af25398dd53`.

## Goal and boundaries

A developer whose dashboard meets GitHub's rate limit gets the recovery the
original story promised. A limit whose direction names a time already passed
waits as a limit that directs no usable wait does, so no page re-reads in a
burst. After any wait, a first read that ends without a limit reopens the
turns, so an unreachable GitHub or a timed-out read does not keep the process
at one read at a time. A detail the limit withheld is labeled one way, naming
what was withheld and the absolute time the limit ends. The "not asked"
sentence has one producer. A stale comment and a duplicated test helper go.

Exclusions:

- Finding 2 (a launch's containment question withheld by the limit is never
  re-asked) did not reproduce. See O3. It stays out of this correction.
- The server's own failure sentences ("GitHub asked to wait N seconds…",
  "Reading resumes in N seconds.", "Try again in N seconds.") stay for alerts
  and the project-addition answer. Only gap labels change.
- No page-side guard against a zero wait. After slice 1 the boundary never
  reports one: a directed wait is at least one second, and so is a backoff
  or the time left of a wait.

## Current findings

Each finding was rechecked against `adc41a56`.

1. **A zero directed wait makes pages re-read in a tight loop.**
   `directedWaitSeconds` (`dashboard/server/rateLimitDirection.ts`) returns
   `0` for `Retry-After: 0`, a past HTTP date, or a reset time not later than
   now. `limitedAsDirected` (`server/ghAnswer.ts`) then yields `rate-limited`
   with `waitSeconds: 0`. `ReadAdmission.answered` sets `resuming` but no
   cooldown. On the page, `noteLimit(0)` (`src/readingLimit.ts`) counts a
   limit without one standing, so the snapshot is withheld and
   `useLimitRecovery` (`src/limitRecovery.ts`) reads afresh at once, again and
   again. Reproduced by O1.
2. **After a wait, a first read GitHub never answers keeps one turn.**
   `ReadAdmission.answered` clears `resuming` only for an answer carrying a
   status. An unreachable GitHub, a departed request, or `no login` answers
   without one. A timed-out read rejects in `spawnedGh` without reaching
   `answered`. The whole process then stays at one read at a time. Reproduced
   by O2.
3. **A withheld detail is labeled three ways.** The three labels:
   - GitHub's directed wording, "…GitHub asked to wait 900 seconds… Limited
     until T." (`limited-reading-detail.spec.ts:58`);
   - the server's held-back wording, "…Reading resumes in N seconds. Limited
     until T.", whose relative N freezes on the card (plan 264, slice 6 gaps);
   - the page's local refusal, "…was not asked of GitHub. Limited until T."
     (`limited-reading-detail.spec.ts:62`).

   `limitGapProblem` (`src/readWaitBound.ts`) appends the time to whatever
   message the `ReadProblem` carried. The "not asked" sentence is written in
   three places: `src/authenticatedGet.ts`, `server/readFailureMessage.ts:52`,
   and `server/projectAddition.ts:24`.
4. **Stale comment.** The header of `server/rateLimitDirection.ts` says the
   wait exists so the page's revision checks never ask sooner. It now feeds
   admission for every read (`server/readAdmission.ts`).
5. **Duplicated test helper.** `askedSince(page, from)`
   (`dashboard/tests/limitRecoveryCredit.ts:57`) is `readsBesideChecks`
   (`tests/originObservation.ts:23`) plus a `commit <sha>` name, except that it
   keeps revision checks as `matching-refs`. Neither credit spec expects a
   check.

## Preserved promises and constraints

Every promise, constraint, and key example of
SEED-113#recover-consistently-from-rate-limits holds. In particular:

- only a rate limit starts a cooldown;
- a limit that directs no usable wait backs off from 60 seconds, doubling up
  to an hour;
- after any wait one read goes first, and a refused first read starts the
  wait again with nothing else asked;
- at most eight reads are under way;
- a held-back read establishes neither content nor absence;
- the page asks nothing while its limit stands and recovers on its own after;
- human credit recovers at an unchanged revision.

The accepted proof of plan 264 is preserved, along with slice 7's approved
departure: the recovery read is the fresh read a reload makes. Accepted
[ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) keeps this design
with the feature. [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)'s
high cohesion supports one owner of the gap label and one "not asked"
sentence. The [North Star topic](../../NORTH-STAR.md#one-owner-admits-reads-to-github)
that plan 264 follows still governs: admission is the one owner, and the page
has one recovery. No conflict was found.

## Current decisions

- **A direction that names no future time is no usable wait.**
  `directedWaitSeconds` returns `undefined` when the computed wait is zero or
  less. The refusal is then classified as `"Retry-After: soon"` is today:
  `classify` recognizes the rate limit from what `gh` printed, and
  `ReadAdmission` backs off. Only the boundary changes; the page needs no
  guard.
- **Any end of the first read after a wait without a limit reopens the
  turns.** Reopening covers an answer, an unreachable GitHub, no login, a
  departure, and the read's own bound. A rate limit keeps or restarts the
  wait as today. `spawnedGh` tells `ReadAdmission` how the read ended on
  every path, including the timed-out rejection, before the turn passes on.
- **One gap label for a withheld detail:** `GitHub's rate limit withheld
  <reading>. Limited until <T>.`, built only by `limitGapProblem` from the
  `reading` the page asked for and the page's limit time. It never uses
  GitHub's or the server's sentence, so no relative seconds appear on a card.
  `ReadProblem` carries the `reading` when the limit stopped it. Humans add
  their "Human developer unknown." prefix as today.
- **One "not asked" sentence.** `notAskedOfGitHub(what)` lives in
  `src/authenticatedReadRules.ts`, which the server already imports. It is
  used by `authenticatedGet`'s local refusal, the server's held-back message,
  and project addition. The relative-time tails of those messages stay as
  they are.
- **Test isolation from plan 264 still applies.** A boundary case that meets
  any limit needs a server of its own (`onServerOfItsOwn` with
  `limitBackoffMs: 1_000`, or `ownRevisionCheckBoundary`) and waits with
  `untilReported`. Page clocks are paused while the server's clock is real. A
  journey that must not see reading resume uses a long wait, or the
  production 60-second backoff, and never waits it out. After any wait, one
  read goes first.

## Decisive premises and observations

Observations ran in this worktree at `adc41a56`, with Node and dependencies as
installed. Each probe was a temporary spec, deleted after its run. The worktree
is left with only its pre-existing `DearDough.md` change.

| Premise | Consumed by | Observation and result |
| --- | --- | --- |
| A zero directed wait makes a page re-read the withheld detail in a burst. | Slice 1's remedy and page proof. | O1 opened `limitedReadingRecords.ts`' project with the withheld seed refused `Retry-After: 0` (through `limiting(page, …, 0)`), page clock paused. In 3 s of real time GitHub was asked for that seed 66 times and the ref 33 times (104 calls). Reproduced. |
| The boundary already handles a rate limit with no usable direction by backing off, recognizing it from `gh`'s printed message with the fake's `rateLimitedAnswer` body. | Slice 1's remedy. | `authenticated-read-revision-check-failures.spec.ts:138` asserts `"Retry-After": "soon"` and a reset with allowance remaining report "GitHub named no wait, so reading resumes in 60 seconds." with `retryAfterSeconds: 60`. It passed in O4. |
| Page journeys run on the production backoff base, so a 60-second backoff is never waited out with the page clock paused. | Slice 1's page proof. | `dashboardTest.ts`'s `dashboard` fixture passes no `limitBackoffMs` to `startDashboardServer`; `DOUGH_LIMIT_BACKOFF_MS` defaults to 60 000 (`server/ghRead.ts:43`). |
| After a wait, a first read that ends without an answer status keeps the process at one read at a time. | Slice 2's remedy and proof. | O2 started a server of its own with `limitBackoffMs: 1_000` and met a one-second directed wait (`afterWait`). The first seed read after the wait was answered `noConnection` ("could not reach GitHub"). Then three seed reads were requested with answers held: after 1.5 s and the refused marker, one had reached GitHub. Reproduced. |
| A timed-out read never reaches `ReadAdmission.answered`. | Slice 2's remedy. | Reading `spawnedGh` (`server/ghRead.ts:162-165`): on `ReadBoundReached` it ends the turn and rejects without `answered`. |
| A launch's containment question withheld by the limit stays unasked after the wait until a reload. | Finding 2's inclusion. | O3, two temporary variants of `responsive-session-reconciliation.spec.ts`' first journey. (a) The comparison was refused `Retry-After: 2`. After the wait, an unchanged check asked it again. (b) A check was refused `Retry-After: 2`, and the session settled while the limit stood. The story said "…whether X contains Y was not asked of GitHub." with no comparison asked. After the wait and three unchanged checks, the comparison had been asked once and the problem was gone. The settling's fresh read is refused locally, which marks the snapshot withheld, so recovery reads afresh and starts a new generation. **Not reproduced; excluded.** |
| Every withheld-detail gap label passes through `limitGapProblem`. | Slice 3's one label. | `grep -rn "limitGapProblem\|detailGapProblem" dashboard/src`: record files (`repositoryFileReads.ts:52`), profiles (`agentAssignments.ts:201`), humans (`assignmentAttribution.ts:81`), slice clocks (`sliceClockStart.ts:127`), and done records (`doneStories.ts:66`). The last three go through `detailGapProblem`, which calls `limitGapProblem`. |
| The page knows what each limited read was reading. | Slice 3's label. | `authenticatedGet(query, reading, signal)` (`src/authenticatedGet.ts`) receives `reading` for every boundary request and builds both limited `ReadProblem`s there. |
| The "not asked" sentence has exactly three producers, and the server can share a page rule. | Slice 3's one sentence. | `grep -rn "not asked of GitHub" dashboard/server dashboard/src`: `authenticatedGet.ts`, `readFailureMessage.ts:52`, and `projectAddition.ts:24`. `rateLimitDirection.ts` and `readAdmission.ts` already import `src/authenticatedReadRules.ts`. |
| Which tests assert the limit wording. | Slice 3's regression set. | `grep -rln "GitHub limited the rate\|asked to wait\|was not asked of GitHub\|Reading resumes in\|Try again in\|Limited until\|limitSaid" dashboard/tests` lists the files under slice 3's proof. Gap labels are asserted in `limited-reading-detail.spec.ts:58,62`, `limited-reading-profile-history.spec.ts:60`, and `limit-recovery-detail.spec.ts` (the card's "GitHub limited the rate", and its absence after recovery). |
| `askedSince` differs from `readsBesideChecks` only in naming `commit <sha>` and keeping checks, and neither credit expectation names a check. | Slice 4. | Reading `limitRecoveryCredit.ts:57-65`, `originObservation.ts:23-40`, `limit-recovery-credit-commit.spec.ts:37`, and `limit-recovery-credit-history.spec.ts:34`. No other caller of `readsBesideChecks` expects a bare `commit` (`grep -rn '"commit"'` over those callers). |
| The named regressions pass at the base. | Every slice's proof. | O4 exit 0. |

Literal observation commands, from the repository root:

```sh
# O1 — temporary page probe (zz-zero-wait-planning-probe.spec.ts), removed after the run
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts zz-zero-wait-planning-probe.spec.ts --workers=1 --reporter=line

# O2 — temporary boundary probe (zz-resuming-planning-probe.spec.ts), removed after the run
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts zz-resuming-planning-probe.spec.ts --workers=1 --reporter=line

# O3 — temporary launch journeys (zz-containment-limit-planning-probe.spec.ts, two variants), removed after the runs
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts zz-containment-limit-planning-probe.spec.ts --workers=1 --reporter=line

# O4 — baseline of the focused regressions; exit 0
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- authenticated-read-revision-check-failures.spec.ts authenticated-read-resumption.spec.ts limited-reading-detail.spec.ts limit-recovery-credit-history.spec.ts limit-recovery-credit-commit.spec.ts limit-recovery-detail.spec.ts --workers=2
```

## Proof

Run from the repository root with `NODE_ENV` unset:
`env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- <specs> --workers=2`,
plus `env -u NODE_ENV npm run typecheck:dashboard`. Slices 1 and 2 change the
admission every `gh` read reaches. Slice 3 changes the one request every page
read makes, and wording many specs assert. So run the whole
`env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard` before
delivering each of them. Plan 264 did the same, for the same reason. Slice 4
changes test support only and runs its focused specs.

Write each new case first and see it fail on the current code before the
remedy. A case that already passes leaves its finding unexplained: stop and
revise this plan.

| Correction outcome | Slice |
| --- | --- |
| A direction naming no future time backs off; no page re-reads in a burst | 1 |
| A first read after a wait that ends without a limit reopens the turns | 2 |
| One withheld-detail label and one "not asked" sentence | 3 |
| One test name for what GitHub was asked | 4 |

## Slices

### 1. A limit naming a time already passed waits as one naming none

Type: Behavior
Status: done
Proof: New headers in the "directs nothing usable" loop of
`authenticated-read-revision-check-failures.spec.ts`, a new case in
`limited-reading-detail.spec.ts`, and the regressions
`authenticated-read-directed-wait.spec.ts`, `authenticated-read-backoff.spec.ts`,
`authenticated-read-cooldown.spec.ts`, `authenticated-read-resumption.spec.ts`,
`auto-refresh-rate-limit.spec.ts`, `limit-recovery-detail.spec.ts`, and
`limit-recovery-check.spec.ts`. Run the typecheck and the whole suite.

Behavior: GitHub refuses a read as a rate limit with `Retry-After: 0`, a
`Retry-After` HTTP date already past, or `X-RateLimit-Remaining: 0` with a
reset time already past. The boundary answers as it does for a limit that
directs no usable wait: "GitHub named no wait, so reading resumes in 60
seconds." with `retryAfterSeconds: 60`, and the process holds back later
reads. A page whose detail read meets such a refusal labels it, says once
when reading resumes, about 60 seconds later, and asks GitHub for that detail
once, not again and again.

Make `directedWaitSeconds` return `undefined` for a wait of zero or less.
Rewrite the module's header comment (finding 4): the wait feeds the process's
admission of every read (`./readAdmission.ts`), not only the page's checks.

At the boundary, add the three headers to the existing `refusedOnOwnServer`
loop, each on a server of its own. For the past reset, name a time a few
seconds before the check. In the page case, refuse the withheld seed with
`Retry-After: 0` through `limiting(page, published, 0)` and never lift it.
Pause the page clock, then:

- assert the notice's resume time is 60 seconds after the opening time,
  within the rounding `expectSameResumeTime` allows;
- let a few seconds of real time pass with `checksAskedWhilePassing(page, 0)`,
  or a plain wait followed by `untilPageRequestsAnswered`;
- assert `githubFor(page).calls` holds that seed exactly once.

Update the reading contract's sentence on a refusal that directs no usable
wait (`dashboard/PUBLISHED-OBSERVATION.md`) to include a time already passed.
Update the matching sentence in `dashboard/GITHUB-REQUESTS.md`.

Safe stop: A limit whose direction has already passed costs one wait, not a
burst of reads.

Accepted proof: red before the remedy. The boundary loop received "GitHub
asked to wait 0 seconds…" with `retryAfterSeconds: 0`. The page case never
settled, because the page kept re-reading. After the remedy:

- the boundary loop's
  `expect(undirected.body).toEqual({ error: limitedMessage(403, "GitHub named
  no wait, so reading resumes in 60 seconds."), retryAfterSeconds: 60 })`
  holds for all five header sets;
- `limited-reading-detail.spec.ts` "a limit naming a time already passed waits
  as one naming none…" asserts the resume time is 60 s after the opening time,
  and that the seed was asked once after 3 s of real time.

The named regressions, `authenticated-read-cooldown-reach` and
`authenticated-read-revision-reuse-failures` passed (34). The whole suite
passed (1236), and so did the typecheck. `directedWaitSeconds` has one
consumer, `limitedAsDirected`, which already classifies `undefined` from
`gh`'s output.

### 2. Reading reopens when the first read after a wait ends without a limit

Type: Behavior
Status: done
Proof: New cases in `authenticated-read-resumption.spec.ts`, and the
regressions `authenticated-read-turns.spec.ts`,
`authenticated-read-cooldown.spec.ts`, `authenticated-read-backoff.spec.ts`,
`authenticated-read-subprocess-lifecycle.spec.ts`,
`authenticated-read-plugin-hooks.spec.ts`, and
`read-turns-across-tabs.spec.ts`. Run the typecheck and the whole suite.

Behavior: A wait has ended, and the first read after it ends without a rate
limit and without an answer from GitHub, in one of three ways: GitHub is
unreachable, the request leaves, or the read reaches its bound. Three
requests for different reads then go under way together, up to the bound of
eight. When the first read is refused with a rate limit, the wait starts
again with nothing else asked, as today. When it is answered, the others
proceed, as today.

`ReadAdmission` learns how the first read after a wait ended on every path
in `spawnedGh`, including the timed-out rejection and the departed call,
before the turn passes on. Any ending without a rate limit clears
`resuming`. Rewrite the class comment's "answered by GitHub without a limit"
to say this. Plan 264 slice 5 recorded this case as untested; it is now
covered.

For each ending, in a case on a server of its own with `limitBackoffMs:
1_000`:

- use `afterWait` with a one-second directed wait;
- end the first seed read that way:
  - **unreachable:** `answeringFirst(published, isSeed, noConnection)`;
  - **leaving:** `abandonedRequest` on a held first read;
  - **bound reached:** a held first read on a server whose `readTimeoutMs`
    is a few seconds, as `authenticated-read-turns.spec.ts:221` does;
- hold every seed answer with `holdingAnswer` and request three seed reads;
- poll `askedSince(server, before)` until three have arrived;
- release, and assert three answers.

Describe this in the paced-resumption sentences of both documents.

Safe stop: An unreachable or slow GitHub after a wait is reported as today
and holds back no other read.

Accepted proof: red before the remedy. Each ending's case polled "Expected 3,
Received 1". After the remedy, the `endingsWithoutLimit` loop in
`authenticated-read-resumption.spec.ts` passes:

- `expect.poll(() => askedSince(server, before).length).toBe(3)` while every
  answer is held;
- the statuses are `[200, 200, 200]` after release.

The named regressions passed (29), as did the whole suite (1239) and the
typecheck. `ReadAdmission.answered` drops its status condition, and the
departed call already reached it. `spawnedGh` calls `admission.timedOut`
before the turn ends. The refactor moved the "wait that starts while reads
wait their turn" case to `authenticated-read-wait-in-turn.spec.ts`, and the
shared fixture to `tests/support/resumingReads.ts`. Both specs reran green.
For wrap-up: `.planning/NORTH-STAR.md`'s "its answer reopens the turns" now
reads as any ending without a limit.

### 3. A detail the limit withheld is labeled one way

Type: Behavior
Status: planned
Proof: The updated gap assertions in `limited-reading-detail.spec.ts`,
`limited-reading-profile-history.spec.ts`, and `limit-recovery-detail.spec.ts`.
Every other file the wording grep lists stays green after updating its
assertions:

- `limited-reading-check.spec.ts` and `limited-reading-membership.spec.ts`;
- `limit-recovery-tabs.spec.ts`, `limit-recovery-credit-history.spec.ts`, and
  `limit-recovery-credit-commit.spec.ts`;
- `auto-refresh-rate-limit.spec.ts`, `read-failure.spec.ts`, and
  `accessible-overview-keyboard.spec.ts`;
- `authenticated-read-cooldown.spec.ts`,
  `authenticated-read-cooldown-reach.spec.ts`, and
  `authenticated-read-resumption.spec.ts`;
- `authenticated-read-shared-failures.spec.ts`,
  `authenticated-read-containment.spec.ts`, and
  `authenticated-read-directed-wait.spec.ts`;
- `authenticated-read-revision-check-failures.spec.ts`,
  `authenticated-read-backoff.spec.ts`, and `project-add-boundary.spec.ts`.

Run the typecheck and the whole suite.

Behavior: A page whose detail read meets the limit labels every withheld
detail the same way: record files, profiles, humans, slice clocks, and done
records. The label reads "GitHub's rate limit withheld \<what was read\>.
Limited until \<T\>.". This holds whether GitHub refused that read, the
server held it back, or the page refused it locally. No card names a
relative number of seconds. A human's label keeps its "Human developer
unknown." prefix. Alerts and the add-project answer keep their wording,
whose "not asked" sentence now comes from one rule.

`ReadProblem` carries the `reading` when the limit stopped it, set in
`authenticatedGet` for both limited cases. `limitGapProblem` builds the label
from that reading and `resumesAt` alone. Add `notAskedOfGitHub(what)` to
`src/authenticatedReadRules.ts` and use it in `authenticatedGet.ts`,
`readFailureMessage.ts`, and `projectAddition.ts`.

In `limited-reading-detail.spec.ts`, assert both the refused seed and the
plan the page did not ask carry the one label with the same `Limited until`
time. Also assert that no card text matches `/\d+ seconds/`. In
`limited-reading-profile-history.spec.ts`, assert the human's label. In
`limit-recovery-detail.spec.ts`, assert the card shows the new label before
recovery and that no "GitHub's rate limit withheld" text remains after it.
That keeps the "cleared" assertion meaningful. Update the reading contract's
sentence on how withheld detail is labeled.

Safe stop: Every card says the same thing about a withheld detail, in the
time the notice shows.

### 4. Credit recovery journeys name GitHub's requests as the others do

Type: Structure
Status: planned
Proof: `limit-recovery-credit-history.spec.ts` and
`limit-recovery-credit-commit.spec.ts` stay green, as do the other
`readsBesideChecks` callers: `limit-recovery-detail.spec.ts`,
`limit-recovery-tabs.spec.ts`, `reopened-project-reads.spec.ts`,
`shared-observer-reads.spec.ts`, `auto-refresh-branches.spec.ts`, and
`auto-refresh-unusable-branch.spec.ts`. Run the typecheck.

Correction: `readsBesideChecks` names a `commit` request `commit <sha>`. The
local `askedSince(page, from)` in `limitRecoveryCredit.ts` goes. The two
credit specs assert `readsBesideChecks(githubFor(page).calls.slice(asked))`
with their current expectations. This finding is owned directly by the
retrospective. External behavior is unchanged. The only difference is that a
revision check during recovery is no longer listed, matching every other
recovery journey.

## Verification, sizing, and delivery

Each slice owns its product change, its outside-in proof, and its cleanup.
Test at the existing boundary and page seams, and add no product test hook.
The quiet reporter needs silent passing journeys. Clear the conflicting color
variables, and `NODE_ENV` in a session the dashboard launched. Execution
follows the installed post-change-refactoring and delivery workflow. The
local commit gate is the check-only `.githooks/pre-commit`, which runs `npm
run --silent lint -- --staged`. Hosted checks stay with execution's
publication and CI workflow.

No numeric slice target, hard limit, or S/M/L bands were supplied. Each slice
has one proof loop. Slice 3 reaches the most existing assertions, because
many specs assert the limit wording. If execution disproves an observed
premise or a slice's boundedness, stop safely and revise the remaining plan
within the same outcome. Story-boundary changes stay with Terry.
