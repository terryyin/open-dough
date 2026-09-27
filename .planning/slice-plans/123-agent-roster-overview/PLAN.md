# See all project agents, their commissions, and human partners

## Source

**Identity:** SEED-049#project-agent-roster

[Refined story](../../seeds/SEED-049-project-agent-roster.md#project-agent-roster).
The maintainer authorized story refinement and slice planning, with plan
refinement if needed. This instruction does not authorize implementation.

## Goal and scope

A developer can open the selected project's 29-agent roster from an agent
portrait, read each current published commission and its human developer,
and return to the same story dashboard context. The existing Taken and
Preparing cards also show the credited human's name and cached GitHub avatar.

Included: current published profiles, their task titles/identities, activity,
recorded host/model, the commission's profile-addition commit, and explicit
uncertainty. The roster is one view of the selected project's pinned snapshot;
it does not independently decide assignment state.

Deferred: historical commissions, a cross-project roster, live status, local
worktree state, assignment controls, a people directory, and new agent or
project registration. Existing agent portraits and rotation are retained.

## Outside-in proof

| Promise | Owning slice and observable proof |
| --- | --- |
| An agent portrait opens the selected project's 29-agent roster and Back restores the prior story reading context | 1: Playwright card-to-roster-to-Back journey, including keyboard focus and a selected story detail |
| Each current commission shows its task, activity, recorded host/model; absent and unreadable evidence stay distinct | 1: published-profile fixture with Taken, Preparing, absent, missing-field, and unreadable cases |
| The human name belongs to the current profile allocation's addition commit, and appears on the roster and existing cards | 2: fake GitHub commit history with an older allocation and a later modification, verifying the chosen addition and pinned revision |
| A matched GitHub account supplies a cached avatar without a browser-to-GitHub read; unmatched or failed attribution remains textual and honest | 3: local boundary and browser journey with repeated avatar use, a missing account, a failed image, and project/revision switch |

## Current decisions and existing solution

- **Existing solutions (PFE).** The shared agent-profile reader owns the
  rotation and profile interpretation. `dashboard/src/agentAssignments.ts`
  already reads profiles at the selected revision and attaches assignments
  to stories; expose those same interpreted facts to the roster rather than
  parse profiles again. `AgentAssignmentFacts.tsx` owns the portrait atlas,
  host labels, and model gaps; reuse those display facts. `WorkStages.tsx`
  owns selected story detail; keep that reading state when the roster opens
  and closes. The `dashboard/server/` authenticated boundary already pins
  GitHub reads to a catalog source and revision and owns cancellation and
  failure wording; extend it for attribution and image delivery instead of
  adding a direct browser API path.
- **Commission meaning.** A readable current preparation or execution
  profile is a commission; lack of a profile means not commissioned only
  after a successful profile-directory read. An unreadable profile or failed
  read is unknown. If the profile names work absent from the readable backlog,
  show its recorded identity and a title gap. Neither a profile nor an avatar
  implies live presence.
- **Human attribution.** For each current profile path at the selected
  revision, inspect its path-filtered commit history until the current
  allocation's `added` commit is found. Use that commit's Git committer name;
  use its matched GitHub committer account for the avatar. An older allocation
  of the same rotating agent name, a later profile modification, or another
  work commit cannot supply this commission's human. A missing addition,
  unusable name, or failed lookup gives an explicit attribution gap.
- **Avatar boundary.** Fetch an avatar only for the GitHub account matched
  to that addition commit. Serve it through a narrow same-origin endpoint and
  cache the image in the local dashboard process, keyed by that account;
  validate the remote image source and bound the image response. A failed or
  absent avatar leaves the human name as text. The cache is disposable and
  never becomes an assignment or identity authority.
- **Source evidence.** GitHub's [List commits](https://docs.github.com/en/rest/commits/commits#list-commits)
  supports `sha` and `path`; [Get a commit](https://docs.github.com/en/rest/commits/commits#get-a-commit)
  reports changed-file status and Git and GitHub committer fields. On
  2026-09-27, `gh api repos/terryyin/open-dough/commits/e4b90f722e864802d5bdcc46688b6a80964343a9`
  returned `status: added` for `.planning/agents/mihiro-chan.json`, Git
  committer name `Terry Yin`, a matched account, and an avatar URL. The
  path-filtered list at that SHA returned this addition before older changes
  to the same rotating name. This is a representative source proof, not a
  production lookup rule based on that one commit.
- **Relevant direction.** [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  keeps workflow facts in authoritative repository records and dashboard
  views derived from published evidence. [The dashboard North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
  keeps profile interpretation shared and catalog GitHub access behind the
  local boundary. Proposed ADR 0008 is not an accepted constraint.

## Ordered slices

### 1. A portrait opens the project roster and returns to the story
Type: Behavior
Status: done
Accepted proof: `npm run test:dashboard -- agent-roster.spec.ts` (fixtures in
`dashboard/tests/agentRosterRecords.ts`) plus the card specs
`taken-agent-profile*.spec.ts` and `backlog-preparing.spec.ts`. The roster is
`commissionRoster.ts` over the single commission list that also feeds cards.
Back after switching project while the roster is open shows the newly
selected project's stories, as key example 4 requires.
Proof: A Playwright journey from Taken and Preparing cards opens a roster
with all 29 named portraits, identifies the clicked agent, and shows the
  selected project's published task, activity, and recorded host/model. It
  distinguishes no profile, a missing task title or host/model, unreadable
  profile, and a failed profile read; no row claims an agent is online. The
  top Back control returns to the prior project and open story detail with
  focus in a useful place.
Existing Taken/Preparing portrait and card tests remain green.

Behavior: A selected project has a pinned snapshot and a card with an agent
portrait → the developer activates the portrait → a roster derived from that
snapshot opens with the agent identified and current commissions readable;
Back returns to the same story reading context. Project switching replaces
the roster's source rather than mixing two projects' assignments.

### 2. The current commission names its credited human
Type: Behavior
Status: done
Accepted proof: `npm run test:dashboard -- agent-roster-attribution.spec.ts
authenticated-read-profile-addition.spec.ts` (fixtures in
`dashboard/tests/agentAttributionRecords.ts`). The boundary's `committed=added`
read walks at most ten path-filtered commits back from the pinned revision and
stops at the first `added`; a removal, rename, or unclassified change ends the
walk with a no-addition gap. The matched `login` reaches the page for slice 3.
Proof: The dashboard browser test's fake GitHub serves a profile history
with `added`, `modified`, and an older allocation. The local boundary reads
the current addition at the pinned revision, and the roster plus Taken or
Preparing card show its Git committer name, not the modifier's or older
allocation's name. A profile lacking a verifiable addition or a failed commit
read shows an attribution gap. Boundary tests refuse arbitrary paths,
repositories, and unpinned requests; switching project or revision cannot
attach an old result to a new allocation.

Behavior: A current published profile has an addition commit → the dashboard
reads that commission's attribution → the human developer's supported name
appears beside the agent on the roster and existing story card. A missing or
uncertain attribution is named without guessing from other commits.

### 3. A matched human has a cached GitHub avatar
Type: Behavior
Status: done
Accepted proof: `npm run test:dashboard -- agent-roster-avatar.spec.ts
authenticated-avatar.spec.ts` (fixtures in `dashboard/tests/agentAvatarRecords.ts`).
The browser names only a listed profile at a pinned revision; the boundary
derives the matched login and a validated `avatars.githubusercontent.com`
source, fetches once per login with size, time, type, and redirect bounds, and
keeps no failure. On 2026-09-27 the real host answered this repository's
committer avatar at `/u/<id>?v=4&s=64` with `200 image/jpeg` and no redirect.
Proof: A local-boundary and Playwright journey serves one matched account's
avatar for repeated card and roster use, proving one upstream image read and
no browser request to GitHub. The image is displayed beside its human name.
An unmatched account, rejected image source, or failed image fetch leaves the
name and a visible text fallback; a later project/revision change never
reuses attribution from another allocation. Existing source-access and
project-isolation checks remain green.

Behavior: GitHub matches the commission's human committer to an account with
an avatar → the dashboard obtains and caches that image through its local
boundary → the roster and story card display it beside the supported name.
Without a usable image, the name remains readable.

## Learnings

- `sliceClockStart.ts` dates a Take from its profile's latest commit, while
  attribution uses the allocation's addition; a modified profile would restart
  the slice clock. Left unchanged here as a separate behavior decision.
- A profile added through GitHub's web UI or a squash merge has committer
  `GitHub` (`web-flow`) and would be credited as the human. Open Dough's own
  claim commits are pushed directly, so this story keeps the committer rule.
- Chromium reuses an image URL within a document despite `no-store`; proving a
  server-side image cache needs distinct URLs that share one cache key.

## Execution complete

Product advice: Queue the correction
[SEED-049#roster-evidence-correction](../../seeds/SEED-049-project-agent-roster.md#roster-evidence-correction)
([plan 125](../125-roster-evidence-correction/PLAN.md)) near the top: it fixes a
false "Not commissioned" for a mismatched profile, slice clocks held back by
human attribution, and a roster stuck on "reading" after a failed read. At
wrap-up, assimilate the roster, commission, and credited human into
`.planning/NORTH-STAR.md`. Consider exploring the planned dashboard unit-test
layer so detailed boundary rules (avatar source validation, the addition walk)
need not be proved only through browser and HTTP specs.
