---
id: SEED-241
status: active
planted: 2026-11-05
planted_during: Terry Yin's report of disruptive Intent refreshes and slow loading, followed by the request for cached backend calculations and less frontend/backend traffic
trigger_when: A developer opens Intent, browses folders or files, or continues reading while published work changes
scope: story
---

# SEED-241: Load Intent without disruption or bulk source transfer

<a id="keep-the-shown-reading-through-failed-updates"></a>

### Keep the shown reading through failed updates

**Identity:** SEED-241#keep-the-shown-reading-through-failed-updates
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/480-keep-shown-reading-through-failed-updates/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9ddd97b78569c4b07bbf174bfd49dc9d4335a519be7429dc2e85d4345b62608c","plan":"defa10cb1178e18406d8cd911d1320d3374bdf2a6b38ada8b1f28ed9eec12906"}}
```

**Goal.** A developer reviewing Intent keeps the revision they are reading,
with its tree, selection and text, when an update to newer published work is
slow, fails or meets unreadable settings, including after leaving Intent and
returning. This corrects the delivered
`SEED-241#load-intent-without-disruption-or-bulk-source-transfer` story's
recovery behavior (recoverable at
`1ff9804b9:.planning/seeds/SEED-241-intent-loading-and-traffic.md`); it adds no
new promise.

**Scope.** The page-held shown revision and its fallback to the kept answer;
an unreadable settings answer at the newer revision treated as a failed
update; consolidation of the overlapping read-reuse journeys. Plan:
[480-keep-shown-reading-through-failed-updates](../slice-plans/480-keep-shown-reading-through-failed-updates/PLAN.md).
