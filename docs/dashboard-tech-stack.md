# Dashboard technology recommendation

**Status:** Proposed recommendation for discussion; no ADR acceptance or implementation authorization.

**Date:** 2026-09-19

## First-story application

The first overview, for Open Dough's public GitHub `main` and launched locally,
is built and described in the [dashboard README](../dashboard/README.md).
That bounded overview uses the simpler static UI/browser-read option below,
with React, strict TypeScript, Vite, runtime validation, and one new behavioral
suite: Playwright on Chromium. Include type checking, lint, production build,
and the browser suite in existing CI; preserve existing repository tests.
No application read server, Vitest/component-test layer, browser matrix,
sign-in, or hosted deployment is required by that overview. Every project now
reads through a local `gh` read boundary; see the
[dashboard README](../dashboard/README.md) for current behavior.

The interface direction is an animated, zoomable **connected-stage view**.
The first story needs a readable connection between Backlog and Taken, entry
facts, evidence links, and refresh. Begin with semantic HTML work cards and
controls, ordinary CSS layout, and simple SVG connectors if useful. Wrapping,
reflow, and scrolling may be sufficient now. Add transforms, viewport state,
or motion only for a demonstrated reading or orientation need. This is an initial
implementation direction, not a canvas prohibition: choose a different renderer
only for a demonstrated need, preserving accessible content and controls.
Neither a graph-layout engine nor an animation framework is a prerequisite for
two connected stages. If navigation or animation is introduced, keep its state
separate from published facts, honor reduced motion, and retain normal browser
page zoom. The same Playwright suite covers the actual reading/navigation and
refresh behavior; no speculative test layer is added for the longer-term UX.

The broader recommendations below remain options for later needs. They do not
expand the selected story or require all test layers to be established up front.

## Recommendation

Use **React + TypeScript + Vite**, **Zod** for runtime validation, **Vitest** for
domain and reader tests, and **Playwright Test** for browser behavior. Keep npm,
ESLint, and Prettier. Use semantic HTML and CSS Modules initially; no component
suite, global state store, charting library, or routing framework is required
for the first story view.

Recommend a **small stateless Node.js 24 read adapter** alongside the static UI.
It reads the observed project's published Git data and returns a validated
snapshot. It has no application database, persistent project index, background
scheduler, Git write capability, or dependency on a developer's checkout.
This is one small application with a read boundary, not separate infrastructure
services. The extra runtime buys a single place to resolve refs, aggregate
records, report partial reads, and keep credentials outside the browser.

If the selected repository is public and its hosting API supports browser reads
within practical rate limits, a static UI calling that API directly is a
credible reduction: move the same reader into the browser and omit Node at
runtime. Do not implement both deployments in the first increment. The target
repository and access conditions must settle this choice before implementation;
private access is not assumed by this recommendation.

Initially **one observed project is hardcoded in the dashboard project's
code/configuration**. Terry has selected Open Dough's public GitHub repository
for the first story, with `main` as the observed integration branch and local
launch. Additional repository/access choices below apply only to later scope.
There is no project picker, registration service, or project catalog. Repository
identity and supported record locations are deployment configuration; all
authoritative progress remains in that observed project's Git repository.

## Scope and architectural constraints

The first useful outcome is the story perspective from committed state
published to origin, including relevant remote branches and history. Stories
may exist outside the backlog. Backlog/Taken, refinement, planning, assignment,
execution mode, and slice completion are separate facts with separate evidence.
Taken never means a live agent is running. An absent owner remains unrecorded.

Default-checkout coordination, local freshness, and live activity belong to a later
stage. Feature and structural perspectives are independent future possibilities,
not entities or services to scaffold now. Recently finished work is also not a
reason to build a historical analytics platform in the first increment.

This assessment uses the supplied discussion requirements and Proposed ADR
0008 as design inputs, including Terry's later hardcoded-project and
no-database constraints. Those discussion files were read from the original
checkout; they were not copied or edited here. It follows:

- [ADR 0000 — Use Architectural Decision Records](adrs/0000-use-adrs-accepted.md):
  acceptance and exceptions remain human-owned. This document is a recommendation.
- [ADR 0001 — Ubiquitous language](adrs/0001-ubiquitous-language-accepted.md):
  preserve story identity and the distinction between stories, seeds, and slices.
- [ADR 0002 — Software development lifecycle principles](adrs/0002-software-development-lifecycle-principles-accepted.md):
  map code to domain concepts, keep one owner for each rule, and choose the
  smallest useful outcome with inexpensive feedback.

The index and record statuses agree for Accepted ADRs 0000–0006; no
supersession or conflict affecting this recommendation was found. ADRs 0007 and
0008 remain Proposed. No release, installer, installed guidance, or host
integration change is proposed. Existing native-agent validation under
[ADR 0005](adrs/0005-cross-tool-validation-accepted.md) remains distinct from
the dashboard's browser tests.

## Existing capabilities and reuse

Inspection baseline: Open Dough commit
`dac740bf1572bb384cace73d2dee4b6c97f7c4ce`.

| Existing capability | Consequence for the dashboard |
| --- | --- |
| Root `package.json` and `package-lock.json`; Node scripts; CI on Node 24 | Retain npm and the existing toolchain rather than introducing another language or package manager. |
| ESLint and Prettier, currently configured for JavaScript/JSON; shell-based test entry point | Extend coverage to TypeScript/TSX and dashboard checks when implementing; the present lint command does not establish TypeScript correctness. |
| No existing React/Vue app, TypeScript compiler, browser runner, or server in the package manifest | This is a new UI capability; there is no established UI framework to preserve. |
| Pure backlog document and identity parsing under `src/skills/dough-product-backlog/scripts/` | Reuse established backlog interpretation rather than writing a competing Markdown parser. |
| Separate filesystem store, mutation, and lock operations | Do not import the writer/store into the remote reader or interpret its local locks as published activity. |

Specifically, reuse the semantics of
[`parseBacklog`](../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs)
and [identity handling](../src/skills/dough-product-backlog/scripts/product-backlog-identity.mjs).
These modules accept text or values rather than requiring a checkout. A typed
boundary should treat their current JavaScript output as `unknown`, validate
the fields consumed, and retain existing behavioral fixtures. A handwritten
declaration alone is not proof that the JavaScript returns the promised shape.

The [canonical-home module](../src/skills/dough-product-backlog/scripts/product-backlog-home.mjs)
also contains relevant identity rules but imports filesystem operations. If its
reading behavior is needed, expose the pure text-reading responsibility from
that owner during implementation, with existing callers preserved. Do not copy
its rules or migrate all workflow scripts to TypeScript as a dashboard prerequisite.

The current backlog grammar does not provide the proposed owner/mode/remote
branch metadata. Reuse does not make those missing facts available. Story
discovery outside the backlog and interpretation of refinement/plan evidence
still require agreement on the observed project's supported record formats.

## Stack and tradeoffs

| Responsibility | Selection and rationale |
| --- | --- |
| UI | React with TypeScript/TSX: explicit typed component inputs and ordinary JavaScript module boundaries. React's documentation describes Vite's React/TypeScript setup, while warning that framework-free apps must own routing and fetching decisions. The first single-project read view does not need SSR or server components. [React guidance](https://react.dev/learn/build-a-react-app-from-scratch) |
| Build/development | Vite and its official React integration: fast development feedback and static production assets. Vite transpiles TypeScript but does **not** type-check it; a separate compiler check is mandatory. [Vite guide](https://vite.dev/guide/), [TypeScript behavior](https://vite.dev/guide/features) |
| Runtime validation | Zod, using schemas to infer boundary types and `safeParse` to make invalid input explicit. Keep domain computations in ordinary TypeScript. [Zod basics](https://zod.dev/basics) |
| Remote reader | Node.js 24, matching existing CI and an LTS release line; built-in HTTP/fetch for the small read surface. Compile reader TypeScript to JavaScript for production. A framework and ORM add no useful capability to this initial boundary. [Node releases](https://nodejs.org/en/about/previous-releases), [HTTP API](https://nodejs.org/api/http.html) |
| Tests | Vitest for fast TypeScript domain/adapter examples; Playwright Test for real browser journeys. [Vitest guide](https://vitest.dev/guide/), [Playwright introduction](https://playwright.dev/docs/intro) |
| Formatting and lint | Existing ESLint/Prettier plus typescript-eslint's type-aware checks. [Configuration guidance](https://typescript-eslint.io/users/configs/) |

These are package-family choices, not a tested lockfile. At implementation,
select mutually compatible stable releases and commit exact resolved versions
through npm's lockfile. Do not use canary versions or claim an uninstalled
combination has passed compatibility checks. Node 24 is the proposed runtime
baseline; this assessment does not change the repository's broader engine range.

Three credible UI choices suffice:

| Option | Assessment |
| --- | --- |
| **React + Vite + small reader** | Recommended. Keeps the visual app and evidence-reading boundary understandable, with no rendering framework or database lifecycle. The cost is explicitly owning a small fetching/error flow. |
| Vue + Vite + the same reader | Equally credible for strict application code; Vue documents TypeScript support and `vue-tsc` for single-file components. Prefer it if the maintainers have a concrete Vue preference. React is selected for TSX's direct TypeScript checking model, not because Vue cannot be strongly typed. [Vue TypeScript guide](https://vuejs.org/guide/typescript/overview.html) |
| Next.js + TypeScript | Credible if server rendering, many routes, or broader server behavior becomes necessary. It can run without a database and supports static exports, but static export has limits on server-dependent features. Its additional server/client rendering conventions are not justified by this one read view. [Static export documentation](https://nextjs.org/docs/app/guides/static-exports) |

A Rust/Elm-style language could provide stronger language-level guarantees than
TypeScript. It would also introduce a second ecosystem or UI/JavaScript boundary.
For this small conventional web app, strict TypeScript plus validated input and
enforced escape-hatch rules is the better balance. TypeScript is not a sound
proof system; the proposal does not describe compiler success as runtime safety.

## Very strong typing in practice

Require `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
`noImplicitReturns`, `noFallthroughCasesInSwitch`, and `noImplicitOverride`.
Type-check browser code, reader code, fixtures, tests, and configuration with
appropriate browser/Node libraries. Keep browser modules from importing server
credentials or Node-only code. The compiler flags and their meanings are
documented in the [TypeScript configuration reference](https://www.typescriptlang.org/tsconfig/).

Use type-aware ESLint rules to catch unsafe `any`, floating promises, and
non-exhaustive discriminated-union handling. Do not silence unknown input with
`as Story`, non-null assertions, or unchecked JSON generics. A narrow, justified
interop assertion must live at the boundary and have a meaningful test.

The data path should be explicit:

```text
published refs / trees / blobs / history
  -> validate host response shapes and decoding
  -> parse supported repository records
  -> validate record meaning and identity
  -> derive stories with source evidence and read coverage
  -> validate serialized snapshot
  -> render typed UI
```

At HTTP, Markdown/frontmatter, old JavaScript, and browser-cache boundaries,
input begins as `unknown` or raw text. Zod validates parsed data, not Markdown
syntax by itself. Infer transport types from the schemas instead of maintaining
parallel interfaces that can drift. Validate only the host response fields
actually used; unrelated additive host fields need not break a read.

Use domain names such as `StoryId`, `CommitId`, `SourceEvidence`, `Assignment`,
`ExecutionMode`, and `SliceCompletion`. Branded identifiers help prevent mixing
a story ID, branch name, and commit ID. Source evidence carries repository
identity, ref, resolved commit, path/anchor, and observation time. Do not identify
stories by title, owner, or execution branch.

Model recorded facts separately from evidence availability. For example:

- A backlog fact can be recorded Taken, recorded queued, or established absent
  from a successfully read backlog. A failed backlog read establishes none of these.
- Assignment can be recorded or unrecorded; it is not the most recent commit author.
- Execution can be recorded Trunk Mode, recorded Story Branch Mode, or unknown.
  An incomplete branch-mode record stays incomplete; no branch name is invented.
- Refinement, planning, and completed slices need their own evidence. Missing a
  plan can mean unsupported, unrecorded, unavailable, or legitimately planless;
  it is not automatically zero percent complete.
- Conflicting published records retain both sources and a diagnostic. Do not
  choose a winner by commit timestamp or collapse all facts into a linear status enum.

These are modeling constraints, not a final repository schema. Runtime checks
must also reject or diagnose duplicate/conflicting identities, broken plan
references, unsupported metadata, and invalid completion counts. A well-shaped
JSON object is not enough to establish truthful progress.

## Obtaining published Git data with minimal runtime

Implement **one** host adapter for the actual origin once identified. Do not
build a provider plugin system. If it is GitHub, its REST APIs can list
[branches](https://docs.github.com/en/rest/branches/branches), read
[trees](https://docs.github.com/en/rest/git/trees), and inspect
[commits/history](https://docs.github.com/en/rest/commits/commits). This is a
concrete feasible route, not evidence that the observed project uses GitHub.

Resolve trunk and the relevant remote refs to commit IDs before reading their
files. Read each ref's records at that pinned revision. Discover supported story
homes as well as backlog links, including relevant branch-only records; do not
limit discovery to Taken entries. Reconcile by recorded identity with provenance.
Read Story Branch Mode progress from its recorded remote execution branch, and
Trunk Mode progress from trunk. Do not overlay every branch copy of the backlog
onto trunk or infer ownership from a branch naming convention. The exact
cross-ref authority rules remain a domain decision.

Multiple refs are not an atomic global snapshot. Report the resolved revision
set and observation time. If a ref disappears or required content becomes
unavailable during a read, report that scope as incomplete rather than silently
substituting the latest trunk content. Branch removal, file deletion, and
unreachability do not independently prove story completion. History can recover
published evidence after cleanup only while the relevant commits remain
available from origin; Git hosting is not a guarantee of permanent access to
deleted, unreachable branch history.

Follow pagination and detect truncated tree responses. Traverse the relevant
subtrees when necessary. Bound requests, file sizes, history exploration, and
timeouts; expose an incomplete view if limits prevent a complete read. Read
history where a requested fact needs it, not every commit on every refresh.
Use manual refresh initially, conditional requests when supported, and explicit
rate-limit/error states rather than tight polling. GitHub documents
[conditional requests and rate-limit handling](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api).

The Node adapter should expose a small read endpoint for this fixed project and
serve the built UI, using transient memory only. No arbitrary repository URL,
general proxy endpoint, clone scanning, or Git subprocess is needed for the
host-API route. If the actual origin lacks suitable APIs, reassess a disposable
bare fetch of that origin as the specific fallback. That would be a rebuildable
Git cache, never a developer checkout or separate project-state authority, and
is not part of the recommended initial host-API runtime.

For public GitHub data, direct browser access is technically possible through
its documented [CORS support](https://docs.github.com/en/rest/using-the-rest-api/using-cors-and-jsonp-to-make-cross-origin-requests).
Public access can be unauthenticated, but request volume and host limits still
matter. Choose that smaller deployment only after verifying access and the
actual record volume; it should not require a token pasted into the UI.

For private access, keep a narrowly scoped read credential in the reader's
runtime environment. Never include it in browser JavaScript, responses, logs,
or browser storage. Vite explicitly exposes `VITE_` variables to client code;
they cannot hold secrets. [Vite environment documentation](https://vite.dev/guide/env-and-mode)
For a single-user local launch, bind the reader to loopback and read origin over
the network. For hosted private use, place it behind an existing access boundary
that protects both UI and data endpoint; otherwise a server-held token merely
turns private Git data into a public API. Hosting/access must be resolved before
that deployment, without building an account or authentication platform here.

Start with no persistent cache. Optional browser preferences may store filters
or display choices. An optional snapshot cache must be disposable, validated,
versioned, tied to repository/revision, and visibly stale until refreshed. It
must not become the only home of assignment or progress. Avoid persisting
private source content by default. Clearing browser storage or restarting the
reader must lose no authoritative project state.

## Testing and developer workflow

Playwright is the recommended browser runner. It supports Chromium, Firefox,
and WebKit, and offers role-based locators, waiting assertions, isolation, and
failure traces. Use behavior assertions instead of implementation selectors
or arbitrary sleeps. [Playwright introduction](https://playwright.dev/docs/intro),
[best practices](https://playwright.dev/docs/best-practices)

| Layer | Useful proof |
| --- | --- |
| Compiler and lint | No unchecked boundary escapes, missing union cases, or unhandled promises in the dashboard code. |
| Vitest domain examples | Story outside backlog; legacy identity; unknown owner; independent refinement/planning; branch/trunk progress; valid planless execution; conflicting records. Test the interpretation, not just a parser returning its input. |
| Reader contract/integration | Controlled host responses for pagination, truncated trees, moving/deleted refs, malformed blobs, access failures, and rate limits. Assert pinned-commit reads, provenance, bounded failure, and no false completion. |
| Playwright browser journeys | A user can find recorded stories, inspect source evidence, distinguish Taken from live activity, see completed slices for each execution mode, and understand stale/partial/error states. Verify keyboard use and accessible names on real interactions. |
| Small full-path test | Built UI through the real reader and parsers against a local HTTP fixture serving representative remote records. Catch contract drift that independently mocked UI and reader tests would miss. |
| Deployment smoke | Once host/access is selected, perform a read-only smoke against the real configured origin. It proves connectivity and format compatibility, not every behavior; it need not make ordinary CI depend on private credentials or live Git availability. |

Mock at the host boundary for full-path tests. Playwright's browser
[network interception](https://playwright.dev/docs/mock) is useful for focused UI
cases, but cannot intercept the Node reader's outbound requests; that reader
needs an injected transport or test host endpoint. Keep test endpoint overrides
out of production's fixed-project request surface.

Use Chromium for frequent local feedback and a small core journey across
Chromium, Firefox, and WebKit in CI; avoid multiplying every parser example by
every browser. Visual snapshots can protect a settled layout later, but do not
replace assertions about the displayed evidence.

Vitest is complementary to Playwright, not a competing end-to-end runner. A
DOM-only component runner would miss browser layout and interaction behavior;
do not add it merely to repeat the browser journeys. Cypress is a credible
alternative, but offers no demonstrated advantage for this new TypeScript
read-only dashboard; its documented browser/test-model tradeoffs can be
revisited if a concrete requirement favors it. [Cypress tradeoffs](https://docs.cypress.io/app/references/trade-offs)

Keep one npm lockfile and a clearly bounded dashboard directory, with domain,
remote reading, and UI responsibilities close to their relevant tests. Keep it
outside the installed skills payload. Local development should offer one
documented command for Vite plus the reader, an offline fixture mode, a compiler
watch, and focused test commands. Production builds should compile the reader
and produce static UI assets; Vite's development server is not the production
application server.

CI should retain existing repository checks and add dashboard type checking,
linting, Vitest, a production build, and the selected Playwright journeys.
Neither Vite nor Playwright execution guarantees type correctness:
[Playwright explicitly requires separate type checking](https://playwright.dev/docs/test-typescript).
Install the chosen runner's browser binaries in CI and keep failure traces
available for diagnosis. This document adds no scripts or executable slice plan.

## Decisions still needed

1. **Later repository scope:** the first story fixes public
   `terryyin/open-dough`, `main`, and `.planning/PRODUCT-BACKLOG.md`. Which remote
   execution branches and additional records to inspect belongs to later stories.
2. **Later access and launch:** local, unauthenticated public reads are selected
   first. Private or hosted use would reopen the server/credential boundary;
   neither is a prerequisite of the initial view.
3. **Evidence contract:** supported story-home/refinement/plan formats, new
   owner/mode/branch fields, legacy handling, and cross-ref precedence. Until
   records establish these facts, show unknown or incomplete evidence.
4. **Presentation detail:** the UX direction selects connected stages, zoom,
   focus, and meaningful animation. Exact geometry and rendering choices can be
   refined during implementation. A dependency graph, timeline, historical
   completion catalog, and editing surface remain outside the first story.

These inputs constrain implementation, not this recommendation's completion.
The proposed stack is deliberately small and replaceable; architecture status
remains Proposed pending the human advice and decision process.
