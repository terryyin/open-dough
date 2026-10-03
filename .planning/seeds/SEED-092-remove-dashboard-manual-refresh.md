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

**Goal:** A developer uses a simpler dashboard that keeps itself up to date
without a manual refresh control, and the product carries no code that only
served manual refresh.

**Scope:**

- Remove the Refresh button from the dashboard's source status.
- Remove frontend wiring, server routes or APIs, documentation, and tests that
  exist only for manual refresh and become dead once the button is gone.
- Keep automatic refresh and anything else that still has a live caller.

**Key examples:**

- On opening the dashboard, the developer sees no Refresh button, and progress
  still updates automatically.
- Reloading the browser page shows the latest published information.
- After the change, no route, handler, prop, or helper remains whose only caller
  was manual refresh.

**Boundary:** Automatic refresh behavior is unchanged. This story removes a
  control; it does not redesign the source status or the dashboard frame.

**Refinement questions:** The same control is labelled Retry after a failed
  read. Confirm that automatic recovery covers that case, so the Retry
  affordance can go with it, before treating its code as dead.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- Terry's 2026-10-03 request: capture this story third in the product backlog;
  work directly on main and sync with origin.
