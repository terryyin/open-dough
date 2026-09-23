# Keep auto-refreshed snapshots truthful when detail reads are abandoned

Status: planned.

**Identity:** quick/087-truthful-abandoned-detail-reads/PLAN.md
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"PLAN.md","assessment":"not-ready","reasons":["Slice 2 bundles four test-suite corrections (count helpers, lifecycle and boundary consolidation, fake GitHub answering path, overview server) whose proof loops may be independent; its sizing is unassessed and the unused-server finding is unverified."],"basis":{"document":"ca24845a1faf0e5124419f685b37a141df723b9faab7af1b3d792169d6cbf0f1"}}
```

Source: execution retrospective of
plan 084 (`38571d5:.planning/quick/084-auto-refresh-published-dashboard/PLAN.md`)
for `SEED-026#auto-refresh-published-dashboard`
(`38571d5:.planning/seeds/SEED-026-auto-refresh-published-dashboard.md`),
Claude Code, 2026-09-23. Reviewed commits on
`origin/claude/084-auto-refresh-published-dashboard`: `dcb0944` (slice 1),
`9feec0e` (slice 2), `5cc80b0` (slice 3), `7eda3d7` (slice 4), after claim
`2c80a05`. This is a bounded correction plan; no seed is required and no
execution is authorized by this plan.

## Beneficiary and bounded outcome

A developer leaving the dashboard open can trust that a snapshot labeled as
read at a revision either shows each story's detail or an explicit gap, and
that a failed attempt is never silently turned into a settled read. The
auto-refresh proof stays stable on slow machines without redundant look-alike
specs, and the rules shared by the local boundary and the browser each have
one home.

## Current findings and scope

1. **Defect — abandoned detail reads look settled.** `readPublishedWork`
   (`dashboard/src/publishedWork.ts`) shows B's membership through
   `onPartial` before enrichment. When the 30-second `readWaitLimitMs` fires
   during enrichment, `loadRepositoryTexts`
   (`dashboard/src/repositoryFileReads.ts`) rethrows on abort, so unread cards
   stay "Reading preparation…" instead of carrying a gap. The attempt is marked
   failed, but `shownRevision` is already B, so the next scheduled check is
   unchanged and `onUnchanged` (`dashboard/src/publishedObservation.ts`) resets
   the failure to `read`. The page then reports "Published work read at
   revision B" while cards remain loading forever, and no automatic detail read
   follows. Before the check, the alert also says the attempt "added nothing",
   although it replaced A's membership with B's. This violates story key
   example 3 (unavailable detail labeled explicitly) and truthful attempt
   status; the automatic clearing is new in plan 084 slice 2.
2. **Test fragility — call counts include revision checks.**
   `pathsRead` and `origin.requests` (`dashboard/tests/publishedOrigin.ts`)
   count every ref request, including `--include` revision checks, while
   `project-selection`, `direction-disclosure`, `dashboard-header`,
   `project-read-isolation`, and `story-readiness` specs run real timers and
   assert exact counts. A journey slower than 15 seconds would see an extra
   check and fail.
3. **Test-suite redundancy.** `authenticated-read-subprocess-lifecycle.spec.ts`
   repeats disconnect and timeout for three catalog sources through code that
   does not branch per source; `authenticated-read-boundary.spec.ts`'s
   per-source membership cases and preview-mount case duplicate
   `authenticated-project-overview.spec.ts`, which drives all three projects
   in dev and preview with pinned `gh` argv; missing-login behavior is asserted
   in four specs. `dashboard/tests/support/fakeGitHub.ts` keeps two answering
   paths (per-repository `serve` and the catch-all `setControl`).
   `authenticated-project-overview.spec.ts` probably starts an unused preview
   server through the `page` fixture's `baseURL` (inferred, not verified).
4. **Duplicated boundary/browser rules.** "What was being read" labels are
   built in `dashboard/server/authenticatedRead.ts` and
   `dashboard/src/authenticatedRead.ts`; the SHA pattern appears in
   `dashboard/server/ghRead.ts` and `dashboard/src/authenticatedRead.ts`; the
   30-second read bound appears in `ghRead.ts` and `publishedWork.ts`.
   `dashboard/src/authenticatedReadPath.ts` is already the browser-safe module
   both sides import.
5. **Size.** `dashboard/src/publishedObservation.ts` is 257 lines and mixes
   attempt and rate-limit-wait bookkeeping with read orchestration and focus.
6. **Doc drift.** `docs/dashboard-tech-stack.md` "First-story application"
   says the overview needs no application read server; every project now reads
   through the local `gh` boundary.

Excluded: carrying rate-limit direction on content reads, cross-tab
coordination, execution-branch watching, and any change to the 15-second pace
or 30-second target. The CI shell-suite failures on this branch
(`execution-increment-managed-delivery-resume-ownership.test.mjs`, and a
20-minute `test` job timeout) belong to the Taken 085 execution's repair, not
this correction.

## Preserved promises and constraints

All of SEED-026's key examples and constraints stay as delivered by plan 084:
one displayed snapshot never mixes revisions; unchanged checks make no content
reads; failures keep the last successful snapshot's revision and retrieval
time; a directed rate-limit wait is honored; hidden pages make no checks;
credentials never reach the browser. Existing E2E journeys that document these
promises remain, and every consolidation below names its surviving proof.

## Proof ownership

| Promise | Owning slice and observation |
| --- | --- |
| An abandoned detail read leaves explicit gaps, the attempt stays truthfully reported, and an unchanged check neither clears it into a settled read nor re-reads details automatically | 1: clock-driven page journey holding one B detail past 30 seconds, then one unchanged check |
| Call-count assertions stay exact regardless of elapsed real time, and consolidated specs keep their surviving coverage | 2: focused runs of the affected specs plus the full dashboard suite |
| Shared rules have one home with unchanged user-visible wording | 3: existing boundary and read-failure specs asserting exact messages, plus typecheck |

## Ordered slices

### 1. Report abandoned detail reads truthfully

Type: Behavior
Status: planned

Behavior: Given A displayed and `main` moved to B, when B's membership arrives
but a detail read stalls past the browser's 30-second bound, the B snapshot
shows an explicit gap for each unread record, the alert states the attempt
failed after B's membership was read (not that it added nothing), and a
following unchanged check does not clear that failure into a settled "read"
status nor re-read details. Manual Refresh retries the details at B.

Choose the simplest truthful rule: finish the snapshot with explicit per-file
problems for paths left unread when the wait bound fires, keeping the check's
comparison tied to the displayed revision, rather than adding a second
recognizer. Extract the attempt and rate-limit-wait bookkeeping from
`publishedObservation.ts` into its own module as the home for this rule.

Proof: extend `dashboard/tests/auto-refresh-recovery.spec.ts` (or a sibling
under the same journey helpers) with a paused page clock: push B, hold one of
B's record reads past 30 seconds, observe the gap label and truthful alert,
pass one unchanged check and observe no settled-read status change and zero
content reads, then Refresh and observe the gap closed at B. Run the
auto-refresh, read-failure, and project-read-recovery specs and
`npm run typecheck:dashboard`.

Safe stopping point: no displayed snapshot can look complete while its details
were abandoned.

### 2. Make auto-refresh-era test counts stable and remove redundant specs

Type: Structure
Status: planned

Correction: exclude `--include` revision checks from `pathsRead` and
`origin.requests` (reuse the `refChecks` rule in
`dashboard/tests/autoRefreshJourney.ts`) so real-timer specs keep exact
counts. Reduce `authenticated-read-subprocess-lifecycle.spec.ts` to one
source per read kind (surviving: disconnect and timeout per kind, shutdown);
drop `authenticated-read-boundary.spec.ts`'s per-source membership and
preview-mount cases (surviving: `authenticated-project-overview.spec.ts` in
dev and preview); keep missing-login proof in the overview page journey and
the boundary's stderr-redaction case only. Express the fake GitHub's control
modes as answerers served for every repository and delete the catch-all path.
Verify, then remove, the overview spec's unused preview server.

Proof: the affected specs and the full `npm run test:dashboard` pass; list the
removed test titles with their surviving coverage in the delivery record.

Safe stopping point: fewer look-alike specs with unchanged promise coverage.

### 3. Give shared read rules one home

Type: Structure
Status: planned

Correction: move the SHA pattern, the "what was being read" label builder,
and the read wait bound into `dashboard/src/authenticatedReadPath.ts` (or a
sibling browser-safe module) and use them from both the boundary and the
browser. Update `docs/dashboard-tech-stack.md`'s "First-story application"
with one sentence pointing to `dashboard/README.md` for current behavior.

Proof: boundary, revision-check, read-failure, and project-read-recovery specs
asserting exact messages pass unchanged; `npm run typecheck:dashboard`.

Safe stopping point: rewording or re-bounding a read changes one place.

## Current decisions

- Findings 2–6 are cleanup owned here so they do not drift into unrelated
  stories; finding 1 is the only behavior change.
- `.planning/NORTH-STAR.md`'s "retired when its callers migrate" wording is
  left to story wrap-up's knowledge assimilation.
