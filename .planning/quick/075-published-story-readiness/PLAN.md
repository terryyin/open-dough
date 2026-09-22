# Inspect a story's published readiness and slice progress

Status: executing; slices 1–11 done; slice 12 is next.

## Source and outcome

Identity: SEED-021#inspect-recorded-story-progress

Source: [refined story](../../seeds/SEED-021-observe-published-story-progress.md#inspect-recorded-story-progress).
Terry requested refinement, then planning and any necessary plan refinement on
2026-09-22. After review, Terry authorized keeping, committing, integrating into main,
and removing this preparation workspace. Implementation remains unauthorized.

Outcome: Terry sees preparation and readiness across the backlog, and can inspect
published slice progress. The workflow produces the authoritative facts; the
reader and dashboard share their meaning. Preserve the story's examples and
exclusions, including the existing three-project public/private behavior.

## Execution

- Mode: Story Branch Mode. Replanning permission is the existing planning authority; this invocation supplied neither `--replan` nor `--no-replan`.
- Originating checkout: `/Users/terryyin/git/open-dough`.
- Integration checkout: `/Users/terryyin/git/open-dough` on `main`.
- Owned workspace: `/Users/terryyin/git/open-dough/.worktrees/075-published-story-readiness`, branch `cursor/075-published-story-readiness`, created this session from fetched `origin/main` `e720864646f4d4020a60b9df927488502ba265da`.
- Published claim: `60bb28bd9aa0a1efba4011015aec578ba01f3dcd` accepted on `origin/main`. Claim coverage is `pendingCi: unobserved`; trunk is not this story-branch observer's target.
- Default-checkout maintenance after that trunk publication: advanced to `60bb28bd9aa0a1efba4011015aec578ba01f3dcd`.
- Checkout preparation: `npm ci`, then `npm run lint` passed in the owned workspace.
- Increment target: `origin` `cursor/075-published-story-readiness`. Published slice 12: `3ea6c78ffd1a674b7bc5590efc5a7e7dda756048`, registered with `/tmp/dough-ci-501/watch-urgnAo`. CI repair remains `a4320cc3854ee7bb31494a67996c6a0abab9f115`. Default checkout was not refreshed; this target is not trunk.
- CI source: GitHub Actions, workflow `ci.yml`, display name `CI`. Observer directory `/tmp/dough-ci-501/watch-urgnAo`, bound to `terryyin/open-dough` branch `cursor/075-published-story-readiness`. Claim on `origin/main` remains `pendingCi: unobserved`.

## Workspace and authority

- Session-created workspace: `/Users/terryyin/.codex/worktrees/story-readiness-planning/open-dough`.
- Branch: `codex/story-readiness-planning`.
- Verified starting revision: `a604ebe8a03edf6a3f63e06e0fa117c505cd1c71`.
- Originating/integration checkout: `/Users/terryyin/git/open-dough`.
- Retained-result publication target: `origin/main`, authorized after review.
  The session-created workspace and branch are removed after confirmed integration.
  No Taken claim, execution identity, or CI observer is created.
- The two reviewed ADR edits were copied from the originating checkout so this
  draft includes its architectural basis; the originals remain unchanged there.
- Existing canonical plan layout is `.planning/quick/NNN-name/PLAN.md`; 074 was
  highest allocated at inspection. This path was checked free immediately before
  writing. Recheck allocation if integrating alongside other planning work.

## Data and operation decisions

These are the bounded implementation direction for the refined story, not a new
state machine or a second ADR. Keep exact syntax in the maintained runtime
contract when implemented.

1. Add one versioned, machine-readable story-state block in the canonical story
   section. A bounded correction uses its canonical plan document instead; do
   not fabricate a seed. Reuse existing identity and anchored-section semantics.
   A fenced JSON block is the initial encoding: structured validation without a
   second Markdown status grammar. It records refinement, approach, and readiness
   assessment; do not duplicate title, identity, queue position, or slice statuses.
2. Logical fields: schema version; refinement (`not-refined` or `refined`);
   approach (`unselected`, `planned` with plan reference, or `planless`);
   assessment (absent, or `ready`/`not-ready`, basis and reasons). Ready requires
   understood goal/scope/examples, an explicitly selected approach, and no blocking
   concern. Planned work needs bounded slices and mapped proof; planless follows
   the existing explicit skip-planning instruction. The recorder stores agent
   judgment and validates consistency; it does not judge prose quality itself.
   Not-ready requires at least one blocking reason; ready requires none and a
   refined story with a selected valid approach.
3. The block's plan reference is the story's preparation association, relative to
   its canonical file. Existing backlog plan links remain navigation/claim data;
   when both exist they must resolve to the same plan. Preserve existing take and
   refresh behavior and report disagreement rather than silently prefer one. An
   older backlog plan link still supports plan inspection but cannot infer ready.
4. Bind an assessment to SHA-256 digests of the canonical document and, for
   planned work, the associated plan. Exclude all story-state blocks; normalize
   line endings only. Including the whole seed covers shared scope outside the
   selected story, at the cost of reassessment after a sibling prose edit. For a whole-document correction, digest the document once
   without its state block. This deliberately conservative basis can require
   reassessment after editorial or progress changes; do not invent a semantic
   change detector. Show `Needs reassessment` on mismatch, without modifying source.
   Agent-driven updates may record a fresh assessment after actually reviewing
   the changed content. Never automatically renew readiness on a slice update.
5. A shared read operation returns the normalized facts, source locations, and
   basis. A record operation takes the intended facts plus the caller's expected
   basis, rereads current content, validates identity and plan association, and
   replaces only the selected state block. A stale submission, duplicate block,
   unsupported schema, or ambiguous identity leaves files unchanged. Serialize
   cooperating writers per canonical file and preserve other stories and prose.
   Reuse existing atomic replacement; do not claim protection from arbitrary
   editors or cross-worktree serialization. Git reconciliation remains the shared
   publication mechanism; merged content invalidating a basis cannot appear ready.
6. Keep slice definitions, `Type`, `Status: planned|done`, and proof in the plan.
   Extract the established ordered-slices section with one shared pure reader.
   A done status is recorded completion, not independent verification. Show the
   available accepted evidence separately from a prospective `Proof:` recipe;
   when evidence is absent say so. Unsupported layout is uninterpretable, not
   zero slices. No new completion registry, historical ledger, or percent estimate.
7. Workflow recording occurs within already-authorized preparation/execution
   writes. Decomposition can establish not-refined, refinement records its result,
   planning records plan existence and concerns, and an explicit assessment at
   preparation completion records readiness. Plan refinement reassesses its
   changed plan. Execution/resume consumes the assessment without substituting it
   for current authorization; existing invalidation/replanning paths update facts.
   No state-only gate is added to take, and reading a story never triggers writes.
   Context-only quick execution still creates no artificial story or plan.
8. Adjust the current planning prohibition on certifying readiness to permit the
   accepted assessment while retaining its prohibition on granting execution
   authority. Keep one concise shared procedure linked by affected skills, not
   competing rules in every caller. Change source guidance only; installed copies
   are updated through releases, never hand-synchronized.
9. Missing structured fields are `Not recorded`; they are not inferred from varied
   free-form Status prose. Existing purpose and plan content remain inspectable.
   First ordinary authorized write adopts the selected story's facts only. No
   mass migration, project edits through the dashboard, or changes to Doughnut
   and Pygardon repositories are included.

## Observation and UI decisions

- Preserve trunk membership and order. Fetch the pinned backlog, then deduplicated
  canonical files and associated plans needed for preparation/readiness. Render
  readable membership while dependent facts load; never briefly show not-refined.
  All requests in a snapshot use the same resolved revision.
- Overview uses a preparation badge (gray Not refined, blue Refined, purple Slice
  planned) and a separate green Ready for execution badge when supported. Detail
  preserves independent refinement and planning facts, including planless. A
  problem with readiness does not erase supported planning facts. Text, contrast,
  and a compact legend carry the meanings; warning styles are for actual evidence
  problems, not ordinary unrefined work.
- Detail shows recorded purpose, assessment/reasons/basis, plan slices, completion
  evidence, and pinned source links. Use a simple accessible detail region; no
  canvas, navigation engine, owner display, or new execution controls.
- Reuse source-link resolution, generalized to the containing file's base path.
  Preserve external links as navigation only; do not fetch arbitrary external
  records as though they belong to the snapshot.
- Public request budget per fresh snapshot is 2 + S + P for distinct canonical
  and plan files (deduplicated across sets). Three stories in one seed with two
  plans cost five requests, and opening already-read detail costs none. Use bounded
  concurrency, the current 30-second deadline, cancellation, and explicit Retry.
  Caching is in-memory per source/revision/path; no polling or persistent index.
- Extend the private read boundary through the existing catalog project identity
  and a pinned revision. Resolve allowed canonical/plan paths from that revision's
  records server-side; never accept an arbitrary repository/path proxy. Preserve
  local-origin checks, generic credential-safe failures, and child-process cleanup
  on disconnect/timeout/server close in dev and built preview.
- Failures are scoped: a refused backlog remains a whole-snapshot failure; an
  unreadable story or plan marks only dependent facts unavailable. Retained older
  detail remains visibly associated with its old revision, not silently combined
  into new evidence. Project changes cancel reads and reject late results.

## Existing solutions and architectural constraints

PFE inspection found these owners at the starting revision:

| Responsibility | Existing owner and decision |
| --- | --- |
| Identity and canonical story boundary | `product-backlog-identity.mjs`, `product-backlog-home.mjs`, and `product-backlog-source.mjs` under `src/skills/dough-product-backlog/scripts/`. Reuse; extract pure home interpretation from filesystem access so browser and CLI share it. |
| Atomic file replacement | `product-backlog-store.mjs`. Reuse replacement; its backlog-only lock needs a narrowly shared file-lock operation for canonical-file mutation. Do not route state updates through queue reorder. |
| Plan association | `product-backlog-plan.mjs` checks file existence, not meaning. Preserve that responsibility; add interpretation in shared story/plan readers, not inside every operation. |
| State and assessment | No existing authoritative structured readiness contract. Add it beside the shared canonical-record readers and expose a small CLI for workflow use, without a new skill solely for storage. |
| Publication and cleanup | Preparation disposition, execute-plan delivery, and story wrap-up already own publication and removal. Reuse them; canonical-home storage leaves no separate catalog tombstone to clean up. |
| Origin reads and typed projection | `dashboard/src/publishedWork.ts`, `githubSource.ts`, `sourceLink.ts`; extend the existing path through shared readers and validate at the typed boundary. |
| Private origin access | `dashboard/server/privateRead.ts`, `ghRead.ts`, `localOrigin.ts`; extend bounded record reading without duplicating the source catalog or exposing credentials. |
| Accessible cards and refresh | `WorkStages.tsx`, `App.tsx`, `workFocus.ts` and current Playwright journeys; extend cards/detail and retain focus/project isolation. |

Follow [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(including this session's human-directed amendment),
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md),
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md), and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
ADRs 0007–0009 remain Proposed. No exception or status change is required.

The existing [North Star](../../NORTH-STAR.md) owns shared interpretation and
separate observation/presentation; its earlier statement that the overview
needs no state schema was scoped to that delivered overview. This story supplies
the demonstrated need for state. The [UI guidance](../../../docs/dashboard-ux-ui-north-star.md)
continues to own accessibility and evidence display. No additional architecture
framework or independent catalog service is justified.

## Verification and delivery gates

All commands here are future execution checks, not results of this planning turn.
Use focused checks for each changed boundary, then the integrated journey. New
Node tests belong beside existing `tests/support/*.test.mjs` and join the normal
shell test entrypoint. New browser journeys join the existing Playwright suite.

- Shared operations: `node --test tests/support/story-state*.test.mjs` (new tests),
  plus affected existing identity/home/plan/backlog tests.
- Browser journeys: `npm run test:dashboard -- --grep 'story readiness'`; private
  scenarios run through real dev and built-preview servers with the existing
  synthetic `gh` boundary, not a stubbed private endpoint.
- After the integrated dashboard changes: `npm run typecheck:dashboard` and
  `npm run test:dashboard`. The browser suite builds production assets itself.
- Payload changes: extend and run `bash tests/story-payload-update.sh`,
  `bash tests/product-backlog-payload-update.sh`, and `bash tests/install-all-tools.sh`
  using the suite's Bash 4+ requirement. Exercise installed helpers, not just paths.
- Source guidance: apply [AGENTS.md](../../../AGENTS.md)'s representative behavior
  review, including trigger, required context, and useful outcome; do not write
  exact-prose tests for equivalent instructions. Check runtime audience and links.
- ADR 0005: ordinary guidance review does not require a new tool-discovery matrix.
  Reuse justified existing integration evidence; assess any invalidated native
  behavior evidence on Codex, Cursor, and Claude Code. Missing required native
  proof stays pending before release, with an acceptance-story handoff if needed;
  implementation completion must not claim those native outcomes passed.
- Before a future commit, perform the required independent post-change refactor
  and focused verification through execute-plan. No tests, refactor delegation,
  commits, pushes, release tags, or live installation updates are authorized by
  this plan alone. Execution mode and delivery authority remain execution inputs.

## Ordered slices

### 1. Share canonical story interpretation across record consumers
Type: Structure
Status: done
Proof: Existing identity/add/refresh/adoption checks retain their outcomes after
extracting pure region/identity interpretation; importing that reader uses no
filesystem or Node-only module.

Accepted: `readHome` lives in `product-backlog-home-reader.mjs`; `product-backlog-home.mjs` loads and writes files and does not re-export `readHome`. `identityLine` is shared by the reader. Commands, both pass after the refactor edits: `node --test tests/support/product-backlog-identity.test.mjs tests/support/product-backlog-add-identity.test.mjs tests/support/product-backlog-refresh.test.mjs tests/support/product-backlog-refresh-refusals.test.mjs tests/support/product-backlog-adopt.test.mjs tests/support/product-backlog-adopt-refusals.test.mjs` (25 tests; setup is those existing suites) and `node --test tests/support/product-backlog-home-reader.test.mjs` (assertion `importing the pure home reader pulls in no filesystem or Node-only module`).

Structure: Separate the pure canonical-home reader from its current filesystem
wrapper, preserving the existing anchored and whole-document contracts. This
immediately enables the shared state operation in slice 2. Do not refactor queue
ordering, Git integration, or unrelated store operations.

### 2. Record one story's preparation without changing its neighbors
Type: Behavior
Status: done
Proof: A real CLI operation on a seed with two stories records the selected
story's refinement and plan/planless facts; reading through the shared reader
returns those facts and leaves the other story, identity, and backlog bytes intact.
Concurrent cooperating writes to different stories in that file preserve both;
ambiguous/duplicate records are refused without writes.

Accepted: `record-state` / `read-state` and `readStoryState` / `recordStoryState`. Command, pass after the refactor split: `node --test tests/support/story-state.test.mjs tests/support/story-state-refusals.test.mjs tests/support/product-backlog-home-reader.test.mjs` (6 tests). Setup is `story-state-fixture.mjs` plus a planted two-story seed with no state block. Observations: neighbor stays `not-recorded` and backlog bytes unchanged; concurrent writes keep planned/unselected and planless; duplicate blocks and a wrong identity match `Nothing was written`; unsupported schema version 99 is distinct from legacy `not-recorded`.

Behavior: Existing canonical record → authorized preparation record operation →
validated state stored atomically in the selected home. Include the minimal
versioned block reader/writer and canonical-file lock. Unsupported version and
legacy absence are distinct results, not false values.

### 3. Record an assessment against the content actually reviewed
Type: Behavior
Status: done
Proof: CLI read returns a basis; ready/not-ready recording round-trips its reason
and approach. Changing the story or plan makes ready outdated, and submitting the
old basis refuses without edits. A planless story needs no fabricated plan. A
correction whose canonical home is its plan has a stable non-self-referential basis.

Accepted: command, pass after the test split: `node --test tests/support/story-state-assessment.test.mjs tests/support/story-state-assessment-refusals.test.mjs tests/support/story-state.test.mjs tests/support/story-state-refusals.test.mjs` (10 tests). Setup is the story-state fixture scratch project; seeds start without a ready or needs-reassessment result. Observations: read returns a 64-character document basis; ready and not-ready round-trip; a later edit reports `needs-reassessment` and a stale submit matches `Nothing was written`; planless ready has no plan digest; a correction home's `digestSource` matches the stored document digest after the write.

Behavior: Agent assessment plus expected basis → record operation → evidence-bound
readiness, with mechanical consistency checks and no automatic execution. Digest
normalization and validation have one shared meaning in CLI and browser.

### 4. Refinement and planning produce their preparation facts
Type: Behavior
Status: done
Proof: Representative guidance walkthrough starts with a captured story, refines
it, and writes a plan with a remaining concern; the actual recorder creates
refined/planned facts without a ready claim, queue transition, or execution.
Check affected call paths for both ordinary and whole-document canonical homes.

Accepted: shared procedure `src/skills/dough-product-backlog/references/record-preparation.md`, linked from decomposition, refinement, and slice planning. Scratch `/tmp/slice4-prep-FRyTQR` after recorder writes: `seeds/SEED-WALK-prep.md` holds refined/planned with plan `../quick/075-walkthrough/PLAN.md` and no assessment field; `quick/075-correction-walk/PLAN.md` holds refined/planned with plan `PLAN.md` and no assessment field; backlog Taken is empty. Setup started from not-recorded homes.

Behavior: Authorized decomposition/refinement/planning → their existing write
boundary → corresponding structured fact is recorded. Add one shared recording
procedure and concise links from callers; preserve missing-context checks and
uncommitted preparation disposition. Review source guidance under AGENTS.md.

### 5. Preparation completion assesses readiness without starting work
Type: Behavior
Status: done
Proof: Walkthrough of planning-only and plan-refinement requests records a blocking
reason, then ready after resolution, without Take/execute. Explicit planless
selection produces ready plus planless. Missing skip-planning authority cannot
be converted into planless by the recorder or guidance.

Accepted: shared assessment in `src/skills/dough-product-backlog/references/record-preparation.md` (planless authority refuses `--approach planless` when skip-planning authority is missing). Scratch `/tmp/slice5-assess-cTW6cV`: planned story `assessment` ready with document and plan digests; planless story `assessment` ready and no plan digest; no-authority story stays `unselected` with no assessment; backlog Taken empty. Not-ready recording itself remains the slice 3 tests.

Behavior: Preparing agent completes its review → assesses current content → records
ready/not-ready and reports evidence. Replace the old blanket no-certification
instruction while preserving execution authority boundaries. Criteria live in the
shared procedure and are used by both planning and plan-refinement callers.

### 6. Execution changes retain truthful readiness and slice evidence
Type: Behavior
Status: done
Proof: An execution/resume walkthrough changes an assessed plan's scope and records
a slice result; the shared reader reports reassessment needed until an actual new
assessment is recorded, while preserving done status and accepted proof. Taking or
resuming alone neither renews readiness nor derives it from membership. A context-only
quick instruction still creates no canonical record.

Accepted: `record-preparation.md` section Execution and resume. Scratch `/tmp/slice6-exec-DH6paE` re-read with `read-state`: `assessment.status` is `needs-reassessment` while `recorded` stays `ready`; `quick/075-walkthrough/PLAN.md` keeps `Status: done` and `Accepted:`; the story is in Taken. `/tmp/slice6-ctx-yORMfX` contains only `.planning/product-backlog.md`.

Behavior: Authorized execution changes story/plan content → existing delivery or
replanning boundary → updated plan evidence is published without stale readiness.
Align execution and wrap-up callers with canonical storage, preserving ordinary
source/plan cleanup and Git history. No new mandatory readiness gate or auto-start.

### 7. See published preparation and readiness on public-project cards
Type: Behavior
Status: done
Proof: Playwright journey obtains fixture records through the real CLI, commits them
to an isolated Git repository, and serves those exact revision bytes at the GitHub
HTTP boundary. Opening the dashboard shows labeled colors and independent facts
without hand-constructed display state. An unpushed edit is invisible. Assert
pinned revision, identity/order, distinct-file request counts, and no extra read
when opening already-loaded content. Include both public catalog projects.

Accepted: `npm run test:dashboard -- --grep 'story readiness'` passed after the card split (1 test, `dashboard/tests/story-readiness.spec.ts`). Setup is `storyReadinessFixture.ts`: real `record-state`, then `commitAll`, then an unpushed sentence. Observations: labeled badges, five public paths for three stories and two plans, no extra read when opening already-loaded facts, Doughnut planless plus ready and legacy Not recorded, unpushed text count 0. `node --test tests/support/story-state-browser-import.test.mjs` guards the pure reader import.

Behavior: Published preparation and assessment → open/Refresh → per-card facts from
one revision. Extend public reading, shared interpretation, typed projection, and
cards together. Preserve legacy inspection as Not recorded and explicit planless.
The fixture supplies remote transport, not the state-producing behavior under test.

### 8. Inspect the story and its recorded slice progress
Type: Behavior
Status: done
Proof: Browser selects a Taken story with five planned slices, then refreshes after
an isolated Git publication records two done with accepted proof. Detail shows the
purpose, two of five recorded complete, slice names/status/evidence, and pinned
links; prospective proof alone is never described as a passed result.

Accepted: `npm run test:dashboard -- --grep 'story readiness'` passed after the detail split. Setup is `publishTwoSlicesDone`, which writes two `Status: done` slices with `Accepted:` lines and commits only that plan. Observations in `dashboard/tests/storyReadinessDetail.ts`: `0 of 5 recorded complete` with no `Accepted evidence:`, then `2 of 5 recorded complete` with accepted evidence and a prospective proof recipe. Plan-reader and purpose tests are listed in `tests/product-backlog.sh`.

Behavior: Card selection → detail → supported purpose, assessment and slice facts.
Add the shared plan reader and accessible detail region. Keep Taken, readiness,
recorded completion, and actual closure distinct. Planless, no plan, unsupported
plan structure, and a done slice lacking accepted evidence remain understandable.

### 9. Keep evidence gaps and refreshes truthful
Type: Behavior
Status: done
Proof: Browser journey changes the assessed content without reassessment, introduces
a conflicting plan association, and fails one plan retrieval; each card retains
supported facts and names its dependent gap. Failed refresh keeps prior evidence
labeled with its original revision; Retry recovers. Switching projects during a
held read cannot leak its late result. Assert no polling or unbounded retries.

Accepted: `npm run test:dashboard -- --grep 'story readiness'` passed with 2 tests after the gap split. Setup appends seed prose or commits a disagreeing backlog plan link and does not plant the gap labels. Observations: `dashboard/tests/story-readiness-gaps.spec.ts` and `storyReadinessGaps.ts` / `storyReadinessRefresh.ts` — Needs reassessment, Plan association conflict, Readiness unavailable, prior revision retained, Retry, project switch, and no polling.

Behavior: Changed, missing, conflicting, or unavailable source → inspect/Refresh →
truthful scoped uncertainty without inventing unrefined, inactive, or completed.
Exercise malformed blocks, external navigation-only links, and old records through
shared interpretation rather than adding per-project fallback grammars.

### 10. Inspect private-project records through existing authentication
Type: Behavior
Status: done
Proof: Extend the synthetic-gh tests through actual dev and preview servers: select
Pygardon, read canonical/plan files pinned to the backlog revision, and observe the
same badges and detail. Arbitrary path/repository requests are refused; credential
markers remain absent. Held extra reads terminate on disconnect, timeout, and server
shutdown, and switching to a public project remains usable.

Accepted: `npm run test:dashboard -- --grep 'story readiness private'` passed with 2 tests (dev and preview) after the private-read split. Setup is real `record-state` committed into synthetic `gh` files. Observations in `dashboard/tests/story-readiness-private.spec.ts`: badges, `0 of 5` then `2 of 5`, allowlisted paths, credential marker absent from the browser and preview assets. Arbitrary path refusal and held extra-read cancellation stay in the existing private-read boundary and lifecycle specs.

Behavior: Private project selection/Refresh → bounded authenticated read → shared
story interpretation and display. Extend the existing private read path, not a
second authentication or state service. Server-side path reachability, deduplication,
and cancellation remain within the one existing boundary.

### 11. Read preparation and progress accessibly
Type: Behavior
Status: done
Proof: Keyboard opens/closes detail and returns focus to the originating card;
refresh preserves identity focus or announces removal. At 320px and 400% zoom,
labels/evidence/Retry remain reachable without page-wide horizontal scrolling.
Check badge text, contrast, reduced-motion behavior, and announcements with the
existing accessibility helpers plus computed-style/visual inspection as appropriate.

Accepted: `npm run test:dashboard -- --grep 'story readiness'` passed with 5 tests after the fixture split. Observations in `dashboard/tests/story-readiness-accessible.spec.ts` and `storyReadinessAccessible.ts`: keyboard returns focus to the card, refresh preserves or announces identity, contrast and reduced motion, 320px viewport with Retry in view and no sideways scroll. Setup remains CLI-committed readiness records.

Behavior: Keyboard, zoom, or color-independent reading → overview/detail/refresh →
all facts remain understandable and operable. This verifies the existing accessible
contract for the new UI, not a new animation or interaction framework.

### 12. Installed workflows can produce the records the dashboard reads
Type: Behavior
Status: done
Proof: Install/update isolated Codex, Cursor, and Claude layouts through actual
payload operations, then invoke the installed recorder from those layouts. Publish
the resulting fixture bytes and use the shared reader/dashboard journey to observe
the facts. Verify configuration and unrelated guidance preservation. Conduct the
representative skill behavior review separately from mechanical installation proof;
record native reuse or outstanding requirements honestly under ADR 0005.

Accepted: `bash tests/story-payload-update.sh`, `bash tests/product-backlog-payload-update.sh`, and `bash tests/install-all-tools.sh` exited 0 (Bash 5.3). `install.sh` now ships the story-state modules, `record-preparation.md`, and `executable-proof.md`. An isolated Cursor install invoked `record-state` and `read-state` and returned refinement refined, approach planned, with no assessment. The payload suite also ran that recorder after removing the release source and checked the shared reader on the published bytes. Native Codex, Cursor, and Claude Code host behavior was not exercised (ADR 0005). Post-change refactor: none — already clean.

Behavior: Project installs/updates the candidate payload → ordinary preparation
uses locally installed guidance/helpers → published records remain readable by the
dashboard. Align managed-files declarations, complete dependencies, fixtures, and
maintained docs. No production release/tag or hand-edited installed copies.

## Promise and proof ownership

| Promise | Owning slice(s) |
| --- | --- |
| Stable identity, one home, neighbor preservation, safe operations | 1–3 |
| Unrefined/refined/planned facts produced by normal preparation | 2, 4 |
| Assessment criteria, planless path, no execution permission | 3, 5 |
| Changed content and stale submissions cannot remain ready | 3, 6, 9 |
| Overview color and text, three-project coverage | 7, 10, 11 |
| Purpose, slices, completion evidence without invented activity | 6, 8 |
| Legacy records, conflict, unknown, partial read and Retry | 2, 8, 9 |
| Single-revision source evidence and bounded request budget | 7, 9, 10 |
| Private origin/authentication/lifecycle preserved | 10 |
| Accessible navigation, focus, contrast, narrow-screen use | 11 |
| Real producer-to-publication-to-display journey | 7, 12 |
| Standalone installed use across supported host layouts | 12 |

## Assessment and learnings

Slices 1–12 are done. Native Codex, Cursor, and Claude Code host proof was not exercised. No numeric
slice target or hard limit was supplied; use cohesive outcomes and bounded proof
loops, including focused verification and refactor. Do not borrow another project's
limits from retrospective examples.

Initial review identified two sizing risks: combining workflow preparation and
execution maintenance, and combining public and authenticated reads. The sequence
separates those outcomes, with each using the same record contract. No generic
framework or separate per-project grammar is needed. The conservative digest rule
trades occasional reassessment for avoiding an unreliable semantic change detector.

Slice 1 learning: later consumers, including slice 2, import `readHome` from `product-backlog-home-reader.mjs`. The filesystem wrapper keeps `openHome` / `recordIdentity` and re-exports only `impliedIdentity` and `namedIdentity`.

CI disposition: runs 35686421011 (`5951832`) and 35687189269 (`592bf8d`) cancelled the test job at the 20-minute job limit, with the same `sleep` orphan signature already present on planning-only `d7b91f3` (run 35685361715). Local `npm test` on this branch finishes in about two minutes. Not a slice repair. A later cancel with that same signature is the same disposition, including run 35697374868 (`d60d4b6`).

Dashboard runs 35691722486 (`f8093cd`), 35692670601 (`3b75c36`), 35694203239 (`42d8ee6`), 35695927585 (`df045a7`), and 35697374868 (`d60d4b6`) failed for one cause at current HEAD: overview cards now expose Inspect story and read in-repository canonical files, while older page-wide button and "no file body" assertions still described the pre-preparation overview. The repair keeps Retry/Refresh focus and the retained snapshot, and names the canonical reads. External and unsafe targets stay unread.

Remaining implementation risks are precise: canonical-file concurrency (slice 2),
legacy plan interpretation (slice 8), and private path authorization/process lifetime
(slice 10). Each has an owning proof and bounded existing entry point. No unresolved
product or architectural decision blocks planning. Missing execution mode, publication
authority, native release proof, and passing product tests are not supplied by this
plan and must not be reported as already established.


## Slice-plan refinement review (2026-09-22)

Reviewed under dough-slice-plan-refinement after writing the initial plan.
The cumulative model remains one canonical state block, one assessment rule,
one plan reader, and two existing transports feeding the same presentation.
The shared-seed basis initially omitted shared scope outside the selected story;
refinement changed it to the whole canonical document excluding state blocks.
This avoids silently retaining readiness after changing the seed's common scope,
with conservative sibling-prose reassessment explicitly accepted as a design cost.

Slices 1–9, 11, and 12 are Ready under the structural/behavior and proof-loop
assessment. Slice 10 initially bundled authenticated reading with lifecycle
regression observations; these protect the same extended read operation and its
existing lifecycle, so they remain one cohesive slice rather than separate host
implementations. It is Ready with the focused private-boundary suite as its proof
loop. No slice replacement or further subdivision is needed: 12 resulting slices,
no numeric sizing exception, and no story-resplit recommendation.

Assessment: ready for direct execution under the plan-refinement criteria;
execution remains unauthorized. This is a planning assessment, not evidence that
the proposed runtime record format or its producer operations already exist.
