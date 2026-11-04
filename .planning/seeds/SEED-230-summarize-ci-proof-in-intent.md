---
id: SEED-230
status: active
planted: 2026-11-04
planted_during: Terry Yin's request to show client CI proof summaries in Intent
trigger_when: A developer opens Intent's CI status tab for a project that publishes proof artifacts
scope: story
---

# SEED-230: Summarize CI proof in Intent

<a id="guard-ci-proof-revision-and-trim-proof-specs"></a>

### Guard the CI proof revision and trim the proof specs

**Identity:** SEED-230#guard-ci-proof-revision-and-trim-proof-specs
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/464-guard-ci-proof-revision-and-trim-proof-specs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"2ecdb0bcf77da0c664e190b0ba44d284bab9d4daaae9b3633d1bf2dacc7ff07f","plan":"256b192fedf4b50bc17fb4541ab27e0b09c580a8ff79f69301f6375537879d25"}}
```

**Goal:** A maintainer changing Open Dough's CI or the CI status tab keeps the
CI proof summary matched to the run Intent
judges, with a regression test for the pull-request revision, proof specs
that each document one behaviour, and one read of the project's CI
configuration per CI status judgment. This is a retrospective correction of
that story; it adds no product promise.

**Scope:** Open Dough's `ci.yml` revision expression and its declaration test;
the Intent CI proof specs and the `intent=ci-proof` query refusals; how the CI
status read learns that a project uses a `ciAdapter`. Visible tab behaviour
and the summary contract stay as they are.

**Plan:** [Guard the CI proof revision and trim the proof specs](../slice-plans/464-guard-ci-proof-revision-and-trim-proof-specs/PLAN.md)
