The switch cannot be assessed as permissible until a human resolves ARC-12’s contradictory standing:

- [CATALOG.md](</private/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.SUXFC64OyG/atlas adopter/architecture/decisions/CATALOG.md:11>) reports ARC-12 as `Replaced`.
- [ARC-12](</private/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.SUXFC64OyG/atlas adopter/architecture/decisions/retain-complete-telemetry-history.md:3>) reports itself as `Adopted`.

Both are joint lifecycle authorities, so repository guidance requires human resolution rather than choosing one.

If ARC-12 is confirmed `Adopted`, switching to per-node files directly conflicts with its requirement to retain complete telemetry history in shared object storage. It could proceed only through a human-adopted replacement or a human-approved exception recorded in [architecture-exceptions.md](</private/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.SUXFC64OyG/atlas adopter/governance/architecture-exceptions.md:1>), which currently contains no exceptions. ARC-07 cannot authorize the switch because it is consistently `Replaced` and points to ARC-12.

No files were edited. The ADR check remains incomplete pending a human determination of ARC-12’s standing.