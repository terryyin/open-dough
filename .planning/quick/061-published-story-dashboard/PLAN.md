# See the project's published work in a story dashboard

Status: executing since 2026-09-20; refined 2026-09-19 for connected stages
and just-in-time UX. Slice 1 resolved without change; slice 2 done; slice 3 is next.

## Execution identity

- Work item: `SEED-021#see-published-work`; claim commit `beafc8d` on local `main`.
- Mode: Story Branch Mode. Replanning: existing planning authority preserved.
- Originating and integration checkout: `/Users/terryyin/git/open-dough`, branch
  `main`, remote target `origin/main` (integration belongs to story wrap-up).
- Execution checkout: `.worktrees/061-published-story-dashboard` under the
  integration checkout, branch `claude/061-published-story-dashboard`, pushed to
  `origin` under the same name.
- CI source: GitHub Actions `ci.yml` / `CI` on the execution branch; Claude Code
  observer `/tmp/dough-ci-501/watch-bx7k1Z`.
- Delivery context: `npm run format` before staging; no commit hook is installed.

## Source and finish line

Source: [SEED-021 story 1](../../seeds/SEED-021-observe-published-story-progress.md#see-published-work).
The user authorized planning and refinement if needed, plus useful temporary
architectural direction. This is not authorization to implement or take work.

Finish with a locally launched connected-stage view of Open Dough's published
work: Backlog and Taken regions, readable ordered work cards, source navigation,
and truthful refresh, empty, and error states. Keep published direction and
source/refresh controls reachable. Include the minimal typed application, build, launch
documentation, and one new Playwright behavioral suite wired into existing CI.
No added owner/mode/branch fields, persisted story states, fetched story/plan detail, extra
projects, local locks, sign-in, database, hosted deployment, or automatic polling.
The selected story owns the full scope and examples; this plan owns their proof.
The animated, zoomable North Star is a direction, not an advance implementation
checklist. Ordinary layout, reflow, and scrolling can satisfy this story; add
only navigation or motion that solves a demonstrated problem reading its data.

## Architecture and PFE findings

Follow the short topic
[One backlog interpretation, separate observation and presentation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation).
Use the [UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md) only for
the selected overview and the [stack recommendation](../../../docs/dashboard-tech-stack.md)
with its first-story narrowing: React, strict TypeScript, Vite, runtime input
validation, and Playwright/Chromium. No application server or Vitest layer.

| Responsibility | Existing solution and selected treatment |
| --- | --- |
| Membership, entries, identity, and direction | Reuse `parseBacklog`, `identityFor`, and `directionOf` under `src/skills/dough-product-backlog/scripts/`. `document`, `identity`, `direction`, `source`, and `refusal` use browser-compatible language features and no Node imports. Do not use filesystem-based `readVersion` or `openHome` to read remote content. |
| Published plan-link compatibility | `product-backlog-document.mjs` currently accepts a parenthesized plan link but rejects the em-dash spelling in origin's Taken entry. Accept both spellings in that one reader while preserving canonical output and existing identity/distinct-work rules. No Markdown normalization copy in the dashboard. |
| Existing consumers | Add/place/take/complete/refresh/direction/adopt and merge validation consume the same document contract. The root insertion helper also calls `parseEntryLine`; retain it. Its separate missing-context add failure belongs to Plan 060, not this read repair. Existing mutation and merge fixtures supply preservation proof. |
| UI, remote access, and browser tests | No existing app or browser runner in the root manifest. Add a small `dashboard/` app, a fixed GitHub reader, and a typed snapshot at the existing reader boundary. Keep npm and one lockfile; do not migrate all backlog scripts to TypeScript. |
| Connected stages | No existing stage UI to reuse. Derive two regions, ordered cards, and their connector from existing membership; use ordinary HTML/CSS with SVG connectors if useful. Begin with layout/reflow and scrolling. A viewport framework, graph engine, canvas, stored coordinates, or invented lifecycle schema is not required. |
| Static checks and CI | Extend root scripts and applicable ESLint/Prettier coverage to new TS/TSX. Current CI has `lint` and `test` matrix entries on Node 24; `scripts/test.sh` discovers shell files only. Add an explicit dashboard CI entry that cannot be skipped by that discovery. |

The shared parser owns meaning; the dashboard projection owns only the fields
needed for display and their source revision. Treat existing JavaScript output
as unknown at the typed boundary and validate the consumed shape. The transport
resolves `main` to a commit then reads the backlog at that commit. The UI owns
transient loading/refresh/failure state and retains the last good snapshot.
The connector explains taking work; it does not create a workflow engine or
dependencies. If a reading need justifies focus/zoom or a small transition,
keep its presentation state separate and use only already-read entry facts.
Animation must never imply unobserved intermediate progress.
No event bus, global store, domain service hierarchy, or future schema is needed.

Accepted [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
supplies the work vocabulary; [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports one conceptual owner and useful small increments. [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
supports focused proof; this browser capability adds no native agent activation
or installation requirement. ADRs 0007 and 0008 remain Proposed. No Accepted
decision is changed and no exception is proposed.

## Observed assumptions and execution boundaries

Read-only preflight on 2026-09-19 used Node `fetch` without credentials, with
`Origin: http://localhost:4173`, against:

```text
GET https://api.github.com/repos/terryyin/open-dough/commits/main
GET https://api.github.com/repos/terryyin/open-dough/contents/.planning/PRODUCT-BACKLOG.md?ref=<resolved SHA>
Accept (second request): application/vnd.github.raw+json
```

Both returned HTTP 200 and `Access-Control-Allow-Origin: *`; resolved revision
was `903f9050266036004b67d26c91f30a04d6744c48`, content 2,233 bytes. Passing those
bytes to `parseBacklog` failed on the Taken entry's ` — [plan](...)` suffix.
This confirms transport access and the compatibility gap, not native-browser
success or app behavior. Slice 2 owns the actual browser observation.

To reproduce the transport/parser observation from the repository root:

```sh
node --input-type=module <<'JS'
import { parseBacklog } from './src/skills/dough-product-backlog/scripts/product-backlog-document.mjs';
const headers = { Origin: 'http://localhost:4173', Accept: 'application/vnd.github+json' };
const ref = await fetch('https://api.github.com/repos/terryyin/open-dough/commits/main', { headers });
if (!ref.ok) throw new Error(`Ref HTTP ${ref.status}`);
const { sha } = await ref.json();
const file = await fetch(`https://api.github.com/repos/terryyin/open-dough/contents/.planning/PRODUCT-BACKLOG.md?ref=${sha}`, { headers: { ...headers, Accept: 'application/vnd.github.raw+json' } });
if (!file.ok) throw new Error(`Backlog HTTP ${file.status}`);
const source = await file.text();
console.log(JSON.stringify({ sha, refStatus: ref.status, fileStatus: file.status, cors: [ref.headers.get('access-control-allow-origin'), file.headers.get('access-control-allow-origin')], bytes: Buffer.byteLength(source) }));
try { console.log(JSON.stringify({ parsed: true, entries: parseBacklog(source).entries.length })); }
catch (error) { console.log(JSON.stringify({ parsed: false, diagnostic: error.message })); }
JS
```

The observed revision is evidence, not the application's fixed read target.
On authorized execution, inspect changes from active Plan 060 before touching
shared reader files; reuse a delivered compatible fix if it already exists.
Preserve all current working changes. This plan allocates no execution branch,
worktree, mode, or observer; the authorized execution workflow resolves those.

## Proof and delivery contract

The following dashboard command names are proposed implementation contracts,
not existing scripts or passing checks:

- `npm run dev:dashboard`: documented local launch.
- `npm run typecheck:dashboard`: application, tests, and configuration.
- `npm run build:dashboard`: production assets.
- `npm run test:dashboard`: Playwright/Chromium; its web-server setup builds and
  serves the real app, so focused reruns cannot silently test stale assets.

Playwright substitutes raw GitHub ref and file responses at the external HTTP
boundary. It does not replace the parser, snapshot projection, or UI with mocks.
Use the same suite for success and error cases; no additional component/API
suite or browser matrix. Existing Node tests remain the proof for changed
shared backlog behavior. Broad CLI tests are preserved, not duplicated in UI.

CI retains existing `lint` and `test` checks and adds the dashboard suite, browser
installation, explicit type checking, and build on ordinary pushes/PRs. Keep
the suite independent of live GitHub and credentials; retain useful Playwright
failure traces as CI artifacts. Source HTML/text must render as data, with
unsafe navigation disabled rather than executing repository-supplied content.

On later execution, use this project's established implementation/proof,
independent post-change refactoring, and coordinator delivery gates. Run focused
proof per slice, plus required `npm run lint` / `npm test` and dashboard static
checks once available; do not repeat accepted unchanged proof without reason.
Publication, asynchronous CI observation/repair, retrospective, and cleanup stay
with the selected execution workflow. None runs during this planning request.

| Source promise | Proof owner |
| --- | --- |
| Current published syntax, existing identity/link meaning, no record migration | 1; integration through the browser in 2 |
| Fixed origin-only overview, direction, Taken/queue order, corrections, empty groups, no new metadata | 2 |
| Minimal app, strict typing, build/local launch, current CI runs one new suite | 2 |
| Connected Backlog-to-Taken stages and readable work distribution | 2; extended reading/accessibility proof in 6 |
| Canonical and plan navigation tied to inspected revision; safe text and links | 3 |
| Explicit refresh, coherent revision/time updates, changed placement without duplicates or invented activity | 4 |
| Initial read failure, invalid content, retained old snapshot after failure, retry | 5 |
| Readable presentation, keyboard access, narrow viewport and browser zoom; reduced motion if used | 6 |
| Real unauthenticated browser access, no developer-clone data source | 2; later changes must preserve that proof boundary |

## Ordered slices

### 1. Read the published plan-link spelling through the shared backlog contract
Type: Behavior
Status: resolved without change 2026-09-20 (explained empty change)
Proof: `bash tests/product-backlog.sh`

Reassessment: rerunning the reproduction above on 2026-09-20 resolved origin
`main` to `420d91e69868ec6dc8afaf399139e162b7bf8b17`; the unchanged shared
`parseBacklog` read all 13 published entries, and
`git log -S' — [plan]('` shows the em-dash spelling left the published backlog
at `5fb8979`. Scripted `take` now writes the parenthesized spelling. The seed
makes a reader repair conditional on the published document needing one, so no
reader change is made and "the published plan spelling" in slice 2 means the
parenthesized one. Plan 060 no longer exists. An em-dash record in another
project remains that later story's observation. The original intent below is
kept for review; reversing this decision restores it as written.

Extend the established entry reader to understand the published em-dash plan
suffix as well as its current parenthesized suffix. Both describe the same
optional plan; retain their title, identity, canonical href, and plan href.
Keep canonical writing unchanged and untouched source lines preserved. Do not
add a grammar mode, pre-normalization layer, or metadata migration.

Add focused cases to the existing Node-backed backlog suite: the published
spelling can participate in an ordinary supported operation with its information
intact; malformed details and duplicate identities still refuse without writes.
Reuse existing take/refresh/merge coverage for canonical output and identity
preservation. Retain the `parseEntryLine` export and its root consumer; do not
repair or remove that consumer's separate add-context bug.

Hypothesis: one read-compatibility behavior, with existing externally exercised
writer preservation. If Plan 060 already supplies it, inspect that proof and
record reuse instead of making another change. Safe stop: existing backlog tools
read both observed spellings; no dashboard completion is claimed.

### 2. Open the published work overview locally and verify it in CI
Type: Behavior
Status: done 2026-09-20
Proof: `npm run test:dashboard -- --grep 'published overview'`;
`npm run typecheck:dashboard`; `npm run build:dashboard`; actual local browser
read via `npm run dev:dashboard`; resulting ordinary CI check

Delivered 2026-09-20. Accepted proof: the grep command selects all three tests
in `dashboard/tests/published-work.spec.ts` (connected overview, empty groups
without direction, initial HTTP 403 read problem); `dashboard/tests/githubOrigin.ts`
supplies only raw ref/file HTTP answers and aborts other hosts. Type check,
build, `npm run lint`, and `npm test` under bash 5.3 exit 0. An unauthenticated
Chromium read of the real origin resolved `420d91e6…` with HTTP 200 and open
CORS, showing 2 Taken and 11 Backlog entries. The new CI `dashboard` job is
unobserved until this push's run reports.

Learnings for later slices: the snapshot (`dashboard/src/publishedWork.ts`)
validates only `identity`, `title`, and `list`; slice 3 adds `href` and `plan`
there and builds URLs from `source` plus `revision`. `App.tsx` holds one
`reading | read | failed` retrieval union driven by an abortable
`readPublishedWork(signal)`; slices 4–5 reshape it to keep the last snapshot
beside a pending or failed attempt. Cards are keyed by identity. A slice's grep
phrase selects only tests whose titles contain it, so title every test a slice
owns with that phrase. Playwright serves a fresh production build on strict
port 4188; `preview:dashboard` exists for that.

Deliver the first end-to-end origin-to-screen path using the fixed public
repository, `main`, and backlog path. Add only the application/tool/test setup
needed for this path. The reader resolves the ref then reads content at that
SHA, validates input, calls the shared reader, and produces a typed snapshot.
Render the connected Backlog and Taken stage regions with work cards in recorded
order and visible backlog priority. Label the connector as taking work; do not
add further stages. Show stage entry counts, direction when present, source
identity, revision, and retrieval time. Keep the header/control area outside
the stage. Empty groups and an absent direction are valid.
Show loading before data and a plain read failure on initial fetch failure;
the full retry/retention journey belongs to slice 5.

The Playwright journey uses raw HTTP fixtures with real parsing, including the
published plan spelling, an ordinary bounded correction, and entries without
owner/mode/state metadata. Assert connected regions, displayed membership/order,
and no live/completion claims. Establish Chromium, production-serving setup,
static checks, and the
explicit existing-CI integration now, rather than parking them as later setup.
No local backlog import, Node filesystem polyfill, or server endpoint belongs
in the browser bundle. Verify the actual browser can display the current origin
without credentials; use the recorded SHA and visible entries as the oracle.

Hypothesis: one complete initial overview journey. Bootstrapping the app and CI
is the largest slice cost but has one owned user proof; a setup-only slice would
leave the same proof unfinished. If it overruns, preserve work and reassess this
slice, not the product scope. Safe stop: a usable initially loaded overview,
tested in CI; source navigation, refresh, and broader readability proof remain
explicitly outstanding.

### 3. Open the source behind a displayed work item
Type: Behavior
Status: planned
Proof: `npm run test:dashboard -- --grep 'source navigation'`

Make recorded canonical and optional plan links usable. Resolve repository-relative
links against the backlog's directory into GitHub source URLs at the inspected
commit, preserving anchors. Keep supported external HTTP(S) links as external
references rather than pretending they identify files in this snapshot. Render
titles/direction as text, not trusted HTML; an unsafe or invalid target stays
visible with an explanation and no executable link. Do not fetch story/plan
contents or invent a detail page. Make the links reachable from the readable
work cards in the stage. Verify destination revision/path/anchor and
that hostile text and schemes do not execute. Use bounded-correction and story
links as examples of the same navigation rule.

Hypothesis: one source-navigation behavior; no general Markdown renderer or
link-validation crawler. Safe stop: source-backed overview with usable evidence
links, regardless of later refresh features.

### 4. Refresh to one coherent published revision
Type: Behavior
Status: planned
Proof: `npm run test:dashboard -- --grep 'refresh published work'`

Add explicit Refresh. A successful refresh resolves `main` again, reads at that
SHA, then replaces the old snapshot as one result, updating source links,
revision and retrieval time together. Disable duplicate refresh while the current
request is pending; do not introduce a scheduler. Keep the old snapshot visible
while refreshing without calling it new evidence.

Key cards by stable work identity and update their observed membership/order
between successful snapshots. New work enters its recorded region and removed
work leaves without an inferred Done destination. A small transition may help
explain an observed change, but exact animated travel is not an acceptance
criterion. If motion is used, the new snapshot is authoritative as one result,
controls stay usable, and reduced motion gives the same information. No
imaginary intermediate stages or activity loops. Preserve useful keyboard
focus across the update, with an announced fallback if focused work disappears.

Prove A-to-B queue/Taken changes appear once in B's order; if `main` advances
again while B's content is being fetched, the response still describes B rather
than combining versions. The same SHA may be freshly retrieved without claiming
new project work. No local edits or automatic polling trigger a refresh.
Verify useful focus and final membership; any transition is reviewed within
slice 6's bounded visual check, not through a new test layer or arbitrary sleeps.

Hypothesis: one refresh lifecycle, reusing the reader/snapshot from slice 2.
Safe stop: coherent successful refresh; failed-refresh recovery remains slice 5.

### 5. Preserve trustworthy information through read failure and retry
Type: Behavior
Status: planned
Proof: `npm run test:dashboard -- --grep 'read failure and retry'`

Complete the failure/recovery loop for initial and subsequent reads. Network,
HTTP/rate-limit, missing backlog, malformed shape, and invalid/duplicate entries
produce a read problem, not zero work or partial success. Bound waiting so the
user can recover from a stalled request; do not add automatic retry loops.
Preserve the old snapshot and its timestamp after failed refresh, distinguish
it from the failed attempt, and provide Retry. Initial failure has no invented
snapshot. Successful retry clears the failure and publishes one valid snapshot.
Failed refresh does not empty stage regions or move cards to another state.

Use representative transport and content failures through the same external
boundary fixtures. Assertions verify visible retained membership/source evidence,
not only an error message. An unknown field must not invent a new lifecycle
state or prompt the dashboard to repair project files.

Hypothesis: one retained-snapshot/retry behavior with variations. Safe stop:
normal and failed reads communicate their evidence limits and can recover.

### 6. Read and navigate the stage with keyboard and a narrow viewport
Type: Behavior
Status: planned
Proof: `npm run test:dashboard -- --grep 'accessible overview'`

Complete the selected UX hierarchy and visual treatment across the stage
journey. Keep long titles and identity/links legible, including when the backlog
exceeds one screen. Source refs, direction, empty/error text, and controls remain
reachable at narrow width and browser page zoom. Reflow connected regions and
use ordinary scrolling first. Only if those fail this reading journey, add the
smallest focus/fit or zoom behavior with a way back to the overview; do not
build a general camera or gesture system. Semantic groups and named links/controls
have visible focus, source reading order, and keyboard operation independent
of coordinates. Refresh completion or failure is announced without stealing
focus; status meaning never depends only on color.

Use the same Chromium suite with keyboard traversal and narrow viewport; keep
one representative visual check of connected-stage composition, readability,
contrast, and any motion that endpoint assertions do not establish. If motion
is introduced, cover reduced motion in this same suite. No snapshot-baseline
platform, component library, or extra view is introduced. Source and status
assertions reuse earlier journeys where unchanged.

Hypothesis: one accessible reading/navigation journey. Safe stop: the selected
story's full usable overview, with no later dashboard capability required.

## Sizing and remaining concerns

Six Behavior slices, all planned. No numeric target, hard limit, or exception
was supplied. No Structure slice is justified: the existing reader is already
pure, and the minimal app setup belongs to the first visible journey.

The cumulative design has one shared interpretation and one snapshot/retrieval
model. Later slices add source navigation, refresh, recovery, and readability
around the connected stages; they do not add competing state stores or special
story kinds. All source
promises have proof owners above. No count-based resplit concern was identified.

Slice 1 shares files with active Plan 060, so its current delivered state must
be checked at execution. Slice 2 has the largest setup cost; native browser access
is still unproved despite the successful HTTP/CORS preflight. Readability of
long/large backlogs and narrow-screen stage composition need the bounded review
in slice 6. No separate pan/zoom or animation slice is justified by the current
reading goal; reassess only against concrete evidence from that journey. Those
are the remaining concrete execution/sizing concerns, not permission to expand into an
application server or broader project support. This assessment does not claim
that product proof has passed or grant execution authority.

Keep this plan through execution and retrospective. Ordinary wrap-up owns its
cleanup and review of the linked North Star topic; retain that topic if other
active work still depends on it.
