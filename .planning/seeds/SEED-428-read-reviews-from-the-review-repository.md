---
id: SEED-428
status: active
planted: 2026-11-24
planted_during: Developer decision to separate Review repository adoption from published-only review
trigger_when: selected from the product backlog after published-only review lands
scope: one story
---

# SEED-428 — Read published reviews from the Review repository

<a id="read-reviews-from-the-review-repository"></a>

### Read published reviews from the Review repository

**Identity:** SEED-428#read-reviews-from-the-review-repository
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/803-read-reviews-from-the-review-repository/PLAN.md","assessment":"not-ready","reasons":["Refine the provisional reader migration against the delivered published comparison contract and settle concurrent fetch, offline reads, and file-navigation proof."],"basis":{"document":"68f79ebcc862c020140d27ca441cbb71d4678665293547412db51bacb877d46f","plan":"2dcace4f54d7b4a40dfe16f88231406d8f1015980c168dcf9b9d06e088ffa132"}}
```
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-428#read-reviews-from-the-review-repository","dependencies":[{"supplier":{"identity":"SEED-427#review-published-changes","href":"seeds/SEED-427-review-published-changes.md#review-published-changes"},"implementation":"Published story and session comparisons with local-only review retired","rationale":"Adoption starts from the published comparison contract and uses the surviving readers and tests as its parity baseline.","condition":"SEED-427 has landed on origin/main. Published story and session comparisons are the supported review paths, and review of unpushed commits and working-tree changes has been removed.","state":"waiting"}]}
```

**Goal.** A developer can open and browse the same published review without
an execution checkout. Previously synced comparisons stay readable when origin
is unavailable, and file navigation uses local Git.

**Starting point.**
[SEED-427](https://github.com/terryyin/open-dough/blob/d0489607774ee6a3dd2c69b3fd5e0409288e68ab/.planning/seeds/SEED-427-review-published-changes.md#review-published-changes) delivers
the published story and session comparison contract and removes local-only review
paths and their dedicated proof. Adopt the new Git source for those surviving
readers. The temporary design direction lives in the
[Architectural North Star](../NORTH-STAR.md#read-published-comparisons-from-the-review-repository)
and is retired when adoption lands.

**Scope.** Move Taken story branches and trunk, Done story completions, accepted
landings, and recorded session ranges to the Review repository. Keep attribution,
comparison selection, and the exact context used for file lists, diffs, source,
Proof, notes, and follow-ups. Share fetches for concurrent readers of one project.
Reuse the resolved comparison across file reads. Keep the last readable comparison
and show its sync status when refresh fails. Retire the previous review access
paths and support once their callers move. Keep CI-provider reads with CI and keep
execution, publication, and landing with their workflow owners.

**Key examples.**

- Open a published comparison on a machine with no execution checkout and verify
  the same endpoints, changed paths, diff, and associated context.
- Reopen a previously synced review while origin is unavailable. Switch files
  and verify the exact diffs with zero remote requests. A cold review reports the
  unavailable sync. After recovery, Refresh can advance a live comparison and
  keep the selected file when it is still present.
- Concurrent opens share a fetch. Repeated file reads reuse the resolved
  comparison and validate paths against its fixed endpoints.

**Effort hypothesis.** L, with medium confidence until the surviving readers and
their exact comparison fixtures are known after SEED-427.
