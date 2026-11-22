# Reopen completed ad hoc work and its follow-ups under one identity

**Identity:** SEED-420#review-standalone-done-work
**Source:** [Reopen completed ad hoc work and its follow-ups under one identity](../../seeds/SEED-420-unified-intent-review.md#review-standalone-done-work)

## Goal and scope

When an ad hoc session with no story is marked Done, a Done story is created
and the session is attached to it. Later follow-ups join that story, on this
machine and, once Land publishes, on any clone. The seed holds the full scope,
exclusions and key examples. This plan carries them without enlarging them.

**Supplier.** The recorded dependency on
[SEED-418#attribute-every-workflow-session-record](../../seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record)
supplies published ad hoc and follow-up session records. Each record carries
its UUID, sealed close time, comparisons and story identity. That story also
delivers retry recovery. Slices 1 and 5 extend that contract. They do not
define the record's story field or the close sealing a second time.

**Excluded** (seed): session selection in the review, the Intent review
destination, follow-up context choices, card cues for open follow-ups, and
bulk migration of older standalone records.

## Key examples and proof

| Example (seed) | Proof owner |
| --- | --- |
| `A` lands with no story → Done story `ad-hoc#<A>` with `A`; another clone sees it | Slice 1 (publication), slice 5 (other clone) |
| Repeated Done, lost response, reported and manual Done racing → one story, one record of `A` | Slice 1 (Land retry), slice 2 (local Done) |
| Follow up from that story → `B` with its own UUID; `B` Done → one card listing `A` and `B` | Slice 4 |
| Follow-up of a Taken story marked Done → stays under that story, which stays Taken | Slice 2 (preserved association) |
| `C` Done without landing → Done story on this machine only, gap stated | Slice 3 |
| Older standalone record opens its own comparison. Conflicting stories are shown, not chosen | Slice 6 |

## Current decisions

- **Identity.** The story identity is `ad-hoc#<uuid>`. The UUID is the
  session's launch reporting reference, which is also its published session
  record's UUID. It is deterministic, so retries and racing writers converge
  without allocation. Extend the
  [work item identity contract](../../../Distribution/src/skills/dough-product-backlog/references/identity.md)
  with this kind. The done record file is
  `ad-hoc_<uuid>.json` under the existing
  [done-record naming](../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs).
  Seed allocation is unchanged.
- **Publication.** For `workflow: "ad-hoc"` with no story,
  [`publishSessionClose`](../../../Distribution/src/skills/dough-execute-plan/scripts/session-record-publication.mjs)
  writes the done record, rebuilds the done catalog and sets the session
  record's `story`. All of this goes in the same record commit, so the work
  and the story recover together. The Land caller supplies the story title,
  sealed with the close. The done record's `completedAt` is the sealed close
  time. An identical done record settles a retry. A follow-up's close, whose
  story is present, writes no done record. Update the
  [Land session close step](../../../Distribution/src/skills/dough-land/references/publish-reviewed-checkout.md#publish-a-session-close)
  for the title.
- **Local attachment.** Dashboard Done (manual and reported, through
  [`NativeDoneMarks`](../../../dashboard/server/doneMarks.ts)) records the
  attached story identity on the launch record in the same write as `doneAt`.
  It never derives the identity at read time, so older Done records stay
  standalone. A record already carrying a story is not attached again. That
  covers a story launch, a story follow-up, a session follow-up of an attached
  session, and a verified
  [completed-story association](../../../dashboard/server/completedStoryAssociation.ts).
  [`storySessionsOf`](../../../dashboard/src/agentLaunch.ts) reads the
  attachment, so the existing
  [Recently done listing](../../../dashboard/src/recentlyDoneListing.ts)
  places the session on the story's card.
- One membership rule: a session belongs to the story its launch names, its
  follow-up names, or its attachment names. Do not add a parallel ad hoc
  story recognizer.
- Follow ADR 0008
  ([durable and local state](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)).
  Dashboard Done publishes nothing.

## Decisive premises observed

Observed in this preparation workspace at `80da1cdb3`.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| A done record accepts `ad-hoc#<uuid>` | `parseDoneRecordFile(doneRecordFileName(id), text)` | Scratch `node` script importing the shared done-record module | `{ok:true}`, file `ad-hoc_<uuid>.json` |
| Identity evidence tolerates it; seed allocation unchanged | `product-backlog.mjs identity-evidence --identity ad-hoc#…` with a scratch done record, then removed | Installed recorder in this workspace | `next: SEED-421`. The only gap is "done catalog does not list" it, so slice 1 must rebuild the catalog |
| The ad hoc Land record commit exists and passes | `publishSessionClose` | `bash scripts/test.sh Distribution/tests/skills/dough-land/session-record-publication.test.mjs` (Homebrew bash 5) | exit 0, 4 tests |
| Story follow-ups nest under a Done card | `closedStoryFollowUpsOf` in Recently done | `node scripts/test-frontend.mjs dashboard/frontend-tests/sessions/recently-done-follow-up-grouping.spec.ts` | exit 0, 3 tests |
| Published session records list on Recently done | Slice 5 listing paths | `npm run --silent test:dashboard:backend -- --workers=1 dashboard/backend-tests/review/published-session-listing.spec.ts` and `node scripts/test-frontend.mjs dashboard/frontend-tests/sessions/recently-done-published-session-launch.spec.ts` | both exit 0 |
| Ad hoc launch records carry the reporting reference | Identity derivation at Done | Read-only count over this machine's `~/.open-dough/dashboard/agent-launches.json` | 182 of 184 ad hoc records have one. A record without one stays standalone (slice 2) |

No premise remains open. Slice 1's done-record write and slice 5's
published nesting extend the observed paths.

## Slices

### 1. An ad hoc Land with no story publishes its Done story

Type: Behavior
Status: planned

Behavior: an ad hoc workspace with accepted work and no story → Land's
`publishSessionClose` → trunk holds `ad-hoc_<A>.json` with the supplied
title and close time, a catalog listing it, and session record `A` naming
`ad-hoc#<A>`. A retry after a lost response leaves one done record and one
session record. A follow-up close naming a story writes no done record. Ship
the identity contract and Land reference updates with the code.

**Proof.** Extend `Distribution/tests/skills/dough-land/session-record-publication.test.mjs`
(real temporary Git repositories) for the new story, the retry and the
follow-up. Run the identity-evidence spec for the new identity kind.

### 2. Done attaches an ad hoc session with no story to its Done story

Type: Behavior
Status: planned

Behavior: Done ad hoc session `A` with no story and a published `ad-hoc#<A>`
→ manual or reported Done → Recently done shows one `ad-hoc#<A>` card
holding `A`. A repeated Done, or a reported Done racing a manual one, still
shows one card. A follow-up of a Taken story marked Done stays under that
story. A record without a reporting reference stays a standalone row.

**Proof.** A backend done-mark spec on the launch-record write, covering
the attachment, the race and the preserved story. A frontend Recently done
spec showing the card holding `A`.

### 3. Unpublished ad hoc Done work is a local Done story with its gap

Type: Behavior
Status: planned

Behavior: `C` marked Done with no `ad-hoc#<C>` in the catalog → Recently
done on this machine lists `C`'s Done story under the session's title. It
states that no published comparison exists, and choosing it selects that
story. Once a later catalog lists it, the published card replaces the local
entry without a second entry.

**Proof.** A frontend Recently done spec for the local entry, its gap
wording, selection, and replacement by the published card.

### 4. Follow-ups join the ad hoc Done story

Type: Behavior
Status: planned

Behavior: published `ad-hoc#<A>` card → **Follow up** → `B` starts with its
own UUID, following up that story. A session follow-up of `A` also belongs
to `ad-hoc#<A>`. Marking `B` Done keeps one card listing `A` and `B`, and
creates no `ad-hoc#<B>`.

**Proof.** Extend the Recently done follow-up grouping specs for an ad hoc
story card and a session follow-up of an attached session.

### 5. Another clone shows the published ad hoc story and its sessions

Type: Behavior
Status: planned

Behavior: a clone with no launch records, after fetching trunk with
`ad-hoc#<A>` and records `A` and `B` naming it → Recently done shows one
card holding `A`'s and `B`'s published sessions, each opening its own
comparison. A published record with no story stays a standalone row.

**Proof.** Extend `dashboard/backend-tests/review/published-session-listing.spec.ts`
for records naming a story. Extend
`dashboard/frontend-tests/sessions/recently-done-published-session-launch.spec.ts`
with no kept launches, so the card holds both published sessions and a
storyless record stays standalone.

### 6. Conflicting associations need the developer; older records stay standalone

Type: Behavior
Status: planned

Behavior: Done session `A` attached to `ad-hoc#<A>` whose verified
completed-story association or published record names `SEED-X#y` → its row
names both stories and asks the developer to choose. Choosing records that
story locally, and the other card no longer holds `A`. A pre-change
standalone Done record still opens its own comparison.

**Proof.** A frontend spec for the conflict and the choice. The existing
retained ad hoc association and standalone comparison specs stay green.

## Local gates and review

- On AC power, prefix test commands with `caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`,
  as [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  describes. Distribution: `bash scripts/test.sh <paths>` with Homebrew
  bash 5. Frontend: `node scripts/test-frontend.mjs <specs>`. Backend:
  `npm run --silent test:dashboard:backend -- --workers=1 <specs>`. E2E:
  `npm run test:e2e -- <spec>`. Then `npm run typecheck:dashboard` and
  `npm run lint`. Never run suites concurrently. Follow the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Refinement not needed. Six slices, each with one example family and proof
  loop. Slice 1 precedes the Dashboard slices that read its records. Slice 2
  establishes the one membership rule that slices 3 to 6 reuse. This review
  found no slice-specific concern. Slice 1 is the largest, spanning the
  publisher, the identity contract and the Land reference. If it overruns,
  split off the identity contract text.
