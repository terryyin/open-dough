---
id: SEED-402
status: active
planted: 2026-11-18
planted_during: Review of historical client retrospective findings
trigger_when: Selected from the product backlog
scope: One story covering duplicate evidence and finding ID allocation
---

# Keep client retrospective findings traceable

<a id="keep-client-finding-evidence-and-ids-stable"></a>

### Store duplicate finding evidence once and preserve IDs across log recreation

**Identity:** SEED-402#keep-client-finding-evidence-and-ids-stable
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/704-stable-client-finding-records/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1e3314f99025faf12da07453aadaf3c0bba093e9c1fe983a772eefb935dbde57","plan":"ca6adc8c51b7f4d685d8ff576e3b4c6cec37448b31b9c05c239128f504d4d99e"}}
```

**Goal.** A project maintainer can follow a finding from its local ID to the evidence for a particular execution, even after collection shortens the account or the project recreates its log. Maintaining one complete copy of shared evidence saves duplicate editing. Keeping each allocated number tied to its finding makes older references trustworthy.

**Scope**

- During shared collection, replace duplicated narrative with one revision-pinned link after verifying that the committed destination contains the same project's execution, observation, provenance and qualifications. Keep the source finding ID, former aliases, execution identity, project-specific effects and working local links. Preserve evidence whose destination cannot be verified.
- When a supported finding needs a missing log, distinguish first use from recreation using the project's available history, including known former paths and retained allocation metadata. Apply the existing matching and numbering rules across that boundary. Keep historical collisions distinguishable by revision.
- Both changes concern findings that already qualify. The [two pilots](SEED-401-retrospective-finding-pilots.md) own admission criteria. Historical logs supply examples. This story changes the guidance for future writes and collections.

**Key examples**

| Starting evidence and action | What the maintainer can observe |
| --- | --- |
| Collect a client occurrence whose complete account is already committed at the shared owner, then collect the same input again. | The client entry retains its identity and one pinned evidence link. Following it recovers the original account. The second pass leaves the finding files byte-identical. |
| A client occurrence also records a local effect or links to local work. A second execution reports the same symptom. | Only the verified duplicate portion becomes a link. The local effect and links remain, and each distinct execution can still be identified. An unreadable or mismatched destination leaves the affected source evidence intact. |
| Record a first finding in a project with no earlier log. In a different project, the log was removed after reserving numbers through 7. | The first project starts at `DD-001`. In the second, a different finding gets `DD-008`. A verified recurrence keeps its established DD or adopted ODF identity and any former alias. Subsequent allocations still respect the recovered high-water mark. |
| Available history cannot establish a safe allocation for the missing log. | The recorder names the missing evidence and leaves the finding unallocated. Older references that share a number remain distinguishable at their original revisions. |

**Historical evidence.** The two Pygardon cleanups removed a net 262 lines across the index and related records. Terry Talks created three different `DD-001` findings across successive versions of its log. [First cleanup](https://github.com/terryyin/pygardon/commit/83a41a1760ef0d39721b0dbfa4c95425d1b5392d) · [Second cleanup](https://github.com/terryyin/pygardon/commit/74964e5383b80d7c3157dd56b86c3ac09b31aae0) · [Whitespace check](https://github.com/terryyin/terry-talks/blob/276b222da4a5fd360b4c64efb77d999fffe90b1a/DearDough.md) · [Rendered review](https://github.com/terryyin/terry-talks/blob/33bb07f5a6cdd38c8c478f609de9cdc1ba47d52d/DearDough.md) · [Repeated exports](https://github.com/terryyin/terry-talks/blob/fc30efe109b5456656b68de74a3f927534ff09cb/DearDough.md)
