---
id: SEED-056
status: active
planted: 2026-09-29
planted_during: Diagnosing a false "Needs reassessment" badge on SEED-052#session-sidebar
trigger_when: Queued first on 2026-09-29
scope: story
---

# SEED-056: Read published records exactly as origin holds them

## Why This Matters

The dashboard shows a published story's facts from the files origin holds at
the shown revision. On 2026-09-29, SEED-052#session-sidebar's card said
**Needs reassessment** although its seed and plan on trunk (`8156fac6`) were
exactly what its readiness was recorded against, and the shared reader in Node
answers **ready** for that content.

The local authenticated read (`dashboard/server/ghContents.ts`,
`readRepositoryFileViaGh`) asks `gh api` for a file with
`Accept: application/vnd.github.raw+json`. The `+json` suffix makes `gh` treat
the raw file text as JSON and apply its control-character sanitizer, which
rewrites a literal `\u0002` (six characters) as `^B`. The plan
`.planning/slice-plans/164-session-sidebar/PLAN.md` holds one such line
("records a line holding `\u0002`"), so the page received a plan four
characters shorter than origin's, digested it as
`34d73c3481c55c149146a66a0f39066d7969dbb0cda308c9818768f7cc6324d3` instead of
the recorded
`8b72ab8d59bc734ce4d6726609d59fb9ac9b5125e832700ed66276937ea4ffa4`, and
reported the readiness as stale. The seed's digest matched.

Observed directly with `gh api repos/terryyin/open-dough/contents/.planning/slice-plans/164-session-sidebar/PLAN.md?ref=8156fac6`:
with `Accept: application/vnd.github.raw+json` the line reads `^B`; with
`Accept: application/vnd.github.raw`, and in the base64 `content` of the
default JSON answer, it reads `\u0002`.

Every file the page reads goes through that function (backlog, seeds, plans,
agent profiles), so any published text containing a control-character escape
such as `\u0000`–`\u001f` reaches the dashboard altered. Readiness, purpose,
slice, and assignment facts can then differ from what origin publishes,
contradicting the dashboard's promise to show published records.

## Alternatives and Decision

- **Reword the plan line to avoid the escape:** clears this one badge but
  leaves every other record exposed, and makes authors avoid ordinary text.
  Rejected.
- **Read raw bytes without the `+json` suffix:** selected. The text reaches
  the shared reader byte for byte, so digests, facts, and source links agree
  with origin.

## Story Decomposition

<a id="exact-published-text"></a>

### Show published records exactly as origin holds them

**Identity:** SEED-056#exact-published-text
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

- **Goal:** A developer reading the dashboard sees each story's readiness and
  other published facts as origin records them, so a ready story is not shown
  as needing reassessment because the dashboard altered the text it read.
- **Scope:**
  - Files read through the local authenticated read arrive exactly as origin
    holds them at the pinned revision, including literal backslash escapes of
    control characters.
  - A regression test at the read boundary publishes a file containing a
    literal `\u0002` and observes the same text in the answer; and a card
    whose plan holds such a line shows the readiness recorded against it.
  - Other `gh api` calls whose answers are JSON (revision checks, directory
    listings, profile additions) are checked for the same sanitizing where
    they carry published text; a JSON answer that is only parsed for names or
    SHAs needs no change.
  - Deferred: nothing else about the read boundary changes.
- **Key examples:**
  - SEED-052#session-sidebar at `8156fac6`: its card shows **Ready** (not
    **Needs reassessment**) once the plan is read exactly.
  - A published file line "holding `\u0002`" is answered with those six
    characters, not `^B`.
  - A file without escapes reads exactly as today.
- **Depends on:** nothing.
- **Safe stopping point:** a one-boundary change; every other dashboard read
  is unchanged.

## Breadcrumbs

- [Dashboard agent launch and read boundary](../../dashboard/README.md).
- [Session sidebar story](SEED-052-start-agent-work-from-dashboard.md#session-sidebar),
  where the false badge was observed.
