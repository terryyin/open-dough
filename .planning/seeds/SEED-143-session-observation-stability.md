---
id: SEED-143
status: active
planted: 2026-10-19
planted_during: Production Sharadar notification diagnosis
---

# SEED-143: Stable session observation and review alerts

<a id="stable-review-alerts-and-bounded-codex-status-reads"></a>

### Stable review alerts and bounded Codex status reads

**Identity:** SEED-143#stable-review-alerts-and-bounded-codex-status-reads
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Keep an already-observed ready-for-review session quiet through failed
reads, and prevent dashboard status observation from overwhelming Codex.

**Scope:** Preserve the last confirmed review notification state across unknown,
incomplete, or omitted observations, while still notifying after actual resumed
work completes. Bound concurrent Codex status reads across overlapping dashboard
observations without losing individual results or cancellation/deadline behavior.
Preserve existing input-request continuity, independent native session identities,
quiet startup, unread reports, and marked-done behavior.

**Expectations:** A review/failed-read/review cycle with the same completed turn
produces no repeat notification. Observed working followed by review still alerts.
Several simultaneous status observations never exceed the selected native-read
bound, finish queued readable sessions, and release capacity after a failure or
cancellation. Observation remains passive: no discovery, resume, or native input.

**Evidence:** Production repeatedly showed the Sharadar execution session
`01a152e2-a88e-75b2-ac9f-34d949629300` changing from review to unknown and back
with the same completed turn. The native adapter captured `-32001`,
`Server overloaded; retry later.` It fans out 242 saved Codex records, including
237 marked done, concurrently. A replay through SessionAlerts reproduced review
notifications after unknown, incomplete, and omitted observations; the input
continuity path stayed quiet. The developer explicitly requested both repairs.
