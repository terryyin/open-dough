---
id: SEED-092
status: active
planted: 2026-10-03
planted_during: Terry's request to remove the dashboard's manual refresh button
trigger_when: A developer wants a simpler dashboard without a manual refresh control
scope: unestimated
---

# SEED-092: Remove the dashboard's manual refresh

## Why This Matters

The dashboard already refreshes published progress automatically, so a manual
refresh control adds UI without adding value. In the worst case a developer can
reload the browser page to get the latest information. Removing the control,
and the code that exists only to serve it, makes the dashboard simpler.

## Stories

<a id="remove-manual-refresh"></a>

### Remove the dashboard's manual refresh button and its dead code

**Identity:** SEED-092#remove-manual-refresh
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/232-remove-manual-refresh/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ee351729a615ee49c8c472d4d7b9dcf6d226944b3d7db06b864f61b6b6724d01","plan":"319449bb4e2e5465c1a4262887a87c173fc85b963e2698a026b0b128e6998737"}}
```

**Goal:** A developer uses a simpler dashboard that keeps itself up to date
without a manual Refresh or Retry control, and the product carries no code,
wording, or documentation that only served that control.

**Scope:**

- Remove the source status's single read control, named Refresh normally and
  Retry after a failed read, together with its prop wiring and styling.
- Reword every message and documented instruction that tells the developer to
  press Refresh or Retry (published-read failure text in the browser and the
  server's read-failure messages, the dashboard README) so it says how the page
  recovers instead: automatic checks while a snapshot is shown, otherwise
  reloading the page.
- Remove tests, helpers, and documentation that exist only for the control.
- Keep automatic revision checks, their rate-limit waits, and every other live
  caller of the underlying fresh read, such as launch reconciliation's
  `readAfresh`.
- Deferred: no new automatic recovery. A failed first read (nothing shown yet)
  and a record detail that failed at an unchanged revision recover by reloading
  the page, as the parent problem accepts; this story adds no retry schedule
  for them.

**Key examples:**

- Opening the dashboard shows the source status with no Refresh button, and
  newly published progress still appears through automatic checks.
- With a snapshot shown, a revision check fails: the alert says automatic
  checks continue (or, after a rate limit, when they resume) and offers no
  Retry; the next successful check clears it.
- The first read fails because `gh` is not logged in: the message tells the
  developer to run `gh auth login` and then reload the page, not to press Retry;
  reloading after logging in shows the published work.
- After the change, no prop, handler, style, test, or document remains whose
  only purpose was the manual control, while launch reconciliation still
  triggers its fresh reads.

**Boundary:** Automatic refresh behavior is unchanged. This story removes a
  control and its wording; it does not redesign the source status or the
  dashboard frame. Other Retry controls with their own purpose (model choices,
  session reports, OpenAI status) stay.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- Terry's 2026-10-03 request: capture this story third in the product backlog;
  work directly on main and sync with origin.
