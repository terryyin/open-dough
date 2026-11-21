# 0011 — Review scope in Product intent

**Status:** Proposed

**Date:** 2026-11-21

**Decision makers:** Terry Yin

**Consulted:** Terry supplied the review journeys and confirmed the Done rule.

## Context

Review changes and Intent can show the same file with different revision baselines.

## Decision

Review changes opens Product intent. A review identifies the project, optional
story and sessions, revision or comparison, and repository path. Source, diffs
and Proof share that selection. Each CI observation identifies the revision it
measured. A story-specific proof delta requires comparable observations that
isolate the selected contribution.

Marking an ad hoc session Done creates a Done story only when the session has
no story. A session with a story keeps its association. Each follow-up has
its own session ID under that same story.

## Consequences

Session identity and published comparisons survive checkout retirement.
Navigation and file filters are disposable. On acceptance, this amends the
story-review and Side panel responsibilities in [ADR 0008](0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts).
