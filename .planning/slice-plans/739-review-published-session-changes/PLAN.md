# Review a session’s published changes from another machine

**Identity:** SEED-418#review-published-session-changes
**Source:** [Review a session’s published changes from another machine](../../seeds/SEED-418-review-published-session-changes.md#review-published-session-changes)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A developer on a second machine can discover a standalone Done session in the
configured project and use **Review changes** to inspect what it published. A
standalone Land publishes one record holding the session UUID, workflow, close
time and accepted comparison; local-only and unsuccessful push attempts stay
out, and launch state stays local. Other workflow closes, earlier
publications, multiple ranges, shared-checkout uncertainty, retry, story
association and the 30-day window moved to
[Attribute every workflow session’s published changes](../../seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record)
([plan 744](../744-attribute-every-workflow-session-record/PLAN.md)) on
2026-11-21. Story-session selection, combining comparisons, historical
recovery and adding follow-up message context are separate stories.

## Current decisions

- The workflow owns a versioned JSON record per UUID beside the configured
  backlog. Use one record contract shared by workflow code and the Dashboard.
  Read it from the published revision of the configured project. Use the
  existing launch correlation to bind Dashboard launches and their local
  records, with an explicit retained workflow identifier for native starts.
  Reusing a checkout or story identity conveys no session identity.
- Close records describe accepted contributions. Reuse the accepted
  candidate/base pair in the
  [publisher](../../../Distribution/src/skills/dough-execute-plan/references/publish-the-candidate.md)
  and the authorized publication path for the record commit after the work is
  accepted.
- The completed-story review shows how to resolve a configured project against
  published Git. The [retained comparison reader](../../../dashboard/server/retainedReviewPair.ts)
  already reads exact pairs and the standalone review already selects one
  retained comparison and checks file membership. Reuse these responsibilities
  for the published UUID subject. Local launch evidence can enrich the same
  entry; it remains the source of native controls. Read and validate a selected
  range through the configured project and require the literal changed path
  for file requests. Report missing evidence as unavailable.
- List published records through the authenticated read boundary, modeled on
  the `agent-profiles-at` read in
  [`listedRecordsRead.ts`](../../../dashboard/server/listedRecordsRead.ts), and
  merge them into the Done listing by UUID: a local launch whose `reference`
  equals the record UUID and the record form one entry.
- Follow [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  and the [Architectural North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).
  Keep typed boundaries narrow and avoid adding test-support wrappers. Preserve
  one comparison model. Keep changes to the publication entry point thin. The
  currently 250-line `dashboard/server/performedRead.ts` gains no dispatch
  until slice 3 moves one inline case behind its typed handler, with the
  existing read route responses and authentication tests as proof.

## Decisive premises

Observed in the preparation workspace on 2026-11-20 at `9efbd70c1`. The
advance to `b216770db` adds another story's preparation and leaves the
relevant implementation paths untouched. Rows for the moved slices went to
[plan 744](../744-attribute-every-workflow-session-record/PLAN.md#decisive-premises).

| Consuming operation | Observation |
| --- | --- |
| Accepted publication supplies the comparison used by slice 1 | Ran distribution Node tests `execution-increment-comparison.test.mjs` and `trunk-closure-rebased-rerun.test.mjs` in the owned checkout. The real temporary Git remote accepted the retry's rewritten candidate with its new base. The pair diff contained just the increment. Closure resumed from the original request after acceptance and retired without replaying the publication. |
| Current comparison behavior to reuse in slice 2 | Ran `npm run --silent test:dashboard:backend -- review/ad-hoc-review-subject review/ad-hoc-review-file review/done-kept-session-shared-checkout`. All 17 cases passed in the Vitest profile. File reads admit the exact selected pair and rename path, and refuse a foreign path or pair. Today's review rejects the same subject when local kept state is empty. Slice 2 changes that boundary for published UUIDs. |
| Focused Chromium selection for the Done-session journey in slice 5 | `npm run test:e2e -- --reporter=list --list e2e/sessions/recently-done-sessions-select-ad-hoc-development.spec.ts` selected one Chromium case. The listing verifies the runner route. The slice owns the new second-machine journey. |

## Outside-in proof

| Promise | Owning slice and observation |
| --- | --- |
| One portable session record for an accepted standalone result | 1. Invoke the Land publication path with an authorized temp Git origin, then read the UUID JSON and diff its pair from an independent clone. Inspect the actual commit and file changes. Local-only and remote-refused work publish no record. |
| Review a published UUID through the review routes | 2. Backend cases prove the published subject, wrong project, unknown UUID, missing objects and off-comparison file handling. |
| Read route dispatch stays intact after the structural move | 3. Existing read route response and authentication specs pass unchanged. |
| List published records at fetched trunk | 4. Backend specs with real Git list the records, refuse an unpinned revision and skip malformed records. |
| Discover and review on the second machine | 5. Browser journey through the standalone Done entry and existing review page using a second configured checkout and empty launch storage. Open the actual file diff after origin advances. An originating-machine case shows one entry with native controls. |

## Ordered slices

### 1. Publish the standalone session’s accepted comparison

Type: Behavior
Status: done

**Behavior.** A standalone Land closes with an accepted owned suffix. A reader
cloning origin can resolve the session UUID and read the published file edit from
the recorded commit pair. A local-only or rejected work publication produces
no published record. Use the accepted publisher comparison, a kept close
identity and the authorized trunk route without requiring a Dashboard.

**Proof.** Distribution fixture invokes the production Land workflow boundary
and reads the record and its Git diff from a separate clone. Exercise the
work-publication refusal at the same boundary.

**Accepted.** `Distribution/tests/skills/dough-land/session-record-publication.test.mjs`
(6 cases, real temp origin and `git clone --no-local`) through
`publishSessionClose` in
`Distribution/src/skills/dough-execute-plan/scripts/session-record-publication.mjs`.
Contract for later slices: `.planning/sessions/<uuid>.json` beside the backlog,
`{version:1, sessionId, workflow, closedAt, story?, ranges:[{base,candidate}]}`.
The UUID is the Dashboard launch's landing-context `reference`, or a retained
`sessionId` for a native start; absent or conflicting identity stops before any
push. The record publishes as a second accepted publication after the work, and
its result (`published | stopped | not-published`) is separate from `work`.

### 2. Review a published session by UUID through the review route

Type: Behavior
Status: done

**Behavior.** Given a published record read at a newer trunk revision of the
configured project, the existing review request and file routes accept a
published-session subject by UUID and return the original comparison and file
diff without local launch history. Records resolve through the configured
source; a wrong project or unknown UUID is refused, off-comparison file
requests are refused and missing Git objects explain the gap.

**Proof.** Backend review specs through the existing review admission seam
with real Git: the handler cases in
`dashboard/backend-tests/review/published-session-review.spec.ts` plus route
cases for the published subject, wrong project and file refusal. Preserve the
kept-local and story review cases.

**Split from the original slice 2** after its attempt (4.4 active minutes)
showed hidden preparation: the review subject is `{source, host, session}`
and needs a published variant across the subject, request and input
admission, while the Done listing builds only from local launches. The
attempt's typed record schema (`dashboard/src/publishedSessionRecord.ts`),
reader and file admission (`dashboard/server/publishedSessionReview.ts`) and
their five passing backend cases are retained in the checkout for this slice.

**Accepted.** Subject `{source, published: uuid}` routes through
`dashboard/server/storyReviewInput.ts` to `publishedSessionReview.ts`, with
the configured project resolved in `publishedSessionSource.ts` at the fetched
`origin/<ref>` (last fetched trunk when origin is unreachable). Proof:
`dashboard/backend-tests/review/published-session-review.spec.ts` and
`published-session-review-request.spec.ts` with the existing ad hoc and kept
review specs. The page's `ReviewedWorkSubject` union does not yet include the
published subject; slice 3 adds it with `reviewedWorkKey` and
`reviewedWorkQuery`. A local full backend run timed out in unrelated specs at
load average ~26; the affected 17 files passed on rerun and CI settles the rest.

### 3. Move one inline read out of the performed-read dispatch

Type: Structure
Status: done

**Structure.** Move one inline case block out of
`dashboard/server/performedRead.ts` (exactly 250 lines) behind its own typed
handler, so slice 4 can add a read kind without growing the dispatch. Behavior
is unchanged.

**Proof.** The existing read route responses and authentication specs pass
unchanged.

**Split twice.** The original slice 2 split into the delivered slice 2 and an
old slice 3 ("Open a published standalone comparison on a second machine"),
which split again into slices 3–5 here. Its attempt took about 3 active
minutes of reading and stopped before edits as an oversized slice holding
independent outcomes. The slice clock shows 389.7 minutes for that slice only
because the coordinator left it running while waiting on a human question;
that is a coordinator clock error, not implementation time.

**Accepted.** `addition-at` moved verbatim behind `performAdditionRead` in
`dashboard/server/additionRead.ts`; `performedRead.ts` is 229 lines. The six
observation read-route and authentication specs (34 cases) pass unchanged.
Its clock runs as `3s`, split from the old slice 3.

### 4. List published session records at fetched trunk

Type: Behavior
Status: done

**Behavior.** A typed published-session listing read through the
authenticated read boundary lists `.planning/sessions/*.json` at the
configured project's fetched trunk, reusing the record schema in
`dashboard/src/publishedSessionRecord.ts`. Model it on the `agent-profiles-at`
read in `dashboard/server/listedRecordsRead.ts`, with its requested-read kind,
parameter admission and authenticated-read path rule.

**Proof.** Backend specs with real Git: records are listed, an unpinned
revision is refused, and malformed records are skipped.

**Accepted.** `published-sessions-at` (`sessions=published` at a pinned
revision) is `performPublishedSessionsRead` in
`dashboard/server/publishedSessionsRead.ts`, sharing record validity
(`publishedRecordAt`) with slice 2's review and pinned-listing admission with
`agent-profiles-at`. Proof: `dashboard/backend-tests/review/published-session-listing.spec.ts`
plus the listed-records and refusal observation specs. For slice 5: the read
does not fetch, so ask at the revision `fetchedPublishedSessionSource`
resolves or fetch first; and add a MakeMe session-record builder when the E2E
becomes the record setup's third consumer.

### 5. Open a published standalone comparison on a second machine

Type: Behavior
Status: planned

**Behavior.** Given a published record and a newer revision of trunk, a
configured second machine with empty launch history shows the standalone Done
entry without a local launch and opens the original comparison and file diff
through slice 2's route. The Done listing merges records by UUID with local
launches whose launch `reference` equals the record UUID, so the originating
machine shows one entry with its native controls. The page's
`ReviewedWorkSubject` gains the published case with `reviewedWorkKey` and
`reviewedWorkQuery` (slice 2's Accepted note names this slice by its
pre-resplit number, 3).

**Proof.** An E2E second-machine journey in `e2e/sessions/` uses actual
published Git data through the existing
[review page object](../../../dashboard/test-support/reviewChangesPage.ts),
plus the originating-machine single-entry case. Preserve the kept-local
listing cases.

## Local gates

- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Use [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [Dough Page Objects](../../../.agents/skills/dough-page-objects/SKILL.md)
  when their test selection applies. Keep default timeouts and omit
  `test.slow()`. Apply the maintainer skill-authoring guidance if editing
  distributed workflow guidance.
- Use `caffeinate -s -i` on AC power for long macOS runs under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Put Bash 5 on `PATH` for the distribution test runner. Run the focused
  distribution checks using `npm test -- <paths>`, the changed Dashboard
  checks through the backend or frontend npm runner, and the focused browser
  journey with `npm run test:e2e -- <spec>`. Check Dashboard types after
  changing its contract or consumers. Run the relevant lint gate.

## Plan review

Resplit on 2026-11-21 at the delivered slice-2 boundary. Slices 1–2 are done
and unchanged. The old slice 3 split into slices 3–5 following its
implementer's recommendation: one structural move with existing proof, one
backend listing read with its own real-Git specs, and the listing merge and
page subject proved by the second-machine journey. Old slices 4–9 became
slices 1–6 of [plan 744](../744-attribute-every-workflow-session-record/PLAN.md).
No remaining slice-specific concern was identified.
