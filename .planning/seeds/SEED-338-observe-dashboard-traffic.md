---
id: SEED-338
status: active
planted: 2026-11-13
planted_during: Terry asked to observe dashboard traffic after the SSE and history optimizations land
trigger_when: the recorded dashboard optimization dependencies are satisfied
scope: story
---

# SEED-338 — Observe dashboard traffic after optimization

<a id="observe-dashboard-traffic-after-optimization"></a>

### Observe dashboard traffic after optimization

**Identity:** SEED-338#observe-dashboard-traffic-after-optimization
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-338#observe-dashboard-traffic-after-optimization","dependencies":[{"supplier":{"identity":"SEED-336#show-github-retry-on-the-dashboard","href":"seeds/SEED-336-live-dashboard-status.md#show-github-retry-on-the-dashboard"},"implementation":"GitHub retry ownership and stream continuity","rationale":"The observation is intended to measure the dashboard with github retry ownership and stream continuity in use. Measuring before it lands would attribute its earlier traffic to the optimized dashboard.","condition":"A streaming dashboard keeps its connection during GitHub backoff and renders backend-owned retry and recovery status.","state":"waiting"},{"supplier":{"identity":"SEED-335#keep-review-cues-current-with-sse","href":"seeds/SEED-336-live-dashboard-status.md#keep-review-cues-current-with-sse"},"implementation":"Story review delivery and stable completed-story links","rationale":"The observation is intended to measure the dashboard with story review delivery and stable completed-story links in use. Measuring before it lands would attribute its earlier traffic to the optimized dashboard.","condition":"Streaming pages receive review changes and keep confirmed sidebar cues steady without periodic review and unchanged-link reads.","state":"waiting"},{"supplier":{"identity":"SEED-336#stream-session-status","href":"seeds/SEED-336-live-dashboard-status.md#stream-session-status"},"implementation":"Live machine-session overview","rationale":"The observation is intended to measure the dashboard with live machine-session overview in use. Measuring before it lands would attribute its earlier traffic to the optimized dashboard.","condition":"The Board and sidebar receive observed session status over SSE without steady per-tab overview polling while streaming.","state":"waiting"},{"supplier":{"identity":"SEED-336#stream-ci-follow-up-status","href":"seeds/SEED-336-live-dashboard-status.md#stream-ci-follow-up-status"},"implementation":"Live CI follow-up status","rationale":"The observation is intended to measure the dashboard with live ci follow-up status in use. Measuring before it lands would attribute its earlier traffic to the optimized dashboard.","condition":"Completed-story cards receive CI follow-up changes without recurring CI follow-up GETs while streaming.","state":"waiting"},{"supplier":{"identity":"SEED-336#stream-host-status","href":"seeds/SEED-336-live-dashboard-status.md#stream-host-status"},"implementation":"Host status delivery while the sidebar is visible","rationale":"The observation is intended to measure the dashboard with host status delivery while the sidebar is visible in use. Measuring before it lands would attribute its earlier traffic to the optimized dashboard.","condition":"Interested sidebars receive shared host status over SSE, with sampling demand tied to visible consumers.","state":"waiting"},{"supplier":{"identity":"SEED-331#read-ci-history-at-a-glance","href":"seeds/SEED-331-read-ci-history-at-a-glance.md#read-ci-history-at-a-glance"},"implementation":"Selected-story and scoped CI history","rationale":"The observation is intended to measure the dashboard with selected-story and scoped ci history in use. Measuring before it lands would attribute its earlier traffic to the optimized dashboard.","condition":"Selected-story CI comparison and scoped chart views use their compact history responses with the intended evidence preserved.","state":"satisfied","resolution":{"revision":"33eb3f8cd99cb7e9131d072bf06576ef01cf3eaa","path":".planning/seeds/SEED-331-read-ci-history-at-a-glance.md#read-ci-history-at-a-glance","summary":"Satisfied by the integrated SEED-331 glance read (trunk 743adc4). The Done CI comparison and the entry, folder and file scope history views request `history=glance` (dashboard/src/ciHistoryGlanceCapability.ts, authenticatedIntentCiHistoryRead.ts); dashboard/backend-tests/intent/ci-history-glance-compatibility.spec.ts records both current readers sending it, and ci-history-slim-response.spec.ts proves the answer carries dated measurements, typed gaps with reasons, segments, the selected endpoint, provenance and compact reference figures without membership, median or run links, while the default answer and the follow-up ledger keep their full evidence (intent-ci-follow-up.spec.ts). Project Intent's top-level CI status history still reads the full answer, which SEED-337 covers.\nCondition satisfied: Selected-story CI comparison and scoped chart views use their compact history responses with the intended evidence preserved.\nAccepted integration: 743adc47f17567c45ef4a40e2752e00f46b37e8f on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-337#read-only-the-history-the-dashboard-needs","href":"seeds/SEED-337-dashboard-history-reads.md#read-only-the-history-the-dashboard-needs"},"implementation":"Scoped session and Project Intent history reads","rationale":"The observation is intended to measure the dashboard with scoped session and project intent history reads in use. Measuring before it lands would attribute its earlier traffic to the optimized dashboard.","condition":"Recently done sessions and Project Intent CI history use the smaller initial reads and retrieve additional evidence when inspected.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

Maintainers can use a measured dashboard traffic baseline to refine the
browser-to-backend communication architecture and identify the next worthwhile
traffic optimization.

#### Scope to refine

- Observe for 15 minutes total across the main dashboard views after the
  prerequisite changes are deployed. Cover Development with the Sessions
  sidebar and **Recently done sessions** visible, Project Intent **CI status**
  and its chart, and a selected story's CI comparison or **Proof** history.
  Record the revision, project, view, observation time, visibility, protocol,
  and stream or fallback status. Keep navigation and initial loading outside
  each measured interval.
- Capture only traffic the dashboard generates during those intervals. Use
  passive browser network observation for HTTP requests and responses, SSE
  connections and events, and WebSocket traffic if present. The observer sends
  no requests, triggers no reloads or actions, and induces no synthetic traffic.
- Report request and connection counts, transfer sizes where observable,
  repeated or unchanged reads, and idle or naturally occurring updates by
  view and domain purpose. Distinguish actual bytes from decoded sizes or
  unmeasured event sizes. A quiet window gives no evidence about a status
  transition that did not occur.
- Deliver two evidence-backed conclusions. Recommend what to retain or refine
  in the dashboard communication architecture and identify the next traffic
  optimization worth investigating, or name the missing evidence if the
  observation cannot support one. Compare options by user-visible freshness,
  requests and bytes, backend work where observed, and fidelity to the domain
  model. Keep any ADR decision with the maintainer.

#### Key example to refine

After the recorded dependencies land, prepare the major views and observe 15
minutes of their normal traffic without interacting during measurement. The
report ties the requests, updates, and bytes to named domain data and explains
which traffic serves the views. It cites that evidence for both an architecture
recommendation and a candidate optimization, with a proposed measure of success.

Follow [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)
for measured gains and [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
for direct mapping to domain concepts with the minimum necessary translation.
