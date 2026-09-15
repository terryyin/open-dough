# Recognition: dough-manual-testing

Review: ready for maintainer review

## Original clues

Extracted from Donut's on-demand `manual-testing` skill at
`.agents/skills/manual-testing/SKILL.md`. Its Claude discovery path shares the
same source. Project identity is provenance, not a recognition condition.

Inspected source SHA-256 (2026-09-15):
`da124cdd53d2bce337f04f80fae508120546c048082d93de95aa1aed53469c9b`.

## Purpose

Provide human-directed or plan-required browser verification and an observed
behavior report.

## Triggers

Only an explicit developer request for manual testing or an active plan slice
that requires it. Never proactive selection merely because browser work exists.

## Distinguishing behavior

Expect an existing running test stack, notify the user with documented startup
instructions if absent, inspect snapshots before and after interaction, follow
the project's login flow, and inspect console/network evidence on issues.
Check background lint output where applicable. Preserve the manual-test
completion marker and the boundary against substituting for automated E2E.

## Client project context

Target flows and expectations, stack availability and startup command, app URL,
authentication flow and approved accounts, available browser tools, and relevant
service setup or background linting. Removed Donut URLs, account credentials,
login selectors, stack components, token variable and package command; generalized
named MCP calls to the browser capabilities available on each host.

## Differences that rule out replacement

Not equivalent to proactive exploratory testing, automated regression testing,
or a workflow that launches its own stack without the source's user-startup
handoff. Project-specific login and environment instructions still need to exist
in the target project. A stopped environment is explicitly blocked; the marker
is reserved for completed testing and does not imply all observed flows passed.

## Validation needed

Representative authoring walkthrough completed: a developer requests checking
profile editing in an already-running test app. The explicit request satisfies
invocation; project URL, account, login flow and expected saved value supply
context; browser snapshots establish the initial state and verify the changed
value, and the report records expected versus observed behavior and issues.
If the stack is absent, provide its documented startup command and report blocked
testing without a completion marker. An unrelated code edit does not trigger use.

Before promotion, maintainer review must confirm invocation context, required
client project context, and useful outcome under [AGENTS.md](../../../AGENTS.md),
including blocked startup and required automated-test boundaries. This is a
guidance walkthrough, not a live browser test. Extraction leaves the guidance
outside payload declarations.
