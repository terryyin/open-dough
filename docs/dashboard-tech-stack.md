# Dashboard technology recommendation

**Status:** Proposed recommendation for discussion; no ADR acceptance or implementation authorization.

**Date:** 2026-09-19

## First-story application

The first Board, for Open Dough's public GitHub `main` and launched locally,
is built and described in the [dashboard README](../dashboard/README.md).
That bounded Board uses the simpler static UI/browser-read option below,
with React, strict TypeScript, Vite, runtime validation, and one new behavioral
suite: Playwright on Chromium. Include type checking, lint, production build,
and the browser suite in existing CI; preserve existing repository tests.
No application read server, Vitest/component-test layer, browser matrix,
sign-in, or hosted deployment is required by that Board. Every project now
reads through a local `gh` read boundary; see the
[dashboard README](../dashboard/README.md) for current behavior.

The interface direction is an animated, zoomable **Board view**.
The first story needs a readable connection between Backlog and Taken, entry
facts, evidence links, and refresh. Begin with semantic HTML Story cards and
controls, ordinary CSS layout, and simple SVG connectors if useful. Wrapping,
reflow, and scrolling may be sufficient now. Add transforms, viewport state,
or motion only for a demonstrated reading or orientation need. This is an initial
implementation direction, not a canvas prohibition: choose a different renderer
only for a demonstrated need, preserving accessible content and controls.
Neither a graph-layout engine nor an animation framework is a prerequisite for
two connected Columns. If navigation or animation is introduced, keep its state
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
stage. Product intent and structural perspectives are independent future
possibilities, not entities or services to scaffold now. Recently finished work is also not a
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

See the [published Git data recommendation](dashboard-published-git-data.md).

## Testing and developer workflow

See the [testing and developer workflow recommendation](dashboard-development-workflow.md).

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
4. **Presentation detail:** the UX direction selects connected Columns, zoom,
   focus, and meaningful animation. Exact geometry and rendering choices can be
   refined during implementation. A dependency graph, timeline, historical
   completion catalog, and editing surface remain outside the first story.

These inputs constrain implementation, not this recommendation's completion.
The proposed stack is deliberately small and replaceable; architecture status
remains Proposed pending the human advice and decision process.
