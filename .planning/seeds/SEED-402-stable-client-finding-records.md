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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Outcome.** A project maintainer can follow a client finding to the original evidence and rely on its ID after the log is recreated. The same evidence costs one account to maintain. Both changes operate on findings that already qualify for recording. The [two pilots](SEED-401-retrospective-finding-pilots.md) evaluate which observations qualify.

**One copy of shared evidence.** Once a committed shared finding preserves the complete account of the same project, execution and observation, replace the duplicate client narrative with one link pinned to that evidence. Retain the client finding ID, any former alias, the execution identity, and facts or links specific to the project. Verify the destination before shortening. Two Pygardon cleanups removed a net 262 lines while preserving distinct evidence. [Collection rule](../../.agents/skills/collect-client-feedback/SKILL.md#collect-reconcile-and-adopt) · [First cleanup](https://github.com/terryyin/pygardon/commit/83a41a1760ef0d39721b0dbfa4c95425d1b5392d) · [Second cleanup](https://github.com/terryyin/pygardon/commit/74964e5383b80d7c3157dd56b86c3ac09b31aae0)

- Collect the same material twice. After the first compaction the pinned link resolves to the full account. The second pass produces an empty finding-file diff.
- If the shared account omits a local effect, preserve that effect in the client. If the shared destination cannot be verified, keep the source evidence in place. A separate execution stays traceable even when its symptom is identical.

**Stable IDs after recreation.** On initializing a client log, distinguish a project's first findings file from a previously removed one. For a recreated file, recover prior allocations from its history, including known former paths and retained high-water metadata. Apply the existing matching and numbering rules. Terry Talks recorded three unrelated findings as `DD-001` in successive versions of its log. Each historical reference still needs its original revision to identify it. [Recording rule](../../Distribution/src/skills/dough-execution-retrospective/references/process-finding-recording.md) · [Whitespace check](https://github.com/terryyin/terry-talks/blob/276b222da4a5fd360b4c64efb77d999fffe90b1a/DearDough.md) · [Rendered review](https://github.com/terryyin/terry-talks/blob/33bb07f5a6cdd38c8c478f609de9cdc1ba47d52d/DearDough.md) · [Repeated exports](https://github.com/terryyin/terry-talks/blob/fc30efe109b5456656b68de74a3f927534ff09cb/DearDough.md)

- A project recording its first finding starts at `DD-001`. If a deleted log reserved numbers through 7, a different finding in the recreated log gets `DD-008`. A verified recurrence of an earlier finding keeps its established identity.
- If available history cannot establish a safe allocation, report the specific gap before assigning an ID. Older references continue to resolve at their recorded revisions.
