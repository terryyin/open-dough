---
id: SEED-236
status: active
planted: 2026-11-05
planted_during: Terry Yin's request to queue the Open Dough supplier for Pygardon CI proof
trigger_when: A developer opens Intent’s CI status tab for a project that uses a CI adapter
scope: story
---

# SEED-236 — Show the CI proof of a CI-adapter attempt

<a id="show-ci-adapter-proof"></a>

### Show the CI proof of a CI-adapter attempt

**Identity:** SEED-236#show-ci-adapter-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/470-show-ci-adapter-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"afac502e0c12b2d9d4b4752dae111341fcb4f5779c656eba430fb8a8ac6e8b9a","plan":"13cf9edc06dc0df1719a9ecaec5881a2ce4abeb8b28298896421c0e85eb9f88c"}}
```

**Goal:** A developer who opens **Intent → CI status** for a project whose CI
is read through a `ciAdapter` sees, below the verdict, the proof counts and
parts that the displayed attempt published, as GitHub Actions projects already
do. When there is no proof to show, one line says why and the verdict is
unchanged. Pygardon is the first such project: its controller identifies
attempts with UUIDs, and its story
`SEED-20261076#publish-pygardon-ci-proof` consumes this story's release to
complete its live Intent check.

**Scope:**

- Required: the CI proof collector accepts a CI-adapter attempt identity. A
  fragment and a summary can name the adapter's `attemptId` as text, with the
  full revision and the repository, in place of the GitHub Actions `runId` and
  `runAttempt` integers. `summarize` collects only fragments of that same
  attempt and revision, as it does for a GitHub Actions attempt. A GitHub
  Actions summary written by an already copied collector stays valid.
- Required: the CI adapter protocol gains a `proof` operation. Its request
  names the check and the attempt (`runId`, `attemptId`, `sha`), as
  `diagnose` does. It answers either with the attempt's summary or with
  `unavailable` and a reason. The existing per-invocation timeout and stdout
  limit apply; a summary that exceeds them reads as unreadable. `discover` and
  `diagnose`, and the execution observer, are unchanged; the observer never
  asks for proof.
- Required: the CI status judgment of a `ciAdapter` project keeps the shown
  attempt's identity (today it is stripped). The tab reads that attempt's
  proof through the project's adapter, run from the project folder like
  `discover`, apart from the judgment, so a slow or failed proof read never
  delays or alters the verdict. A running result's proof is its completed
  ancestor's, as for GitHub Actions.
- Required: the tab shows the summary only when its repository, `attemptId`
  and full revision equal the displayed attempt's, and no other discovered
  attempt has that same `attemptId` and revision. A numeric adapter
  `attemptId` matches the summary's text form of it. Otherwise one line says
  why Proof is unavailable:
  - the adapter answered no proof read (it failed, timed out, exited nonzero
    or answered invalid JSON, as an adapter without the operation does), with
    its error;
  - the adapter's own `unavailable` reason;
  - the summary is not a valid summary;
  - the summary names another repository, attempt or revision; or
  - the attempt is ambiguous at its revision.
  Each follows
  [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  missing or conflicting evidence is never shown as a negative result.
- Required: guidance. The adapter manual documents the `proof` operation and
  its answers. The CI proof summary reference tells an adapter project how to
  write fragments and its summary inside its own CI job with the adapter
  identity and how its adapter serves it, instead of stopping at `ciAdapter`.
- Required: release. Once the changes land on `main`, publish an Open Dough
  release (the next patch version, through `release-version`) that contains
  the collector, protocol and guidance, so Pygardon can install them with
  `dough-update`. The tab itself reaches the production dashboard from
  `main`.
- Preserved: the GitHub Actions artifact reader, its run identity, its
  reasons and its requests. The verdict of every project.
- Deferred promises: proof for an adapter whose attempt IDs repeat across runs
  at one revision (shown as ambiguous); structured adapter reason codes beyond
  the adapter's own text; proof history across attempts; the launch's base-CI
  confirmation showing proof; updating the copied collector or adapter in
  other projects (each project's own `dough-update` and story); the live
  Pygardon check, which its own story owns.
- Boundary assumptions: the summary is labelled by the attempt that wrote it.
  The adapter checks it against its CI service's attempt record, and the tab
  checks it again against the attempt it displays; the counts are as
  trustworthy as the project's CI job. The dashboard keeps nothing beyond the
  request.

**Key examples:**

1. A `ciAdapter` project's newest attempt `9f1c…` (a UUID) passed at revision
   `R`. Its adapter answers the proof read with a summary naming the same
   repository, `attemptId` `9f1c…` and `R`, with `tests` 1,000 passed,
   0 failed, 3 other, part 1 of 1 present. The tab shows Passed, the attempt
   and short revision, and that `tests` row.
2. Attempt `A` failed at `R`; its retry, attempt `B`, passed at `R`. The tab
   shows `B`'s verdict and `B`'s proof. If the adapter answers `B`'s read with
   `A`'s summary, Proof says it names another attempt and shows no counts.
3. The branch head's attempt is still running; its parent's attempt finished.
   The tab shows the running result beside the completed ancestor's verdict
   and that ancestor attempt's proof.
4. The project's adapter predates the `proof` operation and exits nonzero for
   it. The verdict reads as before, and Proof says the adapter answered no
   proof read, with its error.
5. The adapter answers `{"unavailable": "no summary retained"}` for a pruned
   attempt. Proof shows that reason; the verdict is unchanged.
6. Two discovered attempts from different runs both have `attemptId` `1` at
   `R`, and the tab displays one of them. Proof says the attempt is ambiguous
   at its revision and shows no counts.
7. A GitHub Actions project's tab shows its run's proof from the
   `ci-proof-summary-attempt-<n>` artifact exactly as before.

**Architecture:**

- Responsibilities: the collector gains a second attempt identity; the adapter
  protocol gains one optional, dashboard-only operation; the dashboard's
  adapter judgment carries attempt identity to a proof read that calls the
  adapter. The GitHub Actions path is untouched. The proof read runs the
  adapter as its own process with the shared adapter limits, as `discover`
  does, and asks no `gh`.
- [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  the dashboard observes the project's CI evidence through the project's own
  adapter and keeps nothing; unavailable, mismatched and ambiguous proof are
  distinct from a failed result.
- [ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md): the
  collector, protocol and guidance are already-declared payload, so the edits
  are Proposed until the release this story makes; Terry selected that release
  when queuing the story.
- [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  the guidance addresses the agent working in the adapter's project.
- No Accepted decision conflicts.
- The identity is a cross-project contract: Pygardon's plan copies the
  released collector unchanged and answers the released `proof` request. A
  later change to either shape needs a release and Pygardon's re-plan.

**Refinement notes (2026-11-05):**

- Observed: `ci-proof-contract.mjs` requires positive-integer `attempt` in a
  fragment and `runId`/`runAttempt` in a summary, and Pygardon's job knows its
  attempt only as the UUID `PYGARDON_CI_ATTEMPT`, so the fragment needs the
  adapter identity as well as the summary. `judgeCommandAdapter` strips the
  adapter's `runId`/`attemptId` (`databaseId`/`attempt`) before judging, and
  `IntentCiProof` short-circuits every `ciAdapter` judgment. The adapter
  runner allows 20 s and 64 KiB of stdout per call; a summary row per part is
  tens of bytes. Pygardon's adapter returns `runId === attemptId`, so
  `attemptId` + revision is unambiguous there.
- Challenge: the purpose holds. Identifying by `attemptId` without `runId`
  misses only adapters whose attempt IDs repeat across runs; the ambiguity
  rule shows that as unavailable rather than a wrong proof, so adding `runId`
  is deferred. An adapter without the operation cannot be told apart from a
  failing one, and needs not be: both mean no proof was read.
