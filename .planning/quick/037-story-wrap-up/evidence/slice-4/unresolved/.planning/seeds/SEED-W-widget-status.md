# SEED-W: Widget work

<a id="audit-trail"></a>

### Keep the audit trail

UNRELATED-SENTINEL-KEEP

This sibling story is active and must remain.

<a id="retry-backoff"></a>

### Retry widget status with backoff

**For / why:** Operators need a reachable status endpoint after a blip.
**Outcome:** A failed check waits and retries with backoff before erroring.
**Plan:** [.planning/quick/002-retry-backoff/PLAN.md](../quick/002-retry-backoff/PLAN.md)

<a id="widget-slo"></a>

### Document widget SLO

**For / why:** Operators need a published availability target.
**Outcome:** The widget doc states the status endpoint SLO.
