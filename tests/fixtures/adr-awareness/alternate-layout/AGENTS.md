# Atlas architecture guidance

Architecture-shaped work must consult
`architecture/decisions/CATALOG.md` and the records it names. This project maps
its local lifecycle terms as follows: `Draft` is proposed and non-binding,
`Adopted` is a current accepted decision, and `Replaced` is superseded history.
The catalog and each record's `Standing` field are joint status authorities. If
they disagree, stop and ask a human to resolve the ambiguity. Filenames are
descriptive only and never encode lifecycle state.

Follow replacement links through the record's `Follow-on` field to the newest
`Adopted` decision. Humans own adoption, rejection, replacement, and contextual
exceptions. Agents may cite decisions and stop conflicts, but may update decision
metadata only after explicit human direction. Approved exceptions are recorded
in `governance/architecture-exceptions.md`. Planning cannot override an
`Adopted` decision.

Architecture-shaped work includes changes to the shared telemetry retention
strategy. Do not load conventions or decisions from another project.
