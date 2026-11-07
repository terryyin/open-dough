---
id: SEED-118
status: active
planted: 2026-10-07
planted_during: Terry's follow-up review of dashboard GitHub responsiveness
trigger_when: A temporary GitHub failure leaves the dashboard empty or incomplete, or repeated observations reread the same published facts
scope: unknown
---

# SEED-118: Reliable dashboard reading after temporary GitHub failures

## Why This Matters

A developer observing published work needs the dashboard to recover from a
temporary service failure without repeatedly reloading the page. Terry still
sees the 30-second "Published work could not be read" message and reports
occasional GitHub CLI 403 responses after most of the original responsiveness
improvements have shipped.

The review on 2026-10-07 found independent fact arrivals, shared outstanding
reads, and reuse after publication in production. Consistent rate-limit
recovery was implemented on a separate branch and is expected to land soon.
That story, SEED-113#recover-consistently-from-rate-limits, explicitly excludes
ordinary timeout and connection-failure recovery. These follow-ups preserve
its cooldown and demand-admission behavior.

The reported timeout happened before backlog membership appeared. Initial
failure leaves no shown revision to drive refresh checks; failed details also
remain missing when a later check finds an unchanged revision.

One live GitHub ref read succeeded in 0.17 seconds and the running dashboard's
initial endpoint succeeded in 0.36 seconds during the review. Those samples did
not reproduce the earlier failure or establish a cold-load baseline. The
failing response was not captured, and a generic 403 does not establish a rate
limit. The selected work must distinguish observed causes from hypotheses.

## Selected Stories

<a id="show-cards-before-expensive-cache-validation"></a>

### Show basic story cards without waiting for expensive cache validation

**Identity:** SEED-118#show-cards-before-expensive-cache-validation
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer opening or refreshing a dashboard whose published
revision changed while comparison or commit-history requests are slow.

**Goal:** Once the published revision and its backlog can be read, basic story
membership and titles appear without waiting for comparison or history work
used to validate reuse of later facts.

**Scope:** Establish a prompt path to basic cards, with detail and reuse
validation completing independently where their evidence allows. Preserve
published revision provenance, explicit gaps, and the existing bounded request
demand. Do not weaken evidence for unchanged assignment attribution or hide a
failure by displaying another revision's facts. Refinement selects the reading
strategy after measuring its latency and request-count tradeoff.

**Key examples / evaluation:** The server holds records from revision A and the
ref moves to B. Hold comparison or intervening-commit responses while answering
B's backlog: B's basic cards appear, with unread detail labeled. Later answers
complete only facts valid for B. A failed comparison does not prevent basic
membership from being shown when the backlog itself is readable. Compare time
to first cards and total upstream calls with the current route for unchanged
planning records and changed assignments. Keep the actual ref or backlog being
unavailable visibly distinct from slow enrichment.

**Open questions for refinement:** The smallest basic-card facts, how to keep
reuse validation off their critical path, and the acceptable extra-request
tradeoff supported by measured journeys.

**Depends on:** No blocking story prerequisite. Shared read machinery alone
does not require the transient-recovery story to finish first.

**Safe stopping point:** Basic published work appears promptly even if some
details still fail or further request savings are deferred.

## Ordering and Scope Reduction

Terry selected these as production backlog priorities on 2026-10-07.
Recovering from temporary failures comes first because the reported timeout can
leave the page empty indefinitely.
Diagnostics belong to the recovery story, not a separate metrics product.

The recovery story has recorded refinement and an associated Slice Plan.
Preparation records do not authorize implementation.

## Breadcrumbs

- Terry's screenshot and report of recurring timeout and CLI 403 messages,
  follow-up review, and explicit selection of the three stories, 2026-10-07.
- [Dashboard request accounting](../../dashboard/GITHUB-REQUESTS.md).
- [Published reading contract](../../dashboard/PUBLISHED-OBSERVATION.md).
- [Project visibility requirements](../../docs/project-visibility-requirements.md).
- [GitHub API troubleshooting](https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api).
- [GitHub API best practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api).
