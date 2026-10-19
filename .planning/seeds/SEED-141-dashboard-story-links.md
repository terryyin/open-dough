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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/320-dashboard-story-references/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c43742dc36a7c34fb45dc6ce6e83542689fa5425ba14f1e4602d5a7291bd1931","plan":"5f1910bc400e032c2c7b9dd7d672b5cc7f58b5f8798951f5a846b03fecd42925"}}
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
Reveal existing Done blocks as well as active work; a block outside the
currently shown range is still an existing destination. If no block can be
shown, remain in the dashboard and explain the unavailable destination without
selecting another story. Preserve readable current facts when only detail is
unreadable. Loading must not be reported as absence.

**Deferred promises:** Loading historical or unlisted stories into new blocks,
adding projects to resolve references, and rendering arbitrary prose as linked
Markdown. These are not rejection rules for naturally supported references.

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

- B is already Done, including beyond the initially shown entries: following
  A's reference reveals B's existing Done block in its recorded location.
- No current block represents B, or its project's read fails: the dashboard
  explains the missing destination or read failure, keeps navigation usable,
  and does not open GitHub or substitute another story. Existing refresh/retry
  remains available; after recovery the developer can follow the reference again.
- B's block exists but its detail cannot be read: reveal the identified block
  with its existing read-gap explanation, without inventing facts.
- Keyboard activation reaches the same block as pointer activation, with useful
  focus; reduced motion retains the complete navigation outcome.

**UI:** A developer follows a story reference while inspecting another story.
The destination is the particular referenced story, not merely its seed file:
reveal its block and open its existing story inspection where available. Keep
the destination usable by keyboard as well as pointer, and respect the
dashboard's reduced-motion behavior. The destination block's own source link
continues to open its GitHub record. Revision evidence and ordinary non-story
links retain their meanings; they are not story navigation merely because they
lead to GitHub.

**Architecture:** Story identity and source evidence have different purposes.
Navigation must resolve the referenced project and story, including the anchor,
without treating a pinned Git revision as a different story or confusing equal
story names across projects. Preserve the pinned URL for source inspection.
The shared dependency reader already supplies supplier identity separately from
its source link; the dashboard also has identity-based work and Done cards and
existing focus/viewport behavior. Reuse those responsibilities where suitable
rather than deriving a second workflow state from navigation.

This follows [ADR 0001 — Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md)
and [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
preserve domain meaning, one representation of each responsibility, and
dashboard views derived from published facts. Under
[ADR 0000](../../docs/adrs/0000-use-adrs-accepted.md), this feature design needs
no new ADR. ADR 0008 remains Proposed, not a binding decision. No conflict with
the relevant Accepted decisions was found.

**Decision:** Terry accepted the recommendation on 2026-10-19: reveal existing
blocks, including Done stories, explain unavailable destinations in the dashboard,
and defer loading historical or unlisted stories. No human decision remains.

**Depends on:** No known blocking story prerequisite.

**Safe stopping point:** Story references consistently reach the corresponding
dashboard blocks, with each block retaining its own GitHub source link.

## Breadcrumbs

- Terry's request to queue this story first, 2026-10-19.
- Reported example: [SEED-120#story-checked-artifact-eligibility](https://github.com/terryyin/pygardon/blob/c16397d6c75be9a86b676be0d757097a0e58e454/.planning/seeds/SEED-120-release-readiness.md#story-checked-artifact-eligibility).
- [Dependency story links](../../dashboard/src/DependenciesCard.tsx).
- [Recorded dashboard links](../../dashboard/src/RecordedLink.tsx).
