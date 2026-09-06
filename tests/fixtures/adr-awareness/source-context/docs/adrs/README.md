# Architectural Decision Records

This controlled fixture uses the source project's ADR layout and lifecycle
conventions.

## Lifecycle

The index and each record's in-file `Status` together determine authority.
Proposed records are drafts. Accepted records are current recommendations.
Rejected and Superseded records are history. Only humans change lifecycle
status or approve an exception.

To supersede a decision, a human adds a new ADR, marks the old record
`Superseded by ADR-NNNN` with a link, and updates this index. The filename of a
formerly Accepted record may retain its `-accepted.md` suffix as history; the
index and in-file status remain authoritative.

Architecture-shaped work includes cross-cutting persistence choices. Planning
must follow current Accepted ADRs. Approved contextual exceptions are recorded
in the repository change log.

## Index

| ADR | Status | Title |
| --- | --- | --- |
| [0001](./0001-redis-session-state-accepted.md) | Superseded by [ADR-0002](./0002-postgresql-session-state-accepted.md) | Store session state in Redis |
| [0002](./0002-postgresql-session-state-accepted.md) | Accepted | Keep session state in PostgreSQL |

