---
id: SEED-141
status: active
planted: 2026-10-19
planted_during: Terry's request to navigate between dashboard story blocks
trigger_when: A dashboard link to another story opens GitHub instead of that story's dashboard block
scope: unknown
---

# SEED-141: Follow story references within the dashboard

## Why This Matters

A developer inspecting a story's dependencies needs to reach the referenced
story without leaving the dashboard. Terry reports that dependency story links
currently open GitHub and asks for the same dashboard navigation wherever a
link to another story appears. A story block's link to its own source remains
the route to GitHub.

## Selected Stories

<a id="open-referenced-story-in-dashboard"></a>

### Open referenced stories in their dashboard blocks

**Identity:** SEED-141#open-referenced-story-in-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer following dependencies or other story references
while inspecting work in the dashboard.

**Goal:** Clicking a link to another story opens and reveals that story's
dashboard block. Clicking a story's own link within its own block opens its
GitHub source.

**Scope:** Apply the rule to dependency links and inspect other dashboard
locations that offer story links so they behave consistently. Resolve the
particular referenced story, including its anchor; a different story in the
same seed is still another story. Preserve a block's own story link as the
explicit route to its GitHub page. Cover the revision-pinned GitHub story URLs
already shown by the dashboard, including Terry's supplied example.

**Key examples / evaluation:**

- From story A's dependencies, click a link to story B: B's dashboard block
  opens and is brought into view.
- Follow a link to another story from any other dashboard location that offers
  story links: it reveals the referenced block using the same rule.
- From story B's block, click B's own story link: it opens B's GitHub source.
- A and B have different anchors in the same seed: A's link to B reveals B,
  rather than treating their shared seed as a self-link.
- A dependency uses the supplied revision-pinned URL for
  `SEED-120#story-checked-artifact-eligibility`: clicking it reveals that
  story's dashboard block rather than opening the GitHub blob page.

**Open questions for refinement:** How to present a referenced story that is
no longer on the active board or cannot currently be read, while keeping the
GitHub destination specific to a block's own story link.

**Depends on:** No known blocking story prerequisite.

**Safe stopping point:** Story references consistently reach the corresponding
dashboard blocks, with each block retaining its own GitHub source link.

## Breadcrumbs

- Terry's request to queue this story first, 2026-10-19.
- Reported example: [SEED-120#story-checked-artifact-eligibility](https://github.com/terryyin/pygardon/blob/c16397d6c75be9a86b676be0d757097a0e58e454/.planning/seeds/SEED-120-release-readiness.md#story-checked-artifact-eligibility).
- [Dependency story links](../../dashboard/src/DependenciesCard.tsx).
- [Recorded dashboard links](../../dashboard/src/RecordedLink.tsx).
