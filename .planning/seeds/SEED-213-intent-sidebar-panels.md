---
id: SEED-213
status: active
planted: 2026-11-01
planted_during: Terry Yin's request to renovate the Intent sidebar
scope: story
---

# Renovate the Intent sidebar

<a id="renovate-intent-sidebar"></a>

### Renovate the Intent sidebar with expandable group panels

**Identity:** SEED-213#renovate-intent-sidebar
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/438-renovate-intent-sidebar/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"2d03cb44a2baeadfe10414d50b1dc27ff8f336626a7e3f2b30769f731b8edca6","plan":"3ce6847a6b7ff24ca3d48e39af5f209d34114870f59562c5b416ce7c84a5d3df"}}
```

**Beneficiary:** A developer browsing a project's configured Intent groups and
their file lists in the dashboard Intent perspective.

**Goal:** Make the Intent locations column easier to scan and navigate by
presenting each configured Intent group as its own recognizable expandable
section—using the same header-and-body pattern as Sessions sidebar optional
sections—so group identity stays visible while at most one group's file list is
open at a time, and files in the open group stay selectable for Purpose reading.

**Selected direction:** Keep the existing Intent browser layout (locations
column beside Purpose/Proof). Replace always-visible per-group file trees with
collapsible group sections that share Sessions-style expand/collapse chrome
(`aria-expanded` header controls the body). Expansion is exclusive: opening one
group closes any other. On each Intent browser mount, every group starts
collapsed; expansion is session presentation state only and is not remembered
across remounts, project/revision changes, or leaving and returning to Intent.
File selection and Purpose/Proof reading stay as they are today and survive
collapsing the selected file's group.

**Alternatives considered (explore / borrow):**

| Option | Why not selected |
| --- | --- |
| Restyle only; keep every group's files always expanded | Does not deliver scanability when several groups each list many files. |
| Independent expand/collapse per group (literal Sessions optional-section behavior) | Closer mechanical borrow, but allows several open lists at once and misses the requested exclusive expansion that keeps the column scannable. |
| Flat single file list with group labels as non-interactive separators | Removes expand/collapse navigation and loses per-group empty/problem framing. |
| Accordion that always keeps exactly one group open | Meets exclusivity but forbids “all closed,” which the request needs for an uncluttered scan of group headers alone. |
| Borrowed ARIA accordion / single-expand disclosure (adapted) | Strongest cross-domain fit: header discloses one panel body, roles map to Intent group → header and file list → body. Limit: classic accordion often keeps one panel forced open; this story deliberately allows all closed, so adapt exclusivity without a mandatory open panel. |

**Challenge:** The purpose is easier scanning and navigation of Intent groups,
not “Sessions chrome appears.” Matching Sessions headers while leaving every
file list always open, or exclusive expansion that cannot return to all-closed,
would meet surface wording and miss the purpose. Strongest consequential doubt:
exclusive expansion is stricter than Sessions (where Recently done and Running
Cursor may both be open). That doubt does not change the outcome—the developer
already asked for at most one open group—so Sessions supplies presentation
pattern only, not multi-open behavior. Purpose holds under exclusive
expand/collapse with all-closed allowed.

**Scope:**

- **Group sections:** Each configured Intent location remains one section in the
  locations column. Its header shows the same group identity cues as today
  (path, kind, include patterns). The header is the expand/collapse control
  with `aria-expanded` and an associated body region for the file list or the
  existing empty/unsupported-kind explanation.
- **Exclusive expansion:** Expanding a collapsed group expands it and collapses
  any other expanded group. Collapsing the expanded group leaves every group
  collapsed. Nested folder disclosure inside an expanded group's file tree
  stays local to that tree and does not count as another Intent group.
- **Initial and remembered state:** On each Intent browser mount (including
  first visit, leaving Intent and returning when the browser remounts, and
  source/revision remount), every group starts collapsed. Expansion is not
  persisted to browser storage or elsewhere.
- **Selection and reading:** Selecting a file in an expanded group still opens
  that file in Purpose (and the existing Proof placeholder). Collapsing a
  group does not clear the current selection or Purpose/Proof content.
  Selecting another file replaces the selection as today. Failed file reads,
  settings problems, and not-configured states keep their current behavior
  outside this section chrome.
- **Presentation reuse:** Follow the Sessions sidebar optional-section header
  and body interaction pattern for expand/collapse affordance and accessibility
  naming. Do not adopt Sessions multi-open rules, height room ownership, or
  resize dividers for Intent groups.

**Scope limits (deferred promises, not rejections):**

- Persisting which Intent group was expanded across visits, reloads, or
  projects.
- Auto-expanding the group that contains a pre-selected or deep-linked file on
  mount (no such durable Intent selection exists today).
- Changing Purpose/Proof layout, Intent location configuration, or how
  locations and files are published.
- Sharing one React component module with Sessions sections unless reuse is the
  simplest local implementation; visual/behavioral likeness is the promise, not
  a shared abstraction.

**Required restrictions:**

- At most one Intent group body is expanded at a time (independent product need:
  keep the locations column scannable when many groups have long file lists).
- Do not name these sections the dashboard **Side panel**
  ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  Side panel is the Board's auxiliary region for terminal, report, or review).
  In product language they are Intent group sections in the Intent locations
  column; “panel” in casual description must not collide with Side panel.

**Key examples:**

- Several Intent groups are configured. On opening Intent, every group header
  is visible and every file list is hidden.
- With group A expanded, expanding group B collapses A and shows B's files (or
  B's empty/unsupported explanation).
- With group B expanded, collapsing B leaves no group expanded; group headers
  remain visible.
- With group A expanded, select a file under A: Purpose shows that file. Collapse
  A: Purpose still shows the same file; re-expand A and the file remains the
  selected row.
- An unsupported-kind or empty group, when expanded, shows its existing
  explanation in the section body and still participates in exclusive
  expansion.
- Nested folders inside an expanded group's tree open and close without
  collapsing that Intent group or expanding another group.

**UI:** The Intent locations column lists one expandable section per configured
group. Each section has a header control (group path/kind/patterns) and a body
that appears only while that group is expanded. Interaction matches Sessions
optional-section expand/collapse for the header control; layout stays the
existing Intent browser grid (locations beside reading). No Board, Sessions
sidebar, or Side panel chrome changes. Exact header iconography and spacing are
implementation choices so long as the examples and accessible expand state hold.

**Architecture:** Stays inside the Product intent perspective's locations
column
([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
Product intent / Purpose presentation; disposable optional browser storage;
spatial/presentation state separate from durable project facts). Expansion is
client presentation state only—rebuildable, not a workflow or Git-backed fact—
so it needs no persistence and no new ADR. Cite ADR 0008 Side panel vocabulary
as a boundary: Intent group sections are not Side panels. No conflict with
Accepted ADRs; ADR 0007 / 0009 remain Proposed and do not bind this UI change.

**References:**

- [Current Intent group browser](../../dashboard/src/IntentBrowser.tsx).
- [Current Intent location group](../../dashboard/src/IntentLocationGroup.tsx).
- [Existing Sessions sidebar optional sections](../../dashboard/src/SessionsSidebarOptionalSections.tsx)
  and [Recently done section header](../../dashboard/src/RecentlyDoneSessions.tsx).
- [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
