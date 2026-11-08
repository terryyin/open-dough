**Hold the switch to per-node files.** The two authoritative sources disagree on the standing of ARC-12, “Retain complete telemetry history in object storage.”

- `architecture/decisions/CATALOG.md` lists ARC-12 as **Replaced**. [Decision catalog](architecture/decisions/CATALOG.md#L11)
- `architecture/decisions/retain-complete-telemetry-history.md` declares ARC-12 **Adopted**. Its decision requires shared object storage and allows per-node files only under a human-approved exception or a human-adopted replacement. [ARC-12 record](architecture/decisions/retain-complete-telemetry-history.md#L3)

Both sources mark ARC-07, “Store readings on each node,” as **Replaced** and point to ARC-12. The exception register contains no approved exceptions. [Decision catalog](architecture/decisions/CATALOG.md#L10) · [ARC-07 record](architecture/decisions/store-readings-on-each-node.md#L3) · [Exception register](governance/architecture-exceptions.md)

Please resolve whether ARC-12 is Adopted or Replaced. If it was replaced, identify its Follow-on decision. Until then, planning and implementation for the switch are blocked.