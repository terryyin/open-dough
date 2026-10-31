---
id: SEED-202
status: active
planted: 2026-10-31
planted_during: Terry's dashboard memory investigation and request to prioritize shared request management
trigger_when: Several browsers keep the dashboard open and refresh the same projects or sessions
scope: two stories for bounded shared dashboard refresh work
---

# SEED-202: Keep dashboard refresh work bounded across viewers

## Why This Matters

A developer should be able to leave the dashboard open on several browsers or
devices without multiplying expensive observations, exhausting GitHub request
allowances, or causing memory to grow with repeated refreshes. Terry asked to
start with sharing session observations across browsers and reusing parsed
launch records, and to treat this as a general improvement to request
management, especially GitHub requests. Queue this story first. Refinement
split the GitHub-backed sharing into its own story, queued right after.

## Selected Stories

<a id="shared-github-revision-checks"></a>

### Share GitHub revision checks across viewers

**Identity:** SEED-202#shared-github-revision-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Keep GitHub requests for published-revision checks bounded as more
browsers keep the same project visible, through the existing shared GitHub
request owner, so dashboard viewers do not multiply the requests this machine
spends under one API host and login.

**Scope to refine:**

- Each visible page currently asks for its project's revision check every
  15 seconds. Matching outstanding calls already share one `gh api` call, and
  the listing is conditional (`304 Not Modified`) per catalog source. Out-of-phase viewers
  each cost one listing. Measure calls per viewer first, then share a settled
  check across viewers within the poll interval if the count justifies it.
- Preserve sharing across dashboard processes and other Open Dough consumers,
  directed rate-limit waits, timeouts, and account isolation. Do not add a
  competing request manager or bypass the owner's admission.
- Keep checks isolated by repository, ref, and login, so different projects,
  revisions, or logins keep their own answers and permissions.

**Premise to observe:** Whether conditional `304` answers still spend a
meaningful share of this machine's request allowance or owner turns at three or
more viewers. If they do not, this story may be dropped.

<a id="consistent-shared-refresh"></a>

### Keep shared refresh answers consistent with what each viewer shows

**Identity:** SEED-202#consistent-shared-refresh
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/428-consistent-shared-refresh/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"95d86b2e9bddd0bb5bdec6b55ca187eb904a6d236cf7387ae495cf65a75a7497","plan":"61889fd5174f0c2cf618112c4f7c1b140fb2065d2cc44273e0f927811dbdb710"}}
```

**Goal:** A correction to Keep dashboard refresh work bounded across viewers
(`SEED-202#bounded-dashboard-refresh`, recoverable at
`dc397adab49fbb7b2002be45161c80a6bd1b0a21:.planning/seeds/SEED-202-bounded-dashboard-refresh.md`). Developers viewing the dashboard get
unchanged answers and shared Cursor reads only when what their view already
shows matches the answer they would receive. The settings view's machine-session
refresh stays small when nothing changed.

**Scope:**

- A page that changes its sessions or facts outside the poll stops holding the
  poll's revision. Such changes come from an action's answer, a session
  re-read, or a mark. Its next poll then receives the full answer.
- The settings view's feedback-maintenance refresh sends the revision it holds
  and keeps its state on an unchanged answer.
- A shared Cursor held-session read is joined only under the same machine
  documents it started from. A reader whose launch record was written after
  the read began gets its own read.
- One machine-document revision, owned by the machine document store, keys
  both shared observations.
