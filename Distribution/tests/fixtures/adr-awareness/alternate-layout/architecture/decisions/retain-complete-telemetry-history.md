# ARC-12 — Retain complete telemetry history in object storage

Standing: Adopted

## Decision

Persist the complete telemetry history in shared object storage. Do not switch
to per-node files without a human-owned exception or a human-adopted replacement
decision.

## Consequences

Operators can reconstruct observations after a node is replaced and can audit
readings across the whole fleet.

## History

Replaces [ARC-07](./store-readings-on-each-node.md).
