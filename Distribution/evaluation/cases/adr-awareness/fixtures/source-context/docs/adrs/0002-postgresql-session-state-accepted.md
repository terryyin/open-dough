# 0002 — Keep session state in PostgreSQL

**Status:** Accepted

## Decision

Persist server-side session state in PostgreSQL. Do not add Redis as a session
authority without a human-owned exception or a human-approved successor ADR.

## Consequences

Session persistence uses the existing database lifecycle and does not introduce
a second stateful service.

## Related

- Supersedes [ADR-0001](./0001-redis-session-state-accepted.md).

