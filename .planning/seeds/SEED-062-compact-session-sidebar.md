---
id: SEED-062
status: active
planted: 2026-09-30
planted_during: Terry's dashboard UX review of the Sessions sidebar
trigger_when: A developer scans the dashboard Sessions sidebar to find sessions that need them
scope: story
---

# SEED-062: Compact, scannable Sessions sidebar

## Why This Matters

Terry wants the Sessions sidebar to be quick to scan. Today rows are tall, carry
launch information and spelled-out status words, and the attention count is
explained in words. Session details already exist once a session is opened, so
the list only needs to show what helps a developer choose where to look next.

## Story

<a id="compact-session-sidebar"></a>

### Scan sessions quickly in a compact sidebar that surfaces those needing attention

**Identity:** SEED-062#compact-session-sidebar
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/181-compact-session-sidebar/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ef5251cf11c5044020c4ba046b9052f5cc1bf564480d6de3238a3848d6e2371d","plan":"a09405b5f6ccfc6544fd9e35280bd0c92c3c44504ad80cc8dc690aff36cc2bc2"}}
```

- **Goal:** A developer glancing at the Sessions sidebar sees more sessions at
  once, recognises each session's state by border color and style, and finds the
  sessions that need attention first, so triage of many concurrent sessions is
  faster.
- **Evaluation:** With sessions in several states, open the dashboard: the
  toggle is an SVG icon; a red numeric badge shows only when sessions need
  attention; each row is one line with the story title and a compact elapsed
  time; a state-styled left border shows state; attention sessions lead the list.
- **Scope:**
  - The Sessions toggle button is an SVG icon rather than text, with an
    accessible name of "Sessions".
  - The count of sessions needing attention is a red badge containing only the
    number, with no explanatory wording, on the toggle whether the sidebar is
    open or closed. It appears only when at least one session needs attention.
    Its accessible name says how many sessions need attention. The sidebar's
    own separate attention sentence is removed.
  - Needing attention keeps today's reading (`sessionShown`): needs input,
    ready for review, failed, and stopped. Working, done, unknown, unlisted,
    and unrecognized states never need attention.
  - Each sidebar row is a single line: the story title, truncated with an
    ellipsis, and the elapsed time at the end. Project name, workflow, launch
    time, and state words leave the row; the fuller state reading, and project
    and workflow, stay in the row's tooltip and on the opened session page.
  - Elapsed time is since the session's launch, shown by its largest whole
    unit (`<1m`, `5m`, `2h`, `3d`), recomputed on a 30-second tick.
  - State is conveyed by a left border that differs in style and thickness as
    well as color, so hue is not the only cue: needs input, solid thick red;
    ready for review, solid thick green; failed or stopped, dashed red;
    working, thin blue; done, thin grey; unknown, unlisted, or unrecognized,
    dotted grey. Each row carries a visually hidden state label for assistive
    technology.
  - Ordering: sessions needing attention come first, earliest start first; all
    other sessions follow, newest start first.
- **Deferred promises:** Sorting or grouping controls, an attention filter, and
  any redesign of the card-level attention wording or the alerts-unavailable
  note are not part of this delivery.
- **Key examples:**
  - Two attention sessions started at 09:00 and 10:00 plus working sessions
    started at 08:00 and 11:00: order is 09:00, 10:00, 11:00, 08:00.
  - No session needs attention: no badge is shown, on the open or closed toggle.
  - A session moves from working to needs input: it moves into the attention
    group, its border becomes solid thick red, and the badge count increases.
  - A failed session and a needs-input session both lead the list and both
    count in the badge, with dashed and solid red borders respectively.
  - A session launched 90 seconds ago reads `1m`; 26 hours ago, `1d`.
  - A long story title truncates with an ellipsis and never wraps the row.
- **Boundary:** Session detail content, launch flows, state definitions, and
  the card-level attention wording are unchanged.
- **Value / learning:** Faster triage of many concurrent sessions.
- **Effort hypothesis:** Small to medium; likely toggle and badge, row layout
  and state styling, and ordering as separate slices.
- **Capture:** Terry requested this story on 2026-09-30.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Existing dashboard launch behavior](../../dashboard/AGENT-LAUNCH.md).
