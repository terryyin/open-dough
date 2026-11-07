---
id: SEED-257
status: active
planted: 2026-11-07
scope: story
---

# Story CI comparison for custom CI projects

<a id="compare-story-ci-through-adapters"></a>

### Compare story CI builds from custom adapters in Intent

**Identity:** SEED-257#compare-story-ci-through-adapters
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/495-compare-story-ci-through-adapters/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a5d03c3730337899f932c96c6b1ee2a7a67f98258685e199b18c8c461423f631","plan":"f031ba7fcd4fa9aef2f34e749519f2404d8c89a54121e069406c5d2beb1ae076"}}
```

**Beneficiary:** A developer reviewing a Taken or Done story in a project
whose CI is read through a `ciAdapter`.

**Goal:** Intent's story CI comparison shows the Baseline, Branch (or
Provisional) and Landed builds for a story in a `ciAdapter` project, as it
does for GitHub Actions, so the developer can judge how the story changed CI
proof and time. Today such a project only sees "This project's CI adapter
does not list builds by revision".

**Scope:**

- **Builds from `discover`.** Find each endpoint's build among the attempts
  the adapter's existing `discover` answers, by their full `sha`, using the
  existing endpoint and first-parent ancestry rules unchanged: baseline at or
  before the story start, branch or provisional at the tip or a later
  story-side ancestor, landed exactly at the landing revision for Story
  Branch Mode and by the completion walk for Trunk Mode. Ask `discover` for
  the configured target branch and, when the story's branch is known, that
  branch as well, as CI status already does. An attempt counts for its exact
  revision whichever branch it was validated for. No new adapter operation:
  Pygardon's `discover` already answers every retained attempt across
  branches (observed below).
- **Attempt selection.** Per revision, the newest attempt by `time` among
  the same check and context, preferring a completed `success` or `failure`
  over a later `incomplete` one at that revision as the GitHub rule prefers
  a passed or failed attempt over a cancelled one. `pending` is running.
- **Build identity.** Each shown build names its revision and subject,
  exact or ancestor, its adapter `url` when given, its `runId` and
  `attemptId` as text, and its outcome.
- **Wall time** from the attempt's `startedAt` and `completedAt` when both
  are present, as the CI status tab measures it; otherwise the build says
  its wall time is not recorded and carries no difference.
- **Proof** for each completed build through the existing adapter `proof`
  read, with the endpoint's `runId`, `attemptId`, full revision and the
  branch whose `discover` listed it, under the existing validity and
  attemptId-ambiguity rules. The comparison's counts and any reported
  `durationMs` then follow as for GitHub Actions.
- **Named gaps.** A revision no answered attempt covers (never built, or no
  longer retained by the CI service) gives the existing "No completed CI
  build was found …" endpoint wording. A failed or timed-out `discover`
  makes the endpoints unavailable with the adapter's reason, as the CI
  status tab does. A missing or invalid summary keeps its build visible with
  the proof read's own reason.
- **Preserve GitHub Actions comparisons** and the CI status tab unchanged.

**Deferred promises:**

- A separate historical lookup operation for builds the CI service no longer
  retains. Expiry is a named gap; reconsider only when retention proves too
  short in use.
- Time without runner waits for adapter builds belongs to
  [SEED-256](SEED-256-compare-ci-time-without-runner-waits.md#compare-ci-time-without-runner-waits),
  whose unavailable-with-reason rule covers attempts without a job graph.
- Ancestor proof for skipped builds
  ([SEED-254](SEED-254-use-ancestor-ci-proof-for-skipped-builds.md#use-ancestor-ci-proof-for-skipped-builds))
  and comparison cues and wording
  ([SEED-255](SEED-255-compare-before-and-after-ci-proof.md#compare-before-and-after-ci-proof))
  keep their own stories; whichever lands later applies to adapter builds
  through the shared comparison answer.
- Pygardon's own `discover` does not yet send `startedAt`/`completedAt`;
  its
  `SEED-20261079#show-ci-attempt-wall-time` adds them in that project. Until
  it lands, live Pygardon builds show "not recorded", and wall times are
  proved with an adapter fixture.

**Key examples:**

- *Done story with a landing merge, live Pygardon.*
  `SEED-20261076#publish-pygardon-ci-proof` started at `305165fa4`, its
  branch side ended at `eee4fa149` and it landed by the merge `b450e5058`.
  `discover` answers passing attempts at `36191bf8b` (`main`, the nearest
  built ancestor of the start), `90038b500`
  (`cursor/publish-pygardon-ci-proof-for-intent`, the nearest built
  story-side ancestor of `eee4fa149`) and `b450e5058` (`main`). Intent shows
  Baseline at `36191bf8b` and Branch at `90038b500`, both ancestors, and
  Landed exactly at `b450e5058`, each with its `proof` counts such as
  `tests` 6,402 checks where a summary is kept, and no duration difference
  because Pygardon's summaries carry no `durationMs`.
- *Done fast-forward story, live Pygardon.*
  `SEED-20261075#story-live-jobs-updates` started at `5e8976e65` and landed
  by fast-forward at `16b339eb8`, which has a passing attempt validated for
  `cursor/receive-jobs-status-changes-as-they-happen`. Baseline is
  `b450e5058` (ancestor); Branch and Landed are `16b339eb8` (exact).
- *Taken story, adapter fixture.* A Story Branch story whose tip has a
  `pending` attempt and whose previous story-side commit has a completed
  `success` attempt with `startedAt` 10:00:00 and `completedAt` 10:06:30.
  Branch shows the ancestor build and its wall time 6 min 30 s as a GitHub
  build's wall time is shown, and that a later attempt is still running;
  Landed says the story has not landed yet.
- *Expired baseline.* The story start and its 30 first-parent ancestors have
  no answered attempt because the service has pruned them. Baseline shows
  the existing "No completed CI build was found at or before the story's
  start …" gap; Branch and Landed keep their builds.
- *Proof not kept.* The landed attempt exists but `proof` answers
  `{"unavailable": "no summary retained for this attempt"}`. Landed keeps its
  revision, outcome and wall time and shows that reason where its counts
  would be.
- *Two attempts at one revision.* A `failure` at 09:00 then a retry
  `success` at 09:20 at the landing revision: Landed uses the 09:20
  success.

**Investigation (2026-11-07):**

- Fact — the comparison read refuses every adapter project before any
  lookup (`dashboard/server/baseCiRevisionLookup.ts`,
  `revisionLookupOrGap`); the CI status judgment already runs `discover`
  for the target and story branch (`dashboard/server/baseCiJudgment.ts`) and
  the proof read already accepts adapter identities
  (`dashboard/server/intentCiProofRead.ts`).
- Fact — Pygardon's `discover` (`scripts/pygardon-ci-discovery.mjs`) maps
  every attempt its CI service holds, on any branch, setting `branch` only
  for the requested one; its live service answered 108 attempts from
  2026-09-27 to 2026-11-07 across 27 branches, enough for the done example
  above. Its attempts carry `time` but not `startedAt`/`completedAt`.
- Fact — Pygardon's live `proof` answered a valid counts-only summary for
  attempt `f4880532-…` at `d1b35a09a`.
- Hypothesis left open — another adapter may answer only a few recent
  attempts per branch; its older endpoints then show the named gap, which
  the deferred historical lookup would address.

**Architecture:** The comparison's per-revision lookup gains a second source
beside GitHub Actions: the attempts the adapter's `discover` answered,
indexed by revision, behind the same endpoint and ancestry rules. Endpoint
build identity carries either a GitHub run and attempt or an adapter attempt
(text `runId`/`attemptId` and the listing branch), as CI status already
separates them, so the proof read and later stories consume one comparison
answer. The dashboard derives builds from the adapter's observations on
read and keeps missing evidence distinct from measurement, as
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
requires. A completed Done answer is remembered for the process as today;
a remembered build whose attempt later expires shows the proof read's
reason.
