# SEED-W: Widget work

<a id="widget-status"></a>

### Report widget status

**Status:** execution and retrospective complete.
**Plan:** `.planning/quick/001-widget-status/PLAN.md`.

SPENT-STORY-WIDGET-STATUS

A failed widget status check is retried twice before an error is returned.

This section is spent story history for wrap-up.

<a id="audit-trail"></a>

### Keep the audit trail

UNRELATED-SENTINEL-KEEP

This sibling story is active and must remain.

<a id="retry-backoff"></a>

### Retry widget status with backoff

**For / why:** Operators need a reachable status endpoint after a blip.
**Outcome:** A failed check waits and retries with backoff before erroring.
**Plan:** none yet.
