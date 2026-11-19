# Architectural North Star

Temporary direction for current work; revise when evidence changes it and retire
realized topics after checking affected stories. Accepted ADRs remain
authoritative.

## Make production code directly testable instead of growing test support

Minimize test support and gradually retire wrapper and substitute scaffolding so
tests exercise production code directly instead of testing test code. When a
case needs wide helper imports or custom test infrastructure, treat that as a
signal to reshape the production seam — keep wire and command adapters thin over
strongly typed handlers, give UI components narrow typed inputs and shared
boundary contracts so specs can mount the owning component rather than `<App />`,
and keep only thin domain data builders and essential external-boundary
substitutes. `dashboard/test-support/` (~790 files beside ~1,145 files in
`dashboard/src/` and `dashboard/server/`) and `Distribution/tests/support/`
(~361 files) accumulated whole-app route mini-servers
(`frontendServiceSubstitutes.ts`, `frontendStoryReviewRule.ts`) and multi-helper
HTTP setups (`adHocReview.ts`) because tests entered through untyped wire paths
or full-app mounts rather than clean production boundaries. Applies to upcoming
dashboard (`dashboard/server/`, `dashboard/src/`, `dashboard/*-tests/`,
`dashboard/test-support/`), distribution (`Distribution/`), test-optimization,
and refactoring work, under
[ADR 0002](../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
and the installed
[test boundary rule](../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#choose-the-test-boundary).
