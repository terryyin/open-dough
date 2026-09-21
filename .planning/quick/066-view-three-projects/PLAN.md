# View three projects independently from one dashboard

Status: planned; no execution started.

## Source and outcome

Identity: `SEED-021#observe-another-project`.
Source: [Use the dashboard for another Open Dough project](../../seeds/SEED-021-observe-published-story-progress.md#observe-another-project).
Human clarification, 2026-09-21: Open Dough, Doughnut, and Pygardon are independent
projects that all consume Terry's time. One place to inspect them is useful;
shared work and coordination across them are not requested. Project metadata
may be hardcoded. Existing authenticated GitHub CLI access is accepted for
private Pygardon. This instruction authorizes planning and plan refinement only.

Deliver a locally launched dashboard with one selected project's existing
published overview visible at a time. Default to Open Dough. Preserve direction,
Taken membership, queue order, source links, revision evidence, manual refresh,
read failure recovery, keyboard use, and narrow-screen layout. Project selection
remains usable during retrieval and failure. Public projects remain readable
without authentication; private Pygardon uses existing local authentication.

Exclude combined portfolio views, global prioritization, cross-project work or
coordination, time tracking, arbitrary project setup, account management, hosted
deployment, automatic polling, selection persistence, richer story details,
execution-branch inspection, ownership production, and local operational state.
Read-only origin observation excludes reading local checkout contents as progress.
No backlog edits, observed-project migrations, or installed guidance changes.

## Current decisions and architectural evidence

Follow Accepted [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
and [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
keep work identity and publication meanings intact, use one representation per
responsibility, and deliver bounded useful changes. The ADR index and record
statuses agree; ADRs 0007/0008 remain Proposed, not adopted by this plan.

Follow [North Star: One backlog interpretation, separate observation and presentation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation).
The browser continues interpreting raw backlog text through the existing shared
reader. Credentials and process invocation belong in the local launch process.
The accepted local-authentication requirement needs a small authenticated read
boundary, not a stateful service or new project authority.

PFE assessment of current product:

- `dashboard/src/publishedSource.ts` owns the fixed source. Change it into one
  typed catalog of the three named repositories, all on `main` with backlog
  `.planning/PRODUCT-BACKLOG.md`. Carry source explicitly through acquisition,
  projection, link resolution, display, and observation identity.
- `githubSource.ts` already resolves a ref and reads content at that SHA. Reuse
  its public path and external-response validation. `publishedWork.ts` owns
  shared interpretation and the overall read deadline. Keep one projection
  from source, revision, and raw backlog into `PublishedWork`, regardless of
  transport. No second Markdown parser or private-project rendering path.
- `sourceLink.ts`, `App.tsx`, and `workFocus.ts` already own source links,
  observation/retry, and focus. Extend their source context; work identities are
  meaningful within a project and cannot transfer focus across projects.
- Existing CI acquisition in
  `src/skills/dough-execute-plan/scripts/ci-runs.mjs` demonstrates bounded,
  noninteractive `execFile("gh", args)` with cancellation. Its CI-run semantics
  are not a repository-content reader; importing that module would couple
  unrelated responsibilities. Use the process technique in a small dashboard
  server module, without creating a common command framework.
- No existing dashboard server reader was found. The installed Vite API exposes
  both `configureServer` and `configurePreviewServer`; mount the same narrow
  middleware in both existing launch modes. Keep Node code outside the browser
  import graph and include it in the Node TypeScript check.

For Pygardon, a same-origin local endpoint accepts the selected catalog identity,
resolves its recorded ref with `gh api`, then reads the backlog at that SHA and
returns validated revision plus raw text. The browser uses the common projection.
The endpoint accepts no arbitrary shell command, URL, repository, or file path.
Bind the authenticated launch surface to loopback, verify the request host/origin,
allow no cross-origin reads, and mark private answers non-cacheable. Invoke `gh`
with argument arrays and noninteractive mode. Do not export credentials to the
browser, build assets, logs, or fixtures. These restrictions follow from exposing
existing local credentials, not from a general authentication-platform story.

Public browser HTTP and private local process access are two transport needs,
not two domain models. Future detail work should extend the same published-read
responsibility only when selected. No provider abstraction, database, catalog
editor, or persistent cache is needed now.

## Planning evidence and assumptions

All three published backlogs passed the current shared `parseBacklog` during
refinement. Open Dough at `485cc20d825065bb0c9c1bacd9356471d31f45bd` and Doughnut
at `2e8cf08e01c55caa60fa8b161716ccfd5acf4d76` were publicly readable. Pygardon
metadata confirmed a private repository; existing CLI access succeeded.

The uncertain private-read assumption was checked independently of product code:

```sh
gh api repos/terryyin/pygardon/commits/main --jq .sha
gh api -H 'Accept: application/vnd.github.raw+json' 'repos/terryyin/pygardon/contents/.planning/PRODUCT-BACKLOG.md?ref=2f0a9b32b6c51ddbc53eecaf01de420ce34d1c6a'
```

Result on 2026-09-21: resolved SHA
`2f0a9b32b6c51ddbc53eecaf01de420ce34d1c6a`, 4,043 bytes of backlog text returned
at that same revision, with Taken and Backlog list sections. No private contents
or credentials need be retained as fixtures. This proves the authenticated origin
read, not the unimplemented browser/server journey. Repeat against a newly
resolved SHA only if environment/access changes invalidate the assumption.

A successful selection/refresh needs one ref read and one pinned file read.
There is no prefetch of all projects, retry loop, story-detail fetch, or polling.
Browser links into private GitHub still use ordinary GitHub browser access;
CLI authentication does not sign the browser into GitHub. Correct link identity
is promised, not a browser single-sign-on flow.

## Outside-in proof and gates

Existing proof entry: `dashboard/tests/*.spec.ts`, built app served by
`dashboard/playwright.config.ts`. Existing public fixtures replace GitHub HTTP
only; the real acquisition, parser, projection, and UI execute. Preserve these
checks instead of replacing them with prebuilt snapshot fixtures.

Private proof must exercise the real browser request, local middleware, process
invocation, projection, and UI. Supply a controlled `gh` executable through the
test server's PATH that returns synthetic raw GitHub answers and records argv;
do not stub the local endpoint or return a prebuilt `PublishedWork`. Use a
separate isolated test server for private scenarios so parallel public tests
cannot share mutable process-fixture state. Deny unexpected invocations and
external network access in this test path. Run its browser cases in both dev and
built-preview launch modes. Keep the fixture and launch wiring with its owning
slice; it is not another production service.

Planned spec names below are proof owners to create, not existing passing tests.
Focused command for each browser owner:
`npm run test:dashboard -- --grep '<owner tag>'`.
After touched code: `npm run typecheck:dashboard`. Before delivery, run the whole
`npm run test:dashboard` suite and `npm run lint`; the existing dashboard CI job
must include the new private journeys. No shell/installer suite expansion unless
the change actually touches those responsibilities. Build is already included
in the browser command. Use the execution workflow's independent post-change
refactor and review gates before any authorized commit/delivery; descriptive
imperative commit subjects match this repository. This plan authorizes no commit,
push, release, implementation, or Taken transition.

## Ordered slices

### 1. Select a public project's published overview

Type: Behavior
Status: done

Behavior: Given the default Open Dough view, select Doughnut and then Open Dough;
the selected project's direction, membership/order, source evidence, and pinned
canonical/plan links appear using the existing overview.

Change the fixed source into the catalog and pass source through the complete
read/projection/link path. Add a labeled selector and clear retrieval/focus state
on selection. Pygardon may be added to visible choices with slice 3 when readable;
this intermediate public-only stopping point must not imply private support.
Preserve empty/no-direction handling, keyboard selection, and narrow layout.

Proof: `project selection` browser tag in a new project-selection spec; synthetic
public origins contain different work and revisions, including a shared story
identity. Assert selected-source links, queue order, successful return, and no
automatic request to an unselected project. Extend existing origin helpers by
source rather than cloning them. Existing overview/accessibility tests remain.
Sizing: one source-selection journey, ordinary component/function changes;
medium confidence, with existing single-source assumptions enumerated above.

### 2. Prepare the local authenticated read boundary

Type: Structure
Status: planned

Structure: Add the bounded local `gh` acquisition and same middleware registration
for dev/preview, isolated from browser imports. This directly enables slice 3;
the visible public-project behavior stays unchanged. Return revision and raw
backlog only, with safe failure categories; use the catalog as the source owner.
Implement loopback/host/origin limits, permitted read-only request shape,
non-cacheable responses, and bounded cancellable subprocess ownership here.
Prepare the synthetic executable fixture alongside this boundary. Preserve the
existing 30-second overall read bound; cancellation, timeout, and server shutdown
must end owned subprocess work rather than merely discard its answer.

Proof: focused server-boundary tests use real HTTP middleware and a controlled
subprocess to assert pinned-ref arguments and refusal before subprocess launch
for requests outside the supported endpoint/catalog or origin. Assert credential
markers are absent from responses/errors. Existing public browser journeys prove
unchanged visible behavior. At the same real middleware/process boundary, hold
the synthetic process and observe its termination on timeout, request disconnect,
and server shutdown; assert bounded completion and no surviving owned process.
Use short test deadlines without changing the production bound. Include these
focused tests in dashboard CI, using
the existing TypeScript/Playwright tooling rather than a new test framework.
Sizing: one local acquisition boundary; medium confidence. No UI, format changes,
or generalized credential manager. If wiring both modes differs materially,
reassess this slice before adding duplicate implementations.

### 3. Read Pygardon with existing authentication

Type: Behavior
Status: planned

Behavior: Given a locally launched dashboard with working existing GitHub access,
select Pygardon and see its published direction, Taken entries, queue, and pinned
links through the same overview, with no dashboard sign-in.

Connect the private transport to the common raw-record projection and expose
Pygardon in the selector. Validate the local answer as external input. Document
the ordinary launch route and existing `gh` access prerequisite, including that
built preview needs the local read middleware. No token entry UI.

Proof: `private project overview` browser tag traverses the complete production
path with the controlled executable in dev and built preview. Assert that the
second CLI call uses the first call's SHA and only read operations, then inspect
the actual rendered Taken/queue and source links. Credential markers must not
appear in browser requests, responses, storage, or built assets. The earlier live
CLI evidence proves actual access; the controlled journey proves application
composition without publishing private data to CI.
Sizing: one selector-to-private-overview proof loop after slice 2 preparation;
medium confidence. Safe stopping point: all three projects are viewable.

### 4. Keep the selected project authoritative during overlapping reads

Type: Behavior
Status: planned

Behavior: Given an outstanding read, select another project; a late success or
failure from the previous selection cannot replace the selected project's
observation, retain its work under the new label, or move focus to its cards.

Reuse one selection/request lifetime rule and abort ownership. No per-project
state machines or persistent snapshot store. Returning to a project starts a
fresh read. Same-project refresh focus retention remains supported.

Proof: `project read isolation` browser tag holds and releases public/private
read responses in reverse selection order, including A→B→A and identical work
identities. Assert the selected project throughout loading, success, and failure;
selector remains keyboard-operable. Test a late failed response as well as a
late success. Focus stays in the selection context across project changes.
Sizing: one observation-authority rule and its race boundaries; medium confidence.
If slice 1 already supplies the rule, retain it and add only missing proof.

### 5. Recover from unavailable private access without losing project context

Type: Behavior
Status: planned

Behavior: Given an unavailable Pygardon read, see a project-specific actionable
failure; after restoring existing access, Retry reads that project's published
work. A public project remains selectable without private authentication.

Use the same observation/failure semantics for missing `gh`, denied access,
failed network, unsupported backlog, and a bounded stalled read. Report only
facts supported by the error: an inaccessible/not-found private source is not
proof that the repository does not exist. Never surface raw secret-bearing CLI
stderr. Reuse slice 2's bounded cancellation and process-lifecycle behavior.
No automatic login, retry, fallback to another project, or empty-success view.
Document the recovery action where access setup is required.

Proof: `private project recovery` browser tag controls CLI refusal, restoration,
and a held read. Assert Retry, successful recovery, public selection, absence of
old-project work, and retention of only the same project's previous snapshot
on failed refresh. Existing parser-refusal cases exercise the common projection.
Reuse slice 2's process-lifecycle proof; this slice observes the timeout as a
recoverable UI failure. Do not revoke real user credentials to test failure.
Sizing: one failed-read/retry lifecycle; medium confidence. Keep lifecycle proof
in the same failure owner rather than adding background process machinery.

## Promise coverage

| Promise | Owning slice |
| --- | --- |
| Default and public selection; direction, order, evidence, links, empty records | 1 |
| Keyboard selector and narrow-screen preservation | 1; selection focus/races in 4 |
| Local private boundary; read-only catalog scope; credentials stay local | 2, composed browser proof in 3 |
| Pygardon success and documented local dev/preview launch | 3 |
| No old-project state or late response contamination; identity scoped by project | 4 |
| Actionable failure, retry, public independence, same-project stale snapshot | 5 |
| Bounded private process lifetime and sanitized failures | 2; visible recovery in 5 |
| Existing overview and public unauthenticated behavior | Existing suite throughout; final complete suite |

## Cumulative design and sizing assessment

One catalog source, one ref-pinned raw observation, one backlog interpretation,
and one selected-project retrieval lifetime support every example. Authentication
changes transport only. No new lifecycle state, project coordination model, or
second grammar is introduced. Slice 2 is immediately before the only Behavior
it prepares. Each final slice has one behavior or structure gate and a bounded
proof owner; related boundary cases do not create independent product outcomes.

No numeric slice target, hard limit, or exception policy was found in supplied
project guidance. Judge boundedness by the proof loops above; do not import timing
rules from retrospective reports about other projects. Include focused verification
and local cleanup in each slice. On an unexpectedly large integration change,
record evidence and refine remaining work in this plan; scope/ADR conflicts remain
human-owned. Preserve completed proof and unrelated working changes.

## Current learnings and execution state

Slice 1 delivered 2026-09-21 on branch `claude/066-view-three-projects`. The
fixed `publishedSource` became a two-entry public catalog (`open-dough`,
`doughnut`) in `dashboard/src/publishedSource.ts`; `source` now threads through
`publishedWork.ts` (`readPublishedWork`/`interpret`) instead of a module-level
constant. `App.tsx` gained a labeled, keyboard-reachable project `<select>`
that clears retrieval/failure/held-focus state and starts a fresh read on
selection; extracted into `ProjectSelect.tsx`, `SourceStatus.tsx`, and
`Moment.tsx` during post-change refactor to keep `App.tsx` under the file-size
convention. `dashboard/tests/githubOrigin.ts` now parameterizes by repository
(`originAnswers.ts` split out for the same reason) so a test can mock two
public origins on one page; `pageLayout.ts`'s narrow-layout overflow check now
exempts native form controls from the authored-CSS heuristics while still
checking real overflow. Pygardon is intentionally absent from the catalog —
slice 3 adds it once its private read boundary exists.

Proof: `npm run test:dashboard -- --grep 'project selection'` (2/2),
`npm run typecheck:dashboard` (clean), `npm run test:dashboard` full suite
(30/30), `npm run lint` (clean) — all rerun and inspected by the coordinator
after refactor, not merely reported.

Actual private GitHub access is proven only by the planning read above. The
local middleware and its dev/preview/test composition still require slices 2–3
proof. Keep successful execution evidence and consequential learnings here;
operational agent/CI state belongs in the execution conversation. Keep this
plan through retrospective and story wrap-up.

## Slice-plan refinement assessment, 2026-09-21

Applied after initial construction under Terry's explicit instruction to refine
if needed. The original failure slice mixed a browser recovery journey with a
separate subprocess lifecycle proof. Moved lifecycle behavior and proof to the
existing local-boundary Structure slice (2), where process ownership already
belongs; slice 5 now owns only the observable recovery journey. No new source
outcome, plan, story, or backlog change was introduced.

Final classification: slices 1–5 Ready. Five slices; no numeric sizing exceptions
and no story-resplit recommendation. The coherent catalog/observation model is
supported by existing code and actual private-access evidence. The remaining
integration work is explicit in slices 2–3 and cannot be claimed proven before
those checks run. No further slice-specific subdivision concern was identified
in this assessment. Ready for direct execution when separately authorized;
this planning request has not started execution.
