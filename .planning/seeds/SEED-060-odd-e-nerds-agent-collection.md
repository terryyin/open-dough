---
id: SEED-060
status: active
planted: 2026-09-30
planted_during: Maintainer request for an alternative agent character collection
trigger_when: A developer wants to use the Odd-e nerds agent names and avatars
scope: story
---

# SEED-060: Odd-e nerds agent collection

## Why This Matters

A developer can choose an alternative set of recognizable agent characters
through configuration while retaining the current collection as the default.

## Story

<a id="odd-e-nerds-agent-collection"></a>

### Select the Odd-e nerds agent names and avatars through configuration

**Identity:** SEED-060#odd-e-nerds-agent-collection
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/177-odd-e-nerds-agent-collection/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d50cf4b84f6ee66ac3ef705878240536a7245a2c3d7673863224b8bb2a30c893","plan":"f10246068aa54ada415093ef2265645ea749f8fef70d3f418eceea8b6d41269e"}}
```

- **For / why:** A developer who wants the Odd-e nerds characters can select
  that collection of agent names and matching avatars through configuration,
  while everyone else keeps the current collection with no change.
- **Goal:** Give Odd-e developers agents that carry their colleagues' names
  and faces, as an opt-in alternative to the current 29 characters.
- **Scope:**
  - One alternative collection of 26 agents named for the Odd-e Slack
    workspace members: terry, stanly, basvodde, viktor, ZiQingLau, aki,
    YeongSheng, Jane, chaifeng, zbcjackson, juacompe, DavidKo, mrsn,
    josephyao, steven, yilv, ebacky, BastiaanvanHamersveld, ivan, d.kanai,
    JacekBochenek, Matthias, darren, pyopark, dbs, joey. Spaces are removed
    from display names; the names are committed to the repository (Terry,
    2026-09-30).
  - Agent identities follow the existing rule: the name plus `-chan`
    (e.g. `stanly-chan`), with the lowercase profile file and email derived
    the same way as for the current collection.
  - A project-owned setting named `nerds` in `.planning/open-dough.json`
    selects this collection. Absent, the current collection is used.
  - The collection is one agent-name set with matching avatars, so name
    rotation, the roster, and the portraits on Taken and Preparing cards all
    follow the selection.
  - Avatars are each member's Slack profile photo, kept only in the git-ignored
    folder `dashboard/dist/agent-avatars/odd-e-nerds/` (already covered by the
    `dist/` ignore). Terry has downloaded them on his machine and will obtain
    each person's permission before any photo is pushed. Until then the
    photos work locally and never enter Git.
  - Deferred: publishing the photos, and any other collection or a
    collection editor.
- **Key examples:**
  - No collection setting → agents take names from the current rotation and
    show the current portraits.
  - Setting selects the Odd-e nerds collection → a new assignment takes the
    next free name from those 26 (e.g. "stanly") and its card and the roster
    show that member's photo.
  - Nerds selected on a machine without the ignored photos → names still work;
    each card and roster entry omits the portrait, as an unrecorded host omits
    its mark, rather than failing.
  - An agent already holding work under a current-collection name when the
    setting changes → keeps that name until released. Only new assignments use
    the new collection.
  - An unknown collection value → refused with a clear message, not silently
    falling back.
- **Decided:** Names drop spaces and keep the `-chan` suffix; the setting is
  named `nerds`; "nodes" was "nerds"; the default is the current collection
  (Terry, 2026-09-30). The value shape of `nerds` (recommended: `true`) is a
  planning detail.
- **Depends on:** No queued prerequisite identified.
- **Capture:** Terry requested this new story on 2026-09-30, continuing the
  sequence of top-of-backlog captures on main.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
