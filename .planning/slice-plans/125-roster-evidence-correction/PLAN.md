# Keep roster and human credit honest under slow or odd evidence

## Source

**Identity:** SEED-049#roster-evidence-correction

[Correction story](../../seeds/SEED-049-project-agent-roster.md#roster-evidence-correction),
from the execution retrospective of plan 123 (SEED-049#project-agent-roster),
whose story and plan are recoverable at commit `74e2a91` under
`.planning/seeds/SEED-049-project-agent-roster.md#project-agent-roster` and
`.planning/slice-plans/123-agent-roster-overview/PLAN.md`.
Reviewed commits, all on `claude/123-agent-roster-overview`: `78a0fbb`
(roster view), `37694d1` (human attribution from the profile's addition
commit), `279132f` (cached avatar); claim `0d1c694`. Planning provenance
`0f6d640`. The review used the uncontaminated net diff `0d1c694..279132f`.

## Goal and scope

Correct the delivered roster, human credit, and avatar so that slow, odd, or
missing evidence is shown honestly and promptly, with one allocation rule and
a suite without repeated proof. Preserve every promise of the reviewed story:
the 29-agent roster from a portrait, Back to the same reading context,
commission facts and their distinct gaps, the human named by the
current allocation's addition commit, and the cached avatar through the local
boundary with a text fallback.

Excluded: a dashboard unit-test layer (none exists; `docs/dashboard-tech-stack.md`
plans one), live presence, historical commissions, and any new roster feature.

## Current findings

1. **Attribution delays clocks and can fail the read.** `dashboard/src/publishedWork.ts`
   joins `await attributed` with `withSliceClocks` in one final snapshot, so
   slice clocks wait for every profile's addition walk. When the shared 30 s
   bound fires during that wait, `bound.throwIfAborted()` reports the whole
   read as "GitHub did not answer within 30 seconds" although everything else
   was read.
2. **A mismatched profile yields a false negative.** The dashboard's
   `interpretProfiles` (`dashboard/src/agentAssignments.ts`) files a commission
   under the agent named inside the profile. `agent-assignments.mjs` treats a
   profile whose text names another agent than its file as unrecognized, and
   its name as held. A `yui-chan.json` naming Mio shows Yui "Not commissioned"
   and gives Mio a phantom commission; the story requires conflicting evidence to
   stay uncertain.
3. **An unread snapshot shows a perpetual "reading" roster.** After a project
   switch whose read fails before membership, `AgentRoster.tsx` says no
   published work was read, yet every row says "Reading agent profile…", and
   the "Opened from its portrait" mark carries to the other project.
4. **Two rules date one allocation.** The slice clock dates a Take from the
   profile's latest commit (`committed=last`, `sliceClockStart.ts`,
   `reachablePaths.ts` profile branch), while attribution walks to its
   addition (`ghProfileAddition.ts`); `agent-assignments.mjs` `profileAllocation`
   is the Git-side rule (most recent addition). No current flow modifies a
   profile, so the dates agree today, but ADR 0002's one-authoritative-rule
   principle is split, and each Taken profile costs an extra `gh` request.
5. **The avatar cache ignores a changed source.** `AvatarImages` keys by login,
   so a new avatar version stays stale for the process's life, and a renamed
   then reused login could show another account's image.
6. **Vocabulary drift.** Cards say "Preparation assignment unknown" and
   "Conflicting records: N preparation assignments"; the roster says
   "Commission unknown/uncertain" and "Not commissioned"; code mixes
   `Commission` with `AgentAssignment`/`ProfileAssignments`. The roster and
   credit gaps reuse the `preparation-problem` class. The UX North Star
   Developer row has no entry for roster, commission, or credited human.
   Branch-scoped addition reads are refused with "A commit time read names
   only…".
7. **Repeated or noisy proof.** `agent-roster-attribution.spec.ts` is largely a
   subset of `agent-roster-avatar.spec.ts` (Akiho/Kirara, reallocation, project
   switch), and its walk-call step repeats `authenticated-read-profile-addition.spec.ts`.
   `authenticated-avatar.spec.ts` repeats shared refusals (non-profile path,
   moving ref, other repository). `agent-roster.spec.ts` re-proves host/model
   gap strings owned by `taken-agent-profile.spec.ts` and
   `backlog-preparing.spec.ts`. Three roster specs redefine the same member/opener/Back
   locators; the Akiho history fixtures are near-copies. Older card journeys
   now issue unserved `committed=added` reads and render "Human developer
   unknown…" noise. The walk limit, `changed` status, and a path missing from a
   commit's files are untested, and the fake ignores `per_page`.
   `dashboard/tests/README.md` misses `authenticated-avatar.spec.ts`;
   `dashboard/README.md` is 251 lines.

## Outside-in proof

| Correction outcome | Owning slice and observable proof |
| --- | --- |
| Clocks appear without waiting for attribution; slow attribution never fails the read | 1: Playwright step holding a commit read: the slice clock shows while the human reads "Reading human developer…", and a later answer fills the name without a read problem |
| A profile naming another agent than its file is uncertain for that name and credits no one else | 2: roster fixture plus the script's existing `node --test` suite through one shared check |
| A roster without a readable snapshot says commissions are unknown | 3: Playwright project switch to a failing backlog read |
| One allocation rule dates the Take and names the human | 4: `taken-slice-clock.spec.ts` and the attribution journey unchanged in outcome, with one fewer `gh` request per Taken profile |
| A changed avatar source is fetched afresh | 5: boundary spec with a changed `v=` for the same login |
| One vocabulary across cards, roster, code, and the UX North Star | 6: chosen wording asserted on cards and roster |
| A lean, noise-free suite | 7: consolidated specs keep their named surviving coverage; whole dashboard suite green |

## Current decisions

- Keep plan 123's decisions (recoverable as above): commission meaning, human credit from the current
  allocation's addition commit's Git committer, and the avatar boundary.
- The shared profile-name check lives in
  `src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs`
  and is used by both `agent-assignments.mjs` and the dashboard's
  `interpretProfiles`; a mismatch is an unreadable profile for the file's
  rotation name.
- Attribution is its own later partial of the same pinned read; its failures and
  latency stay per profile.
- Execution decision (slice 4): a Taken card's clock and its human come from
  the same per-snapshot addition read of its profile, so that clock waits only
  for its own profile's addition, never for other profiles' credit. Slice 1's
  held-addition proof moves to a Preparing profile's addition; holding the
  Taken profile's addition leaves its clock and human reading until both fill,
  and a walk unanswered at the bound is that clock's and that human's gap,
  never the snapshot's read problem. A profile whose walk finds no addition
  (more than the walk limit of changes, or a removal first) leaves the Take's
  time a gap; no current flow modifies a profile. Each clock is
  a later detail of the read: any of its reads still unanswered at the bound,
  including its plan's last commit, is that clock's gap, and clocks appear one
  by one instead of waiting for the slowest.
- Execution chooses the single vocabulary (commission or assignment) and applies
  it to UI text, code identifiers, the gap CSS class, and the UX North Star, keeping
  wording consistent across surfaces.

## Ordered slices

### 1. Clocks do not wait for human credit
Type: Behavior
Status: done
Proof: A Playwright step in the roster attribution/avatar journey holds one
commit read: the Taken card's slice clock is shown while its human reads
"Reading human developer…"; releasing the read fills the name. A walk that
outlasts the read bound leaves that human's gap without reporting the
snapshot's read problem. Existing clock and attribution specs stay green.

Behavior: A snapshot's clocks are read and a profile's addition walk is slow →
the page shows the clocked snapshot first → the human appears when its walk
ends, and a walk that never ends is that human's gap, not the read's failure.

Accepted proof: `npx playwright test --config dashboard/playwright.config.ts
dashboard/tests/agent-roster-attribution.spec.ts` — tests "a slow human credit
never holds back the Taken card's slice clock…" (clock shown while
`.owner-human` reads "Reading human developer…", then the name with no read
problem) and "a human's addition walk still unanswered at the wait bound…"
(that human's gap, no read problem); both red against the prior read. Whole
`npm run test:dashboard` green. The snapshot read moved to
`dashboard/src/publishedWorkRead.ts`; the bound wording is shared as
`unansweredWithinReadWait`. Slice 7 carries these two tests into the merged
roster avatar spec.

### 2. A profile naming another agent stays uncertain
Type: Behavior
Status: done
Proof: A roster fixture with `yui-chan.json` naming Mio shows Yui's profile as
unreadable ("names another agent") and Mio with no commission from it; the
"Conflicting records" branch, reachable only through this mismatch, is removed
if no longer reachable. The execution scripts' existing `node --test` checks of
occupied names stay green through the shared check.

Behavior: A published profile's text names another agent than its file → the
roster and cards treat it as unreadable for the file's name → no rotation name
is called not commissioned on contrary evidence, and no other agent gains a
commission.

Accepted proof: `agent-roster.spec.ts` "a card's agent portrait opens the
project's agent roster…" with `yui-chan.json` naming Sola (Mio is no rotation
name, so it was already unreadable): Yui shows the "names another agent" gap,
Sola stays not commissioned, and the queued card shows no conflict; red against
the prior reader. `node --test tests/support/product-backlog-agent-profile.test.mjs`
proves `parseAgentProfileFile`, now used by `occupiedAssignments`,
`interpretProfiles`, and the lost-workspace check. The roster's conflict
branch is gone and a roster member holds at most one profile; the card's
conflict for two agents naming one entry stays.

### 3. A roster without a read snapshot says commissions are unknown
Type: Behavior
Status: done
Proof: `agent-roster.spec.ts` switches, with the roster open, to a project whose
backlog read fails: every row says the commission is unknown with the read's
reason, none says "Reading agent profile…", and no row is marked as opened
from its portrait. Back returns to that project's stories.

Behavior: The roster is open and the selected project's snapshot is unread or
failed → the roster says why no commission is known → Back behaves as before.

Accepted proof: `agent-roster.spec.ts` step "selecting a project whose backlog
cannot be read says why no commission is known, and marks no agent as opened":
all 29 rows say "Commission unknown." with the read's problem, none says
"Reading agent profile…", no row is marked opened from its portrait, and Back
shows that project's read problem; red against the prior roster. The roster
opening is one `{agent, element, sourceId, work}` record in `App.tsx`; a
project with no published files fakes an unreadable backlog.

### 4. One allocation rule dates the Take and names the human
Type: Structure
Status: done
Proof: The `committed=added` answer also carries the addition commit's
committer date; one addition read per profile per snapshot read feeds both the
Take's slice clock and its human. The profile branch of
`commitTimeReachableFromRevision` and the profile use of `committed=last` are
removed. `taken-slice-clock.spec.ts` keeps its outcomes with per-commit fixture
dates; slice 1's journey holds a Preparing profile's addition to show clocks do
not wait for other credit, and holding the Taken profile's addition leaves its
clock and human reading, then both fill, with the bound leaving gaps and no read
problem. A request-count assertion shows one fewer `gh` request per Taken
profile. Boundary refusals stay green.

Correction: removes the split allocation rule (finding 4) under ADR 0002; the
Taken clock now waits for its own profile's addition read, per the execution
decision above.

Accepted proof: the `committed=added` answer carries `committedAt`; one
`profileAdditionsAt` memo per snapshot read feeds each commission's human and
each Taken card's clock; `commitTimeReachableFromRevision` and the profile
`committed=last` read are gone. `taken-slice-clock.spec.ts` keeps its
outcomes and its request-list step shows two `gh` requests per Taken profile
(was three). `profile-addition-latency.spec.ts` (split from the attribution
spec): another profile's held addition never holds back a Taken clock; a held
Taken addition keeps only that card's clock and human reading until both fill;
the bound leaves their gaps and no read problem. Boundary refusals green;
whole `npm run test:dashboard` 150/150. Gap wording for a later detail lives
in `detailGapProblem` (`readWaitBound.ts`).

### 5. A changed avatar is fetched afresh
Type: Behavior
Status: done
Proof: `authenticated-avatar.spec.ts` serves one login whose validated source
changes version between two revisions: the second read fetches the new image
once; repeats of each source are served from the process without upstream
reads.

Behavior: The credited account's avatar source changes → the next display
fetches that source → no image of an earlier source or another account is
reused under the same login.

Accepted proof: `authenticated-avatar.spec.ts` "fetches a changed avatar source
afresh under the same login, and keeps each source": two revisions credit the
same login with `v=4` then `v=5`; the later read returns the newer image
through exactly one new upstream read, and repeats of each revision return
their own image without upstream reads; red against login keying.
`AvatarImages` keys by the validated source; fixtures live in
`authenticatedAvatarRecords.ts`.

### 6. Cards and roster speak one commission vocabulary
Type: Behavior
Status: done
Proof: The card and roster journeys assert the chosen wording for unknown,
conflicting, and absent commissions and for the credited human's gaps; code
identifiers and the gap CSS class use the same term; the UX North Star gains
rows for the roster, commission, credited human, and avatar-not-presence; the
branch-scoped addition refusal names the addition read.

Behavior: A developer reads a commission gap on a card and on the roster → both
use the same term and the North Star describes it → no surface calls one
concept by two names.

Accepted proof: the one term is "assignment" (ADR 0008's "Developer
assignment", the tech-stack domain names, the North Star Developer row, and
the `preparation-assignment` CLI already used it; "commission" was only plan
123's roster). `agent-roster.spec.ts` asserts "Assignment uncertain…", "No
assignment recorded", and "Assignment unknown…" through `.assignment-gap`;
`backlog-preparing.spec.ts` asserts "Preparation assignment unknown…" and
"Conflicting records: 2 preparation assignments name this entry." through the
same class; the attribution journey asserts the human's gap with it;
`authenticated-read-profile-addition.spec.ts` refuses a branch-scoped
addition read as "An addition read names only…". Identifiers and modules use
assignment (`assignmentRoster.ts`, `assignmentAttribution.ts`), and the North
Star gains "Agent roster / Assignment" and "Credited human / Human avatar"
rows. Whole `npm run test:dashboard` 151 green.

### 7. The roster suite proves each behavior once, without noise
Type: Structure
Status: planned
Proof: Each consolidation names its surviving coverage:
- merge `agent-roster-attribution.spec.ts` into `agent-roster-avatar.spec.ts`
  (move its no-addition and failed-history steps; drop the walk-call step
  covered by `authenticated-read-profile-addition.spec.ts`);
- drop the avatar spec's shared refusals covered by the profile-addition spec,
  keeping avatar-specific refusals;
- keep one recorded summary and the title gap in `agent-roster.spec.ts`,
  leaving host/model gap wording to the card specs;
- share roster locators in `dashboardPage.ts` and the Akiho history fixture;
- give published fixtures a default one-commit `added` history so older card
  journeys stop rendering attribution-failure noise;
- make the fake honor `per_page` and add boundary cases for the walk limit,
  `changed`, and a path missing from a commit's files;
- update `dashboard/tests/README.md` and bring `dashboard/README.md` within
  250 lines.
The whole `npm run test:dashboard` stays green.

Correction: removes repeated proof, fixture duplication, and older journeys'
attribution noise (finding 7) with no product behavior change.

## Learnings

- Readers that still use plain `parseAgentProfile` with a known file name,
  where switching would change behavior and was left for a later decision:
  `addedProfile` (the execution claim does not check the name),
  `releaseAgentProfiles` (removes a misfiled profile at completion), and
  `dashboard/server/branchReachability.ts` (a misfiled Story Branch profile
  still makes its branch readable).
