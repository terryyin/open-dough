# Follow a story's progress where it is published

Status: planned.

## Source

**Identity:** SEED-021#follow-published-story-branch

Story 3 in
[SEED-021](../../seeds/SEED-021-observe-published-story-progress.md#follow-published-story-branch),
refined with Terry on 2026-09-24. The seed owns goal, scope, key examples, and
deferred promises; this plan restates only what the slices need.

## Goal and scope

Each Taken card shows a slice progress bar and how long the current slice has
been running, from the plan at the ref where that story's progress is
published: remote trunk, or the story branch its published agent profile
records. Branch progress names the branch and revision and says it is not in
trunk. The automatic check watches every published branch head. Plans with a
`## Slices` heading become readable.

Excluded (seed deferred promises): manual branch selection, branch commit
lists, diffs, ahead/behind, CI or merge-readiness, reading seeds, backlog, or
new plans from branches, progress for stories that are not Taken,
time-remaining estimates, new slice statuses, and the completion and
product-learning signal (story 5).

Facts from the delivered agent profiles (on trunk since `6fe5a15`,
2026-09-24; behavior in
[project visibility requirements](../../../docs/project-visibility-requirements.md#agent-profiles-and-rotating-names)):

- A profile is `.planning/agents/<lowercase name>-chan.json` beside the
  backlog, with `schemaVersion`, `agent`, `email`, `identity`, `mode`
  (`trunk` or `story-branch`), `branch`, and optional `host` and `model`.
  `branch` is the owned execution branch in Story Branch Mode (the same name
  is pushed to origin) and `<remote>/<trunk>`, for example `origin/main`, in
  Trunk Mode. The pure module
  `src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs`
  owns that spelling (`parseAgentProfile`, `agentIdentity`,
  `agentProfileDirectory`, `profileAgentName`); use it, not this text.
- The dashboard already reads profiles at the pinned revision: the
  `agents=profiles` request kind (`dashboard/server/requestedRead.ts`), the
  listing and allowlist (`dashboard/server/ghContents.ts`,
  `listedAgentProfilePaths` in `reachablePaths.ts`), `readAgentProfilesAt` in
  `dashboard/src/authenticatedRead.ts`, and `dashboard/src/takenOwner.ts`,
  which puts each Taken entry's `owner` (`recorded` with owners, or
  `not-recorded`, `unavailable`, `loading`) on `WorkEntry`. Unreadable
  profiles match no entry. Slices 3 to 5 take mode and branch from that owner
  and add no second profile read or interpretation.
- A profile is added in its Take commit and never rewritten: resume reuses
  it, and a lost publication race rebuilds the Take as one new commit. The
  Take commit is authored by the agent and committed by the configured user,
  so the committer date is the Take time. Completion deletes the profile with
  the Taken entry.
- Slice commits update the plan in the same commit, but other execution
  commits may not (the CI repair `ff33cb8` in plan 091 did not), so the plan's
  last commit time at a ref marks the last recorded plan update. The plan
  format is not changed.
- Dashboard fakes that do not publish profiles currently answer the agents
  listing with `noConnection`, so older journeys show "Agent profiles could
  not be read." on Taken cards. Correction plan
  `quick/093-tighten-agent-profile-take/PLAN.md`, queued first, makes them
  answer like a project without profiles. New specs here publish profiles
  explicitly with `renderAgentProfile`, as
  `dashboard/tests/taken-agent-profile.spec.ts` does.

## Outside-in proof

| Key example (seed) | Slice | Observation |
| --- | --- | --- |
| A published plan under `## Slices` is read like `## Ordered slices`; a non-`planned`/`done` status stays uninterpretable | 1 | Plan-reader unit cases; dashboard detail shows slice progress for a `## Slices` plan |
| Taken card shows a segmented bar and "N of M slices recorded done"; absent or uninterpretable plans show their gap on the card | 2 | Playwright spec against fake GitHub |
| Trunk Mode slice-2 commit 12 min ago → "current slice running for 12 min", advancing with page time | 3 | Playwright with paused page clock and fake commit history |
| Taken 5 min ago, plan last committed two days earlier → clock measured from the Take | 3 | Same spec, profile commit newer than plan commit |
| Entry without a profile → clock from the plan commit, labelled as such; commit time unavailable → gap | 3 | Same spec |
| Story Branch Mode profile → bar and clock from the branch plan, branch and revision named, "not in trunk"; trunk copy's count not shown as progress | 4 | Playwright spec with fake branch refs |
| No profile → trunk copy labelled, execution branch not recorded; more than one profile for the story → ambiguous-owner gap; branch no longer published, plan missing or uninterpretable on the branch → each shown as that gap, no trunk fallback | 4 | Same spec |
| New slice commit on the recorded branch while trunk is still → new count and restarted clock within the check pace, no Refresh | 5 | Auto-refresh spec stepping page time; gh call log |
| An unrelated branch moves → no further reads; trunk moves → existing full read | 5 | Same spec, call log |

## Current decisions

- **One progress rule for both modes.** A Taken story's progress source is a
  ref: trunk's shown revision in Trunk Mode (and for entries whose plan is
  associated on trunk without a Story Branch profile), or the recorded branch
  head in Story Branch Mode. The bar, clock, and gaps are computed once from
  "plan text, plan commit time, and Take time at a source"; the branch case
  only supplies a different ref and adds the branch label. No second slice
  interpretation or branch-specific card.
- **Shared reader owns plan meaning.** The `## Slices` compatibility lives in
  `product-backlog-plan-reader.mjs`, per the North Star topic
  [One backlog interpretation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation):
  a bounded compatibility change there, never a dashboard grammar. Its only
  callers are the dashboard and its own tests.
- **Read boundary stays an allowlist.** New reads are authorized only through
  the pinned trunk revision's records: the backlog names the Taken entry, its
  story-state names the plan path, its trunk profile names the branch. The
  server re-derives that branch through `listedAgentProfilePaths` and
  `parseAgentProfile` at the pinned revision. The
  browser never supplies a branch name or path the server has not derived
  that way. Commit-time reads use the same reachability as file reads.
- **Commit times come from GitHub's commit list for a path at a ref**
  (`repos/<repo>/commits?sha=<sha>&path=<path>&per_page=1`, committer date),
  pinned per sha and path like other pinned texts. Verified on 2026-09-24
  against `terryyin/pygardon` at `story/retire-remote-distribution`.
- **All-branch watch is one conditional listing.** The revision check asks
  `repos/<repo>/git/matching-refs/heads/` with the previous ETag instead of
  the trunk ref alone. Verified on 2026-09-24: Doughnut answers 86 heads in one
  response; Pygardon repeated with `If-None-Match` answers `304 Not Modified`.
  The check reports trunk's head and the heads of branches recorded by the
  shown Taken profiles; only a change in those triggers reads.
- **The clock ticks in the page.** Elapsed time is computed from the read
  commit time and the page clock; ticking makes no request.

## Ordered slices

### 1. Plans under a `## Slices` heading are readable

Type: Behavior
Status: done
Proof: new cases in `tests/support/product-backlog-plan-reader.test.mjs`
(`## Slices` interpreted with the same slices as `## Ordered slices`; a
`Status: merged into slice 1` still uninterpretable; a plan with neither
heading still refused); one dashboard detail journey serving a `## Slices`
plan shows "N of M recorded complete" via
`npm run test:dashboard -- --grep '<journey>'`; `tests/product-backlog.sh`.

Behavior: a published plan whose slices sit under `## Slices` → dashboard
detail opens → recorded slice progress is shown instead of "uninterpretable".
Accepted: `slicesSection` in `product-backlog-plan-reader.mjs` accepts both
headings; `node --test tests/support/product-backlog-plan-reader.test.mjs`
(5/5, `## Slices` deep-equals `## Ordered slices`; merged status and neither
heading stay uninterpretable); `npm run test:dashboard -- story-readiness`
(6/6, including `story-readiness-slices-heading.spec.ts` "2 of 5 recorded
complete"); `tests/product-backlog.sh` with Bash 5; dashboard typecheck.

### 2. Taken cards show a slice progress bar

Type: Behavior
Status: done
Proof: new `dashboard/tests/taken-slice-progress.spec.ts` via
`npm run test:dashboard -- taken-slice-progress`: a Taken entry with a plan of
3 slices, 1 done, shows three segments, one filled, and "1 of 3 slices
recorded done" with an accessible name; a Taken entry without a plan shows the
existing "no associated plan" gap; an uninterpretable plan shows its gap on
the card; a queued (not Taken) planned entry shows no bar.
`npm run typecheck:dashboard`.

Behavior: a published snapshot with Taken entries → load or refresh → each
Taken card shows its bar and count from the already-read trunk plan, or its
gap. The detail slice list is unchanged.
Accepted: `SliceProgress` (`dashboard/src/SliceProgress.tsx`) renders the
card bar from the snapshot's `entry.planSlices`, with `PlanSlicesNote` as the
one wording for loading and gaps, shared with the detail;
`npm run test:dashboard -- taken-slice-progress story-readiness` (7/7);
full `npm run test:dashboard` 96/96 before refactor; dashboard typecheck.

### 3. Taken cards show how long the current slice has been running

Type: Behavior
Status: done
Proof: extend `taken-slice-progress.spec.ts` with the fake GitHub answering
commit-list requests for a path at a sha and the page clock paused (reuse
`autoRefreshJourney.ts` helpers): plan committed 12 min before page time after
a 30 min old Take → "current slice running for 12 min", then 60 s more of page
time shows 13 min with no new `gh` call; plan committed two days ago, Take
5 min ago → 5 min; no profile → measured from the plan commit and labelled so;
commit list fails → a clock gap while the bar stays. Boundary refusal case in
`authenticated-read-boundary.spec.ts`: a commit-time request for a path not
reachable from the pinned revision is refused before any `gh` call.

Behavior: a Taken entry with a readable plan → load → the card shows elapsed
time since the later of the plan's last commit and the Take at the source ref,
advancing with page time.

Adds a commit-time read kind to `requestedRead.ts`, `ghRead.ts`, and the
browser reader, with the same reachability as `file-at` plus the Taken entry's
profile path.

Accepted: `commit-time-at` read (`committed=last`) in `requestedRead.ts`,
`performedRead.ts`, `ghRead.ts`, pinned per revision and path, reachable as
`file-at` plus listed profiles (`commitTimeReachableFromRevision`);
`sliceClockStart.ts` starts at the later of the counted plan's last commit and
the single recorded profile's Take; `not-recorded` owners use the labelled
plan commit, while unreadable or multiple profiles are clock gaps;
`SliceClock.tsx` ticks with page time. `taken-slice-clock.spec.ts` and
`authenticated-read-boundary.spec.ts`; full `npm run test:dashboard` 99/99;
dashboard typecheck.

### 4. Story Branch Mode progress comes from the recorded branch

Type: Behavior
Status: planned
Proof: new `dashboard/tests/branch-slice-progress.spec.ts` via
`npm run test:dashboard -- branch-slice-progress`, fake GitHub serving trunk
and a `story/example` branch head: trunk plan 0 of 8, branch plan 6 of 8 under
`## Slices` → card shows 6 of 8, the branch name and short revision, and "not
in trunk", and does not show 0 of 8 as progress; clock uses the branch plan's
commit time; Trunk Mode profile → trunk source with no label (slices 2 and 3 unchanged);
Taken entry without a profile, with a similarly named branch published → trunk
plan labelled "trunk copy; execution branch not recorded" and no `gh` call for
that branch; two readable profiles naming the entry → the
ambiguous-owner gap and no branch read; recorded branch absent → "branch no
longer published" and no bar; plan missing on the branch → that gap; plan
uninterpretable on the branch → that gap. Boundary refusal case: a branch not
named by any Taken profile at the pinned trunk revision is refused before any
`gh` call. `npm run typecheck:dashboard`.

Behavior: a Taken entry whose trunk profile records Story Branch Mode → load or
Refresh → the server resolves that branch's head, the card's bar and clock
come from the plan at that head with the branch label, or the specific gap is
shown.

### 5. The automatic check follows every published branch

Type: Behavior
Status: planned
Proof: new `dashboard/tests/auto-refresh-branches.spec.ts` stepping page time
with `autoRefreshJourney.ts`: branch head moves while trunk stays → within the
check pace the card shows the new count and a restarted clock, with reads only
of that branch's plan and its commit time; an unrelated branch moves → the
next check reads nothing further; trunk moves → the existing full read;
repeated check with nothing moved answers from the `304` and reads nothing;
recorded branch deleted → the next check shows "branch no longer published".
Existing `auto-refresh*.spec.ts` stay green with the listing replacing the
trunk-only ref check (update `refCheckArgv`/`refChecks` in
`autoRefreshJourney.ts` to the listing argv). `npm run typecheck:dashboard`.

Behavior: a shown snapshot with Story Branch Mode Taken entries → page time
passes → the conditional branch listing detects a moved recorded branch and
re-reads only that progress; hidden-page and rate-limit behavior are
unchanged.

## Promise ownership

Every seed scope bullet maps to the table under Outside-in proof: readable
plans (1), progress bar (2), current-slice clock (3), progress source and
branch label and gaps (4), active watch of all branches (5). The deferred
promises have no slice.

## Learnings
