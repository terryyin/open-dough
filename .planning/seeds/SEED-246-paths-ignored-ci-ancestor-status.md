---
id: SEED-246
status: active
planted: 2026-11-06
planted_during: Doughnut wrap-up of SEED-104#clear-ci-docs-of-local-proof, where story-branch CI stayed undiscovered for paths-ignored pushes; moved here from Doughnut SEED-105 because the failing observation logic is Open Dough's
trigger_when: A Dough execution waits on CI for a revision that only changes paths-ignored files
scope: story
---

# SEED-246: Paths-ignored CI inherits ancestor status

<a id="paths-ignored-ci-ancestor-status"></a>

### Treat paths-ignored CI as the first non-ignored ancestor

**Identity:** SEED-246#paths-ignored-ci-ancestor-status
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/483-paths-ignored-ci-ancestor-status/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"64e9041e9cf9d12305011ed518daad1f763bdb11bcd1200d37f9a4f33a9332c5","plan":"1d8efb99c087c894f02ffa6abc3333d6fadf074a5f92b9d5ae515181d7f1121f"}}
```

**Goal:** A Dough execute-plan coordinator waiting on CI for a published
revision that only changes `paths-ignore` files receives that revision's CI
outcome as the status of the nearest ancestor that was not paths-ignored, so
the wait completes as a normal CI build instead of ending unobserved. This
matters most right after a Take, when a story branch's first revisions are
planning or documentation edits and the branch has no CI runs of its own yet.

**Scope:**

- Required behavior: on the GitHub Actions default observer, an ignored-only
  registered revision may take as its basis an ancestor's run of the selected
  workflow's `push` trigger on any branch of the repository, such as the
  trunk it was taken from. The basis is chosen as today: the nearest proved
  ancestor with an attempt, whose diff to the registered revision changes
  only ignored paths. The inherited `basis.state` reaches completion and
  failure delivery through the ordinary mailbox path. Agents learn no new
  "docs-only skip" handling.
- Required restriction (kept): a revision whose diff to that nearest basis
  touches a non-ignored path, or is mixed, deleted, or renamed outside
  ignored paths, still waits on its own exact-SHA run. Reason: a run of an
  older tree does not prove changed non-ignored content.
- Scope limits: the cross-branch lookup is one bounded listing of recent
  runs, so a basis older than that window stays `undiscovered` with the
  existing discovery-delay advisory, as today. Projects that use a custom CI
  adapter keep their branch-scoped `discover` answer; changing the adapter
  protocol is a deferred promise. A project's own `paths-ignore` policy, the
  `pull_request` trigger, and integrated-state completion (which stays
  scoped to the observed branch) are unchanged.

**Key examples:**

1. Observed in this repository: story branch
   `claude/treat-paths-ignored-ci-as-the-first-non-ignored` at `0fc3d6447`
   has no CI runs, because its own commits change only `.planning/**`. Its
   nearest non-ignored ancestor `7cde52861` ran CI successfully on `main`.
   Registering `0fc3d6447` records `not_required` with basis `7cde52861` and
   `basis.state: success`, and the completion wait ends with success, not
   `undiscovered`.
2. The same shape where the trunk ancestor's run is pending, failed, or was
   cancelled: the registered revision inherits that state exactly as it
   would from an ancestor on its own branch. It waits while the run is
   pending, gets the failure delivered once, or gets ordinary
   `CI_INCOMPLETE` handling. It never falls back to an older green ancestor.
3. Boundary: a revision that changes a non-ignored path, such as
   `src/**`, still waits on its own exact-SHA run.
4. Boundary: when the story branch has its own run nearer than trunk's,
   that nearer run stays the basis.

**Architecture:** Ancestor classification
(`ci-path-applicability.mjs`) and coverage/completion already follow a
`not_required` basis to its real attempt. The gap is only in candidate
discovery: the GitHub acquisition lists ancestor candidates for the observed
branch only, while the custom adapter's attempts are filtered to that
branch too. Cross-branch candidates feed applicability and ancestor-run
resolution only; integrated-state judging keeps filtering candidates by
branch. Each extra listing is one more request through the shared GitHub
request owner, so it is made only while a revision needs an inherited basis.

**Investigation (2026-11-06):** Running the shipped
`classifyUndiscoveredRevision` against `terryyin/open-dough` for
`0fc3d6447` gave `indeterminate / no-ancestor-basis` with this branch's
candidates (0 runs) and `not_required` with basis `7cde52861` with
`main`'s 100 recent runs. At that time, the newest 100 `push` runs across all
branches covered about 22 hours, and `main`'s 100 covered about 4.5 days.
Among `main`'s recent runs, 16 of 100 were cancelled, which is the
inherited-`incomplete` case in example 2. Exact `head_sha` lookups walked
from local Git would avoid the window, but they cost one request per
ignored-only commit on every poll, so they were considered and not chosen.

**Provenance:** Observed in client project Doughnut (Open Dough 0.3.86) at
SEED-104#clear-ci-docs-of-local-proof completion on
`cursor/clear-ci-proof-docs-of-local-proof-wording` at tip `34a142da59`;
observer `/tmp/dough-ci-501/watch-QowdUk` left both published SHAs
`undiscovered` because same-branch Actions history was empty while
`discoverApplicabilityCandidateRuns` only listed that branch. First planted as
Doughnut SEED-105#paths-ignored-ci-ancestor-status and moved here at the
owner's direction on 2026-11-06.
