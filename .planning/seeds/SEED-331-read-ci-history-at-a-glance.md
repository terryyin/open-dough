---
id: SEED-331
status: active
planted: 2026-11-12
scope: story
---

# Read CI history at a glance

<a id="make-ci-glance-wording-and-status-one-rule"></a>

### Make CI glance wording and failed status one rule

**Identity:** SEED-331#make-ci-glance-wording-and-status-one-rule
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/614-make-ci-glance-wording-and-status-one-rule/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a2f3a16744412805e3fb06a7951fc83c6eea5485fa9c6db15b141622cd871c8c","plan":"f6a1b16a88ffa3c6cbaae3154e900594c2925a13320ace511f6fcb8f6054f00d"}}
```

Correction from the execution retrospective of
SEED-331#read-ci-history-at-a-glance. Its plan holds the findings, provenance
and proof.

#### Goal

A developer reading CI history in a Done story and in its test Summaries and
file Proof meets one vocabulary for the same marks and statuses, and a build
the dashboard knows failed always reads as failed, so the glance reads the
same wherever it appears.

#### Scope

Make the Done wall-time and scope history readouts use one selection word,
one prior-average line label, one brief pending wording and a brief missing
identity status. Carry the failed status from where the build state is known
instead of matching reason strings. Correct the CI and scope reference docs'
sentences about the removed date span, evidence and exclusion reasons.
Consolidate the overlapping glance specs the review named. Response
compatibility, top-level CI status history and the follow-up reading stay as
they are.

Plan: [correction plan](../slice-plans/614-make-ci-glance-wording-and-status-one-rule/PLAN.md)
