---
name: dough-manual-testing
description: Verifies web-app behavior manually in a browser when the developer explicitly requests manual testing or an active plan slice requires it. Does not run proactively or replace required automated E2E tests.
---

# Test web-app behavior manually

Use only for an explicit developer request or manual testing required by the
active plan slice. Exercise the requested flows through available browser
tools and report observed behavior.

## Establish the environment

Resolve this project's target flows and expected results, test environment and
app URL, stack startup instructions, authentication flow, and approved test
accounts from the task and repository. Resolve service endpoints or external
service configuration only when needed for the requested flow. Do not copy
credentials into the report.

Expect the project's test stack to be running. Check availability; if it is not
running, tell the user how to start it using the project's documented command
in a separate terminal. Report that testing is blocked until it is available.
Do not guess a URL, account, startup command, or secret. If necessary context or
browser tooling is unavailable, identify the missing prerequisite and stop
without claiming verification.

## Exercise and observe

1. Navigate to the app URL and inspect a browser snapshot to establish the
   current state.
2. If authentication is needed, follow the project's documented login flow
   using an approved test account.
3. Inspect the snapshot for available elements. Prefer stable IDs or accessible
   labels, falling back to element text or role. Use the host's available
   browser tools for navigation, clicking, typing, and selecting options.
4. Exercise the target flows and inspect snapshots after interactions to verify
   the results against the expected behavior.
5. If issues occur, inspect browser console messages and network requests.
   Where the development server runs background linting, also check its terminal
   output; overlays may be disabled. Resolve lint errors before any commit under
   the active task, or report them as unresolved.

Manual testing does not replace automated E2E verification required by the plan.

## Report

Report the flows exercised, expected and observed results, supporting snapshot
observations, and issues found. Distinguish failures from flows that could not
be tested. When all requested flows have been exercised and their results
recorded, end with `## MANUAL TEST COMPLETE`; this marker means testing finished,
not that every flow passed. For blocked or partial testing, report the missing
prerequisite or remaining work without the completion marker.
