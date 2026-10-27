# Dashboard development workflow

Part of the [dashboard technology recommendation](dashboard-tech-stack.md).
Its proposed status, date, and first-story qualifications apply to this page.

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
