---
id: SEED-144
status: active
planted: 2026-10-20
planted_during: Terry's acceptance of the Open Dough icon and request for product-wide adoption
trigger_when: Open Dough is identified in its dashboard, browser, or desktop notifications
scope: unknown
---

# SEED-144: Recognizable Open Dough product identity

## Why This Matters

A developer using Open Dough needs to recognize its dashboard, browser tab,
and desktop alerts at a glance. Terry accepted the simplified raw-dough icon,
including its small favicon treatment, and requested that it be used wherever
it applies. The macOS notification pop-up must visibly show this same icon.

The mark represents raw dough as a starting point for many creations. Preserve
its recognizable dough silhouette and natural kneaded fold when adapting it
to each display size.

## Selected Story

<a id="recognize-opendough-by-its-icon"></a>

### Recognize Open Dough by its icon across product surfaces

**Identity:** SEED-144#recognize-opendough-by-its-icon
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer using the Open Dough dashboard and receiving its
desktop notifications.

**Outcome:** Open Dough presents the accepted icon consistently on applicable
product-owned identity surfaces, including its browser favicon and the actual
icon displayed in macOS notification pop-ups, so the developer can recognize
the product at small sizes.

**Scope:** Identify the applicable existing product-owned branding surfaces
and adopt the accepted icon on them. Include dashboard identity, browser tab
and bookmark icons, applicable app or touch-icon metadata, and desktop
notification identity. Record the adopted surfaces and any justified
exclusions. Preserve the meaning of action symbols and third-party host
avatars. Use the retained assets and generation prompt as the source for any
required size or format derivatives, with stable filenames.

**Key examples / evaluation:**

- Open the dashboard in a fresh browser context: the tab uses the accepted
  Open Dough favicon, including a recognizable silhouette and fold at 16 and
  32 pixels on light and dark browser chrome. Existing browser cache does not
  make an old or generic icon appear to satisfy the example.
- On applicable dashboard branding and browser bookmark or app-icon surfaces,
  the same mark appears without distortion, clipping, or a conflicting older
  Open Dough mark. Identify which existing surfaces were checked.
- Trigger a real Open Dough attention notification on macOS with notifications
  enabled. Visually confirm that the notification pop-up displays the accepted
  Open Dough icon. A helper invocation containing an icon path, a successful
  delivery exit code, or the icon appearing only in the dashboard does not
  establish this visible outcome.
- Existing attention timing, notification text, permission handling, and
  notification-click navigation continue to work after the icon is adopted.
- The required assets are available through the normal built and delivered
  product, without depending on a contributor's absolute checkout path.

**Source assets:** [Accepted icon](../../assets/brand/opendough-icon.png),
[favicon assets](../../assets/brand/favicon/), and
[retained generation prompt](../../assets/brand/generation-prompts.txt).
Keep these canonical names unversioned; superseded design attempts are not
alternative rollout choices.

**Depends on:** No blocking story prerequisite. The accepted assets are kept
with this backlog addition; existing notification follow-ups can be developed
independently while preserving their behavior.

**Safe stopping point:** The accepted mark identifies the applicable existing
product surfaces and the macOS pop-up has direct visual confirmation, without
requiring a wider interface redesign.

## Priority and Preparation

Terry explicitly requested this story at the top of the product backlog on
2026-10-20. This queues adoption; it does not start the rollout. Refinement
must establish the applicable surface inventory and the supported macOS
notification icon path before implementation planning.

## Breadcrumbs

- Terry's accepted latest icon, request to retain only the latest assets and
  generation prompt, and explicit product-wide adoption request, 2026-10-20.
- [Dashboard browser entry](../../dashboard/index.html) and
  [dashboard banner](../../dashboard/src/DashboardBanner.tsx).
- [Native notification integration](../../dashboard/server/terminalNotifier.ts)
  and [current notification behavior](../../dashboard/AGENT-LAUNCH-HISTORY.md).
