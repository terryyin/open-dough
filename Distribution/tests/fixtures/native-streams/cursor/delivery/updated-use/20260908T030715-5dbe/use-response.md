I'll follow the dough-adr-awareness skill and check the project's ADRs for any constraint on switching telemetry history to per-node files.Loading the ADR catalog and checking decisions that govern telemetry retention.Both catalog entries look replaced; checking in-file status and whether ARC-12 has a valid successor.**Verdict:** This is architecture-shaped work (shared telemetry retention), but the check cannot finish — **ARC-12’s standing is ambiguous**, so whether a switch to per-node files is allowed cannot be decided from the records alone. No files were edited.

### Adopter context used
- Catalog: `architecture/decisions/CATALOG.md`
- Lifecycle: `Draft` / `Adopted` / `Replaced`; catalog `Standing` and record `Standing` are joint authorities
- Supersession: record `Follow-on`
- Exceptions: `governance/architecture-exceptions.md` (empty — no approved exceptions)

### Status authority conflict (blocks the check)
For **ARC-12**:

| Source | Reported standing |
| --- | --- |
| `architecture/decisions/CATALOG.md` | `Replaced` |
| `architecture/decisions/retain-complete-telemetry-history.md` | `Adopted` |

Per project rules, that disagreement must be resolved by a human before any dependent conclusion. The catalog also marks ARC-12 `Replaced` without a successor; the record has no `Follow-on`.

**ARC-07** (`store-readings-on-each-node.md`) is consistently `Replaced` with `Follow-on` → ARC-12. That is the old per-node-files decision and is historical only.

### If ARC-12 were current `Adopted`
Switching telemetry history to per-node files would **conflict** with ARC-12’s decision: keep complete history in shared object storage; do not move to per-node files without a human-owned exception or a human-adopted replacement.

### What I need from you
Please resolve ARC-12’s standing (and name a successor if it is truly `Replaced`). Until then I will not treat the switch as allowed or blocked by a binding ADR.
